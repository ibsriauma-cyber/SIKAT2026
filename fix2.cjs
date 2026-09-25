const fs = require('fs');
let content = fs.readFileSync('src/pages/GuruPages.tsx', 'utf8');

const badUI = `                  {isWalas && (
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

content = content.replace(badUI, "");

// Now add it to the correct place in Laporan
// In Laporan, we have: 
//                        Laporan Sholat Zuhur
//                      </button>
//                    </div>
//                  )}

const targetLaporanUI = `                      >
                        Laporan Sholat Zuhur
                      </button>
                    </div>
                  )}`;

const newLaporanUI = `                      >
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
content = content.replace(targetLaporanUI, newLaporanUI);

// Fix TS errors in getPreviewData
// error TS2304: Cannot find name 'pemantauanPagi'. -> I need to use state variables pemantauanPagi and nilaiSikap
// Wait, did I declare them? Yes, in `Laporan` state! But wait, `getPreviewData` is inside `Laporan` right?
// Yes.

fs.writeFileSync('src/pages/GuruPages.tsx', content);
console.log('Fixed UI in GuruPages again');
