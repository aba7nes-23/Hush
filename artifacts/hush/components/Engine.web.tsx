import React, { useEffect, useRef } from 'react';
import type { EngineCommand, EngineEvent, EngineProps } from '@/context/types';

export default function Engine({ url, origin, visible, onEvent, registerPost }: EngineProps) {
  const ref = useRef<HTMLIFrameElement | null>(null);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  useEffect(() => {
    registerPost((c: EngineCommand) => ref.current?.contentWindow?.postMessage(c, origin));
    const listener = (e: MessageEvent) => {
      if (e.origin !== origin) return;
      if (ref.current && e.source !== ref.current.contentWindow) return;
      let data: unknown = e.data;
      if (typeof data === 'string') {
        try { data = JSON.parse(data); } catch { return; }
      }
      if (data && typeof data === 'object' && typeof (data as EngineEvent).type === 'string') {
        onEventRef.current(data as EngineEvent);
      }
    };
    window.addEventListener('message', listener);
    return () => {
      window.removeEventListener('message', listener);
      registerPost(null);
    };
  }, [origin, registerPost]);

  const style: React.CSSProperties = visible
    ? { position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0, background: 'transparent' }
    : { position: 'absolute', left: 0, bottom: 0, width: 1, height: 1, border: 0, opacity: 0.01, pointerEvents: 'none' };

  return (
    <iframe
      ref={ref}
      src={url}
      title="Hush engine"
      allow="camera; microphone; autoplay; clipboard-write"
      referrerPolicy="no-referrer"
      style={style}
    />
  );
}
