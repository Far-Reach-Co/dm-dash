import createElement from "../lib/salt-lib/createElement.js";
import Component from "../lib/salt-lib/Component.js";
import { apiGet } from "../lib/apiUtils.js";
import { Hamburger } from "../components/Hamburger.js";
import TableSidebar from "../components/table/TableSidebar.js";
import CanvasLayer from "../components/table/CanvasLayer.js";
import socketIntegration from "../components/table/socketIntegration.js";
import TopLayer from "../components/table/TopLayer.js";
import ChatBoxComponent from "../components/table/ChatBox.js";
import imageFollowingCursor from "../components/imageFollowingCursor.js";
import {
  canRenderSidebarForTable,
  normalizeTableCapabilities,
} from "./table/capabilities.js";
import DocumentInteractionController from "./table/documentInteractionController.js";
import GuestPromptController from "./table/guestPromptController.js";
import {
  buildTableUrl,
  createGuestFallbackUser,
  getTableViewEndpoint,
  parseInitialTableRoute,
} from "./table/urlState.js";
import LocationPinController from "./table/locationPinController.js";

class Table extends Component {
  constructor() {
    const appElem = document.getElementById("app");
    if (!appElem) {
      throw new Error("Table requires #app");
    }

    super({
      domElem: appElem,
      autoInit: false,
      autoRender: false,
    });

    this.canvasElem = createElement("canvas", { id: "canvas-layer" });

    this.canvasLayer = null;
    this.sidebar = null;
    this.hamburger = null;
    this.topLayer = null;
    this.chatBoxComponent = null;

    this.currentLayer = "Object";
    this.currentSelectedObject = null;
    this.isReloading = false;
    this.pendingReloadTableUUID = null;
    this.socketListenersReady = false;
    this.locationPins = [];
    this.locationPinsByObjectId = new Map();
    this.capabilities = {};
    this.isGuestSandbox = false;
    this.tableView = null;
    this.lastHighlightedPinObject = null;
    this.locationPinController = new LocationPinController(this);
    this.documentInteractionController = new DocumentInteractionController(this);
    this.guestPromptController = new GuestPromptController(this);
    this.guestWelcomePromptTimer = null;
    this.guestRegisterPromptTimer = null;

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
    const tableViewResult = await apiGet(tableEndpoint);
    if (!tableViewResult.ok || !tableViewResult.data) {
      window.location.href = "/forbidden";
      return;
    }
    const tableView = tableViewResult.data;
    // TODO: error handling no table view by id

    this.tableView = tableView;
    this.capabilities = normalizeTableCapabilities(tableView);

    // Handle user or anonymous
    if (!this.user) {
      const userResult = await apiGet("/api/get_user");
      let user = userResult.ok ? userResult.data : null;
      if (!user) {
        user = createGuestFallbackUser();
      }
      this.user = user;
    }

    this.guestPromptController.schedulePrompts();

    if (!this.socketListenersReady) {
      socketIntegration.setupListeners();
      this.socketListenersReady = true;
    }
    socketIntegration.socketJoined();

    // Init elements
    this.sidebar = new TableSidebar({
      domElem: createElement("div", {}),
      tableView,
      tableApp: this,
    });
    this.hamburger = new Hamburger({
      domElem: createElement("div", {}),
      sidebar: this.sidebar,
    });

    this.canvasLayer = new CanvasLayer({
      tableView,
      tableApp: this,
    });
    this.topLayer = new TopLayer({
      domElem: createElement("div"),
      tableApp: this,
    });
    this.chatBoxComponent = new ChatBoxComponent({
      domElem: createElement("div"),
    });
    this.registerTableSessionCleanup();

    // Rendering
    await this.render();
    await this.canvasLayer.init();
    await this.reloadLocationPins();
    this.documentInteractionController.register();
    await this.topLayer.render();
    await this.chatBoxComponent.render();
    socketIntegration.getMessages();

    // Render sidebar only when backend-granted capabilities require it
    if (this.canRenderSidebar()) await this.renderSidebarAndHamburger();
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
    this.runCleanup();

    this.currentSelectedObject = null;
    this.canvasLayer = null;
    this.sidebar = null;
    this.hamburger = null;
    this.topLayer = null;
    this.chatBoxComponent = null;
    this.locationPins = [];
    this.locationPinsByObjectId = new Map();
    this.tableView = null;
    this.capabilities = {};
    this.isGuestSandbox = false;
    this.pendingReloadTableUUID = null;

    this.clear({ deep: true });
  };

  registerTableSessionCleanup = () => {
    const canvasLayer = this.canvasLayer;
    const sidebar = this.sidebar;
    const topLayer = this.topLayer;
    const chatBoxComponent = this.chatBoxComponent;
    const hamburger = this.hamburger;

    this.onCleanup(() => this.documentInteractionController.clear());
    this.onCleanup(() => imageFollowingCursor.remove());
    this.onCleanup(() => this.resetLocationPinHighlight());
    this.onCleanup(() => canvasLayer?.destroy?.());
    this.onCleanup(() => sidebar?.destroy?.());
    this.onCleanup(() => topLayer?.destroy?.());
    this.onCleanup(() => chatBoxComponent?.destroy?.());
    this.onCleanup(() => hamburger?.destroy?.());
    this.onCleanup(() => this.guestPromptController.clearTimers());
  };

  reloadTableByUUID = async (tableUUID, { historyMode = "replace" } = {}) => {
    if (!tableUUID || tableUUID === this.tableId) return;
    if (this.isReloading) {
      this.pendingReloadTableUUID = tableUUID;
      return;
    }

    this.isReloading = true;
    try {
      await this.canvasLayer?.prepareForTableReset?.();
      this.teardown();
      await this.loadTable(tableUUID, { historyMode });
    } finally {
      this.isReloading = false;
      const queuedUUID = this.pendingReloadTableUUID;
      this.pendingReloadTableUUID = null;
      if (queuedUUID && queuedUUID !== this.tableId) {
        await this.reloadTableByUUID(queuedUUID, { historyMode: "push" });
      }
    }
  };

  canvasRenderAll = () => {
    this.canvasLayer.render();
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

  canRenderSidebar = () => {
    if (!this.sidebar || !this.tableView) return false;
    return canRenderSidebarForTable(this.tableView);
  };

  renderSidebarAndHamburger = async () => {
    if (!this.canRenderSidebar()) return;
    await this.sidebar.render();
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
    const renderItems = [];
    if (this.canRenderSidebar()) renderItems.push(this.sidebar.domElem);
    renderItems.push(this.topLayer.domElem, this.chatBoxComponent.domElem, this.canvasElem);
    return renderItems;
  };
}

const tableApp = new Table();
export default tableApp;
