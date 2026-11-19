import React, { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Modal, Platform, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import Animated, { FadeIn, FadeInDown, FadeInUp, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Breath, Initials, Press, fonts, formatSize, formatTime, tap } from '@/components/ui';
import { useHush, type Item } from '@/context/HushContext';
import { useColors } from '@/hooks/useColors';

function Progress({ value }: { value: number }) {
  const c = useColors();
  const a = useAnimatedStyle(() => ({ transform: [{ scaleX: withTiming(Math.max(0.02, value), { duration: 200 }) }] }));
  return (
    <View style={[styles.progressTrack, { backgroundColor: c.muted }]}>
      <Animated.View style={[styles.progressFill, { backgroundColor: c.accent, transformOrigin: 'left' }, a]} />
    </View>
  );
}

export default function Room() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const h = useHush();
  const { me, peers, items, status } = h;
  const [text, setText] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [members, setMembers] = useState(false);
  const [commandNotice, setCommandNotice] = useState<string | null>(null);

  useEffect(() => { if (status !== 'joined') router.replace('/'); }, [status]);

  const others = useMemo(() => peers.filter((p) => p.id !== me?.peerId), [peers, me?.peerId]);
  const online = others.filter((p) => p.connected).length;
  const data = useMemo(() => [...items].reverse(), [items]);
  const top = Platform.OS === 'web' ? 67 : insets.top;
  const bottom = Platform.OS === 'web' ? 34 : insets.bottom;

  if (!me) return <View style={{ flex: 1, backgroundColor: c.background }} />;

  const copyKey = async () => {
    await Clipboard.setStringAsync(me.key);
    tap('medium');
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };
  const shareKey = () => { void Share.share({ message: me.key }).catch(() => {}); };

  const leave = () => {
    const go = () => { h.leave(); router.replace('/'); };
    if (Platform.OS === 'web') { go(); return; }
    Alert.alert('Leave this room?', 'Your copy of the conversation disappears. Others keep theirs until they leave.', [
      { text: 'Stay', style: 'cancel' }, { text: 'Leave', style: 'destructive', onPress: go },
    ]);
  };

  const runRoomCommand = (raw: string) => {
    const command = raw.trim().toLowerCase();
    if (!command.startsWith('/')) return false;
    switch (command) {
      case '/help':
        setCommandNotice('Commands: /members · /key · /voice · /video · /file · /privacy · /leave');
        break;
      case '/members':
        setMembers(true);
        setCommandNotice('Showing the people in this room.');
        break;
      case '/key':
        setShowKey((current) => !current);
        setCommandNotice('Room key visibility toggled. Share it only with people you trust.');
        break;
      case '/voice':
      case '/call':
        call(false);
        setCommandNotice('Starting a voice call.');
        break;
      case '/video':
        call(true);
        setCommandNotice('Starting a video call.');
        break;
      case '/file':
        setCommandNotice('Choose a file to send. Files are limited to 20 MB.');
        void h.pickFile();
        break;
      case '/privacy':
        setCommandNotice('Opening the privacy notes.');
        router.push('/privacy');
        break;
      case '/leave':
        setCommandNotice(null);
        leave();
        break;
      default:
        setCommandNotice('Unknown room command. Type /help for the menu.');
    }
    return true;
  };

  const send = () => {
    const t = text.trim();
    if (!t) return;
    if (runRoomCommand(t)) {
      setText('');
      return;
    }
    h.sendText(t);
    setText('');
  };

  const call = (video: boolean) => {
    if (online === 0) { Alert.alert('No one to call yet', 'Calls connect once someone else is in the room.'); return; }
    tap('medium');
    h.startCall(video);
  };

  const masked = `${me.key.slice(0, 5)}${'\u2022'.repeat(8)}${me.key.slice(-4)}`;

  const renderItem = ({ item, index }: { item: Item; index: number }) => {
    const next = data[index + 1];
    const grouped = next && next.username === item.username && next.own === item.own;
    const mine = item.own;
    return (
      <Animated.View entering={FadeInUp.duration(240)} style={[styles.msgRow, mine ? styles.right : styles.left, { marginTop: grouped ? 3 : 14 }]}>
        {!grouped && !mine ? <Text style={[styles.author, { color: c.mutedForeground }]}>{item.username}</Text> : null}
        {item.kind === 'message' ? (
          <View style={[styles.bubble, mine ? { backgroundColor: c.primary, borderBottomRightRadius: 6 } : { backgroundColor: c.card, borderColor: c.border, borderWidth: 1, borderBottomLeftRadius: 6 }]}>
            <Text selectable style={[styles.msgText, { color: mine ? c.primaryForeground : c.foreground }]}>{item.text}</Text>
            <Text style={[styles.time, { color: mine ? 'rgba(246,241,228,0.6)' : c.mutedForeground }]}>{formatTime(item.time)}</Text>
          </View>
        ) : (
          <View style={[styles.fileCard, { backgroundColor: mine ? c.secondary : c.card, borderColor: c.border }]}>
            <View style={[styles.fileIcon, { backgroundColor: c.background }]}><Feather name="file" size={18} color={c.primary} /></View>
            <View style={{ flex: 1 }}>
              <Text numberOfLines={1} style={[styles.fileName, { color: c.foreground }]}>{item.name}</Text>
              <Text style={[styles.fileMeta, { color: c.mutedForeground }]}>{formatSize(item.size)} · {formatTime(item.time)}</Text>
            </View>
            {!mine ? (
              <Press testID={`save-${item.id}`} onPress={() => h.save(item.id)} style={[styles.saveBtn, { borderColor: c.primary }]}>
                <Feather name="download" size={14} color={c.primary} />
                <Text style={[styles.saveText, { color: c.primary }]}>Save</Text>
              </Press>
            ) : <Feather name="check" size={16} color={c.mutedForeground} />}
          </View>
        )}
      </Animated.View>
    );
  };

  return (
    <View style={[styles.flex, { backgroundColor: c.background }]}>
      <View style={[styles.header, { paddingTop: top + 8, borderColor: c.border }]}>
        <View style={styles.headRow}>
          <Press testID="open-members" onPress={() => setMembers(true)} style={styles.flex} haptic={false}>
            <Text style={[styles.title, { color: c.foreground }]}>hush://room</Text>
            <View style={styles.statusRow}>
              {online > 0
                ? <View style={[styles.dot, { backgroundColor: c.live }]} />
                : <Breath color={c.accent} size={6} />}
              <Text style={[styles.statusText, { color: c.mutedForeground }]}>
                {online > 0 ? `${online + 1} here` : others.length > 0 ? 'Others are offline' : 'Waiting for someone to join'}
              </Text>
              <Feather name="chevron-right" size={14} color={c.mutedForeground} />
            </View>
          </Press>
          <Press testID="voice-call" onPress={() => call(false)} style={[styles.iconBtn, { backgroundColor: c.secondary }]} accessibilityLabel="Voice call">
            <Feather name="phone" size={18} color={c.primary} />
          </Press>
          <Press testID="video-call" onPress={() => call(true)} style={[styles.iconBtn, { backgroundColor: c.secondary }]} accessibilityLabel="Video call">
            <Feather name="video" size={18} color={c.primary} />
          </Press>
          <Press testID="leave-room" onPress={leave} style={[styles.iconBtn, { backgroundColor: c.muted }]} accessibilityLabel="Leave room">
            <Feather name="log-out" size={18} color={c.destructive} />
          </Press>
        </View>

        <View style={[styles.keyBar, { backgroundColor: c.card, borderColor: c.border }]}>
          <Feather name="key" size={14} color={c.accent} />
          <Press testID="toggle-key" onPress={() => setShowKey((v) => !v)} style={styles.flex} haptic={false}>
            <Text numberOfLines={1} selectable={showKey} style={[styles.keyText, { color: c.foreground }]}>{showKey ? me.key : masked}</Text>
          </Press>
          <Press testID="copy-key" onPress={copyKey} style={styles.keyAction} accessibilityLabel="Copy key">
            <Feather name={copied ? 'check' : 'copy'} size={16} color={copied ? c.live : c.primary} />
          </Press>
          <Press testID="share-key" onPress={shareKey} style={styles.keyAction} accessibilityLabel="Share key">
            <Feather name="share" size={16} color={c.primary} />
          </Press>
        </View>

        {h.reconnecting ? (
          <Animated.View entering={FadeIn} style={[styles.banner, { backgroundColor: c.muted }]}>
            <Breath color={c.accent} size={5} />
            <Text style={[styles.bannerText, { color: c.foreground }]}>Connection dropped. Reconnecting quietly.</Text>
          </Animated.View>
        ) : null}
        {h.error ? (
          <Press onPress={h.clearError} haptic={false} style={[styles.banner, { backgroundColor: '#B2452F14' }]}>
            <Feather name="alert-circle" size={14} color={c.destructive} />
            <Text style={[styles.bannerText, { color: c.destructive }]}>{h.error}</Text>
            <Feather name="x" size={14} color={c.destructive} />
          </Press>
        ) : null}
      </View>

      <KeyboardAvoidingView behavior="padding" style={styles.flex} keyboardVerticalOffset={0}>
        <FlatList
          data={data}
          inverted={data.length > 0}
          keyExtractor={(i) => `${i.kind}-${i.id}`}
          renderItem={renderItem}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={data.length === 0 ? styles.emptyWrap : styles.list}
          ListEmptyComponent={
            <Animated.View entering={FadeInDown.duration(500)} style={styles.empty}>
              <View style={[styles.emptyMark, { borderColor: c.border }]}><Breath color={c.primary} size={10} /></View>
              <Text style={[styles.emptyTitle, { color: c.foreground }]}>The room is quiet.</Text>
              <Text style={[styles.emptyBody, { color: c.mutedForeground }]}>
                {others.length === 0
                  ? 'Send the key to someone you trust. Nothing said here outlives this session on your phone.'
                  : 'Say the first thing. It stays in memory and vanishes when you leave.'}
              </Text>
              {others.length === 0 ? (
                <Press onPress={shareKey} style={[styles.emptyBtn, { backgroundColor: c.primary }]}>
                  <Feather name="share" size={15} color={c.primaryForeground} />
                  <Text style={[styles.emptyBtnText, { color: c.primaryForeground }]}>Share the key</Text>
                </Press>
              ) : null}
            </Animated.View>
          }
        />

        {h.transfer != null ? (
          <View style={styles.transfer}>
            <Text style={[styles.transferText, { color: c.mutedForeground }]}>Sending file · {Math.round(h.transfer * 100)}%</Text>
            <Progress value={h.transfer} />
          </View>
        ) : null}

        <View style={[styles.composer, { paddingBottom: bottom + 10, borderColor: c.border, backgroundColor: c.background }]}>
          <Press testID="attach" onPress={() => { void h.pickFile(); }} style={[styles.attach, { backgroundColor: c.muted }]} accessibilityLabel="Send a file up to 20 MB">
            <Feather name="paperclip" size={18} color={c.primary} />
          </Press>
          <TextInput
            testID="composer"
            value={text}
            onChangeText={(value) => { setText(value); if (commandNotice) setCommandNotice(null); }}
            placeholder={online > 0 ? 'Message · /help for commands' : 'Write while you wait'}
            placeholderTextColor={c.mutedForeground}
            multiline
            maxLength={4000}
            style={[styles.input, { color: c.foreground, backgroundColor: c.card, borderColor: c.border }]}
          />
          <Press testID="send" onPress={send} disabled={!text.trim()} style={[styles.send, { backgroundColor: text.trim() ? c.accent : c.muted }]} accessibilityLabel="Send">
            <Feather name="arrow-up" size={20} color={text.trim() ? c.accentForeground : c.mutedForeground} />
          </Press>
        </View>
        <View style={styles.commandHelp}>
          <Text style={[styles.commandHelpText, { color: commandNotice ? c.accent : c.mutedForeground }]}>
            {commandNotice ?? 'Messages are encrypted · Type /help for room commands'}
          </Text>
        </View>
      </KeyboardAvoidingView>

      <Modal visible={members} transparent animationType="fade" onRequestClose={() => setMembers(false)}>
        <Press haptic={false} style={styles.scrim} onPress={() => setMembers(false)}>
          <Press haptic={false} onPress={() => {}} style={[styles.sheet, { backgroundColor: c.background, paddingBottom: bottom + 20 }]}>
            <View style={[styles.grab, { backgroundColor: c.border }]} />
            <Text style={[styles.sheetTitle, { color: c.foreground }]}>In the room</Text>
            <Text style={[styles.sheetSub, { color: c.mutedForeground }]}>Up to 8 people. Names last only as long as the room.</Text>
            <View style={styles.memberRow}>
              <Initials name={me.username} size={40} bg={c.primary} fg={c.primaryForeground} />
              <Text style={[styles.memberName, { color: c.foreground }]}>{me.username} <Text style={{ color: c.mutedForeground }}>(you)</Text></Text>
            </View>
            {others.map((p) => (
              <View key={p.id} style={styles.memberRow}>
                <Initials name={p.username} size={40} bg={c.muted} fg={c.foreground} ring={p.connected ? c.live : undefined} />
                <Text style={[styles.memberName, { color: c.foreground }]}>{p.username}</Text>
                <Text style={[styles.memberState, { color: p.connected ? c.live : c.mutedForeground }]}>{p.connected ? 'connected' : 'offline'}</Text>
              </View>
            ))}
            {others.length === 0 ? <Text style={[styles.sheetSub, { color: c.mutedForeground, marginTop: 12 }]}>No one else yet. They will appear here the moment they join.</Text> : null}
          </Press>
        </Press>
      </Modal>
    </View>
  );
}

