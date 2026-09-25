const fs = require('fs');

function patchFile(filename) {
  let code = fs.readFileSync(filename, 'utf-8');

  // Replace Jurnal Ajar match using a more robust regex
  const regex = /const match = laporanHarian\.find\(\(lh: any\) => \{.*?return \(String\(lh\.tanggal\)\.startsWith\(filterDateStr\) \|\| String\(lh\.date\)\.startsWith\(filterDateStr\)\).*?\}\);/gs;

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

  code = code.replace(regex, replace);

  fs.writeFileSync(filename, code);
  console.log("Patched " + filename);
}

patchFile('src/components/KamadWeeklyRecapModal.tsx');
patchFile('src/pages/KamadPages.tsx');

