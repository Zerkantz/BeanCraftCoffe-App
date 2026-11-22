import { Platform } from 'react-native';
import { buildPhoneNotificationContent } from './notificationTheme';
import { getPermissionsAsync, requestPermissionsAsync } from 'expo-notifications/build/NotificationPermissions';
import { setNotificationHandler } from 'expo-notifications/build/NotificationsHandler';
import { setNotificationChannelAsync } from 'expo-notifications/build/setNotificationChannelAsync';
import { AndroidImportance } from 'expo-notifications/build/NotificationChannelManager.types';
import { scheduleNotificationAsync } from 'expo-notifications/build/scheduleNotificationAsync';
import { getPresentedNotificationsAsync } from 'expo-notifications/build/getPresentedNotificationsAsync';
import { dismissNotificationAsync } from 'expo-notifications/build/dismissNotificationAsync';
import { addNotificationResponseReceivedListener, getLastNotificationResponse, clearLastNotificationResponse } from 'expo-notifications/build/NotificationsEmitter';

const CHANNEL = 'beancraft-avisos';
let permissionTask;
let channelTask;
let askedAutomatically = false;

function notificationFailure(error, stage) {
  const wrapped = new Error(error?.message || String(error));
  wrapped.notificationStage = error?.notificationStage || stage;
  wrapped.code = error?.code || 'NOTIFICATION_ERROR';
  return wrapped;
}

export function notificationErrorDetails(error, stage = 'unknown') {
  const result = {
    status: 'error',
    stage: error?.notificationStage || stage,
    code: String(error?.code || 'NOTIFICATION_ERROR').slice(0,100),
    message: String(error?.message || error).slice(0,800),
    platform: Platform.OS
  };
  console.warn('[BeanCraft Notificaciones]', JSON.stringify(result));
  return result;
}

// Se cargan únicamente las APIs locales, sin registrar tokens de push remoto.
setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false
  })
});

async function prepareChannel() {
  if (Platform.OS !== 'android') return;
  channelTask ||= setNotificationChannelAsync(CHANNEL, {
    name: 'BeanCraft · Tu café y tus pedidos',
    description: 'Pedidos, antojos y novedades de BeanCraft Coffee.',
    importance: AndroidImportance.HIGH,
    vibrationPattern: [0, 120, 60, 120],
    lightColor: '#0B5C63',
    sound: 'default'
  }).catch(error => { channelTask = null; throw error; });
  await channelTask;
}

export async function notificationPermission(request = false) {
  let permission;
  try { permission = await getPermissionsAsync(); }
  catch (error) { throw notificationFailure(error, 'permission-read'); }
  if (permissionTask) permission = await permissionTask;
  else if (request && !permission.granted && permission.canAskAgain) {
    // Android necesita un canal antes de mostrar su solicitud de permiso.
    // Un canal personalizado no debe impedir leer un permiso ya concedido.
    try { await prepareChannel(); } catch { /* Se probará el canal predeterminado al enviar. */ }
    permissionTask ||= requestPermissionsAsync(Platform.OS === 'android' ? { android: {} } : { ios: { allowAlert: true, allowBadge: true, allowSound: true } })
      .catch(error => { throw notificationFailure(error, 'permission-request'); })
      .finally(() => { permissionTask = null; });
    permission = await permissionTask;
  }
  const allowed = permission.granted || permission.ios?.status === 3;
  return { status: allowed ? 'granted' : permission.status, canAskAgain: permission.canAskAgain };
}

export async function presentLocalNotification(notice) {
  const request = !askedAutomatically;
  askedAutomatically = true;
  const permission = await notificationPermission(request);
  if (permission.status !== 'granted') return permission;
  let channelMode = 'custom';
  let channelWarning = null;
  try { await prepareChannel(); }
  catch (error) {
    channelMode = 'default';
    channelWarning = String(error?.message || error).slice(0,400);
  }
  const notification = {
    identifier: notice.id,
    content: buildPhoneNotificationContent(notice),
    trigger: Platform.OS === 'android' && channelMode === 'custom' ? { channelId: CHANNEL } : null
  };
  try { await scheduleNotificationAsync(notification); }
  catch (error) {
    if (Platform.OS !== 'android' || channelMode === 'default') throw notificationFailure(error, 'schedule');
    // Expo Go también puede usar el canal de avisos inmediatos del sistema.
    channelMode = 'default';
    channelWarning = String(error?.message || error).slice(0,400);
    try { await scheduleNotificationAsync({ ...notification, trigger: null }); }
    catch (fallbackError) { throw notificationFailure(fallbackError, 'schedule'); }
  }
  return { ...permission, delivery: 'scheduled', channelMode, channelWarning };
}

export async function clearPhoneNotices() {
  const notices = await getPresentedNotificationsAsync();
  await Promise.all(notices.filter(n=>n.request.content.data?.beancraft).map(n=>dismissNotificationAsync(n.request.identifier)));
}
export function listenForNotificationPress(onPress) {
  const listener = addNotificationResponseReceivedListener(response => {
    const data = response.notification.request.content.data;
    if (data?.beancraft) onPress(data.view);
  });
  const last = getLastNotificationResponse();
  if (last?.notification.request.content.data?.beancraft) {
    onPress(last.notification.request.content.data.view);
    clearLastNotificationResponse();
  }
  return () => listener.remove();
}
