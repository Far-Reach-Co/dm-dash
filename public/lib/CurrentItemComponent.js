import createElement from "./createElement.js";
import state from "./state.js";
import { postThing } from "./apiUtils.js";
import { getThings } from "./apiUtils.js";
import itemSelect from "./itemSelect.js";

export default class CurrentItemComponent {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className = "current-location-component";
    this.module = props.module;
    this.moduleType = props.moduleType;
    this.navigate = props.navigate;

    this.editingCurrentItem = false;

    this.render();
  }

  toggleEditingCurrentItem = () => {
    this.editingCurrentItem = !this.editingCurrentItem;
    this.render();
  };

  renderEditCurrentItemButtonOrNull = () => {
    // dont render if user is not an editor
    if (state.currentProject.isEditor === false)
      return createElement("div", { style: "invisibility: hidden;" });

    if (!this.editingCurrentItem) {
      return createElement(
        "a",
        {
          class: "small-clickable",
          style: "align-self: flex-end;",
        },
        "Edit",
        {
          type: "click",
          event: this.toggleEditingCurrentItem,
        }
      );
    } else return createElement("div", { style: "invisibility: hidden;" });
  };

  updateCurrentItem = (newItemId) => {
    postThing(`/api/edit_${this.moduleType}/${this.module.id}`, {
      item_id: newItemId,
    });
  };

  renderCurrentItem = async () => {
    let item = null;
    if (this.module.item_id) {
      item = await getThings(`/api/get_item/${this.module.item_id}`);
    }

    if (this.editingCurrentItem) {
      return createElement(
        "div",
        { style: "display: flex; flex-direction: column;" },
        await itemSelect(this.module.item_id, (newItemId) => {
          this.module.item_id = newItemId;
          this.toggleEditingCurrentItem();
          this.updateCurrentItem(newItemId);
        })
      );
    }

    if (!item) {
      return createElement("small", {}, "None...");
    } else {
      return createElement(
        "a",
        { class: "small-clickable", style: "margin: 3px;" },
        item.title,
        {
          type: "click",
          event: () =>
            this.navigate({
              title: "single-item",
              id: item.id,
              sidebar: true,
              params: { content: item },
            }),
        }
      );
    }
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    this.domComponent.append(
      createElement("div", { class: "single-info-box-subheading" }, [
        "With Item",
        this.renderEditCurrentItemButtonOrNull(),
      ]),
      await this.renderCurrentItem()
    );
  };
}
