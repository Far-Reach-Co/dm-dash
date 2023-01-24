import createElement from "../lib/createElement.js";
import itemTypeSelect from "../lib/itemTypeSelect.js";
import defaultEditButton from "../lib/defaultEditButton.js";

export default class Item {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.item = props.item;
    this.id = props.id;
    this.title = props.title;
    this.description = props.description;
    this.title = props.title;
    this.projectId = props.projectId;
    this.locationId = props.locationId;
    this.characterId = props.characterId;
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

  removeItem = async () => {
    const res = await fetch(
      `${window.location.origin}/api/remove_item/${this.id}`,
      {
        method: "DELETE",
        headers: {
          "x-access-token": `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    if (res.status === 204) {
      // window.alert(`Deleted ${this.title}`)
    } else {
      // window.alert("Failed to delete item...");
    }
  };

  saveItem = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    if (formProps.type === "None") formProps.type = null;
    // update UI
    this.title = formProps.title;
    this.description = formProps.description;

    try {
      const res = await fetch(
        `${window.location.origin}/api/edit_item/${this.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-access-token": `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(formProps),
        }
      );
      await res.json();
      if (res.status === 200) {
      } else throw new Error();
    } catch (err) {
      // window.alert("Failed to save item...");
      console.log(err);
    }
  };

  renderEdit = async () => {
    this.domComponent.append(
      createElement(
        "form",
        {},
        [
          createElement("div", {}, "Type Select (Optional)"),
          itemTypeSelect(null, this.type),
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
            this.saveItem(e);
            this.toggleEdit();
          },
        }
      ),
      createElement("br"),
      createElement("button", { class: "btn-red" }, "Remove Item", {
        type: "click",
        event: () => {
          if (window.confirm(`Are you sure you want to delete ${this.title}`)) {
            this.removeItem();
            this.toggleEdit();
            this.domComponent.remove();
          }
        },
      })
    );
  };

  renderItemType = () => {
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
        await defaultEditButton(this.title, this.toggleEdit),
        this.renderItemType(),
        createElement("img", {
          src: "../assets/item.svg",
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
            title: "single-item",
            sidebar: true,
            params: { item: this.item },
          }),
      })
    );
  };
}
