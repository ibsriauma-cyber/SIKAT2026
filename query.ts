import { pool } from './src/lib/mysqlWrapper';
async function run() {
  try {
    await pool.query(`ALTER TABLE pemantauan_pagi ADD COLUMN semester VARCHAR(50)`);
    console.log("Column added to pemantauan_pagi.");
  } catch(e) { console.error(e.message); }
  process.exit(0);
}
run();
