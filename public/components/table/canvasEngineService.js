export default class CanvasEngineService {
  constructor(canvas = null) {
    this.canvas = canvas;
  }

  setCanvas = (canvas) => {
    this.canvas = canvas;
  };

  getCanvas = () => {
    return this.canvas;
  };

  // ---------------------------------------------------------------------------
  // Fabric object and utility adapters
  // ---------------------------------------------------------------------------

  createPoint = (x, y) => {
    return new fabric.Point(x, y);
  };

  invertTransform = (transform) => {
    return fabric.util.invertTransform(transform);
  };

  transformPoint = (point, transform) => {
    return fabric.util.transformPoint(point, transform);
  };

  createPath = (path, props = {}) => {
    return new fabric.Path(path, props);
  };

  createCircle = (props = {}) => {
    return new fabric.Circle(props);
  };

  createLine = (points, props = {}) => {
    return new fabric.Line(points, props);
  };

  createGroup = (objects, props = {}) => {
    return new fabric.Group(objects, props);
  };

  loadImageFromURL = (src) => {
    return new Promise((resolve) => {
      fabric.Image.fromURL(src, (image) => resolve(image));
    });
  };

  // ---------------------------------------------------------------------------
  // Canvas adapters
  // ---------------------------------------------------------------------------

  addObject = (object) => {
    this.canvas?.add(object);
  };

  removeObject = (object) => {
    this.canvas?.remove(object);
  };

  moveObjectTo = (object, index) => {
    object?.moveTo(index);
  };

  getObjects = () => {
    return this.canvas?.getObjects?.() || [];
  };

  getActiveObjects = () => {
    return this.canvas?.getActiveObjects?.() || [];
  };

  discardActiveObject = () => {
    this.canvas?.discardActiveObject?.();
  };

  setActiveObject = (object) => {
    this.canvas?.setActiveObject?.(object);
  };

  requestRender = () => {
    this.canvas?.requestRenderAll?.();
  };

  render = () => {
    this.canvas?.renderAll?.();
  };

  getWidth = () => {
    return this.canvas?.getWidth?.() || 0;
  };

  getHeight = () => {
    return this.canvas?.getHeight?.() || 0;
  };

  getZoom = () => {
    return this.canvas?.getZoom?.() || 1;
  };

  getViewportTransform = () => {
    return this.canvas?.viewportTransform || null;
  };

  setViewportTransform = (transform) => {
    this.canvas?.setViewportTransform?.(transform);
  };

  zoomToPoint = (point, zoom) => {
    this.canvas?.zoomToPoint?.(point, zoom);
  };

  relativePan = (point) => {
    this.canvas?.relativePan?.(point);
  };

  getPointer = (event) => {
    return this.canvas?.getPointer?.(event);
  };

  viewportCenterObject = (object) => {
    this.canvas?.viewportCenterObject?.(object);
  };

  setDefaultCursor = (cursor) => {
    if (this.canvas) {
      this.canvas.defaultCursor = cursor;
    }
  };

  setCursor = (cursor) => {
    this.canvas?.setCursor?.(cursor);
  };

  isDrawingMode = () => {
    return !!this.canvas?.isDrawingMode;
  };

  isDragging = () => {
    return !!this.canvas?.isDragging;
  };

  setIsDragging = (isDragging) => {
    if (this.canvas) {
      this.canvas.isDragging = !!isDragging;
    }
  };

  setSelection = (enabled) => {
    if (this.canvas) {
      this.canvas.selection = !!enabled;
    }
  };

  setLastPointerPosition = ({ x, y }) => {
    if (!this.canvas) return;
    this.canvas.lastPosX = x;
    this.canvas.lastPosY = y;
  };

  getLastPointerPosition = () => {
    return {
      x: this.canvas?.lastPosX ?? 0,
      y: this.canvas?.lastPosY ?? 0,
    };
  };

  setLastTouchPosition = ({ x, y }) => {
    if (!this.canvas) return;
    this.canvas.lastPosTouchX = x;
    this.canvas.lastPosTouchY = y;
  };

  getLastTouchPosition = () => {
    return {
      x: this.canvas?.lastPosTouchX ?? 0,
      y: this.canvas?.lastPosTouchY ?? 0,
    };
  };

  on = (eventName, handler) => {
    this.canvas?.on?.(eventName, handler);
  };

  off = (eventName, handler) => {
    this.canvas?.off?.(eventName, handler);
  };

  dispose = () => {
    this.canvas?.dispose?.();
    this.canvas = null;
  };

  toJSON = () => {
    return this.canvas?.toJSON?.() || {};
  };

  loadFromJSON = (data, callback) => {
    this.canvas?.loadFromJSON?.(data, callback);
  };
}
