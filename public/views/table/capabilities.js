export function getDefaultTableCapabilities(mode = "standard", canEdit = false) {
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

export function normalizeTableCapabilities(
  tableView,
  { userId, isManagerOrOwner },
) {
  const mode = tableView?.mode === "sandbox" ? "sandbox" : "standard";
  const isEditorLike =
    String(userId) === String(tableView?.user_id) || Boolean(isManagerOrOwner);
  const fallback = getDefaultTableCapabilities(mode, isEditorLike);

  return {
    ...fallback,
    ...(tableView?.capabilities || {}),
    mode,
  };
}

export function canRenderSidebarForTable(
  tableView,
  { userId, isManagerOrOwner },
) {
  return (
    String(userId) === String(tableView?.user_id) ||
    Boolean(isManagerOrOwner) ||
    Boolean(tableView?.is_guest_sandbox)
  );
}
