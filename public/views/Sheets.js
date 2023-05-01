import createElement from "../lib/createElement.js";
import accountManager from "../lib/AccountManager.js"; // dont remove
import renderLoadingWithMessage from "../lib/loadingWithMessage.js";
import { deleteThing, getThings, postThing } from "../lib/apiUtils.js";
import projectSelect from "../lib/projectSelect.js";
import state from "../lib/state.js";
import { tipBox } from "../lib/tipBox.js";

class Sheets {
  constructor() {
    this.appComponent = document.getElementById("app");
    this.domComponent = createElement("div", { class: "standard-view" });
    this.appComponent.appendChild(this.domComponent);

    this.user = null;

    this.newLoading = false;
    this.creating = false;

    this.render();
  }

  toggleLoadingNew = () => {
    this.newLoading = !this.newLoading;
    this.render();
  };

  toggleCreating = () => {
    this.creating = !this.creating;
    this.render();
  };

  renderSheetElems = async () => {
    const sheetData = await getThings("/api/get_5e_characters_by_user");
    const map = sheetData.map((sheet) => {
      // create element
      const elem = createElement("div");
      new PlayerComponent({
        domComponent: elem,
        sheet,
      });

      return elem;
    });
    if (map.length) return map;
    else
      return [
        createElement(
          "div",
          {},
          "No player characters have been created yet..."
        ),
      ];
  };

  newPlayer = async (e) => {
    this.toggleLoadingNew();
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    formProps.user_id = state.user.id;

    await postThing("/api/add_5e_character", formProps);

    this.toggleLoadingNew();
  };

  renderCreateNew = async () => {
    const form = createElement("form", {}, [
      createElement("label", { for: "name" }, "Choose Character Name"),
      createElement("input", {
        id: "name",
        name: "name",
        placeholder: "Character Name",
        required: true,
        style: "max-width: 500px;",
      }),
      createElement("br"),
      createElement("button", { type: "submit" }, "Create"),
    ]);
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      this.creating = false;
      await this.newPlayer(e);
    });

    this.domComponent.append(
      createElement("h1", {}, "Create Player Character Sheet"),
      createElement("br"),
      tipBox(
        "We currently only offer player character sheets for Dungeons and Dragons 5e. In the future we intend to support more games.",
        "/assets/peli/small/peli_hide_small.png",
        false
      ),
      createElement("br"),
      createElement(
        "h2",
        { style: "text-decoration: underline;" },
        "New 5e Character Sheet"
      ),
      form,
      createElement("hr"),
      createElement("button", { class: "btn-red" }, "Cancel", {
        type: "click",
        event: this.toggleCreating,
      })
    );
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    if (this.creating) {
      return this.renderCreateNew();
    }

    if (this.newLoading) {
      return this.domComponent.append(
        renderLoadingWithMessage("Please wait while we prepare your player...")
      );
    }

    this.domComponent.append(
      createElement(
        "h1",
        { class: "projects-view-title" },
        "Player Character Sheets"
      ),
      createElement("hr", { class: "special-hr" }),
      createElement(
        "div",
        { style: "display: flex; flex-direction: column;" },
        [
          createElement(
            "button",
            { class: "new-btn", title: "Create a new player character sheet" },
            "+ Sheet",
            {
              type: "click",
              event: this.toggleCreating,
            }
          ),
          createElement(
            "div",
            { class: "hint" },
            "*Create a new player character sheet"
          ),
        ]
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
            { style: "margin-right: var(--main-distance);" },
            tipBox(
              "You can make your character sheets accessible to the GMs of your wyrlds by using the wyrld-connection settings which can be found inside the character settings.",
              "/assets/peli/small/peli_note_small.png",
              true
            )
          ),
          createElement(
            "div",
            { style: "display: flex; flex: 1; flex-direction: column;" },
            [...(await this.renderSheetElems())]
          ),
        ]
      )
    );
  };
}

new Sheets();

class PlayerComponent {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className = "project-btn-container";
    this.sheet = props.sheet;

    this.edit = false;

