import db from "../dbconfig";
import { buildUpdateQuery } from "./utils";

interface TableImage {
  id: number,
  project_id?: number,
  user_id?: number,
  image_id: number
  folder_id?: number
}

async function addTableImageByProjectQuery(data: {project_id: string, image_id: string, folder_id: string}) {
  const query = {
    text: /*sql*/ `insert into public."TableImage" (project_id, image_id, folder_id) values($1,$2,$3) returning *`,
    values: [
      data.project_id,
      data.image_id,
      data.folder_id
    ]
  }
  return await db.query<TableImage>(query)
}

async function addTableImageByUserQuery(data: {user_id: string, image_id: string, folder_id: string}) {
  const query = {
    text: /*sql*/ `insert into public."TableImage" (user_id, image_id, folder_id) values($1,$2,$3) returning *`,
    values: [
      data.user_id,
      data.image_id,
      data.folder_id
    ]
  }
  return await db.query<TableImage>(query)
}

async function getTableImageQuery(id: string) {
  const query = {
    text: /*sql*/ `select * from public."TableImage" where id = $1`,
    values: [id]
  }
  return await db.query<TableImage>(query)
}

async function getTableImagesByFolderQuery(folder_id: string | number) {
  const query = {
    text: /*sql*/ `select * from public."TableImage" where folder_id = $1`,
    values: [folder_id]
  }
  return await db.query<TableImage>(query)
}

async function getTableImagesByImageQuery(image_id: string | number) {
  const query = {
    text: /*sql*/ `select * from public."TableImage" where image_id = $1`,
    values: [image_id]
  }
  return await db.query<TableImage>(query)
}

async function getTableImagesByProjectQuery(project_id: string | number) {
  const query = {
    text: /*sql*/ `select * from public."TableImage" where project_id = $1`,
    values: [project_id]
  }
  return await db.query<TableImage>(query)
}

async function getTableImageByProjectAndImageQuery(
  project_id: string | number,
  image_id: string | number,
) {
  const query = {
    text: /*sql*/ `
      select *
      from public."TableImage"
      where project_id = $1
        and image_id = $2
      order by id desc
      limit 1
    `,
    values: [project_id, image_id],
  }
  return await db.query<TableImage>(query)
}

async function getTableImagesByUserQuery(user_id: string | number) {
  const query = {
    text: /*sql*/ `select * from public."TableImage" where user_id = $1`,
    values: [user_id]
  }
  return await db.query<TableImage>(query)
}

async function getTableImageByUserAndImageQuery(
  user_id: string | number,
  image_id: string | number,
) {
  const query = {
    text: /*sql*/ `
      select *
      from public."TableImage"
      where user_id = $1
        and image_id = $2
      order by id desc
      limit 1
    `,
    values: [user_id, image_id],
  }
  return await db.query<TableImage>(query)
}

interface TableImageWithImage extends TableImage {
  original_name: string;
  size: number;
  file_name: string;
  notes: string;
  is_blocked: boolean;
  created_at?: Date;
}

async function getTableImagesWithImageByProjectQuery(project_id: string | number) {
  const query = {
    text: /*sql*/ `
      SELECT ti.*, i.original_name, i.size, i.file_name, i.notes, i.created_at, ri.record_id, r.title, r.description
      FROM public."TableImage" ti
      JOIN public."Image" i ON ti.image_id = i.id
      LEFT JOIN public."RecordImage" ri ON i.id = ri.image_id
      LEFT JOIN public."Record" r ON ri.record_id = r.id
      WHERE ti.project_id = $1 AND i.is_blocked = false
    `,
    values: [project_id]
  }
  return await db.query<TableImageWithImage>(query)
}

async function getTableImagesWithImageByUserQuery(user_id: string | number) {
  const query = {
    text: /*sql*/ `
      SELECT ti.*, i.original_name, i.size, i.file_name, i.notes, i.created_at, ri.record_id, r.title AS record_title, r.description AS record_desc
      FROM public."TableImage" ti
      JOIN public."Image" i ON ti.image_id = i.id
      LEFT JOIN public."RecordImage" ri ON i.id = ri.image_id
      LEFT JOIN public."Record" r ON ri.record_id = r.id
      WHERE ti.user_id = $1 AND i.is_blocked = false
    `,
    values: [user_id]
  }
  return await db.query<TableImageWithImage>(query)
}

async function removeTableImageQuery(id: string | number) {
  const query = {
    text: /*sql*/ `delete from public."TableImage" where id = $1`,
    values: [id]
  }

  return await db.query<TableImage>(query)
}

async function removeTableImagesByProjectAndImageQuery(
  project_id: string | number,
  image_id: string | number,
) {
  const query = {
    text: /*sql*/ `delete from public."TableImage" where project_id = $1 and image_id = $2 returning *`,
    values: [project_id, image_id],
  };

  return await db.query<TableImage>(query);
}

