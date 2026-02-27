export function calculateZoomLevel(currentZoom, delta, min, max) {
  const nextZoom = currentZoom * 0.999 ** delta;
  return Math.max(min, Math.min(max, nextZoom));
}

export function handleMouseWheelZoom(canvasEngine, opt) {
  const delta = opt.e.deltaY;
  const newZoom = calculateZoomLevel(canvasEngine.getZoom(), delta, 0.25, 3);
  canvasEngine.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, newZoom);
  opt.e.preventDefault();
  opt.e.stopPropagation();
}

export function handlePinchZoomGesture(canvasEngine, opt) {
  if (!opt.e.touches || opt.e.touches.length !== 2) return;

  canvasEngine.setIsDragging(false);
  const pt = canvasEngine.createPoint(opt.self.x, opt.self.y);
  const zoom = canvasEngine.getZoom();

  const delta = 1 - opt.self.scale;
  const sensitivity = 0.1;
  const newZoom = Math.max(0.25, Math.min(3, zoom + zoom * delta * sensitivity));

  canvasEngine.zoomToPoint(pt, newZoom);
  opt.e.preventDefault();
  opt.e.stopPropagation();
}

export function startCanvasDrag(canvasEngine, x, y) {
  canvasEngine.setIsDragging(true);
  canvasEngine.setSelection(false);
  canvasEngine.setLastPointerPosition({ x, y });
}

export function handleMousePan(canvasEngine, opt) {
  const e = opt.e;
  const vpt = canvasEngine.getViewportTransform();
  if (!vpt) return;
  const lastPointer = canvasEngine.getLastPointerPosition();

  vpt[4] += e.clientX - lastPointer.x;
  vpt[5] += e.clientY - lastPointer.y;
  canvasEngine.requestRender();
  canvasEngine.setLastPointerPosition({ x: e.clientX, y: e.clientY });
}

export function handleTouchPan(canvasEngine, opt) {
  const lastTouch = canvasEngine.getLastTouchPosition();
  const xChange = opt.self.x - lastTouch.x;
  const yChange = opt.self.y - lastTouch.y;

  const isSmallMovement = Math.abs(xChange) <= 50 && Math.abs(yChange) <= 50;
  if (isSmallMovement) {
    canvasEngine.relativePan(canvasEngine.createPoint(xChange, yChange));
  }

  canvasEngine.setLastTouchPosition({ x: opt.self.x, y: opt.self.y });
}

export function endCanvasDrag(canvasEngine) {
  const viewport = canvasEngine.getViewportTransform();
  if (viewport) {
    canvasEngine.setViewportTransform(viewport);
  }
  canvasEngine.setIsDragging(false);
  canvasEngine.setSelection(true);
}
