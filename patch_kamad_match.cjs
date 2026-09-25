const fs = require('fs');
let code = fs.readFileSync('src/pages/KamadPages.tsx', 'utf-8');

const targetJurnal = "                const match = laporanHarian.find((lh: any) =>\n                  (String(lh.tanggal).startsWith(filterDateStr) || String(lh.date).startsWith(filterDateStr)) &&\n                  String(lh.class_name).toLowerCase() === String(s.class_name).toLowerCase() &&\n                  String(lh.subject_name).toLowerCase() === String(s.subject_name).toLowerCase() &&\n                  String(lh.user_id) === String(u.id)\n                );";
const replaceJurnal = `                const match = laporanHarian.find((lh: any) => {
                  let act = {};
                  try { act = typeof lh.activity === 'string' && lh.activity.startsWith('{') ? JSON.parse(lh.activity) : {}; } catch(e) {}
                  const lhClass = act.class || lh.class_name || '';
                  const lhSubject = act.subject || lh.subject_name || '';
                  return (String(lh.tanggal).startsWith(filterDateStr) || String(lh.date).startsWith(filterDateStr)) &&
                  String(lhClass).toLowerCase() === String(s.class_name).toLowerCase() &&
                  String(lhSubject).toLowerCase() === String(s.subject_name).toLowerCase() &&
                  String(lh.user_id) === String(u.id);
                });`;
code = code.replace(new RegExp(targetJurnal.replace(/[.*+?^$\/{}()|[\]\\]/g, '\\$&'), 'g'), replaceJurnal);

fs.writeFileSync('src/pages/KamadPages.tsx', code);
console.log("Patched Kamad Jurnal Match");
