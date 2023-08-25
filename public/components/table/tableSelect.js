import createElement from "../createElement.js";
import { getThings } from "../../lib/apiUtils.js";

export default async function tableSelect() {
  async function renderTableSelectOptions() {
    const searchParams = new URLSearchParams(window.location.search);
    const projectId = searchParams.get("project");
    let tables = [];
    if (projectId) {
      tables = await getThings(`/api/get_table_views_by_project/${projectId}`);
    } else {
      tables = await getThings(`/api/get_table_views_by_user`);
    }

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
