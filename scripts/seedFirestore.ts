import { pool } from '../src/lib/mysqlWrapper';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, writeBatch } from 'firebase/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function batchSyncTable(tableName: string, data: any[]) {
  const BATCH_SIZE = 450;
  for (let i = 0; i < data.length; i += BATCH_SIZE) {
    const chunk = data.slice(i, i + BATCH_SIZE);
    const batch = writeBatch(db);
    for (const item of chunk) {
      const docId = String(item.id || item.k || `doc_${Math.random().toString(36).substring(2, 9)}`);
      batch.set(doc(db, tableName, docId), { ...item, id: docId });
    }
    await batch.commit();
    console.log(`Synced ${chunk.length} items to collection '${tableName}'`);
  }
}

async function main() {
  console.log('--- STARTING FIRESTORE SEED FROM MYSQL ---');
  const tables = [
    'users',
    'students',
    'classes',
    'subjects',
    'academic_terms',
    'schedules',
    'teaching_assignments',
    'announcements',
    'sarpras'
  ];

  for (const table of tables) {
    try {
      const [rows]: any = await pool.query(`SELECT * FROM \`${table}\``);
      if (Array.isArray(rows) && rows.length > 0) {
        await batchSyncTable(table, rows);
      }
    } catch (err: any) {
      console.warn(`Skipping table ${table}:`, err.message);
    }
  }

  // Also set a system status doc
  const batch = writeBatch(db);
  batch.set(doc(db, 'system_test', 'ping'), {
    status: 'connected',
    database: 'firestore_realtime',
    updatedAt: new Date().toISOString()
  });
  await batch.commit();

  console.log('--- FIRESTORE SEED COMPLETED SUCCESSFULLY ---');
  process.exit(0);
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
