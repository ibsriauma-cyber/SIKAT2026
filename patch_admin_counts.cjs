const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminReports.tsx', 'utf-8');

const targetAbsensi = `            const studentAtts = studentAttendance.filter(a => a.student_id === s.id && isDateInRange(a.date));
            const hadir = studentAtts.filter(a => a.status === 'Hadir').length;
            const tidakHadir = studentAtts.filter(a => a.status && a.status !== 'Hadir').length;
            return [i + 1, s.nis || '-', s.name || '-', hadir, tidakHadir];`;

const replacementAbsensi = `            const studentAtts = studentAttendance.filter(a => String(a.student_id) === String(s.id) && isDateInRange(a.date));
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
            return [i + 1, s.nis || '-', s.name || '-', hadirCount, tidakHadirCount];`;

if (code.includes(targetAbsensi)) {
  code = code.replace(targetAbsensi, replacementAbsensi);
  console.log("Absensi logic replaced");
} else {
  console.log("targetAbsensi not found");
}

const targetSholat = `            const studentPrayers = ibadahSiswa.filter(a => String(a.student_id) === String(s.id) && isDateInRange(a.date || a.created_at));
            
            const zuhurJamaah = studentPrayers.filter(a => (a.type === 'Zuhur' || String(a.jenis_ibadah).toLowerCase() === 'zuhur') && a.status === 'Jamaah').length;
            const zuhurTidak = studentPrayers.filter(a => (a.type === 'Zuhur' || String(a.jenis_ibadah).toLowerCase() === 'zuhur') && a.status === 'Tidak').length;
            
            const dhuhaJamaah = studentPrayers.filter(a => (a.type === 'Dhuha' || String(a.jenis_ibadah).toLowerCase() === 'dhuha') && a.status === 'Jamaah').length;
            const dhuhaTidak = studentPrayers.filter(a => (a.type === 'Dhuha' || String(a.jenis_ibadah).toLowerCase() === 'dhuha') && a.status === 'Tidak').length;

            return [i + 1, s.nis || '-', s.name || '-', zuhurJamaah, zuhurTidak, dhuhaJamaah, dhuhaTidak];`;

const replacementSholat = `            const studentPrayers = ibadahSiswa.filter(a => String(a.student_id) === String(s.id) && isDateInRange(a.date || a.created_at));
            
            const prayersByDateAndType = {};
            studentPrayers.forEach(a => {
               const d = String(a.date || a.created_at).split(' ')[0];
               let type = String(a.type || a.jenis_ibadah).toLowerCase();
               const key = d + '_' + type;
               if (!prayersByDateAndType[key]) prayersByDateAndType[key] = [];
               prayersByDateAndType[key].push(a.status);
            });
            
            let zuhurJamaah = 0;
            let zuhurTidak = 0;
            let dhuhaJamaah = 0;
            let dhuhaTidak = 0;
            
            Object.keys(prayersByDateAndType).forEach(key => {
               const statuses = prayersByDateAndType[key];
               const hasJamaah = statuses.includes('Jamaah');
               const hasTidak = statuses.includes('Tidak') || statuses.includes('Tidak Jamaah');
               
               if (key.endsWith('zuhur')) {
                  if (hasJamaah) zuhurJamaah++;
                  else if (hasTidak) zuhurTidak++;
               } else if (key.endsWith('dhuha')) {
                  if (hasJamaah) dhuhaJamaah++;
                  else if (hasTidak) dhuhaTidak++;
               }
            });

            return [i + 1, s.nis || '-', s.name || '-', zuhurJamaah, zuhurTidak, dhuhaJamaah, dhuhaTidak];`;

if (code.includes(targetSholat)) {
  code = code.replace(targetSholat, replacementSholat);
  console.log("Sholat logic replaced");
} else {
  console.log("targetSholat not found");
}

fs.writeFileSync('src/pages/AdminReports.tsx', code);
