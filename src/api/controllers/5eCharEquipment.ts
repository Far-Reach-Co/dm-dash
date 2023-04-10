const { get5eCharGeneralQuery } = require("../queries/5eCharGeneral.js");
const {
  add5eCharEquipmentQuery,
  get5eCharEquipmentQuery,
  get5eCharEquipmentsByGeneralQuery,
  remove5eCharEquipmentQuery,
  edit5eCharEquipmentQuery,
} = require("../queries/5eCharEquipment.js");
const { getProjectPlayersByPlayerQuery } = require("../queries/projectPlayers.js");
const { getProjectQuery } = require("../queries/projects.js");

async function add5eCharEquipment(req, res, next) {
  try {
    if (!req.user) throw { status: 401, message: "Missing Credentials" };
    const generalsData = await get5eCharGeneralQuery(req.body.general_id);
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

    const data = await add5eCharEquipmentQuery(req.body);
    res.status(201).json(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function get5eCharEquipmentsByGeneral(req, res, next) {
  try {
    if (!req.user) throw { status: 401, message: "Missing Credentials" };
    const generalsData = await get5eCharGeneralQuery(req.params.general_id);
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

    const data = await get5eCharEquipmentsByGeneralQuery(
      req.params.general_id
    );

    res.send(data.rows);
  } catch (err) {
    next(err);
  }
}

async function remove5eCharEquipment(req, res, next) {
  try {
    if (!req.user) throw { status: 401, message: "Missing Credentials" };
    const otherProLangData = await get5eCharEquipmentQuery(req.params.id);
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

    await remove5eCharEquipmentQuery(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function edit5eCharEquipment(req, res, next) {
  try {
    if (!req.user) throw { status: 401, message: "Missing Credentials" };
    const otherProLangData = await get5eCharEquipmentQuery(req.params.id);
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
  edit5eCharEquipment
};
