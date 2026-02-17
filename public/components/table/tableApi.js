import { buildTableViewQuerySuffix, getProjectIdFromLocation } from "./tableContext.js";

export function getCurrentProjectId() {
  return getProjectIdFromLocation();
}

export function getGuestSandboxId(tableView) {
  return tableView?.guest_sandbox_id || null;
}

export function getTablesEndpoint(projectId = getCurrentProjectId()) {
  return projectId
    ? `/api/get_table_views_by_project/${projectId}`
    : "/api/get_table_views_by_user";
}

export function getRecordsEndpoint(projectId = getCurrentProjectId()) {
  return projectId
    ? `/api/get_records_by_project/${projectId}`
    : "/api/get_records_by_user";
}

export function getTableFoldersEndpoint({
  projectId = getCurrentProjectId(),
  guestSandboxId = null,
} = {}) {
  if (guestSandboxId) return null;
  return projectId
    ? `/api/get_table_folders_by_project/${projectId}`
    : "/api/get_table_folders_by_user";
}

export function getImageCountsEndpoint({
  projectId = getCurrentProjectId(),
  guestSandboxId = null,
} = {}) {
  if (guestSandboxId) {
    return `/api/get_guest_sandbox_image_counts/${guestSandboxId}`;
  }
  return projectId
    ? `/api/get_library_image_counts_by_project/${projectId}`
    : "/api/get_library_image_counts_by_user";
}

export function getLibraryImagesEndpoint({
  projectId = getCurrentProjectId(),
  guestSandboxId = null,
  limit = 60,
  offset = 0,
  sort = "newest",
  query = "",
  folderScope = { showAllImages: true, currentFolder: null },
} = {}) {
  const params = new URLSearchParams();
  params.set("limit", String(limit));
  params.set("offset", String(offset));
  params.set("sort", sort);

  if (query) {
    params.set("q", query);
  }

  if (guestSandboxId) {
    return `/api/get_guest_sandbox_images/${guestSandboxId}?${params.toString()}`;
  }

  if (!folderScope.showAllImages) {
    if (folderScope.currentFolder) {
      params.set("folder_id", String(folderScope.currentFolder.id));
    } else {
      params.set("folder_id", "unsorted");
    }
  }

  const base = projectId
    ? `/api/get_library_images_by_project/${projectId}`
    : "/api/get_library_images_by_user";
  return `${base}?${params.toString()}`;
}

export function getImageDeleteEndpoint({
  imageId,
  tableViewId,
  projectId = getCurrentProjectId(),
  guestSandboxId = null,
}) {
  if (guestSandboxId) return null;
  if (projectId) {
    const suffix = buildTableViewQuerySuffix(tableViewId);
    return `/api/remove_image_by_project/${imageId}/${projectId}${suffix}`;
  }
  return `/api/remove_image_by_table_user/${imageId}/${tableViewId}`;
}
