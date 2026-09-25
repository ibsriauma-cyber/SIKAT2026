import { useRealtime } from "../lib/useRealtime";
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import { Info, AlertTriangle, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../lib/apiClient';
export function Notifications() {
  const _syncTick = useRealtime();
  const {
    user
  } = useAuth();
  const navigate = useNavigate();
  const handleNotificationClick = async (notif: any) => {
    if (!notif.is_read) {
      await markAsRead(notif.id);
    }
    const lowerTitle = (notif.title || '').toLowerCase();
    const lowerMsg = (notif.message || '').toLowerCase();
    const role = user?.roles?.[0] || user?.role || '';
    if (notif.link) {
      navigate(notif.link);
      return;
    }
    if (lowerTitle.includes('reset password') || lowerMsg.includes('reset password')) {
      navigate('/users');
    } else if (lowerTitle.includes('izin') || lowerTitle.includes('perizinan')) {
      if (['admin', 'kamad', 'wakatu'].includes(role)) {
        navigate('/kamad/perizinan');
      } else {
        navigate('/leave');
      }
    } else if (lowerTitle.includes('pengumuman')) {
      if (role === 'admin') navigate('/admin/announcements');else navigate('/');
    } else if (lowerTitle.includes('jadwal')) {
      if (['admin', 'wakakur'].includes(role)) navigate('/admin/jadwal');else navigate('/jadwal-mengajar');
    } else if (lowerTitle.includes('tugas') || lowerTitle.includes('materi')) {
      navigate('/lms-tugas');
    } else if (lowerTitle.includes('absen') || lowerTitle.includes('hadir')) {
      navigate('/absensi');
    } else if (lowerTitle.includes('nilai')) {
      navigate('/input-nilai');
    } else if (lowerTitle.includes('pelanggaran') || lowerTitle.includes('kasus')) {
      if (role === 'admin' || role === 'kesiswaan') navigate('/kesiswaan/prestasi');else navigate('/kuratif');
    } else {
      // Default action: just stay on notifications
    }
  };
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (user?.id) {
      apiClient(`/notifications.php?user_id=${user.id}`).then(data => {
        if (Array.isArray(data)) {
          setNotifications(data);
        }
      }).catch(err => console.error(err)).finally(() => setLoading(false));
    }
  }, [user?.id, _syncTick]);
  const markAsRead = async (id: number) => {
    try {
      await apiClient(`/notifications_read.php?id=${id}`, {
        method: 'POST'
      });
      setNotifications(prev => prev.map(n => n.id === id ? {
        ...n,
        is_read: 1
      } : n));
    } catch (e) {}
  };
  const getIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      default:
        return <Info className="w-4 h-4 text-blue-600" />;
    }
  };
  const getBg = (type: string) => {
    switch (type) {
      case 'warning':
        return 'bg-amber-50';
      case 'success':
        return 'bg-emerald-50';
      default:
        return 'bg-blue-50';
    }
  };
  const unreadCount = notifications.filter(n => !n.is_read).length;
  return <div className="max-w-2xl mx-auto space-y-6 pb-24 sm:pb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight text-slate-800">Notifikasi</h1>
        <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-bold uppercase tracking-widest">{unreadCount} Baru</span>
      </div>

      <Card>
        <CardContent className="p-0 divide-y divide-slate-100">
          {loading ? <div className="p-8 text-center text-slate-500">Memuat notifikasi...</div> : notifications.length === 0 ? <div className="p-8 text-center text-slate-500">Tidak ada notifikasi</div> : notifications.map(notif => <div key={notif.id} onClick={() => handleNotificationClick(notif)} className={`p-4 sm:p-5 flex gap-4 transition-colors hover:bg-slate-50 cursor-pointer ${!notif.is_read ? 'bg-emerald-50/30' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${getBg(notif.type)}`}>
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <h4 className={`font-bold text-sm text-slate-800 truncate ${!notif.is_read ? 'text-emerald-800' : ''}`}>{notif.title}</h4>
                    <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap shrink-0 uppercase tracking-wider">
                      {format(new Date(notif.created_at || new Date()), 'dd MMM, HH:mm', {
                  locale: id
                })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2">{notif.message}</p>
                </div>
              </div>)}
        </CardContent>
      </Card>
    </div>;
}