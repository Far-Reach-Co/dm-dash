import {
  asNumber,
  ensureSheetDataDocument,
  getArraySection,
  getSheetDataByGeneralIdQuery,
  nextItemId,
  setArraySection,
  updateSheetDataByGeneralIdQuery,
} from "./5eSheetDataUtils";

interface DndFiveEFeat {
  id: number,
  type: string,
  title: string,
  description: string,
  general_id: number
}

const SECTION_KEY = "feats";

function emptyResult<T>() {
  return { rows: [] as T[] } as any;
}

function rowResult<T>(row: T) {
  return { rows: [row] as T[] } as any;
}

function defaultFeatRow(
  generalId: number,
  id: number,
  title: string,
  description: string,
  type: string,
): Record<string, unknown> {
  return {
    id,
    general_id: generalId,
    type: type || "",
    title: title || "",
    description: description || "",
  };
}

async function add5eCharFeatQuery(data: {
  general_id: number | string,
  title: string,
  description: string,
  type: string
}) {
  const generalId = asNumber(data.general_id);
  if (!generalId) return emptyResult<DndFiveEFeat>();

  const sheetDataResult = await getSheetDataByGeneralIdQuery(generalId);
  const row = sheetDataResult.rows[0];
  const sheetData = ensureSheetDataDocument(row);
  if (!sheetData) return emptyResult<DndFiveEFeat>();

  const feats = getArraySection(sheetData, SECTION_KEY);
  const nextId = nextItemId(feats);
  const created = defaultFeatRow(
    generalId,
    nextId,
    data.title,
    data.description,
    data.type,
  );
  feats.push(created);
  setArraySection(sheetData, SECTION_KEY, feats);
  await updateSheetDataByGeneralIdQuery(generalId, sheetData);
  return rowResult(created as unknown as DndFiveEFeat);
}

async function duplicate5eCharFeatsQuery(data: {
  oldGeneralId: number
  newGeneralId: number
}) {
  const generalId = asNumber(data.newGeneralId);
  if (!generalId) return;

  const sheetDataResult = await getSheetDataByGeneralIdQuery(generalId);
  const row = sheetDataResult.rows[0];
  const sheetData = ensureSheetDataDocument(row);
  if (!sheetData) return;

  const feats = getArraySection(sheetData, SECTION_KEY);
  if (!feats.length) return;

  const nextFeats = feats.map((item) => ({
    ...item,
    general_id: generalId,
  }));
  setArraySection(sheetData, SECTION_KEY, nextFeats);
  await updateSheetDataByGeneralIdQuery(generalId, sheetData);
  return;
}

async function get5eCharFeatQuery(id: string, generalId: string | number) {
  const targetId = asNumber(id);
  const scopedGeneralId = asNumber(generalId);
  if (!targetId || !scopedGeneralId) return emptyResult<DndFiveEFeat>();

  const sheetDataResult = await getSheetDataByGeneralIdQuery(scopedGeneralId);
  const row = sheetDataResult.rows[0];
  const sheetData = ensureSheetDataDocument(row);
  if (!sheetData) return emptyResult<DndFiveEFeat>();

  const feats = getArraySection(sheetData, SECTION_KEY);
  const feat = feats.find((item) => (asNumber(item.id) || 0) === targetId);
  if (!feat) return emptyResult<DndFiveEFeat>();
  if (!("general_id" in feat)) feat.general_id = scopedGeneralId;
  return rowResult(feat as unknown as DndFiveEFeat);

}

async function get5eCharFeatsByGeneralQuery(generalId: string | number) {
  const sheetDataResult = await getSheetDataByGeneralIdQuery(generalId);
  const row = sheetDataResult.rows[0];
  const sheetData = ensureSheetDataDocument(row);
  if (!sheetData) return emptyResult<DndFiveEFeat>();

  const feats = getArraySection(sheetData, SECTION_KEY)
    .map((item) => {
      if (!("general_id" in item)) item.general_id = asNumber(generalId) || 0;
      return item;
    })
    .sort((a, b) => (asNumber(a.id) || 0) - (asNumber(b.id) || 0));
  return { rows: feats as unknown as DndFiveEFeat[] } as any;
}

async function remove5eCharFeatQuery(id: string | number, generalId: string | number) {
  const featData = await get5eCharFeatQuery(String(id), generalId);
  const existing = featData.rows[0] as any;
  if (!existing) return emptyResult<DndFiveEFeat>();

  const scopedGeneralId = asNumber(generalId);
  const featId = asNumber(existing.id);
  if (!scopedGeneralId || !featId) return emptyResult<DndFiveEFeat>();

  const sheetDataResult = await getSheetDataByGeneralIdQuery(scopedGeneralId);
  const row = sheetDataResult.rows[0];
  const sheetData = ensureSheetDataDocument(row);
  if (!sheetData) return emptyResult<DndFiveEFeat>();

  const feats = getArraySection(sheetData, SECTION_KEY)
    .filter((item) => (asNumber(item.id) || 0) !== featId);
  setArraySection(sheetData, SECTION_KEY, feats);
  return await updateSheetDataByGeneralIdQuery(scopedGeneralId, sheetData);
}

async function edit5eCharFeatQuery(id: string, generalId: string | number, data: any) {
  const featData = await get5eCharFeatQuery(id, generalId);
  const existing = featData.rows[0] as any;
  if (!existing) return emptyResult<DndFiveEFeat>();

  const scopedGeneralId = asNumber(generalId);
  const featId = asNumber(existing.id);
  if (!scopedGeneralId || !featId) return emptyResult<DndFiveEFeat>();

  const sheetDataResult = await getSheetDataByGeneralIdQuery(scopedGeneralId);
  const row = sheetDataResult.rows[0];
  const sheetData = ensureSheetDataDocument(row);
  if (!sheetData) return emptyResult<DndFiveEFeat>();

  const feats = getArraySection(sheetData, SECTION_KEY);
  const index = feats.findIndex((item) => (asNumber(item.id) || 0) === featId);
  if (index === -1) return emptyResult<DndFiveEFeat>();

  const next = {
    ...feats[index],
    ...data,
    id: featId,
    general_id: scopedGeneralId,
  };
  feats[index] = next;
  setArraySection(sheetData, SECTION_KEY, feats);
  await updateSheetDataByGeneralIdQuery(scopedGeneralId, sheetData);
  return rowResult(next as unknown as DndFiveEFeat);
}

export {
  add5eCharFeatQuery,
  get5eCharFeatsByGeneralQuery,
  get5eCharFeatQuery,
  remove5eCharFeatQuery,
  edit5eCharFeatQuery,
  duplicate5eCharFeatsQuery
}
