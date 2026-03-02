import createElement from "../../lib/salt-lib/createElement.js";
import { apiGet, apiPost } from "../../lib/apiUtils.js";
import tableSelect from "./tableSelect.js";
import socketIntegration from "./socketIntegration.js";

const IDS = {
  templateTitle: "template-title-input",
  templateSelect: "template-select",
  title: "title-input",
  isPublic: "is_public-input",
  mode: "mode-input",
  titleSuccess: "title-update-success",
};

function sectionTitle(title, description) {
  return createElement("div", { class: "table-settings-section-header" }, [
    createElement("h2", {}, title),
    createElement("small", { class: "table-settings-section-subtitle" }, description),
  ]);
}

function getInputValue(id) {
  return document.getElementById(id)?.value || "";
}

function getInputChecked(id) {
  return !!document.getElementById(id)?.checked;
}

async function saveTemplate(sidebar, scope) {
  const title = getInputValue(IDS.templateTitle);
  const endpoint =
    scope === "project" && sidebar.projectId
      ? `/api/add_table_view_template_by_project/${sidebar.projectId}/${sidebar.tableView.id}`
      : `/api/add_table_view_template_by_user/${sidebar.tableView.id}`;
  const res = await apiPost(endpoint, { title });
  if (!res.ok) return;
  window.customAlert(
    scope === "project" ? "Saved wyrld template." : "Saved user template.",
  );
  window.location.reload();
}

async function loadTemplateIntoCurrentTable(sidebar) {
  const templateId = Number(getInputValue(IDS.templateSelect));
  if (!templateId) {
    window.customAlertError("Select a template first.");
    return;
  }

  const confirmed = await window.customConfirm(
    "Load this template into the current table? This replaces current table state.",
    { confirmText: "Load" },
  );
  if (!confirmed) return;

  const res = await apiPost(`/api/apply_table_view_template/${templateId}`, {
    table_view_id: sidebar.tableView.id,
  });
  if (!res.ok || !res.data) return;

  sidebar.tableView.data = res.data.data;
  sidebar.tableView.mode = res.data.mode;

  const app = socketIntegration.tableApp;
  if (!app) {
    window.location.reload();
    return;
  }

  const tableId = app.tableId;
  socketIntegration.tableModeChanged(res.data.mode);
  app.teardown();
  app.loadTable(tableId);
}

async function deleteSelectedTemplate() {
  const templateId = Number(getInputValue(IDS.templateSelect));
  if (!templateId) {
    window.customAlertError("Select a template first.");
    return;
  }

  const confirmed = await window.customConfirm(
    "Delete this template? This cannot be undone.",
    { confirmText: "Delete", danger: true },
  );
  if (!confirmed) return;

  try {
    const res = await fetch(`/api/remove_table_view_template/${templateId}`, {
      method: "DELETE",
    });
    if (res.status !== 204) {
      throw new Error(`remove template failed with status ${res.status}`);
    }
  } catch (err) {
    console.log(err);
    window.customAlertError("Failed to delete template.");
    return;
  }

  window.customAlert("Template deleted.");
  window.location.reload();
}

async function handleDetailsSave(sidebar) {
  const title = getInputValue(IDS.title);
  const isPublic = getInputChecked(IDS.isPublic);
  const newMode = getInputChecked(IDS.mode) ? "sandbox" : "standard";
  const modeChanged = newMode !== sidebar.tableView.mode;

  if (modeChanged) {
    const confirmed = await window.customConfirm(
      `Switch to ${newMode} mode? All connected users will be re-initialized.`,
      { confirmText: "Switch" },
    );
    if (!confirmed) {
      const modeInput = document.getElementById(IDS.mode);
      if (modeInput) modeInput.checked = sidebar.tableView.mode === "sandbox";
      return;
    }
  }

  const res = await apiPost(`/api/edit_table_view/${sidebar.tableView.id}`, {
    title,
    is_public: isPublic,
    mode: newMode,
  });
  if (!res.ok) return;

  const titleUpdateMessageElem = document.querySelector(`#${IDS.titleSuccess}`);
  if (titleUpdateMessageElem) {
    titleUpdateMessageElem.innerText = "Saved!";
    setTimeout(() => {
      titleUpdateMessageElem.innerText = "";
    }, 3000);
  }

  const displayTitle = document.querySelector("#table-display-title");
  if (displayTitle) displayTitle.innerText = title;
  sidebar.tableView.title = title;
  sidebar.tableView.is_public = isPublic;
  sidebar.tableView.mode = newMode;

  if (!modeChanged) return;

  socketIntegration.tableModeChanged(newMode);
  const app = socketIntegration.tableApp;
  if (!app) return;
  const tableId = app.tableId;
  app.teardown();
  app.loadTable(tableId);
}

async function handleDeleteTable(sidebar) {
  const confirmed = await window.customConfirm(
    `Are you sure you want to delete ${sidebar.tableView.title}`,
    { confirmText: "Delete", danger: true },
  );
  if (!confirmed) return;

  try {
    const res = await fetch(`/api/remove_table_view/${sidebar.tableView.id}`, {
      method: "DELETE",
    });
    if (res.status !== 204) {
      throw new Error(`remove table failed with status ${res.status}`);
    }
  } catch (err) {
    console.log(err);
    window.customAlertError("Failed to delete table.");
    return;
  }
  window.location.pathname = "/dash";
}

