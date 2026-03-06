import { getPresignedUrlsForImages } from "../../lib/imageUtils.js";
import socketIntegration from "./socketIntegration.js";
import GridManager from "./GridManager.js";
import {
  LOCATION_PIN_PATH,
  configureFabricDefaults,
  createFabricCanvas,
} from "./canvasConfig.js";
import {
  getCanvasImageIds,
  getCanvasObjects,
  hasCanvasObjects,
  hydrateCanvasImageSources,
} from "./canvasDataUtils.js";
import {
  normalizeGridObjectVisuals,
  updateCanvasObjectProperties,
} from "./canvasLayering.js";
import CanvasEngineService from "./canvasEngineService.js";
import LayerStackService from "./layerStackService.js";
import { loadCanvasFromData, saveCanvasState } from "./canvasPersistence.js";
import {
  endCanvasDrag,
  handleMousePan,
  handleMouseWheelZoom,
  handlePinchZoomGesture,
  handleTouchPan,
  startCanvasDrag,
} from "./canvasViewportHandlers.js";

import throttle from "../../lib/throttle.js";
import detectMob from "../../lib/detectMobile.js";

const TEXTBOX_MIN_WIDTH = 180;
const SAVE_DEBOUNCE_MS = 500;

export default class CanvasLayer {
  constructor(props) {
    // setup table views and saved state
    this.tableView = props.tableView;
    this.tableApp = props.tableApp;

    this.gridManager = null;
    this.canvasEngine = null;
    this.layerStack = null;
    this.drawingModeEnabled = false;
    this.drawingTool = "freehand";
    this.shapeDrawing = {
      startX: 0,
      startY: 0,
      activeShape: null,
    };
    this.drawUndoStack = [];
    this.maxDrawUndoDepth = 100;
    this.saveDebounceMs = SAVE_DEBOUNCE_MS;
    this.pendingSaveToDatabase = false;
    this.saveRequestInFlight = null;
    this.saveDebounceTimer = null;

    this.throttleImageMoved = throttle((obj) => {
      socketIntegration.imageMoved(obj);
    }, 100);
  }

  init = async () => {
    this.setupCanvasConfig();

    this.gridManager = new GridManager(this.canvasEngine, {
      gridSize: 100,
    });
    this.layerStack = new LayerStackService({
      canvasEngine: this.canvasEngine,
      gridManager: this.gridManager,
    });

    await this.createNewOrSetupSaved();

    // init event listeners
    this.setupCanvasEventListeners();
  };

  setupCanvasConfig = () => {
    configureFabricDefaults();
    this.canvas = createFabricCanvas("canvas-layer");
    this.canvasEngine = new CanvasEngineService(this.canvas);
  };

  getViewportCenter = () => {
    if (!this.canvasEngine) return { left: 0, top: 0 };
    const width = this.canvasEngine.getWidth();
    const height = this.canvasEngine.getHeight();
    const viewport = this.canvasEngine.getViewportTransform();
    if (!viewport) {
      return { left: width / 2, top: height / 2 };
    }
    const point = this.canvasEngine.createPoint(width / 2, height / 2);
    const inverted = this.canvasEngine.invertTransform(viewport);
    const transformed = this.canvasEngine.transformPoint(point, inverted);
    return { left: transformed.x, top: transformed.y };
  };

  createLocationPinMarker = ({ autoSelect = true } = {}) => {
    const coords = this.getViewportCenter();
    const pin = this.createLocationPinShape({
      left: coords.left,
      top: coords.top,
      layer: this.tableApp.currentLayer,
    });
    this.canvasEngine.addObject(pin);
    this.placeObjectOnLayer(pin);
    if (autoSelect) {
      this.canvasEngine.setActiveObject(pin);
    }
    this.canvasEngine.requestRender();
    this.setupObjectEventListeners(pin);
    return pin;
  };

  createLocationPinShape = (props = {}) => {
    const centerX = props.left ?? this.canvasEngine.getWidth() / 2;
    const centerY = props.top ?? this.canvasEngine.getHeight() / 2;
    const pin = this.canvasEngine.createPath(LOCATION_PIN_PATH, {
      id: props.id ?? uuidv4(),
      left: centerX,
      top: centerY,
      originX: props.originX ?? "center",
      originY: props.originY ?? "center",
      fill: props.fill ?? "rgba(246, 211, 101, 0.95)",
      stroke: props.stroke ?? "#f4c430",
      strokeWidth:
        typeof props.strokeWidth === "number" ? props.strokeWidth : 3,
      scaleX: typeof props.scaleX === "number" ? props.scaleX : 1,
      scaleY: typeof props.scaleY === "number" ? props.scaleY : 1,
      angle: props.angle ?? 0,
      layer: props.layer ?? "Object",
      selectable: true,
      evented: true,
      hasControls: false,
      lockScalingX: true,
      lockScalingY: true,
      lockRotation: true,
      lockInPosition:
        typeof props.lockInPosition === "boolean" ? props.lockInPosition : true,
    });
    pin.isLocationPin = true;
    this.tableApp.enforceLocationPinConstraints(pin);
    return pin;
  };

