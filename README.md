# Far Reach Co. Core

## About:

This contains the main website for Far Reach Co. which includes the dashboard view, the player character sheets (currently only DnD 5e) and the virtual table top.

The server is in express.js with socket.io. The database is postgres and the frontend is vanilla js with ES modules bundled with rollup.

## Setup:

- Setup local postgres server using data found in a `.env` which you will need to request
- Install all the NPM packages: `npm i`
- Start dev mode: `sh ./commands/start_dev.sh`
- Run live bundling for frontend dev: `sh ./commands/start_bundler.sh`
- Run prod mode: `sh ./commands/start_prod.sh`

## DB Migration:

you can create a new migration file with `npm migrate:create <title of migration>` which will be in plain SQL.
Migrations are automatically run with start_dev.sh or start_prod.sh
