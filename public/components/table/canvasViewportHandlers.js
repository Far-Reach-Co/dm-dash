export function calculateZoomLevel(currentZoom, delta, min, max) {
  const nextZoom = currentZoom * 0.999 ** delta;
  return Math.max(min, Math.min(max, nextZoom));
}

export function handleMouseWheelZoom(canvas, opt) {
  const delta = opt.e.deltaY;
  const newZoom = calculateZoomLevel(canvas.getZoom(), delta, 0.25, 20);
  canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, newZoom);
  opt.e.preventDefault();
  opt.e.stopPropagation();
}

export function handlePinchZoomGesture(canvas, opt) {
  if (!opt.e.touches || opt.e.touches.length !== 2) return;

  canvas.isDragging = false;
  const pt = new fabric.Point(opt.self.x, opt.self.y);
  const zoom = canvas.getZoom();

  const delta = 1 - opt.self.scale;
  const sensitivity = 0.1;
  const newZoom = Math.max(0.2, Math.min(5, zoom + zoom * delta * sensitivity));

  canvas.zoomToPoint(pt, newZoom);
  opt.e.preventDefault();
  opt.e.stopPropagation();
}

export function startCanvasDrag(canvas, x, y) {
  canvas.isDragging = true;
  canvas.selection = false;
  canvas.lastPosX = x;
  canvas.lastPosY = y;
}

export function handleMousePan(canvas, opt) {
  const e = opt.e;
  const vpt = canvas.viewportTransform;
  vpt[4] += e.clientX - canvas.lastPosX;
  vpt[5] += e.clientY - canvas.lastPosY;
  canvas.requestRenderAll();
  canvas.lastPosX = e.clientX;
  canvas.lastPosY = e.clientY;
}

export function handleTouchPan(canvas, opt) {
  const xChange = opt.self.x - canvas.lastPosTouchX;
  const yChange = opt.self.y - canvas.lastPosTouchY;

  const isSmallMovement = Math.abs(xChange) <= 50 && Math.abs(yChange) <= 50;
  if (isSmallMovement) {
    canvas.relativePan(new fabric.Point(xChange, yChange));
  }

  canvas.lastPosTouchX = opt.self.x;
  canvas.lastPosTouchY = opt.self.y;
}

export function endCanvasDrag(canvas) {
  canvas.setViewportTransform(canvas.viewportTransform);
  canvas.isDragging = false;
  canvas.selection = true;
}
