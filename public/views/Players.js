import { deleteThing, getThings, postThing } from "../lib/apiUtils.js";
import createElement from "../lib/createElement.js";
import renderLoadingWithMessage from "../lib/loadingWithMessage.js";
import playerCharacterSelect from "../lib/playerCharacterSelect.js";
import state from "../lib/state.js";
import { tipBox } from "../lib/tipBox.js";

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

    const sheets = await Promise.all(
      projectPlayerIds.map(async (projectPlayer) => {
        // get character sheet for linked player character
        const characterSheet = await getThings(
          `/api/get_5e_character_general/${projectPlayer.player_id}`
        );

        return characterSheet;
      })
    );
    return sheets
      .filter((sheet) => sheet.user_id === state.user.id)
      .map((characterSheet) => {
        const elem = createElement(
          "div",
          {
            style:
              "margin-left: var(--main-distance); display: flex; color: var(--blue6);",
          },
          [
            characterSheet.name,
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
                  deleteThing(`/api/remove_project_player/${projectPlayer.id}`);
                  elem.remove();
                },
              }
            ),
          ]
        );
        return elem;
      });
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
        createElement("h2", {}, `Connection existing sheets`),
        createElement(
          "div",
          { class: "hint" },
          "*Connect your player character sheets to this wyrld for ease of access, and to allow your Game Master the ability to view and edit."
        ),
        createElement("br"),
        createElement("h3", {}, "Current connections"),
        ...(await this.renderCurrentConnections()),
        createElement("br"),
        createElement("h3", {}, "Add connections"),
        createElement(
          "form",
          {
            style:
              "flex-direction: row; align-items: center; flex-start; justify-content: flex-start;",
          },
          [
            await playerCharacterSelect(),
            createElement(
              "button",
              {
                class: "new-btn",
                type: "submit",
                title: "Add your sheet to this wyrld",
                style: "margin-left: var(--main-distance);",
              },
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
        "Connect existing sheet 🔗",
        {
          type: "click",
          event: this.toggleConnect,
        }
      ),
      createElement("hr"),
      tipBox(
        "We currently only offer player character sheets for Dungeons and Dragons 5e. In the future we intend to support more games.",
        "/assets/peli/small/peli_hide_small.png",
        false
      ),
      createElement("br"),
      createElement(
        "div",
        {
          style:
            "display: flex; flex: 1; align-items: flex-end; flex-wrap: wrap-reverse;",
        },
        [
          createElement(
            "div",
            {
              style:
                "display: flex; flex-direction: column; margin-right: var(--main-distance);",
            },
            [
              createElement(
                "div",
                { style: "margin-bottom: var(--main-distance);" },
                tipBox(
                  "As a non-GM you only have access to view/edit your own player sheets.",
                  "/assets/peli/small/peli_note_small.png",
                  true
                )
              ),
              createElement(
                "div",
                {},
                tipBox(
                  "Player character sheets, which have been connected to this wyrld, will be accessible by the GMs to view and edit.",
                  "/assets/peli/small/peli_dm_small.png",
                  true
                )
              ),
            ]
          ),
          createElement(
            "div",
            { style: "display: flex; flex: 1; flex-direction: column;" },
            [...(await this.renderCharacterList())]
          ),
        ]
      )
    );
  };
}

class PlayerComponent {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className = "project-btn-container";
    this.sheet = props.sheet;
    this.navigate = props.navigate;

    this.hasAccess =
      state.currentProject.isEditor ||
      !state.currentProject.wasJoined ||
      this.sheet.user_id === state.user.id
        ? true
        : false;

    this.render();
  }

  render = () => {
    this.domComponent.innerHTML = "";
    this.domComponent.append(
      createElement(
        "div",
        {
          class: `project-button ${this.hasAccess ? null : "pb-inactive"}`,
          title: "Open player character sheet",
        },
        [
          createElement("h1", {}, this.sheet.name),
          createElement("div", { class: "project-btn-info-box" }, [
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
          ]),
        ],
        {
          type: "click",
          event: () => {
            if (!this.hasAccess) return;
            this.navigate({
              title: "single-player",
              sidebar: true,
              params: { content: this.sheet },
            });
          },
        }
      )
    );
  };
}
