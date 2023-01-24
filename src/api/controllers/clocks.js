const {
  addClockQuery,
  getClocksQuery,
  getClockQuery,
  removeClockQuery,
  editClockQuery,
} = require("../queries/clocks.js");
const { getProjectQuery } = require("../queries/projects.js");
const {
  getProjectUserByUserAndProjectQuery,
} = require("../queries/projectUsers.js");

async function addClock(req, res, next) {
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

    const data = await addClockQuery(req.body);
    res.status(201).json(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function getClocks(req, res, next) {
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

    const data = await getClocksQuery(req.params.project_id);

    res.send(data.rows);
  } catch (err) {
    next(err);
  }
}

async function removeClock(req, res, next) {
  try {
    // if no user
    if (!req.user) throw { status: 401, message: "Missing Credentials" };
    // get clock to get project id
    const clockData = await getClockQuery(req.params.id);
    const clock = clockData.rows[0];
    // If user is not author or editor
    const projectData = await getProjectQuery(clock.project_id);
    const project = projectData.rows[0];

    if (project.user_id !== req.user.id) {
      // not editor
      const projectUser = await getProjectUserByUserAndProjectQuery(
        req.user.id,
        project.id
      );
      if (projectUser.rows && projectUser.rows.length && !projectUser.rows[0].is_editor) throw { status: 403, message: "Forbidden" };
    }

    await removeClockQuery(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function editClock(req, res, next) {
  try {
    // if no user
    if (!req.user) throw { status: 401, message: "Missing Credentials" };
    // get clock to get project id
    const clockData = await getClockQuery(req.params.id);
    const clock = clockData.rows[0];
    // If user is not author or editor
    const projectData = await getProjectQuery(clock.project_id);
    const project = projectData.rows[0];

    if (project.user_id !== req.user.id) {
      // not editor
      const projectUser = await getProjectUserByUserAndProjectQuery(
        req.user.id,
        project.id
      );
      if (projectUser.rows && projectUser.rows.length && !projectUser.rows[0].is_editor) throw { status: 403, message: "Forbidden" };
    }

    const data = await editClockQuery(req.params.id, req.body);
    res.status(200).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getClocks,
  addClock,
  removeClock,
  editClock,
};
