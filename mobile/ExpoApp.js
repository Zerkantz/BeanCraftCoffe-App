import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Alert, BackHandler, Linking, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Location from 'expo-location';
import { WebView } from 'react-native-webview';
import html from './generated/web-content';
import { notificationPayload } from '../lib/notification-payload';
import BeanCraftLoader from './BeanCraftLoader';
import { presentLocalNotification, clearPhoneNotices, listenForNotificationPress, notificationErrorDetails } from './localNotifications';

const BASE_URL = 'https://beancraft.local/';
// Extract shell colors from the generated design tokens; no second palette to maintain.
const color = (name) => html.match(new RegExp(`--c-${name}:\\s*(#[0-9A-Fa-f]{6})`))[1];
const colors = { background: color('espuma'), ink: color('tostado'), green: color('verde') };
const source = { html, baseUrl: BASE_URL };

function CoffeeApp() {
  const web = useRef(null);
  const noticeCount = useRef(0);
  const pendingView = useRef(null);
  const interfaceReady = useRef(false);
  const canGoBack = useRef(false);
  const reduceMotion = useRef(false);
  const requestingLocation = useRef(false);
  const [error, setError] = useState(null);
  const [ready, setReady] = useState(false);
  const [revision, setRevision] = useState(0);
  const [scanning, setScanning] = useState(false);
  const scanLocked = useRef(false);
  const [, requestCameraPermission] = useCameraPermissions();

  const inject = useCallback((code) => web.current?.injectJavaScript(`${code}; true;`), []);

  useEffect(() => {
    const remove=listenForNotificationPress(view=>{
      if(!['home','menu','cart','orders','profile'].includes(view))return;
      if(interfaceReady.current)inject(`window.BeanCraftNative?.openView(${JSON.stringify(view)})`);
      else pendingView.current=view;
    });
    return remove;
  },[inject]);

  useEffect(() => {
    const back = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!canGoBack.current || error) return false;
      inject('window.BeanCraftNative?.back()');
      return true;
    });
    const updateMotion = (enabled) => {
      reduceMotion.current = enabled;
      inject(`window.BeanCraftNative?.reducedMotion(${enabled})`);
    };
    AccessibilityInfo.isReduceMotionEnabled().then(updateMotion);
    const motion = AccessibilityInfo.addEventListener('reduceMotionChanged', updateMotion);
    return () => { back.remove(); motion.remove(); };
  }, [error, inject]);

  const onMessage = useCallback(async ({ nativeEvent }) => {
    let message;
    try { message = JSON.parse(nativeEvent.data); } catch { return; }
    if (!message || typeof message !== 'object') return;
    if(message.type==='notify') {
      const notice=notificationPayload(message,'beancraft-'+Date.now()+'-'+(++noticeCount.current));
      if(!notice)return;
      presentLocalNotification(notice).catch(error=>notificationErrorDetails(error,'schedule'));
    } else if(message.type==='clearPhoneNotices') {
      clearPhoneNotices().catch(()=>{});
    } else if (message.type === 'navigation') {
      canGoBack.current = message.canGoBack === true;
    } else if (message.type === 'ready') {
      setReady(true);interfaceReady.current=true;
      if(pendingView.current){inject(`window.BeanCraftNative?.openView(${JSON.stringify(pendingView.current)})`);pendingView.current=null;}
      inject(`window.BeanCraftNative?.reducedMotion(${reduceMotion.current})`);
    } else if (message.type === 'error') {
      setError('La interfaz no pudo cargarse. Vuelve a intentarlo.');
    } else if (message.type === 'scanQr') {
      if (scanLocked.current) return;
      scanLocked.current = true;
      try {
        const permission = await requestCameraPermission();
        if (permission.granted) { setScanning(true); scanLocked.current = false; }
        else {
          inject(`window.BeanCraftNative?.qrResult(${JSON.stringify({ error: 'Permiso de cámara denegado. Puedes escribir el código manualmente en el carrito.' })})`);
          scanLocked.current = false;
        }
      } catch {
        scanLocked.current = false;
        inject(`window.BeanCraftNative?.qrResult({error:'No se pudo abrir la cámara. Escribe el código manualmente.'})`);
      }
    } else if (message.type === 'location' && Number.isSafeInteger(message.id)) {
      const reply = (result) => inject(`window.BeanCraftNative?.locationResult(${JSON.stringify({ id: message.id, ...result })})`);
      if (requestingLocation.current) {
        reply({ error: { code: 2, message: 'Ya hay una solicitud de ubicación en curso.' } });
        return;
      }
      requestingLocation.current = true;
      try {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (permission.status !== 'granted') {
          reply({ error: { code: 1, message: 'Permiso de ubicación denegado.' } });
          return;
        }
        const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        reply({ position: { coords: position.coords, timestamp: position.timestamp } });
      } catch {
        reply({ error: { code: 2, message: 'No se pudo obtener tu ubicación.' } });
      } finally { requestingLocation.current = false; }
    }
  }, [inject, requestCameraPermission]);

  const handleNavigation = ({ url }) => {
    if (url === 'about:blank' || url === BASE_URL || url.startsWith(`${BASE_URL}#`)) return true;
    if (/^(https?:|mailto:|tel:)/i.test(url)) {
      Linking.openURL(url).catch(() => Alert.alert('BeanCraft', 'No se pudo abrir el enlace.'));
    }
    return false;
  };

  const retry = () => { interfaceReady.current=false; canGoBack.current = false; setError(null); setReady(false); setRevision((value) => value + 1); };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        <Modal visible={scanning} animationType="slide" onRequestClose={() => setScanning(false)}>
          <SafeAreaView style={styles.safe}>
            <Text style={styles.cameraTitle}>Escanear cupón QR</Text>
            {scanning && <CameraView style={styles.content} facing="back" barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              onMountError={() => { setScanning(false); inject(`window.BeanCraftNative?.qrResult({error:'La cámara no está disponible. Escribe el código manualmente.'})`); }}
              onBarcodeScanned={({ data }) => {
                if (scanLocked.current) return;
                scanLocked.current = true;
                setScanning(false);
                inject(`window.BeanCraftNative?.qrResult(${JSON.stringify({ code: data })})`);
                setTimeout(() => { scanLocked.current = false; }, 800);
              }} />}
            <Pressable accessibilityRole="button" style={styles.button} onPress={() => setScanning(false)}><Text style={styles.buttonText}>Volver a captura manual</Text></Pressable>
          </SafeAreaView>
        </Modal>
        <WebView
          key={revision}
          ref={web}
          style={styles.web}
          source={source}
          originWhitelist={['*']}
          onMessage={onMessage}
          onShouldStartLoadWithRequest={handleNavigation}
          onError={() => setError('No se pudo cargar BeanCraft.')}
          onContentProcessDidTerminate={retry}
          onRenderProcessGone={() => setError('La interfaz se cerró. Vuelve a cargar BeanCraft.')}
          javaScriptEnabled
          domStorageEnabled
          mixedContentMode="never"
          allowFileAccess={false}
          javaScriptCanOpenWindowsAutomatically={false}
          setSupportMultipleWindows={false}
          contentInsetAdjustmentBehavior="never"
          automaticallyAdjustContentInsets={false}
          automaticallyAdjustsScrollIndicatorInsets={false}
          bounces={false}
          overScrollMode="never"
          textZoom={100}
          allowsBackForwardNavigationGestures={Platform.OS === 'ios'}
          webviewDebuggingEnabled={__DEV__}
        />
        {!ready && !error && <View style={styles.overlay}><BeanCraftLoader colors={colors} /></View>}
        {error && <View style={styles.overlay}>
          <Text style={styles.error}>{error}</Text>
          <Pressable accessibilityRole="button" onPress={retry} style={styles.button}><Text style={styles.buttonText}>Volver a cargar</Text></Pressable>
        </View>}
      </View>
    </SafeAreaView>
  );
}

export default function ExpoApp() {
  return <SafeAreaProvider><CoffeeApp /></SafeAreaProvider>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1 },
  web: { flex: 1, backgroundColor: colors.background },
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background, padding: 24, gap: 20 },
  error: { color: colors.ink, fontSize: 16, textAlign: 'center' },
  button: { backgroundColor: colors.ink, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 999 },
  buttonText: { color: colors.background, fontSize: 16, fontWeight: '600' },
  cameraTitle: { color: colors.ink, fontSize: 22, fontWeight: '700', padding: 20 }
});
