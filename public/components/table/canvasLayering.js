import LayerStackService from "./layerStackService.js";
import CanvasEngineService from "./canvasEngineService.js";

export function placeObjectOnCanvasLayer({
  canvasEngine,
  canvas,
  gridManager,
  obj,
}) {
  const resolvedEngine = canvasEngine || new CanvasEngineService(canvas);
  const stackService = new LayerStackService({
    canvasEngine: resolvedEngine,
    gridManager,
  });
  stackService.bringToTopOfLayer(obj);
}

export function normalizeGridObjectVisuals(gridManager) {
  const gridObject = gridManager?.getGroup?.();
  if (!gridObject) return;

  gridObject.opacity = 1;
  gridObject.selectable = false;
  gridObject.evented = false;

  if (Array.isArray(gridObject._objects)) {
    gridObject._objects.forEach((line) => {
      line.opacity = 1;
      line.selectable = false;
      line.evented = false;
      if (!line.stroke) {
        line.stroke = "#ccc";
      }
    });
  }
}

export function updateCanvasObjectProperties({
  object,
  gridManager,
  currentLayer,
}) {
  const gridObject = gridManager?.getGroup?.();
  if (gridObject && object === gridObject) {
    object.selectable = false;
    object.evented = false;
    object.opacity = 1;
    return;
  }

  const objectLayer = object.layer;
  const isActiveLayer = objectLayer === currentLayer;
  if (typeof object.lockInPosition !== "boolean") {
    object.lockInPosition = false;
  }

  object.selectable = isActiveLayer;
  object.evented = isActiveLayer;
  object.lockMovementX = !!object.lockInPosition;
  object.lockMovementY = !!object.lockInPosition;

  if (objectLayer === "Map") {
    object.opacity = currentLayer === "Fog" ? "0.5" : "1";
  } else {
    object.opacity = isActiveLayer ? "1" : "0.5";
  }
}
