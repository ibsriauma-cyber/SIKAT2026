const fs = require('fs');
let code = fs.readFileSync('src/pages/KamadPages.tsx', 'utf-8');

const targetWeekFilter = `                const startStr = start.toLocaleDateString('en-CA');
                const endStr = end.toLocaleDateString('en-CA');
                const weekRecords = ibadahRecords.filter(r => String(r.user_id) === String(u.id) && (r.date >= startStr || r.date && r.date.substring(0, 10) >= startStr) && (r.date <= endStr || r.date && r.date.substring(0, 10) <= endStr));`;

const replaceWeekFilter = `                const startStr = \`\${start.getFullYear()}-\${String(start.getMonth()+1).padStart(2,'0')}-\${String(start.getDate()).padStart(2,'0')}\`;
                const endStr = \`\${end.getFullYear()}-\${String(end.getMonth()+1).padStart(2,'0')}-\${String(end.getDate()).padStart(2,'0')}\`;
                const weekRecords = ibadahRecords.filter(r => {
                  if (String(r.user_id) !== String(u.id)) return false;
                  let recordDate = '';
                  if (r.date) {
                    const match = String(r.date).match(/^(\\d{4}-\\d{2}-\\d{2})/);
                    if (match) recordDate = match[1];
                  } else if (r.created_at) {
                    const match = String(r.created_at).match(/^(\\d{4}-\\d{2}-\\d{2})/);
                    if (match) recordDate = match[1];
                  }
                  return recordDate >= startStr && recordDate <= endStr;
                });`;

code = code.replace(targetWeekFilter, replaceWeekFilter);
fs.writeFileSync('src/pages/KamadPages.tsx', code);
