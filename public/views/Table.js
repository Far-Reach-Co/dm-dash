import createElement from "../components/createElement.js";
import { getThings, postThing } from "../lib/apiUtils.js";
import { getPresignedUrlsForImages } from "../lib/imageUtils.js";
import { Hamburger } from "../components/Hamburger.js";
import TableSidebar from "../components/table/TableSidebar.js";
import CanvasLayer from "../components/table/CanvasLayer.js";
import socketIntegration from "../components/table/socketIntegration.js";
import TopLayer from "../components/table/TopLayer.js";
import ChatBoxComponent from "../components/table/ChatBox.js";
import imageFollowingCursor from "../components/imageFollowingCursor.js";
import throttle from "../lib/throttle.js";
import showLocationPinModal from "../components/table/locationPinModal.js";

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
    this.canManagePins = false;
    this.capabilities = this.getDefaultCapabilities("standard", false);
    this.isGuestSandbox = false;
    this.tableView = null;
    this.lastHighlightedPinObject = null;

    // Socket needs to control other components from table
    socketIntegration.tableApp = this;

    this.init();
  }

  getDefaultCapabilities = (mode = "standard", canEdit = false) => {
    if (!canEdit) {
      return {
        mode,
        canManagePins: false,
        canUsePinPortals: false,
        canChangeTable: false,
        canManageLayers: false,
        canManageGrid: false,
        canManageImageAssets: false,
        canManageFolders: false,
        canEditImageMetadata: false,
        canDeleteCanvasObjects: false,
        canManageTableSettings: false,
      };
    }

    if (mode === "sandbox") {
      return {
        mode,
        canManagePins: false,
        canUsePinPortals: false,
        canChangeTable: false,
        canManageLayers: true,
        canManageGrid: true,
        canManageImageAssets: false,
        canManageFolders: false,
        canEditImageMetadata: false,
        canDeleteCanvasObjects: false,
        canManageTableSettings: true,
      };
    }

    return {
      mode,
      canManagePins: true,
      canUsePinPortals: true,
      canChangeTable: true,
      canManageLayers: true,
      canManageGrid: true,
      canManageImageAssets: true,
      canManageFolders: true,
      canEditImageMetadata: true,
      canDeleteCanvasObjects: true,
      canManageTableSettings: true,
    };
  };

  normalizeCapabilities = (tableView) => {
    const mode = tableView?.mode === "sandbox" ? "sandbox" : "standard";
    const isEditorLike =
      String(USERID) === String(tableView?.user_id) || IS_MANAGER_OR_OWNER;
    const fallback = this.getDefaultCapabilities(mode, isEditorLike);
    return {
      ...fallback,
      ...(tableView?.capabilities || {}),
      mode,
    };
  };

  init = async () => {
    const searchParams = new URLSearchParams(window.location.search);
    const tableUUID = searchParams.get("uuid");
    const guestUUID = searchParams.get("guest_uuid");
    const isGuestSandbox = !tableUUID && !!guestUUID;
    await this.loadTable(tableUUID || guestUUID, {
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

    const tableEndpoint = this.isGuestSandbox
      ? `/api/get_guest_sandbox/${this.tableId}`
      : `/api/get_table_view_by_uuid/${this.tableId}`;
    const tableView = await getThings(tableEndpoint);
    if (!tableView) {
      window.location.href = "/forbidden";
      return;
    }
    // TODO: error handling no table view by id

    this.tableView = tableView;
    this.capabilities = this.normalizeCapabilities(tableView);
    this.canManagePins = this.capabilities.canManagePins;

    // Handle user or anonymous
    if (!this.user) {
      let user = await getThings("/api/get_user");
      if (!user) {
        const randomNumber = Math.floor(100000 + Math.random() * 900000); // random six digit number
        user = { username: `user-${randomNumber}` };
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
      tableView,
    });
    this.chatBoxComponent = new ChatBoxComponent({
      domComponent: createElement("div"),
    });

    // Rendering
    this.render();
    await this.canvasLayer.init();
    await this.seedGuestSandboxImagesIfNeeded();
    await this.reloadLocationPins();
    this.setupDocumentEventListeners();
    this.topLayer.render();
    this.chatBoxComponent.render();
    socketIntegration.getMessages();

    // Only render the sidebar for owner or managers
    if (
      USERID == tableView.user_id ||
      IS_MANAGER_OR_OWNER ||
      tableView.is_guest_sandbox
    )
      // USERID and IS_MANAGER_OR_OWNER is injected from template; check vtt.ejs
      this.renderSidebarAndHamburger();
  };

  seedGuestSandboxImagesIfNeeded = async () => {
    if (!this.tableView?.is_guest_sandbox) return;
    const starterImageIds = Array.isArray(this.tableView.starter_image_ids)
      ? this.tableView.starter_image_ids
      : [];
    const existingObjects = Array.isArray(this.tableView?.data?.objects)
      ? this.tableView.data.objects.length
      : 0;
    if (!starterImageIds.length || existingObjects > 0) return;

    const presigned = await getPresignedUrlsForImages(starterImageIds);
    const signedUrls = presigned?.urls || {};
    const columns = 4;
    const spacingX = 180;
    const spacingY = 180;
    const startX = 180;
    const startY = 160;

    for (let i = 0; i < starterImageIds.length; i++) {
      const imageId = starterImageIds[i];
      const src = signedUrls[imageId];
      if (!src) continue;
      const col = i % columns;
      const row = Math.floor(i / columns);
      await this.canvasLayer.addImageToTable(
        { id: imageId, src },
        {
          broadcast: false,
          centerInViewport: false,
          left: startX + col * spacingX,
          top: startY + row * spacingY,
        },
      );
    }

    await this.canvasLayer.saveToDatabase();
    if (this.canvasLayer?.canvas) {
      this.tableView.data = this.canvasLayer.canvas.toJSON();
    }
  };

  loadLocationPins = async (tableViewId) => {
    if (!tableViewId) return;
    this.locationPins = [];
    this.locationPinsByObjectId = new Map();

    const pins = await getThings(`/api/get_location_pins/${tableViewId}`);
    if (!pins?.length) {
      this.applyLocationPinMetadata();
      return;
    }

    const imageIds = [
      ...new Set(
        pins
          .map((pin) => Number(pin.image_id))
          .filter((id) => !Number.isNaN(id) && Boolean(id)),
      ),
    ];

    const signedUrls =
      imageIds.length > 0 ? await getPresignedUrlsForImages(imageIds) : null;
    const urlMap = signedUrls?.urls || {};

    this.locationPins = pins.map((pin) => {
      const imageId = Number(pin.image_id);
      const pinWithSrc = {
        ...pin,
        image_id: Number.isNaN(imageId) ? null : imageId,
        image_src: !Number.isNaN(imageId) ? urlMap[imageId] : null,
      };
      this.locationPinsByObjectId.set(pin.canvas_object_id, pinWithSrc);
      return pinWithSrc;
    });

    this.applyLocationPinMetadata();
    this.displayLocationPinForObject(this.currentSelectedObject);
  };

  reloadLocationPins = async () => {
    if (!this.tableView?.id || this.tableView?.is_guest_sandbox) return;
    await this.loadLocationPins(this.tableView.id);
  };

  applyLocationPinMetadata = () => {
    if (!this.canvasLayer?.canvas) return;
    this.canvasLayer.canvas.getObjects().forEach((object) => {
      const pin = this.locationPinsByObjectId.get(object.id);
      if (pin) {
        object.isLocationPin = true;
        object.pinId = pin.id;
        object.pinInfo = pin;
        if (typeof object.lockInPosition !== "boolean") {
          object.lockInPosition = true;
        }
        this.enforceLocationPinConstraints(object);
        this.canvasLayer.updateObjectProperties(object);
      } else {
        object.isLocationPin = false;
        delete object.pinId;
        delete object.pinInfo;
      }
    });
  };

  enforceLocationPinConstraints = (object) => {
    if (!object) return;
    if (typeof object.lockInPosition !== "boolean") {
      object.lockInPosition = true;
    }
    const isLocked = !!object.lockInPosition;
    object.set({
      hasControls: false,
      hasBorders: true,
      borderColor: "#e74c3c",
      borderScaleFactor: 2.5,
      lockScalingX: true,
      lockScalingY: true,
      lockRotation: true,
      lockMovementX: isLocked,
      lockMovementY: isLocked,
    });
  };

  handleLocationPinPortal = (target) => {
    if (!this.capabilities.canUsePinPortals) return;
    if (!this.capabilities.canChangeTable) return;
    if (!target?.uuid) return;
    socketIntegration.tableChanged(target.uuid);
  };

  updateUrl = (tableUUID, historyMode) => {
    const searchParams = new URLSearchParams(window.location.search);
    if (this.isGuestSandbox) {
      searchParams.delete("uuid");
      searchParams.set("guest_uuid", tableUUID);
    } else {
      searchParams.delete("guest_uuid");
      searchParams.set("uuid", tableUUID);
    }
    const newUrl = window.location.pathname + "?" + searchParams.toString();

    if (historyMode === "push") {
      history.pushState({}, "", newUrl);
    } else {
      history.replaceState({}, "", newUrl);
    }
  };

  teardown = () => {
    this.removeDocumentEventListeners();

    this.resetLocationPinHighlight();

    if (this.canvasLayer?.canvas) {
      this.canvasLayer.canvas.dispose();
    }

    this.currentSelectedObject = null;
    this.canvasLayer = null;
    this.sidebar = null;
    this.hamburger = null;
    this.topLayer = null;
    this.chatBoxComponent = null;
    this.locationPins = [];
    this.locationPinsByObjectId = new Map();
    this.tableView = null;
    this.canManagePins = false;
    this.capabilities = this.getDefaultCapabilities("standard", false);
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
    if (!object) {
      this.resetLocationPinHighlight();
      return;
    }

    const pin = this.locationPinsByObjectId.get(object.id);
    if (!pin) {
      this.resetLocationPinHighlight();
      return;
    }

    this.applyLocationPinHighlight(object);
  };

  removeLocationPinObject = (object) => {
    if (!object || !this.canvasLayer?.canvas) return;
    this.canvasLayer.canvas.remove(object);
    this.canvasLayer.canvas.discardActiveObject();
    this.resetLocationPinHighlight();
    if (this.canvasLayer.canvas.contextContainer) {
      this.canvasLayer.canvas.renderAll();
    }
  };

  deleteLocationPin = async (object) => {
    if (!this.capabilities.canManagePins || !object) return;
    const pin = this.locationPinsByObjectId.get(object.id);
    if (!pin?.id) return;
    const confirmed = window.confirm(
      "Delete this location pin?",
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/remove_location_pin/${pin.id}`, {
        method: "DELETE",
      });
      if (res.status !== 204) throw new Error("delete failed");
      this.removeLocationPinObject(object);
      socketIntegration.imageRemoved(object.id);
      await this.canvasLayer.saveToDatabase();
      this.setCurrentSelectedObject(null);
      await this.reloadLocationPins();
      socketIntegration.locationPinsUpdated();
    } catch (err) {
      console.error(err);
      window.alert("Failed to delete the location pin.");
    }
  };

  applyLocationPinHighlight = (object) => {
    if (
      this.lastHighlightedPinObject &&
      this.lastHighlightedPinObject !== object
    ) {
      this.resetLocationPinHighlight();
    }

    if (!object.pinHighlightBackup) {
      object.pinHighlightBackup = {
        stroke: object.stroke,
        strokeWidth: object.strokeWidth,
        strokeLineJoin: object.strokeLineJoin,
      };
    }

    object.set({
      stroke: "#e74c3c",
      strokeWidth: 4,
      strokeLineJoin: "round",
    });
    this.lastHighlightedPinObject = object;
    if (this.canvasLayer?.canvas && this.canvasLayer.canvas.contextContainer) {
      this.canvasLayer.canvas.renderAll();
    }
  };

  resetLocationPinHighlight = () => {
    if (!this.lastHighlightedPinObject) return;
    const object = this.lastHighlightedPinObject;
    if (object.pinHighlightBackup) {
      object.set({
        stroke: object.pinHighlightBackup.stroke,
        strokeWidth: object.pinHighlightBackup.strokeWidth,
        strokeLineJoin: object.pinHighlightBackup.strokeLineJoin,
      });
      delete object.pinHighlightBackup;
    }
    this.lastHighlightedPinObject = null;
    const canvas = this.canvasLayer?.canvas;
    if (canvas && canvas.contextContainer) {
      canvas.renderAll();
    }
  };

  getAttachmentTables = async () => {
    const searchParams = new URLSearchParams(window.location.search);
    const projectId = searchParams.get("project");
    const endpoint = projectId
      ? `/api/get_table_views_by_project/${projectId}`
      : `/api/get_table_views_by_user`;
    const tables = await getThings(endpoint);
    return (tables || []).filter((table) => table.id !== this.tableView?.id);
  };

  createLocationPinMarker = (options) => {
    return this.canvasLayer?.createLocationPinMarker(options);
  };

  createLocationPin = async () => {
    if (!this.capabilities.canManagePins || !this.tableView) return;
    const object = this.createLocationPinMarker({ broadcast: false, autoSelect: false });
    if (!object) return;

    const response = await postThing("/api/add_location_pin", {
      title: "New Pin",
      description: "",
      portal_table_view_ids: [],
      table_view_id: this.tableView.id,
      canvas_object_id: object.id,
    });

    if (!response) {
      this.removeLocationPinObject(object);
      return;
    }

    object.pinId = response.id;
    await this.reloadLocationPins();
    await this.canvasLayer.saveToDatabase();
    socketIntegration.pinAdded(object);
    socketIntegration.locationPinsUpdated();
    this.canvasLayer.canvas.setActiveObject(object);
    this.canvasLayer.canvas.requestRenderAll();
    this.setCurrentSelectedObject(object);
  };

  openLocationPinModal = async (object) => {
    if (!this.capabilities.canManagePins || !object || !this.tableView) return;
    const attachments = await this.getAttachmentTables();
    const pinData = this.locationPinsByObjectId.get(object.id);
    if (!pinData) return;

    const formValues = await showLocationPinModal({
      pin: pinData,
      attachments,
      templates: [],
    });
    if (!formValues) return;

    const payload = {
      title: formValues.title,
      description: formValues.description,
      portal_table_view_ids: formValues.portal_table_view_ids,
    };
    const response = await postThing(
      `/api/edit_location_pin/${pinData.id}`,
      payload,
    );
    if (!response) return;

    await this.reloadLocationPins();
    await this.canvasLayer.saveToDatabase();
    socketIntegration.locationPinsUpdated();
    this.displayLocationPinForObject(object);
    this.topLayer?.updateObjectSelection();
  };

  renderSidebarAndHamburger = () => {
    this.domComponent.append(this.sidebar.domComponent);
    this.sidebar.render();
  };

  changeLayer = () => {
    if (!this.capabilities.canManageLayers) return;
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
        if (this.capabilities.canDeleteCanvasObjects) {
          this.canvasLayer.moveObjectToTop();
        }
      }
    };
    document.addEventListener("keydown", onKeydown);
    this.documentListeners.push({ type: "keydown", handler: onKeydown });

    const onKeyup = (e) => {
      var key = e.key;

      if (key === "Backspace" || key === "Delete") {
        if (this.capabilities.canDeleteCanvasObjects) {
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
    const ids = new Set();
    if (!this.canvasLayer?.canvas) return ids;
    for (const obj of this.canvasLayer.canvas.getObjects()) {
      if (obj.id) ids.add(obj.id);
    }
    return ids;
  };

  getOrphanedPins = () => {
    const canvasIds = this.getCanvasObjectIdSet();
    return this.locationPins.filter(
      (pin) => pin.canvas_object_id && !canvasIds.has(pin.canvas_object_id),
    );
  };

  getPinStatus = (pin) => {
    const canvasIds = this.getCanvasObjectIdSet();
    return canvasIds.has(pin.canvas_object_id) ? "active" : "orphan";
  };

  deleteOrphanedPin = async (pinId) => {
    const res = await fetch(`/api/remove_location_pin/${pinId}`, {
      method: "DELETE",
    });
    if (res.status !== 204) throw new Error("delete failed");
    await this.reloadLocationPins();
    socketIntegration.locationPinsUpdated();
  };

  restoreOrphanedPin = async (pin) => {
    const marker = this.canvasLayer.createLocationPinMarker({ broadcast: false, autoSelect: false });
    if (!marker) return;
    marker.pinId = pin.id;
    marker.isLocationPin = true;

    const res = await postThing(`/api/edit_location_pin/${pin.id}`, {
      title: pin.title,
      description: pin.description,
      portal_table_view_ids: (pin.attachments || []).map((a) => a.id),
      canvas_object_id: marker.id,
    });
    if (!res) return;

    await this.reloadLocationPins();
    await this.canvasLayer.saveToDatabase();
    socketIntegration.pinAdded(marker);
    socketIntegration.locationPinsUpdated();
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
