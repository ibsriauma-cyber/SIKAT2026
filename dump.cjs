const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config();

(async () => {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  const [tablesRes] = await pool.query('SHOW TABLES');
  const tables = tablesRes.map(t => Object.values(t)[0]);
  
  const dump = {};
  for (const t of tables) {
    const [rows] = await pool.query(`SELECT * FROM \`${t}\``);
    dump[t] = rows;
  }
  
  fs.writeFileSync('db_dump.json', JSON.stringify(dump, null, 2));
  console.log('Dump saved.');
  process.exit(0);
})();
