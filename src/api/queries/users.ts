import db from "../dbconfig";
import { buildUpdateQuery } from "./utils";

export interface User {
  id: number,
  username: string,
  email: string,
  phone: string,
  name: string,
  is_pro: boolean,
  password: string
  used_data_in_bytes: number
}

async function getUserByIdQuery(id: string | number) {
  const query = {
    text: /*sql*/ `select * from public."User" where id = $1`,
    values: [id],
  }
  return await db.query<User>(query)
}

async function getAllUsersQuery() {
  const query = {
    text: /*sql*/ `select * from public."User"`,
  }
  return await db.query<User>(query)
}

async function getUserByEmailQuery(email: string) {
  const query = {
    text: /*sql*/ `select * from public."User" where email = $1`,
    values: [email],
  }
  return await db.query<User>(query)
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

  return await db.query<User>(query)
}

async function editUserQuery(id: string | number, data: any) {
  const query = buildUpdateQuery("User", data, id);
  return await db.query<User>(query);
}

async function editUserPasswordQuery(id: string | number, password: string) {
  const query = {
    text: /*sql*/ `update public."User" set password = $2 where id = $1 returning *`,
    values: [id, password]
  }

  return await db.query<User>(query)
}

export {
  getAllUsersQuery,
  getUserByIdQuery,
  getUserByEmailQuery,
  registerUserQuery,
  editUserQuery,
  editUserPasswordQuery
}
