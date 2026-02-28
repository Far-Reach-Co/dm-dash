const SIDEBAR_CAPABILITY_KEYS = [
  "canPlaceImagesFromSidebar",
  "canUseLibraryPacks",
  "canDiscoverLibraryPacks",
  "canManageLibraryPackInstalls",
  "canManageTableSettings",
  "canManageImageAssets",
  "canManageFolders",
];

export function normalizeTableCapabilities(tableView) {
  const mode = tableView?.mode === "sandbox" ? "sandbox" : "standard";
  const serverCapabilities =
    tableView?.capabilities && typeof tableView.capabilities === "object"
      ? tableView.capabilities
      : {};
  return {
    ...serverCapabilities,
    mode,
  };
}

export function canRenderSidebarForTable(tableView) {
  if (tableView?.is_guest_sandbox) return true;
  const capabilities = normalizeTableCapabilities(tableView);
  return SIDEBAR_CAPABILITY_KEYS.some((key) => !!capabilities?.[key]);
}
