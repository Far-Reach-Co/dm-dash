const {
  addProjectUserQuery,
  getProjectUserQuery,
  getProjectUserByUserAndProjectQuery,
  removeProjectUserQuery,
  editProjectUserQuery,
} = require("../queries/projectUsers.js");
const { getProjectQuery } = require("../queries/projects.js");
const { getProjectInviteByProjectQuery } = require("../queries/projectInvites.js");

async function addProjectUser(req, res, next) {
  try {
    // if no user
    if (!req.user) throw { status: 401, message: "Missing Credentials" };

    const projectData = await getProjectQuery(req.body.project_id);
    const project = projectData.rows[0];
    const projectInviteData = await getProjectInviteByProjectQuery(project.id)
    if(!projectInviteData) throw { status: 403, message: "Forbidden" };
    
    req.body.is_editor = false;
    req.body.user_id = req.user.id;
    const data = await addProjectUserQuery(req.body);
    res.status(201).json(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function getProjectUserByUserAndProject(req, res, next) {
  try {
    // if no user
    if (!req.user) throw { status: 401, message: "Missing Credentials" };
    const data = await getProjectUserByUserAndProjectQuery(
      req.user.id,
      req.params.project_id
    );
    res.status(200).json(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function removeProjectUser(req, res, next) {
  try {
    // if no user
    if (!req.user) throw { status: 401, message: "Missing Credentials" };
    // get projectUser to get project id
    const projectUserData = await getProjectUserQuery(req.params.id);
    const projectUser = projectUserData.rows[0];

    // If user is not author or editor
    if (!projectUser.user_id === req.user.id) {
      const projectData = await getProjectQuery(projectUser.project_id);
      const project = projectData.rows[0];
      if (project.user_id !== req.user.id) {
        throw { status: 403, message: "Forbidden" };
      }
    }

    await removeProjectUserQuery(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function editProjectUser(req, res, next) {
  try {
    // if no user
    if (!req.user) throw { status: 401, message: "Missing Credentials" };
    // get projectUser to get project id
    const projectUserData = await getProjectUserQuery(req.params.id);
    const projectUser = projectUserData.rows[0];
    // If user is not author
    const projectData = await getProjectQuery(projectUser.project_id);
    const project = projectData.rows[0];

    if (project.user_id !== req.user.id) {
      throw { status: 403, message: "Forbidden" };
    }

    const data = await editProjectUserQuery(req.params.id, req.body);
    res.status(200).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  addProjectUser,
  getProjectUserByUserAndProject,
  removeProjectUser,
  editProjectUser,
};
