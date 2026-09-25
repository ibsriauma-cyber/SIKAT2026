import React, { useState, useEffect } from 'react';
import { remoteStorage } from '../lib/remoteStorage';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { 
  Calendar, CalendarDays, Plus, Check, X, AlertCircle, Trash2, Edit2, ToggleLeft, ToggleRight, Settings, ArrowUpCircle 
} from 'lucide-react';
import { CustomSelect } from '../components/ui/CustomSelect';
import { apiClient } from '../lib/apiClient';

interface AcademicTerm {
  id: string;
  year: string; // e.g. "2026/2027"
  semester: 'Ganjil' | 'Genap';
  startDate: string;
  endDate: string;
  totalWeeks: number;
  isActive: boolean;
}

export function AdminTermSettings() {
  
  const [terms, setTerms] = useState<AcademicTerm[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTerms = async () => {
    try {
      const res = await apiClient('/crud.php?table=academic_terms');
      // Map snake_case to camelCase and supply defaults
      setTerms(res.map((t: any) => ({
        id: t.id.toString(),
        year: t.year,
        semester: t.semester,
        isActive: Boolean(t.is_active),
        startDate: t.start_date || '2025-07-15',
        endDate: t.end_date || '2025-12-15',
        totalWeeks: t.total_weeks || 20
      })));
    } catch(e) {
      console.error(e);
      setFeedback({ type: 'error', message: 'Gagal memuat tahun ajaran' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTerms();
  }, []);

  // Remove old remoteStorage block
  /*
    if (typeof window !== 'undefined') {
      const stored = remoteStorage.getItem('mockAcademicTerms');
      if (stored) {
        try { return JSON.parse(stored); } catch (e) {}
      }
    }
    return [];
  });

  */

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form states
  const [year, setYear] = useState('2026/2027');
  const [semester, setSemester] = useState<'Ganjil' | 'Genap'>('Ganjil');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalWeeks, setTotalWeeks] = useState('20');

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const openAddModal = () => {
  
    setEditingId(null);
    setYear('2026/2027');
    setSemester('Ganjil');
    setStartDate('');
    setEndDate('');
    setTotalWeeks('20');
    setIsModalOpen(true);
  };

  const openEditModal = (t: any) => {
    setEditingId(t.id);
    setYear(t.year);
    setSemester(t.semester);
    setStartDate(t.startDate);
    setEndDate(t.endDate);
    setTotalWeeks(String(t.totalWeeks));
    setIsModalOpen(true);
  };

  
  const handleActivate = async (id: string) => {
    try {
      // Set all terms to false
      await Promise.all(terms.map(t => 
        apiClient(`/crud.php?table=academic_terms&id=${t.id}`, {
          method: 'PUT',
          body: JSON.stringify({ is_active: 0 })
        })
      ));
      // Set selected term to true
      await apiClient(`/crud.php?table=academic_terms&id=${id}`, {
        method: 'PUT',
        body: JSON.stringify({ is_active: 1 })
      });
      fetchTerms();
      setFeedback({ type: 'success', message: 'Tahun ajaran dan semester aktif berhasil diubah.' });
    } catch (e) {
      console.error(e);
      setFeedback({ type: 'error', message: 'Gagal mengubah tahun ajaran.' });
    }
  };


  const handlePromoteStudents = () => {
  
    if (!window.confirm('PERINGATAN: Aksi ini akan memajukan seluruh siswa ke tingkat kelas berikutnya secara otomatis (Misal: Kelas X menjadi XI, XI menjadi XII, dan XII menjadi Lulus). Aksi ini sebaiknya hanya dilakukan sekali setiap awal tahun ajaran baru. Apakah Anda yakin?')) {
      return;
    }
    
    const storedStudents = remoteStorage.getItem('mockStudents');
    if (storedStudents) {
      try {
        let students = JSON.parse(storedStudents);
        let promotedCount = 0;
        let graduatedCount = 0;
        
        students = students.map((s: any) => {
          if (!s.className) return s;
          
          let newClass = s.className;
          
          // Map X -> XI, 10 -> 11
          if (s.className.startsWith('X-') || s.className.startsWith('10-')) {
            newClass = s.className.replace(/^X-/, 'XI-').replace(/^10-/, '11-');
            promotedCount++;
          } 
          // Map XI -> XII, 11 -> 12
          else if (s.className.startsWith('XI-') || s.className.startsWith('11-')) {
            newClass = s.className.replace(/^XI-/, 'XII-').replace(/^11-/, '12-');
            promotedCount++;
          } 
          // Map XII -> Lulus, 12 -> Lulus
          else if (s.className.startsWith('XII-') || s.className.startsWith('12-')) {
            newClass = 'Lulus';
            graduatedCount++;
          }
          
          return { ...s, className: newClass };
        });
        
        remoteStorage.setItem('mockStudents', JSON.stringify(students));
        setFeedback({ 
          type: 'success', 
          message: `Kenaikan kelas berhasil diproses. ${promotedCount} siswa naik kelas dan ${graduatedCount} siswa dinyatakan lulus.` 
        });
      } catch (e) {
        setFeedback({ type: 'error', message: 'Gagal memproses kenaikan kelas.' });
      }
    } else {
      setFeedback({ type: 'error', message: 'Data siswa tidak ditemukan.' });
    }
  };

  
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!year.trim() || !startDate || !endDate || Number(totalWeeks) <= 0) {
      setFeedback({ type: 'error', message: 'Silakan isi formulir dengan lengkap.' });
      return;
    }
    const payload = {
      year: year.trim(),
      semester,
      is_active: terms.length === 0 ? 1 : 0
    };
    try {
      if (editingId) {
        await apiClient(`/crud.php?table=academic_terms&id=${editingId}`, {
          method: 'PUT',
          body: JSON.stringify({
            year: year.trim(),
            semester
          })
        });
        setFeedback({ type: 'success', message: 'Tahun ajaran berhasil diperbarui.' });
      } else {
        await apiClient('/crud.php?table=academic_terms', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        setFeedback({ type: 'success', message: 'Tahun ajaran dan semester baru berhasil dibuat.' });
      }
      setIsModalOpen(false);
      fetchTerms();
    } catch (e) {
      console.error(e);
      setFeedback({ type: 'error', message: 'Gagal menyimpan tahun ajaran.' });
    }
  };


  const confirmDelete = () => {
  
    if (deleteConfirmId) {
      const targetTerm = terms.find(t => t.id === deleteConfirmId);
      if (targetTerm?.isActive) {
        setFeedback({ type: 'error', message: 'Tidak dapat menghapus tahun ajaran yang sedang aktif.' });
        setDeleteConfirmId(null);
        return;
      }
      setTerms(terms.filter(t => t.id !== deleteConfirmId));
      setDeleteConfirmId(null);
      setFeedback({ type: 'success', message: 'Tahun ajaran berhasil dihapus.' });
    }
  };

  const activeTerm = terms.find(t => t.isActive);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">Pengaturan Tahun Ajaran & Semester</h1>
          <p className="text-slate-500 mt-1 text-sm">Kelola periode aktif, kalender belajar, dan semester madrasah.</p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Tambah Tahun Ajaran
        </button>
      </div>

      {feedback && (
        <div className={`p-4 rounded-lg flex items-center gap-3 text-sm font-semibold border ${
          feedback.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {feedback.type === 'success' ? <Check className="w-5 h-5 shrink-0 text-emerald-600" /> : <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* ACTIVE TERM DISPLAY */}
      {activeTerm && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="bg-emerald-500 text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-full border border-emerald-400">
              Periode Aktif Saat Ini
            </span>
            <h2 className="text-3xl font-black tracking-tight mt-1">
              TA {activeTerm.year} — Semester {activeTerm.semester}
            </h2>
            <p className="text-emerald-100 text-sm">
              Rentang Belajar: <span className="font-bold">{activeTerm.startDate}</span> s.d. <span className="font-bold">{activeTerm.endDate}</span> ({activeTerm.totalWeeks} Minggu Efektif)
            </p>
          </div>
          <div className="flex flex-col gap-3 self-start md:self-auto">
            <div className="flex items-center gap-2 bg-white/10 px-4 py-3 rounded-xl border border-white/15 backdrop-blur-sm">
              <Settings className="w-5 h-5 animate-spin" />
              <span className="text-sm font-bold">Seluruh sistem terintegrasi dengan periode ini</span>
            </div>
            {activeTerm.semester === 'Ganjil' && (
              <button 
                onClick={handlePromoteStudents}
                className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-3 rounded-xl shadow-sm transition-colors text-sm font-bold w-full"
              >
                <ArrowUpCircle className="w-5 h-5" />
                Proses Kenaikan Kelas
              </button>
            )}
          </div>
        </div>
      )}

      {/* TERM TABLE CARD */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Riwayat & Agenda Tahun Pelajaran</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs text-slate-500 uppercase font-bold">
                  <th className="pb-3 px-4">Tahun Ajaran</th>
                  <th className="pb-3 px-4">Semester</th>
                  <th className="pb-3 px-4">Tanggal Mulai</th>
                  <th className="pb-3 px-4">Tanggal Selesai</th>
                  <th className="pb-3 px-4 text-center">Minggu Efektif</th>
                  <th className="pb-3 px-4 text-center">Status</th>
                  <th className="pb-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {terms.map(t => (
                  <tr key={t.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                    t.isActive ? 'bg-emerald-50/40 hover:bg-emerald-50/60' : ''
                  }`}>
                    <td className="py-4 px-4 font-bold text-slate-800">{t.year}</td>
                    <td className="py-4 px-4 text-sm font-semibold text-slate-700">
                      Semester {t.semester}
                    </td>
                    <td className="py-4 px-4 text-sm font-medium text-slate-600">{t.startDate}</td>
                    <td className="py-4 px-4 text-sm font-medium text-slate-600">{t.endDate}</td>
                    <td className="py-4 px-4 text-sm font-semibold text-slate-700 text-center">{t.totalWeeks} Minggu</td>
                    <td className="py-4 px-4 text-center">
                      {t.isActive ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
                          <Check className="w-3.5 h-3.5" /> Aktif
                        </span>
                      ) : (
                        <button
                          onClick={() => handleActivate(t.id)}
                          className="px-3 py-1 bg-slate-100 text-slate-600 hover:bg-emerald-600 hover:text-white text-xs font-bold rounded-full transition-colors"
                        >
                          Aktifkan
                        </button>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openEditModal(t)} 
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded" 
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setDeleteConfirmId(t.id)} 
                          className={`p-1.5 rounded ${
                            t.isActive ? 'text-slate-300 cursor-not-allowed' : 'text-slate-500 hover:text-red-600 hover:bg-red-50'
                          }`}
                          disabled={t.isActive}
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
              <h3 className="text-lg font-bold text-slate-800 mb-2">Hapus Periode?</h3>
              <p className="text-sm text-slate-600 mb-6">Apakah Anda yakin ingin menghapus data tahun pelajaran ini? Data arsip akan hilang secara permanen.</p>
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

      {/* FORM MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto pb-20 sm:pb-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden my-auto flex flex-col max-h-[82vh] sm:max-h-[90vh]">
            <div className="flex justify-between items-center p-4 border-b border-slate-100">
              <h2 className="font-bold text-lg text-slate-800">
                {editingId ? 'Edit Periode Belajar' : 'Tambah Periode Baru'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Tahun Ajaran</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 2026/2027"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Semester</label>
                  <CustomSelect
                    value={semester}
                    onChange={(val) => setSemester(val as any)}
                    options={[
                      { value: 'Ganjil', label: 'Semester Ganjil' },
                      { value: 'Genap', label: 'Semester Genap' },
                    ]}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Mulai Belajar</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Akhir Belajar</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Jumlah Minggu Efektif</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="52"
                  value={totalWeeks}
                  onChange={(e) => setTotalWeeks(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-emerald-500 outline-none"
                />
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
                  <Check className="w-4 h-4" /> Simpan Periode
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
