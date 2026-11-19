---
name: Hush privacy scope
description: User-defined platform and privacy boundaries that must survive later changes.
---
Hush is a native iOS and Android product, not a browser-only website. Core room participation must not require an account. Room keys, messages, and received file contents are ephemeral and must not be persisted as conversation history.

**Why:** The user explicitly selected native apps and described “a private room, not a permanent inbox,” “no account signup required,” and recipients' ability to save content as an honest limit.

**How to apply:** Do not add mandatory signup, saved room lists, analytics of conversation contents, automatic transcript storage, or a database-backed inbox. Explicit user-initiated file saving is outside the ephemeral guarantee and must be disclosed.
