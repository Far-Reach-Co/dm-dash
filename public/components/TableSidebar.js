import createElement from "../lib/createElement.js";
import TableSidebarComponent from "../lib/TableSidebarComponent.js";
import {
  fallbackCopyTextToClipboard,
  copyTextToClipboard,
} from "../lib/clipboard.js";
import modal from "./modal.js";
import { deleteThing, postThing } from "../lib/apiUtils.js";
import tableSelect from "../lib/tableSelect.js";
import socketIntegration from "../lib/socketIntegration.js";

export default class TableSidebar {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className = "sidebar";
    this.tableView = props.tableView;
    this.isVisible = false;
    this.navigate = props.navigate;

    // table sidebar component
    this.tableSidebarComponent = new TableSidebarComponent({
      domComponent: createElement("div", {
        style: "display: flex; flex-direction: column;",
      }),
      tableView: this.tableView,
    });

    // setup online users component
    this.onlineUsersComponent = new OnlineUsersComponent({
      domComponent: createElement("div"),
    });
  }

  renderCloseSidebarElem = () => {
    const elem = createElement("img", {
      id: "close-sidebar",
      class: "close-sidebar",
      src: "/assets/sidebar.svg",
      title: "Toggle sidebar",
      height: 32,
      width: 32,
    });
    elem.addEventListener("click", this.close);
    return elem;
  };

  close = () => {
    this.isVisible = false;
    if (this.container && this.container.style)
      this.container.style.transform = "translate(200px, 0px)";
    if (this.domComponent && this.domComponent.style)
      this.domComponent.style.zIndex = "2";
  };

  open = () => {
    this.isVisible = true;
    if (this.container && this.container.style)
      this.container.style.transform = "translate(0px, 0px)";
    if (this.domComponent && this.domComponent.style)
      this.domComponent.style.zIndex = "4";
  };

  hide = () => {
    this.close();
    this.domComponent.innerHTML = "";
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    this.tableSidebarComponent.render();
    this.onlineUsersComponent.render();

    const container = createElement(
      "div",
      {
        class: "sidebar-container",
      },
      [
        createElement(
          "div",
          {
            class:
              "d-flex align-items-center justify-content-between px-4 py-2",
          },
          [
            createElement(
              "div",
              { id: "table-display-title" },
              this.tableView.title
            ),
            createElement(
              "img",
              {
                class: "icon gear",
                src: "/assets/gears.svg",
                title: "Open Table Settings",
              },
              null,
              {
                type: "click",
                event: async () => {
                  modal.show(
                    createElement("div", { class: "help-content" }, [
                      createElement("h1", {}, "Table Settings"),
                      createElement("hr"),
                      createElement("h2", {}, "Change Table"),
                      createElement(
                        "small",
                        {},
                        "This will move everyone viewing this table to another table"
                      ),
                      createElement(
                        "form",
                        {},
                        [
                          await tableSelect(),
                          createElement("Button", { class: "ms-2" }, "Go"),
                        ],
                        {
                          type: "submit",
                          event: (e) => {
                            e.preventDefault();
                            const formData = new FormData(e.target);
                            const formProps = Object.fromEntries(formData);
                            const tableUUID = formProps.table_uuid;
                            if (tableUUID != 0) {
                              // push all viewers
                              socketIntegration.tableChanged(tableUUID);
                              // push current user
                              const searchParams = new URLSearchParams(
                                window.location.search
                              );
                              searchParams.set("uuid", tableUUID);
                              const newSearchParamsString =
                                searchParams.toString();

                              const newUrl =
                                window.location.pathname +
                                "?" +
                                newSearchParamsString;

                              window.history.replaceState(null, null, newUrl);

                              // Reload the page
                              window.location.reload();
                            }
                          },
                        }
                      ),
                      createElement("hr"),
                      createElement("h2", {}, "Details"),
                      createElement("div", {}, [
                        createElement(
                          "form",
                          {},
                          [
                            createElement(
                              "label",
                              {
                                for: "title",
                                class: "me-1",
                              },
                              "Edit Title"
                            ),
                            createElement("input", {
                              value: this.tableView.title,
                              name: "title",
                              id: "title",
                              required: true,
                            }),
                            createElement("br"),
                            createElement(
                              "button",
                              { class: "new-btn me-1" },
                              "Save"
                            ),
                            createElement("small", {
                              class: "success-message",
                              id: "title-update-success",
                            }),
                          ],
                          {
                            type: "submit",
                            event: (e) => {
                              e.preventDefault();
                              const formData = new FormData(e.target);
                              const formProps = Object.fromEntries(formData);
                              const res = postThing(
                                `/api/edit_table_view/${this.tableView.id}`,
                                {
                                  title: formProps.title,
                                }
                              );
                              if (res) {
                                // update success message
                                const titleUpdateMessageElem =
                                  document.querySelector(
                                    "#title-update-success"
                                  );
                                titleUpdateMessageElem.innerText = "Saved!";
                                // remove after 3 seconds
                                setTimeout(() => {
                                  titleUpdateMessageElem.innerText = "";
                                }, 3000); // 10seconds
                                // update table title on sidebar
                                document.querySelector(
                                  "#table-display-title"
                                ).innerText = formProps.title;
                                // update local tableState just in case
                                this.tableView.title = formProps.title;
                              }
                            },
                          }
                        ),
                        createElement("hr"),
                        createElement(
                          "button",
                          { class: "btn-red" },
                          "Delete Table",
                          {
                            type: "click",
                            event: (e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (
                                window.confirm(
                                  `Are you sure you want to delete ${this.tableView.title}`
                                )
                              ) {
                                deleteThing(
                                  `/api/remove_table_view/${this.tableView.id}`
                                );
                                window.location.pathname = "/dash";
                              }
                            },
                          }
                        ),
                      ]),
                    ])
                  );
                },
              }
            ),
          ]
        ),
        createElement("button", {}, "Copy Share Link", {
          type: "click",
          event: () => {
            copyTextToClipboard(window.location);
          },
        }),
        createElement("br"),
        this.tableSidebarComponent.domComponent,
        createElement("div", { class: "sidebar-header" }, "Online Users"),
        this.onlineUsersComponent.domComponent,
        this.renderCloseSidebarElem(),
      ]
    );
    this.container = container;
    this.open();
    return this.domComponent.append(container);
  };
}

class OnlineUsersComponent {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className = "online-users-container";

    this.usersList = [];
  }

  renderUsersList = () => {
    if (!this.usersList.length) return [createElement("small", {}, "None...")];

    return this.usersList.map((user) => {
      return createElement(
        "div",
        {
          class: "online-user-item",
        },
        [
          createElement("div", { class: "online-indicator" }),
          createElement("div", {}, user.username),
        ]
      );
    });
  };

  render = () => {
    this.domComponent.innerHTML = "";

    this.domComponent.append(...this.renderUsersList());
  };
}
