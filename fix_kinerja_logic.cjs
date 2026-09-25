const fs = require('fs');
let code = fs.readFileSync('src/pages/KamadPages.tsx', 'utf8');

const logicStart = "const addSingleTask = (taskName: string, group: string) => {";
const logicEnd = "if (allTasks.length > 0) {";

// We will replace everything between logicStart and logicEnd (exclusive).
const regex = new RegExp("const addSingleTask = \\(taskName: string, group: string\\) => \\{[\\s\\S]*?if \\(allTasks\\.length > 0\\) \\{");

const newLogic = `
          const isTimePastDeadline = (timeStr: string, deadline: string) => {
            if (!timeStr || !deadline) return false;
            const [h1, m1] = timeStr.split(':').map(Number);
            const [h2, m2] = deadline.split(':').map(Number);
            if (h1 > h2) return true;
            if (h1 === h2 && m1 > m2) return true;
            return false;
          };

          const now = new Date();
          const currentHourMin = \`\${now.getHours().toString().padStart(2, '0')}:\${now.getMinutes().toString().padStart(2, '0')}\`;
          const todayStr = now.toISOString().split('T')[0];
          const isPastDate = filterDateStr < todayStr;

          const addSingleTask = (taskName: string, group: string, deadline?: string) => {
             const found = userKinerja.find((k: any) => k.task === taskName);
             let status = 'belum';
             let timeStr = 'Dalam Jam Kerja';
             
             if (found) {
                 status = found.status === 'Selesai' ? 'selesai' : 'proses';
                 timeStr = new Date(found.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
                 if (deadline && found.created_at) {
                     const doneTime = found.created_at.split(' ')[1]?.substring(0, 5);
                     if (doneTime && isTimePastDeadline(doneTime, deadline)) {
                         status = 'terlewat';
                     }
                 }
             } else {
                 if (isPastDate) {
                     status = 'terlewat';
                 } else if (deadline && isTimePastDeadline(currentHourMin, deadline)) {
                     status = 'terlewat';
                 }
             }

             allTasks.push({
                group,
                name: taskName,
                status: status,
                time: timeStr,
                detail: deadline ? \`Batas: \${deadline} WIB\` : ''
             });
          };

          if (r.includes('walas')) {
             addSingleTask('Absensi siswa binaan pada pagi hari', 'WALI KELAS', '07:30');
             addSingleTask('Pemantauan pagi, cek piket dan kelengkapan siswa', 'WALI KELAS', '07:30');
             addSingleTask('Mengisi Nilai Sikap & Karakter siswa', 'WALI KELAS', '07:30');
             addSingleTask('Mengabsen sholat Zuhur siswa kelas binaannya', 'WALI KELAS', '13:30');
          }

          if (r.includes('guru') || r.includes('guru_mapel')) {
             const mySchedules = todaySchedules.filter((s: any) => {
               if (String(s.teacher_id) !== String(u.id)) return false;
               const assign = Array.isArray(assignments) ? assignments.find((a: any) => String(a.teacher_id) === String(u.id) && a.subject_name === s.subject_name && a.class_name === s.class_name) : null;
               const role = assign?.role || 'guru_mapel';
               return role === 'guru_mapel' || role === 'guru';
             });
             
             // group unique schedules but keep jamSelesai
             const uniqueMap = new Map();
             mySchedules.forEach((s: any) => {
                 const key = \`\${s.class_name}:::\${s.subject_name}\`;
                 if (!uniqueMap.has(key) || s.jamSelesai > uniqueMap.get(key).jamSelesai) {
                     uniqueMap.set(key, s);
                 }
             });
             
             uniqueMap.forEach((s: any) => {
                 const deadline = s.jamSelesai;
                 addSingleTask(\`Absen \${s.class_name} (\${s.subject_name})\`, 'GURU MAPEL', deadline);
                 addSingleTask(\`Jurnal Ajar \${s.class_name} (\${s.subject_name})\`, 'GURU MAPEL', deadline);
                 addSingleTask(\`Membuat Modul Ajar \${s.class_name} (\${s.subject_name})\`, 'GURU MAPEL', deadline);
             });
          }

          if (r.includes('guru_quran')) {
             const mySchedules = todaySchedules.filter((s: any) => {
               if (String(s.teacher_id) !== String(u.id)) return false;
               const assign = Array.isArray(assignments) ? assignments.find((a: any) => String(a.teacher_id) === String(u.id) && a.subject_name === s.subject_name && a.class_name === s.class_name) : null;
               return assign?.role === 'guru_quran';
             });
             
             const uniqueMap = new Map();
             mySchedules.forEach((s: any) => {
                 const key = \`\${s.class_name}:::\${s.subject_name}\`;
                 if (!uniqueMap.has(key) || s.jamSelesai > uniqueMap.get(key).jamSelesai) {
                     uniqueMap.set(key, s);
                 }
             });
             
             uniqueMap.forEach((s: any) => {
                 const deadline = s.jamSelesai;
                 addSingleTask(\`Absen \${s.class_name} (\${s.subject_name})\`, 'GURU QUR\\'AN', deadline);
                 addSingleTask(\`Jurnal Ajar \${s.class_name} (\${s.subject_name})\`, 'GURU QUR\\'AN', deadline);
                 addSingleTask(\`Membuat Modul Ajar \${s.class_name} (\${s.subject_name})\`, 'GURU QUR\\'AN', deadline);
             });
             
             addSingleTask('Mengabsen siswa sholat Dhuha', 'GURU QUR\\'AN', '12:00');
          }
          
          if (r.includes('bk')) addSingleTask('Mengisi Laporan Harian BK', 'GURU BK');
          if (r.includes('pustakawan')) addSingleTask('Mengisi Laporan Perpustakaan', 'PUSTAKAWAN');

          const tuntas = allTasks.filter((t: any) => t.status === 'selesai').length;
          const totalTasks = allTasks.length;
          const completionRate = totalTasks > 0 ? Math.round(tuntas / totalTasks * 100) : 0;
          const violations = allTasks.filter((t: any) => t.status === 'terlewat').length;

          const roleDisplays: string[] = [];
          if (r.includes('walas')) roleDisplays.push('Wali Kelas');
          if (r.includes('guru') || r.includes('guru_mapel')) roleDisplays.push('Guru Mapel');
          if (r.includes('guru_quran')) roleDisplays.push('Guru Qur\\'an');
          if (r.includes('bk')) roleDisplays.push('Guru BK');
          if (r.includes('pustakawan')) roleDisplays.push('Pustakawan');

          if (allTasks.length > 0) {
`;

code = code.replace(regex, newLogic);
fs.writeFileSync('src/pages/KamadPages.tsx', code);
console.log('Fixed Kinerja Evaluation logic');
