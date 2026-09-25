const fs = require('fs');

function patchFile(filename) {
  let code = fs.readFileSync(filename, 'utf-8');

  // We know it looks exactly like this on one line:
  const target1 = "const match = laporanHarian.find((lh: any) => {  let act = {};  try { act = typeof lh.activity === 'string' && lh.activity.startsWith('{') ? JSON.parse(lh.activity) : {}; } catch (e) {}  const lhClass = act.class || lh.class_name || '';  const lhSubject = act.subject || lh.subject_name || '';  return (String(lh.tanggal).startsWith(filterDateStr) || String(lh.date).startsWith(filterDateStr)) && String(lhClass).toLowerCase() === String(s.class_name).toLowerCase() && String(lhSubject).toLowerCase() === String(s.subject_name).toLowerCase() && String(lh.user_id) === String(u.id);});";
  const target2 = "                const match = laporanHarian.find((lh: any) => {\n                  let act = {};\n                  try { act = typeof lh.activity === 'string' && lh.activity.startsWith('{') ? JSON.parse(lh.activity) : {}; } catch(e) {}\n                  const lhClass = act.class || lh.class_name || '';\n                  const lhSubject = act.subject || lh.subject_name || '';\n                  return (String(lh.tanggal).startsWith(filterDateStr) || String(lh.date).startsWith(filterDateStr)) &&\n                  String(lhClass).toLowerCase() === String(s.class_name).toLowerCase() &&\n                  String(lhSubject).toLowerCase() === String(s.subject_name).toLowerCase() &&\n                  String(lh.user_id) === String(u.id);\n                });";

  const replace = `const match = laporanHarian.find((lh: any) => {
                  let act: any = {};
                  try { act = typeof lh.activity === 'string' && lh.activity.startsWith('{') ? JSON.parse(lh.activity) : {}; } catch (e) {}
                  const lhClass = act.class || lh.class_name || '';
                  const lhSubject = act.subject || lh.subject_name || '';
                  const lhDate = lh.date || lh.tanggal || (lh.created_at ? String(lh.created_at).split('T')[0].split(' ')[0] : '');
                  return String(lhDate).startsWith(filterDateStr) && 
                         String(lhClass).trim().toLowerCase() === String(s.class_name).trim().toLowerCase() && 
                         String(lhSubject).trim().toLowerCase() === String(s.subject_name).trim().toLowerCase() && 
                         String(lh.user_id) === String(u.id);
                });`;

  // Replace anywhere we find variations
  code = code.split(target1).join(replace);
  code = code.split(target2).join(replace);

  fs.writeFileSync(filename, code);
  console.log("Patched " + filename);
}

patchFile('src/components/KamadWeeklyRecapModal.tsx');
patchFile('src/pages/KamadPages.tsx');

