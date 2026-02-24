import {
  asNumber,
  ensureSheetDataDocument,
  getArraySection,
  getSheetDataByGeneralIdQuery,
  nextItemId,
  setArraySection,
  updateSheetDataByGeneralIdQuery,
} from "./5eSheetDataUtils";

interface DndFiveEClass {
  id: number,
  general_id: number,
  class: string,
  subclass: string,
  hit_dice_type: string,
  total_hit_dice: number,
  current_hit_dice: number
}

const SECTION_KEY = "classes";

function emptyResult<T>() {
  return { rows: [] as T[] } as any;
}

function rowResult<T>(row: T) {
  return { rows: [row] as T[] } as any;
}

function defaultClassRow(generalId: number, id: number): Record<string, unknown> {
  return {
    id,
    general_id: generalId,
    class: "",
    subclass: "",
    hit_dice_type: "",
    total_hit_dice: null,
    current_hit_dice: null,
  };
}

async function add5eCharClassQuery(data: {
  general_id: number | string,
}) {
  const generalId = asNumber(data.general_id);
  if (!generalId) return emptyResult<DndFiveEClass>();

  const sheetDataResult = await getSheetDataByGeneralIdQuery(generalId);
  const row = sheetDataResult.rows[0];
  const sheetData = ensureSheetDataDocument(row);
  if (!sheetData) return emptyResult<DndFiveEClass>();

  const classes = getArraySection(sheetData, SECTION_KEY);
  const nextId = nextItemId(classes);
  const created = defaultClassRow(generalId, nextId);
  classes.push(created);
  setArraySection(sheetData, SECTION_KEY, classes);
  await updateSheetDataByGeneralIdQuery(generalId, sheetData);
  return rowResult(created as unknown as DndFiveEClass);
}

async function get5eCharClassQuery(id: string, generalId: string | number) {
  const targetId = asNumber(id);
  const scopedGeneralId = asNumber(generalId);
  if (!targetId || !scopedGeneralId) return emptyResult<DndFiveEClass>();

  const sheetDataResult = await getSheetDataByGeneralIdQuery(scopedGeneralId);
  const row = sheetDataResult.rows[0];
  const sheetData = ensureSheetDataDocument(row);
  if (!sheetData) return emptyResult<DndFiveEClass>();

  const classes = getArraySection(sheetData, SECTION_KEY);
  const classItem = classes.find((item) => (asNumber(item.id) || 0) === targetId);
  if (!classItem) return emptyResult<DndFiveEClass>();
  if (!("general_id" in classItem)) classItem.general_id = scopedGeneralId;
  return rowResult(classItem as unknown as DndFiveEClass);

}

async function duplicate5eCharClassesQuery(data: {
  oldGeneralId: number
  newGeneralId: number
}) {
  const generalId = asNumber(data.newGeneralId);
  if (!generalId) return;

  const sheetDataResult = await getSheetDataByGeneralIdQuery(generalId);
  const row = sheetDataResult.rows[0];
  const sheetData = ensureSheetDataDocument(row);
  if (!sheetData) return;

  const classes = getArraySection(sheetData, SECTION_KEY);
  if (!classes.length) return;

  const nextClasses = classes.map((item) => ({
    ...item,
    general_id: generalId,
  }));
  setArraySection(sheetData, SECTION_KEY, nextClasses);
  await updateSheetDataByGeneralIdQuery(generalId, sheetData);
  return;
}

async function get5eCharClassesByGeneralQuery(generalId: string | number) {
  const sheetDataResult = await getSheetDataByGeneralIdQuery(generalId);
  const row = sheetDataResult.rows[0];
  const sheetData = ensureSheetDataDocument(row);
  if (!sheetData) return emptyResult<DndFiveEClass>();

  const classes = getArraySection(sheetData, SECTION_KEY)
    .map((item) => {
      if (!("general_id" in item)) item.general_id = asNumber(generalId) || 0;
      return item;
    })
    .sort((a, b) => (asNumber(a.id) || 0) - (asNumber(b.id) || 0));
  return { rows: classes as unknown as DndFiveEClass[] } as any;
}

async function remove5eCharClassQuery(id: string | number, generalId: string | number) {
  const classData = await get5eCharClassQuery(String(id), generalId);
  const existing = classData.rows[0] as any;
  if (!existing) return emptyResult<DndFiveEClass>();

  const scopedGeneralId = asNumber(generalId);
  const classId = asNumber(existing.id);
  if (!scopedGeneralId || !classId) return emptyResult<DndFiveEClass>();

  const sheetDataResult = await getSheetDataByGeneralIdQuery(scopedGeneralId);
  const row = sheetDataResult.rows[0];
  const sheetData = ensureSheetDataDocument(row);
  if (!sheetData) return emptyResult<DndFiveEClass>();

  const classes = getArraySection(sheetData, SECTION_KEY)
    .filter((item) => (asNumber(item.id) || 0) !== classId);
  setArraySection(sheetData, SECTION_KEY, classes);
  return await updateSheetDataByGeneralIdQuery(scopedGeneralId, sheetData);
}

async function edit5eCharClassQuery(id: string, generalId: string | number, data: any) {
  const classData = await get5eCharClassQuery(id, generalId);
  const existing = classData.rows[0] as any;
  if (!existing) return emptyResult<DndFiveEClass>();

  const scopedGeneralId = asNumber(generalId);
  const classId = asNumber(existing.id);
  if (!scopedGeneralId || !classId) return emptyResult<DndFiveEClass>();

  const sheetDataResult = await getSheetDataByGeneralIdQuery(scopedGeneralId);
  const row = sheetDataResult.rows[0];
  const sheetData = ensureSheetDataDocument(row);
  if (!sheetData) return emptyResult<DndFiveEClass>();

  const classes = getArraySection(sheetData, SECTION_KEY);
  const index = classes.findIndex((item) => (asNumber(item.id) || 0) === classId);
  if (index === -1) return emptyResult<DndFiveEClass>();

  const next = {
    ...classes[index],
    ...data,
    id: classId,
    general_id: scopedGeneralId,
  };
  classes[index] = next;
  setArraySection(sheetData, SECTION_KEY, classes);
  await updateSheetDataByGeneralIdQuery(scopedGeneralId, sheetData);
  return rowResult(next as unknown as DndFiveEClass);
}

export {
  add5eCharClassQuery,
  get5eCharClassesByGeneralQuery,
  get5eCharClassQuery,
  remove5eCharClassQuery,
  edit5eCharClassQuery,
  duplicate5eCharClassesQuery
}
