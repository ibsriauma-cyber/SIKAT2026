const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminReports.tsx', 'utf-8');

const targetAbsensi = `      case 'absensi_siswa':
        isGrouped = true;
        headers = ['No', 'NIS', 'Nama Siswa', 'Hadir', 'Tidak Hadir'];
        classes.forEach(c => {
          const classRows = currentStudents.filter(s => (s.class_name || s.className || '').trim() === (c.name || '').trim()).map((s, i) => {
            const studentAtts = studentAttendance.filter(a => String(a.student_id) === String(s.id) && isDateInRange(a.date));
            const recordsByDate = {};
            studentAtts.forEach(a => {
               const d = String(a.date).split(' ')[0];
               if (!recordsByDate[d]) recordsByDate[d] = [];
               recordsByDate[d].push(a.status);
            });
            
            let hadirCount = 0;
            let tidakHadirCount = 0;
            
            Object.keys(recordsByDate).forEach(d => {
               const statuses = recordsByDate[d];
               if (statuses.includes('Hadir')) {
                 hadirCount++;
               } else if (statuses.some(st => st && st !== 'Hadir')) {
                 tidakHadirCount++;
               }
            });
            return [i + 1, s.nis || '-', s.name || '-', hadirCount, tidakHadirCount];
          });`;

const replacementAbsensi = `      case 'absensi_siswa':
        isGrouped = true;
        headers = ['No', 'NIS', 'Nama Siswa', 'Walas (Hadir)', 'Walas (Tidak)', 'Guru (Hadir)', 'Guru (Tidak)'];
        classes.forEach(c => {
          const classRows = currentStudents.filter(s => (s.class_name || s.className || '').trim() === (c.name || '').trim()).map((s, i) => {
            const studentAtts = studentAttendance.filter(a => String(a.student_id) === String(s.id) && isDateInRange(a.date));
            const recordsByDate = {};
            studentAtts.forEach(a => {
               const d = String(a.date).split(' ')[0];
               if (!recordsByDate[d]) recordsByDate[d] = { walas: [], guru: [] };
               
               const isWalas = a.subject_name === 'Presensi Wali Kelas' || !a.subject_name || String(a.subject_name).toLowerCase().includes('wali kelas');
               
               if (isWalas) {
                 recordsByDate[d].walas.push(a.status);
               } else {
                 recordsByDate[d].guru.push(a.status);
               }
            });
            
            let walasHadir = 0;
            let walasTidak = 0;
            let guruHadir = 0;
            let guruTidak = 0;
            
            Object.keys(recordsByDate).forEach(d => {
               const dayData = recordsByDate[d];
               
               if (dayData.walas.includes('Hadir')) {
                 walasHadir++;
               } else if (dayData.walas.some(st => st && st !== 'Hadir')) {
                 walasTidak++;
               }
               
               if (dayData.guru.includes('Hadir')) {
                 guruHadir++;
               } else if (dayData.guru.some(st => st && st !== 'Hadir')) {
                 guruTidak++;
               }
            });
            return [i + 1, s.nis || '-', s.name || '-', walasHadir, walasTidak, guruHadir, guruTidak];
          });`;

if (code.includes(targetAbsensi)) {
  code = code.replace(targetAbsensi, replacementAbsensi);
  fs.writeFileSync('src/pages/AdminReports.tsx', code);
  console.log("Absensi logic replaced");
} else {
  console.log("targetAbsensi not found");
}
