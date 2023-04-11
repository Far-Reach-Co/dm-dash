import { deleteThing, postThing } from "../lib/apiUtils.js";
import createElement from "../lib/createElement.js";
import state from "../lib/state.js";

export default class Campaign {
  constructor(props) {
    this.navigate = props.navigate;
    this.domComponent = props.domComponent;
    this.domComponent.className = "project-btn-container";

    this.id = props.id;
    this.title = props.title;
    this.description = props.description;
    this.dateCreated = props.dateCreated;

    this.edit = false;

    this.render();
  }

  toggleEdit = () => {
    this.edit = !this.edit;
    this.render();
  };

  editTitle = (title) => {
    this.title = title.trim();
  };

  saveCampaign = () => {
    postThing(`/api/edit_table_view/${this.id}`, {
      title: this.title,
    });
  };

  renderEditCampaign = async () => {
    const titleInput = createElement("input", {
      id: `edit-project-title-${this.id}`,
      value: this.title,
      style: "margin-right: 10px;",
    });

    this.domComponent.append(
      createElement("div", { class: "project-edit-container" }, [
        createElement("h1", {}, `Manage Campaign: "${this.title}"`),
        createElement("br"),
        createElement("div", { style: "display: flex; align-items: center;" }, [
          createElement("div", { style: "margin-right: 10px" }, "Title"),
          titleInput,
        ]),
        createElement("br"),
        createElement("button", {}, "Done", {
          type: "click",
          event: () => {
            this.editTitle(titleInput.value);
            this.saveCampaign();
            this.toggleEdit();
          },
        }),
        createElement("br"),
        createElement("button", { class: "btn-red" }, "Delete Campaign", {
          type: "click",
          event: (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (
              window.confirm(`Are you sure you want to delete ${this.title}`)
            ) {
              deleteThing(`/api/remove_table_view/${this.id}`);
              e.target.parentElement.parentElement.remove();
            }
          },
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
    return `Created: ${new Date(this.dateCreated).toLocaleDateString(
      "en-US",
      options
    )}`;
  };

  renderEditButtonOrNull = () => {
    if (state.currentProject.isEditor === false) {
      return createElement("div", { style: "visibility: hidden;" });
    } else {
      return createElement(
        "img",
        {
          class: "icon",
          src: "/assets/gears.svg",
          title: "Open campaign settings",
        },
        null,
        {
          type: "click",
          event: this.toggleEdit,
        }
      );
    }
  };

  render = () => {
    this.domComponent.innerHTML = "";

    if (this.edit) {
      return this.renderEditCampaign();
    }

    // append
    this.domComponent.append(
      createElement(
        "div",
        {
          class: "project-button",
          title: "Open campaign in new tab",
        },
        [
          createElement("h1", {}, this.title + "↗"),
          createElement(
            "div",
            { class: "project-extra-info" },
            this.calculateDateDisplay()
          ),
        ],
        {
          type: "click",
          event: () => {
            localStorage.setItem(
              "current-table-project-id",
              state.currentProject.id
            );
            localStorage.setItem("current-campaign-id", this.id);
            window.open("/vtt.html", "_blank").focus();
          },
        }
      ),
      this.renderEditButtonOrNull()
    );
  };
}
