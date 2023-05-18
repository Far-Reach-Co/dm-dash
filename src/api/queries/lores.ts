import db from "../dbconfig";

interface LoreModal {
  id: number,
  title: string,
  description: string,
  type: string,
  image_id: number,
  project_id: number
}

async function addLoreQuery(data: {
  project_id: string,
  title: string,
  description: string,
  type: string,
  image_id: string
}) {
  const query = {
    text: /*sql*/ `insert into public."Lore" (project_id, title, description, type, image_id) values($1,$2,$3,$4,$5) returning *`,
    values: [
      data.project_id,
      data.title,
      data.description,
      data.type,
      data.image_id
    ]
  }
  return await db.query<LoreModal>(query)
}

async function getLoreQuery(id: string) {
  const query = {
    text: /*sql*/ `select * from public."Lore" where id = $1`,
    values: [id]
  }
  return await db.query<LoreModal>(query)
}

async function getLoresWithKeywordAndFilterQuery(
  {projectId, limit, offset, keyword, filter}: {projectId: string, limit: string, offset: string, keyword: string, filter: string}
) {
  const query = {
    text: /*sql*/ `select * from public."Lore" where project_id = $1 and position($4 in lower(title))>0 and type = $5 order by title asc limit $2 offset $3`,
    values: [projectId, limit, offset, keyword, filter]
  }
  return await db.query<LoreModal>(query)
}
async function getLoresWithKeywordQuery({projectId, limit, offset, keyword}: {projectId: string, limit: string, offset: string, keyword: string}) {
  const query = {
    text: /*sql*/ `select * from public."Lore" where project_id = $1 and position($4 in lower(title))>0 order by title asc limit $2 offset $3`,
    values: [projectId, limit, offset, keyword]
  }
  return await db.query<LoreModal>(query)
}
async function getLoresWithFilterQuery({projectId, limit, offset, filter}: {projectId: string, limit: string, offset: string, filter: string}) {
  const query = {
    text: /*sql*/ `select * from public."Lore" where project_id = $1 and type = $4 order by title asc limit $2 offset $3`,
    values: [projectId, limit, offset, filter]
  }
  return await db.query<LoreModal>(query)
}

async function getLoresQuery({projectId, limit, offset}: {projectId: string, limit: string | number, offset: string | number}) {
  const query = {
    text: /*sql*/ `select * from public."Lore" where project_id = $1 order by title asc limit $2 offset $3`,
    values: [projectId, limit, offset]
  }
  return await db.query<LoreModal>(query)
}

async function removeLoreQuery(id: string | number) {
  const query = {
    text: /*sql*/ `delete from public."Lore" where id = $1`,
    values: [id]
  }

  return await db.query<LoreModal>(query)
}

async function editLoreQuery(id: string, data: any) {
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
    text: /*sql*/ `update public."Lore" set ${edits} where id = $${iterator} returning *`,
    values: values,
  }

  return await db.query<LoreModal>(query)
}

export {
  addLoreQuery,
  getLoresQuery,
  getLoreQuery,
  getLoresWithFilterQuery,
  getLoresWithKeywordQuery,
  getLoresWithKeywordAndFilterQuery,
  removeLoreQuery,
  editLoreQuery
}