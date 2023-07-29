class Modal {
  constructor() {
    this.domComponent = document.getElementById("modal-custom");
    this.domContent = document.getElementById("modal-custom-content");
    this.closeButton = document.getElementById("close-custom-modal");

    if (this.closeButton) {
      this.closeButton.addEventListener("click", this.hide);
      document.addEventListener("click", (e) => {
        if (e.target.id === "modal-custom") {
          this.hide();
        }
      });
    }
  }

  show = (content) => {
    this.domComponent.style.visibility = "visible";
    this.domContent.innerHTML = "";
    this.domContent.append(content);
  };

  hide = () => {
    this.domComponent.style.visibility = "hidden";
  };
}

const modal = new Modal();
export default modal;
