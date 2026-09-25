const fs = require('fs');
let content = fs.readFileSync('src/pages/GuruPages.tsx', 'utf8');

content = content.replace(
  "const isStrictlyWalas = isWalas && !isGuru;",
  "const isStrictlyWalas = isWalas;"
);

const mapelSelectTarget = `<CustomSelect
                  value={selectedSubject}
                  onChange={(val) => setSelectedSubject(val)}
                  options={availableMapel.map(m => ({ value: m, label: m }))}
                />`;

const mapelSelectReplacement = `<CustomSelect
                  value={selectedSubject}
                  onChange={(val) => setSelectedSubject(val)}
                  options={availableMapel.map(m => ({ value: m, label: m }))}
                  disabled={isStrictlyWalas}
                />`;

if (content.includes(mapelSelectTarget)) {
  content = content.replace(mapelSelectTarget, mapelSelectReplacement);
  console.log("Success replacing Mapel Select");
} else {
  console.log("Mapel Select Target not found");
}

fs.writeFileSync('src/pages/GuruPages.tsx', content);
console.log("Done");
