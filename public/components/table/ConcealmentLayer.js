const CONCEALMENT_ID = "concealment-mask";
const CONCEALMENT_COLOR = [16, 18, 22];
export const MANAGER_CONCEALMENT_OPACITY = 0.82;
const MASK_SCALE = 8;
const MASK_BLUR_RADIUS = 5;

export default class ConcealmentLayer {
  constructor({ canvasEngine, gridManager, canManage = false }) {
    this.canvasEngine = canvasEngine;
    this.gridManager = gridManager;
    this.canManage = canManage;
    this.image = null;
    this.maskCanvas = null;
    this.maskContext = null;
    this.hardMaskCanvas = null;
    this.hardMaskContext = null;
    this.cells = null;
    this.columns = 0;
    this.rows = 0;
    this.cellSize = 0;
    this.mode = null;
    this.isPainting = false;
    this.strokeStartCell = null;
    this.strokeEndCell = null;
    this.sourceRevision = 0;
  }

  hasMask = () => !!this.image;

  setMode = (mode) => {
    this.mode = mode === "reveal" || mode === "conceal" ? mode : null;
    this.isPainting = false;
    this.strokeStartCell = null;
    this.strokeEndCell = null;
    this.canvasEngine.setSelection(!this.mode);
    this.canvasEngine.setDefaultCursor(this.mode ? "crosshair" : "grab");
  };

  coverGrid = async () => {
    this.clear({ render: false });
    this.cellSize = this.gridManager.gridSize;
    this.columns = Math.ceil(this.gridManager.width / this.cellSize);
    this.rows = Math.ceil(this.gridManager.height / this.cellSize);
    this.cells = new Uint8Array(this.columns * this.rows);
    this.cells.fill(1);
    this.createMaskCanvas();
    this.rebuildHardMask();
    this.applyFeather();
    this.mountMaskImage();
    await this.freezeRenderSource();
  };

  mountMaskImage = () => {
    this.image = this.canvasEngine.createImageFromElement(this.maskCanvas, {
      id: CONCEALMENT_ID,
      left: 0,
      top: 0,
      originX: "left",
      originY: "top",
      scaleX: this.cellSize / MASK_SCALE,
      scaleY: this.cellSize / MASK_SCALE,
      layer: "Concealment",
      isConcealment: true,
      selectable: false,
      evented: !this.canManage,
      perPixelTargetFind: false,
      hasControls: false,
      objectCaching: false,
      imageSmoothing: true,
      opacity: this.canManage ? MANAGER_CONCEALMENT_OPACITY : 1,
    });
    this.configurePlayerHitTesting();
    this.updateSerializedState();
    this.canvasEngine.addObject(this.image);
    this.image.setCoords();
    this.image.bringToFront();
    this.canvasEngine.requestRender();
  };

  getState = () => {
    if (!this.cells) return null;
    return {
      version: 1,
      columns: this.columns,
      rows: this.rows,
      cellSize: this.cellSize,
      cells: Array.from(this.cells).join(""),
    };
  };

  applyState = async (state) => {
    this.clear({ render: false });
    if (!state) {
      this.canvasEngine.requestRender();
      return;
    }

    const columns = Number(state.columns);
    const rows = Number(state.rows);
    const cellSize = Number(state.cellSize);
    const cells = typeof state.cells === "string" ? state.cells : "";
    if (
      !Number.isInteger(columns) ||
      !Number.isInteger(rows) ||
      columns <= 0 ||
      rows <= 0 ||
      !Number.isFinite(cellSize) ||
      cellSize <= 0 ||
      cells.length !== columns * rows ||
      /[^01]/.test(cells)
    ) {
      return;
    }

    this.columns = columns;
    this.rows = rows;
    this.cellSize = cellSize;
    this.cells = Uint8Array.from(cells, (value) => (value === "1" ? 1 : 0));
    this.createMaskCanvas();
    this.rebuildHardMask();
    this.applyFeather();
    this.mountMaskImage();
    await this.freezeRenderSource();
  };

  clear = ({ render = true } = {}) => {
    if (this.image) this.canvasEngine.removeObject(this.image);
    this.image = null;
    this.maskCanvas = null;
    this.maskContext = null;
    this.hardMaskCanvas = null;
    this.hardMaskContext = null;
    this.cells = null;
    this.columns = 0;
    this.rows = 0;
    this.cellSize = 0;
    this.sourceRevision += 1;
    this.setMode(null);
    if (render) this.canvasEngine.requestRender();
  };

