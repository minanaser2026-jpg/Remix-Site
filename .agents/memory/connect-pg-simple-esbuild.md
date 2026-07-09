---
name: connect-pg-simple table.sql missing after esbuild bundle
description: express-session + connect-pg-simple silently fails to create its session table when the api-server is bundled with esbuild, breaking all logins.
---

`connect-pg-simple`'s `createTableIfMissing: true` reads a `table.sql` asset file at runtime via relative path. esbuild bundles server code into a single `dist/index.mjs` and does not copy that asset, so in this repo's bundled api-server (`node ./build.mjs` esbuild bundle), the table creation throws `ENOENT ... dist/table.sql` at first session write. The error is logged but does not crash the request — it just means the session is never persisted, so every login appears to succeed (200) but every subsequent authenticated request 401s.

**Why:** api-server here is built with esbuild (see `artifacts/api-server/build.mjs`), not run directly with ts-node/tsx, so any package that lazy-loads non-JS assets at runtime (SQL files, templates, locale data) can silently lose that asset in the bundle.

**How to apply:** When using `connect-pg-simple` (or similar asset-loading packages) in an esbuild-bundled Express server: create the `session` table manually via SQL up front (standard schema: `sid varchar PK`, `sess json`, `expire timestamp(6)`, plus an index on `expire`), and set `createTableIfMissing: false`. Don't rely on the package's auto-create path in a bundled build.