const mono = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' });

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1, gap: 10 },
  headRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontFamily: mono, fontSize: 15, fontWeight: '700', letterSpacing: -0.3 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 1 },
  dot: { width: 7, height: 7, borderRadius: 4, marginHorizontal: 5 },
  statusText: { fontFamily: fonts.medium, fontSize: 13 },
  iconBtn: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  keyBar: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: 6, paddingLeft: 12, height: 44 },
  keyText: { fontFamily: mono, fontSize: 13 },
  keyAction: { width: 40, height: 44, alignItems: 'center', justifyContent: 'center' },
  banner: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 },
  bannerText: { flex: 1, fontFamily: fonts.medium, fontSize: 13 },
  list: { paddingHorizontal: 14, paddingVertical: 12 },
  emptyWrap: { flexGrow: 1, justifyContent: 'center', padding: 32 },
  empty: { alignItems: 'center', gap: 10 },
  emptyMark: { width: 72, height: 72, borderRadius: 36, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  emptyTitle: { fontFamily: mono, fontSize: 19, fontWeight: '700' },
  emptyBody: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, textAlign: 'center', maxWidth: 300 },
  emptyBtn: { flexDirection: 'row', gap: 8, alignItems: 'center', borderRadius: 22, paddingHorizontal: 18, height: 44, marginTop: 10 },
  emptyBtnText: { fontFamily: fonts.semibold, fontSize: 15 },
  msgRow: { maxWidth: '82%' },
  right: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  left: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  author: { fontFamily: fonts.semibold, fontSize: 12, marginBottom: 4, marginLeft: 6 },
  bubble: { borderRadius: 8, paddingHorizontal: 14, paddingTop: 9, paddingBottom: 6 },
  msgText: { fontFamily: fonts.body, fontSize: 16, lineHeight: 22 },
  time: { fontFamily: fonts.body, fontSize: 10, alignSelf: 'flex-end', marginTop: 2 },
  fileCard: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: 8, padding: 10, minWidth: 240 },
  fileIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  fileName: { fontFamily: fonts.semibold, fontSize: 14 },
  fileMeta: { fontFamily: fonts.body, fontSize: 12, marginTop: 2 },
  saveBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderRadius: 14, paddingHorizontal: 10, height: 30 },
  saveText: { fontFamily: fonts.semibold, fontSize: 12 },
  transfer: { paddingHorizontal: 18, paddingBottom: 6, gap: 6 },
  transferText: { fontFamily: fonts.medium, fontSize: 12 },
  progressTrack: { height: 4, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: 4, width: '100%' },
  composer: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, paddingHorizontal: 12, paddingTop: 10, borderTopWidth: 1 },
  attach: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  input: { flex: 1, minHeight: 44, maxHeight: 130, borderRadius: 6, borderWidth: 1, paddingHorizontal: 14, paddingTop: 11, paddingBottom: 11, fontFamily: mono, fontSize: 13 },
  send: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  commandHelp: { minHeight: 26, justifyContent: 'center', paddingHorizontal: 16, paddingBottom: 4 },
  commandHelpText: { fontFamily: mono, fontSize: 10, lineHeight: 15 },
  scrim: { flex: 1, backgroundColor: 'rgba(15,30,25,0.4)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 22, paddingTop: 10 },
  grab: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  sheetTitle: { fontFamily: fonts.display, fontSize: 24 },
  sheetSub: { fontFamily: fonts.body, fontSize: 14, marginTop: 4, marginBottom: 10 },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  memberName: { flex: 1, fontFamily: fonts.semibold, fontSize: 15 },
  memberState: { fontFamily: fonts.medium, fontSize: 12 },
});
