const fs = require('fs');
let code = fs.readFileSync('src/pages/KamadPages.tsx', 'utf-8');

const targetLogic = `              if (isLate) {
                status = 'selesai_telat';
                statusText = 'SELESAI (TERLAMBAT!)';
                timeStr = doneHM ? \`Selesai: \${doneHM} WIB (Terlambat)\` : 'Selesai (Terlambat)';
              } else {
                status = 'selesai';
                statusText = 'SELESAI (TEPAT WAKTU)';
                timeStr = doneHM ? \`Selesai: \${doneHM} WIB (Tepat Waktu)\` : 'Selesai (Tepat Waktu)';
              }`;

const replaceLogic = `              if (isLate) {
                status = 'selesai_telat';
                statusText = 'SELESAI (TERLAMBAT!)';
                timeStr = doneHM ? \`Selesai: \${doneHM} WIB (Terlambat)\` : 'Selesai (Terlambat)';
              } else {
                status = 'selesai';
                statusText = 'SELESAI (TEPAT WAKTU)';
                if (isDoneBeforeToday && doneDatePart) {
                  // Format the date slightly, e.g., "Selesai: 2026-08-26 (Tepat Waktu)"
                  timeStr = \`Selesai: \${doneDatePart} (Tepat Waktu)\`;
                } else {
                  timeStr = doneHM ? \`Selesai: \${doneHM} WIB (Tepat Waktu)\` : 'Selesai (Tepat Waktu)';
                }
              }`;

code = code.replace(targetLogic, replaceLogic);
fs.writeFileSync('src/pages/KamadPages.tsx', code);
