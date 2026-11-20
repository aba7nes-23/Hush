---
name: Button
description: Shared Hush action styling for primary, quiet, danger, and icon-only controls.
---

# Button

## Source evidence

- Source: `artifacts/hush-web/src/index.css`, `.btn` and variants around lines 120–127, 306–310, 478–508, and 660–668.
- Consumers: `artifacts/hush-web/src/pages/home.tsx` (create, join, and command submit) and `artifacts/hush-web/src/pages/room.tsx` (leave, send, attach, key, and call actions).
- Source API: native `<button>` elements and styled links; no React Button wrapper exists in Hush.
- Source behavior: native disabled, submit, focus, and anchor behavior. Variants are `primary`, `quiet`, `danger`, and icon-only.
- Dependencies: no behavior dependency. The design-system wrapper may use `@radix-ui/react-slot` to preserve anchor/link composition.
- Tests/stories: no source stories or component-specific tests found.

## Porting contract

Expose native button props, `variant`, `size`, and an optional `asChild` slot. Keep keyboard/focus behavior native, preserve the Hush variants, and use generated theme variables for colors. The arcade-cyan primary action is the strongest emphasis; quiet actions use dark/lavender surfaces; destructive actions use coral-pink.