  hydrate = (object) => {
    const state = object?.concealmentState;
    if (!state?.columns || !state?.rows || !state?.cellSize) return false;

    this.image = object;
    this.columns = state.columns;
    this.rows = state.rows;
    this.cellSize = state.cellSize;
    this.cells = Uint8Array.from(state.cells || "", (value) =>
      value === "1" ? 1 : 0,
    );
    if (this.cells.length !== this.columns * this.rows) return false;

    this.createMaskCanvas();
    this.rebuildHardMask();
    this.applyFeather();
    object.setElement(this.maskCanvas);
    object.set({
      id: CONCEALMENT_ID,
      left: 0,
      top: 0,
      originX: "left",
      originY: "top",
      scaleX: this.cellSize / MASK_SCALE,
      scaleY: this.cellSize / MASK_SCALE,
      layer: "Concealment",
      isConcealment: true,
      selectable: false,
      evented: !this.canManage,
      perPixelTargetFind: false,
      hasControls: false,
      opacity: this.canManage ? MANAGER_CONCEALMENT_OPACITY : 1,
      imageSmoothing: true,
      objectCaching: false,
      dirty: true,
    });
    object.setCoords();
    this.configurePlayerHitTesting();
    this.updateSerializedState();
    void this.freezeRenderSource();
    return true;
  };

  startStroke = (event) => {
    if (!this.mode || !this.image) return false;
    const cell = this.getCellAtEvent(event);
    if (!cell) return false;

    this.isPainting = true;
    this.strokeStartCell = cell;
    this.strokeEndCell = cell;
    this.sourceRevision += 1;
    this.image.setElement(this.maskCanvas);
    this.renderRectanglePreview();
    return true;
  };

  continueStroke = (event) => {
    if (!this.isPainting) return false;
    const cell = this.getCellAtEvent(event, { clamp: true });
    if (
      !cell ||
      (cell.column === this.strokeEndCell?.column &&
        cell.row === this.strokeEndCell?.row)
    ) {
      return true;
    }
    this.strokeEndCell = cell;
    this.renderRectanglePreview();
    return true;
  };

  endStroke = () => {
    if (!this.isPainting) return false;
    this.isPainting = false;
    const changed = this.commitRectangle();
    this.strokeStartCell = null;
    this.strokeEndCell = null;
    if (changed) {
      this.applyFeather();
      this.image.set("dirty", true);
      this.canvasEngine.requestRender();
      this.updateSerializedState();
      void this.freezeRenderSource();
    } else {
      void this.freezeRenderSource();
    }
    return changed;
  };

  freezeRenderSource = () => {
    if (!this.image || !this.maskCanvas) return Promise.resolve();

    const revision = ++this.sourceRevision;
    const source = this.maskCanvas.toDataURL("image/png");
    const renderImage = new Image();

    return new Promise((resolve) => {
      renderImage.onload = () => {
        if (revision === this.sourceRevision && this.image) {
          this.image.setElement(renderImage);
          this.image.setCoords();
          this.image.set("dirty", true);
          this.canvasEngine.requestRender();
        }
        resolve();
      };
      renderImage.onerror = () => resolve();
      renderImage.src = source;
    });
  };

  configurePlayerHitTesting = () => {
    if (this.canManage || !this.image) return;

    // Fabric reuses containsPoint() for off-screen culling. Keep rendering
    // independent from cell-aware player hit testing for this single image.
    this.image.isOnScreen = () => true;
    const containsPoint = this.image.containsPoint.bind(this.image);
    this.image.containsPoint = (point, ...args) => {
      if (!containsPoint(point, ...args)) return false;
      const viewport = this.canvasEngine.getViewportTransform();
      const gridPoint = viewport
        ? this.canvasEngine.transformPoint(
            point,
            this.canvasEngine.invertTransform(viewport),
          )
        : point;
      const column = Math.floor(gridPoint.x / this.cellSize);
      const row = Math.floor(gridPoint.y / this.cellSize);
      return (
        this.isValidCell(column, row) &&
        this.cells[row * this.columns + column] === 1
      );
    };
  };

  getCellAtEvent = (event, { clamp = false } = {}) => {
    const point = this.canvasEngine.getPointer(event);
    let column = Math.floor(point.x / this.cellSize);
    let row = Math.floor(point.y / this.cellSize);
    if (clamp) {
      column = Math.max(0, Math.min(this.columns - 1, column));
      row = Math.max(0, Math.min(this.rows - 1, row));
    }
    return this.isValidCell(column, row) ? { column, row } : null;
  };

  getStrokeBounds = () => {
    if (!this.strokeStartCell || !this.strokeEndCell) return null;
    return {
      left: Math.min(
        this.strokeStartCell.column,
        this.strokeEndCell.column,
      ),
      right: Math.max(
        this.strokeStartCell.column,
        this.strokeEndCell.column,
      ),
      top: Math.min(this.strokeStartCell.row, this.strokeEndCell.row),
      bottom: Math.max(this.strokeStartCell.row, this.strokeEndCell.row),
    };
  };

  renderRectanglePreview = () => {
    const bounds = this.getStrokeBounds();
    if (!bounds) return;

    this.renderHardMaskPreview();
    const x = bounds.left * MASK_SCALE;
    const y = bounds.top * MASK_SCALE;
    const width = (bounds.right - bounds.left + 1) * MASK_SCALE;
    const height = (bounds.bottom - bounds.top + 1) * MASK_SCALE;
    if (this.mode === "conceal") {
      this.maskContext.fillStyle = `rgb(${CONCEALMENT_COLOR.join(",")})`;
      this.maskContext.fillRect(x, y, width, height);
    } else {
      this.maskContext.clearRect(x, y, width, height);
    }
    this.image.set("dirty", true);
    this.canvasEngine.requestRender();
  };

