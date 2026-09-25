import { useRealtime } from "../lib/useRealtime";
import React, { useState, useEffect } from 'react';
import { remoteStorage } from '../lib/remoteStorage';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Plus, Edit2, Trash2, Check, X, FileText, AlertTriangle, Users, Calendar, MapPin, Search, Filter, Award, Activity, Sparkles, UserCheck, Shield } from 'lucide-react';
import { CustomSelect } from '../components/ui/CustomSelect';
import { apiClient } from '../lib/apiClient';
export function KesiswaanPrestasiPelanggaran() {
  const _syncTick = useRealtime();
  const [activeTab, setActiveTab] = useState<'pelanggaran' | 'prestasi'>('pelanggaran');
  const [mockStudents, setStudents] = useState<any[]>([]);
  useEffect(() => {
    apiClient('/crud.php?table=students').then(res => {
      setStudents((res || []).map((s: any) => ({
        id: String(s.id),
        name: s.name,
        kelas: s.class_name || s.kelas || '-'
      })));
    }).catch(console.error);
  }, [_syncTick]);

  // Pelanggaran / SP State
  const [pelanggaran, setPelanggaran] = useState<any[]>(() => {
    const saved = remoteStorage.getItem('kesiswaan_pelanggaran_data');
    return saved ? JSON.parse(saved) : [];
  });
  useEffect(() => {
    remoteStorage.setItem('kesiswaan_pelanggaran_data', JSON.stringify(pelanggaran));
  }, [pelanggaran]);

  // Handle Sync from BK (Rekomendasi SP)
  useEffect(() => {
    const bkData = remoteStorage.getItem('bk_rekomendasi_sp');
    if (bkData) {
      try {
        const bkCases = JSON.parse(bkData);
        if (Array.isArray(bkCases) && bkCases.length > 0) {
          let updated = false;
          let currentPelanggaran = [...pelanggaran];
          bkCases.forEach((c: any) => {
            // Check if already exist by some unique ID mapping, here we use simple check by tanggal and nama
            const exists = currentPelanggaran.find(p => p.namaSiswa === c.namaSiswa && p.kasus === c.kasus);
            if (!exists) {
              currentPelanggaran.unshift({
                id: Date.now() + Math.random(),
                tanggal: c.tanggal,
                namaSiswa: c.namaSiswa,
                kelas: '-',
                // should be mapped from student
                kasus: c.kasus,
                poin: 0,
                sp: c.usulanSP || 'Belum Ditentukan',
                status: 'Menunggu SP',
                source: 'Rekomendasi BK'
              });
              updated = true;
            }
          });
          if (updated) {
            setPelanggaran(currentPelanggaran);
            // clear the pending recommendation to avoid duplicate processing
            remoteStorage.setItem('bk_rekomendasi_sp', '[]');
          }
        }
      } catch (e) {
        console.error("Error parsing bk_rekomendasi_sp", e);
      }
    }
  }, [pelanggaran]);
  const [isModalPelanggaran, setIsModalPelanggaran] = useState(false);
  const [formPelanggaran, setFormPelanggaran] = useState({
    id: null as any,
    tanggal: (function(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');})(),
    studentId: '',
    kasus: '',
    poin: 0,
    sp: 'Tidak Ada',
    status: 'Menunggu SP',
    source: 'Kesiswaan'
  });
  const handleEditPelanggaran = (p: any) => {
    setFormPelanggaran({
      id: p.id,
      tanggal: p.tanggal,
      studentId: '',
      // Ideally map from mockStudents
      kasus: p.kasus,
      poin: p.poin || 0,
      sp: p.sp || 'Tidak Ada',
      status: p.status || 'Menunggu SP',
      source: p.source || 'Kesiswaan'
    });
    setIsModalPelanggaran(true);
  };
  const handleSavePelanggaran = () => {
    let namaSiswa = formPelanggaran.studentId;
    let kelas = '-';
    if (formPelanggaran.source === 'Kesiswaan' && formPelanggaran.studentId) {
      const student = mockStudents.find(s => s.id === formPelanggaran.studentId);
      if (student) {
        namaSiswa = student.name;
        kelas = student.kelas;
      }
    } else {
      // It's from BK recommendation, name is already in studentId field technically (if we edited)
      // Let's just keep the existing mapping simple
      const existing = pelanggaran.find(p => p.id === formPelanggaran.id);
      if (existing) {
        namaSiswa = existing.namaSiswa;
        kelas = existing.kelas;
      }
    }
    if (!formPelanggaran.kasus) {
      window.alert("Data tidak lengkap!");
      return;
    }
    const newData = {
      ...formPelanggaran,
      namaSiswa,
      kelas,
      id: formPelanggaran.id || Date.now()
    };
    if (formPelanggaran.id) {
      setPelanggaran(pelanggaran.map(p => p.id === formPelanggaran.id ? newData : p));
    } else {
      setPelanggaran([newData, ...pelanggaran]);
    }
    setIsModalPelanggaran(false);
    window.alert("Data Pelanggaran & SP berhasil disimpan!");
  };
  return <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-800">Prestasi & Pelanggaran</h1>
        <p className="text-sm text-slate-500 mt-1">Kelola data poin, SP, dan prestasi siswa</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg w-fit">
        <button onClick={() => setActiveTab('pelanggaran')} className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${activeTab === 'pelanggaran' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
          Pelanggaran & SP
        </button>
        <button onClick={() => setActiveTab('prestasi')} className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${activeTab === 'prestasi' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
          Data Prestasi
        </button>
      </div>

      {activeTab === 'pelanggaran' && <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Data Pelanggaran (Poin & SP)</CardTitle>
            <button onClick={() => {
          setFormPelanggaran({
            id: null,
            tanggal: (function(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');})(),
            studentId: '',
            kasus: '',
            poin: 0,
            sp: 'Tidak Ada',
            status: 'Diterbitkan',
            source: 'Kesiswaan'
          });
          setIsModalPelanggaran(true);
        }} className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Input Pelanggaran
            </button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Tanggal</th>
                    <th className="py-3 px-4">Siswa</th>
                    <th className="py-3 px-4">Kasus / Sumber</th>
                    <th className="py-3 px-4">Poin & SP</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {pelanggaran.map(p => <tr key={p.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4">{p.tanggal}</td>
                      <td className="py-3 px-4 font-medium text-slate-700">
                        {p.namaSiswa}
                        <div className="text-xs text-slate-500 font-normal">{p.kelas}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-800 line-clamp-1" title={p.kasus}>{p.kasus}</div>
                        <div className="text-[10px] font-bold text-blue-600 mt-1 uppercase bg-blue-50 px-1.5 py-0.5 rounded w-fit">
                          {p.source}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-bold text-slate-700">Poin: {p.poin}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded w-fit ${p.sp === 'SP 3' ? 'bg-red-100 text-red-700' : p.sp !== 'Tidak Ada' && p.sp !== 'Belum Ditentukan' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                            {p.sp}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${p.status === 'Diterbitkan' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button onClick={() => handleEditPelanggaran(p)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>)}
                  {pelanggaran.length === 0 && <tr>
                       <td colSpan={6} className="py-8 text-center text-slate-400 italic">Belum ada data pelanggaran</td>
                     </tr>}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>}

      {activeTab === 'prestasi' && <Card className="border-slate-200">
          <CardHeader><CardTitle>Data Prestasi Siswa</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500 italic">Data prestasi belum tersedia. Silakan sinkronisasi dari Wali Kelas / Kesiswaan.</p>
          </CardContent>
        </Card>}

      {isModalPelanggaran && <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-2.5 sm:p-4 pb-20 sm:pb-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[82vh] sm:max-h-[90vh] my-auto">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
              <h2 className="font-bold text-slate-800">{formPelanggaran.id ? 'Edit Pelanggaran / SP' : 'Input Pelanggaran Baru'}</h2>
              <button onClick={() => setIsModalPelanggaran(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 space-y-4 overflow-y-auto scrollbar-hide">
              {formPelanggaran.source === 'Kesiswaan' && !formPelanggaran.id ? <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Pilih Siswa</label>
                  <CustomSelect value={formPelanggaran.studentId} onChange={v => setFormPelanggaran({
              ...formPelanggaran,
              studentId: v
            })} options={mockStudents.map(s => ({
              value: String(s.id),
              label: `${s.name} (${s.kelas})`
            }))} />
                </div> : <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                  <p className="text-xs font-bold text-blue-800 uppercase">Siswa (Dari {formPelanggaran.source})</p>
                  <p className="text-sm text-blue-900 font-medium mt-1">
                    {pelanggaran.find(p => p.id === formPelanggaran.id)?.namaSiswa || 'Siswa'}
                  </p>
                </div>}

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Kasus / Pelanggaran</label>
                <textarea rows={2} value={formPelanggaran.kasus} onChange={e => setFormPelanggaran({
              ...formPelanggaran,
              kasus: e.target.value
            })} className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-rose-500 bg-slate-50 text-sm" disabled={formPelanggaran.source !== 'Kesiswaan'} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Poin Pelanggaran</label>
                  <input type="number" value={formPelanggaran.poin} onChange={e => setFormPelanggaran({
                ...formPelanggaran,
                poin: parseInt(e.target.value) || 0
              })} className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-rose-500 bg-slate-50 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tingkat SP</label>
                  <CustomSelect value={formPelanggaran.sp} onChange={v => setFormPelanggaran({
                ...formPelanggaran,
                sp: v
              })} options={[{
                value: 'Tidak Ada',
                label: 'Tidak Ada'
              }, {
                value: 'SP 1',
                label: 'SP 1'
              }, {
                value: 'SP 2',
                label: 'SP 2'
              }, {
                value: 'SP 3',
                label: 'SP 3'
              }]} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status SP</label>
                <CustomSelect value={formPelanggaran.status} onChange={v => setFormPelanggaran({
              ...formPelanggaran,
              status: v
            })} options={[{
              value: 'Menunggu SP',
              label: 'Menunggu SP'
            }, {
              value: 'Diterbitkan',
              label: 'Telah Diterbitkan'
            }]} />
              </div>

            </div>
            
            <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 flex justify-end gap-2 shrink-0">
              <button onClick={() => setIsModalPelanggaran(false)} className="px-4 py-2 text-slate-500 hover:text-slate-700 font-bold text-sm">Batal</button>
              <button onClick={handleSavePelanggaran} className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-sm flex items-center gap-2">
                <Check className="w-4 h-4" /> Simpan Data
              </button>
            </div>
          </div>
        </div>}
    </div>;
}
export function KesiswaanEkskul() {
  const [ekskulList, setEkskulList] = useState<any[]>(() => {
    const saved = remoteStorage.getItem('kesiswaan_ekskul_data');
    return saved ? JSON.parse(saved) : [{
      id: 1,
      nama: 'Pramuka Penggalang & Penegak',
      kategori: 'Kepramukaan',
      pembina: 'Ahmad Fauzi, S.Pd',
      jadwal: 'Jumat, 14:00 - 16:00',
      lokasi: 'Lapangan Utama',
      anggota: 65,
      status: 'Aktif',
      color: 'from-amber-500 to-orange-600'
    }, {
      id: 2,
      nama: 'Palang Merah Remaja (PMR)',
      kategori: 'Kesehatan & Sosial',
      pembina: 'Siti Aminah, S.Kep',
      jadwal: 'Rabu, 15:00 - 16:30',
      lokasi: 'Ruang UKS Madrasah',
      anggota: 38,
      status: 'Aktif',
      color: 'from-rose-500 to-red-600'
    }, {
      id: 3,
      nama: 'Rohani Islam (Rohis)',
      kategori: 'Keagamaan',
      pembina: 'Ust. Abdul Somad, M.Pd',
      jadwal: 'Sabtu, 09:00 - 11:00',
      lokasi: 'Masjid Utama',
      anggota: 82,
      status: 'Aktif',
      color: 'from-emerald-500 to-teal-600'
    }, {
      id: 4,
      nama: 'Klub Basket Madrasah',
      kategori: 'Olahraga',
      pembina: 'Budi Santoso, S.Pd',
      jadwal: 'Selasa, 15:00 - 17:00',
      lokasi: 'Lapangan Basket',
      anggota: 32,
      status: 'Aktif',
      color: 'from-blue-500 to-indigo-600'
    }, {
      id: 5,
      nama: 'Seni Musik & Hadroh',
      kategori: 'Seni & Budaya',
      pembina: 'Nur Hidayah, S.Sn',
      jadwal: 'Kamis, 15:30 - 17:00',
      lokasi: 'Aula Utama',
      anggota: 28,
      status: 'Aktif',
      color: 'from-purple-500 to-violet-600'
    }, {
      id: 6,
      nama: 'KIR & Robotik',
      kategori: 'Sains & Teknologi',
      pembina: 'Dedi Kurniawan, M.T',
      jadwal: 'Senin, 15:00 - 16:30',
      lokasi: 'Lab Komputer',
      anggota: 24,
      status: 'Aktif',
      color: 'from-cyan-500 to-blue-600'
    }];
  });
  useEffect(() => {
    remoteStorage.setItem('kesiswaan_ekskul_data', JSON.stringify(ekskulList));
  }, [ekskulList]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    id: 0,
    nama: '',
    kategori: 'Olahraga',
    pembina: '',
    jadwal: '',
    lokasi: '',
    anggota: 0,
    status: 'Aktif',
    color: 'from-emerald-500 to-teal-600'
  });
  const categories = ['Semua', 'Kepramukaan', 'Kesehatan & Sosial', 'Keagamaan', 'Olahraga', 'Seni & Budaya', 'Sains & Teknologi'];
  const filteredEkskul = ekskulList.filter(e => {
    const matchSearch = e.nama.toLowerCase().includes(searchQuery.toLowerCase()) || e.pembina && e.pembina.toLowerCase().includes(searchQuery.toLowerCase()) || e.lokasi && e.lokasi.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = selectedCategory === 'Semua' || e.kategori === selectedCategory;
    return matchSearch && matchCategory;
  });
  const totalAnggota = ekskulList.reduce((acc, curr) => acc + (Number(curr.anggota) || 0), 0);
  const totalPembina = new Set(ekskulList.map(e => e.pembina).filter(Boolean)).size;
  const handleOpen = (e?: any) => {
    if (e) {
      setForm({
        id: e.id,
        nama: e.nama || '',
        kategori: e.kategori || 'Olahraga',
        pembina: e.pembina || '',
        jadwal: e.jadwal || '',
        lokasi: e.lokasi || 'Lingkungan Madrasah',
        anggota: e.anggota || 0,
        status: e.status || 'Aktif',
        color: e.color || 'from-emerald-500 to-teal-600'
      });
    } else {
      setForm({
        id: 0,
        nama: '',
        kategori: 'Olahraga',
        pembina: '',
        jadwal: '',
        lokasi: 'Lingkungan Madrasah',
        anggota: 0,
        status: 'Aktif',
        color: 'from-emerald-500 to-teal-600'
      });
    }
    setIsModalOpen(true);
  };
  const handleSave = () => {
    if (!form.nama.trim() || !form.pembina.trim()) {
      alert('Nama ekskul dan Pembina wajib diisi!');
      return;
    }
    if (form.id) {
      setEkskulList(ekskulList.map(x => x.id === form.id ? {
        ...x,
        ...form
      } : x));
    } else {
      const colorGradients = ['from-emerald-500 to-teal-600', 'from-blue-500 to-indigo-600', 'from-amber-500 to-orange-600', 'from-purple-500 to-violet-600', 'from-rose-500 to-red-600', 'from-cyan-500 to-blue-600'];
      const randomColor = colorGradients[Math.floor(Math.random() * colorGradients.length)];
      setEkskulList([...ekskulList, {
        ...form,
        id: Date.now(),
        color: randomColor
      }]);
    }
    setIsModalOpen(false);
  };
  const handleDelete = (id: any) => {
    if (confirm('Yakin ingin menghapus kegiatan ekstrakurikuler ini?')) {
      setEkskulList(ekskulList.filter(x => x.id !== id));
    }
  };
  return <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-900 via-teal-800 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-20 top-0 w-48 h-48 bg-teal-400/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold backdrop-blur-md">
              <span>Pusat Kegiatan Kesiswaan & Talent Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Manajemen Ekstrakurikuler
            </h1>
            <p className="text-emerald-100/80 text-sm leading-relaxed">
              Kelola dan pantau seluruh kegiatan pengembangan minat, bakat, kepemimpinan, dan prestasi siswa madrasah secara terintegrasi.
            </p>
          </div>

          <button onClick={() => handleOpen()} className="self-start md:self-center flex items-center gap-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold px-5 py-3 rounded-xl shadow-lg shadow-emerald-900/40 hover:shadow-emerald-500/30 transition-all transform hover:-translate-y-0.5 text-sm">
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Tambah Ekskul Baru</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shadow-inner shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Unit Ekskul</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <p className="text-2xl font-black text-slate-800">{ekskulList.length}</p>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Aktif</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shadow-inner shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Siswa Terlibat</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <p className="text-2xl font-black text-slate-800">{totalAnggota}</p>
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Anggota Active</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold shadow-inner shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Pembina & Pelatih</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <p className="text-2xl font-black text-slate-800">{totalPembina}</p>
              <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">Pengampu</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Cari ekskul, pembina, lokasi..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all" />
            {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>}
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Menampilkan <span className="font-bold text-slate-800">{filteredEkskul.length}</span> dari {ekskulList.length} Ekstrakurikuler
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-200">
          <div className="flex items-center gap-1 text-xs font-semibold text-slate-400 pr-2 border-r border-slate-200 shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <span>Kategori:</span>
          </div>
          {categories.map(cat => <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${selectedCategory === cat ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'}`}>
              {cat}
            </button>)}
        </div>
      </div>

      {/* Ekskul Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEkskul.map(e => {
        const gradient = e.color || 'from-emerald-500 to-teal-600';
        return <div key={e.id} className="group bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all duration-300 overflow-hidden flex flex-col">
              {/* Card Header Banner */}
              <div className={`h-24 bg-gradient-to-r ${gradient} p-4 relative flex items-start justify-between`}>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/20 backdrop-blur-md text-white text-[10px] font-bold tracking-wider uppercase">
                  <Shield className="w-3 h-3 text-emerald-300" />
                  <span>{e.kategori || 'Umum'}</span>
                </div>

                <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-md rounded-lg p-1 shadow-sm">
                  <button onClick={() => handleOpen(e)} title="Edit Ekskul" className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(e.id)} title="Hapus Ekskul" className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Avatar Icon Overlay */}
                <div className="absolute -bottom-5 left-5 w-12 h-12 rounded-xl bg-white p-1 shadow-md border border-slate-100">
                  <div className={`w-full h-full rounded-lg bg-gradient-to-br ${gradient} text-white font-black text-lg flex items-center justify-center shadow-inner`}>
                    {e.nama.charAt(0)}
                  </div>
                </div>
              </div>

              {/* Card Main Body */}
              <div className="pt-8 p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="font-extrabold text-slate-800 text-lg group-hover:text-emerald-700 transition-colors line-clamp-1">
                      {e.nama}
                    </h3>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold shrink-0 border border-emerald-200/50">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {e.status || 'Aktif'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Pembina: <strong className="text-slate-700">{e.pembina}</strong></span>
                  </p>
                </div>

                {/* Info List */}
                <div className="space-y-2 bg-slate-50/80 rounded-xl p-3 border border-slate-100 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600" /> Jadwal
                    </span>
                    <span className="font-bold text-slate-800">{e.jadwal || '-'}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" /> Lokasi
                    </span>
                    <span className="font-bold text-slate-800">{e.lokasi || 'Lingkungan Madrasah'}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600 pt-1 border-t border-slate-200/50">
                    <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                      <Users className="w-3.5 h-3.5 text-blue-500" /> Total Siswa
                    </span>
                    <span className="font-extrabold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                      {e.anggota} Siswa
                    </span>
                  </div>
                </div>
              </div>
            </div>;
      })}

        {filteredEkskul.length === 0 && <div className="col-span-full py-16 bg-white rounded-2xl border border-dashed border-slate-300 text-center space-y-3">
            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <p className="text-slate-700 font-bold text-base">Tidak ada ekstrakurikuler yang sesuai filter</p>
            <p className="text-slate-400 text-xs">Coba ubah kata kunci pencarian atau kategori filter Anda.</p>
            <button onClick={() => {
          setSearchQuery('');
          setSelectedCategory('Semua');
        }} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors">
              Reset Filter
            </button>
          </div>}
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && <div className="fixed inset-0 z-[100] flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200 pb-20 sm:pb-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 flex flex-col max-h-[82vh] sm:max-h-[90vh] my-auto">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-emerald-900 to-teal-800 text-white">
              <div>
                <h2 className="font-bold text-base text-white">{form.id ? 'Edit Ekstrakurikuler' : 'Tambah Ekstrakurikuler Baru'}</h2>
                <p className="text-[11px] text-emerald-200/80">Lengkapi data informasi kegiatan ekstrakurikuler</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Nama Ekstrakurikuler <span className="text-rose-500">*</span>
                </label>
                <input type="text" placeholder="Contoh: Rohani Islam (Rohis)" value={form.nama} onChange={e => setForm({
              ...form,
              nama: e.target.value
            })} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-emerald-500 outline-none transition-all" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Kategori
                  </label>
                  <CustomSelect value={form.kategori} onChange={v => setForm({
                ...form,
                kategori: v
              })} options={categories.filter(c => c !== 'Semua').map(c => ({
                value: c,
                label: c
              }))} />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Pembina / Pelatih <span className="text-rose-500">*</span>
                  </label>
                  <input type="text" placeholder="Nama Lengkap Pembina" value={form.pembina} onChange={e => setForm({
                ...form,
                pembina: e.target.value
              })} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-emerald-500 outline-none transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Jadwal Latihan
                  </label>
                  <input type="text" placeholder="Jumat, 14:00 - 16:00" value={form.jadwal} onChange={e => setForm({
                ...form,
                jadwal: e.target.value
              })} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-emerald-500 outline-none transition-all" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Lokasi Latihan
                  </label>
                  <input type="text" placeholder="Lapangan Utama / UKS" value={form.lokasi} onChange={e => setForm({
                ...form,
                lokasi: e.target.value
              })} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-emerald-500 outline-none transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Jumlah Anggota
                  </label>
                  <input type="number" value={form.anggota} onChange={e => setForm({
                ...form,
                anggota: parseInt(e.target.value) || 0
              })} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-emerald-500 outline-none transition-all" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Status Kegiatan
                  </label>
                  <CustomSelect value={form.status} onChange={v => setForm({
                ...form,
                status: v
              })} options={[{
                value: 'Aktif',
                label: 'Aktif'
              }, {
                value: 'Non-Aktif',
                label: 'Non-Aktif'
              }, {
                value: 'Rekrutmen Open',
                label: 'Rekrutmen Open'
              }]} />
                </div>
              </div>
            </div>

            <div className="p-4 px-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2.5 text-slate-600 hover:text-slate-800 text-xs font-bold transition-colors">
                Batal
              </button>
              <button onClick={handleSave} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all">
                <Check className="w-4 h-4" /> Simpan Data
              </button>
            </div>
          </div>
        </div>}
    </div>;
}