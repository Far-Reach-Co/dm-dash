const KNOWN_LAYERS = new Set(["Map", "Object", "Fog"]);

export default class LayerStackService {
  constructor({ canvasEngine, gridManager }) {
    this.canvasEngine = canvasEngine;
    this.gridManager = gridManager;
  }

  setCanvasEngine = (canvasEngine) => {
    this.canvasEngine = canvasEngine;
  };

  setGridManager = (gridManager) => {
    this.gridManager = gridManager;
  };

  normalizeLayer = (layer) => {
    return KNOWN_LAYERS.has(layer) ? layer : "Object";
  };

  getGridObject = () => {
    return this.gridManager?.getGroup?.() ?? null;
  };

  getLayerForObject = (obj) => {
    return this.normalizeLayer(obj?.layer);
  };

  buildContext = (obj) => {
    const all = this.canvasEngine?.getObjects?.() ?? [];
    const withoutObj = all.filter((item) => item !== obj);
    const gridObject = this.getGridObject();
    const gridIndex = withoutObj.indexOf(gridObject);

    const mapIndices = [];
    const objectIndices = [];
    const fogIndices = [];

    withoutObj.forEach((item, index) => {
      switch (this.getLayerForObject(item)) {
        case "Map":
          mapIndices.push(index);
          break;
        case "Object":
          objectIndices.push(index);
          break;
        case "Fog":
          fogIndices.push(index);
          break;
      }
    });

    return {
      withoutObj,
      gridIndex,
      mapIndices,
      objectIndices,
      fogIndices,
    };
  };

  computeBounds = (ctx, layer) => {
    const firstObjectIndex = ctx.objectIndices.length
      ? Math.min(...ctx.objectIndices)
      : ctx.withoutObj.length;
    const firstFogIndex = ctx.fogIndices.length
      ? Math.min(...ctx.fogIndices)
      : ctx.withoutObj.length;
    const lastMapIndex = ctx.mapIndices.length ? Math.max(...ctx.mapIndices) : -1;

    switch (layer) {
      case "Map": {
        const mapMax = ctx.gridIndex !== -1
          ? ctx.gridIndex
          : Math.min(firstObjectIndex, firstFogIndex);
        const mapTop = ctx.mapIndices.length
          ? Math.max(...ctx.mapIndices) + 1
          : mapMax;
        const mapBottom = ctx.mapIndices.length ? Math.min(...ctx.mapIndices) : 0;

        return {
          min: 0,
          max: mapMax,
          top: mapTop,
          bottom: mapBottom,
        };
      }

      case "Object": {
        const objectMin = ctx.gridIndex !== -1 ? ctx.gridIndex + 1 : lastMapIndex + 1;
        const objectMax = firstFogIndex;
        const objectTop = ctx.objectIndices.length
          ? Math.max(...ctx.objectIndices) + 1
          : objectMax;
        const objectBottom = ctx.objectIndices.length
          ? Math.min(...ctx.objectIndices)
          : objectMin;

        return {
          min: objectMin,
          max: objectMax,
          top: objectTop,
          bottom: objectBottom,
        };
      }

      case "Fog": {
        const fogStart = ctx.fogIndices.length
          ? Math.min(...ctx.fogIndices)
          : ctx.withoutObj.length;
        return {
          min: fogStart,
          max: ctx.withoutObj.length,
          top: ctx.withoutObj.length,
          bottom: fogStart,
        };
      }
    }
  };

  clampToBounds = (value, bounds) => {
    const lower = Math.min(bounds.min, bounds.max);
    const upper = Math.max(bounds.min, bounds.max);
    return Math.max(lower, Math.min(value, upper));
  };

  moveObject = (obj, { position = "top", render = true } = {}) => {
    if (!this.canvasEngine || !obj) return;
    const layer = this.getLayerForObject(obj);
    const ctx = this.buildContext(obj);
    const bounds = this.computeBounds(ctx, layer);
    const desired = position === "bottom" ? bounds.bottom : bounds.top;
    const targetIndex = this.clampToBounds(desired, bounds);
    this.canvasEngine.moveObjectTo(obj, targetIndex);
    if (render) {
      this.canvasEngine.requestRender();
    }
  };

  bringToTopOfLayer = (obj, options = {}) => {
    this.moveObject(obj, { ...options, position: "top" });
  };

  sendToBottomOfLayer = (obj, options = {}) => {
    this.moveObject(obj, { ...options, position: "bottom" });
  };

  setObjectLayer = (obj, layer, options = {}) => {
    if (!obj) return;
    obj.set("layer", this.normalizeLayer(layer));
    this.bringToTopOfLayer(obj, options);
  };

  reconcile = ({ render = true } = {}) => {
    if (!this.canvasEngine) return;
    const gridObject = this.getGridObject();
    const allObjects = this.canvasEngine.getObjects();
    const stack = allObjects.filter((obj) => obj !== gridObject);

    const mapObjects = [];
    const objectObjects = [];
    const fogObjects = [];

    stack.forEach((obj) => {
      switch (this.getLayerForObject(obj)) {
        case "Map":
          mapObjects.push(obj);
          break;
        case "Object":
          objectObjects.push(obj);
          break;
        case "Fog":
          fogObjects.push(obj);
          break;
      }
    });

    let index = 0;
    mapObjects.forEach((obj) => this.canvasEngine.moveObjectTo(obj, index++));
    if (gridObject) {
      this.canvasEngine.moveObjectTo(gridObject, index++);
    }
    objectObjects.forEach((obj) => this.canvasEngine.moveObjectTo(obj, index++));
    fogObjects.forEach((obj) => this.canvasEngine.moveObjectTo(obj, index++));

    if (render) {
      this.canvasEngine.requestRender();
    }
  };

  assertInvariants = () => {
    if (!this.canvasEngine) {
      return { ok: true, violations: [] };
    }

    const violations = [];
    const gridObject = this.getGridObject();
    const all = this.canvasEngine.getObjects();
    const gridIndex = all.indexOf(gridObject);

    all.forEach((obj, index) => {
      if (obj === gridObject) return;
      const layer = this.getLayerForObject(obj);

      if (layer === "Map" && gridIndex !== -1 && index >= gridIndex) {
        violations.push({ type: "map-above-grid", id: obj.id, index, gridIndex });
      }
      if (layer === "Object" && gridIndex !== -1 && index <= gridIndex) {
        violations.push({ type: "object-below-grid", id: obj.id, index, gridIndex });
      }
      if (layer === "Fog" && index !== all.length - 1) {
        const hasNonFogAbove = all
          .slice(index + 1)
          .some((item) => item !== gridObject && this.getLayerForObject(item) !== "Fog");
        if (hasNonFogAbove) {
          violations.push({ type: "fog-not-top-band", id: obj.id, index });
        }
      }
    });

    return {
      ok: violations.length === 0,
      violations,
    };
  };
}
