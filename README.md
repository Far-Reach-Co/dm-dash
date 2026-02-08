# Far Reach Co. Core

A comprehensive web application for Far Reach Co., featuring a dashboard, player character sheets, virtual tabletop system, and Discord bot integration (Aether Bot).

## Tech Stack

- **Backend**: Node.js with Express and TypeScript
- **Frontend**: EJS templates with vanilla JavaScript (bundled via Rollup) and HTMX for forms
- **Database**: PostgreSQL with node-pg-migrate for migrations
- **Real-time**: Socket.io with Redis adapter for WebSocket connections
- **Cloud Services**: AWS S3 and CloudFront for image storage and delivery
- **Authentication**: Express sessions with PostgreSQL store
- **Payment**: Stripe integration
- **Bot**: Discord bot using discord-interactions
- **AI**: Mistral AI (`@mistralai/mistralai`) for SRD search

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database server
- Redis server (default: localhost:6379)
- AWS account with S3 and CloudFront configured
- Discord bot application (for bot features)
- Mistral AI API key (for SRD AI search)
- Gmail account with App Password (for email features)

## Environment Variables

Create a `.env` file in the root directory with the following variables:

### Database Configuration
```
PG_USER=your_postgres_username
PG_HOST=localhost
PG_DB=your_database_name
PG_PW=your_postgres_password
DATABASE_URL=postgres://username:password@localhost:5432/database_name
```

### Server Configuration
```
SERVER_ENV=dev                              # Options: dev, prod
SECRET_KEY=your_random_secret_key           # Used for session encryption
```

### Email Configuration (Gmail SMTP)
```
MAIL_USERNAME=your_gmail@gmail.com
MAIL_PASSWORD=your_gmail_app_password       # Generate from Google Account settings
```

### AWS Configuration
```
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
CLOUDFRONT_DISTRIBUTION_DOMAIN=your_cloudfront_domain.cloudfront.net
CLOUDFRONT_KEY_ID=your_cloudfront_key_id
```
Note: You'll also need a `private_frc_cloudfront_key.pem` file in the root directory for CloudFront signed URLs.

### Stripe Configuration
```
FRC_STRIPE_TEST=sk_test_your_stripe_test_key
```

### Mistral AI Configuration
```
MISTRAL_API_KEY=your_mistral_api_key         # Get from https://console.mistral.ai/api-keys
```
The "Ask the Archives" AI search on the SRD contents page uses Mistral AI to answer D&D 5E rules questions. Without this key, the search endpoint will return an error.

### Discord Bot Configuration
```
BOT_APP_ID=your_discord_bot_app_id
BOT_PUBLIC_KEY=your_discord_bot_public_key
DISCORD_TOKEN=your_discord_bot_token
```

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your PostgreSQL database:
   - Create a new database matching your `PG_DB` value
   - Ensure PostgreSQL is running and accessible

4. Set up Redis:
   - Install and start Redis server on localhost:6379
   - Or modify `src/setupRedisAdapter.ts` to use a different Redis URL

5. Create your `.env` file with the required environment variables (see above)

6. Add your CloudFront private key file: `private_frc_cloudfront_key.pem`

## Development

Start the development server:
```bash
sh ./commands/start_dev.sh
```

This script will:
1. Run TypeScript compiler in watch mode
2. Wait for the initial compilation
3. Start the Rollup bundler for frontend JavaScript
4. Start the Express server with nodemon (auto-restart on changes)

The server will be available at `http://localhost:4000`

## Production

1. Build the TypeScript code:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   sh ./commands/start_prod.sh
   ```

## Database Migrations

### Create a new migration
```bash
npm run migrate:create <migration_title>
```
This creates a new SQL migration file in the `migrations/` directory.

### Run migrations
Before starting the server for the first time, or after creating new migrations, run:
```bash
npm run migrate:up       # Apply all pending migrations
npm run migrate:down     # Rollback the last migration
npm run migrate:redo     # Rollback and reapply the last migration
```

### Analytics View

The `monthly_log_events_summary` view provides monthly event statistics:

```sql
SELECT * FROM monthly_log_events_summary WHERE month >= '2026-01-01';
```

## Project Structure

```
.
├── commands/           # Shell scripts for development and production
├── dist/              # Compiled TypeScript output
├── file_uploads/      # Temporary file storage for uploads
├── migrations/        # Database migration files (SQL)
├── public/            # Static assets (CSS, client-side JS bundles)
├── src/               # TypeScript source code
│   ├── api/          # API routes, controllers, and queries
│   ├── lib/          # Shared utilities and services
│   ├── config.ts     # Environment configuration
│   ├── server.ts     # Main server entry point
│   ├── setupApp.ts   # Express app configuration
│   ├── setupSocket.ts # Socket.io setup
│   └── setupRedisAdapter.ts # Redis adapter for Socket.io
├── views/             # EJS templates
├── .env              # Environment variables (not in git)
└── tsconfig.json     # TypeScript configuration
```
