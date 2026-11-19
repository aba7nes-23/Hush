export type EngineCommand =
  | { type: 'create'; username: string; forceRelay?: boolean }
  | { type: 'join'; username: string; key: string; forceRelay?: boolean }
  | { type: 'text'; text: string }
  | { type: 'file'; name: string; mime: string; base64: string }
  | { type: 'save'; id: string }
  | { type: 'call'; video: boolean }
  | { type: 'accept' }
  | { type: 'decline' }
  | { type: 'mute'; muted: boolean }
  | { type: 'camera'; enabled: boolean }
  | { type: 'endCall' }
  | { type: 'leave' };

export type EngineEvent = { type: string; [k: string]: unknown };

export type EngineProps = {
  url: string;
  origin: string;
  visible: boolean;
  onEvent: (e: EngineEvent) => void;
  registerPost: (post: ((c: EngineCommand) => void) | null) => void;
};

export function engineDomain() {
  const domain = process.env.EXPO_PUBLIC_DOMAIN ?? '';
  return { url: `https://${domain}/api/engine`, origin: `https://${domain}` };
}
