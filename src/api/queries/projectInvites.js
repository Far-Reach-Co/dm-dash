import db from '../dbconfig.js';

async function addProjectInviteQuery(data) {
  const query = {
    text: /*sql*/ `insert into public."ProjectInvite" (uuid, project_id) values($1,$2) returning *`,
    values: [
      data.uuid,
      data.project_id
    ]
  }
  return await db.query(query)
}

async function getProjectInviteQuery(id) {
  const query = {
    text: /*sql*/ `select * from public."ProjectInvite" where id = $1`,
    values: [id]
  }
  return await db.query(query)
}

async function getProjectInviteByProjectQuery(projectId) {
  const query = {
    text: /*sql*/ `select * from public."ProjectInvite" where project_id = $1`,
    values: [projectId]
  }
  return await db.query(query)
}

async function getProjectInviteByUUIDQuery(uuid) {
  const query = {
    text: /*sql*/ `select * from public."ProjectInvite" where uuid = $1`,
    values: [uuid]
  }
  return await db.query(query)
}

async function removeProjectInviteQuery(id) {
  const query = {
    text: /*sql*/ `delete from public."ProjectInvite" where id = $1`,
    values: [id]
  }

  return await db.query(query)
}

export {
  addProjectInviteQuery,
  getProjectInviteQuery,
  getProjectInviteByUUIDQuery,
  getProjectInviteByProjectQuery,
  removeProjectInviteQuery
};