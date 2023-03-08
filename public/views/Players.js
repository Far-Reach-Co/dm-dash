import { getThings } from "../lib/apiUtils.js";
import createElement from "../lib/createElement.js";
import state from "../lib/state.js";

export default class PlayersView {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className = "standard-view";
    this.navigate = props.navigate;

    this.render();
  }

  renderCharacterList = async () => {
    if (state.currentProject.wasJoined) {
      const sheetData = await getThings("/api/get_5e_characters_by_user");
      if (!sheetData.length) {
        return [createElement("div", {}, "*You have not linked a player yet.")];
      }
      return sheetData.map(characterSheet => {
        const elem = createElement("div");
        new PlayerComponent({
          domComponent: elem,
          sheet: characterSheet,
          navigate: this.navigate,
        });
        return elem;
      })
    } else {
      const projectPlayers = await getThings(
        `/api/get_project_players_by_project/${state.currentProject.id}`
      );
      if (!projectPlayers.length) {
        return [createElement("div", {}, "*No players have been linked yet.")];
      }
      return await Promise.all(
        projectPlayers.map(async (projectPlayer) => {
          const characterSheet = await getThings(
            `/api/get_5e_character_general/${projectPlayer.player_id}`
          );
          const elem = createElement("div");
          new PlayerComponent({
            domComponent: elem,
            sheet: characterSheet,
            navigate: this.navigate,
          });
          return elem;
        })
      );
    }
  };

  render = async () => {
    this.domComponent.append(...(await this.renderCharacterList()));
  };
}

class PlayerComponent {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className = "project-btn-container";
    this.sheet = props.sheet;
    this.navigate = props.navigate;

    this.edit = false;

    this.render();
  }

  toggleEdit = () => {
    this.edit = !this.edit;
    this.render();
  };

  renderEdit = async () => {
    this.domComponent.append(createElement("div", {}, []));
  };

  render = () => {
    this.domComponent.innerHTML = "";

    if (this.edit) {
      return this.renderEdit();
    }

    this.domComponent.append(
      createElement(
        "div",
        {
          class: "project-button",
          style:
            "flex-direction: row; align-items: center; justify-content: space-between;",
        },
        [
          createElement(
            "div",
            {
              style:
                "display: flex; align-items: center; justify-content: center;",
            },
            createElement("h1", {}, this.sheet.name)
          ),
          createElement(
            "div",
            { style: "display: flex; flex-direction: column;" },
            [
              createElement(
                "small",
                {},
                `Race: ${this.sheet.race ? this.sheet.race : "None"}`
              ),
              createElement(
                "small",
                {},
                `Class: ${this.sheet.class ? this.sheet.class : "None"}`
              ),
              createElement(
                "small",
                {},
                `Level: ${this.sheet.level ? this.sheet.level : "None"}`
              ),
              createElement(
                "small",
                {},
                `EXP: ${this.sheet.exp ? this.sheet.exp : "None"}`
              ),
            ]
          ),
        ],
        {
          type: "click",
          event: () => {
            this.navigate({
              title: "single-player",
              sidebar: true,
              params: { content: this.sheet },
            });
          },
        }
      )
      // createElement(
      //   "img",
      //   {
      //     class: "icon",
      //     src: "/assets/gears.svg",
      //   },
      //   null,
      //   {
      //     type: "click",
      //     event: this.toggleEdit,
      //   }
      // )
    );
  };
}
