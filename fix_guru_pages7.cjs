const fs = require('fs');
let content = fs.readFileSync('src/pages/GuruPages.tsx', 'utf8');

const search = `                <div className="flex flex-col gap-1 p-1 bg-slate-100 rounded-lg">
                  <div className={\`grid \${isStrictlyWalas ? 'grid-cols-1' : 'grid-cols-4'} gap-1\`}>
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
                        <button
                          type="button"
                          onClick={() => setReportType('analisis')}
                          className={\`py-1.5 px-2 rounded-md text-[10px] font-bold uppercase tracking-tight transition-colors \${reportType === 'analisis' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}\`}
                        >
                          Analisis
                        </button>
                      </>
                    )}
                  </div>
                  {isWalas && (
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
                  )}
                </div>`;

const replace = `                <div className="flex flex-col gap-1 p-1 bg-slate-100 rounded-lg">
                  <div className={\`grid \${isStrictlyWalas ? 'grid-cols-2' : 'grid-cols-4'} gap-1\`}>
                    <button
                      type="button"
                      onClick={() => setReportType('presensi')}
                      className={\`py-1.5 px-2 rounded-md text-[10px] font-bold uppercase tracking-tight transition-colors \${reportType === 'presensi' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}\`}
                    >
                      Presensi
                    </button>
                    {isStrictlyWalas && (
                      <button
                        type="button"
                        onClick={() => setReportType('sholat_zuhur')}
                        className={\`py-1.5 px-2 rounded-md text-[10px] font-bold uppercase tracking-tight transition-colors \${reportType === 'sholat_zuhur' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}\`}
                      >
                        Sholat Zuhur
                      </button>
                    )}
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
                        <button
                          type="button"
                          onClick={() => setReportType('analisis')}
                          className={\`py-1.5 px-2 rounded-md text-[10px] font-bold uppercase tracking-tight transition-colors \${reportType === 'analisis' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}\`}
                        >
                          Analisis
                        </button>
                      </>
                    )}
                  </div>
                  {isWalas && (
                    <div className={\`grid \${isStrictlyWalas ? 'grid-cols-2' : 'grid-cols-3'} gap-1 mt-1\`}>
                      {!isStrictlyWalas && (
                        <button
                          type="button"
                          onClick={() => setReportType('sholat_zuhur')}
                          className={\`py-1.5 px-2 rounded-md text-[10px] font-bold uppercase tracking-tight transition-colors \${reportType === 'sholat_zuhur' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}\`}
                        >
                          Sholat Zuhur
                        </button>
                      )}
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
                  )}
                </div>`;

content = content.replace(search, replace);

fs.writeFileSync('src/pages/GuruPages.tsx', content);
