---
name: Feature module
description: The three boxed value-proposition items on the Hush home screen.
---

# Feature module

## Source evidence

- Source: `artifacts/hush-web/src/pages/home.tsx`, feature articles around lines 237–249.
- Source styling: `artifacts/hush-web/src/index.css`, `.feature` and `.feature-icon` around lines 134–138, arcade surface around lines 510–529, and color-coded top accents around lines 670–692.
- Consumer: the Hush home screen.
- Source behavior: static icon, heading, and explanatory copy.
- Dependencies: `lucide-react` icons supplied by the consumer.
- Tests/stories: no source stories or component-specific tests found.

## Deferred porting contract

Chunk 2 only. Before implementation, reread the cited JSX and current terminal-theme CSS, then expose icon, title, and description as props without adding product-specific copy.
