# Far Reach Co. Core

## About:

This contains the main website for Far Reach Co. which includes the dashboard view, the player character sheets, the virtual table top system and the Aether Bot

The server is built with express and socket.io. It utilizes a postgres db and redis for certain features. Frontend is mostly ejs templates and has a couple vanilla javascript apps which are bundled with rollup. There is also some use of HTMX for forms.

There are some core services being utilize including AWS S3 and Cloudfront. Stripe will be integrated soon. The discord bot relies on a package called discord-interactions.

## Setup:

- Setup local postgres server using data found in a `.env` which you will need to request
- Install all the NPM packages: `npm i`
- Start dev mode: `sh ./commands/start_dev.sh`
- Build backend dist with TS for production `npm run build`
- Run prod mode: `sh ./commands/start_prod.sh`

## DB Migration:

you can create a new migration file with `npm migrate:create <title of migration>` which will be in plain SQL.
Migrations are automatically run with start_dev.sh or start_prod.sh
