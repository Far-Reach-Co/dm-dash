import createElement from "../components/createElement.js";
import { getThings } from "../lib/apiUtils.js";
import { Hamburger } from "../components/Hamburger.js";
import TableSidebar from "../components/table/TableSidebar.js";
import CanvasLayer from "../components/table/CanvasLayer.js";
import socketIntegration from "../components/table/socketIntegration.js";
import TopLayer from "../components/table/TopLayer.js";
import ChatBoxComponent from "../components/table/ChatBox.js";
import imageFollowingCursor from "../components/imageFollowingCursor.js";
import throttle from "../lib/throttle.js";
import {
  canRenderSidebarForTable,
  getDefaultTableCapabilities,
  normalizeTableCapabilities,
} from "./table/capabilities.js";
import {
  buildTableUrl,
  createGuestFallbackUser,
  getTableViewEndpoint,
  parseInitialTableRoute,
} from "./table/urlState.js";
import LocationPinController from "./table/locationPinController.js";

class Table {
  constructor() {
    this.domComponent = document.getElementById("app");
    this.canvasElem = createElement("canvas", { id: "canvas-layer" });

    this.canvasLayer = null;
    this.sidebar = null;
    this.hamburger = null;
    this.topLayer = null;
    this.chatBoxComponent = null;

    this.currentLayer = "Object";
    this.currentSelectedObject = null;
    this.isReloading = false;
    this.socketListenersReady = false;
    this.documentListeners = [];
    this.locationPins = [];
    this.locationPinsByObjectId = new Map();
    this.capabilities = getDefaultTableCapabilities("standard", false);
    this.isGuestSandbox = false;
    this.tableView = null;
    this.lastHighlightedPinObject = null;
    this.locationPinController = new LocationPinController(this);

    // Socket needs to control other components from table
    socketIntegration.tableApp = this;

    this.init();
  }

  init = async () => {
    const { tableUUID, isGuestSandbox } = parseInitialTableRoute();
    await this.loadTable(tableUUID, {
      historyMode: "replace",
      isGuestSandbox,
    });
  };

  loadTable = async (
    tableUUID,
    { historyMode = "replace", isGuestSandbox = false } = {},
  ) => {
    if (!tableUUID) return;

    this.isGuestSandbox = !!isGuestSandbox;
    this.updateUrl(tableUUID, historyMode);
    this.tableId = tableUUID;

    const tableEndpoint = getTableViewEndpoint(this.tableId, this.isGuestSandbox);
    const tableView = await getThings(tableEndpoint);
    if (!tableView) {
      window.location.href = "/forbidden";
      return;
    }
    // TODO: error handling no table view by id

    this.tableView = tableView;
    this.capabilities = normalizeTableCapabilities(tableView, {
      userId: USERID,
      isManagerOrOwner: IS_MANAGER_OR_OWNER,
    });

    // Handle user or anonymous
    if (!this.user) {
      let user = await getThings("/api/get_user");
      if (!user) {
        user = createGuestFallbackUser();
      }
      this.user = user;
    }

    if (!this.socketListenersReady) {
      socketIntegration.setupListeners();
      this.socketListenersReady = true;
    }
    socketIntegration.socketJoined();

    // Init elements
    this.sidebar = new TableSidebar({
      domComponent: createElement("div", {}),
      tableView,
      tableApp: this,
    });
    this.hamburger = new Hamburger({
      domComponent: createElement("div", {}),
      sidebar: this.sidebar,
    });

    this.canvasLayer = new CanvasLayer({
      tableView,
      tableApp: this,
    });
    this.topLayer = new TopLayer({
      domComponent: createElement("div"),
      tableApp: this,
    });
    this.chatBoxComponent = new ChatBoxComponent({
      domComponent: createElement("div"),
    });

    // Rendering
    this.render();
    await this.canvasLayer.init();
    await this.reloadLocationPins();
    this.setupDocumentEventListeners();
    this.topLayer.render();
    this.chatBoxComponent.render();
    socketIntegration.getMessages();

    // Only render the sidebar for owner or managers
    if (
      canRenderSidebarForTable(tableView, {
        userId: USERID,
        isManagerOrOwner: IS_MANAGER_OR_OWNER,
      })
    )
      // USERID and IS_MANAGER_OR_OWNER is injected from template; check vtt.ejs
      this.renderSidebarAndHamburger();
  };

