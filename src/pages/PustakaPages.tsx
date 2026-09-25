import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../lib/apiClient';

export function PustakaAdministrasi() {
  
  const [visitorCount, setVisitorCount] = useState('');
  const [borrowCount, setBorrowCount] = useState('');
  const [returnCount, setReturnCount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  
  const [tasks, setTasks] = useState({
    kebersihan: false,
    matikanAc: false,
    kunciPintu: false
  });

  const handleSave = async () => {
    if (!visitorCount || !borrowCount || !returnCount) {
      window.alert('Mohon lengkapi semua jumlah statistik.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const today = (function(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');})();
      const activityStr = `Pengunjung: ${visitorCount}, Dipinjam: ${borrowCount}, Dikembalikan: ${returnCount}. Tugas penutupan: ${tasks.kebersihan ? 'Selesai' : 'Belum'}, AC: ${tasks.matikanAc ? 'Selesai' : 'Belum'}, Kunci: ${tasks.kunciPintu ? 'Selesai' : 'Belum'}.`;
      
      await apiClient('/crud.php?table=laporan_harian', {
        method: 'POST',
        body: JSON.stringify({
          user_id: user?.id,
          role: 'pustakawan',
          date: today,
          activity: activityStr
        })
      });
      window.alert("Laporan harian perpustakaan berhasil disimpan ke database!");
      setVisitorCount('');
      setBorrowCount('');
      setReturnCount('');
      setTasks({ kebersihan: false, matikanAc: false, kunciPintu: false });
    } catch (err) {
      console.error(err);
      window.alert("Gagal menyimpan laporan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentHour = new Date().getHours();
  const isLate = currentHour >= 17;

  if (isLate) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-bold tracking-tight text-slate-800">Administrasi Perpustakaan Harian</h1>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-8 text-center">
            <h2 className="text-lg font-bold text-red-700 mb-2">Batas Waktu Pengisian Terlewat</h2>
            <p className="text-red-600">
              Anda tidak dapat mengisi laporan administrasi harian karena telah melewati pukul 17.00. 
              Kejadian ini telah dicatat sebagai pelanggaran disiplin.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold tracking-tight text-slate-800">Administrasi Harian Perpustakaan</h1>
      
      <Card>
        <CardHeader><CardTitle>Statistik Kunjungan & Sirkulasi</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <label className="block text-sm font-bold text-slate-700">Jumlah Pengunjung Hari Ini</label>
            <input 
              type="number" 
              value={visitorCount}
              onChange={(e) => setVisitorCount(e.target.value)}
              placeholder="Contoh: 45"
              className="w-full p-3 rounded-lg border border-slate-300 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-bold text-slate-700">Buku Dipinjam</label>
              <input 
                type="number" 
                value={borrowCount}
                onChange={(e) => setBorrowCount(e.target.value)}
                placeholder="Jumlah buku"
                className="w-full p-3 rounded-lg border border-slate-300 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-bold text-slate-700">Buku Dikembalikan</label>
              <input 
                type="number" 
                value={returnCount}
                onChange={(e) => setReturnCount(e.target.value)}
                placeholder="Jumlah buku"
                className="w-full p-3 rounded-lg border border-slate-300 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Checklist Penutupan (Pulang)</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
              <input 
                type="checkbox" 
                checked={tasks.kebersihan}
                onChange={(e) => setTasks({...tasks, kebersihan: e.target.checked})}
                className="w-5 h-5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
              />
              <span className="font-medium text-slate-700">Memastikan kebersihan perpustakaan</span>
            </label>
            <label className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
              <input 
                type="checkbox" 
                checked={tasks.matikanAc}
                onChange={(e) => setTasks({...tasks, matikanAc: e.target.checked})}
                className="w-5 h-5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
              />
              <span className="font-medium text-slate-700">Mematikan AC dan peralatan listrik</span>
            </label>
            <label className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
              <input 
                type="checkbox" 
                checked={tasks.kunciPintu}
                onChange={(e) => setTasks({...tasks, kunciPintu: e.target.checked})}
                className="w-5 h-5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
              />
              <span className="font-medium text-slate-700">Mengunci pintu perpustakaan</span>
            </label>
          </div>
          
          <button 
            onClick={handleSave} 
            disabled={isSubmitting}
            className="w-full mt-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors shadow-sm"
          >
            {isSubmitting ? 'MENYIMPAN...' : 'SIMPAN LAPORAN HARIAN'}
          </button>
        </CardContent>
      </Card>
    </div>
  );
}

export function PustakaKoleksi() {
  
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold tracking-tight text-slate-800">Koleksi Buku</h1>
      <Card>
        <CardHeader><CardTitle>Manajemen Inventaris</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="font-medium text-slate-800 text-sm">Input Buku Baru</span>
              <button onClick={() => window.alert('Form Input Buku')} className="text-emerald-600 font-bold uppercase text-[10px] tracking-wider hover:bg-emerald-50 px-2 py-1 rounded">Input</button>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="font-medium text-slate-800 text-sm">Cek Buku Rusak/Hilang</span>
              <button onClick={() => window.alert('Cek Data Buku')} className="text-amber-600 font-bold uppercase text-[10px] tracking-wider hover:bg-amber-50 px-2 py-1 rounded">Cek</button>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="font-medium text-slate-800 text-sm">Klasifikasi DDC</span>
              <button onClick={() => window.alert('Kelola DDC')} className="text-blue-600 font-bold uppercase text-[10px] tracking-wider hover:bg-blue-50 px-2 py-1 rounded">Kelola</button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function PustakaLayanan() {
  
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold tracking-tight text-slate-800">Layanan Pemustaka</h1>
      <Card>
        <CardHeader><CardTitle>Bimbingan & Tata Ruang</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 mb-4">Fasilitas pencarian referensi, permintaan literatur khusus, dan pemeliharaan kenyamanan ruang baca.</p>
        </CardContent>
      </Card>
    </div>
  );
}

export function PustakaLiterasi() {
  
  const [programs, setPrograms] = useState([
    { id: 1, name: 'Program 15 Menit Membaca', status: 'Status: Berjalan (Harian)' },
    { id: 2, name: 'Lomba Resensi Buku Bulanan', status: 'Batas Pengumpulan: 28 Nov 2026' }
  ]);

  const handleAdd = () => {
  
    const name = window.prompt("Nama Program Literasi:");
    if (name) setPrograms([...programs, { id: Date.now(), name, status: 'Baru ditambahkan' }]);
  };

  const handleEdit = (index: number) => {
    const name = window.prompt("Edit Nama Program:", programs[index].name);
    if (name) {
      const newProgs = [...programs];
      newProgs[index].name = name;
      setPrograms(newProgs);
    }
  };

  const handleDelete = (index: number) => {
    if (window.confirm("Hapus program literasi ini?")) {
      setPrograms(programs.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold tracking-tight text-slate-800">Giat Literasi</h1>
      <Card>
        <CardHeader><CardTitle>Program Budaya Baca</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {programs.map((p, i) => (
              <div key={p.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-800 text-sm">{p.name}</p>
                  <p className="text-xs text-slate-500 mt-1">{p.status}</p>
                </div>
                <div className="flex gap-2 items-center">
                  <button onClick={() => handleEdit(i)} className="text-emerald-600 hover:text-emerald-700" title="Edit">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(i)} className="text-red-600 hover:text-red-700" title="Hapus">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            <button onClick={handleAdd} className="w-full mt-4 p-3 border-2 border-dashed border-emerald-300 text-emerald-600 font-bold uppercase text-xs tracking-wider rounded-lg hover:bg-emerald-50 transition-colors">
              + Tambah Program Literasi
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function PustakaDigitalisasi() {
  
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold tracking-tight text-slate-800">Digitalisasi</h1>
      <Card>
        <CardHeader><CardTitle>E-Library & Katalog</CardTitle></CardHeader>
        <CardContent>
          <button onClick={() => window.alert('Form Upload E-Book / Jurnal')} className="w-full mt-2 p-3 border-2 border-dashed border-cyan-300 text-cyan-600 font-bold uppercase text-xs tracking-wider rounded-lg hover:bg-cyan-50 transition-colors">
            + Upload E-Book / Jurnal Baru
          </button>
        </CardContent>
      </Card>
    </div>
  );
}

export function PustakaPelaporan() {
  
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
      <h1 className="text-xl font-bold tracking-tight text-slate-800">Pelaporan</h1>
      <Card>
        <CardHeader><CardTitle>Rekapitulasi Kinerja</CardTitle></CardHeader>
        <CardContent>
          <div className="mb-6 space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tahun Ajaran / Semester</label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            >
              {semesters.map((s, i) => (
                <option key={i} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button onClick={() => window.alert(`Memproses Rekap Pengunjung (${selectedSemester})`)} className="p-4 bg-slate-50 border border-slate-200 rounded-lg hover:border-emerald-500 font-bold text-slate-700 transition-colors">Rekap Pengunjung</button>
            <button onClick={() => window.alert(`Memproses Laporan Sirkulasi (${selectedSemester})`)} className="p-4 bg-slate-50 border border-slate-200 rounded-lg hover:border-emerald-500 font-bold text-slate-700 transition-colors">Laporan Sirkulasi Bulanan</button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
