const {
  addItemQuery,
  getItemsQuery,
  getItemQuery,
  getItemsWithFilterQuery,
  getItemsWithKeywordQuery,
  getItemsWithKeywordAndFilterQuery,
  getItemsByLocationQuery,
  getItemsByCharacterQuery,
  removeItemQuery,
  editItemQuery,
} = require("../queries/items.js");
const { getLocationQuery } = require("../queries/locations.js");
const { getCharacterQuery } = require("../queries/characters.js");
const { getProjectQuery } = require("../queries/projects.js");
const {
  getProjectUserByUserAndProjectQuery,
} = require("../queries/projectUsers.js");

async function addItem(req, res, next) {
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
      if (projectUser.rows && projectUser.rows.length && !projectUser.rows[0].is_editor) throw { status: 403, message: "Forbidden" };
    }

    const data = await addItemQuery(req.body);
    res.status(201).json(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function getItems(req, res, next) {
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
      const data = await getItemsWithKeywordAndFilterQuery({
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
      const data = await getItemsWithKeywordQuery({
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
      const data = await getItemsWithFilterQuery({
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
      const data = await getItemsQuery({
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

async function getItemsByLocation(req, res, next) {
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

    const data = await getItemsByLocationQuery(req.params.location_id);
    res.send(data.rows);
  } catch (err) {
    next(err);
  }
}

async function getItemsByCharacter(req, res, next) {
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

    const data = await getItemsByCharacterQuery(req.params.character_id);
    res.send(data.rows);
  } catch (err) {
    next(err);
  }
}

async function removeItem(req, res, next) {
  try {
    // if no user
    if (!req.user) throw { status: 401, message: "Missing Credentials" };
    // get item to get project id
    const itemData = await getItemQuery(req.params.id);
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
      if (projectUser.rows && projectUser.rows.length && !projectUser.rows[0].is_editor) throw { status: 403, message: "Forbidden" };
    }

    const data = await removeItemQuery(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function editItem(req, res, next) {
  try {
    // if no user
    if (!req.user) throw { status: 401, message: "Missing Credentials" };
    // get item to get project id
    const itemData = await getItemQuery(req.params.id);
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
      if (projectUser.rows && projectUser.rows.length && !projectUser.rows[0].is_editor) throw { status: 403, message: "Forbidden" };
    }

    const data = await editItemQuery(req.params.id, req.body);
    res.status(200).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getItems,
  getItemsByLocation,
  getItemsByCharacter,
  addItem,
  removeItem,
  editItem,
};
