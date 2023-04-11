import {
  add5eCharOtherProLangQuery,
  get5eCharOtherProLangQuery,
  get5eCharOtherProLangsByGeneralQuery,
  remove5eCharOtherProLangQuery,
  edit5eCharOtherProLangQuery,
} from "../queries/5eCharOtherProLang";

async function add5eCharOtherProLang(req, res, next) {
  try {
    const data = await add5eCharOtherProLangQuery(req.body);
    res.status(201).json(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function get5eCharOtherProLangsByGeneral(req, res, next) {
  try {
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
    await remove5eCharOtherProLangQuery(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function edit5eCharOtherProLang(req, res, next) {
  try {
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
  edit5eCharOtherProLang,
};