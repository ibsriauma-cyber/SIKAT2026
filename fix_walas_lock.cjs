const fs = require('fs');
let content = fs.readFileSync('src/pages/GuruPages.tsx', 'utf8');

const searchClasses = `  // Available classes based on teacher's schedules, assignments, walas, or all classes
  const availableClasses = Array.from(new Set([
    ...(walasClass ? [walasClass] : []),
    ...scheduledClasses,
    ...subjectClasses
  ])).filter(Boolean).sort() as string[];`;

const replaceClasses = `  // Available classes based on teacher's schedules, assignments, walas, or all classes
  let availableClasses = Array.from(new Set([
    ...(walasClass ? [walasClass] : []),
    ...scheduledClasses,
    ...subjectClasses
  ])).filter(Boolean).sort() as string[];

  if (isStrictlyWalas && walasClass) {
    availableClasses = [walasClass];
  }`;

const searchMapel = `  let availableMapel = [
    'Semua Mata Pelajaran',
    ...(isWalas ? ['Presensi Wali Kelas'] : []),
    ...classSubjectsList
  ];
  availableMapel = Array.from(new Set(availableMapel));`;

const replaceMapel = `  let availableMapel = [
    'Semua Mata Pelajaran',
    ...(isWalas ? ['Presensi Wali Kelas'] : []),
    ...classSubjectsList
  ];
  availableMapel = Array.from(new Set(availableMapel));

  if (isStrictlyWalas) {
    availableMapel = ['Presensi Wali Kelas'];
  }`;

if (content.includes("const availableClasses = Array.from(")) {
  content = content.replace(searchClasses, replaceClasses);
  content = content.replace(searchMapel, replaceMapel);
  fs.writeFileSync('src/pages/GuruPages.tsx', content);
  console.log("Success locking walas");
} else {
  console.log("Could not find targets");
}
