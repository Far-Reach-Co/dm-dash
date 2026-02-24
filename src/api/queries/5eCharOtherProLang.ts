import {
  asNumber,
  ensureSheetDataDocument,
  getArraySection,
  getSheetDataByGeneralIdQuery,
  nextItemId,
  setArraySection,
  updateSheetDataByGeneralIdQuery,
} from "./5eSheetDataUtils";

interface DndFiveEOtherProLang {
  id: number,
  general_id: number,
  type: string,
  proficiency: string
}

const SECTION_KEY = "otherProLangs";

function emptyResult<T>() {
  return { rows: [] as T[] } as any;
}

function rowResult<T>(row: T) {
  return { rows: [row] as T[] } as any;
}

function defaultOtherProLangRow(
  generalId: number,
  id: number,
  type: string,
): Record<string, unknown> {
  return {
    id,
    general_id: generalId,
    type: type || "",
    proficiency: "",
  };
}

async function add5eCharOtherProLangQuery(data: {
  general_id: number | string,
  type: string
}) {
  const generalId = asNumber(data.general_id);
  if (!generalId) return emptyResult<DndFiveEOtherProLang>();

  const sheetDataResult = await getSheetDataByGeneralIdQuery(generalId);
  const row = sheetDataResult.rows[0];
  const sheetData = ensureSheetDataDocument(row);
  if (!sheetData) return emptyResult<DndFiveEOtherProLang>();

  const rows = getArraySection(sheetData, SECTION_KEY);
  const nextId = nextItemId(rows);
  const created = defaultOtherProLangRow(generalId, nextId, data.type);
  rows.push(created);
  setArraySection(sheetData, SECTION_KEY, rows);
  await updateSheetDataByGeneralIdQuery(generalId, sheetData);
  return rowResult(created as unknown as DndFiveEOtherProLang);
}

async function duplicate5eCharOtherProLangsQuery(data: {
  oldGeneralId: number
  newGeneralId: number
}) {
  const generalId = asNumber(data.newGeneralId);
  if (!generalId) return;

  const sheetDataResult = await getSheetDataByGeneralIdQuery(generalId);
  const row = sheetDataResult.rows[0];
  const sheetData = ensureSheetDataDocument(row);
  if (!sheetData) return;

  const rows = getArraySection(sheetData, SECTION_KEY);
  if (!rows.length) return;

  const nextRows = rows.map((item) => ({
    ...item,
    general_id: generalId,
  }));
  setArraySection(sheetData, SECTION_KEY, nextRows);
  await updateSheetDataByGeneralIdQuery(generalId, sheetData);
  return;
}

async function get5eCharOtherProLangQuery(id: string, generalId: string | number) {
  const targetId = asNumber(id);
  const scopedGeneralId = asNumber(generalId);
  if (!targetId || !scopedGeneralId) return emptyResult<DndFiveEOtherProLang>();

  const sheetDataResult = await getSheetDataByGeneralIdQuery(scopedGeneralId);
  const row = sheetDataResult.rows[0];
  const sheetData = ensureSheetDataDocument(row);
  if (!sheetData) return emptyResult<DndFiveEOtherProLang>();

  const rows = getArraySection(sheetData, SECTION_KEY);
  const item = rows.find((entry) => (asNumber(entry.id) || 0) === targetId);
  if (!item) return emptyResult<DndFiveEOtherProLang>();
  if (!("general_id" in item)) item.general_id = scopedGeneralId;
  return rowResult(item as unknown as DndFiveEOtherProLang);

}

async function get5eCharOtherProLangsByGeneralQuery(generalId: string | number) {
  const sheetDataResult = await getSheetDataByGeneralIdQuery(generalId);
  const row = sheetDataResult.rows[0];
  const sheetData = ensureSheetDataDocument(row);
  if (!sheetData) return emptyResult<DndFiveEOtherProLang>();

  const rows = getArraySection(sheetData, SECTION_KEY)
    .map((item) => {
      if (!("general_id" in item)) item.general_id = asNumber(generalId) || 0;
      return item;
    })
    .sort((a, b) => (asNumber(a.id) || 0) - (asNumber(b.id) || 0));
  return { rows: rows as unknown as DndFiveEOtherProLang[] } as any;
}

async function remove5eCharOtherProLangQuery(id: string | number, generalId: string | number) {
  const rowData = await get5eCharOtherProLangQuery(String(id), generalId);
  const existing = rowData.rows[0] as any;
  if (!existing) return emptyResult<DndFiveEOtherProLang>();

  const scopedGeneralId = asNumber(generalId);
  const itemId = asNumber(existing.id);
  if (!scopedGeneralId || !itemId) return emptyResult<DndFiveEOtherProLang>();

  const sheetDataResult = await getSheetDataByGeneralIdQuery(scopedGeneralId);
  const row = sheetDataResult.rows[0];
  const sheetData = ensureSheetDataDocument(row);
  if (!sheetData) return emptyResult<DndFiveEOtherProLang>();

  const rows = getArraySection(sheetData, SECTION_KEY)
    .filter((item) => (asNumber(item.id) || 0) !== itemId);
  setArraySection(sheetData, SECTION_KEY, rows);
  return await updateSheetDataByGeneralIdQuery(scopedGeneralId, sheetData);
}

async function edit5eCharOtherProLangQuery(id: string, generalId: string | number, data: any) {
  const rowData = await get5eCharOtherProLangQuery(id, generalId);
  const existing = rowData.rows[0] as any;
  if (!existing) return emptyResult<DndFiveEOtherProLang>();

  const scopedGeneralId = asNumber(generalId);
  const itemId = asNumber(existing.id);
  if (!scopedGeneralId || !itemId) return emptyResult<DndFiveEOtherProLang>();

  const sheetDataResult = await getSheetDataByGeneralIdQuery(scopedGeneralId);
  const row = sheetDataResult.rows[0];
  const sheetData = ensureSheetDataDocument(row);
  if (!sheetData) return emptyResult<DndFiveEOtherProLang>();

  const rows = getArraySection(sheetData, SECTION_KEY);
  const index = rows.findIndex((item) => (asNumber(item.id) || 0) === itemId);
  if (index === -1) return emptyResult<DndFiveEOtherProLang>();

  const next = {
    ...rows[index],
    ...data,
    id: itemId,
    general_id: scopedGeneralId,
  };
  rows[index] = next;
  setArraySection(sheetData, SECTION_KEY, rows);
  await updateSheetDataByGeneralIdQuery(scopedGeneralId, sheetData);
  return rowResult(next as unknown as DndFiveEOtherProLang);
}

export {
  add5eCharOtherProLangQuery,
  get5eCharOtherProLangsByGeneralQuery,
  get5eCharOtherProLangQuery,
  remove5eCharOtherProLangQuery,
  edit5eCharOtherProLangQuery,
  duplicate5eCharOtherProLangsQuery
}
