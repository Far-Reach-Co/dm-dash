import createElement from "../lib/createElement.js";
import renderLoadingWithMessage from "../lib/loadingWithMessage.js";
import { deleteThing, getThings, postThing } from "../lib/apiUtils.js";

class Sheets {
  constructor() {
    this.appComponent = document.getElementById("app");
    this.domComponent = createElement("div", { class: "standard-view" });
    this.appComponent.appendChild(this.domComponent);

    this.user = null;

    this.newLoading = false;
    this.creating = false;

    this.init();
  }

  init = async () => {
    // verify user
    await this.verifyToken();
    // stop initial spinner
    document.getElementById("initial-spinner").remove();

    this.render();
  };

  verifyToken = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const res = await fetch(`${window.location.origin}/api/verify_jwt`, {
          headers: { "x-access-token": `Bearer ${token}` },
        });
        const resData = await res.json();
        if (res.status === 200) {
          this.user = resData;
        } else if (res.status === 400) {
          window.location.pathname = "/login.html";
        } else throw resData.error;
      } catch (err) {
        console.log(err);
        window.location.pathname = "/login.html";
      }
    } else window.location.pathname = "/login.html";
  };

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
      const elem = createElement(
        "div",
        {
          class: "project-button",
          style:
            "flex-direction: row; align-items: center; justify-content: space-between;",
        },
        [
          createElement("div", {style: "display: flex; align-items: center; justify-content: center;"}, [
            createElement("h1", {}, sheet.name),
            createElement(
              "div",
              {
                style:
                  "color: var(--red1); margin-left: 10px; cursor: pointer;",
              },
              "ⓧ",
              {
                type: "click",
                event: (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (
                    window.confirm(
                      `Are you sure you want to delete ${sheet.name}`
                    )
                  ) {
                    deleteThing(`/api/remove_5e_character/${sheet.id}`);
                    e.target.parentElement.parentElement.remove();
                  }
                },
              }
            ),
          ]),
          createElement(
            "div",
            { style: "display: flex; flex-direction: column;" },
            [
              createElement(
                "small",
                {},
                `Race: ${sheet.race ? sheet.race : "None"}`
              ),
              createElement(
                "small",
                {},
                `Class: ${sheet.class ? sheet.class : "None"}`
              ),
              createElement(
                "small",
                {},
                `Level: ${sheet.level ? sheet.level : "None"}`
              ),
              createElement(
                "small",
                {},
                `EXP: ${sheet.exp ? sheet.exp : "None"}`
              ),
            ]
          ),
        ],
        {
          type: "click",
          event: () => {
            history.pushState(sheet, null, `/5eplayer.html`);
            window.location.reload();
          },
        }
      );

      return elem;
    });
    if (map.length) return map;
    else
      return [
        createElement(
          "small",
          {},
          "No player characters have been created yet..."
        ),
      ];
  };

  newPlayer = async (e) => {
    this.toggleLoadingNew();
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    formProps.user_id = this.user.id;

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
        "div",
        { style: "text-align: center; align-self: center; width: 80%;" },
        "*We currently only offer player character sheets for Dungeons and Dragons 5e. In the future we intend to support more games."
      ),
      createElement("button", { class: "new-btn" }, "+ Player", {
        type: "click",
        event: this.toggleCreating,
      }),
      createElement("hr"),
      createElement("br"),
      ...(await this.renderSheetElems())
    );
  };
}

new Sheets();
