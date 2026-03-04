import db from "../dbconfig";
import { BillingScope } from "./billingSubscriptions";

export interface AffiliateCommission {
  id: number;
  stripe_subscription_id: string;
  stripe_invoice_id: string | null;
  affiliate_code_id: number;
  user_id: number;
  project_id: number | null;
  scope: BillingScope;
  amount_cents: number;
  status: "pending" | "paid" | "void";
  payout_note: string | null;
  paid_by_user_id: number | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AffiliateCommissionAdminView extends AffiliateCommission {
  affiliate_code: string;
  collaborator_name: string;
  buyer_username: string | null;
  project_title: string | null;
}

async function getAffiliateCommissionByStripeSubscriptionIdQuery(
  stripeSubscriptionId: string,
) {
  const query = {
    text: /*sql*/ `
      select *
      from public."AffiliateCommission"
      where stripe_subscription_id = $1
      limit 1
    `,
    values: [stripeSubscriptionId],
  };
  return await db.query<AffiliateCommission>(query);
}

async function addAffiliateCommissionQuery(data: {
  stripe_subscription_id: string;
  stripe_invoice_id?: string | null;
  affiliate_code_id: string | number;
  user_id: string | number;
  project_id: string | number | null;
  scope: BillingScope;
  amount_cents: number;
}) {
  const query = {
    text: /*sql*/ `
      insert into public."AffiliateCommission" (
        stripe_subscription_id,
        stripe_invoice_id,
        affiliate_code_id,
        user_id,
        project_id,
        scope,
        amount_cents
      )
      values ($1, $2, $3, $4, $5, $6, $7)
      returning *
    `,
    values: [
      data.stripe_subscription_id,
      data.stripe_invoice_id || null,
      data.affiliate_code_id,
      data.user_id,
      data.project_id,
      data.scope,
      data.amount_cents,
    ],
  };
  return await db.query<AffiliateCommission>(query);
}

async function getAffiliateCommissionsAdminQuery() {
  const query = {
    text: /*sql*/ `
      select
        c.*,
        a.code as affiliate_code,
        a.collaborator_name,
        u.username as buyer_username,
        p.title as project_title
      from public."AffiliateCommission" c
      join public."AffiliateCode" a on a.id = c.affiliate_code_id
      left join public."User" u on u.id = c.user_id
      left join public."Project" p on p.id = c.project_id
      order by
        case c.status
          when 'pending' then 0
          when 'paid' then 1
          else 2
        end,
        c.created_at desc,
        c.id desc
    `,
  };
  return await db.query<AffiliateCommissionAdminView>(query);
}

async function markAffiliateCommissionPaidQuery(data: {
  id: string | number;
  paid_by_user_id: string | number;
  payout_note?: string | null;
}) {
  const query = {
    text: /*sql*/ `
      update public."AffiliateCommission"
      set
        status = 'paid',
        paid_by_user_id = $2,
        payout_note = $3,
        paid_at = now(),
        updated_at = now()
      where id = $1
        and status = 'pending'
      returning *
    `,
    values: [data.id, data.paid_by_user_id, data.payout_note || null],
  };
  return await db.query<AffiliateCommission>(query);
}

export {
  getAffiliateCommissionByStripeSubscriptionIdQuery,
  addAffiliateCommissionQuery,
  getAffiliateCommissionsAdminQuery,
  markAffiliateCommissionPaidQuery,
};
