const fs = require('fs');
let code = fs.readFileSync('src/components/KamadWeeklyRecapModal.tsx', 'utf-8');

const targetSA = "const match = studentAttendance.find((sa: any) => String(sa.date).startsWith(filterDateStr) && sa.class_name === s.class_name && sa.subject_name === s.subject_name);";
const replaceSA = "const match = studentAttendance.find((sa: any) => String(sa.date).startsWith(filterDateStr) && String(sa.class_name).toLowerCase() === String(s.class_name).toLowerCase() && String(sa.subject_name).toLowerCase() === String(s.subject_name).toLowerCase() && String(sa.user_id) === String(u.id));";
code = code.replace(new RegExp(targetSA.replace(/[.*+?^$\/{}()|[\]\\]/g, '\\$&'), 'g'), replaceSA);

const targetMA = "const match = materiAjar.find((ma: any) => ma.class_name === s.class_name && (ma.subject === s.subject_name || ma.subject_name === s.subject_name) && (String(ma.user_id) === String(u.id) || !ma.user_id));";
const replaceMA = "const match = materiAjar.find((ma: any) => String(ma.class_name).toLowerCase() === String(s.class_name).toLowerCase() && (String(ma.subject).toLowerCase() === String(s.subject_name).toLowerCase() || String(ma.subject_name).toLowerCase() === String(s.subject_name).toLowerCase()) && String(ma.user_id) === String(u.id));";
code = code.replace(new RegExp(targetMA.replace(/[.*+?^$\/{}()|[\]\\]/g, '\\$&'), 'g'), replaceMA);

fs.writeFileSync('src/components/KamadWeeklyRecapModal.tsx', code);
console.log("Patched Others");
