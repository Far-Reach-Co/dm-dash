function searchTableElement() {
  const searchElement = document.getElementById("search-table-elements-input");
  if (!searchElement) return;
  const tableElementsList = document.getElementById("table-elements-list");
  if (!tableElementsList) return;

  const originalTableElementsListChildrenArray = Array.from(
    tableElementsList.children
  );

  searchElement.addEventListener("input", () => {
    const searchTerm = searchElement.value.toLowerCase().trim();
    // first remove all elements
    while (tableElementsList.firstChild) {
      tableElementsList.removeChild(tableElementsList.firstChild);
    }
    // check
    originalTableElementsListChildrenArray.forEach((elem) => {
      if (
        elem.firstElementChild &&
        elem.firstElementChild.innerText.toLowerCase().includes(searchTerm)
      ) {
        tableElementsList.appendChild(elem);
      }
    });
  });
}
searchTableElement();
