import { get5eCharGeneralQuery } from "../queries/5eCharGeneral.js";

import {
  addProjectPlayerQuery,
  getProjectPlayersByProjectQuery,
  removeProjectPlayerQuery,
  editProjectPlayerQuery,
  getProjectPlayersByPlayerQuery,
} from "../queries/projectPlayers.js";

import { getProjectQuery } from "../queries/projects.js";
import { getProjectUserByUserAndProjectQuery } from "../queries/projectUsers.js";

async function addProjectPlayer(req, res, next) {
  try {
    // if no user
    if (!req.user) throw { status: 401, message: "Missing Credentials" };

    const projectData = await getProjectQuery(req.body.project_id);
    const project = projectData.rows[0];

    if (project.user_id !== req.user.id) {
      const projectUser = await getProjectUserByUserAndProjectQuery(
        req.user.id,
        project.id
      );
      if (!projectUser) throw { status: 403, message: "Forbidden" };
    }

    const data = await addProjectPlayerQuery(req.body);
    res.status(201).json(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function getProjectPlayersByProject(req, res, next) {
  try {
    // if no user
    if (!req.user) throw { status: 401, message: "Missing Credentials" };

    const projectData = await getProjectQuery(req.params.project_id);
    const project = projectData.rows[0];

    if (project.user_id !== req.user.id) {
      const projectUser = await getProjectUserByUserAndProjectQuery(
        req.user.id,
        project.id
      );
      if (!projectUser) throw { status: 403, message: "Forbidden" };
    }

    const projectPlayerData = await getProjectPlayersByProjectQuery(
      req.params.project_id
    );

    res.status(200).json(projectPlayerData.rows);
  } catch (err) {
    next(err);
  }
}

async function getProjectPlayersByPlayer(req, res, next) {
  try {
    // if no user
    if (!req.user) throw { status: 401, message: "Missing Credentials" };

    const characterData = await get5eCharGeneralQuery(req.params.player_id);
    const character = characterData.rows[0];

    if (character.user_id !== req.user.id) throw { status: 403, message: "Forbidden" };

    const projectPlayerData = await getProjectPlayersByPlayerQuery(
      req.params.player_id
    );

    res.status(200).json(projectPlayerData.rows);
  } catch (err) {
    next(err);
  }
}

async function removeProjectPlayer(req, res, next) {
  try {
    // if no user
    if (!req.user) throw { status: 401, message: "Missing Credentials" };

    await removeProjectPlayerQuery(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function editProjectPlayer(req, res, next) {
  try {
    // if no user
    if (!req.user) throw { status: 401, message: "Missing Credentials" };

    const characterData = await get5eCharGeneralQuery(req.params.player_id);
    const character = characterData.rows[0];

    if (character.user_id !== req.user.id) throw { status: 403, message: "Forbidden" };

    const data = await editProjectPlayerQuery(req.params.id, req.body);
    res.status(200).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

export {
  addProjectPlayer,
  getProjectPlayersByProject,
  getProjectPlayersByPlayer,
  removeProjectPlayer,
  editProjectPlayer,
};
