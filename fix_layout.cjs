const fs = require('fs');
let content = fs.readFileSync('src/pages/GuruPages.tsx', 'utf8');

const targetUI = `                  {isWalas && (
                    <div className="grid grid-cols-1 gap-1 mt-1">
                      <button
                        type="button"
                        onClick={() => setReportType('sholat_zuhur')}
                        className={\`py-1.5 px-2 rounded-md text-[10px] font-bold uppercase tracking-tight transition-colors \${reportType === 'sholat_zuhur' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}\`}
                      >
                        Laporan Sholat Zuhur
                      </button>
                    </div>
                  )}
                  {isWalas && (
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                      <button
                        type="button"
                        onClick={() => setReportType('pemantauan_pagi')}
                        className={\`py-1.5 px-2 rounded-md text-[10px] font-bold uppercase tracking-tight transition-colors \${reportType === 'pemantauan_pagi' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}\`}
                      >
                        Pemantauan Pagi
                      </button>
                    </div>
                  )}
                  {isWalas && (
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                      <button
                        type="button"
                        onClick={() => setReportType('nilai_sikap')}
                        className={\`py-1.5 px-2 rounded-md text-[10px] font-bold uppercase tracking-tight transition-colors \${reportType === 'nilai_sikap' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}\`}
                      >
                        Nilai Sikap
                      </button>
                    </div>
                  )}`;

const newUI = `                  {isWalas && (
                    <div className="grid grid-cols-3 gap-1 mt-1">
                      <button
                        type="button"
                        onClick={() => setReportType('sholat_zuhur')}
                        className={\`py-1.5 px-2 rounded-md text-[10px] font-bold uppercase tracking-tight transition-colors \${reportType === 'sholat_zuhur' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}\`}
                      >
                        Sholat Zuhur
                      </button>
                      <button
                        type="button"
                        onClick={() => setReportType('pemantauan_pagi')}
                        className={\`py-1.5 px-2 rounded-md text-[10px] font-bold uppercase tracking-tight transition-colors \${reportType === 'pemantauan_pagi' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}\`}
                      >
                        Pemantauan Pagi
                      </button>
                      <button
                        type="button"
                        onClick={() => setReportType('nilai_sikap')}
                        className={\`py-1.5 px-2 rounded-md text-[10px] font-bold uppercase tracking-tight transition-colors \${reportType === 'nilai_sikap' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}\`}
                      >
                        Nilai Sikap
                      </button>
                    </div>
                  )}`;

content = content.replace(targetUI, newUI);
fs.writeFileSync('src/pages/GuruPages.tsx', content);
console.log('UI Patched');
