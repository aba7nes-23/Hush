---
name: Form field
description: Hush's labeled text entry and message composition treatments.
---

# Form field

## Source evidence

- Source: `artifacts/hush-web/src/index.css`, `.field-label` and `.field` around lines 114–118, `.composer textarea` around lines 177–178, and terminal-theme overrides around lines 463–477.
- Consumers: `artifacts/hush-web/src/pages/home.tsx` (temporary name, room key, and command) and `artifacts/hush-web/src/pages/room.tsx` (message composer).
- Source API: native `<input>` and `<textarea>` elements; no shared React field wrapper exists.
- Source behavior: native controlled values, autocomplete disabled on temporary fields, Enter submits the room key or command, and the message textarea allows Shift+Enter for a newline.
- Dependencies: no behavior dependency.
- Tests/stories: no source stories or component-specific tests found.

## Porting contract

Expose the native input attributes and a separate textarea with the same shared visual treatment. Keep visible keyboard focus, clear placeholders, compact squared borders, cyan focus, and a monospace type stack. Labels remain separate and use small uppercase terminal text; preserve native input behavior.