  loadLocationPins = async (tableViewId) => {
    return this.locationPinController.loadLocationPins(tableViewId);
  };

  reloadLocationPins = async () => {
    return this.locationPinController.reloadLocationPins();
  };

  applyLocationPinMetadata = () => {
    return this.locationPinController.applyLocationPinMetadata();
  };

  enforceLocationPinConstraints = (object) => {
    return this.locationPinController.enforceLocationPinConstraints(object);
  };

  handleLocationPinPortal = (target) => {
    return this.locationPinController.handleLocationPinPortal(target);
  };

  updateUrl = (tableUUID, historyMode) => {
    const newUrl = buildTableUrl({
      tableUUID,
      isGuestSandbox: this.isGuestSandbox,
    });

    if (historyMode === "push") {
      history.pushState({}, "", newUrl);
    } else {
      history.replaceState({}, "", newUrl);
    }
  };

  teardown = () => {
    this.removeDocumentEventListeners();
    imageFollowingCursor.remove();

    this.resetLocationPinHighlight();

    this.canvasLayer?.destroy?.();
    this.sidebar?.destroy?.();
    this.topLayer?.destroy?.();

    this.currentSelectedObject = null;
    this.canvasLayer = null;
    this.sidebar = null;
    this.hamburger = null;
    this.topLayer = null;
    this.chatBoxComponent = null;
    this.locationPins = [];
    this.locationPinsByObjectId = new Map();
    this.tableView = null;
    this.capabilities = getDefaultTableCapabilities("standard", false);
    this.isGuestSandbox = false;

    this.domComponent.replaceChildren();
  };

  reloadTableByUUID = async (tableUUID, { historyMode = "replace" } = {}) => {
    if (!tableUUID || tableUUID === this.tableId) return;
    if (this.isReloading) return;

    this.isReloading = true;
    this.teardown();
    await this.loadTable(tableUUID, { historyMode });
    this.isReloading = false;
  };

  canvasRenderAll = () => {
    this.canvasLayer.canvas.renderAll();
  };

  can = (capability) => {
    return !!this.capabilities?.[capability];
  };

  setCurrentSelectedObject = (obj) => {
    // canvas obj
    this.currentSelectedObject = obj;

    // update only the object-related toolbar slots
    this.topLayer.updateObjectSelection();
    this.displayLocationPinForObject(obj);
  };

  getCurrentSelectedObject = () => {
    return this.currentSelectedObject;
  };

  displayLocationPinForObject = (object) => {
    return this.locationPinController.displayLocationPinForObject(object);
  };

  removeLocationPinObject = (object) => {
    return this.locationPinController.removeLocationPinObject(object);
  };

  deleteLocationPin = async (object) => {
    return this.locationPinController.deleteLocationPin(object);
  };

  applyLocationPinHighlight = (object) => {
    return this.locationPinController.applyLocationPinHighlight(object);
  };

  resetLocationPinHighlight = () => {
    return this.locationPinController.resetLocationPinHighlight();
  };

  getAttachmentTables = async () => {
    return this.locationPinController.getAttachmentTables();
  };

  createLocationPinMarker = (options) => {
    return this.locationPinController.createLocationPinMarker(options);
  };

  createLocationPin = async () => {
    return this.locationPinController.createLocationPin();
  };

  openLocationPinModal = async (object) => {
    return this.locationPinController.openLocationPinModal(object);
  };

