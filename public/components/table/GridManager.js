export default class GridManager {
  constructor(canvas, config = {}) {
    this.canvas = canvas;

    // Size of each square in pixels (e.g. 100 = 100px x 100px per cell)
    this.gridSize = config.gridSize || 100;

    // Total number of squares in width/height
    const defaultSquares = 40;
    const squaresWide = config.squaresWide || defaultSquares;
    const squaresHigh = config.squaresHigh || defaultSquares;

    // Total width/height in pixels = squares × size of square
    this.width = squaresWide * this.gridSize;
    this.height = squaresHigh * this.gridSize;

    this.snapToGrid = true;
    this.gridGroup = null;
  }

  renderGrid() {
    const lines = [];

    const cols = Math.ceil(this.width / this.gridSize);
    const rows = Math.ceil(this.height / this.gridSize);

    for (let i = 0; i <= cols; i++) {
      const x = i * this.gridSize + 0.5;
      lines.push(
        new fabric.Line([x, 0, x, this.height], {
          stroke: "#ccc",
          strokeWidth: 1,
          selectable: false,
        })
      );
    }

    for (let j = 0; j <= rows; j++) {
      const y = j * this.gridSize + 0.5;
      lines.push(
        new fabric.Line([0, y, this.width, y], {
          stroke: "#ccc",
          strokeWidth: 1,
          selectable: false,
        })
      );
    }

    this.gridGroup = new fabric.Group(lines, {
      left: 0,
      top: 0,
      selectable: false,
      evented: false,
    });

    this.canvas.add(this.gridGroup);
  }

  snapPosition(pos) {
    if (!this.snapToGrid) return pos;
    return {
      left: Math.round(pos.left / this.gridSize) * this.gridSize,
      top: Math.round(pos.top / this.gridSize) * this.gridSize,
    };
  }

  toggleGrid(visible) {
    if (!this.gridGroup) return;
    this.gridGroup.set("visible", visible);
    this.snapToGrid = visible;
    this.canvas.renderAll();
  }

  rebuildGrid(squaresWide, squaresHigh) {
    let index = -1;

    if (this.gridGroup) {
      index = this.getIndexInCanvas();
      this.canvas.remove(this.gridGroup);
      this.gridGroup = null;
    }

    this.width = squaresWide * this.gridSize;
    this.height = squaresHigh * this.gridSize;

    this.renderGrid();

    if (index >= 0) {
      this.gridGroup.moveTo(index);
    }
  }

  getIndexInCanvas() {
    if (!this.gridGroup) return -1;
    return this.canvas.getObjects().indexOf(this.gridGroup);
  }

  hideGrid() {
    this.toggleGrid(false);
  }

  showGrid() {
    this.toggleGrid(true);
  }

  getGroup() {
    return this.gridGroup;
  }

  isSnapEnabled() {
    return this.snapToGrid;
  }
}
