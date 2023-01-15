const db = require('../dbconfig')

async function getUserByIdQuery(id) {
  const query = {
    text: /*sql*/ `select * from public."User" where id = $1`,
    values: [id],
  }
  return await db.query(query)
}

async function getAllUsersQuery() {
  const query = {
    text: /*sql*/ `select * from public."User"`,
  }
  return await db.query(query)
}

async function getUserByEmailQuery(email) {
  const query = {
    text: /*sql*/ `select * from public."User" where email = $1`,
    values: [email],
  }
  return await db.query(query)
}

async function registerUserQuery({email, password}) {
  const query = {
    text: /*sql*/ `insert into public."User" (email, password) values($1,$2) RETURNING *`,
    values: [
      email, 
      password
    ],
  }

  return await db.query(query)
}

async function editUserQuery(id, data) {
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
    text: /*sql*/ `update public."User" set ${edits} where id = $${iterator} returning *`,
    values: values,
  }

  return await db.query(query)
}

async function editUserPasswordQuery(id, password) {
  const query = {
    text: /*sql*/ `update public."User" set password = $2 where id = $1 returning *`,
    values: [id, password]
  }

  return await db.query(query)
}

module.exports = {
  getAllUsersQuery,
  getUserByIdQuery,
  getUserByEmailQuery,
  registerUserQuery,
  editUserQuery,
  editUserPasswordQuery
}