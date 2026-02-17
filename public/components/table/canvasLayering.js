export function placeObjectOnCanvasLayer({ canvas, gridManager, obj }) {
  const all = canvas.getObjects();
  const gridIndex = gridManager.getIndexInCanvas();

  switch (obj.layer) {
    case "Map": {
      obj.moveTo(Math.max(0, gridIndex - 1));
      break;
    }

    case "Object": {
      const topObjectIndex = all.reduce(
        (max, item, i) =>
          i > gridIndex && item !== obj && item.layer === "Object"
            ? Math.max(max, i)
            : max,
        -1,
      );

      if (topObjectIndex !== -1) {
        obj.moveTo(topObjectIndex + 1);
      } else {
        obj.moveTo(gridIndex + 1);
      }
      break;
    }

    case "Fog": {
      obj.moveTo(all.length - 1);
      break;
    }
  }

  canvas.requestRenderAll();
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
