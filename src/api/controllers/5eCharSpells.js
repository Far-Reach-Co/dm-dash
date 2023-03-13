import { get5eCharGeneralQuery } from "../queries/5eCharGeneral.js";

import {
  add5eCharSpellQuery,
  get5eCharSpellQuery,
  get5eCharSpellsByTypeQuery,
  remove5eCharSpellQuery,
  edit5eCharSpellQuery,
} from "../queries/5eCharSpells.js";

import { getProjectPlayersByPlayerQuery } from "../queries/projectPlayers.js";
import { getProjectQuery } from "../queries/projects.js";

async function add5eCharSpell(req, res, next) {
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

    const data = await add5eCharSpellQuery(req.body);
    res.status(201).json(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function get5eCharSpellsByType(req, res, next) {
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
    if (!req.user) throw { status: 401, message: "Missing Credentials" };
    const otherProLangData = await get5eCharSpellQuery(req.params.id);
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


    const data = await edit5eCharSpellQuery(req.params.id, req.body);
    res.status(200).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

export default {
  get5eCharSpellsByType,
  add5eCharSpell,
  remove5eCharSpell,
  edit5eCharSpell
};
