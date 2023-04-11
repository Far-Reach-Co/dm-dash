import {
  add5eCharSpellQuery,
  get5eCharSpellQuery,
  get5eCharSpellsByTypeQuery,
  remove5eCharSpellQuery,
  edit5eCharSpellQuery,
} from "../queries/5eCharSpells";

async function add5eCharSpell(req, res, next) {
  try {
    const data = await add5eCharSpellQuery(req.body);
    res.status(201).json(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function get5eCharSpellsByType(req, res, next) {
  try {
    const data = await get5eCharSpellsByTypeQuery(
      req.params.general_id,
      req.params.type
    );

    res.send(data.rows);
  } catch (err) {
    next(err);
  }
}

async function remove5eCharSpell(req, res, next) {
  try {
    await remove5eCharSpellQuery(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function edit5eCharSpell(req, res, next) {
  try {
    const data = await edit5eCharSpellQuery(req.params.id, req.body);
    res.status(200).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  get5eCharSpellsByType,
  add5eCharSpell,
  remove5eCharSpell,
  edit5eCharSpell,
};