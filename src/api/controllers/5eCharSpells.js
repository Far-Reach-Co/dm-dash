const { get5eCharGeneralQuery } = require("../queries/5eCharGeneral.js");
const {
  add5eCharSpellQuery,
  get5eCharSpellQuery,
  get5eCharSpellsByGeneralQuery,
  remove5eCharSpellQuery,
  edit5eCharSpellQuery,
} = require("../queries/5eCharSpells.js");

async function add5eCharSpell(req, res, next) {
  try {
    if (!req.user) throw { status: 401, message: "Missing Credentials" };
    const generalsData = await get5eCharGeneralQuery(req.body.general_id);
    const general = generalsData.rows[0];
    if (general.user_id !== req.user.id)
      throw { status: 403, message: "Forbidden" };

    const data = await add5eCharSpellQuery(req.body);
    res.status(201).json(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function get5eCharSpellsByGeneral(req, res, next) {
  try {
    if (!req.user) throw { status: 401, message: "Missing Credentials" };
    const generalsData = await get5eCharGeneralQuery(req.params.general_id);
    const general = generalsData.rows[0];
    if (general.user_id !== req.user.id)
      throw { status: 403, message: "Forbidden" };

    const data = await get5eCharSpellsByGeneralQuery(
      req.params.general_id
    );

    res.send(data.rows);
  } catch (err) {
    next(err);
  }
}

async function remove5eCharSpell(req, res, next) {
  try {
    if (!req.user) throw { status: 401, message: "Missing Credentials" };
    const otherProLangData = await get5eCharSpellQuery(req.params.id);
    const otherProLang = otherProLangData.rows[0];
    const generalsData = await get5eCharGeneralQuery(otherProLang.general_id);
    const general = generalsData.rows[0];
    if (general.user_id !== req.user.id)
      throw { status: 403, message: "Forbidden" };

    await remove5eCharSpellQuery(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function edit5eCharSpell(req, res, next) {
  try {
    if (!req.user) throw { status: 401, message: "Missing Credentials" };
    const otherProLangData = await get5eCharSpellQuery(req.params.id);
    const otherProLang = otherProLangData.rows[0];
    const generalsData = await get5eCharGeneralQuery(otherProLang.general_id);
    const general = generalsData.rows[0];
    if (general.user_id !== req.user.id)
      throw { status: 403, message: "Forbidden" };


    const data = await edit5eCharSpellQuery(req.params.id, req.body);
    res.status(200).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  get5eCharSpellsByGeneral,
  add5eCharSpell,
  remove5eCharSpell,
  edit5eCharSpell
};