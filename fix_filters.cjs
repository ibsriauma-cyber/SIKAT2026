const fs = require('fs');
let content = fs.readFileSync('src/pages/GuruPages.tsx', 'utf8');

const searchPemantauan = `    } else if (reportType === 'pemantauan_pagi') {
      let filtered = pemantauanPagi;
      if (filterSemester) filtered = filtered.filter(p => !p.semester || norm(p.semester) === norm(filterSemester));
      if (selectedClass) filtered = filtered.filter(p => norm(p.class_name) === norm(selectedClass));
      if (selectedMonth !== 'Semua Bulan' && monthNum) {`;

const replacePemantauan = `    } else if (reportType === 'pemantauan_pagi') {
      let filtered = pemantauanPagi;
      if (filterSemester) filtered = filtered.filter(p => !p.semester || norm(p.semester) === norm(filterSemester));
      if (selectedClass) {
        filtered = filtered.filter(p => {
          const student = studentsList.find(s => String(s.id) === String(p.student_id));
          const sClass = student?.className || student?.class_name || p.class_name;
          return norm(sClass) === norm(selectedClass);
        });
      }
      if (selectedMonth !== 'Semua Bulan' && monthNum) {`;

const searchNilaiSikap = `    } else if (reportType === 'nilai_sikap') {
      let filtered = nilaiSikap;
      if (filterSemester) filtered = filtered.filter(p => !p.semester || norm(p.semester) === norm(filterSemester));
      if (selectedClass) filtered = filtered.filter(p => norm(p.class_name) === norm(selectedClass));
      if (selectedMonth !== 'Semua Bulan' && monthNum) {`;

const replaceNilaiSikap = `    } else if (reportType === 'nilai_sikap') {
      let filtered = nilaiSikap;
      if (filterSemester) filtered = filtered.filter(p => !p.semester || norm(p.semester) === norm(filterSemester));
      if (selectedClass) {
        filtered = filtered.filter(p => {
          const student = studentsList.find(s => String(s.id) === String(p.student_id));
          const sClass = student?.className || student?.class_name || p.class_name;
          return norm(sClass) === norm(selectedClass);
        });
      }
      if (selectedMonth !== 'Semua Bulan' && monthNum) {`;

if (content.includes(searchPemantauan)) {
  content = content.replace(searchPemantauan, replacePemantauan);
  content = content.replace(searchNilaiSikap, replaceNilaiSikap);
  fs.writeFileSync('src/pages/GuruPages.tsx', content);
  console.log("Fixed filters");
} else {
  console.log("Could not find the target code to replace.");
}
