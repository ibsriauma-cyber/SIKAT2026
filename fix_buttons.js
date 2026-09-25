import fs from 'fs';
let code = fs.readFileSync('src/pages/GuruPages.tsx', 'utf8');

// 1. Fix isStrictlyWalas
code = code.replace(/const isStrictlyWalas = isWalas;/, 'const isStrictlyWalas = isWalas && !isGuru;');

// 2. Fix order and label in the buttons block
const oldButtons = `                    {!isStrictlyWalas && (
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
                    )}`;

const newButtons = `                    {!isStrictlyWalas && (
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
                          onClick={() => setReportType('analisis')}
                          className={\`py-1.5 px-2 rounded-md text-[10px] font-bold uppercase tracking-tight transition-colors \${reportType === 'analisis' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}\`}
                        >
                          Analisis
                        </button>
                        <button
                          type="button"
                          onClick={() => setReportType('jurnal')}
                          className={\`py-1.5 px-2 rounded-md text-[10px] font-bold uppercase tracking-tight transition-colors \${reportType === 'jurnal' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}\`}
                        >
                          Jurnal Ajar
                        </button>
                      </>
                    )}`;

if (code.includes(oldButtons)) {
  code = code.replace(oldButtons, newButtons);
  console.log("Replaced Guru Mapel buttons successfully.");
} else {
  console.log("Could not find the old buttons exact match. Let's use regex.");
  
  // Regex to match the three buttons
  const regex = /<button[\s\S]*?onClick=\{\(\) => setReportType\('nilai'\)\}[\s\S]*?<\/button>\s*<button[\s\S]*?onClick=\{\(\) => setReportType\('jurnal'\)\}[\s\S]*?<\/button>\s*<button[\s\S]*?onClick=\{\(\) => setReportType\('analisis'\)\}[\s\S]*?<\/button>/;
  
  const replaced = code.replace(regex, `<button
                          type="button"
                          onClick={() => setReportType('nilai')}
                          className={\`py-1.5 px-2 rounded-md text-[10px] font-bold uppercase tracking-tight transition-colors \${reportType === 'nilai' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}\`}
                        >
                          Nilai
                        </button>
                        <button
                          type="button"
                          onClick={() => setReportType('analisis')}
                          className={\`py-1.5 px-2 rounded-md text-[10px] font-bold uppercase tracking-tight transition-colors \${reportType === 'analisis' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}\`}
                        >
                          Analisis
                        </button>
                        <button
                          type="button"
                          onClick={() => setReportType('jurnal')}
                          className={\`py-1.5 px-2 rounded-md text-[10px] font-bold uppercase tracking-tight transition-colors \${reportType === 'jurnal' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}\`}
                        >
                          Jurnal Ajar
                        </button>`);
  if (replaced !== code) {
    code = replaced;
    console.log("Replaced via regex successfully.");
  } else {
    console.log("Regex failed too.");
  }
}

fs.writeFileSync('src/pages/GuruPages.tsx', code);
