import {
  // add5eCharSpellSlotInfoQuery,
  get5eCharSpellSlotInfoQuery,
  // get5eCharSpellSlotInfosByGeneralQuery,
  // remove5eCharSpellSlotInfoQuery,
  edit5eCharSpellSlotInfoQuery,
} from "../queries/5eCharSpellSlots";

// async function add5eCharSpellSlotInfo(req, res, next) {
//   try {

//     const data = await add5eCharSpellSlotInfoQuery(req.body);
//     res.status(201).json(data.rows[0]);
//   } catch (err) {
//     next(err);
//   }
// }

// async function get5eCharSpellSlotInfosByGeneral(req, res, next) {
//   try {

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

//     await remove5eCharSpellSlotInfoQuery(req.params.id);
//     res.status(204).send();
//   } catch (err) {
//     next(err);
//   }
// }

async function edit5eCharSpellSlotInfo(req, res, next) {
  try {
    const data = await edit5eCharSpellSlotInfoQuery(req.params.id, req.body);
    res.status(200).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  // get5eCharSpellSlotInfosByGeneral,
  // add5eCharSpellSlotInfo,
  // remove5eCharSpellSlotInfo,
  edit5eCharSpellSlotInfo,
};
