import React, { useState, useEffect } from 'react';
import { remoteStorage } from '../lib/remoteStorage';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Edit2, Trash2, Plus, X, Check } from 'lucide-react';
import { CustomSelect } from '../components/ui/CustomSelect';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../lib/apiClient';

export function BKPreventif() {
  
  const [agendas, setAgendas] = useState(() => {
    const saved = remoteStorage.getItem('bk_preventif_data');
    return saved ? JSON.parse(saved) : [
      { id: 1, title: 'Materi Sosialisasi Anti Bullying', date: '2026-11-15', target: 'Seluruh Siswa', type: 'Sosialisasi', status: 'Terencana' },
      { id: 2, title: 'Bimbingan Klasikal Tata Tertib', date: '2026-10-10', target: 'Kelas X', type: 'Bimbingan Klasikal', status: 'Selesai' }
    ];
  });

  useEffect(() => {
    remoteStorage.setItem('bk_preventif_data', JSON.stringify(agendas));
  }, [agendas]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', date: '', target: '', type: 'Sosialisasi', description: '', status: 'Terencana' });

  
  const handleSave = () => {
  
    if (!formData.title || !formData.date || !formData.target) {
      window.alert('Mohon lengkapi data wajib (Nama Agenda, Tanggal, Sasaran)!');
      return;
    }
    setAgendas([...agendas, { id: Date.now(), ...formData }]);
    setFormData({ title: '', date: '', target: '', type: 'Sosialisasi', description: '', status: 'Terencana' });
    setIsModalOpen(false);
    window.alert('Agenda berhasil disimpan!');
  };

  const handleDelete = (index: number) => {
    if (window.confirm('Hapus agenda ini?')) {
      setAgendas(agendas.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">Fungsi Preventif</h1>
          <p className="text-sm text-slate-500 mt-1">Layanan orientasi, informasi, dan bimbingan kelompok</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" /> Tambah Program
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 whitespace-nowrap">Tanggal</th>
                <th className="py-3 px-4">Nama Agenda</th>
                <th className="py-3 px-4">Bentuk Kegiatan</th>
                <th className="py-3 px-4">Sasaran</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {agendas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 italic">Belum ada program preventif</td>
                </tr>
              ) : (
                agendas.map((a, i) => (
                  <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap">{a.date || a.schedule || '-'}</td>
                    <td className="py-3 px-4 font-medium text-slate-700">{a.title}</td>
                    <td className="py-3 px-4">{a.type || '-'}</td>
                    <td className="py-3 px-4">{a.target || '-'}</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${a.status === 'Selesai' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {a.status || 'Terencana'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button onClick={() => handleDelete(i)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-2.5 sm:p-4 pb-20 sm:pb-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[82vh] sm:max-h-[90vh] my-auto">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
              <h2 className="font-bold text-slate-800">Tambah Program Preventif</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 space-y-4 overflow-y-auto scrollbar-hide">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nama Agenda</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  placeholder="Misal: Sosialisasi Anti Narkoba" 
                  className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 bg-slate-50 text-sm" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tanggal</label>
                  <input 
                    type="date" 
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                    className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 bg-slate-50 text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status</label>
                  <CustomSelect
                    value={formData.status}
                    onChange={v => setFormData({...formData, status: v})}
                    options={[
                      { value: 'Terencana', label: 'Terencana' },
                      { value: 'Selesai', label: 'Selesai' }
                    ]}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Bentuk Kegiatan</label>
                <CustomSelect
                  value={formData.type}
                  onChange={v => setFormData({...formData, type: v})}
                  options={[
                    { value: 'Sosialisasi', label: 'Sosialisasi' },
                    { value: 'Seminar', label: 'Seminar' },
                    { value: 'Bimbingan Klasikal', label: 'Bimbingan Klasikal' },
                    { value: 'Bimbingan Kelompok', label: 'Bimbingan Kelompok' }
                  ]}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Sasaran</label>
                <input 
                  type="text" 
                  value={formData.target}
                  onChange={e => setFormData({...formData, target: e.target.value})}
                  placeholder="Misal: Siswa Kelas X" 
                  className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 bg-slate-50 text-sm" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Deskripsi Tambahan (Opsional)</label>
                <textarea 
                  rows={2}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Opsional..." 
                  className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 bg-slate-50 text-sm" 
                ></textarea>
              </div>
            </div>
            
            <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 flex justify-end gap-2 shrink-0">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)} 
                className="px-4 py-2 text-slate-500 hover:text-slate-700 hover:bg-slate-200 font-bold rounded-lg transition-colors text-sm"
              >
                Batal
              </button>
              <button 
                type="button" 
                onClick={handleSave} 
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors text-sm flex items-center gap-2"
              >
                <Check className="w-4 h-4" /> Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function BKPengembangan() {
  
  const [programs, setPrograms] = useState(() => {
    const saved = remoteStorage.getItem('bk_pengembangan_data');
    return saved ? JSON.parse(saved) : [
      { id: 1, title: 'Pemetaan Minat Bakat', target: 'Kelas X', date: '2026-08-10', progress: 85, description: 'Bekerja sama dengan lembaga psikologi' }
    ];
  });

  useEffect(() => {
    remoteStorage.setItem('bk_pengembangan_data', JSON.stringify(programs));
  }, [programs]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', target: '', date: '', progress: 0, description: '' });

  const handleSave = () => {
  
    if (!formData.title || !formData.target) {
      window.alert('Mohon lengkapi Nama Program dan Sasaran!');
      return;
    }
    const num = parseInt(formData.progress.toString());
    if (isNaN(num) || num < 0 || num > 100) {
      window.alert('Progress harus berupa angka 0-100!');
      return;
    }
    setPrograms([...programs, { id: Date.now(), ...formData, progress: num }]);
    setFormData({ title: '', target: '', date: '', progress: 0, description: '' });
    setIsModalOpen(false);
    window.alert('Program berhasil disimpan!');
  };

  const handleDelete = (index: number) => {
    if (window.confirm('Hapus program ini?')) {
      setPrograms(programs.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">Fungsi Pengembangan</h1>
          <p className="text-sm text-slate-500 mt-1">Pemeliharaan & Pengembangan Potensi</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" /> Tambah Program
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 whitespace-nowrap">Tanggal Mulai</th>
                <th className="py-3 px-4">Nama Program</th>
                <th className="py-3 px-4">Sasaran</th>
                <th className="py-3 px-4 min-w-[150px]">Progress</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {programs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 italic">Belum ada program pengembangan</td>
                </tr>
              ) : (
                programs.map((p, i) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap">{p.date || '-'}</td>
                    <td className="py-3 px-4 font-medium text-slate-700">{p.title}</td>
                    <td className="py-3 px-4">{p.target || '-'}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-100 rounded-full h-2">
                          <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${p.progress}%` }}></div>
                        </div>
                        <span className="text-xs font-medium text-slate-600">{p.progress}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button onClick={() => handleDelete(i)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-2.5 sm:p-4 pb-20 sm:pb-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[82vh] sm:max-h-[90vh] my-auto">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
              <h2 className="font-bold text-slate-800">Tambah Program Pengembangan</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 space-y-4 overflow-y-auto scrollbar-hide">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nama Program</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  placeholder="Misal: Seminar Karir" 
                  className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500 bg-slate-50 text-sm" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tanggal Mulai</label>
                  <input 
                    type="date" 
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                    className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500 bg-slate-50 text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Progress (%)</label>
                  <input 
                    type="number" 
                    min="0"
                    max="100"
                    value={formData.progress}
                    onChange={e => setFormData({...formData, progress: parseInt(e.target.value) || 0})}
                    className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500 bg-slate-50 text-sm" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Sasaran</label>
                <input 
                  type="text" 
                  value={formData.target}
                  onChange={e => setFormData({...formData, target: e.target.value})}
                  placeholder="Misal: Siswa Kelas XII" 
                  className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500 bg-slate-50 text-sm" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Deskripsi Tambahan</label>
                <textarea 
                  rows={2}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Opsional..." 
                  className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500 bg-slate-50 text-sm" 
                ></textarea>
              </div>
            </div>
            
            <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 flex justify-end gap-2 shrink-0">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)} 
                className="px-4 py-2 text-slate-500 hover:text-slate-700 hover:bg-slate-200 font-bold rounded-lg transition-colors text-sm"
              >
                Batal
              </button>
              <button 
                type="button" 
                onClick={handleSave} 
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors text-sm flex items-center gap-2"
              >
                <Check className="w-4 h-4" /> Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function BKKuratif() {
  
  const [cases, setCases] = useState(() => {
    const saved = remoteStorage.getItem('bk_cases_data');
    return saved ? JSON.parse(saved) : [
    { 
      id: 1, 
      tanggal: '2026-07-18', 
      namaSiswa: 'Budi (XI-IPS 2)', 
      kasus: 'Sering terlambat dan tidur di kelas',
      tindakLanjut: 'Sudah ditegur dan dinasihati, perlu panggilan orang tua.',
      tindakLanjutBK: 'Pemanggilan orang tua (20 Juli 2026)',
      tingkat: 'Sedang',
      hasilKonseling: 'Siswa berjanji tidak akan mengulangi',
      status: 'Dalam Proses',
      source: 'Walas'
    }
  ];
  });

  useEffect(() => {
    remoteStorage.setItem('bk_cases_data', JSON.stringify(cases));
  }, [cases]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  
  const [formData, setFormData] = useState({
    tanggal: (function(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');})(),
    namaSiswa: '',
    kasus: '',
    tindakLanjut: '', // dari walas (readonly di sini)
    tindakLanjutBK: '',
    tingkat: 'Ringan',
    hasilKonseling: '',
    status: 'Dalam Proses',
    source: 'BK'
  });

  const handleEdit = (c: any) => {
    setEditId(c.id);
    setFormData({
      tanggal: c.tanggal || (function(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');})(),
      namaSiswa: c.namaSiswa || '',
      kasus: c.kasus || '',
      tindakLanjut: c.tindakLanjut || '',
      tindakLanjutBK: c.tindakLanjutBK || '',
      tingkat: c.tingkat || 'Ringan',
      hasilKonseling: c.hasilKonseling || '',
      status: c.status || 'Dalam Proses',
      source: c.source || 'BK'
    });
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
  
    setEditId(null);
    setFormData({
      tanggal: (function(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');})(),
      namaSiswa: '',
      kasus: '',
      tindakLanjut: '',
      tindakLanjutBK: '',
      tingkat: 'Ringan',
      hasilKonseling: '',
      status: 'Dalam Proses',
      source: 'BK'
    });
    setIsModalOpen(true);
  };

  
  const handleRekomendasiSP = (c: any) => {
    if (window.confirm('Rekomendasikan kasus ini ke Kesiswaan untuk Poin / SP?')) {
      const bkSaved = remoteStorage.getItem('bk_rekomendasi_sp');
      const bkCases = bkSaved ? JSON.parse(bkSaved) : [];
      
      bkCases.push({
        idKasusBK: c.id,
        tanggal: (function(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');})(),
        namaSiswa: c.namaSiswa,
        kasus: c.kasus,
        usulanSP: c.tingkat === 'Berat' ? 'SP 2' : (c.tingkat === 'Sedang' ? 'SP 1' : 'Tidak Ada')
      });
      
      remoteStorage.setItem('bk_rekomendasi_sp', JSON.stringify(bkCases));
      
      // Update status in BK to indicate it was forwarded
      setCases(cases.map(caseItem => caseItem.id === c.id ? { ...caseItem, status: 'Diteruskan ke Kesiswaan' } : caseItem));
      
      window.alert('Berhasil direkomendasikan ke Kesiswaan!');
    }
  };

  const handleSave = () => {
  
    if (!formData.tanggal || !formData.namaSiswa || !formData.kasus) {
      window.alert('Mohon lengkapi data wajib (Tanggal, Nama Siswa, Kasus)!');
      return;
    }
    
    if (editId) {
      setCases(cases.map(c => c.id === editId ? { ...c, ...formData } : c));
      window.alert("Catatan kasus berhasil diupdate!");
    } else {
      setCases([{ id: Date.now(), ...formData }, ...cases]);
      window.alert("Catatan kasus berhasil disimpan!");
    }
    setIsModalOpen(false);
  };

  const handleDelete = (index: number) => {
    if (window.confirm('Hapus kasus ini?')) {
      setCases(cases.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">Fungsi Kuratif (Penanganan)</h1>
          <p className="text-sm text-slate-500 mt-1">Laporan dari Wali Kelas & Penanganan Guru BK</p>
        </div>
        <button 
          onClick={handleAddNew}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" /> Kasus Baru (Mandiri)
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 whitespace-nowrap">Tanggal</th>
                <th className="py-3 px-4">Nama Siswa / Sumber</th>
                <th className="py-3 px-4 min-w-[150px]">Kasus & Tingkat</th>
                <th className="py-3 px-4 min-w-[200px]">Tindak Lanjut (BK)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {cases.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 italic">Belum ada catatan siswa</td>
                </tr>
              ) : (
                cases.map((c, i) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap">{c.tanggal}</td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-700">{c.namaSiswa}</p>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${c.source === 'Walas' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                        {c.source || 'BK'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-slate-800 line-clamp-2" title={c.kasus}>{c.kasus}</p>
                      <span className={`text-[10px] uppercase font-bold tracking-wider ${c.tingkat === 'Berat' ? 'text-red-500' : c.tingkat === 'Sedang' ? 'text-amber-500' : 'text-emerald-500'}`}>
                        {c.tingkat || 'Ringan'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      <p className="line-clamp-2" title={c.tindakLanjutBK}>{c.tindakLanjutBK || '-'}</p>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${c.status === 'Selesai' ? 'bg-emerald-100 text-emerald-700' : c.status === 'Alihkan ke BK' ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => handleEdit(c)} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors" title="Edit/Tindak Lanjut">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(i)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Hapus">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-2.5 sm:p-4 pb-20 sm:pb-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[82vh] sm:max-h-[90vh] my-auto">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
              <h2 className="font-bold text-slate-800">{editId ? 'Penanganan Kasus (BK)' : 'Tambah Kasus Baru'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto scrollbar-hide grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-bold text-sm text-slate-800 border-b pb-2">Informasi Kasus</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tanggal</label>
                    <input 
                      type="date" 
                      value={formData.tanggal}
                      onChange={e => setFormData({...formData, tanggal: e.target.value})}
                      disabled={formData.source === 'Walas'}
                      className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-rose-500 bg-slate-50 text-sm disabled:opacity-70" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tingkat</label>
                    <CustomSelect
                      value={formData.tingkat}
                      onChange={v => setFormData({...formData, tingkat: v})}
                      options={[
                        { value: 'Ringan', label: 'Ringan' },
                        { value: 'Sedang', label: 'Sedang' },
                        { value: 'Berat', label: 'Berat' }
                      ]}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nama Siswa</label>
                  <input 
                    type="text" 
                    value={formData.namaSiswa}
                    onChange={e => setFormData({...formData, namaSiswa: e.target.value})}
                    disabled={formData.source === 'Walas'}
                    placeholder="Budi (XI-IPS 2)" 
                    className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-rose-500 bg-slate-50 text-sm disabled:opacity-70" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Deskripsi Kasus / Masalah</label>
                  <textarea 
                    rows={3} 
                    value={formData.kasus}
                    onChange={e => setFormData({...formData, kasus: e.target.value})}
                    disabled={formData.source === 'Walas'}
                    placeholder="Penjelasan detail..." 
                    className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-rose-500 bg-slate-50 text-sm disabled:opacity-70"
                  ></textarea>
                </div>
                {formData.source === 'Walas' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tindak Lanjut Awal (Walas)</label>
                    <div className="p-3 bg-blue-50 text-blue-800 text-sm rounded-lg border border-blue-100">
                      {formData.tindakLanjut || 'Tidak ada info tindak lanjut awal.'}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <h3 className="font-bold text-sm text-slate-800 border-b pb-2">Penanganan Guru BK</h3>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status Penanganan</label>
                  <CustomSelect
                    value={formData.status}
                    onChange={v => setFormData({...formData, status: v})}
                    options={[
                      { value: 'Dalam Proses', label: 'Dalam Proses' },
                      { value: 'Selesai', label: 'Selesai' }
                    ]}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Langkah Penanganan (BK)</label>
                  <textarea 
                    rows={3} 
                    value={formData.tindakLanjutBK}
                    onChange={e => setFormData({...formData, tindakLanjutBK: e.target.value})}
                    placeholder="Konseling individu, panggilan orang tua, dll..." 
                    className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-rose-500 bg-slate-50 text-sm"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Hasil Konseling / Rekomendasi</label>
                  <textarea 
                    rows={2} 
                    value={formData.hasilKonseling}
                    onChange={e => setFormData({...formData, hasilKonseling: e.target.value})}
                    placeholder="Siswa berjanji tidak akan mengulangi..." 
                    className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-rose-500 bg-slate-50 text-sm"
                  ></textarea>
                </div>
              </div>
            </div>
            
            <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 flex justify-end gap-2 shrink-0">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)} 
                className="px-4 py-2 text-slate-500 hover:text-slate-700 hover:bg-slate-200 font-bold rounded-lg transition-colors text-sm"
              >
                Batal
              </button>
              <button 
                type="button" 
                onClick={handleSave} 
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition-colors text-sm flex items-center gap-2"
              >
                <Check className="w-4 h-4" /> Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function BKPenyaluran() {
  
  const [items, setItems] = useState(() => {
    const saved = remoteStorage.getItem('bk_penyaluran_data');
    return saved ? JSON.parse(saved) : [
      { id: 1, date: '2026-08-15', studentName: 'Ahmad (XII-IPA 1)', type: 'Lanjut Studi', destination: 'PTN A - Kedokteran', recommendation: 'Sangat disarankan', status: 'Diterima' }
    ];
  });

  useEffect(() => {
    remoteStorage.setItem('bk_penyaluran_data', JSON.stringify(items));
  }, [items]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ date: '', studentName: '', type: 'Lanjut Studi', destination: '', recommendation: '', status: 'Proses' });

  const handleSave = () => {
  
    if (!formData.studentName || !formData.destination) {
      window.alert('Mohon lengkapi Nama Siswa dan Tujuan!');
      return;
    }
    setItems([...items, { id: Date.now(), ...formData }]);
    setFormData({ date: '', studentName: '', type: 'Lanjut Studi', destination: '', recommendation: '', status: 'Proses' });
    setIsModalOpen(false);
    window.alert('Program penyaluran berhasil disimpan!');
  };

  const handleDelete = (index: number) => {
    if (window.confirm("Hapus data penyaluran ini?")) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">Fungsi Penyaluran</h1>
          <p className="text-sm text-slate-500 mt-1">Bimbingan Karir, Studi Lanjut & Ekstrakurikuler</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" /> Tambah Data
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 whitespace-nowrap">Tanggal</th>
                <th className="py-3 px-4">Nama Siswa</th>
                <th className="py-3 px-4">Jenis</th>
                <th className="py-3 px-4">Tujuan/Pilihan</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 italic">Belum ada data penyaluran</td>
                </tr>
              ) : (
                items.map((item, i) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap">{item.date || '-'}</td>
                    <td className="py-3 px-4 font-medium text-slate-700">{item.studentName || item.title}</td>
                    <td className="py-3 px-4">{item.type || '-'}</td>
                    <td className="py-3 px-4">{item.destination || item.desc || '-'}</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${item.status === 'Diterima' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {item.status || 'Proses'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button onClick={() => handleDelete(i)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-2.5 sm:p-4 pb-20 sm:pb-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[82vh] sm:max-h-[90vh] my-auto">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
              <h2 className="font-bold text-slate-800">Tambah Data Penyaluran</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 space-y-4 overflow-y-auto scrollbar-hide">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nama Siswa / Kelompok</label>
                <input 
                  type="text" 
                  value={formData.studentName}
                  onChange={e => setFormData({...formData, studentName: e.target.value})}
                  placeholder="Misal: Ahmad (XII-IPA 1)" 
                  className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-purple-500 bg-slate-50 text-sm" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tanggal</label>
                  <input 
                    type="date" 
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                    className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-purple-500 bg-slate-50 text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status</label>
                  <CustomSelect
                    value={formData.status}
                    onChange={v => setFormData({...formData, status: v})}
                    options={[
                      { value: 'Proses', label: 'Proses' },
                      { value: 'Diterima', label: 'Diterima / Berhasil' }
                    ]}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Jenis Penyaluran</label>
                <CustomSelect
                  value={formData.type}
                  onChange={v => setFormData({...formData, type: v})}
                  options={[
                    { value: 'Lanjut Studi', label: 'Lanjut Studi (SNBP/SNBT)' },
                    { value: 'Karir/Pekerjaan', label: 'Karir / Pekerjaan' },
                    { value: 'Ekstrakurikuler', label: 'Ekstrakurikuler' },
                    { value: 'Jurusan', label: 'Pemilihan Jurusan' }
                  ]}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tujuan / Pilihan</label>
                <input 
                  type="text" 
                  value={formData.destination}
                  onChange={e => setFormData({...formData, destination: e.target.value})}
                  placeholder="Misal: UI - Ilmu Komputer" 
                  className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-purple-500 bg-slate-50 text-sm" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Hasil Rekomendasi (Opsional)</label>
                <textarea 
                  rows={2}
                  value={formData.recommendation}
                  onChange={e => setFormData({...formData, recommendation: e.target.value})}
                  placeholder="Sesuai dengan hasil tes minat bakat..." 
                  className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-purple-500 bg-slate-50 text-sm" 
                ></textarea>
              </div>
            </div>
            
            <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 flex justify-end gap-2 shrink-0">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)} 
                className="px-4 py-2 text-slate-500 hover:text-slate-700 hover:bg-slate-200 font-bold rounded-lg transition-colors text-sm"
              >
                Batal
              </button>
              <button 
                type="button" 
                onClick={handleSave} 
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors text-sm flex items-center gap-2"
              >
                <Check className="w-4 h-4" /> Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function BKAdvokasi() {
  
  const [cases, setCases] = useState(() => {
    const saved = remoteStorage.getItem('bk_advokasi_data');
    return saved ? JSON.parse(saved) : [
      { id: 1, date: '2026-09-01', studentName: 'Rina (X-A)', parties: 'Guru Mapel, Wali Kelas', description: 'Kesalahpahaman nilai tugas', action: 'Mediasi bersama', status: 'Selesai' }
    ];
  });

  useEffect(() => {
    remoteStorage.setItem('bk_advokasi_data', JSON.stringify(cases));
  }, [cases]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ date: '', studentName: '', parties: '', description: '', action: '', status: 'Dalam Proses' });

  const handleSave = () => {
  
    if (!formData.studentName || !formData.description) {
      window.alert('Mohon lengkapi Nama Siswa dan Deskripsi Kasus!');
      return;
    }
    setCases([...cases, { id: Date.now(), ...formData }]);
    setFormData({ date: '', studentName: '', parties: '', description: '', action: '', status: 'Dalam Proses' });
    setIsModalOpen(false);
    window.alert('Laporan advokasi berhasil disimpan!');
  };

  const handleDelete = (index: number) => {
    if (window.confirm('Hapus laporan ini?')) {
      setCases(cases.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">Fungsi Advokasi</h1>
          <p className="text-sm text-slate-500 mt-1">Pembelaan Hak & Kepentingan Siswa</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" /> Laporan Baru
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 whitespace-nowrap">Tanggal</th>
                <th className="py-3 px-4">Nama Siswa</th>
                <th className="py-3 px-4">Pihak Terkait</th>
                <th className="py-3 px-4 min-w-[200px]">Deskripsi Kasus</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {cases.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 italic">Belum ada laporan advokasi</td>
                </tr>
              ) : (
                cases.map((c, i) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap">{c.date || '-'}</td>
                    <td className="py-3 px-4 font-medium text-slate-700">{c.studentName || c.title}</td>
                    <td className="py-3 px-4">{c.parties || '-'}</td>
                    <td className="py-3 px-4">{c.description || '-'}</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${c.status === 'Selesai' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {c.status || 'Dalam Proses'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button onClick={() => handleDelete(i)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-2.5 sm:p-4 pb-20 sm:pb-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[82vh] sm:max-h-[90vh] my-auto">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
              <h2 className="font-bold text-slate-800">Tambah Laporan Advokasi</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 space-y-4 overflow-y-auto scrollbar-hide">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tanggal</label>
                  <input 
                    type="date" 
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                    className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-red-500 bg-slate-50 text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status</label>
                  <CustomSelect
                    value={formData.status}
                    onChange={v => setFormData({...formData, status: v})}
                    options={[
                      { value: 'Dalam Proses', label: 'Dalam Proses' },
                      { value: 'Selesai', label: 'Selesai' }
                    ]}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nama Siswa</label>
                <input 
                  type="text" 
                  value={formData.studentName}
                  onChange={e => setFormData({...formData, studentName: e.target.value})}
                  placeholder="Misal: Rina (X-A)" 
                  className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-red-500 bg-slate-50 text-sm" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Pihak Terkait</label>
                <input 
                  type="text" 
                  value={formData.parties}
                  onChange={e => setFormData({...formData, parties: e.target.value})}
                  placeholder="Misal: Guru Mapel Kimia" 
                  className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-red-500 bg-slate-50 text-sm" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Deskripsi Kasus (Pelanggaran Hak)</label>
                <textarea 
                  rows={2}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Misal: Siswa tidak diberikan kesempatan ujian susulan..." 
                  className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-red-500 bg-slate-50 text-sm" 
                ></textarea>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Langkah Advokasi / Mediasi</label>
                <textarea 
                  rows={2}
                  value={formData.action}
                  onChange={e => setFormData({...formData, action: e.target.value})}
                  placeholder="Misal: Mempertemukan siswa dengan guru mapel..." 
                  className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-red-500 bg-slate-50 text-sm" 
                ></textarea>
              </div>
            </div>
            
            <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 flex justify-end gap-2 shrink-0">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)} 
                className="px-4 py-2 text-slate-500 hover:text-slate-700 hover:bg-slate-200 font-bold rounded-lg transition-colors text-sm"
              >
                Batal
              </button>
              <button 
                type="button" 
                onClick={handleSave} 
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors text-sm flex items-center gap-2"
              >
                <Check className="w-4 h-4" /> Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


export function BKAdministrasi() {
  
  const [activity, setActivity] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { user } = useAuth();

  const handleSave = async () => {
    if (!activity) {
      window.alert("Mohon isi laporan aktivitas harian.");
      return;
    }

    setIsSubmitting(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      
      await apiClient("/crud.php?table=laporan_harian", {
        method: "POST",
        body: JSON.stringify({
          user_id: user?.id,
          role: "bk",
          date: today,
          activity: activity
        })
      });
      window.alert("Laporan harian BK berhasil disimpan ke database!");
      setActivity("");
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
        <h1 className="text-xl font-bold tracking-tight text-slate-800">Administrasi BK Harian</h1>
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
      <h1 className="text-xl font-bold tracking-tight text-slate-800">Administrasi Harian BK</h1>
      
      <Card>
        <CardHeader><CardTitle>Laporan Aktivitas Harian</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <label className="block text-sm font-bold text-slate-700">Aktivitas Hari Ini</label>
            <textarea 
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              placeholder="Contoh: Melakukan konseling individu dengan 3 siswa kelas X-IPA terkait minat bakat."
              rows={5}
              className="w-full p-3 rounded-lg border border-slate-300 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <button 
            onClick={handleSave} 
            disabled={isSubmitting}
            className="w-full mt-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors shadow-sm"
          >
            {isSubmitting ? "MENYIMPAN..." : "SIMPAN LAPORAN HARIAN"}
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