async function removeTableImagesByUserAndImageQuery(
  user_id: string | number,
  image_id: string | number,
) {
  const query = {
    text: /*sql*/ `delete from public."TableImage" where user_id = $1 and image_id = $2 returning *`,
    values: [user_id, image_id],
  };

  return await db.query<TableImage>(query);
}

async function editTableImageQuery(id: string | number, data: any) {
  const query = buildUpdateQuery("TableImage", data, id);
  return await db.query<TableImage>(query);
}

async function getTableImageCountByUserQuery(user_id: string | number) {
  const query = {
    text: /*sql*/ `SELECT COUNT(*) FROM public."TableImage" WHERE user_id = $1`,
    values: [user_id],
  };
  return await db.query<{ count: string }>(query);
}

async function getTableImageCountByProjectQuery(project_id: string | number) {
  const query = {
    text: /*sql*/ `SELECT COUNT(*) FROM public."TableImage" WHERE project_id = $1`,
    values: [project_id],
  };
  return await db.query<{ count: string }>(query);
}

type TableImageSearchOptions = {
  limit?: number;
  offset?: number;
  q?: string | null;
  folderId?: number | null;
  sort?: "newest" | "name" | "size";
};

const getOrderByClause = (sort?: string) => {
  if (sort === "size") return `ORDER BY i.size DESC, i.id DESC`;
  if (sort === "newest") return `ORDER BY i.created_at DESC NULLS LAST, i.id DESC`;
  return `ORDER BY i.original_name ASC`;
};

const buildFilterClauses = (
  whereParts: string[],
  values: Array<string | number | null>,
  opts: TableImageSearchOptions,
) => {
  if (typeof opts.folderId !== "undefined") {
    if (opts.folderId === null) {
      whereParts.push(`ti.folder_id IS NULL`);
    } else {
      values.push(opts.folderId);
      whereParts.push(`ti.folder_id = $${values.length}`);
    }
  }
  if (opts.q) {
    values.push(`%${opts.q}%`);
    whereParts.push(
      `(i.original_name ILIKE $${values.length} OR i.notes ILIKE $${values.length})`,
    );
  }
};

async function getTableImagesWithImageByUserPaginatedQuery(
  user_id: string | number,
  opts: TableImageSearchOptions = {},
) {
  const values: Array<string | number | null> = [user_id];
  const whereParts = [`ti.user_id = $1`, `i.is_blocked = false`];
  buildFilterClauses(whereParts, values, opts);

  let limitOffset = "";
  if (typeof opts.limit === "number") {
    values.push(opts.limit);
    limitOffset += ` LIMIT $${values.length}`;
  }
  if (typeof opts.offset === "number") {
    values.push(opts.offset);
    limitOffset += ` OFFSET $${values.length}`;
  }

  const query = {
    text: /*sql*/ `
      SELECT ti.*, i.original_name, i.size, i.file_name, i.notes, i.created_at, ri.record_id, r.title AS record_title, r.description AS record_desc
      FROM public."TableImage" ti
      JOIN public."Image" i ON ti.image_id = i.id
      LEFT JOIN public."RecordImage" ri ON i.id = ri.image_id
      LEFT JOIN public."Record" r ON ri.record_id = r.id
      WHERE ${whereParts.join(" AND ")}
      ${getOrderByClause(opts.sort)}
      ${limitOffset}
    `,
    values,
  };
  return await db.query<TableImageWithImage>(query);
}

async function getTableImagesWithImageByProjectPaginatedQuery(
  project_id: string | number,
  opts: TableImageSearchOptions = {},
) {
  const values: Array<string | number | null> = [project_id];
  const whereParts = [`ti.project_id = $1`, `i.is_blocked = false`];
  buildFilterClauses(whereParts, values, opts);

  let limitOffset = "";
  if (typeof opts.limit === "number") {
    values.push(opts.limit);
    limitOffset += ` LIMIT $${values.length}`;
  }
  if (typeof opts.offset === "number") {
    values.push(opts.offset);
    limitOffset += ` OFFSET $${values.length}`;
  }

  const query = {
    text: /*sql*/ `
      SELECT ti.*, i.original_name, i.size, i.file_name, i.notes, i.created_at, ri.record_id, r.title, r.description
      FROM public."TableImage" ti
      JOIN public."Image" i ON ti.image_id = i.id
      LEFT JOIN public."RecordImage" ri ON i.id = ri.image_id
      LEFT JOIN public."Record" r ON ri.record_id = r.id
      WHERE ${whereParts.join(" AND ")}
      ${getOrderByClause(opts.sort)}
      ${limitOffset}
    `,
    values,
  };
  return await db.query<TableImageWithImage>(query);
}

