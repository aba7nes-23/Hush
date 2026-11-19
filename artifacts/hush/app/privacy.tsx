import React from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Press, fonts } from '@/components/ui';
import { useColors } from '@/hooks/useColors';

const SECTIONS: { title: string; body: string; tone: 'keep' | 'limit' }[] = [
  { tone: 'keep', title: 'Messages live in memory', body: 'Messages and received files stay in working memory, not a saved inbox. Selecting a file can create a temporary device cache copy, which Hush attempts to delete after reading. Explicitly saving or sharing a file creates a copy outside this promise.' },
  { tone: 'keep', title: 'Leaving clears local history', body: 'Leaving or restarting clears the conversation from Hush. This is not a guarantee of forensic erasure from device memory, system snapshots, clipboard, or any copies you or recipients saved.' },
  { tone: 'keep', title: 'No account, no profile', body: 'The name you type is used only inside the room. It is not saved, and it is not tied to you anywhere else.' },
  { tone: 'limit', title: 'Other people can keep things', body: 'Anyone in the room can copy text, save a file you sent, photograph their screen, or take a screenshot. Hush cannot prevent screenshots on any device.' },
  { tone: 'limit', title: 'The key is trust', body: 'Anyone with the room key can join. Share it directly with people you mean to talk to, and leave the room if it reaches someone you did not expect.' },
  { tone: 'limit', title: 'What the server sees', body: 'Our server helps peers find each other. While a room is open it briefly sees that the room exists, how many devices are in it, and their network addresses. It does not see message content.' },
  { tone: 'limit', title: 'Peers can see your IP', body: 'Calls and messages travel directly between devices, which reveals your IP address to the other people in the room. Turn on "Hide my IP from peers" before joining to route through a relay instead.' },
  { tone: 'limit', title: 'Saving leaves Hush', body: 'If you choose to save a file, that copy lands on your device or in whatever app you send it to. It is no longer covered by Hush leaving nothing behind.' },
  { tone: 'limit', title: 'Calls are a compatibility boundary', body: 'Voice and video run inside an embedded web view. Some devices or Expo Go builds may block camera or microphone access there; if so, Hush will tell you rather than pretend the call is working.' },
];

export default function Privacy() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const top = Platform.OS === 'web' ? 67 : Platform.OS === 'ios' ? 20 : insets.top + 12;
  const bottom = Platform.OS === 'web' ? 34 : insets.bottom;
  return (
    <View style={[styles.flex, { backgroundColor: c.background }]}>
      <ScrollView contentContainerStyle={{ paddingTop: top, paddingBottom: bottom + 40, paddingHorizontal: 24 }}>
        <View style={styles.head}>
          <Text style={[styles.eyebrow, { color: c.accent }]}>The honest version</Text>
          <Press testID="close-privacy" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
            style={[styles.close, { backgroundColor: c.muted }]} accessibilityLabel="Close">
            <Feather name="x" size={18} color={c.foreground} />
          </Press>
        </View>
        <Text style={[styles.title, { color: c.foreground }]}>What Hush keeps,{'\n'}<Text style={{ fontFamily: fonts.displayItalic, color: c.primary }}>and what it can't promise.</Text></Text>

        {SECTIONS.map((s, i) => (
          <View key={s.title} style={[styles.row, { borderColor: c.border }]}>
            <Text style={[styles.num, { color: s.tone === 'keep' ? c.primary : c.accent }]}>{String(i + 1).padStart(2, '0')}</Text>
            <View style={styles.flex}>
              <Text style={[styles.rowTitle, { color: c.foreground }]}>{s.title}</Text>
              <Text style={[styles.rowBody, { color: c.mutedForeground }]}>{s.body}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  eyebrow: { fontFamily: fonts.semibold, fontSize: 12, letterSpacing: 1.6, textTransform: 'uppercase' },
  close: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: fonts.display, fontSize: 34, lineHeight: 40, letterSpacing: -0.8, marginBottom: 18 },
  row: { flexDirection: 'row', gap: 16, paddingVertical: 18, borderTopWidth: 1 },
  num: { fontFamily: fonts.display, fontSize: 22, width: 32 },
  rowTitle: { fontFamily: fonts.semibold, fontSize: 16, marginBottom: 5 },
  rowBody: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22 },
});
