const fs = require('fs');
let code = fs.readFileSync('src/pages/KamadPages.tsx', 'utf-8');

// For Jurnal
const targetJurnal = "                const match = laporanHarian.find((lh: any) =>\n                  (String(lh.tanggal).startsWith(filterDateStr) || String(lh.date).startsWith(filterDateStr)) &&\n                  lh.class_name === s.class_name &&\n                  lh.subject_name === s.subject_name\n                );";
const replaceJurnal = "                const match = laporanHarian.find((lh: any) =>\n                  (String(lh.tanggal).startsWith(filterDateStr) || String(lh.date).startsWith(filterDateStr)) &&\n                  String(lh.class_name).toLowerCase() === String(s.class_name).toLowerCase() &&\n                  String(lh.subject_name).toLowerCase() === String(s.subject_name).toLowerCase() &&\n                  String(lh.user_id) === String(u.id)\n                );";
code = code.replace(new RegExp(targetJurnal.replace(/[.*+?^$\/{}()|[\]\\]/g, '\\$&'), 'g'), replaceJurnal);

// For Materi
const targetMA = "                const match = materiAjar.find((ma: any) =>\n                  ma.class_name === s.class_name &&\n                  (ma.subject === s.subject_name || ma.subject_name === s.subject_name) &&\n                  (String(ma.user_id) === String(u.id) || !ma.user_id)\n                );";
const replaceMA = "                const match = materiAjar.find((ma: any) =>\n                  String(ma.class_name).toLowerCase() === String(s.class_name).toLowerCase() &&\n                  (String(ma.subject).toLowerCase() === String(s.subject_name).toLowerCase() || String(ma.subject_name).toLowerCase() === String(s.subject_name).toLowerCase()) &&\n                  String(ma.user_id) === String(u.id)\n                );";
code = code.replace(new RegExp(targetMA.replace(/[.*+?^$\/{}()|[\]\\]/g, '\\$&'), 'g'), replaceMA);

// For Absen Siswa Mapel
const targetSA = "                const match = studentAttendance.find((sa: any) =>\n                  String(sa.date).startsWith(filterDateStr) &&\n                  sa.class_name === s.class_name &&\n                  sa.subject_name === s.subject_name\n                );";
const replaceSA = "                const match = studentAttendance.find((sa: any) =>\n                  String(sa.date).startsWith(filterDateStr) &&\n                  String(sa.class_name).toLowerCase() === String(s.class_name).toLowerCase() &&\n                  String(sa.subject_name).toLowerCase() === String(s.subject_name).toLowerCase() &&\n                  String(sa.user_id) === String(u.id)\n                );";
code = code.replace(new RegExp(targetSA.replace(/[.*+?^$\/{}()|[\]\\]/g, '\\$&'), 'g'), replaceSA);

fs.writeFileSync('src/pages/KamadPages.tsx', code);
console.log("Patched KamadPages.tsx matches");
