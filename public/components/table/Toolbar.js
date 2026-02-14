import modal from "../modal.js";
import { getThings } from "../../lib/apiUtils.js";
import createElement from "../createElement.js";
import socketIntegration from "./socketIntegration.js";
import truncateString from "../../lib/truncateString.js";

// Feather-style inline SVG icons (18x18 viewBox, currentColor stroke)
const ICONS = {
  info: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
  pencil: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>`,
  layers: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`,
  grid: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>`,
  trash: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
  chevronUp: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>`,
  sidebar: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="15" y1="3" x2="15" y2="21"/></svg>`,
  pin: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-8.5-7-13a7 7 0 0 1 14 0c0 4.5-7 13-7 13z"/><circle cx="12" cy="8" r="2.5"/></svg>`,
  list: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`,
  lock: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>`,
  unlock: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 7.5-2"/></svg>`,
};

export default class Toolbar {
  constructor({ tableApp, tableView, projectId }) {
    this.tableApp = tableApp;
    this.tableView = tableView;
    this.projectId = projectId;

    this.activePanel = null;
    this._clickAwayBound = false;
    this._selectedObjectBarUpdateId = 0;
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  getRecordHref = (recordId) => {
    const base = `/record?id=${recordId}`;
    return this.projectId ? `${base}&project_id=${this.projectId}` : base;
  };

  getSelectedObjectInfo = async (obj) => {
    const info = {
      idPrefix: "lin",
      displayName: "",
      imageSrc: "",
      recordTitle: null,
      recordHref: null,
    };

    if (!obj.imageId) return info;

    info.idPrefix = "img";
    const image = await getThings(`/api/get_image/${obj.imageId}`);
    info.displayName = truncateString(image.original_name, 12);
    info.imageSrc = image.src;

    const records = image.records || [];
    const publicRecord = records.find((r) => r.is_public);
    if (publicRecord) {
      info.recordTitle = truncateString(publicRecord.title, 12);
      info.recordHref = this.getRecordHref(publicRecord.id);
    }

    return info;
  };

  isOwnerOrManager = () => {
    return USERID == this.tableView.user_id || IS_MANAGER_OR_OWNER;
  };

  hiddenElement = () => createElement("div", { class: "d-none" });

  layerStyles = {
    Map: { class: "text-orange", label: "Map Layer", color: "var(--orange3)" },
    Object: {
      class: "text-green",
      label: "Object Layer",
      color: "var(--green)",
    },
    Fog: {
      class: "text-light-gray",
      label: "Fog Layer",
      color: "var(--light-gray)",
    },
  };

  setupClickAway = () => {
    if (this._clickAwayBound) return;
    this._clickAwayBound = true;

    document.addEventListener("pointerdown", (e) => {
      if (this.activePanel && !e.target.closest(".vtt-toolbar")) {
        this.activePanel = null;
        this._updateLayersAnchor();
        this._updateGridAnchor();
      }
    });
  };

  clearSelection = () => {
    const canvas = this.tableApp.canvasLayer?.canvas;
    if (!canvas) return;
    canvas.discardActiveObject();
    canvas.requestRenderAll();
  };

  setObjectLockInPosition = async (obj, shouldLock) => {
    if (!obj || !this.isOwnerOrManager()) return;
    obj.set("lockInPosition", !!shouldLock);
    this.tableApp.canvasLayer.updateObjectProperties(obj);
    if (obj.isLocationPin) {
      this.tableApp.enforceLocationPinConstraints(obj);
    }
    this.tableApp.canvasRenderAll();
    socketIntegration.imageMoved(obj);
    await this.tableApp.canvasLayer.saveToDatabase();
    await this.updateObjectSelection();
  };

  renderObjectLockControls = (
    obj,
    { withSeparator = false, includeStatus = true, includeButton = true } = {},
  ) => {
    if (!obj) return [];
    const isLocked = !!obj.lockInPosition;
    const icon = isLocked ? ICONS.lock : ICONS.unlock;
    const controls = [];

    if (withSeparator) {
      controls.push(createElement("div", { class: "vtt-toolbar-sep" }));
    }

    if (includeStatus) {
      controls.push(
        createElement(
          "div",
          {
            class: `vtt-lock-status ${isLocked ? "is-locked" : "is-unlocked"}`,
          },
          [
            createElement("span", { class: "vtt-lock-status-icon" }, icon),
            createElement(
              "span",
              { class: "vtt-lock-status-text" },
              isLocked ? "Locked" : "Unlocked",
            ),
          ],
        ),
      );
    }

    if (this.isOwnerOrManager() && includeButton) {
      controls.push(
        createElement(
          "button",
          {
            class: `vtt-lock-toggle-btn ${isLocked ? "is-locked" : "is-unlocked"}`,
            type: "button",
            title: isLocked
              ? "Allow this object to move on the canvas"
              : "Lock this object in place on the canvas",
          },
          [
            createElement("span", { class: "vtt-lock-toggle-icon" }, icon),
            createElement(
              "span",
              { class: "vtt-lock-toggle-label" },
              isLocked ? "Unlock" : "Lock",
            ),
          ],
          {
            type: "click",
            event: async () => {
              await this.setObjectLockInPosition(obj, !isLocked);
            },
          },
        ),
      );
    }

    return controls;
  };

  renderToolbarButton = (
    iconSvg,
    title,
    { active = false, danger = false, onClick, layerColor } = {},
  ) => {
    let cls = "vtt-toolbar-btn";
    if (active) cls += " active";
    if (danger) cls += " btn-danger";

    const btn = createElement("div", { class: cls, title }, iconSvg, {
      type: "click",
      event: (e) => {
        e.stopPropagation();
        onClick?.();
      },
    });

    if (layerColor) {
      const badge = createElement("span", {
        class: "vtt-layer-badge",
        style: `background-color: ${layerColor};`,
      });
      btn.appendChild(badge);
    }

    return btn;
  };

  // ---------------------------------------------------------------------------
  // Toolbar buttons
  // ---------------------------------------------------------------------------

  renderInfoMenu = () => {
    return this.renderToolbarButton(ICONS.info, "Info & key commands", {
      onClick: () => {
        modal.show(
          createElement("div", { class: "help-content" }, [
            createElement("h1", {}, "VTT Quick Reference"),
            createElement("hr"),
            createElement(
              "a",
              {
                href: "/vtt-guide",
                target: "_blank",
                rel: "noopener noreferrer",
              },
              "View full guide \u2192",
            ),
            createElement("br"),
            createElement("br"),

            // Getting Started
            createElement("h2", {}, "Getting Started"),
            createElement("hr"),
            createElement(
              "small",
              {},
              "Add images via the sidebar (GM), then drag them onto the canvas (If click->drag doesn't work then try just clicking the image). Pan by clicking and dragging empty space. Zoom with the scroll wheel or pinch gesture.",
            ),
            createElement("br"),
            createElement("br"),

            // Canvas
            createElement("h2", {}, "Canvas"),
            createElement("hr"),
            createElement("b", {}, "Pan"),
            createElement("small", {}, " \u2014 Click + drag on empty space"),
            createElement("br"),
            createElement("b", {}, "Zoom"),
            createElement("small", {}, " \u2014 Scroll wheel or pinch"),
            createElement("br"),
            createElement("b", {}, "Select"),
            createElement("small", {}, " \u2014 Click an object"),
            createElement("br"),
            createElement("b", {}, "Lock Position (Manager)"),
            createElement(
              "small",
              {},
              " \u2014 Use the lock/unlock control in the selected object panel to freeze or allow movement.",
            ),
            createElement("br"),
            createElement("b", {}, "Multi-select"),
            createElement("small", {}, " \u2014 Shift+click or Alt+drag a box"),
            createElement("br"),
            createElement("b", {}, "Ping"),
            createElement(
              "small",
              {},
              " \u2014 Double-click on empty canvas to ping location for all users",
            ),
            createElement("br"),
            createElement("b", {}, "Aura"),
            createElement(
              "small",
              {},
              " \u2014 Select a token and set an aura color in the object panel",
            ),
            createElement("br"),
            createElement("br"),

            // Toolbar
            createElement("h2", {}, "Toolbar"),
            createElement("hr"),
            createElement("b", {}, "Draw Mode"),
            createElement(
              "small",
              {},
              " \u2014 Freehand drawing on the canvas. Set color and width.",
            ),
            createElement("br"),
            createElement("b", {}, "Layers (GM)"),
            createElement(
              "small",
              {},
              " \u2014 Switch between Map, Object, and Fog layers.",
            ),
            createElement("br"),
            createElement("b", {}, "Grid (GM)"),
            createElement("small", {}, " \u2014 Show/hide grid and resize it."),
            createElement("br"),
            createElement("b", {}, "Delete / Move to Top"),
            createElement(
              "small",
              {},
              " \u2014 Remove selected object or bring it to front of its layer.",
            ),
            createElement("br"),
            createElement("br"),

            // Location Pins (GM)
            createElement("h2", {}, "Location Pins (GM)"),
            createElement("hr"),
            createElement("b", {}, "Add Pin"),
            createElement(
              "small",
              {},
              " \u2014 Click the pin icon to place a new pin at the center of your view. Pins are created instantly with a default title.",
            ),
            createElement("br"),
            createElement("b", {}, "Edit Pin"),
            createElement(
              "small",
              {},
              " \u2014 Select a pin (it turns red) and click Edit in the info panel to set its title, description, and portal links.",
            ),
            createElement("br"),
            createElement("b", {}, "Pin Position Lock"),
            createElement(
              "small",
              {},
              " \u2014 Pins start locked in place. Managers can unlock/re-lock from the pin info panel.",
            ),
            createElement("br"),
            createElement("b", {}, "Portals"),
            createElement(
              "small",
              {},
              " \u2014 Attach other tables to a pin. Clicking a portal link transports all connected users to that table.",
            ),
            createElement("br"),
            createElement("b", {}, "Manage Pins"),
            createElement(
              "small",
              {},
              " \u2014 Click the list icon to see all pins, locate them on the canvas, or clean up orphaned pins.",
            ),
            createElement("br"),
            createElement("br"),

            // Sidebar (GM)
            createElement("h2", {}, "Sidebar (GM)"),
            createElement("hr"),
            createElement(
              "small",
              {},
              "Upload images, create folders to organize them, adjust table settings, and copy the share link for players.",
            ),
            createElement("br"),
            createElement("br"),

            // Chat
            createElement("h2", {}, "Chat"),
            createElement("hr"),
            createElement("b", {}, "/roll"),
            createElement("small", {}, " \u2014 Roll dice. Format: "),
            createElement("code", {}, "[count]d[sides]+[modifier]"),
            createElement("br"),
            createElement("small", {}, "Example: "),
            createElement("code", {}, "/roll 2d6+3"),
            createElement("small", {}, " rolls two 6-sided dice and adds 3."),
            createElement("br"),
            createElement("br"),
            createElement("b", {}, "/5e"),
            createElement(
              "small",
              {},
              " \u2014 Ask AI about DnD 5E SRD Content: ",
            ),
            createElement("code", {}, "<query>"),
            createElement("br"),
            createElement("small", {}, "Example: "),
            createElement("code", {}, "/5e Info about fireball spell"),
            createElement(
              "small",
              {},
              " Returns info about the Fireball spell.",
            ),
            createElement("br"),
            createElement("br"),

            // Keyboard Shortcuts
            createElement("h2", {}, "Keyboard Shortcuts"),
            createElement("hr"),
            createElement("b", {}, "Alt/Option (\u2325)"),
            createElement(
              "small",
              {},
              " \u2014 Hold + drag to box-select multiple objects",
            ),
            createElement("br"),
            createElement("b", {}, "Shift"),
            createElement(
              "small",
              {},
              " \u2014 Hold + click to add objects to selection",
            ),
            createElement("br"),
            createElement("b", {}, "Delete / Backspace"),
            createElement("small", {}, " \u2014 Remove selected object(s)"),
            createElement("br"),
            createElement("b", {}, "Ctrl + T"),
            createElement(
              "small",
              {},
              " \u2014 Cycle selected object(s) through layers",
            ),
            createElement("br"),
            createElement("b", {}, "Ctrl + D"),
            createElement("small", {}, " \u2014 Duplicate selected object(s)"),
            createElement("br"),
            createElement("br"),

            // Canvas Log
            createElement("h2", {}, "Canvas Log"),
            createElement("hr"),
            createElement("button", {}, "Open Log", {
              type: "click",
              event: () => {
                const canvasObjectsList =
                  this.tableApp.canvasLayer.canvas.getObjects();
                modal.show(
                  createElement("div", { class: "help-content" }, [
                    createElement("h1", {}, "Canvas Log"),
                    createElement("hr"),
                    createElement("h2", {}, "Objects List"),
                    createElement("hr"),
                    createElement(
                      "div",
                      { class: "overflow-auto", style: "height: 300px;" },
                      [...this.renderCanvasObjectList(canvasObjectsList)],
                    ),
                  ]),
                );
              },
            }),
          ]),
        );
      },
    });
  };

  renderDrawModeToggle = () => {
    const isDrawing = this.tableApp.canvasLayer.canvas.isDrawingMode;
    return this.renderToolbarButton(ICONS.pencil, "Toggle draw mode", {
      active: isDrawing,
      onClick: () => {
        this.clearSelection();
        this.tableApp.canvasLayer.canvas.isDrawingMode = !isDrawing;
        this._updateDrawToggle();
        this._updateDrawBar();
      },
    });
  };

  renderDrawBar = () => {
    if (!this.tableApp.canvasLayer.canvas.isDrawingMode) {
      return this.hiddenElement();
    }

    return createElement("div", { class: "vtt-draw-bar" }, [
      createElement("small", {}, "Color"),
      createElement(
        "input",
        {
          type: "color",
          value: this.tableApp.canvasLayer.canvas.freeDrawingBrush.color,
          style:
            "cursor: pointer; height: 26px; width: 32px; border: none; border-radius: var(--border-radius); padding: 0;",
        },
        null,
        {
          type: "input",
          event: (e) => {
            this.tableApp.canvasLayer.canvas.freeDrawingBrush.color =
              e.target.value;
          },
        },
      ),
      createElement(
        "small",
        { style: "margin-left: var(--space-sm);" },
        "Width",
      ),
      createElement(
        "input",
        {
          type: "number",
          value: this.tableApp.canvasLayer.canvas.freeDrawingBrush.width,
          min: 1,
          style: "width: 44px; height: 26px; padding: 2px 4px;",
        },
        null,
        {
          type: "input",
          event: (e) => {
            this.tableApp.canvasLayer.canvas.freeDrawingBrush.width =
              e.target.valueAsNumber;
          },
        },
      ),
    ]);
  };

  // ---------------------------------------------------------------------------
  // Layers (dropdown)
  // ---------------------------------------------------------------------------

  renderStyledLayerInfoElem = () => {
    const style = this.layerStyles[this.tableApp.currentLayer];
    return createElement("small", { class: style.class }, style.label);
  };

  renderLayersButton = () => {
    if (!this.isOwnerOrManager()) return this.hiddenElement();

    const layerColor = this.layerStyles[this.tableApp.currentLayer]?.color;
    return this.renderToolbarButton(ICONS.layers, "Layers", {
      active: this.activePanel === "layers",
      layerColor,
      onClick: () => {
        this.clearSelection();
        this.activePanel = this.activePanel === "layers" ? null : "layers";
        this._updateLayersAnchor();
        this._updateGridAnchor();
      },
    });
  };

  renderLayersPanel = () => {
    if (this.activePanel !== "layers") return this.hiddenElement();

    return createElement("div", { class: "vtt-toolbar-panel open" }, [
      this.renderStyledLayerInfoElem(),
      createElement(
        "button",
        { title: "Change the layer you are interacting with" },
        "Switch Layer",
        {
          type: "click",
          event: () => {
            this.tableApp.changeLayer();
            this._updateLayersAnchor();
          },
        },
      ),
    ]);
  };

  // ---------------------------------------------------------------------------
  // Grid (dropdown)
  // ---------------------------------------------------------------------------

  renderGridButton = () => {
    if (!this.isOwnerOrManager()) return this.hiddenElement();

    return this.renderToolbarButton(ICONS.grid, "Grid control", {
      active: this.activePanel === "grid",
      onClick: () => {
        this.clearSelection();
        this.activePanel = this.activePanel === "grid" ? null : "grid";
        this._updateGridAnchor();
        this._updateLayersAnchor();
      },
    });
  };

  renderGridPanel = () => {
    if (this.activePanel !== "grid") return this.hiddenElement();

    const gridGroup = this.tableApp.canvasLayer.gridManager?.getGroup();
    const isVisible = gridGroup?.visible ?? false;

    if (!this.gridSizeInputs) {
      this.gridSizeInputs = { width: 40, height: 40 };
    }

    const updateInput = (key) => (e) => {
      const val = parseInt(e.target.value);
      if (!isNaN(val)) {
        this.gridSizeInputs[key] = val;
      }
    };

    return createElement("div", { class: "vtt-toolbar-panel open" }, [
      createElement(
        "button",
        { title: "Hide or show the grid lines and toggle snap-to-grid" },
        isVisible ? "Hide Grid" : "Show Grid",
        {
          type: "click",
          event: () => {
            isVisible
              ? this.tableApp.canvasLayer.hideGrid()
              : this.tableApp.canvasLayer.showGrid();
            socketIntegration.gridToggle(!isVisible);
            this._updateGridAnchor();
          },
        },
      ),
      createElement(
        "div",
        {
          class: "d-flex flex-row align-items-center",
          style: "gap: var(--space-sm);",
        },
        [
          createElement("small", {}, "W"),
          createElement(
            "input",
            {
              type: "number",
              value: this.gridSizeInputs.width,
              min: 1,
              max: 100,
              style: "width: 56px; padding: 2px 4px;",
            },
            null,
            { type: "input", event: updateInput("width") },
          ),
          createElement("small", {}, "H"),
          createElement(
            "input",
            {
              type: "number",
              value: this.gridSizeInputs.height,
              min: 1,
              max: 100,
              style: "width: 56px; padding: 2px 4px;",
            },
            null,
            { type: "input", event: updateInput("height") },
          ),
        ],
      ),
      createElement(
        "button",
        { title: "Resize the grid area (in squares)" },
        "Resize",
        {
          type: "click",
          event: () => {
            const w = this.gridSizeInputs.width;
            const h = this.gridSizeInputs.height;
            this.tableApp.canvasLayer.gridManager.rebuildGrid(w, h);
            socketIntegration.gridResized({ width: w, height: h });
          },
        },
      ),
    ]);
  };

  renderLocationPinButton = () => {
    if (!this.tableApp.canManagePins) return this.hiddenElement();
    return this.renderToolbarButton(ICONS.pin, "Add a location pin", {
      onClick: async () => {
        this.clearSelection();
        await this.tableApp.createLocationPin();
      },
    });
  };

  renderManagePinsButton = () => {
    if (!this.tableApp.canManagePins) return this.hiddenElement();
    return this.renderToolbarButton(ICONS.list, "Manage location pins", {
      onClick: () => {
        this.clearSelection();
        this.showManagePinsModal();
      },
    });
  };

  showManagePinsModal = () => {
    const pins = this.tableApp.locationPins;
    const canvasIds = this.tableApp.getCanvasObjectIdSet();

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
                this.tableApp.canvasLayer.selectObjectById(
                  pin.canvas_object_id,
                );
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
                await this.tableApp.restoreOrphanedPin(pin);
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
                  const obj = this.tableApp.canvasLayer.canvas
                    .getObjects()
                    .find((o) => o.id === pin.canvas_object_id);
                  if (obj) {
                    await this.tableApp.deleteLocationPin(obj);
                  }
                } else {
                  await this.tableApp.deleteOrphanedPin(pin.id);
                }
                this.showManagePinsModal();
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
  };

