import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { cancelAnimation, Easing, ReduceMotion, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

export default function BeanCraftLoader({ colors }) {
  const lift = useSharedValue(0);
  useEffect(() => {
    lift.value = withRepeat(withTiming(-8, { duration:1100, easing:Easing.inOut(Easing.quad), reduceMotion:ReduceMotion.System }), -1, true, undefined, ReduceMotion.System);
    return () => cancelAnimation(lift);
  }, [lift]);
  const movement = useAnimatedStyle(() => ({ transform:[{ translateY:lift.value }, { rotate:`${lift.value / 5}deg` }] }));
  return <View accessible accessibilityLabel="Cargando BeanCraft" accessibilityRole="progressbar" style={styles.content}>
    <Animated.Image source={require('../assets/mascotas/taza.png')} style={[styles.mascot, movement]} accessible={false} />
    <Text style={[styles.title, { color:colors.ink }]}>Un sorbito de paciencia…</Text>
    <Text style={[styles.caption, { color:colors.green }]}>Estamos preparando BeanCraft.</Text>
  </View>;
}

const styles = StyleSheet.create({
  content:{ alignItems:'center', gap:12 },
  mascot:{ width:116, height:116, resizeMode:'contain' },
  title:{ fontSize:18, fontWeight:'700', textAlign:'center' },
  caption:{ fontSize:14, textAlign:'center' }
});
