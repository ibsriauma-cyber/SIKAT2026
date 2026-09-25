const fs = require('fs');
let code = fs.readFileSync('src/pages/KamadPages.tsx', 'utf8');

// 1. Fetch teaching_assignments
code = code.replace(
  "apiClient('/crud.php?table=schedules').catch(() => [])]);",
  "apiClient('/crud.php?table=schedules').catch(() => []), apiClient('/crud.php?table=teaching_assignments').catch(() => [])]);"
);
code = code.replace(
  "const [users, kinerja, schedules] = await Promise.all",
  "const [users, kinerja, schedules, assignments] = await Promise.all"
);

// 2. We use assignments to filter `mySchedules` for the specific role
code = code.replace(
  /if \(r\.includes\('guru'\) \|\| r\.includes\('guru_mapel'\)\) \{\n\s*const mySchedules = todaySchedules\.filter\(\(s: any\) => String\(s\.teacher_id\) === String\(u\.id\)\);/g,
  `if (r.includes('guru') || r.includes('guru_mapel')) {
             const mySchedules = todaySchedules.filter((s: any) => {
               if (String(s.teacher_id) !== String(u.id)) return false;
               const assign = Array.isArray(assignments) ? assignments.find((a: any) => String(a.teacher_id) === String(u.id) && a.subject_name === s.subject_name && a.class_name === s.class_name) : null;
               const role = assign?.role || 'guru_mapel';
               return role === 'guru_mapel' || role === 'guru';
             });`
);

code = code.replace(
  /if \(r\.includes\('guru_quran'\)\) \{\n\s*const mySchedules = todaySchedules\.filter\(\(s: any\) => String\(s\.teacher_id\) === String\(u\.id\)\);/g,
  `if (r.includes('guru_quran')) {
             const mySchedules = todaySchedules.filter((s: any) => {
               if (String(s.teacher_id) !== String(u.id)) return false;
               const assign = Array.isArray(assignments) ? assignments.find((a: any) => String(a.teacher_id) === String(u.id) && a.subject_name === s.subject_name && a.class_name === s.class_name) : null;
               return assign?.role === 'guru_quran';
             });`
);

fs.writeFileSync('src/pages/KamadPages.tsx', code);
console.log('Fixed KamadPages.tsx');
