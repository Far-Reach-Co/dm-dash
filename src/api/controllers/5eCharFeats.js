const { get5eCharGeneralQuery } = require("../queries/5eCharGeneral.js");
const {
  add5eCharFeatQuery,
  get5eCharFeatQuery,
  get5eCharFeatsByGeneralQuery,
  remove5eCharFeatQuery,
  edit5eCharFeatQuery,
} = require("../queries/5eCharFeats.js");

async function add5eCharFeat(req, res, next) {
  try {
    if (!req.user) throw { status: 401, message: "Missing Credentials" };
    const generalsData = await get5eCharGeneralQuery(req.body.general_id);
    const general = generalsData.rows[0];
    if (general.user_id !== req.user.id)
      throw { status: 403, message: "Forbidden" };

    const data = await add5eCharFeatQuery(req.body);
    res.status(201).json(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function get5eCharFeatsByGeneral(req, res, next) {
  try {
    if (!req.user) throw { status: 401, message: "Missing Credentials" };
    const generalsData = await get5eCharGeneralQuery(req.params.general_id);
    const general = generalsData.rows[0];
    if (general.user_id !== req.user.id)
      throw { status: 403, message: "Forbidden" };

    const data = await get5eCharFeatsByGeneralQuery(
      req.params.general_id
    );

    res.send(data.rows);
  } catch (err) {
    next(err);
  }
}

async function remove5eCharFeat(req, res, next) {
  try {
    if (!req.user) throw { status: 401, message: "Missing Credentials" };
    const otherProLangData = await get5eCharFeatQuery(req.params.id);
    const otherProLang = otherProLangData.rows[0];
    const generalsData = await get5eCharGeneralQuery(otherProLang.general_id);
    const general = generalsData.rows[0];
    if (general.user_id !== req.user.id)
      throw { status: 403, message: "Forbidden" };

    await remove5eCharFeatQuery(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function edit5eCharFeat(req, res, next) {
  try {
    if (!req.user) throw { status: 401, message: "Missing Credentials" };
    const otherProLangData = await get5eCharFeatQuery(req.params.id);
    const otherProLang = otherProLangData.rows[0];
    const generalsData = await get5eCharGeneralQuery(otherProLang.general_id);
    const general = generalsData.rows[0];
    if (general.user_id !== req.user.id)
      throw { status: 403, message: "Forbidden" };


    const data = await edit5eCharFeatQuery(req.params.id, req.body);
    res.status(200).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  get5eCharFeatsByGeneral,
  add5eCharFeat,
  remove5eCharFeat,
  edit5eCharFeat
};
