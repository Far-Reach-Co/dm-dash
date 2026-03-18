import { apiDelete, apiGet, apiPost } from "../../lib/apiUtils.js";
import { handleApiFailure } from "../../lib/apiUiFeedback.js";

export const LIBRARY_DATA_METHODS = [
  "loadFolders",
  "loadImages",
  "loadImagesForFolder",
  "loadImageCounts",
  "loadMore",
  "createPack",
  "editPack",
  "discoverPacks",
  "loadInstalledPacks",
  "installPack",
  "uninstallPack",
  "removePack",
  "getPackImages",
  "getImagePackMemberships",
  "addImageToPack",
  "removeImageFromPack",
  "removeImageById",
  "setImageFolder",
  "addImagesToPack",
  "moveImagesToFolder",
  "removeImages",
  "refreshImagesForCurrentScope",
];

export function bindLibraryDataMethods(libraryApp, controller) {
  for (const methodName of LIBRARY_DATA_METHODS) {
    libraryApp[methodName] = controller[methodName].bind(controller);
  }
}

function readArrayData(result) {
  return result.ok && Array.isArray(result.data) ? result.data : [];
}

function readMutationDataOrHandleFailure(result) {
  if (!result.ok) {
    handleApiFailure(result, { includeResultMessage: true });
    return null;
  }
  return result.data;
}

function readMutationSuccessOrHandleFailure(result, expectedStatus = null) {
  if (!result.ok) {
    handleApiFailure(result, { includeResultMessage: true });
    return false;
  }
  return expectedStatus === null ? true : result.status === expectedStatus;
}

export default class LibraryDataController {
  constructor(libraryApp) {
    this.libraryApp = libraryApp;
  }

  get projectId() {
    return this.libraryApp.projectId;
  }

  get grid() {
    return this.libraryApp.grid;
  }

  getFoldersEndpoint = () => {
    return this.projectId
      ? `/api/get_table_folders_by_project/${this.projectId}`
      : "/api/get_table_folders_by_user";
  };

  getImagesEndpoint = (limit, offset) => {
    const base = this.projectId
      ? `/api/get_library_images_by_project/${this.projectId}`
      : "/api/get_library_images_by_user";
    const params = new URLSearchParams();
    params.set("limit", String(limit));
    params.set("offset", String(offset));
    if (this.grid?.searchQuery) {
      params.set("q", this.grid.searchQuery);
    }
    if (this.grid?.sortKey) {
      params.set("sort", this.grid.sortKey);
    }
    return `${base}?${params.toString()}`;
  };

  getFolderImagesEndpoint = (folderId) => {
    const folderPart = folderId === null ? "unsorted" : folderId;
    return this.projectId
      ? `/api/get_library_images_by_project_in_folder/${this.projectId}/${folderPart}`
      : `/api/get_library_images_by_user_in_folder/${folderPart}`;
  };

  getImageCountsEndpoint = () => {
    return this.projectId
      ? `/api/get_library_image_counts_by_project/${this.projectId}`
      : "/api/get_library_image_counts_by_user";
  };

  getCreatePackEndpoint = () => {
    return this.projectId
      ? `/api/add_library_pack_by_project/${this.projectId}`
      : "/api/add_library_pack_by_user";
  };

  getDiscoverPacksEndpoint = (
    query = "",
    limit = 50,
    offset = 0,
    options = {},
  ) => {
    const { publishedOnly = false } = options || {};
    const params = new URLSearchParams();
    params.set("limit", String(limit));
    params.set("offset", String(offset));
    if (publishedOnly) {
      params.set("published", "true");
    }
    if (this.projectId) {
      params.set("project_id", String(this.projectId));
    }
    if (query.trim()) {
      params.set("q", query.trim());
    }
    return `/api/discover_library_packs?${params.toString()}`;
  };

  getInstalledPacksEndpoint = () => {
    return this.projectId
      ? `/api/get_installed_library_packs_by_project/${this.projectId}`
      : "/api/get_installed_library_packs_by_user";
  };

  getRemoveImageEndpoint = (imageId) => {
    return this.projectId
      ? `/api/remove_image_by_project/${imageId}/${this.projectId}`
      : `/api/remove_image_by_user/${imageId}`;
  };

  loadFolders = async () => {
    const result = await apiGet(this.getFoldersEndpoint());
    this.libraryApp.folders = readArrayData(result);

    if (this.libraryApp.currentFolder) {
      const freshFolder = this.libraryApp.folders.find(
        (folder) => folder.id == this.libraryApp.currentFolder.id,
      );
      this.libraryApp.currentFolder = freshFolder || null;
      if (this.grid) {
        this.grid.currentFolder = this.libraryApp.currentFolder;
      }
    }

    if (this.grid) {
      this.grid.pruneExpandedFolderIds(this.libraryApp.folders);
      this.grid.render();
    }
  };

  loadImages = async (reset = false) => {
    if (reset) {
      this.grid.showLoading();
    }

    const result = await apiGet(this.getImagesEndpoint(50, 0));
    if (result.ok && result.data) {
      this.grid.setImages(result.data);
    } else {
      this.grid.hideLoading();
    }
  };

  loadImagesForFolder = async (folderId) => {
    this.grid.showLoading();
    const result = await apiGet(this.getFolderImagesEndpoint(folderId));
    if (result.ok && result.data) {
      this.grid.setImages(result.data);
    } else {
      this.grid.hideLoading();
    }
  };

