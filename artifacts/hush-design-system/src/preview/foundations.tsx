import { BrandLockup } from '../components/ui/brand';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { MessageItem } from '../components/ui/message';
import { TerminalPanel } from '../components/ui/panel';
import { Guidelines } from './parts';

const CORE_COLORS = [
  { name: 'Primary', className: 'bg-primary text-primary-foreground' },
  { name: 'Secondary', className: 'bg-secondary text-secondary-foreground' },
  { name: 'Accent', className: 'bg-accent text-accent-foreground' },
] as const;

const SUPPORTING_COLORS = [
  { name: 'Background', className: 'bg-background text-foreground' },
  { name: 'Card', className: 'bg-card text-card-foreground' },
  { name: 'Muted', className: 'bg-muted text-muted-foreground' },
  { name: 'Destructive', className: 'bg-destructive text-destructive-foreground' },
  { name: 'Border', className: 'border border-border bg-background text-foreground' },
] as const;

const SPACING = [4, 8, 12, 16, 24];

function Swatch({ name, className }: { name: string; className: string }) {
  return (
    <div>
      <div className={`grid h-16 place-items-center rounded-[2px] border border-border p-2 text-xs font-semibold uppercase ${className}`}>
        {name}
      </div>
      <p className="mt-2 font-mono text-xs text-muted-foreground">{name}</p>
    </div>
  );
}

export function OverviewPage() {
  const now = Date.now();
  return (
    <div className="space-y-6">
      <TerminalPanel variant="console" title="HUSH / SYSTEM OVERVIEW" className="p-5 sm:p-6">
        <div className="space-y-6 pt-5">
          <section className="space-y-3">
            <h2 className="font-mono text-xs font-semibold uppercase tracking-[.12em] text-muted-foreground">
              Brand lockup
            </h2>
            <BrandLockup href="#overview" />
          </section>

          <section className="space-y-3">
            <h2 className="font-mono text-xs font-semibold uppercase tracking-[.12em] text-muted-foreground">
              Actions
            </h2>
            <div className="flex flex-wrap gap-2">
              <Button>Primary action</Button>
              <Button variant="quiet">Quiet action</Button>
              <Button variant="destructive">Danger</Button>
              <Button variant="outline" size="icon" aria-label="Icon button">+</Button>
            </div>
          </section>

          <section className="max-w-md space-y-2">
            <h2 className="font-mono text-xs font-semibold uppercase tracking-[.12em] text-muted-foreground">
              Form field
            </h2>
            <label htmlFor="hush-overview-field" className="font-mono text-xs uppercase tracking-wide text-primary">
              Temporary name
            </label>
            <Input id="hush-overview-field" placeholder="A name for this room" />
          </section>

          <section className="space-y-3">
            <h2 className="font-mono text-xs font-semibold uppercase tracking-[.12em] text-muted-foreground">
              Messages
            </h2>
            <div className="flex flex-col gap-4 rounded-[2px] border border-border bg-background/60 p-4">
              <MessageItem
                author="Nova"
                timestamp={now - 42000}
                content={{ kind: 'text', text: 'The room is open. Share the key with your people.' }}
              />
              <MessageItem
                author="Nova"
                timestamp={now}
                own
                content={{ kind: 'text', text: 'Got it. Nothing saved after we leave.' }}
              />
            </div>
          </section>
        </div>
      </TerminalPanel>

      <section className="grid gap-4 lg:grid-cols-2">
        <TerminalPanel title="COLOR SIGNALS" className="p-5">
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {CORE_COLORS.map((color) => <Swatch key={color.name} {...color} />)}
          </div>
        </TerminalPanel>
        <TerminalPanel title="TYPE SYSTEM" className="p-5">
          <div className="mt-5 space-y-3">
            <p className="font-mono text-3xl font-extrabold uppercase tracking-tight">Terminal Mono</p>
            <p className="font-mono text-sm leading-relaxed text-muted-foreground">
              A shared system stack keeps interface copy aligned with Hush’s terminal voice.
            </p>
            <p className="font-mono text-xs uppercase tracking-[.12em] text-primary">Short label / status</p>
          </div>
        </TerminalPanel>
      </section>
    </div>
  );
}

