import createElement from "../lib/createElement.js";
import state from "../lib/state.js";
import {
  fallbackCopyTextToClipboard,
  copyTextToClipboard,
} from "../lib/clipboard.js";

export default class Project {
  constructor(props) {
    this.navigate = props.navigate;
    this.domComponent = props.domComponent;
    this.domComponent.className = "project-btn-container";
    this.id = props.id;
    this.title = props.title;
    this.dateCreated = props.dateCreated;
    this.projectInvite = props.projectInvite;
    this.isEditor = props.isEditor;
    this.wasJoined = props.wasJoined;
    this.dateJoined = props.dateJoined;
    this.projectUserId = props.projectUserId;

    this.edit = false;
    this.parentRender = props.parentRender;
    this.loadingProjectInvite = false;

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

  removeInvite = async () => {
    const res = await fetch(
      `${window.location.origin}/api/remove_project_invite/${this.projectInvite.id}`,
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

  leaveProject = async () => {
    const res = await fetch(
      `${window.location.origin}/api/remove_project_user/${this.projectUserId}`,
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

  addInviteLink = async () => {
    try {
      const res = await fetch(
        `${window.location.origin}/api/add_project_invite`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            project_id: this.id,
          }),
        }
      );
      const data = await res.json();
      if (res.status === 201) {
        this.projectInvite = data;
      } else throw new Error();
    } catch (err) {
      console.log(err);
      alert("There was a problem creating your invite link");
    }
  };

  renderInviteLinkComponent = () => {
    // don't show if not allowed
    if (this.isEditor === false) {
      return [createElement("div", {style: "visibility: hidden;"}, "")];
    }

    if (this.loadingProjectInvite) {
      return [
        createElement("hr"),
        createElement("h2", {}, "Share This Project"),
        createElement("br"),
        createElement("div", {}, "Loading..."),
      ];
    } else if (!this.projectInvite) {
      return [
        createElement("hr"),
        createElement("h2", {}, "Share This Project"),
        createElement("br"),
        createElement("button", {}, "Create Invite Link", {
          type: "click",
          event: async () => {
            this.loadingProjectInvite = true;
            this.render();
            await this.addInviteLink();
            this.loadingProjectInvite = false;
            this.render();
          },
        }),
      ];
    } else {
      const inviteLink = `${window.location.origin}/invite.html?invite=${this.projectInvite.uuid}`;

      const inviteLinkButton = createElement(
        "button",
        { style: "margin-right: 10px;" },
        "Copy Link"
      );
      inviteLinkButton.addEventListener("click", () => {
        copyTextToClipboard(inviteLink);
      });

      const removeInviteButton = createElement(
        "button",
        { class: "btn-red" },
        "Delete Link"
      );
      removeInviteButton.addEventListener("click", () => {
        if (
          window.confirm(`Are you sure you want to delete the invite link?`)
        ) {
          this.removeInvite();
          this.projectInvite = null;
          this.render();
        }
      });

      return [
        createElement("hr"),
        createElement("h2", {}, "Share Invite Link"),
        createElement("br"),
        createElement("div", {}, inviteLink),
        inviteLinkButton,
        removeInviteButton,
      ];
    }
  };

  renderEditProject = () => {
    const doneButton = createElement(
      "button",
      { style: "margin-right: 10px;" },
      "Done"
    );
    doneButton.addEventListener("click", async () => {
      this.editTitle(titleInput.value);
      this.saveProject();
      this.toggleEdit();
    });

    const removeButton = createElement(
      "button",
      { class: "btn-red" },
      `${this.wasJoined ? "Leave" : "Delete"} Project`
    );
    removeButton.addEventListener("click", async () => {
      if (
        window.confirm(
          `Are you sure you want to ${this.wasJoined ? "leave" : "delete"} ${
            this.title
          }`
        )
      ) {
        if (!this.wasJoined) {
          this.removeProject();
          this.toggleEdit();
          this.domComponent.remove();
        } else {
          await this.leaveProject();
          this.parentRender();
        }
      }
    });

    // append
    this.domComponent.append(
      createElement("div", { class: "project-edit-container" }, [
        createElement("h2", {}, `Manage ${this.title}`),
        createElement("br"),
        createElement("div", {}, [
          createElement("div", {}, "Title"),
          createElement("input", {
            id: `edit-project-title-${this.id}`,
            value: this.title,
            style: "margin-right: 10px;",
          }),
        ]),
        createElement("br"),
        doneButton,
        removeButton,
        ...this.renderInviteLinkComponent(),
        createElement("hr"),
        createElement("button", {}, "Cancel", {
          type: "click",
          event: this.toggleEdit,
        }),
      ])
    );
  };

  calculateDateDisplay = () => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    if (!this.dateJoined) {
      return `Created: ${new Date(this.dateCreated).toLocaleDateString(
        "en-US",
        options
      )}`;
    } else {
      return `Joined: ${new Date(this.dateJoined).toLocaleDateString(
        "en-US",
        options
      )}`;
    }
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
            this.calculateDateDisplay()
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
