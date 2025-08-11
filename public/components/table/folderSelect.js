import createElement from "../createElement.js";
import { getThings } from "../../lib/apiUtils.js";

async function renderFolderSelectOptions(foldersData) {
  const projectElemList = [];

  foldersData.forEach((folder) => {
    const elem = createElement("option", { value: folder.id }, folder.title);
    projectElemList.push(elem);
  });

  return projectElemList;
}

export default async function renderFolderSelect(tableImage, projectId) {
  let foldersData;
  if (projectId) {
    foldersData = await getThings(
      `/api/get_table_folders_by_project/${projectId}`
    );
  } else {
    foldersData = await getThings("/api/get_table_folders_by_user");
  }

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
