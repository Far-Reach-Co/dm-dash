import modal from "../modal.js";
import createElement from "../createElement.js";
import isoDateFormat from "../../lib/isoDateFormat.js";
import { createValidatedImage, isImageUrl } from "../../lib/imageValidation.js";

export default class TopLayer {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.canvasLayer = props.canvasLayer;
    this.tableView = props.tableView;
    this.socketIntegration = props.socketIntegration;

    this.chatBoxComponent = new ChatBoxComponent({
      domComponent: createElement("div"),
      socketIntegration: this.socketIntegration,
    });
  }

  handleChangeCanvasLayer = () => {
    switch (this.canvasLayer.currentLayer) {
      case "Map":
        this.canvasLayer.currentLayer = "Object";
        break;
      case "Object":
        this.canvasLayer.currentLayer = "Fog";
        break;
      case "Fog":
        this.canvasLayer.currentLayer = "Map";
        break;
    }

    this.canvasLayer.canvas.getObjects().forEach((object, index) => {
      if (object.layer === "Map") {
        object.selectable = this.canvasLayer.currentLayer === "Map";
        object.evented = this.canvasLayer.currentLayer === "Map";
        object.opacity = this.canvasLayer.currentLayer === "Fog" ? "0.5" : "1";
      } else if (object.layer === "Object") {
        object.selectable = this.canvasLayer.currentLayer === "Object";
        object.evented = this.canvasLayer.currentLayer === "Object";
        object.opacity =
          this.canvasLayer.currentLayer !== "Object" ? "0.5" : "1";
      } else if (object.layer === "Fog") {
        object.selectable = this.canvasLayer.currentLayer === "Fog";
        object.evented = this.canvasLayer.currentLayer === "Fog";
        object.opacity = this.canvasLayer.currentLayer !== "Fog" ? "0.5" : "1";
      }
    });

    this.canvasLayer.canvas.renderAll();
    this.render();
  };

  renderStyledLayerInfoComponent = () => {
    let layerInfo;

    switch (this.canvasLayer.currentLayer) {
      case "Map":
        layerInfo = createElement(
          "small",
          { style: "color: var(--orange2)" },
          "Map"
        );
        break;
      case "Object":
        layerInfo = createElement(
          "small",
          { style: "color: var(--green)" },
          "Object"
        );
        break;
      case "Fog":
        layerInfo = createElement(
          "small",
          { style: "color: var(--blue)" },
          "Fog"
        );
        break;
    }

    return createElement("div", { style: "display: flex; width: 150px" }, [
      createElement("small", { style: "margin-right: 3px;" }, "Current Layer:"),
      layerInfo,
    ]);
  };

  renderLayersElem = () => {
    if (USERID != this.tableView.user_id && !IS_MANAGER_OR_OWNER) {
      return createElement("div", { style: "display: none;" });
    } else {
      return createElement("div", { class: "table-config layers-elem" }, [
        this.renderStyledLayerInfoComponent(),
        createElement(
          "button",
          {
            title: "Change the layer you are interacting with",
          },
          "Switch Layer",
          {
            type: "click",
            event: () => this.handleChangeCanvasLayer(),
          }
        ),
      ]);
    }
  };

  renderGridControlElem = () => {
    if (USERID != this.tableView.user_id && !IS_MANAGER_OR_OWNER) {
      return createElement("div", { style: "display: none;" });
    } else {
      return createElement("div", { class: "table-config grid-control-elem" }, [
        createElement("small", {}, "Grid Control"),
        createElement(
          "button",
          { title: "Hide or show the grid lines and toggle snap-to-grid" },
          this.canvasLayer.oGridGroup.visible ? "Hide" : "Show",
          {
            type: "click",
            event: () => {
              this.canvasLayer.oGridGroup.visible
                ? this.canvasLayer.hideGrid()
                : this.canvasLayer.showGrid();
              this.render();
            },
          }
        ),
      ]);
    }
  };

  renderDrawModeToggle = () => {
    return createElement(
      "div",
      { class: "table-config draw-mode-toggle-elem" },
      [
        createElement("small", {}, "Draw Mode"),
        createElement(
          "button",
          {
            title: "Toggle the drawing tool",
            class: `${this.canvasLayer.canvas.isDrawingMode ? "new-btn" : ""}`,
          },
          this.canvasLayer.canvas.isDrawingMode ? "On" : "Off",
          {
            type: "click",
            event: () => {
              this.canvasLayer.canvas.isDrawingMode =
                !this.canvasLayer.canvas.isDrawingMode;
              this.render();
            },
          }
        ),
      ]
    );
  };

  renderRemoveImageBtn = () => {
    return createElement(
      "div",
      { class: "table-config remove-image-btn-elem" },
      [
        createElement(
          "button",
          {
            title: "Remove the selected object from the table",
            class: "btn-red",
          },
          "🗑️",
          {
            type: "click",
            event: () => {
              this.canvasLayer.removeObject();
            },
          }
        ),
      ]
    );
  };

  renderDrawColorAndWidthPicker = () => {
    if (this.canvasLayer.canvas.isDrawingMode) {
      return createElement(
        "div",
        { class: "table-config draw-mode-picker-elem" },
        [
          createElement(
            "div",
            {
              style: "display: flex; align-items: flex-end;",
            },
            [
              createElement(
                "div",
                {
                  style:
                    "display: flex; flex-direction: column; align-items: center;",
                },
                [
                  createElement("small", {}, "Color"),
                  createElement(
                    "input",
                    {
                      style:
                        "cursor: pointer; height: 25px; margin-right: var(--main-distance);",
                      type: "color",
                      id: "colorpicker",
                      name: "colorpicker",
                      value: this.canvasLayer.canvas.freeDrawingBrush.color,
                    },
                    null,
                    {
                      type: "change",
                      event: (e) => {
                        this.canvasLayer.canvas.freeDrawingBrush.color =
                          e.target.value;
                      },
                    }
                  ),
                ]
              ),
              createElement(
                "div",
                {
                  style:
                    "display: flex; flex-direction: column; align-items: center;",
                },
                [
                  createElement("small", {}, "Line Width"),
                  createElement(
                    "input",
                    {
                      style: "width: 30px; height: 25px;",
                      type: "number",
                      id: "linewidth",
                      value: this.canvasLayer.canvas.freeDrawingBrush.width,
                      name: "linewidth",
                    },
                    null,
                    {
                      type: "change",
                      event: (e) => {
                        this.canvasLayer.canvas.freeDrawingBrush.width =
                          e.target.valueAsNumber;
                      },
                    }
                  ),
                ]
              ),
            ]
          ),
        ]
      );
    } else return createElement("div", { style: "display: none;" });
  };

  renderCanvasObjectList = (canvasObjectList) => {
    return canvasObjectList.map((obj, index) => {
      console.log(obj);
      if (!obj.id) {
        return createElement("div", { style: "display: none;" });
      }
      return createElement("div", {}, [
        createElement(
          "div",
          { class: "canvas-log-item" },
          `${index} ${JSON.stringify(obj.id)}`,
          [
            {
              type: "mouseenter",
              event: () => {
                obj.set({
                  shadow: {
                    color: "yellow",
                    blur: 30,
                    offsetX: 0,
                    offsetY: 0,
                  },
                });
                this.canvasLayer.canvas.renderAll();
              },
            },
            {
              type: "mouseleave",
              event: () => {
                obj.set({
                  shadow: null,
                });
                this.canvasLayer.canvas.renderAll();
              },
            },
          ]
        ),
        createElement("br"),
      ]);
    });
  };

  renderInfoMenu = () => {
    return createElement(
      "div",
      { class: "table-config info-elem", title: "Open key command info box" },
      [createElement("div", {}, "?")],
      {
        type: "click",
        event: () => {
          modal.show(
            createElement("div", { class: "help-content" }, [
              createElement("h1", {}, "Key Commands"),
              createElement("hr"),
              createElement("b", {}, "Option/Alt (⌥)"),
              createElement("br"),
              createElement(
                "small",
                {},
                "Hold key to enable drag-select. While holding key, hold click and drag cursor to select multiple objects within the boxed region."
              ),
              createElement("br"),
              createElement("b", {}, "Shift"),
              createElement("br"),
              createElement(
                "small",
                {},
                "Hold key and click objects to select multiple."
              ),
              createElement("br"),
              createElement("b", {}, "Delete/Backspace"),
              createElement("br"),
              createElement(
                "small",
                {},
                "While object(s) are selected, press delete key to remove object(s) from table."
              ),
              createElement("br"),
              // createElement("b", {}, "Control (⌃) + m"),
              // createElement("br"),
              // createElement(
              //   "small",
              //   {},
              //   "*GM only* While object(s) are selected, pressing ctrl + m will change the layer that the object(s) are currently on."
              // ),
              // createElement("br"),
              createElement("b", {}, "Control (⌃) + d"),
              createElement("br"),
              createElement(
                "small",
                {},
                "While object(s) are selected, pressing ctrl + d will duplicate the object(s) and place them on the table close to the original."
              ),
              // createElement("br"),
              // createElement("b", {}, "Canvas Log"),
              // createElement("br"),
              // createElement("button", {}, "Open Log", {
              //   type: "click",
              //   event: (e) => {
              //     const canvasObjectsList =
              //       this.canvasLayer.canvas.getObjects();
              //     modal.show(
              //       createElement("div", { class: "help-content" }, [
              //         createElement("h1", {}, "Canvas Log"),
              //         createElement("hr"),
              //         createElement("h2", {}, "Objects List"),
              //         createElement("hr"),
              //         ...this.renderCanvasObjectList(canvasObjectsList),
              //       ])
              //     );
              //   },
              // }),
              createElement("br"),
              createElement("br"),
              createElement("h1", {}, "Chat '/' Commands"),
              createElement("hr"),
              createElement("h2", {}, "/roll <input>"),
              createElement(
                "small",
                {},
                "The command expects a text input in the format:"
              ),
              createElement("br"),
              createElement(
                "small",
                {},
                "[number of dice] d [dice sides] + [modifier]"
              ),
              createElement("br"),
              createElement("br"),
              createElement("b", {}, "[number of dice]: "),
              createElement("small", {}, "Specifies how many dice to roll."),
              createElement("br"),
              createElement("b", {}, "[dice sides]: "),
              createElement(
                "small",
                {},
                "Represents the number of sides on the dice."
              ),
              createElement("br"),
              createElement("b", {}, "[modifier]: "),
              createElement(
                "small",
                {},
                "(Optional) A number that's added to the total result of the dice rolls. If multiple modifiers are given, they are all added."
              ),
              createElement("br"),
              createElement("br"),
              createElement("b", {}, "Example"),
              createElement("br"),
              createElement("small", {}, "If a user inputs "),
              createElement("code", {}, "2d6+3"),
              createElement(
                "small",
                {},
                ", the command will simulate rolling two 6-sided dice and then add a modifier of 3 to the total."
              ),
              createElement("br"),
              createElement("small", {}, "The bot might respond with:"),
              createElement("br"),
              createElement("code", {}, "Input: 2d6+3"),
              createElement("br"),
              createElement("code", {}, "Roll 1: 4"),
              createElement("br"),
              createElement("code", {}, "Roll 2: 6 - CRITICAL"),
              createElement("br"),
              createElement("code", {}, "TOTAL = 13"),
              createElement("br"),
              createElement("br"),
              createElement("b", {}, "Error Handling"),
              createElement("br"),
              createElement(
                "small",
                {},
                "If the input is incorrect or malformed, the bot will respond with:"
              ),
              createElement("br"),
              createElement("code", {}, "Failed to calculate, try again."),
              createElement("br"),
            ])
          );
        },
      }
    );
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    this.domComponent.append(
      this.renderDrawModeToggle(),
      this.renderDrawColorAndWidthPicker(),
      this.renderLayersElem(),
      this.renderGridControlElem(),
      this.renderRemoveImageBtn(),
      this.renderInfoMenu(),
      this.chatBoxComponent.domComponent
    );
  };
}

