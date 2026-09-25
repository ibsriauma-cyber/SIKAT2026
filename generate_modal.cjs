const fs = require('fs');

const modalCode = `import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, FileText, FileSpreadsheet, Loader2, Download } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  baseDate: string; // The date from which we find the Monday
}

export function KamadWeeklyRecapModal({ isOpen, onClose, baseDate }: Props) {
  const [loading, setLoading] = useState(true);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'walas' | 'guru_quran' | 'guru_mapel'>('walas');

  useEffect(() => {
    if (!isOpen) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        let [
          users, kinerja, schedules, assignments, studentAttendance, 
          pemantauanPagi, nilaiSikap, ibadahSiswa, laporanHarian, materiAjar, classes
        ] = await Promise.all([
          apiClient('/crud.php?table=users').catch(() => []),
          apiClient('/crud.php?table=kinerja_staf').catch(() => []),
          apiClient('/crud.php?table=schedules').catch(() => []),
          apiClient('/crud.php?table=teaching_assignments').catch(() => []),
          apiClient('/crud.php?table=student_attendance').catch(() => []),
          apiClient('/crud.php?table=pemantauan_pagi').catch(() => []),
          apiClient('/crud.php?table=nilai_sikap').catch(() => []),
          apiClient('/crud.php?table=ibadah_siswa').catch(() => []),
          apiClient('/crud.php?table=laporan_harian').catch(() => []),
          apiClient('/crud.php?table=materi_ajar').catch(() => []),
          apiClient('/crud.php?table=classes').catch(() => [])
        ]);

        if (Array.isArray(materiAjar)) {
          materiAjar.sort((a, b) => new Date(b.created_at || b.date || 0).getTime() - new Date(a.created_at || a.date || 0).getTime());
        }
        if (Array.isArray(laporanHarian)) {
          laporanHarian.sort((a, b) => new Date(b.created_at || b.date || 0).getTime() - new Date(a.created_at || a.date || 0).getTime());
        }

        const filteredUsers = Array.isArray(users) ? users.filter((u: any) => {
          const r = u.roles ? typeof u.roles === 'string' ? JSON.parse(u.roles) : u.roles : [u.role];
          return r.includes('guru') || r.includes('walas') || r.includes('guru_quran') || r.includes('tendik') || r.includes('bk') || r.includes('pustakawan');
        }) : [];

        // Find the Monday of the baseDate
        const d = new Date(baseDate);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        const startOfWeek = new Date(d.setDate(diff));
        
        let mappedStaf: any[] = [];
        
        filteredUsers.forEach((u: any) => {
          const r = u.roles ? (typeof u.roles === 'string' ? JSON.parse(u.roles) : u.roles) : [u.role];
          let stats = {
            tepatWaktu: 0,
            telat: 0,
            terlewat: 0,
            totalKewajiban: 0
          };

          // Loop from Monday (0) to Saturday (5)
          for (let i = 0; i < 6; i++) {
            const currentDay = new Date(startOfWeek);
            currentDay.setDate(startOfWeek.getDate() + i);
            const currentDayName = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][currentDay.getDay()];
            const filterDateStr = \`\${currentDay.getFullYear()}-\${String(currentDay.getMonth() + 1).padStart(2, '0')}-\${String(currentDay.getDate()).padStart(2, '0')}\`;
            
            const todaySchedules = Array.isArray(schedules) ? schedules.filter((s: any) => s.day === currentDayName) : [];
            const userKinerja = Array.isArray(kinerja) ? kinerja.filter((k: any) => {
              if (String(k.user_id) !== String(u.id) || !k.created_at) return false;
              let taskDate = '';
              if (k.created_at) {
                const match = String(k.created_at).match(/^(\d{4}-\d{2}-\d{2})/);
                if (match) taskDate = match[1];
              }
              return taskDate === filterDateStr;
            }) : [];
            
            const parseHM = (timeStr?: string): { hour: number; minute: number } | null => {
              if (!timeStr) return null;
              const match = String(timeStr).trim().match(/(\d{1,2}):(\d{2})/);
              return match ? { hour: parseInt(match[1], 10), minute: parseInt(match[2], 10) } : null;
            };
            const isTimePastDeadline = (doneHM: string, deadlineHM: string) => {
              const t1 = parseHM(doneHM);
              const t2 = parseHM(deadlineHM);
              if (!t1 || !t2) return false;
              if (t1.hour > t2.hour) return true;
              if (t1.hour === t2.hour && t1.minute > t2.minute) return true;
              return false;
            };
            
            let allTasks: any[] = [];
            const addSingleTask = (
              taskName: string, group: string, idealDeadline?: string, finalDeadline?: string, customCheckFn?: () => any
            ) => {
              const foundKinerja = userKinerja.find((k: any) => String(k.task).toLowerCase() === String(taskName).toLowerCase());
              let isDone = false;
              let doneAtStr: string | null = null;
              if (foundKinerja) {
                isDone = true;
                doneAtStr = foundKinerja.created_at || null;
              } else if (customCheckFn) {
                const customRes = customCheckFn();
                if (customRes?.completed) {
                  isDone = true;
                  doneAtStr = customRes.completedAt || null;
                }
              }

              let status = 'proses';
              if (isDone) {
                let doneHM: string | null = null;
                if (doneAtStr) {
                  const match = String(doneAtStr).trim().match(/T?\s?(\d{2}):(\d{2})/);
                  if (match) doneHM = \`\${match[1]}:\${match[2]}\`;
                }
                const isLate = Boolean(idealDeadline && doneHM && isTimePastDeadline(doneHM, idealDeadline));
                status = isLate ? 'selesai_telat' : 'selesai';
              } else {
                // Determine if it's terlewat
                const now = new Date();
                const todayStr = \`\${now.getFullYear()}-\${String(now.getMonth() + 1).padStart(2, '0')}-\${String(now.getDate()).padStart(2, '0')}\`;
                const isPastDate = filterDateStr < todayStr;
                let isFinalLate = false;
                if (isPastDate) isFinalLate = true;
                else if (filterDateStr === todayStr && finalDeadline) {
                  const currentHourMin = \`\${now.getHours().toString().padStart(2, '0')}:\${now.getMinutes().toString().padStart(2, '0')}\`;
                  isFinalLate = isTimePastDeadline(currentHourMin, finalDeadline);
                }
                if (isFinalLate) status = 'terlewat';
              }
              allTasks.push({ status });
            };

            // ---- COPY TASK GENERATION LOGIC ----
            // We use a simplified version because we only need the statuses.
            if (r.includes('walas')) {
              addSingleTask('Absensi siswa binaan pada pagi hari', 'WALI KELAS', '08:00', '11:00', () => {
                if (!Array.isArray(studentAttendance)) return null;
                const match = studentAttendance.find((sa: any) => String(sa.date).startsWith(filterDateStr) && sa.subject_name === 'Presensi Wali Kelas' && String(sa.user_id) === String(u.id));
                if (match) return { completed: true, completedAt: match.created_at || match.timestamp };
                return null;
              });
              addSingleTask('Mengabsen sholat Zuhur siswa kelas binaannya', 'WALI KELAS', '13:00', '17:00', () => {
                if (!Array.isArray(ibadahSiswa)) return null;
                const match = ibadahSiswa.find((ib: any) => String(ib.date).startsWith(filterDateStr) && ib.type === 'Zuhur' && String(ib.class_name) === String(u.class_name));
                if (match) return { completed: true, completedAt: match.created_at || match.timestamp };
                return null;
              });
            }
            if (r.includes('guru') || r.includes('guru_mapel')) {
              addSingleTask('Pemantauan pagi, cek piket dan kelengkapan siswa', 'GURU MAPEL', '07:30', '10:00', () => {
                if (!Array.isArray(pemantauanPagi)) return null;
                const match = pemantauanPagi.find((p: any) => String(p.date).startsWith(filterDateStr) && String(p.user_id) === String(u.id));
                if (match) return { completed: true, completedAt: match.created_at || match.timestamp };
                return null;
              });
              addSingleTask('Penilaian Sikap Harian', 'GURU MAPEL', '14:00', '17:00', () => {
                if (!Array.isArray(nilaiSikap)) return null;
                const match = nilaiSikap.find((ns: any) => String(ns.date).startsWith(filterDateStr) && String(ns.user_id) === String(u.id));
                if (match) return { completed: true, completedAt: match.created_at || match.timestamp };
                return null;
              });
              const myAssignments = Array.isArray(assignments) ? assignments.filter((a: any) => String(a.teacher_id) === String(u.id)) : [];
              const mySchedules = todaySchedules.filter((s: any) => myAssignments.some((a: any) => a.class_name === s.class_name && a.subject_name === s.subject_name));
              mySchedules.forEach((s: any) => {
                const deadline = s.end_time || '15:00';
                addSingleTask(\`Absen \${s.class_name} (\${s.subject_name})\`, 'GURU MAPEL', deadline, '17:00', () => {
                  if (!Array.isArray(studentAttendance)) return null;
                  const match = studentAttendance.find((sa: any) => String(sa.date).startsWith(filterDateStr) && sa.class_name === s.class_name && sa.subject_name === s.subject_name);
                  if (match) return { completed: true, completedAt: match.created_at || match.timestamp };
                  return null;
                });
                addSingleTask(\`Jurnal Ajar \${s.class_name} (\${s.subject_name})\`, 'GURU MAPEL', deadline, '17:00', () => {
                  if (!Array.isArray(laporanHarian)) return null;
                  const match = laporanHarian.find((lh: any) => (String(lh.tanggal).startsWith(filterDateStr) || String(lh.date).startsWith(filterDateStr)) && lh.class_name === s.class_name && lh.subject_name === s.subject_name);
                  if (match) return { completed: true, completedAt: match.created_at || match.timestamp };
                  return null;
                });
                addSingleTask(\`Membuat Modul Ajar \${s.class_name} (\${s.subject_name})\`, 'GURU MAPEL', deadline, '17:00', () => {
                  if (!Array.isArray(materiAjar)) return null;
                  const match = materiAjar.find((ma: any) => ma.class_name === s.class_name && (ma.subject === s.subject_name || ma.subject_name === s.subject_name) && (String(ma.user_id) === String(u.id) || !ma.user_id));
                  if (match) return { completed: true, completedAt: match.created_at || match.timestamp || match.date };
                  return null;
                });
              });
            }
            if (r.includes('guru_quran')) {
              const mySchedules = todaySchedules.filter((s: any) => s.teacher_id == u.id || String(s.subject_name).toLowerCase().includes('qur\\'an') || String(s.subject_name).toLowerCase().includes('tahfizh'));
              mySchedules.forEach((s: any) => {
                const deadline = s.end_time || '15:00';
                addSingleTask(\`Absen \${s.class_name} (\${s.subject_name})\`, 'GURU QUR\\'AN', deadline, '17:00', () => {
                  if (!Array.isArray(studentAttendance)) return null;
                  const match = studentAttendance.find((sa: any) => String(sa.date).startsWith(filterDateStr) && sa.class_name === s.class_name && sa.subject_name === s.subject_name);
                  if (match) return { completed: true, completedAt: match.created_at || match.timestamp };
                  return null;
                });
                addSingleTask(\`Jurnal Ajar \${s.class_name} (\${s.subject_name})\`, 'GURU QUR\\'AN', deadline, '17:00', () => {
                  if (!Array.isArray(laporanHarian)) return null;
                  const match = laporanHarian.find((lh: any) => (String(lh.tanggal).startsWith(filterDateStr) || String(lh.date).startsWith(filterDateStr)) && lh.class_name === s.class_name && lh.subject_name === s.subject_name);
                  if (match) return { completed: true, completedAt: match.created_at || match.timestamp };
                  return null;
                });
                addSingleTask(\`Membuat Modul Ajar \${s.class_name} (\${s.subject_name})\`, 'GURU QUR\\'AN', deadline, '17:00', () => {
                  if (!Array.isArray(materiAjar)) return null;
                  const match = materiAjar.find((ma: any) => ma.class_name === s.class_name && (ma.subject === s.subject_name || ma.subject_name === s.subject_name) && (String(ma.user_id) === String(u.id) || !ma.user_id));
                  if (match) return { completed: true, completedAt: match.created_at || match.timestamp || match.date };
                  return null;
                });
              });
              addSingleTask('Mengabsen siswa sholat Dhuha', 'GURU QUR\\'AN', '12:00', '17:00', () => {
                if (!Array.isArray(ibadahSiswa)) return null;
                const match = ibadahSiswa.find((ib: any) => String(ib.date).startsWith(filterDateStr) && (ib.type === 'Dhuha' || String(ib.jenis_ibadah).toLowerCase() === 'dhuha'));
                if (match) return { completed: true, completedAt: match.created_at || match.timestamp };
                return null;
              });
            }
            if (r.includes('bk')) addSingleTask('Mengisi Laporan Harian BK', 'GURU BK', '14:00', '17:00');
            if (r.includes('pustakawan')) addSingleTask('Mengisi Laporan Perpustakaan', 'PUSTAKAWAN', '14:00', '17:00');

            // Aggregate stats for this day
            allTasks.forEach(t => {
              stats.totalKewajiban++;
              if (t.status === 'selesai') stats.tepatWaktu++;
              else if (t.status === 'selesai_telat') stats.telat++;
              else if (t.status === 'terlewat') stats.terlewat++;
            });
          }

          if (stats.totalKewajiban > 0) {
            mappedStaf.push({
              id: u.id,
              name: u.name,
              roles: r,
              ...stats
            });
          }
        });

        setWeeklyData(mappedStaf);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isOpen, baseDate]);

  if (!isOpen) return null;

  const filteredData = weeklyData.filter(s => {
    if (activeTab === 'walas' && s.roles.includes('walas')) return true;
    if (activeTab === 'guru_quran' && s.roles.includes('guru_quran')) return true;
    if (activeTab === 'guru_mapel' && (s.roles.includes('guru') || s.roles.includes('guru_mapel'))) return true;
    return false;
  });

  const getMonday = (dStr: string) => {
    const d = new Date(dStr);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff)).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'});
  };
  const getSaturday = (dStr: string) => {
    const d = new Date(dStr);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) + 5;
    return new Date(d.setDate(diff)).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'});
  };

  const periodStr = \`\${getMonday(baseDate)} - \${getSaturday(baseDate)}\`;

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(\`Rekap Mingguan Kinerja (\${activeTab.toUpperCase()})\`, 14, 15);
    doc.setFontSize(10);
    doc.text(\`Periode: \${periodStr}\`, 14, 22);
    
    const rows = filteredData.map((s, i) => [
      i + 1,
      s.name,
      s.tepatWaktu,
      s.telat,
      s.terlewat,
      s.totalKewajiban
    ]);
    
    autoTable(doc, {
      head: [['No', 'Nama', 'Tepat Waktu', 'Telat', 'Terlewat', 'Total Kewajiban']],
      body: rows,
      startY: 28,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129] }
    });
    doc.save(\`Rekap_Mingguan_\${activeTab}_\${periodStr}.pdf\`);
  };

  const downloadExcel = () => {
    const rows = filteredData.map((s, i) => ({
      'No': i + 1,
      'Nama': s.name,
      'Tepat Waktu': s.tepatWaktu,
      'Telat': s.telat,
      'Terlewat': s.terlewat,
      'Total Kewajiban': s.totalKewajiban
    }));
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Rekap Mingguan");
    XLSX.writeFile(workbook, \`Rekap_Mingguan_\${activeTab}_\${periodStr}.xlsx\`);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <CardHeader className="py-4 px-6 bg-slate-50 border-b border-slate-100 flex flex-row items-center justify-between shrink-0">
          <div>
            <CardTitle className="text-lg font-black text-slate-800">Rekap Mingguan Kinerja Staf</CardTitle>
            <p className="text-xs text-slate-500 font-medium mt-1">Periode: {periodStr}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-slate-200 h-8 w-8">
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-hidden flex flex-col">
          <div className="flex border-b border-slate-200">
            {[
              { id: 'walas', label: 'Wali Kelas' },
              { id: 'guru_quran', label: 'Guru Qur\\'an' },
              { id: 'guru_mapel', label: 'Guru Mapel' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={\`flex-1 py-3 text-sm font-bold border-b-2 transition-colors \${activeTab === tab.id ? 'border-emerald-500 text-emerald-700 bg-emerald-50/50' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}\`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-4 bg-white flex justify-end gap-2 border-b border-slate-100 shrink-0">
            <Button variant="outline" size="sm" onClick={downloadPDF} className="h-8 text-xs font-bold gap-1.5 text-slate-700 hover:bg-slate-50" disabled={loading}>
              <FileText className="w-3.5 h-3.5 text-rose-600" />
              Download PDF
            </Button>
            <Button variant="outline" size="sm" onClick={downloadExcel} className="h-8 text-xs font-bold gap-1.5 text-slate-700 hover:bg-slate-50" disabled={loading}>
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              Download Excel
            </Button>
          </div>

          <div className="flex-1 overflow-auto p-4 bg-slate-50/50">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-40 text-emerald-600 gap-3">
                <Loader2 className="w-8 h-8 animate-spin" />
                <p className="text-sm font-bold">Menghitung rekap 6 hari...</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 font-bold text-slate-600">No</th>
                      <th className="px-4 py-3 font-bold text-slate-600">Nama Guru / Staf</th>
                      <th className="px-4 py-3 font-bold text-emerald-600 text-center">Tepat Waktu</th>
                      <th className="px-4 py-3 font-bold text-amber-600 text-center">Telat Mengisi</th>
                      <th className="px-4 py-3 font-bold text-rose-600 text-center">Melanggar / Terlewat</th>
                      <th className="px-4 py-3 font-bold text-slate-600 text-center">Total Kewajiban (Pekan)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredData.length > 0 ? filteredData.map((s, i) => (
                      <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3 text-slate-500 font-medium">{i + 1}</td>
                        <td className="px-4 py-3 font-bold text-slate-700">{s.name}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex w-7 h-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs">{s.tepatWaktu}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex w-7 h-7 items-center justify-center rounded-full bg-amber-100 text-amber-700 font-bold text-xs">{s.telat}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex w-7 h-7 items-center justify-center rounded-full bg-rose-100 text-rose-700 font-bold text-xs">{s.terlewat}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex w-8 h-8 items-center justify-center rounded-md bg-slate-100 border border-slate-200 text-slate-700 font-black text-sm">{s.totalKewajiban}</span>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-slate-500 text-sm font-medium">Tidak ada data untuk kategori ini.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
`;

fs.writeFileSync('src/components/KamadWeeklyRecapModal.tsx', modalCode);
