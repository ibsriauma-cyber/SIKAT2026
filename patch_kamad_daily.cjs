const fs = require('fs');
let code = fs.readFileSync('src/pages/KamadPages.tsx', 'utf-8');

const target = `            if (isDone) {
              let isDoneBeforeToday = false;
              let doneDatePart = '';
              if (doneAtStr) {
                 // Extract date strictly from the string to avoid timezone shifts
                 const match = String(doneAtStr).match(/^(\\d{4}-\\d{2}-\\d{2})/);
                 if (match) doneDatePart = match[1];
                 
                 if (doneDatePart && doneDatePart < filterDateStr) {
                    isDoneBeforeToday = true;
                 }
              }

              if (isDoneBeforeToday) {
                 isLate = false; // Always on time if done before the filter date
              } else {
                 isLate = Boolean(idealDeadline && doneHM && isTimePastDeadline(doneHM, idealDeadline));
              }

              if (isLate) {
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
              }
            } else {`;

const replacement = `            if (isDone) {
              let isDoneBeforeToday = false;
              let doneDatePart = '';
              if (doneAtStr) {
                 // Extract date strictly from the string to avoid timezone shifts
                 const match = String(doneAtStr).match(/^(\\d{4}-\\d{2}-\\d{2})/);
                 if (match) doneDatePart = match[1];
                 
                 if (doneDatePart && doneDatePart < filterDateStr) {
                    isDoneBeforeToday = true;
                 }
              }

              let isPastFinal = false;
              if (!isDoneBeforeToday && finalDeadline && doneHM) {
                 isPastFinal = isTimePastDeadline(doneHM, finalDeadline);
              }

              if (isPastFinal) {
                status = 'terlewat';
                statusText = 'BELUM (TERLEWAT)';
                timeStr = \`Batas Akhir \${finalDeadline} WIB Terlewat\`;
              } else {
                if (isDoneBeforeToday) {
                   isLate = false; // Always on time if done before the filter date
                } else {
                   isLate = Boolean(idealDeadline && doneHM && isTimePastDeadline(doneHM, idealDeadline));
                }

                if (isLate) {
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
                }
              }
            } else {`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('src/pages/KamadPages.tsx', code);
    console.log("Success");
} else {
    // Try relaxing whitespace if exact match fails
    const targetNoSpace = target.replace(/\s+/g, '');
    const codeNoSpace = code.replace(/\s+/g, '');
    if (codeNoSpace.includes(targetNoSpace)) {
       console.log("Match found ignoring whitespace, but need precise regex replacement.");
    } else {
       console.log("Target completely not found.");
    }
}
