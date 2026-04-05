import imageFollowingCursor from "../../components/imageFollowingCursor.js";

export default class DocumentInteractionController {
  constructor(tableApp) {
    this.tableApp = tableApp;
    this.listeners = [];
  }

  register = () => {
    this.clear();

    const isTypingInDomInput = (target) => {
      if (!target) return false;
      const tagName = (target.tagName || "").toLowerCase();
      return (
        tagName === "input" ||
        tagName === "textarea" ||
        target.isContentEditable
      );
    };

    const isEditingCanvasText = () => {
      const activeObject = this.tableApp.canvasLayer?.canvasEngine
        ?.getActiveObjects?.()
        ?.find((obj) => obj);
      if (!activeObject) return false;
      const isTextObject =
        activeObject.type === "i-text" ||
        activeObject.type === "textbox" ||
        activeObject.type === "text";
      return isTextObject && !!activeObject.isEditing;
    };

    this.addListener("keydown", (e) => {
      const key = (e.key || "").toLowerCase();

      if (e.altKey) {
        this.tableApp.canvasLayer.setCursorCrosshair();
      }

      if ((e.ctrlKey || e.metaKey) && key === "d") {
        this.tableApp.canvasLayer.duplicateObject();
      }

      if ((e.ctrlKey || e.metaKey) && key === "t") {
        if (this.tableApp.can("canManageLayers")) {
          this.tableApp.canvasLayer.moveObjectToTop();
        }
      }

      if ((e.ctrlKey || e.metaKey) && key === "z") {
        if (
          this.tableApp.canRemoveCanvasObjects() &&
          this.tableApp.canvasLayer.isDrawingMode()
        ) {
          e.preventDefault();
          this.tableApp.canvasLayer.undoLastDraw();
        }
      }
    });

    this.addListener("keyup", (e) => {
      const key = e.key;

      if (key === "Backspace" || key === "Delete") {
        if (
          this.tableApp.canRemoveCanvasObjects() &&
          !isTypingInDomInput(e.target) &&
          !isEditingCanvasText()
        ) {
          this.tableApp.canvasLayer.removeObjects();
        }
      }
      this.tableApp.canvasLayer.setCursorDefault();
    });

    this.addListener("mouseup", (e) => {
      const sidebarImageComponent =
        this.tableApp.sidebar?.tableSidebarImageComponent || null;
      const draggedImage = sidebarImageComponent?.currentMouseDownImage || null;

      if (imageFollowingCursor.isOnPage && draggedImage) {
        if (!e.target.closest(".sidebar")) {
          const pointer = this.tableApp.canvasLayer?.canvasEngine?.getPointer?.(e);
          const hasPointer =
            pointer &&
            Number.isFinite(pointer.x) &&
            Number.isFinite(pointer.y);
          this.tableApp.canvasLayer.addImageToTable(
            draggedImage,
            hasPointer
              ? {
                  broadcast: true,
                  centerInViewport: false,
                  left: pointer.x,
                  top: pointer.y,
                }
              : undefined,
          );
        }
      }

      if (sidebarImageComponent) {
        sidebarImageComponent.currentMouseDownImage = null;
      }
      imageFollowingCursor.remove();
    });
  };

  addListener(type, handler) {
    document.addEventListener(type, handler);
    this.listeners.push({ type, handler });
  }

  clear = () => {
    if (!this.listeners.length) return;
    for (const listener of this.listeners) {
      document.removeEventListener(listener.type, listener.handler);
    }
    this.listeners = [];
  };
}
