# Deployment

## Strategy

Deploy is artifact-based. The server does not use `git checkout`/`git pull`.

Flow:
1. Build artifacts locally.
2. Stage deployable files.
3. `rsync` staged artifacts to server.
4. Run `npm ci --omit=dev` on server.
5. Install/update `systemd` units and restart services.

## Preflight

```bash
./ops/preflight.sh
```

## Command

```bash
./ops/deploy.sh
```

## Optional Environment Overrides

- `DM_DASH_SERVER` (default: `root@165.227.88.65`)
- `DM_DASH_REMOTE_DIR` (default: `/root/dm-dash`)
- `DM_DASH_SSH_KEY`
- `DM_DASH_REMOTE_NPM_BIN` (default: `/root/.nvm/versions/node/v24.13.0/bin/npm`)
- `DM_DASH_ALLOW_DIRTY` (default: `0`; require clean git tree)
- `DM_DASH_BUILD_LOCAL` (default: `1`; set `0` to skip local build)
- `DM_DASH_FORCE_DELETE` (default: `0`; enable `rsync --delete` on first artifact deploy)
- `DM_DASH_RUN_MIGRATIONS` (default: `0`; run `node-pg-migrate up` on remote)
- `DM_DASH_RESTART_SERVICES` (default: `1`; set `0` to skip service restarts)
- `DM_DASH_INSTALL_UNITS` (default: `1`; set `0` to skip copying systemd unit files)
- `DM_DASH_CREATE_RELEASE_ARCHIVE` (default: `1`; create rollback archive on remote after sync)
- `DM_DASH_SAVE_LOCAL_ARCHIVE` (default: `0`; optionally keep local archive in `.releases/`)
- `DM_DASH_RELEASE_ID` (optional explicit release identifier)

Example:

```bash
DM_DASH_SERVER=root@your-server-ip ./ops/deploy.sh
```

With migrations:

```bash
DM_DASH_RUN_MIGRATIONS=1 ./ops/deploy.sh
```

Deploy artifacts only (no service restart):

```bash
DM_DASH_RESTART_SERVICES=0 ./ops/deploy.sh
```

Fastest deploy path (skip remote archive generation):

```bash
DM_DASH_CREATE_RELEASE_ARCHIVE=0 ./ops/deploy.sh
```

## Artifact Contents

Artifacts are staged by `scripts/deploy/build_release.sh` and include:

- `dist/`
- `public/`
- `views/`
- `migrations/`
- `systemd/`
- `package.json`, `package-lock.json`
- `scripts/ops/run_with_env.sh`

The sync excludes and preserves remote:
- `.env`
- `private_frc_cloudfront_key.pem`
- `file_uploads/`

## Release Archives And Rollback

Each deploy produces a local archive in `.releases/` and uploads it to:

- `/root/dm-dash/releases/<archive>.tar.gz`

List remote archives:

```bash
./ops/rollback.sh
```

Rollback:

```bash
./ops/rollback.sh dm-dash-<release-id>.tar.gz
```
