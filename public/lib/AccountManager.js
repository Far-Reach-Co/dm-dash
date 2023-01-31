import createElement from "./createElement.js";

class AccountManager {
  constructor() {
    this.userInfo = null;

    this.init();
  }

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
    const div = document.getElementById("nav-links-container");
    if (token) {
      div.append(
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
      div.appendChild(
        createElement(
          "a",
          { class: "top-nav-btn", href: "/login.html" },
          "Login"
        )
      );
    }
  };

  renderAccountApp = () => {
    const domComponent = document.getElementById("account-app");
    domComponent.innerHTML = "";

    domComponent.className = "component";
    domComponent.append(
      createElement(
        "div",
        { style: "display: flex; justify-content: space-between;" },
        [
          createElement("h2", {}, "Email"),
          createElement("div", {}, this.userInfo.email),
        ]
      ),
      createElement("br"),
      createElement("hr"),
      createElement("button", {}, "Reset Password")
    );
  };
}

new AccountManager();
