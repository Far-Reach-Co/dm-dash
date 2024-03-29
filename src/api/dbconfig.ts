import { Pool, QueryResult, QueryResultRow } from "pg";

// LOCAL
var credentials = {
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DB,
  password: process.env.PG_PW,
  port: 5432,
};

export var pool = new Pool(credentials);

async function query<T extends QueryResultRow>(
  queryObject: { text: string; values?: any[] },
  params?: any
): Promise<QueryResult<T>> {
  const start = Date.now();
  const res = await pool.query(queryObject, params);
  const duration = Date.now() - start;
  console.log("executed query", { queryObject, duration, rows: res.rowCount });
  return res;
}

const db = {
  query,
};

export default db;
