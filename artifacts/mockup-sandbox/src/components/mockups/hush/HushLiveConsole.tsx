import { useState, type FormEvent } from "react";
import { Activity, ArrowDownRight, ArrowRight, ArrowUpRight, Check, ChevronRight, Command, Copy, KeyRound, LockKeyhole, Plus, Shield, Terminal, X } from "lucide-react";
import "./hushliveconsole.css";

type Flow = "create" | "join" | null;
type Entry = { text: string; kind: "system" | "command" | "success" | "hint" };
const COMMANDS = [
  { command: "new", label: "Create a room", detail: "Start a temporary private space", icon: Plus },
  { command: "join", label: "Join with a key", detail: "Enter an existing room key", icon: KeyRound },
  { command: "privacy", label: "Privacy notes", detail: "See what stays on this device", icon: Shield },
  { command: "help", label: "Show commands", detail: "Print the command guide", icon: Command },
];

export function HushLiveConsole() {
  const [command, setCommand] = useState("");
  const [flow, setFlow] = useState<Flow>(null);
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [entries, setEntries] = useState<Entry[]>([{ text: "Console ready. Choose a command or type help.", kind: "system" }]);
  const [copied, setCopied] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [roomReady, setRoomReady] = useState(false);

  const log = (text: string, kind: Entry["kind"] = "system") => setEntries((prev) => [...prev.slice(-3), { text, kind }]);
  const openFlow = (next: Exclude<Flow, null>) => {
    setFlow(next);
    log(next === "create" ? "$ new — choose a temporary room name." : "$ join — enter your name and room key.", "command");
  };
  const runCommand = (raw = command) => {
    const value = raw.trim().toLowerCase();
    setCommand("");
    if (!value) return;
    if (["new", "create", "start"].includes(value)) openFlow("create");
    else if (value === "join") openFlow("join");
    else if (value === "privacy") { setShowPrivacy(true); log("$ privacy — opening privacy notes.", "command"); }
    else if (value === "help" || value === "?") log("Available: new · join · privacy · clear", "hint");
    else if (value === "clear") setEntries([{ text: "Console cleared. Your session is unchanged.", kind: "system" }]);
    else log(`Unknown command: ${value}. Pick one below or type help.`, "hint");
  };
  const submitRoom = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim() || (flow === "join" && !key.trim())) return;
    setRoomReady(true);
    log(flow === "create" ? `Room prepared for ${name.trim()}. Invite someone with its private key.` : `Join request prepared for ${name.trim()}.`, "success");
    setFlow(null);
  };
  const copyKey = async () => {
    try { await navigator.clipboard.writeText("hush_••••••••••••••••"); } catch { /* Clipboard may be unavailable in embedded previews. */ }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };
  const status = roomReady ? "ROOM PREPARED" : "READY · LOCAL";

  return (
    <main className="hl-app">
      <div className="hl-shell">
        <header className="hl-header">
          <div className="hl-brand"><span className="hl-mark"><i /></span><span className="hl-wordmark">hush<span>://</span></span></div>
          <div className="hl-header-right"><span className="hl-local"><i /> DEVICE ONLY</span><button className="hl-privacy-btn" onClick={() => setShowPrivacy(true)}><Shield size={13} /> Privacy</button></div>
        </header>

        <section className="hl-intro">
          <div className="hl-kicker"><span /> PRIVATE BY DESIGN <b>CONSOLE / 02</b></div>
          <h1>Say less.<br /><em>Keep nothing.</em></h1>
          <p>Start a temporary room, or join one with a key. The console makes every next step visible.</p>
        </section>

        <section className="hl-console" aria-label="Hush live command console">
          <div className="hl-console-head">
            <div className="hl-window-dots"><i /><i /><i /></div>
            <span className="hl-terminal-label"><Terminal size={13} /> HUSH / LOCAL TERMINAL</span>
            <span className={`hl-live ${roomReady ? "is-ready" : ""}`}><i /><Activity size={11} />{status}</span>
          </div>
          <div className="hl-live-strip">
            <span className={`hl-pulse ${roomReady ? "is-ready" : ""}`} />
            <span className="hl-live-copy"><b>{roomReady ? "Room setup is ready" : "Console is listening"}</b><small>{roomReady ? "This is a local preview state; no remote room is connected." : "Commands are processed on this device. Nothing has been sent."}</small></span>
            <span className="hl-live-time">{roomReady ? "LOCAL" : "LIVE"}</span>
          </div>
          <div className="hl-output" aria-live="polite">
            {entries.map((entry, index) => <p key={`${index}-${entry.text}`} className={`hl-entry ${entry.kind} ${index === entries.length - 1 ? "current" : ""}`}><span>{entry.kind === "command" ? "$" : "›"}</span>{entry.text}</p>)}
          </div>
          <form className="hl-input" onSubmit={(event) => { event.preventDefault(); runCommand(); }}>
            <span>hush <b>$</b></span><input value={command} onChange={(event) => setCommand(event.target.value)} placeholder="enter command…" aria-label="Hush command" />
            <kbd>↵</kbd><button type="submit" aria-label="Run command"><ArrowUpRight size={17} /></button>
          </form>
          <div className="hl-console-foot"><LockKeyhole size={11} /> Local console <span>·</span> no command leaves this device</div>
        </section>

        <section className="hl-discovery">
          <div className="hl-discovery-head"><div><span className="hl-overline">COMMAND DIRECTORY</span><h2>Choose your next step</h2></div><span className="hl-command-count">04 COMMANDS</span></div>
          <div className="hl-command-list">
            {COMMANDS.map(({ command: cmd, label, detail, icon: Icon }) => (
              <button key={cmd} className="hl-command-row" onClick={() => cmd === "privacy" ? (setShowPrivacy(true), log("$ privacy — opening privacy notes.", "command")) : cmd === "help" ? runCommand(cmd) : openFlow(cmd === "new" ? "create" : "join")}>
                <span className="hl-command-icon"><Icon size={15} /></span><span className="hl-command-info"><b>{label}</b><small>{detail}</small></span><code>{cmd}</code><ArrowRight size={15} className="hl-row-arrow" />
              </button>
            ))}
          </div>
          <button className="hl-clear-link" onClick={() => runCommand("clear")}>clear console <span>↗</span></button>
        </section>

        {roomReady && <section className="hl-room-card">
          <span className="hl-room-symbol"><LockKeyhole size={15} /></span>
          <span className="hl-room-copy"><b>Room is prepared locally</b><small>Key sharing is not available in this preview.</small></span>
          <button onClick={copyKey}><Copy size={13} /> Copy key</button>
        </section>}

        <aside className="hl-privacy-note"><span className="hl-lock"><Shield size={14} /></span><span><b>Private by default.</b><small>Keys and messages live in memory on this device. Leave and your local copy is gone.</small></span><ChevronRight size={14} /></aside>
        <footer className="hl-footer"><span>HUSH / PRIVATE SESSION TOOL</span><span>NO ACCOUNT REQUIRED</span></footer>
      </div>

      {flow && <div className="hl-scrim" onMouseDown={(event) => { if (event.target === event.currentTarget) setFlow(null); }}>
        <form className="hl-modal" onSubmit={submitRoom}>
          <div className="hl-modal-top"><span>{flow === "create" ? "NEW SESSION" : "JOIN SESSION"}</span><button type="button" aria-label="Close" onClick={() => setFlow(null)}><X size={17} /></button></div>
          <h2>{flow === "create" ? "Create a room" : "Enter your key"}</h2>
          <p>{flow === "create" ? "Choose the temporary name people in this room will see." : "A room key is the only way in. Keep it somewhere safe."}</p>
          <label>YOUR TEMPORARY NAME<input autoFocus maxLength={24} value={name} onChange={(event) => setName(event.target.value)} placeholder="Name shown in this room" /></label>
          {flow === "join" && <label>PRIVATE ROOM KEY<input value={key} onChange={(event) => setKey(event.target.value)} placeholder="hush_…" /></label>}
          <div className="hl-relay"><LockKeyhole size={15} /><span><b>Preview setup only</b><small>No remote connection will be made.</small></span><i /></div>
          <button className="hl-submit" type="submit" disabled={!name.trim() || (flow === "join" && !key.trim())}>{flow === "create" ? "Prepare private room" : "Prepare to join"}<ArrowRight size={16} /></button>
        </form>
      </div>}

      {showPrivacy && <div className="hl-scrim" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowPrivacy(false); }}>
        <section className="hl-modal hl-privacy-modal">
          <div className="hl-modal-top"><span>PRIVACY NOTES</span><button aria-label="Close" onClick={() => setShowPrivacy(false)}><X size={17} /></button></div>
          <span className="hl-shield-large"><Shield size={21} /></span><h2>Small footprint.<br />Clear boundaries.</h2>
          <p>Hush keeps room keys and conversation history in memory on your device. Leaving a room clears your local copy. People you talk with may still retain theirs.</p>
          <div className="hl-privacy-list"><span><i /> No account or inbox</span><span><i /> Nothing saved by Hush</span><span><i /> Share room keys only with people you trust</span></div>
          <button className="hl-submit" onClick={() => setShowPrivacy(false)}>Got it <Check size={16} /></button>
        </section>
      </div>}
      {copied && <div className="hl-toast"><Check size={14} /> Preview key copied</div>}
    </main>
  );
}
