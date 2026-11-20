import { Mic, MicOff, Phone, PhoneOff, Video, VideoOff } from 'lucide-react';
import { Button } from './button';
import { TerminalPanel } from './panel';

type Action = () => void;

type CommonCall = {
  username?: string;
  video: boolean;
};

export type CallControlState =
  | (CommonCall & {
      state: 'incoming';
      onAccept: Action;
      onDecline: Action;
    })
  | (CommonCall & {
      state: 'calling';
      onCancel: Action;
    })
  | (CommonCall & {
      state: 'active';
      muted: boolean;
      cameraOn: boolean;
      onToggleMute: Action;
      onToggleCamera?: Action;
      onEnd: Action;
    })
  | {
      state: 'ended';
      username?: string;
      video?: boolean;
    };

function callLabel(call: CallControlState) {
  switch (call.state) {
    case 'incoming':
      return `${call.username || 'Someone'} is calling`;
    case 'calling':
      return `Calling ${call.username || 'room'}…`;
    case 'ended':
      return 'Call ended';
    case 'active':
      return `In a ${call.video ? 'video' : 'voice'} call${call.username ? ` with ${call.username}` : ''}`;
  }
}

export function CallControls({ call }: { call: CallControlState }) {
  return (
    <TerminalPanel variant="side" title={`CALL / ${call.state}`} aria-live="polite">
      <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{callLabel(call)}</p>
      {call.state === 'incoming' ? (
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={call.onAccept}><Phone size={15} aria-hidden="true" /> Accept</Button>
          <Button variant="quiet" onClick={call.onDecline}><PhoneOff size={15} aria-hidden="true" /> Decline</Button>
        </div>
      ) : null}
      {call.state === 'active' ? (
        <div className="grid grid-cols-2 gap-2">
          <Button variant="quiet" onClick={call.onToggleMute}>
            {call.muted ? <MicOff size={15} aria-hidden="true" /> : <Mic size={15} aria-hidden="true" />}
            {call.muted ? 'Unmute' : 'Mute'}
          </Button>
          {call.video && call.onToggleCamera ? (
            <Button variant="quiet" onClick={call.onToggleCamera}>
              {call.cameraOn ? <Video size={15} aria-hidden="true" /> : <VideoOff size={15} aria-hidden="true" />}
              {call.cameraOn ? 'Camera' : 'Camera off'}
            </Button>
          ) : null}
          <Button variant="destructive" onClick={call.onEnd}>
            <PhoneOff size={15} aria-hidden="true" /> End
          </Button>
        </div>
      ) : null}
      {call.state === 'calling' ? (
        <Button variant="destructive" onClick={call.onCancel}>
          <PhoneOff size={15} aria-hidden="true" /> Cancel call
        </Button>
      ) : null}
    </TerminalPanel>
  );
}

export function FloatingVideoControls({ call }: { call: CallControlState }) {
  if (!call.video || (call.state !== 'active' && call.state !== 'calling')) return null;

  return (
    <section
      className="fixed bottom-4 left-1/2 z-50 flex max-w-[calc(100vw-1.25rem)] -translate-x-1/2 items-center gap-2 rounded-[3px] border border-accent/50 bg-card/95 px-2 py-2 text-card-foreground shadow-[0_0_24px_color-mix(in_srgb,var(--color-primary)_12%,transparent),0_12px_42px_rgb(0_0_0_/_55%)] backdrop-blur sm:gap-2.5 sm:px-3.5"
      aria-label="Video call controls"
    >
      <span className="max-w-[22vw] truncate text-[11px] sm:max-w-[28vw] sm:text-xs">
        {call.state === 'calling'
          ? `Calling ${call.username || 'room'}…`
          : `Video call${call.username ? ` · ${call.username}` : ''}`}
      </span>
      {call.state === 'active' ? (
        <>
          <Button
            variant="quiet"
            size="icon"
            onClick={call.onToggleMute}
            aria-label={call.muted ? 'Unmute microphone' : 'Mute microphone'}
            title={call.muted ? 'Unmute microphone' : 'Mute microphone'}
          >
            {call.muted ? <MicOff size={16} aria-hidden="true" /> : <Mic size={16} aria-hidden="true" />}
          </Button>
          {call.onToggleCamera ? (
            <Button
              variant="quiet"
              size="icon"
              onClick={call.onToggleCamera}
              aria-label={call.cameraOn ? 'Turn camera off' : 'Turn camera on'}
              title={call.cameraOn ? 'Turn camera off' : 'Turn camera on'}
            >
              {call.cameraOn ? <Video size={16} aria-hidden="true" /> : <VideoOff size={16} aria-hidden="true" />}
            </Button>
          ) : null}
        </>
      ) : null}
      <Button
        variant="destructive"
        size="icon"
        onClick={call.state === 'calling' ? call.onCancel : call.onEnd}
        aria-label={call.state === 'calling' ? 'Cancel video call' : 'End video call'}
        title={call.state === 'calling' ? 'Cancel video call' : 'End video call'}
      >
        <PhoneOff size={16} aria-hidden="true" />
      </Button>
    </section>
  );
}
