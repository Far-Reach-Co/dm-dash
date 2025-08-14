import createElement from "../createElement.js";
import { getThings } from "../../lib/apiUtils.js";

async function renderRecordSelectOptions(recordsData) {
  const elemsList = [];

  recordsData.forEach((record) => {
    const elem = createElement("option", { value: record.id }, record.title);
    elemsList.push(elem);
  });

  return elemsList;
}

export default async function renderRecordSelect(projectId) {
  let recordsData;
  if (projectId) {
    recordsData = await getThings(`/api/get_records_by_project/${projectId}`);
  } else {
    recordsData = await getThings("/api/get_records_by_user");
  }

  // populate options
  const optionsElems = await renderRecordSelectOptions(recordsData);

  const elem = createElement(
    "select",
    {
      required: false,
      title: "Choose a record",
    },
    [createElement("option", { value: 0 }, "Select"), ...optionsElems]
  );

  return elem;
}
