import modal from "../modal.js";
import { getThings } from "../../lib/apiUtils.js";
import createElement from "../createElement.js";
import socketIntegration from "./socketIntegration.js";
import truncateString from "../../lib/truncateString.js";

export default class TopLayer {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.tableApp = props.tableApp;
    this.tableView = props.tableView;

    const searchParams = new URLSearchParams(window.location.search);
    this.projectId = searchParams.get("project");
  }

  renderSelectedObjectInfoElem = async () => {
    const obj = this.tableApp.getCurrentSelectedObject();
    if (!obj) {
      return createElement("div", { style: "display: none;" });
    }

    let displayName = "";
    let imageSrc = "";
    let IdPrefix = "lin";
    let imageAssociatedRecordTitle = null;
    let associatedRecordHref = null;

    if (obj.imageId) {
      IdPrefix = "img";
      const image = await getThings(`/api/get_image/${obj.imageId}`);
      displayName = truncateString(image.original_name, 12);
      imageSrc = image.src;
      imageAssociatedRecordTitle =
        image.records.length && image.records[0].is_public
          ? truncateString(image.records[0].title, 12)
          : null;
      if (imageAssociatedRecordTitle) {
        associatedRecordHref = this.projectId
          ? `/record?id=${image.records[0].id}&project_id=${this.projectId}`
          : `/record?id=${image.records[0].id}`;
      }
    }

    return createElement(
      "div",
      { class: "table-config selected-obj-info-elem" },
      [
        createElement(
          "div",
          {},
          `${IdPrefix}-${truncateString(obj.id, 8, "")}`
        ),
        createElement("div", { style: "display: flex; flex-direction: row;" }, [
          obj.type == "image"
            ? createElement("img", {
                style: "margin-right: 2px;",
                src: imageSrc,
                width: 30,
                height: 30,
              })
            : createElement("div", { style: "display: none;" }),
          imageAssociatedRecordTitle
            ? createElement(
                "small",
                {},
                createElement(
                  "a",
                  {
                    href: associatedRecordHref,
                    rel: "noopener noreferrer",
                    target: "_blank",
                  },
                  imageAssociatedRecordTitle
                )
              )
            : createElement("small", {}, `"${displayName}"`),
        ]),
        createElement("small", {}, "Aura Color"),
        createElement(
          "div",
          {
            style:
              "display: flex; flex-direction: row; align-items: flex-start",
          },
          [
            createElement(
              "input",
              {
                style:
                  "cursor: pointer; height: 25px; margin-right: var(--main-distance);",
                type: "color",
                id: "colorpicker",
                name: "colorpicker",
                value: obj.shadow && obj.shadow.color ? obj.shadow.color : null,
              },
              null,
              {
                type: "input",
                event: (e) => {
                  console.log(e.target.value);
                  obj.set({
                    shadow: {
                      color: e.target.value,
                      blur: 30,
                      offsetX: 0,
                      offsetY: 0,
                    },
                  });
                  this.tableApp.canvasRenderAll();
                  socketIntegration.imageMoved(obj);
                },
              }
            ),
            createElement("button", {}, "Clear", {
              type: "click",
              event: (e) => {
                obj.set({
                  shadow: null,
                });
                this.tableApp.canvasRenderAll();
                socketIntegration.imageMoved(obj);
              },
            }),
          ]
        ),
      ]
    );
  };

  renderStyledLayerInfoElem = () => {
    let layerInfo;

    switch (this.tableApp.currentLayer) {
      case "Map":
        layerInfo = createElement(
          "small",
          { style: "color: var(--orange2)" },
          "Map Layer"
        );
        break;
      case "Object":
        layerInfo = createElement(
          "small",
          { style: "color: var(--green)" },
          "Object Layer"
        );
        break;
      case "Fog":
        layerInfo = createElement(
          "small",
          { style: "color: var(--light-gray)" },
          "Fog Layer"
        );
        break;
    }

    return layerInfo;
  };

  renderLayersElem = () => {
    if (USERID != this.tableView.user_id && !IS_MANAGER_OR_OWNER) {
      return createElement("div", { style: "display: none;" });
    } else {
      return createElement("div", { class: "table-config layers-elem" }, [
        this.renderStyledLayerInfoElem(),
        createElement(
          "button",
          {
            title: "Change the layer you are interacting with",
          },
          "Switch Layer",
          {
            type: "click",
            event: () => {
              this.tableApp.changeLayer();
              this.render();
            },
          }
        ),
      ]);
    }
  };

  renderGridControlElem = () => {
    if (USERID != this.tableView.user_id && !IS_MANAGER_OR_OWNER) {
      return createElement("div", { style: "display: none;" });
    }

    const gridGroup = this.tableApp.canvasLayer.gridManager?.getGroup();
    const isVisible = gridGroup?.visible ?? false;

    // Default user input (in squares, not pixels)
    if (!this.gridSizeInputs) {
      this.gridSizeInputs = {
        width: 40,
        height: 40,
      };
    }

    const updateInput = (key) => (e) => {
      const val = parseInt(e.target.value);
      if (!isNaN(val)) {
        this.gridSizeInputs[key] = val;
      }
    };

    return createElement("div", { class: "table-config grid-control-elem" }, [
      createElement("small", {}, "Grid Control"),

      // Toggle visibility
      createElement(
        "button",
        { title: "Hide or show the grid lines and toggle snap-to-grid" },
        isVisible ? "Hide" : "Show",
        {
          type: "click",
          event: () => {
            isVisible
              ? this.tableApp.canvasLayer.hideGrid()
              : this.tableApp.canvasLayer.showGrid();
            socketIntegration.gridToggle(!isVisible);
            this.render(); // update label
          },
        }
      ),
      createElement("br"),
      // Input for grid width (in squares)
      createElement("div", {}, [
        createElement("label", {}, "Width"),
        createElement(
          "input",
          {
            type: "number",
            value: this.gridSizeInputs.width,
            min: 1,
            max: 100,
            style: "margin-left: 5px; width: 80px;",
          },
          null,
          {
            type: "input",
            event: updateInput("width"),
          }
        ),
      ]),
      // Input for grid height (in squares)
      createElement("div", {}, [
        createElement("label", {}, "Height"),
        createElement(
          "input",
          {
            type: "number",
            value: this.gridSizeInputs.height,
            min: 1,
            max: 100,
            style: "margin-left: 5px; width: 80px;",
          },
          null,
          {
            type: "input",
            event: updateInput("height"),
          }
        ),
      ]),
      createElement("br"),
      // Button to apply new grid size
      createElement(
        "button",
        {
          title: "Resize the grid area (in squares)",
        },
        "Resize Grid",
        {
          type: "click",
          event: () => {
            const w = this.gridSizeInputs.width;
            const h = this.gridSizeInputs.height;

            this.tableApp.canvasLayer.gridManager.rebuildGrid(w, h);
            socketIntegration.gridResized({ width: w, height: h });
          },
        }
      ),
    ]);
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
          },
          this.tableApp.canvasLayer.canvas.isDrawingMode ? "On" : "Off",
          {
            type: "click",
            event: () => {
              this.tableApp.canvasLayer.canvas.isDrawingMode =
                !this.tableApp.canvasLayer.canvas.isDrawingMode;
              this.render();
            },
          }
        ),
      ]
    );
  };

  renderImageOptions = () => {
    return createElement("div", { class: "table-config image-options-elem" }, [
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
            this.tableApp.canvasLayer.removeObjects();
          },
        }
      ),
      createElement(
        "button",
        {
          title: "Move the selected object to the top of its layer",
          class: "",
        },
        "↑",
        {
          type: "click",
          event: () => {
            this.tableApp.canvasLayer.moveObjectToTop();
          },
        }
      ),
    ]);
  };

  renderDrawColorAndWidthPicker = () => {
    if (this.tableApp.canvasLayer.canvas.isDrawingMode) {
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
                    "display: flex; flex-direction: column; align-items: flex-start;",
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
                      value:
                        this.tableApp.canvasLayer.canvas.freeDrawingBrush.color,
                    },
                    null,
                    {
                      type: "input",
                      event: (e) => {
                        this.tableApp.canvasLayer.canvas.freeDrawingBrush.color =
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
                      value:
                        this.tableApp.canvasLayer.canvas.freeDrawingBrush.width,
                      name: "linewidth",
                    },
                    null,
                    {
                      type: "input",
                      event: (e) => {
                        this.tableApp.canvasLayer.canvas.freeDrawingBrush.width =
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
      let IdPrefix = "lin";
      if (obj.imageId) {
        IdPrefix = "img";
      }
      if (!obj.id) {
        return createElement("div", { style: "display: none;" });
      }

      return createElement(
        "div",
        {
          class: "canvas-log-item",
          style:
            "display: flex; flex-direction: row; justify-content: space-between;",
        },
        [
          createElement(
            "div",
            {},
            `${index} ${IdPrefix}-${truncateString(obj.id, 8, "")}`
          ),
          createElement("img", {
            src: this.tableApp.sidebar.tableSidebarImageComponent
              .downloadedImageSourceList[obj.imageId]
              ? this.tableApp.sidebar.tableSidebarImageComponent
                  .downloadedImageSourceList[obj.imageId]
              : "",
            style: "width: 30px; height: 30px;",
          }),
          createElement("br"),
        ],
        {
          type: "click",
          event: (e) => {
            this.tableApp.canvasLayer.selectObjectById(obj.id);
          },
        }
      );
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
              createElement("br"),
              createElement("h1", {}, "Canvas Log"),
              createElement("button", {}, "Open Log", {
                type: "click",
                event: (e) => {
                  const canvasObjectsList =
                    this.tableApp.canvasLayer.canvas.getObjects();
                  modal.show(
                    createElement("div", { class: "help-content" }, [
                      createElement("h1", {}, "Canvas Log"),
                      createElement("hr"),
                      createElement("h2", {}, "Objects List"),
                      createElement("hr"),
                      createElement(
                        "div",
                        { style: "overflow: auto; height: 300px;" },
                        [...this.renderCanvasObjectList(canvasObjectsList)]
                      ),
                    ])
                  );
                },
              }),
              createElement("br"),
              createElement("br"),
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
              createElement("b", {}, "Control (⌃) + t"),
              createElement("br"),
              createElement(
                "small",
                {},
                "While object(s) are selected, pressing ctrl + t will change the layer that the object(s) are currently on."
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
              createElement("br"),
              createElement("h1", {}, "Chat '/' Commands"),
              createElement("hr"),
              createElement("h2", {}, "/roll *input*"),
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
      this.renderImageOptions(),
      this.renderInfoMenu()
    );
    // append this after since it waits
    this.domComponent.append(await this.renderSelectedObjectInfoElem());
  };
}
