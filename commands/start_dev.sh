#!/bin/bash
trap "exit" INT TERM ERR
trap "kill 0" EXIT

#
echo "\n*************** RUNNING AUTO MIGRATE ***************\n"
npm run migrate:up

echo "\n*************** STARTING JS BUNDLER ***************\n"
sh ./commands/start_bundler.sh &

echo "\n*************** STARTING SERVER ***************\n"
npm run dev