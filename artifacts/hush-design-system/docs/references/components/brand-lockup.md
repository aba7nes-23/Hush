---
name: Brand lockup
description: The Hush text wordmark paired with its AudioLines mark.
---

# Brand lockup

## Source evidence

- Source: `artifacts/hush-web/src/pages/home.tsx`, `Brand()` around lines 6–13; room and privacy links use the same mark in `room.tsx` line 250 and `privacy.tsx` lines 29–31.
- Source styling: `artifacts/hush-web/src/index.css`, `.brand-mark`, `.brand`, and `.brand-word` around lines 88–95 and arcade overrides around lines 395–403.
- Source behavior: links back to the Hush home page.
- Asset finding: no standalone logo file was found. The project favicon is a generic orange placeholder and is not the Hush mark. Do not retain or present it as a logo.
- Dependencies: `lucide-react` `AudioLines`; consumers may choose the link destination.
- Tests/stories: no source stories or component-specific tests found.

## Porting contract

Port the source's actual wordmark and `AudioLines` icon combination; do not invent a separate logo asset. Keep a configurable link destination, a compact mark-only variant for constrained headers, and accessible link text.