  // ---------------------------------------------------------------------------
  // Sidebar toggle (far-right of toolbar)
  // ---------------------------------------------------------------------------

  renderSidebarToggle = () => {
    if (!this.isOwnerOrManager()) return this.hiddenElement();

    const sidebar = this.tableApp.sidebar;
    if (!sidebar) return this.hiddenElement();

    return this.renderToolbarButton(ICONS.sidebar, "Toggle sidebar", {
      active: sidebar.isVisible,
      onClick: () => {
        this.clearSelection();
        if (sidebar.isVisible) {
          sidebar.close();
        } else {
          sidebar.open();
        }
        this._updateSidebarToggle();
      },
    });
  };

  // ---------------------------------------------------------------------------
  // Object action buttons (delete, move up)
  // ---------------------------------------------------------------------------

  renderImageOptionButtons = () => {
    const obj = this.tableApp.getCurrentSelectedObject();
    if (!obj || obj.isLocationPin) return [];

    return [
      createElement("div", { class: "vtt-toolbar-sep" }),
      this.renderToolbarButton(ICONS.trash, "Remove selected object", {
        danger: true,
        onClick: () => this.tableApp.canvasLayer.removeObjects(),
      }),
      this.renderToolbarButton(ICONS.chevronUp, "Move to top of layer", {
        onClick: () => this.tableApp.canvasLayer.moveObjectToTop(),
      }),
    ];
  };

