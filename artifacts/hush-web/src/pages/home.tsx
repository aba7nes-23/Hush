import { useEffect, useState, type FormEvent } from 'react';
import { Link, useLocation } from 'wouter';
import { ArrowRight, AudioLines, Command, LockKeyhole, Radio, Shield, Sparkles } from 'lucide-react';
import { useHush } from '@/context/HushContext';
import { trackEvent } from '@/lib/analytics';

function Brand() {
  return (
    <Link href="/" className="brand" aria-label="Hush home" data-testid="link-home-brand">
      <span className="brand-mark"><AudioLines size={19} aria-hidden="true" /></span>
      <span className="brand-word">hush</span>
    </Link>
  );
}

export default function Home() {
  const hush = useHush();
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState('');
  const [roomKey, setRoomKey] = useState('');
  const [consoleInput, setConsoleInput] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    document.title = 'Hush — a room that leaves no trace';
    const description = document.querySelector('meta[name="description"]');
    description?.setAttribute('content', 'A temporary, account-free private room for conversation, file sharing and calls.');
  }, []);

  useEffect(() => {
    if (hush.status === 'joined') setLocation('/room');
  }, [hush.status, setLocation]);

  const validateName = (action: 'create' | 'join') => {
    const clean = username.trim();
    if (!clean) {
      trackEvent(`room_${action}_failed`, { reason: 'missing_name' });
      setMessage('Choose a temporary name to continue.');
      return null;
    }
    if (clean.length > 24) {
      trackEvent(`room_${action}_failed`, { reason: 'invalid_name' });
      setMessage('Names can be up to 24 characters.');
      return null;
    }
    setMessage('');
    return clean;
  };

  const createRoom = (nameOverride?: string) => {
    trackEvent('room_create_attempted');
    const clean = nameOverride?.trim() || validateName('create');
    if (!clean) return;
    if (clean.length > 24) {
      trackEvent('room_create_failed', { reason: 'invalid_name' });
      setMessage('Names can be up to 24 characters.');
      return;
    }
    setUsername(clean);
    setMessage('');
    hush.create(clean);
  };

  const joinRoom = (keyOverride?: string, nameOverride?: string) => {
    trackEvent('room_join_attempted');
    const cleanName = nameOverride?.trim() || validateName('join');
    const key = (keyOverride ?? roomKey).trim();
    if (!cleanName) return;
    if (!/^hush_[A-Za-z0-9_-]{43}$/.test(key)) {
      trackEvent('room_join_failed', { reason: 'invalid_key_format' });
      setMessage('Enter the full room key: hush_ followed by 43 characters.');
      return;
    }
    setMessage('');
    hush.join(cleanName, key);
  };

  const runConsole = (event: FormEvent) => {
    event.preventDefault();
    const input = consoleInput.trim();
    const [rawCommand = '', ...args] = input.split(/\s+/);
    const command = rawCommand.replace(/^\/+/, '').toLowerCase();
    if (command === 'help' || command === '?') {
      setMessage('Commands: new, join, privacy, relay on/off, clear, cancel, status, help.');
    } else if (command === 'privacy') {
      setLocation('/privacy');
    } else if (command === 'relay') {
      if (args[0] === 'on' || args[0] === 'off') {
        const enabled = args[0] === 'on';
        hush.setForceRelay(enabled);
        setMessage(enabled ? 'Relay-only routing is on.' : 'Relay-only routing is off.');
      } else {
        setMessage('Use relay on or relay off.');
      }
    } else if (command === 'create' || command === 'new' || command === 'start') {
      createRoom(args.join(' ') || undefined);
    } else if (command === 'join') {
      if (args.length >= 2) {
        joinRoom(args[args.length - 1], args.slice(0, -1).join(' '));
      } else if (args.length === 1) {
        setMessage('Usage: join name room-key.');
      } else {
        joinRoom();
      }
    } else if (command === 'clear') {
      setMessage('');
    } else if (command === 'cancel' || command === 'exit') {
      setUsername('');
      setRoomKey('');
      setMessage('');
      hush.clearError();
    } else if (command === 'status') {
      setMessage(`Engine ${hush.engineReady ? 'ready' : 'starting'} · ${
        hush.relayAvailable === null ? 'relay status unknown' : hush.relayAvailable ? 'relay available' : 'relay unavailable'
      }`);
    } else {
      setMessage('Unknown command. Type help to see the available options.');
    }
    setConsoleInput('');
  };

  const isConnecting = hush.status === 'connecting';
  return (
    <main className="hush-page">
      <header className="site-header">
        <Brand />
        <nav className="nav-links" aria-label="Main navigation">
          <a href="#how-it-works" data-testid="link-how-it-works">How it works</a>
          <Link href="/privacy" className="nav-privacy" data-testid="link-privacy">
            <Shield size={15} aria-hidden="true" /> Privacy
          </Link>
        </nav>
      </header>

      <div className="landing">
        <section className="hero-grid" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow">Private by the moment</p>
            <h1 className="hero-title" id="hero-title">Talk here.<br /><em>Leave nothing.</em></h1>
            <p className="hero-lede">
              A room for the conversation you want to have now. No account, no saved inbox, no history waiting for you later.
            </p>
            <div className="hero-note"><span className="dot" /> No sign-up. Your name and room exist only while you do.</div>
          </div>

          <section className="console-card" aria-label="Create or join a private room">
            <div className="console-head">
              <div className="console-dots" aria-hidden="true"><i /><i /><i /></div>
              <span className="console-label">HUSH / ROOM CONSOLE</span>
              <Command size={15} color="#83938b" aria-hidden="true" />
            </div>
            <div className="console-body">
              <p className="console-intro">Start a new room and share its key, or join someone who has already made one.</p>
              <label className="field-label" htmlFor="username">Your temporary name</label>
              <div className="field-block">
                <input
                  id="username"
                  className="field"
                  value={username}
                  maxLength={24}
                  placeholder="A name for this room"
                  autoComplete="off"
                  onChange={(event) => setUsername(event.target.value)}
                  data-testid="input-username"
                />
              </div>

              <label className="relay-toggle">
                <input
                  type="checkbox"
                  checked={hush.forceRelay}
                  onChange={(event) => hush.setForceRelay(event.target.checked)}
                  data-testid="toggle-relay-only"
                />
                <span><strong>Hide my IP from peers</strong>Route through a relay instead of connecting directly.</span>
              </label>

              {(message || hush.error) && (
                <div className="form-error" role="alert" data-testid="status-home-error">
                  {hush.error || message}
                </div>
              )}
              <button
                className="btn btn-primary"
                type="button"
                onClick={() => createRoom()}
                disabled={isConnecting}
                data-testid="button-create-room"
              >
                {isConnecting ? 'Opening your room…' : 'Create a new room'} <ArrowRight size={16} />
              </button>

              <div className="join-block">
                <label className="field-label" htmlFor="room-key">Have a room key?</label>
                <div className="button-row">
                  <input
                    id="room-key"
                    className="field mono"
                    value={roomKey}
                   maxLength={48}
                    placeholder="hush_…"
                    autoComplete="off"
                    onChange={(event) => setRoomKey(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') joinRoom();
                    }}
                    data-testid="input-room-key"
                  />
                  <button
                    className="btn btn-quiet"
                    type="button"
                    onClick={() => joinRoom()}
                    disabled={isConnecting}
                    data-testid="button-join-room"
                  >
                    Join <ArrowRight size={15} />
                  </button>
                </div>
              </div>

              <form className="join-block" onSubmit={runConsole} aria-label="Command console">
                <label className="field-label" htmlFor="console-command">Command console</label>
                <div className="button-row">
                  <input
                    id="console-command"
                    className="field mono"
                    value={consoleInput}
                    placeholder="/help"
                    onChange={(event) => setConsoleInput(event.target.value)}
                    data-testid="input-command-console"
                  />
                  <button className="btn btn-icon" type="submit" aria-label="Run command" data-testid="button-run-command">
                    <ArrowRight size={17} />
                  </button>
                </div>
                <p className="console-intro" style={{ margin: '9px 0 0', fontSize: 11 }}>
                  /create name · /join name key · /relay on · /privacy
                </p>
              </form>
            </div>
          </section>
        </section>

        <section className="feature-strip" id="how-it-works" aria-label="Hush essentials">
          <article className="feature">
            <span className="feature-icon"><LockKeyhole size={17} /></span>
            <div><h3>Only the people invited</h3><p>Share a one-time room key directly with the people you mean to reach.</p></div>
          </article>
          <article className="feature">
            <span className="feature-icon"><Radio size={17} /></span>
            <div><h3>Direct when it can be</h3><p>Encrypted peer-to-peer messages, file sharing, and voice or video calls.</p></div>
          </article>
          <article className="feature">
            <span className="feature-icon"><Sparkles size={17} /></span>
            <div><h3>Temporary by design</h3><p>Room content lives in memory. Leave or restart, and Hush clears its local history.</p></div>
          </article>
        </section>
        <footer className="landing-foot">
          <span>HUSH — A SMALL ROOM, FOR A LITTLE WHILE.</span>
          <span>Nothing saved here is a promise about what others keep.</span>
        </footer>
      </div>
    </main>
  );
}
