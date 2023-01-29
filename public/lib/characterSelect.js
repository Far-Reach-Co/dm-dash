import createElement from "../lib/createElement.js";
import { getThings } from "./apiUtils.js";
import state from "./state.js";

export default async function characterSelect(
  selectedCharacter,
  onChangeCallback
) {
  async function renderCharacterSelectOptions() {
    let characters = await getThings(
      `/api/get_characters/${state.currentProject.id}/100/0`
    );

    const characterElemsList = [];

    characters.forEach((character) => {
      const elem = createElement(
        "option",
        { value: character.id },
        character.title
      );
      if (selectedCharacter == character.id) elem.selected = true;
      characterElemsList.push(elem);
    });

    return characterElemsList;
  }

  return createElement(
    "select",
    { id: "character_id", name: "character_id", required: false },
    [
      createElement("option", { value: 0 }, "None"),
      ...(await renderCharacterSelectOptions()),
    ],
    {
      type: "change",
      event: (e) => {
        if (onChangeCallback) onChangeCallback(e.target.value);
      },
    }
  );
}
