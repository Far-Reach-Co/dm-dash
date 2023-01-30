import createElement from "../lib/createElement.js";
import state from "../lib/state.js";
import Item from "../components/Item.js";
import itemTypeSelect from "../lib/itemTypeSelect.js";
import { getThings, postThing } from "../lib/apiUtils.js";
import searchElement from "../lib/searchElement.js";
import renderLoadingWithMessage from "../lib/loadingWithMessage.js";

export default class ItemsView {
  constructor(props) {
    this.navigate = props.navigate;
    this.domComponent = props.domComponent;
    this.domComponent.className = "standard-view";
    this.searchTerm = "";

    this.searchTerm = "";
    this.filter = null;
    this.limit = state.config.queryLimit;
    this.offset = 0;

    this.creatingItem = false;
    this.newItemLoading = false;

    this.render();
  }

  resetFilters = () => {
    this.searchTerm = "";
    this.filter = null;
    this.offset = 0;
  };

  toggleCreatingItem = () => {
    this.creatingItem = !this.creatingItem;
    this.render();
  };

  toggleNewItemLoading = () => {
    this.newItemLoading = !this.newItemLoading;
    this.render();
  };

  getItems = async () => {
    let url = `/api/get_items/${state.currentProject.id}/${this.limit}/${this.offset}`;
    if (
      !this.filter &&
      this.searchTerm &&
      this.searchTerm !== "" &&
      this.searchTerm !== " "
    )
      url = `/api/get_items_keyword/${state.currentProject.id}/${this.limit}/${this.offset}/${this.searchTerm}`;
    if (
      this.filter &&
      this.searchTerm &&
      this.searchTerm !== "" &&
      this.searchTerm !== " "
    )
      url = `/api/get_items_filter_keyword/${state.currentProject.id}/${this.limit}/${this.offset}/${this.filter}/${this.searchTerm}`;
    if (this.filter && (this.searchTerm === "" || this.searchTerm === " "))
      url = `/api/get_items_filter/${state.currentProject.id}/${this.limit}/${this.offset}/${this.filter}`;

    return await getThings(url);
  };

  newItem = async (e) => {
    this.toggleNewItemLoading();
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    const projectId = state.currentProject.id;
    formProps.project_id = projectId;
    if (formProps.type === "None") formProps.type = null;

    await postThing("/api/add_item", formProps)
    this.toggleNewItemLoading();
  };

  renderCreatingItem = async () => {
    const titleOfForm = createElement(
      "div",
      { class: "component-title" },
      "Create new item"
    );
    const form = createElement("form", {}, [
      createElement("div", {}, "Type Select (Optional)"),
      itemTypeSelect(null, null),
      createElement("br"),
      createElement("label", { for: "title" }, "Title"),
      createElement("input", {
        id: "title",
        name: "title",
        placeholder: "Item Title",
        required: true,
      }),
      createElement("label", { for: "description" }, "Description"),
      createElement("textarea", {
        id: "description",
        name: "description",
      }),
      createElement("br"),
      createElement("button", { type: "submit" }, "Create"),
    ]);
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      this.creatingItem = false;
      await this.newItem(e);
    });

    const cancelButton = createElement("button", {class: "btn-red"}, "Cancel");
    cancelButton.addEventListener("click", () => {
      this.toggleCreatingItem();
    });

    this.domComponent.append(
      titleOfForm,
      createElement("br"),
      form,
      createElement("br"),
      cancelButton
    );
  };

  renderItemsElems = async () => {
    let itemData = await this.getItems();

    const itemsMap = itemData.map((item) => {
      // create element
      const elem = createElement("div", {
        id: `item-component-${item.id}`,
        class: "component",
      });

      new Item({
        domComponent: elem,
        item: item,
        id: item.id,
        title: item.title,
        description: item.description,
        projectId: item.project_id,
        locationId: item.location_id,
        characterId: item.character_id,
        type: item.type,
        imageRef: item.image_ref,
        navigate: this.navigate,
        parentRender: this.render,
        handleTypeFilterChange: this.handleTypeFilterChange,
      });

      return elem;
    });

    if (itemsMap.length) return itemsMap;
    else return [createElement("div", {}, "None...")];
  };

  handleTypeFilterChange = (value) => {
    if (value === "None") value = null;
    this.filter = value;
    this.offset = 0;
    this.render();
  };

  renderAddButtonOrNull = () => {
    if (state.currentProject.isEditor === false) {
      return createElement("div", { style: "visibility: hidden;" });
    } else
      return createElement("button", { class: "new-btn" }, "+ Item", {
        type: "click",
        event: this.toggleCreatingItem,
      });
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    if (this.creatingItem) {
      return this.renderCreatingItem();
    }

    if (this.newItemLoading) {
      return this.domComponent.append(
        renderLoadingWithMessage("Please wait while we create your item...")
      );
    }

    // append
    this.domComponent.append(
      createElement(
        "div",
        {
          class: "view-options-container",
        },
        [
          this.renderAddButtonOrNull(),
          createElement("div", { class: "view-filter-options-container" }, [
            createElement(
              "div",
              { style: "display: flex; flex-direction: column;" },
              [
                createElement("small", {}, "Filter by type"),
                itemTypeSelect(this.handleTypeFilterChange, this.filter),
              ]
            ),
            searchElement("Search Items", this)
          ]),
        ]
      ),
      createElement("hr"),
      ...(await this.renderItemsElems()),
      createElement("a", { style: "align-self: center;" }, "More", {
        type: "click",
        event: async (e) => {
          this.offset += state.config.queryOffset;
          e.target.before(...(await this.renderItemsElems()));
        },
      })
    );
  };
}
