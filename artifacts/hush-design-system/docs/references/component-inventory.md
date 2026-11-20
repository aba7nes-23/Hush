# Hush web component inventory

## Source

- Source: existing Hush web artifact at `artifacts/hush-web/`.
- Source type: workspace app UI (`app-ui` references retained below).
- Product: account-free private rooms with temporary messages, files, and calls.
- Source license: workspace root declares MIT.
- Runtime: React 19, Vite, TypeScript, Tailwind CSS 4, and a handwritten global CSS theme.
- Font source: system monospace stack; no bundled or uploaded font files.
- Logo source: the app renders a text wordmark with a Lucide `AudioLines` icon; there is no standalone logo asset.
- Source guidance: no separate design guide or component stories were found. Visual rules below are extracted from recurring CSS and rendered screens.
- Reference intent: match the Hush website's UI and use the attached arcade video only as loose colour inspiration.
- Starter note: the generated shadcn files are scaffold boilerplate. Only components and visual primitives used by Hush are cataloged; unused scaffold families are excluded.

## Families

| Rank | Family | Reference | Dependencies / blockers | Importance evidence | Chunk | Status |
| ---: | --- | --- | --- | --- | --- | --- |
| 1 | Button | [button.md](components/button.md) | Native button/anchor semantics; no blocker | Shared action treatment appears on home and room screens | 1 | implemented |
| 2 | Form field | [form-field.md](components/form-field.md) | Native input and textarea semantics; no blocker | Name, room key, command, and message entry appear across two screens | 1 | implemented |
| 3 | Terminal panel | [terminal-panel.md](components/terminal-panel.md) | Native section container; no blocker | Repeated console, conversation, side-card, and connecting surfaces | 1 | implemented |
| 4 | Brand lockup | [brand-lockup.md](components/brand-lockup.md) | `lucide-react` `AudioLines`; no standalone logo file | Reused in home, room, and privacy navigation | 1 | implemented |
| 5 | Message item | [message-item.md](components/message-item.md) | `lucide-react` file/download icons; no blocker | Core room content; supports text and received-file states | 1 | implemented |
| 6 | Call controls | [call-controls.md](components/call-controls.md) | Source room state is replaced with explicit callbacks; no blocker | Voice/video controls and floating video actions | 2 | implemented |
| 7 | Feature module | [feature-module.md](components/feature-module.md) | Native article container; no blocker | Three feature summaries on the home screen | 2 | implemented |
| 8 | Privacy disclosure row | [privacy-disclosure-row.md](components/privacy-disclosure-row.md) | Native article container; no blocker | Numbered disclosure list on the privacy screen | 2 | implemented |

## Chunk plan

- Chunk 1 (pilot): Button, Form field, Terminal panel, Brand lockup, Message item.
- Chunk 2: Call controls, Feature module, Privacy disclosure row.

The source uses native elements with CSS classes for buttons, fields, and panels rather than a centralized component library. The package turns those repeated, source-evidenced patterns into reusable components while preserving native interaction behavior. Product-specific room orchestration stays in Hush.
