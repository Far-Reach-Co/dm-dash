export default function canvasLayer() {
  var canvas = new fabric.Canvas("canvas-layer", {
    containerClass: "canvas-layer",
    height: window.innerHeight,
    width: window.innerWidth,
    // isDrawingMode: true,
    backgroundColor: "black",
  });

  var grid = 50;
  var unitScale = 10;
  var canvasWidth = 250 * unitScale;
  var canvasHeight = 250 * unitScale;

  // create grid

  for (var i = 0; i < canvasWidth / grid; i++) {
    canvas.add(
      new fabric.Line([i * grid, 0, i * grid, canvasHeight], {
        type: "line",
        stroke: "#5A5A5A",
        selectable: false,
      })
    );
    canvas.add(
      new fabric.Line([0, i * grid, canvasWidth, i * grid], {
        type: "line",
        stroke: "#5A5A5A",
        selectable: false,
      })
    );
  }

  // snap to grid

  canvas.on("object:moving", function (options) {
    options.target.set({
      left: Math.round(options.target.left / grid) * grid,
      top: Math.round(options.target.top / grid) * grid,
    });
  });

  // Zoom

  canvas.on("mouse:wheel", (opt) => {
    var delta = opt.e.deltaY;
    var zoom = canvas.getZoom();
    zoom *= 0.999 ** delta;
    if (zoom > 20) zoom = 20;
    if (zoom < 0.25) zoom = 0.25;
    canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
    opt.e.preventDefault();
    opt.e.stopPropagation();
  });

  canvas.on("mouse:down", function (opt) {
    var evt = opt.e;
    if (evt.altKey === true) {
      this.isDragging = true;
      this.selection = false;
      this.lastPosX = evt.clientX;
      this.lastPosY = evt.clientY;
    }
  });

  canvas.on("mouse:move", function (opt) {
    if (this.isDragging) {
      var e = opt.e;
      var vpt = this.viewportTransform;
      vpt[4] += e.clientX - this.lastPosX;
      vpt[5] += e.clientY - this.lastPosY;
      this.requestRenderAll();
      this.lastPosX = e.clientX;
      this.lastPosY = e.clientY;
    }
  });
  canvas.on("mouse:up", function (opt) {
    // on mouse up we want to recalculate new interaction
    // for all objects, so we call setViewportTransform
    this.setViewportTransform(this.viewportTransform);
    this.isDragging = false;
    this.selection = true;
  });

  const myImg = fabric.Image.fromURL("/assets/bro.png", function (oImg) {
    canvas.add(oImg);
    oImg.on("selected", function () {
      console.log("selected an image");
    });
  });
}
