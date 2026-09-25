import fs from 'fs';
let code = fs.readFileSync('src/pages/GuruPages.tsx', 'utf8');

code = code.replace(
  "date: new Date().toLocaleDateString('en-CA')",
  "date: new Date().toISOString().split('T')[0]"
);

fs.writeFileSync('src/pages/GuruPages.tsx', code);
console.log("Fixed date format");
