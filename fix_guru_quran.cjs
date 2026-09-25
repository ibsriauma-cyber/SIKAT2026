const fs = require('fs');
let code = fs.readFileSync('src/pages/KamadPages.tsx', 'utf8');

// Replace guru mapel logic
code = code.replace(
    /const assign = Array\.isArray\(assignments\)[^;]+;\s*const role = assign\?\.role \|\| 'guru_mapel';\s*return role === 'guru_mapel' \|\| role === 'guru';/,
    `const isQuran = s.subject_name.toLowerCase().includes('quran') || s.subject_name.toLowerCase().includes('tahfizh') || s.subject_name.toLowerCase().includes('bta');
               return !isQuran;`
);

// Replace guru quran logic
code = code.replace(
    /const assign = Array\.isArray\(assignments\)[^;]+;\s*return assign\?\.role === 'guru_quran';/,
    `const isQuran = s.subject_name.toLowerCase().includes('quran') || s.subject_name.toLowerCase().includes('tahfizh') || s.subject_name.toLowerCase().includes('bta');
               return isQuran || !r.includes('guru');`
);

fs.writeFileSync('src/pages/KamadPages.tsx', code);
console.log('Fixed guru quran schedule filtering');
