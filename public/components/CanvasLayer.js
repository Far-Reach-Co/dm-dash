import imageFollowingCursor from "../lib/imageFollowingCursor.js";
import { getPresignedForImageDownload } from "../lib/imageUtils.js";
import socketIntegration from "../lib/socketIntegration.js";

export default class CanvasLayer {
  constructor(props) {
    // setup table views and saved state
    this.tableViews = props.tableViews;
    this.currentTableView = this.tableViews[0];
    this.currentLayer = "Object";

    // table sidebar component
    this.tableSidebarComponent = props.tableSidebarComponent;

    // grid
    this.grid = 50;
    this.unitScale = 10;
    this.canvasWidth = 250 * this.unitScale;
    this.canvasHeight = 250 * this.unitScale;

    // event setup
    this.rightClick = false;
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

    // init canvas
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
    });
    // write new grid if there isn't objects in previous data
    if (!this.currentTableView.data.objects) {
      this.renderGridObjects();
    } else {
      if (!this.currentTableView.data.objects.length) {
        this.renderGridObjects();
      } else {
        // update image links
        const imageSrcList = {};

        for (var object of this.currentTableView.data.objects) {
          // if (object.type === "group") return object;
          if (object.imageId) {
            if (imageSrcList[object.imageId]) {
              object.src = imageSrcList[object.imageId];
            } else {
              const presigned = await getPresignedForImageDownload(
                object.imageId
              );
              if (presigned) {
                object.src = presigned.url;
                imageSrcList[object.imageId] = object.src;
              } else delete this.currentTableView.data.objects[object];
            }
          }
        }
        // render old data
        this.canvas.loadFromJSON(this.currentTableView.data, () => {
          this.canvas.getObjects().forEach((object) => {
            // group layer events
            if (object.type === "group") {
              this.oGridGroup = object;
              object.selectable = false;
              object.evented = false;
              return;
            }
            // set event listeners
            object.on("selected", (options) => {
              this.moveObjectUp(options.target);
            });
            // handle layer events
            if (this.currentLayer === "Map") {
              if (object.layer === "Object") {
                object.opacity = "0.5";
                object.selectable = false;
                object.evented = false;
              } else {
                object.opacity = "1";
                object.selectable = true;
                object.evented = true;
              }
            } else {
              if (object.layer === "Map") {
                object.opacity = "1";
                object.selectable = false;
                object.evented = false;
              } else {
                object.opacity = "1";
                object.selectable = true;
                object.evented = true;
              }
            }
          });
          this.canvas.renderAll();
        });
      }
    }
    this.setupEventListeners();
  };

  setupEventListeners = () => {
    this.canvas.on("object:moving", (options) => {
      // align to grid
      const left = Math.round(options.target.left / this.grid) * this.grid;
      const top = Math.round(options.target.top / this.grid) * this.grid;
      options.target.set({
        left,
        top,
      });

      // if multiple objects calculate special distance
      if (options.target.hasOwnProperty("_objects")) {
        for (var object of options.target._objects) {
          let absoluteLeft =
            object.left + options.target.left + options.target.width / 2;
          let absoluteTop =
            object.top + options.target.top + options.target.height / 2;

          const newObj = Object.create(object); // important not to disturb original object
          newObj.left = absoluteLeft;
          newObj.top = absoluteTop;

          socketIntegration.imageMoved(newObj);
        }
      } else socketIntegration.imageMoved(options.target);
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

    this.canvas.on("mouse:down", (opt) => {
      var evt = opt.e;
      // select multiple with altkey
      if (evt.altKey === true) return;
      // else pan
      if (!opt.target || !opt.target.selectable) {
        this.canvas.isDragging = true;
        this.canvas.selection = false;
        this.canvas.lastPosX = evt.clientX;
        this.canvas.lastPosY = evt.clientY;
      }
    });

    this.canvas.on("mouse:move", (opt) => {
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
    this.canvas.on("mouse:up", (opt) => {
      // on mouse up we want to recalculate new interaction
      // for all objects, so we call setViewportTransform
      this.canvas.setViewportTransform(this.canvas.viewportTransform);
      this.canvas.isDragging = false;
      this.canvas.selection = true;
    });

    // KEYS
    document.addEventListener("keydown", (e) => {
      // alt key change cursor
      if (e.altKey) {
        this.canvas.defaultCursor = "crosshair";
        this.canvas.setCursor("crosshair");
      }
      // move active objects to other layer
      if (e.ctrlKey) {
        console.log("ok ctr");
        const activeObjects = this.canvas.getActiveObjects();
        for (var object of activeObjects) {
          this.moveObjectToOtherLayer(object);
        }
      }
    });
    document.addEventListener("keyup", (e) => {
      var key = e.key;
      // remove selected objects
      if (key === "Backspace" || key === "Delete") {
        if (this.canvas.getActiveObjects().length) {
          this.canvas.getActiveObjects().forEach((object) => {
            this.canvas.remove(object);
            socketIntegration.imageRemoved(object.id);
            this.saveToDatabase();
          });
        }
      }

      // reset cursor to default
      this.canvas.defaultCursor = "grab";
      this.canvas.setCursor("grab");
    });

    // more object event handlers
    this.canvas.on("object:rotating", (options) => {
      socketIntegration.imageMoved(options.target);
    });

    this.canvas.on("object:scaling", (options) => {
      socketIntegration.imageMoved(options.target);
    });

    // DOCUMENT MOUSE UP HACKS
    // save data in db after mouse up
    document.addEventListener(
      "mouseup",
      throttle(async () => {
        await this.saveToDatabase();
      }, 3000)
    );

    document.addEventListener("mouseup", (e) => {
      // handle adding new image
      if (imageFollowingCursor.isOnPage) {
        if (e.target.nodeName === "CANVAS")
          this.addImageToTable(
            this.tableSidebarComponent.currentMouseDownImage
          );
      }
      imageFollowingCursor.remove();

      // remove status of holding multi-select on right click down
      this.rightClick = false;
    });
  };

  addImageToTable = async (image) => {
    const imageSource = await getPresignedForImageDownload(image.id);
    if (imageSource) {
      // create new object
      fabric.Image.fromURL(imageSource.url, (newImg) => {
        // CREATE ************************
        const id = uuidv4();
        newImg.set("id", id);
        newImg.set("imageId", image.id);
        newImg.set("layer", this.currentLayer);

        // HANDLE ************************
        // add to canvas
        if (this.currentLayer === "Map") {
          const gridObjectIndex = this.canvas
            .getObjects()
            .indexOf(this.oGridGroup);
          this.canvas.add(newImg);
          // in center of viewport
          this.canvas.viewportCenterObject(newImg);
          newImg.moveTo(gridObjectIndex);
        } else {
          this.canvas.add(newImg);
          // in center of viewport
          this.canvas.viewportCenterObject(newImg);
        }

        // event listener
        newImg.on("selected", (options) => {
          this.moveObjectUp(options.target);
        });

        // EMIT ***************************
        socketIntegration.imageAdded(newImg);
      });
    }
  };

  moveObjectUp = (object) => {
    if (object.layer === "Map") {
      const gridObjectIndex = this.canvas.getObjects().indexOf(this.oGridGroup);
      object.moveTo(gridObjectIndex - 1);
    } else {
      object.bringToFront();
    }
    socketIntegration.objectMoveUp(object);
  };

  moveObjectToOtherLayer = (object) => {
    if (object.layer === "Map") {
      object.layer = "Object";
      object.bringToFront();
      if (this.currentLayer === "Map") {
        object.opacity = "0.5";
        object.selectable = false;
        object.evented = false;
      } else {
        object.opacity = "1";
        object.selectable = true;
        object.evented = true;
      }
    } else if (object.layer === "Object") {
      object.layer = "Map";
      const gridObjectIndex = this.canvas.getObjects().indexOf(this.oGridGroup);
      object.moveTo(gridObjectIndex);
      if (this.currentLayer === "Map") {
        object.opacity = "1";
        object.selectable = true;
        object.evented = true;
      } else {
        object.opacity = "1";
        object.selectable = false;
        object.evented = false;
      }
    }

    socketIntegration.objectChangeLayer(object);
  };

  saveToDatabase = async () => {
    const jsonCanvas = this.canvas.toJSON();
    try {
      const res = await fetch(
        window.location.origin +
          `/api/edit_table_view/${this.currentTableView.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-access-token": `Bearer ${localStorage.getItem("token")}`,
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

  renderGridObjects = () => {
    // create grid
    const gridLineList = [];

    for (var i = 0; i < this.canvasWidth / this.grid; i++) {
      const lineh = new fabric.Line(
        [i * this.grid, 0, i * this.grid, this.canvasHeight],
        {
          type: "line",
          stroke: "#ccc",
          selectable: false,
        }
      );
      gridLineList.push(lineh);
      const linew = new fabric.Line(
        [0, i * this.grid, this.canvasWidth, i * this.grid],
        {
          type: "line",
          stroke: "#ccc",
          selectable: false,
        }
      );
      gridLineList.push(linew);
    }
    this.oGridGroup = new fabric.Group(gridLineList, {
      left: 0,
      top: 0,
      selectable: false,
      evented: false,
    });
    this.canvas.add(this.oGridGroup);
  };
}

///////// UTILS
const throttle = (fn, wait) => {
  let inThrottle, lastFn, lastTime;
  return function () {
    const context = this,
      args = arguments;
    if (!inThrottle) {
      fn.apply(context, args);
      lastTime = Date.now();
      inThrottle = true;
    } else {
      clearTimeout(lastFn);
      lastFn = setTimeout(function () {
        if (Date.now() - lastTime >= wait) {
          fn.apply(context, args);
          lastTime = Date.now();
        }
      }, Math.max(wait - (Date.now() - lastTime), 0));
    }
  };
};
