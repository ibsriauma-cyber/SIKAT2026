const mysql = require('mysql2/promise');
require('dotenv').config();
async function test() {
  const pool = mysql.createPool({
    host: process.env.HOSTINGER_HOST,
    user: process.env.HOSTINGER_USER,
    password: process.env.HOSTINGER_PASSWORD,
    database: process.env.HOSTINGER_DB_NAME
  });
  const [rows] = await pool.query("SELECT NOW() as db_time, @@global.time_zone, @@session.time_zone");
  console.log(rows);
  process.exit(0);
}
test();
