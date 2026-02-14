import db from "../dbconfig";

interface EmailCampaignSend {
  id: number;
  campaign_slug: string;
  user_id: number;
  email: string;
  sent_at: string;
}

async function getSentUserIdsForCampaignQuery(
  campaignSlug: string,
  userIds: (string | number)[],
) {
  if (!userIds.length) {
    return { rows: [] as Array<{ user_id: number }> };
  }

  const query = {
    text: /*sql*/ `
      SELECT user_id
      FROM public."EmailCampaignSend"
      WHERE campaign_slug = $1
        AND user_id = ANY($2::int[])
    `,
    values: [campaignSlug, userIds.map((id) => Number(id))],
  };
  return await db.query<{ user_id: number }>(query);
}

async function addEmailCampaignSendQuery(data: {
  campaign_slug: string;
  user_id: string | number;
  email: string;
}) {
  const query = {
    text: /*sql*/ `
      INSERT INTO public."EmailCampaignSend" (campaign_slug, user_id, email)
      VALUES ($1, $2, $3)
      ON CONFLICT (campaign_slug, user_id) DO NOTHING
      RETURNING *
    `,
    values: [data.campaign_slug, Number(data.user_id), data.email],
  };
  return await db.query<EmailCampaignSend>(query);
}

export { getSentUserIdsForCampaignQuery, addEmailCampaignSendQuery };
