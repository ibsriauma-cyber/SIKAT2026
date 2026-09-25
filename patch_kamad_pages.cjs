const fs = require('fs');
let code = fs.readFileSync('src/pages/KamadPages.tsx', 'utf-8');

const target = `                if (isLate) {
                  status = 'selesai_telat';
                  statusText = 'SELESAI (TERLAMBAT!)';
                  timeStr = doneHM ? \\\`Selesai: \\\${doneHM} WIB (Terlambat)\\\` : 'Selesai (Terlambat)';
                } else {`;

const replace = `                if (isLate) {
                  status = 'terlewat';
                  statusText = 'TIDAK MENGISI (TERLAMBAT)';
                  timeStr = doneHM ? \\\`Diisi: \\\${doneHM} WIB (Dianggap Tidak Mengisi)\\\` : 'Dianggap Tidak Mengisi';
                } else {`;

code = code.replace(target, replace);
fs.writeFileSync('src/pages/KamadPages.tsx', code);
console.log("Patched KamadPages.tsx");
