const fs = require('fs');
let content = fs.readFileSync('src/pages/GuruPages.tsx', 'utf8');

// Insert isStrictlyWalas
content = content.replace(
  /const isWalas = user\?\.role === 'walas' \|\| user\?\.roles\?\.includes\('walas'\);/,
  `const isWalas = user?.role === 'walas' || user?.roles?.includes('walas');\n  const isGuru = user?.role === 'guru' || user?.roles?.includes('guru');\n  const isStrictlyWalas = isWalas && !isGuru;`
);

content = content.replace(
  /<div className="grid grid-cols-4 gap-1">/,
  `<div className={\`grid \${isStrictlyWalas ? 'grid-cols-1' : 'grid-cols-4'} gap-1\`}>`
);

// We need to wrap nilai, jurnal, analisis buttons with {!isStrictlyWalas && (<></>)}
const searchStr = `<button
                      type="button"
                      onClick={() => setReportType('nilai')}`;
                      
const replaceStr = `{!isStrictlyWalas && (
                      <>
                    <button
                      type="button"
                      onClick={() => setReportType('nilai')}`;

content = content.replace(searchStr, replaceStr);

const endSearchStr = `                      Analisis
                    </button>
                  </div>`;
const endReplaceStr = `                      Analisis
                    </button>
                    </>
                    )}
                  </div>`;
content = content.replace(endSearchStr, endReplaceStr);

fs.writeFileSync('src/pages/GuruPages.tsx', content);
console.log('Done');
