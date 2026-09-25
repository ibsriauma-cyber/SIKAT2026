const fs = require('fs');
let code = fs.readFileSync('src/pages/KamadPages.tsx', 'utf-8');

const targetPdf1 = `task.status === 'selesai' ? 'SELESAI (TEPAT WAKTU)' : task.status === 'selesai_telat' ? 'SELESAI (TERLAMBAT)' : task.status === 'terlewat' ? 'BELUM (TERLEWAT)' : 'DALAM PROSES'`;
const replacementPdf1 = `task.status === 'selesai' ? 'SELESAI (TEPAT WAKTU)' : task.status === 'selesai_telat' ? 'SELESAI (TERLAMBAT)' : task.status === 'terlewat' ? 'BELUM (TERLEWAT)' : task.status === 'proses_telat' ? 'TERLEWAT BATAS IDEAL' : 'DALAM PROSES'`;

code = code.replaceAll(targetPdf1, replacementPdf1);

const targetPdf2 = `task.status === 'selesai' ? 'SELESAI (TEPAT WAKTU)' : task.status === 'selesai_telat' ? 'SELESAI (TERLAMBAT!)' : task.status === 'terlewat' ? 'BELUM (TERLEWAT)' : 'DALAM PROSES'`;
const replacementPdf2 = `task.status === 'selesai' ? 'SELESAI (TEPAT WAKTU)' : task.status === 'selesai_telat' ? 'SELESAI (TERLAMBAT!)' : task.status === 'terlewat' ? 'BELUM (TERLEWAT)' : task.status === 'proses_telat' ? 'TERLEWAT BATAS IDEAL' : 'DALAM PROSES'`;
code = code.replaceAll(targetPdf2, replacementPdf2);

fs.writeFileSync('src/pages/KamadPages.tsx', code);
