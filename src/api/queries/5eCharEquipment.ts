import {
  asNumber,
  ensureSheetDataDocument,
  getArraySection,
  getSheetDataByGeneralIdQuery,
  nextItemId,
  setArraySection,
  updateSheetDataByGeneralIdQuery,
} from "./5eSheetDataUtils";

export interface DndFiveEEquipment {
  id: number,
  general_id: number,
  title: string,
  description: string,
  quantity: number,
  weight: number
}

const SECTION_KEY = "equipment";

function emptyResult<T>() {
  return { rows: [] as T[] } as any;
}

function rowResult<T>(row: T) {
  return { rows: [row] as T[] } as any;
}

function defaultEquipmentRow(
  generalId: number,
  id: number,
  data: {
    title: string;
    description: string;
    quantity: number;
    weight: number;
  },
): Record<string, unknown> {
  return {
    id,
    general_id: generalId,
    title: data.title || "",
    description: data.description || "",
    quantity: data.quantity ?? 1,
    weight: data.weight ?? 0,
  };
}

async function add5eCharEquipmentQuery(data: {
  general_id: number | string,
  title: string,
  description: string,
  quantity: number,
  weight: number
}) {
  const generalId = asNumber(data.general_id);
  if (!generalId) return emptyResult<DndFiveEEquipment>();

  const sheetDataResult = await getSheetDataByGeneralIdQuery(generalId);
  const row = sheetDataResult.rows[0];
  const sheetData = ensureSheetDataDocument(row);
  if (!sheetData) return emptyResult<DndFiveEEquipment>();

  const equipment = getArraySection(sheetData, SECTION_KEY);
  const nextId = nextItemId(equipment);
  const created = defaultEquipmentRow(generalId, nextId, data);
  equipment.push(created);
  setArraySection(sheetData, SECTION_KEY, equipment);
  await updateSheetDataByGeneralIdQuery(generalId, sheetData);
  return rowResult(created as unknown as DndFiveEEquipment);
}

async function duplicate5eCharEquipmentsQuery(data: {
  oldGeneralId: number
  newGeneralId: number
}) {
  const generalId = asNumber(data.newGeneralId);
  if (!generalId) return;

  const sheetDataResult = await getSheetDataByGeneralIdQuery(generalId);
  const row = sheetDataResult.rows[0];
  const sheetData = ensureSheetDataDocument(row);
  if (!sheetData) return;

  const equipment = getArraySection(sheetData, SECTION_KEY);
  if (!equipment.length) return;

  const nextEquipment = equipment.map((item) => ({
    ...item,
    general_id: generalId,
  }));
  setArraySection(sheetData, SECTION_KEY, nextEquipment);
  await updateSheetDataByGeneralIdQuery(generalId, sheetData);
  return;
}

async function get5eCharEquipmentQuery(id: string, generalId: string | number) {
  const targetId = asNumber(id);
  const scopedGeneralId = asNumber(generalId);
  if (!targetId || !scopedGeneralId) return emptyResult<DndFiveEEquipment>();

  const sheetDataResult = await getSheetDataByGeneralIdQuery(scopedGeneralId);
  const row = sheetDataResult.rows[0];
  const sheetData = ensureSheetDataDocument(row);
  if (!sheetData) return emptyResult<DndFiveEEquipment>();

  const equipment = getArraySection(sheetData, SECTION_KEY);
  const item = equipment.find((entry) => (asNumber(entry.id) || 0) === targetId);
  if (!item) return emptyResult<DndFiveEEquipment>();
  if (!("general_id" in item)) item.general_id = scopedGeneralId;
  return rowResult(item as unknown as DndFiveEEquipment);

}

async function get5eCharEquipmentsByGeneralQuery(generalId: string | number) {
  const sheetDataResult = await getSheetDataByGeneralIdQuery(generalId);
  const row = sheetDataResult.rows[0];
  const sheetData = ensureSheetDataDocument(row);
  if (!sheetData) return emptyResult<DndFiveEEquipment>();

  const equipment = getArraySection(sheetData, SECTION_KEY)
    .map((item) => {
      if (!("general_id" in item)) item.general_id = asNumber(generalId) || 0;
      return item;
    })
    .sort((a, b) => (asNumber(a.id) || 0) - (asNumber(b.id) || 0));
  return { rows: equipment as unknown as DndFiveEEquipment[] } as any;
}

async function remove5eCharEquipmentQuery(id: string | number, generalId: string | number) {
  const equipmentData = await get5eCharEquipmentQuery(String(id), generalId);
  const existing = equipmentData.rows[0] as any;
  if (!existing) return emptyResult<DndFiveEEquipment>();

  const scopedGeneralId = asNumber(generalId);
  const equipmentId = asNumber(existing.id);
  if (!scopedGeneralId || !equipmentId) return emptyResult<DndFiveEEquipment>();

  const sheetDataResult = await getSheetDataByGeneralIdQuery(scopedGeneralId);
  const row = sheetDataResult.rows[0];
  const sheetData = ensureSheetDataDocument(row);
  if (!sheetData) return emptyResult<DndFiveEEquipment>();

  const equipment = getArraySection(sheetData, SECTION_KEY)
    .filter((item) => (asNumber(item.id) || 0) !== equipmentId);
  setArraySection(sheetData, SECTION_KEY, equipment);
  return await updateSheetDataByGeneralIdQuery(scopedGeneralId, sheetData);
}

async function edit5eCharEquipmentQuery(id: string, generalId: string | number, data: any) {
  const equipmentData = await get5eCharEquipmentQuery(id, generalId);
  const existing = equipmentData.rows[0] as any;
  if (!existing) return emptyResult<DndFiveEEquipment>();

  const scopedGeneralId = asNumber(generalId);
  const equipmentId = asNumber(existing.id);
  if (!scopedGeneralId || !equipmentId) return emptyResult<DndFiveEEquipment>();

  const sheetDataResult = await getSheetDataByGeneralIdQuery(scopedGeneralId);
  const row = sheetDataResult.rows[0];
  const sheetData = ensureSheetDataDocument(row);
  if (!sheetData) return emptyResult<DndFiveEEquipment>();

  const equipment = getArraySection(sheetData, SECTION_KEY);
  const index = equipment.findIndex((item) => (asNumber(item.id) || 0) === equipmentId);
  if (index === -1) return emptyResult<DndFiveEEquipment>();

  const next = {
    ...equipment[index],
    ...data,
    id: equipmentId,
    general_id: scopedGeneralId,
  };
  equipment[index] = next;
  setArraySection(sheetData, SECTION_KEY, equipment);
  await updateSheetDataByGeneralIdQuery(scopedGeneralId, sheetData);
  return rowResult(next as unknown as DndFiveEEquipment);
}

export {
  add5eCharEquipmentQuery,
  get5eCharEquipmentsByGeneralQuery,
  get5eCharEquipmentQuery,
  remove5eCharEquipmentQuery,
  edit5eCharEquipmentQuery,
  duplicate5eCharEquipmentsQuery
}
