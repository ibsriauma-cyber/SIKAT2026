const fs = require('fs');
let content = fs.readFileSync('src/pages/WalasPages.tsx', 'utf8');

// 1. Remove isLocked from PemantauanPagi
const searchPemantauanPagiState = `  const [loading, setLoading] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);`;

const replacePemantauanPagiState = `  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);`;

// 2. Add isLocked to NilaiSikap
const searchNilaiSikapState = `  const [existingRecords, setExistingRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);`;

const replaceNilaiSikapState = `  const [existingRecords, setExistingRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);`;

// 3. Fix the random setIsLocked(true) that was wrongly added to PemantauanPagi
// Since there's only one in PemantauanPagi, let's just find the specific block
const searchPemantauanPagiSave = `      const newData = await apiClient('/crud.php?table=pemantauan_pagi');
      if (Array.isArray(newData)) {
        setExistingRecords(newData.filter((r: any) => r.tanggal === selectedDate));
        setIsLocked(true);
      }`;
const replacePemantauanPagiSave = `      const newData = await apiClient('/crud.php?table=pemantauan_pagi');
      if (Array.isArray(newData)) {
        setExistingRecords(newData.filter((r: any) => r.tanggal === selectedDate));
      }`;

if (content.includes("const [isLocked, setIsLocked] = useState(false);")) {
  content = content.replace(searchPemantauanPagiState, replacePemantauanPagiState);
  content = content.replace(searchNilaiSikapState, replaceNilaiSikapState);
  content = content.replace(searchPemantauanPagiSave, replacePemantauanPagiSave);
  fs.writeFileSync('src/pages/WalasPages.tsx', content);
  console.log("Success fixing isLocked states!");
} else {
  console.log("Could not find isLocked to fix.");
}

