import { useState, type FormEvent } from "react";
import { ArrowDownRight, ArrowRight, ArrowUpRight, Check, ChevronRight, Command, Copy, LockKeyhole, Plus, Shield, Terminal, X } from "lucide-react";
import "./hushrefined.css";

type Flow = "create" | "join" | null;

export function HushRefined() {
  const [command, setCommand] = useState("");
  const [flow, setFlow] = useState<Flow>(null);
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [lines, setLines] = useState(["Private session console. Type help to see commands."]);
  const [copied, setCopied] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [joined, setJoined] = useState(false);

  const log = (message: string) => setLines((prev) => [...prev.slice(-2), message]);
  const runCommand = (raw = command) => {
    const value = raw.trim().toLowerCase();
    setCommand("");
    if (!value) return;
    if (["new", "create", "start"].includes(value)) {
      setFlow("create");
      log("$ new — choose a temporary name for your room.");
    } else if (value === "join") {
      setFlow("join");
      log("$ join — enter your name and room key.");
    } else if (value === "privacy") {
      setShowPrivacy(true);
      log("$ privacy — opening privacy notes.");
    } else if (value === "help" || value === "?") {
      log("Commands: new · join · privacy · clear");
    } else if (value === "clear") {
      setLines(["Console cleared. Type help for commands."]);
    } else {
      log(`Command not found: ${value}. Type help to see options.`);
    }
  };
  const submitRoom = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim() || (flow === "join" && !key.trim())) return;
    setJoined(true);
    log(flow === "create" ? `Room ready for ${name.trim()}. Share its key privately.` : `Looking for a room for ${name.trim()}…`);
    setFlow(null);
  };
  const copyKey = async () => {
    try {
      await navigator.clipboard.writeText("hush_•••••••••••••••••••••••••••••••••••••••••••");
    } catch {
      // Clipboard may be unavailable in an embedded preview.
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <main className="hush-app">
      <div className="hush-shell">
        <header className="hush-header">
          <div className="hush-brand">
            <span className="hush-mark"><i /></span>
            <span className="hush-wordmark">hush<span>://</span></span>
          </div>
          <button className="privacy-button" onClick={() => setShowPrivacy(true)} aria-label="Privacy notes">
            <Shield size={14} strokeWidth={1.8} /><span>Privacy</span>
          </button>
        </header>

        <section className="hush-intro">
          <div className="hush-kicker"><span className="kicker-line" /> PRIVATE BY DESIGN <span className="hush-version">01 / 03</span></div>
          <h1>Talk here.<br /><em>Leave nothing behind.</em></h1>
          <p>Temporary rooms for conversations that belong to the moment. No accounts. No inbox. No saved history.</p>
        </section>

        <section className="console-card" aria-label="Hush command console">
          <div className="console-top">
            <div className="console-lamps"><b /><b /><b /></div>
            <span className="console-label"><Terminal size={13} /> LOCAL CONSOLE</span>
            <span className="engine-status"><i /> {joined ? "ROOM READY" : "ENGINE READY"}</span>
          </div>
          <div className="console-output">
            {lines.map((line, index) => (
              <p key={`${index}-${line}`} className={index === lines.length - 1 ? "active-line" : ""}>
                <span className="console-prompt">{index === 0 ? ">" : "$"}</span>{line}
              </p>
            ))}
          </div>
          <form className="console-input" onSubmit={(event) => { event.preventDefault(); runCommand(); }}>
            <span className="input-prefix">hush <b>$</b></span>
            <input value={command} onChange={(event) => setCommand(event.target.value)} placeholder="type a command…" aria-label="Hush command" />
            <button type="submit" aria-label="Run command"><ArrowUpRight size={17} /></button>
          </form>
          <div className="console-foot"><Command size={11} /> Commands run on this device only</div>
        </section>

        <section className="start-section">
          <div className="section-heading"><span>START A CONVERSATION</span><span className="section-rule" /></div>
          <button className="action-row primary-action" onClick={() => { setFlow("create"); log("$ new — choose a temporary name for your room."); }}>
            <span className="action-icon"><Plus size={18} /></span>
            <span className="action-copy"><b>Create a new room</b><small>Make a private space, then invite someone</small></span>
            <ArrowRight size={17} className="action-arrow" />
          </button>
          <button className="action-row" onClick={() => { setFlow("join"); log("$ join — enter your name and room key."); }}>
            <span className="action-icon join-icon"><ArrowDownRight size={17} /></span>
            <span className="action-copy"><b>Join with a room key</b><small>Already have a private key?</small></span>
            <ArrowRight size={17} className="action-arrow" />
          </button>
        </section>

        <aside className="privacy-note">
          <span className="lock-emblem"><LockKeyhole size={15} /></span>
          <span><b>Your room stays yours.</b><small>Keys and messages live in memory on this device. Leave and your copy is gone.</small></span>
          <ChevronRight size={15} className="note-chevron" />
        </aside>
        <footer className="hush-footer"><span>HUSH / PRIVATE SESSION TOOL</span><span>NO ACCOUNT REQUIRED</span></footer>
      </div>

      {flow && <div className="modal-scrim" onMouseDown={(event) => { if (event.target === event.currentTarget) setFlow(null); }}>
        <form className="setup-modal" onSubmit={submitRoom}>
          <div className="modal-topline"><span>{flow === "create" ? "NEW SESSION" : "JOIN SESSION"}</span><button type="button" aria-label="Close" onClick={() => setFlow(null)}><X size={17} /></button></div>
          <h2>{flow === "create" ? "Create a room" : "Enter your key"}</h2>
          <p className="modal-description">{flow === "create" ? "Choose the name people in this room will see." : "A room key is the only way in. Keep it somewhere safe."}</p>
          <label>YOUR TEMPORARY NAME<input autoFocus maxLength={24} value={name} onChange={(event) => setName(event.target.value)} placeholder="Name shown in this room" /></label>
          {flow === "join" && <label>PRIVATE ROOM KEY<input value={key} onChange={(event) => setKey(event.target.value)} placeholder="hush_…" /></label>}
          <div className="relay-note"><LockKeyhole size={15} /><span><b>Private by default</b><small>Your connection is protected for this session.</small></span><i /></div>
          <button className="submit-room" type="submit" disabled={!name.trim() || (flow === "join" && !key.trim())}>{flow === "create" ? "Create private room" : "Join private room"}<ArrowRight size={16} /></button>
        </form>
      </div>}

      {showPrivacy && <div className="modal-scrim" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowPrivacy(false); }}>
        <section className="setup-modal privacy-modal">
          <div className="modal-topline"><span>PRIVACY NOTES</span><button aria-label="Close" onClick={() => setShowPrivacy(false)}><X size={17} /></button></div>
          <span className="privacy-large"><Shield size={21} /></span>
          <h2>Small footprint.<br />Clear boundaries.</h2>
          <p className="modal-description">Hush keeps room keys and conversation history in memory on your device. Leaving a room clears your local copy. People you talk with may still retain theirs.</p>
          <div className="privacy-list"><span><i /> No account or inbox</span><span><i /> Nothing saved by Hush</span><span><i /> Share room keys only with people you trust</span></div>
          <button className="submit-room" onClick={() => setShowPrivacy(false)}>Got it <Check size={16} /></button>
        </section>
      </div>}

      {copied && <div className="copy-toast"><Copy size={14} /> Room key copied</div>}
    </main>
  );
}
