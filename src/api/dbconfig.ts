import { Pool, QueryResult, QueryResultRow } from "pg";
import logger from "../lib/logger.js";
import { resolveDatabasePoolConfig } from "../lib/dbConnection.js";

export var pool = new Pool(resolveDatabasePoolConfig());

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
