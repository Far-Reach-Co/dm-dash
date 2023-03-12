import createElement from "../lib/createElement.js";
import { getThings } from "./apiUtils.js";

export default async function playerCharacterSelect() {
  async function renderPlayerCharacterOptions() {
    let players = await getThings(`/api/get_5e_characters_by_user`);

    const playerElemList = [];

    players.forEach((player) => {
      const elem = createElement(
        "option",
        { value: player.id },
        player.name
      );
      playerElemList.push(elem);
    });

    return playerElemList;
  }

  return createElement(
    "select",
    { id: "player_id", name: "player_id", required: false },
    [
      createElement("option", { value: 0 }, "None"),
      ...(await renderPlayerCharacterOptions()),
    ]
  );
}
