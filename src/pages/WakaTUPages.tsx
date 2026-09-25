import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { CalendarDays, BookOpen, FileText, Users, Target, Activity, CreditCard, Database, GraduationCap, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TermSwitcher } from '../components/ui/TermSwitcher';

export function DashboardWakaKurikulum() {
  
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
            Selamat Datang, {user?.name || 'Waka Kurikulum'}
          </h1>
          <p className="text-emerald-100/95 text-xs md:text-sm font-medium leading-relaxed max-w-2xl">
            Sistem Informasi Aktivitas Terintegrasi (SIKAT) MA Al-Ihsan Boarding School Riau. Halaman Pusat Kendali Kurikulum untuk mengelola kalender akademik, pembagian jam mengajar, and pemantauan proses KBM.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-slate-150/60 shadow-xs">
        <span className="text-sm font-bold text-slate-700">Tahun Akademik:</span>
        <TermSwitcher />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-emerald-50 border-emerald-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                <CalendarDays className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-emerald-800">Jam Mengajar Aktif</p>
                <p className="text-2xl font-black text-emerald-900 mt-1">128 Jam</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-blue-800">Rata-rata Nilai Sekolah</p>
                <p className="text-2xl font-black text-blue-900 mt-1">82.5</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-amber-50 border-amber-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-amber-800">Ujian Berlangsung</p>
                <p className="text-2xl font-black text-amber-900 mt-1">3</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Aktivitas Kurikulum Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-300 rounded-xl">
            <p className="text-slate-500 font-medium text-sm">Tidak ada aktivitas terbaru.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function DashboardWakaKesiswaan() {
  
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
            Selamat Datang, {user?.name || 'Waka Kesiswaan'}
          </h1>
          <p className="text-emerald-100/95 text-xs md:text-sm font-medium leading-relaxed max-w-2xl">
            Sistem Informasi Aktivitas Terintegrasi (SIKAT) MA Al-Ihsan Boarding School Riau. Halaman Pusat Kendali Kesiswaan untuk mengelola poin kedisiplinan, perizinan santri, and pengawasan ekstrakurikuler.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-slate-150/60 shadow-xs">
        <span className="text-sm font-bold text-slate-700">Tahun Akademik:</span>
        <TermSwitcher />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/kesiswaan/data" className="block">
        <Card className="bg-indigo-50 border-indigo-100 hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-indigo-800">Total Siswa Aktif</p>
                <p className="text-2xl font-black text-indigo-900 mt-1">452</p>
              </div>
            </div>
          </CardContent>
        </Card>
        </Link>

        <Card className="bg-rose-50 border-rose-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-rose-800">Pelanggaran Bulan Ini</p>
                <p className="text-2xl font-black text-rose-900 mt-1">12</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Link to="/kesiswaan/ekskul" className="block">
        <Card className="bg-emerald-50 border-emerald-100 hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-emerald-800">Ekskul Aktif</p>
                <p className="text-2xl font-black text-emerald-900 mt-1">8</p>
              </div>
            </div>
          </CardContent>
        </Card>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ringkasan Kegiatan Kesiswaan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-300 rounded-xl">
            <p className="text-slate-500 font-medium text-sm">Tidak ada kegiatan kesiswaan terbaru.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

