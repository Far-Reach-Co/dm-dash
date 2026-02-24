import {
  asNumber,
  ensureSheetDataDocument,
  getObjectSection,
  getSheetDataByGeneralIdQuery,
  setObjectSection,
  updateSheetDataByGeneralIdQuery,
} from "./5eSheetDataUtils";

export interface DndFiveEBackground {
  id: number,
  general_id: number,
  personality_traits: string,
  ideals: string,
  bonds: string,
  flaws: string,
  backstory: string,
  age: number,
  height: string,
  weight: string,
  eyes: string,
  skin: string,
  hair: string,
  other_info: string,
  background: string,
  alignment: string,
  appearance: string,
  allies_and_organizations: string
}

const DEFAULT_BACKGROUND: Record<string, unknown> = {
  personality_traits: "",
  ideals: "",
  bonds: "",
  flaws: "",
  backstory: "",
  age: null,
  height: "",
  weight: "",
  eyes: "",
  skin: "",
  hair: "",
  other_info: "",
  background: "",
  alignment: "",
  appearance: "",
  allies_and_organizations: "",
};

function ensureBackgroundSection(
  sheetData: Record<string, unknown>,
  generalId: string | number,
): Record<string, unknown> {
  const existing = getObjectSection(sheetData, "background");
  if (existing) {
    if (!("id" in existing)) existing.id = asNumber(generalId) || 0;
    if (!("general_id" in existing)) existing.general_id = asNumber(generalId) || 0;
    return existing;
  }
  const created: Record<string, unknown> = {
    id: asNumber(generalId) || 0,
    general_id: asNumber(generalId) || 0,
    ...DEFAULT_BACKGROUND,
  };
  setObjectSection(sheetData, "background", created);
  return created;
}

function emptyResult<T>() {
  return { rows: [] as T[] } as any;
}

function rowResult<T>(row: T) {
  return { rows: [row] as T[] } as any;
}

async function add5eCharBackQuery(data: { general_id: any }) {
  const sheetDataResult = await getSheetDataByGeneralIdQuery(data.general_id);
  const row = sheetDataResult.rows[0];
  const sheetData = ensureSheetDataDocument(row);
  if (!sheetData) return emptyResult<DndFiveEBackground>();

  const background = ensureBackgroundSection(sheetData, data.general_id);
  await updateSheetDataByGeneralIdQuery(data.general_id, sheetData);
  return rowResult(background as unknown as DndFiveEBackground);
}

async function duplicate5eCharBackQuery(data: {
  oldGeneralId: number
  newGeneralId: number
}) {
  const generalId = asNumber(data.newGeneralId);
  if (!generalId) return;

  const sheetDataResult = await getSheetDataByGeneralIdQuery(generalId);
  const row = sheetDataResult.rows[0];
  const sheetData = ensureSheetDataDocument(row);
  if (!sheetData) return;

  const background = ensureBackgroundSection(sheetData, generalId);
  const next = {
    ...background,
    id: generalId,
    general_id: generalId,
  };
  setObjectSection(sheetData, "background", next);
  await updateSheetDataByGeneralIdQuery(generalId, sheetData);
  return;
}

async function get5eCharBackQuery(generalId: string | number) {
  return await get5eCharBackByGeneralQuery(generalId);
}

async function get5eCharBackByGeneralQuery(generalId: string | number) {
  const sheetDataResult = await getSheetDataByGeneralIdQuery(generalId);
  const row = sheetDataResult.rows[0];
  const sheetData = ensureSheetDataDocument(row);
  if (!sheetData) return emptyResult<DndFiveEBackground>();

  const background = ensureBackgroundSection(sheetData, generalId);
  await updateSheetDataByGeneralIdQuery(generalId, sheetData);
  return rowResult(background as unknown as DndFiveEBackground);
}

async function remove5eCharBackQuery(generalId: string | number) {
  const backgroundData = await get5eCharBackByGeneralQuery(generalId);
  const background = backgroundData.rows[0] as any;
  if (!background) return emptyResult<DndFiveEBackground>();

  const scopedGeneralId = asNumber(generalId);
  if (!scopedGeneralId) return emptyResult<DndFiveEBackground>();

  const sheetDataResult = await getSheetDataByGeneralIdQuery(scopedGeneralId);
  const row = sheetDataResult.rows[0];
  const sheetData = ensureSheetDataDocument(row);
  if (!sheetData) return emptyResult<DndFiveEBackground>();

  setObjectSection(sheetData, "background", {
    id: scopedGeneralId,
    general_id: scopedGeneralId,
    ...DEFAULT_BACKGROUND,
  });
  return await updateSheetDataByGeneralIdQuery(scopedGeneralId, sheetData);
}

async function edit5eCharBackQuery(generalId: string, data: any) {
  const backgroundData = await get5eCharBackByGeneralQuery(generalId);
  const existing = backgroundData.rows[0] as any;
  if (!existing) return emptyResult<DndFiveEBackground>();

  const scopedGeneralId = asNumber(generalId);
  if (!scopedGeneralId) return emptyResult<DndFiveEBackground>();

  const sheetDataResult = await getSheetDataByGeneralIdQuery(scopedGeneralId);
  const row = sheetDataResult.rows[0];
  const sheetData = ensureSheetDataDocument(row);
  if (!sheetData) return emptyResult<DndFiveEBackground>();

  const current = ensureBackgroundSection(sheetData, scopedGeneralId);
  const next = {
    ...current,
    ...data,
    id: current.id,
    general_id: current.general_id,
  };
  setObjectSection(sheetData, "background", next);
  await updateSheetDataByGeneralIdQuery(scopedGeneralId, sheetData);
  return rowResult(next as unknown as DndFiveEBackground);
}

export {
  add5eCharBackQuery,
  get5eCharBackByGeneralQuery,
  get5eCharBackQuery,
  remove5eCharBackQuery,
  edit5eCharBackQuery,
  duplicate5eCharBackQuery
}
