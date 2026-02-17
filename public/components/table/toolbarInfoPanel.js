import modal from "../modal.js";
import createElement from "../createElement.js";
import truncateString from "../../lib/truncateString.js";
import { ICONS } from "./toolbarConfig.js";

export function renderCanvasObjectList(toolbar, canvasObjectList) {
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
          src: toolbar.tableApp.sidebar.tableSidebarImageComponent
            .downloadedImageSourceList[obj.imageId]
            ? toolbar.tableApp.sidebar.tableSidebarImageComponent
                .downloadedImageSourceList[obj.imageId]
            : "",
          style: "width: 30px; height: 30px;",
        }),
        createElement("br"),
      ],
      {
        type: "click",
        event: () => {
          toolbar.tableApp.canvasLayer.selectObjectById(obj.id);
        },
      },
    );
  });
}

export function renderInfoMenu(toolbar) {
  return toolbar.renderToolbarButton(ICONS.info, "Info & key commands", {
    onClick: () => {
      modal.show(
        createElement("div", { class: "help-content" }, [
          createElement("h1", {}, "VTT Quick Reference"),
          createElement("hr"),
          createElement(
            "a",
            {
              href: "/vtt-guide",
              target: "_blank",
              rel: "noopener noreferrer",
            },
            "View full guide ->",
          ),
          createElement("br"),
          createElement("br"),

          createElement("h2", {}, "Getting Started"),
          createElement("hr"),
          createElement(
            "small",
            {},
            "Add images via the sidebar (GM), then drag them onto the canvas (If click->drag doesn't work then try just clicking the image). Pan by clicking and dragging empty space. Zoom with the scroll wheel or pinch gesture.",
          ),
          createElement("br"),
          createElement("br"),

          createElement("h2", {}, "Canvas"),
          createElement("hr"),
          createElement("b", {}, "Pan"),
          createElement("small", {}, " - Click + drag on empty space"),
          createElement("br"),
          createElement("b", {}, "Zoom"),
          createElement("small", {}, " - Scroll wheel or pinch"),
          createElement("br"),
          createElement("b", {}, "Select"),
          createElement("small", {}, " - Click an object"),
          createElement("br"),
          createElement("b", {}, "Lock Position (Manager)"),
          createElement(
            "small",
            {},
            " - Use the lock/unlock control in the selected object panel to freeze or allow movement.",
          ),
          createElement("br"),
          createElement("b", {}, "Multi-select"),
          createElement("small", {}, " - Shift+click or Alt+drag a box"),
          createElement("br"),
          createElement("b", {}, "Ping"),
          createElement(
            "small",
            {},
            " - Double-click on empty canvas to ping location for all users",
          ),
          createElement("br"),
          createElement("b", {}, "Aura"),
          createElement(
            "small",
            {},
            " - Select a token and set an aura color in the object panel",
          ),
          createElement("br"),
          createElement("br"),

          createElement("h2", {}, "Toolbar"),
          createElement("hr"),
          createElement("b", {}, "Draw Mode"),
          createElement(
            "small",
            {},
            " - Freehand drawing on the canvas. Set color and width.",
          ),
          createElement("br"),
          createElement("b", {}, "Layers (GM)"),
          createElement(
            "small",
            {},
            " - Switch between Map, Object, and Fog layers.",
          ),
          createElement("br"),
          createElement("b", {}, "Grid (GM)"),
          createElement("small", {}, " - Show/hide grid and resize it."),
          createElement("br"),
          createElement("b", {}, "Delete / Move to Top"),
          createElement(
            "small",
            {},
            " - Remove selected object or bring it to front of its layer.",
          ),
          createElement("br"),
          createElement("br"),

          createElement("h2", {}, "Sandbox Mode"),
          createElement("hr"),
          createElement(
            "small",
            {},
            "Sandbox keeps core map interaction tools while limiting campaign-management features.",
          ),
          createElement("br"),
          createElement("b", {}, "Available"),
          createElement(
            "small",
            {},
            " - Layers and Grid controls are enabled.",
          ),
          createElement("br"),
          createElement("b", {}, "Restricted"),
          createElement(
            "small",
            {},
            " - Image/folder management, location pins/portals, and Change Table are disabled.",
          ),
          createElement("br"),
          createElement("br"),

          createElement("h2", {}, "Location Pins (GM)"),
          createElement("hr"),
          createElement("b", {}, "Add Pin"),
          createElement(
            "small",
            {},
            " - Click the pin icon to place a new pin at the center of your view. Pins are created instantly with a default title.",
          ),
          createElement("br"),
          createElement("b", {}, "Edit Pin"),
          createElement(
            "small",
            {},
            " - Select a pin (it turns red) and click Edit in the info panel to set its title, description, and portal links.",
          ),
          createElement("br"),
          createElement("b", {}, "Pin Position Lock"),
          createElement(
            "small",
            {},
            " - Pins start locked in place. Managers can unlock/re-lock from the pin info panel.",
          ),
          createElement("br"),
          createElement("b", {}, "Portals"),
          createElement(
            "small",
            {},
            " - Attach other tables to a pin. Clicking a portal link transports all connected users to that table.",
          ),
          createElement("br"),
          createElement("b", {}, "Manage Pins"),
          createElement(
            "small",
            {},
            " - Click the list icon to see all pins, locate them on the canvas, or clean up orphaned pins.",
          ),
          createElement("br"),
          createElement("br"),

          createElement("h2", {}, "Sidebar (GM)"),
          createElement("hr"),
          createElement(
            "small",
            {},
            "Upload images, create folders to organize them, adjust table settings, and copy the share link for players.",
          ),
          createElement("br"),
          createElement("br"),

          createElement("h2", {}, "Chat"),
          createElement("hr"),
          createElement("b", {}, "/roll"),
          createElement("small", {}, " - Roll dice. Format: "),
          createElement("code", {}, "[count]d[sides]+[modifier]"),
          createElement("br"),
          createElement("small", {}, "Example: "),
          createElement("code", {}, "/roll 2d6+3"),
          createElement("small", {}, " rolls two 6-sided dice and adds 3."),
          createElement("br"),
          createElement("br"),
          createElement("b", {}, "/5e"),
          createElement(
            "small",
            {},
            " - Ask AI about DnD 5E SRD Content: ",
          ),
          createElement("code", {}, "<query>"),
          createElement("br"),
          createElement("small", {}, "Example: "),
          createElement("code", {}, "/5e Info about fireball spell"),
          createElement(
            "small",
            {},
            " Returns info about the Fireball spell.",
          ),
          createElement("br"),
          createElement("br"),

          createElement("h2", {}, "Keyboard Shortcuts"),
          createElement("hr"),
          createElement("b", {}, "Alt/Option (Option)"),
          createElement(
            "small",
            {},
            " - Hold + drag to box-select multiple objects",
          ),
          createElement("br"),
          createElement("b", {}, "Shift"),
          createElement(
            "small",
            {},
            " - Hold + click to add objects to selection",
          ),
          createElement("br"),
          createElement("b", {}, "Delete / Backspace"),
          createElement("small", {}, " - Remove selected object(s)"),
          createElement("br"),
          createElement("b", {}, "Ctrl + T"),
          createElement(
            "small",
            {},
            " - Cycle selected object(s) through layers",
          ),
          createElement("br"),
          createElement("b", {}, "Ctrl + D"),
          createElement("small", {}, " - Duplicate selected object(s)"),
          createElement("br"),
          createElement("br"),

          createElement("h2", {}, "Canvas Log"),
          createElement("hr"),
          createElement("button", {}, "Open Log", {
            type: "click",
            event: () => {
              const canvasObjectsList = toolbar.tableApp.canvasLayer.canvas.getObjects();
              modal.show(
                createElement("div", { class: "help-content" }, [
                  createElement("h1", {}, "Canvas Log"),
                  createElement("hr"),
                  createElement("h2", {}, "Objects List"),
                  createElement("hr"),
                  createElement(
                    "div",
                    { class: "overflow-auto", style: "height: 300px;" },
                    [...renderCanvasObjectList(toolbar, canvasObjectsList)],
                  ),
                ]),
              );
            },
          }),
        ]),
      );
    },
  });
}
