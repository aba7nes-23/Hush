---
name: Message item
description: A room message or received-file row with author and time metadata.
---

# Message item

## Source evidence

- Source: `artifacts/hush-web/src/pages/room.tsx`, `MessageItem()` around lines 81–100 and its message type from `@/context/HushContext`.
- Source styling: `artifacts/hush-web/src/index.css`, `.message`, `.message-meta`, `.bubble`, and file rows around lines 160–172, with arcade variants around lines 533–550.
- Consumer: `Room()` maps the current in-memory room items to `MessageItem`.
- Source behavior: supports plain text and file attachments; own messages align to the right; recipients can save received files; an own sent file has no Save action.
- Dependencies: `lucide-react` `File` and `Download`; no room context is carried into the design system.
- Tests/stories: no source stories or component-specific tests found.

## Porting contract

Represent the item with explicit author, timestamp, ownership, text or attachment metadata, and an optional save callback. Preserve the source alignment, wrapping, metadata, file-size formatting, and received-file-only save action. Keep room state and persistence outside the component.
