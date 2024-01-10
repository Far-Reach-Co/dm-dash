class SocketIntegration {
  constructor() {
    this.socket = io(window.location.origin);

    this.tableId = null;
    this.user = null;
    this.sidebar = null;
    this.topLayer = null;
  }

  // Listeners
  setupListeners = (canvasLayer) => {
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

    // UPDATE CURRENT USERS
    this.socket.on("current-users", (list) => {
      if (this.sidebar) {
        this.sidebar.onlineUsersComponent.usersList = list;
        this.sidebar.onlineUsersComponent.render();
      }
    });

    // GRID
    this.socket.on("grid-change", (gridState) => {
      // console.log("grid change", gridState)
      canvasLayer.oGridGroup.visible = gridState;
      canvasLayer.snapToGrid = gridState;
      canvasLayer.canvas.renderAll();
      if (this.topLayer) {
        this.topLayer.render();
      }
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
        });
        return canvasLayer.canvas.add(newPath);
      }

      // uploaded images
      fabric.Image.fromURL(newImg.src, (img) => {
        // reconstruct new image
        for (const [key, value] of Object.entries(newImg)) {
          img[key] = value;
        }
        // add to canvas
        if (img.layer === "Map") {
          if (canvasLayer.currentLayer === "Object") {
            img.selectable = false;
            img.evented = false;
          }
          const gridObjectIndex = canvasLayer.canvas
            .getObjects()
            .indexOf(canvasLayer.oGridGroup);
          canvasLayer.canvas.add(img);
          img.moveTo(gridObjectIndex);
        } else {
          if (canvasLayer.currentLayer === "Map") {
            img.opacity = "0.5";
            img.selectable = false;
            img.evented = false;
          }
          canvasLayer.canvas.add(img);
        }
        // event listener
        img.on("selected", (options) => {
          canvasLayer.moveObjectUp(options.target);
        });
      });
    });

    this.socket.on("image-remove", (id) => {
      // console.log("Remove socket image", id);

      canvasLayer.canvas.getObjects().forEach((object) => {
        if (object.id === id) {
          canvasLayer.canvas.remove(object);
        }
      });
    });

    this.socket.on("image-move", (image) => {
      // console.log("Move socket image", image);
      canvasLayer.canvas.getObjects().forEach((object) => {
        if (object.id === image.id) {
          for (var [key, value] of Object.entries(image)) {
            object[key] = value;
          }
          if (canvasLayer.currentLayer === "Map") {
            if (object.layer === "Object") {
              object.opacity = "0.5";
              object.selectable = false;
              object.evented = false;
            } else {
              object.opacity = "1";
              object.selectable = true;
              object.evented = true;
            }
          } else {
            if (object.layer === "Map") {
              object.opacity = "1";
              object.selectable = false;
              object.evented = false;
            } else {
              object.opacity = "1";
              object.selectable = true;
              object.evented = true;
            }
          }
          canvasLayer.canvas.renderAll();
        }
      });
      //
    });

    this.socket.on("object-move-up", (object) => {
      // console.log("Move socket object up", object);
      canvasLayer.canvas.getObjects().forEach((item) => {
        if (item.id === object.id) {
          if (item.layer === "Map") {
            const gridObjectIndex = canvasLayer.canvas
              .getObjects()
              .indexOf(canvasLayer.oGridGroup);
            item.moveTo(gridObjectIndex - 1);
          } else {
            item.bringToFront();
          }
        }
      });
      //
    });

    this.socket.on("object-change-layer", (object) => {
      console.log("Move socket object to different layer", object);
      canvasLayer.canvas.getObjects().forEach((item) => {
        if (item.id === object.id) {
          item.layer = object.layer;

          if (item.layer === "Map") {
            const gridObjectIndex = canvasLayer.canvas
              .getObjects()
              .indexOf(canvasLayer.oGridGroup);
            item.moveTo(gridObjectIndex);
            if (canvasLayer.currentLayer === "Map") {
              item.opacity = "1";
              item.selectable = true;
              item.evented = true;
            } else {
              item.opacity = "1";
              item.selectable = false;
              item.evented = false;
            }
          } else if (item.layer === "Object") {
            item.bringToFront();
            if (canvasLayer.currentLayer === "Map") {
              item.opacity = "0.5";
              item.selectable = false;
              item.evented = false;
            } else {
              item.opacity = "1";
              item.selectable = true;
              item.evented = true;
            }
          }
        }
      });
      //
    });
  };

  socketJoined = () => {
    this.socket.emit("table-joined", {
      username: this.user.username,
      table: `table-${this.tableId}`,
    });
  };

  tableChanged = (newTableUUID) => {
    this.socket.emit("table-changed", {
      table: `table-${this.tableId}`,
      newTableUUID,
    });
  };

  // GRID
  gridChange = (gridState) => {
    this.socket.emit("grid-changed", {
      table: `table-${this.tableId}`,
      gridState,
    });
  };

  // OBJECTS
  imageAdded = (image) => {
    this.socket.emit("image-added", {
      table: `table-${this.tableId}`,
      image,
    });
  };

  imageRemoved = (id) => {
    this.socket.emit("image-removed", {
      table: `table-${this.tableId}`,
      id,
    });
  };

  imageMoved = (image) => {
    this.socket.emit("image-moved", {
      table: `table-${this.tableId}`,
      image,
    });
  };

  objectMoveUp = (object) => {
    this.socket.emit("object-moved-up", {
      table: `table-${this.tableId}`,
      object,
    });
  };

  objectChangeLayer = (object) => {
    this.socket.emit("object-changed-layer", {
      table: `table-${this.tableId}`,
      object,
    });
  };
}
const socketIntegration = new SocketIntegration();
export default socketIntegration;