  // ---------------------------------------------------------------------------
  // Selected object info (sub-bar, like draw bar)
  // ---------------------------------------------------------------------------

  renderSelectedObjectBar = async () => {
    const obj = this.tableApp.getCurrentSelectedObject();
    if (!obj) return this.hiddenElement();

    if (obj.isLocationPin) {
      const pin = this.tableApp.locationPinsByObjectId.get(obj.id);
      if (!pin) return this.hiddenElement();

      const iconElem = pin.image_src
        ? createElement("img", {
            class: "location-pin-icon location-pin-icon-img",
            src: pin.image_src,
            alt: pin.title || "Location pin image",
            loading: "lazy",
          })
        : createElement(
            "div",
            { class: "location-pin-icon" },
            ICONS.pin,
          );

      const infoChildren = [
        createElement(
          "small",
          { class: "location-pin-id" },
          `PIN-${pin.id ?? "new"}`,
        ),
        createElement(
          "h3",
          { class: "location-pin-title" },
          pin.title || "Location pin",
        ),
        createElement(
          "p",
          { class: "location-pin-description" },
          pin.description || "No description",
        ),
        ...this.renderObjectLockControls(obj, { includeButton: false }),
      ];

      if (this.tableApp.canManagePins) {
        infoChildren.push(
          createElement(
            "div",
            { class: "location-pin-actions" },
            [
              createElement(
                "button",
                { class: "location-pin-edit-btn", type: "button" },
                "Edit pin",
                {
                  type: "click",
                  event: () => this.tableApp.openLocationPinModal(obj),
                },
              ),
              createElement(
                "button",
                { class: "location-pin-delete-btn", type: "button" },
                "Delete",
                {
                  type: "click",
                  event: () => this.tableApp.deleteLocationPin(obj),
                },
              ),
              ...this.renderObjectLockControls(obj, { includeStatus: false }),
            ],
          ),
        );
      }

      const infoBlock = createElement("div", { class: "location-pin-info" }, infoChildren);

      const headerRowChildren = [iconElem, infoBlock];

      const attachments = pin.attachments || [];
      const attachmentsContent =
        attachments.length > 0
          ? attachments.map((target) => {
              const label = target.title || target.uuid;
              if (this.tableApp.canManagePins) {
                return createElement(
                  "button",
                  {
                    class: "location-pin-attachment-link",
                    type: "button",
                    title: `Open ${label}`,
                  },
                  label,
                  {
                    type: "click",
                    event: () => this.tableApp.handleLocationPinPortal(target),
                  },
                );
              }
              return createElement(
                "div",
                { class: "location-pin-attachment" },
                createElement(
                  "span",
                  { class: "location-pin-attachment-title" },
                  label,
                ),
              );
            })
          : [
              createElement(
                "span",
                { class: "location-pin-attachment-note" },
                "No portals mapped to this location yet.",
              ),
            ];

      const attachmentsBlockChildren = [
        createElement("h3", { class: "location-pin-attachments-heading" }, "Portals"),
        createElement("div", { class: "location-pin-attachments" }, attachmentsContent),
      ];
      if (!this.tableApp.canManagePins) {
        attachmentsBlockChildren.push(
          createElement(
            "small",
            { class: "location-pin-attachment-note" },
            "Portals are manager-only controls.",
          ),
        );
      }
      const attachmentsBlock = createElement(
        "div",
        { class: "location-pin-attachments-block" },
        attachmentsBlockChildren,
      );

      return createElement(
        "div",
        { class: "vtt-draw-bar location-pin-draw-bar" },
        [
          createElement("div", { class: "location-pin-selected-row" }, headerRowChildren),
          attachmentsBlock,
        ],
      );
    }

    const { idPrefix, displayName, imageSrc, recordTitle, recordHref } =
      await this.getSelectedObjectInfo(obj);

    const thumbnailElem =
      obj.type === "image"
        ? createElement("img", {
            src: imageSrc,
            width: 24,
            height: 24,
            style: "border-radius: var(--border-radius);",
          })
        : this.hiddenElement();

    const nameElem = recordTitle
      ? createElement(
          "small",
          {},
          createElement(
            "a",
            { href: recordHref, rel: "noopener noreferrer", target: "_blank" },
            recordTitle,
          ),
        )
      : createElement("small", {}, `"${displayName}"`);

    return createElement("div", { class: "vtt-draw-bar" }, [
      thumbnailElem,
      createElement(
        "small",
        { style: "color: var(--light-gray); font-weight: normal;" },
        `${idPrefix}-${truncateString(obj.id, 8, "")}`,
      ),
      nameElem,
      createElement("div", { class: "vtt-toolbar-sep" }),
      createElement("small", {}, "Aura"),
      this.renderAuraColorPicker(obj),
      ...this.renderObjectLockControls(obj, { withSeparator: true }),
    ]);
  };

