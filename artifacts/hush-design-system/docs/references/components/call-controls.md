---
name: Call controls
description: In-room voice/video action panel and floating video controls.
---

# Call controls

## Source evidence

- Source: `artifacts/hush-web/src/pages/room.tsx`, `CallPanel()` lines 18–55 and `FloatingVideoControls()` lines 57–79.
- Source styling: `artifacts/hush-web/src/index.css`, call action and floating-control rules around lines 195–200 and 330–352, plus arcade overrides.
- Consumer: the Hush room screen.
- Source behavior: incoming call accept/decline, active-call mute/camera/end, calling cancel, and floating controls for video.
- Dependencies: callbacks and serializable call state replace the Hush context; uses `lucide-react` phone, microphone, and video icons.
- Tests/stories: no source stories or component-specific tests found.

## Deferred porting contract

Chunk 2 only. Before implementation, reread the cited source blocks and capture the full variant/state map. Keep call signaling and media state outside the visual component.
