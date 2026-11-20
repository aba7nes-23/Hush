---
name: Terminal panel
description: The source's console, conversation, side-card, and connecting surfaces.
---

# Terminal panel

## Source evidence

- Source: `artifacts/hush-web/src/index.css`, `.console-card` line 107, `.conversation` line 151, `.side-card` line 182, `.connecting-card` line 204, and shared arcade-panel rules around lines 433–448.
- Consumers: `artifacts/hush-web/src/pages/home.tsx` (room console), `artifacts/hush-web/src/pages/room.tsx` (conversation and control cards), and `artifacts/hush-web/src/pages/privacy.tsx` (disclosure surfaces).
- Source API: native `<section>` containers with classes; no shared panel component exists.
- Source behavior: console and conversation surfaces clip internal content; room side cards and connecting surfaces accept their own content and sizing.
- Dependencies: no behavior dependency.
- Tests/stories: no source stories or component-specific tests found.

## Porting contract

Expose semantic panel variants rather than product-specific room content. Use the tokenized deep-navy card surface, crisp violet borders, subtle scanline treatment, and restrained cyan/magenta edge highlights. Let consumers control layout and panel height.
