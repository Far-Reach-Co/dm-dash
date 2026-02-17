import { Request } from "express";
import { getProjectAccess, requireUser } from "./authz";

export type TableMode = "standard" | "sandbox";

export interface TableViewAuthResource {
  id: string | number;
  project_id?: string | number | null;
  user_id?: string | number | null;
  is_public?: boolean;
  mode?: string | null;
}

export interface TableCapabilities {
  mode: TableMode;
  canManagePins: boolean;
  canUsePinPortals: boolean;
  canChangeTable: boolean;
  canManageLayers: boolean;
  canManageGrid: boolean;
  canManageImageAssets: boolean;
  canManageFolders: boolean;
  canEditImageMetadata: boolean;
  canDeleteCanvasObjects: boolean;
  canManageTableSettings: boolean;
}

export interface TableAuthContext {
  table: TableViewAuthResource;
  mode: TableMode;
  canView: boolean;
  canEdit: boolean;
  isOwner: boolean;
  isEditor: boolean;
  capabilities: TableCapabilities;
}

function tableAuthError(status: number, message: string) {
  const err: any = new Error(message);
  err.status = status;
  return err;
}

export function normalizeTableMode(mode: unknown): TableMode {
  if (mode === "sandbox") return "sandbox";
  return "standard";
}

export function parseRequestedTableMode(mode: unknown): TableMode {
  return normalizeTableMode(mode);
}

export function buildTableCapabilities(
  mode: TableMode,
  canEdit: boolean,
): TableCapabilities {
  if (!canEdit) {
    return {
      mode,
      canManagePins: false,
      canUsePinPortals: false,
      canChangeTable: false,
      canManageLayers: false,
      canManageGrid: false,
      canManageImageAssets: false,
      canManageFolders: false,
      canEditImageMetadata: false,
      canDeleteCanvasObjects: false,
      canManageTableSettings: false,
    };
  }

  if (mode === "sandbox") {
    return {
      mode,
      canManagePins: false,
      canUsePinPortals: false,
      canChangeTable: false,
      canManageLayers: true,
      canManageGrid: true,
      canManageImageAssets: false,
      canManageFolders: false,
      canEditImageMetadata: false,
      canDeleteCanvasObjects: false,
      canManageTableSettings: true,
    };
  }

  return {
    mode,
    canManagePins: true,
    canUsePinPortals: true,
    canChangeTable: true,
    canManageLayers: true,
    canManageGrid: true,
    canManageImageAssets: true,
    canManageFolders: true,
    canEditImageMetadata: true,
    canDeleteCanvasObjects: true,
    canManageTableSettings: true,
  };
}

export async function resolveTableAuth(
  req: Request,
  table: TableViewAuthResource,
): Promise<TableAuthContext> {
  const mode = normalizeTableMode(table.mode);

  if (!table.project_id) {
    if (!table.is_public) {
      const userId = requireUser(req);
      const isOwner = String(table.user_id) === String(userId);
      if (!isOwner) throw tableAuthError(403, "Forbidden");
      const capabilities = buildTableCapabilities(mode, true);
      return {
        table,
        mode,
        canView: true,
        canEdit: true,
        isOwner: true,
        isEditor: true,
        capabilities,
      };
    }

    const currentUser = req.session?.user;
    const isOwner =
      typeof currentUser !== "undefined" &&
      String(table.user_id) === String(currentUser);
    const capabilities = buildTableCapabilities(mode, !!isOwner);
    return {
      table,
      mode,
      canView: true,
      canEdit: !!isOwner,
      isOwner: !!isOwner,
      isEditor: !!isOwner,
      capabilities,
    };
  }

  requireUser(req);
  const access = await getProjectAccess(req, table.project_id);
  if (!access) throw tableAuthError(403, "Forbidden");

  const canView = access.isEditor || !!table.is_public;
  if (!canView) throw tableAuthError(403, "Forbidden");

  const canEdit = access.isEditor;
  const capabilities = buildTableCapabilities(mode, canEdit);
  return {
    table,
    mode,
    canView,
    canEdit,
    isOwner: access.isOwner,
    isEditor: access.isEditor,
    capabilities,
  };
}

export async function requireTablePermission(
  req: Request,
  table: TableViewAuthResource,
  mode: "view" | "edit" = "view",
): Promise<TableAuthContext> {
  const auth = await resolveTableAuth(req, table);
  if (mode === "edit" && !auth.canEdit) {
    throw tableAuthError(403, "Forbidden");
  }
  return auth;
}

export function assertTableCapability(
  auth: TableAuthContext,
  capability: keyof TableCapabilities,
  message = "Action is disabled for this table mode",
) {
  if (!auth.capabilities[capability]) {
    throw tableAuthError(403, message);
  }
}

export function withTableCapabilities<T extends TableViewAuthResource>(
  table: T,
  capabilities: TableCapabilities,
) {
  return {
    ...table,
    mode: normalizeTableMode(table.mode),
    capabilities,
  };
}
