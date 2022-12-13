import createElement from "../lib/createElement.js";
import state from "../lib/state.js";

export default class Project {
  constructor(props) {
    this.navigate = props.navigate
    this.domComponent = props.domComponent;
    this.domComponent.className = "project-btn-container";
    this.id = props.id;
    this.title = props.title;
    this.dateCreated = props.dateCreated;
    this.edit = false;
    this.parentRender = props.parentRender;

    this.render();
  }

  toggleEdit = () => {
    this.edit = !this.edit;
    this.render();
  };

  editTitle = () => {
    this.title = document.getElementById(`edit-project-title-${this.id}`).value;
  };

  saveProject = async () => {
    const res = await fetch(
      `${window.location.origin}/api/edit_project/${this.id}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: this.title,
        }),
      }
    );
  };

  removeProject = async () => {
    const res = await fetch(
      `${window.location.origin}/api/remove_project/${this.id}`,
      {
        method: "DELETE",
      }
    );
    if (res.status === 204) {
      // window.alert(`Deleted ${this.title}`)
    } else {
      window.alert("Failed to delete project...");
    }
  };

  renderEditProject = () => {
    const titleInput = createElement("input", {
      id: `edit-project-title-${this.id}`,
      value: this.title,
    });
    const editButton = createElement("button", {}, "Done");
    editButton.addEventListener("click", async () => {
      this.editTitle();
      await this.saveProject();
      this.toggleEdit();
    });
    const removeButton = createElement(
      "button",
      { class: "btn-red" },
      "Delete Project"
    );
    removeButton.addEventListener("click", async () => {
      if (window.confirm(`Are you sure you want to delete ${this.title}`)) {
        await this.removeProject();
        this.toggleEdit();
        this.domComponent.remove();
      }
    });
    this.domComponent.appendChild(
      createElement("div", { style: "margin-right: 10px;" }, "Edit")
    );
    this.domComponent.appendChild(titleInput);
    this.domComponent.appendChild(editButton);
    this.domComponent.appendChild(removeButton);
  };

  render = () => {
    this.domComponent.innerHTML = "";

    if (this.edit) {
      this.renderEditProject();
      return;
    }

    const projectButton = createElement(
      "div",
      {
        id: `project-${this.id}`,
        class: "project-button",
      },
      [
        this.title,
        createElement(
          "div",
          { class: "project-date" },
          `Created: ${new Date(this.dateCreated).toLocaleDateString("en-gb", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}`
        ),
      ]
    );
    projectButton.addEventListener("click", () => {
      // push to project
      state.currentProject = this.id
      this.navigate({title: 'modules', sidebar: true})
    });

    const editIcon = createElement("img", {
      class: "icon",
      src: "../assets/gears.svg",
    });
    editIcon.addEventListener("click", this.toggleEdit);

    this.domComponent.appendChild(projectButton);
    this.domComponent.appendChild(editIcon);
  };
}
