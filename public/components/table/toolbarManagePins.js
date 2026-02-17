import modal from "../modal.js";
import createElement from "../createElement.js";

export function showManagePinsModal(toolbar) {
  const pins = toolbar.tableApp.locationPins;
  const canvasIds = toolbar.tableApp.getCanvasObjectIdSet();

  if (!pins.length) {
    modal.show(
      createElement("div", { class: "help-content" }, [
        createElement("h2", {}, "Manage Pins"),
        createElement("p", {}, "No location pins on this table."),
      ]),
    );
    return;
  }

  const rows = pins.map((pin) => {
    const isActive = canvasIds.has(pin.canvas_object_id);
    const statusLabel = isActive ? "Active" : "Missing from canvas";
    const statusClass = isActive
      ? "location-pin-status-active"
      : "location-pin-status-orphan";

    const actions = [];

    if (isActive) {
      actions.push(
        createElement(
          "button",
          { class: "location-pin-edit-btn", type: "button" },
          "Locate",
          {
            type: "click",
            event: () => {
              modal.hide();
              toolbar.tableApp.canvasLayer.selectObjectById(pin.canvas_object_id);
            },
          },
        ),
      );
    } else {
      actions.push(
        createElement(
          "button",
          { class: "location-pin-edit-btn", type: "button" },
          "Restore",
          {
            type: "click",
            event: async () => {
              await toolbar.tableApp.restoreOrphanedPin(pin);
              modal.hide();
            },
          },
        ),
      );
    }

    actions.push(
      createElement(
        "button",
        { class: "location-pin-delete-btn", type: "button" },
        "Delete",
        {
          type: "click",
          event: async () => {
            const confirmed = window.confirm(
              `Delete pin "${pin.title || "Untitled"}"?`,
            );
            if (!confirmed) return;
            try {
              if (isActive) {
                const obj = toolbar.tableApp.canvasLayer.getObjectById(
                  pin.canvas_object_id,
                );
                if (obj) {
                  await toolbar.tableApp.deleteLocationPin(obj);
                }
              } else {
                await toolbar.tableApp.deleteOrphanedPin(pin.id);
              }
              showManagePinsModal(toolbar);
            } catch (err) {
              console.error(err);
              window.alert("Failed to delete pin.");
            }
          },
        },
      ),
    );

    return createElement("div", { class: "manage-pins-row" }, [
      createElement("div", { class: "manage-pins-info" }, [
        createElement("small", { class: "location-pin-id" }, `PIN-${pin.id}`),
        createElement(
          "span",
          { class: "manage-pins-title" },
          pin.title || "Untitled",
        ),
        createElement("span", { class: statusClass }, statusLabel),
      ]),
      createElement("div", { class: "manage-pins-actions" }, actions),
    ]);
  });

  modal.show(
    createElement("div", { class: "help-content" }, [
      createElement("h2", {}, "Manage Pins"),
      createElement("div", { class: "manage-pins-list" }, rows),
    ]),
  );
}
