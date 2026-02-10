import db from "../dbconfig";
import { buildUpdateQuery } from "./utils";

interface ProjectPlayer {
  id: number,
  project_id: number,
  player_id: number
}

async function addProjectPlayerQuery(data: {project_id: string, player_id: string}) {
  const query = {
    text: /*sql*/ `insert into public."ProjectPlayer" (project_id, player_id) values($1,$2) returning *`,
    values: [
      data.project_id,
      data.player_id,
    ]
  }
  return await db.query<ProjectPlayer>(query)
}

async function getProjectPlayersByProjectQuery(projectId: string | number) {
  const query = {
    text: /*sql*/ `select * from public."ProjectPlayer" where project_id = $1`,
    values: [projectId]
  }
  return await db.query<ProjectPlayer>(query)
}

async function getProjectPlayersByPlayerQuery(playerId: string | number) {
  const query = {
    text: /*sql*/ `select * from public."ProjectPlayer" where player_id = $1`,
    values: [playerId]
  }
  return await db.query<ProjectPlayer>(query)
}

async function getProjectPlayerQuery(id: string | number) {
  const query = {
    text: /*sql*/ `select * from public."ProjectPlayer" where id = $1`,
    values: [id]
  }
  return await db.query<ProjectPlayer>(query)
}

async function removeProjectPlayerQuery(id: string | number) {
  const query = {
    text: /*sql*/ `delete from public."ProjectPlayer" where id = $1`,
    values: [id]
  }

  return await db.query<ProjectPlayer>(query)
}

async function editProjectPlayerQuery(id: string, data: any) {
  const query = buildUpdateQuery("ProjectPlayer", data, id);
  return await db.query<ProjectPlayer>(query);
}

export {
  addProjectPlayerQuery,
  getProjectPlayerQuery,
  getProjectPlayersByProjectQuery,
  getProjectPlayersByPlayerQuery,
  removeProjectPlayerQuery,
  editProjectPlayerQuery,
}
