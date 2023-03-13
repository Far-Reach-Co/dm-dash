import {
  addCharacterQuery,
  getCharacterQuery,
  getCharactersQuery,
  getCharactersWithFilterQuery,
  getCharactersWithKeywordQuery,
  getCharactersWithKeywordAndFilterQuery,
  getCharactersByLocationQuery,
  removeCharacterQuery,
  editCharacterQuery,
} from "../queries/characters.js";

import { addEventQuery } from "../queries/events.js";
import { getImageQuery, removeImageQuery } from "../queries/images.js";
import { getLocationQuery } from "../queries/locations.js";
import { getProjectQuery, editProjectQuery } from "../queries/projects.js";
import { getProjectUserByUserAndProjectQuery } from "../queries/projectUsers.js";
import { removeFile } from "./s3.js";

async function addCharacter(req, res, next) {
  try {
    // if no user
    if (!req.user) throw { status: 401, message: "Missing Credentials" };
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

    const data = await addCharacterQuery(req.body);
    res.status(201).json(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function getCharacter(req, res, next) {
  try {
    // if no user
    if (!req.user) throw { status: 401, message: "Missing Credentials" };
    // get character to get project id
    const characterData = await getCharacterQuery(req.params.id);
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

    res.send(character);
  } catch (err) {
    next(err);
  }
}

async function getCharacters(req, res, next) {
  // if no user
  if (!req.user) throw { status: 401, message: "Missing Credentials" };
  // If user is not author or editor
  const projectData = await getProjectQuery(req.params.project_id);
  const project = projectData.rows[0];

  if (project.user_id !== req.user.id) {
    // not editor
    const projectUser = getProjectUserByUserAndProjectQuery(
      req.user.id,
      project.id
    );
    if (!projectUser) throw { status: 403, message: "Forbidden" };
  }

  if (req.params.keyword && req.params.filter) {
    try {
      const data = await getCharactersWithKeywordAndFilterQuery({
        projectId: req.params.project_id,
        limit: req.params.limit,
        offset: req.params.offset,
        keyword: req.params.keyword,
        filter: req.params.filter,
      });

      res.send(data.rows);
    } catch (err) {
      next(err);
    }
  } else if (req.params.keyword && !req.params.filter) {
    try {
      const data = await getCharactersWithKeywordQuery({
        projectId: req.params.project_id,
        limit: req.params.limit,
        offset: req.params.offset,
        keyword: req.params.keyword,
      });

      res.send(data.rows);
    } catch (err) {
      next(err);
    }
  } else if (req.params.filter && !req.params.keyword) {
    try {
      const data = await getCharactersWithFilterQuery({
        projectId: req.params.project_id,
        limit: req.params.limit,
        offset: req.params.offset,
        filter: req.params.filter,
      });

      res.send(data.rows);
    } catch (err) {
      next(err);
    }
  } else {
    try {
      const data = await getCharactersQuery({
        projectId: req.params.project_id,
        limit: req.params.limit,
        offset: req.params.offset,
      });

      res.send(data.rows);
    } catch (err) {
      next(err);
    }
  }
}

async function getCharactersByLocation(req, res, next) {
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

    const data = await getCharactersByLocationQuery(req.params.location_id);
    res.send(data.rows);
  } catch (err) {
    next(err);
  }
}

async function removeCharacter(req, res, next) {
  try {
    // if no user
    if (!req.user) throw { status: 401, message: "Missing Credentials" };
    // get character to get project id
    const characterData = await getCharacterQuery(req.params.id);
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
      if (
        projectUser.rows &&
        projectUser.rows.length &&
        !projectUser.rows[0].is_editor
      )
        throw { status: 403, message: "Forbidden" };
    }

    await removeCharacterQuery(req.params.id);
    res.status(204).send();

    // remove image
    if (character.image_id) {
      const imageData = await getImageQuery(character.image_id);
      const image = imageData.rows[0];
      await removeFile("wyrld/images", image);
      await removeImageQuery(image.id);
      // update project data usage
      const newCalculatedData = project.used_data_in_bytes - image.size;
      await editProjectQuery(project.id, {
        used_data_in_bytes: newCalculatedData,
      });
    }
  } catch (err) {
    next(err);
  }
}

async function editCharacter(req, res, next) {
  try {
    // if no user
    if (!req.user) throw { status: 401, message: "Missing Credentials" };
    // get character to get project id
    const characterData = await getCharacterQuery(req.params.id);
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
      if (
        projectUser.rows &&
        projectUser.rows.length &&
        !projectUser.rows[0].is_editor
      )
        throw { status: 403, message: "Forbidden" };
    }

    const data = await editCharacterQuery(req.params.id, req.body);
    res.status(200).send(data.rows[0]);

    // add new event
    if (req.body.location_id) {
      const locationData = await getLocationQuery(req.body.location_id);
      const location = locationData.rows[0];

      let title = `${character.title} moved to ${location.title}`;

      // if previous
      if (character.location_id) {
        const previousLocationData = await getLocationQuery(
          character.location_id
        );
        const previousLocation = await previousLocationData.rows[0];
        title += ` from ${previousLocation.title}`;
      }

      await addEventQuery({
        project_id: project.id,
        title,
        character_id: character.id,
        location_id: location.id,
      });
    }
  } catch (err) {
    next(err);
  }
}

export {
  getCharacter,
  getCharacters,
  getCharactersWithFilterQuery,
  getCharactersWithKeywordQuery,
  getCharactersWithKeywordAndFilterQuery,
  getCharactersByLocation,
  addCharacter,
  removeCharacter,
  editCharacter,
};
