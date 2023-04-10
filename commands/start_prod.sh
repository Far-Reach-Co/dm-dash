#!/bin/bash
npm run migrate:up
npm run build
npx rollup --config rollup.config.mjs
npm run start