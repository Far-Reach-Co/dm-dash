import db from "../dbconfig";
import { buildUpdateQuery } from "./utils";

export type LibraryPackVisibility = "private" | "project" | "public_pro";

export interface LibraryPack {
  id: number;
  owner_user_id: number | null;
  owner_project_id: number | null;
  title: string;
  description: string;
  tags: string[];
  visibility: LibraryPackVisibility;
  is_pro_only: boolean;
  is_published: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface LibraryPackImage {
  id: number;
  pack_id: number;
  image_id: number;
  sort_order: number;
  created_at: Date;
}

export interface LibraryPackImageWithImage extends LibraryPackImage {
  original_name: string;
  size: number;
  file_name: string;
  notes: string;
  is_blocked: boolean;
}

export interface LibraryPackMembershipByImage {
  pack_id: number;
  pack_title: string;
  pack_image_id: number;
}

export interface LibraryPackForTable extends LibraryPack {
  is_attached: boolean;
  image_count: number;
  is_owner?: boolean;
}

export interface LibraryPackInstall {
  id: number;
  owner_user_id: number | null;
  owner_project_id: number | null;
  pack_id: number;
  created_at: Date;
}

export async function addLibraryPackByUserQuery(data: {
  owner_user_id: string | number;
  title: string;
  description?: string;
  tags?: string[];
  visibility?: LibraryPackVisibility;
  is_pro_only?: boolean;
  is_published?: boolean;
}) {
  const query = {
    text: /*sql*/ `
      insert into public."LibraryPack"
        (owner_user_id, title, description, tags, visibility, is_pro_only, is_published)
      values ($1, $2, $3, $4, $5, $6, $7)
      returning *
    `,
    values: [
      data.owner_user_id,
      data.title,
      data.description || "",
      Array.isArray(data.tags) ? data.tags : [],
      data.visibility || "private",
      typeof data.is_pro_only === "boolean" ? data.is_pro_only : true,
      typeof data.is_published === "boolean" ? data.is_published : false,
    ],
  };
  return await db.query<LibraryPack>(query);
}

export async function addLibraryPackByProjectQuery(data: {
  owner_project_id: string | number;
  title: string;
  description?: string;
  tags?: string[];
  visibility?: LibraryPackVisibility;
  is_pro_only?: boolean;
  is_published?: boolean;
}) {
  const query = {
    text: /*sql*/ `
      insert into public."LibraryPack"
        (owner_project_id, title, description, tags, visibility, is_pro_only, is_published)
      values ($1, $2, $3, $4, $5, $6, $7)
      returning *
    `,
    values: [
      data.owner_project_id,
      data.title,
      data.description || "",
      Array.isArray(data.tags) ? data.tags : [],
      data.visibility || "project",
      typeof data.is_pro_only === "boolean" ? data.is_pro_only : true,
      typeof data.is_published === "boolean" ? data.is_published : false,
    ],
  };
  return await db.query<LibraryPack>(query);
}

export async function getLibraryPackQuery(id: string | number) {
  const query = {
    text: /*sql*/ `select * from public."LibraryPack" where id = $1`,
    values: [id],
  };
  return await db.query<LibraryPack>(query);
}

export async function editLibraryPackQuery(id: string | number, data: any) {
  const patch = {
    ...data,
    updated_at: new Date(),
  };
  const query = buildUpdateQuery("LibraryPack", patch, id);
  return await db.query<LibraryPack>(query);
}

export async function removeLibraryPackQuery(id: string | number) {
  const query = {
    text: /*sql*/ `delete from public."LibraryPack" where id = $1 returning *`,
    values: [id],
  };
  return await db.query<LibraryPack>(query);
}

export async function addLibraryPackImageQuery(data: {
  pack_id: string | number;
  image_id: string | number;
  sort_order?: number;
}) {
  const query = {
    text: /*sql*/ `
      insert into public."LibraryPackImage"
        (pack_id, image_id, sort_order)
      values ($1, $2, $3)
      on conflict (pack_id, image_id)
      do update set
        sort_order = excluded.sort_order
      returning *
    `,
    values: [
      data.pack_id,
      data.image_id,
      typeof data.sort_order === "number" ? data.sort_order : 0,
    ],
  };
  return await db.query<LibraryPackImage>(query);
}

export async function removeLibraryPackImageQuery(id: string | number) {
  const query = {
    text: /*sql*/ `delete from public."LibraryPackImage" where id = $1 returning *`,
    values: [id],
  };
  return await db.query<LibraryPackImage>(query);
}

export async function getLibraryPackImagesQuery(packId: string | number) {
  const query = {
    text: /*sql*/ `
      select
        lpi.id,
        lpi.pack_id,
        lpi.image_id,
        lpi.sort_order,
        lpi.created_at,
        i.original_name,
        i.size,
        i.file_name,
        i.notes,
        i.is_blocked
      from public."LibraryPackImage" lpi
      join public."Image" i on i.id = lpi.image_id
      where lpi.pack_id = $1 and i.is_blocked = false
      order by lpi.sort_order asc, lpi.id asc
    `,
    values: [packId],
  };
  return await db.query<LibraryPackImageWithImage>(query);
}

export async function getLibraryPackImageQuery(id: string | number) {
  const query = {
    text: /*sql*/ `select * from public."LibraryPackImage" where id = $1`,
    values: [id],
  };
  return await db.query<LibraryPackImage>(query);
}

export async function getLibraryPackMembershipsByImageForUserQuery(
  ownerUserId: string | number,
  imageId: string | number,
) {
  const query = {
    text: /*sql*/ `
      select
        lp.id as pack_id,
        lp.title as pack_title,
        lpi.id as pack_image_id
      from public."LibraryPackImage" lpi
      join public."LibraryPack" lp on lp.id = lpi.pack_id
      where lpi.image_id = $2
        and lp.owner_user_id = $1
      order by lp.updated_at desc, lp.id desc
    `,
    values: [ownerUserId, imageId],
  };
  return await db.query<LibraryPackMembershipByImage>(query);
}

export async function getLibraryPackMembershipsByImageForProjectQuery(
  ownerProjectId: string | number,
  imageId: string | number,
) {
  const query = {
    text: /*sql*/ `
      select
        lp.id as pack_id,
        lp.title as pack_title,
        lpi.id as pack_image_id
      from public."LibraryPackImage" lpi
      join public."LibraryPack" lp on lp.id = lpi.pack_id
      where lpi.image_id = $2
        and lp.owner_project_id = $1
      order by lp.updated_at desc, lp.id desc
    `,
    values: [ownerProjectId, imageId],
  };
  return await db.query<LibraryPackMembershipByImage>(query);
}

export async function isImageInInstalledPacksByUserQuery(
  ownerUserId: string | number,
  imageId: string | number,
) {
  const query = {
    text: /*sql*/ `
      select exists (
        select 1
        from public."LibraryPackInstall" lpi
        join public."LibraryPackImage" lpi_img on lpi_img.pack_id = lpi.pack_id
        where lpi.owner_user_id = $1
          and lpi_img.image_id = $2
      ) as is_installed_image
    `,
    values: [ownerUserId, imageId],
  };
  return await db.query<{ is_installed_image: boolean }>(query);
}

export async function isImageInInstalledPacksByProjectQuery(
  ownerProjectId: string | number,
  imageId: string | number,
) {
  const query = {
    text: /*sql*/ `
      select exists (
        select 1
        from public."LibraryPackInstall" lpi
        join public."LibraryPackImage" lpi_img on lpi_img.pack_id = lpi.pack_id
        where lpi.owner_project_id = $1
          and lpi_img.image_id = $2
      ) as is_installed_image
    `,
    values: [ownerProjectId, imageId],
  };
  return await db.query<{ is_installed_image: boolean }>(query);
}

export async function addLibraryPackInstallByUserQuery(data: {
  owner_user_id: string | number;
  pack_id: string | number;
}) {
  const query = {
    text: /*sql*/ `
      insert into public."LibraryPackInstall" (owner_user_id, pack_id)
      values ($1, $2)
      on conflict (owner_user_id, pack_id)
      do update set pack_id = excluded.pack_id
      returning *
    `,
    values: [data.owner_user_id, data.pack_id],
  };
  return await db.query<LibraryPackInstall>(query);
}

export async function addLibraryPackInstallByProjectQuery(data: {
  owner_project_id: string | number;
  pack_id: string | number;
}) {
  const query = {
    text: /*sql*/ `
      insert into public."LibraryPackInstall" (owner_project_id, pack_id)
      values ($1, $2)
      on conflict (owner_project_id, pack_id)
      do update set pack_id = excluded.pack_id
      returning *
    `,
    values: [data.owner_project_id, data.pack_id],
  };
  return await db.query<LibraryPackInstall>(query);
}

export async function removeLibraryPackInstallByUserQuery(
  ownerUserId: string | number,
  packId: string | number,
) {
  const query = {
    text: /*sql*/ `
      delete from public."LibraryPackInstall"
      where owner_user_id = $1 and pack_id = $2
      returning *
    `,
    values: [ownerUserId, packId],
  };
  return await db.query<LibraryPackInstall>(query);
}

export async function removeLibraryPackInstallByProjectQuery(
  ownerProjectId: string | number,
  packId: string | number,
) {
  const query = {
    text: /*sql*/ `
      delete from public."LibraryPackInstall"
      where owner_project_id = $1 and pack_id = $2
      returning *
    `,
    values: [ownerProjectId, packId],
  };
  return await db.query<LibraryPackInstall>(query);
}

export async function getInstalledLibraryPacksByUserQuery(
  ownerUserId: string | number,
) {
  const query = {
    text: /*sql*/ `
      select
        lp.*,
        (lp.owner_user_id = $1) as is_owner,
        true as is_attached,
        coalesce(img_counts.image_count, 0)::int as image_count
      from public."LibraryPackInstall" lpi
      join public."LibraryPack" lp on lp.id = lpi.pack_id
      left join (
        select pack_id, count(*)::int as image_count
        from public."LibraryPackImage"
        group by pack_id
      ) img_counts on img_counts.pack_id = lp.id
      where lpi.owner_user_id = $1
      order by lpi.created_at desc, lp.updated_at desc, lp.id desc
    `,
    values: [ownerUserId],
  };
  return await db.query<LibraryPackForTable>(query);
}

export async function getInstalledLibraryPacksByProjectQuery(
  ownerProjectId: string | number,
) {
  const query = {
    text: /*sql*/ `
      select
        lp.*,
        (lp.owner_project_id = $1) as is_owner,
        true as is_attached,
        coalesce(img_counts.image_count, 0)::int as image_count
      from public."LibraryPackInstall" lpi
      join public."LibraryPack" lp on lp.id = lpi.pack_id
      left join (
        select pack_id, count(*)::int as image_count
        from public."LibraryPackImage"
        group by pack_id
      ) img_counts on img_counts.pack_id = lp.id
      where lpi.owner_project_id = $1
      order by lpi.created_at desc, lp.updated_at desc, lp.id desc
    `,
    values: [ownerProjectId],
  };
  return await db.query<LibraryPackForTable>(query);
}

export async function getOwnedLibraryPacksByUserQuery(
  ownerUserId: string | number,
) {
  const query = {
    text: /*sql*/ `
      select
        lp.*,
        true as is_owner,
        false as is_attached,
        coalesce(img_counts.image_count, 0)::int as image_count
      from public."LibraryPack" lp
      left join (
        select pack_id, count(*)::int as image_count
        from public."LibraryPackImage"
        group by pack_id
      ) img_counts on img_counts.pack_id = lp.id
      where lp.owner_user_id = $1
      order by lp.updated_at desc, lp.id desc
    `,
    values: [ownerUserId],
  };
  return await db.query<LibraryPackForTable>(query);
}

export async function getOwnedLibraryPacksByProjectQuery(
  ownerProjectId: string | number,
) {
  const query = {
    text: /*sql*/ `
      select
        lp.*,
        true as is_owner,
        false as is_attached,
        coalesce(img_counts.image_count, 0)::int as image_count
      from public."LibraryPack" lp
      left join (
        select pack_id, count(*)::int as image_count
        from public."LibraryPackImage"
        group by pack_id
      ) img_counts on img_counts.pack_id = lp.id
      where lp.owner_project_id = $1
      order by lp.updated_at desc, lp.id desc
    `,
    values: [ownerProjectId],
  };
  return await db.query<LibraryPackForTable>(query);
}

export async function discoverLibraryPacksQuery(params: {
  userId: string | number;
  projectIds: Array<string | number>;
  scopeProjectId?: string | number | null;
  includePublicPro: boolean;
  publishedOnly?: boolean;
  q?: string;
  limit?: number;
  offset?: number;
}) {
  const values: Array<string | number | boolean> = [params.userId];
  const accessClauses: string[] = [`lp.owner_user_id = $1`];
  const ownerClauses: string[] = [];

  if (params.projectIds.length) {
    const placeholders = params.projectIds.map((id) => {
      values.push(id);
      return `$${values.length}`;
    });
    accessClauses.push(`lp.owner_project_id in (${placeholders.join(", ")})`);
  }

  if (params.includePublicPro) {
    accessClauses.push(`(lp.visibility = 'public_pro' and lp.is_published = true)`);
  }

  if (params.scopeProjectId) {
    values.push(params.scopeProjectId);
    ownerClauses.push(`lp.owner_project_id = $${values.length}`);
  } else {
    ownerClauses.push(`lp.owner_user_id = $1`);
  }

  const filterClauses: string[] = [];
  if (params.publishedOnly) {
    filterClauses.push(`lp.is_published = true`);
  }
  if (params.q && params.q.trim()) {
    values.push(`%${params.q.trim()}%`);
    filterClauses.push(
      `(lp.title ilike $${values.length} or lp.description ilike $${values.length} or array_to_string(lp.tags, ', ') ilike $${values.length})`,
    );
  }

  const limit = Math.min(Math.max(params.limit || 50, 1), 100);
  const offset = Math.max(params.offset || 0, 0);
  values.push(limit);
  const limitRef = `$${values.length}`;
  values.push(offset);
  const offsetRef = `$${values.length}`;

  const query = {
    text: /*sql*/ `
      select
        lp.*,
        (${ownerClauses.length ? ownerClauses.join(" or ") : "false"}) as is_owner,
        false as is_attached,
        coalesce(img_counts.image_count, 0)::int as image_count
      from public."LibraryPack" lp
      left join (
        select pack_id, count(*)::int as image_count
        from public."LibraryPackImage"
        group by pack_id
      ) img_counts on img_counts.pack_id = lp.id
      where (${accessClauses.join(" or ")})
      ${filterClauses.length ? `and (${filterClauses.join(" and ")})` : ""}
      order by lp.updated_at desc, lp.id desc
      limit ${limitRef}
      offset ${offsetRef}
    `,
    values,
  };
  return await db.query<LibraryPackForTable>(query);
}