  renderSidebarAndHamburger = () => {
    this.domComponent.append(this.sidebar.domComponent);
    this.sidebar.render();
  };

  changeLayer = () => {
    if (!this.can("canManageLayers")) return;
    switch (this.currentLayer) {
      case "Map":
        this.currentLayer = "Object";
        break;
      case "Object":
        this.currentLayer = "Fog";
        break;
      case "Fog":
        this.currentLayer = "Map";
        break;
    }

    this.canvasLayer.changeLayer();
  };

  addImageToCanvas = (image) => {
    this.canvasLayer.addImageToTable(image);
  };

  setupDocumentEventListeners = () => {
    // KEYS
    const onKeydown = (e) => {
      // alt key change cursor
      if (e.altKey) {
        this.canvasLayer.setCursorCrosshair();
      }

      // duplicate
      if (e.ctrlKey && e.key == "d") {
        this.canvasLayer.duplicateObject();
      }

      // move to top
      if (e.ctrlKey && e.key == "t") {
        if (this.can("canDeleteCanvasObjects")) {
          this.canvasLayer.moveObjectToTop();
        }
      }
    };
    document.addEventListener("keydown", onKeydown);
    this.documentListeners.push({ type: "keydown", handler: onKeydown });

    const onKeyup = (e) => {
      var key = e.key;

      if (key === "Backspace" || key === "Delete") {
        if (this.can("canDeleteCanvasObjects")) {
          this.canvasLayer.removeObjects();
        }
      }
      this.canvasLayer.setCursorDefault();
    };
    document.addEventListener("keyup", onKeyup);
    this.documentListeners.push({ type: "keyup", handler: onKeyup });

    // DOCUMENT MOUSE UP HACKS
    // save data in db after mouse up
    const onMouseupSave = throttle(async () => {
      await this.canvasLayer.saveToDatabase();
    }, 3000);
    document.addEventListener("mouseup", onMouseupSave);
    this.documentListeners.push({ type: "mouseup", handler: onMouseupSave });
    // save data on touch screen up
    const onTouchendSave = throttle(async () => {
      await this.canvasLayer.saveToDatabase();
    }, 3000);
    document.addEventListener("touchend", onTouchendSave);
    this.documentListeners.push({ type: "touchend", handler: onTouchendSave });

    // Allow for drag image to canvas
    const onMouseupDrop = (e) => {
      // handle adding new image
      if (imageFollowingCursor.isOnPage) {
        // Drop succeeds unless mouse is still over the sidebar
        if (!e.target.closest(".sidebar"))
          this.canvasLayer.addImageToTable(
            this.sidebar.tableSidebarImageComponent.currentMouseDownImage,
          );
      }
      imageFollowingCursor.remove();
    };
    document.addEventListener("mouseup", onMouseupDrop);
    this.documentListeners.push({ type: "mouseup", handler: onMouseupDrop });
  };

  removeDocumentEventListeners = () => {
    if (!this.documentListeners.length) return;
    for (const listener of this.documentListeners) {
      document.removeEventListener(listener.type, listener.handler);
    }
    this.documentListeners = [];
  };

  getCanvasObjectIdSet = () => {
    return this.locationPinController.getCanvasObjectIdSet();
  };

  getOrphanedPins = () => {
    return this.locationPinController.getOrphanedPins();
  };

  getPinStatus = (pin) => {
    return this.locationPinController.getPinStatus(pin);
  };

  deleteOrphanedPin = async (pinId) => {
    return this.locationPinController.deleteOrphanedPin(pinId);
  };

  restoreOrphanedPin = async (pin) => {
    return this.locationPinController.restoreOrphanedPin(pin);
  };

  render = async () => {
    this.domComponent.append(
      this.topLayer.domComponent,
      this.chatBoxComponent.domComponent,
      this.canvasElem,
    );
  };
}

const tableApp = new Table();
export default tableApp;
