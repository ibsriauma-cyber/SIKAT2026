const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/pages/KamadPages.tsx');
let content = fs.readFileSync(file, 'utf8');

const regexStatus = /\s*const handleStatusChange = async \([\s\S]*?\}\s*\} catch \(e\) \{\s*console\.error\(e\);\s*window\.alert\('Gagal menyimpan data ibadah'\);\s*\}\s*\};/;
const regexKeterangan = /\s*const handleKeteranganChange = async \([\s\S]*?\}\s*\} catch \(e\) \{\s*console\.error\(e\);\s*\}\s*\};/;

content = content.replace(regexStatus, '');
content = content.replace(regexKeterangan, '');

fs.writeFileSync(file, content);
console.log('Removed unused functions');
