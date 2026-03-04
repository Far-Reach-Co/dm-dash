import db from "../dbconfig";

export type BillingScope = "user" | "project";

export interface BillingSubscription {
  id: number;
  user_id: number;
  project_id: number | null;
  scope: BillingScope;
  stripe_subscription_id: string;
  stripe_customer_id: string;
  stripe_price_id: string | null;
  status: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  metadata_json: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

async function getBillingSubscriptionByStripeSubscriptionIdQuery(
  stripeSubscriptionId: string,
) {
  const query = {
    text: /*sql*/ `
      select *
      from public."BillingSubscription"
      where stripe_subscription_id = $1
      limit 1
    `,
    values: [stripeSubscriptionId],
  };
  return await db.query<BillingSubscription>(query);
}

async function upsertBillingSubscriptionByStripeIdQuery(data: {
  user_id: string | number;
  project_id: string | number | null;
  scope: BillingScope;
  stripe_subscription_id: string;
  stripe_customer_id: string;
  stripe_price_id?: string | null;
  status: string;
  current_period_end?: string | null;
  cancel_at_period_end?: boolean;
  metadata_json?: Record<string, unknown>;
}) {
  const query = {
    text: /*sql*/ `
      insert into public."BillingSubscription" (
        user_id,
        project_id,
        scope,
        stripe_subscription_id,
        stripe_customer_id,
        stripe_price_id,
        status,
        current_period_end,
        cancel_at_period_end,
        metadata_json
      )
      values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb)
      on conflict (stripe_subscription_id)
      do update set
        user_id = excluded.user_id,
        project_id =
          case
            when excluded.scope = 'project' then coalesce(excluded.project_id, public."BillingSubscription".project_id)
            else null
          end,
        scope = excluded.scope,
        stripe_customer_id = excluded.stripe_customer_id,
        stripe_price_id = excluded.stripe_price_id,
        status = excluded.status,
        current_period_end = excluded.current_period_end,
        cancel_at_period_end = excluded.cancel_at_period_end,
        metadata_json = excluded.metadata_json,
        updated_at = now()
      returning *
    `,
    values: [
      data.user_id,
      data.project_id,
      data.scope,
      data.stripe_subscription_id,
      data.stripe_customer_id,
      data.stripe_price_id ?? null,
      data.status,
      data.current_period_end ?? null,
      data.cancel_at_period_end ?? false,
      JSON.stringify(data.metadata_json || {}),
    ],
  };
  return await db.query<BillingSubscription>(query);
}

async function hasActiveUserScopeSubscriptionQuery(
  userId: string | number,
  activeStatuses: readonly string[],
) {
  const query = {
    text: /*sql*/ `
      select exists(
        select 1
        from public."BillingSubscription"
        where user_id = $1
          and scope = 'user'
          and status = any($2::text[])
      ) as has_active
    `,
    values: [userId, activeStatuses],
  };
  return await db.query<{ has_active: boolean }>(query);
}

async function hasActiveProjectScopeSubscriptionQuery(
  projectId: string | number,
  activeStatuses: readonly string[],
) {
  const query = {
    text: /*sql*/ `
      select exists(
        select 1
        from public."BillingSubscription"
        where project_id = $1
          and scope = 'project'
          and status = any($2::text[])
      ) as has_active
    `,
    values: [projectId, activeStatuses],
  };
  return await db.query<{ has_active: boolean }>(query);
}

async function getBillingSubscriptionsByUserIdQuery(userId: string | number) {
  const query = {
    text: /*sql*/ `
      select *
      from public."BillingSubscription"
      where user_id = $1
      order by updated_at desc, id desc
    `,
    values: [userId],
  };
  return await db.query<BillingSubscription>(query);
}

export {
  getBillingSubscriptionsByUserIdQuery,
  getBillingSubscriptionByStripeSubscriptionIdQuery,
  hasActiveProjectScopeSubscriptionQuery,
  hasActiveUserScopeSubscriptionQuery,
  upsertBillingSubscriptionByStripeIdQuery,
};
