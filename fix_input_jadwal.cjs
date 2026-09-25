const fs = require('fs');
let code = fs.readFileSync('src/pages/InputJadwal.tsx', 'utf8');

const lockLogicOld = `
  const [isGuruLocked, setIsGuruLocked] = useState(false);
  useEffect(() => {
    if (mapel && rombel && isModalOpen) {
      const assignment = assignments.find(a => a.mapel === mapel && a.rombel === rombel);
      if (assignment) {
        setGuru(assignment.guruId);
        setIsGuruLocked(true);
      } else {
        setIsGuruLocked(false);
      }
    } else {
      setIsGuruLocked(false);
    }
  }, [mapel, rombel, assignments, isModalOpen]);
`;

const lockLogicNew = `
  const [allowedTeachers, setAllowedTeachers] = useState<any[]>([]);
  useEffect(() => {
    if (mapel && rombel && isModalOpen) {
      const matchingAssignments = assignments.filter(a => a.mapel === mapel && a.rombel === rombel);
      const allowedIds = matchingAssignments.map(a => String(a.guruId));
      
      const filtered = teachers.filter(t => allowedIds.includes(String(t.id)));
      setAllowedTeachers(filtered);
      
      if (filtered.length === 1) {
        setGuru(String(filtered[0].id));
      } else if (filtered.length === 0) {
        setGuru('');
      } else {
        // If the currently selected guru is not in the allowed list, reset it
        if (!allowedIds.includes(guru)) {
          setGuru('');
        }
      }
    } else {
      setAllowedTeachers(teachers);
    }
  }, [mapel, rombel, assignments, isModalOpen, teachers]);
`;

code = code.replace(
  /const \[isGuruLocked, setIsGuruLocked\] = useState\(false\);\n\s*useEffect\(\(\) => \{\n\s*if \(mapel && rombel && isModalOpen\) \{\n\s*const assignment = assignments.find\(a => a\.mapel === mapel && a\.rombel === rombel\);\n\s*if \(assignment\) \{\n\s*setGuru\(assignment\.guruId\);\n\s*setIsGuruLocked\(true\);\n\s*\} else \{\n\s*setIsGuruLocked\(false\);\n\s*\}\n\s*\} else \{\n\s*setIsGuruLocked\(false\);\n\s*\}\n\s*\}, \[mapel, rombel, assignments, isModalOpen\]\);/,
  lockLogicNew
);

code = code.replace(
  "{isGuruLocked && <span className=\"text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full\">Terkunci (Plotting)</span>}",
  "{allowedTeachers.length === 0 && mapel ? <span className=\"text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full\">Belum Diplotting</span> : <span className=\"text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full\">Sesuai Plotting</span>}"
);

code = code.replace(
  /options=\{teachers\.map\(t => \(\{\n\s*value: String\(t\.id\),\n\s*label: t\.name\n\s*\}\)\)\} placeholder="Pilih Guru" searchable=\{true\} disabled=\{isGuruLocked\} \/>/g,
  `options={allowedTeachers.map(t => ({
              value: String(t.id),
              label: t.name
            }))} placeholder={allowedTeachers.length === 0 ? "Belum ada guru yang diplotting" : "Pilih Guru"} searchable={true} disabled={allowedTeachers.length === 0} />`
);

fs.writeFileSync('src/pages/InputJadwal.tsx', code);
console.log('Fixed Input Jadwal Logic');
