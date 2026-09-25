const fs = require('fs');
let file = fs.readFileSync('src/pages/GuruPages.tsx', 'utf8');

// The replacement was:
const block = `const [isLocked, setIsLocked] = useState(false);
  const [semester, setSemester] = useState('Ganjil');

  useEffect(() => {
    apiClient('/crud.php?table=academic_terms').then(data => {
      if (Array.isArray(data)) {
        const selectedTermId = remoteStorage.getItem('selectedAcademicTermId');
        let activeTerm = null;
        if (selectedTermId) activeTerm = data.find((t: any) => String(t.id) === selectedTermId);
        if (!activeTerm) activeTerm = data.find((t: any) => Boolean(t.is_active));
        if (activeTerm) setSemester(activeTerm.semester);
      }
    }).catch(console.error);
  }, []);`;

// I will replace all instances of this block back to just `const [isLocked, setIsLocked] = useState(false);`
file = file.split(block).join("const [isLocked, setIsLocked] = useState(false);");

// And then only add it carefully to InputNilai and Absensi (if it needs it? InputNilai does.)
fs.writeFileSync('src/pages/GuruPages.tsx', file);
