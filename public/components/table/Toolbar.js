import { getThings } from "../../lib/apiUtils.js";
import createElement from "../createElement.js";
import socketIntegration from "./socketIntegration.js";
import truncateString from "../../lib/truncateString.js";
import { ICONS, LAYER_STYLES } from "./toolbarConfig.js";
import { getCurrentProjectId } from "./tableApi.js";
import {
  renderCanvasObjectList as renderCanvasObjectListUI,
  renderInfoMenu as renderInfoMenuUI,
} from "./toolbarInfoPanel.js";
import { showManagePinsModal as showManagePinsModalUI } from "./toolbarManagePins.js";
import {
  renderAuraColorPicker as renderAuraColorPickerUI,
  renderSelectedObjectBar as renderSelectedObjectBarUI,
} from "./toolbarSelectedObjectBar.js";
import {
  renderDrawBar as renderDrawBarUI,
  renderDrawModeToggle as renderDrawModeToggleUI,
} from "./toolbarDrawControls.js";
import {
  renderLayersButton as renderLayersButtonUI,
  renderLayersPanel as renderLayersPanelUI,
  renderStyledLayerInfoElem as renderStyledLayerInfoElemUI,
} from "./toolbarLayerControls.js";
import {
  renderGridButton as renderGridButtonUI,
  renderGridPanel as renderGridPanelUI,
} from "./toolbarGridControls.js";

