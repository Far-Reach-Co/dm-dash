#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/_common.sh"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
STAGING_DIR="$(mktemp -d)"
trap 'rm -rf "$STAGING_DIR"' EXIT
RELEASES_DIR="$REPO_ROOT/.releases"
mkdir -p "$RELEASES_DIR"

ALLOW_DIRTY="${DM_DASH_ALLOW_DIRTY:-0}"
FORCE_DELETE="${DM_DASH_FORCE_DELETE:-0}"
RUN_MIGRATIONS="${DM_DASH_RUN_MIGRATIONS:-0}"
BUILD_LOCAL="${DM_DASH_BUILD_LOCAL:-1}"
RESTART_SERVICES="${DM_DASH_RESTART_SERVICES:-1}"
INSTALL_UNITS="${DM_DASH_INSTALL_UNITS:-1}"

if git -C "$REPO_ROOT" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  GIT_SHA="$(git -C "$REPO_ROOT" rev-parse --short=12 HEAD)"
  if [[ "$ALLOW_DIRTY" != "1" ]] && [[ -n "$(git -C "$REPO_ROOT" status --porcelain)" ]]; then
    echo "Refusing deploy with uncommitted changes."
    echo "Set DM_DASH_ALLOW_DIRTY=1 to override."
    exit 1
  fi
else
  GIT_SHA="nogit"
fi

RELEASE_ID="${DM_DASH_RELEASE_ID:-$(date -u +%Y%m%d%H%M%S)-$GIT_SHA}"
ARCHIVE_NAME="dm-dash-${RELEASE_ID}.tar.gz"
ARCHIVE_PATH="$RELEASES_DIR/$ARCHIVE_NAME"

echo "Release: $RELEASE_ID"

if [[ "$BUILD_LOCAL" == "1" ]]; then
  echo "Building artifacts locally..."
  cd "$REPO_ROOT"
  npm ci
  npm run build
  SERVER_ENV=prod npm run build:client
else
  echo "Skipping local build (DM_DASH_BUILD_LOCAL=$BUILD_LOCAL)."
  cd "$REPO_ROOT"
fi

echo "Staging release payload..."
bash "$REPO_ROOT/scripts/deploy/build_release.sh" "$STAGING_DIR"
echo "$RELEASE_ID" > "$STAGING_DIR/RELEASE_ID"
tar -czf "$ARCHIVE_PATH" -C "$STAGING_DIR" .
echo "Saved release archive: $ARCHIVE_PATH"

echo "Validating remote prerequisites on $SERVER ..."
run_remote "set -euo pipefail; command -v rsync >/dev/null; test -x '$REMOTE_NPM_BIN'; mkdir -p '$REMOTE_DIR' '$REMOTE_DIR/releases'; df -h '$REMOTE_DIR' | sed -n '1,2p'"

RSYNC_DELETE_ENABLED=1
if ! run_remote "[ -f '$REMOTE_DIR/.artifact_deploy_initialized' ]"; then
  if [[ "$FORCE_DELETE" == "1" ]]; then
    echo "First artifact deploy detected. --delete enabled by DM_DASH_FORCE_DELETE=1."
  else
    echo "First artifact deploy detected. Skipping --delete for safety."
    echo "Set DM_DASH_FORCE_DELETE=1 to enable --delete on first artifact deploy."
    RSYNC_DELETE_ENABLED=0
  fi
fi

echo "Syncing artifacts to $SERVER:$REMOTE_DIR ..."
if [[ "$RSYNC_DELETE_ENABLED" == "1" ]]; then
  rsync -az --delete -e "$RSYNC_SSH" \
    --exclude ".env" \
    --exclude "private_frc_cloudfront_key.pem" \
    --exclude "file_uploads/" \
    --rsync-path="mkdir -p '$REMOTE_DIR' && rsync" \
    "$STAGING_DIR"/ "$SERVER:$REMOTE_DIR/"
