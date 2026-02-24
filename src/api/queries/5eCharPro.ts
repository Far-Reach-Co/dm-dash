import {
  asNumber,
  ensureSheetDataDocument,
  getObjectSection,
  getSheetDataByGeneralIdQuery,
  setObjectSection,
  updateSheetDataByGeneralIdQuery,
} from "./5eSheetDataUtils";

export interface DndFiveEPro {
  id: number,
  general_id: number,
  sv_str: boolean,
  sv_dex: boolean,
  sv_con: boolean,
  sv_int: boolean,
  sv_wis: boolean,
  sv_char: boolean,
  acrobatics: boolean,
  animal_handling: boolean,
  arcana: boolean,
  athletics: boolean,
  deception: boolean,
  history: boolean,
  insight: boolean,
  intimidation: boolean,
  investigation: boolean,
  medicine: boolean,
  nature: boolean,
  perception: boolean,
  performance: boolean,
  persuasion: boolean,
  religion: boolean,
  sleight_of_hand: boolean,
  stealth: boolean,
  survival: boolean,
  acrobatics_mod: boolean,
  animal_handling_mod: boolean,
  arcana_mod: boolean,
  athletics_mod: boolean,
  deception_mod: boolean,
  history_mod: boolean,
  insight_mod: boolean,
  intimidation_mod: boolean,
  investigation_mod: boolean,
  medicine_mod: boolean,
  nature_mod: boolean,
  perception_mod: boolean,
  performance_mod: boolean,
  persuasion_mod: boolean,
  religion_mod: boolean,
  sleight_of_hand_mod: boolean,
  stealth_mod: boolean,
  survival_mod: boolean,
}

const DEFAULT_PROFICIENCIES: Record<string, unknown> = {
  sv_str: false,
  sv_dex: false,
  sv_con: false,
  sv_int: false,
  sv_wis: false,
  sv_char: false,
  acrobatics: false,
  animal_handling: false,
  arcana: false,
  athletics: false,
  deception: false,
  history: false,
  insight: false,
  intimidation: false,
  investigation: false,
  medicine: false,
  nature: false,
  perception: false,
  performance: false,
  persuasion: false,
  religion: false,
  sleight_of_hand: false,
  stealth: false,
  survival: false,
  acrobatics_mod: 0,
  animal_handling_mod: 0,
  arcana_mod: 0,
  athletics_mod: 0,
  deception_mod: 0,
  history_mod: 0,
  insight_mod: 0,
  intimidation_mod: 0,
  investigation_mod: 0,
  medicine_mod: 0,
  nature_mod: 0,
  perception_mod: 0,
  performance_mod: 0,
  persuasion_mod: 0,
  religion_mod: 0,
  sleight_of_hand_mod: 0,
  stealth_mod: 0,
  survival_mod: 0,
};

function ensureProficiencySection(
  sheetData: Record<string, unknown>,
  generalId: string | number,
): Record<string, unknown> {
  const existing = getObjectSection(sheetData, "proficiencies");
  if (existing) {
    if (!("id" in existing)) existing.id = asNumber(generalId) || 0;
    if (!("general_id" in existing)) existing.general_id = asNumber(generalId) || 0;
    return existing;
  }
  const created: Record<string, unknown> = {
    id: asNumber(generalId) || 0,
    general_id: asNumber(generalId) || 0,
    ...DEFAULT_PROFICIENCIES,
  };
  setObjectSection(sheetData, "proficiencies", created);
  return created;
}

function emptyResult<T>() {
  return { rows: [] as T[] } as any;
}

function rowResult<T>(row: T) {
  return { rows: [row] as T[] } as any;
}

async function add5eCharProQuery(data: {general_id: string | number}) {
  const sheetDataResult = await getSheetDataByGeneralIdQuery(data.general_id);
  const row = sheetDataResult.rows[0];
  const sheetData = ensureSheetDataDocument(row);
  if (!sheetData) return emptyResult<DndFiveEPro>();

  const proficiencies = ensureProficiencySection(sheetData, data.general_id);
  await updateSheetDataByGeneralIdQuery(data.general_id, sheetData);
  return rowResult(proficiencies as unknown as DndFiveEPro);
}

async function duplicate5eCharProQuery(data: {
  oldGeneralId: number
  newGeneralId: number
}) {
  const generalId = asNumber(data.newGeneralId);
  if (!generalId) return;

  const sheetDataResult = await getSheetDataByGeneralIdQuery(generalId);
  const row = sheetDataResult.rows[0];
  const sheetData = ensureSheetDataDocument(row);
  if (!sheetData) return;

  const proficiencies = ensureProficiencySection(sheetData, generalId);
  const next = {
    ...proficiencies,
    id: generalId,
    general_id: generalId,
  };
  setObjectSection(sheetData, "proficiencies", next);
  await updateSheetDataByGeneralIdQuery(generalId, sheetData);
  return;
}

async function get5eCharProQuery(generalId: string | number) {
  return await get5eCharProByGeneralQuery(generalId);
}

async function get5eCharProByGeneralQuery(generalId: string | number) {
  const sheetDataResult = await getSheetDataByGeneralIdQuery(generalId);
  const row = sheetDataResult.rows[0];
  const sheetData = ensureSheetDataDocument(row);
  if (!sheetData) return emptyResult<DndFiveEPro>();

  const proficiencies = ensureProficiencySection(sheetData, generalId);
  await updateSheetDataByGeneralIdQuery(generalId, sheetData);
  return rowResult(proficiencies as unknown as DndFiveEPro);
}

async function remove5eCharProQuery(generalId: string | number) {
  const proData = await get5eCharProByGeneralQuery(generalId);
  const proficiencies = proData.rows[0] as any;
  if (!proficiencies) return emptyResult<DndFiveEPro>();

  const scopedGeneralId = asNumber(generalId);
  if (!scopedGeneralId) return emptyResult<DndFiveEPro>();
  const sheetDataResult = await getSheetDataByGeneralIdQuery(scopedGeneralId);
  const row = sheetDataResult.rows[0];
  const sheetData = ensureSheetDataDocument(row);
  if (!sheetData) return emptyResult<DndFiveEPro>();

  setObjectSection(sheetData, "proficiencies", {
    id: scopedGeneralId,
    general_id: scopedGeneralId,
    ...DEFAULT_PROFICIENCIES,
  });
  return await updateSheetDataByGeneralIdQuery(scopedGeneralId, sheetData);
}

async function edit5eCharProQuery(generalId: string, data: any) {
  const proData = await get5eCharProByGeneralQuery(generalId);
  const existing = proData.rows[0] as any;
  if (!existing) return emptyResult<DndFiveEPro>();

  const scopedGeneralId = asNumber(generalId);
  if (!scopedGeneralId) return emptyResult<DndFiveEPro>();

  const sheetDataResult = await getSheetDataByGeneralIdQuery(scopedGeneralId);
  const row = sheetDataResult.rows[0];
  const sheetData = ensureSheetDataDocument(row);
  if (!sheetData) return emptyResult<DndFiveEPro>();

  const current = ensureProficiencySection(sheetData, scopedGeneralId);
  const next = {
    ...current,
    ...data,
    id: current.id,
    general_id: current.general_id,
  };
  setObjectSection(sheetData, "proficiencies", next);
  await updateSheetDataByGeneralIdQuery(scopedGeneralId, sheetData);
  return rowResult(next as unknown as DndFiveEPro);
}

export {
  add5eCharProQuery,
  get5eCharProByGeneralQuery,
  get5eCharProQuery,
  remove5eCharProQuery,
  edit5eCharProQuery,
  duplicate5eCharProQuery
}
