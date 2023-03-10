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
    this.socket.on("image-add", ({ newImg, id, zIndex }) => {
      console.log("New socket image", { newImg, id, zIndex });

      fabric.Image.fromURL(newImg.src, function (img) {
        // reconstruct new image
        for (const [key, value] of Object.entries(newImg)) {
          img[key] = value;
        }
        img.set({ id });
        img.zIndex = zIndex;
        console.log(img, "reconstructed");

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
      });
    });

    this.socket.on("image-remove", ({ newImg, id, zIndex }) => {
      console.log("Remocve socket image", { newImg, id, zIndex });
    });

    this.socket.on("image-edit", ({ newImg, id, zIndex }) => {
      console.log("Edit socket image", { newImg, id, zIndex });
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

  imageRemoved = (image) => {
    this.socket.emit("image-removed", {
      project: `project-${state.currentProject.id}`,
      image,
    });
  };

  imageModified = (image) => {
    this.socket.emit("image-modified", {
      project: `project-${state.currentProject.id}`,
      image,
    });
  };
}
const socketIntegration = new SocketIntegration();
export default socketIntegration;
