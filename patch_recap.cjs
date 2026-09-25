const fs = require('fs');

let code = fs.readFileSync('src/components/KamadWeeklyRecapModal.tsx', 'utf-8');

// 1. In addSingleTask, treat 'selesai_telat' as 'terlewat'
const targetStatus = `              if (status === 'selesai') {
                 // @ts-ignore
                 stats[category].mengisi++;
              } else if (status === 'selesai_telat') {
                 // @ts-ignore
                 stats[category].telat++;
              } else if (status === 'terlewat') {
                 // @ts-ignore
                 stats[category].tidak++;
              }`;

const replaceStatus = `              if (status === 'selesai') {
                 // @ts-ignore
                 stats[category].mengisi++;
              } else if (status === 'selesai_telat' || status === 'terlewat') {
                 // @ts-ignore
                 stats[category].tidak++;
              }`;

code = code.replace(targetStatus, replaceStatus);

// 2. Remove all table headers for "Telat Mengisi"
code = code.replace(/<th className="border border-slate-800 p-1 bg-slate-50 font-bold w-20">Telat Mengisi<\/th>/g, "");

// 3. Update colSpan in table headers
// For walas
code = code.replace(/<th colSpan={3} className="border border-slate-800 p-2 font-bold">Absen Pagi<\/th>/, '<th colSpan={2} className="border border-slate-800 p-2 font-bold">Absen Pagi</th>');
code = code.replace(/<th colSpan={3} className="border border-slate-800 p-2 font-bold">Nilai Sikap<\/th>/, '<th colSpan={2} className="border border-slate-800 p-2 font-bold">Nilai Sikap</th>');
code = code.replace(/<th colSpan={3} className="border border-slate-800 p-2 font-bold">Pemantauan<\/th>/, '<th colSpan={2} className="border border-slate-800 p-2 font-bold">Pemantauan</th>');
code = code.replace(/<th colSpan={3} className="border border-slate-800 p-2 font-bold">Absen Zuhur Siswa<\/th>/, '<th colSpan={2} className="border border-slate-800 p-2 font-bold">Absen Zuhur Siswa</th>');

// For guru_mapel
code = code.replace(/<th colSpan={3} className="border border-slate-800 p-2 font-bold">Absen KBM<\/th>/g, '<th colSpan={2} className="border border-slate-800 p-2 font-bold">Absen KBM</th>');
code = code.replace(/<th colSpan={3} className="border border-slate-800 p-2 font-bold">Jurnal<\/th>/g, '<th colSpan={2} className="border border-slate-800 p-2 font-bold">Jurnal</th>');
code = code.replace(/<th colSpan={3} className="border border-slate-800 p-2 font-bold">Perangkat<\/th>/g, '<th colSpan={2} className="border border-slate-800 p-2 font-bold">Perangkat</th>');

// For guru_quran
code = code.replace(/<th colSpan={3} className="border border-slate-800 p-2 font-bold">Absen Dhuha Siswa<\/th>/, '<th colSpan={2} className="border border-slate-800 p-2 font-bold">Absen Dhuha Siswa</th>');

// 4. Remove UI table data for telat
code = code.replace(/<td className="border border-slate-800 p-2 text-amber-600 font-bold">\{s\.stats\..*?\.telat \|\| ''\}<\/td>\n?/g, "");

// 5. Also need to update PDF & Excel export logic
// PDF:
code = code.replace(/colSpan: 3/g, 'colSpan: 2');
code = code.replace(/colSpan: 12/g, 'colSpan: 8');
code = code.replace(/colSpan: 9/g, 'colSpan: 6');

// Header Arrays
code = code.replace(/'Telat Mengisi',\s*/g, "");
code = code.replace(/{ content: 'Mengisi' }, { content: 'Tidak Mengisi' }/g, "{ content: 'Mengisi' }, { content: 'Tidak Mengisi' }"); // Already ok if telat is removed. Wait, what does the code look like?

fs.writeFileSync('src/components/KamadWeeklyRecapModal.tsx', code);
console.log("Patched 1");
