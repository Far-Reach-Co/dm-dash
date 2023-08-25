import createElement from "./createElement.js";

class ImageFollowingCursor {
  constructor(props) {
    this.domComponent = props.domComponent;

    this.isOnPage = false;

    document.addEventListener("mousemove", (e) => {
      this.domComponent.style.left = `${e.pageX}px`;
      this.domComponent.style.top = `${e.pageY}px`;
    });
  }

  setImageSrc = (src) => {
    this.domComponent.src = src;
  };

  remove = () => {
    this.domComponent.remove();
    this.isOnPage = false;
  };

  render = () => {
    document.body.appendChild(this.domComponent);
    this.isOnPage = true;
  };
}

const imageFollowingCursor = new ImageFollowingCursor({
  domComponent: createElement("img", { id: "image-following-cursor" }),
});

export default imageFollowingCursor;
