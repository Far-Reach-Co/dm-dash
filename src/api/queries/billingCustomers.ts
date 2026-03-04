import db from "../dbconfig";

export interface BillingCustomer {
  id: number;
  user_id: number;
  stripe_customer_id: string;
  created_at: string;
  updated_at: string;
}

async function getBillingCustomerByUserIdQuery(userId: string | number) {
  const query = {
    text: /*sql*/ `
      select *
      from public."BillingCustomer"
      where user_id = $1
      limit 1
    `,
    values: [userId],
  };
  return await db.query<BillingCustomer>(query);
}

async function getBillingCustomerByStripeCustomerIdQuery(stripeCustomerId: string) {
  const query = {
    text: /*sql*/ `
      select *
      from public."BillingCustomer"
      where stripe_customer_id = $1
      limit 1
    `,
    values: [stripeCustomerId],
  };
  return await db.query<BillingCustomer>(query);
}

async function upsertBillingCustomerQuery(data: {
  user_id: string | number;
  stripe_customer_id: string;
}) {
  const query = {
    text: /*sql*/ `
      insert into public."BillingCustomer" (user_id, stripe_customer_id)
      values ($1, $2)
      on conflict (user_id)
      do update set
        stripe_customer_id = excluded.stripe_customer_id,
        updated_at = now()
      returning *
    `,
    values: [data.user_id, data.stripe_customer_id],
  };
  return await db.query<BillingCustomer>(query);
}

export {
  getBillingCustomerByUserIdQuery,
  getBillingCustomerByStripeCustomerIdQuery,
  upsertBillingCustomerQuery,
};
