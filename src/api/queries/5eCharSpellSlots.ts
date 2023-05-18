import db from "../dbconfig";

export interface DndFiveESpellSlotsModel {
  id: number,
  general_id: number,
  first_total: number,
  first_expended: number,
  second_total: number,
  second_expended: number,
  third_total: number,
  third_expended: number,
  fourth_total: number,
  fourth_expended: number,
  fifth_total: number,
  fifth_expended: number,
  sixth_total: number,
  sixth_expended: number,
  seventh_total: number,
  seventh_expended: number,
  eigth_total: number,
  eigth_expended: number,
  nineth_total: number,
  nineth_expended: number,
  spell_casting_ability: string
}

async function add5eCharSpellSlotInfoQuery(data: {
  general_id: string | number
}) {
  const query = {
    text: /*sql*/ `insert into public."dnd_5e_spell_slots" (general_id) values($1) returning *`,
    values: [
      data.general_id,
    ]
  }
  return await db.query<DndFiveESpellSlotsModel>(query)
}

async function get5eCharSpellSlotInfoQuery(id: string) {
  const query = {
    text: /*sql*/ `select * from public."dnd_5e_spell_slots" where id = $1`,
    values: [id]
  }
  return await db.query<DndFiveESpellSlotsModel>(query)
}

async function get5eCharSpellSlotInfosByGeneralQuery(generalId: string | number) {
  const query = {
    text: /*sql*/ `select * from public."dnd_5e_spell_slots" where general_id = $1`,
    values: [generalId]
  }
  return await db.query<DndFiveESpellSlotsModel>(query)
}

async function remove5eCharSpellSlotInfoQuery(id: string | number) {
  const query = {
    text: /*sql*/ `delete from public."dnd_5e_spell_slots" where id = $1`,
    values: [id]
  }

  return await db.query<DndFiveESpellSlotsModel>(query)
}

async function edit5eCharSpellSlotInfoQuery(id: string, data: any) {
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
    text: /*sql*/ `update public."dnd_5e_spell_slots" set ${edits} where id = $${iterator} returning *`,
    values: values,
  }

  return await db.query<DndFiveESpellSlotsModel>(query)
}

export {
  add5eCharSpellSlotInfoQuery,
  get5eCharSpellSlotInfosByGeneralQuery,
  get5eCharSpellSlotInfoQuery,
  remove5eCharSpellSlotInfoQuery,
  edit5eCharSpellSlotInfoQuery
}