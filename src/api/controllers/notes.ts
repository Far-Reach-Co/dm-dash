const {
  addNoteQuery,
  getNotesQuery,
  getNoteQuery,
  getNotesByLocationQuery,
  getNotesByCharacterQuery,
  getNotesByItemQuery,
  removeNoteQuery,
  editNoteQuery,
  getNotesByLoreQuery,
} = require("../queries/notes.js");
const { getItemQuery } = require("../queries/items.js");
const { getCharacterQuery } = require("../queries/characters.js");
const { getLocationQuery } = require("../queries/locations.js");
const { getProjectQuery } = require("../queries/projects.js");
const {
  getProjectUserByUserAndProjectQuery,
} = require("../queries/projectUsers.js");
const { getLoreQuery } = require("../queries/lores.js");

async function addNote(req, res, next) {
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

    const data = await addNoteQuery(req.body);
    res.status(201).json(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function getNotes(req, res, next) {
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

    const data = await getNotesQuery(
      req.user.id,
      req.params.project_id,
      req.params.limit,
      req.params.offset,
      req.params.keyword
    );

    res.send(data.rows);
  } catch (err) {
    next(err);
  }
}

async function getNotesByLocation(req, res, next) {
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

    const data = await getNotesByLocationQuery(
      req.user.id,
      req.params.location_id
    );

    res.send(data.rows);
  } catch (err) {
    next(err);
  }
}

async function getNotesByCharacter(req, res, next) {
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

    const data = await getNotesByCharacterQuery(
      req.user.id,
      req.params.character_id
    );

    res.send(data.rows);
  } catch (err) {
    next(err);
  }
}

async function getNotesByItem(req, res, next) {
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

    const data = await getNotesByItemQuery(req.user.id, req.params.item_id);

    res.send(data.rows);
  } catch (err) {
    next(err);
  }
}

async function getNotesByLore(req, res, next) {
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

    const data = await getNotesByLoreQuery(req.user.id, req.params.lore_id);

    res.send(data.rows);
  } catch (err) {
    next(err);
  }
}

async function removeNote(req, res, next) {
  try {
    // if no user
    if (!req.user) throw { status: 401, message: "Missing Credentials" };
    // get note to get project id
    const noteData = await getNoteQuery(req.params.id);
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

    await removeNoteQuery(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function editNote(req, res, next) {
  try {
    // if no user
    if (!req.user) throw { status: 401, message: "Missing Credentials" };
    // get note to get project id
    const noteData = await getNoteQuery(req.params.id);
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

    const data = await editNoteQuery(req.params.id, req.body);
    res.status(200).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getNotes,
  getNotesByLocation,
  addNote,
  removeNote,
  editNote,
  getNotesByCharacter,
  getNotesByItem,
  getNotesByLore,
};
