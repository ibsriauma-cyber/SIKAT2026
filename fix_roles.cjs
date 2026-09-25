const fs = require('fs');
let code = fs.readFileSync('src/pages/KamadPages.tsx', 'utf-8');

// The one in KamadDashboard
const target = `const teachers = usersList.filter((u: any) => {
          let r = u.roles ? typeof u.roles === 'string' ? JSON.parse(u.roles) : u.roles : [u.role];
          if (walasClassObj && !r.includes('walas')) {
            r.push('walas');
          }
          return r.includes('guru') || r.includes('walas') || r.includes('guru_quran') || r.includes('tendik');
        });`;
const replace = `const teachers = usersList.filter((u: any) => {
          const r = u.roles ? typeof u.roles === 'string' ? JSON.parse(u.roles) : u.roles : [u.role];
          return r.includes('guru') || r.includes('walas') || r.includes('guru_quran') || r.includes('tendik');
        });`;
code = code.replace(target, replace);
fs.writeFileSync('src/pages/KamadPages.tsx', code);
