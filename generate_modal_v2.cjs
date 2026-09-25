const fs = require('fs');

const modalCode = `import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { X, FileText, FileSpreadsheet, Loader2 } from 'lucide-react';
import { apiClient } from '../lib/apiClient';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  baseDate: string; 
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
          return r.includes('guru') || r.includes('walas') || r.includes('guru_quran') || r.includes('guru_mapel');
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
            // WALAS
            walas_absenPagi: { mengisi: 0, tidak: 0 },
            walas_sikap: { mengisi: 0, tidak: 0 },
            walas_pemantauan: { mengisi: 0, tidak: 0 },
            walas_zuhur: { mengisi: 0, tidak: 0 },
            // GURU MAPEL & QURAN
            guru_absenKBM: { mengisi: 0, tidak: 0 },
            guru_jurnal: { mengisi: 0, tidak: 0 },
            guru_perangkat: { mengisi: 0, tidak: 0 },
            guru_ibadah: { mengisi: 0, tidak: 0 } // Zuhur for mapel, Dhuha for quran
          };

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
            
            const addSingleTask = (
              taskName: string, category: string, subCategory: string, idealDeadline?: string, finalDeadline?: string, customCheckFn?: () => any
            ) => {
              const foundKinerja = userKinerja.find((k: any) => String(k.task).toLowerCase() === String(taskName).toLowerCase());
              let isDone = false;
              if (foundKinerja) {
                isDone = true;
              } else if (customCheckFn) {
                const customRes = customCheckFn();
                if (customRes?.completed) isDone = true;
              }

              let status = 'proses';
              if (isDone) {
                status = 'selesai';
              } else {
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
              
              if (status === 'selesai' || status === 'selesai_telat') {
                 // @ts-ignore
                 stats[category][subCategory].mengisi++;
              } else if (status === 'terlewat') {
                 // @ts-ignore
                 stats[category][subCategory].tidak++;
              }
            };

            const userClass = u.class_name;
            if (r.includes('walas')) {
              addSingleTask('Absensi siswa binaan pada pagi hari', 'walas_absenPagi', '', '08:00', '11:00', () => {
                if (!Array.isArray(studentAttendance)) return null;
                const match = studentAttendance.find((sa: any) => String(sa.date).startsWith(filterDateStr) && sa.subject_name === 'Presensi Wali Kelas' && (sa.class_name === userClass || String(sa.user_id) === String(u.id)));
                if (match) return { completed: true }; return null;
              });
              addSingleTask('Pemantauan pagi, cek piket dan kelengkapan siswa', 'walas_pemantauan', '', '07:30', '17:00', () => {
                if (!Array.isArray(pemantauanPagi)) return null;
                const match = pemantauanPagi.find((p: any) => String(p.tanggal).startsWith(filterDateStr) && (p.class_name === userClass || String(p.user_id) === String(u.id)));
                if (match) return { completed: true }; return null;
              });
              addSingleTask('Mengisi Nilai Sikap & Karakter siswa', 'walas_sikap', '', '07:30', '17:00', () => {
                if (!Array.isArray(nilaiSikap)) return null;
                const match = nilaiSikap.find((n: any) => String(n.tanggal).startsWith(filterDateStr) && (n.class_name === userClass || String(n.user_id) === String(u.id)));
                if (match) return { completed: true }; return null;
              });
              addSingleTask('Mengabsen sholat Zuhur siswa kelas binaannya', 'walas_zuhur', '', '13:30', '17:00', () => {
                if (!Array.isArray(ibadahSiswa)) return null;
                const match = ibadahSiswa.find((ib: any) => String(ib.date).startsWith(filterDateStr) && (ib.type === 'Zuhur' || String(ib.jenis_ibadah).toLowerCase() === 'zuhur') && (ib.class_name === userClass || String(ib.user_id) === String(u.id)));
                if (match) return { completed: true }; return null;
              });
            }

            if (r.includes('guru') || r.includes('guru_mapel')) {
               const mySchedules = todaySchedules.filter((s: any) => {
                if (String(s.teacher_id) !== String(u.id)) return false;
                const isQuran = String(s.subject_name).toLowerCase().includes('quran') || String(s.subject_name).toLowerCase().includes('tahfizh') || String(s.subject_name).toLowerCase().includes('bta');
                return !isQuran;
              });
              const uniqueMap = new Map();
              mySchedules.forEach((s: any) => {
                const key = \`\${s.class_name}:::\${s.subject_name}\`;
                if (!uniqueMap.has(key) || (s.end_time || '').substring(0, 5) > (uniqueMap.get(key).end_time || '')) {
                  uniqueMap.set(key, s);
                }
              });
              uniqueMap.forEach((s: any) => {
                const deadline = (s.end_time || '').substring(0, 5) || '14:00';
                addSingleTask(\`Absen \${s.class_name} (\${s.subject_name})\`, 'guru_absenKBM', '', deadline, '17:00', () => {
                  if (!Array.isArray(studentAttendance)) return null;
                  const match = studentAttendance.find((sa: any) => String(sa.date).startsWith(filterDateStr) && sa.class_name === s.class_name && sa.subject_name === s.subject_name);
                  if (match) return { completed: true }; return null;
                });
                addSingleTask(\`Jurnal Ajar \${s.class_name} (\${s.subject_name})\`, 'guru_jurnal', '', deadline, '17:00', () => {
                  if (!Array.isArray(laporanHarian)) return null;
                  const match = laporanHarian.find((lh: any) => (String(lh.tanggal).startsWith(filterDateStr) || String(lh.date).startsWith(filterDateStr)) && lh.class_name === s.class_name && lh.subject_name === s.subject_name);
                  if (match) return { completed: true }; return null;
                });
                addSingleTask(\`Membuat Modul Ajar \${s.class_name} (\${s.subject_name})\`, 'guru_perangkat', '', deadline, '17:00', () => {
                  if (!Array.isArray(materiAjar)) return null;
                  const match = materiAjar.find((ma: any) => ma.class_name === s.class_name && (ma.subject === s.subject_name || ma.subject_name === s.subject_name) && (String(ma.user_id) === String(u.id) || !ma.user_id));
                  if (match) return { completed: true }; return null;
                });
              });
            }

            if (r.includes('guru_quran')) {
               const mySchedules = todaySchedules.filter((s: any) => {
                if (String(s.teacher_id) !== String(u.id)) return false;
                const isQuran = String(s.subject_name).toLowerCase().includes('quran') || String(s.subject_name).toLowerCase().includes('tahfizh') || String(s.subject_name).toLowerCase().includes('bta');
                return isQuran || !r.includes('guru');
              });
              const uniqueMap = new Map();
              mySchedules.forEach((s: any) => {
                const key = \`\${s.class_name}:::\${s.subject_name}\`;
                if (!uniqueMap.has(key) || (s.end_time || '').substring(0, 5) > (uniqueMap.get(key).end_time || '')) {
                  uniqueMap.set(key, s);
                }
              });
              uniqueMap.forEach((s: any) => {
                const deadline = (s.end_time || '').substring(0, 5) || '14:00';
                addSingleTask(\`Absen \${s.class_name} (\${s.subject_name})\`, 'guru_absenKBM', '', deadline, '17:00', () => {
                  if (!Array.isArray(studentAttendance)) return null;
                  const match = studentAttendance.find((sa: any) => String(sa.date).startsWith(filterDateStr) && sa.class_name === s.class_name && sa.subject_name === s.subject_name);
                  if (match) return { completed: true }; return null;
                });
                addSingleTask(\`Jurnal Ajar \${s.class_name} (\${s.subject_name})\`, 'guru_jurnal', '', deadline, '17:00', () => {
                  if (!Array.isArray(laporanHarian)) return null;
                  const match = laporanHarian.find((lh: any) => (String(lh.tanggal).startsWith(filterDateStr) || String(lh.date).startsWith(filterDateStr)) && lh.class_name === s.class_name && lh.subject_name === s.subject_name);
                  if (match) return { completed: true }; return null;
                });
                addSingleTask(\`Membuat Modul Ajar \${s.class_name} (\${s.subject_name})\`, 'guru_perangkat', '', deadline, '17:00', () => {
                  if (!Array.isArray(materiAjar)) return null;
                  const match = materiAjar.find((ma: any) => ma.class_name === s.class_name && (ma.subject === s.subject_name || ma.subject_name === s.subject_name) && (String(ma.user_id) === String(u.id) || !ma.user_id));
                  if (match) return { completed: true }; return null;
                });
              });

              addSingleTask('Mengabsen siswa sholat Dhuha', 'guru_ibadah', '', '12:00', '17:00', () => {
                if (!Array.isArray(ibadahSiswa)) return null;
                const match = ibadahSiswa.find((ib: any) => String(ib.date).startsWith(filterDateStr) && (ib.type === 'Dhuha' || String(ib.jenis_ibadah).toLowerCase() === 'dhuha'));
                if (match) return { completed: true }; return null;
              });
            }
          }

          mappedStaf.push({
            id: u.id,
            name: u.name,
            roles: r,
            stats
          });
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
    doc.setFontSize(14);
    doc.text(\`FORMAT LAPORAN KINERJA STAF PEKANAN\`, 14, 15);
    doc.setFontSize(10);
    doc.text(\`Periode: \${periodStr}\`, 14, 22);
    
    let head = [];
    let body = [];
    let title = '';

    if (activeTab === 'walas') {
      title = '1. UNTUK WALAS';
      head = [
        [
          { content: 'No.', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } }, 
          { content: 'Nama Guru/Walas', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } }, 
          { content: 'Absensi Pagi', colSpan: 2, styles: { halign: 'center' } }, 
          { content: 'Sikap', colSpan: 2, styles: { halign: 'center' } }, 
          { content: 'Pemantauan Pagi', colSpan: 2, styles: { halign: 'center' } }, 
          { content: 'Sholat Zuhur Siswa', colSpan: 2, styles: { halign: 'center' } }
        ],
        ['Mengisi', 'Tidak Mengisi', 'Mengisi', 'Tidak Mengisi', 'Mengisi', 'Tidak Mengisi', 'Mengisi', 'Tidak Mengisi']
      ];
      body = filteredData.map((s, i) => [
        i + 1, s.name,
        s.stats.walas_absenPagi.mengisi || '', s.stats.walas_absenPagi.tidak || '',
        s.stats.walas_sikap.mengisi || '', s.stats.walas_sikap.tidak || '',
        s.stats.walas_pemantauan.mengisi || '', s.stats.walas_pemantauan.tidak || '',
        s.stats.walas_zuhur.mengisi || '', s.stats.walas_zuhur.tidak || ''
      ]);
    } else if (activeTab === 'guru_mapel') {
      title = '2. UNTUK GURU';
      head = [
        [
          { content: 'No.', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } }, 
          { content: 'Nama Guru', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } }, 
          { content: 'Absen KBM', colSpan: 2, styles: { halign: 'center' } }, 
          { content: 'Jurnal', colSpan: 2, styles: { halign: 'center' } }, 
          { content: 'Perangkat', colSpan: 2, styles: { halign: 'center' } }, 
          { content: 'Absen Zuhur Siswa', colSpan: 2, styles: { halign: 'center' } }
        ],
        ['Mengisi', 'Tidak Mengisi', 'Mengisi', 'Tidak Mengisi', 'Mengisi', 'Tidak Mengisi', 'Mengisi', 'Tidak Mengisi']
      ];
      body = filteredData.map((s, i) => [
        i + 1, s.name,
        s.stats.guru_absenKBM.mengisi || '', s.stats.guru_absenKBM.tidak || '',
        s.stats.guru_jurnal.mengisi || '', s.stats.guru_jurnal.tidak || '',
        s.stats.guru_perangkat.mengisi || '', s.stats.guru_perangkat.tidak || '',
        '', '' // Guru Mapel doesn't have Zuhur task mapped
      ]);
    } else if (activeTab === 'guru_quran') {
      title = '3. UNTUK GURU QUR\\'AN';
      head = [
        [
          { content: 'No.', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } }, 
          { content: 'Nama Guru Qur\\'an', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } }, 
          { content: 'Absen KBM', colSpan: 2, styles: { halign: 'center' } }, 
          { content: 'Jurnal', colSpan: 2, styles: { halign: 'center' } }, 
          { content: 'Perangkat', colSpan: 2, styles: { halign: 'center' } }, 
          { content: 'Absen Dhuha Siswa', colSpan: 2, styles: { halign: 'center' } }
        ],
        ['Mengisi', 'Tidak Mengisi', 'Mengisi', 'Tidak Mengisi', 'Mengisi', 'Tidak Mengisi', 'Mengisi', 'Tidak Mengisi']
      ];
      body = filteredData.map((s, i) => [
        i + 1, s.name,
        s.stats.guru_absenKBM.mengisi || '', s.stats.guru_absenKBM.tidak || '',
        s.stats.guru_jurnal.mengisi || '', s.stats.guru_jurnal.tidak || '',
        s.stats.guru_perangkat.mengisi || '', s.stats.guru_perangkat.tidak || '',
        s.stats.guru_ibadah.mengisi || '', s.stats.guru_ibadah.tidak || ''
      ]);
    }

    doc.setFontSize(12);
    doc.text(title, 14, 30);

    autoTable(doc, {
      head: head,
      body: body,
      startY: 34,
      theme: 'grid',
      headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], lineWidth: 0.1, lineColor: [0, 0, 0] },
      styles: { lineWidth: 0.1, lineColor: [0, 0, 0], halign: 'center', cellPadding: 2 },
      columnStyles: { 1: { halign: 'left' } }
    });
    doc.save(\`Laporan_Kinerja_\${activeTab}_\${periodStr}.pdf\`);
  };

  const downloadExcel = () => {
    let rows = [];
    if (activeTab === 'walas') {
      rows = filteredData.map((s, i) => ({
        'No.': i + 1,
        'Nama Guru/Walas': s.name,
        'Absensi Pagi (Mengisi)': s.stats.walas_absenPagi.mengisi || '',
        'Absensi Pagi (Tidak)': s.stats.walas_absenPagi.tidak || '',
        'Sikap (Mengisi)': s.stats.walas_sikap.mengisi || '',
        'Sikap (Tidak)': s.stats.walas_sikap.tidak || '',
        'Pemantauan Pagi (Mengisi)': s.stats.walas_pemantauan.mengisi || '',
        'Pemantauan Pagi (Tidak)': s.stats.walas_pemantauan.tidak || '',
        'Sholat Zuhur Siswa (Mengisi)': s.stats.walas_zuhur.mengisi || '',
        'Sholat Zuhur Siswa (Tidak)': s.stats.walas_zuhur.tidak || ''
      }));
    } else if (activeTab === 'guru_mapel') {
      rows = filteredData.map((s, i) => ({
        'No.': i + 1,
        'Nama Guru': s.name,
        'Absen KBM (Mengisi)': s.stats.guru_absenKBM.mengisi || '',
        'Absen KBM (Tidak)': s.stats.guru_absenKBM.tidak || '',
        'Jurnal (Mengisi)': s.stats.guru_jurnal.mengisi || '',
        'Jurnal (Tidak)': s.stats.guru_jurnal.tidak || '',
        'Perangkat (Mengisi)': s.stats.guru_perangkat.mengisi || '',
        'Perangkat (Tidak)': s.stats.guru_perangkat.tidak || '',
        'Absen Zuhur Siswa (Mengisi)': '',
        'Absen Zuhur Siswa (Tidak)': ''
      }));
    } else if (activeTab === 'guru_quran') {
      rows = filteredData.map((s, i) => ({
        'No.': i + 1,
        'Nama Guru Qur\\'an': s.name,
        'Absen KBM (Mengisi)': s.stats.guru_absenKBM.mengisi || '',
        'Absen KBM (Tidak)': s.stats.guru_absenKBM.tidak || '',
        'Jurnal (Mengisi)': s.stats.guru_jurnal.mengisi || '',
        'Jurnal (Tidak)': s.stats.guru_jurnal.tidak || '',
        'Perangkat (Mengisi)': s.stats.guru_perangkat.mengisi || '',
        'Perangkat (Tidak)': s.stats.guru_perangkat.tidak || '',
        'Absen Dhuha Siswa (Mengisi)': s.stats.guru_ibadah.mengisi || '',
        'Absen Dhuha Siswa (Tidak)': s.stats.guru_ibadah.tidak || ''
      }));
    }

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Rekap Mingguan");
    XLSX.writeFile(workbook, \`Laporan_Kinerja_\${activeTab}_\${periodStr}.xlsx\`);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-5xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <CardHeader className="py-4 px-6 bg-slate-50 border-b border-slate-100 flex flex-row items-center justify-between shrink-0">
          <div>
            <CardTitle className="text-lg font-black text-slate-800">FORMAT LAPORAN KINERJA STAF PEKANAN</CardTitle>
            <p className="text-xs text-slate-500 font-medium mt-1">Periode: {periodStr}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-slate-200 h-8 w-8">
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-hidden flex flex-col">
          <div className="flex border-b border-slate-200">
            {[
              { id: 'walas', label: '1. UNTUK WALAS' },
              { id: 'guru_mapel', label: '2. UNTUK GURU' },
              { id: 'guru_quran', label: '3. UNTUK GURU QUR\\'AN' }
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
                <p className="text-sm font-bold">Memuat dan menghitung rekap laporan pekanan...</p>
              </div>
            ) : (
              <div className="bg-white border border-slate-800 overflow-x-auto">
                <table className="w-full text-center text-xs border-collapse">
                  <thead>
                    {activeTab === 'walas' && (
                      <>
                        <tr>
                          <th rowSpan={2} className="border border-slate-800 p-2 font-bold w-10">No.</th>
                          <th rowSpan={2} className="border border-slate-800 p-2 font-bold min-w-[150px]">Nama Guru/Walas</th>
                          <th colSpan={2} className="border border-slate-800 p-2 font-bold">Absensi Pagi</th>
                          <th colSpan={2} className="border border-slate-800 p-2 font-bold">Sikap</th>
                          <th colSpan={2} className="border border-slate-800 p-2 font-bold">Pemantauan Pagi</th>
                          <th colSpan={2} className="border border-slate-800 p-2 font-bold">Sholat Zuhur Siswa</th>
                        </tr>
                        <tr>
                          <th className="border border-slate-800 p-1 bg-slate-50 font-bold w-16">Mengisi</th>
                          <th className="border border-slate-800 p-1 bg-slate-50 font-bold w-20">Tidak Mengisi</th>
                          <th className="border border-slate-800 p-1 bg-slate-50 font-bold w-16">Mengisi</th>
                          <th className="border border-slate-800 p-1 bg-slate-50 font-bold w-20">Tidak Mengisi</th>
                          <th className="border border-slate-800 p-1 bg-slate-50 font-bold w-16">Mengisi</th>
                          <th className="border border-slate-800 p-1 bg-slate-50 font-bold w-20">Tidak Mengisi</th>
                          <th className="border border-slate-800 p-1 bg-slate-50 font-bold w-16">Mengisi</th>
                          <th className="border border-slate-800 p-1 bg-slate-50 font-bold w-20">Tidak Mengisi</th>
                        </tr>
                      </>
                    )}
                    {activeTab === 'guru_mapel' && (
                      <>
                        <tr>
                          <th rowSpan={2} className="border border-slate-800 p-2 font-bold w-10">No.</th>
                          <th rowSpan={2} className="border border-slate-800 p-2 font-bold min-w-[150px]">Nama Guru</th>
                          <th colSpan={2} className="border border-slate-800 p-2 font-bold">Absen KBM</th>
                          <th colSpan={2} className="border border-slate-800 p-2 font-bold">Jurnal</th>
                          <th colSpan={2} className="border border-slate-800 p-2 font-bold">Perangkat</th>
                          <th colSpan={2} className="border border-slate-800 p-2 font-bold">Absen Zuhur Siswa</th>
                        </tr>
                        <tr>
                          <th className="border border-slate-800 p-1 bg-slate-50 font-bold w-16">Mengisi</th>
                          <th className="border border-slate-800 p-1 bg-slate-50 font-bold w-20">Tidak Mengisi</th>
                          <th className="border border-slate-800 p-1 bg-slate-50 font-bold w-16">Mengisi</th>
                          <th className="border border-slate-800 p-1 bg-slate-50 font-bold w-20">Tidak Mengisi</th>
                          <th className="border border-slate-800 p-1 bg-slate-50 font-bold w-16">Mengisi</th>
                          <th className="border border-slate-800 p-1 bg-slate-50 font-bold w-20">Tidak Mengisi</th>
                          <th className="border border-slate-800 p-1 bg-slate-50 font-bold w-16">Mengisi</th>
                          <th className="border border-slate-800 p-1 bg-slate-50 font-bold w-20">Tidak Mengisi</th>
                        </tr>
                      </>
                    )}
                    {activeTab === 'guru_quran' && (
                      <>
                        <tr>
                          <th rowSpan={2} className="border border-slate-800 p-2 font-bold w-10">No.</th>
                          <th rowSpan={2} className="border border-slate-800 p-2 font-bold min-w-[150px]">Nama Guru Qur\\'an</th>
                          <th colSpan={2} className="border border-slate-800 p-2 font-bold">Absen KBM</th>
                          <th colSpan={2} className="border border-slate-800 p-2 font-bold">Jurnal</th>
                          <th colSpan={2} className="border border-slate-800 p-2 font-bold">Perangkat</th>
                          <th colSpan={2} className="border border-slate-800 p-2 font-bold">Absen Dhuha Siswa</th>
                        </tr>
                        <tr>
                          <th className="border border-slate-800 p-1 bg-slate-50 font-bold w-16">Mengisi</th>
                          <th className="border border-slate-800 p-1 bg-slate-50 font-bold w-20">Tidak Mengisi</th>
                          <th className="border border-slate-800 p-1 bg-slate-50 font-bold w-16">Mengisi</th>
                          <th className="border border-slate-800 p-1 bg-slate-50 font-bold w-20">Tidak Mengisi</th>
                          <th className="border border-slate-800 p-1 bg-slate-50 font-bold w-16">Mengisi</th>
                          <th className="border border-slate-800 p-1 bg-slate-50 font-bold w-20">Tidak Mengisi</th>
                          <th className="border border-slate-800 p-1 bg-slate-50 font-bold w-16">Mengisi</th>
                          <th className="border border-slate-800 p-1 bg-slate-50 font-bold w-20">Tidak Mengisi</th>
                        </tr>
                      </>
                    )}
                  </thead>
                  <tbody>
                    {filteredData.length > 0 ? filteredData.map((s, i) => (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="border border-slate-800 p-2">{i + 1}</td>
                        <td className="border border-slate-800 p-2 text-left font-bold">{s.name}</td>
                        
                        {activeTab === 'walas' && (
                          <>
                            <td className="border border-slate-800 p-2">{s.stats.walas_absenPagi.mengisi || ''}</td>
                            <td className="border border-slate-800 p-2">{s.stats.walas_absenPagi.tidak || ''}</td>
                            <td className="border border-slate-800 p-2">{s.stats.walas_sikap.mengisi || ''}</td>
                            <td className="border border-slate-800 p-2">{s.stats.walas_sikap.tidak || ''}</td>
                            <td className="border border-slate-800 p-2">{s.stats.walas_pemantauan.mengisi || ''}</td>
                            <td className="border border-slate-800 p-2">{s.stats.walas_pemantauan.tidak || ''}</td>
                            <td className="border border-slate-800 p-2">{s.stats.walas_zuhur.mengisi || ''}</td>
                            <td className="border border-slate-800 p-2">{s.stats.walas_zuhur.tidak || ''}</td>
                          </>
                        )}
                        {activeTab === 'guru_mapel' && (
                          <>
                            <td className="border border-slate-800 p-2">{s.stats.guru_absenKBM.mengisi || ''}</td>
                            <td className="border border-slate-800 p-2">{s.stats.guru_absenKBM.tidak || ''}</td>
                            <td className="border border-slate-800 p-2">{s.stats.guru_jurnal.mengisi || ''}</td>
                            <td className="border border-slate-800 p-2">{s.stats.guru_jurnal.tidak || ''}</td>
                            <td className="border border-slate-800 p-2">{s.stats.guru_perangkat.mengisi || ''}</td>
                            <td className="border border-slate-800 p-2">{s.stats.guru_perangkat.tidak || ''}</td>
                            <td className="border border-slate-800 p-2"></td>
                            <td className="border border-slate-800 p-2"></td>
                          </>
                        )}
                        {activeTab === 'guru_quran' && (
                          <>
                            <td className="border border-slate-800 p-2">{s.stats.guru_absenKBM.mengisi || ''}</td>
                            <td className="border border-slate-800 p-2">{s.stats.guru_absenKBM.tidak || ''}</td>
                            <td className="border border-slate-800 p-2">{s.stats.guru_jurnal.mengisi || ''}</td>
                            <td className="border border-slate-800 p-2">{s.stats.guru_jurnal.tidak || ''}</td>
                            <td className="border border-slate-800 p-2">{s.stats.guru_perangkat.mengisi || ''}</td>
                            <td className="border border-slate-800 p-2">{s.stats.guru_perangkat.tidak || ''}</td>
                            <td className="border border-slate-800 p-2">{s.stats.guru_ibadah.mengisi || ''}</td>
                            <td className="border border-slate-800 p-2">{s.stats.guru_ibadah.tidak || ''}</td>
                          </>
                        )}
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={10} className="border border-slate-800 p-8 text-center text-slate-500 font-medium">Tidak ada data untuk kategori ini.</td>
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
