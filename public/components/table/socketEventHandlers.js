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
        const newPath = canvasEngine.createPath(newImg.path);
        newPath.set({
          id: newImg.id,
          left: newImg.left,
          top: newImg.top,
          fill: false,
          stroke: newImg.stroke,
          strokeWidth: newImg.strokeWidth,
          layer: newImg.layer,
        });

        canvasEngine.addObject(newPath);
        canvasLayer.placeObjectOnLayer(newPath);
        canvasLayer.updateObjectProperties(newPath);
        canvasLayer.setupObjectEventListeners(newPath);
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
