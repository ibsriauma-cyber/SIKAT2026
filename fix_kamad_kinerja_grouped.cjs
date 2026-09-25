const fs = require('fs');

let code = fs.readFileSync('src/pages/KamadPages.tsx', 'utf8');

const replacementDataTransform = `
        let mappedStaf: any[] = [];
        filteredUsers.forEach((u: any) => {
          const r = u.roles ? (typeof u.roles === 'string' ? JSON.parse(u.roles) : u.roles) : [u.role];
          const todayString = new Date().toLocaleDateString('en-CA');
          const userKinerja = Array.isArray(kinerja) ? kinerja.filter((k: any) => {
            if (String(k.user_id) !== String(u.id) || !k.created_at) return false;
            const taskDate = new Date(k.created_at).toLocaleDateString('en-CA');
            return taskDate === todayString;
          }) : [];

          let allTasks: any[] = [];

          const addSingleTask = (taskName: string, group: string) => {
             const found = userKinerja.find((k: any) => k.task === taskName);
             allTasks.push({
                group,
                name: taskName,
                status: found ? (found.status === 'Selesai' ? 'selesai' : 'proses') : 'belum',
                time: found ? new Date(found.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB' : 'Dalam Jam Kerja',
                detail: found ? '' : ''
             });
          };

          const addGroupedTask = (baseTaskName: string, expectedCount: number, actualMatches: any[], group: string) => {
             const tuntas = actualMatches.length;
             let status = 'belum';
             if (tuntas > 0 && tuntas < expectedCount) status = 'proses';
             else if (tuntas >= expectedCount && expectedCount > 0) status = 'selesai';
             
             let timeStr = 'Dalam Jam Kerja';
             if (tuntas > 0) {
                const latest = actualMatches.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
                timeStr = new Date(latest.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
             }

             allTasks.push({
                group,
                name: baseTaskName,
                status: status,
                time: timeStr,
                detail: \`\${tuntas}/\${expectedCount} Kelas\`
             });
          };

          if (r.includes('walas')) {
             addSingleTask('Absensi siswa binaan pada pagi hari', 'WALI KELAS');
             addSingleTask('Pemantauan pagi, cek piket dan kelengkapan siswa', 'WALI KELAS');
             addSingleTask('Mengisi Nilai Sikap & Karakter siswa', 'WALI KELAS');
             addSingleTask('Mengabsen sholat Zuhur siswa kelas binaannya', 'WALI KELAS');
          }

          if (r.includes('guru') || r.includes('guru_mapel')) {
             const mySchedules = todaySchedules.filter((s: any) => String(s.teacher_id) === String(u.id));
             let uniqueSchedules: string[][] = [];
             if (mySchedules.length > 0) {
               uniqueSchedules = Array.from(new Set(mySchedules.map((s: any) => \`\${s.class_name}:::\${s.subject_name}\`))).map(s => (s as string).split(':::'));
             }
             
             if (uniqueSchedules.length > 0) {
                const totalClasses = uniqueSchedules.length;
                const jurnals = userKinerja.filter((k:any) => k.task.startsWith('Jurnal Ajar'));
                const moduls = userKinerja.filter((k:any) => k.task.startsWith('Membuat Modul Ajar'));
                addGroupedTask('Jurnal Ajar', totalClasses, jurnals, 'GURU MAPEL');
                addGroupedTask('Perangkat / Modul Ajar', totalClasses, moduls, 'GURU MAPEL');
             }
          }

          if (r.includes('guru_quran')) {
             const mySchedules = todaySchedules.filter((s: any) => String(s.teacher_id) === String(u.id));
             let uniqueSchedules: string[][] = [];
             if (mySchedules.length > 0) {
               uniqueSchedules = Array.from(new Set(mySchedules.map((s: any) => \`\${s.class_name}:::\${s.subject_name}\`))).map(s => (s as string).split(':::'));
             }
             
             if (uniqueSchedules.length > 0) {
                const totalClasses = uniqueSchedules.length;
                const jurnals = userKinerja.filter((k:any) => k.task.startsWith('Jurnal Ajar'));
                const moduls = userKinerja.filter((k:any) => k.task.startsWith('Membuat Modul Ajar'));
                addGroupedTask('Jurnal Ajar', totalClasses, jurnals, 'GURU QUR\\'AN');
                addGroupedTask('Perangkat / Modul Ajar', totalClasses, moduls, 'GURU QUR\\'AN');
             }
             addSingleTask('Mengabsen siswa sholat Dhuha', 'GURU QUR\\'AN');
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
              mappedStaf.push({
                id: u.id,
                name: u.name,
                role: roleDisplays.join(', '),
                kelas: u.class_name || '-',
                roles: r,
                tasks: allTasks,
                weeklyStats: {
                  completionRate: completionRate,
                  violations: violations
                }
              });
          }
        });
`;

