import createElement from "../../lib/salt-lib/createElement.js";
import Component from "../../lib/salt-lib/Component.js";
import isoDateFormat from "../../lib/isoDateFormat.js";
import socketIntegration from "./socketIntegration.js";
import { createValidatedImage, isImageUrl } from "../../lib/imageValidation.js";
import { createSvgIconFactoryMap } from "../svgIcon.js";

const CHAT_ICON_MARKUP = {
  show: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  hide: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><line x1="9" y1="10" x2="15" y2="10"/></svg>`,
  send: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`,
  users: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
};

const CHAT_ICONS = createSvgIconFactoryMap(CHAT_ICON_MARKUP);

export default class ChatBoxComponent extends Component {
  constructor(props = {}) {
    super({
      domElem: props.domElem || createElement("div"),
      autoRender: false,
      className: "chat-box-container",
    });

    this.chatBoxMessagesComponent = null;
    this.onlineUsersComponent = null;

    // Ensure child instances exist early so socket handlers can write to them.
    this.ensureChildComponents();
  }

  createChatMessagesComponent = () => {
    return new ChatBoxMessagesComponent({
      domElem: createElement("div", {
        class: "chat-box-messages",
        id: "chat-box-messages",
      }),
    });
  };

  createOnlineUsersComponent = () => {
    return new OnlineUsersComponent({
      domElem: createElement("div"),
      rerender: () => this.render(),
    });
  };

  ensureChildComponents = () => {
    if (this._destroyed) {
      return {
        chatMessagesComponent: null,
        onlineUsersComponent: null,
      };
    }

    const chatMessagesComponent = this.useChild(
      "chat-box-messages",
      this.createChatMessagesComponent,
    );
    const onlineUsersComponent = this.useChild(
      "online-users",
      this.createOnlineUsersComponent,
      (child) => {
        child.rerender = () => this.render();
      },
    );

    // Preserve existing external access used by socket handlers.
    this.chatBoxMessagesComponent = chatMessagesComponent;
    this.onlineUsersComponent = onlineUsersComponent;

    return {
      chatMessagesComponent,
      onlineUsersComponent,
    };
  };

  setOnlineUsers = (users) => {
    const { onlineUsersComponent } = this.ensureChildComponents();
    if (!onlineUsersComponent) return;
    onlineUsersComponent.setUsers(users);
  };

  setMessages = (messages) => {
    const { chatMessagesComponent } = this.ensureChildComponents();
    if (!chatMessagesComponent) return;
    chatMessagesComponent.setMessages(messages);
  };

  appendMessage = (message) => {
    if (!message) return;
    const { chatMessagesComponent } = this.ensureChildComponents();
    if (!chatMessagesComponent) return;
    chatMessagesComponent.appendMessage(message);
  };

  toggleChatVisibility = () => {
    const { chatMessagesComponent } = this.ensureChildComponents();
    if (!chatMessagesComponent) return;
    chatMessagesComponent.hidden = !chatMessagesComponent.hidden;
    void this.render();
  };

  renderHideChatButton = () => {
    const { chatMessagesComponent } = this.ensureChildComponents();
    if (!chatMessagesComponent) {
      return createElement("div", { class: "chat-box-toggle d-none" });
    }
    const isHidden = chatMessagesComponent.hidden;
    const iconFactory = isHidden ? CHAT_ICONS.show : CHAT_ICONS.hide;
    const label = isHidden ? " Chat" : " Hide";

    return createElement(
      "div",
      { class: "chat-box-toggle" },
      [iconFactory(), label],
      { type: "click", event: this.toggleChatVisibility }
    );
  };

  render = async () => {
    const { chatMessagesComponent } = this.ensureChildComponents();
    const onlineUsersElem = await this.childElem(
      "online-users",
      this.createOnlineUsersComponent,
      (child) => {
        child.rerender = () => this.render();
        this.onlineUsersComponent = child;
      },
    );
    const chatMessagesElem = await this.childElem(
      "chat-box-messages",
      this.createChatMessagesComponent,
      (child) => {
        this.chatBoxMessagesComponent = child;
      },
    );
    queueMicrotask(() => chatMessagesComponent.scrollDown());

    return [
      createElement("div", { class: "chat-box-top-row" }, [
        onlineUsersElem,
        this.renderHideChatButton(),
      ]),
      chatMessagesElem,
      createElement(
        "form",
        { class: "chat-box-form" },
        [
          createElement("input", {
            id: "chat-box-form-input",
            autofocus: true,
            type: "text",
            required: true,
            autocomplete: "off",
            placeholder: "Type message here...",
          }),
          createElement(
            "button",
            { class: "chat-box-btn", title: "Send message" },
            CHAT_ICONS.send(),
          ),
        ],
        {
          type: "submit",
          event: (e) => {
            e.preventDefault();
            const content = e.target.elements["chat-box-form-input"].value;
            socketIntegration.newTableMessage(content);

            // clear input
            e.target.elements["chat-box-form-input"].value = "";
            e.target.elements["chat-box-form-input"].focus();
          },
        }
      )
    ];
  };

