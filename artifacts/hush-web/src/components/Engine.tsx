import { useEffect, useRef } from 'react';
import type { EngineCommand, EngineEvent } from '@/context/types';

type EngineProps = {
  visible: boolean;
  onEvent: (event: EngineEvent) => void;
  registerPost: (post: ((command: EngineCommand) => void) | null) => void;
};

export default function Engine({ visible, onEvent, registerPost }: EngineProps) {
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  useEffect(() => {
    const origin = window.location.origin;
    registerPost((command) => frameRef.current?.contentWindow?.postMessage(command, origin));

    const listener = (event: MessageEvent<unknown>) => {
      if (event.origin !== origin || event.source !== frameRef.current?.contentWindow) return;
      let data = event.data;
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data) as unknown;
        } catch {
          return;
        }
      }
      if (data && typeof data === 'object' && 'type' in data && typeof data.type === 'string') {
        onEventRef.current(data as EngineEvent);
      }
    };

    window.addEventListener('message', listener);
    return () => {
      window.removeEventListener('message', listener);
      registerPost(null);
    };
  }, [registerPost]);

  return (
    <iframe
      ref={frameRef}
      src="/api/engine"
      title="Hush private calling engine"
      allow="camera; microphone; autoplay; clipboard-write"
      referrerPolicy="no-referrer"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      style={
        visible
          ? {
              position: 'fixed',
              inset: 0,
              width: '100%',
              height: '100%',
              border: 0,
              background: 'transparent',
              zIndex: 40,
            }
          : {
              position: 'fixed',
              left: 0,
              bottom: 0,
              width: 1,
              height: 1,
              border: 0,
              opacity: 0.01,
              pointerEvents: 'none',
              zIndex: -1,
            }
      }
    />
  );
}
