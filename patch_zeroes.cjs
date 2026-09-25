const fs = require('fs');
let code = fs.readFileSync('src/components/KamadWeeklyRecapModal.tsx', 'utf-8');

code = code.replace(/\|\| ''/g, '');

fs.writeFileSync('src/components/KamadWeeklyRecapModal.tsx', code);
console.log("Patched UI Zeroes");
