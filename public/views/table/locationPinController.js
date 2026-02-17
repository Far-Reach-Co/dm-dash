import { getThings, postThing } from "../../lib/apiUtils.js";
import { getPresignedUrlsForImages } from "../../lib/imageUtils.js";
import showLocationPinModal from "../../components/table/locationPinModal.js";
import socketIntegration from "../../components/table/socketIntegration.js";
import { getTablesEndpoint } from "../../components/table/tableApi.js";

export default class LocationPinController {
  constructor(tableApp) {
    this.tableApp = tableApp;
  }

  can = (capability) => {
    return !!this.tableApp?.capabilities?.[capability];
  };

  loadLocationPins = async (tableViewId) => {
    if (!tableViewId) return;
    this.tableApp.locationPins = [];
    this.tableApp.locationPinsByObjectId = new Map();

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

    this.tableApp.locationPins = pins.map((pin) => {
      const imageId = Number(pin.image_id);
      const pinWithSrc = {
        ...pin,
        image_id: Number.isNaN(imageId) ? null : imageId,
        image_src: !Number.isNaN(imageId) ? urlMap[imageId] : null,
      };
      this.tableApp.locationPinsByObjectId.set(pin.canvas_object_id, pinWithSrc);
      return pinWithSrc;
    });

    this.applyLocationPinMetadata();
    this.displayLocationPinForObject(this.tableApp.currentSelectedObject);
  };

  reloadLocationPins = async () => {
    if (!this.tableApp.tableView?.id || this.tableApp.tableView?.is_guest_sandbox) {
      return;
    }
    await this.loadLocationPins(this.tableApp.tableView.id);
  };

