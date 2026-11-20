import { useState } from 'react';
import { Button } from '../../components/ui/button';
import {
  CallControls,
  FloatingVideoControls,
  type CallControlState,
} from '../../components/ui/call-controls';

type Stage = CallControlState['state'];
type Mode = 'voice' | 'video';

export function CallControlsDemo() {
  const [stage, setStage] = useState<Stage>('incoming');
  const [mode, setMode] = useState<Mode>('video');
  const [muted, setMuted] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [lastAction, setLastAction] = useState('No action yet.');
  const video = mode === 'video';

  let call: CallControlState;
  if (stage === 'incoming') {
    call = {
      state: 'incoming',
      username: 'Rin',
      video,
      onAccept: () => {
        setLastAction('Incoming call accepted.');
        setStage('active');
      },
      onDecline: () => {
        setLastAction('Incoming call declined.');
        setStage('ended');
      },
    };
  } else if (stage === 'calling') {
    call = {
      state: 'calling',
      username: 'Rin',
      video,
      onCancel: () => {
        setLastAction('Outgoing call cancelled.');
        setStage('ended');
      },
    };
  } else if (stage === 'active') {
    call = {
      state: 'active',
      username: 'Rin',
      video,
      muted,
      cameraOn,
      onToggleMute: () => {
        setMuted((value) => !value);
        setLastAction(muted ? 'Microphone unmuted.' : 'Microphone muted.');
      },
      ...(video
        ? {
            onToggleCamera: () => {
              setCameraOn((value) => !value);
              setLastAction(cameraOn ? 'Camera turned off.' : 'Camera turned on.');
            },
          }
        : {}),
      onEnd: () => {
        setLastAction('Call ended.');
        setStage('ended');
      },
    };
  } else {
    call = { state: 'ended', username: 'Rin', video };
  }

  return (
    <div className="space-y-5">
      <section className="space-y-3">
        <h2 className="font-mono text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Preview state
        </h2>
        <div className="flex flex-wrap gap-2">
          {(['incoming', 'calling', 'active', 'ended'] as const).map((value) => (
            <Button
              key={value}
              size="sm"
              variant={stage === value ? 'default' : 'quiet'}
              aria-pressed={stage === value}
              onClick={() => setStage(value)}
            >
              {value}
            </Button>
          ))}
          <span className="mx-1 hidden h-8 border-l border-border sm:block" aria-hidden="true" />
          {(['voice', 'video'] as const).map((value) => (
            <Button
              key={value}
              size="sm"
              variant={mode === value ? 'outline' : 'ghost'}
              aria-pressed={mode === value}
              onClick={() => setMode(value)}
            >
              {value} call
            </Button>
          ))}
        </div>
      </section>

      <div className="max-w-md">
        <CallControls call={call} />
      </div>
      <p role="status" className="font-mono text-xs text-muted-foreground">{lastAction}</p>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Call signaling and microphone/camera state are supplied by the consumer. These controls only render callbacks and state.
      </p>
      <FloatingVideoControls call={call} />
    </div>
  );
}
