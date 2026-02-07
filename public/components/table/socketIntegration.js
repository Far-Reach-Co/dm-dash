class SocketIntegration {
  constructor() {
    this.socket = io(window.location.origin);
    this.tableApp = null;
  }

  // Listeners
  setupListeners = () => {
    // USER JOIN
    this.socket.on("table-join", (message) => {
      console.log("User Joined:\n", message);
    });

    // TABLE CHANGE
    this.socket.on("table-change", (newTableUUID) => {
      const searchParams = new URLSearchParams(window.location.search);
      searchParams.set("uuid", newTableUUID);
      const newSearchParamsString = searchParams.toString();

      const newUrl = window.location.pathname + "?" + newSearchParamsString;
      // Prompt the user
      if (
        confirm(
          "The GM has requested that you migrate to a new virtual table location, would you like to proceed?"
        )
      ) {
        window.location.href = newUrl;
      }
    });
    // ERROR
    this.socket.on("connect_error", (error) => {
      console.log(error);
      if (window.confirm("There was a connection error, refresh the page?")) {
        history.go();
      }
    });

    this.socket.on("disconnect", (error) => {
      console.log(error);
      if (window.confirm("There was a connection error, refresh the page?")) {
        history.go();
      }
    });

    this.socket.on("object-change-layer", (id) => {
      this.tableApp.canvasLayer.canvas.getObjects().forEach((object) => {
        if (object.id === id) {
          this.tableApp.canvasLayer.placeObjectOnLayer(object);
        }
      });
    });

    // UPDATE CURRENT USERS
    this.socket.on("current-users", (list) => {
      this.tableApp.chatBoxComponent.onlineUsersComponent.usersList = list;
      this.tableApp.chatBoxComponent.onlineUsersComponent.render();
    });

    // TABLE MESSAGES
    this.socket.on("table-messages", (messages) => {
      this.tableApp.chatBoxComponent.chatBoxMessagesComponent.chatBoxMessages =
        messages;
      this.tableApp.chatBoxComponent.chatBoxMessagesComponent.render();
      this.tableApp.chatBoxComponent.chatBoxMessagesComponent.scrollDown();
    });

    this.socket.on("message", (message) => {
      this.tableApp.chatBoxComponent.chatBoxMessagesComponent.chatBoxMessages.push(
        message
      );
      this.tableApp.chatBoxComponent.chatBoxMessagesComponent.render();
      this.tableApp.chatBoxComponent.chatBoxMessagesComponent.scrollDown();
    });

    // GRID
    this.socket.on("grid-toggle", (gridState) => {
      // console.log("grid toggle", gridState);
      gridState
        ? this.tableApp.canvasLayer.showGrid()
        : this.tableApp.canvasLayer.hideGrid();
      if (this.tableApp.topLayer) {
        this.tableApp.topLayer.render(); // re-render UI layer for any users that have grid toggle button available
      }
    });

    this.socket.on("grid-resize", (gridState) => {
      // console.log("grid resize", gridState);
      this.tableApp.canvasLayer.resizeGrid(gridState);
    });

    // OBJECTS LISTENERS
    this.socket.on("image-add", (newImg) => {
      // console.log("New socket image", newImg);
      // Path drawing
      if (!newImg.src) {
        const newPath = new fabric.Path(newImg.path);
        newPath.set({
          id: newImg.id,
          left: newImg.left,
          top: newImg.top,
          fill: false,
          stroke: newImg.stroke,
          strokeWidth: newImg.strokeWidth,
          layer: newImg.layer,
        });

        this.tableApp.canvasLayer.canvas.add(newPath);
        this.tableApp.canvasLayer.placeObjectOnLayer(newPath);
        this.tableApp.canvasLayer.updateObjectProperties(newPath);
        // event listener
        this.tableApp.canvasLayer.setupObjectEventListeners(img);
        return;
      }

      // uploaded images
      fabric.Image.fromURL(newImg.src, (img) => {
        // reconstruct new image
        for (const [key, value] of Object.entries(newImg)) {
          img[key] = value;
        }
        // add to canvas on correct layer
        this.tableApp.canvasLayer.canvas.add(img);
        // Place image on layer
        this.tableApp.canvasLayer.placeObjectOnLayer(img);
        this.tableApp.canvasLayer.updateObjectProperties(img);
        // event listener
        this.tableApp.canvasLayer.setupObjectEventListeners(img);
      });
    });

    this.socket.on("image-remove", (id) => {
      // console.log("Remove socket image", id);

      this.tableApp.canvasLayer.canvas.getObjects().forEach((object) => {
        if (object.id === id) {
          this.tableApp.canvasLayer.canvas.remove(object);
        }
      });
    });

    this.socket.on("run-indicator-animation", (coords) => {
      this.tableApp.canvasLayer.runIndicatorAnimation(coords.x, coords.y);
    });

    this.socket.on("image-move", (image) => {
      // console.log("Move socket image", image);
      this.tableApp.canvasLayer.canvas.getObjects().forEach((object) => {
        if (object.id === image.id) {
          for (var [key, value] of Object.entries(image)) {
            object[key] = value;
          }
          this.tableApp.canvasLayer.updateObjectProperties(object);
          this.tableApp.canvasLayer.canvas.renderAll();
        }
      });
      //
    });
  };

  socketJoined = () => {
    this.socket.emit("table-joined", {
      username: this.tableApp.user.username,
      table: `table-${this.tableApp.tableId}`,
    });
  };

  getMessages = () => {
    this.socket.emit("get-messages", {
      table: `table-${this.tableApp.tableId}`,
    });
  };

  newTableMessage = (content) => {
    this.socket.emit("new-message", {
      table: `table-${this.tableApp.tableId}`,
      content,
    });
  };

  tableChanged = (newTableUUID) => {
    this.socket.emit("table-changed", {
      table: `table-${this.tableApp.tableId}`,
      newTableUUID,
    });
  };

  // GRID
  gridToggle = (gridState) => {
    // Bool
    this.socket.emit("grid-toggled", {
      table: `table-${this.tableApp.tableId}`,
      gridState,
    });
  };

  gridResized = (gridState) => {
    // {width, height}
    this.socket.emit("grid-resized", {
      table: `table-${this.tableApp.tableId}`,
      gridState,
    });
  };

  // OBJECTS
  imageAdded = (image) => {
    this.socket.emit("image-added", {
      table: `table-${this.tableApp.tableId}`,
      image,
    });
  };

  imageRemoved = (id) => {
    this.socket.emit("image-removed", {
      table: `table-${this.tableApp.tableId}`,
      id,
    });
  };

  imageMoved = (image) => {
    this.socket.emit("image-moved", {
      table: `table-${this.tableApp.tableId}`,
      image,
    });
  };

  objectChangeLayer = (id) => {
    this.socket.emit("object-changed-layer", {
      table: `table-${this.tableApp.tableId}`,
      id,
    });
  };

  // ANIMATION
  indicatorAnimation = (x, y) => {
    this.socket.emit("indicator-animation", {
      table: `table-${this.tableApp.tableId}`,
      x,
      y,
    });
  };
}
const socketIntegration = new SocketIntegration();
export default socketIntegration;
