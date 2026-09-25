const fs = require('fs');

function patchFile(filename) {
  let code = fs.readFileSync(filename, 'utf-8');

  // Replace materiAjar match for Modal
  const regex = /const match = materiAjar\.find\(\(ma: any\) => String\(ma\.class_name\)\.toLowerCase\(\) === String\(s\.class_name\)\.toLowerCase\(\) && \(String\(ma\.subject\)\.toLowerCase\(\) === String\(s\.subject_name\)\.toLowerCase\(\) \|\| String\(ma\.subject_name\)\.toLowerCase\(\) === String\(s\.subject_name\)\.toLowerCase\(\)\) && String\(ma\.user_id\) === String\(u\.id\)\);/gs;

  const replace = `const match = materiAjar.find((ma: any) => {
                    const maDate = ma.date || (ma.created_at ? String(ma.created_at).split('T')[0].split(' ')[0] : '');
                    return String(maDate).startsWith(filterDateStr) &&
                           String(ma.class_name).trim().toLowerCase() === String(s.class_name).trim().toLowerCase() && 
                           (String(ma.subject).trim().toLowerCase() === String(s.subject_name).trim().toLowerCase() || String(ma.subject_name).trim().toLowerCase() === String(s.subject_name).trim().toLowerCase()) && 
                           String(ma.user_id) === String(u.id);
                  });`;

  code = code.replace(regex, replace);

  // Note: in KamadPages, the match might be multi-line
  const regexKamad = /const match = materiAjar\.find\(\(ma: any\) =>\s*String\(ma\.class_name\)\.toLowerCase\(\) === String\(s\.class_name\)\.toLowerCase\(\) &&\s*\(String\(ma\.subject\)\.toLowerCase\(\) === String\(s\.subject_name\)\.toLowerCase\(\) \|\| String\(ma\.subject_name\)\.toLowerCase\(\) === String\(s\.subject_name\)\.toLowerCase\(\)\) &&\s*String\(ma\.user_id\) === String\(u\.id\)\s*\);/gs;

  code = code.replace(regexKamad, replace);

  fs.writeFileSync(filename, code);
  console.log("Patched " + filename);
}

patchFile('src/components/KamadWeeklyRecapModal.tsx');
patchFile('src/pages/KamadPages.tsx');

