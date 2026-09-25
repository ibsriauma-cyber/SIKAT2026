const fs = require('fs');
let code = fs.readFileSync('src/components/KamadWeeklyRecapModal.tsx', 'utf-8');

code = code.replace(/title = '3\. UNTUK GURU QUR'AN';/g, 'title = "3. UNTUK GURU QUR\'AN";');
code = code.replace(/{ content: 'Nama Guru Qur'an',/g, '{ content: "Nama Guru Qur\'an",');
code = code.replace(/'Nama Guru Qur'an': s\.name,/g, '"Nama Guru Qur\'an": s.name,');
code = code.replace(/{ id: 'guru_quran', label: '3\. UNTUK GURU QUR'AN' }/g, '{ id: "guru_quran", label: "3. UNTUK GURU QUR\'AN" }');

fs.writeFileSync('src/components/KamadWeeklyRecapModal.tsx', code);
