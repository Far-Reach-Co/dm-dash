import db from "../dbconfig";

export interface UserModel {
  id: number,
  username: string,
  email: string,
  phone: string,
  name: string,
  is_pro: boolean,
  password: string,
  stripe_id: string
}

async function getUserByIdQuery(id: string | number) {
  const query = {
    text: /*sql*/ `select * from public."User" where id = $1`,
    values: [id],
  }
  return await db.query<UserModel>(query)
}

async function getAllUsersQuery() {
  const query = {
    text: /*sql*/ `select * from public."User"`,
  }
  return await db.query<UserModel>(query)
}

async function getUserByEmailQuery(email: string) {
  const query = {
    text: /*sql*/ `select * from public."User" where email = $1`,
    values: [email],
  }
  return await db.query<UserModel>(query)
}

async function registerUserQuery({email , username, password}: {email: string, username: string, password: string}) {
  const query = {
    text: /*sql*/ `insert into public."User" (email, username, password) values($1,$2,$3) RETURNING *`,
    values: [
      email, 
      username,
      password
    ],
  }

  return await db.query<UserModel>(query)
}

async function editUserQuery(id: string, data: any) {
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

  return await db.query<UserModel>(query)
}

async function editUserPasswordQuery(id: string | number, password: string) {
  const query = {
    text: /*sql*/ `update public."User" set password = $2 where id = $1 returning *`,
    values: [id, password]
  }

  return await db.query<UserModel>(query)
}

export {
  getAllUsersQuery,
  getUserByIdQuery,
  getUserByEmailQuery,
  registerUserQuery,
  editUserQuery,
  editUserPasswordQuery
}