export function ColorsPage() {
  return (
    <div className="space-y-8">
      <TerminalPanel title="CORE PALETTE" className="p-5">
        <div className="grid grid-cols-2 gap-4 pt-5 sm:grid-cols-3">
          {CORE_COLORS.map((color) => <Swatch key={color.name} {...color} />)}
        </div>
      </TerminalPanel>
      <TerminalPanel title="SUPPORTING ROLES" className="p-5">
        <div className="grid grid-cols-2 gap-4 pt-5 sm:grid-cols-3 lg:grid-cols-5">
          {SUPPORTING_COLORS.map((color) => <Swatch key={color.name} {...color} />)}
        </div>
      </TerminalPanel>
      <TerminalPanel title="COLOR GUIDELINES" className="p-5">
        <div className="pt-5">
          <Guidelines items={[
            { kind: 'do', text: 'Use cyan for primary actions and visible focus states.' },
            { kind: 'do', text: 'Use magenta for expressive headline and message accents.' },
            { kind: 'do', text: 'Use yellow and lime for limit/warning and positive/connected states.' },
          ]} />
        </div>
      </TerminalPanel>
      <p className="text-xs leading-relaxed text-muted-foreground">
        Dark colors are mapped from Hush’s current website. Light colors are derived for this package because the source has no light theme.
      </p>
    </div>
  );
}

export function FontsPage() {
  return (
    <div className="space-y-5">
      <TerminalPanel title="SYSTEM MONOSPACE" className="p-5">
        <div className="space-y-5 pt-5">
          <p className="font-mono text-3xl font-extrabold uppercase tracking-tight sm:text-5xl">The quick brown fox</p>
          <p className="font-mono text-base leading-relaxed">
            Body copy stays in sentence case for longer reading. No custom font files were provided, so the system monospace stack is used.
          </p>
          <p className="font-mono text-xs uppercase tracking-[.12em] text-primary">LABEL / STATUS / COMMAND</p>
        </div>
      </TerminalPanel>
      <TerminalPanel title="TYPE GUIDELINES" className="p-5">
        <div className="pt-5">
          <Guidelines items={[
            { kind: 'do', text: 'Use monospace for interface text, headings, labels, and metadata.' },
            { kind: 'do', text: 'Use uppercase for brief labels; keep longer explanatory text in sentence case.' },
          ]} />
        </div>
      </TerminalPanel>
    </div>
  );
}

export function LayoutPage() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <TerminalPanel title="SPACING SCALE" className="p-5">
        <div className="space-y-4 pt-5">
          {SPACING.map((size) => (
            <div key={size} className="flex items-center gap-4">
              <span className="w-8 font-mono text-xs text-muted-foreground">{size}</span>
              <div className="h-3 rounded-[1px] bg-primary" style={{ width: size * 4 }} />
            </div>
          ))}
        </div>
      </TerminalPanel>
      <TerminalPanel title="SURFACES & CORNERS" className="p-5">
        <div className="grid grid-cols-2 gap-3 pt-5">
          <div className="grid h-24 place-items-center border border-border bg-card text-xs uppercase">Square panel</div>
          <div className="grid h-24 place-items-center rounded-[2px] border border-accent bg-secondary text-xs uppercase">2px control</div>
          <div className="col-span-2 rounded-[2px] border border-primary bg-card p-4 font-mono text-xs text-muted-foreground">
            Keep panel borders crisp. Reserve glow and scanlines for large surfaces or short accents.
          </div>
        </div>
      </TerminalPanel>
      <TerminalPanel title="COMPOSITION GUIDELINES" className="p-5 lg:col-span-2">
        <div className="pt-5">
          <Guidelines items={[
            { kind: 'do', text: 'Keep controls and panels squared with compact borders.' },
            { kind: 'do', text: 'Use bright colors for short accents; keep long copy on calm, high-contrast surfaces.' },
          ]} />
        </div>
      </TerminalPanel>
    </div>
  );
}
