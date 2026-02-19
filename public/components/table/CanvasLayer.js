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

export default class CanvasLayer {
  constructor(props) {
    // setup table views and saved state
    this.tableView = props.tableView;
    this.tableApp = props.tableApp;

    this.gridManager = null;
    this.canvasEngine = null;
    this.layerStack = null;

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
    this.canvasEngine.on("selection:cleared", () => {
      this.tableApp.setCurrentSelectedObject(null);
    });
  };

  destroy = () => {
    if (!this.canvas) return;

    this.canvasEngine.off("object:moving", this.handleObjectMoving);
    this.canvasEngine.off("object:rotating", this.handleObjectTransform);
    this.canvasEngine.off("object:scaling", this.handleObjectTransform);
    this.canvasEngine.off("mouse:wheel", this.handleMouseWheel);
    this.canvasEngine.off("touch:gesture", this.handlePinchZoom);
    this.canvasEngine.off("mouse:down", this.handleMouseDown);
    this.canvasEngine.off("mouse:move", this.handleMouseMove);
    this.canvasEngine.off("mouse:up", this.handleMouseUp);
    this.canvasEngine.off("touch:drag", this.handleTouchDrag);
    this.canvasEngine.off("mouse:dblclick", this.handleDoubleClick);
    this.canvasEngine.off("path:created", this.handlePathCreated);
    this.canvasEngine.off("selection:cleared");

    this.canvasEngine.dispose();
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
  };

  handlePinchZoom = (opt) => {
    handlePinchZoomGesture(this.canvasEngine, opt);
  };

  handleMouseDown = (opt) => {
    const evt = opt.e;

    // Handle mobile double-tap
    if (detectMob()) {
      this.handleMobileDoubleTap(evt);
    }

    if (evt.altKey || this.canvasEngine.isDrawingMode()) return;

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
    if (detectMob() || !this.canvasEngine.isDragging()) return;
    handleMousePan(this.canvasEngine, opt);
  };

  handleTouchDrag = (opt) => {
    if (!detectMob() || !this.canvasEngine.isDragging()) return;
    handleTouchPan(this.canvasEngine, opt);
  };

  handleMouseUp = () => {
    endCanvasDrag(this.canvasEngine);
  };

  handlePathCreated = (opt) => {
    const path = opt.path;
    path.set("id", uuidv4());
    path.set("layer", this.tableApp.currentLayer);
    path.set("lockInPosition", false);

    // Re-add to canvas on correct layer
    this.canvasEngine.removeObject(path);
    this.canvasEngine.addObject(path);
    this.placeObjectOnLayer(path);
    this.updateObjectProperties(path);
    this.setupObjectEventListeners(path);
    socketIntegration.imageAdded(path);
  };

  setupObjectEventListeners = (obj) => {
    obj.on("selected", (options) => {
      const obj = options.target;

      // display top layer viewport for object
      this.tableApp.setCurrentSelectedObject(obj);
    });
  };

  setCursorCrosshair = () => {
    this.canvasEngine.setDefaultCursor("crosshair");
    this.canvasEngine.setCursor("crosshair");
  };

  setCursorDefault = () => {
    this.canvasEngine.setDefaultCursor("grab");
    this.canvasEngine.setCursor("grab");
  };

  isDrawingMode = () => {
    return this.canvasEngine?.isDrawingMode?.() || false;
  };

  setDrawingMode = (enabled) => {
    if (!this.canvas) return;
    this.canvas.isDrawingMode = !!enabled;
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
            socketIntegration.imageRemoved(subObj.id);
          }
          return this.saveToDatabase();
        } else {
          this.canvasEngine.removeObject(object);
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
    });
  };

  saveToDatabase = async () => {
    return saveCanvasState(this.canvasEngine, this.tableView);
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
