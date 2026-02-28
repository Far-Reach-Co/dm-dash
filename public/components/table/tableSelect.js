import createElement from "../createElement.js";
import { apiGet } from "../../lib/apiUtils.js";
import { getTablesEndpoint } from "./tableApi.js";

export default async function tableSelect() {
  async function renderTableSelectOptions() {
    const tablesResult = await apiGet(getTablesEndpoint());
    const tables =
      tablesResult.ok && Array.isArray(tablesResult.data)
        ? tablesResult.data
        : [];

    const tableElemList = [];

    tables.forEach((table) => {
      const elem = createElement("option", { value: table.uuid }, table.title);
      tableElemList.push(elem);
    });

    return tableElemList;
  }

  return createElement(
    "select",
    { id: "table_uuid", name: "table_uuid", required: true },
    [
      createElement("option", { value: 0 }, "None"),
      ...(await renderTableSelectOptions()),
    ]
  );
}
