import createElement from "../lib/salt-lib/createElement.js";
import Component from "../lib/salt-lib/Component.js";

class ImageFollowingCursor extends Component {
  constructor(props = {}) {
    super({
      domElem: props.domElem || createElement("img", { id: "image-following-cursor" }),
      autoInit: false,
      autoRender: false,
    });

    this.isOnPage = false;
    this._onMouseMove = (e) => {
      this.domElem.style.left = `${e.pageX}px`;
      this.domElem.style.top = `${e.pageY}px`;
    };

    document.addEventListener("mousemove", this._onMouseMove);
  }

  setImageSrc = (src) => {
    this.domElem.src = src;
  };

  remove = () => {
    this.domElem.remove();
    this.isOnPage = false;
  };

  render = () => {
    document.body.appendChild(this.domElem);
    this.isOnPage = true;
  };

  destroy = () => {
    document.removeEventListener("mousemove", this._onMouseMove);
    this.remove();
  };
}

const imageFollowingCursor = new ImageFollowingCursor();

export default imageFollowingCursor;
