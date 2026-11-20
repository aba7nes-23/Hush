import { TerminalPanel } from '../../components/ui/panel';

export function PanelDemo() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <TerminalPanel variant="console" title="HUSH / ROOM CONSOLE" className="min-h-48 p-5">
        <p className="pt-5 text-sm leading-relaxed text-muted-foreground">
          Scanline surface, clipped content, and terminal chrome for primary panels.
        </p>
      </TerminalPanel>
      <TerminalPanel variant="conversation" title="CONVERSATION" className="min-h-48 p-5">
        <p className="pt-5 text-sm leading-relaxed text-muted-foreground">
          A flexible column for long-lived or scrollable content.
        </p>
      </TerminalPanel>
      <TerminalPanel variant="side" title="ROOM STATUS">
        <p className="text-sm leading-relaxed text-muted-foreground">Compact companion card for supporting information.</p>
      </TerminalPanel>
      <TerminalPanel variant="connecting" title="CONNECTING">
        <p className="pt-5 text-sm leading-relaxed text-muted-foreground">Centered surface for a brief waiting state.</p>
      </TerminalPanel>
    </div>
  );
}