    this.render();
  }

  toggleEdit = () => {
    this.edit = !this.edit;
    if (this.connect) this.connect = false;
    this.render();
  };

  toggleConnect = () => {
    this.connect = !this.connect;
    this.render();
  };

  toggleConnectLoading = () => {
    this.connectLoading = !this.connectLoading;
    this.render();
  };

  renderCurrentConnections = async () => {
    const projectPlayerIds = await getThings(
      `/api/get_project_players_by_player/${this.sheet.id}`
    );
    if (!projectPlayerIds.length)
      return [createElement("small", {}, "None...")];

    return await Promise.all(
      projectPlayerIds.map(async (projectPlayer) => {
        const project = await getThings(
          `/api/get_project/${projectPlayer.project_id}`
        );
        if (project) {
          const elem = createElement(
            "div",
            {
              style:
                "margin-left: var(--main-distance); display: flex; align-items: center;",
            },
            [
              createElement(
                "div",
                { class: "highlighted-item" },
                project.title
              ),
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
                      `/api/remove_project_player/${projectPlayer.id}`
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

  addConnection = async (e) => {
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    formProps.player_id = this.sheet.id;
    if (Object.values(formProps)[0] != 0) {
      this.toggleConnectLoading();
      await postThing(`/api/add_project_player`, formProps);
      this.toggleConnectLoading();
    }
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
      createElement("div", { class: "project-edit-container" }, [
        createElement("h1", {}, `~ ${this.sheet.name} ~`),
        createElement("h2", {}, `Wyrld Connection Settings`),
        createElement(
          "div",
          { class: "hint" },
          "*Connect your player character sheets to wyrlds for ease of access, and to allow your Game Masters the ability to view and edit."
        ),
        createElement("br"),
        createElement("h3", {}, "Current Wyrlds"),
        createElement(
          "div",
          { class: "hint" },
          "*Your character sheet is currently connected to these wyrlds"
        ),
        ...(await this.renderCurrentConnections()),
        createElement("br"),
        createElement("h3", {}, "Add a wyrld"),
        createElement(
          "div",
          { class: "hint" },
          "*Choose from the list of your created/joined wyrlds to connect your player sheet to."
        ),
        createElement("br"),
        createElement(
          "form",
          {
            style:
              "flex-direction: row; align-items: center; flex-start; justify-content: flex-start;",
          },
          [
            await projectSelect(),
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
        createElement("button", {}, "Return to character settings", {
          type: "click",
          event: () => {
            this.toggleConnect();
          },
        }),
      ]),
      createElement(
        "img",
        {
          class: "icon gear",
          src: "/assets/gears.svg",
          title: "Toggle player character sheet settings",
        },
        null,
        {
          type: "click",
          event: this.toggleEdit,
        }
      )
    );
  };

  renderEdit = async () => {
    this.domComponent.append(
      createElement("div", { class: "project-edit-container" }, [
        createElement("h1", {}, `~ ${this.sheet.name} ~`),
        createElement("h2", {}, `Character Settings`),
        createElement(
          "div",
          { class: "hint" },
          "*Manage important settings for your character sheet."
        ),
        createElement("br"),
        createElement(
          "div",
          { style: "display: flex; flex-direction: column;" },
          [
            createElement("button", {}, "Open Connection Settings", {
              type: "click",
              event: () => {
                this.toggleConnect();
              },
            }),
            createElement(
              "div",
              { class: "hint" },
              "*Connect character sheets to wyrlds"
            ),
          ]
        ),
        createElement("hr"),
        createElement("div", { class: "danger-heading" }, "Danger"),
        createElement("button", { class: "btn-red" }, "Delete Character", {
          type: "click",
          event: (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (
              window.confirm(
                `Are you sure you want to delete ${this.sheet.name}`
              )
            ) {
              deleteThing(`/api/remove_5e_character/${this.sheet.id}`);
              e.target.parentElement.parentElement.remove();
            }
          },
        }),
      ]),
      createElement(
        "img",
        {
          class: "icon gear",
          src: "/assets/gears.svg",
          title: "Toggle player character sheet settings",
        },
        null,
        {
          type: "click",
          event: this.toggleEdit,
        }
      )
    );
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    if (this.connect) {
      return this.renderConnect();
    }

    if (this.edit) {
      return this.renderEdit();
    }

    this.domComponent.append(
      createElement(
        "div",
        {
          class: "project-button",
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
            history.pushState(this.sheet.id, null, `/5eplayer.html`);
            window.location.reload();
          },
        }
      ),
      createElement(
        "img",
        {
          class: "icon gear",
          src: "/assets/gears.svg",
          title: "Toggle player character sheet settings",
        },
        null,
        {
          type: "click",
          event: this.toggleEdit,
        }
      )
    );
  };
}