  createNewOrSetupSaved = async () => {
    if (!hasCanvasObjects(this.tableView)) {
      this.gridManager.renderGrid();
      this.normalizeGridVisuals();
      return;
    }

    const objects = getCanvasObjects(this.tableView);
    const imageIds = getCanvasImageIds(objects);
    const presignedUrls = await getPresignedUrlsForImages(imageIds, {
      tableViewId: this.tableView?.is_guest_sandbox ? null : this.tableView?.id,
      guestUuid: this.tableView?.is_guest_sandbox
        ? this.tableView?.guest_sandbox_id || this.tableView?.id
        : null,
    });
    hydrateCanvasImageSources(objects, presignedUrls);
    await this.renderSavedData();
  };

  setupCanvasEventListeners = () => {
    this.lastTouchTime = 0;

    // Object manipulation
    this.canvasEngine.on("object:moving", this.handleObjectMoving);
    this.canvasEngine.on("object:rotating", this.handleObjectTransform);
    this.canvasEngine.on("object:scaling", this.handleObjectTransform);
    this.canvasEngine.on("object:modified", this.handleObjectModified);

    // Zoom and pan
    this.canvasEngine.on("mouse:wheel", this.handleMouseWheel);
    this.canvasEngine.on("touch:gesture", this.handlePinchZoom);
    this.canvasEngine.on("mouse:down", this.handleMouseDown);
    this.canvasEngine.on("mouse:move", this.handleMouseMove);
    this.canvasEngine.on("mouse:up", this.handleMouseUp);
    this.canvasEngine.on("touch:drag", this.handleTouchDrag);

    // Interactions
    this.canvasEngine.on("mouse:dblclick", this.handleDoubleClick);
    this.canvasEngine.on("path:created", this.handlePathCreated);
    this.canvasEngine.on("selection:created", this.handleSelectionChanged);
    this.canvasEngine.on("selection:updated", this.handleSelectionChanged);
    this.canvasEngine.on("selection:cleared", () => {
      this.tableApp.setCurrentSelectedObject(null);
    });
  };

  destroy = () => {
    if (!this.canvas) return;

    this.canvasEngine.off("object:moving", this.handleObjectMoving);
    this.canvasEngine.off("object:rotating", this.handleObjectTransform);
    this.canvasEngine.off("object:scaling", this.handleObjectTransform);
    this.canvasEngine.off("object:modified", this.handleObjectModified);
    this.canvasEngine.off("mouse:wheel", this.handleMouseWheel);
    this.canvasEngine.off("touch:gesture", this.handlePinchZoom);
    this.canvasEngine.off("mouse:down", this.handleMouseDown);
    this.canvasEngine.off("mouse:move", this.handleMouseMove);
    this.canvasEngine.off("mouse:up", this.handleMouseUp);
    this.canvasEngine.off("touch:drag", this.handleTouchDrag);
    this.canvasEngine.off("mouse:dblclick", this.handleDoubleClick);
    this.canvasEngine.off("path:created", this.handlePathCreated);
    this.canvasEngine.off("selection:created", this.handleSelectionChanged);
    this.canvasEngine.off("selection:updated", this.handleSelectionChanged);
    this.canvasEngine.off("selection:cleared");

    this.canvasEngine.dispose();
    if (this.saveDebounceTimer) {
      clearTimeout(this.saveDebounceTimer);
      this.saveDebounceTimer = null;
    }
    this.pendingSaveToDatabase = false;
    this.saveRequestInFlight = null;
    this.canvas = null;
    this.canvasEngine = null;
    this.gridManager = null;
    this.layerStack = null;
  };

  handleObjectMoving = (options) => {
    if (this.gridManager.isSnapEnabled()) {
      const snapped = this.gridManager.snapPosition({
        left: options.target.left,
        top: options.target.top,
      });
      options.target.set(snapped);
    }

    this.broadcastObjectMovement(options.target);
  };

  handleObjectTransform = (options) => {
    this.throttleImageMoved(options.target);
  };

  handleObjectModified = (options) => {
    if (!options?.target) return;
    this.scheduleSaveToDatabase();
  };

