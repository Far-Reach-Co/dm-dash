import { getThings, postThing } from "./apiUtils.js";
import createElement from "./createElement.js";
import renderLoadingWithMessage from "./loadingWithMessage.js";

class AccountManager {
  constructor() {
    this.userInfo = null;

    this.editEmail = false;
    this.editUsername = false;
    this.saveLoading = false;
    this.init();
  }

  toggleEditEmail = () => {
    this.editEmail = !this.editEmail;
    this.renderAccountApp();
  };

  toggleEditUsername = () => {
    this.editUsername = !this.editUsername;
    this.renderAccountApp();
  };

  toggleSaveLoading = () => {
    this.saveLoading = !this.saveLoading;
    this.renderAccountApp();
  };

  init = async () => {
    // stop initial spinner
    if (document.getElementById("initial-spinner")) {
      document.getElementById("initial-spinner").remove();
    }

    // do account app if account page
    if (window.location.pathname === "/account") {
      const res = await getThings("/api/get_user");
      this.userInfo = res;
      this.domComponent = document.getElementById("app");
      this.renderAccountApp();
    }
  };

  saveUsername = async (e) => {
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);

    const resData = await postThing(`/api/user/edit_user`, formProps);
    if (resData) this.userInfo.username = resData.username;
  };

  renderUsernameOrEditUsername = () => {
    if (this.editUsername) {
      return createElement(
        "div",
        { style: "display: flex; flex-direction: column;" },
        [
          createElement(
            "form",
            {},
            [
              createElement("label", { for: "username" }, "Edit Username"),
              createElement("input", {
                type: "username",
                id: "username",
                name: "username",
                value: this.userInfo.username,
                required: true,
              }),
              createElement("br"),
              createElement("button", { type: "submit" }, "Done"),
            ],
            {
              type: "submit",
              event: async (e) => {
                e.preventDefault();
                this.editUsername = false;
                this.toggleSaveLoading();
                await this.saveUsername(e);
                this.toggleSaveLoading();
              },
            }
          ),
          createElement("br"),
          createElement("button", { class: "btn-red" }, "Cancel", {
            type: "click",
            event: this.toggleEditUsername,
          }),
        ]
      );
    }

    return createElement(
      "div",
      {
        style:
          "display: flex; justify-content: space-between; flex-wrap: wrap;",
      },
      [
        createElement("h3", {}, "Username"),
        createElement("div", { style: "display: flex; align-items: center;" }, [
          createElement(
            "a",
            { class: "small-clickable", style: "margin-right: 5px" },
            "Edit",
            {
              type: "click",
              event: this.toggleEditUsername,
            }
          ),
          createElement("div", {}, this.userInfo.username),
        ]),
      ]
    );
  };

  saveEmail = async (e) => {
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);

    const resData = await postThing(`/api/user/edit_user`, formProps);
    if (resData) this.userInfo.email = resData.email;
  };

  renderEmailOrEditEmail = () => {
    if (this.editEmail) {
      return createElement(
        "div",
        { style: "display: flex; flex-direction: column;" },
        [
          createElement(
            "form",
            {},
            [
              createElement("label", { for: "email" }, "Edit Email"),
              createElement("input", {
                type: "email",
                id: "email",
                name: "email",
                value: this.userInfo.email,
                required: true,
              }),
              createElement("br"),
              createElement("button", { type: "submit" }, "Done"),
            ],
            {
              type: "submit",
              event: async (e) => {
                e.preventDefault();
                this.editEmail = false;
                this.toggleSaveLoading();
                await this.saveEmail(e);
                this.toggleSaveLoading();
              },
            }
          ),
          createElement("br"),
          createElement("button", { class: "btn-red" }, "Cancel", {
            type: "click",
            event: this.toggleEditEmail,
          }),
        ]
      );
    }

    return createElement(
      "div",
      {
        style:
          "display: flex; justify-content: space-between; flex-wrap: wrap;",
      },
      [
        createElement("h3", {}, "Email"),
        createElement("div", { style: "display: flex; align-items: center;" }, [
          createElement(
            "a",
            { class: "small-clickable", style: "margin-right: 5px" },
            "Edit",
            {
              type: "click",
              event: this.toggleEditEmail,
            }
          ),
          createElement("div", {}, this.userInfo.email),
        ]),
      ]
    );
  };

  renderAccountApp = () => {
    // clear
    this.domComponent.innerHTML = "";

    if (this.saveLoading) {
      return this.domComponent.append(
        renderLoadingWithMessage("Saving your data...")
      );
    }

    // domComponent.className = "component";
    this.domComponent.append(
      createElement("div", { class: "standard-view" }, [
        createElement(
          "div",
          {
            class: "component",
            style: "margin: 0; flex: 1;",
          },
          [
            createElement(
              "h2",
              { style: "text-decoration: underline;" },
              "General Info"
            ),
            createElement("br"),
            createElement(
              "div",
              {
                style:
                  "margin-left: var(--main-distance); margin-right: var(--main-distance)",
              },
              [
                this.renderEmailOrEditEmail(),
                createElement("br"),
                this.renderUsernameOrEditUsername(),
              ]
            ),
            createElement("br"),
            createElement("button", { style: "margin-left: 10px;" }, "Logout", {
              type: "click",
              event: () => {
                window.location.pathname = "/logout";
              },
            }),
            createElement("hr"),
            createElement(
              "h2",
              { style: "text-decoration: underline;" },
              "Subscriptions"
            ),
            createElement("br"),
            createElement(
              "div",
              { style: "text-align: center" },
              "Coming Soon!"
            ),
          ]
        ),
      ])
    );
  };
}

const accountManager = new AccountManager();
export default accountManager;
