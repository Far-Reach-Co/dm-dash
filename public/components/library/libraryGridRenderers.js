import createElement from "../../lib/salt-lib/createElement.js";
import { buildFolderTree } from "../shared/folderTreeUtils.js";
import modal from "../modal.js";
import { renderLibraryBulkToolbar } from "./LibraryBulkToolbar.js";
import { renderLibraryPackList } from "./LibraryPackList.js";

function renderFolderTreeItem(grid, folder, depth = 0) {
  const hasChildren = folder.children && folder.children.length > 0;
  const isExpanded = grid.expandedFolderIds.has(folder.id);
  const isActive =
    !grid.showAllImages &&
    grid.currentFolder &&
    grid.currentFolder.id == folder.id;
  const imgCount = grid.countImagesInFolder(folder.id);

  const toggle = createElement(
    "span",
    {
      class: "library-folder-toggle" + (isExpanded ? " expanded" : ""),
    },
    hasChildren ? "▶" : "",
  );

  const name = createElement("span", {}, folder.title);

  const count = createElement(
    "span",
    { class: "library-folder-count" },
    imgCount > 0 ? `(${imgCount})` : "",
  );

  const deleteBtn = createElement(
    "span",
    { class: "library-folder-actions", title: "Delete folder" },
    "×",
    {
      type: "click",
      event: (e) => {
        e.stopPropagation();
        grid.removeFolder(folder);
      },
    },
  );

  const item = createElement(
    "div",
    {
      class:
        "library-folder-item" +
        (isActive ? " library-folder-item-active" : ""),
      style: `padding-left: ${12 + depth * 18}px`,
    },
    [toggle, name, count, deleteBtn],
    {
      type: "click",
      event: () => {
        if (hasChildren) {
          if (isExpanded) {
            grid.expandedFolderIds.delete(folder.id);
          } else {
            grid.expandedFolderIds.add(folder.id);
          }
        }
        grid.showAllImages = false;
        grid.currentFolder = folder;
        grid.libraryApp.currentFolder = folder;
        grid.requestRender();
        grid.libraryApp.loadImagesForFolder(folder.id);
      },
    },
  );

  const items = [item];

  if (hasChildren && isExpanded) {
    const childContainer = createElement("div", {
      class: "library-folder-children",
    });
    for (const child of folder.children) {
      const childItems = renderFolderTreeItem(grid, child, depth + 1);
      for (const childItem of childItems) {
        childContainer.append(childItem);
      }
    }
    items.push(childContainer);
  }

  return items;
}

function renderImageCard(grid, image, index) {
  const isSelected = grid.isImageSelected(image);
  const thumbElem = image.src
    ? createElement("img", {
        class: "library-card-thumb",
        src: image.src,
        alt: image.original_name,
        loading: "lazy",
      })
    : createElement("div", { class: "library-card-thumb" });

  const info = createElement("div", { class: "library-card-info" }, [
    createElement("div", { class: "library-card-name" }, image.original_name),
    createElement(
      "div",
      { class: "library-card-size" },
      grid.formatFileSize(image.size),
    ),
  ]);

  const card = createElement(
    "div",
    { class: `library-card${isSelected ? " library-card-selected" : ""}` },
    [thumbElem, info],
    {
      type: "click",
      event: async () => {
        if (grid.selectMode) {
          grid.toggleImageSelection(image);
          return;
        }
        modal.show(await grid.renderImageDetailModal(image));
      },
    },
  );

  if (grid.selectMode) {
    const checkbox = createElement("input", {
      type: "checkbox",
      class: "library-card-checkbox",
      ...(isSelected ? { checked: true } : {}),
    });
    checkbox.addEventListener("click", (e) => {
      e.stopPropagation();
      grid.toggleImageSelection(image);
    });
    card.append(checkbox);
  }

  card.style.setProperty("--card-index", Math.min(index, 20));

  return card;
}

export function renderLibraryGridHeader(grid) {
  const packsMode = grid.viewMode === "packs";
  const title = packsMode
    ? `Packs · ${grid.scopeName}`
    : `Image Library · ${grid.scopeName}`;
  const selectBtn = createElement(
    "button",
    {
      class: "library-pack-action-btn",
      type: "button",
      title: "Toggle multi-select mode",
      ...(packsMode ? { style: "display:none" } : {}),
    },
    grid.selectMode ? "Done Selecting" : "Select",
    {
      type: "click",
      event: () => grid.toggleSelectMode(),
    },
  );

  const sortSelect = createElement(
    "select",
    {
      class: "library-sort-select",
      title: "Sort images",
      ...(packsMode ? { style: "display:none" } : {}),
    },
    [
      createElement("option", { value: "newest" }, "Newest"),
      createElement("option", { value: "name" }, "Name"),
      createElement("option", { value: "size" }, "Size"),
    ],
    {
      type: "change",
      event: (e) => {
        grid.sortKey = e.target.value;
        if (grid.showAllImages) {
          grid.libraryApp.loadImages(true);
        } else {
          grid.requestRender();
        }
      },
    },
  );
  sortSelect.value = grid.sortKey;

  return createElement("div", { class: "library-header" }, [
    createElement("h1", {}, title),
    createElement("div", { class: "library-header-meta" }, [
      createElement("span", { class: "library-scope" }, grid.getHeaderScopeLabel()),
      createElement("span", { class: "library-breadcrumb" }, grid.getHeaderCountLabel()),
    ]),
    selectBtn,
    sortSelect,
  ]);
}

