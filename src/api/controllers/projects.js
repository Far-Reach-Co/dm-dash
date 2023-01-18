const {
  addProjectQuery,
  getProjectQuery,
  getProjectsQuery,
  removeProjectQuery,
  editProjectQuery,
} = require("../queries/projects.js");
const { getProjectInviteQuery } = require("../queries/projectInvites.js");

async function addProject(req, res, next) {
  try {
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
    const data = await getProjectsQuery(req.params.id);

    for (project of data.rows) {
      console.log(project)
      const projectInvites = await getProjectInviteQuery(project.id);
      if(projectInvites && projectInvites.rows && projectInvites.rows.length) project.project_invite = projectInvites.rows[0];
    }

    res.send(data.rows);
  } catch (err) {
    next(err);
  }
}

async function removeProject(req, res, next) {
  try {
    const data = await removeProjectQuery(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function editProject(req, res, next) {
  try {
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
