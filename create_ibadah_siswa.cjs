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
    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`ibadah_siswa\` (
        \`id\` int(11) NOT NULL AUTO_INCREMENT,
        \`student_id\` int(11) NOT NULL,
        \`date\` date NOT NULL,
        \`status\` varchar(50) NOT NULL,
        \`keterangan\` text,
        \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log("Table ibadah_siswa created/exists.");
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
}
run();
