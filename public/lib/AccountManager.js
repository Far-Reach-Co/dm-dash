import { postThing } from "./apiUtils.js";
import createElement from "./createElement.js";
import renderLoadingWithMessage from "./loadingWithMessage.js";

class AccountManager {
  constructor() {
    this.userInfo = null;

    this.editEmail = false;
    this.saveEmailLoading = false;
    this.init();
  }

  toggleEditEmail = () => {
    this.editEmail = !this.editEmail;
    this.renderAccountApp();
  };

  toggleSaveEmailLoading = () => {
    this.saveEmailLoading = !this.saveEmailLoading;
    this.renderAccountApp();
  };

  init = async () => {
    try {
      // try to append tabs
      await this.appendAccountTabOrLogin();
      if (window.location.pathname === "/account.html") {
        if (!this.userInfo) {
          return (window.location.pathname = "/login.html");
        }
        // stop initial spinner
        document.getElementById("account-spinner").remove();
        this.renderAccountApp();
      }
    } catch (err) {
      console.log(err);
    }
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
          this.userInfo = resData;
          return resData;
        } else if (res.status === 400) {
          console.log("expired token");
          return null;
        } else throw resData.error;
      } catch (err) {
        console.log(err);
        return null;
      }
    }
  };

  appendAccountTabOrLogin = async () => {
    const token = await this.verifyToken();
    const navContainer = document.getElementById("nav-links-container");
    const navContainerMobile = document.getElementById("nav-links-container-mobile");
    if (token) {
      navContainer.append(
        createElement(
          "a",
          { class: "top-nav-btn", href: "/dashboard.html" },
          "Dashboard"
        ),
        createElement(
          "a",
          { class: "top-nav-btn", href: "/sheets.html" },
          "Player Characters"
        ),
        createElement(
          "a",
          { class: "top-nav-btn", href: "/account.html" },
          "Account"
        ),
        createElement("a", { class: "top-nav-btn" }, "Logout", {
          type: "click",
          event: () => {
            localStorage.removeItem("token");
            window.location.pathname = "/";
          },
        })
      );
      navContainerMobile.append(
        createElement(
          "a",
          { class: "top-nav-btn", href: "/dashboard.html" },
          "Dashboard"
        ),
        createElement(
          "a",
          { class: "top-nav-btn", href: "/sheets.html" },
          "Player Characters"
        ),
        createElement(
          "a",
          { class: "top-nav-btn", href: "/account.html" },
          "Account"
        ),
        createElement("a", { class: "top-nav-btn" }, "Logout", {
          type: "click",
          event: () => {
            localStorage.removeItem("token");
            window.location.pathname = "/";
          },
        })
      );
    } else {
      navContainer.appendChild(
        createElement(
          "a",
          { class: "top-nav-btn", href: "/login.html" },
          "Login"
        )
      );
      navContainerMobile.appendChild(
        createElement(
          "a",
          { class: "top-nav-btn", href: "/login.html" },
          "Login"
        )
      );
    }
  };

  saveEmail = async (e) => {
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);

    const resData = await postThing(
      `/api/edit_user/${this.userInfo.id}`,
      formProps
    );
    if (resData) this.userInfo.email = resData.email;
  };

  renderEmailOrEditEmail = () => {
    if (this.editEmail) {
      return createElement(
        "div",
        { style: "display: flex; flex-direction: column;" },
        [
          createElement("h2", {}, "Edit Email"),
          createElement(
            "form",
            {},
            [
              createElement("label", { for: "email" }, "New Email"),
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
                this.toggleSaveEmailLoading();
                await this.saveEmail(e);
                this.toggleSaveEmailLoading();
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
      { style: "display: flex; justify-content: space-between;" },
      [
        createElement("h2", {}, "Email"),
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
    const domComponent = document.getElementById("account-app");
    domComponent.innerHTML = "";

    if (this.saveEmailLoading) {
      return domComponent.append(
        renderLoadingWithMessage("Saving your new email...")
      );
    }

    domComponent.className = "component";
    domComponent.append(
      this.renderEmailOrEditEmail(),
      createElement("br"),
      createElement("hr"),
      createElement("button", {}, "Reset Password", {
        type: "click",
        event: () => {
          window.location.pathname = "/resetpassword.html";
        },
      })
    );
  };
}

new AccountManager();
