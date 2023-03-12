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
            img.selectable = false;
          }
        } else {
          if (img.zIndex === canvasLayer.OBJECT_LAYER) {
            img.selectable = false;
            img.opacity = 0.5;
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
          if (canvasLayer.currentLayer === "Object") {
            if (object.zIndex === canvasLayer.BOTTOM_LAYER) {
              object.selectable = false;
            }
          } else {
            if (object.zIndex === canvasLayer.OBJECT_LAYER) {
              object.selectable = false;
              object.opacity = 0.5;
            }
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
}
const socketIntegration = new SocketIntegration();
export default socketIntegration;
