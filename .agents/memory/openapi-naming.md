---
name: OpenAPI request naming
description: Avoiding generated Zod and TypeScript export collisions in Orval.
---
Use named component schemas for request objects instead of inline request-body objects.

**Why:** Orval can generate identically named request schema values and TypeScript types from inline bodies. Its automatic barrel export insertion recreates duplicate exports even after manually editing the barrel.

**How to apply:** Name the request object in OpenAPI components, reference it in the operation, and regenerate. Fix the input contract rather than repeatedly editing generated exports.
