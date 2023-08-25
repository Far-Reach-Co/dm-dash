import createElement from "./createElement.js";
import { getThings } from "../lib/apiUtils.js";

export default async function projectSelect() {
  async function renderProjectSelectOptions() {
    let projects = await getThings(`/api/get_projects`);

    const projectElemList = [];

    projects.forEach((project) => {
      const elem = createElement(
        "option",
        { value: project.id },
        project.title
      );
      projectElemList.push(elem);
    });

    return projectElemList;
  }

  return createElement(
    "select",
    {
      id: "project_id",
      name: "project_id",
      required: false,
      title: "Choose a wyrld",
    },
    [
      createElement("option", { value: 0 }, "None"),
      ...(await renderProjectSelectOptions()),
    ]
  );
}
