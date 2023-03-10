
export default class CanvasLayer {
  constructor() {
    // SETUP
    this.BOTTOM_LAYER = 1;
    this.GRID_LAYER = 2;
    this.OBJECT_LAYER = 3;
    this.currentLayer = 'Map';

    this.canvas = new fabric.Canvas("canvas-layer", {
      containerClass: "canvas-layer",
      height: window.innerHeight,
      width: window.innerWidth,
      preserveObjectStacking: true,
      // isDrawingMode: true,
      backgroundColor: "black",
    });

    var grid = 50;
    var unitScale = 10;
    var canvasWidth = 250 * unitScale;
    var canvasHeight = 250 * unitScale;
  
    // create grid
    const gridLineList = []
    
    for (var i = 0; i < canvasWidth / grid; i++) {
      const lineh = new fabric.Line([i * grid, 0, i * grid, canvasHeight], {
        type: "line",
        stroke: "#ccc",
        zIndex: this.GRID_LAYER,
        selectable: false,
      })
      gridLineList.push(lineh)
      this.canvas.add(lineh);
      const linew = new fabric.Line([0, i * grid, canvasWidth, i * grid], {
        type: "line",
        stroke: "#ccc",
        zIndex: this.GRID_LAYER,
        selectable: false,
      })
      gridLineList.push(linew)
      this.canvas.add(linew);
    }
    const oGridGroup = new fabric.Group(gridLineList, {left: 0, top: 0});
  
    // snap to grid
  
    this.canvas.on("object:moving", function (options) {
      options.target.set({
        left: Math.round(options.target.left / grid) * grid,
        top: Math.round(options.target.top / grid) * grid,
      });
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
      if (evt.altKey === true || (!opt.target || !opt.target.selectable)) {
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
    document.addEventListener('keyup', (e) => {
      var key = e.key;
      if(key === "Backspace" || key === "Delete") {
        if (this.canvas.getActiveObjects().length) {
          this.canvas.getActiveObjects().forEach(object => {
            this.canvas.remove(object);
          })
        }
      }
    })
  }
}
