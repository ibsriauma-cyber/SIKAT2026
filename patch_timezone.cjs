const fs = require('fs');
let code = fs.readFileSync('src/pages/KamadPages.tsx', 'utf-8');

const targetDate1 = `const [kinerjaStartDate, setKinerjaStartDate] = useState(() => new Date().toISOString().split('T')[0]);`;
const replacementDate1 = `const [kinerjaStartDate, setKinerjaStartDate] = useState(() => {
    const d = new Date();
    return \`\${d.getFullYear()}-\${String(d.getMonth() + 1).padStart(2, '0')}-\${String(d.getDate()).padStart(2, '0')}\`;
  });`;

code = code.replace(targetDate1, replacementDate1);

const targetDate2 = `const filterDateStr = kinerjaStartDate || new Date().toISOString().split('T')[0];`;
const replacementDate2 = `const d = new Date();
        const localToday = \`\${d.getFullYear()}-\${String(d.getMonth() + 1).padStart(2, '0')}-\${String(d.getDate()).padStart(2, '0')}\`;
        const filterDateStr = kinerjaStartDate || localToday;`;

code = code.replace(targetDate2, replacementDate2);

fs.writeFileSync('src/pages/KamadPages.tsx', code);
