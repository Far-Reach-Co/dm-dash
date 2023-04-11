import createElement from "../lib/createElement.js";
import accountManager from "../lib/AccountManager.js"; // dont remove
import renderLoadingWithMessage from "../lib/loadingWithMessage.js";
import { deleteThing, getThings, postThing } from "../lib/apiUtils.js";
import projectSelect from "../lib/projectSelect.js";
import state from "../lib/state.js";

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
    const titleOfForm = createElement(
      "h2",
      { class: "component-title" },
      "Create new player character"
    );
    const form = createElement("form", {}, [
      createElement("label", { for: "name" }, "Character Name"),
      createElement("input", {
        id: "name",
        name: "name",
        placeholder: "Choose Carefully...",
        required: true,
      }),
      createElement("br"),
      createElement("br"),
      createElement("button", { type: "submit" }, "Create"),
    ]);
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      this.creating = false;
      await this.newPlayer(e);
    });

    const cancelButton = createElement(
      "button",
      { class: "btn-red" },
      "Cancel"
    );
    cancelButton.addEventListener("click", () => {
      this.toggleCreating();
    });

    this.domComponent.append(
      titleOfForm,
      createElement("br"),
      form,
      createElement("br"),
      cancelButton
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
        { style: "text-align: center; align-self: center; width: 80%;" },
        "*We currently only offer player character sheets for Dungeons and Dragons 5e. In the future we intend to support more games."
      ),
      createElement(
        "button",
        { class: "new-btn", title: "Create a new player character sheet" },
        "+ Player",
        {
          type: "click",
          event: this.toggleCreating,
        }
      ),
      createElement("hr"),
      createElement("br"),
      ...(await this.renderSheetElems())
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
            { style: "margin-left: 10px; display: flex;" },
            [
              project.title,
              createElement(
                "div",
                {
                  style:
                    "color: var(--red1); margin-left: 10px; cursor: pointer;",
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
        createElement("h1", {}, `Connect Character: "${this.sheet.name}"`),
        createElement("hr"),
        createElement("h2", {}, "Current connections"),
        ...(await this.renderCurrentConnections()),
        createElement("hr"),
        createElement("h2", {}, "Add connections"),
        createElement(
          "form",
          {},
          [
            await projectSelect(),
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

  renderEdit = async () => {
    this.domComponent.append(
      createElement("div", { class: "project-edit-container" }, [
        createElement("h1", {}, `Manage Character: "${this.sheet.name}"`),
        createElement("br"),
        createElement("button", {}, "Done", {
          type: "click",
          event: () => {
            this.toggleEdit();
          },
        }),
        createElement("br"),
        createElement("button", {}, "Connect to projects", {
          type: "click",
          event: () => {
            this.toggleConnect();
          },
        }),
        createElement("br"),
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
      ])
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
            history.pushState(this.sheet.id, null, `/5eplayer.html`);
            window.location.reload();
          },
        }
      ),
      createElement(
        "img",
        {
          class: "icon",
          src: "/assets/gears.svg",
          title: "Open player character sheet settings",
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
