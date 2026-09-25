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
      CREATE TABLE IF NOT EXISTS \`laporan_harian\` (
        \`id\` int(11) NOT NULL AUTO_INCREMENT,
        \`user_id\` int(11) NOT NULL,
        \`date\` date NOT NULL,
        \`activity\` text NOT NULL,
        \`status\` varchar(50) DEFAULT 'Selesai',
        \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log("Table laporan_harian created/exists.");
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
}
run();
