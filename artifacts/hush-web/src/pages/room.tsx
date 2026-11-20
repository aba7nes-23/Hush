import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { Link, useLocation } from 'wouter';
import {
  ArrowLeft, AudioLines, Copy, Download, File, Link2, LockKeyhole, Mic, MicOff,
  Eye, EyeOff, Phone, PhoneOff, Send, Shield, Video, VideoOff, X,
} from 'lucide-react';
import { useHush, type Item } from '@/context/HushContext';

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatTime(time: number) {
  return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(time);
}

function CallPanel() {
  const hush = useHush();
  const call = hush.call;
  if (!call) return null;
  const label = call.state === 'incoming'
    ? `${call.username || 'Someone'} is calling`
    : call.state === 'calling'
      ? `Calling ${call.username || 'room'}…`
      : call.state === 'ended'
        ? 'Call ended'
        : `In a ${call.video ? 'video' : 'voice'} call${call.username ? ` with ${call.username}` : ''}`;
  return (
    <section className="side-card call-card" aria-live="polite" data-testid="panel-call-state">
      <h2 className="side-title">Call <span className="peer-count">{call.state}</span></h2>
      <p className="call-state">{label}</p>
      {call.state === 'incoming' ? (
        <div className="call-actions">
          <button className="btn btn-primary" onClick={hush.accept} data-testid="button-accept-call"><Phone size={15} /> Accept</button>
          <button className="btn btn-quiet" onClick={hush.decline} data-testid="button-decline-call"><PhoneOff size={15} /> Decline</button>
        </div>
      ) : call.state === 'active' ? (
        <div className="call-actions">
          <button className="btn btn-quiet" onClick={hush.toggleMute} data-testid="button-toggle-mute">
            {hush.muted ? <MicOff size={15} /> : <Mic size={15} />}{hush.muted ? 'Unmute' : 'Mute'}
          </button>
          {call.video && (
            <button className="btn btn-quiet" onClick={hush.toggleCamera} data-testid="button-toggle-camera">
              {hush.cameraOn ? <Video size={15} /> : <VideoOff size={15} />}{hush.cameraOn ? 'Camera' : 'Camera off'}
            </button>
          )}
          <button className="btn btn-danger" onClick={hush.endCall} data-testid="button-end-call"><PhoneOff size={15} /> End</button>
        </div>
      ) : call.state === 'calling' ? (
        <button className="btn btn-danger" onClick={hush.endCall} data-testid="button-cancel-call"><PhoneOff size={15} /> Cancel call</button>
      ) : null}
    </section>
  );
}

function FloatingVideoControls() {
  const hush = useHush();
  const call = hush.call;
  if (!call?.video || (call.state !== 'active' && call.state !== 'calling')) return null;
  return (
    <section className="floating-call-controls" aria-label="Video call controls" data-testid="overlay-video-call-controls">
      <span className="call-name">{call.state === 'calling' ? `Calling ${call.username || 'room'}…` : `Video call${call.username ? ` · ${call.username}` : ''}`}</span>
      {call.state === 'active' && (
        <>
          <button className="btn btn-quiet" onClick={hush.toggleMute} aria-label={hush.muted ? 'Unmute microphone' : 'Mute microphone'} data-testid="button-overlay-toggle-mute">
            {hush.muted ? <MicOff size={16} /> : <Mic size={16} />}
          </button>
          <button className="btn btn-quiet" onClick={hush.toggleCamera} aria-label={hush.cameraOn ? 'Turn camera off' : 'Turn camera on'} data-testid="button-overlay-toggle-camera">
            {hush.cameraOn ? <Video size={16} /> : <VideoOff size={16} />}
          </button>
        </>
      )}
      <button className="btn btn-danger" onClick={hush.endCall} aria-label={call.state === 'calling' ? 'Cancel video call' : 'End video call'} data-testid="button-overlay-end-call">
        <PhoneOff size={16} />
      </button>
    </section>
  );
}

