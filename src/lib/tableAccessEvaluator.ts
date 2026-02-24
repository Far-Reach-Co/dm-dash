import { Request } from "express";
import { getTableViewByUUIDQuery } from "../api/queries/tableViews";
import { requireGuestSandboxAccess } from "./guestSandbox";
import {
  buildGuestSandboxCapabilities,
  requireTablePermission,
  TableCapabilities,
  TableViewAuthResource,
} from "./tableAuthz";
import { notFoundError } from "./httpErrors";

export interface TableAccessEvaluation {
  source: "table" | "guest_sandbox";
  table: TableViewAuthResource | null;
  canView: boolean;
  canEdit: boolean;
  capabilities: TableCapabilities;
}

export async function resolveTableAccessByUUID(
  req: Request,
  uuid: string,
  options?: { allowGuestSandbox?: boolean },
): Promise<TableAccessEvaluation> {
  const allowGuestSandbox = options?.allowGuestSandbox ?? true;
  const tableData = await getTableViewByUUIDQuery(uuid);
  const table = tableData.rows[0];
  if (table) {
    const auth = await requireTablePermission(req, table, "view");
    return {
      source: "table",
      table,
      canView: auth.canView,
      canEdit: auth.canEdit,
      capabilities: auth.capabilities,
    };
  }

  if (!allowGuestSandbox) {
    throw notFoundError("Table view not found");
  }

  await requireGuestSandboxAccess(req, uuid);
  return {
    source: "guest_sandbox",
    table: null,
    canView: true,
    canEdit: true,
    capabilities: buildGuestSandboxCapabilities(),
  };
}
