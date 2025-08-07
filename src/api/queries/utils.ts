import db from "../dbconfig";

async function columnNamesQuery(tableName: string): Promise<string[]> {
  const query = {
    text: /*sql*/ `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = $1
        AND column_name != 'id'
      ORDER BY ordinal_position
    `,
    values: [tableName],
  };

  const result = await db.query(query);
  return result.rows.map(row => row.column_name);
}

export {
  columnNamesQuery
}