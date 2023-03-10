const {
  addTableImageQuery,
  getTableImagesQuery,
  getTableImageQuery,
  removeTableImageQuery,
  editTableImageQuery,
} = require("../queries/tableImages.js");
const { getProjectQuery } = require("../queries/projects.js");
const {
  getProjectUserByUserAndProjectQuery,
} = require("../queries/projectUsers.js");

async function addTableImage(req, res, next) {
  try {
    // if no user
    if (!req.user) throw { status: 401, message: "Missing Credentials" };
    // If user is not author or editor
    const projectData = await getProjectQuery(req.body.project_id);
    const project = projectData.rows[0];

    if (project.user_id !== req.user.id) {
      const projectUser = await getProjectUserByUserAndProjectQuery(
        req.user.id,
        project.id
      );
      if (!projectUser && projectUser.rows.length)
        throw { status: 403, message: "Forbidden" };
    }

    const data = await addTableImageQuery(req.body);
    res.status(201).json(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function getTableImages(req, res, next) {
  try {
    // if no user
    if (!req.user) throw { status: 401, message: "Missing Credentials" };
    // If user is not author or project user
    const projectData = await getProjectQuery(req.params.project_id);
    const project = projectData.rows[0];

    if (project.user_id !== req.user.id) {
      const projectUser = await getProjectUserByUserAndProjectQuery(
        req.user.id,
        project.id
      );
      if (!projectUser) throw { status: 403, message: "Forbidden" };
    }

    const data = await getTableImagesQuery(req.params.project_id);

    res.send(data.rows);
  } catch (err) {
    next(err);
  }
}

async function removeTableImage(req, res, next) {
  try {
    // if no user
    if (!req.user) throw { status: 401, message: "Missing Credentials" };
    // get tableImage to get project id
    const tableImageData = await getTableImageQuery(req.params.id);
    const tableImage = tableImageData.rows[0];
    // If user is not author or project user
    const projectData = await getProjectQuery(tableImage.project_id);
    const project = projectData.rows[0];

    if (project.user_id !== req.user.id) {
      const projectUser = await getProjectUserByUserAndProjectQuery(
        req.user.id,
        project.id
      );
      if (!projectUser && projectUser.rows.length)
        throw { status: 403, message: "Forbidden" };
    }

    await removeTableImageQuery(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function editTableImage(req, res, next) {
  try {
    // if no user
    if (!req.user) throw { status: 401, message: "Missing Credentials" };
    // get tableImage to get project id
    const tableImageData = await getTableImageQuery(req.params.id);
    const tableImage = tableImageData.rows[0];
    // If user is not author or project user
    const projectData = await getProjectQuery(tableImage.project_id);
    const project = projectData.rows[0];

    if (project.user_id !== req.user.id) {
      const projectUser = await getProjectUserByUserAndProjectQuery(
        req.user.id,
        project.id
      );
      if (!projectUser && projectUser.rows.length)
        throw { status: 403, message: "Forbidden" };
    }

    const data = await editTableImageQuery(req.params.id, req.body);
    res.status(200).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getTableImages,
  addTableImage,
  removeTableImage,
  editTableImage,
};
