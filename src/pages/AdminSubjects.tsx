import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { 
  BookOpen, Search, Plus, Trash2, Edit2, Check, X, AlertCircle, Bookmark, BookOpenCheck
} from 'lucide-react';
import { CustomSelect } from '../components/ui/CustomSelect';
import { dbClient } from '../lib/dbClient';

interface Subject {
  id: string;
  code: string;
  name: string;
  category: 'Wajib' | 'Muatan Lokal' | 'Pilihan';
  weekly_hours: number;
}

export function AdminSubjects() {
  
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const data = await dbClient.get('subjects');
      if (Array.isArray(data)) {
        setSubjects(data);
      } else {
        console.error('Invalid subjects data:', data);
        setFeedback({ type: 'error', message: 'Data yang diterima tidak valid.' });
      }
    } catch (e) {
      console.error(e);
      setFeedback({ type: 'error', message: 'Gagal mengambil data mata pelajaran' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Semua');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form states
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'Wajib' | 'Muatan Lokal' | 'Pilihan'>('Wajib');
  const [weeklyHours, setWeeklyHours] = useState('3');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const openAddModal = () => {
  
    setEditingId(null);
    setCode(`MP-${String(subjects.length + 1).padStart(3, '0')}`);
    setName('');
    setCategory('Wajib');
    setWeeklyHours('3');
    setIsModalOpen(true);
  };

  const openEditModal = (s: any) => {
    setEditingId(s.id);
    setCode(s.code);
    setName(s.name);
    setCategory(s.category);
    setWeeklyHours(String(s.weekly_hours));
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim() || Number(weeklyHours) <= 0) {
      setFeedback({ type: 'error', message: 'Silakan isi formulir dengan lengkap.' });
      return;
    }

    try {
      if (editingId) {
        await dbClient.update('subjects', editingId, {
          code: code.trim(),
          name: name.trim(),
          category,
          weekly_hours: Number(weeklyHours)
        });
        setFeedback({ type: 'success', message: 'Mata pelajaran berhasil diperbarui.' });
      } else {
        await dbClient.insert('subjects', {
          code: code.trim(),
          name: name.trim(),
          category,
          weekly_hours: Number(weeklyHours)
        });
        setFeedback({ type: 'success', message: 'Mata pelajaran baru berhasil ditambahkan.' });
      }
      setIsModalOpen(false);
      fetchSubjects();
    } catch (err: any) {
      setFeedback({ type: 'error', message: 'Gagal menyimpan data.' });
    }
  };

  const confirmDelete = async () => {
    if (deleteConfirmId) {
      try {
        await dbClient.delete('subjects', deleteConfirmId);
        setDeleteConfirmId(null);
        setFeedback({ type: 'success', message: 'Mata pelajaran berhasil dihapus.' });
        fetchSubjects();
      } catch (err) {
        setFeedback({ type: 'error', message: 'Gagal menghapus data.' });
      }
    }
  };

  const filteredSubjects = subjects.filter(s => {
    const nameStr = s.name || '';
    const codeStr = s.code || '';
    const matchesSearch = nameStr.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          codeStr.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'Semua' || s.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalHours = subjects.reduce((acc, curr) => acc + (curr.weekly_hours || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manajemen Mata Pelajaran</h1>
          <p className="text-slate-500 text-sm mt-1">Kelola data mata pelajaran, kategori kurikulum, dan beban belajar.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> Tambah Mapel
        </button>
      </div>

      {feedback && (
        <div className={`p-4 rounded-xl text-sm font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${
          feedback.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {feedback.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {feedback.message}
        </div>
      )}

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500 mb-1">Total Mapel</p>
              <h3 className="text-2xl font-black text-slate-800">{subjects.length}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <BookOpenCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500 mb-1">Wajib Nasional</p>
              <h3 className="text-2xl font-black text-slate-800">{subjects.filter(s => s.category === 'Wajib').length}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Bookmark className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500 mb-1">Muatan Lokal</p>
              <h3 className="text-2xl font-black text-slate-800">{subjects.filter(s => s.category === 'Muatan Lokal').length}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500 mb-1">Total JP / Minggu</p>
              <h3 className="text-2xl font-black text-slate-800">{totalHours}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <CardHeader className="p-4 md:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle className="text-lg text-slate-800 font-bold">Daftar Mata Pelajaran</CardTitle>
          <div className="flex flex-col sm:flex-row gap-3 md:w-[450px]">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Cari nama atau kode mapel..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
              />
            </div>
            <div className="w-full sm:w-48">
              <CustomSelect
                value={categoryFilter}
                onChange={setCategoryFilter}
                options={[
                  { value: 'Semua', label: 'Semua Kategori' },
                  { value: 'Wajib', label: 'Wajib Nasional' },
                  { value: 'Muatan Lokal', label: 'Muatan Lokal' },
                  { value: 'Pilihan', label: 'Pilihan / Ekskul' }
                ]}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs text-slate-500 uppercase font-bold">
                  <th className="pb-3 px-4 pt-4">Kode Mapel</th>
                  <th className="pb-3 px-4 pt-4">Nama Mata Pelajaran</th>
                  <th className="pb-3 px-4 pt-4">Kategori Kurikulum</th>
                  <th className="pb-3 px-4 pt-4">Beban Belajar</th>
                  <th className="pb-3 px-4 pt-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500 text-sm">
                      Memuat data mata pelajaran...
                    </td>
                  </tr>
                ) : filteredSubjects.length > 0 ? (
                  filteredSubjects.map(s => (
                    <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors group">
                      <td className="py-3 px-4 font-mono text-sm text-slate-600 font-bold">{s.code}</td>
                      <td className="py-3 px-4 text-sm font-bold text-slate-800">{s.name}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-semibold ${
                          s.category === 'Wajib' ? 'bg-emerald-100 text-emerald-800' :
                          s.category === 'Muatan Lokal' ? 'bg-indigo-100 text-indigo-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {s.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-slate-700">{s.weekly_hours} JP / Minggu</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => openEditModal(s)} 
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded" 
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setDeleteConfirmId(s.id)} 
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded" 
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500 text-sm">
                      Mata pelajaran tidak ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/40 backdrop-blur-sm pb-20 sm:pb-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden my-auto flex flex-col">
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4 text-red-600">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Hapus Mata Pelajaran?</h3>
              <p className="text-sm text-slate-600 mb-6">Apakah Anda yakin ingin menghapus mata pelajaran ini? Hal ini dapat memengaruhi relasi nilai siswa.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-bold transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold transition-colors"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT FORM MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto pb-20 sm:pb-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden my-auto flex flex-col max-h-[82vh] sm:max-h-[90vh]">
            <div className="flex justify-between items-center p-4 border-b border-slate-100">
              <h2 className="font-bold text-lg text-slate-800">
                {editingId ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Kode Mapel</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: MP-001..."
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Nama Mata Pelajaran</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ilmu Pengetahuan Alam (IPA)..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-emerald-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Kategori</label>
                  <CustomSelect
                    value={category}
                    onChange={(val) => setCategory(val as any)}
                    options={[
                      { value: 'Wajib', label: 'Wajib Nasional' },
                      { value: 'Muatan Lokal', label: 'Muatan Lokal' },
                      { value: 'Pilihan', label: 'Pilihan / Ekskul' },
                    ]}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Jam Pelajaran (JP)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="10"
                    value={weeklyHours}
                    onChange={(e) => setWeeklyHours(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-bold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <Check className="w-4 h-4" /> Simpan Mapel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
