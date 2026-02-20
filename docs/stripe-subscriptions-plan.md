# Stripe Integration Plan: Pro User, Pro Wyrld, Radio, Bundles

## Goal

Set up Stripe so entitlements are deterministic and easy to enforce across:

- `dm-dash` (account limits + Wyrld limits)
- `music_stream_server` (Pro playlist access)

## Current Entitlement Model

Current runtime gating is already built around:

- `public."User".is_pro` (account-level Pro)
- `public."Project".is_pro` (Wyrld-level Pro)

This is good for runtime checks and should remain the source of truth for app authorization, with Stripe as billing source of truth.

## Existing Gates We Must Preserve

- Pro User gates:
  - More than 2 owned Wyrlds
  - More than 10 personal tables
  - Account image storage cap increase (now hard-capped)
  - Radio Pro playlists (in `music_stream_server`)
- Pro Wyrld gates:
  - More than 10 tables in that Wyrld
  - More than 5 Wyrld character links
  - Wyrld banner
  - Public discovery listing / featured public record behavior
  - Wyrld image storage cap increase (now hard-capped)

## Stripe Product Catalog (Recommended)

1. `pro_user_monthly` / `pro_user_yearly`
2. `pro_wyrld_monthly` / `pro_wyrld_yearly`
3. Optional later: `pro_bundle_monthly` / `pro_bundle_yearly`
4. Optional add-on: `extra_wyrld_seat_monthly` for bundle expansions

Use fixed `lookup_key` values for each price so code can resolve prices reliably by environment.

## Bundle/Discount Options

Yes, both are possible.

### Option A (Recommended now): Discounted Wyrld price if user is already Pro

- Keep separate subscriptions:
  - User Pro
  - One or more Wyrld Pro subscriptions
- At checkout creation for Wyrld Pro:
  - If `User.is_pro` is active, route to discounted Wyrld price (or apply coupon automatically)
- Upside:
  - Simplest entitlement logic
  - No bundle seat-assignment complexity
- Downside:
  - Slightly more pricing objects

### Option B: Bundle SKU (User Pro + included Wyrld seat)

- One subscription can include:
  - Pro User entitlement
  - One Pro Wyrld slot
- Requires extra logic to assign included slot to a specific `Project.id`
- Upside:
  - Cleaner customer-facing plan
- Downside:
  - More complex assignment, downgrade, cancellation, and seat transfer logic

## Recommendation

Phase 1: implement Option A (discounted Wyrld for active Pro User).
Phase 2: evaluate bundle SKU after Stripe + entitlement webhooks are stable.

## Minimal Database Additions

Keep current flags and add billing linkage tables:

- `BillingCustomer`
  - `user_id`, `stripe_customer_id`, `created_at`, `updated_at`
- `BillingSubscription`
  - `id`, `user_id`, `project_id nullable`, `scope ('user'|'project')`
  - `stripe_subscription_id`, `stripe_price_id`, `status`
  - `current_period_end`, `cancel_at_period_end`, timestamps
- `BillingEventLog`
  - `stripe_event_id unique`, `type`, `processed_at`, `payload_hash`

Notes:

- `project_id` is required for Wyrld subscriptions.
- One user can have many project-scope subscriptions.

## Webhook-to-Entitlement Mapping

Handle at minimum:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`
- `invoice.payment_failed`

After each relevant event:

1. Upsert `BillingSubscription`
2. Recompute entitlements:
   - `User.is_pro = has_active_user_scope_subscription`
   - `Project.is_pro = has_active_project_scope_subscription(project_id)`
3. Persist flags in app DB

Idempotency:

- Enforce unique `stripe_event_id` in `BillingEventLog`
- Skip already-processed events

## Checkout Flow (Recommended)

### Pro User Checkout

1. Authenticated user starts checkout
2. Create/reuse Stripe customer
3. Start session with Pro User price
4. On webhook success, set `User.is_pro = true`

### Pro Wyrld Checkout

1. User selects target `project_id`
2. Backend verifies ownership
3. Backend chooses price:
   - Discounted if user already Pro (Option A)
   - Standard otherwise
4. Include `project_id` in Stripe metadata
5. On webhook success, set `Project.is_pro = true` for that `project_id`

## Radio Integration Impact

`music_stream_server` already checks `public."User".is_pro`. No new radio-side billing logic is required if webhook sync keeps `User.is_pro` accurate.

Files currently using this:

- `../music_stream_server/radio.py` (`_get_user_is_pro`, `/playlists`, `/command`)
- `../music_stream_server/playlists.py` (`is_pro_playlist`, `get_free_playlists`)

## Operational Safety Checklist

- Store Stripe secret/webhook secret in env only
- Verify Stripe webhook signatures
- Add replay-safe processing with event IDs
- Add admin audit page for subscription states
- Add reconciliation script:
  - Compare Stripe active subscriptions vs DB flags
  - Repair drift (`is_pro` flags)

## Rollout Plan

1. Add billing tables + webhook endpoint (no checkout yet)
2. Build entitlement recompute job
3. Add Pro User checkout
4. Add Pro Wyrld checkout (with Option A discount logic)
5. Add self-serve portal links
6. Backfill/reconcile existing manual Pro users/projects

## Open Decisions

- Final prices (monthly/yearly values)
- Discount model:
  - fixed reduced Wyrld price vs coupon %
- Whether to lock discounted Wyrld price when user later cancels Pro User
- Whether bundle SKU is needed in v1 or deferred
