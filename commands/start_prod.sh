#!/bin/bash
npm run migrate:up
npx rollup --config rollup.config.mjs
npx tsc
npm run start