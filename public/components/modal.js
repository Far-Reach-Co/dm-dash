class Modal {
  constructor() {
    this.domComponent = document.getElementById("modal");
    this.domContent = document.getElementById("modal-content");
    this.closeButton = document.getElementById("close-modal");

    this.closeButton.addEventListener("click", this.hide)
    document.addEventListener('click', (e) => {
      if(e.target.id === "modal") {
        this.hide()
      }
    })
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
