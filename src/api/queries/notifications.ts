import db from "../dbconfig";

export interface Notification {
  id: number;
  user_id: number;
  type: string;
  title: string;
  body: string;
  link: string | null;
  data_json: Record<string, unknown>;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export async function addNotificationQuery(data: {
  user_id: number | string;
  type: string;
  title: string;
  body?: string;
  link?: string | null;
  data_json?: Record<string, unknown>;
}) {
  const query = {
    text: /*sql*/ `
      insert into public."Notification" (
        user_id, type, title, body, link, data_json
      )
      values ($1, $2, $3, $4, $5, $6::jsonb)
      returning *
    `,
    values: [
      data.user_id,
      data.type,
      data.title,
      data.body || "",
      data.link || null,
      JSON.stringify(data.data_json || {}),
    ],
  };
  return await db.query<Notification>(query);
}

export async function addNotificationsQuery(
  notifications: Array<{
    user_id: number | string;
    type: string;
    title: string;
    body?: string;
    link?: string | null;
    data_json?: Record<string, unknown>;
  }>,
) {
  if (!notifications.length) return { rows: [] as Notification[] };
  const values: unknown[] = [];
  const tuples: string[] = [];

  notifications.forEach((item) => {
    const offset = values.length;
    values.push(
      item.user_id,
      item.type,
      item.title,
      item.body || "",
      item.link || null,
      JSON.stringify(item.data_json || {}),
    );
    tuples.push(
      `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}::jsonb)`,
    );
  });

  const query = {
    text: /*sql*/ `
      insert into public."Notification" (
        user_id, type, title, body, link, data_json
      )
      values ${tuples.join(",\n")}
      returning *
    `,
    values,
  };

  return await db.query<Notification>(query);
}

export async function getNotificationsByUserQuery(params: {
  userId: number | string;
  limit?: number;
  offset?: number;
}) {
  const limit = Math.max(1, Math.min(100, Number(params.limit || 20)));
  const offset = Math.max(0, Number(params.offset || 0));
  const query = {
    text: /*sql*/ `
      select *
      from public."Notification"
      where user_id = $1
      order by created_at desc, id desc
      limit $2
      offset $3
    `,
    values: [params.userId, limit, offset],
  };
  return await db.query<Notification>(query);
}

export async function getUnreadNotificationCountByUserQuery(
  userId: number | string,
) {
  const query = {
    text: /*sql*/ `
      select count(*)::int as count
      from public."Notification"
      where user_id = $1
        and is_read = false
    `,
    values: [userId],
  };
  return await db.query<{ count: number }>(query);
}

export async function markNotificationReadByIdAndUserQuery(
  id: number | string,
  userId: number | string,
) {
  const query = {
    text: /*sql*/ `
      update public."Notification"
      set is_read = true,
          read_at = coalesce(read_at, now())
      where id = $1
        and user_id = $2
      returning *
    `,
    values: [id, userId],
  };
  return await db.query<Notification>(query);
}

export async function markAllNotificationsReadByUserQuery(
  userId: number | string,
) {
  const query = {
    text: /*sql*/ `
      update public."Notification"
      set is_read = true,
          read_at = coalesce(read_at, now())
      where user_id = $1
        and is_read = false
      returning id
    `,
    values: [userId],
  };
  return await db.query<{ id: number }>(query);
}
