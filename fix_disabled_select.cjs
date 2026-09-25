const fs = require('fs');
let content = fs.readFileSync('src/pages/GuruPages.tsx', 'utf8');

const classSearch1 = `<CustomSelect
                  value={selectedClass}
                  onChange={(val) => setSelectedClass(val)}
                  options={availableClasses.map(c => ({ value: String(c), label: \`Kelas \${c}\` }))}
                />`;
const classReplace1 = `<CustomSelect
                  value={selectedClass}
                  onChange={(val) => setSelectedClass(val)}
                  options={availableClasses.map(c => ({ value: String(c), label: \`Kelas \${c}\` }))}
                  disabled={isStrictlyWalas}
                />`;

const mapelSearch1 = `<CustomSelect
                  value={selectedSubject}
                  onChange={(val) => setSelectedSubject(val)}
                  options={availableMapel.map(m => ({ value: m, label: m }))}
                  searchable
                />`;
const mapelReplace1 = `<CustomSelect
                  value={selectedSubject}
                  onChange={(val) => setSelectedSubject(val)}
                  options={availableMapel.map(m => ({ value: m, label: m }))}
                  searchable
                  disabled={isStrictlyWalas}
                />`;

if (content.includes(classSearch1)) {
  content = content.replace(classSearch1, classReplace1);
  content = content.replace(mapelSearch1, mapelReplace1);
  fs.writeFileSync('src/pages/GuruPages.tsx', content);
  console.log("Success adding disabled prop");
} else {
  console.log("Could not find CustomSelect to replace");
}
