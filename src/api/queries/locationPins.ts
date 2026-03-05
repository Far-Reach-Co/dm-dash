import db from "../dbconfig";
import { buildUpdateQuery } from "./utils";

interface LocationPin {
  id: number;
  table_view_id: number;
  canvas_object_id: string;
  title: string;
  description: string;
  image_id: number | null;
  portal_table_view_ids: number[];
  created_at: string;
  updated_at: string;
}

interface LocationPinWithAttachments extends LocationPin {
  attachments: Array<{ id: number; uuid: string; title: string }>;
}

async function getLocationPinsByTableViewQuery(tableViewId: number) {
  const query = {
    text: /*sql*/ `
      SELECT
        lp.*,
        COALESCE(
          json_agg(
            json_build_object('id', attached.id, 'uuid', attached.uuid, 'title', attached.title)
          ) FILTER (WHERE attached.id IS NOT NULL),
          '[]'
        ) AS attachments
      FROM public."LocationPin" lp
      LEFT JOIN LATERAL (
        SELECT id, uuid, title
        FROM public."TableView"
        WHERE id = ANY(lp.portal_table_view_ids)
      ) attached ON true
      WHERE lp.table_view_id = $1
      GROUP BY lp.id
      ORDER BY lp.created_at DESC
    `,
    values: [tableViewId],
  };
  return await db.query<LocationPinWithAttachments>(query);
}

async function getLocationPinByIdQuery(id: number) {
  const query = {
    text: /*sql*/ `
      SELECT *
      FROM public."LocationPin"
      WHERE id = $1
    `,
    values: [id],
  };
  return await db.query<LocationPin>(query);
}

async function getLocationPinByTableViewAndCanvasObjectQuery(
  tableViewId: number,
  canvasObjectId: string,
) {
  const query = {
    text: /*sql*/ `
      SELECT *
      FROM public."LocationPin"
      WHERE table_view_id = $1
        AND canvas_object_id = $2
      ORDER BY id DESC
      LIMIT 1
    `,
    values: [tableViewId, canvasObjectId],
  };
  return await db.query<LocationPin>(query);
}

async function addLocationPinQuery(data: {
  table_view_id: number;
  canvas_object_id: string;
  title: string;
  description?: string;
  image_id?: number | null;
  portal_table_view_ids?: number[];
}) {
  const query = {
    text: /*sql*/ `
      INSERT INTO public."LocationPin"
        (table_view_id, canvas_object_id, title, description, image_id, portal_table_view_ids)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `,
    values: [
      data.table_view_id,
      data.canvas_object_id,
      data.title,
      data.description ?? "",
      data.image_id ?? null,
      data.portal_table_view_ids ?? [],
    ],
  };
  return await db.query<LocationPin>(query);
}

async function removeLocationPinQuery(id: number) {
  const query = {
    text: /*sql*/ `
      DELETE FROM public."LocationPin"
      WHERE id = $1
    `,
    values: [id],
  };
  return await db.query<LocationPin>(query);
}

async function updateLocationPinQuery(id: number, data: Partial<LocationPin>) {
  const payload = {
    ...data,
    updated_at: new Date().toISOString(),
  };
  const query = buildUpdateQuery("LocationPin", payload, id);
  return await db.query<LocationPin>(query);
}

export {
  getLocationPinsByTableViewQuery,
  addLocationPinQuery,
  removeLocationPinQuery,
  updateLocationPinQuery,
  getLocationPinByIdQuery,
  getLocationPinByTableViewAndCanvasObjectQuery,
};
