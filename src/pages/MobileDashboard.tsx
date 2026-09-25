import { useRealtime } from "../lib/useRealtime";
import { apiClient } from '../lib/apiClient';
import { remoteStorage } from '../lib/remoteStorage';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';
import { Users, UserCheck, Calendar, CheckSquare, Edit3, CalendarDays, Book, Folder, LineChart, FileText, Sun, Moon, ClipboardList, ShieldCheck, Heart, Shield, TrendingUp, Stethoscope, Map, Scale, Clipboard, Library, HeartHandshake, BookOpenCheck, Laptop, FileBarChart, Lightbulb, MessageSquare, BookOpen, Building2, Megaphone, FileCheck, Bell, ChevronRight, ChevronDown, Grid, X, Info, Database, Target, Activity, CreditCard, Search, Sparkles, Clock, Compass, Award, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserAvatar } from '../components/ui/UserAvatar';
export function MobileDashboard() {
  const _syncTick = useRealtime();
  const {
    user,
    switchRole,
    updateUser
  } = useAuth();
  const navigate = useNavigate();
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loadingSchedules, setLoadingSchedules] = useState(true);
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoadingSchedules(true);
        const data = await apiClient('/crud.php?table=schedules');
        if (Array.isArray(data)) {
          const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
          const today = days[new Date().getDay()];
          const mySchedules = data.filter((d: any) => String(d.teacher_id) === String(user?.id) && d.day === today);
          const mapped = mySchedules.map((d: any) => ({
            time: (d.start_time?.substring(0, 5) || '') + ' - ' + (d.end_time?.substring(0, 5) || ''),
            class: d.class_name,
            subject: d.subject_name
          }));
          mapped.sort((a, b) => a.time.localeCompare(b.time));
          setSchedules(mapped);
        }
      } catch (err) {
        console.error('Failed to fetch schedules', err);
      } finally {
        setLoadingSchedules(false);
      }
    };
    if (user?.id) fetchSchedules();
  }, [user, _syncTick]);
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const data = await apiClient('/announcements.php');
        setAnnouncements(data);
      } catch (err) {
        console.error('Failed to fetch from API', err);
        setAnnouncements([]);
      }
    };
    fetchAnnouncements();
  }, [_syncTick]);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const roleMenuRef = useRef<HTMLDivElement>(null);
  const [isTermMenuOpen, setIsTermMenuOpen] = useState(false);
  const termMenuRef = useRef<HTMLDivElement>(null);
  const [terms, setTerms] = useState<any[]>([]);
  const [selectedTermId, setSelectedTermId] = useState<string>('');
  useEffect(() => {
    async function loadTerms() {
      try {
        const data = await apiClient('/crud.php?table=academic_terms');
        const parsedTerms = data.map((t: any) => ({
          id: String(t.id),
          year: t.year,
          semester: t.semester,
          isActive: Boolean(t.is_active)
        }));
        setTerms(parsedTerms);
        const savedSelected = remoteStorage.getItem('selectedAcademicTermId');
        if (savedSelected && parsedTerms.find((t: any) => t.id === savedSelected)) {
          setSelectedTermId(savedSelected);
        } else {
          const activeTerm = parsedTerms.find((t: any) => t.isActive);
          if (activeTerm) setSelectedTermId(activeTerm.id);else if (parsedTerms.length > 0) setSelectedTermId(parsedTerms[0].id);
        }
      } catch (e) {
        console.error("Failed to load academic terms", e);
      }
    }
    loadTerms();
  }, [_syncTick]);
  const activeTerm = terms.find(t => t.id === selectedTermId);

  // Handle hardware back button for "Menu Lainnya" bottom sheet
  useEffect(() => {
    const handlePopState = () => {
      if (showMoreMenu) {
        setShowMoreMenu(false);
      }
    };
    if (showMoreMenu) {
      window.history.pushState({
        modal: 'moreMenu'
      }, '');
      window.addEventListener('popstate', handlePopState);
    }
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [showMoreMenu]);

  // Close role menu on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (roleMenuRef.current && !roleMenuRef.current.contains(event.target as Node)) {
        setIsRoleMenuOpen(false);
      }
      if (termMenuRef.current && !termMenuRef.current.contains(event.target as Node)) {
        setIsTermMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Live real-time clock for premium aesthetic
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
      }) + ' WIB');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Time-aware dynamic greetings
  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours >= 5 && hours < 11) return {
      text: 'Selamat Pagi 🌅',
      sub: 'Semoga hari Anda penuh berkah'
    };
    if (hours >= 11 && hours < 15) return {
      text: 'Selamat Siang ☀️',
      sub: 'Tetap semangat beraktivitas'
    };
    if (hours >= 15 && hours < 18) return {
      text: 'Selamat Sore 🌇',
      sub: 'Luangkan waktu untuk ibadah'
    };
    return {
      text: 'Selamat Malam 🌌',
      sub: 'Selamat beristirahat dengan damai'
    };
  };
  const greeting = getGreeting();

  // Helper to get ALL menus for each role
  const getRoleMenus = () => {
    const teachesXII = user?.subjects?.some(s => s.className.includes('XII') || s.className.includes('12')) || user?.className?.includes('XII') || user?.className?.includes('12');
    switch (user?.role) {
      case 'guru':
        const guruLinks = [{
          to: '/data-siswa',
          icon: Users,
          label: 'Data Siswa',
          color: 'text-sky-600',
          bg: 'bg-sky-50',
          desc: 'Daftar & profil siswa'
        }, {
          to: '/jadwal-mengajar',
          icon: Calendar,
          label: 'Jadwal Mengajar',
          color: 'text-indigo-600',
          bg: 'bg-indigo-50',
          desc: 'Jadwal mengajar guru'
        }, {
          to: '/absensi',
          icon: CheckSquare,
          label: 'Absensi',
          color: 'text-emerald-600',
          bg: 'bg-emerald-50',
          desc: 'Kehadiran siswa harian'
        }, {
          to: '/input-nilai',
          icon: Edit3,
          label: 'Input Nilai',
          color: 'text-amber-600',
          bg: 'bg-amber-50',
          desc: 'Input nilai ujian & tugas'
        }, {
          to: '/jurnal-mengajar',
          icon: Book,
          label: 'Jurnal Mengajar',
          color: 'text-violet-600',
          bg: 'bg-violet-50',
          desc: 'Catatan materi pelajaran'
        }, {
          to: '/perangkat-ngajar',
          icon: Folder,
          label: 'Perangkat Ngajar',
          color: 'text-blue-600',
          bg: 'bg-blue-50',
          desc: 'RPP, silabus & modul'
        }, {
          to: '/analisis-siswa',
          icon: LineChart,
          label: 'Analisis Siswa',
          color: 'text-teal-600',
          bg: 'bg-teal-50',
          desc: 'Statistik performa siswa'
        }, {
          to: '/laporan',
          icon: FileText,
          label: 'Laporan',
          color: 'text-rose-600',
          bg: 'bg-rose-50',
          desc: 'Laporan capaian belajar'
        }, {
          to: '/absensi-zuhur',
          icon: Moon,
          label: 'Absensi Zuhur',
          color: 'text-slate-600',
          bg: 'bg-slate-50',
          desc: 'Presensi jamaah zuhur'
        }, {
          to: '/leave',
          icon: ClipboardList,
          label: 'Form Perizinan',
          color: 'text-purple-600',
          bg: 'bg-purple-50',
          desc: 'Pengajuan izin staf'
        }, {
          to: '/settings',
          icon: FileCheck,
          label: 'Pengaturan Guru',
          color: 'text-emerald-600',
          bg: 'bg-emerald-50',
          desc: 'Profil & keamanan'
        }];
        if (teachesXII) {
          guruLinks.splice(7, 0, {
            to: '/lms-tugas',
            icon: ClipboardList,
            label: 'LMS & Tugas',
            color: 'text-cyan-600',
            bg: 'bg-cyan-50',
            desc: 'Tugas online siswa'
          });
          guruLinks.splice(8, 0, {
            to: '/cbt',
            icon: FileText,
            label: 'Ujian CBT',
            color: 'text-fuchsia-600',
            bg: 'bg-fuchsia-50',
            desc: 'Ujian berbasis komputer'
          });
        }
        return guruLinks;
      case 'walas':
        const walasLinks = [{
          to: '/data-siswa',
          icon: Users,
          label: 'Data Siswa',
          color: 'text-sky-600',
          bg: 'bg-sky-50',
          desc: 'Daftar & profil siswa'
        }, {
          to: '/users',
          icon: UserCheck,
          label: 'Akun Pengguna',
          color: 'text-blue-600',
          bg: 'bg-blue-50',
          desc: 'Kelola akun sekolah'
        }, {
          to: '/jadwal-pelajaran-kelas',
          icon: Calendar,
          label: 'Jadwal Pelajaran',
          color: 'text-indigo-600',
          bg: 'bg-indigo-50',
          desc: 'Jadwal pelajaran kelas'
        }, {
          to: '/absensi',
          icon: CheckSquare,
          label: 'Absensi',
          color: 'text-emerald-600',
          bg: 'bg-emerald-50',
          desc: 'Kehadiran siswa harian'
        }, {
          to: '/laporan',
          icon: FileText,
          label: 'Laporan',
          color: 'text-purple-600',
          bg: 'bg-purple-50',
          desc: 'Cetak Laporan Akademik'
        }, {
          to: '/pemantauan',
          icon: ShieldCheck,
          label: 'Pemantauan Pagi',
          color: 'text-red-600',
          bg: 'bg-red-50',
          desc: 'Kontrol ketertiban pagi'
        }, {
          to: '/nilai-sikap',
          icon: Heart,
          label: 'Nilai Sikap',
          color: 'text-pink-600',
          bg: 'bg-pink-50',
          desc: 'Penilaian akhlak siswa'
        }, {
          to: '/sholat-zuhur',
          icon: Moon,
          label: 'Pantau Zuhur Siswa',
          color: 'text-slate-600',
          bg: 'bg-slate-50',
          desc: 'Absensi sholat zuhur'
        }, {
          to: '/absensi-zuhur',
          icon: Moon,
          label: 'Absensi Zuhur',
          color: 'text-emerald-600',
          bg: 'bg-emerald-50',
          desc: 'Monitor kehadiran zuhur'
        }, {
          to: '/prestasi-walas',
          icon: Target,
          label: 'Input Prestasi',
          color: 'text-amber-600',
          bg: 'bg-amber-50',
          desc: 'Penghargaan & prestasi'
        }, {
          to: '/bk-walas',
          icon: Stethoscope,
          label: 'Input BK',
          color: 'text-cyan-600',
          bg: 'bg-cyan-50',
          desc: 'Konseling bimbingan siswa'
        }, {
          to: '/leave',
          icon: ClipboardList,
          label: 'Form Perizinan',
          color: 'text-purple-600',
          bg: 'bg-purple-50',
          desc: 'Pengajuan izin walas'
        }, {
          to: '/settings',
          icon: FileCheck,
          label: 'Pengaturan Guru',
          color: 'text-emerald-600',
          bg: 'bg-emerald-50',
          desc: 'Keamanan akun'
        }];
        if (teachesXII) {
          walasLinks.splice(9, 0, {
            to: '/lms-tugas',
            icon: ClipboardList,
            label: 'LMS & Tugas',
            color: 'text-cyan-600',
            bg: 'bg-cyan-50',
            desc: 'Tugas kelas binaan'
          });
          walasLinks.splice(10, 0, {
            to: '/cbt',
            icon: FileText,
            label: 'Ujian CBT',
            color: 'text-fuchsia-600',
            bg: 'bg-fuchsia-50',
            desc: 'Kelola ujian CBT kelas'
          });
        }
        return walasLinks;
      case 'admin':
        return [{
          to: '/users',
          icon: Users,
          label: 'Pengguna',
          color: 'text-blue-600',
          bg: 'bg-blue-50',
          desc: 'Kelola akun sekolah'
        }, {
          to: '/students',
          icon: BookOpen,
          label: 'Siswa & Kelas',
          color: 'text-emerald-600',
          bg: 'bg-emerald-50',
          desc: 'Data induk kesiswaan'
        }, {
          to: '/admin/subjects',
          icon: BookOpenCheck,
          label: 'Mata Pelajaran',
          color: 'text-pink-600',
          bg: 'bg-pink-50',
          desc: 'Daftar kurikulum pelajaran'
        }, {
          to: '/admin/plotting',
          icon: UserCheck,
          label: 'Plotting Pengajar',
          color: 'text-teal-600',
          bg: 'bg-teal-50',
          desc: 'Tugas mengajar guru'
        }, {
          to: '/admin/jadwal',
          icon: CalendarDays,
          label: 'Jadwal Pelajaran',
          color: 'text-amber-600',
          bg: 'bg-amber-50',
          desc: 'Atur jadwal kelas'
        }, {
          to: '/admin/terms',
          icon: Calendar,
          label: 'Tahun Ajaran',
          color: 'text-amber-600',
          bg: 'bg-amber-50',
          desc: 'Semester & kalender aktif'
        }, {
          to: '/admin/reports',
          icon: FileBarChart,
          label: 'Laporan & Stat',
          color: 'text-purple-600',
          bg: 'bg-purple-50',
          desc: 'Analisis statistik madrasah'
        }, {
          to: '/admin/sarpras',
          icon: Building2,
          label: 'Sarpras',
          color: 'text-rose-600',
          bg: 'bg-rose-50',
          desc: 'Aset dan sarana prasarana'
        }, {
          to: '/admin/announcements',
          icon: Megaphone,
          label: 'Pengumuman',
          color: 'text-sky-600',
          bg: 'bg-sky-50',
          desc: 'Siaran kabar madrasah'
        }];
      case 'ortu':
        return [{
          to: '/anak',
          icon: Users,
          label: 'Data Anak',
          color: 'text-blue-600',
          bg: 'bg-blue-50',
          desc: 'Profil akademik anak'
        }, {
          to: '/absensi-anak',
          icon: CheckSquare,
          label: 'Kehadiran',
          color: 'text-emerald-600',
          bg: 'bg-emerald-50',
          desc: 'Presensi harian siswa'
        }, {
          to: '/nilai-anak',
          icon: FileText,
          label: 'Laporan Nilai',
          color: 'text-purple-600',
          bg: 'bg-purple-50',
          desc: 'Hasil ulangan & raport'
        }, {
          to: '/sikap-anak',
          icon: Activity,
          label: 'Sikap & Disiplin',
          color: 'text-amber-600',
          bg: 'bg-amber-50',
          desc: 'Poin & SP dari sekolah'
        }, {
          to: '/pesan',
          icon: MessageSquare,
          label: 'Pesan Walas',
          color: 'text-indigo-600',
          bg: 'bg-indigo-50',
          desc: 'Konsultasi guru wali'
        }];
      case 'bk':
        return [{
          to: '/preventif',
          icon: Shield,
          label: 'Preventif',
          color: 'text-blue-600',
          bg: 'bg-blue-50',
          desc: 'Bimbingan pencegahan kasus'
        }, {
          to: '/pengembangan',
          icon: TrendingUp,
          label: 'Pengembangan',
          color: 'text-emerald-600',
          bg: 'bg-emerald-50',
          desc: 'Bimbingan potensi karir'
        }, {
          to: '/kuratif',
          icon: Stethoscope,
          label: 'Kuratif',
          color: 'text-amber-600',
          bg: 'bg-amber-50',
          desc: 'Penyelesaian masalah siswa'
        }, {
          to: '/penyaluran',
          icon: Map,
          label: 'Penyaluran',
          color: 'text-purple-600',
          bg: 'bg-purple-50',
          desc: 'Studi lanjut siswa'
        }, {
          to: '/advokasi',
          icon: Scale,
          label: 'Advokasi',
          color: 'text-red-600',
          bg: 'bg-red-50',
          desc: 'Pendampingan hak siswa'
        }, {
          to: '/administrasi-bk',
          icon: ClipboardList,
          label: 'Laporan Harian',
          color: 'text-indigo-600',
          bg: 'bg-indigo-50',
          desc: 'Aktivitas Harian BK'
        }, {
          to: '/absensi-zuhur',
          icon: Moon,
          label: 'Absensi Zuhur',
          color: 'text-emerald-600',
          bg: 'bg-emerald-50',
          desc: 'Monitor jamaah zuhur'
        }];
      case 'pustaka':
        return [{
          to: '/administrasi',
          icon: Clipboard,
          label: 'Administrasi',
          color: 'text-blue-600',
          bg: 'bg-blue-50',
          desc: 'Sirkulasi buku perpus'
        }, {
          to: '/koleksi',
          icon: Library,
          label: 'Koleksi Buku',
          color: 'text-emerald-600',
          bg: 'bg-emerald-50',
          desc: 'Katalog buku perpustakaan'
        }, {
          to: '/layanan',
          icon: HeartHandshake,
          label: 'Layanan',
          color: 'text-pink-600',
          bg: 'bg-pink-50',
          desc: 'Layanan pinjam & baca'
        }, {
          to: '/literasi',
          icon: BookOpenCheck,
          label: 'Literasi',
          color: 'text-amber-600',
          bg: 'bg-amber-50',
          desc: 'Program minat baca'
        }, {
          to: '/digitalisasi',
          icon: Laptop,
          label: 'Digitalisasi',
          color: 'text-purple-600',
          bg: 'bg-purple-50',
          desc: 'E-Library & koleksi digital'
        }, {
          to: '/pelaporan',
          icon: FileBarChart,
          label: 'Pelaporan',
          color: 'text-rose-600',
          bg: 'bg-rose-50',
          desc: 'Laporan bulanan pustaka'
        }, {
          to: '/pengembangan',
          icon: Lightbulb,
          label: 'Pengembangan',
          color: 'text-cyan-600',
          bg: 'bg-cyan-50',
          desc: 'Inovasi ruang perpus'
        }, {
          to: '/absensi-zuhur',
          icon: Moon,
          label: 'Absensi Zuhur',
          color: 'text-emerald-600',
          bg: 'bg-emerald-50',
          desc: 'Kehadiran sholat zuhur'
        }];
      case 'siswa':
        const siswaLinks = [];
        if (teachesXII) {
          siswaLinks.push({
            to: '/lms-tugas',
            icon: ClipboardList,
            label: 'Materi & Tugas',
            color: 'text-cyan-600',
            bg: 'bg-cyan-50',
            desc: 'Materi ajar & latihan'
          });
        }
        siswaLinks.push({
          to: '/cbt',
          icon: FileText,
          label: 'Ujian CBT',
          color: 'text-fuchsia-600',
          bg: 'bg-fuchsia-50',
          desc: 'Masuk ruang ujian'
        }, {
          to: '/siswa-nilai',
          icon: Edit3,
          label: 'Nilai & Rapor',
          color: 'text-amber-600',
          bg: 'bg-amber-50',
          desc: 'Laporan raport berkala'
        }, {
          to: '/siswa/hafalan',
          icon: Book,
          label: 'Hafalan & Tahfizku',
          color: 'text-emerald-600',
          bg: 'bg-emerald-50',
          desc: 'Progres setoran hafalan'
        });
        return siswaLinks;
      case 'wakakurikulum':
        return [{
          to: '/kurikulum/jadwal',
          icon: CalendarDays,
          label: 'Jadwal Pelajaran',
          color: 'text-emerald-600',
          bg: 'bg-emerald-50',
          desc: 'Atur jadwal kelas'
        }, {
          to: '/kurikulum/akademik',
          icon: BookOpen,
          label: 'Data Akademik',
          color: 'text-blue-600',
          bg: 'bg-blue-50',
          desc: 'Progres kurikulum nasional'
        }, {
          to: '/kurikulum/ujian',
          icon: FileText,
          label: 'Kelola Ujian',
          color: 'text-amber-600',
          bg: 'bg-amber-50',
          desc: 'Setting bank soal CBT'
        }, {
          to: '/admin/subjects',
          icon: BookOpenCheck,
          label: 'Mata Pelajaran',
          color: 'text-indigo-600',
          bg: 'bg-indigo-50',
          desc: 'Atur daftar mapel'
        }, {
          to: '/admin/plotting',
          icon: UserCheck,
          label: 'Plotting Pengajar',
          color: 'text-teal-600',
          bg: 'bg-teal-50',
          desc: 'Pembagian jam mengajar'
        }, {
          to: '/admin/terms',
          icon: Calendar,
          label: 'Tahun Ajaran & Semester',
          color: 'text-rose-600',
          bg: 'bg-rose-50',
          desc: 'Ganti semester aktif'
        }, {
          to: '/kamad/materi',
          icon: BookOpen,
          label: 'Materi Ajar',
          color: 'text-blue-600',
          bg: 'bg-blue-50',
          desc: 'Pantau modul guru'
        }, {
          to: '/kamad/ibadah-siswa',
          icon: Heart,
          label: 'Ibadah Siswa',
          color: 'text-rose-600',
          bg: 'bg-rose-50',
          desc: 'Peringkat ibadah harian'
        }, {
          to: '/kamad/kinerja-staf',
          icon: Users,
          label: 'Kinerja Staf',
          color: 'text-indigo-600',
          bg: 'bg-indigo-50',
          desc: 'Statistik kehadiran guru'
        }, {
          to: '/kamad/perizinan',
          icon: CheckSquare,
          label: 'Izin Staf',
          color: 'text-emerald-600',
          bg: 'bg-emerald-50',
          desc: 'Verifikasi absen & izin'
        }, {
          to: '/kamad/ibadah-guru',
          icon: Activity,
          label: 'Ibadah Guru',
          color: 'text-amber-600',
          bg: 'bg-amber-50',
          desc: 'Presensi jamaah guru'
        }, {
          to: '/kamad/laporan-bk-pustaka',
          icon: FileBarChart,
          label: 'Lap BK & Pustaka',
          color: 'text-purple-600',
          bg: 'bg-purple-50',
          desc: 'Progres BK & Kunjungan'
        }, {
          to: '/absensi-zuhur',
          icon: Moon,
          label: 'Absensi Zuhur',
          color: 'text-emerald-600',
          bg: 'bg-emerald-50',
          desc: 'Kehadiran sholat zuhur'
        }];
      case 'wakakesiswaan':
        return [{
          to: '/kesiswaan/data',
          icon: Users,
          label: 'Data Siswa',
          color: 'text-indigo-600',
          bg: 'bg-indigo-50',
          desc: 'Data induk kesiswaan'
        }, {
          to: '/kesiswaan/prestasi',
          icon: Target,
          label: 'Prestasi & Pelanggaran',
          color: 'text-rose-600',
          bg: 'bg-rose-50',
          desc: 'Catatan kedisiplinan'
        }, {
          to: '/kesiswaan/sp',
          icon: ShieldAlert,
          label: 'Kelola SP & Poin',
          color: 'text-red-600',
          bg: 'bg-red-50',
          desc: 'Penerbitan Surat Peringatan'
        }, {
          to: '/kesiswaan/ekskul',
          icon: Activity,
          label: 'Ekstrakurikuler',
          color: 'text-emerald-600',
          bg: 'bg-emerald-50',
          desc: 'Kelompok bakat minat'
        }, {
          to: '/kamad/ibadah-siswa',
          icon: Heart,
          label: 'Ibadah Siswa',
          color: 'text-rose-600',
          bg: 'bg-rose-50',
          desc: 'Peringkat ketaatan sholat'
        }, {
          to: '/absensi-zuhur',
          icon: Moon,
          label: 'Absensi Zuhur',
          color: 'text-emerald-600',
          bg: 'bg-emerald-50',
          desc: 'Kehadiran sholat zuhur'
        }];
      case 'kamad':
        return [{
          to: '/kamad/materi',
          icon: BookOpen,
          label: 'Materi Ajar',
          color: 'text-blue-600',
          bg: 'bg-blue-50',
          desc: 'Pantau materi & silabus'
        }, {
          to: '/kamad/ibadah-siswa',
          icon: Heart,
          label: 'Ibadah Siswa',
          color: 'text-rose-600',
          bg: 'bg-rose-50',
          desc: 'Analisis ketaatan ibadah'
        }, {
          to: '/kamad/kinerja-staf',
          icon: Users,
          label: 'Kinerja Staf',
          color: 'text-indigo-600',
          bg: 'bg-indigo-50',
          desc: 'Kedisiplinan harian guru'
        }, {
          to: '/kamad/perizinan',
          icon: CheckSquare,
          label: 'Izin Staf',
          color: 'text-emerald-600',
          bg: 'bg-emerald-50',
          desc: 'Konfirmasi cuti madrasah'
        }, {
          to: '/kamad/ibadah-guru',
          icon: Activity,
          label: 'Ibadah Guru',
          color: 'text-amber-600',
          bg: 'bg-amber-50',
          desc: 'Evaluasi jamaah guru'
        }, {
          to: '/kamad/laporan-bk-pustaka',
          icon: FileBarChart,
          label: 'Lap BK & Pustaka',
          color: 'text-purple-600',
          bg: 'bg-purple-50',
          desc: 'Sirkulasi perpus & BK'
        }, {
          to: '/absensi-zuhur',
          icon: Moon,
          label: 'Absensi Zuhur',
          color: 'text-emerald-600',
          bg: 'bg-emerald-50',
          desc: 'Absensi sholat zuhur'
        }];
      case 'guru_quran':
        const quranLinks = [{
          to: '/data-siswa',
          icon: Users,
          label: 'Data Siswa',
          color: 'text-sky-600',
          bg: 'bg-sky-50',
          desc: 'Daftar & profil siswa'
        }, {
          to: '/jadwal-mengajar',
          icon: Calendar,
          label: 'Jadwal Mengajar',
          color: 'text-indigo-600',
          bg: 'bg-indigo-50',
          desc: 'Jadwal mengajar guru'
        }, {
          to: '/absensi',
          icon: CheckSquare,
          label: 'Absensi',
          color: 'text-emerald-600',
          bg: 'bg-emerald-50',
          desc: 'Kehadiran siswa harian'
        }, {
          to: '/guru-quran/dhuha',
          icon: Heart,
          label: 'Absensi Dhuha',
          color: 'text-emerald-600',
          bg: 'bg-emerald-50',
          desc: 'Input sholat dhuha siswa'
        }, {
          to: '/input-nilai',
          icon: Edit3,
          label: 'Input Nilai',
          color: 'text-amber-600',
          bg: 'bg-amber-50',
          desc: 'Input nilai ujian & tugas'
        }, {
          to: '/jurnal-mengajar',
          icon: Book,
          label: 'Jurnal Mengajar',
          color: 'text-violet-600',
          bg: 'bg-violet-50',
          desc: 'Catatan materi pelajaran'
        }, {
          to: '/perangkat-ngajar',
          icon: Folder,
          label: 'Perangkat Ngajar',
          color: 'text-blue-600',
          bg: 'bg-blue-50',
          desc: 'RPP, silabus & modul'
        }, {
          to: '/analisis-siswa',
          icon: LineChart,
          label: 'Analisis Siswa',
          color: 'text-teal-600',
          bg: 'bg-teal-50',
          desc: 'Statistik performa siswa'
        }, {
          to: '/laporan',
          icon: FileText,
          label: 'Laporan',
          color: 'text-rose-600',
          bg: 'bg-rose-50',
          desc: 'Laporan capaian belajar'
        }, {
          to: '/absensi-zuhur',
          icon: Moon,
          label: 'Absensi Zuhur',
          color: 'text-slate-600',
          bg: 'bg-slate-50',
          desc: 'Presensi jamaah zuhur'
        }, {
          to: '/leave',
          icon: ClipboardList,
          label: 'Form Perizinan',
          color: 'text-purple-600',
          bg: 'bg-purple-50',
          desc: 'Pengajuan izin staf'
        }, {
          to: '/settings',
          icon: FileCheck,
          label: 'Pengaturan Guru',
          color: 'text-emerald-600',
          bg: 'bg-emerald-50',
          desc: 'Profil & keamanan'
        }];
        if (teachesXII) {
          quranLinks.splice(8, 0, {
            to: '/lms-tugas',
            icon: ClipboardList,
            label: 'LMS & Tugas',
            color: 'text-cyan-600',
            bg: 'bg-cyan-50',
            desc: 'Tugas online siswa'
          });
          quranLinks.splice(9, 0, {
            to: '/cbt',
            icon: FileText,
            label: 'Ujian CBT',
            color: 'text-fuchsia-600',
            bg: 'bg-fuchsia-50',
            desc: 'Ujian berbasis komputer'
          });
        }
        return quranLinks;
      default:
        return [];
    }
  };
  const getRoleSpecificLinkTo = () => {
    switch (user?.role) {
      case 'admin':
        return '/users';
      case 'guru':
      case 'guru_quran':
        return '/absensi';
      case 'walas':
        return '/absensi';
      case 'siswa':
        return '/lms-tugas';
      case 'wakakurikulum':
        return '/kurikulum/jadwal';
      case 'wakakesiswaan':
        return '/kesiswaan/data';
      case 'kamad':
        return '/kamad/materi';
      case 'bk':
        return '/preventif';
      case 'pustaka':
        return '/koleksi';
      case 'ortu':
        return '/anak';
      default:
        return '/notifications';
    }
  };
  const allMenusRaw = getRoleMenus();
  const bottomNavPaths = ['/', '/kalender-akademik', '/settings', getRoleSpecificLinkTo()];
  const allMenus = allMenusRaw.filter(item => !bottomNavPaths.includes(item.to));

  // Bottom menu usually contains: Beranda, Kalender, Notifikasi, Setelan.
  // Thus we put the first 7 items in the grid, and 8th is "Menu Lainnya"
  const gridItems = allMenus.slice(0, 7);
  const remainingItems = allMenus.slice(7);

  // Filter remaining items based on search query in full menu bottom sheet
  const filteredRemaining = remainingItems.filter(item => item.label.toLowerCase().includes(searchQuery.toLowerCase()) || item.desc.toLowerCase().includes(searchQuery.toLowerCase()));
  return <div className="-mt-4 -mx-4 min-h-screen bg-slate-50 pb-24 md:hidden">
      
      {/* 1. PREMIUM AMBIENT GLOW BACKDROP */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-emerald-800/15 via-emerald-500/5 to-transparent pointer-events-none -z-10" />

      {/* 2. TOP FLOATING APP HEADER */}
      <div className="relative mb-4">
        <div className="flex items-center justify-between bg-gradient-to-r from-emerald-800 to-emerald-600 px-5 pt-5 pb-5 sm:px-6 rounded-b-3xl border-b border-emerald-700 shadow-sm gap-3 relative">
          <div className="flex items-center gap-3 min-w-0">
            <motion.div whileTap={{
            scale: 0.9
          }} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center overflow-hidden shrink-0 relative" onClick={() => document.getElementById('mobile-avatar-upload')?.click()}>
              <UserAvatar src={user?.avatar} name={user?.name} className="w-full h-full" />
            </motion.div>
            <input type="file" id="mobile-avatar-upload" accept="image/*" className="hidden" onChange={e => {
            const file = e.target.files?.[0];
            if (file && updateUser) {
              const reader = new FileReader();
              reader.onloadend = () => {
                if (typeof reader.result === 'string') {
                  updateUser({
                    avatar: reader.result
                  });
                }
              };
              reader.readAsDataURL(file);
            }
          }} />
            <div className="min-w-0">
              <p className="text-[9px] sm:text-[10px] text-emerald-200/90 font-bold uppercase tracking-wider leading-none">
                {currentTime || '--:-- WIB'}
              </p>
              <h2 className="text-xs sm:text-sm font-black text-white leading-snug mt-0.5 truncate tracking-wide">{user?.name}</h2>
              
              {/* SEMESTER DROPDOWN (Replacing static text) */}
              <div className="mt-1.5 flex items-center">
                {activeTerm && <div className="relative inline-block" ref={termMenuRef}>
                    <button onClick={() => setIsTermMenuOpen(!isTermMenuOpen)} className="flex items-center gap-1.5 transition-all cursor-pointer select-none active:scale-95 group">
                      <div className="flex items-center gap-1.5">
                        <span className="inline-block whitespace-nowrap px-1.5 py-0.5 bg-white text-emerald-800 text-[8px] rounded-sm font-black uppercase tracking-widest shadow-sm group-hover:bg-emerald-50">
                          {activeTerm.semester}
                        </span>
                        <span className="text-[9px] text-emerald-100/90 font-bold uppercase tracking-widest whitespace-nowrap group-hover:text-white">
                          TA {activeTerm.year}
                        </span>
                      </div>
                      <ChevronDown className={`w-3 h-3 shrink-0 text-emerald-100/90 group-hover:text-white transition-transform duration-200 ${isTermMenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {isTermMenuOpen && terms.length > 0 && <motion.div initial={{
                    opacity: 0,
                    y: -4,
                    scale: 0.95
                  }} animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1
                  }} exit={{
                    opacity: 0,
                    y: -4,
                    scale: 0.95
                  }} transition={{
                    duration: 0.15,
                    ease: "easeOut"
                  }} className="absolute left-0 mt-1.5 w-44 bg-white border border-slate-200/80 rounded-xl shadow-lg py-1 z-[80] origin-top-left overflow-hidden">
                          {terms.map(term => {
                      const isSelected = term.id === selectedTermId;
                      return <button key={term.id} onClick={() => {
                        setSelectedTermId(term.id);
                        remoteStorage.setItem('selectedAcademicTermId', term.id);
                        setIsTermMenuOpen(false);
                        window.location.reload();
                      }} className={`w-full text-left px-3 py-2 text-[10px] font-bold transition-colors flex items-center justify-between ${isSelected ? 'bg-emerald-50 text-emerald-700 font-extrabold' : 'text-slate-600 hover:bg-slate-50'}`}>
                                <span>SMT {term.semester} {term.year}</span>
                                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                              </button>;
                    })}
                        </motion.div>}
                    </AnimatePresence>
                  </div>}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end shrink-0 pl-1 gap-1">
            {/* ROLE BADGE & SWITCHER */}
            {user?.roles && user.roles.length > 1 ? <div className="relative inline-block mt-1" ref={roleMenuRef}>
                <button onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)} className="flex items-center justify-between gap-1 bg-emerald-600/50 hover:bg-emerald-600/70 border border-white/20 text-[9px] sm:text-[10px] text-white font-black capitalize py-1 px-2.5 rounded-lg transition-all shadow-sm cursor-pointer select-none active:scale-95 min-w-[90px]">
                  <span className="truncate">
                    {user.role === 'walas' ? 'Wali Kelas' : user.role === 'pustaka' ? 'Pustakawan' : user.role === 'ortu' ? 'Orang Tua' : user.role.replace('_', ' ')}
                  </span>
                  <ChevronDown className={`w-3 h-3 shrink-0 text-white transition-transform duration-200 ${isRoleMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isRoleMenuOpen && <motion.div initial={{
                opacity: 0,
                y: -4,
                scale: 0.95
              }} animate={{
                opacity: 1,
                y: 0,
                scale: 1
              }} exit={{
                opacity: 0,
                y: -4,
                scale: 0.95
              }} transition={{
                duration: 0.15,
                ease: "easeOut"
              }} className="absolute right-0 mt-1.5 w-40 bg-white border border-slate-200/80 rounded-xl shadow-lg py-1 z-[80] origin-top-right overflow-hidden">
                      {(Array.isArray(user.roles) ? user.roles : [user.role]).map(r => {
                  const isActive = user.role === r;
                  const label = r === 'walas' ? 'Wali Kelas' : r === 'pustaka' ? 'Pustakawan' : r === 'ortu' ? 'Orang Tua' : r.replace('_', ' ');
                  return <button key={r} onClick={() => {
                    switchRole(r as Role);
                    setIsRoleMenuOpen(false);
                    navigate('/');
                  }} className={`w-full text-left px-3.5 py-2 text-[10px] font-bold capitalize transition-colors flex items-center justify-between ${isActive ? 'bg-emerald-50 text-emerald-700 font-extrabold' : 'text-slate-600 hover:bg-slate-50'}`}>
                            <span>{label}</span>
                            {isActive && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                          </button>;
                })}
                    </motion.div>}
                </AnimatePresence>
              </div> : <div className="flex items-center gap-1.5 mt-1 bg-emerald-600/50 px-2.5 py-1 rounded-lg border border-white/20 shadow-sm">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-100"></span>
                </span>
                <span className="text-[9px] font-bold text-white capitalize truncate max-w-[80px]">
                  {user?.role === 'walas' ? 'Wali Kelas' : user?.role === 'pustaka' ? 'Pustakawan' : user?.role === 'ortu' ? 'Orang Tua' : user?.role?.replace('_', ' ')}
                </span>
              </div>}
          </div>
        </div>
      </div>

      <div className="px-4 space-y-4 relative">

        {/* JADWAL NGAJAR KHUSUS GURU/WALAS/GURU QUR'AN */}
        {(user?.role === 'guru' || user?.role === 'guru_quran' || user?.role === 'walas') && <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-50 pb-2">
              <div className="flex items-center gap-1.5">
                <span className="w-1 h-3.5 bg-emerald-500 rounded-full"></span>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-800">
                  Jadwal Ngajar
                </h3>
              </div>
              <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[8px] font-black rounded-full uppercase tracking-wider">
                {new Date().toLocaleDateString('id-ID', {
              weekday: 'long'
            })}
              </span>
            </div>

            <div className="space-y-2">
              
              {loadingSchedules ? <div className="flex flex-col items-center justify-center py-6 px-4 bg-slate-50 border border-slate-100 border-dashed rounded-xl text-center">
                  <p className="text-[10px] font-bold text-slate-500">Memuat jadwal...</p>
                </div> : schedules.length > 0 ? schedules.map((schedule, i) => <div key={i} className="flex justify-between items-center p-3 rounded-lg border border-slate-100 shadow-sm">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-800">{schedule.time}</span>
                    <span className="text-[10px] text-slate-500">{schedule.class}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-semibold text-emerald-700">{schedule.subject}</span>
                  </div>
                </div>) : <div className="flex flex-col items-center justify-center py-6 px-4 bg-slate-50 border border-slate-100 border-dashed rounded-xl text-center">
                  <Calendar className="w-6 h-6 text-slate-300 mb-2" />
                  <p className="text-[10px] font-bold text-slate-500">Tidak ada jadwal</p>
                  <p className="text-[9px] font-medium text-slate-400 mt-0.5">Hari ini tidak ada jadwal mengajar</p>
                </div>}

            </div>
          </div>}

        {/* 5. INTERACTIVE 3x3 QUICK ACTION PANEL */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-50 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-4 bg-emerald-500 rounded-full"></span>
              <h3 className="text-[10.5px] font-black uppercase tracking-widest text-slate-800">
                Akses Pintar Madrasah
              </h3>
            </div>
            <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[8.5px] font-black rounded-full uppercase tracking-wider">
              FITUR UTAMA
            </span>
          </div>

          <div className="grid grid-cols-4 gap-y-6 gap-x-2">
            {gridItems.map((item, index) => <motion.button whileTap={{
            scale: 0.9
          }} key={index} onClick={() => navigate(item.to)} className="flex flex-col items-center justify-start gap-1.5 transition-all group">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ${item.bg} flex items-center justify-center border border-slate-100/75 shadow-sm text-slate-600 transition-all group-active:brightness-95`}>
                  <item.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${item.color}`} />
                </div>
                <span className="text-[9px] sm:text-[10px] font-extrabold text-slate-700 text-center leading-tight line-clamp-2 max-w-[70px]">
                  {item.label}
                </span>
              </motion.button>)}
            {/* 8th SLOT: SMART LAINNYA WIDGET */}
            {remainingItems.length > 0 && <motion.button whileTap={{
            scale: 0.9
          }} onClick={() => {
            setSearchQuery('');
            setShowMoreMenu(true);
          }} className="flex flex-col items-center justify-start gap-1.5 transition-all group">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-100 flex items-center justify-center border border-slate-200/50 shadow-sm text-slate-600 group-active:bg-slate-200">
                  <Grid className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600 animate-pulse" />
                </div>
                <span className="text-[9px] sm:text-[10px] font-extrabold text-slate-700 text-center leading-tight">
                  Menu<br />Lainnya
                </span>
              </motion.button>}
          </div>
        </div>

        {/* 6. NEWS & RECENT ACTIVITIES */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 bg-indigo-500 rounded-full"></span>
            <h3 className="text-[10.5px] font-black uppercase tracking-widest text-slate-800">
              Agenda & Info Penting
            </h3>
          </div>

          <div className="space-y-3">
            {announcements.length > 0 ? announcements.slice(0, 3).map(ann => <div key={ann.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex gap-3 items-start">
                  <div className={`p-2 rounded-lg shrink-0 ${ann.category === 'Penting' ? 'bg-red-100 text-red-700' : ann.category === 'Maintenance' ? 'bg-orange-100 text-orange-700' : ann.category === 'Kegiatan' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {ann.category === 'Maintenance' ? <Laptop className="w-4 h-4" /> : <CalendarDays className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 text-[8px] font-black rounded uppercase tracking-wider ${ann.category === 'Penting' ? 'bg-red-100/80 text-red-800' : ann.category === 'Maintenance' ? 'bg-orange-100/80 text-orange-800' : ann.category === 'Kegiatan' ? 'bg-indigo-100/80 text-indigo-800' : 'bg-emerald-100/80 text-emerald-800'}`}>
                        {ann.category}
                      </span>
                      <span className="text-[8px] text-slate-400 font-bold">{ann.date}</span>
                    </div>
                    <p className="text-xs font-extrabold text-slate-800 mt-1 truncate">
                      {ann.title}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-medium truncate">
                      {ann.content}
                    </p>
                  </div>
                </div>) : <div className="p-4 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                Belum ada info terbaru
              </div>}
          </div>
        </div>

      </div>

      {/* 7. PREMIUM PULL-UP DRAWER SHEET */}
      <AnimatePresence>
        {showMoreMenu && <>
            {/* Smooth Backdrop overlay */}
            <motion.div initial={{
          opacity: 0
        }} animate={{
          opacity: 0.6
        }} exit={{
          opacity: 0
        }} onClick={() => setShowMoreMenu(false)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]" />

            {/* Bottom Sheet Drawer */}
            <motion.div initial={{
          y: '100%'
        }} animate={{
          y: 0
        }} exit={{
          y: '100%'
        }} transition={{
          type: 'spring',
          damping: 30,
          stiffness: 300
        }} className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[32px] shadow-[0_-8px_32px_rgba(0,0,0,0.12)] z-[100] p-6 flex flex-col max-h-[85vh]">
              {/* Premium Drag Indicator Handle */}
              <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-4 shrink-0" />

              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
                <div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                    Modul Tambahan
                  </h3>
                  <p className="text-[10.5px] text-slate-400 mt-0.5 font-medium">
                    Akses cepat ke menu lainnya yang tersedia
                  </p>
                </div>
                <motion.button whileTap={{
              scale: 0.9
            }} onClick={() => setShowMoreMenu(false)} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors">
                  <X className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Drawer Search Filter */}
              <div className="mt-4 p-2 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2 shrink-0">
                <Search className="w-4 h-4 text-slate-400 ml-1" />
                <input type="text" placeholder="Cari modul madrasah..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full text-xs bg-transparent border-none outline-none focus:ring-0 text-slate-700 placeholder-slate-400 font-bold" />
                {searchQuery && <button onClick={() => setSearchQuery('')} className="p-1 rounded-full hover:bg-slate-200">
                    <X className="w-3 h-3 text-slate-400" />
                  </button>}
              </div>

              {/* Drawer Menu Grid / Items Container */}
              <div className="mt-4 overflow-y-auto flex-1 scrollbar-hide pb-8">
                {filteredRemaining.length > 0 ? <div className="grid grid-cols-1 gap-3 py-1">
                    {filteredRemaining.map((item, index) => <motion.button whileTap={{
                scale: 0.98
              }} key={index} onClick={() => {
                setShowMoreMenu(false);
                navigate(item.to);
              }} className="flex items-center gap-4 p-3 bg-slate-50 hover:bg-emerald-50/50 rounded-2xl border border-slate-100 transition-all text-left">
                        <div className={`w-11 h-11 rounded-xl ${item.bg} flex items-center justify-center border border-slate-100 shrink-0`}>
                          <item.icon className={`w-5 h-5 ${item.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-black text-slate-800 leading-snug">{item.label}</p>
                          <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">{item.desc}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                      </motion.button>)}
                  </div> : <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400">
                    <div className="w-12 h-12 rounded-full bg-slate-50 border-2 border-slate-100 flex items-center justify-center mb-2">
                      <ShieldAlert className="w-6 h-6 text-slate-300" />
                    </div>
                    <p className="text-xs font-bold text-slate-500">Modul tidak ditemukan</p>
                    <p className="text-[10px] text-slate-400 mt-1">Coba gunakan kata kunci pencarian lainnya.</p>
                  </div>}
              </div>
            </motion.div>
          </>}
      </AnimatePresence>
    </div>;
}