async function renderChangeTableSection(sidebar) {
  if (!sidebar.can("canChangeTable")) return null;
  return createElement("section", { class: "table-settings-section" }, [
    sectionTitle(
      "Change Table",
      "Move everyone currently viewing this table to a different table.",
    ),
    createElement(
      "form",
      { class: "table-settings-inline-form" },
      [await tableSelect(), createElement("Button", { class: "new-btn" }, "Go")],
      {
        type: "submit",
        event: (e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          const formProps = Object.fromEntries(formData);
          const tableUUID = formProps.table_uuid;
          if (tableUUID != 0) {
            socketIntegration.tableChanged(tableUUID);
          }
        },
      },
    ),
  ]);
}

function renderTemplatesSection(sidebar, templates) {
  return createElement("section", { class: "table-settings-section" }, [
    sectionTitle(
      "Templates",
      "Save this table setup as a template, then load templates into this table.",
    ),
    createElement("div", { class: "table-settings-grid" }, [
      createElement("div", { class: "input-container" }, [
        createElement(
          "label",
          {
            for: IDS.templateTitle,
            class: "me-1",
          },
          "Template Title",
        ),
        createElement("input", {
          value: `${sidebar.tableView.title} Template`,
          name: "template_title",
          id: IDS.templateTitle,
        }),
      ]),
      createElement("div", { class: "table-settings-actions" }, [
        createElement("button", { class: "new-btn" }, "Save as User Template", {
          type: "click",
          event: async (e) => {
            e.preventDefault();
            await saveTemplate(sidebar, "user");
          },
        }),
        ...(sidebar.projectId
          ? [
              createElement(
                "button",
                { class: "new-btn" },
                "Save as Wyrld Template",
                {
                  type: "click",
                  event: async (e) => {
                    e.preventDefault();
                    await saveTemplate(sidebar, "project");
                  },
                },
              ),
            ]
          : []),
      ]),
      createElement("div", { class: "table-settings-inline-group" }, [
        createElement("small", { class: "table-settings-label" }, "Load Template"),
        createElement(
          "select",
          {
            id: IDS.templateSelect,
            name: "template_id",
            class: "table-settings-select",
          },
          [
            createElement("option", { value: 0 }, "Select a template"),
            ...templates.map((template) =>
              createElement(
                "option",
                { value: template.id },
                `${template.scope === "project" ? "Wyrld" : "User"}: ${template.title}`,
              ),
            ),
          ],
        ),
        createElement("button", { class: "new-btn" }, "Load", {
          type: "click",
          event: async (e) => {
            e.preventDefault();
            await loadTemplateIntoCurrentTable(sidebar);
          },
        }),
        createElement("button", { class: "btn-red" }, "Delete", {
          type: "click",
          event: async (e) => {
            e.preventDefault();
            await deleteSelectedTemplate();
          },
        }),
      ]),
    ]),
  ]);
}

function renderDetailsSection(sidebar) {
  return createElement("section", { class: "table-settings-section" }, [
    sectionTitle("Details", "Update table title, visibility, and mode."),
    createElement("div", { class: "table-settings-grid" }, [
      createElement("div", { class: "input-container" }, [
        createElement(
          "label",
          {
            for: IDS.title,
            class: "me-1",
          },
          "Edit Title",
        ),
        createElement("input", {
          value: sidebar.tableView.title,
          name: "title",
          id: IDS.title,
        }),
      ]),
      createElement("div", { class: "table-settings-toggle-row" }, [
        createElement("small", { class: "table-settings-label" }, "Make Public"),
        createElement("input", {
          type: "checkbox",
          name: "is_public",
          id: IDS.isPublic,
          ...(sidebar.tableView.is_public ? { checked: true } : {}),
        }),
      ]),
      createElement("div", { class: "table-settings-toggle-row" }, [
        createElement("small", { class: "table-settings-label" }, "Sandbox Mode"),
        createElement("input", {
          type: "checkbox",
          name: "mode",
          id: IDS.mode,
          ...(sidebar.tableView.mode === "sandbox" ? { checked: true } : {}),
        }),
      ]),
      createElement("div", { class: "table-settings-actions" }, [
        createElement("button", { class: "new-btn" }, "Save", {
          type: "click",
          event: async (e) => {
            e.preventDefault();
            await handleDetailsSave(sidebar);
          },
        }),
        createElement("button", { class: "btn-red" }, "Delete Table", {
          type: "click",
          event: async (e) => {
            e.preventDefault();
            e.stopPropagation();
            await handleDeleteTable(sidebar);
          },
        }),
        createElement("small", {
          class: "success-message table-settings-save-msg",
          id: IDS.titleSuccess,
        }),
      ]),
    ]),
  ]);
}

async function loadTemplates(sidebar) {
  const userTemplatesResult = await apiGet("/api/get_table_view_templates_by_user");
  const userTemplates =
    userTemplatesResult.ok && Array.isArray(userTemplatesResult.data)
      ? userTemplatesResult.data
      : [];
  const projectTemplatesResult = sidebar.projectId
    ? await apiGet(`/api/get_table_view_templates_by_project/${sidebar.projectId}`)
    : null;
  const projectTemplates =
    projectTemplatesResult?.ok && Array.isArray(projectTemplatesResult.data)
      ? projectTemplatesResult.data
      : [];
  return [...projectTemplates, ...userTemplates];
}

export async function renderTableSettingsModal(sidebar) {
  const templates = await loadTemplates(sidebar);
  const changeSection = await renderChangeTableSection(sidebar);
  const sections = [
    createElement("h1", { class: "table-settings-title" }, "Table Settings"),
    ...(changeSection ? [changeSection] : []),
    renderTemplatesSection(sidebar, templates),
    renderDetailsSection(sidebar),
  ];
  return createElement("div", { class: "help-content table-settings-modal" }, sections);
}
