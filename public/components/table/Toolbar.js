import { apiGet } from "../../lib/apiUtils.js";
import createElement from "../../lib/salt-lib/createElement.js";
import Component from "../../lib/salt-lib/Component.js";
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

class ToolbarSlot extends Component {
  constructor({ domElem, renderContent }) {
    super({
      domElem,
      autoInit: false,
      autoRender: false,
    });
    this.renderContent = renderContent;
  }

  render = async () => {
    if (typeof this.renderContent !== "function") return [];
    const content = await this.renderContent();
    if (Array.isArray(content)) return content;
    return [content];
  };
}

export default class Toolbar extends Component {
  constructor({ tableApp, domElem } = {}) {
    super({
      domElem: domElem || createElement("div"),
      autoInit: false,
      autoRender: false,
    });

    this.tableApp = tableApp;

    this.activePanel = null;
    this._clickAwayBound = false;
    this._onPointerDown = null;
    this._onZoomChanged = null;
    this.toolbarElem = null;

    this._drawToggleSlot = null;
    this._layersAnchorSlot = null;
    this._gridAnchorSlot = null;
    this._objectActionsSlot = null;
    this._zoomSlot = null;
    this._sidebarSlot = null;
    this._drawBarSlot = null;
    this._selectedObjectBarSlot = null;
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
      recordTitleFull: null,
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
    const imageResult = await apiGet(
      `/api/get_image/${obj.imageId}${queryString ? `?${queryString}` : ""}`
    );
    const image = imageResult.ok ? imageResult.data : null;
    if (!image) {
      info.displayName = "Image";
      info.imageSrc =
        obj?._element?.currentSrc ||
        obj?._element?.src ||
        obj?._originalElement?.currentSrc ||
        obj?._originalElement?.src ||
        "";
      return info;
    }
    info.displayName = truncateString(image.original_name, 12);
    info.imageSrc = image.src;

    const records = Array.isArray(image.records) ? image.records : [];
    const publicRecord = records.find((r) => r.is_public);
    const selectedRecord = publicRecord || records[0];
    if (selectedRecord) {
      info.recordTitle = truncateString(selectedRecord.title, 12);
      info.recordTitleFull = selectedRecord.title;
      info.recordHref = this.getRecordHref(selectedRecord.id);
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
        void this._updateLayersAnchor();
        void this._updateGridAnchor();
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
      void this._updateZoomControls();
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

    this._drawToggleSlot?.destroy?.();
    this._layersAnchorSlot?.destroy?.();
    this._gridAnchorSlot?.destroy?.();
    this._objectActionsSlot?.destroy?.();
    this._zoomSlot?.destroy?.();
    this._sidebarSlot?.destroy?.();
    this._drawBarSlot?.destroy?.();
    this._selectedObjectBarSlot?.destroy?.();

    this.toolbarElem = null;
    this._drawToggleSlot = null;
    this._layersAnchorSlot = null;
    this._gridAnchorSlot = null;
    this._objectActionsSlot = null;
    this._zoomSlot = null;
    this._sidebarSlot = null;
    this._drawBarSlot = null;
    this._selectedObjectBarSlot = null;
    this.clear({ deep: true });
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
    const iconFactory = isLocked ? ICONS.lock : ICONS.unlock;
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
            createElement("span", { class: "vtt-lock-status-icon" }, iconFactory()),
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
            createElement("span", { class: "vtt-lock-toggle-icon" }, iconFactory()),
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
    return this.renderToolbarButton(ICONS.pin(), "Add a location pin", {
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
    return this.renderToolbarButton(ICONS.list(), "Manage location pins", {
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

    return this.renderToolbarButton(ICONS.sidebar(), "Toggle sidebar", {
      active: sidebar.isVisible,
      onClick: () => {
        this.clearSelection();
        if (sidebar.isVisible) {
          sidebar.close();
        } else {
          sidebar.open();
        }
        void this._updateSidebarToggle();
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
        this.renderToolbarButton(ICONS.trash(), "Remove selected object", {
          danger: true,
          onClick: () => this.tableApp.canvasLayer.removeObjects(),
        }),
      );
    }

    if (canManageLayers) {
      actions.push(
        this.renderToolbarButton(ICONS.chevronUp(), "Move to top of layer", {
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

  _updateDrawToggle = async () => {
    if (!this._drawToggleSlot) return;
    await this._drawToggleSlot.render();
  };

  _updateLayersAnchor = async () => {
    if (!this._layersAnchorSlot) return;
    await this._layersAnchorSlot.render();
  };

  _updateGridAnchor = async () => {
    if (!this._gridAnchorSlot) return;
    await this._gridAnchorSlot.render();
  };

  _updateObjectActions = async () => {
    if (!this._objectActionsSlot) return;
    await this._objectActionsSlot.render();
  };

  _updateSidebarToggle = async () => {
    if (!this._sidebarSlot) return;
    await this._sidebarSlot.render();
  };

  _updateZoomControls = async () => {
    if (!this._zoomSlot) return;
    await this._zoomSlot.render();
  };

  _updateDrawBar = async () => {
    if (!this._drawBarSlot) return;
    await this._drawBarSlot.render();
  };

  _updateSelectedObjectBar = async () => {
    if (!this._selectedObjectBarSlot) return;
    await this._selectedObjectBarSlot.render();
  };

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  updateObjectSelection = async () => {
    this._ensureLayout();
    await this._updateObjectActions();
    await this._updateSelectedObjectBar();
  };

  _buildLayout = () => {
    this.setupClickAway();
    this.setupZoomListener();

    // Persistent slot components.
    this._drawToggleSlot = new ToolbarSlot({
      domElem: createElement("div", {
        style: "display: contents;",
      }),
      renderContent: () => this.renderDrawModeToggle(),
    });
    this._layersAnchorSlot = new ToolbarSlot({
      domElem: createElement("div", {
        class: "vtt-toolbar-panel-anchor",
      }),
      renderContent: () => [this.renderLayersButton(), this.renderLayersPanel()],
    });
    this._gridAnchorSlot = new ToolbarSlot({
      domElem: createElement("div", {
        class: "vtt-toolbar-panel-anchor",
      }),
      renderContent: () => [this.renderGridButton(), this.renderGridPanel()],
    });
    this._objectActionsSlot = new ToolbarSlot({
      domElem: createElement("div", {
        style: "display: contents;",
      }),
      renderContent: () => this.renderImageOptionButtons(),
    });
    this._zoomSlot = new ToolbarSlot({
      domElem: createElement("div", { style: "display: contents;" }),
      renderContent: () => this.renderZoomControls(),
    });
    this._sidebarSlot = new ToolbarSlot({
      domElem: createElement("div", { style: "display: contents;" }),
      renderContent: () => this.renderSidebarToggle(),
    });
    this._drawBarSlot = new ToolbarSlot({
      domElem: createElement("div"),
      renderContent: () => this.renderDrawBar(),
    });
    this._selectedObjectBarSlot = new ToolbarSlot({
      domElem: createElement("div"),
      renderContent: async () => this.renderSelectedObjectBar(),
    });

    const toolbarRow = createElement("div", { class: "vtt-toolbar-row" }, [
      this.renderInfoMenu(),
      this._drawToggleSlot.domElem,
      createElement("div", { class: "vtt-toolbar-sep" }),
      this.renderLocationPinButton(),
      this.renderManagePinsButton(),
      this._layersAnchorSlot.domElem,
      this._gridAnchorSlot.domElem,
      this._objectActionsSlot.domElem,
      this._zoomSlot.domElem,
      createElement("div", { style: "flex: 1;" }),
      this._sidebarSlot.domElem,
    ]);

    this.toolbarElem = createElement("div", { class: "vtt-toolbar" }, [
      toolbarRow,
      this._drawBarSlot.domElem,
      this._selectedObjectBarSlot.domElem,
    ]);
  };

  _ensureLayout = () => {
    if (this.toolbarElem) return;
    this._buildLayout();
  };

  build = () => {
    this._ensureLayout();
    return this.toolbarElem;
  };

  render = async () => {
    this._ensureLayout();
    await this._updateDrawToggle();
    await this._updateLayersAnchor();
    await this._updateGridAnchor();
    await this._updateObjectActions();
    await this._updateZoomControls();
    await this._updateSidebarToggle();
    await this._updateDrawBar();
    await this._updateSelectedObjectBar();
    return [this.toolbarElem];
  };
}