// Replace data transformation logic
const startMarkerTransform = "let mappedStaf: any[] = [];";
const endMarkerTransform = "setStafList(mappedStaf);";
const startIdxTransform = code.indexOf(startMarkerTransform);
const endIdxTransform = code.indexOf(endMarkerTransform);
if (startIdxTransform !== -1 && endIdxTransform !== -1) {
  code = code.substring(0, startIdxTransform) + replacementDataTransform + "\n        " + code.substring(endIdxTransform);
}

// Replace popup rendering logic
const popupStartMarker = "<h4 className=\"text-xs font-black uppercase tracking-wider text-slate-400 mb-4\">Daftar Jobdesk Hari Ini</h4>";
const popupEndMarker = "</div>\n            </div>\n            <div className=\"p-4 border-t border-slate-100 bg-slate-50 flex justify-end\">";

const replacementPopup = `
              <div className="space-y-5">
                {Array.from(new Set(selectedStaf.tasks.map((t: any) => t.group))).map((groupName: any) => {
                  const groupTasks = selectedStaf.tasks.filter((t: any) => t.group === groupName);
                  return (
                    <div key={groupName} className="mb-2">
                       <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">DAFTAR JOBDESK HARI INI ({groupName})</h4>
                       <div className="space-y-3">
                          {groupTasks.map((task: any, idx: number) => {
                            let statusStyle = '';
                            let TaskIcon = CheckCircle2;
                            let statusText = task.status;

                            if (task.status === 'selesai') {
                              statusStyle = 'bg-emerald-50 border-emerald-100 text-emerald-700';
                              TaskIcon = CheckCircle2;
                              statusText = 'SELESAI';
                            } else if (task.status === 'proses') {
                              statusStyle = 'bg-blue-50 border-blue-100 text-blue-700';
                              TaskIcon = Clock;
                              statusText = 'PROSES';
                            } else if (task.status === 'terlewat') {
                              statusStyle = 'bg-rose-50 border-rose-100 text-rose-700';
                              TaskIcon = XCircle;
                              statusText = 'TERLEWAT';
                            } else {
                              statusStyle = 'bg-amber-50 border-amber-100 text-amber-700';
                              TaskIcon = Clock;
                              statusText = 'BELUM';
                            }

                            return (
                              <div key={idx} className={\`p-4 rounded-xl border flex items-center justify-between gap-3 \${statusStyle}\`}>
                                <div className="flex items-center gap-3">
                                  <TaskIcon className="w-5 h-5 shrink-0" />
                                  <div>
                                    <p className="text-sm font-bold">{task.name}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <p className="text-[10px] opacity-80">{task.time}</p>
                                      {task.detail && <span className="text-[10px] font-bold px-1.5 py-0.5 bg-white/50 rounded-full opacity-90">{task.detail}</span>}
                                    </div>
                                  </div>
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-1 bg-white/50 rounded-md">
                                  {statusText}
                                </span>
                              </div>
                            );
                          })}
                       </div>
                    </div>
                  );
                })}
`;

const popupStartIdx = code.indexOf(popupStartMarker);
const popupEndIdx = code.indexOf(popupEndMarker);
if (popupStartIdx !== -1 && popupEndIdx !== -1) {
  code = code.substring(0, popupStartIdx) + replacementPopup + code.substring(popupEndIdx);
}

// Replace filter logic
const filterStart = "const filteredList = stafList.filter(s => {";
const filterEnd = "});\n  const totalStaf";
const replacementFilter = `const filteredList = stafList.filter(s => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pelanggaran') return s.tasks.some((t: any) => t.status === 'terlewat');
    return (s.roles || []).includes(activeTab) || (activeTab === 'guru_mapel' && s.roles?.includes('guru'));
  `;

const filtStartIdx = code.indexOf(filterStart);
const filtEndIdx = code.indexOf(filterEnd);
if (filtStartIdx !== -1 && filtEndIdx !== -1) {
   code = code.substring(0, filtStartIdx) + replacementFilter + code.substring(filtEndIdx);
}

fs.writeFileSync('src/pages/KamadPages.tsx', code);
console.log("Successfully applied grouped jobdesk changes");
