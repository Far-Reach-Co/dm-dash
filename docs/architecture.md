# Architecture

This repo is still a monolith, but the main runtime surfaces are now organized around a few clear entrypoints. The goal of this doc is to make future refactors and test work easier to scope.

## App Boot Flow

1. `src/server.ts`
   Starts dotenv, socket setup, Redis adapter, and HTTP listen.
2. `src/setupApp.ts`
   Builds the Express app, middleware stack, sessions, logging, and route mounting.
3. Route mounts
   - `src/api/routes.ts`
   - `src/routes.ts`
   - `src/dnd/routes.ts`

## API Route Layout

`src/api/routes.ts` now acts as composition only. Feature routes live under `src/api/routes/`.

- `billingAdmin.ts`
  Stripe checkout/webhooks and affiliate admin endpoints.
- `discord.ts`
  Discord command lookup and interactions webhook.
- `assets.ts`
  Images, library, library packs, records, and record images.
- `tables.ts`
  Table folders, table views/templates, guest sandbox, location pins, and table images.
- `players.ts`
  Project-player links, player users, and player invites.
- `sheetsAndCalendars.ts`
  Character sheet endpoints plus calendar/month/day endpoints.
- `projects.ts`
  Projects, public wyrld flows, invites, discussion, and notifications.
- `auth.ts`
  Session/auth/user profile endpoints and frontend auth state.

Shared API middleware lives here:

- `src/api/rateLimiters.ts`
- `src/api/upload.ts`

## Frontend Entry Points

The main browser entry files are:

- `public/views/Table.js`
  VTT/table bootstrap and cross-component orchestration.
- `public/views/Library.js`
  Library screen bootstrap and state coordination.
- `public/views/InitSheet.js`
  Character sheet app bootstrap.
- `public/views/wyrld/index.js`
  Wyrld dashboard section mounting and global page actions.

Most reusable browser code lives in:

- `public/components/`
- `public/lib/`
- `public/views/table/`

## Next Organization Targets

These are the next cleanup targets before deep test work:

1. Extract service-layer helpers from large controllers with mixed auth, query, and response concerns.
2. Reduce the orchestration burden in `public/views/Table.js` and `public/views/Library.js`.
3. Centralize environment validation beyond `src/config.ts` so required runtime config is declared in one place.
4. Replace remaining ad hoc `console.*` logging with the shared logger or a consistent browser-side helper.
