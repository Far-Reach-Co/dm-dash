import createElement from "../lib/createElement.js";
import { getThings } from "./apiUtils.js";
import state from "./state.js";

export default async function itemSelect(
  selectedItem,
  onChangeCallback
) {
  async function renderItemSelectOptions() {
    let items = await getThings(
      `/api/get_items/${state.currentProject.id}/100/0`
    );

    const itemElemsList = [];

    items.forEach((item) => {
      const elem = createElement(
        "option",
        { value: item.id },
        item.title
      );
      if (selectedItem == item.id) elem.selected = true;
      itemElemsList.push(elem);
    });

    return itemElemsList;
  }

  return createElement(
    "select",
    { id: "item_id", name: "item_id", required: false },
    [
      createElement("option", { value: 0 }, "None"),
      ...(await renderItemSelectOptions()),
    ],
    {
      type: "change",
      event: (e) => {
        if (onChangeCallback) onChangeCallback(e.target.value);
      },
    }
  );
}
