import db from "../dbconfig";

export interface BillingEventLog {
  id: number;
  stripe_event_id: string;
  type: string;
  payload_hash: string;
  payload_json: Record<string, unknown>;
  processed_at: string;
  created_at: string;
}

async function addBillingEventLogQuery(data: {
  stripe_event_id: string;
  type: string;
  payload_hash: string;
  payload_json: Record<string, unknown>;
}) {
  const query = {
    text: /*sql*/ `
      insert into public."BillingEventLog" (
        stripe_event_id,
        type,
        payload_hash,
        payload_json
      )
      values ($1, $2, $3, $4::jsonb)
      on conflict (stripe_event_id)
      do nothing
      returning *
    `,
    values: [
      data.stripe_event_id,
      data.type,
      data.payload_hash,
      JSON.stringify(data.payload_json || {}),
    ],
  };
  return await db.query<BillingEventLog>(query);
}

async function removeBillingEventLogByStripeEventIdQuery(stripeEventId: string) {
  const query = {
    text: /*sql*/ `
      delete from public."BillingEventLog"
      where stripe_event_id = $1
      returning *
    `,
    values: [stripeEventId],
  };
  return await db.query<BillingEventLog>(query);
}

export {
  addBillingEventLogQuery,
  removeBillingEventLogByStripeEventIdQuery,
};
