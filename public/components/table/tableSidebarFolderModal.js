import createElement from "../createElement.js";
import modal from "../modal.js";

function renderCreatingSubFolderNotice(sidebar) {
  if (
    !sidebar.tableSidebarFolderComponent.showAllImages &&
    sidebar.tableSidebarFolderComponent.currentFolder
  ) {
    return createElement(
      "small",
      { class: "modal-subtitle" },
      `Creating sub-folder in: "${sidebar.tableSidebarFolderComponent.currentFolder.title}"`,
    );
  }
  return createElement("div", { class: "d-none" });
}

export function renderCreateFolderModal(sidebar) {
  if (!sidebar.can("canManageFolders")) {
    return createElement("div", { class: "help-content" }, [
      createElement("h1", {}, "Not allowed"),
    ]);
  }

  return createElement("div", { class: "help-content" }, [
    createElement("h1", {}, "Create Folder"),
    renderCreatingSubFolderNotice(sidebar),
    createElement(
      "form",
      {},
      [
        createElement("div", { class: "input-container" }, [
          createElement(
            "label",
            {
              for: "title",
              class: "me-1",
            },
            "Title",
          ),
          createElement("input", {
            placeholder: "New Folder",
            name: "title",
            id: "title",
            required: true,
          }),
        ]),
        createElement("br"),
        createElement("button", { class: "new-btn me-1" }, "Create"),
      ],
      {
        type: "submit",
        event: async (e) => {
          if (!sidebar.can("canManageFolders")) return;
          e.preventDefault();
          const formData = new FormData(e.target);
          const formProps = Object.fromEntries(formData);
          const parentFolderId = sidebar.getCurrentFolderId();

          modal.hide();
          sidebar.tableSidebarFolderComponent.folderLoading = true;
          sidebar.tableSidebarFolderComponent.render();

          try {
            await sidebar.postByContext(
              "/api/add_table_folder_by_project",
              "/api/add_table_folder_by_user",
              {
                title: formProps.title,
                is_sub: Boolean(parentFolderId),
                parent_folder_id: parentFolderId,
                table_view_id: sidebar.tableView?.id,
              },
            );
            await sidebar.tableSidebarFolderComponent.loadFolders();
          } catch (err) {
            console.log(err);
            window.customAlertError("Something went wrong when creating a new folder");
          } finally {
            sidebar.tableSidebarFolderComponent.folderLoading = false;
            sidebar.tableSidebarFolderComponent.render();
          }
        },
      },
    ),
  ]);
}
