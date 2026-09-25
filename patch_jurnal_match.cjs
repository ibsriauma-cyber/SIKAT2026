const fs = require('fs');

let code = fs.readFileSync('src/components/KamadWeeklyRecapModal.tsx', 'utf-8');

const targetJurnal = "const match = laporanHarian.find((lh: any) => (String(lh.tanggal).startsWith(filterDateStr) || String(lh.date).startsWith(filterDateStr)) && lh.class_name === s.class_name && lh.subject_name === s.subject_name);";
const replaceJurnal = "const match = laporanHarian.find((lh: any) => (String(lh.tanggal).startsWith(filterDateStr) || String(lh.date).startsWith(filterDateStr)) && String(lh.class_name).toLowerCase() === String(s.class_name).toLowerCase() && String(lh.subject_name).toLowerCase() === String(s.subject_name).toLowerCase() && String(lh.user_id) === String(u.id));";

code = code.replace(new RegExp(targetJurnal.replace(/[.*+?^$\/{}()|[\]\\]/g, '\\$&'), 'g'), replaceJurnal);

fs.writeFileSync('src/components/KamadWeeklyRecapModal.tsx', code);
console.log("Patched Jurnal Match");
