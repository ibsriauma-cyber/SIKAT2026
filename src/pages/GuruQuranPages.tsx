import { useRealtime } from "../lib/useRealtime";
import { Laporan } from './GuruPages';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { CustomSelect } from '../components/ui/CustomSelect';
import { Heart, FileBarChart, Check, GraduationCap, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiClient, logKinerja } from '../lib/apiClient';
import { remoteStorage } from "../lib/remoteStorage";
import { Button } from '../components/ui/Button';
import { mockStudents as globalStudents } from '../data/mock';
import { TermSwitcher } from '../components/ui/TermSwitcher';
const mockStudentsData = globalStudents.map(s => ({
  id: s.id,
  name: s.name,
  className: s.className || s.grade
}));
export function DashboardGuruQuran() {
  const {
    user
  } = useAuth();
  const todayDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  return <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-800 to-teal-900 rounded-2xl p-6 md:p-8 text-white shadow-md">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-12 translate-y-12">
          <GraduationCap className="w-80 h-80 text-white" />
        </div>
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-xs rounded-full text-xs font-semibold text-emerald-300">
            <Calendar className="w-3.5 h-3.5" />
            <span>{todayDate}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight leading-tight">
            Selamat Datang, {user?.name || 'Guru Qur\'an'}
          </h1>
          <p className="text-emerald-100/95 text-xs md:text-sm font-medium leading-relaxed max-w-2xl">
            Sistem Informasi Aktivitas Terintegrasi (SIKAT) MA Al-Ihsan Boarding School Riau. Portal Guru Al-Qur'an untuk memantau and mencatat setoran hafalan (halaqah), presensi sholat dhuha, and perkembangan ibadah siswa binaan Anda.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-slate-150/60 shadow-xs">
        <span className="text-sm font-bold text-slate-700">Tahun Akademik:</span>
        <TermSwitcher />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-emerald-50 border-emerald-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-emerald-800">Siswa Sholat Dhuha Hari Ini</p>
                <p className="text-2xl font-black text-emerald-900 mt-1">128</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                <FileBarChart className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-blue-800">Persentase Kehadiran Mingguan</p>
                <p className="text-2xl font-black text-blue-900 mt-1">85%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>;
}
export function GuruQuranAbsensiDhuha() {
  const _syncTick = useRealtime();
  const {
    user
  } = useAuth();
  const [attendance, setAttendance] = useState<Record<string, {
    status: string;
    ket: string;
  }>>({});
  const [isLocked, setIsLocked] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => (function(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');})());
  const [students, setStudents] = useState<any[]>([]);
  const [teachingAssignments, setTeachingAssignments] = useState<any[]>([]);
  useEffect(() => {
    apiClient('/crud.php?table=students').then(data => {
      if (Array.isArray(data)) setStudents(data);
    }).catch(console.error);
    apiClient('/crud.php?table=teaching_assignments').then(data => {
      if (Array.isArray(data)) setTeachingAssignments(data);
    }).catch(console.error);
  }, [_syncTick]);
  const teacherAssignments = teachingAssignments.filter((a: any) => String(a.teacher_id) === String(user?.id));
  const availableClasses = Array.from(new Set(teacherAssignments.map((a: any) => a.class_name))).filter(Boolean) as string[];
  useEffect(() => {
    if (!selectedClass && availableClasses.length > 0) {
      setSelectedClass(availableClasses[0]);
    }
  }, [availableClasses, selectedClass]);
  useEffect(() => {
    if (selectedClass) {
      const storageKey = `dhuha_${selectedClass}`;
      const existingData = JSON.parse(remoteStorage.getItem(storageKey) || '{}');
      const today = selectedDate;
      if (existingData[today]) {
        setAttendance(existingData[today]);
        setIsLocked(true);
      } else {
        const classStudents = students.filter(s => s.class_name === selectedClass || s.className === selectedClass);
        const defaultAtt: Record<string, {
          status: string;
          ket: string;
        }> = {};
        classStudents.forEach(s => {
          defaultAtt[s.id] = {
            status: 'Jamaah',
            ket: ''
          };
        });
        setAttendance(defaultAtt);
        setIsLocked(false);
      }
    }
  }, [selectedClass, students, selectedDate]);
  const handleSetStatus = (id: string, status: string) => {
    if (isLocked) return;
    setAttendance(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        status: prev[id]?.status === status ? '' : status
      }
    }));
  };
  const handleSetKet = (id: string, ket: string) => {
    if (isLocked) return;
    setAttendance(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        ket
      }
    }));
  };
  const handleSave = async () => {
    if (!selectedClass) {
      window.alert("Pilih kelas terlebih dahulu!");
      return;
    }
    const storageKey = `dhuha_${selectedClass}`;
    const existingData = JSON.parse(remoteStorage.getItem(storageKey) || '{}');
    const today = selectedDate;
    existingData[today] = attendance;
    remoteStorage.setItem(storageKey, JSON.stringify(existingData));
    try {
      await apiClient('/query.php', {
        method: 'POST',
        body: JSON.stringify({
          query: `DELETE FROM ibadah_siswa WHERE class_name = '${selectedClass.replace(/'/g, "\\'")}' AND type = 'Dhuha' AND date = '${today}'`
        })
      });
      await Promise.all(Object.entries(attendance).map(async ([studentId, data]: [string, any]) => {
        if (!data.status) return;
        await apiClient('/crud.php?table=ibadah_siswa', {
          method: 'POST',
          body: JSON.stringify({
            student_id: studentId,
            class_name: selectedClass,
            date: today,
            type: 'Dhuha',
            status: data.status,
            notes: data.ket || ''
          })
        });
      }));
    } catch (e) {
      console.error('Failed to save to database', e);
    }
    setIsLocked(true);
    if (user?.id) {
      await logKinerja(user.id, 'Mengabsen siswa sholat Dhuha');
    }
    window.alert("Absensi Sholat Dhuha berhasil disimpan!");
  };
  const showStudents = selectedClass !== '';
  const classStudents = students.filter(s => s.class_name === selectedClass || s.className === selectedClass);
  return <div className="space-y-4">
      {/* Top Bar */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Absensi Sholat Dhuha</h2>
            <p className="text-sm text-slate-500 mt-0.5">Masukkan data kehadiran sholat dhuha siswa</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="w-[150px]">
              <input type="date" max={(function(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');})()} value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm font-bold text-slate-700 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500" />
            </div>
            <div className="w-[150px]">
              <CustomSelect value={selectedClass} onChange={setSelectedClass} options={[{
              value: '',
              label: 'Pilih Kelas'
            }, ...availableClasses.filter(Boolean).map(c => ({
              value: String(c),
              label: String(c)
            }))]} />
            </div>
            {isLocked ? <button onClick={() => setIsLocked(false)} className="w-full md:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 whitespace-nowrap transition-colors shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                Edit
              </button> : <button onClick={handleSave} className="px-5 py-2.5 bg-[#1e7b55] hover:bg-[#166544] text-white rounded-lg text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-colors shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
                Simpan
              </button>}
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Card className="border-slate-200 shadow-sm overflow-visible">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase w-16 text-center">No</th>
                <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase">Nama Siswa</th>
                <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase text-center min-w-[240px]">Status Kehadiran</th>
                <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase">Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {showStudents ? classStudents.map((s, i) => {
              const stat = attendance[s.id]?.status || '';
              const ket = attendance[s.id]?.ket || '';
              return <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-4 text-sm font-medium text-slate-500 text-center">{i + 1}</td>
                      <td className="py-4 px-4 text-sm font-bold text-slate-800">{s.name}</td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {['Jamaah', 'Tidak'].map(st => {
                      let bgActive = '';
                      let textActive = 'text-white';
                      let bgInactive = '';
                      let textInactive = '';
                      let hoverBg = '';
                      if (st === 'Jamaah') {
                        bgActive = 'bg-emerald-500';
                        bgInactive = 'bg-emerald-50';
                        textInactive = 'text-emerald-600';
                        hoverBg = 'hover:bg-emerald-100';
                      }
                      if (st === 'Tidak') {
                        bgActive = 'bg-amber-500';
                        bgInactive = 'bg-amber-50';
                        textInactive = 'text-amber-600';
                        hoverBg = 'hover:bg-amber-100';
                      }
                      const stLabel = st === 'Jamaah' ? 'J' : 'T';
                      return <button key={st} onClick={() => handleSetStatus(s.id, st)} disabled={isLocked} className={"w-8 h-8 flex items-center justify-center rounded-md border text-xs font-bold transition-colors " + (stat === st ? bgActive + " " + textActive + " border-transparent shadow-sm" : bgInactive + " " + textInactive + " " + hoverBg + " border-slate-200/60") + (isLocked ? " opacity-50 cursor-not-allowed" : "")}>
                                {stLabel}
                              </button>;
                    })}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <input type="text" placeholder="Tambahkan keterangan..." value={ket} disabled={isLocked} onChange={e => handleSetKet(s.id, e.target.value)} className={`w-full px-3 py-1.5 border border-slate-200 rounded-md text-sm outline-none focus:border-emerald-500 transition-colors ${isLocked ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : ''}`} />
                      </td>
                    </tr>;
            }) : <tr>
                  <td colSpan={4} className="py-12 text-center text-sm font-medium text-slate-500">
                    Pilih kelas terlebih dahulu atau belum ada data siswa
                  </td>
                </tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </div>;
}
export function GuruQuranLaporanDhuha() {
  return <Laporan />;
}