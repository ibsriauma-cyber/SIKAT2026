const fs = require('fs');
let content = fs.readFileSync('src/pages/GuruPages.tsx', 'utf8');

const mapLogic = `
        const getLabel = (n) => {
          if(n === 'A') return 'Sangat Baik (A)';
          if(n === 'B') return 'Baik (B)';
          if(n === 'C') return 'Cukup (C)';
          if(n === 'D') return 'Kurang (D)';
          return n;
        };
`;

const search = `          kelas: s.className || s.class_name || selectedClass || '-',
          nilai: latest.nilai || '-'`;
const replace = `          kelas: s.className || s.class_name || selectedClass || '-',
          nilai: latest.nilai ? (
            latest.nilai === 'A' ? 'Sangat Baik (A)' :
            latest.nilai === 'B' ? 'Baik (B)' :
            latest.nilai === 'C' ? 'Cukup (C)' :
            latest.nilai === 'D' ? 'Kurang (D)' : latest.nilai
          ) : '-'`;

if (content.includes(search)) {
  content = content.replace(search, replace);
  fs.writeFileSync('src/pages/GuruPages.tsx', content);
  console.log("Success updating nilai_sikap display mapping!");
} else {
  console.log("Could not find search string.");
}
