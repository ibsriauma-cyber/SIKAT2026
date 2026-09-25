import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  UserCheck,
  LayoutDashboard, Home, 
  Users, 
  FileCheck, 
  Bell, 
  LogOut,
  BookOpen,
  ClipboardList,
  Calendar,
  CheckSquare,
  Edit3,
  CalendarDays,
  Book,
  Folder,
  LineChart,
  FileText,
  Sun,
  Moon,
  ShieldCheck,
  Heart,
  Shield,
  TrendingUp,
  Stethoscope,
  Map,
  Scale,
  Clipboard,
  Library,
  HeartHandshake,
  BookOpenCheck,
  Laptop,
  FileBarChart,
  Lightbulb,
  MessageSquare,
  UserPlus,
  Coins,
  Building2,
  Trash2,
  Megaphone,
  Database,
  Target,
  Activity,
  CreditCard,
  ShieldAlert
} from 'lucide-react';
import { cn } from '../../lib/utils';

export function Sidebar({ unreadNotifCount = 0 }: { unreadNotifCount?: number }) {
  const { user, logout } = useAuth();

  const getLinks = () => {
    const teachesXII = user?.subjects?.some(s => s.className.includes('XII') || s.className.includes('12')) || user?.className?.includes('XII') || user?.className?.includes('12');

    if (user?.role === 'guru') {
      const guruLinks = [
        { to: '/', icon: Home, label: 'Beranda' },
        { to: '/data-siswa', icon: Users, label: 'Data Siswa' },
        { to: '/jadwal-mengajar', icon: Calendar, label: 'Jadwal Mengajar' },
        { to: '/absensi', icon: CheckSquare, label: 'Absensi' },
        { to: '/input-nilai', icon: Edit3, label: 'Input Nilai' },
        { to: '/kalender-akademik', icon: CalendarDays, label: 'Kalender Akademik' },
        { to: '/jurnal-mengajar', icon: Book, label: 'Jurnal Mengajar' },
        { to: '/perangkat-ngajar', icon: Folder, label: 'Perangkat Ngajar' },
        { to: '/analisis-siswa', icon: LineChart, label: 'Analisis Siswa' },
        { to: '/laporan', icon: FileText, label: 'Laporan' },
        { to: '/absensi-zuhur', icon: Moon, label: 'Absensi Zuhur' },
        { to: '/leave', icon: ClipboardList, label: 'Form Perizinan' },
        { to: '/settings', icon: FileCheck, label: 'Pengaturan Guru' },
      ];
      if (teachesXII) {
        guruLinks.splice(8, 0, { to: '/lms-tugas', icon: ClipboardList, label: 'LMS & Tugas' });
        guruLinks.splice(9, 0, { to: '/cbt', icon: FileText, label: 'Ujian CBT' });
      }
      return guruLinks;
    } else if (user?.role === 'walas') {
      const walasLinks = [
        { to: '/', icon: Home, label: 'Beranda' },
        { to: '/data-siswa', icon: Users, label: 'Data Siswa' },
        { to: '/users', icon: UserCheck, label: 'Akun Pengguna' },
        { to: '/jadwal-pelajaran-kelas', icon: Calendar, label: 'Jadwal Pelajaran' },
        { to: '/absensi', icon: CheckSquare, label: 'Absensi' },
        { to: '/kalender-akademik', icon: CalendarDays, label: 'Kalender Akademik' },
        { to: '/laporan', icon: FileText, label: 'Laporan' },
        { to: '/pemantauan', icon: ShieldCheck, label: 'Pemantauan Pagi' },
        { to: '/nilai-sikap', icon: Heart, label: 'Nilai Sikap' },
        { to: '/sholat-zuhur', icon: Moon, label: 'Pantau Zuhur Siswa' },
        { to: '/absensi-zuhur', icon: Moon, label: 'Absensi Zuhur' },
        { to: '/prestasi-walas', icon: Target, label: 'Input Prestasi' },
        { to: '/bk-walas', icon: Stethoscope, label: 'Input BK' },
        { to: '/leave', icon: ClipboardList, label: 'Form Perizinan' },
        { to: '/settings', icon: FileCheck, label: 'Pengaturan Guru' },
      ];
      if (teachesXII) {
        walasLinks.splice(8, 0, { to: '/lms-tugas', icon: ClipboardList, label: 'LMS & Tugas' });
        walasLinks.splice(9, 0, { to: '/cbt', icon: FileText, label: 'Ujian CBT' });
      }
      return walasLinks;
    } else if (user?.role === 'admin') {
      return [
        { to: '/', icon: Home, label: 'Beranda' },
        { to: '/users', icon: Users, label: 'Pengguna' },
        { to: '/students', icon: BookOpen, label: 'Siswa & Kelas' },
        { to: '/admin/subjects', icon: BookOpenCheck, label: 'Mata Pelajaran' },
        { to: '/admin/plotting', icon: UserCheck, label: 'Plotting Pengajar' },
        { to: '/admin/terms', icon: Calendar, label: 'Tahun Ajaran & Semester' },
        { to: '/admin/jadwal', icon: CalendarDays, label: 'Jadwal Pelajaran' },
        { to: '/admin/reports', icon: FileBarChart, label: 'Laporan & Statistik' },
        { to: '/admin/sarpras', icon: Building2, label: 'Sarpras Inventaris' },
        { to: '/admin/announcements', icon: Megaphone, label: 'Pengumuman' },
        { to: '/kalender-akademik', icon: CalendarDays, label: 'Kalender Akademik' },
        { to: '/settings', icon: FileCheck, label: 'Konfigurasi' },
        { to: "/admin/reset", icon: Trash2, label: "Reset Data" },
        { to: '/notifications', icon: Bell, label: 'Notifikasi' },
      ];
    } else if (user?.role === 'ortu') {
      return [
        { to: '/', icon: Home, label: 'Beranda' },
        { to: '/anak', icon: Users, label: 'Data Anak' },
        { to: '/absensi-anak', icon: CheckSquare, label: 'Kehadiran' },
        { to: '/nilai-anak', icon: FileText, label: 'Laporan Nilai' },
        { to: '/sikap-anak', icon: Activity, label: 'Sikap & Kedisiplinan' },
        { to: '/pesan', icon: MessageSquare, label: 'Pesan Wali Kelas' },
      ];
    } else if (user?.role === 'bk') {
      return [
        { to: '/', icon: Home, label: 'Beranda' },
        { to: '/preventif', icon: Shield, label: 'Fungsi Preventif' },
        { to: '/pengembangan', icon: TrendingUp, label: 'Fungsi Pengembangan' },
        { to: '/kuratif', icon: Stethoscope, label: 'Fungsi Kuratif' },
        { to: '/penyaluran', icon: Map, label: 'Fungsi Penyaluran' },
        { to: '/advokasi', icon: Scale, label: 'Fungsi Advokasi' },
        { to: '/absensi-zuhur', icon: Moon, label: 'Absensi Zuhur' },
        { to: '/administrasi-bk', icon: Clipboard, label: 'Laporan Harian' },
      ];
    } else if (user?.role === 'pustaka') {
      return [
        { to: '/', icon: Home, label: 'Beranda' },
        { to: '/administrasi', icon: Clipboard, label: 'Administrasi' },
        { to: '/koleksi', icon: Library, label: 'Koleksi Buku' },
        { to: '/layanan', icon: HeartHandshake, label: 'Layanan' },
        { to: '/literasi', icon: BookOpenCheck, label: 'Literasi' },
        { to: '/digitalisasi', icon: Laptop, label: 'Digitalisasi' },
        { to: '/pelaporan', icon: FileBarChart, label: 'Pelaporan' },
        { to: '/pengembangan', icon: Lightbulb, label: 'Pengembangan' },
        { to: '/absensi-zuhur', icon: Moon, label: 'Absensi Zuhur' },
      ];
    } else if (user?.role === 'siswa') {
      const siswaLinks = [
        { to: '/', icon: Home, label: 'Beranda' },
      ];
      if (teachesXII) {
        siswaLinks.push({ to: '/lms-tugas', icon: ClipboardList, label: 'Materi & Tugas' });
      }
      siswaLinks.push(
        { to: '/cbt', icon: FileText, label: 'Ujian CBT' },
        { to: '/siswa-nilai', icon: Edit3, label: 'Nilai & Rapor' }
      );
      return siswaLinks;
    } else if (user?.role === 'wakakurikulum') {
      return [
        { to: '/', icon: Home, label: 'Beranda' },
        { to: '/kurikulum/jadwal', icon: CalendarDays, label: 'Jadwal Pelajaran' },
        { to: '/kurikulum/akademik', icon: BookOpen, label: 'Data Akademik' },
        { to: '/kurikulum/ujian', icon: FileText, label: 'Kelola Ujian' },
        { to: '/admin/subjects', icon: BookOpenCheck, label: 'Mata Pelajaran' },
        { to: '/kurikulum/plotting', icon: UserCheck, label: 'Plotting Pengajar' },
        { to: '/admin/terms', icon: Calendar, label: 'Tahun Ajaran & Semester' },
        { to: '/kamad/materi', icon: BookOpen, label: 'Pantau Materi Ajar' },
        { to: '/kamad/ibadah-siswa', icon: Heart, label: 'Pantau Ibadah Siswa' },
        { to: '/kamad/kinerja-staf', icon: Users, label: 'Kinerja Staf' },
        { to: '/kamad/perizinan', icon: CheckSquare, label: 'Pantau Perizinan' },
        { to: '/kamad/ibadah-guru', icon: Activity, label: 'Ibadah Guru' },
        { to: '/kamad/laporan-bk-pustaka', icon: FileBarChart, label: 'Laporan BK & Pustaka' },
        { to: '/absensi-zuhur', icon: Moon, label: 'Absensi Zuhur' },
      ];
    } else if (user?.role === 'wakakesiswaan') {
      return [
        { to: '/', icon: Home, label: 'Beranda' },
        { to: '/kesiswaan/data', icon: Users, label: 'Data Siswa' },
        { to: '/kesiswaan/prestasi', icon: Target, label: 'Prestasi & Pelanggaran' },
        { to: '/kesiswaan/sp', icon: ShieldAlert, label: 'Kelola SP & Poin' },
        { to: '/kesiswaan/ekskul', icon: Activity, label: 'Ekstrakurikuler' },
        { to: '/kamad/ibadah-siswa', icon: Heart, label: 'Pantau Ibadah Siswa' },
        { to: '/absensi-zuhur', icon: Moon, label: 'Absensi Zuhur' },
      ];
    } else if (user?.role === 'kamad') {
      return [
        { to: '/', icon: Home, label: 'Beranda' },
        { to: '/kamad/materi', icon: BookOpen, label: 'Pantau Materi Ajar' },
        { to: '/kamad/ibadah-siswa', icon: Heart, label: 'Pantau Ibadah Siswa' },
        { to: '/kamad/kinerja-staf', icon: Users, label: 'Kinerja Staf' },
        { to: '/kamad/perizinan', icon: CheckSquare, label: 'Approval Perizinan' },
        { to: '/kamad/ibadah-guru', icon: Activity, label: 'Ibadah Guru' },
        { to: '/kamad/laporan-bk-pustaka', icon: FileBarChart, label: 'Laporan BK & Pustaka' },
        { to: '/absensi-zuhur', icon: Moon, label: 'Absensi Zuhur' },
      ];
        } else if (user?.role === 'guru_quran') {
      const quranLinks = [
        { to: '/', icon: Home, label: 'Beranda' },
        { to: '/data-siswa', icon: Users, label: 'Data Siswa' },
        { to: '/jadwal-mengajar', icon: Calendar, label: 'Jadwal Mengajar' },
        { to: '/absensi', icon: CheckSquare, label: 'Absensi' },
        { to: '/guru-quran/dhuha', icon: Heart, label: 'Absensi Dhuha' },
        { to: '/input-nilai', icon: Edit3, label: 'Input Nilai' },
        { to: '/kalender-akademik', icon: CalendarDays, label: 'Kalender Akademik' },
        { to: '/jurnal-mengajar', icon: Book, label: 'Jurnal Mengajar' },
        { to: '/perangkat-ngajar', icon: Folder, label: 'Perangkat Ngajar' },
        { to: '/analisis-siswa', icon: LineChart, label: 'Analisis Siswa' },
        { to: '/laporan', icon: FileText, label: 'Laporan' },
        { to: '/absensi-zuhur', icon: Moon, label: 'Absensi Zuhur' },
        { to: '/leave', icon: ClipboardList, label: 'Form Perizinan' },
        { to: '/settings', icon: FileCheck, label: 'Pengaturan Guru' },
      ];
      if (teachesXII) {
        quranLinks.splice(9, 0, { to: '/lms-tugas', icon: ClipboardList, label: 'LMS & Tugas' });
        quranLinks.splice(10, 0, { to: '/cbt', icon: FileText, label: 'Ujian CBT' });
      }
      return quranLinks;
    }
    
    return [
      { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/notifications', icon: Bell, label: 'Notifikasi' },
    ];
  };

  const links = getLinks();
  // Ensure Notifikasi is in the links for all roles
  if (!links.find(link => link.to === '/notifications')) {
    links.push({ to: '/notifications', icon: Bell, label: 'Notifikasi' });
  }

  return (
    <aside className="hidden sm:flex flex-col w-64 bg-emerald-900 text-white h-screen shrink-0">
      <div className="p-6 border-b border-emerald-800/50">
        <div className="flex items-center space-x-3">
          <img src="/logo.png" alt="Logo" className="h-10 w-auto max-w-[120px] object-contain shrink-0 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
          <div className="leading-none">
            <h1 className="font-bold text-sm uppercase tracking-wider line-clamp-2">SIKAT MA AL-IHSAN<br/>IBS Riau</h1>
            <span className="text-[10px] text-emerald-400 font-medium tracking-widest mt-1 inline-block">SYSTEM v1.0</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto sidebar-scrollbar">
        <div className="px-3 py-2 text-[10px] uppercase font-bold text-emerald-500 tracking-widest">Menu Utama</div>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              cn(
                "flex items-center space-x-3 px-3 py-2 rounded-sm transition-colors relative",
                isActive 
                  ? "bg-emerald-800/50 border-r-4 border-emerald-400 text-white" 
                  : "text-emerald-200 hover:bg-emerald-800"
              )
            }
          >
            <link.icon className={cn("w-5 h-5", "opacity-80")} />
            <span className="text-sm font-medium">{link.label}</span>
            {link.to === '/notifications' && unreadNotifCount > 0 && (
              <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                {unreadNotifCount > 99 ? '99+' : unreadNotifCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

    </aside>
  );
}