  renderAuraColorPicker = (obj) => {
    const setAura = (color) => {
      obj.set({
        shadow: color ? { color, blur: 30, offsetX: 0, offsetY: 0 } : null,
      });
      this.tableApp.canvasRenderAll();
      socketIntegration.imageMoved(obj);
    };

    return createElement(
      "div",
      {
        class: "d-flex flex-row align-items-center",
        style: "gap: var(--space-sm);",
      },
      [
        createElement(
          "input",
          {
            type: "color",
            value: obj.shadow?.color ?? null,
            style:
              "cursor: pointer; height: 26px; width: 32px; border: none; border-radius: var(--border-radius); padding: 0;",
          },
          null,
          { type: "input", event: (e) => setAura(e.target.value) },
        ),
        createElement(
          "small",
          {
            style:
              "cursor: pointer; color: var(--main-gray); font-weight: normal; text-decoration: underline; text-underline-offset: 2px;",
          },
          "Clear",
          { type: "click", event: () => setAura(null) },
        ),
      ],
    );
  };

  // ---------------------------------------------------------------------------
  // Canvas object list (for info modal)
  // ---------------------------------------------------------------------------

  renderCanvasObjectList = (canvasObjectList) => {
    return canvasObjectList.map((obj, index) => {
      let IdPrefix = "lin";
      if (obj.imageId) {
        IdPrefix = "img";
      }
      if (!obj.id) {
        return createElement("div", { class: "d-none" });
      }

      return createElement(
        "div",
        {
          class: "canvas-log-item d-flex flex-row justify-content-between",
        },
        [
          createElement(
            "div",
            {},
            `${index} ${IdPrefix}-${truncateString(obj.id, 8, "")}`,
          ),
          createElement("img", {
            src: this.tableApp.sidebar.tableSidebarImageComponent
              .downloadedImageSourceList[obj.imageId]
              ? this.tableApp.sidebar.tableSidebarImageComponent
                  .downloadedImageSourceList[obj.imageId]
              : "",
            style: "width: 30px; height: 30px;",
          }),
          createElement("br"),
        ],
        {
          type: "click",
          event: () => {
            this.tableApp.canvasLayer.selectObjectById(obj.id);
          },
        },
      );
    });
  };

