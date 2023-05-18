import db from "../dbconfig";

interface CounterModel {
  id: number,
  project_id: number,
  current_count: number,
  title: string,
  user_id: number
}

async function addCounterQuery(data: {
  user_id: string,
  project_id: string,
  current_count: string,
  title: string
}) {
  const query = {
    text: /*sql*/ `insert into public."Counter" (user_id, project_id, current_count, title) values($1,$2,$3,$4) returning *`,
    values: [
      data.user_id,
      data.project_id,
      data.current_count,
      data.title
    ]
  }
  return await db.query<CounterModel>(query)
}

async function getCounterQuery(id: string) {
  const query = {
    text: /*sql*/ `select * from public."Counter" where id = $1`,
    values: [id]
  }
  return await db.query<CounterModel>(query)
}

async function getCountersQuery(userId: string, projectId: string) {
  const query = {
    text: /*sql*/ `select * from public."Counter" where user_id = $1 and project_id = $2 order by title asc`,
    values: [userId, projectId]
  }
  return await db.query<CounterModel>(query)
}

async function getAllCountersByProjectQuery(projectId: string) {
  const query = {
    text: /*sql*/ `select * from public."Counter" where project_id = $1 order by title asc`,
    values: [projectId]
  }
  return await db.query<CounterModel>(query)
}

async function removeCounterQuery(id: string) {
  const query = {
    text: /*sql*/ `delete from public."Counter" where id = $1`,
    values: [id]
  }

  return await db.query<CounterModel>(query)
}

async function editCounterQuery(id: string, data: any) {
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
    text: /*sql*/ `update public."Counter" set ${edits} where id = $${iterator} returning *`,
    values: values,
  }

  return await db.query<CounterModel>(query)
}

export {
  addCounterQuery,
  getCountersQuery,
  getCounterQuery,
  getAllCountersByProjectQuery,
  removeCounterQuery,
  editCounterQuery
}