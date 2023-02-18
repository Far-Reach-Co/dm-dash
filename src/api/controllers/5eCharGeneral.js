const {
  get5eCharsGeneralByUserQuery,
  add5eCharGeneralQuery,
  get5eCharGeneralQuery,
  remove5eCharGeneralQuery,
  edit5eCharGeneralQuery,
} = require("../queries/5eCharGeneral");
const {
  get5eCharProQuery,
  add5eCharProQuery,
  get5eCharProByGeneralQuery,
  remove5eCharProQuery,
  edit5eCharProQuery,
} = require("../queries/5eCharPro");
const {
  add5eCharBackQuery,
  get5eCharBackByGeneralQuery,
  remove5eCharBackQuery,
  get5eCharBackQuery,
  edit5eCharBackQuery,
} = require("../queries/5eCharBack");
const {
  get5eCharSpellSlotInfosByGeneralQuery,
  add5eCharSpellSlotInfoQuery,
  remove5eCharSpellSlotInfoQuery,
} = require("../queries/5eCharSpellSlots");

async function add5eChar(req, res, next) {
  try {
    if (!req.user) throw { status: 401, message: "Missing Credentials" };

    req.body.user_id = req.user.id;
    const generalData = await add5eCharGeneralQuery(req.body);
    const general = generalData.rows[0];
    await add5eCharProQuery({ general_id: general.id });
    await add5eCharBackQuery({ general_id: general.id });
    await add5eCharSpellSlotInfoQuery({ general_id: general.id });

    res.status(201).json(general);
  } catch (err) {
    next(err);
  }
}

async function get5eCharsByUser(req, res, next) {
  try {
    if (!req.user) throw { status: 401, message: "Missing Credentials" };
    const generalsData = await get5eCharsGeneralByUserQuery(req.user.id);
    const generals = generalsData.rows;
    if (generals.length) {
      if (generals[0].user_id !== req.user.id)
        throw { status: 403, message: "Forbidden" };

      for (var general of generals) {
        const proData = await get5eCharProByGeneralQuery(general.id);
        const pro = proData.rows[0];
        const backData = await get5eCharBackByGeneralQuery(general.id);
        const back = backData.rows[0];
        const spellSlotsData = await get5eCharSpellSlotInfosByGeneralQuery(
          general.id
        );
        const spellSlots = spellSlotsData.rows[0];

        general.proficiencies = pro;
        general.background = back;
        general.spell_slots = spellSlots;
      }
    }

    res.send(generals);
  } catch (err) {
    next(err);
  }
}

async function remove5eChar(req, res, next) {
  try {
    if (!req.user) throw { status: 401, message: "Missing Credentials" };

    const generalData = await get5eCharGeneralQuery(req.params.id);
    const general = generalData.rows[0];
    if (general.user_id !== req.user.id)
      throw { status: 403, message: "Forbidden" };
    const proData = await get5eCharProByGeneralQuery(general.id);
    const pro = proData.rows[0];
    const backData = await get5eCharBackByGeneralQuery(general.id);
    const back = backData.rows[0];
    const spellSlotsData = await get5eCharSpellSlotInfosByGeneralQuery(
      general.id
    );
    const spellSlots = spellSlotsData.rows[0];

    await remove5eCharGeneralQuery(general.id);
    await remove5eCharProQuery(pro.id);
    await remove5eCharBackQuery(back.id);
    await remove5eCharSpellSlotInfoQuery(spellSlots.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function edit5eCharGeneral(req, res, next) {
  try {
    if (!req.user) throw { status: 401, message: "Missing Credentials" };

    const generalData = await get5eCharGeneralQuery(req.params.id);
    const general = generalData.rows[0];
    if (general.user_id !== req.user.id)
      throw { status: 403, message: "Forbidden" };

    const data = await edit5eCharGeneralQuery(req.params.id, req.body);
    res.status(200).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function edit5eCharPro(req, res, next) {
  try {
    if (!req.user) throw { status: 401, message: "Missing Credentials" };

    const proData = await get5eCharProQuery(req.params.id);
    const pro = proData.rows[0];
    const generalData = await get5eCharGeneralQuery(pro.general_id);
    const general = generalData.rows[0];
    if (general.user_id !== req.user.id)
      throw { status: 403, message: "Forbidden" };

    const data = await edit5eCharProQuery(req.params.id, req.body);
    res.status(200).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function edit5eCharBack(req, res, next) {
  try {
    if (!req.user) throw { status: 401, message: "Missing Credentials" };

    const backData = await get5eCharBackQuery(req.params.id);
    const back = backData.rows[0];
    const generalData = await get5eCharGeneralQuery(back.general_id);
    const general = generalData.rows[0];
    if (general.user_id !== req.user.id)
      throw { status: 403, message: "Forbidden" };

    const data = await edit5eCharBackQuery(req.params.id, req.body);
    res.status(200).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  add5eChar,
  get5eCharsByUser,
  remove5eChar,
  edit5eCharGeneral,
  edit5eCharPro,
  edit5eCharBack,
};