  broadcastObjectMovement = (target) => {
    if (!target._objects) {
      this.throttleImageMoved(target);
      return;
    }

    // For grouped objects, calculate absolute positions
    for (const object of target._objects) {
      const absoluteLeft = object.left + target.left + target.width / 2;
      const absoluteTop = object.top + target.top + target.height / 2;
      const newObj = JSON.parse(JSON.stringify(object));
      newObj.left = absoluteLeft;
      newObj.top = absoluteTop;
      this.throttleImageMoved(newObj);
    }
  };

  handleMouseWheel = (opt) => {
    handleMouseWheelZoom(this.canvasEngine, opt);
    this.notifyZoomChanged();
  };

  handlePinchZoom = (opt) => {
    handlePinchZoomGesture(this.canvasEngine, opt);
    this.notifyZoomChanged();
  };

  handleMouseDown = (opt) => {
    const evt = opt.e;

    // Handle mobile double-tap
    if (detectMob()) {
      this.handleMobileDoubleTap(evt);
    }

    if (evt.altKey) return;
    if (this.drawingModeEnabled) {
      if (this.drawingTool === "text") {
        this.addTextAtPointer(evt);
        return;
      }
      if (this.drawingTool !== "freehand") {
        this.startShapeDrawing(evt);
      }
      return;
    }

    // Begin drag if empty space or unselectable object
    if (!opt.target || !opt.target.selectable) {
      this.startDragging(evt.clientX, evt.clientY);
    }
  };

  handleMobileDoubleTap = (evt) => {
    const now = Date.now();
    if (now - this.lastTouchTime < 300) {
      const pointer = this.canvasEngine.getPointer(evt);
      this.triggerIndicatorAnimation(pointer.x, pointer.y);
      this.lastTouchTime = 0;
    } else {
      this.lastTouchTime = now;
    }
  };

  handleDoubleClick = (e) => {
    const pointer = this.canvasEngine.getPointer(e.e);
    this.triggerIndicatorAnimation(pointer.x, pointer.y);
  };

  triggerIndicatorAnimation = (x, y) => {
    this.runIndicatorAnimation(x, y);
    socketIntegration.indicatorAnimation(x, y);
  };

  startDragging = (x, y) => {
    startCanvasDrag(this.canvasEngine, x, y);
  };

  handleMouseMove = (opt) => {
    if (
      this.drawingModeEnabled &&
      this.drawingTool !== "freehand" &&
      this.shapeDrawing.activeShape
    ) {
      this.updateShapeDrawing(opt.e);
      return;
    }
    if (detectMob() || !this.canvasEngine.isDragging()) return;
    handleMousePan(this.canvasEngine, opt);
  };

  handleTouchDrag = (opt) => {
    if (!detectMob() || !this.canvasEngine.isDragging()) return;
    handleTouchPan(this.canvasEngine, opt);
  };

  handleMouseUp = () => {
    if (
      this.drawingModeEnabled &&
      this.drawingTool !== "freehand" &&
      this.shapeDrawing.activeShape
    ) {
      this.finishShapeDrawing();
      return;
    }
    endCanvasDrag(this.canvasEngine);
  };

  handlePathCreated = (opt) => {
    const path = opt.path;
    path.set("id", uuidv4());
    path.set("layer", this.tableApp.currentLayer);
    path.set("lockInPosition", false);
    path.set("hiddenFromPlayers", false);

    // Re-add to canvas on correct layer
    this.canvasEngine.removeObject(path);
    this.canvasEngine.addObject(path);
    this.placeObjectOnLayer(path);
    this.updateObjectProperties(path);
    this.setupObjectEventListeners(path);
    this.registerDrawUndo(path.id);
    socketIntegration.imageAdded(path);
    this.scheduleSaveToDatabase();
  };

  handleSelectionChanged = (options) => {
    const target = options?.target || null;
    if (!target) {
      this.tableApp.setCurrentSelectedObject(null);
      return;
    }

    if (target.type === "activeSelection" && Array.isArray(target._objects)) {
      if (target._objects.length === 1) {
        this.tableApp.setCurrentSelectedObject(target._objects[0]);
        return;
      }
    }

    this.tableApp.setCurrentSelectedObject(target);
  };

  setupObjectEventListeners = (obj) => {
    this.enforceTextboxVisuals(obj);

    obj.on("selected", (options) => {
      const obj = options.target;

      // display top layer viewport for object
      this.tableApp.setCurrentSelectedObject(obj);
    });

    if (obj.type === "i-text" || obj.type === "textbox" || obj.type === "text") {
      const syncTextChanges = throttle(() => {
        this.enforceTextboxVisuals(obj);
        socketIntegration.imageMoved(obj);
        this.scheduleSaveToDatabase();
      }, 350);

      obj.on("changed", () => {
        syncTextChanges();
      });

      obj.on("editing:exited", () => {
        this.enforceTextboxVisuals(obj);
        socketIntegration.imageMoved(obj);
        this.scheduleSaveToDatabase();
      });
    }
  };

