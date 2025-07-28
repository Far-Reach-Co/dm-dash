import imageFollowingCursor from "../imageFollowingCursor.js";
import { getPresignedUrlsForImages } from "../../lib/imageUtils.js";
import socketIntegration from "./socketIntegration.js";
import GridManager from "./GridManager.js";

import throttle from "../../lib/throttle.js";
import detectMob from "../../lib/detectMobile.js";

export default class CanvasLayer {
  constructor(props) {
    // setup table views and saved state
    this.currentTableView = props.tableView;
    this.currentLayer = "Object";
    this.snapToGrid = true;
    this.tableView = props.tableView;

    // table sidebar component
    this.tableSidebarImageComponent = props.tableSidebarImageComponent;
    this.tableSidebarImageComponent.addImageToTable = this.addImageToTable;

    // grid
    this.gridManager = null;

    // event setup
    this.rightClick = false;

    this.throttleImageMoved = throttle((obj) => {
      socketIntegration.imageMoved(obj);
    }, 100);
  }

  init = async () => {
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
      // isDrawingMode: true,
      backgroundColor: "black",
      fireRightClick: true, // <-- enable firing of right click events
      fireMiddleClick: true, // <-- enable firing of middle click events
      stopContextMenu: true, // <--  prevent context menu from showing
      defaultCursor: "grab",
      hoverCursor: "pointer",
      freeDrawingCursor: "cell",
    });

    this.gridManager = new GridManager(this.canvas, {
      gridSize: 100,
      unitScale: this.unitScale,
    });

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
    // init event listeners
    this.setupEventListeners();
  };

  setupEventListeners = () => {
    // objects
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
      opt.path.set("layer", this.currentLayer);

      // Remove initial drawing created by canvas
      this.canvas.remove(opt.path);

      // Add the path to the canvas on the correct layer
      switch (this.currentLayer) {
        case "Map":
          this.canvas.add(opt.path);
          // Move the path to the correct z-index (below the grid)
          const gridObjectIndex = this.gridManager.getIndexInCanvas();
          opt.path.moveTo(gridObjectIndex);
          break;

        case "Object":
          this.canvas.add(opt.path);
          // Move the path to the highest index below the fog layer
          const fogObjects = this.canvas
            .getObjects()
            .filter((obj) => obj.layer === "Fog");
          const lowestFogIndex =
            fogObjects.length > 0
              ? this.canvas.getObjects().indexOf(fogObjects[0])
              : this.canvas.getObjects().length;
          opt.path.moveTo(lowestFogIndex);
          break;

        case "Fog":
          this.canvas.add(opt.path);
          // Move the path to the very top (highest layer index)
          opt.path.moveTo(this.canvas.getObjects().length - 1);
          break;
      }

      // Add event listeners
      opt.path.on("selected", (options) => {
        this.moveObjectUp(options.target);
      });

      // Emit through the socket
      socketIntegration.imageAdded(opt.path);
    });

    // KEYS
    document.addEventListener("keydown", (e) => {
      // alt key change cursor
      if (e.altKey) {
        this.canvas.defaultCursor = "crosshair";
        this.canvas.setCursor("crosshair");
      }
      // move active objects to other layer
      // if (e.ctrlKey && e.key == "m") {
      //   // only allow gm to do this
      //   if (USERID == this.tableView.user_id || IS_MANAGER_OR_OWNER) {
      //     const activeObjects = this.canvas.getActiveObjects();
      //     for (var object of activeObjects) {
      //       this.moveObjectToOtherLayer(object);
      //     }
      //   } else return;
      // }
      // duplicate
      if (e.ctrlKey && e.key == "d") {
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

            // add to canvas on correct layer
            switch (object.layer) {
              case "Map":
                this.canvas.add(clone);
                // Move the clone to the correct z-index (below the grid)
                const gridObjectIndex = this.gridManager.getIndexInCanvas();

                clone.moveTo(gridObjectIndex);
                break;

              case "Object":
                this.canvas.add(clone);
                // Move the clone to the highest index below the fog layer
                const fogObjects = this.canvas
                  .getObjects()
                  .filter((obj) => obj.layer === "Fog");
                const lowestFogIndex =
                  fogObjects.length > 0
                    ? this.canvas.getObjects().indexOf(fogObjects[0])
                    : this.canvas.getObjects().length;
                clone.moveTo(lowestFogIndex);
                break;

              case "Fog":
                this.canvas.add(clone);
                // Move the clone to the very top (highest layer index)
                clone.moveTo(this.canvas.getObjects().length - 1);
                break;
            }

            // send to socket
            socketIntegration.imageAdded(clone);
          });
        }
      }
    });
    document.addEventListener("keyup", (e) => {
      var key = e.key;
      // remove selected objects
      if (key === "Backspace" || key === "Delete") {
        this.removeObject();
      }

      // reset cursor to default
      this.canvas.defaultCursor = "grab";
      this.canvas.setCursor("grab");
    });

    // more object event handlers
    this.canvas.on("object:rotating", (options) => {
      this.throttleImageMoved(options.target);
    });

    this.canvas.on("object:scaling", (options) => {
      this.throttleImageMoved(options.target);
    });

    // DOCUMENT MOUSE UP HACKS
    // save data in db after mouse up
    document.addEventListener(
      "mouseup",
      throttle(async () => {
        await this.saveToDatabase();
      }, 3000)
    );
    // save data on touch screen up
    document.addEventListener(
      "touchend",
      throttle(async () => {
        await this.saveToDatabase();
      }, 3000)
    );

    document.addEventListener("mouseup", (e) => {
      // handle adding new image
      if (imageFollowingCursor.isOnPage) {
        if (e.target.nodeName === "CANVAS")
          this.addImageToTable(
            this.tableSidebarImageComponent.currentMouseDownImage
          );
      }
      imageFollowingCursor.remove();

      // remove status of holding multi-select on right click down
      this.rightClick = false;
    });
  };

  addImageToTable = async (image) => {
    if (image.src) {
      fabric.Image.fromURL(image.src, (newImg) => {
        // create new image
        const id = uuidv4();
        newImg.set("id", id);
        newImg.set("imageId", image.id);
        newImg.set("layer", this.currentLayer);

        // add to canvas on correct layer
        this.canvas.add(newImg);
        // Center the new image in the viewport
        this.canvas.viewportCenterObject(newImg);
        // Place image on layer
        this.placeImageOnLayer(newImg);
        this.updateObjectProperties(newImg);

        // add event listeners
        newImg.on("selected", (options) => {
          this.moveObjectUp(options.target);
        });

        // emit through through socket
        socketIntegration.imageAdded(newImg);
      });
    }
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

  removeObject = () => {
    if (this.canvas.getActiveObjects().length) {
      this.canvas.getActiveObjects().forEach((object) => {
        if (object.hasOwnProperty("_objects")) {
          for (var subObj of object._objects) {
            this.canvas.remove(subObj);
            socketIntegration.imageRemoved(subObj.id);
          }
        }
        this.canvas.remove(object);
        socketIntegration.imageRemoved(object.id);
        this.saveToDatabase();
      });
    }
  };

  placeImageOnLayer = (img) => {
    switch (img.layer) {
      case "Map":
        const gridObjectIndex = this.gridManager.getIndexInCanvas();
        img.moveTo(gridObjectIndex);
        break;

      case "Object":
        // Move the new image to the highest index below the fog layer
        const fogObjects = this.canvas
          .getObjects()
          .filter((obj) => obj.layer === "Fog");
        const lowestFogIndex =
          fogObjects.length > 0
            ? this.canvas.getObjects().indexOf(fogObjects[0])
            : this.canvas.getObjects().length;
        img.moveTo(lowestFogIndex);

        break;

      case "Fog":
        // Move the new image to the very top (highest layer index)
        img.moveTo(this.canvas.getObjects().length - 1);

        break;
    }
    console.log(this.canvas.getObjects());
  };

  // Function to update object properties based on current layer
  updateObjectProperties = (object) => {
    if (object.layer === "Map") {
      object.selectable = this.currentLayer === "Map";
      object.evented = this.currentLayer === "Map";
      object.opacity = this.currentLayer === "Fog" ? "0.5" : "1";
    } else if (object.layer === "Object") {
      object.selectable = this.currentLayer === "Object";
      object.evented = this.currentLayer === "Object";
      object.opacity = this.currentLayer !== "Object" ? "0.5" : "1";
    } else if (object.layer === "Fog") {
      object.selectable = this.currentLayer === "Fog";
      object.evented = this.currentLayer === "Fog";
      object.opacity = this.currentLayer !== "Fog" ? "0.5" : "1";
    }
  };

  moveObjectUp = (object) => {
    // Do nothing for now... broken
    return;

    switch (object.layer) {
      case "Map":
        const gridObjectIndex = this.gridManager.getIndexInCanvas();
        object.moveTo(gridObjectIndex - 1);
        break;

      case "Object":
        const objects = this.canvas.getObjects();
        const fogBottomIndex =
          objects.filter((obj) => obj.layer === "Fog").length + 2;
        object.moveTo(fogBottomIndex);
        break;

      case "Fog":
        object.bringToFront();
        break;
    }
    // emit through socket
    socketIntegration.objectMoveUp(object);
  };

  // moveObjectToOtherLayer = (object) => {

  //   if (object.layer === "Map") {
  //     object.layer = "Object";
  //     object.bringToFront();
  //     this.updateObjectProperties(object);
  //   } else if (object.layer === "Object") {
  //     object.layer = "Map";
  //     const gridObjectIndex = this.gridManager.getIndexInCanvas();
  //     object.moveTo(gridObjectIndex);
  //     this.updateObjectProperties(object);
  //   } else if (object.layer === "Fog") {
  //     // Logic to handle moving from Fog layer if necessary
  //   }

  //   // Emit through socket
  //   socketIntegration.objectChangeLayer(object);
  // };

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

          // normal object setup
          object.on("selected", (options) => {
            this.moveObjectUp(options.target);
          });
          this.updateObjectProperties(object);
        });

        this.canvas.renderAll();
        resolve();
      });
    });
  };

  hideGrid = () => {
    this.gridManager.hideGrid();
    socketIntegration.gridChange(false);
  };

  showGrid = () => {
    this.gridManager.showGrid();
    socketIntegration.gridChange(true);
  };
}
