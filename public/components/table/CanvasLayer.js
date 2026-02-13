import { getPresignedUrlsForImages } from "../../lib/imageUtils.js";
import socketIntegration from "./socketIntegration.js";
import GridManager from "./GridManager.js";

import throttle from "../../lib/throttle.js";
import detectMob from "../../lib/detectMobile.js";

const LOCATION_PIN_PATH =
  "M 0 -28 C -12 -28 -24 -16 -24 -3 C -24 12 -10 36 0 56 C 10 36 24 12 24 -3 C 24 -16 12 -28 0 -28 Z M 0 -12 A 6 6 0 1 0 0 -12.01 Z";

export default class CanvasLayer {
  constructor(props) {
    // setup table views and saved state
    this.currentTableView = props.tableView;
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
    //EXTEND THE PROPS FABRIC WILL EXPORT TO JSON
    fabric.Object.prototype.toObject = (function (toObject) {
      return function () {
        return fabric.util.object.extend(toObject.call(this), {
          id: this.id,
          imageId: this.imageId,
          layer: this.layer,
          selectable: this.selectable,
          evented: this.evented,
        });
      };
    })(fabric.Object.prototype.toObject);

    // UPDATE THE CORNER SIZES
    fabric.Object.prototype.cornerSize = 20; // default is 13
    fabric.Object.prototype.transparentCorners = false; // makes corners solid, easier to see
    fabric.Object.prototype.cornerStyle = "circle"; // 'rect' or 'circle'

    // OVERWRITE GROUP TO DISABLE PROPERTIES
    fabric.Group.prototype.hasControls = false;
    fabric.Group.prototype.lockScalingX = true;
    fabric.Group.prototype.lockScalingY = true;
    fabric.Group.prototype.lockRotation = true;

    // init fabric canvas
    this.canvas = new fabric.Canvas("canvas-layer", {
      containerClass: "canvas-layer",
      height: window.innerHeight,
      width: window.innerWidth,
      preserveObjectStacking: true,
      isDrawingMode: false,
      backgroundColor: "black",
      fireRightClick: true, // <-- enable firing of right click events
      fireMiddleClick: true, // <-- enable firing of middle click events
      stopContextMenu: true, // <--  prevent context menu from showing
      defaultCursor: "grab",
      hoverCursor: "pointer",
      freeDrawingCursor: "cell",
    });

    // overwrite the brush color
    this.canvas.freeDrawingBrush.color = "#ffffff";

    // overwrite the brush width
    this.canvas.freeDrawingBrush.width = 10;
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

  createLocationPinMarker = ({ broadcast = true, autoSelect = true } = {}) => {
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
    });
    pin.isLocationPin = true;
    this.tableApp.enforceLocationPinConstraints(pin);
    return pin;
  };

  createNewOrSetupSaved = async () => {
    // write new grid if there isn't objects in previous data
    if (!this.currentTableView.data.objects) {
      this.gridManager.renderGrid();
    } else {
      if (!this.currentTableView.data.objects.length) {
        this.gridManager.renderGrid();
      } else {
        // update image links
        const imageIds = [
          ...new Set(
            this.currentTableView.data.objects
              .filter((object) => Boolean(object.imageId))
              .map((object) => object.imageId),
          ),
        ];
        const presignedUrls = await getPresignedUrlsForImages(imageIds);
        for (let object of this.currentTableView.data.objects) {
          if (object.imageId) {
            if (presignedUrls.urls[object.imageId]) {
              object.src = presignedUrls.urls[object.imageId];
            } else {
              delete this.currentTableView.data.objects[object];
            }
          }
        }
        // render the saved data for the current table view
        await this.renderSavedData();
      }
    }
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
    const delta = opt.e.deltaY;
    const newZoom = this.calculateZoom(this.canvas.getZoom(), delta, 0.25, 20);
    this.canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, newZoom);
    opt.e.preventDefault();
    opt.e.stopPropagation();
  };

  handlePinchZoom = (opt) => {
    if (!opt.e.touches || opt.e.touches.length !== 2) return;

    this.canvas.isDragging = false;
    const pt = new fabric.Point(opt.self.x, opt.self.y);
    const zoom = this.canvas.getZoom();

    // Invert scale: pinch (scale < 1) → zoom in, spread (scale > 1) → zoom out
    const delta = 1 - opt.self.scale;
    const sensitivity = 0.1;
    const newZoom = Math.max(
      0.2,
      Math.min(5, zoom + zoom * delta * sensitivity),
    );

    this.canvas.zoomToPoint(pt, newZoom);
    opt.e.preventDefault();
    opt.e.stopPropagation();
  };

  calculateZoom = (currentZoom, delta, min, max) => {
    let zoom = currentZoom * 0.999 ** delta;
    return Math.max(min, Math.min(max, zoom));
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
    this.canvas.isDragging = true;
    this.canvas.selection = false;
    this.canvas.lastPosX = x;
    this.canvas.lastPosY = y;
  };

  handleMouseMove = (opt) => {
    if (detectMob() || !this.canvas.isDragging) return;

    const e = opt.e;
    const vpt = this.canvas.viewportTransform;
    vpt[4] += e.clientX - this.canvas.lastPosX;
    vpt[5] += e.clientY - this.canvas.lastPosY;
    this.canvas.requestRenderAll();
    this.canvas.lastPosX = e.clientX;
    this.canvas.lastPosY = e.clientY;
  };

  handleTouchDrag = (opt) => {
    if (!detectMob() || !this.canvas.isDragging) return;

    const xChange = opt.self.x - this.canvas.lastPosTouchX;
    const yChange = opt.self.y - this.canvas.lastPosTouchY;

    const isSmallMovement = Math.abs(xChange) <= 50 && Math.abs(yChange) <= 50;
    if (isSmallMovement) {
      this.canvas.relativePan(new fabric.Point(xChange, yChange));
    }

    this.canvas.lastPosTouchX = opt.self.x;
    this.canvas.lastPosTouchY = opt.self.y;
  };

  handleMouseUp = () => {
    this.canvas.setViewportTransform(this.canvas.viewportTransform);
    this.canvas.isDragging = false;
    this.canvas.selection = true;
  };

  handlePathCreated = (opt) => {
    const path = opt.path;
    path.set("id", uuidv4());
    path.set("layer", this.tableApp.currentLayer);

    // Re-add to canvas on correct layer
    this.canvas.remove(path);
    this.canvas.add(path);
    this.placeObjectOnLayer(path);
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

        // add event listeners
        this.setupObjectEventListeners(clone);

        // send to socket
        socketIntegration.imageAdded(clone);
      });
    }
  };

  addImageToTable = async (image) => {
    if (image.src) {
      fabric.Image.fromURL(image.src, (newImg) => {
        // create new image
        const id = uuidv4();
        newImg.set("id", id);
        newImg.set("imageId", image.id);
        newImg.set("layer", this.tableApp.currentLayer);

        // add to canvas on correct layer
        this.canvas.add(newImg);
        // Center the new image in the viewport
        this.canvas.viewportCenterObject(newImg);
        // Place image on layer
        this.placeObjectOnLayer(newImg);
        this.updateObjectProperties(newImg);

        // add event listeners
        this.setupObjectEventListeners(newImg);

        // emit through through socket
        socketIntegration.imageAdded(newImg);
      });
    } else
      console.error(
        "Failed to create new fabric image from URL. SRC URL missing.",
      );
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
    const all = this.canvas.getObjects();
    const gridIndex = this.gridManager.getIndexInCanvas();

    switch (obj.layer) {
      case "Map": {
        // Map objects always live below the grid
        obj.moveTo(Math.max(0, gridIndex - 1));
        break;
      }

      case "Object": {
        // Objects must live ABOVE the grid
        const topObjectIndex = all.reduce(
          (max, o, i) =>
            i > gridIndex && o !== obj && o.layer === "Object"
              ? Math.max(max, i)
              : max,
          -1,
        );

        if (topObjectIndex !== -1) {
          obj.moveTo(topObjectIndex + 1);
        } else {
          obj.moveTo(gridIndex + 1);
        }

        break;
      }

      case "Fog": {
        // Fog is always on top
        obj.moveTo(all.length - 1);
        break;
      }
    }

    this.canvas.requestRenderAll();
  };

  changeLayer = () => {
    this.canvas.getObjects().forEach((object, index) => {
      this.updateObjectProperties(object);
    });
    this.canvas.renderAll();
  };

  // Function to update object properties based on current layer
  updateObjectProperties = (object) => {
    const currentLayer = this.tableApp.currentLayer;
    const objectLayer = object.layer;
    const isActiveLayer = objectLayer === currentLayer;

    object.selectable = isActiveLayer;
    object.evented = isActiveLayer;

    // Map layer is fully visible unless viewing Fog layer
    // Object and Fog layers are dimmed when not active
    if (objectLayer === "Map") {
      object.opacity = currentLayer === "Fog" ? "0.5" : "1";
    } else {
      object.opacity = isActiveLayer ? "1" : "0.5";
    }
  };

  saveToDatabase = async () => {
    const jsonCanvas = this.canvas.toJSON();
    try {
      const res = await fetch(
        `/api/edit_table_view_data/${this.currentTableView.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ data: jsonCanvas }),
        },
      );
      // const data = await res.json();
      // if (res.status === 200 || res.status === 201) {
      //   return data;
      // } else throw new Error();
    } catch (err) {
      // window.alert("Failed to save note...");
      console.log(err);
      return null;
    }
  };

  restoreGridFromObject = (gridObject) => {
    if (!this.gridManager) return;

    this.gridManager.gridGroup = gridObject;
    if (!gridObject.visible) {
      this.gridManager.snapToGrid = false;
    }
    gridObject.selectable = false;
    gridObject.evented = false;
  };

  renderSavedData = async () => {
    return new Promise((resolve) => {
      this.canvas.loadFromJSON(this.currentTableView.data, () => {
        this.canvas.getObjects().forEach((object) => {
          if (object.type === "group") {
            this.restoreGridFromObject(object);
            return;
          }

          this.updateObjectProperties(object);
          this.setupObjectEventListeners(object);
        });

        this.canvas.renderAll();
        resolve();
      });
    });
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
    });
    this.canvas.add(pin);
    this.placeObjectOnLayer(pin);
    this.setupObjectEventListeners(pin);
    this.tableApp.enforceLocationPinConstraints(pin);
    this.canvas.renderAll();
  };

  hideGrid = () => {
    this.gridManager.hideGrid();
  };

  showGrid = () => {
    this.gridManager.showGrid();
  };

  resizeGrid = (gridState) => {
    this.gridManager.rebuildGrid(gridState.width, gridState.height);
  };
}
