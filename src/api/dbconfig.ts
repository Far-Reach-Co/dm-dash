import { Pool, QueryResult, QueryResultRow } from "pg";
import logger from "../lib/logger.js";

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
  try {
    return await pool.query(queryObject, params);
  } catch (error) {
    logger.error(
      { err: error, query: queryObject.text },
      "Database query failed"
    );
    throw error;
  }
}

const db = {
  query,
};

export default db;
