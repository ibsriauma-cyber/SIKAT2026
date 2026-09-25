const fs = require('fs');
let code = fs.readFileSync('src/pages/KamadPages.tsx', 'utf-8');

const targetDatePart = `              let doneDatePart = '';
              if (doneAtStr) {
                 // Convert doneAtStr to local date string to accurately get the date part
                 const d = new Date(doneAtStr);
                 if (!isNaN(d.getTime())) {
                    doneDatePart = \`\${d.getFullYear()}-\${String(d.getMonth() + 1).padStart(2, '0')}-\${String(d.getDate()).padStart(2, '0')}\`;
                 } else {
                    const match = String(doneAtStr).match(/^(\\d{4}-\\d{2}-\\d{2})/);
                    if (match) doneDatePart = match[1];
                 }
                 if (doneDatePart && doneDatePart < filterDateStr) {
                    isDoneBeforeToday = true;
                 }
              }`;

const replaceDatePart = `              let doneDatePart = '';
              if (doneAtStr) {
                 // Extract date strictly from the string to avoid timezone shifts
                 const match = String(doneAtStr).match(/^(\\d{4}-\\d{2}-\\d{2})/);
                 if (match) doneDatePart = match[1];
                 
                 if (doneDatePart && doneDatePart < filterDateStr) {
                    isDoneBeforeToday = true;
                 }
              }`;

code = code.replace(targetDatePart, replaceDatePart);
fs.writeFileSync('src/pages/KamadPages.tsx', code);
