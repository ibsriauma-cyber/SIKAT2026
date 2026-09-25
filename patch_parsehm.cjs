const fs = require('fs');
let code = fs.readFileSync('src/components/KamadWeeklyRecapModal.tsx', 'utf-8');
code = code.replace(/(const match = String\(timeStr\)\.trim\(\)\.match\(\/)\(d\\{1,2\\}\):\(d\\{2\\}\)(\/\);)/g, "$1(\\\\d{1,2}):(\\\\d{2})$2");
fs.writeFileSync('src/components/KamadWeeklyRecapModal.tsx', code);

let pagesCode = fs.readFileSync('src/pages/KamadPages.tsx', 'utf-8');
pagesCode = pagesCode.replace(/(const match = String\(timeStr\)\.trim\(\)\.match\(\/)\(d\\{1,2\\}\):\(d\\{2\\}\)(\/\);)/g, "$1(\\\\d{1,2}):(\\\\d{2})$2");
fs.writeFileSync('src/pages/KamadPages.tsx', pagesCode);
