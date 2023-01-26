import createElement from "../lib/createElement.js";
import state from "../lib/state.js";
import {
  fallbackCopyTextToClipboard,
  copyTextToClipboard,
} from "../lib/clipboard.js";
import { getThings, deleteThing } from "../lib/apiUtils.js";

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
        headers: {
          "Content-Type": "application/json",
          "x-access-token": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          title: this.title,
        }),
      }
    );
  };

  addInviteLink = async () => {
    try {
      const res = await fetch(
        `${window.location.origin}/api/add_project_invite`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-access-token": `Bearer ${localStorage.getItem("token")}`,
          },
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

  updateProjectUserEditorStatus = async (userId, status) => {
    this.isEditor = status;
    try {
      const res = await fetch(
        `${window.location.origin}/api/edit_project_user/${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-access-token": `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            is_editor: status,
          }),
        }
      );
      await res.json();
      if (res.status === 200) {
      } else throw new Error();
    } catch (err) {
      // window.alert("Failed to save counter...");
      console.log(err);
    }
  };

  renderProjectUsersList = async () => {
    const projectUsers = await getThings(
      `/api/get_project_users_by_project/${this.id}`
    );
    const map = projectUsers.map((user) => {
      if (user.is_editor === undefined) user.is_editor = false;
      const checkbox = createElement("input", { type: "checkbox" }, null, {
        type: "change",
        event: (e) => {
          this.updateProjectUserEditorStatus(
            user.project_user_id,
            e.currentTarget.checked
          );
        },
      });
      checkbox.checked = user.is_editor;

      const elem = createElement(
        "div",
        { style: "display: flex; align-items: center;" },
        [
          createElement("div", { style: "margin-right: 50px;" }, user.email),
          createElement("label", { class: "switch" }, [
            checkbox,
            createElement("span", { class: "slider round" }),
          ]),
        ]
      );
      return elem;
    });
    if (map.length) return map;
    else return [createElement("div", { style: "visibility: hidden;" })];
  };

  renderManageUsersComponent = async () => {
    if (!this.wasJoined) {
      return [
        createElement("h2", {}, "Manage Invited-Users"),
        createElement("br"),
        createElement(
          "div",
          { style: "display: flex; justify-content: space-between;" },
          [
            createElement("small", {}, "Email"),
            createElement("small", {}, "Is Editor"),
          ]
        ),
        createElement("br"),
        ...(await this.renderProjectUsersList()),
        createElement("hr"),
      ];
    } else return [createElement("div", { style: "visibility: hidden;" })];
  };

  renderInviteLinkComponent = () => {
    if (!this.projectInvite) {
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
          deleteThing(`/api/remove_project_invite/${this.projectInvite.id}`);
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

  renderEditProject = async () => {
    if (this.loadingProjectInvite) {
      return this.domComponent.append(createElement("div", {}, "Loading..."));
    }

    const titleInput = createElement("input", {
      id: `edit-project-title-${this.id}`,
      value: this.title,
      style: "margin-right: 10px;",
    });

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
          deleteThing(`/api/remove_project/${this.id}`);
          this.toggleEdit();
          this.domComponent.remove();
        } else {
          await deleteThing(`/api/remove_project_user/${this.projectUserId}`);
          this.parentRender();
        }
      }
    });

    if (this.isEditor === false) {
      return this.domComponent.append(
        createElement("div", { class: "project-edit-container" }, [
          createElement("h2", {}, `Manage ${this.title}`),
          createElement("br"),
          removeButton,
          createElement("hr"),
          createElement("button", {}, "Cancel", {
            type: "click",
            event: this.toggleEdit,
          }),
        ])
      );
    }

    // append
    this.domComponent.append(
      createElement("div", { class: "project-edit-container" }, [
        createElement("h2", {}, `Manage ${this.title}`),
        createElement("br"),
        createElement("div", {}, [
          createElement("div", {}, "Title"),
          titleInput,
        ]),
        createElement("br"),
        doneButton,
        removeButton,
        ...this.renderInviteLinkComponent(),
        createElement("hr"),
        ...(await this.renderManageUsersComponent()),
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
          createElement("div", {}, this.title),
          createElement(
            "div",
            { class: "project-date" },
            this.calculateDateDisplay()
          ),
        ],
        {
          type: "click",
          event: () => {
            state.currentProject = {
              id: this.id,
              title: this.title,
              dateCreated: this.dateCreated,
              projectInvite: this.projectInvite,
              isEditor: this.isEditor,
              wasJoined: this.wasJoined,
              dateJoined: this.dateJoined,
              projectUserId: this.projectUserId,
            };
            this.navigate({ title: "modules", sidebar: true });
          },
        }
      ),
      createElement(
        "img",
        {
          class: "icon",
          src: "/assets/gears.svg",
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
