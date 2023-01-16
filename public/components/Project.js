import createElement from "../lib/createElement.js";
import state from "../lib/state.js";

export default class Project {
  constructor(props) {
    this.navigate = props.navigate;
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

  editTitle = (title) => {
    this.title = title.trim();
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
      // window.alert("Failed to delete project...");
    }
  };

  renderEditProject = () => {
    const inviteLink = `${window.location.origin}/invite.html?project=${this.id}`;

    const titleInput = createElement("input", {
      id: `edit-project-title-${this.id}`,
      value: this.title,
      style: "margin-right: 10px;"
    });

    const editButton = createElement("button", {style: "margin-right: 10px;"}, "Done");
    editButton.addEventListener("click", async () => {
      this.editTitle(titleInput.value);
      this.saveProject();
      this.toggleEdit();
    });

    const removeButton = createElement(
      "button",
      { class: "btn-red" },
      "Delete Project"
    );
    removeButton.addEventListener("click", () => {
      if (window.confirm(`Are you sure you want to delete ${this.title}`)) {
        this.removeProject();
        this.toggleEdit();
        this.domComponent.remove();
      }
    });

    const inviteLinkButton = createElement("button", {}, "Copy Invite Link")
    inviteLinkButton.addEventListener("click", () => {
      navigator.clipboard.writeText(inviteLink).then(function() {
        console.log('Copying to clipboard was successful!');
      }, function(err) {
        console.error('Could not copy text: ', err);
      });
    })

    // append
    this.domComponent.append(
      createElement("div", {class: "project-edit-container"}, [
        createElement("div", {style: "color: var(--orange3)"}, `Manage ${this.title}`),
        createElement("br"),
        titleInput,
        createElement("br"),
        editButton, 
        removeButton,
        createElement("br"),
        createElement("div", {style: "color: var(--orange3)"}, "Share Invite Link"),
        createElement("div", {}, inviteLink),
        inviteLinkButton
      ])
    );
  };

  render = () => {
    this.domComponent.innerHTML = "";

    if (this.edit) {
      return this.renderEditProject();
    }

    // append
    this.domComponent.append(
      createElement(
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
        ],
        {
          type: "click",
          event: () => {
            state.currentProject = this.id;
            this.navigate({ title: "modules", sidebar: true });
          },
        }
      ),
      createElement(
        "img",
        {
          class: "icon",
          src: "../assets/gears.svg",
        },
        null,
        {
          type: "click",
          event: this.toggleEdit,
        }
      )
    );
  };
}
