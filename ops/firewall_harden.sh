#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/_common.sh"

echo "Applying UFW hardening on $SERVER ..."

run_remote "set -euo pipefail; ufw allow OpenSSH; ufw allow 80/tcp; ufw allow 443/tcp; ufw default deny incoming; ufw default allow outgoing; ufw --force enable; ufw status verbose"

echo "Firewall hardening complete."
