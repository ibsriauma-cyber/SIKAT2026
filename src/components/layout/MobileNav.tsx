import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Home, 
  CalendarDays,
  Bell,
  Settings,
  Users,
  CheckSquare,
  BookOpen,
  ClipboardList,
  FileText
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

export function MobileNav({ unreadNotifCount = 0 }: { unreadNotifCount?: number }) {
  const { user } = useAuth();
  
  const getRoleSpecificLink = () => {
    switch (user?.role) {
      case 'admin':
        return { to: '/users', icon: Users, label: 'Pengguna' };
      case 'guru':
      case 'guru_quran':
        return { to: '/absensi', icon: CheckSquare, label: 'Absen' };
      case 'walas':
        return { to: '/absensi', icon: CheckSquare, label: 'Absen' };
      case 'siswa':
        return { to: '/lms-tugas', icon: ClipboardList, label: 'Tugas' };
      case 'wakakurikulum':
        return { to: '/kurikulum/jadwal', icon: CalendarDays, label: 'Jadwal' };
      case 'wakakesiswaan':
        return { to: '/kesiswaan/data', icon: Users, label: 'Siswa' };
      case 'kamad':
        return { to: '/kamad/materi', icon: BookOpen, label: 'Materi' };
      case 'bk':
        return { to: '/preventif', icon: FileText, label: 'Konseling' };
      case 'pustaka':
        return { to: '/koleksi', icon: BookOpen, label: 'Katalog' };
      case 'ortu':
        return { to: '/anak', icon: FileText, label: 'Anak' };
      default:
        return { to: '/notifications', icon: Bell, label: 'Notif' };
    }
  };

  const roleLink = getRoleSpecificLink();

  const links = [
    { to: '/', icon: Home, label: 'Beranda' },
    { to: '/kalender-akademik', icon: CalendarDays, label: 'Kalender' },
    roleLink,
    { to: '/settings', icon: Settings, label: 'Setelan' },
  ];

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-safe z-50 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-around h-16 px-4">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              cn(
                "relative flex flex-col items-center justify-center w-16 h-full space-y-1 text-[10px] font-bold uppercase tracking-wider transition-all",
                isActive 
                  ? "text-emerald-600 scale-105" 
                  : "text-slate-400 hover:text-slate-600 active:scale-95"
              )
            }
          >
            <div className="relative">
              <link.icon className="w-5 h-5 mb-0.5" />
              {link.to === '/notifications' && unreadNotifCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] font-bold px-1 py-0.5 rounded-full min-w-[16px] text-center border border-white">
                  {unreadNotifCount > 99 ? '99+' : unreadNotifCount}
                </span>
              )}
            </div>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