  setCursorCrosshair = () => {
    this.canvasEngine.setDefaultCursor("crosshair");
    this.canvasEngine.setCursor("crosshair");
  };

  getDrawModeCursor = () => {
    if (this.drawingTool === "text") return "text";
    return "crosshair";
  };

  applyCurrentCursor = () => {
    if (this.drawingModeEnabled) {
      const cursor = this.getDrawModeCursor();
      this.canvasEngine.setDefaultCursor(cursor);
      this.canvasEngine.setCursor(cursor);
      if (this.canvas) {
        this.canvas.freeDrawingCursor = cursor;
      }
      return;
    }

    this.canvasEngine.setDefaultCursor("grab");
    this.canvasEngine.setCursor("grab");
    if (this.canvas) {
      this.canvas.freeDrawingCursor = "crosshair";
    }
  };

  setCursorDefault = () => {
    this.applyCurrentCursor();
  };

  isDrawingMode = () => {
    return !!this.drawingModeEnabled;
  };

  setDrawingMode = (enabled) => {
    if (!this.canvas) return;
    const nextEnabled = !!enabled;
    if (!nextEnabled && this.shapeDrawing.activeShape) {
      this.canvasEngine.removeObject(this.shapeDrawing.activeShape);
      this.shapeDrawing.activeShape = null;
      this.canvasEngine.requestRender();
    }
    this.drawingModeEnabled = nextEnabled;
    this.canvas.isDrawingMode = nextEnabled && this.drawingTool === "freehand";
    if (nextEnabled) {
      this.canvas.selection = false;
      this.canvas.skipTargetFind = true;
      this.canvasEngine.discardActiveObject();
      this.canvasEngine.requestRender();
    } else {
      this.canvas.selection = true;
      this.canvas.skipTargetFind = false;
      this.canvasEngine.getObjects().forEach((object) => {
        this.updateObjectProperties(object);
      });
      this.canvasEngine.requestRender();
    }
    this.applyCurrentCursor();
  };

  getDrawingTool = () => {
    return this.drawingTool;
  };

  setDrawingTool = (tool) => {
    const allowedTools = new Set(["freehand", "line", "rect", "ellipse", "text"]);
    if (!allowedTools.has(tool)) return;
    if (this.shapeDrawing.activeShape) {
      this.canvasEngine.removeObject(this.shapeDrawing.activeShape);
      this.shapeDrawing.activeShape = null;
      this.canvasEngine.requestRender();
    }
    this.drawingTool = tool;
    if (this.canvas) {
      this.canvas.isDrawingMode =
        this.drawingModeEnabled && this.drawingTool === "freehand";
    }
    this.applyCurrentCursor();
  };

  getDrawingBrushColor = () => {
    return this.canvas?.freeDrawingBrush?.color || "#ffffff";
  };

  setDrawingBrushColor = (color) => {
    if (!this.canvas?.freeDrawingBrush) return;
    this.canvas.freeDrawingBrush.color = color;
  };

  getDrawingBrushWidth = () => {
    return this.canvas?.freeDrawingBrush?.width || 10;
  };

  setDrawingBrushWidth = (width) => {
    if (!this.canvas?.freeDrawingBrush) return;
    this.canvas.freeDrawingBrush.width = width;
  };

  addTextAtPointer = (evt) => {
    const pointer = this.canvasEngine.getPointer(evt);
    const text = this.canvasEngine.createTextbox("Text", {
      id: uuidv4(),
      left: pointer.x,
      top: pointer.y,
      fill: this.getDrawingBrushColor(),
      fontSize: Math.max(12, this.getDrawingBrushWidth() * 3),
      fontFamily: "YoungSerif, serif",
      width: TEXTBOX_MIN_WIDTH,
      backgroundColor: "rgba(24, 32, 41, 0.45)",
      textBackgroundColor: "rgba(24, 32, 41, 0.45)",
      hasControls: true,
      hasBorders: true,
      borderColor: "rgba(222, 199, 174, 0.9)",
      padding: 6,
      layer: this.tableApp.currentLayer,
      lockInPosition: false,
      hiddenFromPlayers: false,
    });

    this.canvasEngine.addObject(text);
    this.placeObjectOnLayer(text);
    this.updateObjectProperties(text);
    this.setupObjectEventListeners(text);
    this.canvasEngine.setActiveObject(text);
    this.canvasEngine.requestRender();
    text.enterEditing?.();
    text.selectAll?.();
    this.registerDrawUndo(text.id);
    socketIntegration.imageAdded(text);
    this.scheduleSaveToDatabase();
  };

