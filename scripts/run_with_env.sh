#!/bin/bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <node-script-path> [args...]"
  exit 1
fi

if [[ -f ./.env ]]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a
fi

NODE_BIN="${NODE_BIN:-$(command -v node || true)}"
if [[ -z "$NODE_BIN" ]]; then
  echo "node binary not found in PATH"
  exit 1
fi

SCRIPT_PATH="$1"
shift

exec "$NODE_BIN" "$SCRIPT_PATH" "$@"
