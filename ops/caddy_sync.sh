#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/_common.sh"

LOCAL_CADDYFILE="${DM_DASH_CADDYFILE:-$SCRIPT_DIR/caddy/Caddyfile}"
REMOTE_CADDYFILE="${DM_DASH_REMOTE_CADDYFILE:-/etc/caddy/Caddyfile}"

if [[ ! -f "$LOCAL_CADDYFILE" ]]; then
  echo "Local Caddyfile not found: $LOCAL_CADDYFILE"
  exit 1
fi

echo "Syncing $LOCAL_CADDYFILE -> $SERVER:$REMOTE_CADDYFILE"

if [[ -n "$SSH_KEY" ]]; then
  scp -i "$SSH_KEY" "$LOCAL_CADDYFILE" "$SERVER:/tmp/dm-dash.Caddyfile"
else
  scp "$LOCAL_CADDYFILE" "$SERVER:/tmp/dm-dash.Caddyfile"
fi

run_remote "install -m 644 /tmp/dm-dash.Caddyfile $REMOTE_CADDYFILE && caddy validate --config $REMOTE_CADDYFILE && systemctl reload caddy && systemctl status caddy --no-pager --full | sed -n '1,24p'"

echo "Caddy config sync complete."
