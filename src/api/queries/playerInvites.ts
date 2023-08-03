import db from "../dbconfig";

export interface PlayerInviteModel {
  id: number,
  uuid: string,
  player_id: number
}

async function addPlayerInviteQuery(data: {uuid: string, player_id: string}) {
  const query = {
    text: /*sql*/ `insert into public."PlayerInvite" (uuid, player_id) values($1,$2) returning *`,
    values: [
      data.uuid,
      data.player_id
    ]
  }
  return await db.query<PlayerInviteModel>(query)
}

async function getPlayerInviteQuery(id: string) {
  const query = {
    text: /*sql*/ `select * from public."PlayerInvite" where id = $1`,
    values: [id]
  }
  return await db.query<PlayerInviteModel>(query)
}

async function getPlayerInviteByPlayerQuery(playerId: string | number) {
  const query = {
    text: /*sql*/ `select * from public."PlayerInvite" where player_id = $1`,
    values: [playerId]
  }
  return await db.query<PlayerInviteModel>(query)
}

async function getPlayerInviteByUUIDQuery(uuid: string) {
  const query = {
    text: /*sql*/ `select * from public."PlayerInvite" where uuid = $1`,
    values: [uuid]
  }
  return await db.query<PlayerInviteModel>(query)
}

async function removePlayerInviteQuery(id: string | number) {
  const query = {
    text: /*sql*/ `delete from public."PlayerInvite" where id = $1`,
    values: [id]
  }

  return await db.query<PlayerInviteModel>(query)
}

export {
  addPlayerInviteQuery,
  getPlayerInviteQuery,
  getPlayerInviteByUUIDQuery,
  getPlayerInviteByPlayerQuery,
  removePlayerInviteQuery
}