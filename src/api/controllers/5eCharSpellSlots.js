import { get5eCharGeneralQuery } from "../queries/5eCharGeneral.js";
import { get5eCharSpellSlotInfoQuery, edit5eCharSpellSlotInfoQuery } from "../queries/5eCharSpellSlots.js";
import { getProjectPlayersByPlayerQuery } from "../queries/projectPlayers.js";
import { getProjectQuery } from "../queries/projects.js";

// async function add5eCharSpellSlotInfo(req, res, next) {
//   try {
//     if (!req.user) throw { status: 401, message: "Missing Credentials" };
//     const generalsData = await get5eCharGeneralQuery(req.body.general_id);
//     const general = generalsData.rows[0];
//     if (general.user_id !== req.user.id)
//       throw { status: 403, message: "Forbidden" };

//     const data = await add5eCharSpellSlotInfoQuery(req.body);
//     res.status(201).json(data.rows[0]);
//   } catch (err) {
//     next(err);
//   }
// }

// async function get5eCharSpellSlotInfosByGeneral(req, res, next) {
//   try {
//     if (!req.user) throw { status: 401, message: "Missing Credentials" };
//     const generalsData = await get5eCharGeneralQuery(req.params.general_id);
//     const general = generalsData.rows[0];
//     if (general.user_id !== req.user.id)
//       throw { status: 403, message: "Forbidden" };

//     const data = await get5eCharSpellSlotInfosByGeneralQuery(
//       req.params.general_id
//     );

//     res.send(data.rows);
//   } catch (err) {
//     next(err);
//   }
// }

// async function remove5eCharSpellSlotInfo(req, res, next) {
//   try {
//     if (!req.user) throw { status: 401, message: "Missing Credentials" };
//     const otherProLangData = await get5eCharSpellSlotInfoQuery(req.params.id);
//     const otherProLang = otherProLangData.rows[0];
//     const generalsData = await get5eCharGeneralQuery(otherProLang.general_id);
//     const general = generalsData.rows[0];
//     if (general.user_id !== req.user.id)
//       throw { status: 403, message: "Forbidden" };

//     await remove5eCharSpellSlotInfoQuery(req.params.id);
//     res.status(204).send();
//   } catch (err) {
//     next(err);
//   }
// }

async function edit5eCharSpellSlotInfo(req, res, next) {
  try {
    if (!req.user) throw { status: 401, message: "Missing Credentials" };
    const otherProLangData = await get5eCharSpellSlotInfoQuery(req.params.id);
    const otherProLang = otherProLangData.rows[0];
    const generalsData = await get5eCharGeneralQuery(otherProLang.general_id);
    const general = generalsData.rows[0];
    // not creator of character
    if (general.user_id !== req.user.id) {
      const projectPlayersData = await getProjectPlayersByPlayerQuery(
        general.id
      );
      if (projectPlayersData.rows.length) {
        const projectPlayer = projectPlayersData.rows[0];
        const projectData = await getProjectQuery(projectPlayer.project_id);
        const project = projectData.rows[0];
        // not creator of a linked project
        if (project.user_id !== req.user.id)
          throw { status: 403, message: "Forbidden" };
      } else throw { status: 403, message: "Forbidden" };
    }


    const data = await edit5eCharSpellSlotInfoQuery(req.params.id, req.body);
    res.status(200).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

export default {
  // get5eCharSpellSlotInfosByGeneral,
  // add5eCharSpellSlotInfo,
  // remove5eCharSpellSlotInfo,
  edit5eCharSpellSlotInfo
};
