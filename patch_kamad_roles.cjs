const fs = require('fs');
let code = fs.readFileSync('src/pages/KamadPages.tsx', 'utf-8');

const targetRoles = `          let r = u.roles ? typeof u.roles === 'string' ? JSON.parse(u.roles) : u.roles : [u.role];`;
const replacementRoles = `          let r = u.roles ? typeof u.roles === 'string' ? JSON.parse(u.roles) : u.roles : [u.role];
          if (walasClassObj && !r.includes('walas')) {
            r.push('walas');
          }`;

// Let's make sure targetRoles exists, if it's there
if (code.includes(`let r = u.roles ? typeof u.roles === 'string' ? JSON.parse(u.roles) : u.roles : [u.role];`)) {
    code = code.replace(`let r = u.roles ? typeof u.roles === 'string' ? JSON.parse(u.roles) : u.roles : [u.role];`, replacementRoles);
} else {
    // maybe it is declared with const
    const targetRolesConst = `const r = u.roles ? typeof u.roles === 'string' ? JSON.parse(u.roles) : u.roles : [u.role];`;
    const replacementRolesConst = `          let r = u.roles ? typeof u.roles === 'string' ? JSON.parse(u.roles) : u.roles : [u.role];
          if (walasClassObj && !r.includes('walas')) {
            r.push('walas');
          }`;
    code = code.replace(targetRolesConst, replacementRolesConst);
}

fs.writeFileSync('src/pages/KamadPages.tsx', code);
