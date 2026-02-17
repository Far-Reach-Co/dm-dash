import createElement from "../createElement.js";
import { postThing } from "../../lib/apiUtils.js";
import tableSelect from "./tableSelect.js";
import socketIntegration from "./socketIntegration.js";

export async function renderTableSettingsModal(sidebar) {
  const sections = [createElement("h1", {}, "Table Settings")];

  if (sidebar.can("canChangeTable")) {
    sections.push(
      createElement("hr"),
      createElement("h2", {}, "Change Table"),
      createElement(
        "small",
        {},
        "This will move everyone viewing this table to another table",
      ),
      createElement(
        "form",
        {},
        [await tableSelect(), createElement("Button", { class: "ms-2" }, "Go")],
        {
          type: "submit",
          event: (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const formProps = Object.fromEntries(formData);
            const tableUUID = formProps.table_uuid;
            if (tableUUID != 0) {
              socketIntegration.tableChanged(tableUUID);
            }
          },
        },
      ),
    );
  }

  sections.push(
    createElement("hr"),
    createElement("h2", {}, "Details"),
    createElement("div", {}, [
      createElement("div", { class: "input-container" }, [
        createElement(
          "label",
          {
            for: "title",
            class: "me-1",
          },
          "Edit Title",
        ),
        createElement("input", {
          value: sidebar.tableView.title,
          name: "title",
          id: "title-input",
        }),
      ]),
      createElement("br"),
      createElement("div", { class: "d-flex align-items-center" }, [
        createElement(
          "small",
          {
            class: "text-orange me-1 font-bold",
          },
          "Make Public",
        ),
        sidebar.tableView.is_public
          ? createElement("input", {
              type: "checkbox",
              name: "is_public",
              id: "is_public-input",
              checked: true,
            })
          : createElement("input", {
              type: "checkbox",
              name: "is_public",
              id: "is_public-input",
            }),
      ]),
      createElement("br"),
      createElement("button", { class: "new-btn me-1" }, "Save", {
        type: "click",
        event: async (e) => {
          e.preventDefault();
          const titleInput = document.getElementById("title-input");
          const isPublicInput = document.getElementById("is_public-input");

          const res = await postThing(`/api/edit_table_view/${sidebar.tableView.id}`, {
            title: titleInput.value,
            is_public: isPublicInput.checked,
          });
          if (res) {
            const titleUpdateMessageElem = document.querySelector(
              "#title-update-success",
            );
            titleUpdateMessageElem.innerText = "Saved!";
            setTimeout(() => {
              titleUpdateMessageElem.innerText = "";
            }, 3000);
            document.querySelector("#table-display-title").innerText =
              titleInput.value;
            sidebar.tableView.title = titleInput.value;
            sidebar.tableView.is_public = isPublicInput.checked;
          }
        },
      }),
      createElement("small", {
        class: "success-message",
        id: "title-update-success",
      }),
      createElement("hr"),
      createElement("button", { class: "btn-red" }, "Delete Table", {
        type: "click",
        event: async (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (
            window.confirm(
              `Are you sure you want to delete ${sidebar.tableView.title}`,
            )
          ) {
            try {
              const res = await fetch(
                `/api/remove_table_view/${sidebar.tableView.id}`,
                { method: "DELETE" },
              );
              if (res.status !== 204) {
                throw new Error(`remove table failed with status ${res.status}`);
              }
            } catch (err) {
              console.log(err);
              window.alert("Failed to delete table.");
              return;
            }
            window.location.pathname = "/dash";
          }
        },
      }),
    ]),
  );

  return createElement("div", { class: "help-content" }, sections);
}