export function renderLibraryGridPacksSection(grid) {
  return renderLibraryPackList(grid);
}

export function renderLibraryGridFolderTree(grid) {
  const folders = grid.libraryApp.folders;
  const tree = buildFolderTree(folders);

  const unsortedCount =
    typeof grid.unsortedCount === "number"
      ? grid.unsortedCount
      : grid.images.filter((img) => !img.folder_id).length;

  const allActive = grid.showAllImages;
  const allItem = createElement(
    "div",
    {
      class:
        "library-folder-item" +
        (allActive ? " library-folder-item-active" : ""),
      style: "padding-left: 12px",
    },
    [
      createElement("span", { class: "library-folder-toggle" }, ""),
      createElement("span", {}, "All Images"),
      createElement(
        "span",
        { class: "library-folder-count" },
        (grid.allImagesTotal ?? grid.images.length) > 0
          ? `(${grid.allImagesTotal ?? grid.images.length})`
          : "",
      ),
    ],
    {
      type: "click",
      event: () => {
        grid.showAllImages = true;
        grid.currentFolder = null;
        grid.libraryApp.currentFolder = null;
        grid.requestRender();
        grid.libraryApp.loadImages(true);
      },
    },
  );

  const unsortedActive = !grid.showAllImages && !grid.currentFolder;
  const unsortedItem = createElement(
    "div",
    {
      class:
        "library-folder-item" +
        (unsortedActive ? " library-folder-item-active" : ""),
      style: "padding-left: 12px",
    },
    [
      createElement("span", { class: "library-folder-toggle" }, ""),
      createElement("span", {}, "Unsorted"),
      createElement(
        "span",
        { class: "library-folder-count" },
        unsortedCount > 0 ? `(${unsortedCount})` : "",
      ),
    ],
    {
      type: "click",
      event: () => {
        grid.showAllImages = false;
        grid.currentFolder = null;
        grid.libraryApp.currentFolder = null;
        grid.requestRender();
        grid.libraryApp.loadImagesForFolder(null);
      },
    },
  );

  const folderElems = [];
  for (const root of tree) {
    const items = renderFolderTreeItem(grid, root, 0);
    for (const item of items) {
      folderElems.push(item);
    }
  }

  return createElement("div", { class: "library-folder-tree" }, [
    allItem,
    unsortedItem,
    ...folderElems,
  ]);
}

export function renderLibraryGridBulkToolbar(grid) {
  return renderLibraryBulkToolbar(grid);
}

export function renderLibraryGridImageCards(grid) {
  if (grid.loading) {
    const skeletons = grid.useMemo(
      "loading-skeletons",
      () => {
        const nextSkeletons = [];
        const skeletonCount = 12;
        for (let i = 0; i < skeletonCount; i += 1) {
          nextSkeletons.push(
            createElement(
              "div",
              { class: "library-card library-skeleton" },
              [
                createElement("div", {
                  class: "library-card-thumb library-skeleton-thumb",
                }),
                createElement("div", { class: "library-card-info" }, [
                  createElement("div", { class: "library-skeleton-line" }),
                  createElement("div", { class: "library-skeleton-line short" }),
                ]),
              ],
            ),
          );
        }
        return nextSkeletons;
      },
      [],
    );
    return createElement("div", { class: "library-grid" }, skeletons);
  }

  const filtered = grid.getFilteredImages();
  if (!filtered.length) {
    return createElement("div", { class: "library-grid" }, [
      createElement(
        "div",
        { class: "library-empty" },
        grid.images.length
          ? "No images match your search or folder."
          : "No images yet. Upload some images to get started!",
      ),
    ]);
  }

  const selectedKey = Array.from(grid.selectedImageIds).sort().join("|");
  const cards = grid.useMemo(
    "library-grid-card-elements",
    () => filtered.map((image, index) => renderImageCard(grid, image, index)),
    () => [filtered, grid.selectMode, selectedKey],
  );

  const gridItems =
    grid.showAllImages && grid.images.length < grid.total
      ? [
          ...cards,
          createElement("div", { class: "library-load-more" }, [
            createElement(
              "button",
              { class: "library-load-more-btn" },
              `Load More (${grid.images.length} of ${grid.total})`,
              {
                type: "click",
                event: () => grid.libraryApp.loadMore(),
              },
            ),
          ]),
        ]
      : cards;

  return createElement("div", { class: "library-grid" }, gridItems);
}
