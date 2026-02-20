import db from "../dbconfig";
import { buildUpdateQuery } from "./utils";

export interface ProjectDiscussionThread {
  id: number;
  project_id: number;
  creator_user_id: number;
  title: string;
  body: string;
  is_locked: boolean;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProjectDiscussionThreadListItem extends ProjectDiscussionThread {
  creator_username: string;
  reply_count: number;
  latest_reply_at: string | null;
  last_activity_at: string;
}

export interface ProjectDiscussionPost {
  id: number;
  thread_id: number;
  project_id: number;
  user_id: number;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectDiscussionPostWithUser extends ProjectDiscussionPost {
  username: string;
}

async function addProjectDiscussionThreadQuery(data: {
  project_id: number | string;
  creator_user_id: number | string;
  title: string;
  body: string;
}) {
  const query = {
    text: /*sql*/ `
      insert into public."ProjectDiscussionThread" (
        project_id,
        creator_user_id,
        title,
        body
      )
      values ($1, $2, $3, $4)
      returning *
    `,
    values: [data.project_id, data.creator_user_id, data.title, data.body],
  };
  return await db.query<ProjectDiscussionThread>(query);
}

async function getProjectDiscussionThreadQuery(id: number | string) {
  const query = {
    text: /*sql*/ `
      select *
      from public."ProjectDiscussionThread"
      where id = $1
      limit 1
    `,
    values: [id],
  };
  return await db.query<ProjectDiscussionThread>(query);
}

async function getProjectDiscussionThreadWithUserQuery(id: number | string) {
  const query = {
    text: /*sql*/ `
      select
        t.*,
        u.username as creator_username,
        coalesce(post_counts.reply_count, 0)::int as reply_count,
        post_counts.latest_reply_at,
        coalesce(post_counts.latest_reply_at, t.updated_at)::timestamptz as last_activity_at
      from public."ProjectDiscussionThread" t
      join public."User" u
        on u.id = t.creator_user_id
      left join lateral (
        select
          count(*)::int as reply_count,
          max(p.created_at) as latest_reply_at
        from public."ProjectDiscussionPost" p
        where p.thread_id = t.id
      ) post_counts on true
      where t.id = $1
      limit 1
    `,
    values: [id],
  };
  return await db.query<ProjectDiscussionThreadListItem>(query);
}

async function getProjectDiscussionThreadsByProjectQuery(
  projectId: number | string,
) {
  const query = {
    text: /*sql*/ `
      select
        t.*,
        u.username as creator_username,
        coalesce(post_counts.reply_count, 0)::int as reply_count,
        post_counts.latest_reply_at,
        coalesce(post_counts.latest_reply_at, t.updated_at)::timestamptz as last_activity_at
      from public."ProjectDiscussionThread" t
      join public."User" u
        on u.id = t.creator_user_id
      left join lateral (
        select
          count(*)::int as reply_count,
          max(p.created_at) as latest_reply_at
        from public."ProjectDiscussionPost" p
        where p.thread_id = t.id
      ) post_counts on true
      where t.project_id = $1
      order by
        t.is_pinned desc,
        coalesce(post_counts.latest_reply_at, t.updated_at) desc,
        t.id desc
    `,
    values: [projectId],
  };
  return await db.query<ProjectDiscussionThreadListItem>(query);
}

async function editProjectDiscussionThreadQuery(
  id: number | string,
  data: Partial<{
    title: string;
    body: string;
    is_locked: boolean;
    is_pinned: boolean;
    updated_at: string;
  }>,
) {
  const query = buildUpdateQuery("ProjectDiscussionThread", data, id);
  return await db.query<ProjectDiscussionThread>(query);
}

async function removeProjectDiscussionThreadQuery(id: number | string) {
  const query = {
    text: /*sql*/ `
      delete from public."ProjectDiscussionThread"
      where id = $1
      returning *
    `,
    values: [id],
  };
  return await db.query<ProjectDiscussionThread>(query);
}

async function addProjectDiscussionPostQuery(data: {
  thread_id: number | string;
  project_id: number | string;
  user_id: number | string;
  content: string;
}) {
  const query = {
    text: /*sql*/ `
      insert into public."ProjectDiscussionPost" (
        thread_id,
        project_id,
        user_id,
        content
      )
      values ($1, $2, $3, $4)
      returning *
    `,
    values: [data.thread_id, data.project_id, data.user_id, data.content],
  };
  return await db.query<ProjectDiscussionPost>(query);
}

async function getProjectDiscussionPostQuery(id: number | string) {
  const query = {
    text: /*sql*/ `
      select *
      from public."ProjectDiscussionPost"
      where id = $1
      limit 1
    `,
    values: [id],
  };
  return await db.query<ProjectDiscussionPost>(query);
}

async function getProjectDiscussionPostsByThreadQuery(threadId: number | string) {
  const query = {
    text: /*sql*/ `
      select
        p.*,
        u.username
      from public."ProjectDiscussionPost" p
      join public."User" u
        on u.id = p.user_id
      where p.thread_id = $1
      order by p.created_at asc, p.id asc
    `,
    values: [threadId],
  };
  return await db.query<ProjectDiscussionPostWithUser>(query);
}

async function removeProjectDiscussionPostQuery(id: number | string) {
  const query = {
    text: /*sql*/ `
      delete from public."ProjectDiscussionPost"
      where id = $1
      returning *
    `,
    values: [id],
  };
  return await db.query<ProjectDiscussionPost>(query);
}

export {
  addProjectDiscussionThreadQuery,
  getProjectDiscussionThreadQuery,
  getProjectDiscussionThreadWithUserQuery,
  getProjectDiscussionThreadsByProjectQuery,
  editProjectDiscussionThreadQuery,
  removeProjectDiscussionThreadQuery,
  addProjectDiscussionPostQuery,
  getProjectDiscussionPostQuery,
  getProjectDiscussionPostsByThreadQuery,
  removeProjectDiscussionPostQuery,
};
