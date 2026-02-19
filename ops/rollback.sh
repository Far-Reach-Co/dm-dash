#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/_common.sh"

ARCHIVE_NAME="${1:-}"

if [[ -z "$ARCHIVE_NAME" ]]; then
  echo "Usage: $0 <archive-name.tar.gz>"
  echo "Available archives (newest first):"
  run_remote "set -euo pipefail; ls -1t '$REMOTE_DIR/releases' 2>/dev/null | sed -n '1,25p'"
  exit 0
fi

if [[ "$ARCHIVE_NAME" == *"/"* ]]; then
  echo "Archive name must be a basename (no path separators)."
  exit 1
fi

echo "Rolling back to $ARCHIVE_NAME on $SERVER ..."
"${SSH_CMD[@]}" \
  "REMOTE_DIR='$REMOTE_DIR' REMOTE_NPM_BIN='$REMOTE_NPM_BIN' ARCHIVE_NAME='$ARCHIVE_NAME' bash -se" <<'REMOTE'
set -euo pipefail

ARCHIVE_PATH="$REMOTE_DIR/releases/$ARCHIVE_NAME"
if [[ ! -f "$ARCHIVE_PATH" ]]; then
  echo "Archive not found: $ARCHIVE_PATH"
  exit 1
fi

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

tar -xzf "$ARCHIVE_PATH" -C "$TMP_DIR"
rsync -az --delete \
  --exclude ".env" \
  --exclude "private_frc_cloudfront_key.pem" \
  --exclude "file_uploads/" \
  "$TMP_DIR"/ "$REMOTE_DIR/"

cd "$REMOTE_DIR"
"$REMOTE_NPM_BIN" ci --omit=dev
chmod +x ./scripts/ops/run_with_env.sh || true
echo "$ARCHIVE_NAME" > CURRENT_RELEASE_ARCHIVE

if [[ -f "$REMOTE_DIR/RELEASE_ID" ]]; then
  echo "rollback-$(date -u +%Y%m%d%H%M%S)" > "$REMOTE_DIR/RELEASE_ID"
fi

systemctl daemon-reload
systemctl restart dm-dash.service
systemctl restart dm-dash-backup.timer
systemctl stop dm-dash-backup.service || true

echo "Rollback complete."
systemctl --no-pager --full status dm-dash.service | sed -n '1,24p'
REMOTE
