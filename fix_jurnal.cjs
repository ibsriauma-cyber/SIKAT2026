const fs = require('fs');

function patchFile(filename) {
  let code = fs.readFileSync(filename, 'utf-8');

  // Replace Jurnal Ajar match
  const pattern = /const match = laporanHarian\.find\(\(lh: any\) => \{[\s\S]*?return \([^)]+\) && String\(lhClass\)\.toLowerCase\(\) === String\(s\.class_name\)\.toLowerCase\(\) && String\(lhSubject\)\.toLowerCase\(\) === String\(s\.subject_name\)\.toLowerCase\(\) && String\(lh\.user_id\) === String\(u\.id\);\n\s*\}\);/g;

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

  code = code.replace(pattern, replace);
  
  // Replace studentAttendance match
  const saPattern = /const match = studentAttendance\.find\(\(sa: any\) => String\(sa\.date\)\.startsWith\(filterDateStr\) && String\(sa\.class_name\)\.toLowerCase\(\) === String\(s\.class_name\)\.toLowerCase\(\) && String\(sa\.subject_name\)\.toLowerCase\(\) === String\(s\.subject_name\)\.toLowerCase\(\) && String\(sa\.user_id\) === String\(u\.id\)\);/g;
  const saReplace = `const match = studentAttendance.find((sa: any) => String(sa.date).startsWith(filterDateStr) && String(sa.class_name).trim().toLowerCase() === String(s.class_name).trim().toLowerCase() && String(sa.subject_name).trim().toLowerCase() === String(s.subject_name).trim().toLowerCase() && String(sa.user_id) === String(u.id));`;
  code = code.replace(saPattern, saReplace);

  fs.writeFileSync(filename, code);
  console.log("Patched " + filename);
}

patchFile('src/components/KamadWeeklyRecapModal.tsx');
patchFile('src/pages/KamadPages.tsx');

