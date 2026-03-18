#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/_common.sh"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
STAGING_DIR="$(mktemp -d)"
trap 'rm -rf "$STAGING_DIR"' EXIT
RELEASES_DIR="$REPO_ROOT/.releases"

ALLOW_DIRTY="${DM_DASH_ALLOW_DIRTY:-0}"
FORCE_DELETE="${DM_DASH_FORCE_DELETE:-0}"
RUN_MIGRATIONS="${DM_DASH_RUN_MIGRATIONS:-0}"
BUILD_LOCAL="${DM_DASH_BUILD_LOCAL:-1}"
RESTART_SERVICES="${DM_DASH_RESTART_SERVICES:-1}"
INSTALL_UNITS="${DM_DASH_INSTALL_UNITS:-1}"
CREATE_RELEASE_ARCHIVE="${DM_DASH_CREATE_RELEASE_ARCHIVE:-1}"
SAVE_LOCAL_ARCHIVE="${DM_DASH_SAVE_LOCAL_ARCHIVE:-0}"

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
if [[ "$SAVE_LOCAL_ARCHIVE" == "1" ]]; then
  mkdir -p "$RELEASES_DIR"
  tar -czf "$ARCHIVE_PATH" -C "$STAGING_DIR" .
  echo "Saved local release archive: $ARCHIVE_PATH"
fi

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
    --exclude "gsc-service-account.json" \
    --exclude "private_frc_cloudfront_key.pem" \
    --exclude "file_uploads/" \
    --rsync-path="mkdir -p '$REMOTE_DIR' && rsync" \
    "$STAGING_DIR"/ "$SERVER:$REMOTE_DIR/"
else
  rsync -az -e "$RSYNC_SSH" \
    --exclude ".env" \
    --exclude "gsc-service-account.json" \
    --exclude "private_frc_cloudfront_key.pem" \
    --exclude "file_uploads/" \
    --rsync-path="mkdir -p '$REMOTE_DIR' && rsync" \
    "$STAGING_DIR"/ "$SERVER:$REMOTE_DIR/"
fi

"${SSH_CMD[@]}" \
  "REMOTE_DIR='$REMOTE_DIR' REMOTE_NPM_BIN='$REMOTE_NPM_BIN' RELEASE_ID='$RELEASE_ID' ARCHIVE_NAME='$ARCHIVE_NAME' RUN_MIGRATIONS='$RUN_MIGRATIONS' RESTART_SERVICES='$RESTART_SERVICES' INSTALL_UNITS='$INSTALL_UNITS' CREATE_RELEASE_ARCHIVE='$CREATE_RELEASE_ARCHIVE' bash -se" <<'REMOTE'
set -euo pipefail

cd "$REMOTE_DIR"
echo "$RELEASE_ID" > RELEASE_ID
echo "$ARCHIVE_NAME" > CURRENT_RELEASE_ARCHIVE
touch .artifact_deploy_initialized
export PATH="$(dirname "$REMOTE_NPM_BIN"):$PATH"

if [[ "$CREATE_RELEASE_ARCHIVE" == "1" ]]; then
  echo "Creating remote release archive..."
  mkdir -p "$REMOTE_DIR/releases"
  ARCHIVE_PATH="$REMOTE_DIR/releases/$ARCHIVE_NAME"
  tar --exclude="./releases" --exclude="./.env" --exclude="./gsc-service-account.json" --exclude="./private_frc_cloudfront_key.pem" --exclude="./file_uploads" -czf "$ARCHIVE_PATH" .
else
  echo "Skipping remote release archive (DM_DASH_CREATE_RELEASE_ARCHIVE=$CREATE_RELEASE_ARCHIVE)."
fi

echo "Installing production dependencies..."
"$REMOTE_NPM_BIN" ci --omit=dev
chmod +x ./scripts/ops/run_with_env.sh || true

