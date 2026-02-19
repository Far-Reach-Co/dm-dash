# Development

## Prerequisites

- Node.js `24.13.0` (`.nvmrc`)
- PostgreSQL
- Redis

## Setup

```bash
nvm use
npm install
cp .env.example .env
```

## Run

```bash
npm run dev
```

This runs:
1. TypeScript watch compile (`src/` -> `dist/`)
2. Rollup watch bundle (`public/views` -> `public/dist`)
3. Server restart loop (`node --watch --watch-path=dist dist/server.js`)

## Quality Checks

```bash
npm run check
```

Also available:

```bash
npm run lint
npm run typecheck
npm run test
```

## Build Commands

```bash
npm run build             # build server + tools TS
SERVER_ENV=prod npm run build:client
```
