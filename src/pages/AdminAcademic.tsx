import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Edit2, Trash2, Plus, X, Check, AlertCircle, Users } from 'lucide-react';
import { mockClasses, mockUsers, mockStudents } from '../data/mock';
import { CustomSelect } from '../components/ui/CustomSelect';
import { Student } from '../types';
import { apiClient } from '../lib/apiClient';

export function AdminAcademic() {
  
  const [classes, setClasses] = useState<any[]>([]);

  const [allStudents, setAllStudents] = useState<Student[]>([]);

  const [users, setUsers] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      const res = await apiClient('/sync');
      if (res && res.classes) {
        setClasses(res.classes);
      }
      if (res && res.users) {
        setUsers(res.users);
      }
      if (res && res.students) {
        setAllStudents(res.students);
      }
    } catch (error) {
      console.error('Failed to fetch data', error);
      // Fallback to mock data if API fails
      setClasses([...mockClasses]);
      setUsers([...mockUsers]);
      setAllStudents([...mockStudents]);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [viewClassId, setViewClassId] = useState<number | null>(null);
  
  const [tingkat, setTingkat] = useState('X');
  const [rombel, setRombel] = useState('');
  const [students, setStudents] = useState(0);
  const [waliKelasId, setWaliKelasId] = useState('');
  const [oldName, setOldName] = useState('');
  
  
  const teachers = users.filter(u => u.role === 'walas' || (u.roles && u.roles.includes('walas')));

  useEffect(() => {
    
    
  }, [allStudents]);

  const openAdd = () => {
  
    setEditingId(null);
    setTingkat('X');
    setRombel('');
    setStudents(0);
    setWaliKelasId('');
    setOldName('');
    setIsModalOpen(true);
  };

  const openEdit = (c: any) => {
    setEditingId(c.id);
    const parts = c.name.split(' ');
    if (['X', 'XI', 'XII'].includes(parts[0])) {
      setTingkat(parts[0]);
      setRombel(parts.slice(1).join(' '));
    } else {
      setTingkat('X');
      setRombel(c.name);
    }
    setStudents(c.students);
    setOldName(c.name);
    const walas = users.find(u => u.id === c.wali_kelas_id) || users.find(u => u.role === 'walas' && (u.class_name || u.className) === c.name);
    setWaliKelasId(walas ? String(walas.id) : '');
    setIsModalOpen(true);
  };

  const confirmDeleteClass = async () => {
    if (deleteConfirmId) {
      try {
        await apiClient(`/crud.php?table=classes&id=${deleteConfirmId}`, { method: 'DELETE' });
        fetchData();
      } catch (e) {
        console.error(e);
      }
      setDeleteConfirmId(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = `${tingkat} ${rombel}`.trim();
    const payload = {
       name,
       wali_kelas_id: waliKelasId ? Number(waliKelasId) : null
    };

    try {
        if (editingId) {
            await apiClient(`/crud.php?table=classes&id=${editingId}`, { method: 'PUT', body: JSON.stringify(payload) });
            // Update walas assignment logic
            if (waliKelasId) {
               const wUser = users.find(u => String(u.id) === String(waliKelasId));
               let currentRoles = wUser?.roles || [wUser?.role || 'guru'];
               if (typeof currentRoles === 'string') {
                 try { currentRoles = JSON.parse(currentRoles); } catch(e) { currentRoles = [wUser?.role || 'guru']; }
               }
               if (!currentRoles.includes('walas')) currentRoles.push('walas');
               await apiClient(`/crud.php?table=users&id=${waliKelasId}`, { method: 'PUT', body: JSON.stringify({ role: 'walas', roles: JSON.stringify(currentRoles), class_name: name }) });
            }
        } else {
            await apiClient('/crud.php?table=classes', { method: 'POST', body: JSON.stringify(payload) });
            if (waliKelasId) {
               const wUser = users.find(u => String(u.id) === String(waliKelasId));
               let currentRoles = wUser?.roles || [wUser?.role || 'guru'];
               if (typeof currentRoles === 'string') {
                 try { currentRoles = JSON.parse(currentRoles); } catch(e) { currentRoles = [wUser?.role || 'guru']; }
               }
               if (!currentRoles.includes('walas')) currentRoles.push('walas');
               await apiClient(`/crud.php?table=users&id=${waliKelasId}`, { method: 'PUT', body: JSON.stringify({ role: 'walas', roles: JSON.stringify(currentRoles), class_name: name }) });
            }
        }
        fetchData();
    } catch (e) {
        console.error(e);
    }
    
    setIsModalOpen(false);
  };

  const getWaliKelas = (c: any) => {
    if (c.wali_kelas_id) {
       const w = users.find(u => u.id === c.wali_kelas_id);
       if (w) return w.name;
    }
    const walas = users.find(u => u.role === 'walas' && (u.class_name || u.className) === c.name);
    return walas ? walas.name : 'Belum Ditugaskan';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div></div>
        <button onClick={openAdd} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold flex items-center gap-2">
          <Plus className="w-4 h-4" /> Tambah Kelas
        </button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Daftar Rombongan Belajar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
                  <th className="py-3 px-4 font-bold text-[11px] uppercase tracking-wider">No</th>
                  <th className="py-3 px-4 font-bold text-[11px] uppercase tracking-wider">Kelas</th>
                  <th className="py-3 px-4 font-bold text-[11px] uppercase tracking-wider">Wali Kelas</th>
                  <th className="py-3 px-4 font-bold text-[11px] uppercase tracking-wider text-center">Jumlah Siswa</th>
                  <th className="py-3 px-4 font-bold text-[11px] uppercase tracking-wider text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {classes.map((c, i) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 text-sm font-semibold text-slate-600">{i + 1}</td>
                    <td className="py-3 px-4 text-sm font-bold text-slate-800">{c.name}</td>
                    <td className="py-3 px-4 text-sm font-medium text-slate-700">{getWaliKelas(c)}</td>
                    <td className="py-3 px-4 text-sm text-center text-slate-600 font-semibold">{allStudents.filter(s => (s.class_name || s.className) === c.name).length}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setViewClassId(c.id)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Lihat Siswa">
                          <Users className="w-4 h-4" />
                        </button>
                        <button onClick={() => openEdit(c)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteConfirmId(c.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Hapus">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {classes.length === 0 && (
              <div className="text-center py-10 text-slate-500 text-sm">
                Belum ada data kelas
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {deleteConfirmId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/40 backdrop-blur-sm pb-20 sm:pb-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden my-auto flex flex-col">
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4 text-red-600">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Konfirmasi Hapus</h3>
              <p className="text-sm text-slate-600 mb-6">Apakah Anda yakin ingin menghapus kelas ini?</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-bold transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={confirmDeleteClass}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold transition-colors"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto pb-20 sm:pb-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden my-auto flex flex-col max-h-[82vh] sm:max-h-[90vh]">
            <div className="flex justify-between items-center p-4 md:p-6 border-b border-slate-100">
              <h2 className="font-bold text-lg text-slate-800">
                {editingId ? 'Edit Data Kelas' : 'Tambah Kelas Baru'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-4 md:p-6 space-y-4">
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1 space-y-1.5">
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Tingkat</label>
                    <CustomSelect
                      value={tingkat}
                      onChange={(val) => setTingkat(val)}
                      options={[
                        { value: 'X', label: 'X' },
                        { value: 'XI', label: 'XI' },
                        { value: 'XII', label: 'XII' },
                      ]}
                      searchable={true}
                    />
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Nama Rombel</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. ar-Rohman"
                      value={rombel}
                      onChange={e => setRombel(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>
                
                {rombel && (
                  <div className="bg-emerald-50 text-emerald-800 p-2 rounded-lg text-xs font-semibold flex items-center gap-2 border border-emerald-100">
                    <span>Nama Kelas Otomatis:</span>
                    <span className="text-sm bg-white px-2 py-0.5 rounded border border-emerald-200">{tingkat} {rombel}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Wali Kelas</label>
                  <CustomSelect
                    value={waliKelasId}
                    onChange={(val) => setWaliKelasId(val)}
                    options={[
                      { value: '', label: '-- Pilih Wali Kelas --' },
                      ...teachers.map(t => ({ value: String(t.id), label: t.name }))
                    ]}
                    searchable={true}
                    placeholder="-- Pilih Wali Kelas --"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 mt-4 border-t border-slate-100">
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
                  <Check className="w-4 h-4" /> {editingId ? 'Simpan Perubahan' : 'Tambahkan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
        {viewClassId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto pb-20 sm:pb-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden my-auto flex flex-col max-h-[82vh] sm:max-h-[90vh]">
            <div className="flex justify-between items-center p-4 md:p-6 border-b border-slate-100">
              <h2 className="font-bold text-lg text-slate-800">
                Data Siswa Kelas {classes.find(c => c.id === viewClassId)?.name}
              </h2>
              <button onClick={() => setViewClassId(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 md:p-6 overflow-y-auto">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
                      <th className="py-3 px-4 font-bold text-[11px] uppercase tracking-wider">No</th>
                      <th className="py-3 px-4 font-bold text-[11px] uppercase tracking-wider">NIS</th>
                      <th className="py-3 px-4 font-bold text-[11px] uppercase tracking-wider">Nama Siswa</th>
                      <th className="py-3 px-4 font-bold text-[11px] uppercase tracking-wider">L/P</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allStudents.filter(s => (s.class_name || s.className) === classes.find(c => c.id === viewClassId)?.name).map((s, i) => (
                      <tr key={s.id || s.nis} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-2.5 px-4 text-sm text-slate-500">{i + 1}</td>
                        <td className="py-2.5 px-4 text-sm font-medium text-slate-700">{s.nis}</td>
                        <td className="py-2.5 px-4 text-sm font-bold text-slate-800">{s.name}</td>
                        <td className="py-2.5 px-4 text-sm text-slate-600">{s.gender || '-'}</td>
                      </tr>
                    ))}
                    {allStudents.filter(s => (s.class_name || s.className) === classes.find(c => c.id === viewClassId)?.name).length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-sm text-slate-500">Belum ada siswa di kelas ini</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
