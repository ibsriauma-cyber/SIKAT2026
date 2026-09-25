const fs = require('fs');
let content = fs.readFileSync('src/pages/GuruPages.tsx', 'utf8');

const search = `  const isWalas = user?.role === 'walas' || user?.roles?.includes('walas');
  const isGuruQuran = user?.role === 'guru_quran';
  const isWalas = user?.role === 'walas' || user?.roles?.includes('walas');
  const isGuru = user?.role === 'guru' || user?.roles?.includes('guru');
  const isStrictlyWalas = isWalas && !isGuru;
  const walasClass = dbWalasClass || user?.className || user?.class_name;`;

const replace = `  const isWalas = user?.role === 'walas' || user?.roles?.includes('walas');
  const isGuru = user?.role === 'guru' || user?.roles?.includes('guru');
  const isStrictlyWalas = isWalas && !isGuru;
  const isGuruQuran = user?.role === 'guru_quran';
  const dbWalasClass = dbClasses.find((c: any) => String(c.wali_kelas_id) === String(user?.id))?.name;
  const walasClass = dbWalasClass || user?.className || user?.class_name;`;

content = content.replace(search, replace);
fs.writeFileSync('src/pages/GuruPages.tsx', content);
