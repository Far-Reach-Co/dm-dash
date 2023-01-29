const {
  addProjectQuery,
  getProjectQuery,
  getProjectsQuery,
  removeProjectQuery,
  editProjectQuery,
} = require("../queries/projects.js");
const { getProjectInviteByProjectQuery } = require("../queries/projectInvites.js");
const {
  getProjectUsersQuery,
  getProjectUserByUserAndProjectQuery,
} = require("../queries/projectUsers.js");

async function addProject(req, res, next) {
  try {
    if (!req.user) throw { status: 401, message: "Missing Credentials" };
    req.body.user_id = req.user.id;
    const data = await addProjectQuery(req.body);
    res.status(201).json(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function getProject(req, res, next) {
  try {
    const data = await getProjectQuery(req.params.id);

    res.send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function getProjects(req, res, next) {
  try {
    const projectsData = await getProjectsQuery(req.user.id);
    // get joined projects
    const projectUserData = await getProjectUsersQuery(req.user.id);
    if (
      projectUserData &&
      projectUserData.rows &&
      projectUserData.rows.length
    ) {
      for (var projectUser of projectUserData.rows) {
        const projectData = await getProjectQuery(projectUser.project_id);
        if (projectData && projectData.rows && projectData.rows.length) {
          const project = projectData.rows[0];
          project.was_joined = true;
          project.project_user_id = projectUser.id;
          project.date_joined = projectUser.date_joined;
          project.is_editor = projectUser.is_editor;
          projectsData.rows.push(project);
        }
      }
    }
    // get project invites
    for (var project of projectsData.rows) {
      const projectInvites = await getProjectInviteByProjectQuery(project.id);
      if (projectInvites && projectInvites.rows && projectInvites.rows.length)
        project.project_invite = projectInvites.rows[0];
    }

    res.send(projectsData.rows);
  } catch (err) {
    next(err);
  }
}

async function removeProject(req, res, next) {
  try {
    // if no user
    if (!req.user) throw { status: 401, message: "Missing Credentials" };
    // If user is not author or editor
    const projectData = await getProjectQuery(req.params.id);
    const project = projectData.rows[0];

    if (project.user_id !== req.user.id)
      throw { status: 403, message: "Forbidden" };

    await removeProjectQuery(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function editProject(req, res, next) {
  try {
    // if no user
    if (!req.user) throw { status: 401, message: "Missing Credentials" };
    // If user is not author or editor
    const projectData = await getProjectQuery(req.params.id);
    const project = projectData.rows[0];

    if (project.user_id !== req.user.id) {
      // not editor
      const projectUser = await getProjectUserByUserAndProjectQuery(
        req.user.id,
        project.id
      );
      if (projectUser.rows && projectUser.rows.length && !projectUser.rows[0].is_editor) throw { status: 403, message: "Forbidden" };
    }

    const data = await editProjectQuery(req.params.id, req.body);
    res.status(200).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProjects,
  getProject,
  addProject,
  removeProject,
  editProject,
};
