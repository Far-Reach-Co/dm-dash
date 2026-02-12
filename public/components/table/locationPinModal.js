import modal from "../modal.js";
import createElement from "../createElement.js";

export default function openLocationPinModal({ pin = null, attachments = [], templates = [] } = {}) {
  return new Promise((resolve) => {
    const portalOptions =
      attachments.length > 0
        ? attachments.map((table) =>
            createElement(
              "option",
              { value: table.id },
              table.title,
            ),
          )
        : [
            createElement(
              "option",
              { value: 0, disabled: true },
              "No other tables available",
            ),
          ];

    const titleInput = createElement("input", {
      type: "text",
      name: "pin_title",
      required: true,
      placeholder: "E.g. Red Dragon Inn",
      value: pin?.title || "",
    });

    const descriptionInput = createElement("textarea", {
      name: "pin_description",
      rows: 3,
      placeholder: "Capture a quick blurb about this location.",
      value: pin?.description || "",
    });

    const targetSelect = createElement(
      "select",
      {
        name: "pin_targets",
        multiple: true,
        size: Math.min(4, Math.max(1, portalOptions.length)),
      },
      portalOptions,
    );

    const setTargetSelections = (ids) => {
      const normalized = Array.isArray(ids)
        ? ids.map((value) => Number(value)).filter((value) => !Number.isNaN(value))
        : [];
      Array.from(targetSelect.options).forEach((option) => {
        const value = Number(option.value);
        option.selected =
          normalized.length > 0 && normalized.includes(value) && value !== 0;
      });
    };

    setTargetSelections(pin?.portal_table_view_ids || []);

    const fieldWrapper = (label, element, subtitle) => {
      const children = [createElement("h3", {}, label), element];
      if (subtitle) {
        children.push(
          createElement("small", { class: "modal-subtitle" }, subtitle),
        );
      }
      return createElement("div", { class: "location-pin-modal-field" }, children);
    };

    const templateSelect =
      templates.length && !pin
        ? createElement(
            "select",
            {
              name: "pin_template",
            },
            [
              createElement("option", { value: "" }, "Create new pin"),
              ...templates.map((template) =>
                createElement(
                  "option",
                  { value: template.id },
                  template.title || `Pin ${template.id}`,
                ),
              ),
            ],
            {
              type: "change",
              event: (e) => {
                const selectedId = e.target.value;
                if (!selectedId) {
                  titleInput.value = "";
                  descriptionInput.value = "";
                  setTargetSelections([]);
                  return;
                }
                const template = templates.find(
                  (t) => String(t.id) === selectedId,
                );
                if (!template) return;
                titleInput.value = template.title || "";
                descriptionInput.value = template.description || "";
                setTargetSelections(template.portal_table_view_ids || []);
              },
            },
          )
        : null;

    const form = createElement(
      "form",
      {},
      [
        createElement("h2", {}, pin ? "Edit location pin" : "Create location pin"),
        ...(templateSelect
          ? [
              fieldWrapper(
                "Pick a template",
                templateSelect,
                "Selecting an existing pin preloads the fields.",
              ),
            ]
          : []),
        fieldWrapper("Title", titleInput),
        fieldWrapper("Description", descriptionInput),
        fieldWrapper(
          "Portal targets (optional)",
          targetSelect,
          "Select one or more tables this pin can open.",
        ),
        createElement("div", { class: "location-pin-modal-buttons" }, [
          createElement(
            "button",
            { type: "button", class: "btn-clear" },
            "Cancel",
            {
              type: "click",
              event: () => {
                modal.hide();
                resolve(null);
              },
            },
          ),
          createElement(
            "button",
            { class: "new-btn", type: "submit" },
            pin ? "Save pin" : "Create pin",
          ),
        ]),
      ],
      {
        type: "submit",
        event: (e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          const title = formData.get("pin_title")?.toString().trim();
          if (!title) {
            window.alert("Title is required.");
            return;
          }
          const description = formData.get("pin_description")?.toString() ?? "";
          const targets = [];
          const targetSelect = e.target.elements["pin_targets"];
          if (targetSelect && targetSelect.selectedOptions) {
            for (const option of targetSelect.selectedOptions) {
              const value = Number(option.value);
              if (!Number.isNaN(value) && value !== 0) {
                targets.push(value);
              }
            }
          }
          modal.hide();
          resolve({
            title,
            description,
            portal_table_view_ids: targets,
          });
        },
      },
    );

    modal.show(
      createElement("div", { class: "help-content location-pin-modal" }, form),
    );
  });
}
