const fs = require('fs');
let content = fs.readFileSync('src/pages/GuruPages.tsx', 'utf8');

// The first occurrence of setPemantauanPagi was wrong. We remove it from JurnalMengajar.
const badDeclaration = `  const [ibadahSiswa, setIbadahSiswa] = useState<any[]>([]);
  const [pemantauanPagi, setPemantauanPagi] = useState<any[]>([]);
  const [nilaiSikap, setNilaiSikap] = useState<any[]>([]);`;

content = content.replace(badDeclaration, `  const [ibadahSiswa, setIbadahSiswa] = useState<any[]>([]);`);

// Also I added:
//       if (Array.isArray(ibaRes)) setIbadahSiswa(ibaRes);
//       if (Array.isArray(pemRes)) setPemantauanPagi(pemRes);
//       if (Array.isArray(nsRes)) setNilaiSikap(nsRes);
// Where did this go? Let's check.
const badAssignment = `if (Array.isArray(ibaRes)) setIbadahSiswa(ibaRes);
      if (Array.isArray(pemRes)) setPemantauanPagi(pemRes);
      if (Array.isArray(nsRes)) setNilaiSikap(nsRes);`;

content = content.replace(badAssignment, `if (Array.isArray(ibaRes)) setIbadahSiswa(ibaRes);`);

// Now add it correctly to Laporan component. We find "export function Laporan() {" and replace inside it.
const laporanStart = content.indexOf('export function Laporan() {');
const ibaSiswaIndex = content.indexOf('const [ibadahSiswa, setIbadahSiswa] = useState<any[]>([]);', laporanStart);

const beforeIba = content.substring(0, ibaSiswaIndex);
const afterIba = content.substring(ibaSiswaIndex + 59); // length of the declaration

content = beforeIba + `const [ibadahSiswa, setIbadahSiswa] = useState<any[]>([]);
  const [pemantauanPagi, setPemantauanPagi] = useState<any[]>([]);
  const [nilaiSikap, setNilaiSikap] = useState<any[]>([]);` + afterIba;

const ibaAssignmentIndex = content.indexOf('if (Array.isArray(ibaRes)) setIbadahSiswa(ibaRes);', laporanStart);

const beforeIbaAss = content.substring(0, ibaAssignmentIndex);
const afterIbaAss = content.substring(ibaAssignmentIndex + 50);

content = beforeIbaAss + `if (Array.isArray(ibaRes)) setIbadahSiswa(ibaRes);
      if (Array.isArray(pemRes)) setPemantauanPagi(pemRes);
      if (Array.isArray(nsRes)) setNilaiSikap(nsRes);` + afterIbaAss;

fs.writeFileSync('src/pages/GuruPages.tsx', content);
console.log('Fixed state in Laporan');
