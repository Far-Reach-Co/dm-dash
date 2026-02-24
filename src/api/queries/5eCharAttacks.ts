import {
  asNumber,
  ensureSheetDataDocument,
  getArraySection,
  getSheetDataByGeneralIdQuery,
  nextItemId,
  setArraySection,
  updateSheetDataByGeneralIdQuery,
} from "./5eSheetDataUtils";

interface DndFiveEAttack {
  id: number,
  title: string,
  description: string,
  range: string,
  damage_type: string,
  bonus: string,
  general_id: number,
  duration: string
}

const SECTION_KEY = "attacks";

function emptyResult<T>() {
  return { rows: [] as T[] } as any;
}

function rowResult<T>(row: T) {
  return { rows: [row] as T[] } as any;
}

function defaultAttackRow(generalId: number, id: number, title: string): Record<string, unknown> {
  return {
    id,
    general_id: generalId,
    title: title || "",
    description: "",
    range: "",
    damage_type: "",
    bonus: "",
    duration: "",
  };
}

async function add5eCharAttackQuery(data: {
  general_id: number | string,
  title: string
}) {
  const generalId = asNumber(data.general_id);
  if (!generalId) return emptyResult<DndFiveEAttack>();

  const sheetDataResult = await getSheetDataByGeneralIdQuery(generalId);
  const row = sheetDataResult.rows[0];
  const sheetData = ensureSheetDataDocument(row);
  if (!sheetData) return emptyResult<DndFiveEAttack>();

  const attacks = getArraySection(sheetData, SECTION_KEY);
  const nextId = nextItemId(attacks);
  const created = defaultAttackRow(generalId, nextId, data.title);
  attacks.push(created);
  setArraySection(sheetData, SECTION_KEY, attacks);
  await updateSheetDataByGeneralIdQuery(generalId, sheetData);
  return rowResult(created as unknown as DndFiveEAttack);
}

async function get5eCharAttackQuery(id: string, generalId: string | number) {
  const targetId = asNumber(id);
  const scopedGeneralId = asNumber(generalId);
  if (!targetId || !scopedGeneralId) return emptyResult<DndFiveEAttack>();

  const sheetDataResult = await getSheetDataByGeneralIdQuery(scopedGeneralId);
  const row = sheetDataResult.rows[0];
  const sheetData = ensureSheetDataDocument(row);
  if (!sheetData) return emptyResult<DndFiveEAttack>();

  const attacks = getArraySection(sheetData, SECTION_KEY);
  const attack = attacks.find((item) => (asNumber(item.id) || 0) === targetId);
  if (!attack) return emptyResult<DndFiveEAttack>();
  if (!("general_id" in attack)) attack.general_id = scopedGeneralId;
  return rowResult(attack as unknown as DndFiveEAttack);

}

async function duplicate5eCharAttacksQuery(data: {
  oldGeneralId: number
  newGeneralId: number
}) {
  const generalId = asNumber(data.newGeneralId);
  if (!generalId) return;

  const sheetDataResult = await getSheetDataByGeneralIdQuery(generalId);
  const row = sheetDataResult.rows[0];
  const sheetData = ensureSheetDataDocument(row);
  if (!sheetData) return;

  const attacks = getArraySection(sheetData, SECTION_KEY);
  if (!attacks.length) return;

  const nextAttacks = attacks.map((item) => ({
    ...item,
    general_id: generalId,
  }));
  setArraySection(sheetData, SECTION_KEY, nextAttacks);
  await updateSheetDataByGeneralIdQuery(generalId, sheetData);
  return;
}

async function get5eCharAttacksByGeneralQuery(generalId: string | number) {
  const sheetDataResult = await getSheetDataByGeneralIdQuery(generalId);
  const row = sheetDataResult.rows[0];
  const sheetData = ensureSheetDataDocument(row);
  if (!sheetData) return emptyResult<DndFiveEAttack>();

  const attacks = getArraySection(sheetData, SECTION_KEY)
    .map((item) => {
      if (!("general_id" in item)) item.general_id = asNumber(generalId) || 0;
      return item;
    })
    .sort((a, b) => (asNumber(a.id) || 0) - (asNumber(b.id) || 0));
  return { rows: attacks as unknown as DndFiveEAttack[] } as any;
}

async function remove5eCharAttackQuery(id: string | number, generalId: string | number) {
  const attackData = await get5eCharAttackQuery(String(id), generalId);
  const existing = attackData.rows[0] as any;
  if (!existing) return emptyResult<DndFiveEAttack>();

  const scopedGeneralId = asNumber(generalId);
  const attackId = asNumber(existing.id);
  if (!scopedGeneralId || !attackId) return emptyResult<DndFiveEAttack>();

  const sheetDataResult = await getSheetDataByGeneralIdQuery(scopedGeneralId);
  const row = sheetDataResult.rows[0];
  const sheetData = ensureSheetDataDocument(row);
  if (!sheetData) return emptyResult<DndFiveEAttack>();

  const attacks = getArraySection(sheetData, SECTION_KEY)
    .filter((item) => (asNumber(item.id) || 0) !== attackId);
  setArraySection(sheetData, SECTION_KEY, attacks);
  return await updateSheetDataByGeneralIdQuery(scopedGeneralId, sheetData);
}

async function edit5eCharAttackQuery(id: string, generalId: string | number, data: any) {
  const attackData = await get5eCharAttackQuery(id, generalId);
  const existing = attackData.rows[0] as any;
  if (!existing) return emptyResult<DndFiveEAttack>();

  const scopedGeneralId = asNumber(generalId);
  const attackId = asNumber(existing.id);
  if (!scopedGeneralId || !attackId) return emptyResult<DndFiveEAttack>();

  const sheetDataResult = await getSheetDataByGeneralIdQuery(scopedGeneralId);
  const row = sheetDataResult.rows[0];
  const sheetData = ensureSheetDataDocument(row);
  if (!sheetData) return emptyResult<DndFiveEAttack>();

  const attacks = getArraySection(sheetData, SECTION_KEY);
  const index = attacks.findIndex((item) => (asNumber(item.id) || 0) === attackId);
  if (index === -1) return emptyResult<DndFiveEAttack>();

  const next = {
    ...attacks[index],
    ...data,
    id: attackId,
    general_id: scopedGeneralId,
  };
  attacks[index] = next;
  setArraySection(sheetData, SECTION_KEY, attacks);
  await updateSheetDataByGeneralIdQuery(scopedGeneralId, sheetData);
  return rowResult(next as unknown as DndFiveEAttack);
}

export {
  add5eCharAttackQuery,
  get5eCharAttacksByGeneralQuery,
  get5eCharAttackQuery,
  remove5eCharAttackQuery,
  edit5eCharAttackQuery,
  duplicate5eCharAttacksQuery
}
