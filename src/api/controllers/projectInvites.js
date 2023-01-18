const {
  addProjectInviteQuery,
  getProjectInviteQuery,
  getProjectInviteByUUIDQuery,
  removeProjectInviteQuery
} = require("../queries/projectInvites.js");
const uuidv4 = require('uuid/v4')

async function addProjectInvite(req, res, next) {
  const uuid = uuidv4();
  req.body.uuid = uuid;

  try {
    const data = await addProjectInviteQuery(req.body);
    res.status(201).json(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function getProjectInvite(req, res, next) {
  try {
    const data = await getProjectInviteQuery(req.params.project_id);

    res.send(data);
  } catch (err) {
    next(err);
  }
}

async function getProjectInviteByUUID(req, res, next) {
  try {
    const data = await getProjectInviteByUUIDQuery(req.params.uuid);

    res.send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function removeProjectInvite(req, res, next) {
  try {
    const data = await removeProjectInviteQuery(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProjectInvite,
  getProjectInviteByUUID,
  addProjectInvite,
  removeProjectInvite
};