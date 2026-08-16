# Ops Runbook

This folder contains remote operations scripts for dm-dash.

## Scripts

- `./ops/preflight.sh`: local/remote deployment readiness checks + release dry-run packaging
- `./ops/deploy.sh`: build locally, sync artifacts, install prod deps, restart services
- `DM_DASH_RESTART_SERVICES=0 ./ops/deploy.sh`: deploy artifacts without restarting services
- `DM_DASH_CREATE_RELEASE_ARCHIVE=0 ./ops/deploy.sh`: fastest deploy path (no rollback archive creation)
- `./ops/service.sh`: status/logs/restart/stop for web + backup + monthly-report + top10 timers/services
- `./ops/rollback.sh`: list release archives and roll back to a selected archive
- `./ops/cleanup_remote.sh`: remove legacy repo-era paths from remote server
- `./ops/caddy_sync.sh`: push and reload Caddy config
- `./ops/firewall_harden.sh`: apply UFW hardening defaults

## Deploy Troubleshooting

### 1. SSH/auth fails

- Verify host/user:
  - `echo "$DM_DASH_SERVER"`
- If key auth is required:
  - `export DM_DASH_SSH_KEY=/path/to/key`
- Test manually:
  - `ssh -i "$DM_DASH_SSH_KEY" "$DM_DASH_SERVER"`

### 2. Local build fails during deploy

Run build steps manually:

```bash
npm ci
npm run build
SERVER_ENV=prod npm run build:client
```

### 3. rsync fails

- Confirm `rsync` exists on local and remote.
- Check remote path permissions:
  - `ssh "$DM_DASH_SERVER" "mkdir -p /root/dm-dash && ls -ld /root/dm-dash"`
- Re-run deploy with explicit target:
  - `DM_DASH_REMOTE_DIR=/root/dm-dash ./ops/deploy.sh`

### 4. Remote `npm ci --omit=dev` fails

- Ensure remote node/npm paths are valid:
  - `DM_DASH_REMOTE_NPM_BIN=/root/.nvm/versions/node/v24.13.0/bin/npm`
- Ensure that same directory contains `node` (deploy prepends npm bin dir to `PATH`).
- Verify package files were synced:
  - `ssh "$DM_DASH_SERVER" "ls -l /root/dm-dash/package.json /root/dm-dash/package-lock.json"`

### 5. Service restart fails after deploy

Check status + logs:

```bash
./ops/service.sh status all
./ops/service.sh logs web
./ops/service.sh logs backup
./ops/service.sh logs report
./ops/service.sh logs top10
```

If units are stale:

```bash
ssh "$DM_DASH_SERVER" "systemctl daemon-reload && systemctl restart dm-dash.service dm-dash-backup.timer dm-dash-monthly-report.timer dm-dash-srd-popular-pages.timer"
```

## Service Troubleshooting

### Web service unhealthy

1. `./ops/service.sh status web`
2. `./ops/service.sh logs web`
3. Validate runtime files exist:
   - `ssh "$DM_DASH_SERVER" "ls -l /root/dm-dash/dist/server.js"`
4. Confirm env exists:
   - `ssh "$DM_DASH_SERVER" "ls -l /root/dm-dash/.env"`

### Backup timer/service not running

1. `./ops/service.sh status backup`
2. `./ops/service.sh logs backup`
3. Restart timer:
   - `./ops/service.sh restart backup`

## Common Recovery Commands

```bash
./ops/service.sh restart all
./ops/service.sh status all
./ops/preflight.sh
./ops/deploy.sh
```

### Healthcheck timer

`dm-dash-healthcheck.timer` runs every minute and calls `http://127.0.0.1:4000/healthz`.
After three failed attempts, it restarts `dm-dash.service`. This catches wedged Node
processes that are still running but no longer accepting HTTP responses.
