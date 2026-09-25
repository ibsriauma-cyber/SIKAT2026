import { useRealtime } from "../lib/useRealtime";
import React, { useState } from 'react';
import { UserAnnouncements } from '../components/ui/UserAnnouncements';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { mockStudents } from '../data/mock';
import { apiClient } from '../lib/apiClient';
import { useEffect } from 'react';
import { ShieldAlert, CheckCircle2, XCircle, Users, Calendar, CheckSquare, Edit3, CalendarDays, Book, LineChart, ShieldCheck, Heart, Moon, ClipboardList, GraduationCap } from 'lucide-react';
import { cn } from '../lib/utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
export function DashboardWalas() {
  const _syncTick = useRealtime();
  const {
    user
  } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState<any[]>([]);
  const [pemantauanRecords, setPemantauanRecords] = useState<any[]>([]);
  useEffect(() => {
    if (!user) return;
    const myClass = user.className || user.class_name;
    const today = (function(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');})();
    Promise.all([apiClient('/crud.php?table=students'), apiClient('/crud.php?table=pemantauan_pagi')]).then(([studentsData, pemantauanData]) => {
      if (Array.isArray(studentsData)) {
        setStudents(studentsData.filter((s: any) => s.class_name === myClass));
      }
      if (Array.isArray(pemantauanData)) {
        setPemantauanRecords(pemantauanData.filter((r: any) => r.tanggal === today && String(r.class_name) === String(myClass)));
      }
    }).catch(console.error);
  }, [user, _syncTick]);
  const [selectedDate] = useState(new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }));
  const menuItems = [{
    to: '/data-siswa',
    icon: Users,
    label: 'Data Siswa'
  }, {
    to: '/users',
    icon: Users,
    label: 'Akun Pengguna'
  }, {
    to: '/jadwal-pelajaran-kelas',
    icon: Calendar,
    label: 'Jadwal Pelajaran'
  }, {
    to: '/absensi',
    icon: CheckSquare,
    label: 'Absensi'
  }, {
    to: '/input-nilai',
    icon: Edit3,
    label: 'Input Nilai'
  }, {
    to: '/kalender-akademik',
    icon: CalendarDays,
    label: 'Kalender Akademik'
  }, {
    to: '/laporan',
    icon: ClipboardList,
    label: 'Cetak Laporan'
  }, {
    to: '/pemantauan',
    icon: ShieldCheck,
    label: 'Pemantauan Pagi'
  }, {
    to: '/nilai-sikap',
    icon: Heart,
    label: 'Nilai Sikap'
  }, {
    to: '/sholat-zuhur',
    icon: Moon,
    label: 'Sholat Zuhur'
  }];
  return <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-800 to-teal-900 rounded-2xl p-6 md:p-8 text-white shadow-md">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-12 translate-y-12">
          <GraduationCap className="w-80 h-80 text-white" />
        </div>
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-xs rounded-full text-xs font-semibold text-emerald-300">
            <Calendar className="w-3.5 h-3.5" />
            <span>{selectedDate}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight leading-tight">
            Selamat Datang, {user?.name || 'Wali Kelas'}
          </h1>
          <p className="text-emerald-100/95 text-xs md:text-sm font-medium leading-relaxed max-w-2xl">
            Sistem Informasi Aktivitas Terintegrated (SIKAT) MA Al-Ihsan Boarding School Riau. Portal Wali Kelas untuk mengawasi perkembangan akademik, pembinaan akhlak, and rekapitulasi kehadiran kelas binaan Anda.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-150/60 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-700">Kelas Binaan:</span>
          <span className="font-extrabold text-xs text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-150/50 uppercase tracking-wider">{user?.className || user?.class_name || '-'}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:hidden">
        {menuItems.map((item, index) => <button key={index} onClick={() => navigate(item.to)} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center gap-3 hover:border-emerald-500 hover:shadow-md transition-all group">
            <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
              <item.icon className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-slate-600 text-center uppercase tracking-wider group-hover:text-emerald-700">
              {item.label}
            </span>
          </button>)}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest flex justify-between">
            Kehadiran Hari Ini
            <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded">Sangat Baik</span>
          </div>
          <div className="flex items-end mt-2">
            <span className="text-3xl font-black text-slate-800">98%</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest flex justify-between">
            Pelanggaran (Minggu ini)
            <div className="w-5 h-5 rounded flex items-center justify-center bg-red-50">
              <ShieldAlert className="w-3 h-3 text-red-600" />
            </div>
          </div>
          <div className="flex items-end mt-2">
            <span className="text-3xl font-black text-slate-800">02</span>
          </div>
        </div>
      </div>

      
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <span className="w-1 h-4 bg-emerald-500 rounded"></span>
            <CardTitle>Trend Kehadiran Kelas (Bulan Ini)</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="h-64 w-full pt-4">
          <ResponsiveContainer width="100%" height={256}>
            <AreaChart data={[{
            name: 'Mg 1',
            Hadir: 95
          }, {
            name: 'Mg 2',
            Hadir: 98
          }, {
            name: 'Mg 3',
            Hadir: 96
          }, {
            name: 'Mg 4',
            Hadir: 99
          }]} margin={{
            top: 10,
            right: 10,
            left: -20,
            bottom: 0
          }}>
              <defs>
                <linearGradient id="colorHadir" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{
              fontSize: 12,
              fill: '#64748b'
            }} />
              <YAxis axisLine={false} tickLine={false} tick={{
              fontSize: 12,
              fill: '#64748b'
            }} domain={[90, 100]} />
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <Tooltip />
              <Area type="monotone" dataKey="Hadir" stroke="#10b981" fillOpacity={1} fill="url(#colorHadir)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1 h-4 bg-emerald-500 rounded"></span>
            <CardTitle>Status Pemantauan Pagi</CardTitle>
          </div>
          <Button size="sm" onClick={() => navigate('/pemantauan')}>INPUT PEMANTAUAN</Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-[10px] text-slate-400 uppercase tracking-tighter border-b border-slate-100 bg-slate-50/50">
                <tr>
                  <th className="px-5 py-3">Siswa</th>
                  <th className="px-5 py-3 text-center">Kebersihan (Piket)</th>
                  <th className="px-5 py-3 text-center">Seragam</th>
                  <th className="px-5 py-3 text-left">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {students.length === 0 ? <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-slate-500 italic">Belum ada data siswa</td>
                  </tr> : students.slice(0, 5).map(student => {
                const record = pemantauanRecords.find(r => String(r.student_id) === String(student.id));
                const isPiket = record?.kebersihan === 'Piket';
                const isLengkap = record?.seragam === 'Lengkap';
                return <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-3 font-bold text-slate-800">
                          {student.name}
                          <span className="block text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">NIS: {student.nis}</span>
                        </td>
                        <td className="px-5 py-3 text-center">
                          {record ? <span className={`px-2 py-1 rounded text-[10px] font-bold ${isPiket ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                              {record.kebersihan}
                            </span> : <span className="text-xs text-slate-400">-</span>}
                        </td>
                        <td className="px-5 py-3 text-center">
                          {record ? <span className={`px-2 py-1 rounded text-[10px] font-bold ${isLengkap ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                              {record.seragam}
                            </span> : <span className="text-xs text-slate-400">-</span>}
                        </td>
                        <td className="px-5 py-3 text-left text-xs text-slate-500 font-medium">
                          {record?.ket_seragam || '-'}
                        </td>
                      </tr>;
              })}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-xl">
             <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-slate-600">
                   <span className="font-bold text-slate-800">Motivasi Hari Ini:</span> "{pemantauanRecords.length > 0 && pemantauanRecords[0].motivasi_pagi ? pemantauanRecords[0].motivasi_pagi : 'Belum ada motivasi yang diberikan.'}"
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate('/pemantauan')} className="w-full sm:w-auto text-xs">
                   Lihat Semua
                </Button>
             </div>
          </div>
        </CardContent>
      </Card>
    </div>;
}