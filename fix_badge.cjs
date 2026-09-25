const fs = require('fs');
let code = fs.readFileSync('src/pages/InputJadwal.tsx', 'utf8');

code = code.replace(
  "{allowedTeachers.length === 0 && mapel ? <span className=\"text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full\">Belum Diplotting</span> : <span className=\"text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full\">Sesuai Plotting</span>}",
  "{mapel && rombel && (allowedTeachers.length === 0 ? <span className=\"text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full\">Belum Diplotting</span> : <span className=\"text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full\">Sesuai Plotting</span>)}"
);

fs.writeFileSync('src/pages/InputJadwal.tsx', code);
console.log('Fixed Badge UI');