  enforceTextboxVisuals = (obj) => {
    if (!obj) return;
    if (obj.type !== "textbox" && obj.type !== "i-text" && obj.type !== "text") return;

    const nextWidth = Math.max(TEXTBOX_MIN_WIDTH, obj.width || TEXTBOX_MIN_WIDTH);
    obj.set({
      width: nextWidth,
      backgroundColor: obj.backgroundColor || "rgba(24, 32, 41, 0.45)",
      textBackgroundColor: obj.textBackgroundColor || "rgba(24, 32, 41, 0.45)",
      hasBorders: true,
      borderColor: obj.borderColor || "rgba(222, 199, 174, 0.9)",
      padding: typeof obj.padding === "number" ? obj.padding : 6,
    });
    obj.setCoords?.();
  };

  startShapeDrawing = (evt) => {
    const pointer = this.canvasEngine.getPointer(evt);
    const color = this.getDrawingBrushColor();
    const strokeWidth = this.getDrawingBrushWidth();

    this.shapeDrawing.startX = pointer.x;
    this.shapeDrawing.startY = pointer.y;

    const commonProps = {
      left: pointer.x,
      top: pointer.y,
      stroke: color,
      strokeWidth,
      fill: "rgba(0,0,0,0)",
      selectable: false,
      evented: false,
      layer: this.tableApp.currentLayer,
      lockInPosition: false,
      hiddenFromPlayers: false,
    };

    let shape = null;
    if (this.drawingTool === "line") {
      shape = this.canvasEngine.createLine(
        [pointer.x, pointer.y, pointer.x, pointer.y],
        commonProps,
      );
    } else if (this.drawingTool === "rect") {
      shape = this.canvasEngine.createRect({
        ...commonProps,
        width: 0,
        height: 0,
      });
    } else if (this.drawingTool === "ellipse") {
      shape = this.canvasEngine.createEllipse({
        ...commonProps,
        rx: 0,
        ry: 0,
        originX: "center",
        originY: "center",
      });
    }

    if (!shape) return;
    this.shapeDrawing.activeShape = shape;
    this.canvasEngine.addObject(shape);
    this.canvasEngine.requestRender();
  };

  updateShapeDrawing = (evt) => {
    const shape = this.shapeDrawing.activeShape;
    if (!shape) return;

    const pointer = this.canvasEngine.getPointer(evt);
    const startX = this.shapeDrawing.startX;
    const startY = this.shapeDrawing.startY;

    if (this.drawingTool === "line") {
      shape.set({ x2: pointer.x, y2: pointer.y });
    } else if (this.drawingTool === "rect") {
      const normalized = this.getNormalizedRectBounds(startX, startY, pointer.x, pointer.y);
      shape.set({
        left: normalized.left,
        top: normalized.top,
        width: normalized.width,
        height: normalized.height,
      });
    } else if (this.drawingTool === "ellipse") {
      const centerX = (startX + pointer.x) / 2;
      const centerY = (startY + pointer.y) / 2;
      shape.set({
        left: centerX,
        top: centerY,
        rx: Math.abs(pointer.x - startX) / 2,
        ry: Math.abs(pointer.y - startY) / 2,
      });
    }

    shape.setCoords();
    this.canvasEngine.requestRender();
  };

  finishShapeDrawing = () => {
    const shape = this.shapeDrawing.activeShape;
    this.shapeDrawing.activeShape = null;
    if (!shape) return;

    const isTinyShape =
      (this.drawingTool === "line" &&
        Math.abs((shape.x2 || 0) - (shape.x1 || 0)) < 1 &&
        Math.abs((shape.y2 || 0) - (shape.y1 || 0)) < 1) ||
      (this.drawingTool === "rect" &&
        (shape.width || 0) < 1 &&
        (shape.height || 0) < 1) ||
      (this.drawingTool === "ellipse" &&
        (shape.rx || 0) < 1 &&
        (shape.ry || 0) < 1);

    if (isTinyShape) {
      this.canvasEngine.removeObject(shape);
      this.canvasEngine.requestRender();
      return;
    }

    shape.set("id", uuidv4());
    shape.set("layer", this.tableApp.currentLayer);
    shape.set("lockInPosition", false);
    shape.set("hiddenFromPlayers", false);
    shape.set("selectable", true);
    shape.set("evented", true);

    this.placeObjectOnLayer(shape);
    this.updateObjectProperties(shape);
    this.setupObjectEventListeners(shape);
    this.registerDrawUndo(shape.id);
    socketIntegration.imageAdded(shape);
    this.canvasEngine.requestRender();
    this.scheduleSaveToDatabase();
  };

