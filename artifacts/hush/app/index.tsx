import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { Breath, Button, Press, fonts, tap } from '@/components/ui';
import { useHush } from '@/context/HushContext';
import { useColors } from '@/hooks/useColors';

type Mode = 'start' | 'join';

export default function Home() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { engineReady, status, error, clearError, create, join, forceRelay, setForceRelay, relayAvailable } = useHush();
  const [mode, setMode] = useState<Mode>('start');
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [nameFocus, setNameFocus] = useState(false);
  const [keyFocus, setKeyFocus] = useState(false);

  useEffect(() => { if (status === 'joined') router.replace('/room'); }, [status]);

  const busy = status === 'connecting';
  const nameOk = name.trim().length > 0 && name.trim().length <= 24;
  const keyOk = /^hush_[A-Za-z0-9_-]{43}$/.test(key.trim());
  const canGo = nameOk && (mode === 'start' || keyOk) && !busy;

  const go = () => {
    if (!canGo) return;
    tap('medium');
    if (mode === 'start') create(name.trim());
    else join(name.trim(), key.trim());
  };

  const top = Platform.OS === 'web' ? 67 : insets.top;
  const bottom = Platform.OS === 'web' ? 34 : insets.bottom;

  return (
    <View style={[styles.flex, { backgroundColor: c.background }]}>
      <KeyboardAwareScrollViewCompat
        contentContainerStyle={{ paddingTop: top + 16, paddingBottom: bottom + 32, paddingHorizontal: 24, width: '100%', maxWidth: 640, alignSelf: 'center' }}
        bottomOffset={24}>
        <View style={styles.topRow}>
          <View style={styles.brand}>
            <View style={[styles.mark, { backgroundColor: c.primary }]}>
              <View style={[styles.markDot, { backgroundColor: c.accent }]} />
            </View>
            <Text style={[styles.wordmark, { color: c.foreground }]}>hush</Text>
          </View>
          <Press testID="open-privacy" onPress={() => router.push('/privacy')} style={[styles.pill, { borderColor: c.border }]}>
            <Feather name="eye-off" size={14} color={c.primary} />
            <Text style={[styles.pillText, { color: c.primary }]}>What we keep</Text>
          </Press>
        </View>

        <Animated.View entering={FadeInDown.duration(600)}>
          <Text style={[styles.hero, { color: c.foreground }]}>
            Say it here.{'\n'}
            <Text style={[styles.heroSoft, { color: c.primary }]}>Then let it go.</Text>
          </Text>
          <Text style={[styles.lede, { color: c.mutedForeground }]}>
            A small room for up to eight people. No account, no inbox. When you leave, your copy of the conversation is gone.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120).duration(600)} layout={LinearTransition.springify().damping(18)}
          style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
          <View style={[styles.seg, { backgroundColor: c.muted }]}>
            {(['start', 'join'] as Mode[]).map((m) => (
              <Press key={m} testID={`mode-${m}`} onPress={() => { setMode(m); clearError(); }}
                style={[styles.segItem, mode === m && { backgroundColor: c.card }]}>
                <Text style={[styles.segText, { color: mode === m ? c.foreground : c.mutedForeground }]}>
                  {m === 'start' ? 'Start a room' : 'Join with a key'}
                </Text>
              </Press>
            ))}
          </View>

          <Text style={[styles.label, { color: c.mutedForeground }]}>What should they call you?</Text>
          <TextInput
            testID="input-name"
            value={name}
            onChangeText={setName}
            placeholder="Any name, just for this room"
            placeholderTextColor={c.mutedForeground}
            maxLength={24}
            autoCorrect={false}
            autoComplete="off"
            onFocus={() => setNameFocus(true)}
            onBlur={() => setNameFocus(false)}
            returnKeyType={mode === 'start' ? 'go' : 'next'}
            onSubmitEditing={mode === 'start' ? go : undefined}
            style={[styles.input, { color: c.foreground, borderColor: nameFocus ? c.primary : c.input, backgroundColor: c.background }]}
          />

          {mode === 'join' ? (
            <Animated.View entering={FadeInDown.duration(260)}>
              <Text style={[styles.label, { color: c.mutedForeground }]}>Room key</Text>
              <TextInput
                testID="input-key"
                value={key}
                onChangeText={setKey}
                placeholder="Paste the key you were given"
                placeholderTextColor={c.mutedForeground}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="off"
                secureTextEntry={false}
                spellCheck={false}
                onFocus={() => setKeyFocus(true)}
                onBlur={() => setKeyFocus(false)}
                returnKeyType="go"
                onSubmitEditing={go}
                style={[styles.input, styles.mono, { color: c.foreground, borderColor: keyFocus ? c.primary : c.input, backgroundColor: c.background }]}
              />
              {key.trim().length > 0 && !keyOk ? (
                <Text style={[styles.relayBody, { color: c.destructive, marginLeft: 4 }]}>Keys start with hush_ followed by 43 characters.</Text>
              ) : null}
            </Animated.View>
          ) : null}

          <View style={[styles.relayRow, { borderColor: c.border }]}>
            <View style={styles.flex}>
              <Text style={[styles.relayTitle, { color: c.foreground }]}>Hide my IP from peers</Text>
              <Text style={[styles.relayBody, { color: c.mutedForeground }]}>
                Routes everything through a relay. Slower, but peers never see your network address.
                {relayAvailable === false ? ' Relay is not available right now.' : ''}
              </Text>
            </View>
            <Switch
              testID="toggle-relay"
              value={forceRelay}
              onValueChange={(v) => { tap(); setForceRelay(v); }}
              disabled={relayAvailable === false}
              trackColor={{ true: c.primary, false: c.input }}
              thumbColor={c.card}
            />
          </View>

          {error ? (
            <Animated.View entering={FadeInDown.duration(220)} style={[styles.error, { backgroundColor: '#B2452F14', borderColor: c.destructive }]}>
              <Feather name="alert-circle" size={16} color={c.destructive} />
              <Text style={[styles.errorText, { color: c.destructive }]}>{error}</Text>
            </Animated.View>
          ) : null}

          <Button
            testID="submit-room"
            label={busy ? (mode === 'start' ? 'Opening the room' : 'Finding the room') : mode === 'start' ? 'Open a private room' : 'Step inside'}
            onPress={go}
            disabled={!canGo}
            icon={busy ? <Breath color={c.primaryForeground} size={6} /> : <Feather name="arrow-right" size={18} color={c.primaryForeground} />}
          />

          <View style={styles.engineRow}>
            {engineReady ? (
              <><View style={[styles.dot, { backgroundColor: c.live }]} /><Text style={[styles.engineText, { color: c.mutedForeground }]}>Encryption engine ready on this device</Text></>
            ) : (
              <><Breath color={c.accent} size={6} /><Text style={[styles.engineText, { color: c.mutedForeground }]}>Waking the encryption engine. You can start now.</Text></>
            )}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(240).duration(600)} style={styles.promises}>
          {[
            ['cpu', 'Messages live in memory, never in an inbox.'],
            ['key', 'The key is the invitation. Share it only with people you trust.'],
            ['log-out', 'Leave or close the app and your copy is gone.'],
          ].map(([icon, text]) => (
            <View key={text} style={styles.promise}>
              <Feather name={icon as keyof typeof Feather.glyphMap} size={16} color={c.accent} />
              <Text style={[styles.promiseText, { color: c.foreground }]}>{text}</Text>
            </View>
          ))}
          <Press onPress={() => router.push('/privacy')} haptic={false}>
            <Text style={[styles.link, { color: c.primary }]}>Read the honest limits</Text>
          </Press>
        </Animated.View>
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  mark: { width: 30, height: 30, borderRadius: 15, borderBottomRightRadius: 4, alignItems: 'flex-end', justifyContent: 'flex-start', padding: 6 },
  markDot: { width: 7, height: 7, borderRadius: 4 },
  wordmark: { fontFamily: fonts.display, fontSize: 24, letterSpacing: -0.5 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7 },
  pillText: { fontFamily: fonts.medium, fontSize: 13 },
  hero: { fontFamily: fonts.display, fontSize: 46, lineHeight: 50, letterSpacing: -1.2 },
  heroSoft: { fontFamily: fonts.displayItalic },
  lede: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24, marginTop: 16, marginBottom: 28, maxWidth: 360 },
  card: { borderRadius: 28, borderWidth: 1, padding: 18, gap: 4 },
  seg: { flexDirection: 'row', borderRadius: 16, padding: 4, marginBottom: 14 },
  segItem: { flex: 1, paddingVertical: 11, borderRadius: 12, alignItems: 'center' },
  segText: { fontFamily: fonts.semibold, fontSize: 14 },
  label: { fontFamily: fonts.medium, fontSize: 13, marginTop: 10, marginBottom: 8, marginLeft: 4 },
  input: { height: 54, borderRadius: 16, borderWidth: 1.5, paddingHorizontal: 16, fontFamily: fonts.body, fontSize: 16 },
  mono: { fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }), fontSize: 14 },
  relayRow: { flexDirection: 'row', alignItems: 'center', gap: 12, borderTopWidth: 1, marginTop: 18, paddingTop: 16, paddingBottom: 14 },
  relayTitle: { fontFamily: fonts.semibold, fontSize: 15 },
  relayBody: { fontFamily: fonts.body, fontSize: 13, lineHeight: 18, marginTop: 3 },
  error: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', borderWidth: 1, borderRadius: 14, padding: 12, marginBottom: 12 },
  errorText: { flex: 1, fontFamily: fonts.medium, fontSize: 14, lineHeight: 19 },
  engineRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 12, minHeight: 20 },
  dot: { width: 6, height: 6, borderRadius: 3, marginHorizontal: 6 },
  engineText: { fontFamily: fonts.body, fontSize: 12 },
  promises: { marginTop: 32, gap: 14, paddingHorizontal: 6 },
  promise: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  promiseText: { flex: 1, fontFamily: fonts.body, fontSize: 15, lineHeight: 21 },
  link: { fontFamily: fonts.semibold, fontSize: 14, textDecorationLine: 'underline', marginTop: 4 },
});
