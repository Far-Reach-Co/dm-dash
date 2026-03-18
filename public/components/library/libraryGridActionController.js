import modal from "../modal.js";
import renderImageSettingsModal from "../shared/imageSettingsModal.js";
import { apiDelete } from "../../lib/apiUtils.js";
import {
  normalizePackTagsInput as normalizePackTagsInputFromModal,
  openCreatePackModal,
  openDiscoverPacksModal,
  openEditPackModal,
  openPackImagesModal,
} from "./LibraryPackModal.js";

export const LIBRARY_GRID_ACTION_METHODS = [
  "removeFolder",
  "normalizePackTagsInput",
  "renderEditPackModal",
  "renderPackImagesModal",
  "renderPackImageDetailModal",
  "renderCreatePackModal",
  "renderDiscoverPacksModal",
  "deleteImage",
  "renderImageDetailModal",
];

export function bindLibraryGridActionMethods(grid, controller) {
  for (const methodName of LIBRARY_GRID_ACTION_METHODS) {
    grid[methodName] = controller[methodName].bind(controller);
  }
}

export default class LibraryGridActionController {
  constructor(grid) {
    this.grid = grid;
  }

  getPackSettingsContext = async (image) => {
    const editablePacks = this.grid.getEditablePacks();
    const imageId = String(image.image_id ?? image.id);
    const currentPackMemberships =
      await this.grid.libraryApp.getImagePackMemberships(imageId);

    return {
      editablePacks,
      currentPackMemberships,
    };
  };

  refreshPackDiscovery = async () => {
    await this.grid.libraryApp.discoverPacks(this.grid.packSearchQuery);
  };

  addImageToPack = async (packId, targetImageId) => {
    const result = await this.grid.libraryApp.addImageToPack(
      packId,
      targetImageId,
    );
    if (!result) return false;

    window.customAlert("Image added to pack");
    await this.refreshPackDiscovery();
    return true;
  };

  removeImageFromPack = async (packImageId) => {
    const ok = await this.grid.libraryApp.removeImageFromPack(packImageId);
    if (!ok) {
      window.customAlertError("Could not remove image from pack");
      return false;
    }

    window.customAlert("Image removed from pack");
    await this.refreshPackDiscovery();
    return true;
  };

  removeFolder = async (folder) => {
    const confirmed = await window.customConfirm(
      `Are you sure you want to remove folder: "${folder.title}"? Images will be moved to the parent folder.`,
      { confirmText: "Remove", danger: true },
    );
    if (!confirmed) return;

    const result = await apiDelete(`/api/remove_table_folder/${folder.id}`);
    if (!(result.ok && result.status === 204)) {
      window.customAlertError("Could not remove folder.");
      return;
    }

    if (this.grid.currentFolder && this.grid.currentFolder.id == folder.id) {
      if (folder.parent_folder_id) {
        const parent = this.grid.libraryApp.folders.find(
          (candidate) => candidate.id == folder.parent_folder_id,
        );
        this.grid.libraryApp.setCurrentFolder(parent || null);
      } else {
        this.grid.libraryApp.setCurrentFolder(null);
      }
    }

    await this.grid.libraryApp.loadFolders();
    await this.grid.libraryApp.refreshImagesForCurrentScope();
  };

  normalizePackTagsInput = (raw) => {
    return normalizePackTagsInputFromModal(raw);
  };

  renderEditPackModal = (pack) => {
    openEditPackModal(this.grid, pack);
  };

  renderPackImagesModal = async (pack) => {
    await openPackImagesModal(this.grid, pack);
  };

  renderPackImageDetailModal = async (image) => {
    const { editablePacks, currentPackMemberships } =
      await this.getPackSettingsContext(image);

    return await renderImageSettingsModal({
      image,
      projectId: this.grid.projectId,
      tableImageId: null,
      onDelete: null,
      onUpdate: () => {},
      onPackUpdate: async () => {
        await this.refreshPackDiscovery();
        modal.show(await this.renderPackImageDetailModal(image));
      },
      capabilities: {
        canEditImageMetadata: true,
        canManageFolders: false,
        canManageImageAssets: false,
      },
      showFolderField: false,
      packOptions: editablePacks,
      currentPackMemberships,
      onAddToPack: this.addImageToPack,
      onRemoveFromPack: this.removeImageFromPack,
    });
  };

  renderCreatePackModal = () => {
    openCreatePackModal(this.grid);
  };

  renderDiscoverPacksModal = () => {
    openDiscoverPacksModal(this.grid);
  };

  deleteImage = async (image) => {
    const confirmed = await window.customConfirm(
      `Are you sure you want to delete "${image.original_name}"?`,
      { confirmText: "Delete", danger: true },
    );
    if (!confirmed) return;

    const ok = await this.grid.libraryApp.removeImageById(image.image_id);
    if (!ok) {
      window.customAlertError("Could not delete image");
      return;
    }
    this.grid.selectedImageIds.delete(String(image.image_id));
    modal.hide();
    await this.grid.libraryApp.loadImageCounts();
    await this.grid.libraryApp.refreshImagesForCurrentScope();
  };

  renderImageDetailModal = async (image) => {
    const { editablePacks, currentPackMemberships } =
      await this.getPackSettingsContext(image);

    return await renderImageSettingsModal({
      image,
      projectId: this.grid.projectId,
      tableImageId: image.id,
      onDelete: () => this.deleteImage(image),
      onUpdate: () => this.grid.requestRender(),
      onPackUpdate: async () => {
        this.grid.requestRender();
        modal.show(await this.renderImageDetailModal(image));
      },
      packOptions: editablePacks,
      currentPackMemberships,
      onAddToPack: this.addImageToPack,
      onRemoveFromPack: this.removeImageFromPack,
    });
  };
}
