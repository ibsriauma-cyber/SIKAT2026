const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminTeachingAssignments.tsx', 'utf8');

// 1. Add state variable
code = code.replace(
  "const [guru, setGuru] = useState('');",
  "const [guru, setGuru] = useState('');\n  const [assignedRole, setAssignedRole] = useState('guru_mapel');"
);

// 2. Set state when editing
code = code.replace(
  "setGuru(String(assignment.teacher_id));",
  "setGuru(String(assignment.teacher_id));\n    setAssignedRole(assignment.role || 'guru_mapel');"
);

// 3. Set state on reset
code = code.replace(
  "setGuru('');",
  "setGuru('');\n    setAssignedRole('guru_mapel');"
);

// 4. Update the save body
code = code.replace(
  "class_name: rombel",
  "class_name: rombel,\n            role: assignedRole"
);
// note: there are two places for save body, let's just do a regex replace
code = code.replace(
  /subject_name:\s*mapel,\n\s*class_name:\s*rombel/g,
  "subject_name: mapel,\n            class_name: rombel,\n            role: assignedRole"
);

// 5. Add the dropdown
const dropdownStr = `
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Role Penugasan</label>
                <CustomSelect value={assignedRole} onChange={v => setAssignedRole(v)} options={[{ value: 'guru_mapel', label: 'Guru Mapel' }, { value: 'guru_quran', label: 'Guru Qur\\'an' }]} />
              </div>
`;

code = code.replace(
  /<div>\s*<label className="block text-xs font-bold text-slate-500 uppercase mb-1">Guru Pengajar<\/label>[\s\S]*?<\/div>/,
  match => match + "\n" + dropdownStr
);

// 6. Fix Excel import
code = code.replace(
  /class_name:\s*kelas,\n\s*subject_name:\s*mapel/g,
  "class_name: kelas,\n            subject_name: mapel,\n            role: row['Role'] || 'guru_mapel'"
);
// Also fix Excel template export
code = code.replace(
  "'Guru Pengajar': 'Budi Santoso'",
  "'Guru Pengajar': 'Budi Santoso',\n      'Role': 'guru_mapel'"
);
code = code.replace(
  "'Guru Pengajar': 'Siti Aminah'",
  "'Guru Pengajar': 'Siti Aminah',\n      'Role': 'guru_quran'"
);

fs.writeFileSync('src/pages/AdminTeachingAssignments.tsx', code);
console.log('Fixed AdminTeachingAssignments.tsx');
