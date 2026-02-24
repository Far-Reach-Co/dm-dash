import {
  asNumber,
  ensureSheetDataDocument,
  getObjectSection,
  getSheetDataByGeneralIdQuery,
  setObjectSection,
  updateSheetDataByGeneralIdQuery,
} from "./5eSheetDataUtils";

export interface DndFiveESpellSlots {
  id: number,
  general_id: number,
  first_total: number,
  first_expended: number,
  second_total: number,
  second_expended: number,
  third_total: number,
  third_expended: number,
  fourth_total: number,
  fourth_expended: number,
  fifth_total: number,
  fifth_expended: number,
  sixth_total: number,
  sixth_expended: number,
  seventh_total: number,
  seventh_expended: number,
  eigth_total: number,
  eigth_expended: number,
  nineth_total: number,
  nineth_expended: number,
  spell_casting_ability: string
}

const DEFAULT_SPELL_SLOTS: Record<string, unknown> = {
  first_total: 0,
  first_expended: 0,
  second_total: 0,
  second_expended: 0,
  third_total: 0,
  third_expended: 0,
  fourth_total: 0,
  fourth_expended: 0,
  fifth_total: 0,
  fifth_expended: 0,
  sixth_total: 0,
  sixth_expended: 0,
  seventh_total: 0,
  seventh_expended: 0,
  eigth_total: 0,
  eigth_expended: 0,
  nineth_total: 0,
  nineth_expended: 0,
  spell_casting_ability: "wisdom",
};

function ensureSpellSlotsSection(
  sheetData: Record<string, unknown>,
  generalId: string | number,
): Record<string, unknown> {
  const existing = getObjectSection(sheetData, "spellSlots");
  if (existing) {
    if (!("id" in existing)) existing.id = asNumber(generalId) || 0;
    if (!("general_id" in existing)) existing.general_id = asNumber(generalId) || 0;
    return existing;
  }
  const created: Record<string, unknown> = {
    id: asNumber(generalId) || 0,
    general_id: asNumber(generalId) || 0,
    ...DEFAULT_SPELL_SLOTS,
  };
  setObjectSection(sheetData, "spellSlots", created);
  return created;
}

function emptyResult<T>() {
  return { rows: [] as T[] } as any;
}

function rowResult<T>(row: T) {
  return { rows: [row] as T[] } as any;
}

async function add5eCharSpellSlotInfoQuery(data: {
  general_id: string | number
}) {
  const sheetDataResult = await getSheetDataByGeneralIdQuery(data.general_id);
  const row = sheetDataResult.rows[0];
  const sheetData = ensureSheetDataDocument(row);
  if (!sheetData) return emptyResult<DndFiveESpellSlots>();

  const spellSlots = ensureSpellSlotsSection(sheetData, data.general_id);
  await updateSheetDataByGeneralIdQuery(data.general_id, sheetData);
  return rowResult(spellSlots as unknown as DndFiveESpellSlots);
}

async function duplicate5eCharSpellSlotsQuery(data: {
  oldGeneralId: number
  newGeneralId: number
}) {
  const generalId = asNumber(data.newGeneralId);
  if (!generalId) return;

  const sheetDataResult = await getSheetDataByGeneralIdQuery(generalId);
  const row = sheetDataResult.rows[0];
  const sheetData = ensureSheetDataDocument(row);
  if (!sheetData) return;

  const spellSlots = ensureSpellSlotsSection(sheetData, generalId);
  const next = {
    ...spellSlots,
    id: generalId,
    general_id: generalId,
  };
  setObjectSection(sheetData, "spellSlots", next);
  await updateSheetDataByGeneralIdQuery(generalId, sheetData);
  return;
}

async function get5eCharSpellSlotInfoQuery(generalId: string | number) {
  return await get5eCharSpellSlotInfosByGeneralQuery(generalId);
}

async function get5eCharSpellSlotInfosByGeneralQuery(generalId: string | number) {
  const sheetDataResult = await getSheetDataByGeneralIdQuery(generalId);
  const row = sheetDataResult.rows[0];
  const sheetData = ensureSheetDataDocument(row);
  if (!sheetData) return emptyResult<DndFiveESpellSlots>();

  const spellSlots = ensureSpellSlotsSection(sheetData, generalId);
  await updateSheetDataByGeneralIdQuery(generalId, sheetData);
  return rowResult(spellSlots as unknown as DndFiveESpellSlots);
}

async function remove5eCharSpellSlotInfoQuery(generalId: string | number) {
  const spellSlotsData = await get5eCharSpellSlotInfosByGeneralQuery(generalId);
  const spellSlots = spellSlotsData.rows[0] as any;
  if (!spellSlots) return emptyResult<DndFiveESpellSlots>();

  const scopedGeneralId = asNumber(generalId);
  if (!scopedGeneralId) return emptyResult<DndFiveESpellSlots>();

  const sheetDataResult = await getSheetDataByGeneralIdQuery(scopedGeneralId);
  const row = sheetDataResult.rows[0];
  const sheetData = ensureSheetDataDocument(row);
  if (!sheetData) return emptyResult<DndFiveESpellSlots>();

  setObjectSection(sheetData, "spellSlots", {
    id: scopedGeneralId,
    general_id: scopedGeneralId,
    ...DEFAULT_SPELL_SLOTS,
  });
  return await updateSheetDataByGeneralIdQuery(scopedGeneralId, sheetData);
}

async function edit5eCharSpellSlotInfoQuery(generalId: string, data: any) {
  const spellSlotsData = await get5eCharSpellSlotInfosByGeneralQuery(generalId);
  const existing = spellSlotsData.rows[0] as any;
  if (!existing) return emptyResult<DndFiveESpellSlots>();

  const scopedGeneralId = asNumber(generalId);
  if (!scopedGeneralId) return emptyResult<DndFiveESpellSlots>();

  const sheetDataResult = await getSheetDataByGeneralIdQuery(scopedGeneralId);
  const row = sheetDataResult.rows[0];
  const sheetData = ensureSheetDataDocument(row);
  if (!sheetData) return emptyResult<DndFiveESpellSlots>();

  const current = ensureSpellSlotsSection(sheetData, scopedGeneralId);
  const next = {
    ...current,
    ...data,
    id: current.id,
    general_id: current.general_id,
  };
  setObjectSection(sheetData, "spellSlots", next);
  await updateSheetDataByGeneralIdQuery(scopedGeneralId, sheetData);
  return rowResult(next as unknown as DndFiveESpellSlots);
}

export {
  add5eCharSpellSlotInfoQuery,
  get5eCharSpellSlotInfosByGeneralQuery,
  get5eCharSpellSlotInfoQuery,
  remove5eCharSpellSlotInfoQuery,
  edit5eCharSpellSlotInfoQuery,
  duplicate5eCharSpellSlotsQuery
}
