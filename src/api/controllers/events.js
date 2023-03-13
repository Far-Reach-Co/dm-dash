import {
  addEventQuery,
  getEventsQuery,
  getEventQuery,
  getEventsByLocationQuery,
  getEventsByCharacterQuery,
  getEventsByItemQuery,
  removeEventQuery,
  editEventQuery,
  getEventsByLoreQuery,
} from "../queries/events.js";

import { getItemQuery } from "../queries/items.js";
import { getCharacterQuery } from "../queries/characters.js";
import { getLocationQuery } from "../queries/locations.js";
import { getProjectQuery } from "../queries/projects.js";
import { getProjectUserByUserAndProjectQuery } from "../queries/projectUsers.js";
import { getLoreQuery } from "../queries/lores.js";

async function addEvent(req, res, next) {
  try {
    // if no user
    if (!req.user) throw { status: 401, message: "Missing Credentials" };
    req.body.user_id = req.user.id;
    // If user is not author or editor
    const projectData = await getProjectQuery(req.body.project_id);
    const project = projectData.rows[0];

    if (project.user_id !== req.user.id) {
      // not editor
      const projectUser = await getProjectUserByUserAndProjectQuery(
        req.user.id,
        project.id
      );
      if (!projectUser) throw { status: 403, message: "Forbidden" };
    }

    const data = await addEventQuery(req.body);
    res.status(201).json(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function getEvents(req, res, next) {
  try {
    // if no user
    if (!req.user) throw { status: 401, message: "Missing Credentials" };
    // If user is not author or editor
    const projectData = await getProjectQuery(req.params.project_id);
    const project = projectData.rows[0];

    if (project.user_id !== req.user.id) {
      // not editor
      const projectUser = await getProjectUserByUserAndProjectQuery(
        req.user.id,
        project.id
      );
      if (!projectUser) throw { status: 403, message: "Forbidden" };
    }

    const data = await getEventsQuery({
      projectId: req.params.project_id,
      limit: req.params.limit,
      offset: req.params.offset
    });

    res.send(data.rows);
  } catch (err) {
    next(err);
  }
}

async function getEventsByLocation(req, res, next) {
  try {
    // if no user
    if (!req.user) throw { status: 401, message: "Missing Credentials" };
    // get location to get project id
    const locationData = await getLocationQuery(req.params.location_id);
    const location = locationData.rows[0];
    // If user is not author or editor
    const projectData = await getProjectQuery(location.project_id);
    const project = projectData.rows[0];

    if (project.user_id !== req.user.id) {
      // not editor
      const projectUser = await getProjectUserByUserAndProjectQuery(
        req.user.id,
        project.id
      );
      if (!projectUser) throw { status: 403, message: "Forbidden" };
    }

    const data = await getEventsByLocationQuery(
      req.params.location_id
    );

    res.send(data.rows);
  } catch (err) {
    next(err);
  }
}

async function getEventsByCharacter(req, res, next) {
  try {
    // if no user
    if (!req.user) throw { status: 401, message: "Missing Credentials" };
    // get character to get project id
    const characterData = await getCharacterQuery(req.params.character_id);
    const character = characterData.rows[0];
    // If user is not author or editor
    const projectData = await getProjectQuery(character.project_id);
    const project = projectData.rows[0];

    if (project.user_id !== req.user.id) {
      // not editor
      const projectUser = await getProjectUserByUserAndProjectQuery(
        req.user.id,
        project.id
      );
      if (!projectUser) throw { status: 403, message: "Forbidden" };
    }

    const data = await getEventsByCharacterQuery(
      req.params.character_id
    );

    res.send(data.rows);
  } catch (err) {
    next(err);
  }
}

async function getEventsByItem(req, res, next) {
  try {
    // if no user
    if (!req.user) throw { status: 401, message: "Missing Credentials" };
    // get item to get project id
    const itemData = await getItemQuery(req.params.item_id);
    const item = itemData.rows[0];
    // If user is not author or editor
    const projectData = await getProjectQuery(item.project_id);
    const project = projectData.rows[0];

    if (project.user_id !== req.user.id) {
      // not editor
      const projectUser = await getProjectUserByUserAndProjectQuery(
        req.user.id,
        project.id
      );
      if (!projectUser) throw { status: 403, message: "Forbidden" };
    }

    const data = await getEventsByItemQuery(req.params.item_id);

    res.send(data.rows);
  } catch (err) {
    next(err);
  }
}

async function getEventsByLore(req, res, next) {
  try {
    // if no user
    if (!req.user) throw { status: 401, message: "Missing Credentials" };
    // get lore to get project id
    const loreData = await getLoreQuery(req.params.lore_id);
    const lore = loreData.rows[0];
    // If user is not author or editor
    const projectData = await getProjectQuery(lore.project_id);
    const project = projectData.rows[0];

    if (project.user_id !== req.user.id) {
      // not editor
      const projectUser = await getProjectUserByUserAndProjectQuery(
        req.user.id,
        project.id
      );
      if (!projectUser) throw { status: 403, message: "Forbidden" };
    }

    const data = await getEventsByLoreQuery(req.params.lore_id);

    res.send(data.rows);
  } catch (err) {
    next(err);
  }
}

async function removeEvent(req, res, next) {
  try {
    // if no user
    if (!req.user) throw { status: 401, message: "Missing Credentials" };
    // get note to get project id
    const noteData = await getEventQuery(req.params.id);
    const note = noteData.rows[0];
    // If user is not author or editor
    const projectData = await getProjectQuery(note.project_id);
    const project = projectData.rows[0];

    if (project.user_id !== req.user.id) {
      // not editor
      const projectUser = await getProjectUserByUserAndProjectQuery(
        req.user.id,
        project.id
      );
      if (!projectUser) throw { status: 403, message: "Forbidden" };
    }

    await removeEventQuery(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function editEvent(req, res, next) {
  try {
    // if no user
    if (!req.user) throw { status: 401, message: "Missing Credentials" };
    // get note to get project id
    const noteData = await getEventQuery(req.params.id);
    const note = noteData.rows[0];
    // If user is not author or editor
    const projectData = await getProjectQuery(note.project_id);
    const project = projectData.rows[0];

    if (project.user_id !== req.user.id) {
      // not editor
      const projectUser = await getProjectUserByUserAndProjectQuery(
        req.user.id,
        project.id
      );
      if (!projectUser) throw { status: 403, message: "Forbidden" };
    }

    const data = await editEventQuery(req.params.id, req.body);
    res.status(200).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

export default {
  getEvents,
  getEventsByLocation,
  addEvent,
  removeEvent,
  editEvent,
  getEventsByCharacter,
  getEventsByItem,
  getEventsByLore,
};
