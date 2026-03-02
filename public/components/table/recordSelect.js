import createElement from "../../lib/salt-lib/createElement.js";
import { apiGet } from "../../lib/apiUtils.js";
import { getRecordsEndpoint } from "./tableApi.js";

async function renderRecordSelectOptions(recordsData) {
  const elemsList = [];

  recordsData.forEach((record) => {
    const elem = createElement("option", { value: record.id }, record.title);
    elemsList.push(elem);
  });

  return elemsList;
}

export default async function renderRecordSelect(projectId) {
  const recordsResult = await apiGet(getRecordsEndpoint(projectId));
  const recordsData =
    recordsResult.ok && Array.isArray(recordsResult.data)
      ? recordsResult.data
      : [];

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
