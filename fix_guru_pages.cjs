const fs = require('fs');
let content = fs.readFileSync('src/pages/GuruPages.tsx', 'utf8');

// replace walas class calculation
content = content.replace(
  /const walasClass = user\?\.className \|\| user\?\.class_name;/,
  `const dbWalasClass = dbClasses.find((c: any) => String(c.wali_kelas_id) === String(user?.id))?.name;\n  const walasClass = dbWalasClass || user?.className || user?.class_name;`
);

// replace hidden dropdowns
content = content.replace(
  /{user\?\.role !== 'walas' && \(\<\>\<div\>/,
  `<div>`
);

content = content.replace(
  /<\/div>\<\/\>\)}/,
  `</div>`
);

fs.writeFileSync('src/pages/GuruPages.tsx', content);
console.log('Done');
