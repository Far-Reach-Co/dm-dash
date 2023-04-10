import createElement from "./createElement.js";
import state from "./state.js";
import { postThing } from "./apiUtils.js";
import { getThings } from "./apiUtils.js";
import characterSelect from "./characterSelect.js";

export default class CurrentCharacterComponent {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className = "current-location-component";
    this.module = props.module;
    this.moduleType = props.moduleType;
    this.navigate = props.navigate;

    this.editingCurrentCharacter = false;

    this.render();
  }

  toggleEditingCurrentCharacter = () => {
    this.editingCurrentCharacter = !this.editingCurrentCharacter;
    this.render();
  };

  renderEditCurrentCharacterButtonOrNull = () => {
    // dont render if user is not an editor
    if (state.currentProject.isEditor === false)
      return createElement("div", { style: "invisibility: hidden;" });

    if (!this.editingCurrentCharacter) {
      return createElement(
        "a",
        {
          class: "small-clickable",
          style: "align-self: flex-end;",
        },
        "Edit",
        {
          type: "click",
          event: this.toggleEditingCurrentCharacter,
        }
      );
    } else return createElement("div", { style: "invisibility: hidden;" });
  };

  updateCurrentCharacter = (newCharacterId) => {
    postThing(`/api/edit_${this.moduleType}/${this.module.id}`, {
      character_id: newCharacterId,
    });
  };

  renderCurrentCharacter = async () => {
    let character = null;
    if (this.module.character_id) {
      character = await getThings(
        `/api/get_character/${this.module.character_id}`
      );
    }

    if (this.editingCurrentCharacter) {
      return createElement(
        "div",
        { style: "display: flex; flex-direction: column;" },
        await characterSelect(this.module.character_id, (newCharacterId) => {
          this.module.character_id = newCharacterId;
          this.toggleEditingCurrentCharacter();
          this.updateCurrentCharacter(newCharacterId);
        })
      );
    }

    if (!character) {
      return createElement("small", {}, "None...");
    } else {
      return createElement(
        "a",
        { class: "small-clickable", style: "margin: 3px;" },
        character.title,
        {
          type: "click",
          event: () =>
            this.navigate({
              title: "single-character",
              id: character.id,
              sidebar: true,
              params: { content: character },
            }),
        }
      );
    }
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    this.domComponent.append(
      createElement("div", { class: "single-info-box-subheading" }, [
        "With Character",
        this.renderEditCurrentCharacterButtonOrNull(),
      ]),
      await this.renderCurrentCharacter()
    );
  };
}
