#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/_common.sh"

APPLY="${DM_DASH_APPLY:-0}"

echo "Scanning legacy paths on $SERVER ..."
"${SSH_CMD[@]}" "REMOTE_DIR='$REMOTE_DIR' APPLY='$APPLY' bash -se" <<'REMOTE'
set -euo pipefail

candidates=(
  "$REMOTE_DIR/.git"
  "$REMOTE_DIR/commands"
  "$REMOTE_DIR/scripts/_common.sh"
  "$REMOTE_DIR/scripts/deploy.sh"
  "$REMOTE_DIR/scripts/service.sh"
  "$REMOTE_DIR/scripts/caddy_sync.sh"
  "$REMOTE_DIR/scripts/firewall_harden.sh"
  "$REMOTE_DIR/scripts/run_with_env.sh"
)

found=0
for path in "${candidates[@]}"; do
  if [[ -e "$path" ]]; then
    echo "legacy: $path"
    found=1
  fi
done

if [[ "$found" -eq 0 ]]; then
  echo "No legacy paths found."
  exit 0
fi

if [[ "$APPLY" != "1" ]]; then
  echo "Dry run only. Set DM_DASH_APPLY=1 to remove listed paths."
  exit 0
fi

for path in "${candidates[@]}"; do
  if [[ -e "$path" ]]; then
    rm -rf "$path"
    echo "removed: $path"
  fi
done
REMOTE
