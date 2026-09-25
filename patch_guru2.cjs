const fs = require('fs');
let content = fs.readFileSync('src/pages/GuruPages.tsx', 'utf8');

const getPreviewDataReplacement = `    } else if (reportType === 'pemantauan_pagi') {
      let filtered = pemantauanPagi;
      if (filterSemester) filtered = filtered.filter(p => !p.semester || norm(p.semester) === norm(filterSemester));
      if (selectedClass) filtered = filtered.filter(p => norm(p.class_name) === norm(selectedClass));
      if (selectedMonth !== 'Semua Bulan' && monthNum) {
        filtered = filtered.filter(p => {
          const m = getMonthFromDate(p.tanggal);
          return !m || m === monthNum;
        });
      }
      return filtered.map((p: any, idx: number) => {
        const student = studentsList.find(s => String(s.id) === String(p.student_id));
        return {
          no: idx + 1,
          tanggal: p.tanggal,
          nama: student?.name || '-',
          kelas: p.class_name || '-',
          kebersihan: p.kebersihan || '-',
          seragam: p.seragam || '-',
          ket: p.ket_seragam || '-'
        };
      });
    } else if (reportType === 'nilai_sikap') {
      let filtered = nilaiSikap;
      if (filterSemester) filtered = filtered.filter(p => !p.semester || norm(p.semester) === norm(filterSemester));
      if (selectedClass) filtered = filtered.filter(p => norm(p.class_name) === norm(selectedClass));
      if (selectedMonth !== 'Semua Bulan' && monthNum) {
        filtered = filtered.filter(p => {
          const m = getMonthFromDate(p.tanggal);
          return !m || m === monthNum;
        });
      }
      return filtered.map((p: any, idx: number) => {
        const student = studentsList.find(s => String(s.id) === String(p.student_id));
        return {
          no: idx + 1,
          tanggal: p.tanggal,
          nama: student?.name || '-',
          kelas: p.class_name || '-',
          nilai: p.nilai || '-'
        };
      });
    } else {
      // Analisis Perkembangan Belajar`;

content = content.replace("    } else {\n      // Analisis Perkembangan Belajar", getPreviewDataReplacement);

const tableHeadersReplacement = `        } else if (reportType === 'pemantauan_pagi') {
          headers = ['No', 'Tanggal', 'Nama Siswa', 'Kelas', 'Kebersihan', 'Seragam', 'Ket. Seragam'];
          dataRows = previewRows.map((r: any) => [
            r.no, r.tanggal, r.nama, r.kelas, r.kebersihan, r.seragam, r.ket
          ]);
        } else if (reportType === 'nilai_sikap') {
          headers = ['No', 'Tanggal', 'Nama Siswa', 'Kelas', 'Nilai Sikap'];
          dataRows = previewRows.map((r: any) => [
            r.no, r.tanggal, r.nama, r.kelas, r.nilai
          ]);
        } else {
          headers = ['No', 'Nama Siswa', 'NIS', 'Nilai Awal', 'Nilai Akhir', 'Peningkatan', 'Status'];`;

content = content.replace("        } else {\n          headers = ['No', 'Nama Siswa', 'NIS', 'Nilai Awal', 'Nilai Akhir', 'Peningkatan', 'Status'];", tableHeadersReplacement);

const pdfHeadersReplacement = `        } else if (reportType === 'pemantauan_pagi') {
          headers = ['No', 'Tanggal', 'Nama', 'Kelas', 'Kebersihan', 'Seragam', 'Ket'];
          body = previewRows.map((r: any) => [
            r.no, r.tanggal, r.nama, r.kelas, r.kebersihan, r.seragam, r.ket
          ]);
        } else if (reportType === 'nilai_sikap') {
          headers = ['No', 'Tanggal', 'Nama', 'Kelas', 'Nilai'];
          body = previewRows.map((r: any) => [
            r.no, r.tanggal, r.nama, r.kelas, r.nilai
          ]);
        } else {
          headers = ['No', 'Nama Siswa', 'NIS', 'Awal', 'Akhir', 'Peningkatan', 'Status'];`;

content = content.replace("        } else {\n          headers = ['No', 'Nama Siswa', 'NIS', 'Awal', 'Akhir', 'Peningkatan', 'Status'];", pdfHeadersReplacement);

