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
  placeObjectOnCanvasLayer,
  updateCanvasObjectProperties,
} from "./canvasLayering.js";
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

    this.throttleImageMoved = throttle((obj) => {
      socketIntegration.imageMoved(obj);
    }, 100);
  }

  init = async () => {
    this.setupCanvasConfig();

    this.gridManager = new GridManager(this.canvas, {
      gridSize: 100,
    });

    await this.createNewOrSetupSaved();

    // init event listeners
    this.setupCanvasEventListeners();
  };

  setupCanvasConfig = () => {
    configureFabricDefaults();
    this.canvas = createFabricCanvas("canvas-layer");
  };

  getViewportCenter = () => {
    if (!this.canvas) return { left: 0, top: 0 };
    const width = this.canvas.getWidth();
    const height = this.canvas.getHeight();
    const viewport = this.canvas.viewportTransform;
    if (!viewport) {
      return { left: width / 2, top: height / 2 };
    }
    const point = new fabric.Point(width / 2, height / 2);
    const inverted = fabric.util.invertTransform(viewport);
    const transformed = fabric.util.transformPoint(point, inverted);
    return { left: transformed.x, top: transformed.y };
  };

  createLocationPinMarker = ({ autoSelect = true } = {}) => {
    const coords = this.getViewportCenter();
    const pin = this.createLocationPinShape({
      left: coords.left,
      top: coords.top,
      layer: this.tableApp.currentLayer,
    });
    this.canvas.add(pin);
    this.placeObjectOnLayer(pin);
    if (autoSelect) {
      this.canvas.setActiveObject(pin);
    }
    this.canvas.requestRenderAll();
    this.setupObjectEventListeners(pin);
    return pin;
  };

  createLocationPinShape = (props = {}) => {
    const centerX = props.left ?? this.canvas.getWidth() / 2;
    const centerY = props.top ?? this.canvas.getHeight() / 2;
    const pin = new fabric.Path(LOCATION_PIN_PATH, {
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
    const presignedUrls = await getPresignedUrlsForImages(imageIds);
    hydrateCanvasImageSources(objects, presignedUrls);
    await this.renderSavedData();
  };

  setupCanvasEventListeners = () => {
    this.lastTouchTime = 0;

    // Object manipulation
    this.canvas.on("object:moving", this.handleObjectMoving);
    this.canvas.on("object:rotating", this.handleObjectTransform);
    this.canvas.on("object:scaling", this.handleObjectTransform);

    // Zoom and pan
    this.canvas.on("mouse:wheel", this.handleMouseWheel);
    this.canvas.on("touch:gesture", this.handlePinchZoom);
    this.canvas.on("mouse:down", this.handleMouseDown);
    this.canvas.on("mouse:move", this.handleMouseMove);
    this.canvas.on("mouse:up", this.handleMouseUp);
    this.canvas.on("touch:drag", this.handleTouchDrag);

    // Interactions
    this.canvas.on("mouse:dblclick", this.handleDoubleClick);
    this.canvas.on("path:created", this.handlePathCreated);
    this.canvas.on("selection:cleared", () => {
      this.tableApp.setCurrentSelectedObject(null);
    });
  };

  destroy = () => {
    if (!this.canvas) return;

    this.canvas.off("object:moving", this.handleObjectMoving);
    this.canvas.off("object:rotating", this.handleObjectTransform);
    this.canvas.off("object:scaling", this.handleObjectTransform);
    this.canvas.off("mouse:wheel", this.handleMouseWheel);
    this.canvas.off("touch:gesture", this.handlePinchZoom);
    this.canvas.off("mouse:down", this.handleMouseDown);
    this.canvas.off("mouse:move", this.handleMouseMove);
    this.canvas.off("mouse:up", this.handleMouseUp);
    this.canvas.off("touch:drag", this.handleTouchDrag);
    this.canvas.off("mouse:dblclick", this.handleDoubleClick);
    this.canvas.off("path:created", this.handlePathCreated);
    this.canvas.off("selection:cleared");

    this.canvas.dispose();
    this.canvas = null;
    this.gridManager = null;
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
    handleMouseWheelZoom(this.canvas, opt);
  };

  handlePinchZoom = (opt) => {
    handlePinchZoomGesture(this.canvas, opt);
  };

  handleMouseDown = (opt) => {
    const evt = opt.e;

    // Handle mobile double-tap
    if (detectMob()) {
      this.handleMobileDoubleTap(evt);
    }

    if (evt.altKey || this.canvas.isDrawingMode) return;

    // Begin drag if empty space or unselectable object
    if (!opt.target || !opt.target.selectable) {
      this.startDragging(evt.clientX, evt.clientY);
    }
  };

  handleMobileDoubleTap = (evt) => {
    const now = Date.now();
    if (now - this.lastTouchTime < 300) {
      const pointer = this.canvas.getPointer(evt);
      this.triggerIndicatorAnimation(pointer.x, pointer.y);
      this.lastTouchTime = 0;
    } else {
      this.lastTouchTime = now;
    }
  };

  handleDoubleClick = (e) => {
    const pointer = this.canvas.getPointer(e.e);
    this.triggerIndicatorAnimation(pointer.x, pointer.y);
  };

  triggerIndicatorAnimation = (x, y) => {
    this.runIndicatorAnimation(x, y);
    socketIntegration.indicatorAnimation(x, y);
  };

  startDragging = (x, y) => {
    startCanvasDrag(this.canvas, x, y);
  };

  handleMouseMove = (opt) => {
    if (detectMob() || !this.canvas.isDragging) return;
    handleMousePan(this.canvas, opt);
  };

  handleTouchDrag = (opt) => {
    if (!detectMob() || !this.canvas.isDragging) return;
    handleTouchPan(this.canvas, opt);
  };

  handleMouseUp = () => {
    endCanvasDrag(this.canvas);
  };

  handlePathCreated = (opt) => {
    const path = opt.path;
    path.set("id", uuidv4());
    path.set("layer", this.tableApp.currentLayer);
    path.set("lockInPosition", false);

    // Re-add to canvas on correct layer
    this.canvas.remove(path);
    this.canvas.add(path);
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
    this.canvas.defaultCursor = "crosshair";
    this.canvas.setCursor("crosshair");
  };

  setCursorDefault = () => {
    this.canvas.defaultCursor = "grab";
    this.canvas.setCursor("grab");
  };

  duplicateObject = () => {
    const activeObjects = this.canvas.getActiveObjects();
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
        this.canvas.add(clone);

        // add to canvas on correct layer
        this.placeObjectOnLayer(object);
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

      fabric.Image.fromURL(image.src, (newImg) => {
        // create new image
        const id = uuidv4();
        newImg.set("id", id);
        newImg.set("imageId", image.id);
        newImg.set("layer", this.tableApp.currentLayer);
        newImg.set("lockInPosition", false);

        // add to canvas on correct layer
        this.canvas.add(newImg);
        if (
          typeof options.left === "number" &&
          typeof options.top === "number"
        ) {
          newImg.set({ left: options.left, top: options.top });
        } else if (options.centerInViewport !== false) {
          this.canvas.viewportCenterObject(newImg);
        }
        // Place image on layer
        this.placeObjectOnLayer(newImg);
        this.updateObjectProperties(newImg);
        this.canvas.requestRenderAll();

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
    const ripple = new fabric.Circle({
      left: x,
      top: y,
      originX: "center",
      originY: "center",
      radius: 0,
      fill: "rgba(123, 86, 255, 0.57)",
      selectable: false,
      evented: false,
    });

    this.canvas.add(ripple);

    ripple.animate("radius", 150, {
      duration: 500,
      onChange: this.canvas.renderAll.bind(this.canvas),
      onComplete: () => {
        ripple.animate("opacity", 0, {
          duration: 500,
          onChange: this.canvas.renderAll.bind(this.canvas),
          onComplete: () => this.canvas.remove(ripple),
        });
      },
    });
  };

  removeObjects = () => {
    if (!this.tableApp?.capabilities?.canDeleteCanvasObjects) return;
    if (this.canvas.getActiveObjects().length) {
      this.canvas.getActiveObjects().forEach((object) => {
        if (object.isLocationPin) return;
        if (object.hasOwnProperty("_objects")) {
          for (var subObj of object._objects) {
            if (subObj.isLocationPin) continue;
            this.canvas.remove(subObj);
            socketIntegration.imageRemoved(subObj.id);
          }
          return this.saveToDatabase();
        } else {
          this.canvas.remove(object);
          socketIntegration.imageRemoved(object.id);
          return this.saveToDatabase();
        }
      });
    }
  };

  moveObjectToTop = () => {
    if (!this.tableApp?.capabilities?.canDeleteCanvasObjects) return;
    if (this.canvas.getActiveObjects().length) {
      this.canvas.getActiveObjects().forEach((object) => {
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
      x: this.canvas.getWidth() / 2,
      y: this.canvas.getHeight() / 2,
    };

    const zoom = this.canvas.getZoom();
    const objCenter = obj.getCenterPoint();

    const panX = canvasCenter.x - objCenter.x * zoom;
    const panY = canvasCenter.y - objCenter.y * zoom;

    this.canvas.setViewportTransform([zoom, 0, 0, zoom, panX, panY]);
    this.canvas.renderAll();
  };

  selectObjectById = (id) => {
    this.canvas.getObjects().forEach((obj) => {
      if (id == obj.id) {
        this.canvas.discardActiveObject();
        this.canvas.setActiveObject(obj);
        this.centerViewOnObject(obj);
      }
    });
  };

  // Also can be used to place image at top of layer
  placeObjectOnLayer = (obj) => {
    placeObjectOnCanvasLayer({
      canvas: this.canvas,
      gridManager: this.gridManager,
      obj,
    });
  };

  changeLayer = () => {
    this.canvas.getObjects().forEach((object, index) => {
      this.updateObjectProperties(object);
    });
    this.normalizeGridVisuals();
    this.canvas.renderAll();
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
    return saveCanvasState(this.canvas, this.tableView);
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
    await loadCanvasFromData(this.canvas, this.tableView.data, (object) => {
      if (object.type === "group") {
        this.restoreGridFromObject(object);
        return;
      }

      this.updateObjectProperties(object);
      this.setupObjectEventListeners(object);
    });
    this.normalizeGridVisuals();
    this.canvas.renderAll();
  };

  addLocationPinFromSocket = (pinData) => {
    if (!pinData || !pinData.id) return;
    if (this.canvas.getObjects().some((obj) => obj.id === pinData.id)) return;
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
    this.canvas.add(pin);
    this.placeObjectOnLayer(pin);
    this.setupObjectEventListeners(pin);
    this.tableApp.enforceLocationPinConstraints(pin);
    this.canvas.renderAll();
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
    this.normalizeGridVisuals();
  };
}
