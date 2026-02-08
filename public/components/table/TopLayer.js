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
};

export default class TopLayer {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.tableApp = props.tableApp;
    this.tableView = props.tableView;

    const searchParams = new URLSearchParams(window.location.search);
    this.projectId = searchParams.get("project");

    this.activePanel = null;
    this._clickAwayBound = false;
    this._initialized = false;
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
    if (!obj) return [];

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

  // Called by Table.setCurrentSelectedObject — only updates object-related slots
  updateObjectSelection = async () => {
    if (!this._initialized) return;
    this._updateObjectActions();
    await this._updateSelectedObjectBar();
  };

  // ---------------------------------------------------------------------------
  // Main render
  // ---------------------------------------------------------------------------

  _buildToolbar = () => {
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
      this._layersAnchorSlot,
      this._gridAnchorSlot,
      this._objectActionsSlot,
      createElement("div", { style: "flex: 1;" }),
      this._sidebarSlot,
    ]);

    const toolbar = createElement("div", { class: "vtt-toolbar" }, [
      toolbarRow,
      this._drawBarSlot,
      this._selectedObjectBarSlot,
    ]);

    this.domComponent.replaceChildren(toolbar);
  };

  render = async () => {
    if (!this._initialized) {
      this._initialized = true;
      this._buildToolbar();
    }

    this._updateDrawToggle();
    this._updateLayersAnchor();
    this._updateGridAnchor();
    this._updateObjectActions();
    this._updateSidebarToggle();
    this._updateDrawBar();
    await this._updateSelectedObjectBar();
  };
}
