#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/_common.sh"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
STAGING_DIR="$(mktemp -d)"
trap 'rm -rf "$STAGING_DIR"' EXIT

ALLOW_DIRTY="${DM_DASH_ALLOW_DIRTY:-0}"
SKIP_REMOTE="${DM_DASH_SKIP_REMOTE:-0}"

if git -C "$REPO_ROOT" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Git revision: $(git -C "$REPO_ROOT" rev-parse --short=12 HEAD)"
  if [[ "$ALLOW_DIRTY" != "1" ]] && [[ -n "$(git -C "$REPO_ROOT" status --porcelain)" ]]; then
    echo "Preflight failed: working tree has uncommitted changes."
    echo "Set DM_DASH_ALLOW_DIRTY=1 to override."
    exit 1
  fi
fi

echo "Running local checks..."
cd "$REPO_ROOT"
npm ci
npm run check
npm run build
SERVER_ENV=prod npm run build:client

echo "Staging release payload (dry-run)..."
bash "$REPO_ROOT/scripts/deploy/build_release.sh" "$STAGING_DIR"
echo "Staged size: $(du -sh "$STAGING_DIR" | awk '{print $1}')"
echo "Top-level staged paths:"
find "$STAGING_DIR" -maxdepth 2 -mindepth 1 | sed "s|$STAGING_DIR/||" | sort

if [[ "$SKIP_REMOTE" == "1" ]]; then
  echo "Skipping remote checks (DM_DASH_SKIP_REMOTE=1)."
  exit 0
fi

echo "Running remote checks on $SERVER ..."
run_remote "set -euo pipefail; command -v rsync >/dev/null; test -x '$REMOTE_NPM_BIN'; mkdir -p '$REMOTE_DIR'; df -h '$REMOTE_DIR' | sed -n '1,2p'"
echo "Preflight complete."
