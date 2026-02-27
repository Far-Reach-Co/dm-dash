export const LOCATION_PIN_PATH =
  "M 0 -28 C -12 -28 -24 -16 -24 -3 C -24 12 -10 36 0 56 C 10 36 24 12 24 -3 C 24 -16 12 -28 0 -28 Z M 0 -12 A 6 6 0 1 0 0 -12.01 Z";

let isFabricConfigured = false;

export function configureFabricDefaults() {
  if (isFabricConfigured) return;

  fabric.Object.prototype.toObject = (function (toObject) {
    return function () {
      return fabric.util.object.extend(toObject.call(this, ...arguments), {
        id: this.id,
        imageId: this.imageId,
        layer: this.layer,
        selectable: this.selectable,
        evented: this.evented,
        lockInPosition: this.lockInPosition,
        hiddenFromPlayers: this.hiddenFromPlayers,
      });
    };
  })(fabric.Object.prototype.toObject);

  fabric.Object.prototype.cornerSize = 20;
  fabric.Object.prototype.transparentCorners = false;
  fabric.Object.prototype.cornerStyle = "circle";

  fabric.Group.prototype.hasControls = false;
  fabric.Group.prototype.lockScalingX = true;
  fabric.Group.prototype.lockScalingY = true;
  fabric.Group.prototype.lockRotation = true;

  isFabricConfigured = true;
}

export function createFabricCanvas(id = "canvas-layer") {
  const canvas = new fabric.Canvas(id, {
    containerClass: "canvas-layer",
    height: window.innerHeight,
    width: window.innerWidth,
    preserveObjectStacking: true,
    isDrawingMode: false,
    backgroundColor: "black",
    fireRightClick: true,
    fireMiddleClick: true,
    stopContextMenu: true,
    defaultCursor: "grab",
    hoverCursor: "pointer",
    freeDrawingCursor: "cell",
  });

  canvas.freeDrawingBrush.color = "#ffffff";
  canvas.freeDrawingBrush.width = 10;
  return canvas;
}
