var { Pool } = require("pg")

// LOCAL
var credentials = {
  user: import.meta.env.VITE_PG_USER,
  host: import.meta.env.VITE_PG_HOST,
  database: import.meta.env.VITE_PG_DB,
  password: import.meta.env.VITE_PG_PW,
  port: 5432
}

var pool = new Pool(credentials)

async function query(text, params) {
  const start = Date.now()
  const res = await pool.query(text, params)
  const duration = Date.now() - start
  console.log('executed query', { text, duration, rows: res.rowCount })
  return res
}

module.exports = {
  query
}