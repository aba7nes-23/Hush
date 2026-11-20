import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import Engine from '@/components/Engine';
import type { EngineCommand, EngineEvent } from '@/context/types';

export type Peer = { id: string; username: string; connected: boolean };
export type Item =
  | { kind: 'message'; id: string; username: string; text: string; time: number; own: boolean }
  | { kind: 'file'; id: string; username: string; name: string; size: number; time: number; own: boolean };
export type CallState = { state: 'incoming' | 'calling' | 'active' | 'ended'; video: boolean; username?: string };
export type Status = 'idle' | 'connecting' | 'joined';

type HushContextValue = {
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
  setForceRelay: (enabled: boolean) => void;
  clearError: () => void;
  create: (username: string) => void;
  join: (username: string, key: string) => void;
  sendText: (text: string) => void;
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

const HushContext = createContext<HushContextValue | null>(null);
const MAX_FILE_BYTES = 20 * 1024 * 1024;

function asString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : value == null ? fallback : String(value);
}

function asTime(value: unknown) {
  if (typeof value === 'number') return value;
  const parsed = Date.parse(String(value));
  return Number.isNaN(parsed) ? Date.now() : parsed;
}

function toBase64(bytes: Uint8Array) {
  let binary = '';
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
  }
  return btoa(binary);
}

