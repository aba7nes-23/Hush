import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Alert, Platform, StyleSheet, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import Engine from '@/components/Engine';
import { engineDomain, type EngineCommand, type EngineEvent } from '@/context/types';

export type Peer = { id: string; username: string; connected: boolean };
export type Item =
  | { kind: 'message'; id: string; username: string; text: string; time: number; own: boolean }
  | { kind: 'file'; id: string; username: string; name: string; size: number; time: number; own: boolean };
export type CallState = { state: 'incoming' | 'calling' | 'active' | 'ended'; video: boolean; username?: string };
export type Status = 'idle' | 'connecting' | 'joined';

const MAX_BYTES = 20 * 1024 * 1024;

type Ctx = {
  engineReady: boolean;
  status: Status;
  me: { key: string; peerId: string; username: string } | null;
  peers: Peer[];
  items: Item[];
  transfer: number | null;
  call: CallState | null;
  muted: boolean;
  cameraOn: boolean;
  relayAvailable: boolean | null;
  reconnecting: boolean;
  error: string | null;
  forceRelay: boolean;
  setForceRelay: (v: boolean) => void;
  clearError: () => void;
  create: (username: string) => void;
  join: (username: string, key: string) => void;
  sendText: (t: string) => void;
  pickFile: () => Promise<void>;
  save: (id: string) => void;
  startCall: (video: boolean) => void;
  accept: () => void;
  decline: () => void;
  toggleMute: () => void;
  toggleCamera: () => void;
  endCall: () => void;
  leave: () => void;
};

const HushContext = createContext<Ctx | null>(null);

const toTime = (t: unknown) => {
  if (typeof t === 'number') return t;
  const n = Date.parse(String(t));
  return Number.isNaN(n) ? Date.now() : n;
};
const str = (v: unknown, d = '') => (typeof v === 'string' ? v : v == null ? d : String(v));

