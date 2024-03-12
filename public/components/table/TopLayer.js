import modal from "../modal.js";
import createElement from "../createElement.js";

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
    if (this.canvasLayer.currentLayer === "Map") {
      this.canvasLayer.currentLayer = "Object";
      this.canvasLayer.canvas.getObjects().forEach((object, index) => {
        if (object.layer === "Map") {
          object.selectable = false;
          object.evented = false;
        }
        if (object.layer === "Object") {
          object.selectable = true;
          object.evented = true;
          object.opacity = "1";
        }
        this.canvasLayer.canvas.renderAll();
      });
    } else {
      this.canvasLayer.currentLayer = "Map";
      this.canvasLayer.canvas.getObjects().forEach((object, index) => {
        if (object.layer === "Map") {
          object.selectable = true;
          object.evented = true;
        }
        if (object.layer === "Object") {
          object.selectable = false;
          object.evented = false;
          object.opacity = "0.5";
        }
        this.canvasLayer.canvas.renderAll();
      });
    }
    this.render();
  };

  renderStyledLayerInfoComponent = () => {
    if (this.canvasLayer.currentLayer === "Map") {
      return createElement("div", { style: "display: flex;" }, [
        createElement(
          "small",
          { style: "margin-right: 3px;" },
          "Current Layer:"
        ),
        createElement("small", { style: "color: var(--orange2)" }, "Map"),
      ]);
    } else {
      return createElement("div", { style: "display: flex;" }, [
        createElement(
          "small",
          { style: "margin-right: 3px;" },
          "Current Layer:"
        ),
        createElement("small", { style: "color: var(--green)" }, "Object"),
      ]);
    }
  };

  renderLayersElem = () => {
    if (USERID != this.tableView.user_id && !IS_MANAGER_OR_OWNER) {
      return createElement("div", { style: "display: none;" });
    } else {
      return createElement("div", { class: "table-config layers-elem" }, [
        this.renderStyledLayerInfoComponent(),
        createElement("br"),
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
        createElement("br"),
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
        createElement("br"),
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
              createElement("b", {}, "Control (⌃) + m"),
              createElement("br"),
              createElement(
                "small",
                {},
                "*GM only* While object(s) are selected, pressing ctrl + m will change the layer that the object(s) are currently on."
              ),
              createElement("br"),
              createElement("b", {}, "Control (⌃) + d"),
              createElement("br"),
              createElement(
                "small",
                {},
                "While object(s) are selected, pressing ctrl + d will duplicate the object(s) and place them on the table close to the original."
              ),
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
    this.chatBoxMessages = [];
    this.focused = true;
    this.hidden = false;
  }

  scrollMessagesDown = () => {
    const messagesDiv = document.querySelector("#chat-box-messages");
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  };

  focus = () => {
    const inputDiv = document.querySelector("#chat-box-form-input");
    inputDiv.focus();
  };

  refocus = () => {
    if (this.focused) {
      this.focus();
    }
  };

  renderHideChatButton = () => {
    if (this.hidden) {
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
            this.hidden = false;
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
            this.hidden = true;
            this.render();
          },
        }
      );
  };

  renderMessagesOrHidden = () => {
    if (this.hidden) {
      return createElement("div", { style: "display: none;" });
    } else
      return createElement(
        "div",
        {
          class: "chat-box-messages",
          id: "chat-box-messages",
        },
        [
          ...this.chatBoxMessages.map((message) =>
            createElement("div", { class: "d-flex" }, [
              createElement(
                "div",
                {
                  style:
                    "font-weight: bold; margin-right: var(--main-distance);",
                },
                `${message.username}:`
              ),
              createElement("div", {}, message.content),
            ])
          ),
        ]
      );
  };

  render = () => {
    // check if previously was focused before clearing
    const inputDiv = document.querySelector("#chat-box-form-input");
    if (document.activeElement === inputDiv) {
      this.focused = true;
    }
    // clear
    this.domComponent.innerHTML = "";
    // render
    this.domComponent.append(
      this.renderHideChatButton(),
      this.renderMessagesOrHidden(),
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
    // scroll down
    this.scrollMessagesDown();
    // refocus?
    this.refocus();
  };
}
