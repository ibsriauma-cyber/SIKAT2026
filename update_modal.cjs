const fs = require('fs');
let code = fs.readFileSync('src/components/KamadWeeklyRecapModal.tsx', 'utf-8');

// 1. Rename Sikap -> Nilai Sikap
code = code.replace(/{ content: 'Sikap',/g, "{ content: 'Nilai Sikap',");
code = code.replace(/<th colSpan={2} className="border border-slate-800 p-2 font-bold">Sikap<\/th>/g, '<th colSpan={2} className="border border-slate-800 p-2 font-bold">Nilai Sikap</th>');
code = code.replace(/'Sikap \(Mengisi\)':/g, "'Nilai Sikap (Mengisi)':");
code = code.replace(/'Sikap \(Tidak\)':/g, "'Nilai Sikap (Tidak)':");

// 2. Remove Absen Zuhur Siswa for Guru Mapel
// PDF:
code = code.replace(
  /{ content: 'Absen Zuhur Siswa', colSpan: 2, styles: { halign: 'center' } }\n\s*\],\n\s*\['Mengisi', 'Tidak Mengisi', 'Mengisi', 'Tidak Mengisi', 'Mengisi', 'Tidak Mengisi', 'Mengisi', 'Tidak Mengisi'\]/g,
  "\\n        ],\n        ['Mengisi', 'Tidak Mengisi', 'Mengisi', 'Tidak Mengisi', 'Mengisi', 'Tidak Mengisi']"
);

// body pdf mapel:
code = code.replace(
  /s\.stats\.guru_perangkat\.mengisi \|\| '', s\.stats\.guru_perangkat\.tidak \|\| '',\n\s*'', '' \/\/ Guru Mapel doesn't have Zuhur task mapped/g,
  "s.stats.guru_perangkat.mengisi || '', s.stats.guru_perangkat.tidak || ''"
);

// Excel Mapel:
code = code.replace(
  /'Perangkat \(Tidak\)': s\.stats\.guru_perangkat\.tidak \|\| '',\n\s*'Absen Zuhur Siswa \(Mengisi\)': '',\n\s*'Absen Zuhur Siswa \(Tidak\)': ''/g,
  "'Perangkat (Tidak)': s.stats.guru_perangkat.tidak || ''"
);

// HTML Table Head Mapel:
code = code.replace(
  /<th colSpan={2} className="border border-slate-800 p-2 font-bold">Absen Zuhur Siswa<\/th>\n\s*<\/tr>\n\s*<tr>\n\s*<th className="border border-slate-800 p-1 bg-slate-50 font-bold w-16">Mengisi<\/th>\n\s*<th className="border border-slate-800 p-1 bg-slate-50 font-bold w-20">Tidak Mengisi<\/th>\n\s*<th className="border border-slate-800 p-1 bg-slate-50 font-bold w-16">Mengisi<\/th>\n\s*<th className="border border-slate-800 p-1 bg-slate-50 font-bold w-20">Tidak Mengisi<\/th>\n\s*<th className="border border-slate-800 p-1 bg-slate-50 font-bold w-16">Mengisi<\/th>\n\s*<th className="border border-slate-800 p-1 bg-slate-50 font-bold w-20">Tidak Mengisi<\/th>\n\s*<th className="border border-slate-800 p-1 bg-slate-50 font-bold w-16">Mengisi<\/th>\n\s*<th className="border border-slate-800 p-1 bg-slate-50 font-bold w-20">Tidak Mengisi<\/th>/,
  `</tr>
                        <tr>
                          <th className="border border-slate-800 p-1 bg-slate-50 font-bold w-16">Mengisi</th>
                          <th className="border border-slate-800 p-1 bg-slate-50 font-bold w-20">Tidak Mengisi</th>
                          <th className="border border-slate-800 p-1 bg-slate-50 font-bold w-16">Mengisi</th>
                          <th className="border border-slate-800 p-1 bg-slate-50 font-bold w-20">Tidak Mengisi</th>
                          <th className="border border-slate-800 p-1 bg-slate-50 font-bold w-16">Mengisi</th>
                          <th className="border border-slate-800 p-1 bg-slate-50 font-bold w-20">Tidak Mengisi</th>`
);

// HTML Table Body Mapel:
code = code.replace(
  /<td className="border border-slate-800 p-2">{s\.stats\.guru_perangkat\.tidak \|\| ''}<\/td>\n\s*<td className="border border-slate-800 p-2"><\/td>\n\s*<td className="border border-slate-800 p-2"><\/td>/,
  `<td className="border border-slate-800 p-2">{s.stats.guru_perangkat.tidak || ''}</td>`
);

fs.writeFileSync('src/components/KamadWeeklyRecapModal.tsx', code);