const reportTitlesReplacement = `      sholat_zuhur: 'REKAP_SHOLAT_ZUHUR',\n      pemantauan_pagi: 'PEMANTAUAN_PAGI',\n      nilai_sikap: 'NILAI_SIKAP'\n    };`;

content = content.replace("      sholat_zuhur: 'REKAP_SHOLAT_ZUHUR'\n    };", reportTitlesReplacement);


// Add the UI buttons for Pemantauan Pagi and Nilai Sikap for Walas only
// Let's insert it inside the <div className="space-y-4"> where the report options are.

const uiReplacement = `                        <option value="sholat_zuhur">Laporan Sholat Zuhur</option>
                      </select>
                    </div>
                  )}
                  {isWalas && (
                    <div className="flex items-center">
                      <input 
                        type="radio" 
                        id="type-pemantauan" 
                        name="reportType" 
                        value="pemantauan_pagi" 
                        checked={reportType === 'pemantauan_pagi'} 
                        onChange={() => setReportType('pemantauan_pagi')} 
                        className="mr-2"
                      />
                      <label htmlFor="type-pemantauan" className="text-sm font-medium text-slate-700">Laporan Pemantauan Pagi</label>
                    </div>
                  )}
                  {isWalas && (
                    <div className="flex items-center">
                      <input 
                        type="radio" 
                        id="type-sikap" 
                        name="reportType" 
                        value="nilai_sikap" 
                        checked={reportType === 'nilai_sikap'} 
                        onChange={() => setReportType('nilai_sikap')} 
                        className="mr-2"
                      />
                      <label htmlFor="type-sikap" className="text-sm font-medium text-slate-700">Laporan Nilai Sikap</label>
                    </div>
                  )}
                </div>`;

content = content.replace(`                        <option value="sholat_zuhur">Laporan Sholat Zuhur</option>
                      </select>
                    </div>
                  )}
                </div>`, uiReplacement);


// Add table rendering for Pemantauan Pagi & Nilai Sikap
const tableRenderingReplacement = `                    {reportType === 'pemantauan_pagi' && (
                      <>
                        <th className="px-4 py-3 text-left font-semibold text-slate-600">Tanggal</th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-600">Nama Siswa</th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-600">Kelas</th>
                        <th className="px-4 py-3 text-center font-semibold text-slate-600">Kebersihan</th>
                        <th className="px-4 py-3 text-center font-semibold text-slate-600">Seragam</th>
                        <th className="px-4 py-3 text-center font-semibold text-slate-600">Ket</th>
                      </>
                    )}
                    {reportType === 'nilai_sikap' && (
                      <>
                        <th className="px-4 py-3 text-left font-semibold text-slate-600">Tanggal</th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-600">Nama Siswa</th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-600">Kelas</th>
                        <th className="px-4 py-3 text-center font-semibold text-slate-600">Nilai Sikap</th>
                      </>
                    )}
                    {reportType === 'analisis' && (`;

content = content.replace(`                    {reportType === 'analisis' && (`, tableRenderingReplacement);

const tableBodyReplacement = `                      {reportType === 'pemantauan_pagi' && (
                        <>
                          <td className="px-4 py-3 text-slate-700">{row.tanggal}</td>
                          <td className="px-4 py-3 text-slate-700 font-medium">{row.nama}</td>
                          <td className="px-4 py-3 text-slate-700">{row.kelas}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={\`inline-flex px-2 py-1 rounded text-xs font-medium \${row.kebersihan === 'Piket' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}\`}>
                              {row.kebersihan}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={\`inline-flex px-2 py-1 rounded text-xs font-medium \${row.seragam === 'Lengkap' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}\`}>
                              {row.seragam}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center text-slate-700">{row.ket || '-'}</td>
                        </>
                      )}
                      {reportType === 'nilai_sikap' && (
                        <>
                          <td className="px-4 py-3 text-slate-700">{row.tanggal}</td>
                          <td className="px-4 py-3 text-slate-700 font-medium">{row.nama}</td>
                          <td className="px-4 py-3 text-slate-700">{row.kelas}</td>
                          <td className="px-4 py-3 text-center font-medium text-emerald-700">{row.nilai}</td>
                        </>
                      )}
                      {reportType === 'analisis' && (`;

content = content.replace(`                      {reportType === 'analisis' && (`, tableBodyReplacement);


fs.writeFileSync('src/pages/GuruPages.tsx', content);
console.log('GuruPages Phase 2 patched');
