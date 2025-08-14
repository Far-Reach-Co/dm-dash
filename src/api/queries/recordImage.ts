import db from "../dbconfig";

export interface RecordImage {
  id: number,
  record_id: string,
  image_id: number
}

async function addRecordImageQuery(data: {record_id: number | string, image_id: number | string}) {
  const query = {
    text: /*sql*/ `insert into public."RecordImage" (record_id, image_id) values($1,$2) returning *`,
    values: [
      data.record_id,
      data.image_id
    ]
  }
  return await db.query<RecordImage>(query)
}

async function getRecordImageQuery(id: number | string) {
  const query = {
    text: /*sql*/ `select * from public."RecordImage" where id = $1`,
    values: [id]
  }
  return await db.query<RecordImage>(query)
}

async function getRecordImagesByRecordQuery(id: number | string) {
  const query = {
    text: /*sql*/ `select * from public."RecordImage" where record_id = $1`,
    values: [id]
  }
  return await db.query<RecordImage>(query)
}

async function getRecordImagesByImageQuery(id: number | string) {
  const query = {
    text: /*sql*/ `select * from public."RecordImage" where image_id = $1`,
    values: [id]
  }
  return await db.query<RecordImage>(query)
}

async function removeRecordImageQuery(id: number | string) {
  const query = {
    text: /*sql*/ `delete from public."RecordImage" where id = $1 returning *`,
    values: [id]
  }

  return await db.query<RecordImage>(query)
}

export {
  addRecordImageQuery,
  getRecordImageQuery,
  getRecordImagesByRecordQuery,
  getRecordImagesByImageQuery,
  removeRecordImageQuery
}