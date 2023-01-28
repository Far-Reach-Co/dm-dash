import createElement from "../lib/createElement.js";
import characterTypeSelect from "../lib/characterTypeSelect.js";
import listItemTitle from "../lib/listItemTitle.js";
import { deleteThing, postThing } from "../lib/apiUtils.js";

export default class Character {
  constructor(props) {
    this.domComponent = props.domComponent;

    this.character = props.character;
    this.id = props.id;
    this.title = props.title;
    this.description = props.description;
    this.title = props.title;
    this.projectId = props.projectId;
    this.locationId = props.locationId;
    this.type = props.type;

    this.navigate = props.navigate;
    this.parentRender = props.parentRender;
    this.handleTypeFilterChange = props.handleTypeFilterChange
      ? props.handleTypeFilterChange
      : null;

    this.edit = false;

    this.render();
  }

  toggleEdit = () => {
    this.edit = !this.edit;
    this.render();
  };

  saveCharacter = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    if (formProps.type === "None") formProps.type = null;
    // update UI
    this.title = formProps.title;
    this.description = formProps.description;

    await postThing(
      `/api/edit_character/${this.id}`,
      formProps
    );
  };

  renderEdit = async () => {
    this.domComponent.append(
      createElement(
        "form",
        {},
        [
          createElement("div", {}, "Type Select (Optional)"),
          characterTypeSelect(null, this.type),
          createElement("br"),
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
            this.saveCharacter(e);
            this.toggleEdit();
          },
        }
      ),
      createElement("br"),
      createElement("button", { class: "btn-red" }, "Remove Character", {
        type: "click",
        event: () => {
          if (window.confirm(`Are you sure you want to delete ${this.title}`)) {
            deleteThing(`/api/remove_character/${this.id}`);
            this.toggleEdit();
            this.domComponent.remove();
          }
        },
      })
    );
  };

  renderCharacterType = () => {
    if (this.type) {
      return createElement("a", { class: "small-clickable" }, this.type, {
        type: "click",
        event: () => {
          if (this.handleTypeFilterChange) {
            this.handleTypeFilterChange(this.type);
          }
        },
      });
    } else return createElement("div", { style: "display: none;" });
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    if (this.edit) {
      return this.renderEdit();
    }

    this.domComponent.append(
      createElement("div", { class: "component-title" }, [
        await listItemTitle(this.title, this.toggleEdit),
        this.renderCharacterType(),
        createElement("img", {
          src: "/assets/character.svg",
          width: 30,
          height: 30,
        }),
      ]),
      createElement("div", { class: "description" }, this.description),
      createElement("br"),
      createElement("button", {}, "Open", {
        type: "click",
        event: () =>
          this.navigate({
            title: "single-character",
            sidebar: true,
            params: { content: this.character },
          }),
      })
    );
  };
}
