import React, { useEffect, useState } from 'react';
import { Keyboard, Platform, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { Breath, Button, Press, fonts, tap } from '@/components/ui';
import { useHush } from '@/context/HushContext';
import { useColors } from '@/hooks/useColors';

type Flow = 'start' | 'join' | null;
type Line = { id: string; label: string; text: string; tone: 'normal' | 'good' | 'warn' };

const initialLines: Line[] = [
  { id: 'welcome', label: 'system', text: 'Private session console. Type help to see commands.', tone: 'normal' },
];

export default function Home() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { engineReady, status, error, clearError, create, join, forceRelay, setForceRelay, relayAvailable } = useHush();
  const [flow, setFlow] = useState<Flow>(null);
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [command, setCommand] = useState('');
  const [lines, setLines] = useState<Line[]>(initialLines);
  const [nameFocus, setNameFocus] = useState(false);
  const [keyFocus, setKeyFocus] = useState(false);

  useEffect(() => { if (status === 'joined') router.replace('/room'); }, [status]);

  const busy = status === 'connecting';
  const nameOk = name.trim().length > 0 && name.trim().length <= 24;
  const keyOk = /^hush_[A-Za-z0-9_-]{43}$/.test(key.trim());
  const canGo = nameOk && (flow !== 'join' || keyOk) && !busy && flow !== null;

  const addLine = (label: string, text: string, tone: Line['tone'] = 'normal') => {
    setLines((current) => [
      ...current,
      { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, label, text, tone },
    ].slice(-7));
  };

  const runCommand = (raw = command) => {
    const value = raw.trim().toLowerCase();
    setCommand('');
    if (!value) return;

    switch (value) {
      case 'help':
      case '?':
        addLine('help', 'Commands: new · join · privacy · relay on/off · clear · cancel', 'good');
        break;
      case 'new':
      case 'create':
      case 'start':
        Keyboard.dismiss();
        setFlow('start');
        clearError();
        addLine(value, 'New room selected. Enter a temporary name, then run the room command.', 'good');
        break;
      case 'join':
        Keyboard.dismiss();
        setFlow('join');
        clearError();
        addLine('join', 'Join selected. Enter your name and the private key below.', 'good');
        break;
      case 'privacy':
        addLine('privacy', 'Opening the privacy notes.');
        router.push('/privacy');
        break;
      case 'relay on':
        setForceRelay(true);
        addLine('relay on', relayAvailable === false ? 'Relay is unavailable right now.' : 'Relay-only mode enabled for the next room.', relayAvailable === false ? 'warn' : 'good');
        break;
      case 'relay off':
        setForceRelay(false);
        addLine('relay off', 'Direct peer connections allowed for the next room.', 'good');
        break;
      case 'clear':
        setLines([{ id: `${Date.now()}-clear`, label: 'system', text: 'Console cleared. Type help for commands.', tone: 'normal' }]);
        break;
      case 'cancel':
      case 'exit':
        setFlow(null);
        setName('');
        setKey('');
        clearError();
        addLine(value, 'Back at the room console.', 'good');
        break;
      case 'status':
        addLine('status', `Engine ${engineReady ? 'ready' : 'starting'} · ${relayAvailable === null ? 'relay status unknown' : relayAvailable ? 'relay available' : 'relay unavailable'}`);
        break;
      default:
        addLine('system', 'Command not found. Type help to see the available options.', 'warn');
    }
  };

  const go = () => {
    if (!canGo || !flow) return;
    tap('medium');
    addLine(flow === 'start' ? 'new' : 'join', flow === 'start' ? 'Opening a private room…' : 'Connecting to the room…', 'good');
    if (flow === 'start') create(name.trim());
    else join(name.trim(), key.trim());
  };

  const top = Platform.OS === 'web' ? 67 : insets.top;
  const bottom = Platform.OS === 'web' ? 34 : insets.bottom;
  const commandOptions = [
    { command: 'new', title: 'New room', detail: 'Create a private room' },
    { command: 'join', title: 'Join room', detail: 'Enter a room key' },
    { command: 'privacy', title: 'Privacy notes', detail: 'Read what Hush can and cannot do' },
  ];

  return (
    <View style={[styles.flex, { backgroundColor: c.background }]}>
      <KeyboardAwareScrollViewCompat
        contentContainerStyle={{ paddingTop: top + 12, paddingBottom: bottom + 28, paddingHorizontal: 18, width: '100%', maxWidth: 680, alignSelf: 'center' }}
        bottomOffset={24}
      >
        <View style={styles.topRow}>
          <View style={styles.brand}>
            <View style={[styles.mark, { borderColor: c.primary }]}>
              <View style={[styles.markDot, { backgroundColor: c.accent }]} />
            </View>
            <Text style={[styles.wordmark, { color: c.foreground }]}>hush<Text style={{ color: c.mutedForeground }}>://</Text></Text>
          </View>
          <Press testID="open-privacy" onPress={() => router.push('/privacy')} style={[styles.privacyLink, { borderColor: c.border }]}>
            <Feather name="shield" size={14} color={c.primary} />
            <Text style={[styles.privacyText, { color: c.primary }]}>privacy</Text>
          </Press>
        </View>

        <Animated.View entering={FadeInDown.duration(420)}>
          <Text style={[styles.eyebrow, { color: c.accent }]}>NO ACCOUNTS · NO INBOX</Text>
          <Text style={[styles.hero, { color: c.foreground }]}>Private rooms,{'\n'}on your terms.</Text>
          <Text style={[styles.lede, { color: c.mutedForeground }]}>
            Start a temporary conversation. Messages stay in memory and disappear from your copy when you leave.
          </Text>
        </Animated.View>

        <View style={[styles.terminal, { backgroundColor: c.card, borderColor: c.border }]}>
          <View style={[styles.terminalHead, { borderColor: c.border }]}>
            <View style={styles.lights}>
              <View style={[styles.light, { backgroundColor: c.destructive }]} />
              <View style={[styles.light, { backgroundColor: c.accent }]} />
              <View style={[styles.light, { backgroundColor: c.live }]} />
            </View>
            <Text style={[styles.terminalTitle, { color: c.mutedForeground }]}>hush / local console</Text>
            <View style={[styles.readyTag, { borderColor: c.border }]}>
              <View style={[styles.dot, { backgroundColor: engineReady ? c.live : c.accent }]} />
              <Text style={[styles.readyText, { color: c.mutedForeground }]}>{engineReady ? 'ready' : 'starting'}</Text>
            </View>
          </View>

          <View style={styles.log}>
            {lines.map((line) => (
              <View key={line.id} style={styles.logLine}>
                <Text style={[styles.promptLabel, { color: line.tone === 'warn' ? c.destructive : line.tone === 'good' ? c.live : c.accent }]}>
                  {line.label === 'system' ? '>' : '$'} {line.label}
                </Text>
                <Text style={[styles.logText, { color: line.tone === 'warn' ? c.destructive : c.foreground }]}>{line.text}</Text>
              </View>
            ))}
          </View>

          <View style={[styles.commandBar, { borderColor: c.border, backgroundColor: c.background }]}>
            <Text style={[styles.commandPrefix, { color: c.live }]}>hush $</Text>
            <TextInput
              testID="terminal-command"
              value={command}
              onChangeText={setCommand}
              placeholder="type a command"
              placeholderTextColor={c.mutedForeground}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="off"
              spellCheck={false}
              maxLength={80}
              returnKeyType="go"
              onSubmitEditing={() => runCommand()}
              style={[styles.commandInput, { color: c.foreground }]}
              accessibilityLabel="Hush command"
            />
            <Press testID="run-command" onPress={() => runCommand()} style={[styles.runButton, { backgroundColor: c.primary }]} accessibilityLabel="Run command">
              <Feather name="arrow-up-right" size={17} color={c.primaryForeground} />
            </Press>
          </View>
          <Text style={[styles.commandHint, { color: c.mutedForeground }]}>Commands run on this device only. Nothing is saved.</Text>
        </View>

        <View style={styles.menu}>
          <Text style={[styles.sectionLabel, { color: c.mutedForeground }]}>QUICK COMMANDS</Text>
          {commandOptions.map((option) => (
            <Press key={option.command} testID={`command-${option.command}`} onPress={() => runCommand(option.command)} haptic={false}
              style={[styles.option, { borderColor: c.border, backgroundColor: c.card }]}
            >
              <Text style={[styles.optionCommand, { color: c.live }]}>$ {option.command}</Text>
              <View style={styles.optionInfo}>
                <Text style={[styles.optionTitle, { color: c.foreground }]}>{option.title}</Text>
                <Text style={[styles.optionDetail, { color: c.mutedForeground }]}>{option.detail}</Text>
              </View>
              <Feather name="arrow-up-right" size={16} color={c.mutedForeground} />
            </Press>
          ))}
        </View>

        {flow ? (
          <Animated.View entering={FadeInDown.duration(220)} style={[styles.form, { backgroundColor: c.card, borderColor: c.border }]}>
            <View style={styles.formHead}>
              <View style={styles.flex}>
                <Text style={[styles.formEyebrow, { color: c.accent }]}>{flow === 'start' ? 'NEW SESSION' : 'JOIN SESSION'}</Text>
                <Text style={[styles.formTitle, { color: c.foreground }]}>{flow === 'start' ? 'Create a room' : 'Enter your key'}</Text>
              </View>
              <Press testID="cancel-room-flow" onPress={() => runCommand('cancel')} accessibilityLabel="Close room setup">
                <Feather name="x" size={20} color={c.mutedForeground} />
              </Press>
            </View>
            <Text style={[styles.label, { color: c.mutedForeground }]}>TEMPORARY NAME</Text>
            <TextInput
              testID="input-name"
              value={name}
              onChangeText={setName}
              placeholder="Name shown in this room"
              placeholderTextColor={c.mutedForeground}
              maxLength={24}
              autoCorrect={false}
              autoComplete="off"
              onFocus={() => setNameFocus(true)}
              onBlur={() => setNameFocus(false)}
              returnKeyType={flow === 'start' ? 'go' : 'next'}
              onSubmitEditing={flow === 'start' ? go : undefined}
              style={[styles.input, { color: c.foreground, borderColor: nameFocus ? c.primary : c.input, backgroundColor: c.background }]}
            />

            {flow === 'join' ? (
              <>
                <Text style={[styles.label, { color: c.mutedForeground }]}>PRIVATE KEY</Text>
                <TextInput
                  testID="input-key"
                  value={key}
                  onChangeText={setKey}
                  placeholder="hush_…"
                  placeholderTextColor={c.mutedForeground}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="off"
                  spellCheck={false}
                  onFocus={() => setKeyFocus(true)}
                  onBlur={() => setKeyFocus(false)}
                  returnKeyType="go"
                  onSubmitEditing={go}
                  style={[styles.input, styles.mono, { color: c.foreground, borderColor: keyFocus ? c.primary : c.input, backgroundColor: c.background }]}
                />
                {key.trim().length > 0 && !keyOk ? (
                  <Text style={[styles.validation, { color: c.destructive }]}>Keys use hush_ followed by 43 characters.</Text>
                ) : null}
              </>
            ) : null}

            <View style={[styles.relayRow, { borderColor: c.border }]}>
              <View style={styles.flex}>
                <Text style={[styles.relayTitle, { color: c.foreground }]}>Hide my IP from peers</Text>
                <Text style={[styles.relayBody, { color: c.mutedForeground }]}>
                  Relay-only connection. It can be slower and may incur provider charges.
                  {relayAvailable === false ? ' Relay is not available right now.' : ''}
                </Text>
              </View>
              <Switch
                testID="toggle-relay"
                value={forceRelay}
                onValueChange={(v) => { tap(); setForceRelay(v); }}
                disabled={relayAvailable === false}
                trackColor={{ true: c.primary, false: c.input }}
                thumbColor={c.cardForeground}
              />
            </View>

            {error ? (
              <View style={[styles.error, { borderColor: c.destructive }]}>
                <Feather name="alert-circle" size={16} color={c.destructive} />
                <Text style={[styles.errorText, { color: c.destructive }]}>{error}</Text>
              </View>
            ) : null}

            <Button
              testID="submit-room"
              label={busy ? (flow === 'start' ? 'Opening the room' : 'Finding the room') : flow === 'start' ? 'Run · create room' : 'Run · join room'}
              onPress={go}
              disabled={!canGo}
              icon={busy ? <Breath color={c.primaryForeground} size={6} /> : <Feather name="terminal" size={17} color={c.primaryForeground} />}
            />
          </Animated.View>
        ) : null}

        <View style={styles.footer}>
          <Feather name="cpu" size={14} color={c.accent} />
          <Text style={[styles.footerText, { color: c.mutedForeground }]}>Keys and conversation history stay in memory on this device.</Text>
        </View>
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

const mono = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' });

const styles = StyleSheet.create({
  flex: { flex: 1 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 36 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  mark: { width: 28, height: 28, borderWidth: 1.5, borderRadius: 6, alignItems: 'flex-end', justifyContent: 'flex-start', padding: 5 },
  markDot: { width: 7, height: 7, borderRadius: 4 },
  wordmark: { fontFamily: mono, fontSize: 21, fontWeight: '700', letterSpacing: -0.8 },
  privacyLink: { flexDirection: 'row', alignItems: 'center', gap: 7, borderWidth: 1, borderRadius: 6, paddingHorizontal: 11, paddingVertical: 8 },
  privacyText: { fontFamily: mono, fontSize: 12 },
  eyebrow: { fontFamily: mono, fontSize: 11, letterSpacing: 1.4, marginBottom: 12 },
  hero: { fontFamily: fonts.semibold, fontSize: 34, lineHeight: 40, letterSpacing: -0.8 },
  lede: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, marginTop: 13, marginBottom: 24, maxWidth: 460 },
  terminal: { borderWidth: 1, borderRadius: 10, overflow: 'hidden' },
  terminalHead: { flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: 1, paddingHorizontal: 14, height: 44 },
  lights: { flexDirection: 'row', gap: 5 },
  light: { width: 7, height: 7, borderRadius: 4 },
  terminalTitle: { flex: 1, fontFamily: mono, fontSize: 11 },
  readyTag: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 4 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  readyText: { fontFamily: mono, fontSize: 10 },
  log: { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 8, gap: 11, minHeight: 67 },
  logLine: { gap: 3 },
  promptLabel: { fontFamily: mono, fontSize: 11 },
  logText: { fontFamily: mono, fontSize: 12, lineHeight: 18 },
  commandBar: { minHeight: 50, flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, paddingLeft: 12, paddingRight: 7, gap: 9 },
  commandPrefix: { fontFamily: mono, fontSize: 12, fontWeight: '700' },
  commandInput: { flex: 1, minWidth: 0, minHeight: 42, fontFamily: mono, fontSize: 14, paddingVertical: 7 },
  runButton: { width: 36, height: 36, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  commandHint: { fontFamily: mono, fontSize: 10, paddingHorizontal: 13, paddingBottom: 11 },
  menu: { marginTop: 24, gap: 8 },
  sectionLabel: { fontFamily: mono, fontSize: 10, letterSpacing: 1.3, marginBottom: 2 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 11, minHeight: 56, borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 9 },
  optionCommand: { fontFamily: mono, fontSize: 11, width: 68 },
  optionInfo: { flex: 1, gap: 2 },
  optionTitle: { fontFamily: fonts.semibold, fontSize: 14 },
  optionDetail: { fontFamily: fonts.body, fontSize: 12, lineHeight: 17 },
  form: { borderWidth: 1, borderRadius: 10, padding: 16, marginTop: 18, gap: 6 },
  formHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 7 },
  formEyebrow: { fontFamily: mono, fontSize: 10, letterSpacing: 1.1, marginBottom: 4 },
  formTitle: { fontFamily: fonts.semibold, fontSize: 20 },
  label: { fontFamily: mono, fontSize: 10, letterSpacing: 1, marginTop: 8, marginBottom: 5 },
  input: { minHeight: 48, borderRadius: 6, borderWidth: 1, paddingHorizontal: 12, fontFamily: fonts.body, fontSize: 15 },
  mono: { fontFamily: mono, fontSize: 12 },
  validation: { fontFamily: mono, fontSize: 10, marginTop: 3 },
  relayRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderTopWidth: 1, marginTop: 14, paddingTop: 12, paddingBottom: 8 },
  relayTitle: { fontFamily: fonts.semibold, fontSize: 14 },
  relayBody: { fontFamily: fonts.body, fontSize: 12, lineHeight: 17, marginTop: 3 },
  error: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', borderWidth: 1, borderRadius: 6, padding: 11, marginVertical: 4 },
  errorText: { flex: 1, fontFamily: fonts.medium, fontSize: 13, lineHeight: 18 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 22, paddingHorizontal: 2 },
  footerText: { flex: 1, fontFamily: fonts.body, fontSize: 12, lineHeight: 18 },
});
