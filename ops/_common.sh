#!/bin/bash
set -euo pipefail

SERVER="${DM_DASH_SERVER:-root@165.227.88.65}"
REMOTE_DIR="${DM_DASH_REMOTE_DIR:-/root/dm-dash}"
SSH_KEY="${DM_DASH_SSH_KEY:-}"
REMOTE_NPM_BIN="${DM_DASH_REMOTE_NPM_BIN:-/root/.nvm/versions/node/v24.13.0/bin/npm}"

if [[ -n "$SSH_KEY" ]]; then
  SSH_CMD=(ssh -i "$SSH_KEY" "$SERVER")
  RSYNC_SSH="ssh -i $SSH_KEY"
else
  SSH_CMD=(ssh "$SERVER")
  RSYNC_SSH="ssh"
fi

run_remote() {
  "${SSH_CMD[@]}" "$1"
}

run_service_action() {
  local service="$1"
  local action="$2"

  case "$action" in
    restart)
      run_remote "systemctl restart $service && systemctl status $service --no-pager --full"
      ;;
    status)
      run_remote "systemctl status $service --no-pager --full"
      ;;
    logs)
      run_remote "journalctl -u $service --no-pager -n 80"
      ;;
    stop)
      run_remote "systemctl stop $service && echo '$service stopped'"
      ;;
    *)
      echo "Usage: $0 {restart|status|logs|stop} [web|backup|all]"
      exit 1
      ;;
  esac
}
