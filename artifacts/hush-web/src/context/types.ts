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

export type EngineEvent = { type: string; [key: string]: unknown };
