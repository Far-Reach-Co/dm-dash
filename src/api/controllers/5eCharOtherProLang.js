const { get5eCharGeneralQuery } = require("../queries/5eCharGeneral.js");
const {
  add5eCharOtherProLangQuery,
  get5eCharOtherProLangQuery,
  get5eCharOtherProLangsByGeneralQuery,
  remove5eCharOtherProLangQuery,
  edit5eCharOtherProLangQuery,
} = require("../queries/5eCharOtherProLang.js");

async function add5eCharOtherProLang(req, res, next) {
  try {
    if (!req.user) throw { status: 401, message: "Missing Credentials" };
    const generalsData = await get5eCharGeneralQuery(req.body.general_id);
    const general = generalsData.rows[0];
    if (general.user_id !== req.user.id)
      throw { status: 403, message: "Forbidden" };

    const data = await add5eCharOtherProLangQuery(req.body);
    res.status(201).json(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function get5eCharOtherProLangsByGeneral(req, res, next) {
  try {
    if (!req.user) throw { status: 401, message: "Missing Credentials" };
    const generalsData = await get5eCharGeneralQuery(req.params.general_id);
    const general = generalsData.rows[0];
    if (general.user_id !== req.user.id)
      throw { status: 403, message: "Forbidden" };

    const data = await get5eCharOtherProLangsByGeneralQuery(
      req.params.general_id
    );

    res.send(data.rows);
  } catch (err) {
    next(err);
  }
}

async function remove5eCharOtherProLang(req, res, next) {
  try {
    if (!req.user) throw { status: 401, message: "Missing Credentials" };
    const otherProLangData = await get5eCharOtherProLangQuery(req.params.id);
    const otherProLang = otherProLangData.rows[0];
    const generalsData = await get5eCharGeneralQuery(otherProLang.general_id);
    const general = generalsData.rows[0];
    if (general.user_id !== req.user.id)
      throw { status: 403, message: "Forbidden" };

    await remove5eCharOtherProLangQuery(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function edit5eCharOtherProLang(req, res, next) {
  try {
    if (!req.user) throw { status: 401, message: "Missing Credentials" };
    const otherProLangData = await get5eCharOtherProLangQuery(req.params.id);
    const otherProLang = otherProLangData.rows[0];
    const generalsData = await get5eCharGeneralQuery(otherProLang.general_id);
    const general = generalsData.rows[0];
    if (general.user_id !== req.user.id)
      throw { status: 403, message: "Forbidden" };


    const data = await edit5eCharOtherProLangQuery(req.params.id, req.body);
    res.status(200).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  get5eCharOtherProLangsByGeneral,
  add5eCharOtherProLang,
  remove5eCharOtherProLang,
  edit5eCharOtherProLang
};
