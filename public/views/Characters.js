import createElement from "../lib/createElement.js";
import state from "../lib/state.js";
import Character from "../components/Character.js";
import characterTypeSelect from "../lib/characterTypeSelect.js";

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

  getCharacters = async () => {
    let url = `${window.location.origin}/api/get_characters/${state.currentProject.id}/${this.limit}/${this.offset}`;
    if (
      !this.filter &&
      this.searchTerm &&
      this.searchTerm !== "" &&
      this.searchTerm !== " "
    )
      url = `${window.location.origin}/api/get_characters_keyword/${state.currentProject.id}/${this.limit}/${this.offset}/${this.searchTerm}`;
    if (
      this.filter &&
      this.searchTerm &&
      this.searchTerm !== "" &&
      this.searchTerm !== " "
    )
      url = `${window.location.origin}/api/get_characters_filter_keyword/${state.currentProject.id}/${this.limit}/${this.offset}/${this.filter}/${this.searchTerm}`;
    if (this.filter && (this.searchTerm === "" || this.searchTerm === " "))
      url = `${window.location.origin}/api/get_characters_filter/${state.currentProject.id}/${this.limit}/${this.offset}/${this.filter}`;

    try {
      const res = await fetch(url, {
        headers: {
          "x-access-token": `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      if (res.status === 200) {
        return data;
      } else throw new Error();
    } catch (err) {
      console.log(err);
    }
  };

  newCharacter = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    const projectId = state.currentProject.id;
    formProps.project_id = projectId;
    if (formProps.type === "None") formProps.type = null;

    try {
      const res = await fetch(`${window.location.origin}/api/add_character`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formProps),
      });
      await res.json();
      if (res.status === 201) {
        this.render();
      } else throw new Error();
    } catch (err) {
      window.alert("Failed to create new character...");
      console.log(err);
    }
  };

  renderCreatingCharacter = async () => {
    const titleOfForm = createElement(
      "div",
      { class: "component-title" },
      "Create new character"
    );
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
      createElement("textarea", {
        id: "description",
        name: "description",
      }),
      createElement("br"),
      createElement("button", { type: "submit" }, "Create"),
    ]);
    form.addEventListener("submit", async (e) => {
      await this.newCharacter(e);
      this.toggleCreatingCharacter();
    });

    const cancelButton = createElement("button", {}, "Cancel");
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
        {class: "new-btn"},
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

    // append
    this.domComponent.append(
      createElement(
        "div",
        {
          class: "view-options-container"
        },
        [
          this.renderAddButtonOrNull(),
          createElement("div", {class: "view-filter-options-container"}, [
            createElement(
              "div",
              { style: "display: flex; flex-direction: column;" },
              [
                createElement("small", {}, "Filter by type"),
                characterTypeSelect(this.handleTypeFilterChange, this.filter),
              ]
            ),
            createElement("br"),
            createElement(
              "input",
              { placeholder: "Search Characters", value: this.searchTerm },
              null,
              {
                type: "change",
                event: (e) => {
                  this.offset = 0;
                  (this.searchTerm = e.target.value.toLowerCase()),
                    this.render();
                },
              }
            ),
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
