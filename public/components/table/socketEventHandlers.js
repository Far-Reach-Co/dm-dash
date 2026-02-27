export function buildSocketEventHandlers(integration) {
  return {
    "table-join": (message) => {
      console.log("User Joined:\n", message);
    },

    "table-change": (newTableUUID) => {
      const app = integration.tableApp;
      if (!newTableUUID) return;
      app.reloadTableByUUID(newTableUUID, { historyMode: "push" });
    },

    connect_error: async (error) => {
      console.log(error);
      const confirmed = await window.customConfirm(
        "There was a connection error, refresh the page?",
        { confirmText: "Refresh" },
      );
      if (confirmed) {
        history.go();
      }
    },

    disconnect: async (error) => {
      console.log(error);
      const confirmed = await window.customConfirm(
        "There was a connection error, refresh the page?",
        { confirmText: "Refresh" },
      );
      if (confirmed) {
        history.go();
      }
    },

    "object-change-layer": (id) => {
      const canvasLayer = integration.tableApp?.canvasLayer;
      const canvasEngine = canvasLayer?.canvasEngine;
      if (!canvasLayer || !canvasEngine) return;
      canvasEngine.getObjects().forEach((object) => {
        if (object.id === id) {
          canvasLayer.placeObjectOnLayer(object);
        }
      });
    },

    "current-users": (list) => {
      const onlineUsers = integration.tableApp?.chatBoxComponent?.onlineUsersComponent;
      if (!onlineUsers) return;
      onlineUsers.usersList = list;
      onlineUsers.render();
    },

    "table-messages": (messages) => {
      const chatMessages = integration.tableApp?.chatBoxComponent?.chatBoxMessagesComponent;
      if (!chatMessages) return;
      chatMessages.chatBoxMessages = messages;
      chatMessages.render();
      chatMessages.scrollDown();
    },

    message: (message) => {
      const chatMessages = integration.tableApp?.chatBoxComponent?.chatBoxMessagesComponent;
      if (!chatMessages) return;
      chatMessages.chatBoxMessages.push(message);
      chatMessages.render();
      chatMessages.scrollDown();
    },

    "grid-toggle": (gridState) => {
      const canvasLayer = integration.tableApp?.canvasLayer;
      if (!canvasLayer) return;
      gridState ? canvasLayer.showGrid() : canvasLayer.hideGrid();
      if (integration.tableApp?.topLayer) {
        integration.tableApp.topLayer.render();
      }
    },

    "grid-resize": (gridState) => {
      const canvasLayer = integration.tableApp?.canvasLayer;
      if (!canvasLayer) return;
      canvasLayer.resizeGrid(gridState);
    },

    "image-add": (newImg) => {
      const canvasLayer = integration.tableApp?.canvasLayer;
      const canvasEngine = canvasLayer?.canvasEngine;
      if (!canvasLayer || !canvasEngine) return;

      if (!newImg.src) {
        let vectorObject = null;
        const commonProps = {
          id: newImg.id,
          left: newImg.left,
          top: newImg.top,
          fill: typeof newImg.fill === "undefined" ? false : newImg.fill,
          stroke: newImg.stroke,
          strokeWidth: newImg.strokeWidth,
          layer: newImg.layer,
          lockInPosition: !!newImg.lockInPosition,
          angle: newImg.angle || 0,
        };

        if (newImg.type === "path") {
          vectorObject = canvasEngine.createPath(newImg.path, commonProps);
        } else if (newImg.type === "line") {
          vectorObject = canvasEngine.createLine(
            [newImg.x1 || 0, newImg.y1 || 0, newImg.x2 || 0, newImg.y2 || 0],
            commonProps,
          );
        } else if (newImg.type === "rect") {
          vectorObject = canvasEngine.createRect({
            ...commonProps,
            width: newImg.width || 0,
            height: newImg.height || 0,
            originX: newImg.originX || "left",
            originY: newImg.originY || "top",
            scaleX: typeof newImg.scaleX === "number" ? newImg.scaleX : 1,
            scaleY: typeof newImg.scaleY === "number" ? newImg.scaleY : 1,
          });
        } else if (newImg.type === "ellipse") {
          vectorObject = canvasEngine.createEllipse({
            ...commonProps,
            rx: newImg.rx || 0,
            ry: newImg.ry || 0,
            originX: newImg.originX || "center",
            originY: newImg.originY || "center",
            scaleX: typeof newImg.scaleX === "number" ? newImg.scaleX : 1,
            scaleY: typeof newImg.scaleY === "number" ? newImg.scaleY : 1,
          });
        } else if (newImg.type === "i-text") {
          vectorObject = canvasEngine.createIText(newImg.text || "", {
            ...commonProps,
            fontSize: newImg.fontSize || 24,
            fontFamily: newImg.fontFamily || "YoungSerif, serif",
            originX: newImg.originX || "left",
            originY: newImg.originY || "top",
            scaleX: typeof newImg.scaleX === "number" ? newImg.scaleX : 1,
            scaleY: typeof newImg.scaleY === "number" ? newImg.scaleY : 1,
          });
        } else if (newImg.type === "textbox" || newImg.type === "text") {
          vectorObject = canvasEngine.createTextbox(newImg.text || "", {
            ...commonProps,
            fontSize: newImg.fontSize || 24,
            fontFamily: newImg.fontFamily || "YoungSerif, serif",
            width: Math.max(180, newImg.width || 180),
            backgroundColor: newImg.backgroundColor || "rgba(24, 32, 41, 0.45)",
            textBackgroundColor:
              newImg.textBackgroundColor || "rgba(24, 32, 41, 0.45)",
            borderColor: newImg.borderColor || "rgba(222, 199, 174, 0.9)",
            padding: typeof newImg.padding === "number" ? newImg.padding : 6,
            originX: newImg.originX || "left",
            originY: newImg.originY || "top",
            scaleX: typeof newImg.scaleX === "number" ? newImg.scaleX : 1,
            scaleY: typeof newImg.scaleY === "number" ? newImg.scaleY : 1,
          });
        }

        if (!vectorObject) return;
        canvasEngine.addObject(vectorObject);
        canvasLayer.placeObjectOnLayer(vectorObject);
        canvasLayer.updateObjectProperties(vectorObject);
        canvasLayer.setupObjectEventListeners(vectorObject);
        return;
      }

      canvasEngine.loadImageFromURL(newImg.src).then((img) => {
        for (const [key, value] of Object.entries(newImg)) {
          img[key] = value;
        }
        canvasEngine.addObject(img);
        canvasLayer.placeObjectOnLayer(img);
        canvasLayer.updateObjectProperties(img);
        canvasLayer.setupObjectEventListeners(img);
      });
    },

    "image-remove": (id) => {
      const canvasEngine = integration.tableApp?.canvasLayer?.canvasEngine;
      if (!canvasEngine) return;
      canvasEngine.getObjects().forEach((object) => {
        if (object.id === id) {
          canvasEngine.removeObject(object);
        }
      });
    },

    "run-indicator-animation": (coords) => {
      integration.tableApp?.canvasLayer?.runIndicatorAnimation(coords.x, coords.y);
    },

    "image-move": (image) => {
      const canvasLayer = integration.tableApp?.canvasLayer;
      const canvasEngine = canvasLayer?.canvasEngine;
      if (!canvasLayer || !canvasEngine) return;
      canvasEngine.getObjects().forEach((object) => {
        if (object.id === image.id) {
          for (const [key, value] of Object.entries(image)) {
            object[key] = value;
          }
          canvasLayer.updateObjectProperties(object);
          canvasEngine.render();
        }
      });
    },

    "pin-add": (pinData) => {
      if (integration.tableApp?.canvasLayer) {
        integration.tableApp.canvasLayer.addLocationPinFromSocket(pinData);
      }
    },

    "reload-location-pins": () => {
      integration.tableApp?.reloadLocationPins?.();
    },

    "table-mode-changed": () => {
      const app = integration.tableApp;
      if (!app) return;
      const tableId = app.tableId;
      app.teardown();
      app.loadTable(tableId);
    },
  };
}