  commitRectangle = () => {
    const bounds = this.getStrokeBounds();
    if (!bounds) return false;

    const nextValue = this.mode === "conceal" ? 1 : 0;
    let changed = false;
    for (let row = bounds.top; row <= bounds.bottom; row += 1) {
      for (let column = bounds.left; column <= bounds.right; column += 1) {
        const index = row * this.columns + column;
        if (this.cells[index] === nextValue) continue;
        this.cells[index] = nextValue;
        changed = true;
      }
    }
    if (!changed) return false;

    const x = bounds.left * MASK_SCALE;
    const y = bounds.top * MASK_SCALE;
    const width = (bounds.right - bounds.left + 1) * MASK_SCALE;
    const height = (bounds.bottom - bounds.top + 1) * MASK_SCALE;
    this.hardMaskContext.clearRect(x, y, width, height);
    if (nextValue) {
      this.hardMaskContext.fillStyle = `rgb(${CONCEALMENT_COLOR.join(",")})`;
      this.hardMaskContext.fillRect(x, y, width, height);
    }
    return true;
  };

  createMaskCanvas = () => {
    this.maskCanvas = document.createElement("canvas");
    this.maskCanvas.width = this.columns * MASK_SCALE;
    this.maskCanvas.height = this.rows * MASK_SCALE;
    this.maskContext = this.maskCanvas.getContext("2d");
    this.hardMaskCanvas = document.createElement("canvas");
    this.hardMaskCanvas.width = this.maskCanvas.width;
    this.hardMaskCanvas.height = this.maskCanvas.height;
    this.hardMaskContext = this.hardMaskCanvas.getContext("2d");
  };

  rebuildHardMask = () => {
    this.hardMaskContext.clearRect(
      0,
      0,
      this.hardMaskCanvas.width,
      this.hardMaskCanvas.height,
    );
    this.hardMaskContext.fillStyle = `rgb(${CONCEALMENT_COLOR.join(",")})`;
    this.cells.forEach((concealed, index) => {
      if (!concealed) return;
      const column = index % this.columns;
      const row = Math.floor(index / this.columns);
      this.hardMaskContext.fillRect(
        column * MASK_SCALE,
        row * MASK_SCALE,
        MASK_SCALE,
        MASK_SCALE,
      );
    });
  };

  renderHardMaskPreview = () => {
    this.maskContext.clearRect(
      0,
      0,
      this.maskCanvas.width,
      this.maskCanvas.height,
    );
    this.maskContext.drawImage(this.hardMaskCanvas, 0, 0);
  };

  applyFeather = () => {
    const width = this.hardMaskCanvas.width;
    const height = this.hardMaskCanvas.height;
    const source = this.hardMaskContext.getImageData(0, 0, width, height);
    const horizontal = new Float32Array(width * height);
    const kernelSize = MASK_BLUR_RADIUS * 2 + 1;

    for (let row = 0; row < height; row += 1) {
      let sum = 0;
      for (let x = -MASK_BLUR_RADIUS; x <= MASK_BLUR_RADIUS; x += 1) {
        if (x >= 0 && x < width) sum += source.data[(row * width + x) * 4 + 3];
      }
      for (let column = 0; column < width; column += 1) {
        horizontal[row * width + column] = sum / kernelSize;
        const leaving = column - MASK_BLUR_RADIUS;
        const entering = column + MASK_BLUR_RADIUS + 1;
        if (leaving >= 0) sum -= source.data[(row * width + leaving) * 4 + 3];
        if (entering < width) sum += source.data[(row * width + entering) * 4 + 3];
      }
    }

    const output = this.maskContext.createImageData(width, height);
    for (let column = 0; column < width; column += 1) {
      let sum = 0;
      for (let y = -MASK_BLUR_RADIUS; y <= MASK_BLUR_RADIUS; y += 1) {
        if (y >= 0 && y < height) sum += horizontal[y * width + column];
      }
      for (let row = 0; row < height; row += 1) {
        const offset = (row * width + column) * 4;
        output.data[offset] = CONCEALMENT_COLOR[0];
        output.data[offset + 1] = CONCEALMENT_COLOR[1];
        output.data[offset + 2] = CONCEALMENT_COLOR[2];
        output.data[offset + 3] = Math.round(sum / kernelSize);

        const leaving = row - MASK_BLUR_RADIUS;
        const entering = row + MASK_BLUR_RADIUS + 1;
        if (leaving >= 0) sum -= horizontal[leaving * width + column];
        if (entering < height) sum += horizontal[entering * width + column];
      }
    }

    this.maskContext.putImageData(output, 0, 0);
  };

  updateSerializedState = () => {
    if (!this.image || !this.cells) return;
    this.image.concealmentState = this.getState();
  };

  isValidCell = (column, row) =>
    column >= 0 && row >= 0 && column < this.columns && row < this.rows;
}
