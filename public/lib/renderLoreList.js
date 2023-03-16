import { getThings } from "./apiUtils.js";
import createElement from "./createElement.js";

export default async function renderLoreList(type, id, navigate) {
  const loreRelations = await getThings(
    `/api/get_lore_relations_by_${type}/${id}`
  );
  if (!loreRelations.length)
    return [createElement("small", { style: "margin-left: 5px;" }, "None...")];

  return await Promise.all(
    loreRelations.map(async (relation) => {
      const lore = await getThings(`/api/get_lore/${relation.lore_id}`);

      if (lore) {
        const elem = createElement(
          "a",
          {
            class: "small-clickable",
            style: "margin: 3px",
          },
          lore.title,
          {
            type: "click",
            event: () =>
              navigate({
                title: "single-lore",
                sidebar: true,
                params: { content: lore },
              }),
          }
        );

        return elem;
      }
    })
  );
}
