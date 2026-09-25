import { useRealtime } from "../lib/useRealtime";
import React from 'react';
import { TermSwitcher } from '../components/ui/TermSwitcher';
// from 'react';
import { UserAnnouncements } from '../components/ui/UserAnnouncements';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, CheckSquare, Edit3, CalendarDays, Book, Folder, LineChart as LineChartIcon, FileText, Sun, Moon, ClipboardList, FileCheck, GraduationCap, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../lib/apiClient';
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
export function DashboardGuru() {
  const _syncTick = useRealtime();
  const {
    user
  } = useAuth();
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);
  const [teacherClasses, setTeacherClasses] = useState<string[]>([]);
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await apiClient('/crud.php?table=schedules');
        if (Array.isArray(data)) {
          // Filter by teacher_id and today's day
          const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
          const today = days[new Date().getDay()];
          const mySchedules = data.filter((d: any) => String(d.teacher_id) === String(user?.id) && d.day === today);
          const mapped = mySchedules.map((d: any) => ({
            time: (d.start_time?.substring(0, 5) || '') + ' - ' + (d.end_time?.substring(0, 5) || ''),
            class: d.class_name,
            subject: d.subject_name
          }));

          // Sort by start time
          mapped.sort((a, b) => a.time.localeCompare(b.time));
          setSchedules(mapped);
        }
        const assignmentsData = await apiClient('/crud.php?table=teaching_assignments');
        let myClasses: string[] = [];
        let schedClasses = [];
        if (Array.isArray(data)) {
          schedClasses = data.filter((d: any) => String(d.teacher_id) === String(user?.id)).map(d => d.class_name);
        }
        if (Array.isArray(assignmentsData)) {
          const assignClasses = assignmentsData.filter(a => String(a.teacher_id) === String(user?.id)).map(a => a.class_name);
          myClasses = Array.from(new Set([...assignClasses, ...schedClasses])).filter(Boolean) as string[];
          setTeacherClasses(myClasses);
        } else {
          myClasses = Array.from(new Set(schedClasses)).filter(Boolean) as string[];
          setTeacherClasses(myClasses);
        }
        const gradesResponse = await apiClient('/crud.php?table=grades');
        if (Array.isArray(gradesResponse)) {
          const weeks: any[] = [{
            name: 'Mg 1'
          }, {
            name: 'Mg 2'
          }, {
            name: 'Mg 3'
          }, {
            name: 'Mg 4'
          }];
          weeks.forEach(w => {
            myClasses.forEach(c => {
              w[`${c}_sum`] = 0;
              w[`${c}_count`] = 0;
            });
          });
          gradesResponse.forEach((g: any) => {
            if (myClasses.includes(g.class_name)) {
              const date = new Date(g.created_at || Date.now());
              const day = date.getDate();
              const weekIndex = Math.min(Math.floor((day - 1) / 7), 3);
              const w = weeks[weekIndex];
              w[`${g.class_name}_sum`] += parseFloat(g.score) || 0;
              w[`${g.class_name}_count`] += 1;
            }
          });
          weeks.forEach(w => {
            myClasses.forEach(c => {
              if (w[`${c}_count`] > 0) {
                w[c] = Math.round(w[`${c}_sum`] / w[`${c}_count`]);
              } else {
                w[c] = 0;
              }
              delete w[`${c}_sum`];
              delete w[`${c}_count`];
            });
          });
          setChartData(weeks);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) fetchDashboardData();
  }, [user, _syncTick]);
  const menuItems = [{
    to: '/data-siswa',
    icon: Users,
    label: 'Data Siswa'
  }, {
    to: '/jadwal-mengajar',
    icon: Calendar,
    label: 'Jadwal Mengajar'
  }, {
    to: '/absensi',
    icon: CheckSquare,
    label: 'Absensi'
  }, ...(user?.role === 'guru_quran' ? [{
    to: '/guru-quran/dhuha',
    icon: Heart,
    label: 'Absensi Dhuha'
  }] : []), {
    to: '/input-nilai',
    icon: Edit3,
    label: 'Input Nilai'
  }, {
    to: '/kalender-akademik',
    icon: CalendarDays,
    label: 'Kalender Akademik'
  }, {
    to: '/jurnal-mengajar',
    icon: Book,
    label: 'Jurnal Mengajar'
  }, {
    to: '/perangkat-ngajar',
    icon: Folder,
    label: 'Perangkat Ngajar'
  }, {
    to: '/analisis-siswa',
    icon: LineChartIcon,
    label: 'Analisis Siswa'
  }, {
    to: '/laporan',
    icon: FileText,
    label: 'Laporan'
  }, {
    to: '/sholat-duha',
    icon: Sun,
    label: 'Sholat Duha'
  }, {
    to: '/absensi-zuhur',
    icon: Moon,
    label: 'Absensi Sholat Zuhur Guru'
  }, {
    to: '/leave',
    icon: ClipboardList,
    label: 'Form Perizinan Guru'
  }, {
    to: '/settings',
    icon: FileCheck,
    label: 'Pengaturan Guru'
  }];
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
            Selamat Datang, {user?.name || 'Ustadz/Ustadzah'}
          </h1>
          <p className="text-emerald-100/95 text-xs md:text-sm font-medium leading-relaxed max-w-2xl">
            Sistem Informasi Aktivitas Terintegrasi (SIKAT) MA Al-Ihsan Boarding School Riau. Kelola modul ajar, presensi harian siswa, and catat perkembangan belajar mengajar secara real-time.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-slate-150/60 shadow-xs">
        <span className="text-sm font-bold text-slate-700">Tahun Akademik:</span>
        <TermSwitcher />
      </div>
      <UserAnnouncements />

      

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center">
              <span className="w-1 h-4 bg-emerald-500 rounded mr-2"></span> 
              Jadwal Mengajar & Absensi Hari Ini
            </CardTitle>
            <button className="text-[10px] font-bold text-emerald-600 uppercase hover:underline">Lihat Semua</button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="text-[10px] text-slate-400 uppercase tracking-tighter border-b border-slate-100 bg-slate-50/50">
                  <tr>
                    <th className="py-3 px-4">Waktu</th>
                    <th className="py-3 px-4">Kelas</th>
                    <th className="py-3 px-4">Mata Pelajaran</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {loading ? <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-500">Memuat jadwal...</td>
                    </tr> : schedules.length === 0 ? <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-500">Tidak ada jadwal mengajar hari ini.</td>
                    </tr> : schedules.map((schedule, i) => {
                  const isCurrentlyActive = (() => {
                    try {
                      const [startStr, endStr] = schedule.time.split(' - ');
                      const [startHour, startMinute] = startStr.split(':').map(Number);
                      const [endHour, endMinute] = endStr.split(':').map(Number);
                      const now = new Date();
                      const currentHour = now.getHours();
                      const currentMinute = now.getMinutes();
                      const currentTimeMinutes = currentHour * 60 + currentMinute;
                      const startTimeMinutes = startHour * 60 + startMinute;
                      const endTimeMinutes = endHour * 60 + endMinute;
                      return currentTimeMinutes >= startTimeMinutes && currentTimeMinutes <= endTimeMinutes;
                    } catch (e) {
                      return false;
                    }
                  })();
                  const isButtonsActive = (() => {
                    try {
                      const [startStr] = schedule.time.split(' - ');
                      const [startHour, startMinute] = startStr.split(':').map(Number);
                      const now = new Date();
                      const currentHour = now.getHours();
                      const currentMinute = now.getMinutes();
                      const currentTimeMinutes = currentHour * 60 + currentMinute;
                      const startTimeMinutes = startHour * 60 + startMinute;
                      const cutoffTimeMinutes = 17 * 60; // 17:00
                      return currentTimeMinutes >= startTimeMinutes && currentTimeMinutes <= cutoffTimeMinutes;
                    } catch (e) {
                      return false;
                    }
                  })();
                  return <tr key={i} className={`border-b border-slate-50 hover:bg-slate-50 transition-colors ${isCurrentlyActive ? 'bg-emerald-50/30' : ''}`}>
                      <td className={`py-4 px-4 font-medium ${isCurrentlyActive ? 'text-emerald-700' : 'text-slate-500'}`}>{schedule.time}</td>
                      <td className={`py-4 px-4 font-bold ${isCurrentlyActive ? 'text-emerald-900' : ''}`}>{schedule.class}</td>
                      <td className={`py-4 px-4 ${isCurrentlyActive ? 'text-emerald-900' : ''}`}>{schedule.subject}</td>
                      <td className="py-4 px-4">
                        <div className="flex gap-1.5 justify-end">
                          <button disabled={!isButtonsActive} onClick={() => navigate('/jurnal-mengajar')} className={`px-3 py-1.5 flex items-center justify-center text-[10px] font-bold rounded transition-all ${isButtonsActive ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 shadow-sm active:scale-95' : 'bg-slate-50 text-slate-400 border border-slate-100 cursor-not-allowed'}`} title="Isi Jurnal Mengajar">
                            JURNAL
                          </button>
                          <button disabled={!isButtonsActive} onClick={() => navigate('/absensi')} className={`px-3 py-1.5 flex items-center justify-center text-[10px] font-bold rounded transition-all ${isButtonsActive ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm active:scale-95' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`} title="Isi Absensi Siswa">
                            ABSENSI
                          </button>
                        </div>
                      </td>
                    </tr>;
                })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        

      </div>

        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="w-1 h-4 bg-emerald-500 rounded"></span>
              <CardTitle>Rata-rata Nilai Siswa (Bulan Ini)</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height={256}>
              <LineChart data={chartData.length > 0 ? chartData : [{
            name: 'Mg 1'
          }, {
            name: 'Mg 2'
          }, {
            name: 'Mg 3'
          }, {
            name: 'Mg 4'
          }]} margin={{
            top: 5,
            right: 20,
            bottom: 5,
            left: -20
          }}>
                {teacherClasses.map((className, index) => {
              const colors = ['#10b981', '#6366f1', '#f59e0b', '#ec4899', '#8b5cf6'];
              return <Line key={className} type="monotone" dataKey={className} stroke={colors[index % colors.length]} strokeWidth={2} />;
            })}
                {teacherClasses.length === 0 && <Line type="monotone" dataKey="dummy" stroke="#cbd5e1" strokeWidth={2} />}
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{
              fontSize: 12,
              fill: '#64748b'
            }} />
                <YAxis axisLine={false} tickLine={false} tick={{
              fontSize: 12,
              fill: '#64748b'
            }} />
                <Tooltip />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

</div>;
}