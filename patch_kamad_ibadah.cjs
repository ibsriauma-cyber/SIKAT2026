const fs = require('fs');
let code = fs.readFileSync('src/pages/KamadPages.tsx', 'utf-8');

const targetDateFilter = `  const [dateFilter, setDateFilter] = useState(new Date().toLocaleDateString('en-CA'));`;
const replaceDateFilter = `  const [dateFilter, setDateFilter] = useState((function(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');})());`;

code = code.replace(targetDateFilter, replaceDateFilter);

const targetFind = `                const record = ibadahRecords.find(r => String(r.user_id) === String(u.id) && (r.date === dateFilter || r.date && r.date.startsWith(dateFilter)));`;
const replaceFind = `                const record = ibadahRecords.find(r => {
                  if (String(r.user_id) !== String(u.id)) return false;
                  let recordDate = '';
                  if (r.date) {
                    const match = String(r.date).match(/^(\\d{4}-\\d{2}-\\d{2})/);
                    if (match) recordDate = match[1];
                  } else if (r.created_at) {
                    const match = String(r.created_at).match(/^(\\d{4}-\\d{2}-\\d{2})/);
                    if (match) recordDate = match[1];
                  }
                  return recordDate === dateFilter;
                });`;

code = code.replace(targetFind, replaceFind);
fs.writeFileSync('src/pages/KamadPages.tsx', code);
