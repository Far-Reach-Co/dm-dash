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
    case "$ACTION" in
      restart)
        run_remote "systemctl restart dm-dash-backup.timer && systemctl status dm-dash-backup.timer --no-pager --full"
        ;;
      status)
        run_remote "systemctl status dm-dash-backup.timer --no-pager --full && systemctl status dm-dash-backup.service --no-pager --full"
        ;;
      logs)
        run_remote "journalctl -u dm-dash-backup.service --no-pager -n 80"
        ;;
      stop)
        run_remote "systemctl stop dm-dash-backup.timer dm-dash-backup.service && echo 'dm-dash-backup timer/service stopped'"
        ;;
      *)
        echo "Usage: $0 {restart|status|logs|stop} [web|backup|report|all]"
        exit 1
        ;;
    esac
    ;;
  report)
    case "$ACTION" in
      restart)
        run_remote "systemctl restart dm-dash-monthly-report.timer && systemctl status dm-dash-monthly-report.timer --no-pager --full"
        ;;
      status)
        run_remote "systemctl status dm-dash-monthly-report.timer --no-pager --full && systemctl status dm-dash-monthly-report.service --no-pager --full"
        ;;
      logs)
        run_remote "journalctl -u dm-dash-monthly-report.service --no-pager -n 80"
        ;;
      stop)
        run_remote "systemctl stop dm-dash-monthly-report.timer dm-dash-monthly-report.service && echo 'dm-dash-monthly-report timer/service stopped'"
        ;;
      *)
        echo "Usage: $0 {restart|status|logs|stop} [web|backup|report|all]"
        exit 1
        ;;
    esac
    ;;
  all)
    run_service_action "dm-dash.service" "$ACTION"
    case "$ACTION" in
      restart)
        run_remote "systemctl restart dm-dash-backup.timer dm-dash-monthly-report.timer && systemctl status dm-dash-backup.timer --no-pager --full && systemctl status dm-dash-monthly-report.timer --no-pager --full"
        ;;
      status)
        run_remote "systemctl status dm-dash-backup.timer --no-pager --full && systemctl status dm-dash-backup.service --no-pager --full && systemctl status dm-dash-monthly-report.timer --no-pager --full && systemctl status dm-dash-monthly-report.service --no-pager --full"
        ;;
      logs)
        run_remote "journalctl -u dm-dash-backup.service -u dm-dash-monthly-report.service --no-pager -n 120"
        ;;
      stop)
        run_remote "systemctl stop dm-dash-backup.timer dm-dash-backup.service dm-dash-monthly-report.timer dm-dash-monthly-report.service && echo 'dm-dash-backup + dm-dash-monthly-report timer/services stopped'"
        ;;
      *)
        echo "Usage: $0 {restart|status|logs|stop} [web|backup|report|all]"
        exit 1
        ;;
    esac
    ;;
  *)
    echo "Usage: $0 {restart|status|logs|stop} [web|backup|report|all]"
    exit 1
    ;;
esac
