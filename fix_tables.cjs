const fs = require('fs');
let content = fs.readFileSync('src/pages/GuruPages.tsx', 'utf8');

// I need to add pemantauan_pagi and nilai_sikap table rendering under {reportType === 'jurnal' && ...}
const searchTable = `              {reportType === 'jurnal' && (
                <>
                  <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4 w-12">No</th>
                      <th className="py-3 px-4 w-24">Tanggal</th>
                      <th className="py-3 px-4">Materi Pokok</th>
                      <th className="py-3 px-4">Catatan KBM</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs font-semibold text-slate-700 divide-y divide-slate-100">
                    {previewRows.length > 0 ? (
                      previewRows.map((row: any) => (
                        <tr key={row.no} className="hover:bg-slate-50/50">
                          <td className="py-3 px-4 text-slate-400">{row.no}</td>
                          <td className="py-3 px-4 text-slate-500 font-mono font-medium">{row.tanggal}</td>
                          <td className="py-3 px-4 font-bold text-emerald-800">{row.materi}</td>
                          <td className="py-3 px-4 text-slate-500 font-normal italic leading-relaxed">{row.catatan}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-slate-400 font-medium text-xs">
                          Belum ada jurnal KBM untuk filter yang dipilih.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </>
              )}`;

const addTable = `              {reportType === 'jurnal' && (
                <>
                  <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4 w-12">No</th>
                      <th className="py-3 px-4 w-24">Tanggal</th>
                      <th className="py-3 px-4">Materi Pokok</th>
                      <th className="py-3 px-4">Catatan KBM</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs font-semibold text-slate-700 divide-y divide-slate-100">
                    {previewRows.length > 0 ? (
                      previewRows.map((row: any) => (
                        <tr key={row.no} className="hover:bg-slate-50/50">
                          <td className="py-3 px-4 text-slate-400">{row.no}</td>
                          <td className="py-3 px-4 text-slate-500 font-mono font-medium">{row.tanggal}</td>
                          <td className="py-3 px-4 font-bold text-emerald-800">{row.materi}</td>
                          <td className="py-3 px-4 text-slate-500 font-normal italic leading-relaxed">{row.catatan}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-slate-400 font-medium text-xs">
                          Belum ada jurnal KBM untuk filter yang dipilih.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </>
              )}
              {reportType === 'pemantauan_pagi' && (
                <>
                  <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4 w-12">No</th>
                      <th className="py-3 px-4">Nama Siswa</th>
                      <th className="py-3 px-4">Kelas</th>
                      <th className="py-3 px-4 text-center">Kebersihan</th>
                      <th className="py-3 px-4 text-center">Seragam</th>
                      <th className="py-3 px-4 text-center">Ket Seragam</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs font-semibold text-slate-700 divide-y divide-slate-100">
                    {previewRows.length > 0 ? (
                      previewRows.map((row: any) => (
                        <tr key={row.no} className="hover:bg-slate-50/50">
                          <td className="py-3 px-4 text-slate-400">{row.no}</td>
                          <td className="py-3 px-4 font-bold text-slate-800">{row.nama}</td>
                          <td className="py-3 px-4 text-slate-500 font-mono">{row.kelas}</td>
                          <td className="py-3 px-4 text-center font-bold text-slate-700">{row.kebersihan}</td>
                          <td className="py-3 px-4 text-center font-bold text-slate-700">{row.seragam}</td>
                          <td className="py-3 px-4 text-center text-slate-500 italic">{row.ket}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400 font-medium text-xs">
                          Belum ada data pemantauan pagi untuk filter yang dipilih.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </>
              )}
              {reportType === 'nilai_sikap' && (
                <>
                  <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4 w-12">No</th>
                      <th className="py-3 px-4">Nama Siswa</th>
                      <th className="py-3 px-4">Kelas</th>
                      <th className="py-3 px-4 text-center">Nilai Sikap</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs font-semibold text-slate-700 divide-y divide-slate-100">
                    {previewRows.length > 0 ? (
                      previewRows.map((row: any) => (
                        <tr key={row.no} className="hover:bg-slate-50/50">
                          <td className="py-3 px-4 text-slate-400">{row.no}</td>
                          <td className="py-3 px-4 font-bold text-slate-800">{row.nama}</td>
                          <td className="py-3 px-4 text-slate-500 font-mono">{row.kelas}</td>
                          <td className="py-3 px-4 text-center font-bold text-emerald-600 bg-emerald-50/30">{row.nilai}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-slate-400 font-medium text-xs">
                          Belum ada data nilai sikap untuk filter yang dipilih.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </>
              )}`;

if (content.includes("Belum ada data nilai sikap")) {
   console.log("Already added");
} else {
   content = content.replace(searchTable, addTable);
   fs.writeFileSync('src/pages/GuruPages.tsx', content);
   console.log('Done table fix');
}
