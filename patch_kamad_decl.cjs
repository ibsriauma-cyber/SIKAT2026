const fs = require('fs');
let code = fs.readFileSync('src/pages/KamadPages.tsx', 'utf-8');
const oldText = fs.readFileSync('old_addSingleTask.txt', 'utf-8');

const newText = `          const addSingleTask = (
            taskName: string,
            group: string,
            idealDeadline?: string,
            finalDeadline?: string,
            customCheckFn?: () => { completed: boolean; completedAt?: string } | null
          ) => {
            const foundKinerja = userKinerja.find((k: any) => 
              k.task === taskName || 
              String(k.task).toLowerCase() === String(taskName).toLowerCase()
            );

            let isDone = false;
            let doneAtStr: string | null = null;

            if (foundKinerja) {
              isDone = true;
              doneAtStr = foundKinerja.created_at || null;
            } else if (customCheckFn) {
              const customRes = customCheckFn();
              if (customRes && customRes.completed) {
                isDone = true;
                doneAtStr = customRes.completedAt || null;
              }
            }

            const doneHM = extractTimestampHM(doneAtStr);
            let status: 'selesai' | 'selesai_telat' | 'proses' | 'terlewat' = 'proses';
            let timeStr = '';
            let statusText = '';
            let isLate = false;

            if (isDone) {
              isLate = Boolean(idealDeadline && doneHM && isTimePastDeadline(doneHM, idealDeadline));
              if (isLate) {
                status = 'selesai_telat';
                statusText = 'SELESAI (TERLAMBAT)';
                timeStr = doneHM ? \`Selesai: \${doneHM} WIB (Terlambat)\` : 'Selesai (Terlambat)';
              } else {
                status = 'selesai';
                statusText = 'SELESAI (TEPAT WAKTU)';
                timeStr = doneHM ? \`Selesai: \${doneHM} WIB (Tepat Waktu)\` : 'Selesai (Tepat Waktu)';
              }
            } else {
              const cutoffTime = finalDeadline || '17:00';
              const isOverdue = isPastDate || isTimePastDeadline(currentHourMin, cutoffTime);
              
              if (isOverdue) {
                status = 'terlewat';
                statusText = 'BELUM (TERLEWAT)';
                timeStr = \`Batas Akhir \${cutoffTime} WIB Terlewat\`;
              } else {
                status = 'proses';
                statusText = 'DALAM PROSES';
                timeStr = idealDeadline ? \`Batas Ideal \${idealDeadline} (Akhir \${cutoffTime})\` : \`Batas Akhir \${cutoffTime}\`;
              }
            }

            allTasks.push({
              group,
              name: taskName,
              status,
              statusText,
              time: timeStr,
              doneHM,
              isDone,
              isLate,
              deadline: idealDeadline ? \`\${idealDeadline} WIB\` : '',
              deadlineHM: idealDeadline
            });
          };`;

if (code.includes(oldText)) {
    code = code.replace(oldText, newText);
    fs.writeFileSync('src/pages/KamadPages.tsx', code);
    console.log("Patched successfully");
} else {
    console.log("Could not find old text");
}
