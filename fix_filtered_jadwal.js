import fs from 'fs';
let code = fs.readFileSync('src/pages/GuruPages.tsx', 'utf8');

const target = "  const filteredJadwal = filterHari === 'Semua Hari' ? jadwal : jadwal.filter(j => j.hari === filterHari);";
code = code.replace(target, "");

fs.writeFileSync('src/pages/GuruPages.tsx', code);
console.log("Success");
