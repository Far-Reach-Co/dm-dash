import db from "../dbconfig";

interface ProjectPlayerModel {
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
  return await db.query<ProjectPlayerModel>(query)
}

async function getProjectPlayersByProjectQuery(projectId: string | number) {
  const query = {
    text: /*sql*/ `select * from public."ProjectPlayer" where project_id = $1`,
    values: [projectId]
  }
  return await db.query<ProjectPlayerModel>(query)
}

async function getProjectPlayersByPlayerQuery(playerId: string | number) {
  const query = {
    text: /*sql*/ `select * from public."ProjectPlayer" where player_id = $1`,
    values: [playerId]
  }
  return await db.query<ProjectPlayerModel>(query)
}

async function getProjectPlayerQuery(id: string | number) {
  const query = {
    text: /*sql*/ `select * from public."ProjectPlayer" where id = $1`,
    values: [id]
  }
  return await db.query<ProjectPlayerModel>(query)
}

async function removeProjectPlayerQuery(id: string | number) {
  const query = {
    text: /*sql*/ `delete from public."ProjectPlayer" where id = $1`,
    values: [id]
  }

  return await db.query<ProjectPlayerModel>(query)
}

async function editProjectPlayerQuery(id: string, data: any) {
  let edits = ``
  let values = []
  let iterator = 1

  for(const [key, value] of Object.entries(data)) {
    edits += `${key} = $${iterator}, `;
    values.push(value)
    iterator++
  }

  edits = edits.slice(0, -2)
  values.push(id)

  const query = {
    text: /*sql*/ `update public."ProjectPlayer" set ${edits} where id = $${iterator} returning *`,
    values: values,
  }

  return await db.query<ProjectPlayerModel>(query)
}

export {
  addProjectPlayerQuery,
  getProjectPlayerQuery,
  getProjectPlayersByProjectQuery,
  getProjectPlayersByPlayerQuery,
  removeProjectPlayerQuery,
  editProjectPlayerQuery,
}