else
  rsync -az -e "$RSYNC_SSH" \
    --exclude ".env" \
    --exclude "private_frc_cloudfront_key.pem" \
    --exclude "file_uploads/" \
    --rsync-path="mkdir -p '$REMOTE_DIR' && rsync" \
    "$STAGING_DIR"/ "$SERVER:$REMOTE_DIR/"
fi

echo "Uploading release archive..."
rsync -az -e "$RSYNC_SSH" \
  --rsync-path="mkdir -p '$REMOTE_DIR/releases' && rsync" \
  "$ARCHIVE_PATH" "$SERVER:$REMOTE_DIR/releases/$ARCHIVE_NAME"

"${SSH_CMD[@]}" \
  "REMOTE_DIR='$REMOTE_DIR' REMOTE_NPM_BIN='$REMOTE_NPM_BIN' RELEASE_ID='$RELEASE_ID' ARCHIVE_NAME='$ARCHIVE_NAME' RUN_MIGRATIONS='$RUN_MIGRATIONS' RESTART_SERVICES='$RESTART_SERVICES' INSTALL_UNITS='$INSTALL_UNITS' bash -se" <<'REMOTE'
set -euo pipefail

cd "$REMOTE_DIR"
echo "$RELEASE_ID" > RELEASE_ID
echo "$ARCHIVE_NAME" > CURRENT_RELEASE_ARCHIVE
touch .artifact_deploy_initialized

echo "Installing production dependencies..."
"$REMOTE_NPM_BIN" ci --omit=dev
chmod +x ./scripts/ops/run_with_env.sh || true

if [[ "$RUN_MIGRATIONS" == "1" ]]; then
  echo "Running migrations..."
  bash ./scripts/ops/run_with_env.sh node-pg-migrate up
else
  echo "Skipping migrations (DM_DASH_RUN_MIGRATIONS=$RUN_MIGRATIONS)."
fi

if [[ "$INSTALL_UNITS" == "1" ]]; then
  echo "Installing systemd units..."
  if [[ -f "$REMOTE_DIR/systemd/dm-dash.service" && -f "$REMOTE_DIR/systemd/dm-dash-backup.service" && -f "$REMOTE_DIR/systemd/dm-dash-backup.timer" ]]; then
    cp "$REMOTE_DIR/systemd/dm-dash.service" /etc/systemd/system/dm-dash.service
    cp "$REMOTE_DIR/systemd/dm-dash-backup.service" /etc/systemd/system/dm-dash-backup.service
    cp "$REMOTE_DIR/systemd/dm-dash-backup.timer" /etc/systemd/system/dm-dash-backup.timer
    systemctl daemon-reload
  else
    echo "systemd unit files not found in repo; keeping currently installed units."
  fi
else
  echo "Skipping systemd unit install (DM_DASH_INSTALL_UNITS=$INSTALL_UNITS)."
fi

if [[ "$RESTART_SERVICES" == "1" ]]; then
  echo "Restarting services..."
  systemctl enable dm-dash.service dm-dash-backup.timer
  systemctl restart dm-dash.service
  systemctl restart dm-dash-backup.timer
  systemctl stop dm-dash-backup.service || true

  echo "Service status:"
  systemctl --no-pager --full status dm-dash.service | sed -n '1,24p'
  systemctl --no-pager --full status dm-dash-backup.service | sed -n '1,24p'
  systemctl --no-pager --full status dm-dash-backup.timer | sed -n '1,24p'
else
  echo "Skipping service restarts (DM_DASH_RESTART_SERVICES=$RESTART_SERVICES)."
fi
REMOTE

echo "Deploy complete: $RELEASE_ID"
echo "Remote archive: $REMOTE_DIR/releases/$ARCHIVE_NAME"
echo "To include migrations next deploy: DM_DASH_RUN_MIGRATIONS=1 ./ops/deploy.sh"
