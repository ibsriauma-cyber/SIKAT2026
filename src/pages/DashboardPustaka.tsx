import React from 'react';
import { TermSwitcher } from '../components/ui/TermSwitcher';
// from 'react';
import { UserAnnouncements } from '../components/ui/UserAnnouncements';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { 
  Users, BookOpen, Undo2, PlusCircle, AlertTriangle, 
  BookOpenCheck, Laptop, Star, Clipboard, Library, 
  HeartHandshake, FileBarChart, Lightbulb, GraduationCap, Calendar 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function DashboardPustaka() {
  
  const { user } = useAuth();
  const navigate = useNavigate();

  const kpis = [
    { label: 'Pengunjung', value: '450', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Buku Dipinjam', value: '124', icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Dikembalikan', value: '98', icon: Undo2, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Koleksi Baru', value: '25', icon: PlusCircle, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Keterlambatan', value: '4%', icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50' },
    { label: 'Giat Literasi', value: '3', icon: BookOpenCheck, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Koleksi Digital', value: '1.2k', icon: Laptop, color: 'text-cyan-600', bg: 'bg-cyan-50' },
    { label: 'Kepuasan', value: '4.8', icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-50' },
  ];

  const tasks = [
    { label: 'Administrasi', desc: 'Peminjaman, pengembalian, pengunjung', icon: Clipboard, to: '/administrasi' },
    { label: 'Koleksi Buku', desc: 'Klasifikasi, cek kondisi, inventarisasi', icon: Library, to: '/koleksi' },
    { label: 'Layanan', desc: 'Bimbingan referensi, tata ruang', icon: HeartHandshake, to: '/layanan' },
    { label: 'Literasi', desc: 'Program baca, lomba, resensi', icon: BookOpenCheck, to: '/literasi' },
    { label: 'Digitalisasi', desc: 'E-book, katalog digital', icon: Laptop, to: '/digitalisasi' },
    { label: 'Pelaporan', desc: 'Rekap mingguan & bulanan', icon: FileBarChart, to: '/pelaporan' },
  ];

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
            Selamat Datang, {user?.name || 'Pustakawan'}
          </h1>
          <p className="text-emerald-100/95 text-xs md:text-sm font-medium leading-relaxed max-w-2xl">
            Sistem Informasi Aktivitas Terintegrasi (SIKAT) MA Al-Ihsan Boarding School Riau. Portal Perpustakaan untuk mengelola inventarisasi buku, sirkulasi peminjaman, and program peningkatan minat baca siswa.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-slate-150/60 shadow-xs">
        <span className="text-sm font-bold text-slate-700">Tahun Akademik:</span>
        <TermSwitcher />
      </div>
      <UserAnnouncements />

      

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <div className={`p-1.5 rounded-lg ${kpi.bg} ${kpi.color}`}>
                <kpi.icon className="w-3.5 h-3.5" />
              </div>
              {kpi.label}
            </div>
            <div className="flex items-end mt-3">
              <span className="text-2xl font-black text-slate-800">{kpi.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="w-1 h-4 bg-emerald-500 rounded"></span>
              <CardTitle>Ceklist Tugas & Operasional</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {tasks.map((task, i) => (
                <button 
                  key={i}
                  onClick={() => navigate(task.to)}
                  className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-all group text-left"
                >
                  <div className="w-8 h-8 shrink-0 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-600 group-hover:text-emerald-600 group-hover:border-emerald-200">
                    <task.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 group-hover:text-emerald-800">{task.label}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{task.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="w-1 h-4 bg-indigo-500 rounded"></span>
              <CardTitle>Aktivitas Terkini</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {[
              { time: '10:05', action: 'Peminjaman', item: 'Bumi Manusia', user: 'Alif (XII-IPA 1)', icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-100' },
              { time: '09:45', action: 'Pengembalian', item: 'Fisika Dasar', user: 'Rina (X-IPS 3)', icon: Undo2, color: 'text-indigo-600', bg: 'bg-indigo-100' },
              { time: '08:30', action: 'Daftar Baru', item: 'Laskar Pelangi', user: 'Pustakawan', icon: PlusCircle, color: 'text-purple-600', bg: 'bg-purple-100' },
            ].map((log, i) => (
              <div key={i} className="flex gap-3">
                <div className={`w-8 h-8 rounded-full flex shrink-0 items-center justify-center ${log.bg} ${log.color}`}>
                  <log.icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-700">{log.action}</p>
                  <p className="text-[10px] text-slate-500">{log.item} - {log.user}</p>
                </div>
                <span className="text-[10px] font-mono text-slate-400">{log.time}</span>
              </div>
            ))}
            <Button variant="outline" className="w-full text-xs mt-2">LIHAT SEMUA LOG</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
