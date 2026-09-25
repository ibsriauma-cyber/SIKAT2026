const fs = require('fs');
let code = fs.readFileSync('src/pages/InputJadwal.tsx', 'utf8');

code = code.replace(
  "}, [mapel, rombel, assignments, isModalOpen, teachers]);",
  "}, [mapel, rombel, assignments, isModalOpen]); // eslint-disable-line react-hooks/exhaustive-deps"
);

fs.writeFileSync('src/pages/InputJadwal.tsx', code);
console.log('Fixed deps');
