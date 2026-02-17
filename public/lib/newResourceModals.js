import createElement from "../components/createElement.js";
import modal from "../components/modal.js";
import renderTierLimitWarning from "../components/renderTierLimitWarning.js";

async function submitResourceForm(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (res.ok) {
    const data = await res.json();
    window.location.href = data.redirect;
  } else {
    const err = await res.json();
    if (
      err.error?.message === "USER_IS_NOT_PRO" ||
      err.error?.message === "PROJECT_IS_NOT_PRO"
    ) {
      renderTierLimitWarning(err.error.message === "USER_IS_NOT_PRO"
        ? 'You have reached the limit for this account. Please subscribe to our "Pro User" package to increase the limit.'
        : 'This Wyrld has reached the limit. Please subscribe to our "Pro Wyrld" package to increase the limit.');
    } else {
      modal.show(
        createElement("div", { class: "modal-form" }, [
          createElement("h2", {}, "Error"),
          createElement("p", {}, "Something went wrong. Please try again."),
        ])
      );
    }
  }
}

function buildModalForm({
  heading,
  inputName,
  inputPlaceholder,
  onSubmit,
  modeOptions = null,
}) {
  const input = createElement("input", {
    type: "text",
    name: inputName,
    placeholder: inputPlaceholder,
    required: "true",
    class: "modal-form-input",
  });

  const button = createElement("button", {
    type: "submit",
    class: "modal-form-button",
  }, "Create");

  const modeSelect = modeOptions
    ? createElement(
        "select",
        {
          name: "mode",
          class: "modal-form-input",
        },
        modeOptions.map((option) =>
          createElement(
            "option",
            { value: option.value },
            option.label,
          ),
        ),
      )
    : null;

  const form = createElement("form", { class: "modal-form" }, [
    createElement("h2", {}, heading),
    input,
    ...(modeSelect ? [modeSelect] : []),
    button,
  ], [{ type: "submit", event: (e) => {
    e.preventDefault();
    const value = input.value.trim();
    if (!value) return;
    button.disabled = true;
    button.textContent = "Creating...";
    onSubmit(value, modeSelect ? modeSelect.value : undefined);
  }}]);

  modal.show(form);
  input.focus();
}

function openNewTableModal() {
  buildModalForm({
    heading: "Create New Table",
    inputName: "title",
    inputPlaceholder: "Table Title",
    modeOptions: [
      { value: "standard", label: "Standard Table" },
      { value: "sandbox", label: "Sandbox Table" },
    ],
    onSubmit: (title, mode) =>
      submitResourceForm("/api/add_table_view_by_user", { title, mode }),
  });
}

function openNewWyrldModal() {
  buildModalForm({
    heading: "Create New Wyrld",
    inputName: "title",
    inputPlaceholder: "Wyrld Title",
    onSubmit: (title) => submitResourceForm("/api/add_project", { title }),
  });
}

function openNewSheetModal(wyrldId, wyrldTitle) {
  const heading = wyrldTitle
    ? `New Character for ${decodeURIComponent(wyrldTitle)}`
    : "Create New Character Sheet";
  buildModalForm({
    heading,
    inputName: "name",
    inputPlaceholder: "Character Name",
    onSubmit: (name) => {
      const body = { name };
      if (wyrldId) body.wyrld_id = wyrldId;
      submitResourceForm("/api/add_5e_character", body);
    },
  });
}

function openNewWyrldTableModal(projectId) {
  buildModalForm({
    heading: "Create New Wyrld Table",
    inputName: "title",
    inputPlaceholder: "Table Title",
    modeOptions: [
      { value: "standard", label: "Standard Table" },
      { value: "sandbox", label: "Sandbox Table" },
    ],
    onSubmit: (title, mode) =>
      submitResourceForm(`/api/add_table_view_by_project/${projectId}`, {
        title,
        mode,
      }),
  });
}

window.openNewTableModal = openNewTableModal;
window.openNewWyrldModal = openNewWyrldModal;
window.openNewSheetModal = openNewSheetModal;
window.openNewWyrldTableModal = openNewWyrldTableModal;
