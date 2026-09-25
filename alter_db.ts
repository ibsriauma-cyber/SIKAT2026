import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function alterDb() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '3306')
  });
  
  try {
    console.log("Dropping old table if needed or altering...");
    await pool.query('DROP TABLE IF EXISTS subjects');
    await pool.query(`CREATE TABLE \`subjects\` (
      \`id\` int(11) NOT NULL AUTO_INCREMENT,
      \`code\` varchar(20) NOT NULL,
      \`name\` varchar(100) NOT NULL,
      \`category\` enum('Wajib', 'Muatan Lokal', 'Pilihan') DEFAULT 'Wajib',
      \`weekly_hours\` int(11) DEFAULT 2,
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`code\` (\`code\`),
      UNIQUE KEY \`name\` (\`name\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);
    
    console.log("Inserting new data...");
    await pool.query(`INSERT INTO \`subjects\` (\`id\`, \`code\`, \`name\`, \`category\`, \`weekly_hours\`) VALUES
      (1, 'MTK-01', 'Matematika', 'Wajib', 4),
      (2, 'FIS-01', 'Fisika', 'Pilihan', 3),
      (3, 'KIM-01', 'Kimia', 'Pilihan', 3),
      (4, 'ARB-01', 'Bahasa Arab', 'Muatan Lokal', 2),
      (5, 'TFZ-01', 'Tahfizh Al-Quran', 'Muatan Lokal', 4),
      (6, 'FIQ-01', 'Fiqih', 'Wajib', 2),
      (7, 'AKD-01', 'Akidah Akhlak', 'Wajib', 2),
      (8, 'IND-01', 'Bahasa Indonesia', 'Wajib', 4),
      (9, 'ENG-01', 'Bahasa Inggris', 'Wajib', 4),
      (10, 'SJR-01', 'Sejarah', 'Wajib', 2),
      (11, 'PJK-01', 'Pendidikan Jasmani', 'Wajib', 2),
      (12, 'SNI-01', 'Seni Budaya', 'Muatan Lokal', 2),
      (13, 'PKN-01', 'Pendidikan Kewarganegaraan', 'Wajib', 2),
      (14, 'BIO-01', 'Biologi', 'Pilihan', 3),
      (15, 'EKO-01', 'Ekonomi', 'Pilihan', 3),
      (16, 'GEO-01', 'Geografi', 'Pilihan', 3),
      (17, 'SOS-01', 'Sosiologi', 'Pilihan', 3),
      (18, 'IKU-01', 'Ilmu Tafsir', 'Muatan Lokal', 2),
      (19, 'HAD-01', 'Ilmu Hadits', 'Muatan Lokal', 2),
      (20, 'SKD-01', 'Sejarah Kebudayaan Islam', 'Wajib', 2);`);
      
    console.log("Successfully altered DB!");
  } catch (e) {
    console.log("Error:", e.message);
  }
  pool.end();
}
alterDb();
