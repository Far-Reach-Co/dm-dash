import createElement from "../../lib/salt-lib/createElement.js";
import modal from "../../components/modal.js";

export default class GuestPromptController {
  constructor(tableApp) {
    this.tableApp = tableApp;
  }

  clearTimers = () => {
    window.clearTimeout(this.tableApp.guestWelcomePromptTimer);
    this.tableApp.guestWelcomePromptTimer = null;
    window.clearTimeout(this.tableApp.guestRegisterPromptTimer);
    this.tableApp.guestRegisterPromptTimer = null;
  };

  schedulePrompts = () => {
    this.scheduleWelcomePrompt();
    this.scheduleRegistrationPrompt();
  };

  scheduleRegistrationPrompt = () => {
    window.clearTimeout(this.tableApp.guestRegisterPromptTimer);
    this.tableApp.guestRegisterPromptTimer = null;

    if (!this.tableApp.isGuestSandbox) return;
    if (this.tableApp.user && this.tableApp.user.id) return;
    if (sessionStorage.getItem("guest_sandbox_register_prompt_seen") === "1") {
      return;
    }

    this.tableApp.guestRegisterPromptTimer = window.setTimeout(() => {
      sessionStorage.setItem("guest_sandbox_register_prompt_seen", "1");
      this.showRegistrationPrompt();
    }, 90000);
  };

  scheduleWelcomePrompt = () => {
    window.clearTimeout(this.tableApp.guestWelcomePromptTimer);
    this.tableApp.guestWelcomePromptTimer = null;

    if (!this.tableApp.isGuestSandbox) return;
    if (sessionStorage.getItem("guest_sandbox_welcome_seen") === "1") return;

    this.tableApp.guestWelcomePromptTimer = window.setTimeout(() => {
      sessionStorage.setItem("guest_sandbox_welcome_seen", "1");
      this.showWelcomePrompt();
    }, 500);
  };

  showWelcomePrompt = () => {
    const title = createElement("h2", {}, "Welcome to the Guest Sandbox");
    const subtitle = createElement(
      "p",
      {},
      "This is a temporary demo VTT where you can explore core table controls right away."
    );
    const featureList = createElement("ul", { class: "guest-welcome-feature-list" }, [
      createElement("li", {}, "Move, scale, and rotate starter tokens on the map."),
      createElement("li", {}, "Use draw tools plus layer and grid controls."),
      createElement("li", {}, "Live multiplayer canvas and chat in one shared table."),
      createElement(
        "li",
        {},
        "Sandbox restrictions apply: image uploads, folders, pins/portals, and table switching are disabled."
      ),
    ]);
    const guideLink = createElement(
      "a",
      {
        href: "/vtt-guide",
        class: "guest-welcome-guide-link",
        target: "_blank",
        rel: "noopener noreferrer",
      },
      "Open VTT Guide"
    );
    const continueBtn = createElement(
      "button",
      {
        type: "button",
        class: "guest-welcome-dismiss",
      },
      "Start Exploring",
      { type: "click", event: () => modal.hide() }
    );

    const actions = createElement("div", { class: "guest-welcome-actions" }, [
      guideLink,
      continueBtn,
    ]);

    const wrapper = createElement("div", { class: "help-content guest-welcome-modal" }, [
      title,
      subtitle,
      featureList,
      actions,
    ]);

    modal.show(wrapper);
  };

  showRegistrationPrompt = () => {
    const title = createElement("h2", {}, "Having a good time?");
    const text = createElement(
      "p",
      {},
      "Create a free account to save your own tables, worlds, and maps."
    );
    const registerLink = createElement(
      "a",
      {
        href: "/register",
        class: "guest-register-cta",
      },
      "Register Free"
    );
    const keepPlayingBtn = createElement(
      "button",
      {
        type: "button",
        class: "guest-register-dismiss",
      },
      "Keep Exploring",
      { type: "click", event: () => modal.hide() }
    );

    const actions = createElement("div", { class: "guest-register-actions" }, [
      registerLink,
      keepPlayingBtn,
    ]);

    const wrapper = createElement("div", { class: "help-content guest-register-modal" }, [
      title,
      text,
      actions,
    ]);

    modal.show(wrapper);
  };
}
