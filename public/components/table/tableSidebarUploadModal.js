import createElement from "../createElement.js";

function renderCreatingImageInFolderNotice(sidebar) {
  if (
    !sidebar.tableSidebarFolderComponent.showAllImages &&
    sidebar.tableSidebarFolderComponent.currentFolder
  ) {
    return createElement(
      "small",
      { class: "modal-subtitle" },
      `Creating image in folder: "${sidebar.tableSidebarFolderComponent.currentFolder.title}"`,
    );
  }
  return createElement("div", { class: "d-none" });
}

export function renderUploadImageModal(sidebar) {
  const smallImageCheckboxComponent = createElement(
    "input",
    { type: "checkbox" },
    null,
    {
      type: "change",
      event: (e) => {
        sidebar.makeImageSmall = e.target.checked;
      },
    },
  );
  smallImageCheckboxComponent.checked = sidebar.makeImageSmall;

  return createElement("div", { class: "help-content" }, [
    createElement("h1", {}, "Add new Image"),
    renderCreatingImageInFolderNotice(sidebar),
    createElement("h2", {}, "Options:"),
    createElement(
      "div",
      {
        class: "d-flex align-items-center justify-content-center ms-1",
        title:
          "If image width is larger than 100px this resizes the image width to 100px while maintaining the aspect ratio. It also will prevent long loading time as the image size will be reduced.",
      },
      [
        createElement(
          "small",
          { class: "me-3" },
          "Make image small (100px): ",
        ),
        smallImageCheckboxComponent,
      ],
    ),
    createElement("br"),
    createElement(
      "input",
      {
        id: "image",
        name: "image",
        type: "file",
        accept: "image/*",
        class: "d-none",
        style: "display: none;",
        multiple: true,
      },
      null,
      {
        type: "change",
        event: async (e) => {
          await sidebar.addImageToSidebar(e);
        },
      },
    ),
    createElement(
      "label",
      {
        for: "image",
        class: "label-btn",
        title: "Upload image to be used on virtual table",
      },
      "Choose Images",
    ),
  ]);
}
