class SocketIntegration {
  constructor() {
    this.socket = io(window.location.origin);

    this.campaignId = null;
    this.user = null;
    this.sidebar = null;
    this.topLayer = null;
  }

  // Listeners
  setupListeners = (canvasLayer) => {
    // USER JOIN
    this.socket.on("campain-join", (message) => {
      console.log("User Joined:\n", message);
    });

    this.socket.on("connect_error", (error) => {
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
      fabric.Image.fromURL(newImg.src, function (img) {
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
        if (object.id && object.id === image.id) {
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
    this.socket.emit("campaign-joined", {
      username: this.user.username,
      campaign: `campaign-${this.campaignId}`,
    });
  };

  // GRID
  gridChange = (gridState) => {
    this.socket.emit("grid-changed", {
      campaign: `campaign-${this.campaignId}`,
      gridState,
    });
  };

  // OBJECTS
  imageAdded = (image) => {
    this.socket.emit("image-added", {
      campaign: `campaign-${this.campaignId}`,
      image,
    });
  };

  imageRemoved = (id) => {
    this.socket.emit("image-removed", {
      campaign: `campaign-${this.campaignId}`,
      id,
    });
  };

  imageMoved = (image) => {
    this.socket.emit("image-moved", {
      campaign: `campaign-${this.campaignId}`,
      image,
    });
  };

  objectMoveUp = (object) => {
    this.socket.emit("object-moved-up", {
      campaign: `campaign-${this.campaignId}`,
      object,
    });
  };

  objectChangeLayer = (object) => {
    this.socket.emit("object-changed-layer", {
      campaign: `campaign-${this.campaignId}`,
      object,
    });
  };
}
const socketIntegration = new SocketIntegration();
export default socketIntegration;
