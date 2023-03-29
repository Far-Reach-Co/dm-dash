import createElement from "../lib/createElement.js";
import state from "../lib/state.js";
import Lore from "../components/lore.js";
import loreTypeSelect from "../lib/loreTypeSelect.js";
import { getThings, postThing } from "../lib/apiUtils.js";
import searchElement from "../lib/searchElement.js";
import renderLoadingWithMessage from "../lib/loadingWithMessage.js";
import { uploadImage } from "../lib/imageUtils.js";
import RichText from "../lib/RichText.js";

export default class LoresView {
  constructor(props) {
    this.navigate = props.navigate;
    this.domComponent = props.domComponent;
    this.domComponent.className = "standard-view";
    this.searchTerm = "";

    this.searchTerm = "";
    this.filter = null;
    this.limit = state.config.queryLimit;
    this.offset = 0;

    this.creatingLore = false;
    this.newLoreLoading = false;

    this.render();
  }

  resetFilters = () => {
    this.searchTerm = "";
    this.filter = null;
    this.offset = 0;
  };

  toggleCreatingLore = () => {
    this.creatingLore = !this.creatingLore;
    this.render();
  };

  toggleNewLoreLoading = () => {
    this.newLoreLoading = !this.newLoreLoading;
    this.render();
  };

  getLores = async () => {
    let url = `/api/get_lores/${state.currentProject.id}/${this.limit}/${this.offset}`;
    if (
      !this.filter &&
      this.searchTerm &&
      this.searchTerm !== "" &&
      this.searchTerm !== " "
    )
      url = `/api/get_lores_keyword/${state.currentProject.id}/${this.limit}/${this.offset}/${this.searchTerm}`;
    if (
      this.filter &&
      this.searchTerm &&
      this.searchTerm !== "" &&
      this.searchTerm !== " "
    )
      url = `/api/get_lores_filter_keyword/${state.currentProject.id}/${this.limit}/${this.offset}/${this.filter}/${this.searchTerm}`;
    if (this.filter && (this.searchTerm === "" || this.searchTerm === " "))
      url = `/api/get_lores_filter/${state.currentProject.id}/${this.limit}/${this.offset}/${this.filter}`;

    return await getThings(url);
  };

  newLore = async (e, description) => {
    this.toggleNewLoreLoading();
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    formProps.description = description;
    const projectId = state.currentProject.id;
    formProps.project_id = projectId;
    if (formProps.type === "None") formProps.type = null;
    if (formProps.image && formProps.image.size === 0) delete formProps.image;

    // if there is an image
    if (formProps.image) {
      // upload to bucket
      const newImage = await uploadImage(
        formProps.image,
        state.currentProject.id,
        this.imageId
      );
      // if success update formProps and set imageRef for UI
      if (newImage) {
        formProps.image_id = newImage.id;
      }
      delete formProps.image;
    }

    await postThing("/api/add_lore", formProps);
    this.toggleNewLoreLoading();
  };

  renderCreatingLore = async () => {
    const titleOfForm = createElement(
      "div",
      { class: "component-title" },
      "Create new lore"
    );

    const richText = new RichText({});

    const form = createElement("form", {}, [
      createElement("div", {}, "Type Select (Optional)"),
      loreTypeSelect(null, null),
      createElement("br"),
      createElement("label", { for: "title" }, "Title"),
      createElement("input", {
        id: "title",
        name: "title",
        placeholder: "Lore Title",
        required: true,
      }),
      createElement("label", { for: "description" }, "Description"),
      richText,
      createElement("br"),
      createElement(
        "label",
        { for: "image", class: "file-input" },
        "Upload Image"
      ),
      createElement("input", {
        id: "image",
        name: "image",
        type: "file",
        accept: "image/*",
      }),
      createElement("br"),
      createElement("br"),
      createElement("button", { type: "submit" }, "Create"),
    ]);
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      this.creatingLore = false;
      await this.newLore(e, richText.children[1].innerHTML);
    });

    const cancelButton = createElement(
      "button",
      { class: "btn-red" },
      "Cancel"
    );
    cancelButton.addEventListener("click", () => {
      this.toggleCreatingLore();
    });

    this.domComponent.append(
      titleOfForm,
      createElement("br"),
      form,
      createElement("br"),
      cancelButton
    );
  };

  renderLoresElems = async () => {
    let loreData = await this.getLores();

    const loresMap = loreData.map((lore) => {
      // create element
      const elem = createElement("div", {
        id: `lore-component-${lore.id}`,
        class: "component",
      });

      new Lore({
        domComponent: elem,
        lore: lore,
        id: lore.id,
        title: lore.title,
        description: lore.description,
        projectId: lore.project_id,
        type: lore.type,
        imageId: lore.image_id,
        navigate: this.navigate,
        parentRender: this.render,
        handleTypeFilterChange: this.handleTypeFilterChange,
      });

      return elem;
    });

    if (loresMap.length) return loresMap;
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
      return createElement("button", { class: "new-btn" }, "+ Lore", {
        type: "click",
        event: this.toggleCreatingLore,
      });
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    if (this.creatingLore) {
      return this.renderCreatingLore();
    }

    if (this.newLoreLoading) {
      return this.domComponent.append(
        renderLoadingWithMessage("Please wait while we create your lore...")
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
                loreTypeSelect(this.handleTypeFilterChange, this.filter),
              ]
            ),
            searchElement("Search Lore", this),
          ]),
        ]
      ),
      createElement("hr"),
      ...(await this.renderLoresElems()),
      createElement("a", { style: "align-self: center;" }, "More", {
        type: "click",
        event: async (e) => {
          this.offset += state.config.queryOffset;
          e.target.before(...(await this.renderLoresElems()));
        },
      })
    );
  };
}
