import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Calendar, User, Info, FileText, CheckCircle, HelpCircle, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function getChildData(user?: any) {
  if (user?.username === 'ortu' || user?.name?.toLowerCase().includes('farhan')) {
    return {
      id: 'farhan',
      name: 'Farhan Al-Fatih',
      nis: '120201001',
      className: 'X MIPA 1',
      waliKelas: 'Ustd. Siti Aminah, S.Ag.'
    };
  }
  return {
    id: 'c1',
    name: 'Ahmad Fauzi',
    nis: '10112233',
    className: 'XII IPA 1',
    waliKelas: 'Siti Aminah, M.Pd'
  };
}

export function DataAnak() {
  
  const { user } = useAuth();
  const child = getChildData(user);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold tracking-tight text-slate-800">Data Anak</h1>
      <Card>
        <CardHeader><CardTitle>Profil Lengkap Siswa</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-24 h-24 bg-slate-200 rounded-full shrink-0 border-4 border-white shadow-sm mx-auto md:mx-0"></div>
            <div className="w-full space-y-4">
              <div>
                <span className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider">Nama Lengkap</span>
                <span className="font-medium text-slate-800">{child.name}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider">NISN / NIS</span>
                  <span className="font-medium text-slate-800">0081234567 / {child.nis}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider">Kelas</span>
                  <span className="font-medium text-slate-800">{child.className}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider">Wali Kelas</span>
                  <span className="font-medium text-slate-800">{child.waliKelas}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function AbsensiAnak() {
  
  const { user } = useAuth();
  const child = getChildData(user);
  const [selectedMonth, setSelectedMonth] = useState('November 2026');

  const months = [
    'November 2026',
    'Oktober 2026',
    'September 2026',
    'Agustus 2026'
  ];

  const attendanceData: Record<string, Record<string, {
    summary: { hadir: number; izin: number; sakit: number; alpa: number };
    details: { date: string; status: 'Izin' | 'Sakit'; reason: string }[];
  }>> = {
    c1: {
      'November 2026': {
        summary: { hadir: 22, izin: 1, sakit: 1, alpa: 0 },
        details: [
          { date: '12 Nov 2026', status: 'Izin', reason: 'Acara pernikahan kakak kandung' },
          { date: '05 Nov 2026', status: 'Sakit', reason: 'Sakit demam tinggi dan influenza' }
        ]
      },
      'Oktober 2026': {
        summary: { hadir: 24, izin: 0, sakit: 0, alpa: 0 },
        details: []
      },
      'September 2026': {
        summary: { hadir: 20, izin: 2, sakit: 1, alpa: 1 },
        details: [
          { date: '18 Sep 2026', status: 'Izin', reason: 'Pemeriksaan kesehatan gigi rutin di faskes' },
          { date: '10 Sep 2026', status: 'Sakit', reason: 'Migrain / sakit kepala sebelah akut' },
          { date: '04 Sep 2026', status: 'Izin', reason: 'Mengurus administrasi keluarga di luar kota' }
        ]
      },
      'Agustus 2026': {
        summary: { hadir: 21, izin: 1, sakit: 0, alpa: 0 },
        details: [
          { date: '25 Agst 2026', status: 'Izin', reason: 'Menghadiri syukuran khitanan kerabat keluarga dekat' }
        ]
      }
    },
    farhan: {
      'November 2026': {
        summary: { hadir: 23, izin: 1, sakit: 0, alpa: 0 },
        details: [
          { date: '18 Nov 2026', status: 'Izin', reason: 'Izin keluarga ada urusan mendesak' }
        ]
      },
      'Oktober 2026': {
        summary: { hadir: 22, izin: 1, sakit: 1, alpa: 0 },
        details: [
          { date: '15 Okt 2026', status: 'Izin', reason: 'Mengikuti perlombaan pencak silat eksternal' },
          { date: '08 Okt 2026', status: 'Sakit', reason: 'Sakit flu dan batuk' }
        ]
      },
      'September 2026': {
        summary: { hadir: 24, izin: 0, sakit: 0, alpa: 0 },
        details: []
      },
      'Agustus 2026': {
        summary: { hadir: 21, izin: 1, sakit: 0, alpa: 0 },
        details: [
          { date: '22 Agst 2026', status: 'Izin', reason: 'Menghadiri acara pernikahan saudara' }
        ]
      }
    }
  };

  const currentData = attendanceData[child.id]?.[selectedMonth] || {
    summary: { hadir: 0, izin: 0, sakit: 0, alpa: 0 },
    details: []
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">Riwayat Kehadiran</h1>
          <p className="text-slate-500 text-sm mt-0.5">Memantau data kehadiran dari Ananda <span className="font-bold text-slate-700">{child.name}</span> ({child.className}).</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Month Filter Selector */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-sm w-full sm:w-48"
          >
            {months.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600" />
            Rekap Kehadiran Bulan {selectedMonth}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100 shadow-inner text-center">
            <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100">
              <span className="block font-black text-2xl text-emerald-600">{currentData.summary.hadir}</span>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Hadir</span>
            </div>
            <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100">
              <span className="block font-black text-2xl text-amber-500">{currentData.summary.izin}</span>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Izin</span>
            </div>
            <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100">
              <span className="block font-black text-2xl text-blue-500">{currentData.summary.sakit}</span>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Sakit</span>
            </div>
            <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100">
              <span className="block font-black text-2xl text-rose-500">{currentData.summary.alpa}</span>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Alpa</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details of Sick & Permission */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-600" />
            Detail Keterangan (Sakit & Izin)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentData.details.length > 0 ? (
            <div className="space-y-3">
              {currentData.details.map((detail, idx) => (
                <div 
                  key={idx} 
                  className={`p-4 rounded-xl border flex flex-col md:flex-row justify-between md:items-center gap-3 transition-colors ${
                    detail.status === 'Sakit' 
                      ? 'border-blue-100 bg-blue-50/50 hover:bg-blue-50' 
                      : 'border-amber-100 bg-amber-50/50 hover:bg-amber-50'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className={`px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-md tracking-wider ${
                        detail.status === 'Sakit' 
                          ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                          : 'bg-amber-100 text-amber-700 border border-amber-200'
                      }`}>
                        {detail.status}
                      </span>
                      <span className="font-bold text-slate-800 text-sm">{detail.date}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      <span className="font-bold text-slate-700">Keterangan:</span> {detail.reason}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 border border-dashed border-slate-200 rounded-xl bg-slate-50/50 flex flex-col items-center justify-center gap-2">
              <CheckCircle className="w-8 h-8 text-emerald-500 animate-bounce" />
              <div>
                <p className="text-sm font-bold text-slate-700">Luar Biasa! Nihil Ketidakhadiran</p>
                <p className="text-xs text-slate-400 mt-0.5">Siswa tercatat hadir penuh tanpa izin maupun sakit di bulan {selectedMonth}.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function NilaiAnak() {
  
  const [selectedSemester, setSelectedSemester] = React.useState('Ganjil 2026/2027');
  const semesters = [
    { value: 'Ganjil 2026/2027', label: 'Ganjil 2026/2027 (Aktif)' },
    { value: 'Genap 2025/2026', label: 'Genap 2025/2026' },
    { value: 'Ganjil 2025/2026', label: 'Ganjil 2025/2026' },
    { value: 'Genap 2024/2025', label: 'Genap 2024/2025' },
    { value: 'Ganjil 2024/2025', label: 'Ganjil 2024/2025' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl font-bold tracking-tight text-slate-800">Laporan Nilai</h1>
        <select
          value={selectedSemester}
          onChange={(e) => setSelectedSemester(e.target.value)}
          className="w-full sm:w-auto p-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
        >
          {semesters.map((s, i) => (
            <option key={i} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>
      <Card>
        <CardHeader><CardTitle>Penilaian Tengah Semester ({selectedSemester})</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { mapel: 'Pendidikan Agama Islam', nilai: 90 },
              { mapel: 'Matematika', nilai: 85 },
              { mapel: 'Bahasa Indonesia', nilai: 88 },
              { mapel: 'Bahasa Inggris', nilai: 82 },
              { mapel: 'Fisika', nilai: 78 },
            ].map((n, i) => (
              <div key={i} className="flex justify-between items-center p-3 bg-slate-50 border border-slate-100 rounded-lg">
                <span className="font-medium text-slate-800 text-sm">{n.mapel}</span>
                <span className="font-black text-emerald-600">{n.nilai}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function PesanWaliKelas() {
  
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold tracking-tight text-slate-800">Pesan Wali Kelas</h1>
      <Card>
        <CardHeader><CardTitle>Riwayat Pesan</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl rounded-tl-none">
              <p className="text-xs font-bold text-slate-500 mb-1">Siti Aminah, M.Pd (Wali Kelas) • 12 Nov 2026</p>
              <p className="text-sm text-slate-800">Bapak/Ibu, mohon diingatkan kepada Fauzi untuk membawa peralatan praktikum biologi besok pagi. Terima kasih.</p>
            </div>
            
            <div className="mt-4 pt-4 border-t border-slate-200">
              <textarea rows={3} placeholder="Balas pesan wali kelas..." className="w-full p-3 border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500 mb-2"></textarea>
              <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs uppercase tracking-wider transition-colors">Kirim Balasan</button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function SikapAnak() {
  
  const { user } = useAuth();
  const child = getChildData(user);

  const spData = [
    { id: 1, date: '15 Okt 2026', type: 'Surat Peringatan 1', points: 25, reason: 'Terlambat 3 kali beruntun' },
  ];

  const bkData = [
    { id: 1, date: '20 Okt 2026', counselor: 'Drs. Supriadi', topic: 'Konseling Akademik', status: 'Selesai' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">Sikap & Kedisiplinan</h1>
          <p className="text-slate-500 text-sm mt-0.5">Memantau catatan poin kedisiplinan dan info bimbingan konseling Ananda <span className="font-bold text-slate-700">{child.name}</span>.</p>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Catatan Kedisiplinan (Poin & SP)</CardTitle></CardHeader>
        <CardContent>
          {child.id === 'c2' || child.id === 'farhan' ? (
            <div className="space-y-3">
              {spData.map(sp => (
                <div key={sp.id} className="p-4 border border-amber-200 bg-amber-50 rounded-xl">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-amber-700">{sp.type}</span>
                    <span className="text-xs font-semibold text-amber-600 bg-amber-100 px-2 py-1 rounded">{sp.date}</span>
                  </div>
                  <p className="text-sm text-slate-700">Alasan: {sp.reason}</p>
                  <p className="text-xs text-amber-600 font-bold mt-2">Poin Diberikan: {sp.points}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 border border-slate-100 rounded-xl bg-slate-50">
              Tidak ada catatan kedisiplinan atau pelanggaran untuk siswa ini.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Catatan Bimbingan Konseling (BK)</CardTitle></CardHeader>
        <CardContent>
          {child.id === 'c1' || child.id === 'farhan' ? (
            <div className="space-y-3">
              {bkData.map(bk => (
                <div key={bk.id} className="p-4 border border-blue-200 bg-blue-50 rounded-xl">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-blue-700">{bk.topic}</span>
                    <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded">{bk.date}</span>
                  </div>
                  <p className="text-sm text-slate-700">Konselor: {bk.counselor}</p>
                  <p className="text-xs text-blue-600 font-bold mt-2">Status: {bk.status}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 border border-slate-100 rounded-xl bg-slate-50">
              Tidak ada riwayat bimbingan konseling.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
