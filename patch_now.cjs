const fs = require('fs');
let code = fs.readFileSync('src/pages/KamadPages.tsx', 'utf-8');
code = code.replace(/now\.toISOString\(\)\.split\('T'\)\[0\]/g, "(function(){const d=now;return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');})()");
fs.writeFileSync('src/pages/KamadPages.tsx', code);