  destroy = () => {
    this.chatBoxMessagesComponent = null;
    this.onlineUsersComponent = null;
    super.destroy();
  };
}

class ChatBoxMessagesComponent extends Component {
  constructor(props = {}) {
    super({
      domElem: props.domElem || createElement("div"),
      autoRender: false,
    });

    this.chatBoxMessages = [];
    this.hidden = false;

    this.render();
  }

  scrollDown = () => {
    this.domElem.scrollTop = this.domElem.scrollHeight;
  };

  setMessages = (messages) => {
    // Keep message updates immutable so memo deps are reliable.
    this.chatBoxMessages = Array.isArray(messages) ? [...messages] : [];
    void this.render();
    this.scrollDown();
  };

  appendMessage = (message) => {
    if (!message) return;
    this.chatBoxMessages = [...this.chatBoxMessages, message];
    void this.render();
    this.scrollDown();
  };

  formatShortTime = (isoDate) => {
    const date = new Date(isoDate);
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes().toString().padStart(2, "0");
    const h = hours % 12 || 12;
    const ampm = hours < 12 ? "am" : "pm";
    return `${h}:${minutes}${ampm}`;
  };

  parseMessageContent = (content) => {
    const urlRegexAll = /(https?:\/\/[^\s]+)/g;
    const urlRegex = /^https?:\/\/[^\s]+$/;
    const parts = content.split(urlRegexAll);
    const nodes = [];

    parts.forEach((part) => {
      const subparts = part.split("\n");
      subparts.forEach((subpart, subIndex) => {
        if (urlRegex.test(subpart)) {
          if (isImageUrl(subpart)) {
            nodes.push(createValidatedImage(subpart));
          } else {
            nodes.push(
              createElement(
                "a",
                {
                  href: subpart,
                  target: "_blank",
                  rel: "noopener noreferrer",
                  class: "mx-1",
                },
                subpart
              )
            );
          }
        } else {
          nodes.push(subpart);
        }
        if (subIndex < subparts.length - 1) {
          nodes.push(createElement("br"));
        }
      });
    });

    return nodes;
  };

  createMessage = (data, isNew = false) => {
    const shortTime = this.formatShortTime(data.timestamp);
    const fullDate = isoDateFormat(data.timestamp);

    const header = createElement("div", { class: "chat-msg-header" }, [
      createElement("span", { class: "chat-msg-username" }, data.username),
      createElement("span", { class: "chat-msg-time", title: fullDate }, shortTime),
    ]);

    const body = createElement(
      "div",
      { class: "chat-msg-body" },
      this.parseMessageContent(data.content),
    );

    const elem = createElement("div", { class: "chat-box-message-content" }, [
      header,
      body,
    ]);

    if (isNew) {
      elem.style.animation = "highlightFade 1s ease-out";
    }

    return elem;
  };

  renderMessagesOrHidden = () => {
    if (this.hidden) {
      return [createElement("div", { class: "d-none" })];
    }

    return this.useMemo(
      "chat-message-nodes",
      () => this.chatBoxMessages.map((data) => this.createMessage(data)),
      () => [this.chatBoxMessages],
    );
  };

  render = () => {
    return this.renderMessagesOrHidden();
  };
}

class OnlineUsersComponent extends Component {
  constructor(props = {}) {
    super({
      domElem: props.domElem || createElement("div"),
      autoRender: false,
      className: "online-users-wrapper",
    });

    this.rerender = props.rerender;

    this.usersList = [];
    this.isOpen = false;
  }

  setUsers = (users) => {
    this.usersList = Array.isArray(users) ? users : [];
    void this.render();
  };

  toggle = () => {
    this.isOpen = !this.isOpen;
    this.rerender();
  };

  renderUsersList = () => {
    if (!this.usersList.length) {
      return [createElement("div", { class: "online-panel-empty" }, "No users connected")];
    }

    return this.usersList.map((user) => {
      return createElement(
        "div",
        { class: "online-user-item" },
        [
          createElement("div", { class: "online-indicator" }),
          createElement("div", {}, user.username),
        ],
      );
    });
  };

  renderToggleButton = () => {
    const count = this.usersList.length;
    return createElement(
      "div",
      { class: "chat-box-toggle online-toggle" + (this.isOpen ? " active" : "") },
      [CHAT_ICONS.users(), ` ${count}`],
      { type: "click", event: this.toggle }
    );
  };

  renderPanel = () => {
    if (!this.isOpen) return createElement("div", { class: "d-none" });

    return createElement(
      "div",
      { class: "online-panel" },
      [
        createElement("div", { class: "online-panel-header" }, [
          createElement("small", {}, "Online Users"),
        ]),
        createElement(
          "div",
          { class: "online-panel-list" },
          this.renderUsersList()
        ),
      ],
    );
  };

  render = () => {
    return [this.renderPanel(), this.renderToggleButton()];
  };
}
