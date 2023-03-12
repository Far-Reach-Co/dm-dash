import state from "./state.js";

class SocketIntegration {
  constructor() {
    this.socket = io(window.location.origin);

    // message from server TESTING
    this.socket.on("message", (message) => {
      console.log("New socket message", message);
    });
  }

  // Listeners
  setupListeners = (canvasLayer) => {
    // OBJECTS LISTENERS
    this.socket.on("image-add", ({ newImg, id, zIndex, imageId }) => {
      // console.log("New socket image", { newImg, id, zIndex });

      fabric.Image.fromURL(newImg.src, function (img) {
        // reconstruct new image
        for (const [key, value] of Object.entries(newImg)) {
          img[key] = value;
        }
        img.set({ id });
        img.zIndex = zIndex;
        img.imageId = imageId;
        if (canvasLayer.currentLayer === "Object") {
          if (img.zIndex === canvasLayer.BOTTOM_LAYER) {
            img.selectable === false;
          }
        } else {
          if (img.zindex === canvasLayer.OBJECT_LAYER) {
            img.selectable === false;
            img.opacity === 0.8;
          }
        }
        // HANDLE ************************
        // add to canvas
        canvasLayer.canvas.add(img);
        // event listener
        // img.on("selected", function () {
        //   console.log("selected an image", img);
        // });
        // sort by layers and re-render
        canvasLayer.canvas._objects.sort((a, b) =>
          a.zIndex > b.zIndex ? 1 : -1
        );
        canvasLayer.canvas.renderAll();
        canvasLayer.saveObjectState(img)
      });
    });

    this.socket.on("image-remove", (id) => {
      // console.log("Remove socket image", id);

      canvasLayer.canvas.getObjects().forEach((object) => {
        if (object.id === id) {
          canvasLayer.canvas.remove(object);
          canvasLayer.removeObjectState(object)
        }
      });
    });

    this.socket.on("image-move", ({ id, image }) => {
      // console.log("Move socket image", { id, image });
      canvasLayer.canvas.getObjects().forEach((object) => {
        if (object.id === id) {
          for (var [key, value] of Object.entries(image)) {
            object[key] = value;
          }
          canvasLayer.canvas.renderAll();
          canvasLayer.saveObjectState(object);
        }
      });
      //
    });
  };

  socketTest = () => {
    this.socket.emit("joinProject", {
      user: state.user.email,
      project: `project-${state.currentProject.id}`,
    });
  };
  // OBJECTS
  imageAdded = (image) => {
    this.socket.emit("image-added", {
      project: `project-${state.currentProject.id}`,
      image,
    });
  };

  imageRemoved = (id) => {
    this.socket.emit("image-removed", {
      project: `project-${state.currentProject.id}`,
      id,
    });
  };

  imageMoved = (image) => {
    this.socket.emit("image-moved", {
      project: `project-${state.currentProject.id}`,
      image,
    });
  };
}
const socketIntegration = new SocketIntegration();
export default socketIntegration;
