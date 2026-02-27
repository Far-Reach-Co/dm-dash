import db from "../dbconfig";

export interface PublicWyrldDirectoryRow {
  id: number;
  title: string;
  description: string;
  user_id: number;
  is_pro: boolean;
  is_public_listed: boolean;
  public_join_mode: "invite_only" | "request";
  public_join_capacity: number | null;
  featured_record_id: number | null;
  owner_username: string;
  member_count: number;
  featured_record_title: string | null;
  featured_record_description: string | null;
}

async function getPublicWyrldDirectoryQuery(params?: {
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const search = String(params?.search || "").trim().toLowerCase();
  const limit = Math.max(1, Math.min(200, Number(params?.limit || 40)));
  const offset = Math.max(0, Number(params?.offset || 0));

  const query = {
    text: /*sql*/ `
      select
        p.id,
        p.title,
        p.description,
        p.user_id,
        p.is_pro,
        p.is_public_listed,
        p.public_join_mode,
        p.public_join_capacity,
        p.featured_record_id,
        owner.username as owner_username,
        (coalesce(member_counts.member_count, 0) + 1)::int as member_count,
        fr.title as featured_record_title,
        fr.description as featured_record_description
      from public."Project" p
      join public."User" owner
        on owner.id = p.user_id
      left join lateral (
        select count(*)::int as member_count
        from public."ProjectUser" pu
        where pu.project_id = p.id
      ) member_counts on true
      left join public."Record" fr
        on fr.id = p.featured_record_id
        and fr.project_id = p.id
      where p.is_public_listed = true
        and ($1 = '' or lower(p.title) like '%' || $1 || '%')
      order by p.id desc
      limit $2
      offset $3
    `,
    values: [search, limit, offset],
  };
  return await db.query<PublicWyrldDirectoryRow>(query);
}

export { getPublicWyrldDirectoryQuery };
