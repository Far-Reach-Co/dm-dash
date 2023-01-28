import { deleteThing, postThing } from "../lib/apiUtils.js";
import createElement from "../lib/createElement.js";

export default class Note {
  constructor(props) {
    this.domComponent = props.domComponent;

    this.parentRender = props.parentRender;
    this.id = props.id;
    this.projectId = props.projectId;
    this.title = props.title;
    this.description = props.description;
    this.dateCreated = props.dateCreated;
    this.locationId = props.locationId;
    this.characterId = props.characterId;
    this.itemId = props.itemId;
    this.navigate = props.navigate;

    this.edit = false;

    this.render();
  }

  toggleEdit = () => {
    this.edit = !this.edit;
    this.render();
  };

  saveNote = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    // update UI
    this.title = formProps.title;
    this.description = formProps.description;

    await postThing(`/api/edit_note/${this.id}`, formProps)
  };

  renderEdit = async () => {
    this.domComponent.append(
      createElement(
        "form",
        {},
        [
          createElement("label", { for: "title" }, "Title"),
          createElement("input", {
            id: "title",
            name: "title",
            value: this.title,
          }),
          createElement("label", { for: "description" }, "Description"),
          createElement(
            "textarea",
            {
              id: "description",
              name: "description",
              cols: "30",
              rows: "7",
            },
            this.description
          ),
          createElement("br"),
          createElement("button", { type: "submit" }, "Done"),
        ],
        {
          type: "submit",
          event: (e) => {
            this.saveNote(e);
            this.toggleEdit();
          },
        }
      ),
      createElement("br"),
      createElement("button", { class: "btn-red" }, "Remove Note", {
        type: "click",
        event: () => {
          if (window.confirm(`Are you sure you want to delete ${this.title}`)) {
            deleteThing(`/api/remove_note/${this.id}`);
            this.toggleEdit();
            this.domComponent.remove();
          }
        },
      })
    );
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    if (this.edit) {
      return this.renderEdit();
    }

    this.domComponent.append(
      createElement("div", { class: "component-title" }, [
        createElement("div", { class: "title-edit" }, [
          this.title,
          createElement("div", { class: "edit-btn" }, "[Edit]", {
            type: "click",
            event: this.toggleEdit,
          }),
        ]),
        createElement(
          "div",
          { class: "note-date" },
          new Date(this.dateCreated).toLocaleDateString("en-US", {
            year: "numeric",
            month: "numeric",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
          })
        ),
        createElement("img", {
          src: "/assets/note.svg",
          width: 30,
          height: 30,
        }),
      ]),
      createElement("div", { class: "description" }, this.description),
      createElement("br")
    );
  };
}
