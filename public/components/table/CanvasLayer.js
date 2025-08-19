import { getPresignedUrlsForImages } from "../../lib/imageUtils.js";
import socketIntegration from "./socketIntegration.js";
import GridManager from "./GridManager.js";

import throttle from "../../lib/throttle.js";
import detectMob from "../../lib/detectMobile.js";

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
              .map((object) => object.imageId)
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
    // objects movement
    this.canvas.on("object:moving", (options) => {
      if (this.gridManager.isSnapEnabled()) {
        const snapped = this.gridManager.snapPosition({
          left: options.target.left,
          top: options.target.top,
        });
        options.target.set(snapped);
      }

      // if multiple objects calculate special distance
      if (options.target.hasOwnProperty("_objects")) {
        for (var object of options.target._objects) {
          let absoluteLeft =
            object.left + options.target.left + options.target.width / 2;
          let absoluteTop =
            object.top + options.target.top + options.target.height / 2;
          const newObj = JSON.parse(JSON.stringify(object)); // important not to disturb original object
          newObj.left = absoluteLeft;
          newObj.top = absoluteTop;
          this.throttleImageMoved(newObj);
        }
      } else this.throttleImageMoved(options.target);
    });

    this.canvas.on("object:rotating", (options) => {
      this.throttleImageMoved(options.target);
    });

    this.canvas.on("object:scaling", (options) => {
      this.throttleImageMoved(options.target);
    });

    // Zoom
    this.canvas.on("mouse:wheel", (opt) => {
      var delta = opt.e.deltaY;
      var zoom = this.canvas.getZoom();
      zoom *= 0.999 ** delta;
      if (zoom > 20) zoom = 20;
      if (zoom < 0.25) zoom = 0.25;
      this.canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
      opt.e.preventDefault();
      opt.e.stopPropagation();
    });

    this.canvas.on("touch:gesture", (opt) => {
      if (opt.e.touches && opt.e.touches.length === 2) {
        this.canvas.isDragging = false;

        const pt = new fabric.Point(opt.self.x, opt.self.y);
        const zoom = this.canvas.getZoom();
        const scale = opt.self.scale;

        // 1. Compute how much the fingers have moved:
        //    When scale < 1 fingers come together (pinch), scale > 1 fingers spread.
        // 2. We want “pinch” (scale < 1) → zoom in, “spread” (scale > 1) → zoom out.
        //    So invert by doing (1 – scale).
        const delta = 1 - scale;

        // 3. Apply a sensitivity factor to slow it down:
        const sensitivity = 0.1; // try 0.2 for even smoother, 1.0 for full effect
        const change = zoom * delta * sensitivity;

        // 4. New zoom is old zoom plus that change:
        let newZoom = zoom + change;

        // 5. Clamp to reasonable bounds:
        newZoom = Math.max(0.2, Math.min(5, newZoom));

        // 6. Zoom the canvas:
        this.canvas.zoomToPoint(pt, newZoom);

        // 7. Prevent the browser from doing its own pinch-zoom:
        opt.e.preventDefault();
        opt.e.stopPropagation();
      }
    });

    let lastTouchTime = 0;

    this.canvas.on("mouse:down", (opt) => {
      const evt = opt.e;

      // Double-tap logic (only on mobile)
      if (detectMob()) {
        const now = Date.now();
        if (now - lastTouchTime < 300) {
          const pointer = this.canvas.getPointer(evt);
          this.runIndicatorAnimation(pointer.x, pointer.y);
          socketIntegration.indicatorAnimation(pointer.x, pointer.y);
          lastTouchTime = 0; // reset
        } else {
          lastTouchTime = now;
        }
      }

      // Pan logic
      if (evt.altKey === true) return; // override default alt-click for panning
      if (this.canvas.isDrawingMode) return;

      // Begin drag if empty space or unselectable object
      if (!opt.target || !opt.target.selectable) {
        this.canvas.isDragging = true;
        this.canvas.selection = false;
        this.canvas.lastPosX = evt.clientX;
        this.canvas.lastPosY = evt.clientY;
      }
    });

    // For double click 'here' indicator animation
    this.canvas.on("mouse:dblclick", (e) => {
      const pointer = this.canvas.getPointer(e.e);

      this.runIndicatorAnimation(pointer.x, pointer.y);
      socketIntegration.indicatorAnimation(pointer.x, pointer.y);
    });

    // normal movement
    this.canvas.on("mouse:move", (opt) => {
      // dont use for mobile
      if (detectMob()) return;

      if (this.canvas.isDragging) {
        var e = opt.e;
        var vpt = this.canvas.viewportTransform;
        vpt[4] += e.clientX - this.canvas.lastPosX;
        vpt[5] += e.clientY - this.canvas.lastPosY;
        this.canvas.requestRenderAll();
        this.canvas.lastPosX = e.clientX;
        this.canvas.lastPosY = e.clientY;
      }
    });
    // for mobile
    this.canvas.on("touch:drag", (opt) => {
      if (!detectMob()) return;

      if (this.canvas.isDragging) {
        const xChange = opt.self.x - this.canvas.lastPosTouchX;
        const yChange = opt.self.y - this.canvas.lastPosTouchY;
        if (
          Math.abs(opt.self.x - this.canvas.lastPosTouchX) <= 50 &&
          Math.abs(opt.self.y - this.canvas.lastPosTouchY) <= 50
        ) {
          var delta = new fabric.Point(xChange, yChange);
          this.canvas.relativePan(delta);
        }

        this.canvas.lastPosTouchX = opt.self.x;
        this.canvas.lastPosTouchY = opt.self.y;
      }
    });
    // on mouse up we want to recalculate new interaction
    // for all objects, so we call setViewportTransform
    this.canvas.on("mouse:up", (opt) => {
      this.canvas.setViewportTransform(this.canvas.viewportTransform);
      this.canvas.isDragging = false;
      this.canvas.selection = true;
    });

    // PATH for drawing
    this.canvas.on("path:created", (opt) => {
      const id = uuidv4();
      opt.path.set("id", id);
      opt.path.set("layer", this.tableApp.currentLayer);

      // Remove initial drawing created by canvas
      this.canvas.remove(opt.path);
      // Re-add
      this.canvas.add(opt.path);
      // Add the path to the canvas on the correct layer
      this.placeObjectOnLayer(opt.path);

      // Add event listeners
      this.setupObjectEventListeners(opt.path);

      // Emit through the socket
      socketIntegration.imageAdded(opt.path);
    });

    // For deselct of an object
    this.canvas.on("selection:cleared", (event) => {
      // clear selected object
      this.tableApp.setCurrentSelectedObject(null);
    });
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
        "Failed to create new fabric image from URL. SRC URL missing."
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
        if (object.hasOwnProperty("_objects")) {
          for (var subObj of object._objects) {
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

  // Also can be used to place image at top of layer
  placeObjectOnLayer = (obj) => {
    const objects = this.canvas.getObjects();

    switch (obj.layer) {
      case "Map": {
        const grid = this.gridManager.gridGroup;
        const gridIndex = this.gridManager.getIndexInCanvas();

        // Step 1: Insert object at gridIndex
        obj.moveTo(gridIndex);

        // Step 2: Reassert grid above
        grid.moveTo(gridIndex + 1);
        break;
      }

      case "Object": {
        const all = this.canvas.getObjects();

        // Find highest "Object" sibling
        const topObjectIndex = all.reduce(
          (max, o, i) => (o !== obj && o.layer === "Object" ? i : max),
          -1
        );

        if (topObjectIndex != -1) {
          const topObject = this.canvas.item(topObjectIndex);
          obj.moveTo(topObjectIndex);

          topObject.moveTo(topObjectIndex - 1);
        } else {
          const gridIndex = this.gridManager.getIndexInCanvas();
          obj.moveTo(gridIndex + 1);
        }

        break;
      }

      case "Fog": {
        obj.moveTo(objects.length);
        break;
      }
    }
  };

  changeLayer = () => {
    this.canvas.getObjects().forEach((object, index) => {
      this.updateObjectProperties(object);
    });
    this.canvas.renderAll();
  };

  // Function to update object properties based on current layer
  updateObjectProperties = (object) => {
    if (object.layer === "Map") {
      object.selectable = this.tableApp.currentLayer === "Map";
      object.evented = this.tableApp.currentLayer === "Map";
      object.opacity = this.tableApp.currentLayer === "Fog" ? "0.5" : "1";
    } else if (object.layer === "Object") {
      object.selectable = this.tableApp.currentLayer === "Object";
      object.evented = this.tableApp.currentLayer === "Object";
      object.opacity = this.tableApp.currentLayer !== "Object" ? "0.5" : "1";
    } else if (object.layer === "Fog") {
      object.selectable = this.tableApp.currentLayer === "Fog";
      object.evented = this.tableApp.currentLayer === "Fog";
      object.opacity = this.tableApp.currentLayer !== "Fog" ? "0.5" : "1";
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
        }
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

  renderSavedData = async () => {
    return new Promise((resolve) => {
      this.canvas.loadFromJSON(this.currentTableView.data, () => {
        this.canvas.getObjects().forEach((object) => {
          if (object.type === "group") {
            // Tell GridManager about the restored grid
            if (this.gridManager) {
              this.gridManager.gridGroup = object;
            }

            // Update snapping based on visibility
            if (!object.visible && this.gridManager) {
              this.gridManager.snapToGrid = false;
            }

            object.selectable = false;
            object.evented = false;
            return;
          }

          // setup properties
          this.updateObjectProperties(object);
          // event listeners
          this.setupObjectEventListeners(object);
        });

        this.canvas.renderAll();
        resolve();
      });
    });
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