async function getTableImageCountByUserFilteredQuery(
  user_id: string | number,
  opts: TableImageSearchOptions = {},
) {
  const values: Array<string | number | null> = [user_id];
  const whereParts = [`ti.user_id = $1`, `i.is_blocked = false`];
  buildFilterClauses(whereParts, values, opts);

  const query = {
    text: /*sql*/ `
      SELECT COUNT(*)
      FROM public."TableImage" ti
      JOIN public."Image" i ON ti.image_id = i.id
      WHERE ${whereParts.join(" AND ")}
    `,
    values,
  };
  return await db.query<{ count: string }>(query);
}

async function getTableImageCountByProjectFilteredQuery(
  project_id: string | number,
  opts: TableImageSearchOptions = {},
) {
  const values: Array<string | number | null> = [project_id];
  const whereParts = [`ti.project_id = $1`, `i.is_blocked = false`];
  buildFilterClauses(whereParts, values, opts);

  const query = {
    text: /*sql*/ `
      SELECT COUNT(*)
      FROM public."TableImage" ti
      JOIN public."Image" i ON ti.image_id = i.id
      WHERE ${whereParts.join(" AND ")}
    `,
    values,
  };
  return await db.query<{ count: string }>(query);
}

async function getTableImagesWithImageByUserInFolderQuery(user_id: string | number, folder_id: string | number | null) {
  const query = {
    text: /*sql*/ `
      SELECT ti.*, i.original_name, i.size, i.file_name, i.notes, i.created_at, ri.record_id, r.title AS record_title, r.description AS record_desc
      FROM public."TableImage" ti
      JOIN public."Image" i ON ti.image_id = i.id
      LEFT JOIN public."RecordImage" ri ON i.id = ri.image_id
      LEFT JOIN public."Record" r ON ri.record_id = r.id
      WHERE ti.user_id = $1 AND i.is_blocked = false
        AND ti.folder_id IS NOT DISTINCT FROM $2
      ORDER BY i.original_name ASC
    `,
    values: [user_id, folder_id]
  }
  return await db.query<TableImageWithImage>(query)
}

async function getTableImageCountsByUserQuery(user_id: string | number) {
  const query = {
    text: /*sql*/ `
      SELECT ti.folder_id, COUNT(*)::int AS count
      FROM public."TableImage" ti
      JOIN public."Image" i ON ti.image_id = i.id
      WHERE ti.user_id = $1 AND i.is_blocked = false
      GROUP BY ti.folder_id
    `,
    values: [user_id]
  }
  return await db.query<{ folder_id: number | null; count: number }>(query)
}

async function getTableImageCountsByProjectQuery(project_id: string | number) {
  const query = {
    text: /*sql*/ `
      SELECT ti.folder_id, COUNT(*)::int AS count
      FROM public."TableImage" ti
      JOIN public."Image" i ON ti.image_id = i.id
      WHERE ti.project_id = $1 AND i.is_blocked = false
      GROUP BY ti.folder_id
    `,
    values: [project_id]
  }
  return await db.query<{ folder_id: number | null; count: number }>(query)
}

async function getTableImagesWithImageByProjectInFolderQuery(project_id: string | number, folder_id: string | number | null) {
  const query = {
    text: /*sql*/ `
      SELECT ti.*, i.original_name, i.size, i.file_name, i.notes, i.created_at, ri.record_id, r.title, r.description
      FROM public."TableImage" ti
      JOIN public."Image" i ON ti.image_id = i.id
      LEFT JOIN public."RecordImage" ri ON i.id = ri.image_id
      LEFT JOIN public."Record" r ON ri.record_id = r.id
      WHERE ti.project_id = $1 AND i.is_blocked = false
        AND ti.folder_id IS NOT DISTINCT FROM $2
      ORDER BY i.original_name ASC
    `,
    values: [project_id, folder_id]
  }
  return await db.query<TableImageWithImage>(query)
}

export {
  addTableImageByProjectQuery,
  addTableImageByUserQuery,
  getTableImagesByImageQuery,
  getTableImagesByProjectQuery,
  getTableImageByProjectAndImageQuery,
  getTableImagesByUserQuery,
  getTableImageByUserAndImageQuery,
  getTableImagesByFolderQuery,
  getTableImageQuery,
  removeTableImageQuery,
  removeTableImagesByProjectAndImageQuery,
  removeTableImagesByUserAndImageQuery,
  editTableImageQuery,
  getTableImagesWithImageByProjectQuery,
  getTableImagesWithImageByUserQuery,
  getTableImageCountByUserQuery,
  getTableImageCountByProjectQuery,
  getTableImagesWithImageByUserPaginatedQuery,
  getTableImagesWithImageByProjectPaginatedQuery,
  getTableImagesWithImageByUserInFolderQuery,
  getTableImagesWithImageByProjectInFolderQuery,
  getTableImageCountsByUserQuery,
  getTableImageCountsByProjectQuery,
  getTableImageCountByUserFilteredQuery,
  getTableImageCountByProjectFilteredQuery,
  TableImageWithImage
}
