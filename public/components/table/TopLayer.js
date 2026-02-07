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

  getRecordHref = (recordId) => {
    const base = `/record?id=${recordId}`;
    return this.projectId ? `${base}&project_id=${this.projectId}` : base;
  };

  getSelectedObjectInfo = async (obj) => {
    const info = {
      idPrefix: "lin",
      displayName: "",
      imageSrc: "",
      recordTitle: null,
      recordHref: null,
    };

    if (!obj.imageId) return info;

    info.idPrefix = "img";
    const image = await getThings(`/api/get_image/${obj.imageId}`);
    info.displayName = truncateString(image.original_name, 12);
    info.imageSrc = image.src;

    const records = image.records || [];
    const publicRecord = records.find((r) => r.is_public);
    if (publicRecord) {
      info.recordTitle = truncateString(publicRecord.title, 12);
      info.recordHref = this.getRecordHref(publicRecord.id);
    }

    return info;
  };

  renderSelectedObjectInfoElem = async () => {
    const obj = this.tableApp.getCurrentSelectedObject();
    if (!obj) return this.hiddenElement();

    const { idPrefix, displayName, imageSrc, recordTitle, recordHref } =
      await this.getSelectedObjectInfo(obj);

    const thumbnailElem =
      obj.type === "image"
        ? createElement("img", { class: "me-1", src: imageSrc, width: 30, height: 30 })
        : this.hiddenElement();

    const nameElem = recordTitle
      ? createElement(
          "small",
          {},
          createElement(
            "a",
            { href: recordHref, rel: "noopener noreferrer", target: "_blank" },
            recordTitle
          )
        )
      : createElement("small", {}, `"${displayName}"`);

    return createElement("div", { class: "table-config selected-obj-info-elem" }, [
      createElement("div", {}, `${idPrefix}-${truncateString(obj.id, 8, "")}`),
      createElement("div", { class: "d-flex flex-row" }, [thumbnailElem, nameElem]),
      createElement("small", {}, "Aura Color"),
      this.renderAuraColorPicker(obj),
    ]);
  };

  renderAuraColorPicker = (obj) => {
    const setAura = (color) => {
      obj.set({
        shadow: color ? { color, blur: 30, offsetX: 0, offsetY: 0 } : null,
      });
      this.tableApp.canvasRenderAll();
      socketIntegration.imageMoved(obj);
    };

    return createElement("div", { class: "d-flex flex-row align-items-start" }, [
      createElement(
        "input",
        {
          style: "cursor: pointer; height: 25px; margin-right: var(--main-distance);",
          type: "color",
          id: "colorpicker",
          name: "colorpicker",
          value: obj.shadow?.color ?? null,
        },
        null,
        { type: "input", event: (e) => setAura(e.target.value) }
      ),
      createElement("button", {}, "Clear", {
        type: "click",
        event: () => setAura(null),
      }),
    ]);
  };

  isOwnerOrManager = () => {
    return USERID == this.tableView.user_id || IS_MANAGER_OR_OWNER;
  };

  hiddenElement = () => createElement("div", { class: "d-none" });

  layerStyles = {
    Map: { class: "text-orange", label: "Map Layer" },
    Object: { class: "text-green", label: "Object Layer" },
    Fog: { class: "text-light-gray", label: "Fog Layer" },
  };

  renderStyledLayerInfoElem = () => {
    const style = this.layerStyles[this.tableApp.currentLayer];
    return createElement("small", { class: style.class }, style.label);
  };

  renderLayersElem = () => {
    if (!this.isOwnerOrManager()) return this.hiddenElement();

    return createElement("div", { class: "table-config layers-elem" }, [
      this.renderStyledLayerInfoElem(),
      createElement(
        "button",
        { title: "Change the layer you are interacting with" },
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
  };

  renderGridControlElem = () => {
    if (!this.isOwnerOrManager()) return this.hiddenElement();

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
        },
      ),
      // Input for grid width (in squares)
      createElement(
        "div",
        {
          class: "d-flex flex-column justify-content-center align-items-center",
        },
        [
          createElement("small", {}, "Width"),
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
            },
          ),
        ],
      ),
      // Input for grid height (in squares)
      createElement(
        "div",
        {
          class: "d-flex flex-column justify-content-center align-items-center",
        },
        [
          createElement("small", {}, "Height"),
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
            },
          ),
        ],
      ),
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
        },
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
          },
        ),
      ],
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
        },
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
        },
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
              class: "d-flex align-items-end",
            },
            [
              createElement(
                "div",
                {
                  class: "d-flex flex-column align-items-start",
                },
                [
                  createElement("small", {}, "Color"),
                  createElement(
                    "input",
                    {
                      class: "cursor-pointer me-3",
                      style: "height: 25px;",
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
                    },
                  ),
                ],
              ),
              createElement(
                "div",
                {
                  class: "d-flex flex-column align-items-center",
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
                    },
                  ),
                ],
              ),
            ],
          ),
        ],
      );
    } else return createElement("div", { class: "d-none" });
  };

  renderCanvasObjectList = (canvasObjectList) => {
    return canvasObjectList.map((obj, index) => {
      let IdPrefix = "lin";
      if (obj.imageId) {
        IdPrefix = "img";
      }
      if (!obj.id) {
        return createElement("div", { class: "d-none" });
      }

      return createElement(
        "div",
        {
          class: "canvas-log-item d-flex flex-row justify-content-between",
        },
        [
          createElement(
            "div",
            {},
            `${index} ${IdPrefix}-${truncateString(obj.id, 8, "")}`,
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
        },
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
              createElement("h1", {}, "Canvas Log"),
              createElement("br"),
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
                        { class: "overflow-auto", style: "height: 300px;" },
                        [...this.renderCanvasObjectList(canvasObjectsList)],
                      ),
                    ]),
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
                "Hold key to enable drag-select. While holding key, hold click and drag cursor to select multiple objects within the boxed region.",
              ),
              createElement("br"),
              createElement("b", {}, "Shift"),
              createElement("br"),
              createElement(
                "small",
                {},
                "Hold key and click objects to select multiple.",
              ),
              createElement("br"),
              createElement("b", {}, "Delete/Backspace"),
              createElement("br"),
              createElement(
                "small",
                {},
                "While object(s) are selected, press delete key to remove object(s) from table.",
              ),
              createElement("br"),
              createElement("b", {}, "Control (⌃) + t"),
              createElement("br"),
              createElement(
                "small",
                {},
                "While object(s) are selected, pressing ctrl + t will change the layer that the object(s) are currently on.",
              ),
              createElement("br"),
              createElement("b", {}, "Control (⌃) + d"),
              createElement("br"),
              createElement(
                "small",
                {},
                "While object(s) are selected, pressing ctrl + d will duplicate the object(s) and place them on the table close to the original.",
              ),
              createElement("br"),
              createElement("br"),
              createElement("h1", {}, "Chat '/' Commands"),
              createElement("hr"),
              createElement("h2", {}, "/roll *input*"),
              createElement(
                "small",
                {},
                "The command expects a text input in the format:",
              ),
              createElement("br"),
              createElement(
                "small",
                {},
                "[number of dice] d [dice sides] + [modifier]",
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
                "Represents the number of sides on the dice.",
              ),
              createElement("br"),
              createElement("b", {}, "[modifier]: "),
              createElement(
                "small",
                {},
                "(Optional) A number that's added to the total result of the dice rolls. If multiple modifiers are given, they are all added.",
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
                ", the command will simulate rolling two 6-sided dice and then add a modifier of 3 to the total.",
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
                "If the input is incorrect or malformed, the bot will respond with:",
              ),
              createElement("br"),
              createElement("code", {}, "Failed to calculate, try again."),
              createElement("br"),
            ]),
          );
        },
      },
    );
  };

  render = async () => {
    this.domComponent.replaceChildren();

    // Left toolbar: flex column container that auto-stacks tools
    const leftToolbar = createElement(
      "div",
      { class: "vtt-toolbar" },
      [
        this.renderInfoMenu(),
        this.renderDrawModeToggle(),
        this.renderDrawColorAndWidthPicker(),
        this.renderLayersElem(),
        this.renderGridControlElem(),
      ]
    );

    this.domComponent.append(
      leftToolbar,
      this.renderImageOptions(),
    );
    // append this after since it waits
    this.domComponent.append(await this.renderSelectedObjectInfoElem());
  };
}
