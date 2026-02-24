import {
  asNumber,
  ensureSheetDataDocument,
  getArraySection,
  getSheetDataByGeneralIdQuery,
  nextItemId,
  setArraySection,
  updateSheetDataByGeneralIdQuery,
} from "./5eSheetDataUtils";

interface DndFiveESpell {
  id: number,
  title: string,
  description: string,
  type: string,
  general_id: number,
  casting_time: string,
  duration: string,
  range: string,
  components: string,
  damage_type: string
}

const SECTION_KEY = "spells";

function emptyResult<T>() {
  return { rows: [] as T[] } as any;
}

function rowResult<T>(row: T) {
  return { rows: [row] as T[] } as any;
}

function defaultSpellRow(
  generalId: number,
  id: number,
  title: string,
  description: string,
  type: string,
): Record<string, unknown> {
  return {
    id,
    general_id: generalId,
    title: title || "",
    description: description || "",
    type: type || "",
    casting_time: "",
    duration: "",
    range: "",
    components: "",
    damage_type: "",
  };
}

async function add5eCharSpellQuery(data: {
  general_id: number | string,
  title: string,
  description: string,
  type: string
}) {
  const generalId = asNumber(data.general_id);
  if (!generalId) return emptyResult<DndFiveESpell>();

  const sheetDataResult = await getSheetDataByGeneralIdQuery(generalId);
  const row = sheetDataResult.rows[0];
  const sheetData = ensureSheetDataDocument(row);
  if (!sheetData) return emptyResult<DndFiveESpell>();

  const spells = getArraySection(sheetData, SECTION_KEY);
  const nextId = nextItemId(spells);
  const created = defaultSpellRow(
    generalId,
    nextId,
    data.title,
    data.description,
    data.type,
  );
  spells.push(created);
  setArraySection(sheetData, SECTION_KEY, spells);
  await updateSheetDataByGeneralIdQuery(generalId, sheetData);
  return rowResult(created as unknown as DndFiveESpell);
}

async function duplicate5eCharSpellsQuery(data: {
  oldGeneralId: number
  newGeneralId: number
}) {
  const generalId = asNumber(data.newGeneralId);
  if (!generalId) return;

  const sheetDataResult = await getSheetDataByGeneralIdQuery(generalId);
  const row = sheetDataResult.rows[0];
  const sheetData = ensureSheetDataDocument(row);
  if (!sheetData) return;

  const spells = getArraySection(sheetData, SECTION_KEY);
  if (!spells.length) return;

  const nextSpells = spells.map((item) => ({
    ...item,
    general_id: generalId,
  }));
  setArraySection(sheetData, SECTION_KEY, nextSpells);
  await updateSheetDataByGeneralIdQuery(generalId, sheetData);
  return;
}

async function get5eCharSpellQuery(id: string, generalId: string | number) {
  const targetId = asNumber(id);
  const scopedGeneralId = asNumber(generalId);
  if (!targetId || !scopedGeneralId) return emptyResult<DndFiveESpell>();

  const sheetDataResult = await getSheetDataByGeneralIdQuery(scopedGeneralId);
  const row = sheetDataResult.rows[0];
  const sheetData = ensureSheetDataDocument(row);
  if (!sheetData) return emptyResult<DndFiveESpell>();

  const spells = getArraySection(sheetData, SECTION_KEY);
  const spell = spells.find((item) => (asNumber(item.id) || 0) === targetId);
  if (!spell) return emptyResult<DndFiveESpell>();
  if (!("general_id" in spell)) spell.general_id = scopedGeneralId;
  return rowResult(spell as unknown as DndFiveESpell);

}

async function get5eCharSpellsByTypeQuery(generalId: string, type: string) {
  const sheetDataResult = await getSheetDataByGeneralIdQuery(generalId);
  const row = sheetDataResult.rows[0];
  const sheetData = ensureSheetDataDocument(row);
  if (!sheetData) return emptyResult<DndFiveESpell>();

  const spells = getArraySection(sheetData, SECTION_KEY)
    .map((item) => {
      if (!("general_id" in item)) item.general_id = asNumber(generalId) || 0;
      return item;
    })
    .filter((item) => String(item.type || "") === String(type))
    .sort((a, b) => (asNumber(a.id) || 0) - (asNumber(b.id) || 0));

  return { rows: spells as unknown as DndFiveESpell[] } as any;
}

async function get5eCharSpellsByGeneralQuery(generalId: string | number) {
  const sheetDataResult = await getSheetDataByGeneralIdQuery(generalId);
  const row = sheetDataResult.rows[0];
  const sheetData = ensureSheetDataDocument(row);
  if (!sheetData) return emptyResult<DndFiveESpell>();

  const spells = getArraySection(sheetData, SECTION_KEY)
    .map((item) => {
      if (!("general_id" in item)) item.general_id = asNumber(generalId) || 0;
      return item;
    });
  return { rows: spells as unknown as DndFiveESpell[] } as any;
}

async function remove5eCharSpellQuery(id: string | number, generalId: string | number) {
  const spellData = await get5eCharSpellQuery(String(id), generalId);
  const existing = spellData.rows[0] as any;
  if (!existing) return emptyResult<DndFiveESpell>();

  const scopedGeneralId = asNumber(generalId);
  const spellId = asNumber(existing.id);
  if (!scopedGeneralId || !spellId) return emptyResult<DndFiveESpell>();

  const sheetDataResult = await getSheetDataByGeneralIdQuery(scopedGeneralId);
  const row = sheetDataResult.rows[0];
  const sheetData = ensureSheetDataDocument(row);
  if (!sheetData) return emptyResult<DndFiveESpell>();

  const spells = getArraySection(sheetData, SECTION_KEY)
    .filter((item) => (asNumber(item.id) || 0) !== spellId);
  setArraySection(sheetData, SECTION_KEY, spells);
  return await updateSheetDataByGeneralIdQuery(scopedGeneralId, sheetData);
}

async function edit5eCharSpellQuery(id: string, generalId: string | number, data: any) {
  const spellData = await get5eCharSpellQuery(id, generalId);
  const existing = spellData.rows[0] as any;
  if (!existing) return emptyResult<DndFiveESpell>();

  const scopedGeneralId = asNumber(generalId);
  const spellId = asNumber(existing.id);
  if (!scopedGeneralId || !spellId) return emptyResult<DndFiveESpell>();

  const sheetDataResult = await getSheetDataByGeneralIdQuery(scopedGeneralId);
  const row = sheetDataResult.rows[0];
  const sheetData = ensureSheetDataDocument(row);
  if (!sheetData) return emptyResult<DndFiveESpell>();

  const spells = getArraySection(sheetData, SECTION_KEY);
  const index = spells.findIndex((item) => (asNumber(item.id) || 0) === spellId);
  if (index === -1) return emptyResult<DndFiveESpell>();

  const next = {
    ...spells[index],
    ...data,
    id: spellId,
    general_id: scopedGeneralId,
  };
  spells[index] = next;
  setArraySection(sheetData, SECTION_KEY, spells);
  await updateSheetDataByGeneralIdQuery(scopedGeneralId, sheetData);
  return rowResult(next as unknown as DndFiveESpell);
}

export {
  add5eCharSpellQuery,
  get5eCharSpellsByTypeQuery,
  get5eCharSpellsByGeneralQuery,
  get5eCharSpellQuery,
  remove5eCharSpellQuery,
  edit5eCharSpellQuery,
  duplicate5eCharSpellsQuery
}
