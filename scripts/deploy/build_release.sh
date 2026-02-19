#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 <staging-dir>"
  exit 1
fi

STAGING_DIR="$1"
mkdir -p "$STAGING_DIR"
mkdir -p "$STAGING_DIR/scripts/ops"

if [[ ! -f "dist/server.js" ]]; then
  echo "dist/server.js not found. Run: npm run build"
  exit 1
fi

if [[ ! -d "public/dist" ]]; then
  echo "public/dist not found. Run: SERVER_ENV=prod npm run build:client"
  exit 1
fi

cp package.json "$STAGING_DIR/package.json"
cp package-lock.json "$STAGING_DIR/package-lock.json"

rsync -a dist/ "$STAGING_DIR/dist/"
if [[ -d dist-tools ]]; then
  rsync -a dist-tools/ "$STAGING_DIR/dist-tools/"
fi
rsync -a public/ "$STAGING_DIR/public/"
rsync -a views/ "$STAGING_DIR/views/"
rsync -a migrations/ "$STAGING_DIR/migrations/"
rsync -a systemd/ "$STAGING_DIR/systemd/"

cp scripts/ops/run_with_env.sh "$STAGING_DIR/scripts/ops/run_with_env.sh"
chmod +x "$STAGING_DIR/scripts/ops/run_with_env.sh"
