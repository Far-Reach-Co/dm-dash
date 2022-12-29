import createElement from "../lib/createElement.js";
import characterTypeSelect from "../lib/characterTypeSelect.js";

export default class Character {
  constructor(props) {
    this.domComponent = props.domComponent;

    this.character = props.character;
    this.navigate = props.navigate;
    this.parentRender = props.parentRender;
    this.handleTypeFilterChange = props.handleTypeFilterChange ? props.handleTypeFilterChange : null;

    this.edit = false;

    this.render();
  }

  toggleEdit = () => {
    this.edit = !this.edit;
    this.render();
  };

  removeCharacter = async () => {
    const res = await fetch(
      `${window.location.origin}/api/remove_character/${this.character.id}`,
      {
        method: "DELETE",
      }
    );
    if (res.status === 204) {
      // window.alert(`Deleted ${this.title}`)
    } else {
      window.alert("Failed to delete character...");
    }
  };

  saveCharacter = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    if(formProps.type === "None") formProps.type = null;
    try {
      const res = await fetch(
        `${window.location.origin}/api/edit_character/${this.character.id}`,
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
      window.alert("Failed to save character...");
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
            value: this.character.title,
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
            this.character.description
          ),
          createElement("br"),
          createElement("div", {}, "Type Select (Optional)"),
          characterTypeSelect(null, this.character.type),
          createElement("br"),
          createElement("button", { type: "submit" }, "Done"),
        ],
        {
          type: "submit",
          event: async (e) => {
            await this.saveCharacter(e);
            this.toggleEdit();
            this.parentRender();
          },
        }
      ),
      createElement("br"),
      createElement("button", { class: "btn-red" }, "Remove Character", {
        type: "click",
        event: async () => {
          if (
            window.confirm(
              `Are you sure you want to delete ${this.character.title}`
            )
          ) {
            await this.removeCharacter();
            this.toggleEdit();
            this.parentRender();
          }
        },
      })
    );
  };

  renderCharacterType = () => {
    if (this.character.type) {
      return createElement(
        "a",
        { class: "small-clickable" },
        this.character.type,
        { type: "click", event: () => {
          if(this.handleTypeFilterChange) {
            this.handleTypeFilterChange(this.character.type);
          }
        } }
      );
    } else return createElement("div", { style: "display: none;" });
  };

  render = () => {
    this.domComponent.innerHTML = "";

    if (this.edit) {
      return this.renderEdit();
    }

    this.domComponent.append(
      createElement("div", { class: "component-title" }, [
        this.character.title,
        this.renderCharacterType(),
        createElement("img", {
          src: "../assets/character.svg",
          width: 30,
          height: 30,
        }),
      ]),
      createElement("div", { class: "description" }, this.character.description),
      createElement("br"),
      createElement("button", {}, "Open", {
        type: "click",
        event: () =>
          this.navigate({
            title: "single-character",
            sidebar: true,
            params: { character: this.character },
          }),
      }),
      createElement("button", {}, "Edit", {
        type: "click",
        event: this.toggleEdit,
      })
    );
  };
}