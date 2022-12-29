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

    this.creatingCharacter = false;

    this.render();
  }

  toggleCreatingCharacter = () => {
    this.creatingCharacter = !this.creatingCharacter;
    this.render();
  };

  getCharacters = async () => {
    try {
      const res = await fetch(
        `${window.location.origin}/api/get_characters/${state.currentProject}`
      );
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
    const projectId = state.currentProject;
    formProps.project_id = projectId;
    if (formProps.type === "None") formProps.type = null;

    try {
      const res = await fetch(`${window.location.origin}/api/add_character`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      createElement("div", {}, "Type Select (Optional)"),
      characterTypeSelect(null, null),
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
    // handle fitlers and search
    if (this.filter) {
      characterData = characterData.filter((character) => {
        return character.type && character.type === this.filter;
      });
    }
    if (this.searchTerm !== "") {
      characterData = characterData.filter((character) => {
        return character.title.toLowerCase().includes(this.searchTerm.toLowerCase());
      });
    }

    const charactersMap = characterData.map((character) => {
      // create element
      const elem = createElement("div", {
        id: `character-component-${character.id}`,
        class: "component",
      });

      new Character({
        domComponent: elem,
        character,
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
    this.render();
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    if (this.creatingCharacter) {
      return this.renderCreatingCharacter();
    }

    const characterElems = await this.renderCharactersElems();
    // append
    this.domComponent.append(
      createElement(
        "div",
        { style: "display: flex; justify-content: space-between; align-items: flex-end;" },
        [
          createElement("div", {}, [
            createElement("div", {}, "Filter by type"),
            characterTypeSelect(this.handleTypeFilterChange, this.filter),
          ]),
          createElement("div", {style: "display: flex; flex-direction: column;"}, [
            createElement(
              "button",
              { style: "align-self: flex-end; margin-bottom: 10px;" },
              "+ Character",
              {
                type: "click",
                event: this.toggleCreatingCharacter,
              }
            ),
            createElement(
              "input",
              { placeholder: "Search Characters", value: this.searchTerm },
              null,
              {
                type: "change",
                event: (e) => {
                  (this.searchTerm = e.target.value), this.render();
                },
              }
            ),
          ])
        ]
      ),
      createElement("h1", { style: "align-self: center;" }, "Characters"),
      createElement("br"),
      ...characterElems
    );
  };
}