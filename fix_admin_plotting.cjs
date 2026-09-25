const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminTeachingAssignments.tsx', 'utf8');

// Allow multiple teachers in manual save
code = code.replace(
  "const exists = assignments.find(a => a.rombel === rombel && a.mapel === mapel && a.id !== editingId);",
  "const exists = assignments.find(a => a.rombel === rombel && a.mapel === mapel && String(a.guruId) === String(guru) && a.id !== editingId);"
);

// Allow multiple teachers in Excel import
code = code.replace(
  "const existing = assignments.find(a => a.rombel === na.rombel && a.mapel === na.mapel);",
  "const existing = assignments.find(a => a.rombel === na.rombel && a.mapel === na.mapel && String(a.guruId) === String(na.guruId));"
);

fs.writeFileSync('src/pages/AdminTeachingAssignments.tsx', code);
console.log('Fixed Admin Plotting Constraints');
