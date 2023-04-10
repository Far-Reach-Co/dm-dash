#!/bin/bash
npm run migrate:up
npx rollup --config rollup.config.mjs
npm run start