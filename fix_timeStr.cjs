const fs = require('fs');
let code = fs.readFileSync('src/pages/KamadPages.tsx', 'utf8');

code = code.replace(
    /timeStr = new Date\(found\.created_at\)\.toLocaleTimeString\('id-ID', \{ hour: '2-digit', minute: '2-digit' \}\) \+ ' WIB';/,
    "timeStr = 'Dikerjakan: ' + new Date(found.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';"
);

fs.writeFileSync('src/pages/KamadPages.tsx', code);
console.log('Fixed timeStr');