function MessageItem({ item, onSave }: { item: Item; onSave: (id: string) => void }) {
  const ownName = item.own ? 'You' : item.username;
  return (
    <article className={`message${item.own ? ' own' : ''}`} data-testid={`message-item-${item.id}`}>
      <div className="message-meta"><b>{ownName}</b><time dateTime={new Date(item.time).toISOString()}>{formatTime(item.time)}</time></div>
      {item.kind === 'message' ? (
        <div className="bubble">{item.text}</div>
      ) : (
        <div className="bubble file-bubble">
          <span className="file-symbol"><File size={17} /></span>
          <span className="file-name"><strong>{item.name}</strong><small>{formatBytes(item.size)}</small></span>
          {!item.own && (
            <button className="file-save" type="button" onClick={() => onSave(item.id)} aria-label={`Save ${item.name}`} title="Save file" data-testid={`button-save-file-${item.id}`}>
              <Download size={15} />
            </button>
          )}
        </div>
      )}
    </article>
  );
}

export default function Room() {
  const hush = useHush();
  const [, setLocation] = useLocation();
  const [draft, setDraft] = useState('');
  const [notice, setNotice] = useState('');
  const [keyVisible, setKeyVisible] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);
  const connectedPeers = hush.peers.filter((peer) => peer.connected);

  useEffect(() => {
    document.title = hush.me ? `Room with ${hush.me.username} — Hush` : 'Your Hush room';
    const description = document.querySelector('meta[name="description"]');
    description?.setAttribute('content', 'A temporary Hush room for private conversation and peer-to-peer sharing.');
  }, [hush.me]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [hush.items.length]);

  useEffect(() => {
    if (hush.status === 'idle' && !hush.me) setLocation('/');
  }, [hush.status, hush.me, setLocation]);

  const copyKey = async () => {
    if (!hush.me) return;
    try {
      await navigator.clipboard.writeText(hush.me.key);
      setNotice('Room key copied. Share it only with people you trust.');
    } catch {
      setNotice('Could not access the clipboard. Select and copy the room key instead.');
    }
  };

  const shareKey = async () => {
    if (!hush.me) return;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Join my Hush room', text: `Use this Hush room key to join: ${hush.me.key}` });
        setNotice('Room key shared.');
      } else {
        await copyKey();
      }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) setNotice('Could not share the room key.');
    }
  };

  const sendDraft = () => {
    const text = draft.trim();
    if (!text) return;
    if (text.length > 4000) {
      setNotice('Messages can be up to 4,000 characters.');
      return;
    }
    if (text.startsWith('/')) {
      const [command, ...args] = text.split(/\s+/);
      if (command === '/help') {
        setNotice('Commands: /members · /key · /voice · /video · /file · /privacy · /leave.');
      } else if (command === '/key') {
        void copyKey();
      } else if (command === '/members') {
        setNotice('The people in this room are listed beside the conversation.');
      } else if (command === '/call' || command === '/voice') {
        hush.startCall(false);
        setNotice('Starting a voice call…');
      } else if (command === '/video') {
        hush.startCall(true);
        setNotice('Starting a video call…');
      } else if (command === '/file') {
        void hush.pickFile();
        setNotice('Choose a file up to 20 MB to send.');
      } else if (command === '/leave') {
        hush.leave();
        setLocation('/');
      } else if (command === '/privacy') {
        setLocation('/privacy');
      } else if (command === '/relay') {
        if (args[0] === 'on' || args[0] === 'off') {
          hush.setForceRelay(args[0] === 'on');
          setNotice(`Relay-only preference ${args[0]}. It applies the next time you join.`);
        } else {
          setNotice(`Relay-only is ${hush.forceRelay ? 'on' : 'off'}. Use /relay on or /relay off for your next room.`);
        }
      } else {
        setNotice('Unknown command. Type /help to see room commands.');
      }
      setDraft('');
      return;
    }
    hush.sendText(text);
    setDraft('');
    setNotice('');
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    sendDraft();
  };
  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendDraft();
    }
  };
  const leave = () => {
    if (window.confirm('Leave this room? Hush will clear the conversation from this device.')) {
      hush.leave();
      setLocation('/');
    }
  };

  if (hush.status === 'connecting') {
    return (
      <main className="hush-page connecting-screen">
        <section className="connecting-card" aria-live="polite" data-testid="status-connecting">
          <div className="pulse-mark"><AudioLines size={23} /></div>
          <p className="eyebrow">Opening a temporary room</p>
          <h1>Making space.</h1>
          <p>Connecting your device to the room. Your key and conversation stay in memory for this session.</p>
          {hush.error && <p className="form-error" role="alert">{hush.error}</p>}
          <button className="btn btn-quiet" onClick={() => { hush.leave(); setLocation('/'); }} data-testid="button-cancel-connecting">
            Cancel
          </button>
        </section>
      </main>
    );
  }

  if (!hush.me || hush.status !== 'joined') {
    return (
      <main className="hush-page connecting-screen">
        <section className="connecting-card" data-testid="status-room-unavailable">
          <div className="pulse-mark"><LockKeyhole size={22} /></div>
          <p className="eyebrow">No room open</p>
          <h1>This room is empty.</h1>
          <p>Room keys and conversation history are not kept between visits. Create a room or join with a key to begin.</p>
          <Link href="/" className="btn btn-primary" data-testid="link-return-home">Back to Hush <ArrowLeft size={15} /></Link>
        </section>
      </main>
    );
  }

  return (
    <main className="hush-page">
      <div className="room-shell">
        <header className="room-top">
          <div className="room-top-left">
            <Link href="/" className="brand-mark" aria-label="Hush home" data-testid="link-room-home"><AudioLines size={18} /></Link>
            <div className="room-heading">
              <strong>Private room</strong>
              <span className={`status-line${hush.reconnecting ? ' is-reconnecting' : ''}`} data-testid="status-room-connection">
                <i />{hush.reconnecting ? 'Reconnecting' : 'Connected'}
              </span>
            </div>
          </div>
          <div className="room-actions">
            <Link href="/privacy" className="btn btn-quiet" data-testid="link-room-privacy"><Shield size={15} /> Privacy</Link>
            <button className="btn btn-quiet" onClick={leave} data-testid="button-leave-room"><ArrowLeft size={15} /> Leave room</button>
          </div>
        </header>

        {hush.error && (
          <div className="error-banner" role="alert" data-testid="status-room-error">
            <span>{hush.error}</span>
            <button type="button" onClick={hush.clearError} aria-label="Dismiss error" data-testid="button-dismiss-error"><X size={16} /></button>
          </div>
        )}
        {notice && (
          <div className="error-banner" role="status" data-testid="status-room-notice">
            <span>{notice}</span>
            <button type="button" onClick={() => setNotice('')} aria-label="Dismiss message" data-testid="button-dismiss-notice"><X size={16} /></button>
          </div>
        )}

        <div className="room-grid">
          <section className="conversation" aria-label="Room conversation">
            <div className="conversation-head">
              <h1>Conversation</h1>
              <span>{hush.items.length} {hush.items.length === 1 ? 'item' : 'items'} · in memory</span>
            </div>
            <div className="message-list" ref={listRef} aria-live="polite" data-testid="list-messages">
              {hush.items.length === 0 ? (
                <div className="empty-thread">
                  <span className="empty-mark"><AudioLines size={22} /></span>
                  <h2>A quiet room, so far.</h2>
                  <p>Say hello, send a file, or start a call. Messages and files here are not saved as Hush history.</p>
                </div>
              ) : hush.items.map((item) => <MessageItem key={item.id} item={item} onSave={hush.save} />)}
            </div>
            <div className="composer-wrap">
              {hush.transfer !== null && (
                <div className="progress-track" role="progressbar" aria-label="File transfer progress" aria-valuenow={Math.round(hush.transfer * 100)} aria-valuemin={0} aria-valuemax={100} data-testid="status-file-transfer">
                  <span style={{ width: `${Math.max(4, Math.round(hush.transfer * 100))}%` }} />
                </div>
              )}
              <form className="composer" onSubmit={onSubmit}>
                <textarea
                  value={draft}
                  maxLength={4000}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="Write a message…"
                  aria-label="Write a message"
                  data-testid="input-message"
                />
                <div className="composer-tools">
                  <button className="btn btn-icon" type="button" onClick={() => void hush.pickFile()} aria-label="Attach a file" title="Attach a file (up to 20 MB)" data-testid="button-attach-file">
                    <File size={17} />
                  </button>
                  <button className="btn btn-primary btn-icon" type="submit" aria-label="Send message" disabled={!draft.trim()} data-testid="button-send-message">
                    <Send size={16} />
                  </button>
                </div>
              </form>
              <div className="composer-hint">
                <span>Enter to send · Shift + Enter for a new line</span>
                <span>{draft.length.toLocaleString()} / 4,000</span>
              </div>
            </div>
          </section>

          <aside className="side-column" aria-label="Room controls">
            <section className="side-card">
              <h2 className="side-title">People here <span className="peer-count">{connectedPeers.length + 1}</span></h2>
              <div className="peer-row" data-testid="peer-self">
                <span className="peer-avatar">{hush.me.username.slice(0, 2).toUpperCase()}</span>
                <span className="peer-name">{hush.me.username} <small>(you)</small></span><i className="peer-online" />
              </div>
              {connectedPeers.map((peer) => (
                <div className="peer-row" key={peer.id} data-testid={`peer-row-${peer.id}`}>
                  <span className="peer-avatar">{peer.username.slice(0, 2).toUpperCase()}</span>
                  <span className="peer-name">{peer.username}</span><i className="peer-online" />
                </div>
              ))}
              {connectedPeers.length === 0 && <p className="peer-waiting">Waiting for someone to join. Share the room key below.</p>}
            </section>

            <section className="side-card key-card">
              <h2 className="side-title">Room key <LockKeyhole size={14} /></h2>
              <div className="key-display" data-testid="display-room-key">
                <small>Anyone with this key can join</small>
                <div className="key-value" aria-label={keyVisible ? 'Room key revealed' : 'Room key hidden'}>
                  {keyVisible ? hush.me.key : '•'.repeat(hush.me.key.length)}
                </div>
              </div>
              <div className="key-tools">
                <button className="btn btn-quiet" onClick={() => setKeyVisible((visible) => !visible)} aria-label={keyVisible ? 'Hide room key' : 'Reveal room key'} data-testid="button-toggle-room-key">
                  {keyVisible ? <EyeOff size={14} /> : <Eye size={14} />}{keyVisible ? 'Hide' : 'Reveal'}
                </button>
                <button className="btn btn-quiet" onClick={() => void copyKey()} data-testid="button-copy-room-key"><Copy size={14} /> Copy key</button>
                <button className="btn btn-quiet" onClick={() => void shareKey()} data-testid="button-share-room-key"><Link2 size={14} /> Share</button>
              </div>
            </section>

            <CallPanel />
            {!hush.call && (
              <section className="side-card">
                <h2 className="side-title">Call someone</h2>
                <p className="call-state">{connectedPeers.length ? 'Start a private call with the room.' : 'A peer must join before you can call.'}</p>
                <div className="call-actions">
                  <button className="btn btn-quiet" onClick={() => hush.startCall(false)} disabled={!connectedPeers.length} data-testid="button-start-voice-call"><Phone size={15} /> Voice</button>
                  <button className="btn btn-quiet" onClick={() => hush.startCall(true)} disabled={!connectedPeers.length} data-testid="button-start-video-call"><Video size={15} /> Video</button>
                </div>
              </section>
            )}
            <section className="side-card privacy-card">
              <div className="privacy-mini"><Shield size={16} /><span>This room is temporary, not a promise of forensic erasure. Others can still copy or save what they receive.</span></div>
            </section>
          </aside>
        </div>
      </div>
      <FloatingVideoControls />
    </main>
  );
}
