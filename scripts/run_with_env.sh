#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <command-or-node-script> [args...]"
  exit 1
fi

if [[ -f ./.env ]]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a
fi

FIRST_ARG="$1"

# Preserve compatibility with existing usage:
# if the first arg is a non-executable file, treat it as a node script.
if [[ -f "$FIRST_ARG" && ! -x "$FIRST_ARG" ]]; then
  NODE_BIN="${NODE_BIN:-$(command -v node || true)}"
  if [[ -z "$NODE_BIN" ]]; then
    echo "node binary not found in PATH"
    exit 1
  fi
  exec "$NODE_BIN" "$@"
fi

exec "$@"
