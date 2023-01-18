const {
  addProjectUserQuery,
  getProjectUsersQuery,
  removeProjectUserQuery,
  editProjectUserQuery,
} = require("../queries/projectUsers.js");

async function addProjectUser(req, res, next) {
  try {
    const data = await addProjectUserQuery(req.body);
    res.status(201).json(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function getProjectUsers(req, res, next) {
  try {
    const data = await getProjectUsersQuery(req.params.user_id);

    res.send(data.rows);
  } catch (err) {
    next(err);
  }
}

async function removeProjectUser(req, res, next) {
  try {
    const data = await removeProjectUserQuery(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function editProjectUser(req, res, next) {
  try {
    const data = await editProjectUserQuery(req.params.id, req.body);
    res.status(200).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProjectUsers,
  addProjectUser,
  removeProjectUser,
  editProjectUser,
};