export function HushProvider({ children, overlay }: { children: React.ReactNode; overlay?: React.ReactNode }) {
  const { url, origin } = useMemo(engineDomain, []);
  const postRef = useRef<((c: EngineCommand) => void) | null>(null);
  const readyRef = useRef(false);
  const queue = useRef<EngineCommand[]>([]);

  const [engineReady, setEngineReady] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [me, setMe] = useState<Ctx['me']>(null);
  const [peers, setPeers] = useState<Peer[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [transfer, setTransfer] = useState<number | null>(null);
  const [call, setCall] = useState<CallState | null>(null);
  const [muted, setMuted] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [relayAvailable, setRelayAvailable] = useState<boolean | null>(null);
  const [reconnecting, setReconnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forceRelay, setForceRelay] = useState(false);

  const post = useCallback((c: EngineCommand) => {
    if (readyRef.current && postRef.current) postRef.current(c);
    else queue.current.push(c);
  }, []);

  const registerPost = useCallback((p: ((c: EngineCommand) => void) | null) => {
    postRef.current = p;
    if (!p) readyRef.current = false;
  }, []);

  const resetRoom = useCallback(() => {
    setStatus('idle');
    setMe(null);
    setPeers([]);
    setItems([]);
    setTransfer(null);
    setCall(null);
    setMuted(false);
    setCameraOn(true);
    setReconnecting(false);
  }, []);

  const saveNative = useCallback(async (e: EngineEvent) => {
    const safe = str(e.name, 'hush-file').replace(/[^\w.\- ]+/g, '_').slice(0, 96) || 'hush-file';
    const path = `${FileSystem.cacheDirectory ?? ''}hush-${Date.now()}-${safe}`;
    try {
      await FileSystem.writeAsStringAsync(path, str(e.base64), { encoding: FileSystem.EncodingType.Base64 });
      if (!(await Sharing.isAvailableAsync())) throw new Error('Sharing is not available on this device.');
      await Sharing.shareAsync(path, { mimeType: str(e.mime, 'application/octet-stream'), dialogTitle: safe });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save that file.');
    } finally {
      await FileSystem.deleteAsync(path, { idempotent: true }).catch(() => {});
    }
  }, []);

  const onEvent = useCallback((e: EngineEvent) => {
    switch (e.type) {
      case 'ready': {
        readyRef.current = true;
        setEngineReady(true);
        const q = queue.current;
        queue.current = [];
        q.forEach((c) => postRef.current?.(c));
        break;
      }
      case 'joined':
        setMe({ key: str(e.key), peerId: str(e.peerId), username: str(e.username) });
        setStatus('joined');
        setError(null);
        break;
      case 'peers':
        if (Array.isArray(e.peers)) {
          setPeers(
            (e.peers as Record<string, unknown>[]).slice(0, 8).map((p) => ({
              id: str(p.id), username: str(p.username, 'someone'), connected: !!p.connected,
            })),
          );
        }
        break;
      case 'message':
        setItems((prev) => [...prev.slice(-299), {
          kind: 'message', id: str(e.id), username: str(e.username), text: str(e.text), time: toTime(e.time), own: !!e.own,
        }]);
        break;
      case 'file':
        setTransfer(null);
        setItems((prev) => [...prev.slice(-299), {
          kind: 'file', id: str(e.id), username: str(e.username), name: str(e.name, 'file'),
          size: Number(e.size) || 0, time: toTime(e.time), own: !!e.own,
        }]);
        break;
      case 'transfer': {
        const p = Number(e.progress);
        setTransfer(p >= 100 || Number.isNaN(p) ? null : p / 100);
        break;
      }
      case 'call': {
        const state = str(e.state) as CallState['state'];
        if (state === 'ended') {
          setCall((c) => (c ? { ...c, state: 'ended' } : null));
          setTimeout(() => setCall((c) => (c?.state === 'ended' ? null : c)), 1400);
          setMuted(false);
          setCameraOn(true);
        } else {
          setCall((c) => ({
            state,
            video: typeof e.video === 'boolean' ? e.video : c?.video ?? false,
            username: typeof e.username === 'string' ? e.username : c?.username,
          }));
        }
        break;
      }
      case 'relay':
        setRelayAvailable(!!e.available);
        break;
      case 'connection':
        setReconnecting(e.state === 'reconnecting');
        break;
      case 'left':
        resetRoom();
        break;
      case 'error':
        setError(str(e.message, 'Something went wrong.'));
        setTransfer(null);
        setStatus((s) => (s === 'connecting' ? 'idle' : s));
        break;
      case 'saveFile':
        if (Platform.OS !== 'web') void saveNative(e);
        break;
    }
  }, [resetRoom, saveNative]);

  const create = useCallback((username: string) => {
    setError(null);
    setStatus('connecting');
    post({ type: 'create', username, forceRelay });
  }, [post, forceRelay]);

  const join = useCallback((username: string, key: string) => {
    setError(null);
    setStatus('connecting');
    post({ type: 'join', username, key, forceRelay });
  }, [post, forceRelay]);

  const pickFile = useCallback(async () => {
    const res = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true, multiple: false });
    if (res.canceled || !res.assets?.[0]) return;
    const a = res.assets[0];
    const mime = a.mimeType ?? 'application/octet-stream';
    if (Platform.OS === 'web') {
      const file = a.file;
      if (!file) return;
      if (file.size > MAX_BYTES) { setError('Files must be 20 MB or smaller.'); return; }
      const base64 = await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result).split(',')[1] ?? '');
        r.onerror = () => reject(new Error('Could not read that file.'));
        r.readAsDataURL(file);
      });
      post({ type: 'file', name: a.name, mime, base64 });
      return;
    }
    try {
      if ((a.size ?? 0) > MAX_BYTES) { setError('Files must be 20 MB or smaller.'); return; }
      const base64 = await FileSystem.readAsStringAsync(a.uri, { encoding: FileSystem.EncodingType.Base64 });
      if (base64.length * 0.75 > MAX_BYTES) { setError('Files must be 20 MB or smaller.'); return; }
      setTransfer(0);
      post({ type: 'file', name: a.name, mime, base64 });
    } catch {
      setError('Could not read that file.');
    } finally {
      await FileSystem.deleteAsync(a.uri, { idempotent: true }).catch(() => {});
    }
  }, [post]);

  const save = useCallback((id: string) => {
    if (Platform.OS === 'web') { post({ type: 'save', id }); return; }
    Alert.alert(
      'Save outside Hush?',
      'A saved copy lives on your device or wherever you send it. It is no longer covered by Hush leaving nothing behind.',
      [{ text: 'Cancel', style: 'cancel' }, { text: 'Save copy', onPress: () => post({ type: 'save', id }) }],
    );
  }, [post]);

  const value: Ctx = {
    engineReady, status, me, peers, items, transfer, call, muted, cameraOn, relayAvailable, reconnecting, error,
    forceRelay, setForceRelay, clearError: () => setError(null), create, join,
    sendText: (text) => post({ type: 'text', text }),
    pickFile, save,
    startCall: (video) => { setCameraOn(video); post({ type: 'call', video }); },
    accept: () => post({ type: 'accept' }),
    decline: () => { post({ type: 'decline' }); setCall(null); },
    toggleMute: () => { post({ type: 'mute', muted: !muted }); setMuted(!muted); },
    toggleCamera: () => { post({ type: 'camera', enabled: !cameraOn }); setCameraOn(!cameraOn); },
    endCall: () => { post({ type: 'endCall' }); setCall(null); setMuted(false); setCameraOn(true); },
    leave: () => { post({ type: 'leave' }); resetRoom(); },
  };

  const surfaceVisible = !!call && call.video && (call.state === 'active' || call.state === 'calling');

  return (
    <HushContext.Provider value={value}>
      <View style={styles.root}>
        {children}
        <Engine url={url} origin={origin} visible={surfaceVisible} onEvent={onEvent} registerPost={registerPost} />
        {overlay}
      </View>
    </HushContext.Provider>
  );
}

export function useHush() {
  const c = useContext(HushContext);
  if (!c) throw new Error('useHush must be used within HushProvider');
  return c;
}

const styles = StyleSheet.create({ root: { flex: 1 } });
