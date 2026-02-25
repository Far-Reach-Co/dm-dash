import { buildSocketEventHandlers } from "./socketEventHandlers.js";

class SocketIntegration {
  constructor() {
    this.socket = io(window.location.origin);
    this.tableApp = null;
    this._listenersBound = false;
  }

  // Listeners
  setupListeners = () => {
    if (this._listenersBound) return;
    const handlers = buildSocketEventHandlers(this);
    for (const [eventName, handler] of Object.entries(handlers)) {
      this.socket.on(eventName, handler);
    }
    this._listenersBound = true;
  };

  socketJoined = () => {
    this.socket.emit("table-joined", {
      username: this.tableApp.user.username,
      table: `table-${this.tableApp.tableId}`,
    });
  };

  getMessages = () => {
    this.socket.emit("get-messages", {
      table: `table-${this.tableApp.tableId}`,
    });
  };

  newTableMessage = (content) => {
    this.socket.emit("new-message", {
      table: `table-${this.tableApp.tableId}`,
      content,
    });
  };

  tableChanged = (newTableUUID) => {
    if (!this.tableApp?.capabilities?.canChangeTable) return;
    this.socket.emit("table-changed", {
      table: `table-${this.tableApp.tableId}`,
      newTableUUID,
    });
    this.tableApp.reloadTableByUUID(newTableUUID, { historyMode: "push" });
  };

  // GRID
  gridToggle = (gridState) => {
    // Bool
    this.socket.emit("grid-toggled", {
      table: `table-${this.tableApp.tableId}`,
      gridState,
    });
  };

  gridResized = (gridState) => {
    // {width, height}
    this.socket.emit("grid-resized", {
      table: `table-${this.tableApp.tableId}`,
      gridState,
    });
  };

  // OBJECTS
  imageAdded = (image) => {
    this.socket.emit("image-added", {
      table: `table-${this.tableApp.tableId}`,
      image,
    });
  };

  pinAdded = (pinObject) => {
    if (!pinObject) return;
    const pinData = pinObject.toObject([
      "left",
      "top",
      "fill",
      "stroke",
      "strokeWidth",
      "scaleX",
      "scaleY",
      "angle",
      "originX",
      "originY",
      "id",
      "layer",
      "path",
      "lockInPosition",
    ]);
    this.socket.emit("pin-added", {
      table: `table-${this.tableApp.tableId}`,
      pin: pinData,
    });
  };

  imageRemoved = (id) => {
    this.socket.emit("image-removed", {
      table: `table-${this.tableApp.tableId}`,
      id,
    });
  };

  imageMoved = (image) => {
    this.socket.emit("image-moved", {
      table: `table-${this.tableApp.tableId}`,
      image,
    });
  };

  locationPinsUpdated = () => {
    this.socket.emit("location-pins-updated", {
      table: `table-${this.tableApp.tableId}`,
    });
  };

  objectChangeLayer = (id) => {
    this.socket.emit("object-changed-layer", {
      table: `table-${this.tableApp.tableId}`,
      id,
    });
  };

  // ANIMATION
  indicatorAnimation = (x, y) => {
    this.socket.emit("indicator-animation", {
      table: `table-${this.tableApp.tableId}`,
      x,
      y,
    });
  };

  tableModeChanged = (mode) => {
    this.socket.emit("table-mode-changed", {
      table: `table-${this.tableApp.tableId}`,
      mode,
    });
  };
}
const socketIntegration = new SocketIntegration();
export default socketIntegration;