export default class Toolbar {
  constructor({ tableApp }) {
    this.tableApp = tableApp;

    this.activePanel = null;
    this._clickAwayBound = false;
    this._selectedObjectBarUpdateId = 0;
    this._onPointerDown = null;
    this._onZoomChanged = null;
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  getRecordHref = (recordId) => {
    const base = `/record?id=${recordId}`;
    const projectId = this.tableApp?.tableView?.project_id || getCurrentProjectId();
    return projectId ? `${base}&project_id=${projectId}` : base;
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
    const searchParams = new URLSearchParams();
    if (this.tableApp?.tableView?.is_guest_sandbox) {
      const guestUuid =
        this.tableApp?.tableView?.guest_sandbox_id || this.tableApp?.tableView?.id;
      if (guestUuid) searchParams.set("guest_uuid", guestUuid);
    } else if (this.tableApp?.tableView?.id) {
      searchParams.set("table_view_id", this.tableApp.tableView.id);
    }
    const queryString = searchParams.toString();
    const image = await getThings(
      `/api/get_image/${obj.imageId}${queryString ? `?${queryString}` : ""}`
    );
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

  can = (capability) => {
    return !!this.tableApp?.capabilities?.[capability];
  };

  canLockObject = (obj) => {
    if (!obj) return false;
    if (obj.isLocationPin) {
      return this.can("canManagePins");
    }
    return this.can("canDeleteCanvasObjects");
  };

  canManageVisibility = (obj) => {
    if (!obj || obj.isLocationPin) return false;
    return this.can("canDeleteCanvasObjects");
  };

  getActiveObjects = () => {
    return this.tableApp?.canvasLayer?.canvasEngine?.getActiveObjects?.() || [];
  };

  hiddenElement = () => createElement("div", { class: "d-none" });

  layerStyles = LAYER_STYLES;

  setupClickAway = () => {
    if (this._clickAwayBound) return;
    this._clickAwayBound = true;

    this._onPointerDown = (e) => {
      if (this.activePanel && !e.target.closest(".vtt-toolbar")) {
        this.activePanel = null;
        this._updateLayersAnchor();
        this._updateGridAnchor();
      }
    };

    document.addEventListener("pointerdown", this._onPointerDown);
  };

  setupZoomListener = () => {
    if (this._onZoomChanged) return;
    this._onZoomChanged = (event) => {
      if (!event?.detail) return;
      const { tableId } = event.detail;
      if (tableId !== this.tableApp?.tableId) return;
      this._updateZoomControls();
    };
    document.addEventListener("vtt:zoom-changed", this._onZoomChanged);
  };

  destroy = () => {
    if (this._onPointerDown) {
      document.removeEventListener("pointerdown", this._onPointerDown);
      this._onPointerDown = null;
    }
    if (this._onZoomChanged) {
      document.removeEventListener("vtt:zoom-changed", this._onZoomChanged);
      this._onZoomChanged = null;
    }
    this._clickAwayBound = false;
    this.activePanel = null;
    this._selectedObjectBarUpdateId = 0;
  };

  clearSelection = () => {
    const canvasLayer = this.tableApp.canvasLayer;
    if (!canvasLayer) return;
    canvasLayer.discardActiveObject();
    canvasLayer.requestRender();
  };

  setObjectLockInPosition = async (obj, shouldLock) => {
    if (!obj || !this.canLockObject(obj)) return;
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

  setObjectsLockInPosition = async (objects, shouldLock) => {
    if (!Array.isArray(objects) || !objects.length) return;
    let changed = false;
    for (const obj of objects) {
      if (!obj || !this.canLockObject(obj)) continue;
      obj.set("lockInPosition", !!shouldLock);
      this.tableApp.canvasLayer.updateObjectProperties(obj);
      if (obj.isLocationPin) {
        this.tableApp.enforceLocationPinConstraints(obj);
      }
      socketIntegration.imageMoved(obj);
      changed = true;
    }
    if (!changed) return;
    this.tableApp.canvasRenderAll();
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

    if (this.canLockObject(obj) && includeButton) {
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

  setObjectVisibilityForPlayers = async (obj, isVisibleToPlayers) => {
    if (!obj || !this.canManageVisibility(obj)) return;
    obj.set("hiddenFromPlayers", !isVisibleToPlayers);
    this.tableApp.canvasLayer.updateObjectProperties(obj);
    this.tableApp.canvasRenderAll();
    socketIntegration.imageMoved(obj);
    await this.tableApp.canvasLayer.saveToDatabase();
    await this.updateObjectSelection();
  };

  setObjectsVisibilityForPlayers = async (objects, isVisibleToPlayers) => {
    if (!Array.isArray(objects) || !objects.length) return;
    let changed = false;
    for (const obj of objects) {
      if (!obj || !this.canManageVisibility(obj)) continue;
      obj.set("hiddenFromPlayers", !isVisibleToPlayers);
      this.tableApp.canvasLayer.updateObjectProperties(obj);
      socketIntegration.imageMoved(obj);
      changed = true;
    }
    if (!changed) return;
    this.tableApp.canvasRenderAll();
    await this.tableApp.canvasLayer.saveToDatabase();
    await this.updateObjectSelection();
  };

  renderObjectVisibilityControls = (
    obj,
    { withSeparator = false, includeStatus = true, includeButton = true } = {},
  ) => {
    if (!obj || !this.canManageVisibility(obj)) return [];
    const isVisibleToPlayers = !obj.hiddenFromPlayers;
    const controls = [];

    if (withSeparator) {
      controls.push(createElement("div", { class: "vtt-toolbar-sep" }));
    }

    if (includeStatus) {
      controls.push(
        createElement(
          "small",
          {
            style: `color: ${isVisibleToPlayers ? "var(--green)" : "var(--orange3)"};`,
          },
          isVisibleToPlayers ? "Visible to players" : "Hidden from players",
        ),
      );
    }

    if (includeButton) {
      controls.push(
        createElement(
          "button",
          {
            type: "button",
            class: "vtt-lock-toggle-btn",
            title: isVisibleToPlayers
              ? "Hide this object from players"
              : "Show this object to players",
          },
          isVisibleToPlayers ? "Hide from players" : "Show to players",
          {
            type: "click",
            event: async () => {
              await this.setObjectVisibilityForPlayers(obj, !isVisibleToPlayers);
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
    return renderInfoMenuUI(this);
  };

  renderDrawModeToggle = () => {
    return renderDrawModeToggleUI(this);
  };

  renderDrawBar = () => {
    return renderDrawBarUI(this);
  };

  // ---------------------------------------------------------------------------
  // Layers (dropdown)
  // ---------------------------------------------------------------------------

  renderStyledLayerInfoElem = () => {
    return renderStyledLayerInfoElemUI(this);
  };

  renderLayersButton = () => {
    return renderLayersButtonUI(this);
  };

  renderLayersPanel = () => {
    return renderLayersPanelUI(this);
  };

  // ---------------------------------------------------------------------------
  // Grid (dropdown)
  // ---------------------------------------------------------------------------

  renderGridButton = () => {
    return renderGridButtonUI(this);
  };

  renderGridPanel = () => {
    return renderGridPanelUI(this);
  };

  renderLocationPinButton = () => {
    if (!this.can("canManagePins")) {
      return this.hiddenElement();
    }
    return this.renderToolbarButton(ICONS.pin, "Add a location pin", {
      onClick: async () => {
        this.clearSelection();
        await this.tableApp.createLocationPin();
      },
    });
  };

  renderManagePinsButton = () => {
    if (!this.can("canManagePins")) {
      return this.hiddenElement();
    }
    return this.renderToolbarButton(ICONS.list, "Manage location pins", {
      onClick: () => {
        this.clearSelection();
        this.showManagePinsModal();
      },
    });
  };

  showManagePinsModal = () => {
    return showManagePinsModalUI(this);
  };

  // ---------------------------------------------------------------------------
  // Sidebar toggle (far-right of toolbar)
  // ---------------------------------------------------------------------------

  renderSidebarToggle = () => {
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

  renderZoomControls = () => {
    const canvasLayer = this.tableApp.canvasLayer;
    const zoom = canvasLayer?.getZoomLevel?.() || 1;
    const zoomPct = `${Math.round(zoom * 100)}%`;

    return createElement("div", { class: "vtt-zoom-controls" }, [
      createElement(
        "button",
        {
          type: "button",
          class: "vtt-zoom-btn",
          title: "Zoom out",
        },
        "−",
        {
          type: "click",
          event: () => canvasLayer?.zoomOut?.(),
        },
      ),
      createElement("span", { class: "vtt-zoom-value", title: "Current zoom" }, zoomPct),
      createElement(
        "button",
        {
          type: "button",
          class: "vtt-zoom-btn",
          title: "Zoom in",
        },
        "+",
        {
          type: "click",
          event: () => canvasLayer?.zoomIn?.(),
        },
      ),
      createElement(
        "button",
        {
          type: "button",
          class: "vtt-zoom-reset",
          title: "Reset zoom to 100%",
        },
        "Reset",
        {
          type: "click",
          event: () => canvasLayer?.resetZoom?.(),
        },
      ),
    ]);
  };

  // ---------------------------------------------------------------------------
  // Object action buttons (delete, move up)
  // ---------------------------------------------------------------------------

  renderImageOptionButtons = () => {
    const obj = this.tableApp.getCurrentSelectedObject();
    if (!obj || obj.isLocationPin) return [];
    const canDelete = this.can("canDeleteCanvasObjects");
    const canManageLayers = this.can("canManageLayers");
    if (!canDelete && !canManageLayers) return [];

    const actions = [createElement("div", { class: "vtt-toolbar-sep" })];

    if (canDelete) {
      actions.push(
        this.renderToolbarButton(ICONS.trash, "Remove selected object", {
          danger: true,
          onClick: () => this.tableApp.canvasLayer.removeObjects(),
        }),
      );
    }

    if (canManageLayers) {
      actions.push(
        this.renderToolbarButton(ICONS.chevronUp, "Move to top of layer", {
          onClick: () => this.tableApp.canvasLayer.moveObjectToTop(),
        }),
      );
    }

    return actions;
  };

  // ---------------------------------------------------------------------------
  // Selected object info (sub-bar, like draw bar)
  // ---------------------------------------------------------------------------

  renderSelectedObjectBar = async () => {
    return renderSelectedObjectBarUI(this);
  };

  renderAuraColorPicker = (obj) => {
    return renderAuraColorPickerUI(this, obj);
  };

  // ---------------------------------------------------------------------------
  // Canvas object list (for info modal)
  // ---------------------------------------------------------------------------

  renderCanvasObjectList = (canvasObjectList) => {
    return renderCanvasObjectListUI(this, canvasObjectList);
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

  _updateZoomControls = () => {
    this._zoomSlot.replaceChildren(this.renderZoomControls());
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
    this.setupZoomListener();

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
    this._zoomSlot = createElement("div", { style: "display: contents;" });
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
      this._zoomSlot,
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
    this._updateZoomControls();
    this._updateSidebarToggle();
    this._updateDrawBar();
    await this._updateSelectedObjectBar();
  };
}
