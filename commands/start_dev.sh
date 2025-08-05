#!/bin/bash
trap "exit" INT TERM ERR
trap "kill 0" EXIT

echo "🔥 Starting services…"

# Run TypeScript compiler in watch mode in background
npx tsc --watch &
TSC_PID=$!

# Wait until the main file appears (first build is done)
echo "⏳ Waiting for first compile to finish..."
while [ ! -f dist/server.js ]; do
  sleep 0.5
done
echo "✅ TypeScript compiled: dist/server.js found"

# Start bundler and server
echo "🌀 Starting bundler..."
sh ./commands/start_bundler.sh &

echo "🚀 Starting server..."
npm run dev
