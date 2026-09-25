import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { 
  Building2, Search, Plus, Trash2, Edit2, Check, X, AlertCircle, Hammer, Tag, ClipboardList
} from 'lucide-react';
import { CustomSelect } from '../components/ui/CustomSelect';
import { apiClient } from '../lib/apiClient';
import { dbClient } from '../lib/dbClient';

interface Asset {
  id: string;
  name: string;
  category: string;
  quantityGood: number;
  quantityLight: number;
  quantityHeavy: number;
  location: string;
}

export function AdminSarpras() {
  
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSarpras = async () => {
      try {
        const data = await apiClient('/sarpras.php');
        if (Array.isArray(data)) {
          const formatted = data.map((item: any) => {
             let qtyBaik = Number(item.qty_baik || item.quantityGood || 0);
             let qtyRusakRingan = Number(item.qty_rusak_ringan || item.quantityLight || 0);
             let qtyRusakBerat = Number(item.qty_rusak_berat || item.quantityHeavy || 0);
             
             if (!item.qty_baik && !item.qty_rusak_ringan && !item.qty_rusak_berat && item.condition) {
                 if (item.condition === 'Baik') qtyBaik = Number(item.quantity) || 0;
                 if (item.condition === 'Rusak Ringan') qtyRusakRingan = Number(item.quantity) || 0;
                 if (item.condition === 'Rusak Berat') qtyRusakBerat = Number(item.quantity) || 0;
             }

             return {
                id: String(item.id),
                name: item.item_name || item.name,
                category: item.category,
                quantityGood: qtyBaik || 0,
                quantityLight: qtyRusakRingan || 0,
                quantityHeavy: qtyRusakBerat || 0,
                location: item.room || item.location,
             }
          });
          setAssets(formatted);
        }
      } catch (error) {
        console.error('Failed to fetch sarpras:', error);
      } finally {
        setLoading(false);
      }
    };
  useEffect(() => {
    fetchSarpras();
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Semua');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'Gedung & Ruang' | 'Peralatan Elektronik' | 'Mebel & Meja Kursi' | 'Buku & Media'>('Peralatan Elektronik');
  const [quantityGood, setQuantityGood] = useState('1');
  const [quantityLight, setQuantityLight] = useState('0');
  const [quantityHeavy, setQuantityHeavy] = useState('0');
  const [location, setLocation] = useState('');

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const openAddModal = () => {
  
    setEditingId(null);
    setName('');
    setCategory('Peralatan Elektronik');
    setQuantityGood('1');
    setQuantityLight('0');
    setQuantityHeavy('0');
    setLocation('');
    setIsModalOpen(true);
  };

  const openEditModal = (a: any) => {
    setEditingId(a.id);
    setName(a.name);
    setCategory(a.category);
    setQuantityGood(String(a.quantityGood));
    setQuantityLight(String(a.quantityLight));
    setQuantityHeavy(String(a.quantityHeavy));
    setLocation(a.location);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const totalQty = Number(quantityGood) + Number(quantityLight) + Number(quantityHeavy);
    if (!name.trim() || !location.trim() || totalQty <= 0) {
      setFeedback({ type: 'error', message: 'Silakan lengkapi formulir dengan benar.' });
      return;
    }

    try {
      const payload = {
        item_name: name.trim(),
        category,
        qty_baik: Number(quantityGood),
        qty_rusak_ringan: Number(quantityLight),
        qty_rusak_berat: Number(quantityHeavy),
        room: location.trim(),
        code: editingId ? undefined : `AST-${Date.now().toString().slice(-4)}`
      };

      if (editingId) {
        delete payload.code;
        await dbClient.update('sarpras', editingId, payload);
        setFeedback({ type: 'success', message: 'Aset berhasil diperbarui.' });
      } else {
        await dbClient.insert('sarpras', payload);
        setFeedback({ type: 'success', message: 'Aset berhasil ditambahkan.' });
      }
      setIsModalOpen(false);
      fetchSarpras();
    } catch (err) {
      console.error(err);
      setFeedback({ type: 'error', message: 'Gagal menyimpan aset.' });
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await dbClient.delete('sarpras', deleteConfirmId);
      setFeedback({ type: 'success', message: 'Aset berhasil dihapus.' });
      setDeleteConfirmId(null);
      fetchSarpras();
    } catch (err) {
      console.error(err);
      setFeedback({ type: 'error', message: 'Gagal menghapus aset.' });
    }
  };

  const filteredAssets = assets.filter(a => {
    const nameStr = a.name || '';
    const locStr = a.location || '';
    const matchesSearch = nameStr.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          locStr.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'Semua' || a.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const stats = {
    itemsCount: assets.length,
    good: assets.reduce((acc, curr) => acc + curr.quantityGood, 0),
    warning: assets.reduce((acc, curr) => acc + curr.quantityLight, 0),
    danger: assets.reduce((acc, curr) => acc + curr.quantityHeavy, 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">Sarana & Prasarana (Sarpras)</h1>
          <p className="text-slate-500 mt-1 text-sm">Manajemen Inventaris & Fasilitas Madrasah.</p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Registrasi Aset Baru
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Jenis Inventaris</p>
          <p className="text-2xl font-black text-slate-800 mt-1">{stats.itemsCount} Kategori</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Kondisi Baik</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{stats.good}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <p className="text-xs font-bold text-amber-500 uppercase tracking-widest">Rusak Ringan</p>
          <p className="text-2xl font-black text-amber-600 mt-1">{stats.warning}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <p className="text-xs font-bold text-red-500 uppercase tracking-widest">Rusak Berat</p>
          <p className="text-2xl font-black text-red-600 mt-1">{stats.danger}</p>
        </div>
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

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>Daftar Inventaris Madrasah</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <CustomSelect
                value={categoryFilter}
                onChange={(val) => setCategoryFilter(val)}
                options={[
                  { value: 'Semua', label: 'Semua Kategori' },
                  { value: 'Gedung & Ruang', label: 'Gedung & Ruang' },
                  { value: 'Peralatan Elektronik', label: 'Peralatan Elektronik' },
                  { value: 'Mebel & Meja Kursi', label: 'Mebel & Meja Kursi' },
                  { value: 'Buku & Media', label: 'Buku & Media' },
                ]}
                className="w-44"
              />
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
                <input
                  type="text"
                  placeholder="Cari aset..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white outline-none focus:border-emerald-500 transition-colors w-44"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs text-slate-500 uppercase font-bold">
                  <th className="pb-3 px-4">Nama Aset</th>
                  <th className="pb-3 px-4">Kategori / Lokasi</th>
                  <th className="pb-3 px-4">Jumlah / Unit</th>
                  <th className="pb-3 px-4">Kondisi</th>
                  <th className="pb-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssets.length > 0 ? (
                  filteredAssets.map(a => (
                    <tr key={a.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors group">
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-800 text-sm">{a.name}</p>
                        <p className="text-xs text-slate-500">Kebutuhan Operasional</p>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <p className="font-medium text-slate-700">{a.category}</p>
                        <p className="text-xs text-slate-500">{a.location}</p>
                      </td>
                      <td className="py-3 px-4 text-sm font-bold text-slate-800">{a.quantityGood + a.quantityLight + a.quantityHeavy} Unit</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-row sm:flex-col items-center sm:items-start gap-1 flex-wrap">
                          {a.quantityGood > 0 && (
                            <span className="inline-block px-2 py-0.5 sm:px-2.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 whitespace-nowrap">
                              <span className="sm:hidden">B: </span>
                              <span className="hidden sm:inline">Baik: </span>
                              {a.quantityGood}
                            </span>
                          )}
                          {a.quantityLight > 0 && (
                            <span className="inline-block px-2 py-0.5 sm:px-2.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200 whitespace-nowrap">
                              <span className="sm:hidden">RR: </span>
                              <span className="hidden sm:inline">Rusak Ringan: </span>
                              {a.quantityLight}
                            </span>
                          )}
                          {a.quantityHeavy > 0 && (
                            <span className="inline-block px-2 py-0.5 sm:px-2.5 rounded-full text-[10px] font-semibold bg-red-100 text-red-800 border border-red-200 whitespace-nowrap">
                              <span className="sm:hidden">RB: </span>
                              <span className="hidden sm:inline">Rusak Berat: </span>
                              {a.quantityHeavy}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => openEditModal(a)} 
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded" 
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setDeleteConfirmId(a.id)} 
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
                      Tidak ada aset sarpras yang ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* CONFIRMATION DELETION MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/40 backdrop-blur-sm pb-20 sm:pb-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden my-auto flex flex-col">
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4 text-red-600">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Hapus Aset?</h3>
              <p className="text-sm text-slate-600 mb-6">Apakah Anda yakin ingin menghapus aset sarana prasarana ini?</p>
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto scrollbar-hide pb-20 sm:pb-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden my-auto flex flex-col max-h-[82vh] sm:max-h-[90vh]">
            <div className="flex justify-between items-center p-4 md:p-6 border-b border-slate-100 shrink-0">
              <h2 className="font-bold text-lg text-slate-800">
                {editingId ? 'Edit Aset Madrasah' : 'Registrasi Aset Baru'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-4 md:p-6 space-y-4 overflow-y-auto scrollbar-hide">
                <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Nama Barang / Fasilitas</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Proyektor Epson EB-X400..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-emerald-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Kategori Aset</label>
                    <CustomSelect
                      value={category}
                      onChange={(val) => setCategory(val as any)}
                      options={[
                        { value: 'Gedung & Ruang', label: 'Gedung & Ruang' },
                        { value: 'Peralatan Elektronik', label: 'Peralatan Elektronik' },
                        { value: 'Mebel & Meja Kursi', label: 'Mebel & Meja Kursi' },
                        { value: 'Buku & Media', label: 'Buku & Media' },
                      ]}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Lokasi Penyimpanan</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Lab Komputer Lt 2..."
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>
                
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                   <h4 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-200 pb-2">Rincian Kuantitas dan Kondisi</h4>
                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">Kondisi Baik</label>
                        <input
                          type="number"
                          min="0"
                          value={quantityGood}
                          onChange={(e) => setQuantityGood(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-emerald-500 outline-none bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">Rusak Ringan</label>
                        <input
                          type="number"
                          min="0"
                          value={quantityLight}
                          onChange={(e) => setQuantityLight(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-amber-500 outline-none bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-red-600 uppercase tracking-wider mb-1">Rusak Berat</label>
                        <input
                          type="number"
                          min="0"
                          value={quantityHeavy}
                          onChange={(e) => setQuantityHeavy(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-red-500 outline-none bg-white"
                        />
                      </div>
                   </div>
                   <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-200">Total Unit Aset: <span className="font-bold text-slate-700">{Number(quantityGood) + Number(quantityLight) + Number(quantityHeavy)}</span></p>
                </div>
              </div>
              </div>

              <div className="flex gap-3 p-4 md:p-6 border-t border-slate-100 shrink-0 bg-slate-50">
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
                  <Check className="w-4 h-4" /> Simpan Aset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
