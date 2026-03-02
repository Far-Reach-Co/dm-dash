import createElement from "../../lib/salt-lib/createElement.js";
import { apiGet } from "../../lib/apiUtils.js";
import { getTableFoldersEndpoint } from "./tableApi.js";

async function renderFolderSelectOptions(foldersData) {
  const elemsList = [];

  foldersData.forEach((folder) => {
    const elem = createElement("option", { value: folder.id }, folder.title);
    elemsList.push(elem);
  });

  return elemsList;
}

export default async function renderFolderSelect(tableImage, projectId) {
  const foldersResult = await apiGet(getTableFoldersEndpoint({ projectId }));
  const foldersData =
    foldersResult.ok && Array.isArray(foldersResult.data)
      ? foldersResult.data
      : [];

  // get current value
  let currentFolderValue = 0;
  if (foldersData.length) {
    const folder = foldersData.find((f) => f.id == tableImage.folder_id);
    currentFolderValue = folder ? folder.id : 0;
  }

  // populate options
  const optionsElems = await renderFolderSelectOptions(foldersData);

  const elem = createElement(
    "select",
    {
      required: false,
      title: "Choose a folder",
    },
    [createElement("option", { value: 0 }, "None"), ...optionsElems]
  );
  elem.value = currentFolderValue;
  return elem;
}
