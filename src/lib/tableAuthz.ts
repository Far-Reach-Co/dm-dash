import { Request } from "express";
import { getProjectAccess, requireUser } from "./authz";
import { forbiddenError } from "./httpErrors";
import { getUserByIdQuery } from "../api/queries/users.js";

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
  canPlaceImagesFromSidebar: boolean;
  canUseLibraryPacks: boolean;
  canDiscoverLibraryPacks: boolean;
  canManageLibraryPackInstalls: boolean;
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

export type TableActionAuthContext = {
  canView: boolean;
  canEdit: boolean;
  capabilities?: TableCapabilities | null;
};

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
        canPlaceImagesFromSidebar: false,
        canUseLibraryPacks: false,
        canDiscoverLibraryPacks: false,
        canManageLibraryPackInstalls: false,
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
          canPlaceImagesFromSidebar: true,
          canUseLibraryPacks: true,
          canDiscoverLibraryPacks: false,
          canManageLibraryPackInstalls: false,
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
          canPlaceImagesFromSidebar: true,
          canUseLibraryPacks: true,
          canDiscoverLibraryPacks: true,
          canManageLibraryPackInstalls: true,
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
      const userData = await getUserByIdQuery(userId);
      const userIsPro = !!userData.rows[0]?.is_pro;
      const canUseLibraryPacks = capabilities.canUseLibraryPacks && userIsPro;
      capabilities.canUseLibraryPacks = canUseLibraryPacks;
      capabilities.canDiscoverLibraryPacks = canUseLibraryPacks && mode !== "sandbox";
      capabilities.canManageLibraryPackInstalls = canUseLibraryPacks && mode !== "sandbox";
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
    const canEdit = isOwner || mode === "sandbox";
    const capabilities = buildTableCapabilities(mode, canEdit);
    let userIsPro = false;
    if (typeof currentUser !== "undefined") {
      const userData = await getUserByIdQuery(currentUser);
      userIsPro = !!userData.rows[0]?.is_pro;
    }
    const canUseLibraryPacks = capabilities.canUseLibraryPacks && userIsPro;
    capabilities.canUseLibraryPacks = canUseLibraryPacks;
    capabilities.canDiscoverLibraryPacks = canUseLibraryPacks && mode !== "sandbox";
    capabilities.canManageLibraryPackInstalls = canUseLibraryPacks && mode !== "sandbox";
    if (mode === "sandbox" && !isOwner) {
      capabilities.canManageTableSettings = false;
    }
    if (!isOwner) {
      capabilities.canEditTableData = true;
    }
    return {
      table,
      mode,
      canView: true,
      canEdit,
      isOwner: !!isOwner,
      isEditor: canEdit,
      capabilities,
    };
  }

  const isPublic = !!table.is_public;
  requireUser(req);
  const access = await getProjectAccess(req, table.project_id);
  if (!access) throw forbiddenError();

  const canView = mode === "sandbox" ? access.isMember : access.isEditor || isPublic;
  if (!canView) throw forbiddenError();

  const canEdit = mode === "sandbox" ? access.isMember : access.isEditor;
  const capabilities = buildTableCapabilities(mode, canEdit);
  const canUseLibraryPacks = capabilities.canUseLibraryPacks && !!access.project.is_pro;
  capabilities.canUseLibraryPacks = canUseLibraryPacks;
  capabilities.canDiscoverLibraryPacks = canUseLibraryPacks && mode !== "sandbox";
  capabilities.canManageLibraryPackInstalls = canUseLibraryPacks && mode !== "sandbox";
  if (mode === "sandbox" && !access.isEditor) {
    capabilities.canManageTableSettings = false;
  }
  if (!canEdit) {
    capabilities.canEditTableData = true;
  }
  return {
    table,
    mode,
    canView,
    canEdit,
    isOwner: access.isOwner,
    isEditor: canEdit,
    capabilities,
  };
}

export async function requireTablePermission(
  req: Request,
  table: TableViewAuthResource,
  mode: "view" | "edit" = "view",
): Promise<TableAuthContext> {
  const auth = await resolveTableAuth(req, table);
  if (!isTableActionAllowed(auth, mode)) {
    throw forbiddenError();
  }
  return auth;
}

export function isTableActionAllowed(
  auth: TableActionAuthContext,
  mode: "view" | "edit",
  capability?: keyof TableCapabilities,
) {
  if (mode === "view" && !auth.canView) return false;
  if (mode === "edit" && !auth.canEdit) return false;
  if (capability && !auth.capabilities?.[capability]) return false;
  return true;
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
    hasTableCapability(capabilities, "canUseLibraryPacks") ||
    hasTableCapability(capabilities, "canDiscoverLibraryPacks") ||
    hasTableCapability(capabilities, "canManageLibraryPackInstalls") ||
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
    canUseLibraryPacks: false,
    canDiscoverLibraryPacks: false,
    canManageLibraryPackInstalls: false,
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
