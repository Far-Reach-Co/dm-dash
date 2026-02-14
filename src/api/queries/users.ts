import db from "../dbconfig";
import { buildUpdateQuery } from "./utils";

export interface User {
  id: number,
  username: string,
  email: string,
  phone: string,
  name: string,
  is_pro: boolean,
  password: string,
  used_data_in_bytes: number,
  notify_wyrld_join: boolean,
  notify_sheet_link: boolean,
  notify_product_updates: boolean,
  email_unsubscribed_all: boolean,
  email_unsubscribed_at: string | null,
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

async function getUsersByIdsQuery(ids: (string | number)[]) {
  const query = {
    text: /*sql*/ `select * from public."User" where id = ANY($1::int[])`,
    values: [ids.map((id) => Number(id))],
  };
  return await db.query<User>(query);
}

async function getProductUpdateRecipientsQuery(opts?: {
  limit?: number;
  offset?: number;
}) {
  const values: number[] = [];
  let limitOffsetClause = "";

  if (typeof opts?.limit === "number") {
    values.push(opts.limit);
    limitOffsetClause += ` LIMIT $${values.length}`;
  }
  if (typeof opts?.offset === "number") {
    values.push(opts.offset);
    limitOffsetClause += ` OFFSET $${values.length}`;
  }

  const query = {
    text: /*sql*/ `
      select *
      from public."User"
      where notify_product_updates = true
        and email_unsubscribed_all = false
        and email is not null
        and length(trim(email)) > 0
      order by id
      ${limitOffsetClause}
    `,
    values,
  };

  return await db.query<User>(query);
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
  getUsersByIdsQuery,
  getProductUpdateRecipientsQuery,
  registerUserQuery,
  editUserQuery,
  editUserPasswordQuery
}
