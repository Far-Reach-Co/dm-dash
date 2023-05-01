import { deleteThing, getThings, postThing } from "../lib/apiUtils.js";
import createElement from "../lib/createElement.js";
import renderLoadingWithMessage from "../lib/loadingWithMessage.js";
import playerCharacterSelect from "../lib/playerCharacterSelect.js";
import state from "../lib/state.js";

export default class PlayersView {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className = "standard-view";
    this.navigate = props.navigate;

    this.connect = false;
    this.connectLoading = false;

    this.render();
  }

  toggleConnect = () => {
    this.connect = !this.connect;
    this.render();
  };

  toggleConnectLoading = () => {
    this.connectLoading = !this.connectLoading;
    this.render();
  };

  addConnection = async (e) => {
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    formProps.project_id = state.currentProject.id;
    if (Object.values(formProps)[0] != 0) {
      this.toggleConnectLoading();
      await postThing(`/api/add_project_player`, formProps);
      this.toggleConnectLoading();
    }
  };

  renderCurrentConnections = async () => {
    const projectPlayerIds = await getThings(
      `/api/get_project_players_by_project/${state.currentProject.id}`
    );
    if (!projectPlayerIds.length)
      return [createElement("small", {}, "None...")];
    let myPlayerCharacters = await getThings(`/api/get_5e_characters_by_user`);
    return await Promise.all(
      myPlayerCharacters
        .filter((pc) => {
          const list = [];
          for (var pp of projectPlayerIds) {
            console.log(pp);
            if (pp.player_id === pc.id) {
              list.push(pc);
            }
            return list;
          }
        })
        .map(async (player) => {
          if (player) {
            const projectPlayerId = projectPlayerIds.filter(
              (pp) => player.id === pp.player_id
            )[0].id;
            const elem = createElement(
              "div",
              { style: "margin-left: var(--main-distance); display: flex;" },
              [
                player.name,
                createElement(
                  "div",
                  {
                    style:
                      "color: var(--red1); margin-left: var(--main-distance); cursor: pointer;",
                    title: "Remove connection",
                  },
                  "ⓧ",
                  {
                    type: "click",
                    event: () => {
                      deleteThing(
                        `/api/remove_project_player/${projectPlayerId}`
                      );
                      elem.remove();
                    },
                  }
                ),
              ]
            );
            return elem;
          }
        })
    );
  };

  renderConnect = async () => {
    if (this.connectLoading) {
      return this.domComponent.append(
        renderLoadingWithMessage(
          "Please wait while we setup your connection..."
        )
      );
    }

    this.domComponent.append(
      createElement("div", {}, [
        createElement("h1", {}, `Connect Players`),
        createElement("hr"),
        createElement("h2", {}, "Current connections"),
        ...(await this.renderCurrentConnections()),
        createElement("hr"),
        createElement("h2", {}, "Add connections"),
        createElement(
          "form",
          {},
          [
            await playerCharacterSelect(),
            createElement("br"),
            createElement(
              "button",
              { class: "new-btn", type: "submit" },
              "Add"
            ),
          ],
          {
            type: "submit",
            event: async (e) => {
              e.preventDefault();
              await this.addConnection(e);
            },
          }
        ),
        createElement("hr"),
        createElement("button", {}, "Done", {
          type: "click",
          event: () => {
            this.toggleConnect();
          },
        }),
      ])
    );
  };

  renderCharacterList = async () => {
    // get project players list
    const projectPlayers = await getThings(
      `/api/get_project_players_by_project/${state.currentProject.id}`
    );
    // if not the creator of this project only view your own characters
    if (state.currentProject.wasJoined) {
      const sheetData = await getThings("/api/get_5e_characters_by_user");
      if (!sheetData.length) {
        return [createElement("div", {}, "*You have not linked a player yet.")];
      }
      const sheetMap = sheetData
        .filter((characterSheet) => {
          for (var projectPlayer of projectPlayers) {
            if (projectPlayer.player_id === characterSheet.id)
              return characterSheet;
          }
        })
        .map((characterSheet) => {
          const elem = createElement("div");
          new PlayerComponent({
            domComponent: elem,
            sheet: characterSheet,
            navigate: this.navigate,
          });
          return elem;
        });
      if (!sheetMap.length) {
        return [createElement("div", {}, "*You have not linked a player yet.")];
      } else return sheetMap;
    } else {
      // show all connected characters
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
    this.domComponent.innerHTML = "";

    if (this.connect) {
      return this.renderConnect();
    }

    this.domComponent.append(
      createElement(
        "button",
        { title: "Connect a player character sheet to this wyrld" },
        "🔗 Player Character",
        {
          type: "click",
          event: this.toggleConnect,
        }
      ),
      createElement("hr"),
      createElement("br"),
      ...(await this.renderCharacterList())
    );
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
          title: "Open player character sheet",
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
      //     class: "icon gear",
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
