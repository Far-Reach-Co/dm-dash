function initDashSearch({ inputId, listIds }) {
  const searchElement = document.getElementById(inputId);
  if (!searchElement) return;

  const lists = listIds
    .map((listId) => document.getElementById(listId))
    .filter(Boolean);
  if (!lists.length) return;

  const originalItemsByList = new Map();
  lists.forEach((listElem) => {
    originalItemsByList.set(listElem, Array.from(listElem.children));
  });

  searchElement.addEventListener("input", () => {
    const searchTerm = searchElement.value.toLowerCase().trim();

    lists.forEach((listElem) => {
      const originalItems = originalItemsByList.get(listElem) || [];
      while (listElem.firstChild) {
        listElem.removeChild(listElem.firstChild);
      }

      originalItems.forEach((elem) => {
        const titleElem =
          elem.querySelector(".dash-detail-title") || elem.firstElementChild;
        const titleText = (titleElem?.innerText || "").toLowerCase();
        if (titleText.includes(searchTerm)) {
          listElem.appendChild(elem);
        }
      });
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initDashSearch({
    inputId: "search-table-elements-input",
    listIds: ["table-elements-list"],
  });

  initDashSearch({
    inputId: "search-record-elements-input",
    listIds: ["record-elements-list"],
  });

  initDashSearch({
    inputId: "search-sheet-elements-input",
    listIds: ["sheet-elements-list", "shared-sheet-elements-list"],
  });
});
