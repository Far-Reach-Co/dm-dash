import { apiGet, apiPost } from "./apiUtils.js";
import { handleApiFailure } from "./apiUiFeedback.js";

let lastSheetErrorKey = null;
let lastSheetErrorAt = 0;

function notifySheetFailure(result, fallbackMessage) {
  const errorKey = `${result?.code || ""}:${result?.error || fallbackMessage}`;
  const now = Date.now();
  if (lastSheetErrorKey === errorKey && now - lastSheetErrorAt < 2000) {
    return false;
  }
  lastSheetErrorKey = errorKey;
  lastSheetErrorAt = now;
  return handleApiFailure(result, {
    fallbackMessage,
    includeResultMessage: true,
  });
}

function isRecordObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function getSheetApiPath(generalId) {
  return `/api/sheets/${generalId}`;
}

async function getSheet(generalId, options = {}) {
  const result = await apiGet(getSheetApiPath(generalId));
  if (!result.ok && options.notifyOnError !== false) {
    notifySheetFailure(result, "Failed to load character sheet data");
  }
  return result.ok ? result.data : null;
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

async function applySheetOps(generalId, ops, options = {}) {
  const result = await apiPost(`${getSheetApiPath(generalId)}/ops`, { ops });
  if (!result.ok && options.notifyOnError !== false) {
    notifySheetFailure(result, "Failed to save character sheet changes");
  }
  return result.ok ? result.data : null;
}

async function insertSheetItem(generalId, sectionKey, value, options = {}) {
  return await applySheetOps(generalId, [
    { op: "insert", path: sectionKey, value },
  ], options);
}

async function updateSheetItem(generalId, sectionKey, id, patch, options = {}) {
  return await applySheetOps(generalId, [
    { op: "updateWhereId", path: sectionKey, id, patch },
  ], options);
}

async function removeSheetItem(generalId, sectionKey, id, options = {}) {
  return await applySheetOps(generalId, [
    { op: "removeWhereId", path: sectionKey, id },
  ], options);
}

async function setSheetValue(generalId, path, value, options = {}) {
  return await applySheetOps(generalId, [{ op: "set", path, value }], options);
}

async function patchSheetObject(generalId, sectionKey, patch, options = {}) {
  const keys = Object.keys(patch || {});
  if (!keys.length) return null;
  return await applySheetOps(
    generalId,
    keys.map((key) => ({
      op: "set",
      path: `${sectionKey}.${key}`,
      value: patch[key],
    })),
    options,
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
