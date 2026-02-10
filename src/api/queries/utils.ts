import db from "../dbconfig";

function buildUpdateQuery(
  tableName: string,
  data: Record<string, unknown>,
  id: string | number,
  options?: { idColumn?: string },
) {
  let edits = ``;
  const values: unknown[] = [];
  let iterator = 1;
  const idColumn = options?.idColumn || "id";

  for (const [key, value] of Object.entries(data)) {
    edits += `${key} = $${iterator}, `;
    values.push(value);
    iterator++;
  }

  if (!edits) {
    throw new Error("No fields provided for update");
  }

  edits = edits.slice(0, -2);
  values.push(id);

  return {
    text: /*sql*/ `update public."${tableName}" set ${edits} where ${idColumn} = $${iterator} returning *`,
    values,
  };
}

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
  columnNamesQuery,
  buildUpdateQuery,
}
