import db from "../dbconfig";
import type { TableMode } from "../../lib/tableAuthz";

export interface TableViewTemplate {
  id: number;
  title: string;
  data: Record<string, unknown>;
  mode: TableMode;
  date_created: string;
  user_id: number | null;
  project_id: number | null;
  source_table_view_id: number | null;
}

export async function addTableViewTemplateByUserQuery(data: {
  user_id: string | number;
  title: string;
  mode: TableMode;
  table_data: Record<string, unknown>;
  source_table_view_id: string | number;
}) {
  return await db.query<TableViewTemplate>({
    text: /*sql*/ `
      insert into public."TableViewTemplate" (
        user_id,
        title,
        mode,
        data,
        source_table_view_id
      )
      values ($1, $2, $3, $4, $5)
      returning *
    `,
    values: [
      data.user_id,
      data.title,
      data.mode,
      data.table_data,
      data.source_table_view_id,
    ],
  });
}

export async function addTableViewTemplateByProjectQuery(data: {
  project_id: string | number;
  title: string;
  mode: TableMode;
  table_data: Record<string, unknown>;
  source_table_view_id: string | number;
}) {
  return await db.query<TableViewTemplate>({
    text: /*sql*/ `
      insert into public."TableViewTemplate" (
        project_id,
        title,
        mode,
        data,
        source_table_view_id
      )
      values ($1, $2, $3, $4, $5)
      returning *
    `,
    values: [
      data.project_id,
      data.title,
      data.mode,
      data.table_data,
      data.source_table_view_id,
    ],
  });
}

export async function getTableViewTemplatesByUserQuery(
  userId: string | number,
) {
  return await db.query<TableViewTemplate>({
    text: /*sql*/ `
      select *
      from public."TableViewTemplate"
      where user_id = $1
      order by date_created desc, id desc
    `,
    values: [userId],
  });
}

export async function getTableViewTemplatesByProjectQuery(
  projectId: string | number,
) {
  return await db.query<TableViewTemplate>({
    text: /*sql*/ `
      select *
      from public."TableViewTemplate"
      where project_id = $1
      order by date_created desc, id desc
    `,
    values: [projectId],
  });
}

export async function getTableViewTemplateQuery(id: string | number) {
  return await db.query<TableViewTemplate>({
    text: /*sql*/ `
      select *
      from public."TableViewTemplate"
      where id = $1
    `,
    values: [id],
  });
}

export async function removeTableViewTemplateQuery(id: string | number) {
  return await db.query<TableViewTemplate>({
    text: /*sql*/ `
      delete from public."TableViewTemplate"
      where id = $1
    `,
    values: [id],
  });
}
