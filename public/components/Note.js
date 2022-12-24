import createElement from "../lib/createElement.js";
import locationSelect from "../lib/locationSelect.js";
import state from "../lib/state.js";

export default class Note {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className = "component";

    this.parentRender = props.parentRender;
    this.id = props.id;
    this.projectId = props.projectId;
    this.title = props.title;
    this.description = props.description;
    this.dateCreated = props.dateCreated;
    this.locationId = props.locationId;

    this.edit = false;

    this.render();
  }

  toggleEdit = () => {
    this.edit = !this.edit;
    this.render();
  };

  removeNote = async () => {
    const res = await fetch(
      `${window.location.origin}/api/remove_note/${this.id}`,
      {
        method: "DELETE",
      }
    );
    if (res.status === 204) {
      // window.alert(`Deleted ${this.title}`)
    } else {
      window.alert("Failed to delete note...");
    }
  }

  saveNote = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    if (formProps.location_id === "0") formProps.location_id = null;
    try {
      const res = await fetch(
        `${window.location.origin}/api/edit_note/${this.id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formProps),
        }
      );
      await res.json();
      if (res.status === 200) {
      } else throw new Error();
    } catch (err) {
      window.alert("Failed to save note...");
      console.log(err);
    }
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
              rows: "7"
            },
            this.description
          ),
          createElement("br"),
          createElement("label", { for: "location_id" }, "Location Select (Optional)"),
          await locationSelect(this.locationId),
          createElement("br"),
          createElement("button", { type: "submit" }, "Done"),
        ],
        {
          type: "submit",
          event: async (e) => {
            await this.saveNote(e);
            this.toggleEdit();
            this.parentRender();
          },
        }
      ),
      createElement("br"),
      createElement("button", { class: "btn-red" }, "Remove Note", {
        type: "click",
        event: async () => {
          if (window.confirm(`Are you sure you want to delete ${this.title}`)) {
            await this.removeNote();
            this.toggleEdit();
            this.parentRender();
          }
        },
      })
    );
  };

  render = () => {
    this.domComponent.innerHTML = "";

    if (this.edit) {
      return this.renderEdit();
    }

    this.domComponent.append(
      createElement("div", { class: "component-title" }, [
        this.title,
        createElement(
          "div",
          { class: "note-date" },
          new Date(this.dateCreated).toLocaleDateString("en-gb", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
          })
        ),
        createElement("img", {
          src: "../assets/note.svg",
          width: 40,
          height: 40,
        }),
      ]),
      createElement("div", { class: "description" }, this.description),
      createElement("br"),
      createElement("button", {}, "Edit", {
        type: "click",
        event: this.toggleEdit,
      })
    );
  };
}