  getNormalizedRectBounds = (x1, y1, x2, y2) => {
    return {
      left: Math.min(x1, x2),
      top: Math.min(y1, y2),
      width: Math.abs(x2 - x1),
      height: Math.abs(y2 - y1),
    };
  };

  registerDrawUndo = (objectId) => {
    if (!objectId) return;
    this.drawUndoStack.push(objectId);
    if (this.drawUndoStack.length > this.maxDrawUndoDepth) {
      this.drawUndoStack.shift();
    }
  };

  pruneDrawUndo = (objectId) => {
    if (!objectId) return;
    this.drawUndoStack = this.drawUndoStack.filter((id) => id !== objectId);
  };

  undoLastDraw = async () => {
    if (!this.tableApp?.capabilities?.canDeleteCanvasObjects) return false;

    while (this.drawUndoStack.length) {
      const objectId = this.drawUndoStack.pop();
      const object = this.getObjectById(objectId);
      if (!object || object.isLocationPin) continue;
      this.canvasEngine.removeObject(object);
      socketIntegration.imageRemoved(object.id);
      this.canvasEngine.requestRender();
      await this.saveToDatabase();
      return true;
    }
    return false;
  };

  getObjects = () => {
    return this.canvasEngine?.getObjects?.() || [];
  };

  getObjectById = (id) => {
    return this.getObjects().find((obj) => obj.id === id) || null;
  };

  removeObject = (object) => {
    this.canvasEngine?.removeObject?.(object);
  };

  discardActiveObject = () => {
    this.canvasEngine?.discardActiveObject?.();
  };

  setActiveObject = (object) => {
    this.canvasEngine?.setActiveObject?.(object);
  };

  requestRender = () => {
    this.canvasEngine?.requestRender?.();
  };

  render = () => {
    this.canvasEngine?.render?.();
  };

  hasRenderContext = () => {
    return !!this.canvas?.contextContainer;
  };

  duplicateObject = () => {
    const activeObjects = this.canvasEngine.getActiveObjects();
    for (var object of activeObjects) {
      object.clone((clone) => {
        // new id
        const id = uuidv4();
        clone.set("id", id);
        clone.set("layer", object.layer);
        if (typeof clone.lockInPosition !== "boolean") {
          clone.set("lockInPosition", !!object.lockInPosition);
        }
        if (typeof clone.hiddenFromPlayers !== "boolean") {
          clone.set("hiddenFromPlayers", !!object.hiddenFromPlayers);
        }

        // place close to the original
        if (object.group) {
          let absoluteLeft =
            object.left + object.group.left + object.group.width / 2;
          let absoluteTop =
            object.top + object.group.top + object.group.height / 2;
          clone.set("left", absoluteLeft + 50);
          clone.set("top", absoluteTop + 50);
        } else {
          clone.set("left", object.left + 50);
          clone.set("top", object.top + 50);
        }
        this.canvasEngine.addObject(clone);

        // add to canvas on correct layer
        this.placeObjectOnLayer(clone);
        this.updateObjectProperties(clone);

        // add event listeners
        this.setupObjectEventListeners(clone);

        // send to socket
        socketIntegration.imageAdded(clone);
        this.scheduleSaveToDatabase();
      });
    }
  };

  addImageToTable = async (
    image,
    options = { broadcast: true, centerInViewport: true, left: null, top: null },
  ) => {
    return await new Promise((resolve) => {
      if (!image?.src) {
        console.error(
          "Failed to create new fabric image from URL. SRC URL missing.",
        );
        resolve(null);
        return;
      }

      this.canvasEngine.loadImageFromURL(image.src).then((newImg) => {
        if (!this.canvasEngine) {
          resolve(null);
          return;
        }

        // create new image
        const id = uuidv4();
        newImg.set("id", id);
        newImg.set("imageId", image.id);
        newImg.set("layer", this.tableApp.currentLayer);
        newImg.set("lockInPosition", false);
        newImg.set("hiddenFromPlayers", false);

        // add to canvas on correct layer
        this.canvasEngine.addObject(newImg);
        if (
          typeof options.left === "number" &&
          typeof options.top === "number"
        ) {
          newImg.set({ left: options.left, top: options.top });
        } else if (options.centerInViewport !== false) {
          this.canvasEngine.viewportCenterObject(newImg);
        }
        // Place image on layer
        this.placeObjectOnLayer(newImg);
        this.updateObjectProperties(newImg);
        this.canvasEngine.requestRender();

        // add event listeners
        this.setupObjectEventListeners(newImg);

        // emit through through socket
        if (options.broadcast !== false) {
          socketIntegration.imageAdded(newImg);
        }

        this.scheduleSaveToDatabase();

        resolve(newImg);
      });
    });
  };

