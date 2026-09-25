import { useRealtime } from "../lib/useRealtime";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { BookOpen, Heart, Users, CheckSquare, Activity, FileBarChart, Eye, ChevronDown, FileText, Calendar, Download, CheckCircle2, Clock, XCircle, AlertTriangle, Check, X, ShieldAlert, AlertCircle, ExternalLink, Link2, Search, Plus, Trash2, Edit2, FileSpreadsheet, ArrowRight, GraduationCap, ClipboardList, Shield, Briefcase, Award, TrendingUp, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../lib/apiClient';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../components/ui/Button';
import { CustomSelect } from '../components/ui/CustomSelect';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { DEFAULT_MODUL_AJAR, ModulAjarItem } from './GuruPages';
import { useNavigate } from 'react-router-dom';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
export function DashboardKamad() {
  const _syncTick = useRealtime();
  const {
    user
  } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalTeachers: 45,
    totalStudents: 382,
    totalClasses: 12,
    pendingLeaves: 2,
    completedMateri: 28
  });
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [recentMateri, setRecentMateri] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const todayDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const chartData = [{
    day: 'Senin',
    dhuha: 84,
    zuhur: 91
  }, {
    day: 'Selasa',
    dhuha: 86,
    zuhur: 93
  }, {
    day: 'Rabu',
    dhuha: 85,
    zuhur: 92
  }, {
    day: 'Kamis',
    dhuha: 88,
    zuhur: 94
  }, {
    day: 'Jumat',
    dhuha: 92,
    zuhur: 96
  }];
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch all data
        const [usersList, studentsList, classesList, leavesList, materiRes] = await Promise.all([apiClient('/crud.php?table=users').catch(() => []), apiClient('/crud.php?table=students').catch(() => []), apiClient('/crud.php?table=classes').catch(() => []), apiClient('/crud.php?table=leave_requests').catch(() => []), apiClient('/get_materi.php').catch(() => ({
          status: 'success',
          data: []
        }))]);
        const teachers = usersList.filter((u: any) => {
          const r = u.roles ? typeof u.roles === 'string' ? JSON.parse(u.roles) : u.roles : [u.role];
          return r.includes('guru') || r.includes('walas') || r.includes('guru_quran') || r.includes('tendik');
        });

        // Filter and map pending leave requests
        const pLeaves = leavesList.filter((l: any) => l.status === 'pending');
        const mappedLeaves = pLeaves.map((l: any) => {
          const matchingUser = usersList.find((u: any) => u.id === l.user_id);
          return {
            ...l,
            userName: matchingUser ? matchingUser.name : `Staf ID ${l.user_id}`,
            role: matchingUser ? matchingUser.role : 'Staf'
          };
        });

        // Recent teaching modules
        const materiData = materiRes?.status === 'success' ? materiRes.data : [];
        setStats({
          totalTeachers: teachers.length || 45,
          totalStudents: studentsList.length || 382,
          totalClasses: classesList.length || 12,
          pendingLeaves: mappedLeaves.length,
          completedMateri: materiData.filter((m: any) => m.status === 'Terbit' || m.status === 'Sudah Membuat').length || 28
        });
        setPendingRequests(mappedLeaves);

        // Take 5 most recent materi
        const mappedMateri = materiData.slice(0, 5).map((m: any) => ({
          id: m.id,
          teacherName: m.name,
          subject: m.subject,
          className: m.class,
          title: m.title,
          date: m.date,
          file_name: m.file_name
        }));
        setRecentMateri(mappedMateri);
      } catch (err) {
        console.error("Error loading Kamad dashboard statistics:", err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, [_syncTick]);
  const handleUpdateLeaveStatus = async (id: number, status: 'approved' | 'rejected') => {
    try {
      await apiClient(`/crud.php?table=leave_requests&id=${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          status
        })
      });
      setPendingRequests(prev => prev.filter(r => r.id !== id));
      setStats(prev => ({
        ...prev,
        pendingLeaves: Math.max(0, prev.pendingLeaves - 1)
      }));
      showToast(`Berhasil ${status === 'approved' ? 'menyetujui' : 'menolak'} pengajuan izin.`);
    } catch (err: any) {
      console.error("Failed to update leave request status:", err);
      showToast("Gagal memperbarui status izin: " + err.message);
    }
  };
  const quickLinks = [{
    label: 'Pantau Modul Ajar',
    desc: 'Periksa kesiapan rencana pembelajaran guru',
    path: '/kamad/materi',
    icon: BookOpen,
    color: 'text-blue-600 bg-blue-50 border-blue-100 hover:bg-blue-100/50'
  }, {
    label: 'Pantau Ibadah Siswa',
    desc: 'Pantau dhuha, zuhur, dan kebiasaan baik siswa',
    path: '/kamad/ibadah-siswa',
    icon: Heart,
    color: 'text-rose-600 bg-rose-50 border-rose-100 hover:bg-rose-100/50'
  }, {
    label: 'Kinerja Staf',
    desc: 'Monitoring penyelesaian jobdesk ustadz/ustadzah',
    path: '/kamad/kinerja-staf',
    icon: Users,
    color: 'text-emerald-600 bg-emerald-50 border-emerald-100 hover:bg-emerald-100/50'
  }, {
    label: 'Approval Perizinan',
    desc: 'Persetujuan dispensasi & izin tidak hadir staf',
    path: '/kamad/perizinan',
    icon: CheckSquare,
    color: 'text-amber-600 bg-amber-50 border-amber-100 hover:bg-amber-100/50'
  }, {
    label: 'Ibadah Guru',
    desc: 'Monitoring ibadah harian ustadz & ustadzah',
    path: '/kamad/ibadah-guru',
    icon: Activity,
    color: 'text-indigo-600 bg-indigo-50 border-indigo-100 hover:bg-indigo-100/50'
  }, {
    label: 'Laporan BK & Pustaka',
    desc: 'Periksa laporan perkembangan harian BK & Pustakawan',
    path: '/kamad/laporan-bk-pustaka',
    icon: FileBarChart,
    color: 'text-purple-600 bg-purple-50 border-purple-100 hover:bg-purple-100/50'
  }];
  return <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>}

      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-800 to-teal-900 rounded-2xl p-6 md:p-8 text-white shadow-md">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-12 translate-y-12">
          <GraduationCap className="w-80 h-80 text-white" />
        </div>
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-xs rounded-full text-xs font-semibold text-emerald-300">
            <Calendar className="w-3.5 h-3.5" />
            <span>{todayDate}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight leading-tight">
            Selamat Datang, {user?.name || 'Kepala Madrasah'}
          </h1>
          <p className="text-emerald-100/95 text-xs md:text-sm font-medium leading-relaxed max-w-2xl">
            Sistem Informasi Aktivitas Terintegrasi (SIKAT) MA Al-Ihsan Boarding School Riau. Pantau aktivitas belajar mengajar, kedisiplinan guru, and perkembangan ibadah siswa dalam satu platform digital terpadu.
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white border-slate-100 shadow-xs hover:border-emerald-200 transition-all">
          <CardContent className="p-5">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0 border border-emerald-100">
                <Users className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">Ustadz & Staf</p>
                <p className="text-xl md:text-2xl font-black text-slate-800 mt-0.5">{stats.totalTeachers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-100 shadow-xs hover:border-blue-200 transition-all">
          <CardContent className="p-5">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0 border border-blue-100">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">Siswa Aktif</p>
                <p className="text-xl md:text-2xl font-black text-slate-800 mt-0.5">{stats.totalStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-100 shadow-xs hover:border-purple-200 transition-all">
          <CardContent className="p-5">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center shrink-0 border border-purple-100">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">Kelas & Rombel</p>
                <p className="text-xl md:text-2xl font-black text-slate-800 mt-0.5">{stats.totalClasses}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-100 shadow-xs hover:border-amber-200 transition-all">
          <CardContent className="p-5">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0 border border-amber-100">
                <CheckSquare className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">Menunggu Approval</p>
                <div className="flex items-baseline gap-1.5">
                  <p className="text-xl md:text-2xl font-black text-slate-800 mt-0.5">{stats.pendingLeaves}</p>
                  {stats.pendingLeaves > 0 && <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded font-black uppercase">Pending</span>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Inbox Approval & Chart */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section: Inbox Approval Perizinan */}
          <Card className="border border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="py-4 px-5 bg-slate-50/75 border-b border-slate-100 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-4 bg-amber-500 rounded-xs" />
                <CardTitle className="text-xs font-black uppercase tracking-wider text-slate-700 m-0">
                  Inbox Persetujuan Izin Staf ({pendingRequests.length})
                </CardTitle>
              </div>
              <button onClick={() => navigate('/kamad/perizinan')} className="text-xs font-bold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1">
                Semua Izin <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </CardHeader>
            <CardContent className="p-5">
              {loading ? <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                </div> : pendingRequests.length === 0 ? <div className="text-center py-10">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400 mb-2.5 border border-slate-200/50">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-black text-slate-700">Kotak Masuk Bersih</h4>
                  <p className="text-xs text-slate-400 mt-1">Tidak ada perizinan staf yang perlu keputusan saat ini.</p>
                </div> : <div className="space-y-4">
                  {pendingRequests.map(req => <div key={req.id} className="p-4 bg-white border border-slate-100 hover:border-slate-200 rounded-xl transition-all shadow-2xs space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-800 text-sm leading-snug">{req.userName}</span>
                            <span className="text-[9px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200/50">
                              {req.role}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200/50 uppercase tracking-tight">
                              Izin {req.type.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium">
                            Periode: <span className="font-bold text-slate-700">{req.start_date}</span> s/d <span className="font-bold text-slate-700">{req.end_date}</span>
                          </p>
                        </div>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/30">
                          <Clock className="w-3 h-3" /> Menunggu ACC
                        </span>
                      </div>
                      
                      <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-200/40 text-xs text-slate-600 font-medium italic">
                        "{req.reason}"
                      </div>

                      <div className="flex items-center justify-end gap-2.5 pt-1">
                        <button onClick={() => handleUpdateLeaveStatus(req.id, 'rejected')} className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold rounded-lg transition-all">
                          Tolak
                        </button>
                        <button onClick={() => handleUpdateLeaveStatus(req.id, 'approved')} className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1 shadow-2xs">
                          <Check className="w-3.5 h-3.5" /> Setujui Izin
                        </button>
                      </div>
                    </div>)}
                </div>}
            </CardContent>
          </Card>

          {/* Section: Chart Statistik Ibadah Siswa */}
          <Card className="border border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="py-4 px-5 bg-slate-50/75 border-b border-slate-100 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-4 bg-emerald-600 rounded-xs" />
                <CardTitle className="text-xs font-black uppercase tracking-wider text-slate-700 m-0">
                  Tren Tingkat Kehadiran Ibadah Siswa (Pekan Ini)
                </CardTitle>
              </div>
              <button onClick={() => navigate('/kamad/ibadah-siswa')} className="text-xs font-bold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1">
                Selengkapnya <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </CardHeader>
            <CardContent className="p-5">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{
                  top: 10,
                  right: 10,
                  left: -20,
                  bottom: 0
                }}>
                    <defs>
                      <linearGradient id="colorDhuha" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorZuhur" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{
                    fontSize: 11,
                    fill: '#64748b',
                    fontWeight: 'bold'
                  }} />
                    <YAxis domain={[70, 100]} tickLine={false} axisLine={false} tick={{
                    fontSize: 11,
                    fill: '#64748b',
                    fontWeight: 'bold'
                  }} />
                    <Tooltip contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '11px',
                    fontWeight: 'bold'
                  }} itemStyle={{
                    color: '#fff'
                  }} />
                    <Legend iconType="circle" wrapperStyle={{
                    fontSize: '11px',
                    fontWeight: 'bold',
                    paddingTop: '10px'
                  }} />
                    <Area type="monotone" name="Sholat Dhuha %" dataKey="dhuha" stroke="#0ea5e9" strokeWidth={2.5} fillOpacity={1} fill="url(#colorDhuha)" />
                    <Area type="monotone" name="Sholat Zuhur %" dataKey="zuhur" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorZuhur)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Right 1 Column: Quick Actions & Recent Materials */}
        <div className="space-y-6">
          
          {/* Section: Akses Cepat Portal */}
          <Card className="border border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="py-4 px-5 bg-slate-50/75 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-4 bg-emerald-600 rounded-xs" />
                <CardTitle className="text-xs font-black uppercase tracking-wider text-slate-700 m-0">
                  Portal Akses Cepat Kamad
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 gap-2">
                {quickLinks.map((link, idx) => {
                const LinkIcon = link.icon;
                return <button key={idx} onClick={() => navigate(link.path)} className={`w-full flex items-center justify-between p-3 border rounded-xl transition-all duration-150 group text-left cursor-pointer ${link.color}`}>
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 bg-white rounded-lg border border-slate-200/50 shadow-2xs group-hover:scale-105 transition-transform shrink-0">
                          <LinkIcon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 leading-none">{link.label}</p>
                          <p className="text-[10px] text-slate-500 font-medium truncate mt-1">{link.desc}</p>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform shrink-0" />
                    </button>;
              })}
              </div>
            </CardContent>
          </Card>

          {/* Section: Perangkat & Modul Ajar Terkini */}
          <Card className="border border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="py-4 px-5 bg-slate-50/75 border-b border-slate-100 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-4 bg-emerald-600 rounded-xs" />
                <CardTitle className="text-xs font-black uppercase tracking-wider text-slate-700 m-0">
                  Upload Modul Ajar Terkini
                </CardTitle>
              </div>
              <button onClick={() => navigate('/kamad/materi')} className="text-xs font-bold text-emerald-600 hover:text-emerald-700">
                Semua
              </button>
            </CardHeader>
            <CardContent className="p-4">
              {recentMateri.length === 0 ? <div className="text-center py-6 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  Belum ada modul diunggah
                </div> : <div className="divide-y divide-slate-100">
                  {recentMateri.map(mat => <div key={mat.id} className="py-3 first:pt-0 last:pb-0 space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 line-clamp-1">{mat.title}</p>
                          <p className="text-[10px] text-slate-500 font-bold mt-0.5">
                            {mat.teacherName} • <span className="text-slate-600">{mat.subject}</span>
                          </p>
                        </div>
                        <span className="text-[9px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200/50 shrink-0">
                          {mat.className}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2 pt-0.5">
                        <span className="text-[10px] text-slate-400 font-medium">
                          Diunggah: {mat.date}
                        </span>
                        {mat.file_name && <a href={mat.file_name} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-0.5">
                            Buka Drive <ExternalLink className="w-2.5 h-2.5" />
                          </a>}
                      </div>
                    </div>)}
                </div>}
            </CardContent>
          </Card>

        </div>

      </div>

    </div>;
}
export function KamadMateriAjar() {
  const [materiList, setMateriList] = useState<ModulAjarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchMateri = async () => {
    try {
      setLoading(true);
      const res = await apiClient('/get_materi.php');
      if (res.status === 'success') {
        const mapped = res.data.map((m: any) => ({
          id: m.id,
          teacherName: m.name,
          role: m.subject.toLowerCase().includes('quran') || m.subject.toLowerCase().includes('tahfizh') ? 'Guru Al-Qur\'an' : 'Guru Mapel',
          category: m.subject.toLowerCase().includes('quran') || m.subject.toLowerCase().includes('tahfizh') ? 'guru_quran' : 'guru_mapel',
          subject: m.subject,
          className: m.class,
          title: m.title,
          date: m.date,
          status: m.status === 'Terbit' || m.status === 'Sudah Membuat' ? 'Sudah Membuat' : 'Belum Membuat',
          driveUrl: m.file_name,
          description: m.description,
          objectives: m.objectives || []
        }));
        setMateriList(mapped);
      }
    } catch (e) {
      console.error('Failed to load materi', e);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchMateri();
  }, []);
  const [selectedMateri, setSelectedMateri] = useState<ModulAjarItem | null>(null);
  const [activeCategory, setActiveCategory] = useState<'all' | 'guru_mapel' | 'wali_kelas' | 'guru_quran'>('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [materiReportPeriod, setMateriReportPeriod] = useState('Mingguan');
  const [materiStartDate, setMateriStartDate] = useState('');
  const [materiEndDate, setMateriEndDate] = useState('');
  const filterOptions = [{
    value: 'all',
    label: 'Semua Kategori'
  }, {
    value: 'guru_mapel',
    label: 'Guru Mapel'
  }, {
    value: 'guru_quran',
    label: 'Guru Qur\'an'
  }];
  const activeLabel = filterOptions.find(o => o.value === activeCategory)?.label || 'Semua Kategori';
  const filteredList = materiList.filter(item => {
    if (activeCategory !== 'all' && item.category !== activeCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return item.title.toLowerCase().includes(q) || item.subject.toLowerCase().includes(q) || item.className.toLowerCase().includes(q) || item.teacherName.toLowerCase().includes(q);
    }
    return true;
  });
  const downloadMateriPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Laporan Pantau Materi Ajar - ${materiReportPeriod === 'Mingguan' && materiStartDate && materiEndDate ? `Mingguan (${materiStartDate} s/d ${materiEndDate})` : materiReportPeriod}`, 14, 20);
    doc.setFontSize(10);
    doc.text(`Dicetak pada: ${new Date().toLocaleDateString('id-ID')}`, 14, 28);
    const tableData = filteredList.map(materi => {
      return [materi.title, materi.subject, materi.teacherName, materi.className, materi.status];
    });
    autoTable(doc, {
      startY: 35,
      head: [['Judul Materi', 'Mata Pelajaran', 'Guru', 'Kelas', 'Status']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [59, 130, 246]
      }
    });
    doc.save(`Laporan_Materi_Ajar_${materiReportPeriod.replace(/ /g, '_')}.pdf`);
  };
  const downloadMateriExcel = () => {
    const data = filteredList.map(materi => {
      return {
        'Judul Materi': materi.title,
        'Mata Pelajaran': materi.subject,
        'Guru': materi.teacherName,
        'Role': materi.role,
        'Kelas': materi.className,
        'Link Drive': materi.driveUrl,
        'Status': materi.status
      };
    });
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Materi Ajar");
    XLSX.writeFile(workbook, `Laporan_Materi_Ajar_${materiReportPeriod.replace(/ /g, '_')}.xlsx`);
  };
  const totalMateri = materiList.length;
  const terbitCount = materiList.filter(item => item.status === 'Sudah Membuat').length;
  const reviewCount = materiList.filter(item => item.status === 'Belum Membuat').length;
  const handleUpdateStatus = (id: string, newStatus: 'Sudah Membuat' | 'Belum Membuat') => {
    const updated = materiList.map(item => {
      if (item.id === id) {
        return {
          ...item,
          status: newStatus
        };
      }
      return item;
    });
    setMateriList(updated);
    if (selectedMateri && selectedMateri.id === id) {
      setSelectedMateri({
        ...selectedMateri,
        status: newStatus
      });
    }
  };
  return <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-800">Pantau Modul Ajar Harian</h1>
          <p className="text-slate-500 text-xs sm:text-sm font-medium">Pantau kelengkapan dokumen persiapan Modul Ajar.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {materiReportPeriod === 'Mingguan' && <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-2 py-1.5 shadow-sm">
              <input type="date" value={materiStartDate} onChange={e => setMateriStartDate(e.target.value)} className="text-xs sm:text-sm font-bold text-slate-700 outline-none bg-transparent w-[110px] sm:w-auto" />
              <span className="text-slate-400 font-bold text-xs">-</span>
              <input type="date" value={materiEndDate} onChange={e => setMateriEndDate(e.target.value)} className="text-xs sm:text-sm font-bold text-slate-700 outline-none bg-transparent w-[110px] sm:w-auto" />
            </div>}
          <select value={materiReportPeriod} onChange={e => setMateriReportPeriod(e.target.value)} className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500">
            <option value="Mingguan">Mingguan</option>
            <option value="Bulanan">Bulanan</option>
            <option value="Per Semester">Per Semester</option>
            <option value="Tahunan">Tahunan</option>
          </select>
          <button onClick={downloadMateriPDF} className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3 py-2 rounded-xl text-sm font-bold transition-colors">
            <FileText className="w-4 h-4" /> PDF
          </button>
          <button onClick={downloadMateriExcel} className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 px-3 py-2 rounded-xl text-sm font-bold transition-colors">
            <FileSpreadsheet className="w-4 h-4" /> Excel
          </button>
        </div>
      </div>

      {/* Mini Bento Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-100/60 border border-slate-200/50 p-3 rounded-xl text-center">
          <p className="text-[9px] sm:text-[10px] uppercase tracking-wider font-black text-slate-500">Materi Total</p>
          <p className="text-lg sm:text-xl font-black text-slate-800 mt-0.5">{totalMateri}</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl text-center">
          <p className="text-[9px] sm:text-[10px] uppercase tracking-wider font-black text-emerald-600">Sudah Membuat</p>
          <p className="text-lg sm:text-xl font-black text-emerald-800 mt-0.5">{terbitCount}</p>
        </div>
        <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl text-center">
          <p className="text-[9px] sm:text-[10px] uppercase tracking-wider font-black text-amber-600">Belum Membuat</p>
          <p className="text-lg sm:text-xl font-black text-amber-800 mt-0.5">{reviewCount}</p>
        </div>
      </div>

      
      <Card className="overflow-hidden border-slate-200/60 shadow-sm">
        <CardHeader className="py-3 px-4 sm:px-6 bg-slate-50/50 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <CardTitle className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-700 m-0">Daftar Modul Ajar Terkini</CardTitle>
          
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <div className="relative w-full sm:w-48">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Cari guru/mapel..." className="w-full pl-8 pr-2 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-white" />
            </div>

            {/* Dropdown Filter */}
            <div className="relative shrink-0">
              <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none hover:bg-slate-50 active:scale-95 transition-all shadow-sm shrink-0">
                <span>{activeLabel}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDropdownOpen && <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                  <div className="absolute right-0 mt-1 w-40 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 origin-top-right">
                    {filterOptions.map(option => <button key={option.value} onClick={() => {
                  setActiveCategory(option.value as any);
                  setIsDropdownOpen(false);
                }} className={`w-full text-left px-3 py-2 text-[10px] sm:text-xs font-bold transition-colors ${activeCategory === option.value ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                        {option.label}
                      </button>)}
                  </div>
                </>}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-5">
          <div className="space-y-3">
            {filteredList.length === 0 ? <div className="text-center py-8 text-slate-400 font-bold text-xs uppercase tracking-wider">
                Tidak ada modul ajar untuk kategori ini
              </div> : filteredList.map(item => <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-white border border-slate-100 hover:border-slate-200 hover:shadow-xs rounded-xl transition-all gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-xl shrink-0 ${item.category === 'wali_kelas' ? 'bg-amber-50 text-amber-600 border border-amber-100' : item.category === 'guru_quran' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-bold text-slate-800 text-sm leading-snug">{item.teacherName}</h4>
                        <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${item.category === 'wali_kelas' ? 'bg-amber-50 text-amber-700 border-amber-200' : item.category === 'guru_quran' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                          {item.role}
                        </span>
                        <span className="text-[9px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200/50">
                          {item.className}
                        </span>
                      </div>

                      <p className="text-xs font-bold text-slate-700 leading-snug">
                        {item.subject}: <span className="font-medium text-slate-600">{item.title}</span>
                      </p>

                      <div className="flex items-center gap-3 pt-0.5">
                        <div className="flex items-center gap-1 text-[11px] text-slate-400">
                          <Calendar className="w-3 h-3" />
                          <span>{item.date}</span>
                        </div>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.status === 'Sudah Membuat' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'Sudah Membuat' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          {item.status === 'Sudah Membuat' ? 'Sudah Membuat' : 'Belum Membuat'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a href={item.driveUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-lg border border-blue-200 flex items-center gap-1.5 transition-all cursor-pointer">
                      <ExternalLink className="w-3.5 h-3.5" /> Buka Drive
                    </a>

                    <Button onClick={() => setSelectedMateri(item)} variant="outline" size="sm" className="h-8 text-xs font-bold gap-1.5 border-slate-200 hover:bg-slate-50 hover:text-slate-800 active:scale-95 transition-all">
                      <Eye className="w-3.5 h-3.5" /> Detail Modul
                    </Button>
                  </div>
                </div>)}
          </div>
        </CardContent>
      </Card>

      {/* Detail Materi Modal */}
      {selectedMateri && <div className="fixed inset-0 z-[100] flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/60 backdrop-blur-xs pb-20 sm:pb-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col border border-slate-100 animate-in fade-in zoom-in duration-200 my-auto">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-800">Detail Modul Ajar Guru</h2>
                <p className="text-xs font-bold text-emerald-600 mt-0.5">{selectedMateri.teacherName} • {selectedMateri.role}</p>
              </div>
              <button onClick={() => setSelectedMateri(null)} className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all font-bold">✕</button>
            </div>
            
            <div className="p-4 space-y-4 max-h-[420px] overflow-y-auto text-xs">
              {/* Subject & Class Card info */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Mata Pelajaran & Kelas</span>
                  <span className="text-xs font-black text-slate-800 bg-white border border-slate-200 px-2 py-0.5 rounded-lg">{selectedMateri.className}</span>
                </div>
                <p className="text-sm font-black text-slate-800">{selectedMateri.subject}</p>
                <p className="text-xs font-bold text-emerald-600">{selectedMateri.title}</p>
              </div>

              {/* Drive Link Box */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <Link2 className="w-5 h-5 text-blue-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-bold text-blue-900">Tautan Google Drive Modul Ajar</p>
                    <p className="text-[11px] text-blue-700 truncate">{selectedMateri.driveUrl}</p>
                  </div>
                </div>
                <a href={selectedMateri.driveUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg flex items-center gap-1 shrink-0 transition-all shadow-2xs">
                  <ExternalLink className="w-3.5 h-3.5" /> Buka Drive
                </a>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Deskripsi Pembelajaran</h4>
                <p className="text-xs text-slate-600 font-medium leading-relaxed bg-white border border-slate-100 p-3 rounded-xl">
                  {selectedMateri.description}
                </p>
              </div>

              {/* Objectives */}
              {selectedMateri.objectives && selectedMateri.objectives.length > 0 && <div className="space-y-2">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Target Belajar (Objectives)</h4>
                  <ul className="space-y-1.5">
                    {selectedMateri.objectives.map((obj: string, i: number) => <li key={i} className="flex items-start gap-2 text-xs text-slate-700 font-bold bg-slate-50/50 p-2 rounded-lg border border-slate-100/50">
                        <span className="text-emerald-500 font-black">✓</span>
                        <span>{obj}</span>
                      </li>)}
                  </ul>
                </div>}

              {/* Status Display (Info Only for Kamad) */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Status Persiapan Modul:</span>
                <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${selectedMateri.status === 'Sudah Membuat' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                  <span className={`w-2 h-2 rounded-full ${selectedMateri.status === 'Sudah Membuat' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  {selectedMateri.status === 'Sudah Membuat' ? 'Sudah Membuat' : 'Belum Membuat'}
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
              <Button onClick={() => setSelectedMateri(null)} size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-9">
                Tutup
              </Button>
            </div>
          </div>
        </div>}
    </div>;
}
export function KamadIbadahSiswa() {
  const _syncTick = useRealtime();
  const [selectedDate, setSelectedDate] = useState(() => (function(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');})());
  const [classDhuhaRank, setClassDhuhaRank] = useState<any[]>([]);
  const [classZuhurRank, setClassZuhurRank] = useState<any[]>([]);
  const [dhuhaRate, setDhuhaRate] = useState<number>(0);
  const [zuhurRate, setZuhurRate] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [ibadah, students, classesData] = await Promise.all([
          apiClient('/crud.php?table=ibadah_siswa').catch(() => []),
          apiClient('/crud.php?table=students').catch(() => []),
          apiClient('/crud.php?table=classes').catch(() => [])
        ]);

        const ibadahList = Array.isArray(ibadah) ? ibadah : [];
        const studentList = Array.isArray(students) ? students : [];
        const dbClasses = Array.isArray(classesData) ? classesData.map((c: any) => c.name || c.class_name).filter(Boolean) : [];

        // All unique classes from classes table and students table
        const studentClasses = studentList.map((s: any) => s.class_name || s.className).filter(Boolean);
        const allClasses = Array.from(new Set([...dbClasses, ...studentClasses])).sort();

        const totalStudents = studentList.length || 1;

        // Selected date filter
        const today = selectedDate;
        const todayIbadah = ibadahList.filter((i: any) => String(i.date).startsWith(today));
        const dhuhaIbadah = todayIbadah.filter((i: any) => 
          i.type === 'Dhuha' || String(i.jenis_ibadah).toLowerCase() === 'dhuha'
        );
        const zuhurIbadah = todayIbadah.filter((i: any) => 
          i.type === 'Zuhur' || String(i.jenis_ibadah).toLowerCase() === 'zuhur'
        );

        const dhuhaPresent = dhuhaIbadah.filter((i: any) => i.status === 'Jamaah' || i.status === 'Hadir').length;
        const zuhurPresent = zuhurIbadah.filter((i: any) => i.status === 'Jamaah' || i.status === 'Hadir').length;
        setDhuhaRate(Math.round((dhuhaPresent / totalStudents) * 100));
        setZuhurRate(Math.round((zuhurPresent / totalStudents) * 100));

        const getClassName = (i: any) => {
          let cName = i.class_name || i.className;
          if (!cName || cName === 'undefined') {
            const student = studentList.find((s: any) => String(s.id) === String(i.student_id));
            cName = student?.class_name || student?.className || 'Tidak Diketahui';
          }
          return cName;
        };

        const classStats = allClasses.map(cName => {
          const classStudents = studentList.filter((s: any) => (s.class_name || s.className) === cName);
          return {
            className: cName as string,
            total: classStudents.length
          };
        });

        const dRank = classStats.map(c => {
          const records = dhuhaIbadah.filter((i: any) => getClassName(i) === c.className);
          const notJamaahCount = records.filter((i: any) => 
            i.status === 'Tidak' || 
            i.status === 'Tidak Jamaah' || 
            i.status === 'Alpa'
          ).length;
          const jamaahCount = records.filter((i: any) => i.status === 'Jamaah' || i.status === 'Hadir').length;
          return { 
            ...c, 
            absent: notJamaahCount,
            jamaah: jamaahCount,
            hasData: records.length > 0
          };
        }).sort((a, b) => b.absent - a.absent);

        const zRank = classStats.map(c => {
          const records = zuhurIbadah.filter((i: any) => getClassName(i) === c.className);
          const notJamaahCount = records.filter((i: any) => 
            i.status === 'Tidak' || 
            i.status === 'Tidak Jamaah' || 
            i.status === 'Alpa'
          ).length;
          const jamaahCount = records.filter((i: any) => i.status === 'Jamaah' || i.status === 'Hadir').length;
          return { 
            ...c, 
            absent: notJamaahCount,
            jamaah: jamaahCount,
            hasData: records.length > 0
          };
        }).sort((a, b) => b.absent - a.absent);

        setClassDhuhaRank(dRank);
        setClassZuhurRank(zRank);
      } catch (err) {
        console.error('Failed to fetch ibadah data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [_syncTick, selectedDate]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Pantau Ibadah Siswa</h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">Monitoring pelaksanaan Sholat Dhuha dan Sholat Zuhur Berjamaah seluruh kelas.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm w-fit self-start md:self-auto">
          <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Tanggal Pantau</p>
            <input 
              type="date" 
              max={(function(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');})()} 
              value={selectedDate} 
              onChange={e => setSelectedDate(e.target.value)} 
              className="h-7 rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs font-bold text-slate-700 shadow-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none" 
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-slate-200/80 shadow-sm">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4 px-5">
            <CardTitle className="text-sm font-black uppercase tracking-wider text-slate-800 flex items-center justify-between">
              <span>Sholat Dhuha</span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Pagi (s/d 12:00 WIB)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div className="flex items-center justify-center p-5 bg-gradient-to-br from-emerald-50/40 to-slate-50 rounded-xl border border-emerald-100/60 mb-5">
              <div className="text-center">
                <p className="text-4xl font-black text-emerald-600 tracking-tight">{loading ? '...' : `${dhuhaRate}%`}</p>
                <p className="text-xs text-slate-500 mt-1 font-bold uppercase tracking-wider">Tingkat Kehadiran Jamaah Dhuha</p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-600">Daftar Seluruh Kelas:</h4>
                <span className="text-[11px] font-bold text-slate-400">{classDhuhaRank.length} Kelas</span>
              </div>
              
              <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1.5">
                {classDhuhaRank.length > 0 ? classDhuhaRank.map((item, idx) => (
                  <div 
                    key={idx} 
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                      item.absent === 0 
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' 
                        : 'bg-rose-50/70 border-rose-200 text-rose-950'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${item.absent === 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      <div>
                        <span className="font-extrabold text-slate-800 text-sm">{item.className}</span>
                        <p className="text-[11px] text-slate-500 font-medium">Total: {item.total} Siswa</p>
                      </div>
                    </div>

                    <div className="text-right">
                      {item.absent === 0 ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-md">
                          ✓ Semua Berjamaah ({item.total} Siswa)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-100/80 px-2.5 py-1 rounded-md">
                          ✕ {item.absent} Siswa Tidak Jamaah ({item.total} Siswa)
                        </span>
                      )}
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-slate-500 italic text-center py-6">Belum ada data kelas.</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-slate-200/80 shadow-sm">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4 px-5">
            <CardTitle className="text-sm font-black uppercase tracking-wider text-slate-800 flex items-center justify-between">
              <span>Sholat Zuhur Berjamaah</span>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                Siang (s/d 13:30 WIB)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div className="flex items-center justify-center p-5 bg-gradient-to-br from-blue-50/40 to-slate-50 rounded-xl border border-blue-100/60 mb-5">
              <div className="text-center">
                <p className="text-4xl font-black text-blue-600 tracking-tight">{loading ? '...' : `${zuhurRate}%`}</p>
                <p className="text-xs text-slate-500 mt-1 font-bold uppercase tracking-wider">Tingkat Kehadiran Zuhur Berjamaah</p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-600">Daftar Seluruh Kelas:</h4>
                <span className="text-[11px] font-bold text-slate-400">{classZuhurRank.length} Kelas</span>
              </div>

              <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1.5">
                {classZuhurRank.length > 0 ? classZuhurRank.map((item, idx) => (
                  <div 
                    key={idx} 
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                      item.absent === 0 
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' 
                        : 'bg-rose-50/70 border-rose-200 text-rose-950'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${item.absent === 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      <div>
                        <span className="font-extrabold text-slate-800 text-sm">{item.className}</span>
                        <p className="text-[11px] text-slate-500 font-medium">Total: {item.total} Siswa</p>
                      </div>
                    </div>

                    <div className="text-right">
                      {item.absent === 0 ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-md">
                          ✓ Semua Berjamaah ({item.total} Siswa)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-100/80 px-2.5 py-1 rounded-md">
                          ✕ {item.absent} Siswa Tidak Jamaah ({item.total} Siswa)
                        </span>
                      )}
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-slate-500 italic text-center py-6">Belum ada data kelas.</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
import { KamadWeeklyRecapModal } from '../components/KamadWeeklyRecapModal';

export function KamadKinerjaStaf() {
  const _syncTick = useRealtime();
  const [selectedStaf, setSelectedStaf] = useState<any>(null);
  const [showWeeklyRecap, setShowWeeklyRecap] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'guru_mapel' | 'walas' | 'guru_quran' | 'pustakawan' | 'bk' | 'pelanggaran'>('all');
  const [kinerjaStartDate, setKinerjaStartDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });

  // Jobdesk structure according to SOP
  const [stafList, setStafList] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        let [
          users,
          kinerja,
          schedules,
          assignments,
          studentAttendance,
          pemantauanPagi,
          nilaiSikap,
          ibadahSiswa,
          laporanHarian,
          materiAjar,
          classes
        ] = await Promise.all([
          apiClient('/crud.php?table=users').catch(() => []),
          apiClient('/crud.php?table=kinerja_staf').catch(() => []),
          apiClient('/crud.php?table=schedules').catch(() => []),
          apiClient('/crud.php?table=teaching_assignments').catch(() => []),
          apiClient('/crud.php?table=student_attendance').catch(() => []),
          apiClient('/crud.php?table=pemantauan_pagi').catch(() => []),
          apiClient('/crud.php?table=nilai_sikap').catch(() => []),
          apiClient('/crud.php?table=ibadah_siswa').catch(() => []),
          apiClient('/crud.php?table=laporan_harian').catch(() => []),
          apiClient('/crud.php?table=materi_ajar').catch(() => []),
          apiClient('/crud.php?table=classes').catch(() => [])
        ]);
        
        if (Array.isArray(materiAjar)) {
          materiAjar.sort((a, b) => new Date(b.created_at || b.date || 0).getTime() - new Date(a.created_at || a.date || 0).getTime());
        }
        if (Array.isArray(laporanHarian)) {
          laporanHarian.sort((a, b) => new Date(b.created_at || b.date || 0).getTime() - new Date(a.created_at || a.date || 0).getTime());
        }

        const d = new Date();
        const localToday = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const filterDateStr = kinerjaStartDate || localToday;
        const filterDateObj = new Date(filterDateStr);
        const currentDayIndex = filterDateObj.getDay();
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const currentDayName = days[currentDayIndex];

        const todaySchedules = Array.isArray(schedules) ? schedules.filter((s: any) => s.day === currentDayName) : [];
        const filteredUsers = Array.isArray(users) ? users.filter((u: any) => {
          const r = u.roles ? typeof u.roles === 'string' ? JSON.parse(u.roles) : u.roles : [u.role];
          return r.includes('guru') || r.includes('walas') || r.includes('guru_quran') || r.includes('tendik') || r.includes('bk') || r.includes('pustakawan');
        }) : [];

        const parseHM = (timeStr?: string): { hour: number; minute: number } | null => {
          if (!timeStr) return null;
          const str = String(timeStr).trim();
          const match = str.match(/(\d{1,2}):(\d{2})/);
          if (match) {
            return { hour: parseInt(match[1], 10), minute: parseInt(match[2], 10) };
          }
          return null;
        };

        const extractTimestampHM = (rawDate: any): string | null => {
          if (!rawDate) return null;
          const str = String(rawDate).trim();
          // Extract HH:MM directly from the string to ignore timezone offsets
          // since the backend might append 'Z' to local time strings.
          const match = str.match(/T?\s?(\d{2}):(\d{2})/);
          if (match) {
            return `${match[1]}:${match[2]}`;
          }
          return null;
        };

        const isTimePastDeadline = (doneHM: string, deadlineHM: string) => {
          const t1 = parseHM(doneHM);
          const t2 = parseHM(deadlineHM);
          if (!t1 || !t2) return false;
          if (t1.hour > t2.hour) return true;
          if (t1.hour === t2.hour && t1.minute > t2.minute) return true;
          return false;
        };

        const now = new Date();
        const currentHourMin = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        const todayStr = (function(){const d=now;return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');})();
        const isPastDate = filterDateStr < todayStr;
        
        let mappedStaf: any[] = [];
        filteredUsers.forEach((u: any) => {
          const r = u.roles ? (typeof u.roles === 'string' ? JSON.parse(u.roles) : u.roles) : [u.role];
          const todayString = filterDateStr;
          const userKinerja = Array.isArray(kinerja) ? kinerja.filter((k: any) => {
            if (String(k.user_id) !== String(u.id) || !k.created_at) return false;
            let taskDate = '';
            if (k.created_at) {
              // Extract date strictly from the string to avoid timezone shifts
              const match = String(k.created_at).match(/^(\d{4}-\d{2}-\d{2})/);
              if (match) taskDate = match[1];
            }
            return taskDate === todayString;
          }) : [];

          let allTasks: any[] = [];

          const addSingleTask = (
            taskName: string,
            group: string,
            idealDeadline?: string,
            finalDeadline?: string,
            customCheckFn?: () => { completed: boolean; completedAt?: string } | null
          ) => {
            const foundKinerja = userKinerja.find((k: any) => 
              k.task === taskName || 
              String(k.task).toLowerCase() === String(taskName).toLowerCase()
            );

            let isDone = false;
            let doneAtStr: string | null = null;

            if (foundKinerja) {
              isDone = true;
              doneAtStr = foundKinerja.created_at || null;
            } else if (customCheckFn) {
              const customRes = customCheckFn();
              if (customRes && customRes.completed) {
                isDone = true;
                doneAtStr = customRes.completedAt || null;
              }
            }

            const doneHM = extractTimestampHM(doneAtStr);
            let status: 'selesai' | 'selesai_telat' | 'proses' | 'terlewat' = 'proses';
            let timeStr = '';
            let statusText = '';
            let isLate = false;

            if (isDone) {
              let isDoneBeforeToday = false;
              let doneDatePart = '';
              if (doneAtStr) {
                 // Extract date strictly from the string to avoid timezone shifts
                 const match = String(doneAtStr).match(/^(\d{4}-\d{2}-\d{2})/);
                 if (match) doneDatePart = match[1];
                 
                 if (doneDatePart && doneDatePart < filterDateStr) {
                    isDoneBeforeToday = true;
                 }
              }

              let isPastFinal = false;
              if (!isDoneBeforeToday && finalDeadline && doneHM) {
                 isPastFinal = isTimePastDeadline(doneHM, finalDeadline);
              }

              if (isPastFinal) {
                status = 'terlewat';
                statusText = 'BELUM (TERLEWAT)';
                timeStr = `Batas Akhir ${finalDeadline} WIB Terlewat`;
              } else {
                if (isDoneBeforeToday) {
                   isLate = false; // Always on time if done before the filter date
                } else {
                   isLate = Boolean(idealDeadline && doneHM && isTimePastDeadline(doneHM, idealDeadline));
                }

                if (isLate) {
                  status = 'selesai_telat';
                  statusText = 'SELESAI (TERLAMBAT!)';
                  timeStr = doneHM ? `Selesai: ${doneHM} WIB (Terlambat)` : 'Selesai (Terlambat)';
                } else {
                  status = 'selesai';
                  statusText = 'SELESAI (TEPAT WAKTU)';
                  if (isDoneBeforeToday && doneDatePart) {
                    // Format the date slightly, e.g., "Selesai: 2026-08-26 (Tepat Waktu)"
                    timeStr = `Selesai: ${doneDatePart} (Tepat Waktu)`;
                  } else {
                    timeStr = doneHM ? `Selesai: ${doneHM} WIB (Tepat Waktu)` : 'Selesai (Tepat Waktu)';
                  }
                }
              }
            } else {
              const cutoffTime = finalDeadline || '17:00';
              const isOverdue = isPastDate || isTimePastDeadline(currentHourMin, cutoffTime);
              
              if (isOverdue) {
                status = 'terlewat';
                statusText = 'BELUM (TERLEWAT)';
                timeStr = `Batas Akhir ${cutoffTime} WIB Terlewat`;
              } else if (idealDeadline && (isPastDate || isTimePastDeadline(currentHourMin, idealDeadline))) {
                status = 'proses_telat' as any;
                statusText = 'TERLEWAT BATAS IDEAL';
                timeStr = `Batas Ideal ${idealDeadline} Terlewat (Akhir ${cutoffTime})`;
              } else {
                status = 'proses';
                statusText = 'DALAM PROSES';
                timeStr = idealDeadline ? `Batas Ideal ${idealDeadline} (Akhir ${cutoffTime})` : `Batas Akhir ${cutoffTime}`;
              }
            }

            allTasks.push({
              group,
              name: taskName,
              status,
              statusText,
              time: timeStr,
              doneHM,
              isDone,
              isLate,
              deadline: idealDeadline ? `${idealDeadline} WIB` : '',
              deadlineHM: idealDeadline
            });
          };                    const walasClassObj = Array.isArray(classes) ? classes.find((c: any) => String(c.wali_kelas_id) === String(u.id)) : null;
          const userClass = u.class_name || u.className || (walasClassObj ? walasClassObj.class_name || walasClassObj.name : '');

          if (r.includes('walas')) {
            addSingleTask('Absensi siswa binaan pada pagi hari', 'WALI KELAS', '07:30', '17:00', () => {
              if (!Array.isArray(studentAttendance)) return null;
              const match = studentAttendance.find((sa: any) => 
                String(sa.date).startsWith(filterDateStr) &&
                sa.subject_name === 'Presensi Wali Kelas' &&
                (sa.class_name === userClass || String(sa.user_id) === String(u.id))
              );
              if (match) return { completed: true, completedAt: match.created_at || match.timestamp };
              return null;
            });

            addSingleTask('Pemantauan pagi, cek piket dan kelengkapan siswa', 'WALI KELAS', '07:30', '17:00', () => {
              if (!Array.isArray(pemantauanPagi)) return null;
              const match = pemantauanPagi.find((p: any) =>
                String(p.tanggal).startsWith(filterDateStr) &&
                (p.class_name === userClass || String(p.user_id) === String(u.id))
              );
              if (match) return { completed: true, completedAt: match.created_at || match.timestamp };
              return null;
            });

            addSingleTask('Mengisi Nilai Sikap & Karakter siswa', 'WALI KELAS', '07:30', '17:00', () => {
              if (!Array.isArray(nilaiSikap)) return null;
              const match = nilaiSikap.find((n: any) =>
                String(n.tanggal).startsWith(filterDateStr) &&
                (n.class_name === userClass || String(n.user_id) === String(u.id))
              );
              if (match) return { completed: true, completedAt: match.created_at || match.timestamp };
              return null;
            });

            addSingleTask('Mengabsen sholat Zuhur siswa kelas binaannya', 'WALI KELAS', '13:30', '17:00', () => {
              if (!Array.isArray(ibadahSiswa)) return null;
              const match = ibadahSiswa.find((ib: any) =>
                String(ib.date).startsWith(filterDateStr) &&
                (ib.type === 'Zuhur' || String(ib.jenis_ibadah).toLowerCase() === 'zuhur') &&
                (ib.class_name === userClass || String(ib.user_id) === String(u.id))
              );
              if (match) return { completed: true, completedAt: match.created_at || match.timestamp };
              return null;
            });
          }

          if (r.includes('guru') || r.includes('guru_mapel')) {
            const mySchedules = todaySchedules.filter((s: any) => {
              if (String(s.teacher_id) !== String(u.id)) return false;
              const isQuran = String(s.subject_name).toLowerCase().includes('quran') || String(s.subject_name).toLowerCase().includes('tahfizh') || String(s.subject_name).toLowerCase().includes('bta');
              return !isQuran;
            });
            
            const uniqueMap = new Map();
            mySchedules.forEach((s: any) => {
              const key = `${s.class_name}:::${s.subject_name}`;
              if (!uniqueMap.has(key) || s.end_time?.substring(0, 5) > uniqueMap.get(key).jamSelesai) {
                uniqueMap.set(key, s);
              }
            });
            
            uniqueMap.forEach((s: any) => {
              const deadline = s.end_time?.substring(0, 5) || '14:00';
              addSingleTask(`Absen ${s.class_name} (${s.subject_name})`, 'GURU MAPEL', deadline, '17:00', () => {
                if (!Array.isArray(studentAttendance)) return null;
                const match = studentAttendance.find((sa: any) =>
                  String(sa.date).startsWith(filterDateStr) &&
                  String(sa.class_name).toLowerCase() === String(s.class_name).toLowerCase() &&
                  String(sa.subject_name).toLowerCase() === String(s.subject_name).toLowerCase() &&
                  String(sa.user_id) === String(u.id)
                );
                if (match) return { completed: true, completedAt: match.created_at || match.timestamp };
                return null;
              });

              addSingleTask(`Jurnal Ajar ${s.class_name} (${s.subject_name})`, 'GURU MAPEL', deadline, '17:00', () => {
                if (!Array.isArray(laporanHarian)) return null;
const match = laporanHarian.find((lh: any) => {
                  let act: any = {};
                  try { act = typeof lh.activity === 'string' && lh.activity.startsWith('{') ? JSON.parse(lh.activity) : {}; } catch (e) {}
                  const lhClass = act.class || lh.class_name || '';
                  const lhSubject = act.subject || lh.subject_name || '';
                  const lhDate = lh.date || lh.tanggal || (lh.created_at ? String(lh.created_at).split('T')[0].split(' ')[0] : '');
                  return String(lhDate).startsWith(filterDateStr) && 
                         String(lhClass).trim().toLowerCase() === String(s.class_name).trim().toLowerCase() && 
                         String(lhSubject).trim().toLowerCase() === String(s.subject_name).trim().toLowerCase() && 
                         String(lh.user_id) === String(u.id);
                });
                if (match) return { completed: true, completedAt: match.created_at || match.timestamp };
                return null;
              });

              addSingleTask(`Membuat Modul Ajar ${s.class_name} (${s.subject_name})`, 'GURU MAPEL', deadline, '17:00', () => {
                if (!Array.isArray(materiAjar)) return null;
                const match = materiAjar.find((ma: any) => {
                    const maDate = ma.date || (ma.created_at ? String(ma.created_at).split('T')[0].split(' ')[0] : '');
                    return String(maDate).startsWith(filterDateStr) &&
                           String(ma.class_name).trim().toLowerCase() === String(s.class_name).trim().toLowerCase() && 
                           (String(ma.subject).trim().toLowerCase() === String(s.subject_name).trim().toLowerCase() || String(ma.subject_name).trim().toLowerCase() === String(s.subject_name).trim().toLowerCase()) && 
                           String(ma.user_id) === String(u.id);
                  });
                if (match) return { completed: true, completedAt: match.created_at || match.timestamp || match.date };
                return null;
              });
            });
          }

          if (r.includes('guru_quran')) {
            const mySchedules = todaySchedules.filter((s: any) => {
              if (String(s.teacher_id) !== String(u.id)) return false;
              const isQuran = String(s.subject_name).toLowerCase().includes('quran') || String(s.subject_name).toLowerCase().includes('tahfizh') || String(s.subject_name).toLowerCase().includes('bta');
              return isQuran || !r.includes('guru');
            });
            
            const uniqueMap = new Map();
            mySchedules.forEach((s: any) => {
              const key = `${s.class_name}:::${s.subject_name}`;
              if (!uniqueMap.has(key) || s.end_time?.substring(0, 5) > uniqueMap.get(key).jamSelesai) {
                uniqueMap.set(key, s);
              }
            });
            
            uniqueMap.forEach((s: any) => {
              const deadline = s.end_time?.substring(0, 5) || '14:00';
              addSingleTask(`Absen ${s.class_name} (${s.subject_name})`, 'GURU QUR\'AN', deadline, '17:00', () => {
                if (!Array.isArray(studentAttendance)) return null;
                const match = studentAttendance.find((sa: any) =>
                  String(sa.date).startsWith(filterDateStr) &&
                  String(sa.class_name).toLowerCase() === String(s.class_name).toLowerCase() &&
                  String(sa.subject_name).toLowerCase() === String(s.subject_name).toLowerCase() &&
                  String(sa.user_id) === String(u.id)
                );
                if (match) return { completed: true, completedAt: match.created_at || match.timestamp };
                return null;
              });

              addSingleTask(`Jurnal Ajar ${s.class_name} (${s.subject_name})`, 'GURU QUR\'AN', deadline, '17:00', () => {
                if (!Array.isArray(laporanHarian)) return null;
const match = laporanHarian.find((lh: any) => {
                  let act: any = {};
                  try { act = typeof lh.activity === 'string' && lh.activity.startsWith('{') ? JSON.parse(lh.activity) : {}; } catch (e) {}
                  const lhClass = act.class || lh.class_name || '';
                  const lhSubject = act.subject || lh.subject_name || '';
                  const lhDate = lh.date || lh.tanggal || (lh.created_at ? String(lh.created_at).split('T')[0].split(' ')[0] : '');
                  return String(lhDate).startsWith(filterDateStr) && 
                         String(lhClass).trim().toLowerCase() === String(s.class_name).trim().toLowerCase() && 
                         String(lhSubject).trim().toLowerCase() === String(s.subject_name).trim().toLowerCase() && 
                         String(lh.user_id) === String(u.id);
                });
                if (match) return { completed: true, completedAt: match.created_at || match.timestamp };
                return null;
              });

              addSingleTask(`Membuat Modul Ajar ${s.class_name} (${s.subject_name})`, 'GURU QUR\'AN', deadline, '17:00', () => {
                if (!Array.isArray(materiAjar)) return null;
                const match = materiAjar.find((ma: any) => {
                    const maDate = ma.date || (ma.created_at ? String(ma.created_at).split('T')[0].split(' ')[0] : '');
                    return String(maDate).startsWith(filterDateStr) &&
                           String(ma.class_name).trim().toLowerCase() === String(s.class_name).trim().toLowerCase() && 
                           (String(ma.subject).trim().toLowerCase() === String(s.subject_name).trim().toLowerCase() || String(ma.subject_name).trim().toLowerCase() === String(s.subject_name).trim().toLowerCase()) && 
                           String(ma.user_id) === String(u.id);
                  });
                if (match) return { completed: true, completedAt: match.created_at || match.timestamp || match.date };
                return null;
              });
            });
            
            addSingleTask('Mengabsen siswa sholat Dhuha', 'GURU QUR\'AN', '12:00', '17:00', () => {
              if (!Array.isArray(ibadahSiswa)) return null;
              const match = ibadahSiswa.find((ib: any) =>
                String(ib.date).startsWith(filterDateStr) &&
                (ib.type === 'Dhuha' || String(ib.jenis_ibadah).toLowerCase() === 'dhuha')
              );
              if (match) return { completed: true, completedAt: match.created_at || match.timestamp };
              return null;
            });
          }
          
          if (r.includes('bk')) addSingleTask('Mengisi Laporan Harian BK', 'GURU BK', '14:00', '17:00');
          if (r.includes('pustakawan')) addSingleTask('Mengisi Laporan Perpustakaan', 'PUSTAKAWAN', '14:00', '17:00');

          const tuntas = allTasks.filter((t: any) => t.status === 'selesai').length;
          const totalTasks = allTasks.length;
          const completionRate = totalTasks > 0 ? Math.round(tuntas / totalTasks * 100) : 0;
          const violations = allTasks.filter((t: any) => t.status === 'terlewat' || t.status === 'selesai_telat').length;

          const roleDisplays: string[] = [];
          if (r.includes('walas')) roleDisplays.push('Wali Kelas');
          if (r.includes('guru') || r.includes('guru_mapel')) roleDisplays.push('Guru Mapel');
          if (r.includes('guru_quran')) roleDisplays.push('Guru Qur\'an');
          if (r.includes('bk')) roleDisplays.push('Guru BK');
          if (r.includes('pustakawan')) roleDisplays.push('Pustakawan');

          if (allTasks.length > 0) {
            mappedStaf.push({
              id: u.id,
              name: u.name,
              role: roleDisplays.join(', '),
              kelas: u.class_name || '-',
              roles: r,
              tasks: allTasks,
              weeklyStats: {
                completionRate: completionRate,
                violations: violations
              }
            });
          }
        });

        setStafList(mappedStaf);
      } catch (err) {
        console.error("Failed to fetch staf list", err);
      }
    };
    fetchUsers();
  }, [_syncTick, kinerjaStartDate]);

  const getStaffSummary = (tasks: any[]) => {
    const hasTerlewat = tasks.some((t: any) => t.status === 'terlewat');
    const hasTelat = tasks.some((t: any) => t.status === 'selesai_telat');
    const allSelesai = tasks.every((t: any) => t.status === 'selesai');
    const allDone = tasks.every((t: any) => t.status === 'selesai' || t.status === 'selesai_telat');

    if (hasTerlewat) return {
      label: 'Pelanggaran / Terlewat',
      code: 'pelanggaran',
      color: 'text-rose-700 bg-rose-50 border-rose-200',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
      icon: XCircle
    };
    if (allSelesai) return {
      label: 'Tuntas (Tepat Waktu)',
      code: 'selesai',
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: CheckCircle2
    };
    if (allDone && hasTelat) return {
      label: 'Selesai (Ada Terlambat)',
      code: 'selesai_telat',
      color: 'text-amber-800 bg-amber-50 border-amber-200',
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
      icon: AlertCircle
    };
    return {
      label: 'Dalam Proses',
      code: 'proses',
      color: 'text-blue-700 bg-blue-50 border-blue-200',
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: Clock
    };
  };

  const filterOptions = [
    { value: 'all', label: 'Semua Staf' },
    { value: 'walas', label: 'Wali Kelas' },
    { value: 'guru_mapel', label: 'Guru Mapel' },
    { value: 'guru_quran', label: 'Guru Qur\'an' },
    { value: 'pustakawan', label: 'Pustakawan' },
    { value: 'bk', label: 'Guru BK' },
    { value: 'pelanggaran', label: 'Pelanggaran / Terlambat' }
  ];

  const filteredList = stafList.filter(s => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pelanggaran') return s.tasks.some((t: any) => t.status === 'terlewat' || t.status === 'selesai_telat');
    return (s.roles || []).includes(activeTab) || (activeTab === 'guru_mapel' && s.roles?.includes('guru'));
  });

  const totalStaf = stafList.length;
  const tuntasCount = stafList.filter(s => s.tasks.every((t: any) => t.status === 'selesai')).length;
  const prosesCount = stafList.filter(s => !s.tasks.every((t: any) => t.status === 'selesai') && !s.tasks.some((t: any) => t.status === 'terlewat' || t.status === 'selesai_telat')).length;
  const pelanggaranCount = stafList.filter(s => s.tasks.some((t: any) => t.status === 'terlewat' || t.status === 'selesai_telat')).length;

  const downloadKinerjaPDF = () => {
    try {
      const doc = new jsPDF('landscape');
      doc.setFontSize(16);
      doc.text('LAPORAN MONITORING KINERJA & KETEPATAN WAKTU STAF', 14, 15);
      doc.setFontSize(10);
      doc.text(`Tanggal: ${new Date(kinerjaStartDate).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, 14, 22);

      const tableRows: any[] = [];
      stafList.forEach((staf, sIdx) => {
        staf.tasks.forEach((task: any, tIdx: number) => {
          tableRows.push([
            tIdx === 0 ? staf.name : '',
            tIdx === 0 ? staf.role : '',
            tIdx === 0 ? staf.kelas : '',
            task.name,
            task.deadline || '-',
            task.doneHM ? `${task.doneHM} WIB` : '-',
            task.status === 'selesai' ? 'SELESAI (TEPAT WAKTU)' : task.status === 'selesai_telat' ? 'SELESAI (TERLAMBAT!)' : task.status === 'terlewat' ? 'BELUM (TERLEWAT)' : task.status === 'proses_telat' ? 'TERLEWAT BATAS IDEAL' : 'DALAM PROSES'
          ]);
        });
      });

      autoTable(doc, {
        head: [['Nama Staf', 'Peran', 'Kelas', 'Jobdesk', 'Batas Waktu', 'Waktu Pengisian', 'Status']],
        body: tableRows,
        startY: 28,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontStyle: 'bold' },
        didParseCell: (data) => {
          if (data.column.index === 6) {
            const val = String(data.cell.raw);
            if (val.includes('TEPAT WAKTU')) {
              data.cell.styles.textColor = [16, 185, 129];
              data.cell.styles.fontStyle = 'bold';
            } else if (val.includes('TERLAMBAT')) {
              data.cell.styles.textColor = [217, 119, 6];
              data.cell.styles.fontStyle = 'bold';
            } else if (val.includes('TERLEWAT')) {
              data.cell.styles.textColor = [225, 29, 72];
              data.cell.styles.fontStyle = 'bold';
            }
          }
        }
      });

      doc.save(`Laporan_Kinerja_Staf_${kinerjaStartDate}.pdf`);
    } catch (e) {
      console.error('Failed to export PDF:', e);
      window.alert('Gagal mengekspor PDF.');
    }
  };

  const downloadKinerjaExcel = () => {
    try {
      const dataRows: any[] = [];
      stafList.forEach((staf) => {
        staf.tasks.forEach((task: any) => {
          dataRows.push({
            'Nama Staf': staf.name,
            'Peran': staf.role,
            'Kelas Binaan': staf.kelas,
            'Jobdesk': task.name,
            'Batas Waktu': task.deadline || '-',
            'Waktu Pengisian': task.doneHM ? `${task.doneHM} WIB` : '-',
            'Status': task.status === 'selesai' ? 'SELESAI (TEPAT WAKTU)' : task.status === 'selesai_telat' ? 'SELESAI (TERLAMBAT!)' : task.status === 'terlewat' ? 'BELUM (TERLEWAT)' : task.status === 'proses_telat' ? 'TERLEWAT BATAS IDEAL' : 'DALAM PROSES',
            'Keterangan': task.time
          });
        });
      });

      const ws = XLSX.utils.json_to_sheet(dataRows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Kinerja Staf');
      XLSX.writeFile(wb, `Laporan_Kinerja_Staf_${kinerjaStartDate}.xlsx`);
    } catch (e) {
      console.error('Failed to export Excel:', e);
      window.alert('Gagal mengekspor Excel.');
    }
  };

  return (
    <>
      {selectedStaf && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/50 backdrop-blur-sm pb-20 sm:pb-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[90vh] my-auto border border-slate-100">
            <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold uppercase shrink-0">
                  {selectedStaf.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">{selectedStaf.name}</h3>
                  <p className="text-xs text-slate-500 font-medium">{selectedStaf.role} {selectedStaf.kelas !== '-' ? `• Kelas ${selectedStaf.kelas}` : ''}</p>
                </div>
              </div>
              <button onClick={() => setSelectedStaf(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
              {Array.from(new Set(selectedStaf.tasks.map((t: any) => t.group))).map((groupName: any) => {
                const groupTasks = selectedStaf.tasks.filter((t: any) => t.group === groupName);
                return (
                  <div key={groupName} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-600">JOBDESK {groupName}</h4>
                      <span className="text-[10px] font-bold text-slate-400">{groupTasks.length} Tugas</span>
                    </div>

                    <div className="space-y-2.5">
                      {groupTasks.map((task: any, idx: number) => {
                        let badgeStyle = '';
                        let TaskIcon = CheckCircle2;
                        let statusBadgeText = task.statusText;
                        let infoMessage = '';

                        if (task.status === 'selesai') {
                          badgeStyle = 'bg-emerald-50 border-emerald-200 text-emerald-800';
                          TaskIcon = CheckCircle2;
                          infoMessage = task.doneHM 
                            ? `✓ Selesai diisi jam ${task.doneHM} WIB (Tepat Waktu sebelum batas ${task.deadline})`
                            : '✓ Selesai Tepat Waktu';
                        } else if (task.status === 'selesai_telat') {
                          badgeStyle = 'bg-amber-50 border-amber-200 text-amber-800';
                          TaskIcon = AlertCircle;
                          infoMessage = task.doneHM
                            ? `⚠ Selesai diisi jam ${task.doneHM} WIB (Terlambat - Batas: ${task.deadline})`
                            : `⚠ Selesai Terlambat (Batas: ${task.deadline})`;
                        } else if (task.status === 'terlewat') {
                          badgeStyle = 'bg-rose-50 border-rose-200 text-rose-800';
                          TaskIcon = XCircle;
                          infoMessage = `✕ Belum dikerjakan (Melewati batas akhir ${task.deadline})`;
                        } else {
                          badgeStyle = 'bg-blue-50 border-blue-200 text-blue-800';
                          TaskIcon = Clock;
                          infoMessage = `⏳ Sedang berjalan (Batas pengisian: ${task.deadline || 'Hari ini'})`;
                        }

                        return (
                          <div key={idx} className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${badgeStyle}`}>
                            <div className="flex items-start gap-3">
                              <TaskIcon className="w-5 h-5 shrink-0 mt-0.5" />
                              <div>
                                <p className="text-sm font-bold tracking-tight">{task.name}</p>
                                <p className="text-xs font-semibold mt-1 opacity-90">{infoMessage}</p>
                              </div>
                            </div>
                            <div className="sm:text-right shrink-0 flex items-center sm:flex-col gap-2 sm:gap-1">
                              <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border ${
                                task.status === 'selesai' ? 'bg-emerald-600 text-white border-emerald-600' :
                                task.status === 'selesai_telat' ? 'bg-amber-600 text-white border-amber-600' :
                                task.status === 'terlewat' ? 'bg-rose-600 text-white border-rose-600' :
                                'bg-blue-600 text-white border-blue-600'
                              }`}>
                                {statusBadgeText}
                              </span>
                              {task.deadline && (
                                <span className="text-[10px] font-bold text-slate-500">
                                  Batas: {task.deadline}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <Button variant="outline" onClick={() => setSelectedStaf(null)}>Tutup</Button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-800">Kinerja Staf Real-time</h1>
            <p className="text-slate-500 text-xs sm:text-sm font-medium">Monitoring ketepatan waktu pengerjaan jobdesk guru & staf.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex bg-slate-100 p-1 rounded-lg shrink-0 items-center">
              <input
                type="date"
                value={kinerjaStartDate}
                onChange={(e) => setKinerjaStartDate(e.target.value)}
                max={(function(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');})()}
                className="h-8 md:h-9 bg-white border border-slate-200 rounded-md px-3 text-xs md:text-sm font-bold text-slate-700 shadow-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
              />
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowWeeklyRecap(true)} className="h-8 md:h-9 text-xs font-bold gap-1 text-emerald-700 border-emerald-200 hover:bg-emerald-50">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              Rekap Mingguan
            </Button>
            <Button variant="outline" size="sm" onClick={downloadKinerjaPDF} className="h-8 md:h-9 text-xs font-bold gap-1 text-slate-700 border-slate-200 hover:bg-slate-50">
              <FileText className="w-3.5 h-3.5 text-rose-600" />
              PDF
            </Button>
            <Button variant="outline" size="sm" onClick={downloadKinerjaExcel} className="h-8 md:h-9 text-xs font-bold gap-1 text-slate-700 border-slate-200 hover:bg-slate-50">
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              Excel
            </Button>
          </div>
        </div>
        
        {pelanggaranCount > 0 && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs sm:text-sm text-rose-800 flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <p className="font-extrabold text-rose-900">Perhatian Kepala Madrasah:</p>
                <p className="text-rose-700 text-xs">Terdapat <span className="font-black text-rose-900">{pelanggaranCount} staf</span> yang melewati batas waktu atau mengalami keterlambatan pengisian jobdesk.</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-[10px] sm:text-xs font-bold text-slate-500 leading-tight">Total Staf</p>
            <p className="text-xl sm:text-2xl font-black text-slate-800 mt-1">{totalStaf}</p>
          </div>
          <div className="bg-emerald-50 p-3 sm:p-4 rounded-xl border border-emerald-100 shadow-sm">
            <p className="text-[10px] sm:text-xs font-bold text-emerald-600 leading-tight">Tuntas (Tepat Waktu)</p>
            <p className="text-xl sm:text-2xl font-black text-emerald-700 mt-1">{tuntasCount}</p>
          </div>
          <div className="bg-blue-50 p-3 sm:p-4 rounded-xl border border-blue-100 shadow-sm">
            <p className="text-[10px] sm:text-xs font-bold text-blue-600 leading-tight">Dalam Proses</p>
            <p className="text-xl sm:text-2xl font-black text-blue-700 mt-1">{prosesCount}</p>
          </div>
          <div className="bg-rose-50 p-3 sm:p-4 rounded-xl border border-rose-100 shadow-sm">
            <p className="text-[10px] sm:text-xs font-bold text-rose-600 leading-tight">Terlambat / Terlewat</p>
            <p className="text-xl sm:text-2xl font-black text-rose-700 mt-1">{pelanggaranCount}</p>
          </div>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-1.5 sm:gap-2 pb-1 sm:pb-2 sm:overflow-x-auto scrollbar-hide">
          {filterOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => setActiveTab(opt.value as any)}
              className={`px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg text-[10px] sm:text-xs font-bold whitespace-nowrap transition-colors flex-1 sm:flex-none ${activeTab === opt.value ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <Card className="overflow-hidden border-slate-200/60 shadow-sm">
          <CardHeader className="py-3 px-4 sm:px-6 bg-slate-50/50 border-b border-slate-100">
            <CardTitle className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-700 m-0">
              {kinerjaStartDate === (function(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');})() ? 'Daftar Kinerja Staf Hari Ini' : `Daftar Kinerja Staf Tanggal ${new Date(kinerjaStartDate).toLocaleDateString('id-ID')}`}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {filteredList.map((staf, index) => {
                const summary = getStaffSummary(staf.tasks);
                const SummaryIcon = summary.icon;
                return (
                  <div key={index} className="p-3.5 sm:p-5 hover:bg-slate-50 transition-colors">
                    <div className="flex flex-col lg:flex-row gap-3 lg:items-center justify-between">
                      <div className="flex items-start justify-between w-full lg:w-auto">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 text-xs sm:text-sm font-bold uppercase shrink-0">
                            {staf.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm sm:text-base font-bold text-slate-800 leading-tight">{staf.name}</p>
                            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 font-medium">{staf.role} {staf.kelas !== '-' ? `• Kelas ${staf.kelas}` : ''}</p>
                            
                            {/* Quick task pills */}
                            <div className="flex flex-wrap items-center gap-1.5 mt-2">
                              {staf.tasks.slice(0, 4).map((t: any, tIdx: number) => {
                                let shortName = t.name;
                                if (shortName.includes('Absensi siswa')) shortName = 'Absen Pagi';
                                else if (shortName.includes('Pemantauan pagi')) shortName = 'Pemantauan';
                                else if (shortName.includes('Nilai Sikap')) shortName = 'Nilai Sikap';
                                else if (shortName.includes('sholat Zuhur')) shortName = 'Sholat Zuhur';
                                else if (shortName.includes('sholat Dhuha')) shortName = 'Sholat Dhuha';
                                else if (shortName.startsWith('Absen')) shortName = 'Absen Mapel';
                                else if (shortName.startsWith('Jurnal')) shortName = 'Jurnal';
                                else if (shortName.startsWith('Membuat Modul')) shortName = 'Modul Ajar';

                                return (
                                  <span
                                    key={tIdx}
                                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                                      t.status === 'selesai' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                                      t.status === 'selesai_telat' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                                      t.status === 'terlewat' ? 'bg-rose-50 text-rose-800 border-rose-200' :
                                      'bg-blue-50 text-blue-800 border-blue-200'
                                    }`}
                                  >
                                    {t.status === 'selesai' && `✓ ${shortName}: ${t.doneHM || 'Tepat'}`}
                                    {t.status === 'selesai_telat' && `⚠ ${shortName}: ${t.doneHM || 'Telat'}`}
                                    {t.status === 'terlewat' && `✕ ${shortName}: Terlewat`}
                                    {t.status === 'proses' && `⏳ ${shortName}: s/d ${t.deadlineHM || 'Kerja'}`}
                                  </span>
                                );
                              })}
                              {staf.tasks.length > 4 && (
                                <span className="text-[10px] font-bold text-slate-400">+{staf.tasks.length - 4} tugas lagi</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between lg:justify-end gap-3 w-full lg:w-auto mt-2 lg:mt-0 border-t border-slate-100 lg:border-0 pt-2.5 lg:pt-0">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${summary.badgeClass}`}>
                          <SummaryIcon className="w-3.5 h-3.5 shrink-0" />
                          {summary.label}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-[10px] sm:text-xs font-bold gap-1.5 text-emerald-700 border-emerald-200 hover:bg-emerald-50 h-8 sm:h-9"
                          onClick={() => setSelectedStaf(staf)}
                        >
                          <Eye className="w-3.5 h-3.5 shrink-0" />
                          Lihat Jobdesk
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {filteredList.length === 0 && (
                <div className="p-8 text-center text-slate-500">
                  <p className="text-sm font-medium">Tidak ada data staf pada filter ini.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      <KamadWeeklyRecapModal isOpen={showWeeklyRecap} onClose={() => setShowWeeklyRecap(false)} baseDate={kinerjaStartDate} />
    </>
  );
}
export function KamadApprovalIzin() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmAction, setConfirmAction] = useState<{
    id: string;
    status: 'approved' | 'rejected';
    userName: string;
    type: string;
  } | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const triggerToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({
      message,
      type
    });
    setTimeout(() => setToast(null), 3000);
  };
  const fetchRequests = async () => {
    setLoading(true);
    try {
      const [leaves, users] = await Promise.all([apiClient('/crud.php?table=leave_requests').catch(() => []), apiClient('/crud.php?table=users').catch(() => [])]);
      if (Array.isArray(leaves) && Array.isArray(users)) {
        const enriched = leaves.map(l => {
          const user = users.find(u => String(u.id) === String(l.user_id));
          return {
            ...l,
            user_name: user ? user.name : 'Unknown User',
            user_role: user ? user.role : 'Staf'
          };
        });

        // Sort by created_at DESC
        enriched.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setRequests(enriched);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchRequests();
  }, []);
  const handleUpdateStatus = (id: string, status: 'approved' | 'rejected') => {
    apiClient(`/crud.php?table=leave_requests&id=${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        status
      })
    }).then(() => {
      fetchRequests();
      setConfirmAction(null);
      triggerToast(`Berhasil ${status === 'approved' ? 'menyetujui' : 'menolak'} pengajuan izin.`);
    }).catch(err => {
      console.error(err);
      triggerToast('Gagal memperbarui status izin', 'error');
    });
  };
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800"><CheckCircle2 className="w-3.5 h-3.5" /> Disetujui</span>;
      case 'rejected':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider bg-red-100 text-red-800"><XCircle className="w-3.5 h-3.5" /> Ditolak</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800"><Clock className="w-3.5 h-3.5" /> Menunggu</span>;
    }
  };
  return <div className="space-y-6 relative">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && <motion.div initial={{
        opacity: 0,
        y: -20
      }} animate={{
        opacity: 1,
        y: 0
      }} exit={{
        opacity: 0,
        y: -20
      }} className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 font-bold text-xs ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
            {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
            <span>{toast.message}</span>
          </motion.div>}
      </AnimatePresence>

      <h1 className="text-2xl font-bold tracking-tight text-slate-800">Approval Perizinan Staf & Guru</h1>
      <Card>
        <CardContent className="p-6">
          {loading ? <div className="text-center py-10">Memuat data...</div> : requests.length === 0 ? <div className="text-center py-10 text-slate-500">Tidak ada data perizinan.</div> : <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="py-3 px-4 text-xs font-bold text-slate-600 uppercase">Nama Pemohon</th>
                      <th className="py-3 px-4 text-xs font-bold text-slate-600 uppercase">Peran</th>
                      <th className="py-3 px-4 text-xs font-bold text-slate-600 uppercase">Jenis Izin</th>
                      <th className="py-3 px-4 text-xs font-bold text-slate-600 uppercase">Tanggal</th>
                      <th className="py-3 px-4 text-xs font-bold text-slate-600 uppercase">Keterangan</th>
                      <th className="py-3 px-4 text-xs font-bold text-slate-600 uppercase text-center">Status</th>
                      <th className="py-3 px-4 text-xs font-bold text-slate-600 uppercase text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((r, i) => <tr key={r.id || i} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-4 px-4 text-sm font-bold text-slate-800">{r.user_name}</td>
                        <td className="py-4 px-4 text-sm font-medium text-slate-600 capitalize">{r.user_role?.replace('_', ' ')}</td>
                        <td className="py-4 px-4 text-sm font-medium text-slate-600 capitalize">{r.type?.replace('_', ' ')}</td>
                        <td className="py-4 px-4 text-sm font-medium text-slate-600">
                           {format(new Date(r.start_date), 'dd MMM yyyy', {
                    locale: id
                  })} - <br /> {format(new Date(r.end_date), 'dd MMM yyyy', {
                    locale: id
                  })}
                        </td>
                        <td className="py-4 px-4 text-sm font-medium text-slate-600">{r.reason}</td>
                        <td className="py-4 px-4 text-center">{getStatusBadge(r.status)}</td>
                        <td className="py-4 px-4 text-center">
                          {r.status === 'pending' ? <div className="flex items-center justify-center gap-2">
                               <button onClick={() => setConfirmAction({
                      id: r.id,
                      status: 'approved',
                      userName: r.user_name,
                      type: r.type
                    })} className="bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white px-3 py-1.5 rounded text-xs font-bold transition-colors cursor-pointer">
                                 Terima
                               </button>
                               <button onClick={() => setConfirmAction({
                      id: r.id,
                      status: 'rejected',
                      userName: r.user_name,
                      type: r.type
                    })} className="bg-red-50 text-red-600 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded text-xs font-bold transition-colors cursor-pointer">
                                 Tolak
                               </button>
                            </div> : <span className="text-xs text-slate-400 font-medium">Selesai</span>}
                        </td>
                      </tr>)}
                  </tbody>
                </table>
             </div>}
        </CardContent>
      </Card>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmAction && <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} exit={{
          opacity: 0
        }} onClick={() => setConfirmAction(null)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" />
            <motion.div initial={{
          opacity: 0,
          scale: 0.95,
          y: 10
        }} animate={{
          opacity: 1,
          scale: 1,
          y: 0
        }} exit={{
          opacity: 0,
          scale: 0.95,
          y: 10
        }} className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 z-10">
              <div className="p-6 text-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${confirmAction.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                  {confirmAction.status === 'approved' ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-2">
                  {confirmAction.status === 'approved' ? 'Setujui Permohonan Izin?' : 'Tolak Permohonan Izin?'}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Apakah Anda yakin ingin {confirmAction.status === 'approved' ? 'menyetujui' : 'menolak'} permohonan izin <strong>{confirmAction.userName}</strong> ({confirmAction.type?.replace('_', ' ')})?
                </p>
              </div>
              <div className="flex border-t border-slate-100 bg-slate-50 p-3 gap-3">
                <button type="button" onClick={() => setConfirmAction(null)} className="flex-1 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 bg-white cursor-pointer">
                  BATAL
                </button>
                <button type="button" onClick={() => handleUpdateStatus(confirmAction.id, confirmAction.status)} className={`flex-1 px-4 py-2 text-xs font-bold text-white rounded-lg transition-colors shadow-xs cursor-pointer ${confirmAction.status === 'approved' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}>
                  YA, {confirmAction.status === 'approved' ? 'SETUJUI' : 'TOLAK'}
                </button>
              </div>
            </motion.div>
          </div>}
      </AnimatePresence>
    </div>;
}
export function KamadIbadahGuru() {
  const [users, setUsers] = useState<any[]>([]);
  const [ibadahRecords, setIbadahRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState((function(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');})());
  const [viewMode, setViewMode] = useState<'harian' | 'mingguan'>('harian');

  // Calculate current week string (e.g., "2026-W31")
  const getWeekString = (d: Date) => {
    const date = new Date(d.getTime());
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    const week1 = new Date(date.getFullYear(), 0, 4);
    const week = 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
    return `${date.getFullYear()}-W${week.toString().padStart(2, '0')}`;
  };
  const [weekFilter, setWeekFilter] = useState(getWeekString(new Date()));
  useEffect(() => {
    fetchData();
  }, []);
  const fetchData = async () => {
    setLoading(true);
    try {
      const [uRes, iRes] = await Promise.all([apiClient('/crud.php?table=users'), apiClient('/crud.php?table=ibadah_guru').catch(() => [])]);
      const teachers = (uRes || []).filter((u: any) => {
        const r = u.roles ? typeof u.roles === 'string' ? JSON.parse(u.roles) : u.roles : [u.role];
        return r.includes('guru') || r.includes('walas') || r.includes('guru_quran') || r.includes('kamad');
      });
      setUsers(teachers);
      setIbadahRecords(iRes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text(`Laporan Sholat Zuhur Guru - ${viewMode === 'harian' ? 'Harian' : 'Mingguan'}`, 14, 15);
    doc.setFontSize(10);
    
    let titleStr = '';
    if (viewMode === 'harian') {
       const dStr = new Date(dateFilter).toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'});
       titleStr = `Tanggal Laporan: ${dStr}`;
    } else {
       const { start, end } = getWeekRange(weekFilter);
       const sStr = start.toLocaleDateString('id-ID', {day:'numeric', month:'short', year:'numeric'});
       const eStr = end.toLocaleDateString('id-ID', {day:'numeric', month:'short', year:'numeric'});
       titleStr = `Periode Laporan: ${sStr} - ${eStr}`;
    }
    doc.text(titleStr, 14, 22);

    let head = [];
    let body = [];
    
    if (viewMode === 'harian') {
       head = [['No.', 'Nama Guru', 'Jamaah/Tidak', 'Keterangan']];
       body = users.map((u, i) => {
         const record = ibadahRecords.find(r => {
           if (String(r.user_id) !== String(u.id)) return false;
           let recordDate = '';
           if (r.date) {
             const match = String(r.date).match(/^(\d{4}-\d{2}-\d{2})/);
             if (match) recordDate = match[1];
           } else if (r.created_at) {
             const match = String(r.created_at).match(/^(\d{4}-\d{2}-\d{2})/);
             if (match) recordDate = match[1];
           }
           return recordDate === dateFilter;
         });
         let status = 'Belum Mengisi';
         let ket = '-';
         if (record) {
           status = record.status;
           if (record.status === 'Tidak Jamaah' && record.keterangan) ket = record.keterangan;
         }
         return [i + 1, u.name, status, ket];
       });
    } else {
       head = [['No.', 'Nama Guru', 'Jml Jamaah', 'Jml Tidak Jamaah']];
       body = users.map((u, i) => {
          const { start, end } = getWeekRange(weekFilter);
          const startStr = `${start.getFullYear()}-${String(start.getMonth()+1).padStart(2,'0')}-${String(start.getDate()).padStart(2,'0')}`;
          const endStr = `${end.getFullYear()}-${String(end.getMonth()+1).padStart(2,'0')}-${String(end.getDate()).padStart(2,'0')}`;
          
          const weekRecords = ibadahRecords.filter(r => {
            if (String(r.user_id) !== String(u.id)) return false;
            let recordDate = '';
            if (r.date) {
              const match = String(r.date).match(/^(\d{4}-\d{2}-\d{2})/);
              if (match) recordDate = match[1];
            } else if (r.created_at) {
              const match = String(r.created_at).match(/^(\d{4}-\d{2}-\d{2})/);
              if (match) recordDate = match[1];
            }
            return recordDate >= startStr && recordDate <= endStr;
          });

          let jamaahCount = 0;
          let tidakJamaahCount = 0;
          const now = new Date();
          const todayStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
          
          for (let d = 0; d < 6; d++) {
            const currentDay = new Date(start);
            currentDay.setDate(start.getDate() + d);
            const filterDateStr = `${currentDay.getFullYear()}-${String(currentDay.getMonth() + 1).padStart(2, '0')}-${String(currentDay.getDate()).padStart(2, '0')}`;
            
            const record = weekRecords.find(r => {
              let recordDate = '';
              if (r.date) {
                const match = String(r.date).match(/^(\d{4}-\d{2}-\d{2})/);
                if (match) recordDate = match[1];
              } else if (r.created_at) {
                const match = String(r.created_at).match(/^(\d{4}-\d{2}-\d{2})/);
                if (match) recordDate = match[1];
              }
              return recordDate === filterDateStr;
            });

            if (record) {
              if (record.status === 'Jamaah') jamaahCount++;
              else tidakJamaahCount++;
            } else {
              let isFinalLate = false;
              if (filterDateStr < todayStr) isFinalLate = true;
              else if (filterDateStr === todayStr) {
                const currentHourMin = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
                if (currentHourMin > '17:00') isFinalLate = true;
              }
              if (isFinalLate) tidakJamaahCount++;
            }
          }
          return [i + 1, u.name, jamaahCount, tidakJamaahCount];
       });
    }

    autoTable(doc, {
      head: head,
      body: body,
      startY: 28,
      theme: 'grid'
    });
    doc.save(`Laporan_Ibadah_Guru_${viewMode}.pdf`);
  };

  const downloadExcel = () => {
    let rows = [];
    if (viewMode === 'harian') {
       rows = users.map((u, i) => {
         const record = ibadahRecords.find(r => {
           if (String(r.user_id) !== String(u.id)) return false;
           let recordDate = '';
           if (r.date) {
             const match = String(r.date).match(/^(\d{4}-\d{2}-\d{2})/);
             if (match) recordDate = match[1];
           } else if (r.created_at) {
             const match = String(r.created_at).match(/^(\d{4}-\d{2}-\d{2})/);
             if (match) recordDate = match[1];
           }
           return recordDate === dateFilter;
         });
         let status = 'Belum Mengisi';
         let ket = '-';
         if (record) {
           status = record.status;
           if (record.status === 'Tidak Jamaah' && record.keterangan) ket = record.keterangan;
         }
         return {
           'No.': i + 1,
           'Nama Guru': u.name,
           'Jamaah/Tidak': status,
           'Keterangan': ket
         };
       });
    } else {
       rows = users.map((u, i) => {
          const { start, end } = getWeekRange(weekFilter);
          const startStr = `${start.getFullYear()}-${String(start.getMonth()+1).padStart(2,'0')}-${String(start.getDate()).padStart(2,'0')}`;
          const endStr = `${end.getFullYear()}-${String(end.getMonth()+1).padStart(2,'0')}-${String(end.getDate()).padStart(2,'0')}`;
          
          const weekRecords = ibadahRecords.filter(r => {
            if (String(r.user_id) !== String(u.id)) return false;
            let recordDate = '';
            if (r.date) {
              const match = String(r.date).match(/^(\d{4}-\d{2}-\d{2})/);
              if (match) recordDate = match[1];
            } else if (r.created_at) {
              const match = String(r.created_at).match(/^(\d{4}-\d{2}-\d{2})/);
              if (match) recordDate = match[1];
            }
            return recordDate >= startStr && recordDate <= endStr;
          });

          let jamaahCount = 0;
          let tidakJamaahCount = 0;
          const now = new Date();
          const todayStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
          
          for (let d = 0; d < 6; d++) {
            const currentDay = new Date(start);
            currentDay.setDate(start.getDate() + d);
            const filterDateStr = `${currentDay.getFullYear()}-${String(currentDay.getMonth() + 1).padStart(2, '0')}-${String(currentDay.getDate()).padStart(2, '0')}`;
            
            const record = weekRecords.find(r => {
              let recordDate = '';
              if (r.date) {
                const match = String(r.date).match(/^(\d{4}-\d{2}-\d{2})/);
                if (match) recordDate = match[1];
              } else if (r.created_at) {
                const match = String(r.created_at).match(/^(\d{4}-\d{2}-\d{2})/);
                if (match) recordDate = match[1];
              }
              return recordDate === filterDateStr;
            });

            if (record) {
              if (record.status === 'Jamaah') jamaahCount++;
              else tidakJamaahCount++;
            } else {
              let isFinalLate = false;
              if (filterDateStr < todayStr) isFinalLate = true;
              else if (filterDateStr === todayStr) {
                const currentHourMin = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
                if (currentHourMin > '17:00') isFinalLate = true;
              }
              if (isFinalLate) tidakJamaahCount++;
            }
          }
          return {
           'No.': i + 1,
           'Nama Guru': u.name,
           'Jml Jamaah': jamaahCount,
           'Jml Tidak Jamaah': tidakJamaahCount
          };
       });
    }

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Ibadah");
    XLSX.writeFile(workbook, `Laporan_Ibadah_Guru_${viewMode}.xlsx`);
  };

  const getWeekRange = (weekStr: string) => {
    if (!weekStr) return {
      start: new Date(),
      end: new Date()
    };
    const [year, week] = weekStr.split('-W');
    const simple = new Date(parseInt(year), 0, 1 + (parseInt(week) - 1) * 7);
    const dow = simple.getDay();
    const ISOweekStart = simple;
    if (dow <= 4) ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);else ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
    const end = new Date(ISOweekStart);
    end.setDate(ISOweekStart.getDate() + 6);
    return {
      start: ISOweekStart,
      end: end
    };
  };
  return <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Monitoring Ibadah Guru</h1>
          <p className="text-slate-500 mt-1 text-sm">Pantau pelaksanaan sholat jamaah guru</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button onClick={() => setViewMode('harian')} className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${viewMode === 'harian' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            Harian
          </button>
          <button onClick={() => setViewMode('mingguan')} className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${viewMode === 'mingguan' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            Mingguan
          </button>
        </div>
      </div>

      <Card className="border-slate-200/60 shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-base font-bold text-slate-800">
              {viewMode === 'harian' ? 'Data Jamaah Zuhur Harian' : 'Rekapitulasi Mingguan'}
            </CardTitle>
            <div className="flex items-center gap-2">
              {viewMode === 'harian' ? <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white" /> : <input type="week" value={weekFilter} onChange={e => setWeekFilter(e.target.value)} className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white" />}
              <button onClick={downloadPDF} className="px-3 py-1.5 bg-rose-50 text-rose-600 font-bold text-sm border border-rose-200 rounded-lg hover:bg-rose-100 flex items-center gap-2">
                <FileText className="w-4 h-4" /> PDF
              </button>
              <button onClick={downloadExcel} className="px-3 py-1.5 bg-emerald-50 text-emerald-600 font-bold text-sm border border-emerald-200 rounded-lg hover:bg-emerald-100 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4" /> Excel
              </button>
            </div>
          </div>
          
          <div className="px-4 pb-4 sm:px-6 bg-slate-50/50">
            <p className="text-sm font-semibold text-slate-600">
              {viewMode === 'harian' 
                ? `Tanggal Laporan: ${new Date(dateFilter).toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'})}`
                : (() => {
                    const { start, end } = getWeekRange(weekFilter);
                    return `Periode Laporan: ${start.toLocaleDateString('id-ID', {day:'numeric', month:'short', year:'numeric'})} - ${end.toLocaleDateString('id-ID', {day:'numeric', month:'short', year:'numeric'})}`;
                  })()
              }
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? <div className="p-8 text-center text-slate-500">Memuat data...</div> : viewMode === 'harian' ? <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Guru</th>
                    <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Jamaah/Tidak</th>
                    <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u, i) => {
                const record = ibadahRecords.find(r => {
                  if (String(r.user_id) !== String(u.id)) return false;
                  let recordDate = '';
                  if (r.date) {
                    const match = String(r.date).match(/^(\d{4}-\d{2}-\d{2})/);
                    if (match) recordDate = match[1];
                  } else if (r.created_at) {
                    const match = String(r.created_at).match(/^(\d{4}-\d{2}-\d{2})/);
                    if (match) recordDate = match[1];
                  }
                  return recordDate === dateFilter;
                });
                return <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold uppercase shrink-0 text-xs">
                              {u.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 text-sm">{u.name}</p>
                              <p className="text-xs text-slate-500">{u.role}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {record?.status === 'Jamaah' ? <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Jamaah
                            </span> : record?.status === 'Tidak Jamaah' ? <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Tidak Jamaah
                            </span> : <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold border border-slate-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Belum Mengisi
                            </span>}
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600">
                          {record?.status === 'Tidak Jamaah' && record?.keterangan ? <span className="italic">"{record.keterangan}"</span> : <span className="text-slate-400">-</span>}
                        </td>
                      </tr>;
              })}
                </tbody>
              </table>
            </div> : <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Guru</th>
                    <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Jml Jamaah</th>
                    <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Jml Tidak Jamaah</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u, i) => {
                const {
                  start,
                  end
                } = getWeekRange(weekFilter);
                const startStr = `${start.getFullYear()}-${String(start.getMonth()+1).padStart(2,'0')}-${String(start.getDate()).padStart(2,'0')}`;
                const endStr = `${end.getFullYear()}-${String(end.getMonth()+1).padStart(2,'0')}-${String(end.getDate()).padStart(2,'0')}`;
                const weekRecords = ibadahRecords.filter(r => {
                  if (String(r.user_id) !== String(u.id)) return false;
                  let recordDate = '';
                  if (r.date) {
                    const match = String(r.date).match(/^(\d{4}-\d{2}-\d{2})/);
                    if (match) recordDate = match[1];
                  } else if (r.created_at) {
                    const match = String(r.created_at).match(/^(\d{4}-\d{2}-\d{2})/);
                    if (match) recordDate = match[1];
                  }
                  return recordDate >= startStr && recordDate <= endStr;
                });
                let jamaahCount = 0;
                let tidakJamaahCount = 0;
                const now = new Date();
                const todayStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
                
                for (let d = 0; d < 6; d++) {
                  const currentDay = new Date(start);
                  currentDay.setDate(start.getDate() + d);
                  const filterDateStr = `${currentDay.getFullYear()}-${String(currentDay.getMonth() + 1).padStart(2, '0')}-${String(currentDay.getDate()).padStart(2, '0')}`;
                  
                  const record = weekRecords.find(r => {
                    let recordDate = '';
                    if (r.date) {
                      const match = String(r.date).match(/^(\d{4}-\d{2}-\d{2})/);
                      if (match) recordDate = match[1];
                    } else if (r.created_at) {
                      const match = String(r.created_at).match(/^(\d{4}-\d{2}-\d{2})/);
                      if (match) recordDate = match[1];
                    }
                    return recordDate === filterDateStr;
                  });

                  if (record) {
                    if (record.status === 'Jamaah') jamaahCount++;
                    else tidakJamaahCount++;
                  } else {
                    let isFinalLate = false;
                    if (filterDateStr < todayStr) isFinalLate = true;
                    else if (filterDateStr === todayStr) {
                      const currentHourMin = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
                      if (currentHourMin > '17:00') isFinalLate = true;
                    }
                    if (isFinalLate) tidakJamaahCount++;
                  }
                }
                return <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold uppercase shrink-0 text-xs">
                              {u.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 text-sm">{u.name}</p>
                              <p className="text-xs text-slate-500">{u.role}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg font-bold border border-emerald-100">
                            {jamaahCount}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-block px-3 py-1 bg-rose-50 text-rose-700 rounded-lg font-bold border border-rose-100">
                            {tidakJamaahCount}
                          </span>
                        </td>
                      </tr>;
              })}
                </tbody>
              </table>
            </div>}
        </CardContent>
      </Card>
    </div>;
}
export function KamadLaporanBKPustaka() {
  const _syncTick = useRealtime();
  const [selectedSemester, setSelectedSemester] = useState('Ganjil 2026/2027');
  const [laporan, setLaporan] = useState<any[]>([]);
  const [usersMap, setUsersMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const semesters = [{
    value: 'Ganjil 2026/2027',
    label: 'Ganjil 2026/2027 (Aktif)'
  }, {
    value: 'Genap 2025/2026',
    label: 'Genap 2025/2026'
  }];
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [laporanData, usersData] = await Promise.all([apiClient('/crud.php?table=laporan_harian').catch(() => []), apiClient('/crud.php?table=users').catch(() => [])]);
        const uMap: Record<string, string> = {};
        if (Array.isArray(usersData)) {
          usersData.forEach((u: any) => {
            uMap[u.id] = u.name;
          });
        }
        setUsersMap(uMap);
        if (Array.isArray(laporanData)) {
          // sort descending by date and created_at
          laporanData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          setLaporan(laporanData);
        }
      } catch (err) {
        console.error('Failed to fetch laporan data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [_syncTick]);
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return 'Hari Ini';
    return d.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };
  const laporanBK = laporan.filter(l => l.role === 'bk');
  const laporanPustaka = laporan.filter(l => l.role === 'pustakawan');
  return <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Laporan Harian BK & Pustakawan</h1>
          <p className="text-slate-500 mt-1 text-sm">Pantau log aktivitas harian Guru BK dan Pustakawan.</p>
        </div>
        <select value={selectedSemester} onChange={e => setSelectedSemester(e.target.value)} className="w-full sm:w-auto p-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
          {semesters.map((s, i) => <option key={i} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Laporan Guru BK</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? <p className="text-sm text-slate-500 text-center py-4">Memuat data...</p> : laporanBK.length > 0 ? laporanBK.map((item, idx) => <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-slate-500 font-bold">{formatDate(item.date)}</p>
                      <p className="text-[10px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded font-bold">{usersMap[item.user_id] || 'Guru BK'}</p>
                    </div>
                    <p className="text-sm font-medium text-slate-700">{item.activity}</p>
                  </div>) : <p className="text-sm text-slate-500 italic text-center py-4">Belum ada laporan BK.</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Laporan Pustakawan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? <p className="text-sm text-slate-500 text-center py-4">Memuat data...</p> : laporanPustaka.length > 0 ? laporanPustaka.map((item, idx) => <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-slate-500 font-bold">{formatDate(item.date)}</p>
                      <p className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded font-bold">{usersMap[item.user_id] || 'Pustakawan'}</p>
                    </div>
                    <p className="text-sm font-medium text-slate-700">{item.activity}</p>
                  </div>) : <p className="text-sm text-slate-500 italic text-center py-4">Belum ada laporan Pustakawan.</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>;
}