import db from "../dbconfig";
import { buildUpdateQuery } from "./utils";

interface PlayerUser {
  id: number,
  player_id: number,
  user_id: number,
  is_editor: boolean,
  date_joined: string
}

async function addPlayerUserQuery(data: {player_id: string, user_id: string}) {
  const query = {
    text: /*sql*/ `insert into public."PlayerUser" (player_id, user_id) values($1,$2) returning *`,
    values: [
      data.player_id,
      data.user_id,
    ]
  }
  return await db.query<PlayerUser>(query)
}

async function getPlayerUsersQuery(userId: string | number) {
  const query = {
    text: /*sql*/ `select * from public."PlayerUser" where user_id = $1`,
    values: [userId]
  }
  return await db.query<PlayerUser>(query)
}

async function getPlayerUserByUserAndPlayerQuery(userId: string | number, playerId: string | number) {
  const query = {
    text: /*sql*/ `select * from public."PlayerUser" where user_id = $1 and player_id = $2`,
    values: [userId, playerId]
  }
  return await db.query<PlayerUser>(query)
}

async function getPlayerUsersByPlayerQuery(playerId: string | number) {
  const query = {
    text: /*sql*/ `select * from public."PlayerUser" where player_id = $1`,
    values: [playerId]
  }
  return await db.query<PlayerUser>(query)
}

async function getPlayerUserQuery(id: string) {
  const query = {
    text: /*sql*/ `select * from public."PlayerUser" where id = $1`,
    values: [id]
  }
  return await db.query<PlayerUser>(query)
}

async function removePlayerUsersByPlayerQuery(playerId: string | number) {
  const query = {
    text: /*sql*/ `delete from public."PlayerUser" where player_id = $1`,
    values: [playerId]
  }

  return await db.query<PlayerUser>(query)
}

async function removePlayerUserQuery(id: string | number) {
  const query = {
    text: /*sql*/ `delete from public."PlayerUser" where id = $1`,
    values: [id]
  }

  return await db.query<PlayerUser>(query)
}

async function editPlayerUserQuery(id: string, data: any) {
  const query = buildUpdateQuery("PlayerUser", data, id);
  return await db.query<PlayerUser>(query);
}

export {
  addPlayerUserQuery,
  getPlayerUserQuery,
  getPlayerUsersQuery,
  getPlayerUsersByPlayerQuery,
  removePlayerUserQuery,
  editPlayerUserQuery,
  getPlayerUserByUserAndPlayerQuery,
  removePlayerUsersByPlayerQuery
}
