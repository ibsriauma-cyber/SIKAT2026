const fs = require('fs');
let content = fs.readFileSync('src/pages/GuruPages.tsx', 'utf8');

const tableRender = `              {(reportType === 'sholat_dhuha' || reportType === 'sholat_zuhur') && (
                <>
                  <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4 w-12">No</th>
                      <th className="py-3 px-4">Nama Siswa</th>
                      <th className="py-3 px-4">NIS</th>
                      <th className="py-3 px-4 text-center">Jamaah</th>
                      <th className="py-3 px-4 text-center">Tidak</th>
                      <th className="py-3 px-4 text-right">Persentase</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs font-semibold text-slate-700 divide-y divide-slate-100">
                    {previewRows.length > 0 ? (
                      previewRows.map((row: any) => (
                        <tr key={row.no} className="hover:bg-slate-50/50">
                          <td className="py-3 px-4 text-slate-400">{row.no}</td>
                          <td className="py-3 px-4 font-bold text-slate-800">{row.nama}</td>
                          <td className="py-3 px-4 text-slate-500 font-mono">{row.nis}</td>
                          <td className="py-3 px-4 text-center text-emerald-600 font-mono">{row.jamaah}</td>
                          <td className="py-3 px-4 text-center text-amber-600 font-mono">{row.tidak}</td>
                          <td className="py-3 px-4 text-right font-mono">{row.persentase}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400">Tidak ada data untuk filter yang dipilih</td>
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
                      <th className="py-3 px-4">Tanggal</th>
                      <th className="py-3 px-4">Nama Siswa</th>
                      <th className="py-3 px-4">Kelas</th>
                      <th className="py-3 px-4 text-center">Kebersihan</th>
                      <th className="py-3 px-4 text-center">Seragam</th>
                      <th className="py-3 px-4 text-right">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs font-semibold text-slate-700 divide-y divide-slate-100">
                    {previewRows.length > 0 ? (
                      previewRows.map((row: any) => (
                        <tr key={row.no} className="hover:bg-slate-50/50">
                          <td className="py-3 px-4 text-slate-400">{row.no}</td>
                          <td className="py-3 px-4 text-slate-600">{row.tanggal}</td>
                          <td className="py-3 px-4 font-bold text-slate-800">{row.nama}</td>
                          <td className="py-3 px-4 text-slate-600">{row.kelas}</td>
                          <td className="py-3 px-4 text-center"><span className={\`inline-flex px-2 py-1 rounded-md text-[10px] font-bold uppercase \${row.kebersihan === 'Piket' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}\`}>{row.kebersihan}</span></td>
                          <td className="py-3 px-4 text-center"><span className={\`inline-flex px-2 py-1 rounded-md text-[10px] font-bold uppercase \${row.seragam === 'Lengkap' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}\`}>{row.seragam}</span></td>
                          <td className="py-3 px-4 text-right">{row.ket || '-'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400">Tidak ada data untuk filter yang dipilih</td>
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
                      <th className="py-3 px-4">Tanggal</th>
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
                          <td className="py-3 px-4 text-slate-600">{row.tanggal}</td>
                          <td className="py-3 px-4 font-bold text-slate-800">{row.nama}</td>
                          <td className="py-3 px-4 text-slate-600">{row.kelas}</td>
                          <td className="py-3 px-4 text-center font-bold text-emerald-700">{row.nilai}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-400">Tidak ada data untuk filter yang dipilih</td>
                      </tr>
                    )}
                  </tbody>
                </>
              )}`;

const sholatDhuhaStr = `              {(reportType === 'sholat_dhuha' || reportType === 'sholat_zuhur') && (
                <>
                  <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4 w-12">No</th>
                      <th className="py-3 px-4">Nama Siswa</th>
                      <th className="py-3 px-4">NIS</th>
                      <th className="py-3 px-4 text-center">Jamaah</th>
                      <th className="py-3 px-4 text-center">Tidak</th>
                      <th className="py-3 px-4 text-right">Persentase</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs font-semibold text-slate-700 divide-y divide-slate-100">
                    {previewRows.length > 0 ? (
                      previewRows.map((row: any) => (
                        <tr key={row.no} className="hover:bg-slate-50/50">
                          <td className="py-3 px-4 text-slate-400">{row.no}</td>
                          <td className="py-3 px-4 font-bold text-slate-800">{row.nama}</td>
                          <td className="py-3 px-4 text-slate-500 font-mono">{row.nis}</td>
                          <td className="py-3 px-4 text-center text-emerald-600 font-mono">{row.jamaah}</td>
                          <td className="py-3 px-4 text-center text-amber-600 font-mono">{row.tidak}</td>
                          <td className="py-3 px-4 text-right font-mono">{row.persentase}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400">Tidak ada data untuk filter yang dipilih</td>
                      </tr>
                    )}
                  </tbody>
                </>
              )}`;

content = content.replace(sholatDhuhaStr, tableRender);
fs.writeFileSync('src/pages/GuruPages.tsx', content);
console.log('JSX patched in GuruPages');
