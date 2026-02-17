import { Request } from "express";
import { getProjectAccess, requireUser } from "./authz";
import { forbiddenError } from "./httpErrors";

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
  canEditTableData: boolean;
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

type TableCapabilityOverrides = Partial<Omit<TableCapabilities, "mode">>;

export interface TableAuthContext {
  table: TableViewAuthResource;
  mode: TableMode;
  canView: boolean;
  canEdit: boolean;
  isOwner: boolean;
  isEditor: boolean;
  capabilities: TableCapabilities;
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
  overrides: TableCapabilityOverrides = {},
): TableCapabilities {
  const baseCapabilities: TableCapabilities = !canEdit
    ? {
        mode,
        canEditTableData: false,
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
      }
      : mode === "sandbox"
      ? {
          mode,
          canEditTableData: true,
          canManagePins: false,
          canUsePinPortals: false,
          canChangeTable: false,
          canManageLayers: true,
          canManageGrid: true,
          canManageImageAssets: false,
          canManageFolders: false,
          canEditImageMetadata: false,
          canDeleteCanvasObjects: true,
          canManageTableSettings: true,
        }
      : {
          mode,
          canEditTableData: true,
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

  return {
    ...baseCapabilities,
    ...overrides,
    mode,
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
      if (!isOwner) throw forbiddenError();
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
    if (!isOwner) {
      capabilities.canEditTableData = true;
    }
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

  const isPublic = !!table.is_public;
  requireUser(req);
  const access = await getProjectAccess(req, table.project_id);
  if (!access) throw forbiddenError();

  const canView = access.isEditor || isPublic;
  if (!canView) throw forbiddenError();

  const canEdit = access.isEditor;
  const capabilities = buildTableCapabilities(mode, canEdit);
  if (!canEdit) {
    capabilities.canEditTableData = true;
  }
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
    throw forbiddenError();
  }
  return auth;
}

export function hasTableCapability(
  capabilities: TableCapabilities,
  capability: keyof TableCapabilities,
) {
  return !!capabilities?.[capability];
}

export function hasAnyTableEditCapability(capabilities: TableCapabilities) {
  return (
    hasTableCapability(capabilities, "canEditTableData") ||
    hasTableCapability(capabilities, "canManagePins") ||
    hasTableCapability(capabilities, "canUsePinPortals") ||
    hasTableCapability(capabilities, "canChangeTable") ||
    hasTableCapability(capabilities, "canManageLayers") ||
    hasTableCapability(capabilities, "canManageGrid") ||
    hasTableCapability(capabilities, "canManageImageAssets") ||
    hasTableCapability(capabilities, "canManageFolders") ||
    hasTableCapability(capabilities, "canEditImageMetadata") ||
    hasTableCapability(capabilities, "canDeleteCanvasObjects") ||
    hasTableCapability(capabilities, "canManageTableSettings")
  );
}

export function assertTableCapabilities(
  capabilities: TableCapabilities,
  mode: "view" | "edit",
  capability?: keyof TableCapabilities,
) {
  if (mode === "edit" && !hasAnyTableEditCapability(capabilities)) {
    throw forbiddenError();
  }
  if (capability && !hasTableCapability(capabilities, capability)) {
    throw forbiddenError("Action is disabled for this table mode");
  }
}

export function buildGuestSandboxCapabilities(): TableCapabilities {
  return buildTableCapabilities("sandbox", true, {
    canDeleteCanvasObjects: true,
    canManageTableSettings: false,
  });
}

export function assertTableCapability(
  auth: TableAuthContext,
  capability: keyof TableCapabilities,
  message = "Action is disabled for this table mode",
) {
  if (!auth.capabilities[capability]) {
    throw forbiddenError(message);
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
