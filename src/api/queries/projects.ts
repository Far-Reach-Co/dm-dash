import db from "../dbconfig";

export interface ProjectModel {
  id: number,
  title: string,
  user_id: number,
  date_created: string,
  used_data_in_bytes: number,
  description: string,
  image_id: number
}

async function addProjectQuery(data: {title: string, user_id: string | number}) {
  const query = {
    text: /*sql*/ `insert into public."Project" (title, user_id) values($1,$2) returning *`,
    values: [
      data.title,
      data.user_id,
    ]
  }
  return await db.query<ProjectModel>(query)
}

async function getProjectQuery(projectId: string | number) {
  const query = {
    text: /*sql*/ `select * from public."Project" where id = $1`,
    values: [projectId]
  }
  return await db.query<ProjectModel>(query)
}

async function removeProjectQuery(id: string) {
  const query = {
    text: /*sql*/ `delete from public."Project" where id = $1`,
    values: [id]
  }

  return await db.query<ProjectModel>(query)
}

async function getProjectsQuery(userId: string | number) {
  const query = {
    text: /*sql*/ `select * from public."Project" where user_id = $1 order by title asc`,
    values: [userId]
  }
  return await db.query<ProjectModel>(query)
}

async function editProjectQuery(id: string | number, data: any) {
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
    text: /*sql*/ `update public."Project" set ${edits} where id = $${iterator} returning *`,
    values: values,
  }

  return await db.query<ProjectModel>(query)
}

export {
  addProjectQuery,
  getProjectQuery,
  getProjectsQuery,
  removeProjectQuery,
  editProjectQuery
}