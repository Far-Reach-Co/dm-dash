# Far Reach Co. Core

Core app for Far Reach Co. (dashboard, VTT, character sheets, Discord integration).

## Docs

- Development: `docs/dev.md`
- Deployment: `docs/deploy.md`
- Operations: `docs/ops.md`
- Architecture: `docs/architecture.md`
- Tools: `docs/tools.md`

## Quick Start

1. Install Node from `.nvmrc` and install deps:
   ```bash
   nvm use
   npm install
   ```
2. Create env file:
   ```bash
   cp .env.example .env
   ```
3. Start local dev stack:
   ```bash
   npm run dev
   ```

## Repo Layout

```text
.
├── docs/               # Workflow docs
├── dist/               # Compiled TypeScript output (server + tools)
├── migrations/         # SQL migrations
├── ops/                # Deployment + remote operations scripts
├── public/             # Static assets and client bundles
├── scripts/            # Local helper scripts (dev/deploy/ops)
├── src/                # TypeScript source
├── systemd/            # systemd unit files
└── views/              # EJS templates
```
