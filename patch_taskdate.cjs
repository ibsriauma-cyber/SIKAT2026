const fs = require('fs');
let code = fs.readFileSync('src/pages/KamadPages.tsx', 'utf-8');

const targetDate = `            let taskDate = '';
            if (k.created_at) {
              // Properly convert to local timezone date string (YYYY-MM-DD)
              const d = new Date(k.created_at);
              if (!isNaN(d.getTime())) {
                taskDate = \`\${d.getFullYear()}-\${String(d.getMonth() + 1).padStart(2, '0')}-\${String(d.getDate()).padStart(2, '0')}\`;
              } else {
                taskDate = String(k.created_at).split(/[ T]/)[0];
              }
            }`;

const replaceDate = `            let taskDate = '';
            if (k.created_at) {
              // Extract date strictly from the string to avoid timezone shifts
              const match = String(k.created_at).match(/^(\\d{4}-\\d{2}-\\d{2})/);
              if (match) taskDate = match[1];
            }`;

code = code.replace(targetDate, replaceDate);
fs.writeFileSync('src/pages/KamadPages.tsx', code);
