const {
  addProjectInviteQuery,
  getProjectInviteQuery,
  getProjectInviteByUUIDQuery,
  removeProjectInviteQuery,
} = require("../queries/projectInvites.js");
const uuidv4 = require("uuid/v4");
const { getProjectQuery } = require("../queries/projects.js");
const {
  getProjectUserByUserAndProjectQuery,
} = require("../queries/projectUsers.js");

async function addProjectInvite(req, res, next) {
  const uuid = uuidv4();
  req.body.uuid = uuid;

  try {
    // if no user
    if (!req.user) throw { status: 401, message: "Missing Credentials" };
    // If user is not author or editor
    const projectData = await getProjectQuery(req.body.project_id);
    const project = projectData.rows[0];

    if (project.user_id !== req.user.id) {
      // not editor
      const projectUser = getProjectUserByUserAndProjectQuery(
        req.user.id,
        project.id
      );
      if (!projectUser.is_editor) throw { status: 403, message: "Forbidden" };
    }

    const data = await addProjectInviteQuery(req.body);
    res.status(201).json(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function getProjectInviteByUUID(req, res, next) {
  try {
    // if no user
    if (!req.user) throw { status: 401, message: "Missing Credentials" };

    const data = await getProjectInviteByUUIDQuery(req.params.uuid);
    res.send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function removeProjectInvite(req, res, next) {
  try {
    // if no user
    if (!req.user) throw { status: 401, message: "Missing Credentials" };
    // get invite to get project id
    const inviteData = await getProjectInviteQuery(req.params.id);
    const invite = inviteData.rows[0];
    // If user is not author or editor
    const projectData = await getProjectQuery(invite.project_id);
    const project = projectData.rows[0];

    if (project.user_id !== req.user.id) {
      // not editor
      const projectUser = getProjectUserByUserAndProjectQuery(
        req.user.id,
        project.id
      );
      if (!projectUser.is_editor) throw { status: 403, message: "Forbidden" };
    }

    await removeProjectInviteQuery(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProjectInviteByUUID,
  addProjectInvite,
  removeProjectInvite,
};
