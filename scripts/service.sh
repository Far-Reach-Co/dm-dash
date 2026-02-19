#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/_common.sh"

ACTION="${1:-status}"
TARGET="${2:-all}"

case "$TARGET" in
  web)
    run_service_action "dm-dash.service" "$ACTION"
    ;;
  backup)
    run_service_action "dm-dash-backup.service" "$ACTION"
    ;;
  all)
    run_service_action "dm-dash.service" "$ACTION"
    run_service_action "dm-dash-backup.service" "$ACTION"
    ;;
  *)
    echo "Usage: $0 {restart|status|logs|stop} [web|backup|all]"
    exit 1
    ;;
esac
