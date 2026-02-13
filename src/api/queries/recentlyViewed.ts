import db from "../dbconfig";

interface RecentlyViewed {
  id: number;
  user_id: number;
  entity_type: string;
  entity_id: number;
  viewed_at: string;
}

async function upsertRecentlyViewed(
  userId: number | string,
  entityType: string,
  entityId: number | string,
) {
  const query = {
    text: /*sql*/ `
      INSERT INTO public."RecentlyViewed" (user_id, entity_type, entity_id, viewed_at)
      VALUES ($1, $2, $3, now())
      ON CONFLICT (user_id, entity_type, entity_id)
      DO UPDATE SET viewed_at = now()
    `,
    values: [userId, entityType, entityId],
  };
  return await db.query<RecentlyViewed>(query);
}

async function getRecentlyViewedByUser(
  userId: number | string,
  entityType: string,
  limit: number = 5,
) {
  const query = {
    text: /*sql*/ `
      SELECT entity_id FROM public."RecentlyViewed"
      WHERE user_id = $1 AND entity_type = $2
      ORDER BY viewed_at DESC
      LIMIT $3
    `,
    values: [userId, entityType, limit],
  };
  return await db.query<{ entity_id: number }>(query);
}

async function getRecentlyViewedByUserForIds(
  userId: number | string,
  entityType: string,
  entityIds: (number | string)[],
  limit: number = 5,
) {
  const query = {
    text: /*sql*/ `
      SELECT entity_id FROM public."RecentlyViewed"
      WHERE user_id = $1 AND entity_type = $2 AND entity_id = ANY($3)
      ORDER BY viewed_at DESC
      LIMIT $4
    `,
    values: [userId, entityType, entityIds, limit],
  };
  return await db.query<{ entity_id: number }>(query);
}

export {
  upsertRecentlyViewed,
  getRecentlyViewedByUser,
  getRecentlyViewedByUserForIds,
};
