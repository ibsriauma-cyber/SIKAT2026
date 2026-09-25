const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '3306')
  });

  try {
    const res = await pool.query("INSERT INTO ibadah_guru (user_id, date, status, keterangan) VALUES (1, '2026-08-25', 'Jamaah', '')");
    console.log(res);
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
}
run();