  // ---------------------------------------------------------------------------
  // Slot update methods (each section manages its own DOM)
  // ---------------------------------------------------------------------------

  _updateDrawToggle = () => {
    this._drawToggleSlot.replaceChildren(this.renderDrawModeToggle());
  };

  _updateLayersAnchor = () => {
    this._layersAnchorSlot.replaceChildren(
      this.renderLayersButton(),
      this.renderLayersPanel(),
    );
  };

  _updateGridAnchor = () => {
    this._gridAnchorSlot.replaceChildren(
      this.renderGridButton(),
      this.renderGridPanel(),
    );
  };

  _updateObjectActions = () => {
    this._objectActionsSlot.replaceChildren(...this.renderImageOptionButtons());
  };

  _updateSidebarToggle = () => {
    this._sidebarSlot.replaceChildren(this.renderSidebarToggle());
  };

  _updateDrawBar = () => {
    this._drawBarSlot.replaceChildren(this.renderDrawBar());
  };

  _updateSelectedObjectBar = async () => {
    const updateId = ++this._selectedObjectBarUpdateId;
    const el = await this.renderSelectedObjectBar();
    if (updateId === this._selectedObjectBarUpdateId) {
      this._selectedObjectBarSlot.replaceChildren(el);
    }
  };

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  updateObjectSelection = async () => {
    this._updateObjectActions();
    await this._updateSelectedObjectBar();
  };