  loadImageCounts = async () => {
    const result = await apiGet(this.getImageCountsEndpoint());
    if (result.ok && result.data && this.grid) {
      this.grid.setCounts(result.data);
    }
  };

  loadMore = async () => {
    const nextOffset = this.grid.images.length;
    const result = await apiGet(this.getImagesEndpoint(50, nextOffset));
    if (result.ok && result.data) {
      this.grid.appendImages(result.data);
    }
  };

  createPack = async (payload) => {
    const result = await apiPost(this.getCreatePackEndpoint(), payload);
    return readMutationDataOrHandleFailure(result);
  };

  editPack = async (packId, payload) => {
    const result = await apiPost(`/api/edit_library_pack/${packId}`, payload);
    return readMutationDataOrHandleFailure(result);
  };

  discoverPacks = async (query = "", options = {}) => {
    if (!this.libraryApp.canUseLibraryPacks) {
      this.libraryApp.packs = [];
      if (this.grid) {
        this.grid.setPacks([]);
      }
      return [];
    }

    const result = await apiGet(
      this.getDiscoverPacksEndpoint(query, 100, 0, options),
    );
    this.libraryApp.packs = readArrayData(result);
    if (this.grid) {
      this.grid.setPacks(this.libraryApp.packs);
    }
    return this.libraryApp.packs;
  };

  loadInstalledPacks = async () => {
    if (!this.libraryApp.canUseLibraryPacks) {
      if (this.grid) {
        this.grid.setInstalledPacks([]);
      }
      return [];
    }
    const result = await apiGet(this.getInstalledPacksEndpoint());
    const installed = readArrayData(result);
    if (this.grid) {
      this.grid.setInstalledPacks(installed);
    }
    return installed;
  };

  installPack = async (packId) => {
    const endpoint = this.projectId
      ? `/api/install_library_pack_by_project/${this.projectId}/${packId}`
      : `/api/install_library_pack_by_user/${packId}`;
    const result = await apiPost(endpoint, {});
    return readMutationDataOrHandleFailure(result);
  };

  uninstallPack = async (packId) => {
    const endpoint = this.projectId
      ? `/api/uninstall_library_pack_by_project/${this.projectId}/${packId}`
      : `/api/uninstall_library_pack_by_user/${packId}`;
    const result = await apiDelete(endpoint);
    return readMutationSuccessOrHandleFailure(result, 200);
  };

  removePack = async (packId) => {
    const result = await apiDelete(`/api/remove_library_pack/${packId}`);
    return readMutationSuccessOrHandleFailure(result, 200);
  };

  getPackImages = async (packId) => {
    const params = new URLSearchParams();
    if (this.projectId) {
      params.set("project_id", String(this.projectId));
    }
    const endpoint = `/api/get_library_pack_images/${packId}${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    const result = await apiGet(endpoint);
    return readArrayData(result);
  };

  getImagePackMemberships = async (imageId) => {
    const params = new URLSearchParams();
    if (this.projectId) {
      params.set("project_id", String(this.projectId));
    }
    const qs = params.toString();
    const endpoint = `/api/get_library_pack_memberships_by_image/${imageId}${
      qs ? `?${qs}` : ""
    }`;
    const result = await apiGet(endpoint);
    return readArrayData(result);
  };

  addImageToPack = async (packId, imageId, options = {}) => {
    const payload = {
      pack_id: packId,
      image_id: imageId,
    };
    if (typeof options.sort_order === "number") {
      payload.sort_order = options.sort_order;
    }
    const result = await apiPost("/api/add_library_pack_image", payload);
    return result.ok ? result.data : null;
  };

  removeImageFromPack = async (packImageId) => {
    const result = await apiDelete(`/api/remove_library_pack_image/${packImageId}`);
    return readMutationSuccessOrHandleFailure(result, 200);
  };

  removeImageById = async (imageId) => {
    const result = await apiDelete(this.getRemoveImageEndpoint(imageId));
    return result.ok && result.status === 204;
  };

  setImageFolder = async (tableImageId, folderId) => {
    const payload = {
      folder_id: folderId === null ? 0 : folderId,
    };
    const result = await apiPost(`/api/edit_table_image/${tableImageId}`, payload);
    return result.ok;
  };

  addImagesToPack = async (packId, imageIds) => {
    const results = await Promise.all(
      imageIds.map((imageId) => this.addImageToPack(packId, imageId)),
    );
    return {
      success: results.filter(Boolean).length,
      total: imageIds.length,
    };
  };

  moveImagesToFolder = async (tableImageIds, folderId) => {
    const results = await Promise.all(
      tableImageIds.map((tableImageId) => this.setImageFolder(tableImageId, folderId)),
    );
    return {
      success: results.filter(Boolean).length,
      total: tableImageIds.length,
    };
  };

  removeImages = async (imageIds) => {
    const results = await Promise.all(
      imageIds.map((imageId) => this.removeImageById(imageId)),
    );
    return {
      success: results.filter(Boolean).length,
      total: imageIds.length,
    };
  };

  refreshImagesForCurrentScope = async () => {
    if (this.grid.showAllImages) {
      await this.loadImages(true);
      await this.loadImageCounts();
      return;
    }
    if (this.libraryApp.currentFolder) {
      await this.loadImagesForFolder(this.libraryApp.currentFolder.id);
      await this.loadImageCounts();
      return;
    }
    await this.loadImagesForFolder(null);
    await this.loadImageCounts();
  };
}
