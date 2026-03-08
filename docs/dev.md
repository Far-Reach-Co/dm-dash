# Development

## Prerequisites

- Node.js `24.13.0` (`.nvmrc`)
- PostgreSQL
- Redis

## Setup

```bash
nvm use
npm install
cp .env.example .env
```

## Run

```bash
npm run dev
```

This runs:
1. TypeScript watch compile (`src/` -> `dist/`)
2. Rollup watch bundle (`public/views` -> `public/dist`)
3. Server restart loop (`node --watch --watch-path=dist dist/server.js`)

## Stripe Test Setup

Use Stripe test-mode credentials in `.env`:

```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_CONNECT_WEBHOOK_SECRET=whsec_...   # if using separate Connect webhook endpoint
STRIPE_CONNECT_ACCOUNT_COUNTRY=US
STRIPE_AFFILIATE_DISCOUNT_COUPON_ID=coupon_test_id
STRIPE_PRICE_ID_PRO_USER_MONTHLY=price_test_...
STRIPE_PRICE_ID_PRO_USER_YEARLY=price_test_...
STRIPE_PRICE_ID_PRO_WYRLD_MONTHLY=price_test_...
STRIPE_PRICE_ID_PRO_WYRLD_YEARLY=price_test_...
AFFILIATE_COMMISSION_ALERT_EMAIL=off
```

Notes:
1. Use test coupon + test prices only.
2. Keep all Stripe values in test mode together (`sk_test`, `price_...` from test dashboard).
3. `STRIPE_CONNECT_ACCOUNT_COUNTRY` is used when creating affiliate Connect Express accounts.

For local webhook forwarding with Stripe CLI:

```bash
stripe listen \
  --events checkout.session.completed,customer.subscription.created,customer.subscription.updated,customer.subscription.deleted,invoice.paid,invoice.payment_succeeded,invoice.payment_failed,account.updated \
  --forward-to localhost:4000/api/stripe/webhook \
  --forward-connect-to localhost:4000/api/stripe/webhook
```

Then copy the CLI signing secret (`whsec_...`) into both:
1. `STRIPE_WEBHOOK_SECRET`
2. `STRIPE_CONNECT_WEBHOOK_SECRET`

For this single local listener, using the same secret in both vars is expected.

Recommended events to enable for this project:
1. `checkout.session.completed`
2. `customer.subscription.created`
3. `customer.subscription.updated`
4. `customer.subscription.deleted`
5. `invoice.paid`
6. `invoice.payment_succeeded`
7. `invoice.payment_failed`
8. `account.updated`

Run new DB migrations before testing Stripe flows:

```bash
npm run migrate:up
```

## Quality Checks

```bash
npm run check
```

Also available:

```bash
npm run lint
npm run typecheck
npm run test
```

## Build Commands

```bash
npm run build             # build server + tools TS
SERVER_ENV=prod npm run build:client
```