  runIndicatorAnimation = (x, y) => {
    const ripple = this.canvasEngine.createCircle({
      left: x,
      top: y,
      originX: "center",
      originY: "center",
      radius: 0,
      fill: "rgba(123, 86, 255, 0.57)",
      selectable: false,
      evented: false,
    });

    this.canvasEngine.addObject(ripple);

    ripple.animate("radius", 150, {
      duration: 500,
      onChange: this.canvasEngine.render,
      onComplete: () => {
        ripple.animate("opacity", 0, {
          duration: 500,
          onChange: this.canvasEngine.render,
          onComplete: () => this.canvasEngine.removeObject(ripple),
        });
      },
    });
  };

  removeObjects = () => {
    if (!this.tableApp?.capabilities?.canDeleteCanvasObjects) return;
    if (this.canvasEngine.getActiveObjects().length) {
      this.canvasEngine.getActiveObjects().forEach((object) => {
        if (object.isLocationPin) return;
        if (object.hasOwnProperty("_objects")) {
          for (var subObj of object._objects) {
            if (subObj.isLocationPin) continue;
            this.canvasEngine.removeObject(subObj);
            this.pruneDrawUndo(subObj.id);
            socketIntegration.imageRemoved(subObj.id);
          }
          return this.saveToDatabase();
        } else {
          this.canvasEngine.removeObject(object);
          this.pruneDrawUndo(object.id);
          socketIntegration.imageRemoved(object.id);
          return this.saveToDatabase();
        }
      });
    }
  };

  moveObjectToTop = () => {
    if (!this.tableApp?.capabilities?.canManageLayers) return;
    if (this.canvasEngine.getActiveObjects().length) {
      this.canvasEngine.getActiveObjects().forEach((object) => {
        // if (object.hasOwnProperty("_objects")) {
        //   for (var subObj of object._objects) {
        //     //
        //   }
        // }
        this.placeObjectOnLayer(object);
        socketIntegration.objectChangeLayer(object.id);
        return this.saveToDatabase();
      });
    }
  };

  centerViewOnObject = (obj) => {
    const canvasCenter = {
      x: this.canvasEngine.getWidth() / 2,
      y: this.canvasEngine.getHeight() / 2,
    };

    const zoom = this.canvasEngine.getZoom();
    const objCenter = obj.getCenterPoint();

    const panX = canvasCenter.x - objCenter.x * zoom;
    const panY = canvasCenter.y - objCenter.y * zoom;

    this.canvasEngine.setViewportTransform([zoom, 0, 0, zoom, panX, panY]);
    this.canvasEngine.render();
  };

  selectObjectById = (id) => {
    this.canvasEngine.getObjects().forEach((obj) => {
      if (id == obj.id) {
        this.canvasEngine.discardActiveObject();
        this.canvasEngine.setActiveObject(obj);
        this.centerViewOnObject(obj);
      }
    });
  };

  getZoomLevel = () => {
    return this.canvasEngine?.getZoom?.() || 1;
  };

  zoomToLevel = (targetZoom) => {
    if (!this.canvasEngine) return;
    const clampedZoom = Math.max(0.25, Math.min(3, targetZoom));
    const center = this.canvasEngine.createPoint(
      this.canvasEngine.getWidth() / 2,
      this.canvasEngine.getHeight() / 2,
    );
    this.canvasEngine.zoomToPoint(center, clampedZoom);
    this.canvasEngine.requestRender();
    this.notifyZoomChanged();
  };

  zoomIn = () => {
    this.zoomToLevel(this.getZoomLevel() * 1.15);
  };

  zoomOut = () => {
    this.zoomToLevel(this.getZoomLevel() / 1.15);
  };

  resetZoom = () => {
    this.zoomToLevel(1);
  };

  notifyZoomChanged = () => {
    document.dispatchEvent(
      new CustomEvent("vtt:zoom-changed", {
        detail: {
          tableId: this.tableApp?.tableId || null,
          zoom: this.getZoomLevel(),
        },
      }),
    );
  };

  // Also can be used to place image at top of layer
  placeObjectOnLayer = (obj) => {
    this.layerStack?.bringToTopOfLayer(obj);
  };

  sendObjectToBottomOfLayer = (obj) => {
    this.layerStack?.sendToBottomOfLayer(obj);
  };

