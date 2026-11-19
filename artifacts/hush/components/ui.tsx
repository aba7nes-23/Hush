import React, { useEffect } from 'react';
import { Platform, Pressable, PressableProps, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  Easing, useAnimatedStyle, useSharedValue, withRepeat, withSpring, withTiming,
} from 'react-native-reanimated';
import { useColors } from '@/hooks/useColors';

export const fonts = {
  display: 'Fraunces_600SemiBold',
  displayItalic: 'Fraunces_400Regular_Italic',
  body: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
};

export const tap = (style: 'light' | 'medium' = 'light') => {
  if (Platform.OS === 'web') return;
  void Haptics.impactAsync(style === 'light' ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Medium);
};

const APressable = Animated.createAnimatedComponent(Pressable);

/** Pressable that sinks softly under the thumb. */
export function Press({ style, onPressIn, onPressOut, onPress, haptic = true, ...rest }: PressableProps & { style?: StyleProp<ViewStyle>; haptic?: boolean }) {
  const s = useSharedValue(1);
  const a = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return (
    <APressable
      {...rest}
      onPressIn={(e) => { s.value = withSpring(0.96, { damping: 18, stiffness: 400 }); onPressIn?.(e); }}
      onPressOut={(e) => { s.value = withSpring(1, { damping: 14, stiffness: 300 }); onPressOut?.(e); }}
      onPress={(e) => { if (haptic) tap(); onPress?.(e); }}
      style={[style, a, rest.disabled ? { opacity: 0.45 } : null]}
    />
  );
}

export function Button({ label, onPress, variant = 'primary', disabled, testID, icon }: {
  label: string; onPress: () => void; variant?: 'primary' | 'ghost' | 'ember'; disabled?: boolean; testID?: string; icon?: React.ReactNode;
}) {
  const c = useColors();
  const bg = variant === 'primary' ? c.primary : variant === 'ember' ? c.accent : 'transparent';
  const fg = variant === 'primary' ? c.primaryForeground : variant === 'ember' ? c.accentForeground : c.primary;
  return (
    <Press testID={testID} onPress={onPress} disabled={disabled}
      style={[styles.btn, { backgroundColor: bg, borderColor: variant === 'ghost' ? c.border : bg }]}>
      {icon}
      <Text style={[styles.btnText, { color: fg }]}>{label}</Text>
    </Press>
  );
}

/** A slow breathing dot — the app's heartbeat for "waiting". */
export function Breath({ color, size = 8 }: { color: string; size?: number }) {
  const v = useSharedValue(0);
  useEffect(() => {
    v.value = withRepeat(withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.quad) }), -1, true);
  }, [v]);
  const halo = useAnimatedStyle(() => ({ opacity: 0.5 - v.value * 0.5, transform: [{ scale: 1 + v.value * 1.6 }] }));
  return (
    <View style={{ width: size * 3, height: size * 3, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={[{ position: 'absolute', width: size, height: size, borderRadius: size, backgroundColor: color }, halo]} />
      <View style={{ width: size, height: size, borderRadius: size, backgroundColor: color }} />
    </View>
  );
}

export function Initials({ name, size = 40, bg, fg, ring }: { name: string; size?: number; bg: string; fg: string; ring?: string }) {
  const letters = name.trim().split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase() || '?';
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: bg, alignItems: 'center', justifyContent: 'center', borderWidth: ring ? 2 : 0, borderColor: ring }}>
      <Text style={{ color: fg, fontFamily: fonts.display, fontSize: size * 0.38 }}>{letters}</Text>
    </View>
  );
}

export function Skeleton({ width, height = 12 }: { width: number | `${number}%`; height?: number }) {
  const c = useColors();
  const v = useSharedValue(0.4);
  useEffect(() => { v.value = withRepeat(withTiming(1, { duration: 900 }), -1, true); }, [v]);
  const a = useAnimatedStyle(() => ({ opacity: v.value }));
  return <Animated.View style={[{ width, height, borderRadius: 6, backgroundColor: c.muted }, a]} />;
}

export const formatSize = (b: number) =>
  b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(1)} MB`;

export const formatTime = (t: number) => {
  const d = new Date(t);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
};

const styles = StyleSheet.create({
  btn: { height: 56, borderRadius: 28, borderWidth: 1.5, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 24 },
  btnText: { fontFamily: fonts.semibold, fontSize: 16, letterSpacing: 0.2 },
});
