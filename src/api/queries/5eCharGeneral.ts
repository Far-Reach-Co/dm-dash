import db from "../dbconfig";

export interface DndFiveEGeneralModel {
  id: number;
  user_id: number;
  name: string;
  race: string;
  class: string;
  level: number;
  exp: number;
  inspiration: boolean;
  initiative: number;
  speed: number;
  armor_class: number;
  current_hp: number;
  temp_hp: number;
  hit_dice: number;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  max_hp: number;
  hit_dice_total: string;
  class_resource: number;
  class_resource_total: number;
  other_resource: string;
  other_resource_total: string;
  ds_success_1: boolean;
  ds_success_2: boolean;
  ds_success_3: boolean;
  ds_failure_1: boolean;
  ds_failure_2: boolean;
  ds_failure_3: boolean;
  class_resource_title: string;
  other_resource_title: string;
  wisdom_mod: number;
  subclass: string;
  other_class: string;
  copper: string;
  silver: string;
  electrum: string;
  gold: string;
  platinum: string;
}

async function add5eCharGeneralQuery(data: {
  user_id: string,
  name: string
}) {
  const query = {
    text: /*sql*/ `insert into public."dnd_5e_character_general" (user_id, name) values($1,$2) returning *`,
    values: [
      data.user_id,
      data.name,
    ]
  }
  return await db.query<DndFiveEGeneralModel>(query)
}

async function get5eCharGeneralQuery(id: string | number) {
  const query = {
    text: /*sql*/ `select * from public."dnd_5e_character_general" where id = $1`,
    values: [id]
  }
  return await db.query<DndFiveEGeneralModel>(query)
}

async function get5eCharGeneralUserIdQuery(id: string) {
  const query = {
    text: /*sql*/ `select user_id from public."dnd_5e_character_general" where id = $1`,
    values: [id]
  }
  return await db.query<DndFiveEGeneralModel>(query)
}

async function get5eCharNamesQuery(ids: (string | number)[]) {
  const placeholders = ids.map((_, index) => `$${index + 1}`).join(',');

  const query = {
    text: /*sql*/ `SELECT name FROM public."dnd_5e_character_general" WHERE id IN (${placeholders})`,
    values: ids,
  };
  return await db.query<DndFiveEGeneralModel>(query)
}

async function get5eCharsGeneralByUserQuery(userId: string | number) {
  const query = {
    text: /*sql*/ `select * from public."dnd_5e_character_general" where user_id = $1`,
    values: [userId]
  }
  return await db.query<DndFiveEGeneralModel>(query)
}

async function remove5eCharGeneralQuery(id: string | number) {
  const query = {
    text: /*sql*/ `delete from public."dnd_5e_character_general" where id = $1`,
    values: [id]
  }

  return await db.query<DndFiveEGeneralModel>(query)
}

async function edit5eCharGeneralQuery(id: string, data: any) {
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
    text: /*sql*/ `update public."dnd_5e_character_general" set ${edits} where id = $${iterator} returning *`,
    values: values,
  }

  return await db.query<DndFiveEGeneralModel>(query)
}

export {
  add5eCharGeneralQuery,
  get5eCharGeneralUserIdQuery,
  get5eCharsGeneralByUserQuery,
  get5eCharGeneralQuery,
  remove5eCharGeneralQuery,
  edit5eCharGeneralQuery,
  get5eCharNamesQuery
}