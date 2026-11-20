import { useState } from 'react';
import { MessageItem } from '../../components/ui/message';
import { TerminalPanel } from '../../components/ui/panel';

const timestamp = Date.now();

export function MessageDemo() {
  const [saved, setSaved] = useState(false);
  return (
    <div className="space-y-5">
      <TerminalPanel title="MESSAGE STATES" className="space-y-5 p-5">
        <MessageItem
          author="Rin"
          timestamp={timestamp - 65000}
          content={{ kind: 'text', text: 'The room is open. I sent the key separately.' }}
        />
        <MessageItem
          author="You"
          timestamp={timestamp - 30000}
          own
          content={{ kind: 'text', text: 'Perfect. We can leave when we’re done.' }}
        />
        <MessageItem
          author="Rin"
          timestamp={timestamp}
          content={{ kind: 'file', name: 'meeting-notes.txt', size: 58240 }}
          onSave={() => setSaved(true)}
        />
        <MessageItem
          author="You"
          timestamp={timestamp}
          own
          content={{ kind: 'file', name: 'agenda.txt', size: 15360 }}
        />
      </TerminalPanel>
      {saved ? <p role="status" className="font-mono text-xs text-primary">File save action received.</p> : null}
      <p className="text-sm leading-relaxed text-muted-foreground">
        Incoming files expose a save action when a callback is supplied. Own sent files do not show that action.
      </p>
    </div>
  );
}
