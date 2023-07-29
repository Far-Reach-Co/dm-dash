import db from "../dbconfig";

interface TableViewModel {
  id: number,
  project_id: number,
  user_id: number,
  data: {[key: string]: any},
  date_created: string
  title: string
}

async function addTableViewQuery(data: {project_id: string | number}) {
  const query = {
    text: /*sql*/ `insert into public."TableView" (project_id) values($1) returning *`,
    values: [
      data.project_id,
    ]
  }
  return await db.query<TableViewModel>(query)
}

async function addTableViewByUserQuery(data: {user_id: string | number, title: string}) {
  const query = {
    text: /*sql*/ `insert into public."TableView" (user_id, title) values($1,$2) returning *`,
    values: [
      data.user_id,
      data.title
    ]
  }
  return await db.query<TableViewModel>(query)
}

async function getTableViewQuery(id: string) {
  const query = {
    text: /*sql*/ `select * from public."TableView" where id = $1`,
    values: [id]
  }
  return await db.query<TableViewModel>(query)
}

async function getTableViewByUUIDQuery(uuid: string) {
  const query = {
    text: /*sql*/ `select * from public."TableView" where uuid = $1`,
    values: [uuid]
  }
  return await db.query<TableViewModel>(query)
}

async function getTableViewsQuery(projectId: string) {
  const query = {
    text: /*sql*/ `select * from public."TableView" where project_id = $1`,
    values: [projectId]
  }
  return await db.query<TableViewModel>(query)
}

async function getTableViewsByUser(userId: string | number) {
  const query = {
    text: /*sql*/ `select * from public."TableView" where user_id = $1`,
    values: [userId]
  }
  return await db.query<TableViewModel>(query)
}

async function removeTableViewQuery(id: string | number) {
  const query = {
    text: /*sql*/ `delete from public."TableView" where id = $1`,
    values: [id]
  }

  return await db.query<TableViewModel>(query)
}

async function editTableViewQuery(id: string, data: any) {
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
    text: /*sql*/ `update public."TableView" set ${edits} where id = $${iterator} returning *`,
    values: values,
  }

  return await db.query<TableViewModel>(query)
}

export {
  addTableViewQuery,
  getTableViewsQuery,
  getTableViewByUUIDQuery,
  getTableViewQuery,
  getTableViewsByUser,
  removeTableViewQuery,
  editTableViewQuery,
  addTableViewByUserQuery
}