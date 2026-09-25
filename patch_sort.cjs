const fs = require('fs');
let code = fs.readFileSync('src/pages/KamadPages.tsx', 'utf-8');

const targetSort = `        const [
          users,
          kinerja,
          schedules,
          assignments,
          studentAttendance,
          pemantauanPagi,
          nilaiSikap,
          ibadahSiswa,
          laporanHarian,
          materiAjar,
          classes
        ] = await Promise.all([`;

const replaceSort = `        let [
          users,
          kinerja,
          schedules,
          assignments,
          studentAttendance,
          pemantauanPagi,
          nilaiSikap,
          ibadahSiswa,
          laporanHarian,
          materiAjar,
          classes
        ] = await Promise.all([`;

code = code.replace(targetSort, replaceSort);

const targetAfterFetch = `        const d = new Date();
        const localToday = \`\${d.getFullYear()}-\${String(d.getMonth() + 1).padStart(2, '0')}-\${String(d.getDate()).padStart(2, '0')}\`;`;

const replaceAfterFetch = `        if (Array.isArray(materiAjar)) {
          materiAjar.sort((a, b) => new Date(b.created_at || b.date || 0).getTime() - new Date(a.created_at || a.date || 0).getTime());
        }
        if (Array.isArray(laporanHarian)) {
          laporanHarian.sort((a, b) => new Date(b.created_at || b.date || 0).getTime() - new Date(a.created_at || a.date || 0).getTime());
        }

        const d = new Date();
        const localToday = \`\${d.getFullYear()}-\${String(d.getMonth() + 1).padStart(2, '0')}-\${String(d.getDate()).padStart(2, '0')}\`;`;

code = code.replace(targetAfterFetch, replaceAfterFetch);
fs.writeFileSync('src/pages/KamadPages.tsx', code);