  applyLocationPinMetadata = () => {
    if (!this.tableApp.canvasLayer?.canvas) return;
    this.tableApp.canvasLayer.canvas.getObjects().forEach((object) => {
      const pin = this.tableApp.locationPinsByObjectId.get(object.id);
      if (pin) {
        object.isLocationPin = true;
        object.pinId = pin.id;
        object.pinInfo = pin;
        if (typeof object.lockInPosition !== "boolean") {
          object.lockInPosition = true;
        }
        this.enforceLocationPinConstraints(object);
        this.tableApp.canvasLayer.updateObjectProperties(object);
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
    if (!this.can("canUsePinPortals")) return;
    if (!this.can("canChangeTable")) return;
    if (!target?.uuid) return;
    socketIntegration.tableChanged(target.uuid);
  };

  displayLocationPinForObject = (object) => {
    if (!object) {
      this.resetLocationPinHighlight();
      return;
    }

    const pin = this.tableApp.locationPinsByObjectId.get(object.id);
    if (!pin) {
      this.resetLocationPinHighlight();
      return;
    }

    this.applyLocationPinHighlight(object);
  };

  removeLocationPinObject = (object) => {
    if (!object || !this.tableApp.canvasLayer?.canvas) return;
    this.tableApp.canvasLayer.canvas.remove(object);
    this.tableApp.canvasLayer.canvas.discardActiveObject();
    this.resetLocationPinHighlight();
    if (this.tableApp.canvasLayer.canvas.contextContainer) {
      this.tableApp.canvasLayer.canvas.renderAll();
    }
  };

  deleteLocationPin = async (object) => {
    if (!this.can("canManagePins") || !object) return;
    const pin = this.tableApp.locationPinsByObjectId.get(object.id);
    if (!pin?.id) return;
    const confirmed = window.confirm("Delete this location pin?");
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/remove_location_pin/${pin.id}`, {
        method: "DELETE",
      });
      if (res.status !== 204) throw new Error("delete failed");
      this.removeLocationPinObject(object);
      socketIntegration.imageRemoved(object.id);
      await this.tableApp.canvasLayer.saveToDatabase();
      this.tableApp.setCurrentSelectedObject(null);
      await this.reloadLocationPins();
      socketIntegration.locationPinsUpdated();
    } catch (err) {
      console.error(err);
      window.alert("Failed to delete the location pin.");
    }
  };

  applyLocationPinHighlight = (object) => {
    if (
      this.tableApp.lastHighlightedPinObject &&
      this.tableApp.lastHighlightedPinObject !== object
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
    this.tableApp.lastHighlightedPinObject = object;
    if (
      this.tableApp.canvasLayer?.canvas &&
      this.tableApp.canvasLayer.canvas.contextContainer
    ) {
      this.tableApp.canvasLayer.canvas.renderAll();
    }
  };

  resetLocationPinHighlight = () => {
    if (!this.tableApp.lastHighlightedPinObject) return;
    const object = this.tableApp.lastHighlightedPinObject;
    if (object.pinHighlightBackup) {
      object.set({
        stroke: object.pinHighlightBackup.stroke,
        strokeWidth: object.pinHighlightBackup.strokeWidth,
        strokeLineJoin: object.pinHighlightBackup.strokeLineJoin,
      });
      delete object.pinHighlightBackup;
    }
    this.tableApp.lastHighlightedPinObject = null;
    const canvas = this.tableApp.canvasLayer?.canvas;
    if (canvas && canvas.contextContainer) {
      canvas.renderAll();
    }
  };

  getAttachmentTables = async () => {
    const tables = await getThings(getTablesEndpoint());
    return (tables || []).filter((table) => table.id !== this.tableApp.tableView?.id);
  };

  createLocationPinMarker = (options) => {
    return this.tableApp.canvasLayer?.createLocationPinMarker(options);
  };

  createLocationPin = async () => {
    if (!this.can("canManagePins") || !this.tableApp.tableView) {
      return;
    }
    const object = this.createLocationPinMarker({
      autoSelect: false,
    });
    if (!object) return;

    const response = await postThing("/api/add_location_pin", {
      title: "New Pin",
      description: "",
      portal_table_view_ids: [],
      table_view_id: this.tableApp.tableView.id,
      canvas_object_id: object.id,
    });

    if (!response) {
      this.removeLocationPinObject(object);
      return;
    }

    object.pinId = response.id;
    await this.reloadLocationPins();
    await this.tableApp.canvasLayer.saveToDatabase();
    socketIntegration.pinAdded(object);
    socketIntegration.locationPinsUpdated();
    this.tableApp.canvasLayer.canvas.setActiveObject(object);
    this.tableApp.canvasLayer.canvas.requestRenderAll();
    this.tableApp.setCurrentSelectedObject(object);
  };

  openLocationPinModal = async (object) => {
    if (
      !this.can("canManagePins") ||
      !object ||
      !this.tableApp.tableView
    ) {
      return;
    }
    const attachments = await this.getAttachmentTables();
    const pinData = this.tableApp.locationPinsByObjectId.get(object.id);
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
    const response = await postThing(`/api/edit_location_pin/${pinData.id}`, payload);
    if (!response) return;

    await this.reloadLocationPins();
    await this.tableApp.canvasLayer.saveToDatabase();
    socketIntegration.locationPinsUpdated();
    this.displayLocationPinForObject(object);
    this.tableApp.topLayer?.updateObjectSelection();
  };

  getCanvasObjectIdSet = () => {
    const ids = new Set();
    if (!this.tableApp.canvasLayer?.canvas) return ids;
    for (const obj of this.tableApp.canvasLayer.canvas.getObjects()) {
      if (obj.id) ids.add(obj.id);
    }
    return ids;
  };

  getOrphanedPins = () => {
    const canvasIds = this.getCanvasObjectIdSet();
    return this.tableApp.locationPins.filter(
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
    const marker = this.tableApp.canvasLayer.createLocationPinMarker({
      autoSelect: false,
    });
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
    await this.tableApp.canvasLayer.saveToDatabase();
    socketIntegration.pinAdded(marker);
    socketIntegration.locationPinsUpdated();
  };
}
