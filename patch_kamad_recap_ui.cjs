const fs = require('fs');
let code = fs.readFileSync('src/components/KamadWeeklyRecapModal.tsx', 'utf-8');

// Helper to replace colSpan=2 with 3
code = code.replace(/colSpan=\{2\}/g, "colSpan={3}");

// Replace table sub-headers for walas
code = code.replace(/<th className="border border-slate-800 p-1 bg-slate-50 font-bold w-16">Mengisi<\/th>\s*<th className="border border-slate-800 p-1 bg-slate-50 font-bold w-20">Tidak Mengisi<\/th>/g, 
`<th className="border border-slate-800 p-1 bg-slate-50 font-bold w-16">Mengisi</th>
                          <th className="border border-slate-800 p-1 bg-slate-50 font-bold w-20">Telat Mengisi</th>
                          <th className="border border-slate-800 p-1 bg-slate-50 font-bold w-20">Tidak Mengisi</th>`);

// Replace table bodies for walas
code = code.replace(/<td className="border border-slate-800 p-2">\{s\.stats\.walas_absenPagi\.mengisi \|\| ''\}<\/td>\s*<td className="border border-slate-800 p-2">\{s\.stats\.walas_absenPagi\.tidak \|\| ''\}<\/td>/,
`<td className="border border-slate-800 p-2 text-emerald-600 font-bold">{s.stats.walas_absenPagi.mengisi || ''}</td>
                            <td className="border border-slate-800 p-2 text-amber-600 font-bold">{s.stats.walas_absenPagi.telat || ''}</td>
                            <td className="border border-slate-800 p-2 text-rose-600 font-bold">{s.stats.walas_absenPagi.tidak || ''}</td>`);
code = code.replace(/<td className="border border-slate-800 p-2">\{s\.stats\.walas_sikap\.mengisi \|\| ''\}<\/td>\s*<td className="border border-slate-800 p-2">\{s\.stats\.walas_sikap\.tidak \|\| ''\}<\/td>/,
`<td className="border border-slate-800 p-2 text-emerald-600 font-bold">{s.stats.walas_sikap.mengisi || ''}</td>
                            <td className="border border-slate-800 p-2 text-amber-600 font-bold">{s.stats.walas_sikap.telat || ''}</td>
                            <td className="border border-slate-800 p-2 text-rose-600 font-bold">{s.stats.walas_sikap.tidak || ''}</td>`);
code = code.replace(/<td className="border border-slate-800 p-2">\{s\.stats\.walas_pemantauan\.mengisi \|\| ''\}<\/td>\s*<td className="border border-slate-800 p-2">\{s\.stats\.walas_pemantauan\.tidak \|\| ''\}<\/td>/,
`<td className="border border-slate-800 p-2 text-emerald-600 font-bold">{s.stats.walas_pemantauan.mengisi || ''}</td>
                            <td className="border border-slate-800 p-2 text-amber-600 font-bold">{s.stats.walas_pemantauan.telat || ''}</td>
                            <td className="border border-slate-800 p-2 text-rose-600 font-bold">{s.stats.walas_pemantauan.tidak || ''}</td>`);
code = code.replace(/<td className="border border-slate-800 p-2">\{s\.stats\.walas_zuhur\.mengisi \|\| ''\}<\/td>\s*<td className="border border-slate-800 p-2">\{s\.stats\.walas_zuhur\.tidak \|\| ''\}<\/td>/,
`<td className="border border-slate-800 p-2 text-emerald-600 font-bold">{s.stats.walas_zuhur.mengisi || ''}</td>
                            <td className="border border-slate-800 p-2 text-amber-600 font-bold">{s.stats.walas_zuhur.telat || ''}</td>
                            <td className="border border-slate-800 p-2 text-rose-600 font-bold">{s.stats.walas_zuhur.tidak || ''}</td>`);

// Mapel & Quran bodies
const statsKeys = [
  'guru_absenKBM',
  'guru_jurnal',
  'guru_perangkat',
  'guru_ibadah'
];

statsKeys.forEach(k => {
  const regex = new RegExp(`<td className="border border-slate-800 p-2">\\{s\\.stats\\.${k}\\.mengisi \\|\\| ''\\}<\\/td>\\s*<td className="border border-slate-800 p-2">\\{s\\.stats\\.${k}\\.tidak \\|\\| ''\\}<\\/td>`, 'g');
  code = code.replace(regex,
`<td className="border border-slate-800 p-2 text-emerald-600 font-bold">{s.stats.${k}.mengisi || ''}</td>
                            <td className="border border-slate-800 p-2 text-amber-600 font-bold">{s.stats.${k}.telat || ''}</td>
                            <td className="border border-slate-800 p-2 text-rose-600 font-bold">{s.stats.${k}.tidak || ''}</td>`);
});

fs.writeFileSync('src/components/KamadWeeklyRecapModal.tsx', code);
