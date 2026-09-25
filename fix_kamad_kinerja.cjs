const fs = require('fs');

let code = fs.readFileSync('src/pages/KamadPages.tsx', 'utf8');

const replacement = `
        let mappedStaf: any[] = [];
        filteredUsers.forEach((u: any) => {
          const r = u.roles ? (typeof u.roles === 'string' ? JSON.parse(u.roles) : u.roles) : [u.role];
          const todayString = new Date().toLocaleDateString('en-CA');
          const userKinerja = Array.isArray(kinerja) ? kinerja.filter((k: any) => {
            if (String(k.user_id) !== String(u.id) || !k.created_at) return false;
            const taskDate = new Date(k.created_at).toLocaleDateString('en-CA');
            return taskDate === todayString;
          }) : [];

          const processTasks = (requiredTasks: string[], roleName: string, category: string) => {
            let tasks = requiredTasks.map(taskName => {
              const found = userKinerja.find((k: any) => k.task === taskName);
              if (found) {
                return {
                  name: taskName,
                  status: found.status === 'Selesai' ? 'selesai' : 'belum',
                  time: new Date(found.created_at).toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit'
                  }) + ' WIB'
                };
              } else {
                return {
                  name: taskName,
                  status: 'belum',
                  time: 'Dalam Jam Kerja'
                };
              }
            });
            const tuntas = tasks.filter((t: any) => t.status === 'selesai').length;
            const totalTasks = tasks.length;
            const completionRate = totalTasks > 0 ? Math.round(tuntas / totalTasks * 100) : 0;
            const violations = tasks.filter((t: any) => t.status === 'terlewat').length;
            mappedStaf.push({
              id: u.id + '_' + category,
              name: u.name,
              role: roleName,
              kelas: u.class_name || '-',
              category: category,
              tasks: tasks,
              weeklyStats: {
                completionRate: completionRate,
                violations: violations
              }
            });
          };

          if (r.includes('walas')) {
            processTasks([
              'Absensi siswa binaan pada pagi hari',
              'Pemantauan pagi, cek piket dan kelengkapan siswa',
              'Mengisi Nilai Sikap & Karakter siswa',
              'Mengabsen sholat Zuhur siswa kelas binaannya'
            ], 'Wali Kelas', 'walas');
          }

          if (r.includes('guru') || r.includes('guru_mapel')) {
            const mySchedules = todaySchedules.filter((s: any) => String(s.teacher_id) === String(u.id));
            let requiredTasks: string[] = [];
            if (mySchedules.length > 0) {
              const uniqueSchedules = Array.from(new Set(mySchedules.map((s: any) => \`\${s.class_name}:::\${s.subject_name}\`))).map(s => (s as string).split(':::'));
              uniqueSchedules.forEach(([className, subjectName]) => {
                requiredTasks.push(\`Jurnal Ajar \${className} (\${subjectName})\`);
                requiredTasks.push(\`Membuat Modul Ajar \${className} (\${subjectName})\`);
              });
            }
            if (requiredTasks.length > 0) {
              processTasks(requiredTasks, 'Guru Mapel', 'guru_mapel');
            }
          }

          if (r.includes('guru_quran')) {
            const mySchedules = todaySchedules.filter((s: any) => String(s.teacher_id) === String(u.id));
            let requiredTasks: string[] = ['Mengabsen siswa sholat Dhuha'];
            if (mySchedules.length > 0) {
              const uniqueSchedules = Array.from(new Set(mySchedules.map((s: any) => \`\${s.class_name}:::\${s.subject_name}\`))).map(s => (s as string).split(':::'));
              uniqueSchedules.forEach(([className, subjectName]) => {
                requiredTasks.push(\`Jurnal Ajar \${className} (\${subjectName})\`);
                requiredTasks.push(\`Membuat Modul Ajar \${className} (\${subjectName})\`);
              });
            }
            processTasks(requiredTasks, 'Guru Qur\\'an', 'guru_quran');
          }
        });
`;

// we need to replace from `const mappedStaf = filteredUsers.map...` to `setStafList(mappedStaf);`
const startMarker = "const mappedStaf = filteredUsers.map((u: any, index: number) => {";
const endMarker = "setStafList(mappedStaf);";

const startIndex = code.indexOf(startMarker);
const endIndex = code.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
  const newCode = code.substring(0, startIndex) + replacement + "\n        " + code.substring(endIndex);
  fs.writeFileSync('src/pages/KamadPages.tsx', newCode);
  console.log("Successfully replaced Kinerja Staf logic");
} else {
  console.log("Could not find markers!");
}
