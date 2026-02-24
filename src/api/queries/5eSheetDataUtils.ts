import db from "../dbconfig";

interface SheetDataRow {
  id: number;
  sheet_data: Record<string, unknown> | null;
}

interface SheetDataMetaRow extends SheetDataRow {
  user_id: number;
  name: string;
}

function asObject(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function asArrayOfObjects(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item) => asObject(item) !== null) as Record<string, unknown>[];
}

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function nextItemId(items: Record<string, unknown>[]): number {
  let maxId = 0;
  for (const item of items) {
    const itemId = asNumber(item.id);
    if (itemId && itemId > maxId) maxId = itemId;
  }
  return maxId + 1;
}

async function getSheetDataMetaByGeneralIdQuery(generalId: string | number) {
  const query = {
    text: /*sql*/ `
      SELECT id, user_id, name, sheet_data
      FROM public."dnd_5e_character_general"
      WHERE id = $1
      LIMIT 1
    `,
    values: [generalId],
  };
  return await db.query<SheetDataMetaRow>(query);
}

async function getSheetDataByGeneralIdQuery(generalId: string | number) {
  const query = {
    text: /*sql*/ `
      SELECT id, sheet_data
      FROM public."dnd_5e_character_general"
      WHERE id = $1
      LIMIT 1
    `,
    values: [generalId],
  };
  return await db.query<SheetDataRow>(query);
}

async function getAllSheetDataRowsQuery() {
  const query = {
    text: /*sql*/ `
      SELECT id, sheet_data
      FROM public."dnd_5e_character_general"
      ORDER BY id ASC
    `,
  };
  return await db.query<SheetDataRow>(query);
}

async function updateSheetDataByGeneralIdQuery(
  generalId: string | number,
  nextSheetData: Record<string, unknown>,
) {
  const query = {
    text: /*sql*/ `
      UPDATE public."dnd_5e_character_general"
      SET
        sheet_data = $2::jsonb,
        sheet_schema_version = 1,
        sheet_data_updated_at = now()
      WHERE id = $1
      RETURNING id, sheet_data
    `,
    values: [generalId, JSON.stringify(nextSheetData)],
  };
  return await db.query<SheetDataRow>(query);
}

function ensureSheetDataDocument(
  row: SheetDataRow | SheetDataMetaRow | undefined,
): Record<string, unknown> | null {
  if (!row) return null;
  const parsed = asObject(row.sheet_data);
  if (!parsed) return {};
  return cloneJson(parsed);
}

function getObjectSection(
  sheetData: Record<string, unknown>,
  sectionKey: string,
): Record<string, unknown> | null {
  return asObject(sheetData[sectionKey]);
}

function setObjectSection(
  sheetData: Record<string, unknown>,
  sectionKey: string,
  value: Record<string, unknown>,
): void {
  sheetData[sectionKey] = value;
}

function getArraySection(
  sheetData: Record<string, unknown>,
  sectionKey: string,
): Record<string, unknown>[] {
  return asArrayOfObjects(sheetData[sectionKey]);
}

function setArraySection(
  sheetData: Record<string, unknown>,
  sectionKey: string,
  value: Record<string, unknown>[],
): void {
  sheetData[sectionKey] = value;
}

export {
  asNumber,
  cloneJson,
  nextItemId,
  getSheetDataMetaByGeneralIdQuery,
  getSheetDataByGeneralIdQuery,
  getAllSheetDataRowsQuery,
  updateSheetDataByGeneralIdQuery,
  ensureSheetDataDocument,
  getObjectSection,
  setObjectSection,
  getArraySection,
  setArraySection,
};
