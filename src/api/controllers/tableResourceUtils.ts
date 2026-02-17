import { Request } from "express";
import { getTableViewByUUIDQuery, getTableViewQuery } from "../queries/tableViews.js";
import {
  assertTableCapability,
  requireTablePermission,
  TableAuthContext,
  TableCapabilities,
  TableViewAuthResource,
} from "../../lib/tableAuthz";
import { getProjectAccess, requireUser } from "../../lib/authz";
import {
  badRequestError,
  createHttpError,
  forbiddenError,
  notFoundError,
} from "../../lib/httpErrors";

export type TableViewRecord = TableViewAuthResource & {
  uuid?: string;
  title?: string;
  data?: Record<string, unknown>;
};

export { createHttpError, badRequestError, forbiddenError, notFoundError };

export function parsePositiveInt(
  raw: unknown,
  fieldName: string,
  options?: { required?: true },
): number;
export function parsePositiveInt(
  raw: unknown,
  fieldName: string,
  options: { required: false },
): number | null;
export function parsePositiveInt(
  raw: unknown,
  fieldName: string,
  { required = true }: { required?: boolean } = {},
): number | null {
  if (typeof raw === "undefined" || raw === null || raw === "") {
    if (!required) return null;
    throw badRequestError(`${fieldName} is required`);
  }
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) {
    throw badRequestError(`${fieldName} must be a valid number`);
  }
  return Math.trunc(value);
}

export async function getTableViewByIdOrThrow(id: string | number) {
  const data = await getTableViewQuery(id);
  const table = data.rows[0];
  if (!table) throw notFoundError("Table view not found");
  return table as TableViewRecord;
}

export async function getTableViewByUUIDOrThrow(uuid: string) {
  const data = await getTableViewByUUIDQuery(uuid);
  const table = data.rows[0];
  if (!table) throw notFoundError("Table view not found");
  return table as TableViewRecord;
}

export async function requireTablePermissionById(
  req: Request,
  tableViewId: string | number,
  mode: "view" | "edit",
  capability?: keyof TableCapabilities,
) {
  const table = await getTableViewByIdOrThrow(tableViewId);
  const auth = await requireTablePermission(req, table, mode);
  if (capability) {
    assertTableCapability(auth, capability);
  }
  return { table, auth };
}

export async function getOptionalTableEditAuth(
  req: Request,
  capability: keyof TableCapabilities,
) {
  const tableViewIdRaw = req.body?.table_view_id ?? req.query?.table_view_id;
  const tableViewId = parsePositiveInt(tableViewIdRaw, "table_view_id", {
    required: false,
  });
  if (tableViewId === null) return null;
  return await requireTablePermissionById(req, tableViewId, "edit", capability);
}

type ScopedResource = {
  project_id?: string | number | null;
  user_id?: string | number | null;
};

export function requireProjectIdFromTable(
  table: ScopedResource,
  fieldName = "table_view_id",
) {
  if (!table.project_id) {
    throw badRequestError(`${fieldName} is not a project table`);
  }
  return table.project_id;
}

export function requireUserIdFromTable(
  table: ScopedResource,
  fieldName = "table_view_id",
) {
  if (!table.user_id) {
    throw badRequestError(`${fieldName} is not a user table`);
  }
  return table.user_id;
}

export function assertProjectIdMatchesTable(
  projectId: string | number,
  tableProjectId: string | number,
  fieldName = "table_view_id",
) {
  if (String(projectId) !== String(tableProjectId)) {
    throw badRequestError(`${fieldName}/project_id mismatch`);
  }
}

export async function ensureScopedResourceEditable(
  req: Request,
  resource: ScopedResource,
  tableAuth: { table: ScopedResource; auth: TableAuthContext } | null,
) {
  if (tableAuth) {
    if (resource.project_id) {
      if (String(resource.project_id) !== String(tableAuth.table.project_id)) {
        throw forbiddenError();
      }
      return;
    }
    if (resource.user_id) {
      if (String(resource.user_id) !== String(tableAuth.table.user_id)) {
        throw forbiddenError();
      }
      return;
    }
    throw forbiddenError();
  }

  if (resource.project_id) {
    const access = await getProjectAccess(req, resource.project_id);
    if (!access?.isEditor) throw forbiddenError();
    return;
  }

  if (resource.user_id) {
    const userId = requireUser(req);
    if (String(resource.user_id) !== String(userId)) {
      throw forbiddenError();
    }
    return;
  }

  throw forbiddenError();
}
