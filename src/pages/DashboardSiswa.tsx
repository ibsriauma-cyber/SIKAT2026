import React from 'react';
import { TermSwitcher } from '../components/ui/TermSwitcher';
// from 'react';
import { UserAnnouncements } from '../components/ui/UserAnnouncements';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { FileText, ClipboardList, BookOpen, Clock, GraduationCap, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

export function DashboardSiswa() {
  
  const { user } = useAuth();
  const todayDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  
  return (
    <div className="space-y-6">
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
            Selamat Datang, {user?.name || 'Siswa'}
          </h1>
          <p className="text-emerald-100/95 text-xs md:text-sm font-medium leading-relaxed max-w-2xl">
            Sistem Informasi Aktivitas Terintegrasi (SIKAT) MA Al-Ihsan Boarding School Riau. Portal Siswa untuk memeriksa tugas, memantau riwayat hafalan Quran, and melihat jadwal pelajaran harian Anda.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-slate-150/60 shadow-xs">
        <span className="text-sm font-bold text-slate-700">Tahun Akademik:</span>
        <TermSwitcher />
      </div>
      <UserAnnouncements />

      

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-emerald-50 border-emerald-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-emerald-800">Tugas Belum Selesai</p>
                <p className="text-2xl font-black text-emerald-900 mt-1">3</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                <ClipboardList className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-blue-800">Ujian Mendatang</p>
                <p className="text-2xl font-black text-blue-900 mt-1">1</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-amber-50 border-amber-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-amber-800">Materi Baru</p>
                <p className="text-2xl font-black text-amber-900 mt-1">5</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-purple-50 border-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-purple-800">Kehadiran (Bulan ini)</p>
                <p className="text-2xl font-black text-purple-900 mt-1">98%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tugas Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">Tugas Matematika Peminatan</h4>
                      <p className="text-xs text-slate-500 font-medium">Batas Waktu: 15 Juli 2026</p>
                    </div>
                  </div>
                  <button className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors">
                    Kerjakan
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Jadwal Hari Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { time: '07:30 - 09:00', subject: 'Matematika Peminatan', teacher: 'Budi Santoso, S.Pd' },
                { time: '09:00 - 10:30', subject: 'Bahasa Indonesia', teacher: 'Siti Aminah, M.Pd' },
                { time: '10:45 - 12:15', subject: 'Pendidikan Agama Islam', teacher: 'Drs. Ahmad Dahlan' },
              ].map((schedule, i) => (
                <div key={i} className="flex items-center gap-4 p-4 border-b border-slate-100 last:border-0 last:pb-0">
                  <div className="w-20 shrink-0">
                    <p className="text-xs font-bold text-slate-500">{schedule.time}</p>
                  </div>
                  <div className="w-1.5 h-10 bg-emerald-500 rounded-full"></div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{schedule.subject}</h4>
                    <p className="text-xs text-slate-500 font-medium">{schedule.teacher}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center gap-2">
            <span className="w-1 h-4 bg-emerald-500 rounded"></span>
            <CardTitle>Profil Kompetensi Akademik</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="h-64 w-full pt-4">
          <ResponsiveContainer width="100%" height={256}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
              { subject: 'Matematika', A: 85, fullMark: 100 },
              { subject: 'Sains', A: 90, fullMark: 100 },
              { subject: 'Bahasa', A: 80, fullMark: 100 },
              { subject: 'Agama', A: 95, fullMark: 100 },
              { subject: 'Sosial', A: 88, fullMark: 100 },
            ]}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} />
              <Radar name="Nilai Siswa" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

</div>
  );
}
