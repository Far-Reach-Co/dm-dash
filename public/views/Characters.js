import createElement from "../lib/createElement.js";
import state from "../lib/state.js";
import Character from "../components/Character.js";
import characterTypeSelect from "../lib/characterTypeSelect.js";
import { getThings, postThing } from "../lib/apiUtils.js";
import searchElement from "../lib/searchElement.js";
import renderLoadingWithMessage from "../lib/loadingWithMessage.js";
import { uploadProjectImage } from "../lib/imageUtils.js";
import RichText from "../lib/RichText.js";

export default class CharactersView {
  constructor(props) {
    this.navigate = props.navigate;
    this.domComponent = props.domComponent;
    this.domComponent.className = "standard-view";

    this.searchTerm = "";
    this.filter = null;
    this.limit = state.config.queryLimit;
    this.offset = 0;

    this.creatingCharacter = false;
    this.newCharacterLoading = false;

    this.render();
  }

  resetFilters = () => {
    this.searchTerm = "";
    this.filter = null;
    this.offset = 0;
  };

  toggleCreatingCharacter = () => {
    this.creatingCharacter = !this.creatingCharacter;
    this.render();
  };

  toggleNewCharacterLoading = () => {
    this.newCharacterLoading = !this.newCharacterLoading;
    this.render();
  };

  getCharacters = async () => {
    let url = `/api/get_characters/${state.currentProject.id}/${this.limit}/${this.offset}`;
    if (
      !this.filter &&
      this.searchTerm &&
      this.searchTerm !== "" &&
      this.searchTerm !== " "
    )
      url = `/api/get_characters_keyword/${state.currentProject.id}/${this.limit}/${this.offset}/${this.searchTerm}`;
    if (
      this.filter &&
      this.searchTerm &&
      this.searchTerm !== "" &&
      this.searchTerm !== " "
    )
      url = `/api/get_characters_filter_keyword/${state.currentProject.id}/${this.limit}/${this.offset}/${this.filter}/${this.searchTerm}`;
    if (this.filter && (this.searchTerm === "" || this.searchTerm === " "))
      url = `/api/get_characters_filter/${state.currentProject.id}/${this.limit}/${this.offset}/${this.filter}`;

    return await getThings(url);
  };

  newCharacter = async (e, description) => {
    this.toggleNewCharacterLoading();
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
      const newImage = await uploadProjectImage(
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

    await postThing("/api/add_character", formProps);
    this.toggleNewCharacterLoading();
  };

  renderCreatingCharacter = async () => {
    const titleOfForm = createElement(
      "div",
      { class: "component-title" },
      "Create new character"
    );

    const richText = new RichText({});

    const form = createElement("form", {}, [
      createElement("div", {}, "Type Select (Optional)"),
      characterTypeSelect(null, null),
      createElement("br"),
      createElement("label", { for: "title" }, "Title"),
      createElement("input", {
        id: "title",
        name: "title",
        placeholder: "Character Title",
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
      this.creatingCharacter = false;
      await this.newCharacter(e, richText.children[1].innerHTML);
    });

    const cancelButton = createElement(
      "button",
      { class: "btn-red" },
      "Cancel"
    );
    cancelButton.addEventListener("click", () => {
      this.toggleCreatingCharacter();
    });

    this.domComponent.append(
      titleOfForm,
      createElement("br"),
      form,
      createElement("br"),
      cancelButton
    );
  };

  renderCharactersElems = async () => {
    let characterData = await this.getCharacters();

    const charactersMap = characterData.map((character) => {
      // create element
      const elem = createElement("div", {
        id: `character-component-${character.id}`,
        class: "component",
      });

      new Character({
        domComponent: elem,
        character: character,
        id: character.id,
        title: character.title,
        description: character.description,
        projectId: character.project_id,
        locationId: character.location_id,
        type: character.type,
        imageId: character.image_id,
        navigate: this.navigate,
        parentRender: this.render,
        handleTypeFilterChange: this.handleTypeFilterChange,
      });

      return elem;
    });

    if (charactersMap.length) return charactersMap;
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
      return createElement(
        "button",
        { class: "new-btn", title: "Create new character" },
        "+ Character",
        {
          type: "click",
          event: this.toggleCreatingCharacter,
        }
      );
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    if (this.creatingCharacter) {
      return this.renderCreatingCharacter();
    }

    if (this.newCharacterLoading) {
      return this.domComponent.append(
        renderLoadingWithMessage(
          "Please wait while we create your character..."
        )
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
                characterTypeSelect(this.handleTypeFilterChange, this.filter),
              ]
            ),
            createElement("br"),
            searchElement("Search Characters", this),
          ]),
        ]
      ),
      createElement("hr"),
      ...(await this.renderCharactersElems()),
      createElement("a", { style: "align-self: center;" }, "More", {
        type: "click",
        event: async (e) => {
          this.offset += state.config.queryOffset;
          e.target.before(...(await this.renderCharactersElems()));
        },
      })
    );
  };
}
