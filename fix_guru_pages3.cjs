const fs = require('fs');
let content = fs.readFileSync('src/pages/GuruPages.tsx', 'utf8');

// The messed up isGuruQuran block:
const search1 = `              {isGuruQuran ? (
                <div className="flex flex-col gap-1 p-1 bg-slate-100 rounded-lg">
                  <div className="grid grid-cols-3 gap-1">
                    <button
                      type="button"
                      onClick={() => setReportType('presensi')}
                      className={\`py-1.5 px-2 rounded-md text-[10px] font-bold uppercase tracking-tight transition-colors \${reportType === 'presensi' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}\`}
                    >
                      Presensi
                    </button>
                    {!isStrictlyWalas && (
                      <>
                    <button
                      type="button"
                      onClick={() => setReportType('nilai')}
                      className={\`py-1.5 px-2 rounded-md text-[10px] font-bold uppercase tracking-tight transition-colors \${reportType === 'nilai' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}\`}
                    >
                      Nilai
                    </button>
                    <button
                      type="button"
                      onClick={() => setReportType('jurnal')}
                      className={\`py-1.5 px-2 rounded-md text-[10px] font-bold uppercase tracking-tight transition-colors \${reportType === 'jurnal' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}\`}
                    >
                      Jurnal
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    <button
                      type="button"
                      onClick={() => setReportType('analisis')}
                      className={\`py-1.5 px-2 rounded-md text-[10px] font-bold uppercase tracking-tight transition-colors \${reportType === 'analisis' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}\`}
                    >
                      Analisis
                    </button>
                    <button
                      type="button"
                      onClick={() => setReportType('sholat_dhuha')}
                      className={\`py-1.5 px-2 rounded-md text-[10px] font-bold uppercase tracking-tight transition-colors \${reportType === 'sholat_dhuha' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}\`}
                    >
                      Dhuha
                    </button>
                    </>
                    )}
                  </div>`;

const replace1 = `              {isGuruQuran ? (
                <div className="flex flex-col gap-1 p-1 bg-slate-100 rounded-lg">
                  <div className="grid grid-cols-3 gap-1">
                    <button
                      type="button"
                      onClick={() => setReportType('presensi')}
                      className={\`py-1.5 px-2 rounded-md text-[10px] font-bold uppercase tracking-tight transition-colors \${reportType === 'presensi' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}\`}
                    >
                      Presensi
                    </button>
                    <button
                      type="button"
                      onClick={() => setReportType('nilai')}
                      className={\`py-1.5 px-2 rounded-md text-[10px] font-bold uppercase tracking-tight transition-colors \${reportType === 'nilai' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}\`}
                    >
                      Nilai
                    </button>
                    <button
                      type="button"
                      onClick={() => setReportType('jurnal')}
                      className={\`py-1.5 px-2 rounded-md text-[10px] font-bold uppercase tracking-tight transition-colors \${reportType === 'jurnal' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}\`}
                    >
                      Jurnal
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    <button
                      type="button"
                      onClick={() => setReportType('analisis')}
                      className={\`py-1.5 px-2 rounded-md text-[10px] font-bold uppercase tracking-tight transition-colors \${reportType === 'analisis' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}\`}
                    >
                      Analisis
                    </button>
                    <button
                      type="button"
                      onClick={() => setReportType('sholat_dhuha')}
                      className={\`py-1.5 px-2 rounded-md text-[10px] font-bold uppercase tracking-tight transition-colors \${reportType === 'sholat_dhuha' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}\`}
                    >
                      Dhuha
                    </button>
                  </div>`;

content = content.replace(search1, replace1);

// I noticed this syntax error:
//             <div><div>
//               <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Pilih Kelas</label>

const search2 = `            </div>
            <div><div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Pilih Kelas</label>`;

const replace2 = `            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Pilih Kelas</label>`;

content = content.replace(search2, replace2);

fs.writeFileSync('src/pages/GuruPages.tsx', content);
console.log('Done fix');
