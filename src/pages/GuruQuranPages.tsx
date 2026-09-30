import { useRealtime } from "../lib/useRealtime";
import { Laporan, Absensi } from './GuruPages';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { CustomSelect } from '../components/ui/CustomSelect';
import { Heart, FileBarChart, Check, GraduationCap, Calendar, Users, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../lib/apiClient';
import { remoteStorage } from "../lib/remoteStorage";
import { Button } from '../components/ui/Button';
import { mockStudents as globalStudents } from '../data/mock';
import { TermSwitcher } from '../components/ui/TermSwitcher';

export function DashboardGuruQuran() {
  const { user } = useAuth();
  const [totalStudents, setTotalStudents] = useState<number>(globalStudents.length);
  const todayDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  useEffect(() => {
    apiClient('/crud.php?table=students').then(data => {
      if (Array.isArray(data) && data.length > 0) setTotalStudents(data.length);
    }).catch(() => {});
  }, []);

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
            Selamat Datang, {user?.name || 'Guru Qur\'an'}
          </h1>
          <p className="text-emerald-100/95 text-xs md:text-sm font-medium leading-relaxed max-w-2xl">
            Sistem Informasi Aktivitas Terintegrasi (SIKAT) MA Al-Ihsan Boarding School Riau. Portal Guru Al-Qur'an untuk memantau setoran hafalan (halaqah), presensi kehadiran siswa, dan perkembangan capaian pembelajaran Al-Qur'an.
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
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-emerald-800">Total Siswa Terdaftar</p>
                <p className="text-2xl font-black text-emerald-900 mt-1">{totalStudents}</p>
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
                <p className="text-sm font-bold text-blue-800">Presensi Kehadiran Siswa</p>
                <p className="text-2xl font-black text-blue-900 mt-1">Terkoneksi Walas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function GuruQuranAbsensiDhuha() {
  return <Absensi />;
}

export function GuruQuranLaporanDhuha() {
  return <Laporan />;
}