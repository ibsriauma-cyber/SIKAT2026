const fs = require('fs');
let content = fs.readFileSync('src/pages/GuruPages.tsx', 'utf8');

content = content.replace(
  `  const isWalas = user?.role === 'walas' || user?.roles?.includes('walas');
  const isGuru = user?.role === 'guru' || user?.roles?.includes('guru');
  const isStrictlyWalas = isWalas && !isGuru;`,
  `  const isWalas = user?.role === 'walas' || user?.roles?.includes('walas');`
);

content = content.replace(
  `  const isWalas = user?.role === 'walas' || user?.roles?.includes('walas');
  const isGuruQuran = user?.role === 'guru_quran';
  const dbWalasClass = dbClasses.find((c: any) => String(c.wali_kelas_id) === String(user?.id))?.name;
  const walasClass = dbWalasClass || user?.className || user?.class_name;`,
  `  const isWalas = user?.role === 'walas' || user?.roles?.includes('walas');
  const isGuru = user?.role === 'guru' || user?.roles?.includes('guru');
  const isStrictlyWalas = isWalas && !isGuru;
  const isGuruQuran = user?.role === 'guru_quran';
  const dbWalasClass = dbClasses.find((c: any) => String(c.wali_kelas_id) === String(user?.id))?.name;
  const walasClass = dbWalasClass || user?.className || user?.class_name;`
);

// also fix dbClasses missing error at line 65 ? Wait, dbClasses was used at line 65?
// Let's check where dbClasses is used in my first error
// src/pages/GuruPages.tsx(65,24): error TS2304: Cannot find name 'dbClasses'.
