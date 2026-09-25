const fs = require('fs');
let code = fs.readFileSync('src/components/KamadWeeklyRecapModal.tsx', 'utf-8');

const targetAddSingle = `              if (isDone) {
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
              }`;

const replacementAddSingle = `              if (isDone) {
                status = 'selesai';
                if (doneAt) {
                  const match = String(doneAt).match(/(\\d{2}):(\\d{2})/);
                  if (match) {
                     const doneHM = \`\${match[1]}:\${match[2]}\`;
                     if (finalDeadline && isTimePastDeadline(doneHM, finalDeadline)) {
                        status = 'terlewat';
                     } else if (idealDeadline && isTimePastDeadline(doneHM, idealDeadline)) {
                        status = 'selesai_telat';
                     }
                  }
                }
              }`;

if (code.includes(targetAddSingle)) {
    code = code.replace(targetAddSingle, replacementAddSingle);
    fs.writeFileSync('src/components/KamadWeeklyRecapModal.tsx', code);
    console.log("Replaced successfully in KamadWeeklyRecapModal.tsx");
} else {
    console.log("Could not find target block in KamadWeeklyRecapModal.tsx");
}