  setObjectLayer = (obj, layer, { position = "top" } = {}) => {
    this.layerStack?.setObjectLayer(obj, layer, { position });
    this.updateObjectProperties(obj);
  };

  reconcileLayerStack = () => {
    this.layerStack?.reconcile();
  };

  validateLayerStack = () => {
    return this.layerStack?.assertInvariants() ?? { ok: true, violations: [] };
  };

  changeLayer = () => {
    this.canvasEngine.getObjects().forEach((object) => {
      this.updateObjectProperties(object);
    });
    this.normalizeGridVisuals();
    this.canvasEngine.render();
  };

  normalizeGridVisuals = () => {
    normalizeGridObjectVisuals(this.gridManager);
  };

  // Function to update object properties based on current layer
  updateObjectProperties = (object) => {
    updateCanvasObjectProperties({
      object,
      gridManager: this.gridManager,
      currentLayer: this.tableApp.currentLayer,
      capabilities: this.tableApp.capabilities,
    });
  };

  saveToDatabase = async () => {
    return this.scheduleSaveToDatabase({ immediate: true });
  };

  scheduleSaveToDatabase = ({ immediate = false } = {}) => {
    this.pendingSaveToDatabase = true;

    if (immediate) {
      if (this.saveDebounceTimer) {
        clearTimeout(this.saveDebounceTimer);
        this.saveDebounceTimer = null;
      }
      return this.flushPendingCanvasSave();
    }

    if (this.saveDebounceTimer) {
      clearTimeout(this.saveDebounceTimer);
    }
    this.saveDebounceTimer = setTimeout(() => {
      this.saveDebounceTimer = null;
      void this.flushPendingCanvasSave();
    }, this.saveDebounceMs);

    return null;
  };

  flushPendingCanvasSave = async () => {
    if (this.saveRequestInFlight) {
      await this.saveRequestInFlight;
      if (this.pendingSaveToDatabase) {
        return this.flushPendingCanvasSave();
      }
      return null;
    }

    if (!this.pendingSaveToDatabase || !this.canvasEngine) {
      if (!this.canvasEngine) {
        this.pendingSaveToDatabase = false;
      }
      return null;
    }

    this.pendingSaveToDatabase = false;
    this.saveRequestInFlight = saveCanvasState(this.canvasEngine, this.tableView);

    let result = null;
    try {
      result = await this.saveRequestInFlight;
    } finally {
      this.saveRequestInFlight = null;
    }

    if (this.pendingSaveToDatabase) {
      return this.flushPendingCanvasSave();
    }

    return result;
  };

  restoreGridFromObject = (gridObject) => {
    if (!this.gridManager) return;

    this.gridManager.gridGroup = gridObject;
    if (!gridObject.visible) {
      this.gridManager.snapToGrid = false;
    }
    this.normalizeGridVisuals();
  };

  renderSavedData = async () => {
    await loadCanvasFromData(this.canvasEngine, this.tableView.data, (object) => {
      if (object.type === "group") {
        this.restoreGridFromObject(object);
        return;
      }

      this.updateObjectProperties(object);
      this.setupObjectEventListeners(object);
    });
    this.layerStack?.reconcile({ render: false });
    this.normalizeGridVisuals();
    this.canvasEngine.render();
  };

  addLocationPinFromSocket = (pinData) => {
    if (!pinData || !pinData.id) return;
    if (this.canvasEngine.getObjects().some((obj) => obj.id === pinData.id)) return;
    const pin = this.createLocationPinShape({
      left: pinData.left,
      top: pinData.top,
      originX: pinData.originX,
      originY: pinData.originY,
      fill: pinData.fill,
      stroke: pinData.stroke,
      strokeWidth: pinData.strokeWidth,
      scaleX: pinData.scaleX,
      scaleY: pinData.scaleY,
      angle: pinData.angle,
      layer: pinData.layer,
      id: pinData.id,
      lockInPosition:
        typeof pinData.lockInPosition === "boolean"
          ? pinData.lockInPosition
          : true,
    });
    this.canvasEngine.addObject(pin);
    this.placeObjectOnLayer(pin);
    this.setupObjectEventListeners(pin);
    this.tableApp.enforceLocationPinConstraints(pin);
    this.canvasEngine.render();
  };

  hideGrid = () => {
    this.gridManager.hideGrid();
    this.normalizeGridVisuals();
  };

  showGrid = () => {
    this.gridManager.showGrid();
    this.normalizeGridVisuals();
  };

  resizeGrid = (gridState) => {
    this.gridManager.rebuildGrid(gridState.width, gridState.height);
    this.layerStack?.reconcile({ render: false });
    this.normalizeGridVisuals();
  };
}
