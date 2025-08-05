#!/bin/bash
npm run build
npx rollup --config rollup.config.mjs
npm run start