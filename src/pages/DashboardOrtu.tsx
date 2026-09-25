import { TermSwitcher } from '../components/ui/TermSwitcher';
import React, { useState, useEffect } from 'react';
import { UserAnnouncements } from '../components/ui/UserAnnouncements';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Users, CheckSquare, FileText, MessageSquare, CreditCard, Activity, Calendar, AlertCircle, ChevronRight, GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export function DashboardOrtu() {
  
  const { user } = useAuth();
  const navigate = useNavigate();

  // Simulasi multi-anak (Lintas jenjang X, XI, XII)
  const mockChildren = [
    {
      id: 'c1',
      name: 'Ahmad Fauzi',
      nis: '10112233',
      grade: 'XII',
      className: 'XII IPA 1',
      attendance: '98%',
      avgGrade: '86.5',
      spInfo: 'Aman (0 Poin)',
      waliKelas: 'Siti Aminah, M.Pd'
    },
    {
      id: 'c2',
      name: 'Siti Nurhaliza',
      nis: '10112244',
      grade: 'X',
      className: 'X-1',
      attendance: '95%',
      avgGrade: '82.0',
      spInfo: 'SP 1 (25 Poin)',
      waliKelas: 'Budi Santoso, S.Pd'
    }
  ];

  const parentMenus = [
    { label: 'Data Akademik & Nilai', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50', to: '/nilai-anak', desc: 'Rapor dan nilai harian' },
    { label: 'Riwayat Kehadiran', icon: CheckSquare, color: 'text-emerald-600', bg: 'bg-emerald-50', to: '/absensi-anak', desc: 'Rekap absensi siswa' },
    { label: 'Sikap & Kedisiplinan', icon: Activity, color: 'text-amber-600', bg: 'bg-amber-50', to: '/sikap-anak', desc: 'Catatan poin dan info SP dari wakakesiswaan' },
    { label: 'Jadwal & Agenda', icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-50', to: '#', desc: 'Jadwal pelajaran & ujian' },
    { label: 'Pesan Wali Kelas', icon: MessageSquare, color: 'text-indigo-600', bg: 'bg-indigo-50', to: '/pesan', desc: 'Komunikasi guru' },
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
            Selamat Datang, Bapak/Ibu {user?.name || 'Wali Murid'}
          </h1>
          <p className="text-emerald-100/95 text-xs md:text-sm font-medium leading-relaxed max-w-2xl">
            Sistem Informasi Aktivitas Terintegrasi (SIKAT) MA Al-Ihsan Boarding School Riau. Portal Wali Murid untuk memantau rekap absensi, perkembangan nilai akademik, and catatan kedisiplinan putra/putri Anda secara langsung.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-slate-150/60 shadow-xs">
        <span className="text-sm font-bold text-slate-700">Tahun Akademik:</span>
        <TermSwitcher />
      </div>

      <UserAnnouncements />

      {/* Grid Menu Cepat untuk Orang Tua */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {parentMenus.map((item, i) => (
          <button 
            key={i} 
            onClick={() => { if(item.to !== '#') navigate(item.to); }} 
            className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-start gap-4 hover:border-emerald-500 hover:shadow-md transition-all text-left group"
          >
             <div className={`w-12 h-12 shrink-0 rounded-xl ${item.bg} ${item.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
               <item.icon className="w-6 h-6" />
             </div>
             <div>
               <span className="block text-sm font-bold text-slate-800">{item.label}</span>
               <span className="text-[10px] sm:text-xs text-slate-500 line-clamp-2 mt-0.5">{item.desc}</span>
             </div>
          </button>
        ))}
      </div>

      {/* Agenda & Pengingat Terdekat */}
      <h2 className="text-lg font-bold tracking-tight text-slate-800 mt-8 mb-4">Agenda & Pengingat Terdekat</h2>
      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {[
              { date: '15 Nov 2026', title: 'Pembagian Raport Tengah Semester', type: 'Akademik', color: 'text-blue-600', bg: 'bg-blue-100' },
              { date: '20 Nov 2026', title: 'Pertemuan Paguyuban Orang Tua (POTM)', type: 'Pertemuan', color: 'text-emerald-600', bg: 'bg-emerald-100' },
              { date: '25 Nov 2026', title: 'Batas Akhir Pengumpulan Tugas Karya Tulis', type: 'Tugas', color: 'text-amber-600', bg: 'bg-amber-100' },
            ].map((agenda, idx) => (
              <div key={idx} className="p-4 flex items-start gap-4 hover:bg-slate-50 transition-colors">
                <div className="w-14 text-center shrink-0">
                  <span className="block text-xl font-black text-slate-800 leading-none">{agenda.date.split(' ')[0]}</span>
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{agenda.date.split(' ')[1]}</span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">{agenda.title}</h3>
                  <span className={`inline-block mt-1 px-2 py-0.5 ${agenda.bg} ${agenda.color} text-[10px] font-bold uppercase rounded-md`}>
                    {agenda.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
