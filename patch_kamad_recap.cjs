const fs = require('fs');
let code = fs.readFileSync('src/components/KamadWeeklyRecapModal.tsx', 'utf-8');

// Update stats initialization
const targetStats = `          let stats = {
            // WALAS
            walas_absenPagi: { mengisi: 0, tidak: 0 },
            walas_sikap: { mengisi: 0, tidak: 0 },
            walas_pemantauan: { mengisi: 0, tidak: 0 },
            walas_zuhur: { mengisi: 0, tidak: 0 },
            // GURU MAPEL & QURAN
            guru_absenKBM: { mengisi: 0, tidak: 0 },
            guru_jurnal: { mengisi: 0, tidak: 0 },
            guru_perangkat: { mengisi: 0, tidak: 0 },
            guru_ibadah: { mengisi: 0, tidak: 0 } // Zuhur for mapel, Dhuha for quran
          };`;

const replacementStats = `          let stats = {
            // WALAS
            walas_absenPagi: { mengisi: 0, telat: 0, tidak: 0 },
            walas_sikap: { mengisi: 0, telat: 0, tidak: 0 },
            walas_pemantauan: { mengisi: 0, telat: 0, tidak: 0 },
            walas_zuhur: { mengisi: 0, telat: 0, tidak: 0 },
            // GURU MAPEL & QURAN
            guru_absenKBM: { mengisi: 0, telat: 0, tidak: 0 },
            guru_jurnal: { mengisi: 0, telat: 0, tidak: 0 },
            guru_perangkat: { mengisi: 0, telat: 0, tidak: 0 },
            guru_ibadah: { mengisi: 0, telat: 0, tidak: 0 } // Zuhur for mapel, Dhuha for quran
          };`;

code = code.replace(targetStats, replacementStats);

// Update addSingleTask
const targetAddSingle = `            const addSingleTask = (
              taskName: string, category: string, idealDeadline?: string, finalDeadline?: string, customCheckFn?: () => any
            ) => {
              const foundKinerja = userKinerja.find((k: any) => String(k.task).toLowerCase() === String(taskName).toLowerCase());
              let isDone = false;
              if (foundKinerja) {
                isDone = true;
              } else if (customCheckFn) {
                const customRes = customCheckFn();
                if (customRes?.completed) isDone = true;
              }
              let status = 'proses';
              if (isDone) {
                status = 'selesai';
              } else {
                const now = new Date();
                const todayStr = \`\${now.getFullYear()}-\${String(now.getMonth() + 1).padStart(2, '0')}-\${String(now.getDate()).padStart(2, '0')}\`;
                const isPastDate = filterDateStr < todayStr;
                let isFinalLate = false;
                if (isPastDate) isFinalLate = true;
                else if (filterDateStr === todayStr && finalDeadline) {
                  const currentHourMin = \`\${now.getHours().toString().padStart(2, '0')}:\${now.getMinutes().toString().padStart(2, '0')}\`;
                  isFinalLate = isTimePastDeadline(currentHourMin, finalDeadline);
                }
                if (isFinalLate) status = 'terlewat';
              }
              
              if (status === 'selesai' || status === 'selesai_telat') {
                 // @ts-ignore
                 stats[category].mengisi++;
              } else if (status === 'terlewat') {
                 // @ts-ignore
                 stats[category].tidak++;
              }
            };`;

const replacementAddSingle = `            const addSingleTask = (
              taskName: string, category: string, idealDeadline?: string, finalDeadline?: string, customCheckFn?: () => any
            ) => {
              const foundKinerja = userKinerja.find((k: any) => String(k.task).toLowerCase() === String(taskName).toLowerCase());
              let isDone = false;
              let doneAt = '';
              if (foundKinerja) {
                isDone = true;
                doneAt = foundKinerja.created_at || foundKinerja.timestamp || '';
              } else if (customCheckFn) {
                const customRes = customCheckFn();
                if (customRes?.completed) {
                  isDone = true;
                  doneAt = customRes.completedAt || '';
                }
              }
              let status = 'proses';
              if (isDone) {
                status = 'selesai';
                if (finalDeadline && doneAt) {
                  const match = String(doneAt).match(/(\\d{2}):(\\d{2})/);
                  if (match) {
                     const doneHM = \`\${match[1]}:\${match[2]}\`;
                     if (isTimePastDeadline(doneHM, finalDeadline)) {
                        status = 'selesai_telat';
                     }
                  }
                }
              } else {
                const now = new Date();
                const todayStr = \`\${now.getFullYear()}-\${String(now.getMonth() + 1).padStart(2, '0')}-\${String(now.getDate()).padStart(2, '0')}\`;
                const isPastDate = filterDateStr < todayStr;
                let isFinalLate = false;
                if (isPastDate) isFinalLate = true;
                else if (filterDateStr === todayStr && finalDeadline) {
                  const currentHourMin = \`\${now.getHours().toString().padStart(2, '0')}:\${now.getMinutes().toString().padStart(2, '0')}\`;
                  isFinalLate = isTimePastDeadline(currentHourMin, finalDeadline);
                }
                if (isFinalLate) status = 'terlewat';
              }
              
              if (status === 'selesai') {
                 // @ts-ignore
                 stats[category].mengisi++;
              } else if (status === 'selesai_telat') {
                 // @ts-ignore
                 stats[category].telat++;
              } else if (status === 'terlewat') {
                 // @ts-ignore
                 stats[category].tidak++;
              }
            };`;

code = code.replace(targetAddSingle, replacementAddSingle);

// replace all "if (match) return { completed: true }; return null;"
code = code.replace(/if \(match\) return \{ completed: true \}; return null;/g, "if (match) return { completed: true, completedAt: match.created_at || match.timestamp || match.date }; return null;");

fs.writeFileSync('src/components/KamadWeeklyRecapModal.tsx', code);
