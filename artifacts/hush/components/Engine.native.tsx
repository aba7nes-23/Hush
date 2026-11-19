import React, { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { WebView as RNWebView, WebViewMessageEvent } from 'react-native-webview';

// Library class typings conflict with current React types; narrow to a usable component type.
const WebView = RNWebView as unknown as React.ComponentType<Record<string, unknown> & { ref?: React.Ref<RNWebView> }>;
import type { EngineCommand, EngineEvent, EngineProps } from '@/context/types';

export default function Engine({ url, origin, visible, onEvent, registerPost }: EngineProps) {
  const ref = useRef<RNWebView>(null);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  useEffect(() => {
    registerPost((c: EngineCommand) => ref.current?.postMessage(JSON.stringify(c)));
    return () => registerPost(null);
  }, [registerPost]);

  const handle = (e: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(e.nativeEvent.data) as EngineEvent;
      if (data && typeof data.type === 'string') onEventRef.current(data);
    } catch {
      // ignore malformed frames; never log payloads
    }
  };

  return (
    <WebView
      ref={ref}
      source={{ uri: url }}
      style={visible ? styles.visible : styles.hidden}
      containerStyle={visible ? StyleSheet.absoluteFill : styles.hidden}
      pointerEvents={visible ? 'auto' : 'none'}
      onMessage={handle}
      originWhitelist={[origin]}
      onShouldStartLoadWithRequest={(request: { url: string }) => request.url === url || request.url === 'about:blank'}
      javaScriptEnabled
      incognito
      cacheEnabled={false}
      allowsInlineMediaPlayback
      mediaPlaybackRequiresUserAction={false}
      mediaCapturePermissionGrantType="prompt"
      setSupportMultipleWindows={false}
      onContentProcessDidTerminate={() => { onEventRef.current({ type: 'left' }); ref.current?.reload(); }}
      onError={() => onEventRef.current({ type: 'error', message: 'The private engine could not load. Check your connection.' })}
    />
  );
}

const styles = StyleSheet.create({
  visible: { flex: 1, backgroundColor: 'transparent' },
  hidden: { position: 'absolute', left: 0, bottom: 0, width: 1, height: 1, opacity: 0.01 },
});
