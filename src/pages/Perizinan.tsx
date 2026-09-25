
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { Calendar, Clock, CheckCircle, XCircle, Clock4, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { CustomSelect } from '../components/ui/CustomSelect';
import { requestNotificationPermission, sendLocalNotification } from '../lib/notification';
import { apiClient } from '../lib/apiClient';
import { motion, AnimatePresence } from 'motion/react';

export function Perizinan() {
  
  const { user } = useAuth();
  
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [type, setType] = useState<'sakit' | 'izin_pribadi' | 'dinas_luar'>('sakit');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchRequests = () => {
  
    setLoading(true);
    apiClient('/crud.php?table=leave_requests')
      .then(data => {
        if (Array.isArray(data)) {
          const myRequests = data.filter(r => String(r.user_id) === String(user?.id));
          myRequests.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          setRequests(myRequests);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    requestNotificationPermission();
    if (user?.id) fetchRequests();
  }, [user]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700"><CheckCircle className="w-3 h-3" /> Setuju</span>;
      case 'rejected':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-700"><XCircle className="w-3 h-3" /> Ditolak</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700"><Clock4 className="w-3 h-3" /> Tunggu</span>;
    }
  };

  const handleEdit = (req: any) => {
    setEditingId(req.id);
    setType(req.type);
    setStartDate(req.start_date);
    setEndDate(req.end_date);
    setReason(req.reason);
  };

  const handleDeleteClick = (id: string) => {
    setDeletingId(id);
  };

  const confirmDelete = () => {
  
    if (!deletingId) return;
    apiClient(`/crud.php?table=leave_requests&id=${deletingId}`, { method: 'DELETE' })
      .then(() => {
         setRequests(requests.filter(r => String(r.id) !== String(deletingId)));
         setDeletingId(null);
      })
      .catch(console.error);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason) {
      alert("Mohon lengkapi semua field");
      return;
    }
    
    const payload = {
      user_id: user?.id,
      type,
      start_date: startDate,
      end_date: endDate,
      reason,
      status: 'pending'
    };

    if (editingId) {
      apiClient(`/crud.php?table=leave_requests&id=${editingId}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      })
      .then(() => {
        fetchRequests();
        setEditingId(null);
      })
      .catch(console.error);
    } else {
      apiClient('/crud.php?table=leave_requests', {
        method: 'POST',
        body: JSON.stringify(payload)
      })
      .then(() => {
        fetchRequests();
        
        // Simulate Push Notification to Kepala Sekolah
        const typeLabel = type.replace('_', ' ');
        sendLocalNotification('Pengajuan Izin Baru (SIM Madrasah)', {
          body: `${user?.name || 'Guru'} mengajukan izin ${typeLabel} pada ${format(new Date(startDate), 'dd MMM', { locale: id })}.\nAlasan: ${reason}`,
          requireInteraction: true,
        });
      })
      .catch(console.error);
    }
    
    setType('sakit');
    setStartDate('');
    setEndDate('');
    setReason('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">Perizinan Staf</h1>
          <p className="text-slate-500 mt-1 text-sm">Ajukan izin dan pantau status.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="md:col-span-3">
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="w-1 h-4 bg-emerald-500 rounded"></span>
              <CardTitle>{editingId ? 'Edit Pengajuan' : 'Form Pengajuan Izin'}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Jenis Izin</label>
                <CustomSelect
                  value={type}
                  onChange={(val) => setType(val as any)}
                  options={[
                    { value: 'sakit', label: 'Sakit' },
                    { value: 'izin_pribadi', label: 'Keperluan Pribadi' },
                    { value: 'dinas_luar', label: 'Dinas Luar' },
                  ]}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Mulai</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-slate-50" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Sampai</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-slate-50" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Alasan / Keterangan</label>
                <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none bg-slate-50" placeholder="Ketik keterangan rinci..."></textarea>
              </div>

              <div className="flex gap-3 mt-2">
                <Button type="submit" className="flex-1">{editingId ? 'SIMPAN PERUBAHAN' : 'KIRIM PENGAJUAN'}</Button>
                {editingId && (
                  <Button type="button" variant="outline" onClick={() => { setEditingId(null); setType('sakit'); setStartDate(''); setEndDate(''); setReason(''); }} className="flex-1">BATAL EDIT</Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="md:col-span-2 space-y-4">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Riwayat Izin Saya</h3>
          {loading ? (
             <div className="text-center py-10"><p className="text-sm text-slate-500">Memuat...</p></div>
          ) : requests.length > 0 ? (
            requests.map(req => (
              <Card key={req.id} className="border border-slate-200 bg-white shadow-none">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-sm font-bold text-slate-800 capitalize block mb-1">Izin {req.type?.replace('_', ' ')}</span>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1 font-medium uppercase tracking-wider">
                        <Clock className="w-3 h-3" /> 
                        {format(new Date(req.start_date || new Date()), 'dd MMM', { locale: id })} - {format(new Date(req.end_date || new Date()), 'dd MMM', { locale: id })}
                      </span>
                    </div>
                    {getStatusBadge(req.status)}
                  </div>
                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-100 mt-3">
                    "{req.reason}"
                  </p>
                  <div className="flex justify-end gap-3 mt-3 border-t border-slate-100 pt-3">
                    {req.status === 'pending' && (
                        <button onClick={() => handleEdit(req)} className="text-emerald-600 hover:text-emerald-700" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                    )}
                    <button onClick={() => handleDeleteClick(req.id)} className="text-red-600 hover:text-red-700" title="Batalkan/Hapus">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-10 bg-white border border-slate-200 rounded-xl">
              <p className="text-slate-400 text-xs font-medium">Belum ada riwayat perizinan.</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeletingId(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 z-10"
            >
              <div className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4 text-red-600">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-2">Batalkan Pengajuan?</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Apakah Anda yakin ingin membatalkan dan menghapus pengajuan izin ini? Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>
              <div className="flex border-t border-slate-100 bg-slate-50 p-3 gap-3">
                <button
                  type="button"
                  onClick={() => setDeletingId(null)}
                  className="flex-1 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 bg-white cursor-pointer"
                >
                  BATAL
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm cursor-pointer"
                >
                  YA, BATALKAN
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
