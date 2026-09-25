const fs = require('fs');
let code = fs.readFileSync('src/pages/KamadPages.tsx', 'utf8');

code = code.replace(
  "kinerjaStartDate === new Date().toISOString().split('T')[0] ? 'Daftar Kinerja Staf Hari Ini' : `Daftar Kinerja Staf Tanggal ${new Date(kinerjaStartDate).toLocaleDateString('id-ID')}`",
  "{kinerjaStartDate === new Date().toISOString().split('T')[0] ? 'Daftar Kinerja Staf Hari Ini' : `Daftar Kinerja Staf Tanggal ${new Date(kinerjaStartDate).toLocaleDateString('id-ID')}`}"
);

fs.writeFileSync('src/pages/KamadPages.tsx', code);
console.log('Fixed JSX');
