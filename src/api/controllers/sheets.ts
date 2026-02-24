import { NextFunction, Request, Response } from "express";
import {
  get5eSheetDocumentQuery,
  save5eSheetDocumentQuery,
} from "../queries/5eSheetDocument";
import { asNumber, cloneJson, nextItemId } from "../queries/5eSheetDataUtils";
import { requireSheetEditAccess, requireSheetViewAccess } from "./accessControl";

type JsonObject = Record<string, unknown>;

const SAFE_PATH_SEGMENT = /^[A-Za-z0-9_]+$/;
const BLOCKED_PATH_SEGMENTS = new Set(["__proto__", "prototype", "constructor"]);

function isRecordObject(value: unknown): value is JsonObject {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function parsePathOrThrow(pathValue: unknown): string[] {
  if (typeof pathValue !== "string") {
    throw { status: 400, message: "Op path must be a string" };
  }

  const path = pathValue.trim();
  if (!path.length) {
    throw { status: 400, message: "Op path cannot be empty" };
  }

  const segments = path.split(".");
  for (const segment of segments) {
    if (!SAFE_PATH_SEGMENT.test(segment) || BLOCKED_PATH_SEGMENTS.has(segment)) {
      throw { status: 400, message: `Invalid path segment: ${segment}` };
    }
  }

  return segments;
}

function getPathTarget(
  root: JsonObject,
  segments: string[],
  createMissing: boolean,
): { parent: JsonObject; key: string } | null {
  let parent: JsonObject = root;

  for (let i = 0; i < segments.length - 1; i++) {
    const segment = segments[i];
    const nextValue = parent[segment];
    if (isRecordObject(nextValue)) {
      parent = nextValue;
      continue;
    }
    if (!createMissing) return null;

    const nextObject: JsonObject = {};
    parent[segment] = nextObject;
    parent = nextObject;
  }

  return { parent, key: segments[segments.length - 1] };
}

function getArrayAtPath(
  root: JsonObject,
  segments: string[],
  createMissing: boolean,
): unknown[] | null {
  const target = getPathTarget(root, segments, createMissing);
  if (!target) return null;

  const current = target.parent[target.key];
  if (Array.isArray(current)) return current;

  if (!createMissing) return null;
  const created: unknown[] = [];
  target.parent[target.key] = created;
  return created;
}

function applySingleOp(sheetData: JsonObject, generalId: number, rawOp: unknown): void {
  if (!isRecordObject(rawOp)) {
    throw { status: 400, message: "Each op must be an object" };
  }

  const op = rawOp.op;
  const pathSegments = parsePathOrThrow(rawOp.path);

  if (op === "set") {
    const target = getPathTarget(sheetData, pathSegments, true);
    if (!target) {
      throw { status: 400, message: "Invalid set path" };
    }
    target.parent[target.key] = rawOp.value;
    return;
  }

  if (op === "insert") {
    const rows = getArrayAtPath(sheetData, pathSegments, true);
    if (!rows) {
      throw { status: 400, message: "Invalid insert path" };
    }
    if (!isRecordObject(rawOp.value)) {
      throw { status: 400, message: "Insert op value must be an object" };
    }

    const nextRow: JsonObject = {
      ...rawOp.value,
    };

    if (asNumber(nextRow.id) === null) {
      const currentRows = rows.filter((item) => isRecordObject(item)) as JsonObject[];
      nextRow.id = nextItemId(currentRows);
    }
    if (asNumber(nextRow.general_id) === null) {
      nextRow.general_id = generalId;
    }

    rows.push(nextRow);
    return;
  }

  if (op === "updateWhereId") {
    const rows = getArrayAtPath(sheetData, pathSegments, false);
    if (!rows) {
      throw { status: 404, message: "Target array not found for updateWhereId op" };
    }

    const targetId = asNumber(rawOp.id);
    if (targetId === null) {
      throw { status: 400, message: "updateWhereId op id must be a number" };
    }
    if (!isRecordObject(rawOp.patch)) {
      throw { status: 400, message: "updateWhereId op patch must be an object" };
    }

    const index = rows.findIndex(
      (item) => isRecordObject(item) && asNumber(item.id) === targetId,
    );
    if (index === -1) {
      throw {
        status: 404,
        message: `Item not found for updateWhereId op at id=${targetId}`,
      };
    }

    const existing = rows[index] as JsonObject;
    const nextRow: JsonObject = {
      ...existing,
      ...rawOp.patch,
      id: targetId,
    };
    if (asNumber(nextRow.general_id) === null) {
      nextRow.general_id = generalId;
    }

    rows[index] = nextRow;
    return;
  }

  if (op === "removeWhereId") {
    const rows = getArrayAtPath(sheetData, pathSegments, false);
    if (!rows) {
      throw { status: 404, message: "Target array not found for removeWhereId op" };
    }

    const targetId = asNumber(rawOp.id);
    if (targetId === null) {
      throw { status: 400, message: "removeWhereId op id must be a number" };
    }

    const index = rows.findIndex(
      (item) => isRecordObject(item) && asNumber(item.id) === targetId,
    );
    if (index === -1) {
      throw {
        status: 404,
        message: `Item not found for removeWhereId op at id=${targetId}`,
      };
    }

    rows.splice(index, 1);
    return;
  }

  throw { status: 400, message: `Unsupported op type: ${String(op)}` };
}

async function getSheet(req: Request, res: Response, next: NextFunction) {
  try {
    const { general } = await requireSheetViewAccess(req, req.params.id);
    const data = await get5eSheetDocumentQuery(general.id);
    const row = data.rows[0];
    if (!row) throw { status: 404, message: "Character not found" };

    res.status(200).json({
      id: row.id,
      name: row.name,
      sheet_schema_version: row.sheet_schema_version,
      sheet_data_updated_at: row.sheet_data_updated_at,
      sheet: isRecordObject(row.sheet_data) ? cloneJson(row.sheet_data) : {},
    });
  } catch (err) {
    next(err);
  }
}

interface ApplySheetOpsRequest extends Request {
  body: {
    ops?: unknown[];
  };
}

async function applySheetOps(req: ApplySheetOpsRequest, res: Response, next: NextFunction) {
  try {
    const { general } = await requireSheetEditAccess(req, req.params.id);

    const ops = Array.isArray(req.body?.ops) ? req.body.ops : null;
    if (!ops || !ops.length) {
      throw { status: 400, message: "Body must include a non-empty ops array" };
    }

    const data = await get5eSheetDocumentQuery(general.id);
    const row = data.rows[0];
    if (!row) throw { status: 404, message: "Character not found" };

    const nextSheetData = isRecordObject(row.sheet_data) ? cloneJson(row.sheet_data) : {};
    for (const op of ops) {
      applySingleOp(nextSheetData, general.id, op);
    }

    const savedData = await save5eSheetDocumentQuery(
      general.id,
      nextSheetData,
      row.sheet_schema_version || 1,
    );
    const saved = savedData.rows[0];
    if (!saved) throw { status: 500, message: "Failed to save sheet data" };

    res.status(200).json({
      id: saved.id,
      name: saved.name,
      sheet_schema_version: saved.sheet_schema_version,
      sheet_data_updated_at: saved.sheet_data_updated_at,
      applied_ops: ops.length,
      sheet: isRecordObject(saved.sheet_data) ? cloneJson(saved.sheet_data) : {},
    });
  } catch (err) {
    next(err);
  }
}

export { getSheet, applySheetOps };