if [[ "$RUN_MIGRATIONS" == "1" ]]; then
  echo "Running migrations..."
  bash ./scripts/ops/run_with_env.sh ./node_modules/.bin/node-pg-migrate up
else
  echo "Skipping migrations (DM_DASH_RUN_MIGRATIONS=$RUN_MIGRATIONS)."
fi

if [[ "$INSTALL_UNITS" == "1" ]]; then
  echo "Installing systemd units..."
  units=(
    "dm-dash.service"
    "dm-dash-backup.service"
    "dm-dash-backup.timer"
    "dm-dash-monthly-report.service"
    "dm-dash-monthly-report.timer"
    "dm-dash-srd-popular-pages.service"
    "dm-dash-srd-popular-pages.timer"
  )

  installed_any_unit=0
  for unit in "${units[@]}"; do
    if [[ -f "$REMOTE_DIR/systemd/$unit" ]]; then
      cp "$REMOTE_DIR/systemd/$unit" "/etc/systemd/system/$unit"
      installed_any_unit=1
    else
      echo "systemd/$unit not found in repo; skipping install for this unit."
    fi
  done

  obsolete_units=(
    "dm-dash-srd-daily-report.service"
    "dm-dash-srd-daily-report.timer"
  )

  removed_any_unit=0
  for unit in "${obsolete_units[@]}"; do
    systemctl disable --now "$unit" >/dev/null 2>&1 || true
    if [[ -f "/etc/systemd/system/$unit" ]]; then
      rm -f "/etc/systemd/system/$unit"
      removed_any_unit=1
    fi
  done

  if [[ "$installed_any_unit" == "1" || "$removed_any_unit" == "1" ]]; then
    systemctl daemon-reload
  else
    echo "No systemd unit files changed; keeping currently installed units."
  fi
else
  echo "Skipping systemd unit install (DM_DASH_INSTALL_UNITS=$INSTALL_UNITS)."
fi

if [[ "$RESTART_SERVICES" == "1" ]]; then
  echo "Restarting services..."
  systemctl disable --now dm-dash-srd-daily-report.timer >/dev/null 2>&1 || true
  systemctl enable dm-dash.service dm-dash-backup.timer dm-dash-monthly-report.timer dm-dash-srd-popular-pages.timer
  systemctl restart dm-dash.service
  systemctl restart dm-dash-backup.timer
  systemctl restart dm-dash-monthly-report.timer
  systemctl restart dm-dash-srd-popular-pages.timer
  systemctl stop dm-dash-backup.service || true
  systemctl stop dm-dash-monthly-report.service || true
  systemctl stop dm-dash-srd-popular-pages.service || true

  echo "Service status:"
  # status returns non-zero for inactive one-shot units; print status without failing deploy
  systemctl --no-pager --full status dm-dash.service | sed -n '1,24p' || true
  systemctl --no-pager --full status dm-dash-backup.service | sed -n '1,24p' || true
  systemctl --no-pager --full status dm-dash-backup.timer | sed -n '1,24p' || true
  systemctl --no-pager --full status dm-dash-monthly-report.service | sed -n '1,24p' || true
  systemctl --no-pager --full status dm-dash-monthly-report.timer | sed -n '1,24p' || true
  systemctl --no-pager --full status dm-dash-srd-popular-pages.service | sed -n '1,24p' || true
  systemctl --no-pager --full status dm-dash-srd-popular-pages.timer | sed -n '1,24p' || true
else
  echo "Skipping service restarts (DM_DASH_RESTART_SERVICES=$RESTART_SERVICES)."
fi
REMOTE

echo "Deploy complete: $RELEASE_ID"
if [[ "$CREATE_RELEASE_ARCHIVE" == "1" ]]; then
  echo "Remote archive: $REMOTE_DIR/releases/$ARCHIVE_NAME"
fi
echo "To include migrations next deploy: DM_DASH_RUN_MIGRATIONS=1 ./ops/deploy.sh"
