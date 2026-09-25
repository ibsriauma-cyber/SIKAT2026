const fs = require('fs');
let code = fs.readFileSync('src/pages/KamadPages.tsx', 'utf8');

code = code.replace(/s\.jamSelesai/g, "s.end_time?.substring(0, 5)");

fs.writeFileSync('src/pages/KamadPages.tsx', code);
console.log('Fixed end_time reference');
