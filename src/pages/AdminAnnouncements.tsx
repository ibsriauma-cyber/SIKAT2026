import { apiClient } from '../lib/apiClient';
import { remoteStorage } from '../lib/remoteStorage';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { 
  Megaphone, Search, Plus, Trash2, Edit2, Check, X, AlertCircle, FileText, Users, Eye, Tag 
} from 'lucide-react';
import { CustomSelect } from '../components/ui/CustomSelect';

interface Announcement {
  id: string;
  title: string;
  content: string;
  target: 'Semua' | 'Guru' | 'Wali Murid';
  category: 'Penting' | 'Akademik' | 'Kegiatan' | 'Maintenance';
  date: string;
  isPublished: boolean;
}

export function AdminAnnouncements() {
  
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // Removed remoteStorage sync effect

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Semua');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [target, setTarget] = useState<'Semua' | 'Guru' | 'Wali Murid'>('Semua');
  const [category, setCategory] = useState<'Penting' | 'Akademik' | 'Kegiatan'>('Akademik');
  const [isPublished, setIsPublished] = useState(true);

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const openAddModal = () => {
  
    setEditingId(null);
    setTitle('');
    setContent('');
    setTarget('Semua');
    setCategory('Akademik');
    setIsPublished(true);
    setIsModalOpen(true);
  };

  const openEditModal = (ann: any) => {
    setEditingId(ann.id);
    setTitle(ann.title);
    setContent(ann.content);
    setTarget(ann.target);
    setCategory(ann.category);
    setIsPublished(ann.isPublished);
    setIsModalOpen(true);
  };

  const fetchAnnouncements = async () => {
    try {
      const data = await apiClient('/announcements.php');
      setAnnouncements(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setFeedback({ type: 'error', message: 'Judul dan isi pengumuman tidak boleh kosong.' });
      return;
    }

    try {
      if (editingId) {
        await apiClient('/announcements.php', {
          method: 'PUT',
          body: JSON.stringify({ id: editingId, title: title.trim(), content: content.trim(), target, category, isPublished })
        });
        setFeedback({ type: 'success', message: 'Pengumuman berhasil diperbarui.' });
      } else {
        await apiClient('/announcements.php', {
          method: 'POST',
          body: JSON.stringify({ title: title.trim(), content: content.trim(), target, category, isPublished })
        });
        setFeedback({ type: 'success', message: 'Pengumuman baru berhasil dipublikasikan.' });
      }
      fetchAnnouncements();
      setIsModalOpen(false);
    } catch (error) {
      setFeedback({ type: 'error', message: 'Gagal menyimpan pengumuman.' });
    }
  };

  const confirmDelete = async () => {
    if (deleteConfirmId) {
      try {
        await apiClient(`/announcements.php?id=${deleteConfirmId}`, { method: 'DELETE' });
        setFeedback({ type: 'success', message: 'Pengumuman berhasil dihapus.' });
        fetchAnnouncements();
      } catch (error) {
        setFeedback({ type: 'error', message: 'Gagal menghapus pengumuman.' });
      }
      setDeleteConfirmId(null);
    }
  };

  const filteredAnnouncements = announcements.filter(ann => {
    const matchesSearch = ann.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ann.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'Semua' || ann.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">Pengumuman & Berita</h1>
          <p className="text-slate-500 mt-1 text-sm">Papan Informasi & Pengumuman Madrasah.</p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Buat Pengumuman
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

      {/* FILTER & SEARCH */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          {(['Semua', 'Penting', 'Akademik', 'Kegiatan', 'Maintenance'] as const).map(c => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                categoryFilter === c 
                  ? 'bg-slate-800 text-white' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Cari pengumuman..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
      </div>

      {/* ANNOUNCEMENT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredAnnouncements.length > 0 ? (
          filteredAnnouncements.map(ann => (
            <Card key={ann.id} className="relative flex flex-col justify-between overflow-visible border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all">
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      ann.category === 'Penting' ? 'bg-red-100 text-red-800' :
                      ann.category === 'Akademik' ? 'bg-blue-100 text-blue-800' :
                      ann.category === 'Maintenance' ? 'bg-orange-100 text-orange-800' :
                      'bg-emerald-100 text-emerald-800'
                    }`}>
                      {ann.category}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="flex items-center gap-1 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                      <Users className="w-3 h-3" /> {ann.target}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">{ann.date}</span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-bold text-slate-800 text-base leading-snug group-hover:text-emerald-600">
                    {ann.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed line-clamp-3">
                    {ann.content}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50">
                <span className={`text-[10px] font-bold uppercase tracking-widest ${
                  ann.isPublished ? 'text-emerald-600' : 'text-slate-400'
                }`}>
                  ● {ann.isPublished ? 'Published' : 'Draft'}
                </span>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => openEditModal(ann)} 
                    className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-all" 
                    title="Edit Pengumuman"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setDeleteConfirmId(ann.id)} 
                    className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition-all" 
                    title="Hapus Pengumuman"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="md:col-span-2 py-12 text-center bg-white rounded-xl border border-dashed border-slate-300 text-slate-500 text-sm">
            Tidak ada pengumuman yang sesuai pencarian atau kategori.
          </div>
        )}
      </div>

      {/* CONFIRMATION DELETION MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/40 backdrop-blur-sm pb-20 sm:pb-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden my-auto flex flex-col">
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4 text-red-600">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Hapus Pengumuman?</h3>
              <p className="text-sm text-slate-600 mb-6">Apakah Anda yakin ingin menghapus pengumuman ini?</p>
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

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto pb-20 sm:pb-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden my-auto flex flex-col max-h-[82vh] sm:max-h-[90vh]">
            <div className="flex justify-between items-center p-4 md:p-6 border-b border-slate-100">
              <h2 className="font-bold text-lg text-slate-800">
                {editingId ? 'Edit Pengumuman' : 'Buat Pengumuman Baru'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-4 md:p-6 space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Judul Pengumuman</label>
                  <input
                    type="text"
                    required
                    placeholder="Masukkan judul pengumuman..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
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
                        { value: 'Akademik', label: 'Akademik' },
                        { value: 'Penting', label: 'Penting' },
                        { value: 'Kegiatan', label: 'Kegiatan' },
                        { value: 'Maintenance', label: 'Maintenance' },
                      ]}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Target Penerima</label>
                    <CustomSelect
                      value={target}
                      onChange={(val) => setTarget(val as any)}
                      options={[
                        { value: 'Semua', label: 'Semua Kalangan' },
                        { value: 'Guru', label: 'Hanya Guru & Staff' },
                        { value: 'Wali Murid', label: 'Hanya Orangtua / Wali' },
                      ]}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Isi Pengumuman</label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Tuliskan pesan pengumuman secara detail di sini..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-emerald-500 outline-none resize-none"
                  ></textarea>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPublished"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="w-4 h-4 accent-emerald-600 rounded"
                  />
                  <label htmlFor="isPublished" className="text-xs font-bold text-slate-600 uppercase tracking-wider select-none cursor-pointer">
                    Publikasikan Langsung ke Papan Informasi
                  </label>
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
                  <Check className="w-4 h-4" /> Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
