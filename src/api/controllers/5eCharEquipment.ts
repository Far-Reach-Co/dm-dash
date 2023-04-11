import {
  add5eCharEquipmentQuery,
  get5eCharEquipmentQuery,
  get5eCharEquipmentsByGeneralQuery,
  remove5eCharEquipmentQuery,
  edit5eCharEquipmentQuery,
} from "../queries/5eCharEquipment";

async function add5eCharEquipment(req, res, next) {
  try {
    const data = await add5eCharEquipmentQuery(req.body);
    res.status(201).json(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function get5eCharEquipmentsByGeneral(req, res, next) {
  try {
    const data = await get5eCharEquipmentsByGeneralQuery(req.params.general_id);

    res.send(data.rows);
  } catch (err) {
    next(err);
  }
}

async function remove5eCharEquipment(req, res, next) {
  try {
    await remove5eCharEquipmentQuery(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function edit5eCharEquipment(req, res, next) {
  try {
    const data = await edit5eCharEquipmentQuery(req.params.id, req.body);
    res.status(200).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  get5eCharEquipmentsByGeneral,
  add5eCharEquipment,
  remove5eCharEquipment,
  edit5eCharEquipment,
};
