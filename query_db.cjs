require('dotenv').config();
const mysql = require('mysql2/promise');

async function run() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: process.env.MYSQL_PORT,
  });

  const [rows] = await connection.query('SHOW COLUMNS FROM ibadah_siswa');
  console.log(rows);
  const [data] = await connection.query('SELECT * FROM ibadah_siswa LIMIT 3');
  console.log(data);
  await connection.end();
}

run();
