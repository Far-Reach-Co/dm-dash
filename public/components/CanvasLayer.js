import { getPresignedForImageDownload } from "../lib/imageUtils.js";
import socketIntegration from "../lib/socketIntegration.js";

export default class CanvasLayer {
  constructor(props) {
    // setup table views and saved state
    this.tableViews = props.tableViews;
    this.currentTableView = this.tableViews[0];
    console.log(this.currentTableView);
    this.currentLayer = "Object";

    // grid
    this.grid = 50;
    this.unitScale = 10;
    this.canvasWidth = 250 * this.unitScale;
    this.canvasHeight = 250 * this.unitScale;
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

        await Promise.all(
          this.currentTableView.data.objects.map(async (object) => {
            // if (object.type === "group") return object;
            if (object.imageId) {
              console.log(object.imageId);
              if (imageSrcList[object.imageId]) {
                object.src = imageSrcList[object.imageId];
              } else {
                const presigned = await getPresignedForImageDownload(
                  object.imageId
                );
                object.src = presigned.url;
                imageSrcList[object.imageId] = object.src;
              }
            }
          })
        );
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
    // snap to grid
    this.canvas.on("object:moving", (options) => {
      const left = Math.round(options.target.left / this.grid) * this.grid;
      const top = Math.round(options.target.top / this.grid) * this.grid;
      options.target.set({
        left,
        top,
      });
      socketIntegration.imageMoved(options.target);
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
      if (evt.altKey === true || !opt.target || !opt.target.selectable) {
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

    // remove selected objects
    document.addEventListener("keyup", (e) => {
      var key = e.key;
      if (key === "Backspace" || key === "Delete") {
        if (this.canvas.getActiveObjects().length) {
          this.canvas.getActiveObjects().forEach((object) => {
            this.canvas.remove(object);
            socketIntegration.imageRemoved(object.id);
            this.saveToDatabase();
          });
        }
      }
    });

    // more object event handlers
    this.canvas.on("object:rotating", (options) => {
      socketIntegration.imageMoved(options.target);
    });

    this.canvas.on("object:scaling", (options) => {
      socketIntegration.imageMoved(options.target);
    });

    // save data in db after mouse up
    document.addEventListener(
      "mouseup",
      throttle(async (evt) => {
        await this.saveToDatabase();
      }, 3000)
    );
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