class ChatBoxComponent {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className = "chat-box-container";
    this.socketIntegration = props.socketIntegration;

    this.chatBoxMessagesComponent = new ChatBoxMessagesComponent({
      domComponent: createElement("div", {
        class: "chat-box-messages",
        id: "chat-box-messages",
      }),
    });

    this.render();
  }

  renderHideChatButton = () => {
    if (this.chatBoxMessagesComponent.hidden) {
      return createElement(
        "small",
        { class: "chat-box-hide d-flex align-items-center" },
        [
          createElement("img", {
            style: "margin-right: var(--main-distance)",
            class: "small-icon chat-box-icon",
            src: "/assets/show.svg",
          }),
          createElement("small", {}, "Show Chat"),
        ],
        {
          type: "click",
          event: () => {
            this.chatBoxMessagesComponent.hidden = false;
            this.chatBoxMessagesComponent.render();
            this.render();
          },
        }
      );
    } else
      return createElement(
        "small",
        { class: "chat-box-hide d-flex align-items-center" },
        [
          createElement("img", {
            style: "margin-right: var(--main-distance)",
            class: "small-icon chat-box-icon",
            src: "/assets/hide.svg",
          }),
          createElement("small", {}, "Hide Chat"),
        ],
        {
          type: "click",
          event: () => {
            this.chatBoxMessagesComponent.hidden = true;
            this.chatBoxMessagesComponent.render();
            this.render();
          },
        }
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
            this.socketIntegration.newTableMessage(content);

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
                    style: "margin: 0 5px;",
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
        { style: "margin-right: var(--main-distance)" },
        isoDateFormat(data.timestamp)
      ),
      createElement(
        "div",
        {
          style: "font-weight: bold; margin-right: var(--main-distance);",
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
      return [createElement("div", { style: "display: none;" })];
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
