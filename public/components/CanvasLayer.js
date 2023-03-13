import { getPresignedForImageDownload } from "../lib/imageUtils.js";
import socketIntegration from "../lib/socketIntegration.js";

export default class CanvasLayer {
  constructor(props) {
    // setup table views and saved state
    this.tableViews = props.tableViews;
    this.currentTableView = this.tableViews[0];
    // array to save state
    this.savedState = this.currentTableView.data;

    // SETUP layers
    this.BOTTOM_LAYER = 1;
    this.GRID_LAYER = 2;
    this.OBJECT_LAYER = 3;
    this.currentLayer = "Object";
  }

  init = () => {
    // init canvas
    this.canvas = new fabric.Canvas("canvas-layer", {
      containerClass: "canvas-layer",
      height: window.innerHeight,
      width: window.innerWidth,
      preserveObjectStacking: true,
      // isDrawingMode: true,
      backgroundColor: "black",
    });

    // grid variables
    var grid = 50;
    var unitScale = 10;
    var canvasWidth = 250 * unitScale;
    var canvasHeight = 250 * unitScale;

    // create grid
    const gridLineList = [];

    for (var i = 0; i < canvasWidth / grid; i++) {
      const lineh = new fabric.Line([i * grid, 0, i * grid, canvasHeight], {
        type: "line",
        stroke: "#ccc",
        zIndex: this.GRID_LAYER,
        selectable: false,
      });
      gridLineList.push(lineh);
      this.canvas.add(lineh);
      const linew = new fabric.Line([0, i * grid, canvasWidth, i * grid], {
        type: "line",
        stroke: "#ccc",
        zIndex: this.GRID_LAYER,
        selectable: false,
      });
      gridLineList.push(linew);
      this.canvas.add(linew);
    }
    const oGridGroup = new fabric.Group(gridLineList, { left: 0, top: 0 });

    // snap to grid

    this.canvas.on("object:moving", (options) => {
      const left = Math.round(options.target.left / grid) * grid;
      const top = Math.round(options.target.top / grid) * grid;
      options.target.set({
        left,
        top,
      });
      socketIntegration.imageMoved({
        id: options.target.id,
        image: options.target,
      });
      // save state
      this.saveObjectState(options.target);
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
            this.removeObjectState(object);
            this.saveToDatabase();
          });
        }
      }
    });

    // more object event handlers

    this.canvas.on("object:rotating", (options) => {
      socketIntegration.imageMoved({
        id: options.target.id,
        image: options.target,
      });
      // save state
      this.saveObjectState(options.target);
    });

    this.canvas.on("object:scaling", (options) => {
      socketIntegration.imageMoved({
        id: options.target.id,
        image: options.target,
      });
      // save state
      this.saveObjectState(options.target);
    });

    // save data in db after mouse up
    document.addEventListener(
      "mouseup",
      throttle(async (evt) => {
        await this.saveToDatabase();
      }, 3000)
    );

    // re-create objects from db state
    if (Object.entries(this.savedState).length) {
      const arrayOfObjects = Object.values(this.savedState);
      arrayOfObjects.forEach(async (object) => {
        // just for images right now
        const imageSource = await getPresignedForImageDownload(object.imageId);
        if (imageSource) {
          fabric.Image.fromURL(imageSource.url, (img) => {
            // reconstruct new image
            for (const [key, value] of Object.entries(object.object)) {
              img[key] = value;
            }
            img.set({ id: object.id });
            img.zIndex = object.zIndex;
            img.imageId = object.imageId;
            if (this.currentLayer === "Object") {
              if (img.zIndex === this.BOTTOM_LAYER) {
                img.selectable = false;
              } else {
                img.selectable = true;
                img.opacity = 1;
              }
            } else {
              if (img.zIndex === this.OBJECT_LAYER) {
                img.selectable = false;
                img.opacity = 0.5;
              }
            }
            // HANDLE ************************
            // add to canvas
            this.canvas.add(img);
            // event listener
            // img.on("selected", function () {
            //   console.log("selected an image", img);
            // });
            // sort by layers and re-render
            this.canvas._objects.sort((a, b) => (a.zIndex > b.zIndex ? 1 : -1));
            this.canvas.renderAll();
          });
        }
      });
    }
  };

  saveToDatabase = async () => {
    if (Object.entries(this.savedState).length) {
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
            body: JSON.stringify({ data: this.savedState }),
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
    }
  };

  saveObjectState = (object) => {
    if (object.id) {
      this.savedState[object.id] = {
        object,
        id: object.id,
        zIndex: object.zIndex,
      };
      if (object.imageId) {
        this.savedState[object.id].imageId = object.imageId;
      }
    } else console.log("ERROR: Missing object ID");
  };

  removeObjectState = (object) => {
    if (object.id) {
      delete this.savedState[object.id];
    } else console.log("ERROR: Missing object ID");
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
