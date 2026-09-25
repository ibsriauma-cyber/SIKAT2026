const fs = require('fs');
let code = fs.readFileSync('src/pages/KamadPages.tsx', 'utf-8');
code = code.replace(`        const teachers = usersList.filter((u: any) => {
          }
          return r.includes('guru') || r.includes('walas') || r.includes('guru_quran') || r.includes('tendik');
        });`, `        const teachers = usersList.filter((u: any) => {
          const r = u.roles ? typeof u.roles === 'string' ? JSON.parse(u.roles) : u.roles : [u.role];
          return r.includes('guru') || r.includes('walas') || r.includes('guru_quran') || r.includes('tendik');
        });`);
fs.writeFileSync('src/pages/KamadPages.tsx', code);