  build = () => {
    this.setupClickAway();

    // Persistent slot containers — display:contents makes them transparent to flex
    this._drawToggleSlot = createElement("div", {
      style: "display: contents;",
    });
    this._layersAnchorSlot = createElement("div", {
      class: "vtt-toolbar-panel-anchor",
    });
    this._gridAnchorSlot = createElement("div", {
      class: "vtt-toolbar-panel-anchor",
    });
    this._objectActionsSlot = createElement("div", {
      style: "display: contents;",
    });
    this._sidebarSlot = createElement("div", { style: "display: contents;" });
    this._drawBarSlot = createElement("div");
    this._selectedObjectBarSlot = createElement("div");

    const toolbarRow = createElement("div", { class: "vtt-toolbar-row" }, [
      this.renderInfoMenu(),
      this._drawToggleSlot,
      createElement("div", { class: "vtt-toolbar-sep" }),
      this.renderLocationPinButton(),
      this.renderManagePinsButton(),
      this._layersAnchorSlot,
      this._gridAnchorSlot,
      this._objectActionsSlot,
      createElement("div", { style: "flex: 1;" }),
      this._sidebarSlot,
    ]);

    return createElement("div", { class: "vtt-toolbar" }, [
      toolbarRow,
      this._drawBarSlot,
      this._selectedObjectBarSlot,
    ]);
  };

  render = async () => {
    this._updateDrawToggle();
    this._updateLayersAnchor();
    this._updateGridAnchor();
    this._updateObjectActions();
    this._updateSidebarToggle();
    this._updateDrawBar();
    await this._updateSelectedObjectBar();
  };
}
