#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/_common.sh"

echo "Deploying branch '$BRANCH' to $SERVER:$REMOTE_DIR ..."

"${SSH_CMD[@]}" \
  "REMOTE_DIR='$REMOTE_DIR' REMOTE_NODE_BIN='$REMOTE_NODE_BIN' REMOTE_NPM_BIN='$REMOTE_NPM_BIN' REPO_URL='$REPO_URL' BRANCH='$BRANCH' REMOTE_BUILD_TS='$REMOTE_BUILD_TS' bash -se" <<'REMOTE'
set -euo pipefail

if [[ ! -d "$REMOTE_DIR/.git" ]]; then
  echo "Remote checkout missing .git. Re-cloning..."
  BACKUP_DIR="${REMOTE_DIR}_backup_$(date +%Y%m%d%H%M%S)"
  if [[ -d "$REMOTE_DIR" ]]; then
    mv "$REMOTE_DIR" "$BACKUP_DIR"
  fi
  git clone --branch "$BRANCH" --single-branch "$REPO_URL" "$REMOTE_DIR"

  if [[ -f "$BACKUP_DIR/.env" ]]; then
    cp "$BACKUP_DIR/.env" "$REMOTE_DIR/.env"
  fi
  if [[ -f "$BACKUP_DIR/private_frc_cloudfront_key.pem" ]]; then
    cp "$BACKUP_DIR/private_frc_cloudfront_key.pem" "$REMOTE_DIR/private_frc_cloudfront_key.pem"
    chmod 600 "$REMOTE_DIR/private_frc_cloudfront_key.pem"
  fi
  if [[ -d "$BACKUP_DIR/file_uploads" ]]; then
    mkdir -p "$REMOTE_DIR/file_uploads"
    cp -a "$BACKUP_DIR/file_uploads/." "$REMOTE_DIR/file_uploads/"
  fi
fi

cd "$REMOTE_DIR"
git fetch origin
git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH"

export PATH="$(dirname "$REMOTE_NODE_BIN"):$PATH"

echo "Installing dependencies and building..."
"$REMOTE_NPM_BIN" ci
if [[ "$REMOTE_BUILD_TS" == "1" ]]; then
  NODE_OPTIONS=--max-old-space-size=768 "$REMOTE_NPM_BIN" run build
else
  echo "Skipping TypeScript build (REMOTE_BUILD_TS=$REMOTE_BUILD_TS)."
fi
SERVER_ENV=prod npx rollup --config rollup.config.mjs
"$REMOTE_NPM_BIN" prune --omit=dev
git restore --worktree --staged package-lock.json package.json 2>/dev/null || true

echo "Installing systemd units + restarting services..."
if [[ -f "$REMOTE_DIR/systemd/dm-dash.service" && -f "$REMOTE_DIR/systemd/dm-dash-backup.service" ]]; then
  cp "$REMOTE_DIR/systemd/dm-dash.service" /etc/systemd/system/dm-dash.service
  cp "$REMOTE_DIR/systemd/dm-dash-backup.service" /etc/systemd/system/dm-dash-backup.service
  systemctl daemon-reload
else
  echo "systemd unit files not found in repo; keeping currently installed units."
fi
systemctl enable dm-dash.service dm-dash-backup.service
systemctl restart dm-dash.service dm-dash-backup.service

echo "Service status:"
systemctl --no-pager --full status dm-dash.service | sed -n '1,24p'
systemctl --no-pager --full status dm-dash-backup.service | sed -n '1,24p'
REMOTE

echo "Deploy complete."
