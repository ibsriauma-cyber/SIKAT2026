const fs = require('fs');
let code = fs.readFileSync('src/components/KamadWeeklyRecapModal.tsx', 'utf-8');

// For HTML Table Head Mapel
const targetHead = `<th colSpan={2} className="border border-slate-800 p-2 font-bold">Absen Zuhur Siswa</th>
                        </tr>
                        <tr>
                          <th className="border border-slate-800 p-1 bg-slate-50 font-bold w-16">Mengisi</th>
                          <th className="border border-slate-800 p-1 bg-slate-50 font-bold w-20">Tidak Mengisi</th>
                          <th className="border border-slate-800 p-1 bg-slate-50 font-bold w-16">Mengisi</th>
                          <th className="border border-slate-800 p-1 bg-slate-50 font-bold w-20">Tidak Mengisi</th>
                          <th className="border border-slate-800 p-1 bg-slate-50 font-bold w-16">Mengisi</th>
                          <th className="border border-slate-800 p-1 bg-slate-50 font-bold w-20">Tidak Mengisi</th>
                          <th className="border border-slate-800 p-1 bg-slate-50 font-bold w-16">Mengisi</th>
                          <th className="border border-slate-800 p-1 bg-slate-50 font-bold w-20">Tidak Mengisi</th>
                        </tr>`;
                        
const replaceHead = `</tr>
                        <tr>
                          <th className="border border-slate-800 p-1 bg-slate-50 font-bold w-16">Mengisi</th>
                          <th className="border border-slate-800 p-1 bg-slate-50 font-bold w-20">Tidak Mengisi</th>
                          <th className="border border-slate-800 p-1 bg-slate-50 font-bold w-16">Mengisi</th>
                          <th className="border border-slate-800 p-1 bg-slate-50 font-bold w-20">Tidak Mengisi</th>
                          <th className="border border-slate-800 p-1 bg-slate-50 font-bold w-16">Mengisi</th>
                          <th className="border border-slate-800 p-1 bg-slate-50 font-bold w-20">Tidak Mengisi</th>
                        </tr>`;

if (code.includes('<th colSpan={2} className="border border-slate-800 p-2 font-bold">Absen Zuhur Siswa</th>\n                        </tr>')) {
   const parts = code.split('<th colSpan={2} className="border border-slate-800 p-2 font-bold">Absen Zuhur Siswa</th>');
   // Because there are two "Absen Zuhur Siswa" occurrences (Walas and Mapel), we only replace the Mapel one, which is the 2nd active tab.
   // wait, "Absen Zuhur Siswa" is NOT in Walas? Walas has "Sholat Zuhur Siswa". So this is unique!
}

code = code.replace(targetHead, replaceHead);

fs.writeFileSync('src/components/KamadWeeklyRecapModal.tsx', code);
