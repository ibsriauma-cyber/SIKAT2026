const fs = require('fs');
let content = fs.readFileSync('src/pages/GuruPages.tsx', 'utf8');

const regex = /\{isGuruQuran \? \([\s\S]*?\) : \(/;
const replacement = `{isGuruQuran ? (
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
                  </div>
                </div>
              ) : (`;

content = content.replace(regex, replacement);
fs.writeFileSync('src/pages/GuruPages.tsx', content);
console.log('Done fix');
