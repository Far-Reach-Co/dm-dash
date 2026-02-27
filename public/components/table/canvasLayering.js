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
  capabilities,
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
  const canSeeHiddenObjects = !!capabilities?.canDeleteCanvasObjects;
  const isHiddenFromPlayers = !!object.hiddenFromPlayers;
  if (typeof object.lockInPosition !== "boolean") {
    object.lockInPosition = false;
  }
  if (typeof object.hiddenFromPlayers !== "boolean") {
    object.hiddenFromPlayers = false;
  }

  if (isHiddenFromPlayers && !canSeeHiddenObjects) {
    object.visible = false;
    object.selectable = false;
    object.evented = false;
    object.lockMovementX = true;
    object.lockMovementY = true;
    return;
  }

  object.visible = true;

  object.selectable = isActiveLayer;
  object.evented = isActiveLayer;
  object.lockMovementX = !!object.lockInPosition;
  object.lockMovementY = !!object.lockInPosition;

  if (objectLayer === "Map") {
    object.opacity = currentLayer === "Fog" ? "0.5" : "1";
  } else {
    object.opacity = isActiveLayer ? "1" : "0.5";
  }

  if (isHiddenFromPlayers && canSeeHiddenObjects) {
    object.opacity = "0.65";
  }
}
