import createElement from "../../lib/salt-lib/createElement.js";

export function renderLibraryBulkToolbar(grid) {
  if (grid.viewMode === "packs" || !grid.selectMode) {
    return createElement("div", {
      class: "library-bulk-toolbar",
      style: "display:none",
    });
  }

  const filteredImages = grid.getFilteredImages();
  const selectedCount = grid.selectedImageIds.size;
  const editablePacks = grid.getEditablePacks();

  const packSelect = createElement(
    "select",
    {
      class: "library-sort-select",
      ...(editablePacks.length ? {} : { disabled: true }),
    },
    [
      createElement("option", { value: "" }, "Add to pack..."),
      ...editablePacks.map((pack) =>
        createElement(
          "option",
          { value: String(pack.id) },
          pack.title || `Pack ${pack.id}`,
        ),
      ),
    ],
  );

  const folderOptions = grid.libraryApp.folders || [];
  const folderSelect = createElement(
    "select",
    { class: "library-sort-select" },
    [
      createElement("option", { value: "__unset__" }, "Move to folder..."),
      createElement("option", { value: "__unsorted__" }, "Unsorted"),
      ...folderOptions.map((folder) =>
        createElement(
          "option",
          { value: String(folder.id) },
          folder.title || `Folder ${folder.id}`,
        ),
      ),
    ],
  );

  const doBulkAddToPack = async () => {
    if (grid.bulkBusy) return;
    const packId = packSelect.value;
    if (!packId) return;

    const imageIds = grid.images
      .filter((img) => grid.selectedImageIds.has(String(img.image_id)))
      .map((img) => img.image_id);
    if (!imageIds.length) {
      window.customAlertError("Select at least one image");
      return;
    }

    grid.bulkBusy = true;
    grid.requestRender();
    const result = await grid.libraryApp.addImagesToPack(packId, imageIds);
    grid.bulkBusy = false;
    await grid.libraryApp.discoverPacks(grid.packSearchQuery);
    grid.requestRender();
    window.customAlert(`Added ${result.success}/${result.total} images to pack`);
  };

  const doBulkMoveFolder = async () => {
    if (grid.bulkBusy) return;
    const value = folderSelect.value;
    if (!value || value === "__unset__") return;
    const folderId = value === "__unsorted__" ? null : Number(value);
    const tableImageIds = grid.images
      .filter((img) => grid.selectedImageIds.has(String(img.image_id)))
      .map((img) => img.id);
    if (!tableImageIds.length) {
      window.customAlertError("Select at least one image");
      return;
    }

    grid.bulkBusy = true;
    grid.requestRender();
    const result = await grid.libraryApp.moveImagesToFolder(tableImageIds, folderId);
    grid.bulkBusy = false;
    grid.selectedImageIds.clear();
    await grid.libraryApp.loadImageCounts();
    await grid.libraryApp.refreshImagesForCurrentScope();
    grid.requestRender();
    window.customAlert(`Moved ${result.success}/${result.total} images`);
  };

  const doBulkDelete = async () => {
    if (grid.bulkBusy) return;
    const imageIds = grid.images
      .filter((img) => grid.selectedImageIds.has(String(img.image_id)))
      .map((img) => img.image_id);
    if (!imageIds.length) {
      window.customAlertError("Select at least one image");
      return;
    }

    const confirmed = await window.customConfirm(
      `Delete ${imageIds.length} selected image${imageIds.length === 1 ? "" : "s"}?`,
      { confirmText: "Delete", danger: true },
    );
    if (!confirmed) return;

    grid.bulkBusy = true;
    grid.requestRender();
    const result = await grid.libraryApp.removeImages(imageIds);
    grid.bulkBusy = false;
    grid.selectedImageIds.clear();
    await grid.libraryApp.loadImageCounts();
    await grid.libraryApp.refreshImagesForCurrentScope();
    grid.requestRender();
    window.customAlert(`Deleted ${result.success}/${result.total} images`);
  };

  return createElement("div", { class: "library-bulk-toolbar visible" }, [
    createElement(
      "div",
      { class: "library-bulk-summary" },
      `${selectedCount} selected`,
    ),
    createElement(
      "button",
      {
        class: "library-pack-action-btn",
        type: "button",
        ...(grid.bulkBusy ? { disabled: true } : {}),
      },
      `Select All Filtered (${filteredImages.length})`,
      {
        type: "click",
        event: () => {
          filteredImages.forEach((img) =>
            grid.selectedImageIds.add(String(img.image_id)),
          );
          grid.requestRender();
        },
      },
    ),
    createElement(
      "button",
      {
        class: "library-pack-action-btn",
        type: "button",
        ...(grid.bulkBusy ? { disabled: true } : {}),
      },
      "Clear",
      { type: "click", event: () => grid.clearSelection() },
    ),
    packSelect,
    createElement(
      "button",
      {
        class: "library-pack-action-btn",
        type: "button",
        ...(!selectedCount || grid.bulkBusy ? { disabled: true } : {}),
      },
      "Apply",
      { type: "click", event: doBulkAddToPack },
    ),
    folderSelect,
    createElement(
      "button",
      {
        class: "library-pack-action-btn",
        type: "button",
        ...(!selectedCount || grid.bulkBusy ? { disabled: true } : {}),
      },
      "Move",
      { type: "click", event: doBulkMoveFolder },
    ),
    createElement(
      "button",
      {
        class: "library-pack-action-btn danger",
        type: "button",
        ...(!selectedCount || grid.bulkBusy ? { disabled: true } : {}),
      },
      "Delete Selected",
      { type: "click", event: doBulkDelete },
    ),
  ]);
}