export function HushProvider({ children }: { children: ReactNode }) {
  const postRef = useRef<((command: EngineCommand) => void) | null>(null);
  const readyRef = useRef(false);
  const queued = useRef<EngineCommand[]>([]);
  const [engineReady, setEngineReady] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [me, setMe] = useState<HushContextValue['me']>(null);
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

  const post = useCallback((command: EngineCommand) => {
    if (readyRef.current && postRef.current) postRef.current(command);
    else queued.current.push(command);
  }, []);

  const registerPost = useCallback((send: ((command: EngineCommand) => void) | null) => {
    postRef.current = send;
    if (!send) readyRef.current = false;
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

  const onEvent = useCallback(
    (event: EngineEvent) => {
      switch (event.type) {
        case 'ready': {
          readyRef.current = true;
          setEngineReady(true);
          const commands = queued.current;
          queued.current = [];
          commands.forEach((command) => postRef.current?.(command));
          break;
        }
        case 'joined':
          setMe({
            key: asString(event.key),
            peerId: asString(event.peerId),
            username: asString(event.username),
          });
          setStatus('joined');
          setError(null);
          break;
        case 'peers':
          if (Array.isArray(event.peers)) {
            setPeers(
              (event.peers as Record<string, unknown>[]).slice(0, 8).map((peer) => ({
                id: asString(peer.id),
                username: asString(peer.username, 'someone'),
                connected: !!peer.connected,
              })),
            );
          }
          break;
        case 'message':
          setItems((previous) => [
            ...previous.slice(-299),
            {
              kind: 'message',
              id: asString(event.id),
              username: asString(event.username),
              text: asString(event.text),
              time: asTime(event.time),
              own: !!event.own,
            },
          ]);
          break;
        case 'file':
          setTransfer(null);
          setItems((previous) => [
            ...previous.slice(-299),
            {
              kind: 'file',
              id: asString(event.id),
              username: asString(event.username),
              name: asString(event.name, 'file'),
              size: Number(event.size) || 0,
              time: asTime(event.time),
              own: !!event.own,
            },
          ]);
          break;
        case 'transfer': {
          const progress = Number(event.progress);
          setTransfer(progress >= 100 || Number.isNaN(progress) ? null : progress / 100);
          break;
        }
        case 'call': {
          const callState = asString(event.state) as CallState['state'];
          if (callState === 'ended') {
            setCall((current) => (current ? { ...current, state: 'ended' } : null));
            window.setTimeout(
              () => setCall((current) => (current?.state === 'ended' ? null : current)),
              1400,
            );
            setMuted(false);
            setCameraOn(true);
          } else {
            setCall((current) => ({
              state: callState,
              video: typeof event.video === 'boolean' ? event.video : current?.video ?? false,
              username: typeof event.username === 'string' ? event.username : current?.username,
            }));
          }
          break;
        }
        case 'relay':
          setRelayAvailable(!!event.available);
          break;
        case 'connection':
          setReconnecting(event.state === 'reconnecting');
          break;
        case 'left':
          resetRoom();
          break;
        case 'error':
          setError(asString(event.message, 'Something went wrong.'));
          setTransfer(null);
          setStatus((current) => (current === 'connecting' ? 'idle' : current));
          break;
      }
    },
    [resetRoom],
  );

  const create = useCallback(
    (username: string) => {
      setError(null);
      setStatus('connecting');
      post({ type: 'create', username, forceRelay });
    },
    [forceRelay, post],
  );

  const join = useCallback(
    (username: string, key: string) => {
      setError(null);
      setStatus('connecting');
      post({ type: 'join', username, key, forceRelay });
    },
    [forceRelay, post],
  );

  const pickFile = useCallback(async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '*/*';
    input.setAttribute('aria-label', 'Choose a file up to 20 MB');
    const file = await new Promise<File | null>((resolve) => {
      const finish = (selection: File | null) => {
        input.remove();
        resolve(selection);
      };
      input.addEventListener('change', () => finish(input.files?.[0] ?? null), { once: true });
      input.addEventListener('cancel', () => finish(null), { once: true });
      input.click();
    });
    if (!file) return;
    if (file.size > MAX_FILE_BYTES) {
      setError('Files must be 20 MB or smaller.');
      return;
    }
    if (!file.size) {
      setError('Choose a nonempty file.');
      return;
    }
    try {
      setError(null);
      setTransfer(0);
      const bytes = new Uint8Array(await file.arrayBuffer());
      post({
        type: 'file',
        name: file.name,
        mime: file.type || 'application/octet-stream',
        base64: toBase64(bytes),
      });
    } catch {
      setTransfer(null);
      setError('Could not read that file.');
    }
  }, [post]);

  const save = useCallback(
    (id: string) => post({ type: 'save', id }),
    [post],
  );

  const value = useMemo<HushContextValue>(
    () => ({
      engineReady,
      status,
      me,
      peers,
      items,
      transfer,
      call,
      muted,
      cameraOn,
      relayAvailable,
      reconnecting,
      error,
      forceRelay,
      setForceRelay,
      clearError: () => setError(null),
      create,
      join,
      sendText: (text) => post({ type: 'text', text }),
      pickFile,
      save,
      startCall: (video) => {
        setCameraOn(video);
        post({ type: 'call', video });
      },
      accept: () => post({ type: 'accept' }),
      decline: () => {
        post({ type: 'decline' });
        setCall(null);
      },
      toggleMute: () => {
        post({ type: 'mute', muted: !muted });
        setMuted(!muted);
      },
      toggleCamera: () => {
        post({ type: 'camera', enabled: !cameraOn });
        setCameraOn(!cameraOn);
      },
      endCall: () => {
        post({ type: 'endCall' });
        setCall(null);
        setMuted(false);
        setCameraOn(true);
      },
      leave: () => {
        post({ type: 'leave' });
        resetRoom();
      },
    }),
    [
      engineReady,
      status,
      me,
      peers,
      items,
      transfer,
      call,
      muted,
      cameraOn,
      relayAvailable,
      reconnecting,
      error,
      forceRelay,
      create,
      join,
      post,
      pickFile,
      save,
      resetRoom,
    ],
  );

  return (
    <HushContext.Provider value={value}>
      {children}
      <Engine
        visible={!!call && call.video && (call.state === 'active' || call.state === 'calling')}
        onEvent={onEvent}
        registerPost={registerPost}
      />
    </HushContext.Provider>
  );
}

export function useHush() {
  const context = useContext(HushContext);
  if (!context) throw new Error('useHush must be used within HushProvider');
  return context;
}
