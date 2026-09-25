const fs = require('fs');

['src/components/KamadWeeklyRecapModal.tsx', 'src/pages/KamadPages.tsx'].forEach(file => {
    let code = fs.readFileSync(file, 'utf-8');
    code = code.replace(/match\(\/\(d\\{1,2\\}\):\(d\\{2\\}\)\/\)/g, "match(/(\\\\d{1,2}):(\\\\d{2})/)");
    fs.writeFileSync(file, code);
});
