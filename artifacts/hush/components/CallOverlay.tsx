import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeOut, useAnimatedStyle, useSharedValue, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHush } from '@/context/HushContext';
import { useColors } from '@/hooks/useColors';
import { Initials, Press, fonts, tap } from '@/components/ui';

function Ring({ delay, color }: { delay: number; color: string }) {
  const v = useSharedValue(0);
  useEffect(() => {
    const t = setTimeout(() => { v.value = withRepeat(withTiming(1, { duration: 2400, easing: Easing.out(Easing.quad) }), -1, false); }, delay);
    return () => clearTimeout(t);
  }, [v, delay]);
  const a = useAnimatedStyle(() => ({ opacity: 0.45 * (1 - v.value), transform: [{ scale: 1 + v.value * 1.3 }] }));
  return <Animated.View style={[styles.ring, { borderColor: color }, a]} />;
}

function Ctrl({ icon, label, onPress, active, danger, testID }: { icon: keyof typeof Feather.glyphMap; label: string; onPress: () => void; active?: boolean; danger?: boolean; testID?: string }) {
  const c = useColors();
  const bg = danger ? c.destructive : active ? c.nightForeground : 'rgba(237,230,214,0.14)';
  const fg = danger ? c.destructiveForeground : active ? c.night : c.nightForeground;
  return (
    <View style={{ alignItems: 'center', gap: 8 }}>
      <Press testID={testID} onPress={onPress} style={[styles.ctrl, { backgroundColor: bg }]} accessibilityLabel={label}>
        <Feather name={icon} size={24} color={fg} />
      </Press>
      <Text style={[styles.ctrlLabel, { color: c.nightMuted }]}>{label}</Text>
    </View>
  );
}

export default function CallOverlay() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { call, accept, decline, endCall, muted, cameraOn, toggleMute, toggleCamera, peers, me } = useHush();
  const [secs, setSecs] = useState(0);
  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const botPad = Platform.OS === 'web' ? 34 : insets.bottom;

  useEffect(() => {
    if (call?.state !== 'active') { setSecs(0); return; }
    const i = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(i);
  }, [call?.state]);

  useEffect(() => { if (call?.state === 'incoming') tap('medium'); }, [call?.state]);

  if (!call) return null;
  const others = peers.filter((p) => p.id !== me?.peerId);
  const who = call.username ?? (others.length === 1 ? others[0].username : 'the room');
  const videoLive = call.video && (call.state === 'active' || call.state === 'calling');
  const clock = `${Math.floor(secs / 60)}:${(secs % 60).toString().padStart(2, '0')}`;

  return (
    <Animated.View entering={FadeIn.duration(260)} exiting={FadeOut.duration(220)}
      style={[StyleSheet.absoluteFill, { backgroundColor: videoLive ? 'transparent' : c.night }]}
      pointerEvents="box-none">
      {videoLive ? (
        <>
          <LinearGradient colors={['rgba(15,30,25,0.85)', 'transparent']} style={[styles.fadeTop, { height: topPad + 120 }]} pointerEvents="none" />
          <LinearGradient colors={['transparent', 'rgba(15,30,25,0.9)']} style={[styles.fadeBot, { height: botPad + 200 }]} pointerEvents="none" />
        </>
      ) : null}

      <View style={{ paddingTop: topPad + 20, paddingHorizontal: 28 }} pointerEvents="none">
        <Text style={[styles.eyebrow, { color: c.nightMuted }]}>
          {call.state === 'incoming' ? (call.video ? 'Video call' : 'Voice call')
            : call.state === 'calling' ? 'Ringing the room'
            : call.state === 'ended' ? 'Call ended' : clock}
        </Text>
        <Text style={[styles.who, { color: c.nightForeground }]} numberOfLines={2}>
          {call.state === 'incoming' ? `${who} is calling` : who}
        </Text>
      </View>

      {!videoLive ? (
        <View style={styles.center} pointerEvents="none">
          <View style={styles.avatarWrap}>
            {call.state !== 'ended' ? <><Ring delay={0} color={c.live} /><Ring delay={1200} color={c.live} /></> : null}
            <Initials name={who} size={120} bg={c.nightCard} fg={c.nightForeground} />
          </View>
          {call.state === 'active' && !call.video ? (
            <Text style={[styles.note, { color: c.nightMuted }]}>Voice only. Nothing is recorded.</Text>
          ) : null}
        </View>
      ) : <View style={{ flex: 1 }} pointerEvents="none" />}

      <View style={[styles.bar, { paddingBottom: botPad + 28 }]}>
        {call.state === 'incoming' ? (
          <>
            <Ctrl testID="call-decline" icon="phone-off" label="Decline" danger onPress={decline} />
            <Ctrl testID="call-accept" icon={call.video ? 'video' : 'phone'} label="Accept" active onPress={accept} />
          </>
        ) : call.state === 'ended' ? null : (
          <>
            <Ctrl testID="call-mute" icon={muted ? 'mic-off' : 'mic'} label={muted ? 'Muted' : 'Mic'} active={muted} onPress={toggleMute} />
            {call.video ? <Ctrl testID="call-camera" icon={cameraOn ? 'video' : 'video-off'} label={cameraOn ? 'Camera' : 'Camera off'} active={!cameraOn} onPress={toggleCamera} /> : null}
            <Ctrl testID="call-end" icon="phone-off" label="End" danger onPress={endCall} />
          </>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fadeTop: { position: 'absolute', top: 0, left: 0, right: 0 },
  fadeBot: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  eyebrow: { fontFamily: fonts.medium, fontSize: 13, letterSpacing: 1.6, textTransform: 'uppercase' },
  who: { fontFamily: fonts.display, fontSize: 36, marginTop: 8, lineHeight: 42 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 28 },
  avatarWrap: { width: 120, height: 120, alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', width: 120, height: 120, borderRadius: 60, borderWidth: 2 },
  note: { fontFamily: fonts.body, fontSize: 14 },
  bar: { flexDirection: 'row', justifyContent: 'center', gap: 36, paddingTop: 16 },
  ctrl: { width: 68, height: 68, borderRadius: 34, alignItems: 'center', justifyContent: 'center' },
  ctrlLabel: { fontFamily: fonts.medium, fontSize: 12 },
});
