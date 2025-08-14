import db from "../dbconfig";

export interface Record {
  id: number
  title: string
  description: string
  project_id: number
  user_id: number
  is_public: boolean
}

async function addRecordByProjectQuery(data: {
  project_id: number | string,
  title: string,
  description: string
  is_public: boolean
}) {
  const query = {
    text: /*sql*/ `insert into public."Record" (project_id, title, description, is_public) values($1,$2,$3,$4) returning *`,
    values: [
      data.project_id,
      data.title,
      data.description,
      data.is_public
    ]
  }
  return await db.query<Record>(query)

}

async function addRecordByUserQuery(data: {
  user_id: number | string,
  title: string,
  description: string,
  is_public: boolean
}) {
  const query = {
    text: /*sql*/ `insert into public."Record" (user_id, title, description, is_public) values($1,$2,$3,$4) returning *`,
    values: [
      data.user_id,
      data.title,
      data.description,
      data.is_public
    ]
  }
  return await db.query<Record>(query)
}

async function getRecordQuery(id: number | string) {
  const query = {
    text: /*sql*/ `select * from public."Record" where id = $1`,
    values: [id]
  }
  return await db.query<Record>(query)
}


async function getRecordsByProjectQuery(projectId: number | string) {
  const query = {
    text: /*sql*/ `select * from public."Record" where project_id = $1 order by title asc`,
    values: [projectId]
  }
  return await db.query<Record>(query)
}

async function getRecordsByUserQuery(userId: number | string) {
  const query = {
    text: /*sql*/ `select * from public."Record" where user_id = $1 order by title asc`,
    values: [userId]
  }
  return await db.query<Record>(query)
}

async function removeRecordQuery(id: number | string) {
  const query = {
    text: /*sql*/ `delete from public."Record" where id = $1`,
    values: [id]
  }

  return await db.query<Record>(query)
}

async function editRecordQuery(id: number | string, data: any) {
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
    text: /*sql*/ `update public."Record" set ${edits} where id = $${iterator} returning *`,
    values: values,
  }

  return await db.query<Record>(query)
}

export {
  addRecordByProjectQuery,
  addRecordByUserQuery,
  getRecordsByProjectQuery,
  getRecordsByUserQuery,
  getRecordQuery,
  removeRecordQuery,
  editRecordQuery
}