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
    const icon = isHidden ? "/assets/show.svg" : "/assets/hide.svg";
    const label = isHidden ? "Show Chat" : "Hide Chat";

    return createElement(
      "small",
      { class: "chat-box-hide d-flex align-items-center" },
      [
        createElement("img", { class: "small-icon chat-box-icon", src: icon }),
        createElement("small", {}, label),
      ],
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
          createElement("button", { class: "chat-box-btn" }, "Send"),
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

  createMessage = (data, isNew = false) => {
    // isNew is bool to render message with animation
    const parseMessageContent = (content) => {
      const urlRegexAll = /(https?:\/\/[^\s]+)/g;
      const urlRegex = /^https?:\/\/[^\s]+$/;
      const parts = content.split(urlRegexAll);

      const nodes = [];

      parts.forEach((part, index) => {
        // For each chunk, split further on \n to insert <br>
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

          // Only add <br> if it's not the last subpart
          if (subIndex < subparts.length - 1) {
            nodes.push(createElement("br"));
          }
        });
      });

      return nodes;
    };

    const elem = createElement("div", { class: "chat-box-message-content" }, [
      createElement(
        "small",
        { class: "me-3" },
        isoDateFormat(data.timestamp)
      ),
      createElement(
        "div",
        {
          class: "font-bold me-3",
        },
        `${data.username}:`
      ),
      ...parseMessageContent(data.content),
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
