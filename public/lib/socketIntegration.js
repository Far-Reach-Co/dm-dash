class SocketIntegration {
  constructor() {
    this.socket = io(window.location.origin);

    this.projectId = null;

    // message from server TESTING
    this.socket.on("message", (message) => {
      console.log("New socket message", message);
    });
  }

  // Listeners
  setupListeners = (canvasLayer) => {
    // OBJECTS LISTENERS
    this.socket.on("image-add", (newImg) => {
      // console.log("New socket image", newImg);

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
          canvasLayer.moveObjectUp(options.target)
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
            item.bringToFront()
          }
        }
      });
      //
    });
  };

  socketTest = () => {
    this.socket.emit("joinProject", {
      // user: state.user.email,
      project: `project-${this.projectId}`,
    });
  };
  // OBJECTS
  imageAdded = (image) => {
    this.socket.emit("image-added", {
      project: `project-${this.projectId}`,
      image,
    });
  };

  imageRemoved = (id) => {
    this.socket.emit("image-removed", {
      project: `project-${this.projectId}`,
      id,
    });
  };

  imageMoved = (image) => {
    this.socket.emit("image-moved", {
      project: `project-${this.projectId}`,
      image,
    });
  };

  objectMoveUp = (object) => {
    this.socket.emit("object-moved-up", {
      project: `project-${this.projectId}`,
      object,
    });
  };
}
const socketIntegration = new SocketIntegration();
export default socketIntegration;
