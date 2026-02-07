import createElement from "../createElement.js";
import isoDateFormat from "../../lib/isoDateFormat.js";
import socketIntegration from "./socketIntegration.js";
import { createValidatedImage, isImageUrl } from "../../lib/imageValidation.js";

export default class ChatBoxComponent {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className = "chat-box-container";

    this.chatBoxMessagesComponent = new ChatBoxMessagesComponent({
      domComponent: createElement("div", {
        class: "chat-box-messages",
        id: "chat-box-messages",
      }),
    });
  }

  toggleChatVisibility = () => {
    this.chatBoxMessagesComponent.hidden = !this.chatBoxMessagesComponent.hidden;
    this.chatBoxMessagesComponent.render();
    this.render();
  };

  renderHideChatButton = () => {
    const isHidden = this.chatBoxMessagesComponent.hidden;
    // Static SVG icons — safe, no user input
    const showIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;
    const hideIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><line x1="9" y1="10" x2="15" y2="10"/></svg>`;
    const icon = isHidden ? showIcon : hideIcon;
    const label = isHidden ? " Chat" : " Hide";

    return createElement(
      "div",
      { class: "chat-box-toggle" },
      icon + label,
      { type: "click", event: this.toggleChatVisibility }
    );
  };

  render = () => {
    // clear
    this.domComponent.innerHTML = "";
    // render
    this.domComponent.append(
      this.renderHideChatButton(),
      this.chatBoxMessagesComponent.domComponent,
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
            `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`,
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
    );
  };
}

class ChatBoxMessagesComponent {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.chatBoxMessages = [];
    this.hidden = false;

    this.render();
  }

  scrollDown = () => {
    this.domComponent.scrollTop = this.domComponent.scrollHeight;
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
    } else
      return [...this.chatBoxMessages.map((data) => this.createMessage(data))];
  };

  render = () => {
    // clear
    this.domComponent.innerHTML = "";
    // render
    this.domComponent.append(...this.renderMessagesOrHidden());
  };
}
