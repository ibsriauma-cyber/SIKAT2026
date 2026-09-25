const fs = require('fs');
let code = fs.readFileSync('src/pages/KamadPages.tsx', 'utf8');

const todayStr = "new Date().toISOString().split('T')[0]";

code = code.replace(
  "{reportPeriod === 'Harian' ? 'Daftar Kinerja Staf Hari Ini' : 'Rapor Kinerja Pekan Ini'}",
  "kinerjaStartDate === " + todayStr + " ? 'Daftar Kinerja Staf Hari Ini' : `Daftar Kinerja Staf Tanggal ${new Date(kinerjaStartDate).toLocaleDateString('id-ID')}`"
);

code = code.replace(
  "{reportPeriod === 'Harian' ? <>",
  "{(true) ? <>"
);

fs.writeFileSync('src/pages/KamadPages.tsx', code);
console.log('Fixed Report Period Text');
