import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { apiClient } from '../lib/apiClient';

export function AdminResetData() {
  
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  
  const resetOptions = [
    {
      id: 'sholat_dhuha',
      title: 'Absensi Sholat Dhuha',
      desc: 'Hapus semua data absensi sholat Dhuha harian siswa.',
      query: `DELETE FROM ibadah_siswa WHERE type = 'Dhuha'`
    },
    {
      id: 'sholat_zuhur_siswa',
      title: 'Absensi Sholat Zuhur Siswa',
      desc: 'Hapus semua data absensi sholat Zuhur harian siswa.',
      query: `DELETE FROM ibadah_siswa WHERE type = 'Zuhur'`
    },
    {
      id: 'sholat_zuhur_guru',
      title: 'Absensi Sholat Zuhur Pegawai',
      desc: 'Hapus semua data absensi sholat Zuhur harian guru dan pegawai.',
      query: `DELETE FROM ibadah_guru`
    },
    {
      id: 'presensi_walas',
      title: 'Absensi Wali Kelas',
      desc: 'Hapus semua data presensi harian siswa yang diinput Wali Kelas.',
      query: `DELETE FROM student_attendance WHERE subject_name = 'Presensi Wali Kelas'`
    },
    {
      id: 'presensi_mapel',
      title: 'Absensi Kehadiran Mapel',
      desc: 'Hapus semua data presensi siswa per mata pelajaran.',
      query: `DELETE FROM student_attendance WHERE subject_name != 'Presensi Wali Kelas'`
    },
    {
      id: 'jurnal_guru',
      title: 'Jurnal Mengajar Guru',
      desc: 'Hapus semua data jurnal kegiatan belajar mengajar guru.',
      query: `DELETE FROM jurnal_guru`
    },
    {
      id: 'pemantauan_pagi',
      title: 'Pemantauan Pagi Walas',
      desc: 'Hapus semua data pemantauan pagi (kebersihan, seragam, dll).',
      query: `DELETE FROM pemantauan_pagi`
    }
  ];

  const handleReset = async (option: any) => {
    if (!window.confirm(`PERINGATAN: Anda yakin ingin mereset data "${option.title}"?\n\nData yang dihapus tidak dapat dikembalikan!`)) {
      return;
    }
    
    setLoading(true);
    setSuccessMsg('');
    try {
      await apiClient('/query.php', {
        method: 'POST',
        body: JSON.stringify({ query: option.query })
      });
      setSuccessMsg(`Data ${option.title} berhasil direset.`);
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (e) {
      console.error(e);
      alert('Gagal mereset data. Periksa koneksi atau console.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetAll = async () => {
    if (!window.confirm(`PERINGATAN SANGAT PENTING!\n\nAnda yakin ingin mereset SEMUA data absensi & jurnal harian?\n\nTindakan ini menghapus SEMUA data kehadiran dan jurnal dari seluruh kelas. Data tidak dapat dikembalikan!`)) {
      return;
    }
    
    setLoading(true);
    setSuccessMsg('');
    try {
      for (const opt of resetOptions) {
        await apiClient('/query.php', {
          method: 'POST',
          body: JSON.stringify({ query: opt.query })
        });
      }
      setSuccessMsg('Semua data harian berhasil direset.');
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (e) {
      console.error(e);
      alert('Terjadi kesalahan saat mereset sebagian data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">Reset Data Harian</h1>
          <p className="text-sm text-slate-500 mt-1">Hapus data operasional harian yang sudah tidak diperlukan</p>
        </div>
        
        <button 
          onClick={handleResetAll}
          disabled={loading}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          <AlertTriangle className="w-4 h-4" /> Reset Semua Data Harian
        </button>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 text-emerald-700 p-4 rounded-lg flex items-center gap-3 border border-emerald-200 shadow-sm animate-in fade-in zoom-in duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <p className="text-sm font-bold">{successMsg}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {resetOptions.map((opt) => (
          <Card key={opt.id} className="border-red-100 hover:border-red-200 transition-colors">
            <CardContent className="p-5 flex flex-col h-full justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Trash2 className="w-5 h-5 text-red-500" />
                  <h3 className="font-bold text-slate-800">{opt.title}</h3>
                </div>
                <p className="text-sm text-slate-600">{opt.desc}</p>
              </div>
              <button
                onClick={() => handleReset(opt)}
                disabled={loading}
                className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-bold transition-colors border border-red-200 disabled:opacity-50"
              >
                Reset Data
              </button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
