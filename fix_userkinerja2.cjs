const fs = require('fs');

['src/components/KamadWeeklyRecapModal.tsx'].forEach(file => {
    let code = fs.readFileSync(file, 'utf-8');
    code = code.replace("match(/^(d{4}-d{2}-d{2})/", "match(/^(\\\\d{4}-\\\\d{2}-\\\\d{2})/");
    fs.writeFileSync(file, code);
});
