import { getThings, postThing } from "./apiUtils.js";

function isRecordObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function getSheetApiPath(generalId) {
  return `/api/sheets/${generalId}`;
}

async function getSheet(generalId) {
  return await getThings(getSheetApiPath(generalId));
}

function readSheet(response) {
  if (!isRecordObject(response)) return {};
  if (!isRecordObject(response.sheet)) return {};
  return response.sheet;
}

function readSheetArraySection(response, sectionKey) {
  const sheet = readSheet(response);
  const section = sheet[sectionKey];
  if (!Array.isArray(section)) return [];
  return [...section];
}

function readSheetObjectSection(response, sectionKey) {
  const sheet = readSheet(response);
  const section = sheet[sectionKey];
  if (!isRecordObject(section)) return {};
  return section;
}

function sortByNumericId(rows) {
  return [...rows].sort((a, b) => Number(a?.id || 0) - Number(b?.id || 0));
}

async function applySheetOps(generalId, ops) {
  return await postThing(`${getSheetApiPath(generalId)}/ops`, { ops });
}

async function insertSheetItem(generalId, sectionKey, value) {
  return await applySheetOps(generalId, [
    { op: "insert", path: sectionKey, value },
  ]);
}

async function updateSheetItem(generalId, sectionKey, id, patch) {
  return await applySheetOps(generalId, [
    { op: "updateWhereId", path: sectionKey, id, patch },
  ]);
}

async function removeSheetItem(generalId, sectionKey, id) {
  return await applySheetOps(generalId, [
    { op: "removeWhereId", path: sectionKey, id },
  ]);
}

async function setSheetValue(generalId, path, value) {
  return await applySheetOps(generalId, [{ op: "set", path, value }]);
}

async function patchSheetObject(generalId, sectionKey, patch) {
  const keys = Object.keys(patch || {});
  if (!keys.length) return null;
  return await applySheetOps(
    generalId,
    keys.map((key) => ({
      op: "set",
      path: `${sectionKey}.${key}`,
      value: patch[key],
    })),
  );
}

export {
  applySheetOps,
  getSheet,
  getSheetApiPath,
  insertSheetItem,
  patchSheetObject,
  readSheet,
  readSheetArraySection,
  readSheetObjectSection,
  removeSheetItem,
  setSheetValue,
  sortByNumericId,
  updateSheetItem,
};
