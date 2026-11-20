---
name: Privacy disclosure row
description: Numbered disclosure text with a keep/limit emphasis.
---

# Privacy disclosure row

## Source evidence

- Source: `artifacts/hush-web/src/pages/privacy.tsx`, section records around lines 5–15 and rendered row around lines 35–41.
- Source styling: `artifacts/hush-web/src/index.css`, `.privacy-row` and children around lines 212–216 and arcade overrides around lines 575–589.
- Consumer: the Hush privacy page.
- Source behavior: sequential two-digit number, title, body, and `keep`/`limit` tone.
- Dependencies: none.
- Tests/stories: no source stories or component-specific tests found.

## Deferred porting contract

Chunk 2 only. Before implementation, reread the section data and JSX; keep the numbered layout and the source's cyan/yellow distinction for keep/limit categories.
