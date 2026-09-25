const fs = require('fs');
let code = fs.readFileSync('src/components/KamadWeeklyRecapModal.tsx', 'utf-8');

code = code.replace(/<th colSpan={3} className="border border-slate-800 p-2 font-bold">Absensi Pagi<\/th>/, '<th colSpan={2} className="border border-slate-800 p-2 font-bold">Absensi Pagi</th>');
code = code.replace(/<th colSpan={3} className="border border-slate-800 p-2 font-bold">Sikap<\/th>/, '<th colSpan={2} className="border border-slate-800 p-2 font-bold">Sikap</th>');
code = code.replace(/<th colSpan={3} className="border border-slate-800 p-2 font-bold">Pemantauan Pagi<\/th>/, '<th colSpan={2} className="border border-slate-800 p-2 font-bold">Pemantauan Pagi</th>');
code = code.replace(/<th colSpan={3} className="border border-slate-800 p-2 font-bold">Sholat Zuhur Siswa<\/th>/, '<th colSpan={2} className="border border-slate-800 p-2 font-bold">Sholat Zuhur Siswa</th>');

// I also need to make sure I fix any other occurrences of colSpan 3
code = code.replace(/colSpan=\{3\}/g, 'colSpan={2}');

fs.writeFileSync('src/components/KamadWeeklyRecapModal.tsx', code);
console.log("Patched colSpans");
