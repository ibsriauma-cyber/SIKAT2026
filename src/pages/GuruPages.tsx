const formatDateStr = (dateStr: any) => { if (!dateStr || dateStr === '-') return '-'; const d = new Date(dateStr); return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }); };
const norm = (str: any) => String(str || '').trim().toLowerCase().replace(/[\s\-_]/g, '');
import { useRealtime } from "../lib/useRealtime";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import React, { useState, useEffect } from 'react';
import { remoteStorage } from '../lib/remoteStorage';
import { useAuth } from '../context/AuthContext';
import { apiClient, logKinerja } from '../lib/apiClient';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { mockStudents, mockClasses } from '../data/mock';
import { MapPin, Edit2, Trash2, Download, FileText, Check, AlertCircle, Search, Plus, X, Clock, BookOpen, Users, ExternalLink, Link2, CheckCircle2, Eye, Calendar, RefreshCw } from 'lucide-react';
import { CustomSelect } from '../components/ui/CustomSelect';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
export interface TeacherSubject {
  id: string;
  subjectName: string;
  className: string;
}
export function getTeacherSubjects(): TeacherSubject[] {
  if (typeof window !== 'undefined') {
    const stored = remoteStorage.getItem('guru_subjects');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {}
    }
  }
  return [];
}
export function saveTeacherSubjects(subjects: TeacherSubject[]) {
  if (typeof window !== 'undefined') {
    remoteStorage.setItem('guru_subjects', JSON.stringify(subjects));
  }
}
export function DataSiswa() {
  const _syncTick = useRealtime();
  const {
    user
  } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      apiClient('/crud.php?table=students').then(data => {
        if (Array.isArray(data)) {
          setStudents(data);
        }
      }).catch(console.error);
      apiClient('/crud.php?table=schedules').then(data => {
        if (Array.isArray(data)) {
          setSchedules(data);
        }
      }).catch(console.error);
    }
  }, [_syncTick]);
  const walasClass = user?.className || user?.class_name;
  const isWalas = user?.role === 'walas';
  const isRestrictedRole = user?.role === 'guru' || user?.role === 'guru_quran' || user?.role === 'walas';

  // Calculate allowed classes based on user role and schedules
  let allowedClasses: string[] = [];
  if (isRestrictedRole) {
    if (user?.subjects) {
      allowedClasses = [...allowedClasses, ...user.subjects.map(s => s.className)];
    }
    if (isWalas && walasClass) {
      allowedClasses.push(walasClass);
    }
    const teacherSchedules = schedules.filter((s: any) => String(s.teacher_id) === String(user?.id));
    const scheduledClasses = Array.from(new Set(teacherSchedules.map((s: any) => s.class_name))).filter(Boolean) as string[];
    allowedClasses = [...allowedClasses, ...scheduledClasses];
    allowedClasses = Array.from(new Set(allowedClasses));
  }
  const studentsList = students.length > 0 ? students : mockStudents;
  const availableClasses = (isRestrictedRole ? Array.from(new Set(studentsList.filter(s => allowedClasses.includes(s.className || s.class_name)).map(s => s.className || s.class_name))).sort() : Array.from(new Set(studentsList.map(s => s.className || s.class_name))).sort()) as string[];

  // If Walas, force selectedClass to user.className and hide filter
  useEffect(() => {
    if (isWalas && walasClass) {
      setSelectedClass(walasClass);
    }
  }, [isWalas, walasClass]);
  const filteredStudents = studentsList.filter(s => {
    const sClass = s.className || s.class_name;
    const sName = s.name || s.nama || '';
    if (isRestrictedRole && !allowedClasses.includes(sClass)) {
      return false;
    }
    const matchSearch = sName.toLowerCase().includes(searchQuery.toLowerCase()) || sClass.toLowerCase().includes(searchQuery.toLowerCase()) || (s.nis || '').includes(searchQuery);
    const matchClass = selectedClass ? sClass === selectedClass : true;
    return matchSearch && matchClass;
  });
  return <div className="space-y-6">
      <h1 className="text-xl font-bold tracking-tight text-slate-800">Data Siswa</h1>
      
      <Card>
        <CardHeader className="pb-4 border-b border-slate-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>Daftar Siswa {isWalas && walasClass ? `Kelas ${walasClass}` : ''}</CardTitle>
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              {user?.role !== 'walas' && <div className="w-full sm:w-48">
                  <CustomSelect value={selectedClass} onChange={setSelectedClass} disabled={false} options={[{
                value: '',
                label: 'Semua Kelas'
              }, ...availableClasses.map(c => ({
                value: c,
                label: c
              }))]} placeholder="Pilih Kelas" />
                </div>}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input type="text" placeholder="Cari nama atau kelas..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none" />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs text-slate-500 uppercase">
                  <th className="pb-3 px-4 font-bold">Nama Siswa</th>
                  <th className="pb-3 px-4 font-bold">Kelas</th>
                  <th className="pb-3 px-4 font-bold">L/P</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length > 0 ? filteredStudents.map(s => <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors group">
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-800 text-sm">{s.name || s.nama}</p>
                        <p className="text-xs text-slate-500">{s.nis}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase tracking-wider">
                          {s.className || s.class_name}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-600 text-sm">
                          {s.gender || s.jenis_kelamin || '-'}
                        </span>
                      </td>
                    </tr>) : <tr>
                    <td colSpan={3} className="py-8 text-center text-slate-500 text-sm">
                      Tidak ada data siswa yang ditemukan.
                    </td>
                  </tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>;
}
export function JadwalMengajar() {
  const _syncTick = useRealtime();
  const {
    user
  } = useAuth();
  const navigate = useNavigate();
  const canEdit = user?.role === 'admin' || user?.role === 'wakakurikulum';
  const getTodayName = () => {
    const dayIndex = new Date().getDay();
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return days[dayIndex] === 'Minggu' ? 'Senin' : days[dayIndex];
  };
  const [filterHari, setFilterHari] = useState(getTodayName());
  const [loading, setLoading] = useState(true);
  const [jadwal, setJadwal] = useState<any[]>([]);
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoading(true);
        // Fetch from API
        const data = await apiClient('/crud.php?table=schedules');
        if (Array.isArray(data)) {
          // Filter out schedules just for this teacher if not admin/wakakurikulum
          // Wait, if it's admin, they might want to see all. But the page is for 'Guru'.
          // Let's filter by user.id if not admin.
          const teacherSchedules = data.filter((d: any) => String(d.teacher_id) === String(user?.id));
          const mapped = teacherSchedules.map((d: any) => ({
            id: d.id,
            hari: d.day || 'Senin',
            time: (d.start_time?.substring(0, 5) || '') + ' - ' + (d.end_time?.substring(0, 5) || ''),
            kelas: d.class_name,
            mapel: d.subject_name
          }));
          setJadwal(mapped);
        }
      } catch (err) {
        console.error('Failed to load schedules', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedules();
  }, [user, canEdit, _syncTick]);
  const hariOptions = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const filteredJadwal = jadwal.filter(j => j.hari === filterHari).sort((a, b) => {
    const timeA = a.time.split(' - ')[0] || '';
    const timeB = b.time.split(' - ')[0] || '';
    return timeA.localeCompare(timeB);
  });
  return <div className="space-y-6">
      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-600">Filter Hari:</span>
              <div className="w-[150px]">
                <CustomSelect value={filterHari} onChange={setFilterHari} options={hariOptions.map(h => ({
                value: h,
                label: h
              }))} />
              </div>
            </div>
            {canEdit && <button onClick={() => user?.role === 'admin' ? navigate('/admin/jadwal') : navigate('/kurikulum/jadwal')} className="px-4 py-2 bg-[#0d7345] hover:bg-[#0a5c37] text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors">
                <Plus className="w-4 h-4" /> Tambah Jadwal
              </button>}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs text-slate-500 uppercase">
                  <th className="pb-3 px-4 font-bold">Hari</th>
                  <th className="pb-3 px-4 font-bold">Waktu</th>
                  <th className="pb-3 px-4 font-bold">Kelas</th>
                  <th className="pb-3 px-4 font-bold">Mata Pelajaran</th>
                  {canEdit && <th className="pb-3 px-4 font-bold text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody>
                {filteredJadwal.length > 0 ? filteredJadwal.map(j => <tr key={j.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 text-sm font-bold text-slate-800">{j.hari}</td>
                      <td className="py-3 px-4 text-sm font-medium text-slate-600">{j.time}</td>
                      <td className="py-3 px-4 text-sm text-slate-700">{j.kelas}</td>
                      <td className="py-3 px-4">
                        <span className="text-sm font-bold text-slate-800">{j.mapel}</span>
                      </td>
                      {canEdit && <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => user?.role === 'admin' ? navigate('/admin/jadwal') : navigate('/kurikulum/jadwal')} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded" title="Edit">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => user?.role === 'admin' ? navigate('/admin/jadwal') : navigate('/kurikulum/jadwal')} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Hapus">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>}
                    </tr>) : <tr>
                    <td colSpan={canEdit ? 5 : 4} className="py-8 text-center text-slate-500 text-sm">
                      Tidak ada jadwal ditemukan.
                    </td>
                  </tr>}
              </tbody>
            </table>
          </div>

          {/* Mobile Card-List View */}
          <div className="md:hidden flex flex-col gap-3">
            {filteredJadwal.length > 0 ? filteredJadwal.map(j => <div key={j.id} className="p-4 bg-white border border-slate-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50/20 transition-all shadow-sm flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md">
                      {j.hari}
                    </span>
                    <span className="text-xs font-mono font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> {j.time}
                    </span>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 leading-tight flex items-start gap-1.5">
                      <BookOpen className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{j.mapel}</span>
                    </h3>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1 bg-slate-50 border border-slate-200/60 rounded px-2 py-0.5 font-bold">
                      <Users className="w-3.5 h-3.5 text-slate-400" /> {j.kelas}
                    </span>
                  </div>

                  {canEdit && <div className="flex justify-end gap-2 pt-2.5 border-t border-slate-100 mt-1">
                      <button onClick={() => user?.role === 'admin' ? navigate('/admin/jadwal') : navigate('/kurikulum/jadwal')} className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-emerald-100" title="Edit">
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button onClick={() => user?.role === 'admin' ? navigate('/admin/jadwal') : navigate('/kurikulum/jadwal')} className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-100" title="Hapus">
                        <Trash2 className="w-3.5 h-3.5" /> Hapus
                      </button>
                    </div>}

                </div>) : <div className="py-8 text-center text-slate-400 text-sm">
                Tidak ada jadwal ditemukan.
              </div>}
          </div>
        </CardContent>
      </Card>
    </div>;
}
export function Absensi() {
  const norm = (str: any) => String(str || '').trim().toLowerCase().replace(/[\s\-_]/g, '');
  const _syncTick = useRealtime();
  const {
    user
  } = useAuth();
  const [attendance, setAttendance] = useState<Record<string, {
    status: string;
    ket: string;
  }>>({});
  const [isLocked, setIsLocked] = useState(false);
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [dbClasses, setDbClasses] = useState<string[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [schedulesLoaded, setSchedulesLoaded] = useState(false);
  const [teachingAssignments, setTeachingAssignments] = useState<any[]>([]);
  const [studentAttendance, setStudentAttendance] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [jurnals, setJurnals] = useState<any[]>([]);
  const [ibadahSiswa, setIbadahSiswa] = useState<any[]>([]);
  const [semester, setSemester] = useState('Ganjil');
  useEffect(() => {
    apiClient('/crud.php?table=academic_terms').then(data => {
      if (Array.isArray(data)) {
        const selectedTermId = remoteStorage.getItem('selectedAcademicTermId');
        let activeTerm = null;
        if (selectedTermId) activeTerm = data.find((t: any) => String(t.id) === selectedTermId);
        if (!activeTerm) activeTerm = data.find((t: any) => Boolean(t.is_active));
        if (activeTerm) setSemester(activeTerm.semester || 'Ganjil');
      }
    }).catch(console.error);
    apiClient('/crud.php?table=classes').then(data => {
      if (Array.isArray(data)) {
        setDbClasses(data.map((c: any) => c.name));
      }
    }).catch(console.error);
    apiClient('/crud.php?table=students').then(data => {
      if (Array.isArray(data)) {
        setStudentsList(data);
      }
    }).catch(console.error);
    apiClient('/crud.php?table=schedules').then(data => {
      if (Array.isArray(data)) {
        setSchedules(data);
      }
      setSchedulesLoaded(true);
    }).catch(err => {
      console.error(err);
      setSchedulesLoaded(true);
    });
    apiClient('/crud.php?table=teaching_assignments').then(data => {
      if (Array.isArray(data)) {
        setTeachingAssignments(data);
      }
    }).catch(console.error);
    apiClient('/crud.php?table=student_attendance').then(data => {
      if (Array.isArray(data)) setStudentAttendance(data);
    }).catch(console.error);
    apiClient('/crud.php?table=grades').then(data => {
      if (Array.isArray(data)) setGrades(data);
    }).catch(console.error);
    apiClient('/crud.php?table=laporan_harian').then(data => {
      if (Array.isArray(data)) setJurnals(data);
    }).catch(console.error);
    apiClient('/crud.php?table=ibadah_siswa').then(data => {
      if (Array.isArray(data)) setIbadahSiswa(data);
    }).catch(console.error);
  }, [_syncTick]);
  const isWalasRole = user?.role === 'walas';
  const isWalas = user?.role === 'walas';
  const isGuru = user?.role === 'guru' || user?.role === 'guru_mapel';
  const walasClass = user?.className || user?.class_name;

  // Ambil data plotting sesuai dengan ID guru
  const teacherAssignments = teachingAssignments.filter((a: any) => String(a.teacher_id) === String(user?.id));
  const teacherSchedulesAbs = schedules.filter((s: any) => String(s.teacher_id) === String(user?.id));
  const assignedClassesFromAssignments = teacherAssignments.map((a: any) => a.class_name);
  const assignedClassesFromSchedules = teacherSchedulesAbs.map((s: any) => s.class_name);
  const assignedClasses = Array.from(new Set([...assignedClassesFromAssignments, ...assignedClassesFromSchedules])).filter(Boolean) as string[];
  let availableClasses = Array.from(new Set([...assignedClasses, ...(user?.subjects || []).map((s: any) => s.className || s.class_name)])).filter(Boolean).sort() as string[];
  if (isWalasRole && walasClass) {
    availableClasses = [walasClass];
  } else if (isWalas && walasClass) {
    availableClasses = Array.from(new Set([walasClass, ...availableClasses]));
  }
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedMapel, setSelectedMapel] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => (function(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');})());
  useEffect(() => {
    if (selectedClass && selectedMapel) {
      const storageKey = `attendance_${selectedClass}_${selectedMapel}`;
      const existingData = JSON.parse(remoteStorage.getItem(storageKey) || '{}');
      const today = selectedDate;
      const norm = (str: any) => String(str || '').trim().toLowerCase().replace(/[\s\-_]/g, '');
      const dbAtts = studentAttendance.filter((a: any) => {
        const classOk = norm(a.class_name) === norm(selectedClass);
        const mapelOk = selectedMapel === 'Presensi Wali Kelas' ? !a.subject_name || norm(a.subject_name) === norm('Presensi Wali Kelas') : norm(a.subject_name) === norm(selectedMapel);
        const dateStr = String(a.date || '').split('T')[0];
        return classOk && mapelOk && dateStr === today;
      });
      if (dbAtts.length > 0) {
        const loadedAtt: Record<string, {
          status: string;
          ket: string;
        }> = {};
        dbAtts.forEach((a: any) => {
          loadedAtt[a.student_id] = {
            status: a.status,
            ket: a.notes || a.ket || ''
          };
        });
        setAttendance(loadedAtt);
        setIsLocked(true);
      } else if (existingData[today]) {
        setAttendance(existingData[today]);
        setIsLocked(true);
      } else {
        const classStudents = studentsList.filter(s => norm(s.class_name || s.className) === norm(selectedClass));
        const mockClassStudents = mockStudents.filter(s => norm(s.className) === norm(selectedClass));
        const targetStudents = classStudents.length > 0 ? classStudents : mockClassStudents.length > 0 ? mockClassStudents : mockStudents;
        const defaultAtt: Record<string, {
          status: string;
          ket: string;
        }> = {};
        targetStudents.forEach(s => {
          defaultAtt[s.id] = {
            status: 'Hadir',
            ket: ''
          };
        });
        setAttendance(defaultAtt);
        setIsLocked(false);
      }
    }
  }, [selectedClass, selectedMapel, studentsList, selectedDate, studentAttendance]);
  useEffect(() => {
    if (!selectedClass && availableClasses.length > 0) {
      if (isWalasRole && walasClass) {
        setSelectedClass(walasClass);
      } else {
        setSelectedClass(availableClasses[0]);
      }
    }
  }, [availableClasses, walasClass, isWalasRole, selectedClass]);
  const classAssignments = teacherAssignments.filter((a: any) => a.class_name === selectedClass);
  const classSchedules = teacherSchedulesAbs.filter((s: any) => s.class_name === selectedClass);
  const subjectsFromAssignments = classAssignments.map((a: any) => a.subject_name);
  const subjectsFromSchedules = classSchedules.map((s: any) => s.subject_name);
  const classSubjectsList = Array.from(new Set([...subjectsFromAssignments, ...subjectsFromSchedules, ...(user?.subjects || []).filter((s: any) => norm(s.className || s.class_name) === norm(selectedClass)).map((s: any) => s.subjectName || s.subject_name)])).filter(Boolean) as string[];
  let availableMapel = classSubjectsList;
  const isGuruMode = user?.role === 'guru_mapel' || user?.role === 'guru_quran';
  const showWalasPresensi = isWalas && selectedClass === walasClass && !isGuruMode;
  if (isWalasRole) {
    availableMapel = ['Presensi Wali Kelas'];
  } else if (showWalasPresensi) {
    availableMapel = ['Presensi Wali Kelas', ...classSubjectsList];
  }
  if (availableMapel.length === 0 && showWalasPresensi) {
    availableMapel = ['Presensi Wali Kelas'];
  }
  useEffect(() => {
    if (availableMapel.length > 0 && !availableMapel.includes(selectedMapel)) {
      if (isWalasRole || showWalasPresensi) {
        setSelectedMapel('Presensi Wali Kelas');
      } else {
        setSelectedMapel(availableMapel[0] || '');
      }
    }
  }, [selectedClass, availableMapel, selectedMapel, isWalasRole, showWalasPresensi]);
  const limitAbsenSiswa = remoteStorage.getItem('limit_absen_siswa') || '15:00';
  const [limitHour, limitMinute] = limitAbsenSiswa.split(':').map(Number);
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const isLate = (currentHour > limitHour || currentHour === limitHour && currentMinute >= limitMinute) && selectedDate === (function(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');})();
  
  // Walas morning limit 07:30
  const isWalasMorningLate = (currentHour > 7 || (currentHour === 7 && currentMinute > 30)) && selectedDate === (function(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');})() && selectedMapel === 'Presensi Wali Kelas';

  if (isLate) {
    return <div className="space-y-6">
        <h1 className="text-xl font-bold tracking-tight text-slate-800">Presensi Kehadiran Siswa</h1>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-8 text-center">
            <div className="flex justify-center mb-4">
              <AlertCircle className="w-12 h-12 text-red-500" />
            </div>
            <h2 className="text-lg font-bold text-red-700 mb-2">Batas Waktu Pengisian Terlewat</h2>
            <p className="text-red-600">
              Anda tidak dapat mengisi absensi karena telah melewati pukul {limitAbsenSiswa}. 
              Kejadian ini telah dicatat sebagai pelanggaran disiplin pada sistem Kepala Madrasah.
            </p>
          </CardContent>
        </Card>
      </div>;
  }
  const handleSetStatus = (id: string, status: string) => {
    if (isLocked) return;
    setAttendance(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        status: prev[id]?.status === status ? '' : status
      }
    }));
  };
  const handleSetKet = (id: string, ket: string) => {
    if (isLocked) return;
    setAttendance(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        ket
      }
    }));
  };
  const hasScheduleForClass = !selectedClass || schedules.length === 0 || schedules.some((s: any) => s.class_name === selectedClass || s.rombel === selectedClass);
  const hasScheduleForSubject = selectedMapel === 'Presensi Wali Kelas' || schedules.length === 0 || schedules.some((s: any) => (s.class_name === selectedClass || s.rombel === selectedClass) && (s.subject_name === selectedMapel || s.mapel === selectedMapel));
  const isScheduleCreated = schedules.length > 0;
  const handleSave = async () => {
    if (!selectedClass) {
      window.alert("Pilih kelas terlebih dahulu!");
      return;
    }
    if (availableMapel.length > 0 && !selectedMapel) {
      window.alert("Pilih mata pelajaran terlebih dahulu!");
      return;
    }
    if (!isScheduleCreated) {
      window.alert("Jadwal belum dibuat oleh Wakakurikulum dan Admin! Pengisian absensi belum dapat diproses.");
      return;
    }
    if (selectedMapel !== 'Presensi Wali Kelas' && !hasScheduleForSubject) {
      window.alert(`Jadwal pelajaran ${selectedMapel} untuk ${selectedClass} belum dibuat oleh Wakakurikulum dan Admin!`);
      return;
    }

    // Save to remote storage to persist locally
    const storageKey = `attendance_${selectedClass}_${selectedMapel}`;
    const existingData = JSON.parse(remoteStorage.getItem(storageKey) || '{}');
    const today = selectedDate;
    existingData[today] = attendance;
    remoteStorage.setItem(storageKey, JSON.stringify(existingData));

    // Save to database
    try {
      await apiClient('/query.php', {
        method: 'POST',
        body: JSON.stringify({
          query: `DELETE FROM student_attendance WHERE class_name = '${selectedClass.replace(/'/g, "\\'")}' AND subject_name = '${selectedMapel.replace(/'/g, "\\'")}' AND date = '${today}'`
        })
      });

      let hasError = false;
      await Promise.all(Object.entries(attendance).map(async ([studentId, data]: [string, any]) => {
        if (!data.status) return;

        const studentData = studentsList.find(s => String(s.id) === String(studentId)) || mockStudents.find(s => String(s.id) === String(studentId));

        const payload = {
          student_id: studentId,
          class_name: selectedClass,
          subject_name: selectedMapel,
          user_id: user?.id,
          student_name: studentData ? (studentData.name || studentData.student_name || 'Unknown') : 'Unknown',
          date: today,
          semester: semester,
          status: data.status,
          notes: data.ket || ''
        };
        try {
          await apiClient('/crud.php?table=student_attendance', {
            method: 'POST',
            body: JSON.stringify(payload)
          });
        } catch (err) {
          hasError = true;
          throw err;
        }
      }));
      
      if (hasError) throw new Error("Failed to save some records");

      const freshAtt = await apiClient('/crud.php?table=student_attendance');
      if (Array.isArray(freshAtt)) setStudentAttendance(freshAtt);
      
      setIsLocked(true);
      if (user?.id) {
        const taskName = selectedMapel === 'Presensi Wali Kelas' ? 'Absensi siswa binaan pada pagi hari' : `Absen ${selectedClass} (${selectedMapel})`;
        await logKinerja(user.id, taskName);
      }
      window.alert("Absensi berhasil disimpan!");
    } catch (e) {
      console.error('Failed to save to database', e);
      window.alert("Gagal menyimpan absensi ke server.");
    }
  };
  const showStudents = selectedClass !== '' && (availableMapel.length === 0 || selectedMapel !== '');
  const isScheduleValid = isScheduleCreated && (selectedMapel === 'Presensi Wali Kelas' || hasScheduleForSubject);
  return <div className="space-y-4">
      {/* Walas Morning Late Warning */}
      {isWalasMorningLate && !isLate && (
        <Card className="border-amber-200 bg-amber-50 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3 text-amber-800">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <p className="text-xs sm:text-sm font-medium">
              <strong>Peringatan Keterlambatan:</strong> Anda mengisi presensi melewati batas ideal pukul 07:30 WIB. Anda masih dapat menyimpan presensi hingga batas akhir ({limitAbsenSiswa}), namun ini akan tercatat sebagai keterlambatan pada sistem Kepala Madrasah.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Schedule Warning Banner if not created by Wakakurikulum/Admin */}
      {schedulesLoaded && !isScheduleCreated && <Card className="border-amber-200 bg-amber-50 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3 text-amber-800">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <p className="text-xs sm:text-sm font-medium">
              <strong>Jadwal Pelajaran Belum Dibuat:</strong> Pengisian absensi baru dapat dilakukan setelah jadwal pelajaran dibuat oleh Wakakurikulum atau Administrator.
            </p>
          </CardContent>
        </Card>}

      {schedulesLoaded && isScheduleCreated && selectedClass && selectedMapel && selectedMapel !== 'Presensi Wali Kelas' && !hasScheduleForSubject && <Card className="border-amber-200 bg-amber-50 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3 text-amber-800">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <p className="text-xs sm:text-sm font-medium">
              Jadwal pelajaran untuk mata pelajaran <strong>{selectedMapel}</strong> di kelas <strong>{selectedClass}</strong> belum dibuat oleh Wakakurikulum / Admin.
            </p>
          </CardContent>
        </Card>}

      {/* Top Bar */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Absensi Kehadiran</h2>
            <p className="text-sm text-slate-500 mt-0.5">Masukkan data kehadiran siswa</p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">
            <div className="w-full md:w-[150px]">
              <input type="date" max={(function(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');})()} value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 font-bold text-slate-700" />
            </div>
              {/* Kelas & Mapel Side-by-Side on HP */}
              <div className="grid grid-cols-2 gap-2 w-full md:flex md:w-auto md:gap-3">
                <div className="w-full md:w-[150px]">
                  <CustomSelect value={selectedClass} onChange={setSelectedClass} disabled={false} options={[{
                value: '',
                label: 'Pilih Kelas'
              }, ...availableClasses.map(c => ({
                value: String(c),
                label: String(c)
              }))]} />
                </div>
                
                <div className="w-full md:w-[150px]">
                  <CustomSelect value={selectedMapel} onChange={setSelectedMapel} disabled={availableMapel.length <= 1} options={[{
                value: '',
                label: 'Pilih Mapel'
              }, ...availableMapel.map(m => ({
                value: String(m),
                label: String(m)
              }))]} />
                </div>
              </div>

            {/* Simpan Button below them on HP */}
            {isLocked ? <button onClick={() => setIsLocked(false)} className="w-full md:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 whitespace-nowrap transition-colors shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                Edit Absensi
              </button> : <button onClick={handleSave} className="w-full md:w-auto px-5 py-2.5 bg-[#1e7b55] hover:bg-[#166544] text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 whitespace-nowrap transition-colors shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
                Simpan
              </button>}
            </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase w-16 text-center">No</th>
                <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase whitespace-nowrap">Nama Siswa</th>
                <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase text-center min-w-[240px]">Status Kehadiran</th>
                <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase">Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {showStudents ? (() => {
              const filteredDb = studentsList.filter((s: any) => s.class_name === selectedClass || s.className === selectedClass);
              const filteredMock = mockStudents.filter((s: any) => s.className === selectedClass || s.class_name === selectedClass);
              const studentData = filteredDb.length > 0 ? filteredDb : filteredMock.length > 0 ? filteredMock : mockStudents;
              return studentData.map((s: any, i: number) => {
                const stat = attendance[s.id]?.status || '';
                const ket = attendance[s.id]?.ket || '';
                return <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-4 text-sm font-medium text-slate-500 text-center">{i + 1}</td>
                      <td className="py-4 px-4 text-sm font-bold text-slate-800 whitespace-nowrap">{s.name}</td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {['Hadir', 'Izin', 'Sakit', 'Alpa', 'Cabut'].map(st => {
                        let bgActive = '';
                        let textActive = 'text-white';
                        let bgInactive = '';
                        let textInactive = '';
                        let hoverBg = '';
                        if (st === 'Hadir') {
                          bgActive = 'bg-emerald-500';
                          bgInactive = 'bg-emerald-50';
                          textInactive = 'text-emerald-600';
                          hoverBg = 'hover:bg-emerald-100';
                        }
                        if (st === 'Izin') {
                          bgActive = 'bg-amber-500';
                          bgInactive = 'bg-amber-50';
                          textInactive = 'text-amber-600';
                          hoverBg = 'hover:bg-amber-100';
                        }
                        if (st === 'Sakit') {
                          bgActive = 'bg-blue-500';
                          bgInactive = 'bg-blue-50';
                          textInactive = 'text-blue-600';
                          hoverBg = 'hover:bg-blue-100';
                        }
                        if (st === 'Alpa') {
                          bgActive = 'bg-red-500';
                          bgInactive = 'bg-red-50';
                          textInactive = 'text-red-600';
                          hoverBg = 'hover:bg-red-100';
                        }
                        if (st === 'Cabut') {
                          bgActive = 'bg-purple-500';
                          bgInactive = 'bg-purple-50';
                          textInactive = 'text-purple-600';
                          hoverBg = 'hover:bg-purple-100';
                        }
                        const stLabel = st === 'Hadir' ? 'H' : st === 'Izin' ? 'I' : st === 'Sakit' ? 'S' : st === 'Alpa' ? 'A' : 'C';
                        return <button key={st} onClick={() => handleSetStatus(s.id, st)} disabled={isLocked} className={"w-8 h-8 flex items-center justify-center rounded-md border text-xs font-bold transition-colors " + (stat === st ? bgActive + " " + textActive + " border-transparent shadow-sm" : bgInactive + " " + textInactive + " " + hoverBg + " border-slate-200/60") + (isLocked ? " opacity-50 cursor-not-allowed" : "")}>
                                {stLabel}
                              </button>;
                      })}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <input type="text" placeholder="Tambahkan keterangan..." value={ket} disabled={isLocked} onChange={e => handleSetKet(s.id, e.target.value)} className={`w-full px-3 py-1.5 border border-slate-200 rounded-md text-sm outline-none focus:border-emerald-500 transition-colors ${isLocked ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : ''}`} />
                      </td>
                    </tr>;
              });
            })() : <tr>
                  <td colSpan={4} className="py-12 text-center text-sm font-medium text-slate-500">
                    Pilih kelas dan mapel terlebih dahulu atau belum ada data siswa
                  </td>
                </tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </div>;
}
export function InputNilai() {
  const _syncTick = useRealtime();
  const {
    user
  } = useAuth();
  const subjects = user?.subjects || [];
  const [schedules, setSchedules] = useState<any[]>([]);
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [teachingAssignments, setTeachingAssignments] = useState<any[]>([]);

  // Read active semester from remoteStorage (set by admin)
  const [semester, setSemester] = useState('Ganjil');
  useEffect(() => {
    if (typeof window !== 'undefined') {
      apiClient('/crud.php?table=academic_terms').then(data => {
        if (Array.isArray(data)) {
          const selectedTermId = remoteStorage.getItem('selectedAcademicTermId');
          let activeTerm = null;
          if (selectedTermId) {
            activeTerm = data.find((t: any) => String(t.id) === selectedTermId);
          }
          if (!activeTerm) {
            activeTerm = data.find((t: any) => Boolean(t.is_active));
          }
          if (activeTerm) setSemester(activeTerm.semester);
        }
      }).catch(console.error);
      apiClient('/crud.php?table=schedules').then(data => {
        if (Array.isArray(data)) {
          setSchedules(data);
        }
      }).catch(console.error);
      apiClient('/crud.php?table=students').then(data => {
        if (Array.isArray(data)) {
          setStudentsList(data);
        }
      }).catch(console.error);
      apiClient('/crud.php?table=teaching_assignments').then(data => {
        if (Array.isArray(data)) {
          setTeachingAssignments(data);
        }
      }).catch(console.error);
    }
  }, [_syncTick]);
  const teacherAssignments = teachingAssignments.filter((a: any) => String(a.teacher_id) === String(user?.id));
  const teacherSchedulesNilai = schedules.filter((s: any) => String(s.teacher_id) === String(user?.id));
  const classesFromAssign = teacherAssignments.map((a: any) => a.class_name);
  const classesFromSched = teacherSchedulesNilai.map((s: any) => s.class_name);
  const assignedClasses = Array.from(new Set([...classesFromAssign, ...classesFromSched])).filter(Boolean) as string[];
  let availableClasses = Array.from(new Set([...assignedClasses, ...(user?.subjects || []).map((s: any) => s.className || s.class_name)])).filter(Boolean).sort() as string[];
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedMapel, setSelectedMapel] = useState('');
  const [uhCount, setUhCount] = useState(1);
  const [grades, setGrades] = useState<Record<string, any>>({});
  const [isLocked, setIsLocked] = useState(false);
  // Update selected class when available classes load
  useEffect(() => {
    if (!selectedClass && availableClasses.length > 0) {
      setSelectedClass(availableClasses[0]);
    }
  }, [availableClasses, selectedClass]);
  const classAssignments = teacherAssignments.filter((a: any) => a.class_name === selectedClass);
  const classSchedules = schedules.filter((s: any) => String(s.teacher_id) === String(user?.id) && s.class_name === selectedClass);
  let availableMapel = Array.from(new Set([...classAssignments.map((a: any) => a.subject_name), ...classSchedules.map((s: any) => s.subject_name), ...(user?.subjects || []).filter((s: any) => norm(s.className || s.class_name) === norm(selectedClass)).map((s: any) => s.subjectName || s.subject_name)])).filter(Boolean) as string[];
  useEffect(() => {
    if (availableMapel.length > 0 && !availableMapel.includes(selectedMapel)) {
      setSelectedMapel(availableMapel[0] || '');
    }
  }, [selectedClass, availableMapel, selectedMapel]);
  useEffect(() => {
    if (selectedClass && selectedMapel && semester) {
      apiClient('/crud.php?table=grades').then(data => {
        if (Array.isArray(data)) {
          const classGrades = data.filter(g => g.class_name === selectedClass && g.subject_name === selectedMapel && g.semester === semester);
          const formattedData: Record<string, any> = {};
          let maxUh = 1;

          // UH goes to uh1, uh2, etc. (We assume they are inserted in order of created_at or just count them)
          // To map them correctly, we'll group by student_id
          const studentUhs: Record<string, number[]> = {};
          classGrades.forEach(g => {
            const sId = String(g.student_id);
            if (!formattedData[sId]) formattedData[sId] = {};
            if (g.type === 'UH') {
              if (!studentUhs[sId]) studentUhs[sId] = [];
              studentUhs[sId].push(Number(g.score));
            } else if (g.type === 'UTS') {
              formattedData[sId].uts = g.score;
            } else if (g.type === 'UAS') {
              formattedData[sId].uas = g.score;
            }
          });
          Object.keys(studentUhs).forEach(sId => {
            studentUhs[sId].forEach((score, idx) => {
              const uhKey = `uh${idx + 1}`;
              formattedData[sId][uhKey] = score;
              if (idx + 1 > maxUh) maxUh = idx + 1;
            });
          });
          setGrades(formattedData);
          setIsLocked(Object.keys(formattedData).length > 0);
          setUhCount(maxUh);
        }
      }).catch(console.error);
    }
  }, [selectedClass, selectedMapel, semester, _syncTick]);
  const handleGradeChange = (studentId: string, field: string, value: any) => {
    if (isLocked) return;
    setGrades(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [field]: value
      }
    }));
  };
  const handleSave = async () => {
    if (!selectedClass) {
      window.alert("Pilih kelas terlebih dahulu!");
      return;
    }
    if (availableMapel.length > 0 && !selectedMapel) {
      window.alert("Pilih mata pelajaran terlebih dahulu!");
      return;
    }
    // removed remoteStorage for grades, using db directly

    try {
      await apiClient('/query.php', {
        method: 'POST',
        body: JSON.stringify({
          query: `DELETE FROM grades WHERE class_name = '${selectedClass.replace(/'/g, "\\'")}' AND subject_name = '${selectedMapel.replace(/'/g, "\\'")}' AND semester = '${semester}'`
        })
      });
      await Promise.all(Object.entries(grades).map(async ([studentId, data]) => {
        // Insert UHs
        for (let i = 1; i <= uhCount; i++) {
          const uhVal = (data as any)[`uh${i}`];
          if (uhVal) {
            await apiClient('/crud.php?table=grades', {
              method: 'POST',
              body: JSON.stringify({
                student_id: studentId,
                subject_name: selectedMapel,
                class_name: selectedClass,
                academic_year: '2026/2027',
                semester: semester,
                type: 'UH',
                score: Number(uhVal)
              })
            });
          }
        }
        const utsVal = (data as any).uts;
        if (utsVal) {
          await apiClient('/crud.php?table=grades', {
            method: 'POST',
            body: JSON.stringify({
              student_id: studentId,
              subject_name: selectedMapel,
              class_name: selectedClass,
              academic_year: '2026/2027',
              semester: semester,
              type: 'UTS',
              score: Number(utsVal)
            })
          });
        }
        const uasVal = (data as any).uas;
        if (uasVal) {
          await apiClient('/crud.php?table=grades', {
            method: 'POST',
            body: JSON.stringify({
              student_id: studentId,
              subject_name: selectedMapel,
              class_name: selectedClass,
              academic_year: '2026/2027',
              semester: semester,
              type: 'UAS',
              score: Number(uasVal)
            })
          });
        }
      }));
    } catch (e) {
      console.error('Failed to save to database', e);
    }
    setIsLocked(true);
    window.alert("Nilai berhasil disimpan!");
  };
  const showStudents = selectedClass !== '' && (availableMapel.length === 0 || selectedMapel !== '');
  const classStudents = studentsList.filter(s => s.class_name === selectedClass || s.className === selectedClass);
  const mockClassStudents = mockStudents.filter(s => s.className === selectedClass);
  const targetStudents = classStudents.length > 0 ? classStudents : mockClassStudents.length > 0 ? mockClassStudents : mockStudents;
  return <div className="space-y-4">
      {/* Top Bar */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Input Penilaian</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Masukkan nilai siswa (Semester {semester})
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">
            {/* Mapel & Kelas Side-by-Side on HP */}
            <div className="grid grid-cols-2 gap-2 w-full md:flex md:w-auto md:gap-3">
              <div className="w-full md:w-[150px]">
                <CustomSelect value={selectedClass} onChange={setSelectedClass} disabled={false} options={[{
                value: '',
                label: 'Pilih Kelas'
              }, ...availableClasses.map(c => ({
                value: String(c),
                label: String(c)
              }))]} />
              </div>
              
              <div className="w-full md:w-[150px]">
                <CustomSelect value={selectedMapel} onChange={setSelectedMapel} disabled={availableMapel.length <= 1} options={[{
                value: '',
                label: 'Pilih Mapel'
              }, ...availableMapel.map(m => ({
                value: String(m),
                label: String(m)
              }))]} />
              </div>
            </div>

            {/* Simpan & Tambah UH Side-by-Side on HP */}
            <div className="grid grid-cols-2 gap-2 w-full md:flex md:w-auto md:gap-3">
              {/* UH Counter */}
              <div className="flex items-center justify-between border border-slate-200 rounded-lg bg-white shadow-sm overflow-hidden h-[42px] w-full md:w-auto">
                <span className="px-3 text-sm font-medium text-slate-600 border-r border-slate-200 bg-slate-50 h-full flex items-center shrink-0">UH:</span>
                <div className="flex items-center flex-1 justify-around h-full">
                  <button onClick={() => setUhCount(Math.max(1, uhCount - 1))} className="w-full h-full flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors font-bold">
                    -
                  </button>
                  <span className="w-8 text-center text-sm font-bold text-slate-800 select-none">{uhCount}</span>
                  <button onClick={() => setUhCount(Math.min(5, uhCount + 1))} className="w-full h-full flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors border-l border-slate-200 font-bold">
                    +
                  </button>
                </div>
              </div>

              {/* Simpan Button */}
              {isLocked ? <button onClick={() => setIsLocked(false)} className="w-full md:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 whitespace-nowrap transition-colors shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                  Edit Nilai
                </button> : <button onClick={handleSave} className="w-full md:w-auto px-5 py-2.5 bg-[#1e7b55] hover:bg-[#166544] text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 whitespace-nowrap transition-colors shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
                  Simpan
                </button>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-slate-200">
                <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase w-16 text-center">NO</th>
                <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase whitespace-nowrap">NAMA SISWA</th>
                {Array.from({
                length: uhCount
              }).map((_, idx) => <th key={`uh-${idx}`} className="py-4 px-4 text-xs font-bold text-slate-500 uppercase text-center w-24">UH {idx + 1}</th>)}
                <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase text-center w-24">{semester === 'Ganjil' ? 'STS 1' : 'STS 2'}</th>
                <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase text-center w-24">{semester === 'Ganjil' ? 'SAS' : 'SAT'}</th>
              </tr>
            </thead>
            <tbody>
              {showStudents ? targetStudents.map((s, index) => <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors bg-white">
                    <td className="py-3 px-4 text-sm font-medium text-slate-500 text-center">{index + 1}</td>
                    <td className="py-3 px-4 text-sm font-bold text-slate-800 whitespace-nowrap">{s.name}</td>
                    {Array.from({
                length: uhCount
              }).map((_, idx) => <td key={`uh-input-${idx}`} className="py-3 px-4">
                        <input type="number" placeholder="0" value={grades[s.id]?.[`uh${idx + 1}`] || ''} disabled={isLocked} onChange={e => handleGradeChange(s.id, `uh${idx + 1}`, e.target.value)} className={`w-full min-w-[60px] p-2 border border-slate-200 rounded text-center text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all ${isLocked ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : ''}`} />
                      </td>)}
                    <td className="py-3 px-4">
                      <input type="number" placeholder="0" value={grades[s.id]?.uts || ''} disabled={isLocked} onChange={e => handleGradeChange(s.id, 'uts', e.target.value)} className={`w-full min-w-[60px] p-2 border border-slate-200 rounded text-center text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all ${isLocked ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : ''}`} />
                    </td>
                    <td className="py-3 px-4">
                      <input type="number" placeholder="0" value={grades[s.id]?.uas || ''} disabled={isLocked} onChange={e => handleGradeChange(s.id, 'uas', e.target.value)} className={`w-full min-w-[60px] p-2 border border-slate-200 rounded text-center text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all ${isLocked ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : ''}`} />
                    </td>
                  </tr>) : <tr>
                  <td colSpan={3 + uhCount + 2} className="py-16 text-center text-sm font-medium text-slate-500 bg-slate-50">
                    Pilih kelas terlebih dahulu atau belum ada data siswa
                  </td>
                </tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </div>;
}
export function JurnalMengajar() {
  const _syncTick = useRealtime();
  const {
    user
  } = useAuth();
  const subjects = user?.subjects || [];
  const [schedules, setSchedules] = useState<any[]>([]);
  const [teachingAssignments, setTeachingAssignments] = useState<any[]>([]);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      apiClient('/crud.php?table=schedules').then(data => {
        if (Array.isArray(data)) {
          setSchedules(data);
        }
      }).catch(console.error);
      apiClient('/crud.php?table=teaching_assignments').then(data => {
        if (Array.isArray(data)) {
          setTeachingAssignments(data);
        }
      }).catch(console.error);
    }
  }, [_syncTick]);
  const teacherAssignments = teachingAssignments.filter((a: any) => String(a.teacher_id) === String(user?.id));
  const teacherSchedules = schedules.filter((s: any) => String(s.teacher_id) === String(user?.id));

  // Combine schedules and subjects
  const pairsFromAssignments = teacherAssignments.map(a => `${a.subject_name} - ${a.class_name}`);
  const pairsFromSchedules = teacherSchedules.map(s => `${s.subject_name} - ${s.class_name}`);
  const allPairs = Array.from(new Set([...pairsFromAssignments, ...pairsFromSchedules])).filter(Boolean).sort();
  const options = (allPairs as string[]).map(p => ({
    value: p,
    label: p
  }));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selected, setSelected] = useState(options[0]?.value || '');

  // Update selected when options load
  useEffect(() => {
    if (!selected && options.length > 0) {
      setSelected(options[0].value);
    }
  }, [options, selected]);
  const [tanggal, setTanggal] = useState((function(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');})());
  const [materi, setMateri] = useState('');
  const [catatan, setCatatan] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [jurnals, setJurnals] = useState<any[]>([]);
  const [semester, setSemester] = useState('Ganjil');
  useEffect(() => {
    apiClient('/crud.php?table=academic_terms').then(data => {
      if (Array.isArray(data)) {
        const selectedTermId = remoteStorage.getItem('selectedAcademicTermId');
        let activeTerm = null;
        if (selectedTermId) activeTerm = data.find((t: any) => String(t.id) === selectedTermId);
        if (!activeTerm) activeTerm = data.find((t: any) => Boolean(t.is_active));
        if (activeTerm) setSemester(activeTerm.semester || 'Ganjil');
      }
    }).catch(console.error);
  }, [_syncTick]);
  const fetchJurnals = async () => {
    try {
      const data = await apiClient('/crud.php?table=laporan_harian');
      if (Array.isArray(data)) {
        const myJurnals = data.filter((j: any) => String(j.user_id) === String(user?.id) || !j.user_id);
        const mapped = myJurnals.map((j: any) => {
          let act: any = {};
          try {
            act = typeof j.activity === 'string' && j.activity.startsWith('{') ? JSON.parse(j.activity) : {
              materi: j.activity
            };
          } catch (e) {}
          let formattedTanggal = formatDateStr(j.date || j.created_at || '');
          return {
            id: j.id,
            tanggal: formattedTanggal,
            kelas: act.class || j.class_name || '-',
            mataPelajaran: act.subject || j.subject_name || '-',
            materi: act.materi || act.topic || '-',
            catatan: act.catatan || act.notes || '-',
            raw_date: j.date || j.created_at
          };
        });
        setJurnals(mapped.reverse());
      }
    } catch (e) {
      console.error('Failed to fetch jurnals:', e);
    }
  };
  useEffect(() => {
    fetchJurnals();
  }, [user]);
  const [toastMessage, setToastMessage] = useState('');
  const handleSave = async () => {
    if (!selected || !materi || !tanggal) {
      setToastMessage('Mohon lengkapi form jurnal!');
      setTimeout(() => setToastMessage(''), 3000);
      return;
    }
    const [mapel, kelas] = selected.split(' - ');
    const [year, month, day] = tanggal.split('-');
    const payload = {
      user_id: user?.id,
      role: user?.role,
      date: tanggal,
      semester: semester,
      activity: JSON.stringify({
        class: kelas,
        subject: mapel,
        materi: materi,
        catatan: catatan
      })
    };
    if (editingId) {
      try {
        await apiClient(`/crud.php?table=laporan_harian&id=${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        setToastMessage("Jurnal mengajar berhasil diperbarui!");
        fetchJurnals();
      } catch (e) {
        console.error('Failed to update database', e);
      }
    } else {
      try {
        await apiClient('/crud.php?table=laporan_harian', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        setToastMessage("Jurnal mengajar berhasil disimpan!");
        fetchJurnals();
      } catch (e) {
        console.error('Failed saving to laporan_harian', e);
      }
    }
    if (user?.id && !editingId) {
      await logKinerja(user.id, `Jurnal Ajar ${kelas} (${mapel})`);
    }
    setTimeout(() => setToastMessage(''), 3000);
    setMateri('');
    setCatatan('');
    setTanggal((function(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');})());
    setEditingId(null);
    setIsModalOpen(false);
  };
  const handleEdit = (jurnal: any) => {
    setEditingId(jurnal.id);
    const [day, month, year] = jurnal.tanggal.split(/[\-\/]/);
    if (day && month && year) {
      setTanggal(`${year}-${month}-${day}`);
    }
    setSelected(`${jurnal.mataPelajaran} - ${jurnal.kelas}`);
    setMateri(jurnal.materi);
    setCatatan(jurnal.catatan || '');
    setIsModalOpen(true);
  };
  const handleDelete = (id: string) => {
    setDeleteConfirm(id);
  };
  const confirmDelete = async () => {
    if (deleteConfirm) {
      try {
        await apiClient(`/crud.php?table=laporan_harian&id=${deleteConfirm}`, {
          method: 'DELETE'
        });
        fetchJurnals();
        setToastMessage("Jurnal berhasil dihapus!");
      } catch (e) {
        console.error('Failed to delete jurnal', e);
      }
      setDeleteConfirm(null);
      setTimeout(() => setToastMessage(''), 3000);
    }
  };
  return <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">Jurnal Kelas</h1>
          <p className="text-sm text-slate-500 mt-1">Rekap kegiatan belajar mengajar</p>
        </div>
        <button onClick={() => {
        setEditingId(null);
        setMateri('');
        setCatatan('');
        setTanggal((function(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');})());
        setIsModalOpen(true);
      }} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" /> Tambah
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Kelas</th>
                <th className="py-3 px-4">Mata Pelajaran</th>
                <th className="py-3 px-4">Materi / Topik</th>
                <th className="py-3 px-4">Kegiatan/Catatan</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {jurnals.length === 0 ? <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 italic">Belum ada catatan jurnal mengajar</td>
                </tr> : jurnals.map(j => <tr key={j.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap">{j.tanggal}</td>
                    <td className="py-3 px-4 whitespace-nowrap">{j.kelas}</td>
                    <td className="py-3 px-4 font-medium text-slate-700">{j.mataPelajaran}</td>
                    <td className="py-3 px-4">{j.materi}</td>
                    <td className="py-3 px-4 text-slate-500">{j.catatan || '-'}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleEdit(j)} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(j.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Hapus">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>)}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-2.5 sm:p-4 pb-20 sm:pb-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[82vh] sm:max-h-[90vh] my-auto">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
              <h2 className="font-bold text-slate-800">{editingId ? 'Edit Jurnal Kelas' : 'Tambah Jurnal Kelas'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 space-y-4 overflow-y-auto scrollbar-hide">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tanggal</label>
                <input type="date" max={(function(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');})()} value={tanggal} onChange={e => setTanggal(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500 bg-slate-50 text-sm mb-4" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Mata Pelajaran & Kelas</label>
                {options.length > 0 ? <CustomSelect value={selected} onChange={val => setSelected(val)} options={options} /> : <div className="p-3 bg-amber-50 text-amber-800 rounded-lg text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    Anda belum mengonfigurasi Mata Pelajaran & Kelas.
                  </div>}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Materi / Topik</label>
                <input type="text" value={materi} onChange={e => setMateri(e.target.value)} placeholder="Masukkan materi..." className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500 bg-slate-50 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Kegiatan / Catatan Khusus</label>
                <textarea rows={3} value={catatan} onChange={e => setCatatan(e.target.value)} placeholder="Siswa aktif bertanya..." className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500 bg-slate-50 text-sm"></textarea>
              </div>
            </div>
            
            <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-500 hover:text-slate-700 hover:bg-slate-200 font-bold rounded-lg transition-colors text-sm">
                Batal
              </button>
              <button type="button" onClick={handleSave} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors text-sm flex items-center gap-2">
                <Check className="w-4 h-4" /> Simpan Jurnal
              </button>
            </div>
          </div>
        </div>}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-2.5 sm:p-4 pb-20 sm:pb-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col my-auto">
            <div className="p-5 text-center space-y-4">
              <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800">Hapus Jurnal?</h3>
                <p className="text-sm text-slate-500 mt-1">Anda yakin ingin menghapus jurnal ini? Tindakan ini tidak dapat dibatalkan.</p>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors text-sm">
                Batal
              </button>
              <button onClick={confirmDelete} className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition-colors shadow-md shadow-rose-600/20 text-sm">
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>}

      {/* Toast Notification */}
      {toastMessage && <div className="fixed bottom-4 right-4 z-50 bg-slate-800 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-sm font-medium">{toastMessage}</p>
        </div>}
    </div>;
}
export interface ModulAjarItem {
  id: string;
  teacherName: string;
  role: string;
  category: 'guru_mapel' | 'wali_kelas' | 'guru_quran';
  subject: string;
  className: string;
  title: string;
  date: string;
  status: 'Sudah Membuat' | 'Belum Membuat';
  driveUrl: string;
  description: string;
  objectives: string[];
}
export const DEFAULT_MODUL_AJAR: ModulAjarItem[] = [{
  id: 'm-1',
  teacherName: 'Ahmad Fazil, S.Pd',
  role: 'Guru Mapel',
  category: 'guru_mapel',
  subject: 'Matematika',
  className: 'X IPA 1',
  title: 'Modul Ajar 3: Fungsi Kuadrat & Grafik Parabola',
  date: '2026-07-22',
  status: 'Sudah Membuat',
  driveUrl: 'https://drive.google.com/file/d/1A2B3C4D5E6F7G8H9I0J/view?usp=sharing',
  description: 'Membahas konsep dasar fungsi kuadrat, sifat-sifat diskriminan, titik puncak parabola, serta cara menggambar grafik fungsi kuadrat secara sistematis.',
  objectives: ['Siswa dapat menentukan titik puncak parabola', 'Siswa dapat menggambar grafik fungsi kuadrat di milimeter blok']
}, {
  id: 'm-2',
  teacherName: 'Budi Santoso, S.Ag',
  role: 'Wali Kelas',
  category: 'wali_kelas',
  subject: 'Fikih / Bimbingan',
  className: 'XII IPS 2',
  title: 'Modul Ajar 2: Hukum Muamalah & Ekonomi Islam',
  date: '2026-07-21',
  status: 'Sudah Membuat',
  driveUrl: 'https://drive.google.com/file/d/2B3C4D5E6F7G8H9I0J1K/view?usp=sharing',
  description: 'Pengenalan prinsip-prinsip transaksi syariah, akad jual beli, serta larangan riba dalam ekonomi modern.',
  objectives: ['Siswa memahami rukun dan syarat sah jual beli', 'Siswa mengidentifikasi contoh riba dalam kehidupan sehari-hari']
}, {
  id: 'm-3',
  teacherName: 'Siti Rahma, M.Pd',
  role: 'Guru Mapel',
  category: 'guru_mapel',
  subject: 'Fisika',
  className: 'XI IPA 3',
  title: 'Modul Ajar 4: Hukum Newton Tentang Gravitasi',
  date: '2026-07-20',
  status: 'Belum Membuat',
  driveUrl: 'https://drive.google.com/file/d/3C4D5E6F7G8H9I0J1K2L/view?usp=sharing',
  description: 'Menganalisis gaya gravitasi antar benda, kuat medan gravitasi, serta penerapan hukum Kepler tentang gerak planet.',
  objectives: ['Siswa dapat menghitung besarnya gaya tarik gravitasi', 'Siswa dapat membuktikan Hukum III Kepler']
}, {
  id: 'm-4',
  teacherName: 'Ustadz Umar, S.Pd.I',
  role: 'Guru Qur\'an',
  category: 'guru_quran',
  subject: 'Tahfizh Al-Qur\'an',
  className: 'Halaqah Al-Mulk',
  title: 'Modul Ajar Tahfizh: Tajwid Idgham & Ikhfa',
  date: '2026-07-19',
  status: 'Sudah Membuat',
  driveUrl: 'https://drive.google.com/file/d/4D5E6F7G8H9I0J1K2L3M/view?usp=sharing',
  description: 'Modul panduan tajwid praktis pelafalan Idgham Bighunnah dan Bilaghunnah pada pembacaan Surat Al-Mulk.',
  objectives: ['Siswa melafalkan bacaan Idgham dengan dengung sempurna', 'Siswa melancarkan setoran ayat 1-10']
}];
export function PerangkatNgajar() {
  const _syncTick = useRealtime();
  const {
    user
  } = useAuth();
  const teacherSubjects = getTeacherSubjects();
  const [modulList, setModulList] = useState<ModulAjarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [teachingAssignments, setTeachingAssignments] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const fetchModul = async () => {
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
        setModulList(mapped);
      }
    } catch (e) {
      console.error('Failed to load materi', e);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchModul();
    apiClient('/crud.php?table=teaching_assignments').then(res => {
      setTeachingAssignments(Array.isArray(res) ? res : []);
    }).catch(console.error);
    apiClient('/crud.php?table=schedules').then(res => {
      setSchedules(Array.isArray(res) ? res : []);
    }).catch(console.error);
  }, [_syncTick]);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string;
    title: string;
  } | null>(null);

  // Form Fields
  const [formSubject, setFormSubject] = useState('');
  const [formClass, setFormClass] = useState('');

  // Get assignments and schedules for current user
  const teacherAssignments = teachingAssignments.filter((a: any) => String(a.teacher_id) === String(user?.id));
  const teacherSchedules = schedules.filter((s: any) => String(s.teacher_id) === String(user?.id));

  // Extract unique classes from both
  const allClasses = [...teacherAssignments.map(a => a.class_name), ...teacherSchedules.map(s => s.class_name)];
  const uniqueClasses = Array.from(new Set(allClasses)).filter(Boolean).sort();

  // Available subjects for selected class from both
  const allSubjectsForClass = [...teacherAssignments.filter(a => a.class_name === formClass).map(a => a.subject_name), ...teacherSchedules.filter(s => s.class_name === formClass).map(s => s.subject_name)];
  const availableSubjects = Array.from(new Set(allSubjectsForClass)).filter(Boolean).sort();
  useEffect(() => {
    if (!editingId && uniqueClasses.length > 0 && !formClass) {
      setFormClass(uniqueClasses[0] as string);
    }
  }, [uniqueClasses, formClass, editingId]);
  useEffect(() => {
    if (!editingId && availableSubjects.length > 0) {
      if (availableSubjects.length === 1) {
        setFormSubject(availableSubjects[0] as string);
      } else if (!availableSubjects.includes(formSubject)) {
        setFormSubject(availableSubjects[0] as string);
      }
    }
  }, [formClass, availableSubjects, editingId, formSubject]);
  const [formTitle, setFormTitle] = useState('');
  const [formDate, setFormDate] = useState(() => (function(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');})());
  const [formDriveUrl, setFormDriveUrl] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formObjectives, setFormObjectives] = useState('');
  const handleOpenAddModal = () => {
    setEditingId(null);
    if (uniqueClasses.length > 0) {
      const cls = uniqueClasses[0] as string;
      setFormClass(cls);
      const subjs = [...teacherAssignments.filter(a => a.class_name === cls).map(a => a.subject_name), ...teacherSchedules.filter(s => s.class_name === cls).map(s => s.subject_name)];
      if (subjs.length > 0) setFormSubject(subjs[0] as string);
    }
    setFormTitle('');
    setFormDate((function(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');})());
    setFormDriveUrl('');
    setFormDescription('');
    setFormObjectives('');
    setIsModalOpen(true);
  };
  const handleOpenEditModal = (item: any) => {
    setEditingId(item.id);
    setFormSubject(item.subject);
    setFormClass(item.className);
    setFormTitle(item.title);
    setFormDate(item.date);
    setFormDriveUrl(item.driveUrl);
    setFormDescription(item.description);
    setFormObjectives(item.objectives ? item.objectives.join('\n') : '');
    setIsModalOpen(true);
  };
  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDriveUrl.trim()) {
      window.alert('Mohon lengkapi Judul Modul Ajar dan Link Google Drive!');
      return;
    }
    const objectivesArray = formObjectives.split('\n').map(s => s.trim()).filter(Boolean);
    const payload = {
      id: editingId,
      user_id: user?.id,
      subject: formSubject,
      class_name: formClass,
      title: formTitle,
      description: formDescription || 'Modul Ajar harian disematkan melalui Google Drive.',
      file_name: formDriveUrl,
      status: 'Terbit',
      // Save as 'Terbit' in DB
      date: formDate,
      objectives: objectivesArray.length > 0 ? objectivesArray : ['Siswa mengikuti pembelajaran sesuai materi harian']
    };
    try {
      await apiClient('/save_materi.php', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      if (user?.id && !editingId) {
        await logKinerja(user.id, `Membuat Modul Ajar ${formClass} (${formSubject})`);
      }
      window.alert(editingId ? 'Modul Ajar berhasil diperbarui!' : 'Modul Ajar berhasil disematkan dan siap dipantau Kepala Madrasah!');
      setIsModalOpen(false);
      fetchModul();
    } catch (err) {
      console.error(err);
      window.alert('Gagal menyimpan perangkat ngajar');
    }
  };
  const handleDelete = (id: string, title: string) => {
    setDeleteConfirm({
      id,
      title
    });
  };
  const confirmDelete = async () => {
    if (deleteConfirm) {
      try {
        await apiClient('/delete_materi.php', {
          method: 'POST',
          body: JSON.stringify({
            id: deleteConfirm.id
          })
        });
        setDeleteConfirm(null);
        fetchModul();
      } catch (err) {
        console.error(err);
        window.alert('Gagal menghapus perangkat ngajar');
      }
    }
  };

  // Filter logic
  const myName = user?.name || 'Ahmad Fazil, S.Pd';
  const filteredList = modulList.filter(item => {
    const isMine = item.teacherName.toLowerCase().includes(myName.toLowerCase()) || item.teacherName.includes('Ahmad');
    if (!isMine) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return item.title.toLowerCase().includes(q) || item.subject.toLowerCase().includes(q) || item.className.toLowerCase().includes(q) || item.teacherName.toLowerCase().includes(q);
    }
    return true;
  });
  return <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-800">Perangkat Ajar Harian (Modul Ajar)</h1>
          <p className="text-slate-500 text-xs sm:text-sm font-medium mt-0.5">
            Sematkan link Google Drive Modul Ajar harian Anda untuk dipantau langsung oleh Kepala Madrasah.
          </p>
        </div>

        <button onClick={handleOpenAddModal} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-sm transition-all shrink-0 cursor-pointer">
          <Plus className="w-4 h-4" /> Sematkan Modul Ajar Baru
        </button>
      </div>

      {/* Filter Header & Search */}
      <Card className="border-slate-200/80 shadow-xs">
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Cari mapel, judul, kelas..." className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 bg-slate-50/50" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* List of Modul Ajar */}
      <div className="space-y-4">
        {filteredList.length === 0 ? <Card className="border-slate-200 shadow-2xs">
            <CardContent className="p-8 text-center space-y-3">
              <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-700">Belum Ada Modul Ajar Harian</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Anda belum menyematkan link Google Drive Modul Ajar. Klik tombol di atas untuk menambahkannya.
              </p>
            </CardContent>
          </Card> : filteredList.map(item => <Card key={item.id} className="border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all overflow-hidden">
              <CardContent className="p-4 sm:p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {item.className}
                      </span>
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                        {item.subject}
                      </span>
                      <span className="text-xs text-slate-400 font-bold">• {item.teacherName}</span>
                    </div>

                    <h3 className="text-sm sm:text-base font-black text-slate-800 pt-1 leading-snug">
                      {item.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${item.status === 'Sudah Membuat' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'Sudah Membuat' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      {item.status === 'Sudah Membuat' ? 'Sudah Membuat' : 'Belum Membuat'}
                    </span>
                  </div>
                </div>

                {/* Description & Target */}
                <div className="space-y-2 text-xs text-slate-600">
                  <p className="line-clamp-2 leading-relaxed bg-slate-50/70 p-3 rounded-xl border border-slate-100/80 font-medium">
                    {item.description}
                  </p>

                  {item.objectives && item.objectives.length > 0 && <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Target Belajar:</span>
                      {item.objectives.map((obj, idx) => <span key={idx} className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/50">
                          ✓ {obj}
                        </span>)}
                    </div>}
                </div>

                {/* Google Drive Link Box & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-blue-50/50 border border-blue-100/80 p-3 rounded-xl">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 font-bold">
                      <Link2 className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-wider text-blue-800">Tautan Modul Ajar (Google Drive)</p>
                      <p className="text-xs text-blue-600 font-medium truncate">{item.driveUrl}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a href={item.driveUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition-all shadow-2xs">
                      <ExternalLink className="w-3.5 h-3.5" /> Buka Drive
                    </a>

                    <>
                      <button onClick={() => handleOpenEditModal(item)} className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg border border-slate-200 transition-all cursor-pointer" title="Edit Modul">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(item.id, item.title)} className="p-1.5 text-slate-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg border border-slate-200 transition-all cursor-pointer" title="Hapus Modul">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  </div>
                </div>
              </CardContent>
            </Card>)}
      </div>

      {/* Modal Add/Edit Modul Ajar */}
      {isModalOpen && <div className="fixed inset-0 z-[100] flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/60 backdrop-blur-xs pb-20 sm:pb-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200 my-auto flex flex-col max-h-[82vh] sm:max-h-[90vh]">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-800">
                  {editingId ? 'Edit Modul Ajar' : 'Sematkan Modul Ajar (Google Drive)'}
                </h2>
                <p className="text-xs font-bold text-emerald-600 mt-0.5">Form Perangkat Ajar Harian Guru</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="p-4 space-y-3 max-h-[480px] overflow-y-auto text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kelas</label>
                  <select value={formClass} onChange={e => setFormClass(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-500 font-semibold" required>
                    <option value="" disabled>Pilih Kelas</option>
                    {uniqueClasses.map((cls, idx) => <option key={idx} value={cls as string}>{cls as string}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mata Pelajaran</label>
                  <select value={formSubject} onChange={e => setFormSubject(e.target.value)} disabled={availableSubjects.length <= 1} className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-500 font-semibold disabled:opacity-70" required>
                    <option value="" disabled>Pilih Mata Pelajaran</option>
                    {availableSubjects.map((sub, idx) => <option key={idx} value={sub as string}>{sub as string}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Judul Modul Ajar / Topik Pertemuan</label>
                <input type="text" value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="Misal: Modul Ajar 3: Fungsi Kuadrat & Grafik Parabola" className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-500 font-bold" required />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Link Google Drive Modul Ajar</label>
                <div className="relative">
                  <input type="url" value={formDriveUrl} onChange={e => setFormDriveUrl(e.target.value)} placeholder="https://drive.google.com/file/d/..." className="w-full p-2.5 pr-8 border border-slate-200 rounded-xl bg-blue-50/30 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-blue-700" required />
                  <ExternalLink className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 pointer-events-none" />
                </div>
                <p className="text-[10px] text-slate-400 mt-1 font-medium">
                  Pastikan akses file di Google Drive sudah disetel ke "Siapa saja yang memiliki link" agar Kepala Madrasah bisa membuka.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Deskripsi Ringkas Pembelajaran</label>
                <textarea value={formDescription} onChange={e => setFormDescription(e.target.value)} placeholder="Penjelasan singkat mengenai isi modul, metode pembelajaran, atau tugas..." className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-500" rows={3} />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Target / Capaian Pembelajaran (Pisahkan per baris)</label>
                <textarea value={formObjectives} onChange={e => setFormObjectives(e.target.value)} placeholder="Siswa dapat menentukan titik puncak parabola&#10;Siswa dapat menggambar grafik fungsi kuadrat" className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-500" rows={2} />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="h-9 font-bold">
                  Batal
                </Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-9">
                  Simpan & Sematkan
                </Button>
              </div>
            </form>
          </div>
        </div>}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && <div className="fixed inset-0 z-[100] flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/60 backdrop-blur-xs pb-20 sm:pb-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200 my-auto flex flex-col">
            <div className="p-5 text-center space-y-4">
              <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800">Hapus Modul Ajar?</h3>
                <p className="text-sm text-slate-500 mt-1">Anda yakin ingin menghapus <span className="font-bold text-slate-700">"{deleteConfirm.title}"</span>? Tindakan ini tidak dapat dibatalkan.</p>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)} className="flex-1 font-bold">
                Batal
              </Button>
              <Button onClick={confirmDelete} className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold">
                Ya, Hapus
              </Button>
            </div>
          </div>
        </div>}
    </div>;
}
export function AnalisisSiswa() {
  const _syncTick = useRealtime();
  const {
    user
  } = useAuth();
  const [grades, setGrades] = useState<any[]>([]);
  const [teachingAssignments, setTeachingAssignments] = useState<any[]>([]);
  useEffect(() => {
    apiClient('/crud.php?table=grades').then(data => {
      if (Array.isArray(data)) setGrades(data);
    }).catch(console.error);
    apiClient('/crud.php?table=teaching_assignments').then(data => {
      if (Array.isArray(data)) setTeachingAssignments(data);
    }).catch(console.error);
  }, [_syncTick]);
  const teacherAssignments = teachingAssignments.filter((a: any) => String(a.teacher_id) === String(user?.id));
  const assignedClasses = Array.from(new Set(teacherAssignments.map(a => a.class_name))).filter(Boolean) as string[];

  // Prepare data for chart: average UH, UTS, UAS per class
  const chartData = assignedClasses.map(cls => {
    const classGrades = grades.filter(g => g.class_name === cls);
    const uhGrades = classGrades.filter(g => g.type === 'UH').map(g => Number(g.score));
    const utsGrades = classGrades.filter(g => g.type === 'UTS').map(g => Number(g.score));
    const uasGrades = classGrades.filter(g => g.type === 'UAS').map(g => Number(g.score));
    return {
      name: cls,
      UH: uhGrades.length ? Math.round(uhGrades.reduce((a, b) => a + b, 0) / uhGrades.length) : 0,
      UTS: utsGrades.length ? Math.round(utsGrades.reduce((a, b) => a + b, 0) / utsGrades.length) : 0,
      UAS: uasGrades.length ? Math.round(uasGrades.reduce((a, b) => a + b, 0) / uasGrades.length) : 0
    };
  });
  return <div className="space-y-6">
      <h1 className="text-xl font-bold tracking-tight text-slate-800">Analisis Siswa</h1>
      <Card>
        <CardHeader><CardTitle>Grafik Perkembangan Nilai Rata-rata per Kelas</CardTitle></CardHeader>
        <CardContent>
          <div className="h-80 bg-white border border-slate-200 rounded-lg p-4">
            {chartData.length > 0 ? <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{
              top: 10,
              right: 30,
              left: 0,
              bottom: 0
            }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{
                fill: '#64748b',
                fontSize: 12
              }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{
                fill: '#64748b',
                fontSize: 12
              }} />
                  <RechartsTooltip contentStyle={{
                borderRadius: '8px',
                border: 'none',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }} />
                  <Legend iconType="circle" wrapperStyle={{
                paddingTop: '20px'
              }} />
                  <Bar dataKey="UH" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={24} />
                  <Bar dataKey="UTS" fill="#10b981" radius={[4, 4, 0, 0]} barSize={24} />
                  <Bar dataKey="UAS" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer> : <div className="flex items-center justify-center h-full text-slate-400 font-medium">
                Belum ada data nilai untuk kelas yang diajarkan.
              </div>}
          </div>
        </CardContent>
      </Card>
    </div>;
}
export function Laporan() {
  const {
    user
  } = useAuth();
  const subjects = user?.subjects || [];
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [dbClasses, setDbClasses] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [teachingAssignments, setTeachingAssignments] = useState<any[]>([]);
  const [studentAttendance, setStudentAttendance] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [jurnals, setJurnals] = useState<any[]>([]);
  const [ibadahSiswa, setIbadahSiswa] = useState<any[]>([]);
  const [pemantauanPagi, setPemantauanPagi] = useState<any[]>([]);
  const [nilaiSikap, setNilaiSikap] = useState<any[]>([]);
  const [semester, setSemester] = useState('Ganjil');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('Laporan berhasil diunduh!');
  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      const [termRes, stuRes, clsRes, schRes, assignRes, attRes, grdRes, jurRes, ibaRes, pemRes, nsRes] = await Promise.all([apiClient('/crud.php?table=academic_terms').catch(() => []), apiClient('/crud.php?table=students').catch(() => []), apiClient('/crud.php?table=classes').catch(() => []), apiClient('/crud.php?table=schedules').catch(() => []), apiClient('/crud.php?table=teaching_assignments').catch(() => []), apiClient('/crud.php?table=student_attendance').catch(() => []), apiClient('/crud.php?table=grades').catch(() => []), apiClient('/crud.php?table=laporan_harian').catch(() => []), apiClient('/crud.php?table=ibadah_siswa').catch(() => []), apiClient('/crud.php?table=pemantauan_pagi').catch(() => []), apiClient('/crud.php?table=nilai_sikap').catch(() => [])]);
      if (Array.isArray(termRes)) {
        const selectedTermId = remoteStorage.getItem('selectedAcademicTermId');
        let activeTerm = null;
        if (selectedTermId) activeTerm = termRes.find((t: any) => String(t.id) === selectedTermId);
        if (!activeTerm) activeTerm = termRes.find((t: any) => Boolean(t.is_active));
        if (activeTerm) setSemester(activeTerm.semester || 'Ganjil');
      }
      if (Array.isArray(stuRes)) setStudentsList(stuRes);
      if (Array.isArray(clsRes)) setDbClasses(clsRes);
      if (Array.isArray(schRes)) setSchedules(schRes);
      if (Array.isArray(assignRes)) setTeachingAssignments(assignRes);
      if (Array.isArray(attRes)) setStudentAttendance(attRes);
      if (Array.isArray(grdRes)) setGrades(grdRes);
      if (Array.isArray(jurRes)) setJurnals(jurRes);
      if (Array.isArray(ibaRes)) setIbadahSiswa(ibaRes);
      if (Array.isArray(pemRes)) setPemantauanPagi(pemRes);
      if (Array.isArray(nsRes)) setNilaiSikap(nsRes);
    } catch (err) {
      console.error('Error loading report data from database:', err);
    } finally {
      setIsRefreshing(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);
  const isWalas = user?.role === 'walas';
  const isGuru = user?.role === 'guru' || user?.role === 'guru_mapel';
  const isStrictlyWalas = isWalas && !isGuru;
  const isGuruQuran = user?.role === 'guru_quran';
  const dbWalasClass = dbClasses.find((c: any) => String(c.wali_kelas_id) === String(user?.id))?.name;
  const walasClass = dbWalasClass || user?.className || user?.class_name;
  const teacherSchedules = schedules.filter((s: any) => String(s.teacher_id) === String(user?.id));
  const teacherAssignments = teachingAssignments.filter((a: any) => String(a.teacher_id) === String(user?.id));
  const scheduledClasses = Array.from(new Set(teacherSchedules.map((s: any) => s.class_name))).filter(Boolean) as string[];
  const assignedClasses = Array.from(new Set(teacherAssignments.map((a: any) => a.class_name))).filter(Boolean) as string[];
  const subjectClasses = Array.from(new Set([...assignedClasses])).filter(Boolean) as string[];

  // State for form selection
  const [reportType, setReportType] = useState<'presensi' | 'nilai' | 'jurnal' | 'analisis' | 'sholat_dhuha' | 'sholat_zuhur' | 'pemantauan_pagi' | 'nilai_sikap'>(isGuruQuran ? 'sholat_dhuha' : 'presensi');

  // Available classes based on teacher's schedules, assignments, walas, or all classes
  let availableClasses = Array.from(new Set([...(walasClass ? [walasClass] : []), ...scheduledClasses, ...subjectClasses, ...subjects.map((s: any) => s.className || s.class_name)])).filter(Boolean).sort() as string[];
  
  if (availableClasses.length === 0 && dbClasses.length > 0) {
    availableClasses = dbClasses.map((c: any) => c.name).filter(Boolean).sort() as string[];
  }

  if (isStrictlyWalas && walasClass) {
    availableClasses = [walasClass];
  }
  const [selectedClass, setSelectedClass] = useState('');

  // Update selected class when available classes load
  useEffect(() => {
    if (!selectedClass && availableClasses.length > 0) {
      if (isWalas && walasClass) {
        setSelectedClass(walasClass);
      } else {
        setSelectedClass(availableClasses[0]);
      }
    }
  }, [availableClasses, selectedClass, isWalas, walasClass]);

  // Filter available subjects based on selected class
  const classSchedules = teacherSchedules.filter(s => s.class_name === selectedClass);
  const classAssignments = teacherAssignments.filter((a: any) => a.class_name === selectedClass);
  const classSubjectsList = Array.from(new Set([...classSchedules.map(s => s.subject_name), ...classAssignments.map(a => a.subject_name), ...subjects.filter((s: any) => norm(s.className || s.class_name) === norm(selectedClass)).map((s: any) => s.subjectName || s.subject_name)])).filter(Boolean) as string[];
  let availableMapel = [...(isWalas ? ['Presensi Wali Kelas'] : []), ...classSubjectsList];
  availableMapel = Array.from(new Set(availableMapel));
  if (isStrictlyWalas) {
    availableMapel = ['Presensi Wali Kelas'];
  }
  const [selectedSubject, setSelectedSubject] = useState('');
  useEffect(() => {
    if (availableMapel.length > 0 && !availableMapel.includes(selectedSubject)) {
      if (isWalas && selectedClass === walasClass) {
        setSelectedSubject('Presensi Wali Kelas');
      } else {
        setSelectedSubject(availableMapel[0]);
      }
    }
  }, [selectedClass, availableMapel, selectedSubject, isWalas, walasClass]);
  const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const currentMonthName = monthNames[new Date().getMonth()];
  const [selectedMonth, setSelectedMonth] = useState(currentMonthName);
  const [selectedSemester, setSelectedSemester] = useState('Ganjil 2026/2027');
  const [selectedReportDate, setSelectedReportDate] = useState(() => (function(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');})());
  const months = ['Semua Bulan', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni'];
  const semesters = [{
    value: 'Ganjil 2026/2027',
    label: 'Ganjil 2026/2027 (Aktif)'
  }, {
    value: 'Genap 2025/2026',
    label: 'Genap 2025/2026'
  }, {
    value: 'Ganjil 2025/2026',
    label: 'Ganjil 2025/2026'
  }, {
    value: 'Genap 2024/2025',
    label: 'Genap 2024/2025'
  }, {
    value: 'Ganjil 2024/2025',
    label: 'Ganjil 2024/2025'
  }];
  const getMonthNumber = (monthName: string): number | null => {
    const map: Record<string, number> = {
      'Januari': 1,
      'Februari': 2,
      'Maret': 3,
      'April': 4,
      'Mei': 5,
      'Juni': 6,
      'Juli': 7,
      'Agustus': 8,
      'September': 9,
      'Oktober': 10,
      'November': 11,
      'Desember': 12
    };
    return map[monthName] || null;
  };
  const getMonthFromDate = (dateVal: any): number | null => {
    if (!dateVal) return null;
    const str = String(dateVal).trim();
    const iso = str.match(/^\d{4}[-/](\d{1,2})[-/]/);
    if (iso) return parseInt(iso[1], 10);
    const dmy = str.match(/^(\d{1,2})[-/](\d{1,2})[-/]\d{4}/);
    if (dmy) return parseInt(dmy[2], 10);
    const d = new Date(str);
    return isNaN(d.getTime()) ? null : d.getUTCMonth() + 1;
  };
  const norm = (str: any) => String(str || '').trim().toLowerCase().replace(/[\s\-_]/g, '');
  const formatDateStr = (dateStr: any) => {
    if (!dateStr || dateStr === '-') return '-';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
    } catch (e) {
      return String(dateStr);
    }
  };
  const getPreviewData = () => {
    // Match students in selected class from real database
    let classStudents = studentsList.filter(s => norm(s.class_name || s.className) === norm(selectedClass));
    if (classStudents.length === 0 && selectedClass) {
      // Fuzzy substring match
      classStudents = studentsList.filter(s => {
        const c = norm(s.class_name || s.className);
        const sel = norm(selectedClass);
        return c.includes(sel) || sel.includes(c);
      });
    }
    const mockClassStudents = mockStudents.filter(s => norm(s.className) === norm(selectedClass));
    const targetStudents = classStudents.length > 0 ? classStudents : mockClassStudents.length > 0 ? mockClassStudents : studentsList.length > 0 ? studentsList : mockStudents;
    const monthNum = getMonthNumber(selectedMonth);
    const filterSemester = selectedSemester ? selectedSemester.split(' ')[0] : null;
    if (reportType === 'presensi') {
      return targetStudents.map((s, idx) => {
        let present = 0;
        let sick = 0;
        let permission = 0;
        let absent = 0;
        let cabut = 0;

        // Find attendance matching this student in database
        const studentAtt = studentAttendance.filter((a: any) => {
          // Filter by semester if it exists on record
          if (filterSemester && a.semester && norm(a.semester) !== norm(filterSemester)) return false;

          // 1. Student identification match
          const studentMatch = String(a.student_id).trim() === String(s.id).trim() || s.nis && String(a.student_id).trim() === String(s.nis).trim() || s.name && norm(a.student_name || a.name) === norm(s.name);
          if (!studentMatch) return false;

          // 2. Class match
          if (selectedClass && a.class_name) {
            if (norm(a.class_name) !== norm(selectedClass)) return false;
          }

          // 3. Subject match
          if (selectedSubject && selectedSubject !== 'Semua') {
            if (selectedSubject === 'Presensi Wali Kelas') {
              if (a.subject_name && norm(a.subject_name) !== norm('Presensi Wali Kelas')) return false;
            } else {
              if (norm(a.subject_name) !== norm(selectedSubject)) return false;
            }
          }

          // 4. Month match
          if (selectedMonth && selectedMonth !== 'Semua Bulan' && monthNum) {
            const recMonth = getMonthFromDate(a.date);
            if (recMonth && recMonth !== monthNum) return false;
          }
          return true;
        });
        studentAtt.forEach((dailyData: any) => {
          const status = String(dailyData.status || '').trim();
          if (status === 'Hadir' || status === 'H') present++;else if (status === 'Sakit' || status === 'S') sick++;else if (status === 'Izin' || status === 'I') permission++;else if (status === 'Alpa' || status === 'A') absent++;else if (status === 'Cabut' || status === 'C') cabut++;
        });

        // Also check if there's local storage data if DB has no record for this student
        if (studentAtt.length === 0 && selectedClass) {
          const storageKey = `attendance_${selectedClass}_${selectedSubject}`;
          const rawStored = remoteStorage.getItem(storageKey);
          if (rawStored) {
            try {
              const localDates = JSON.parse(rawStored);
              Object.entries(localDates).forEach(([dStr, dayData]: [string, any]) => {
                if (selectedMonth !== 'Semua Bulan' && monthNum) {
                  const m = getMonthFromDate(dStr);
                  if (m && m !== monthNum) return;
                }
                const stEntry = dayData[s.id] || dayData[s.nis];
                if (stEntry && stEntry.status) {
                  const st = stEntry.status;
                  if (st === 'Hadir') present++;else if (st === 'Sakit') sick++;else if (st === 'Izin') permission++;else if (st === 'Alpa') absent++;else if (st === 'Cabut') cabut++;
                }
              });
            } catch (e) {}
          }
        }
        const total = present + sick + permission + absent + cabut;
        const pct = total > 0 ? Math.round(present / total * 100) : 0;
        return {
          no: idx + 1,
          nama: s.name,
          nis: s.nis || '-',
          hadir: present,
          sakit: sick,
          izin: permission,
          alpa: absent,
          cabut: cabut,
          total: total,
          persentase: total > 0 ? `${pct}%` : '0%'
        };
      });
    } else if (reportType === 'nilai') {
      return targetStudents.map((s, idx) => {
        const studentGrades = grades.filter(g => {
          if (filterSemester && g.semester && norm(g.semester) !== norm(filterSemester)) return false;
          const studentMatch = String(g.student_id).trim() === String(s.id).trim() || s.nis && String(g.student_id).trim() === String(s.nis).trim();
          const classMatch = !selectedClass || norm(g.class_name) === norm(selectedClass);
          const subjectMatch = !selectedSubject || norm(g.subject_name) === norm(selectedSubject);
          return studentMatch && classMatch && subjectMatch;
        });
        const uhs = studentGrades.filter(g => g.type === 'UH').map(g => Number(g.score));
        let uts = 0;
        let uas = 0;
        studentGrades.forEach(g => {
          if (g.type === 'UTS' || g.type === 'STS') {
            uts = Number(g.score);
          } else if (g.type === 'UAS' || g.type === 'SAS') {
            uas = Number(g.score);
          }
        });
        const tugas = uhs.length > 0 ? Math.round(uhs.reduce((a, b) => a + b, 0) / uhs.length) : 0;
        let akhir = 0;
        if (tugas || uts || uas) {
          akhir = Math.round(tugas * 0.4 + uts * 0.3 + uas * 0.3);
        }
        return {
          no: idx + 1,
          nama: s.name,
          nis: s.nis || '-',
          uh1: uhs[0] ?? '-',
          uh2: uhs[1] ?? '-',
          uh3: uhs[2] ?? '-',
          uh4: uhs[3] ?? '-',
          uh5: uhs[4] ?? '-',
          uts: uts || '-',
          uas: uas || '-',
          akhir: akhir || '-',
          uhCount: uhs.length
        };
      });
    } else if (reportType === 'sholat_dhuha' || reportType === 'sholat_zuhur') {
      const type = reportType === 'sholat_dhuha' ? 'Dhuha' : 'Zuhur';
      return targetStudents.map((s, idx) => {
        let jamaah = 0;
        let tidak = 0;
        const studentIbadah = ibadahSiswa.filter(i => {
          if (filterSemester && i.semester && norm(i.semester) !== norm(filterSemester)) return false;
          const studentMatch = String(i.student_id).trim() === String(s.id).trim() || s.nis && String(i.student_id).trim() === String(s.nis).trim();
          const classMatch = !selectedClass || norm(i.class_name) === norm(selectedClass);
          const typeMatch = String(i.type || '').toLowerCase() === type.toLowerCase();
          if (!studentMatch || !classMatch || !typeMatch) return false;
          if (selectedMonth !== 'Semua Bulan' && monthNum) {
            const m = getMonthFromDate(i.date);
            if (m && m !== monthNum) return false;
          }
          return true;
        });
        studentIbadah.forEach(i => {
          const st = String(i.status || '').toLowerCase();
          if (st === 'hadir' || st === 'jamaah' || st === 'h') jamaah++;else tidak++;
        });
        const total = jamaah + tidak;
        const pct = total > 0 ? Math.round(jamaah / total * 100) : 0;
        return {
          no: idx + 1,
          nama: s.name,
          nis: s.nis || '-',
          jamaah,
          tidak,
          persentase: total > 0 ? `${pct}%` : '0%'
        };
      });
    } else if (reportType === 'jurnal') {
      let filteredJurnals = jurnals.filter((j: any) => String(j.user_id) === String(user?.id) || !j.user_id);
      if (filterSemester) {
        filteredJurnals = filteredJurnals.filter((j: any) => !j.semester || norm(j.semester) === norm(filterSemester));
      }
      if (selectedClass) {
        filteredJurnals = filteredJurnals.filter((j: any) => {
          try {
            const act = typeof j.activity === 'string' && j.activity.startsWith('{') ? JSON.parse(j.activity) : {};
            return norm(act.class || j.class_name) === norm(selectedClass);
          } catch (e) {
            return norm(j.class_name) === norm(selectedClass);
          }
        });
      }
      if (selectedSubject && selectedSubject !== 'Presensi Wali Kelas') {
        filteredJurnals = filteredJurnals.filter((j: any) => {
          try {
            const act = typeof j.activity === 'string' && j.activity.startsWith('{') ? JSON.parse(j.activity) : {};
            return norm(act.subject || j.subject_name) === norm(selectedSubject);
          } catch (e) {
            return norm(j.subject_name) === norm(selectedSubject);
          }
        });
      }
      if (selectedMonth !== 'Semua Bulan' && monthNum) {
        filteredJurnals = filteredJurnals.filter((j: any) => {
          const m = getMonthFromDate(j.date || j.created_at);
          return !m || m === monthNum;
        });
      }
      return filteredJurnals.map((j: any, idx: number) => {
        let act: any = {};
        try {
          act = typeof j.activity === 'string' && j.activity.startsWith('{') ? JSON.parse(j.activity) : {
            materi: j.activity
          };
        } catch (e) {
          act = {
            materi: j.activity
          };
        }
        return {
          no: idx + 1,
          tanggal: formatDateStr(j.date || (j.created_at ? String(j.created_at).split('T')[0] : '-')),
          kelas: act.class || j.class_name || selectedClass || '-',
          mataPelajaran: act.subject || j.subject_name || selectedSubject || '-',
          materi: act.materi || act.topic || j.activity || '-',
          catatan: act.catatan || act.notes || '-'
        };
      });
    } else if (reportType === 'pemantauan_pagi') {
      return targetStudents.map((s, idx) => {
        let studentRecords = pemantauanPagi.filter(p => {
          if (filterSemester && p.semester && norm(p.semester) !== norm(filterSemester)) return false;
          const studentMatch = String(p.student_id).trim() === String(s.id).trim() || s.nis && String(p.student_id).trim() === String(s.nis).trim();
          const classMatch = !selectedClass || norm(p.class_name) === norm(selectedClass);
          if (!studentMatch || !classMatch) return false;
          if (selectedReportDate) {
            const recordDate = p.tanggal || (p.created_at ? String(p.created_at).split('T')[0] : '');
            if (!recordDate.startsWith(selectedReportDate)) return false;
          }
          return true;
        });
        studentRecords.sort((a, b) => new Date(b.tanggal || 0).getTime() - new Date(a.tanggal || 0).getTime());
        const latest = studentRecords[0] || {};
        return {
          no: idx + 1,
          tanggal: formatDateStr(latest.tanggal || '-'),
          nama: s.name || s.nama || '-',
          kelas: s.className || s.class_name || selectedClass || '-',
          kebersihan: latest.kebersihan || '-',
          seragam: latest.seragam || '-',
          ket: latest.ket_seragam || '-'
        };
      });
    } else if (reportType === 'nilai_sikap') {
      return targetStudents.map((s, idx) => {
        let studentRecords = nilaiSikap.filter(p => {
          if (filterSemester && p.semester && norm(p.semester) !== norm(filterSemester)) return false;
          const studentMatch = String(p.student_id).trim() === String(s.id).trim() || s.nis && String(p.student_id).trim() === String(s.nis).trim();
          const classMatch = !selectedClass || norm(p.class_name) === norm(selectedClass);
          if (!studentMatch || !classMatch) return false;
          if (selectedReportDate) {
            const recordDate = p.tanggal || (p.created_at ? String(p.created_at).split('T')[0] : '');
            if (!recordDate.startsWith(selectedReportDate)) return false;
          }
          return true;
        });
        studentRecords.sort((a, b) => new Date(b.tanggal || 0).getTime() - new Date(a.tanggal || 0).getTime());
        const latest = studentRecords[0] || {};
        return {
          no: idx + 1,
          tanggal: formatDateStr(latest.tanggal || '-'),
          nama: s.name || s.nama || '-',
          kelas: s.className || s.class_name || selectedClass || '-',
          nilai: latest.nilai ? latest.nilai === 'A' ? 'Sangat Baik (A)' : latest.nilai === 'B' ? 'Baik (B)' : latest.nilai === 'C' ? 'Cukup (C)' : latest.nilai === 'D' ? 'Kurang (D)' : latest.nilai : '-'
        };
      });
    } else {
      // Analisis Perkembangan Belajar
      return targetStudents.map((s, idx) => {
        const studentGrades = grades.filter(g => {
          if (filterSemester && g.semester && norm(g.semester) !== norm(filterSemester)) return false;
          const studentMatch = String(g.student_id).trim() === String(s.id).trim() || s.nis && String(g.student_id).trim() === String(s.nis).trim();
          const classMatch = !selectedClass || norm(g.class_name) === norm(selectedClass);
          const subjectMatch = !selectedSubject || norm(g.subject_name) === norm(selectedSubject);
          return studentMatch && classMatch && subjectMatch;
        });
        const uhs = studentGrades.filter(g => g.type === 'UH').map(g => Number(g.score));
        const awal = uhs.length > 0 ? uhs[0] : 75;
        const akhir = uhs.length > 1 ? uhs[uhs.length - 1] : uhs[0] || 80;
        const selisih = akhir - awal;
        const peningkatan = selisih >= 0 ? `+${selisih}` : `${selisih}`;
        let status = 'Baik';
        if (akhir >= 85) status = 'Sangat Baik';else if (akhir < 70) status = 'Perlu Bimbingan';
        return {
          no: idx + 1,
          nama: s.name,
          nis: s.nis || '-',
          awal,
          akhir,
          peningkatan,
          status
        };
      });
    }
  };
  const previewRows = getPreviewData();
  const handleDownload = (format: 'excel' | 'pdf') => {
    const reportTitles: Record<string, string> = {
      presensi: 'REKAP_PRESENSI_KEHADIRAN_SISWA',
      nilai: 'LEGER_NILAI_SISWA',
      jurnal: 'JURNAL_KBM_GURU',
      analisis: 'ANALISIS_PERKEMBANGAN_SISWA',
      sholat_dhuha: 'REKAP_SHOLAT_DHUHA',
      sholat_zuhur: 'REKAP_SHOLAT_ZUHUR',
      pemantauan_pagi: 'PEMANTAUAN_PAGI',
      nilai_sikap: 'NILAI_SIKAP'
    };
    const baseTitle = reportTitles[reportType] || 'LAPORAN';
    const cleanClass = (selectedClass || 'Semua_Kelas').replace(/[\s\-_]+/g, '_');
    const cleanSubject = (selectedSubject || 'Semua_Mapel').replace(/[\s\-_]+/g, '_');
    const cleanMonth = (selectedMonth || 'Semua_Bulan').replace(/[\s\-_]+/g, '_');
    const fileName = `${baseTitle}_${cleanClass}_${cleanMonth}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
    if (format === 'excel') {
      try {
        const wb = XLSX.utils.book_new();
        let headers: string[] = [];
        let dataRows: any[][] = [];
        if (reportType === 'presensi') {
          headers = ['No', 'Nama Siswa', 'NIS', 'Hadir (H)', 'Sakit (S)', 'Izin (I)', 'Alpa (A)', 'Cabut (C)', 'Total Kehadiran', 'Persentase'];
          dataRows = previewRows.map((r: any) => [r.no, r.nama, r.nis, r.hadir, r.sakit, r.izin, r.alpa, r.cabut, r.total || r.hadir + r.sakit + r.izin + r.alpa + r.cabut, r.persentase]);
        } else if (reportType === 'nilai') {
          headers = ['No', 'Nama Siswa', 'NIS', 'UH 1', 'UH 2', 'UH 3', 'UH 4', 'UH 5', 'UTS/STS', 'UAS/SAS', 'Nilai Akhir'];
          dataRows = previewRows.map((r: any) => [r.no, r.nama, r.nis, r.uh1, r.uh2, r.uh3, r.uh4, r.uh5, r.uts, r.uas, r.akhir]);
        } else if (reportType === 'jurnal') {
          headers = ['No', 'Tanggal', 'Kelas', 'Mata Pelajaran', 'Materi Pokok', 'Catatan KBM'];
          dataRows = previewRows.map((r: any) => [r.no, r.tanggal, r.kelas, r.mataPelajaran, r.materi, r.catatan]);
        } else if (reportType === 'sholat_dhuha' || reportType === 'sholat_zuhur') {
          headers = ['No', 'Nama Siswa', 'NIS', 'Jamaah', 'Tidak Jamaah', 'Persentase'];
          dataRows = previewRows.map((r: any) => [r.no, r.nama, r.nis, r.jamaah, r.tidak, r.persentase]);
        } else if (reportType === 'pemantauan_pagi') {
          headers = ['No', 'Tanggal', 'Nama Siswa', 'Kelas', 'Kebersihan', 'Seragam', 'Ket. Seragam'];
          dataRows = previewRows.map((r: any) => [r.no, r.tanggal, r.nama, r.kelas, r.kebersihan, r.seragam, r.ket]);
        } else if (reportType === 'nilai_sikap') {
          headers = ['No', 'Tanggal', 'Nama Siswa', 'Kelas', 'Nilai Sikap'];
          dataRows = previewRows.map((r: any) => [r.no, r.tanggal, r.nama, r.kelas, r.nilai]);
        } else {
          headers = ['No', 'Nama Siswa', 'NIS', 'Nilai Awal', 'Nilai Akhir', 'Peningkatan', 'Status'];
          dataRows = previewRows.map((r: any) => [r.no, r.nama, r.nis, r.awal, r.akhir, r.peningkatan, r.status]);
        }
        const headerInfo = [['MAS AL-IHSAN IBS RIAU'], [`LAPORAN ${baseTitle.replace(/_/g, ' ')}`], [`Kelas: ${selectedClass || 'Semua Kelas'} | Mata Pelajaran: ${selectedSubject} | Periode: ${reportType === 'pemantauan_pagi' || reportType === 'nilai_sikap' ? selectedReportDate : selectedMonth} | Semester: ${selectedSemester}`], [`Guru Pengampu: ${user?.name || '-'} | Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`], []];
        const wsData = [...headerInfo, headers, ...dataRows];
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        XLSX.utils.book_append_sheet(wb, ws, 'Laporan');
        XLSX.writeFile(wb, fileName);
        setToastMessage(`Laporan Excel (${fileName}) berhasil diunduh!`);
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 4000);
      } catch (err) {
        console.error('Error generating Excel:', err);
        window.alert('Gagal mengunduh Excel: ' + (err as Error).message);
      }
    } else {
      // PDF Export
      try {
        const doc = new jsPDF();
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('MAS AL-IHSAN IBS RIAU', 14, 15);
        doc.setFontSize(11);
        doc.text(`LAPORAN ${baseTitle.replace(/_/g, ' ')}`, 14, 22);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(`Kelas: ${selectedClass || '-'}   |   Mata Pelajaran: ${selectedSubject}   |   Periode: ${reportType === 'pemantauan_pagi' || reportType === 'nilai_sikap' ? selectedReportDate : selectedMonth}   |   Semester: ${selectedSemester}`, 14, 28);
        doc.text(`Guru: ${user?.name || '-'}   |   Dicetak pada: ${new Date().toLocaleDateString('id-ID')}`, 14, 33);
        let headers: string[] = [];
        let body: any[][] = [];
        if (reportType === 'presensi') {
          headers = ['No', 'Nama Siswa', 'NIS', 'H', 'S', 'I', 'A', 'C', 'Kehadiran'];
          body = previewRows.map((r: any) => [r.no, r.nama, r.nis, r.hadir, r.sakit, r.izin, r.alpa, r.cabut, r.persentase]);
        } else if (reportType === 'nilai') {
          headers = ['No', 'Nama Siswa', 'NIS', 'UH1', 'UH2', 'UH3', 'STS', 'SAS', 'Akhir'];
          body = previewRows.map((r: any) => [r.no, r.nama, r.nis, r.uh1, r.uh2, r.uh3, r.uts, r.uas, r.akhir]);
        } else if (reportType === 'jurnal') {
          headers = ['No', 'Tanggal', 'Kelas', 'Mata Pelajaran', 'Materi Pokok'];
          body = previewRows.map((r: any) => [r.no, r.tanggal, r.kelas, r.mataPelajaran, r.materi]);
        } else if (reportType === 'sholat_dhuha' || reportType === 'sholat_zuhur') {
          headers = ['No', 'Nama Siswa', 'NIS', 'Jamaah', 'Tidak', 'Persentase'];
          body = previewRows.map((r: any) => [r.no, r.nama, r.nis, r.jamaah, r.tidak, r.persentase]);
        } else if (reportType === 'pemantauan_pagi') {
          headers = ['No', 'Tanggal', 'Nama', 'Kelas', 'Kebersihan', 'Seragam', 'Ket'];
          body = previewRows.map((r: any) => [r.no, r.tanggal, r.nama, r.kelas, r.kebersihan, r.seragam, r.ket]);
        } else if (reportType === 'nilai_sikap') {
          headers = ['No', 'Tanggal', 'Nama', 'Kelas', 'Nilai'];
          body = previewRows.map((r: any) => [r.no, r.tanggal, r.nama, r.kelas, r.nilai]);
        } else {
          headers = ['No', 'Nama Siswa', 'NIS', 'Awal', 'Akhir', 'Peningkatan', 'Status'];
          body = previewRows.map((r: any) => [r.no, r.nama, r.nis, r.awal, r.akhir, r.peningkatan, r.status]);
        }
        autoTable(doc, {
          startY: 38,
          head: [headers],
          body: body,
          styles: {
            fontSize: 8,
            cellPadding: 2
          },
          headStyles: {
            fillColor: [16, 185, 129],
            textColor: [255, 255, 255],
            fontStyle: 'bold'
          },
          alternateRowStyles: {
            fillColor: [248, 250, 252]
          }
        });
        doc.save(fileName);
        setToastMessage(`Laporan PDF (${fileName}) berhasil diunduh!`);
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 4000);
      } catch (err) {
        console.error('Error generating PDF:', err);
        window.alert('Gagal mengunduh PDF: ' + (err as Error).message);
      }
    }
  };
  return <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">Laporan Akademik Guru</h1>
          <p className="text-slate-500 text-xs mt-0.5">Data laporan real-time terhubung langsung dengan database Hostinger MAS Al-Ihsan IBS.</p>
        </div>
        <button onClick={fetchData} disabled={isRefreshing} className="inline-flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 hover:border-emerald-200 rounded-xl text-xs font-bold transition-all active:scale-95 disabled:opacity-50 cursor-pointer w-fit" title="Sinkronkan ulang seluruh data presensi dan nilai dari database Hostinger">
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
          <span>{isRefreshing ? 'Menyinkronkan...' : 'Muat Ulang Data'}</span>
        </button>
      </div>

      {showSuccessToast && <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2.5 animate-bounce">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* FORM CONFIGURATION */}
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>Konfigurasi Cetak Laporan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Tipe Laporan</label>
              {isGuruQuran ? <div className="flex flex-col gap-1 p-1 bg-slate-100 rounded-lg">
                  <div className="grid grid-cols-3 gap-1">
                    <button type="button" onClick={() => setReportType('presensi')} className={`py-1.5 px-2 rounded-md text-[10px] font-bold uppercase tracking-tight transition-colors ${reportType === 'presensi' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                      Presensi
                    </button>
                    <button type="button" onClick={() => setReportType('nilai')} className={`py-1.5 px-2 rounded-md text-[10px] font-bold uppercase tracking-tight transition-colors ${reportType === 'nilai' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                      Nilai
                    </button>
                    <button type="button" onClick={() => setReportType('jurnal')} className={`py-1.5 px-2 rounded-md text-[10px] font-bold uppercase tracking-tight transition-colors ${reportType === 'jurnal' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                      Jurnal
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    <button type="button" onClick={() => setReportType('analisis')} className={`py-1.5 px-2 rounded-md text-[10px] font-bold uppercase tracking-tight transition-colors ${reportType === 'analisis' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                      Analisis
                    </button>
                    <button type="button" onClick={() => setReportType('sholat_dhuha')} className={`py-1.5 px-2 rounded-md text-[10px] font-bold uppercase tracking-tight transition-colors ${reportType === 'sholat_dhuha' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                      Dhuha
                    </button>
                  </div>
                </div> : <div className="flex flex-col gap-3">
                  {isGuru && <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-lg">
                        <button type="button" onClick={() => {
                  setReportType('presensi');
                  if (selectedSubject === 'Presensi Wali Kelas') {
                    setSelectedSubject(availableMapel.filter(m => m !== 'Presensi Wali Kelas')[0] || '');
                  }
                }} className={`py-1.5 px-2 rounded-md text-[10px] font-bold uppercase tracking-tight transition-colors ${reportType === 'presensi' && selectedSubject !== 'Presensi Wali Kelas' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                          Presensi
                        </button>
                        <button type="button" onClick={() => setReportType('nilai')} className={`py-1.5 px-2 rounded-md text-[10px] font-bold uppercase tracking-tight transition-colors ${reportType === 'nilai' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                          Nilai
                        </button>
                        <button type="button" onClick={() => setReportType('analisis')} className={`py-1.5 px-2 rounded-md text-[10px] font-bold uppercase tracking-tight transition-colors ${reportType === 'analisis' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                          Analisis
                        </button>
                        <button type="button" onClick={() => setReportType('jurnal')} className={`py-1.5 px-2 rounded-md text-[10px] font-bold uppercase tracking-tight transition-colors ${reportType === 'jurnal' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                          Jurnal Ajar
                        </button>
                    </div>}

                  {isWalas && <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-lg">
                        <button type="button" onClick={() => {
                  setReportType('presensi');
                  setSelectedSubject('Presensi Wali Kelas');
                }} className={`py-1.5 px-2 rounded-md text-[10px] font-bold uppercase tracking-tight transition-colors ${reportType === 'presensi' && selectedSubject === 'Presensi Wali Kelas' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                          Presensi
                        </button>
                        <button type="button" onClick={() => setReportType('sholat_zuhur')} className={`py-1.5 px-2 rounded-md text-[10px] font-bold uppercase tracking-tight transition-colors ${reportType === 'sholat_zuhur' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                          Sholat Zuhur Siswa
                        </button>
                        <button type="button" onClick={() => setReportType('pemantauan_pagi')} className={`py-1.5 px-2 rounded-md text-[10px] font-bold uppercase tracking-tight transition-colors ${reportType === 'pemantauan_pagi' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                          Pemantauan Pagi
                        </button>
                        <button type="button" onClick={() => setReportType('nilai_sikap')} className={`py-1.5 px-2 rounded-md text-[10px] font-bold uppercase tracking-tight transition-colors ${reportType === 'nilai_sikap' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                          Nilai Sikap
                        </button>
                      </div>}
                </div>}
            </div>

            <div>
<div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Pilih Kelas</label>
              <CustomSelect 
                value={selectedClass} 
                onChange={val => setSelectedClass(val)} 
                options={availableClasses.length > 0 ? availableClasses.map(c => ({
                  value: String(c),
                  label: `Kelas ${c}`
                })) : [{ value: '', label: 'Belum Ada Kelas' }]} 
                disabled={isStrictlyWalas || availableClasses.length === 0} 
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Mata Pelajaran</label>
              {availableMapel.length > 0 ? <CustomSelect value={selectedSubject} onChange={val => setSelectedSubject(val)} options={availableMapel.map(m => ({
                value: m,
                label: m
              }))} disabled={isStrictlyWalas} /> : <input type="text" disabled value={selectedSubject} className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-400 outline-none" />}
            </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Tahun Ajaran / Semester</label>
              <CustomSelect value={selectedSemester} onChange={val => setSelectedSemester(val)} options={semesters} />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                {reportType === 'pemantauan_pagi' || reportType === 'nilai_sikap' ? 'Tanggal Laporan' : 'Bulan / Periode'}
              </label>
              {reportType === 'pemantauan_pagi' || reportType === 'nilai_sikap' ? <input type="date" value={selectedReportDate} onChange={e => setSelectedReportDate(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" /> : <CustomSelect value={selectedMonth} onChange={val => setSelectedMonth(val)} options={months.map(m => ({
              value: m,
              label: m
            }))} />}
            </div>

            <div className="flex gap-2 mt-2">
              <button onClick={() => handleDownload('pdf')} className="flex-1 py-3 px-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[10px] sm:text-xs font-extrabold uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer">
                <Download className="w-3.5 h-3.5" /> PDF
              </button>
              <button onClick={() => handleDownload('excel')} className="flex-1 py-3 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] sm:text-xs font-extrabold uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer">
                <Download className="w-3.5 h-3.5" /> Excel
              </button>
            </div>
          </CardContent>
        </Card>

        {/* DATA PREVIEW */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Pratinjau Data Laporan</CardTitle>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
                {reportType === 'presensi' && 'REKAP ABSENSI KEHADIRAN SISWA'}
                {reportType === 'nilai' && 'LEGER NILAI ULANGAN & TUGAS'}
                {reportType === 'sholat_zuhur' && 'LAPORAN SHOLAT ZUHUR BERJAMAAH'}
                {reportType === 'sholat_dhuha' && 'LAPORAN SHOLAT DHUHA BERJAMAAH'}
                {reportType === 'jurnal' && 'JURNAL KEGIATAN MENGAJAR GURU'}
                {reportType === 'analisis' && 'ANALISIS PERKEMBANGAN BELAJAR SISWA'}
                {` • Kelas ${selectedClass || '-'} • ${selectedSubject} • ${reportType === 'pemantauan_pagi' || reportType === 'nilai_sikap' ? selectedReportDate : selectedMonth}`}
              </p>
            </div>
            <span className="text-[10px] font-bold px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg">
              {previewRows.length} Data
            </span>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              {reportType === 'presensi' && <>
                  <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4 w-12">No</th>
                      <th className="py-3 px-4">Nama Siswa</th>
                      <th className="py-3 px-4">NIS</th>
                      <th className="py-3 px-4 text-center">H</th>
                      <th className="py-3 px-4 text-center">S</th>
                      <th className="py-3 px-4 text-center">I</th>
                      <th className="py-3 px-4 text-center">A</th>
                      <th className="py-3 px-4 text-center">C</th>
                      <th className="py-3 px-4 text-right">Persentase</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs font-semibold text-slate-700 divide-y divide-slate-100">
                    {previewRows.length > 0 ? previewRows.map((row: any) => <tr key={row.no} className="hover:bg-slate-50/50">
                          <td className="py-3 px-4 text-slate-400">{row.no}</td>
                          <td className="py-3 px-4 font-bold text-slate-800">{row.nama}</td>
                          <td className="py-3 px-4 text-slate-500 font-mono">{row.nis}</td>
                          <td className="py-3 px-4 text-center text-emerald-600 font-bold">{row.hadir}</td>
                          <td className="py-3 px-4 text-center text-blue-600">{row.sakit}</td>
                          <td className="py-3 px-4 text-center text-amber-600">{row.izin}</td>
                          <td className="py-3 px-4 text-center text-red-600">{row.alpa}</td>
                          <td className="py-3 px-4 text-center text-purple-600">{row.cabut}</td>
                          <td className="py-3 px-4 text-right text-slate-800 font-bold font-mono">{row.persentase}</td>
                        </tr>) : <tr>
                        <td colSpan={9} className="py-8 text-center text-slate-400 font-medium text-xs">
                          Belum ada data presensi untuk filter yang dipilih.
                        </td>
                      </tr>}
                  </tbody>
                </>}

              {reportType === 'nilai' && <>
                  <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4 w-12">No</th>
                      <th className="py-3 px-4">Nama Siswa</th>
                      <th className="py-3 px-4">NIS</th>
                      <th className="py-3 px-4 text-center">UH 1</th>
                      <th className="py-3 px-4 text-center">UH 2</th>
                      <th className="py-3 px-4 text-center">UH 3</th>
                      <th className="py-3 px-4 text-center">STS</th>
                      <th className="py-3 px-4 text-center">SAS</th>
                      <th className="py-3 px-4 text-center">Akhir</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs font-semibold text-slate-700 divide-y divide-slate-100">
                    {previewRows.length > 0 ? previewRows.map((row: any) => <tr key={row.no} className="hover:bg-slate-50/50">
                          <td className="py-3 px-4 text-slate-400">{row.no}</td>
                          <td className="py-3 px-4 font-bold text-slate-800">{row.nama}</td>
                          <td className="py-3 px-4 text-slate-500 font-mono">{row.nis}</td>
                          <td className="py-3 px-4 text-center font-mono">{row.uh1}</td>
                          <td className="py-3 px-4 text-center font-mono">{row.uh2}</td>
                          <td className="py-3 px-4 text-center font-mono">{row.uh3}</td>
                          <td className="py-3 px-4 text-center font-mono">{row.uts}</td>
                          <td className="py-3 px-4 text-center font-mono">{row.uas}</td>
                          <td className="py-3 px-4 text-center font-bold font-mono text-emerald-700 bg-emerald-50/30">{row.akhir}</td>
                        </tr>) : <tr>
                        <td colSpan={9} className="py-8 text-center text-slate-400 font-medium text-xs">
                          Belum ada data nilai untuk filter yang dipilih.
                        </td>
                      </tr>}
                  </tbody>
                </>}

              {reportType === 'sholat_dhuha' && <>
                  <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4 w-12">No</th>
                      <th className="py-3 px-4">Nama Siswa</th>
                      <th className="py-3 px-4">NIS</th>
                      <th className="py-3 px-4 text-center">Jamaah</th>
                      <th className="py-3 px-4 text-center">Tidak Jamaah</th>
                      <th className="py-3 px-4 text-right">Persentase</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs font-semibold text-slate-700 divide-y divide-slate-100">
                    {previewRows.length > 0 ? previewRows.map((row: any) => <tr key={row.no} className="hover:bg-slate-50/50">
                          <td className="py-3 px-4 text-slate-400">{row.no}</td>
                          <td className="py-3 px-4 font-bold text-slate-800">{row.nama}</td>
                          <td className="py-3 px-4 text-slate-500 font-mono">{row.nis}</td>
                          <td className="py-3 px-4 text-center text-emerald-600 font-bold">{row.jamaah}</td>
                          <td className="py-3 px-4 text-center text-red-600 font-bold">{row.tidak}</td>
                          <td className="py-3 px-4 text-right font-bold text-slate-800 font-mono">{row.persentase}</td>
                        </tr>) : <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400 font-medium text-xs">
                          Belum ada data sholat dhuha untuk filter yang dipilih.
                        </td>
                      </tr>}
                  </tbody>
                </>}

              {reportType === 'sholat_zuhur' && <>
                  <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4 w-12">No</th>
                      <th className="py-3 px-4">Nama Siswa</th>
                      <th className="py-3 px-4">NIS</th>
                      <th className="py-3 px-4 text-center">Jamaah</th>
                      <th className="py-3 px-4 text-center">Tidak Jamaah</th>
                      <th className="py-3 px-4 text-right">Persentase</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs font-semibold text-slate-700 divide-y divide-slate-100">
                    {previewRows.length > 0 ? previewRows.map((row: any) => <tr key={row.no} className="hover:bg-slate-50/50">
                          <td className="py-3 px-4 text-slate-400">{row.no}</td>
                          <td className="py-3 px-4 font-bold text-slate-800">{row.nama}</td>
                          <td className="py-3 px-4 text-slate-500 font-mono">{row.nis}</td>
                          <td className="py-3 px-4 text-center text-emerald-600 font-bold">{row.jamaah}</td>
                          <td className="py-3 px-4 text-center text-red-600 font-bold">{row.tidak}</td>
                          <td className="py-3 px-4 text-right font-bold text-slate-800 font-mono">{row.persentase}</td>
                        </tr>) : <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400 font-medium text-xs">
                          Belum ada data sholat zuhur untuk filter yang dipilih.
                        </td>
                      </tr>}
                  </tbody>
                </>}

              {reportType === 'jurnal' && <>
                  <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4 w-12">No</th>
                      <th className="py-3 px-4 w-24">Tanggal</th>
                      <th className="py-3 px-4">Materi Pokok</th>
                      <th className="py-3 px-4">Catatan KBM</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs font-semibold text-slate-700 divide-y divide-slate-100">
                    {previewRows.length > 0 ? previewRows.map((row: any) => <tr key={row.no} className="hover:bg-slate-50/50">
                          <td className="py-3 px-4 text-slate-400">{row.no}</td>
                          <td className="py-3 px-4 text-slate-500 font-mono font-medium">{row.tanggal}</td>
                          <td className="py-3 px-4 font-bold text-emerald-800">{row.materi}</td>
                          <td className="py-3 px-4 text-slate-500 font-normal italic leading-relaxed">{row.catatan}</td>
                        </tr>) : <tr>
                        <td colSpan={4} className="py-8 text-center text-slate-400 font-medium text-xs">
                          Belum ada jurnal KBM untuk filter yang dipilih.
                        </td>
                      </tr>}
                  </tbody>
                </>}
              {reportType === 'pemantauan_pagi' && <>
                  <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4 w-12">No</th>
                      <th className="py-3 px-4">Nama Siswa</th>
                      <th className="py-3 px-4">Kelas</th>
                      <th className="py-3 px-4 text-center">Kebersihan</th>
                      <th className="py-3 px-4 text-center">Seragam</th>
                      <th className="py-3 px-4 text-center">Ket Seragam</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs font-semibold text-slate-700 divide-y divide-slate-100">
                    {previewRows.length > 0 ? previewRows.map((row: any) => <tr key={row.no} className="hover:bg-slate-50/50">
                          <td className="py-3 px-4 text-slate-400">{row.no}</td>
                          <td className="py-3 px-4 font-bold text-slate-800">{row.nama}</td>
                          <td className="py-3 px-4 text-slate-500 font-mono">{row.kelas}</td>
                          <td className="py-3 px-4 text-center font-bold text-slate-700">{row.kebersihan}</td>
                          <td className="py-3 px-4 text-center font-bold text-slate-700">{row.seragam}</td>
                          <td className="py-3 px-4 text-center text-slate-500 italic">{row.ket}</td>
                        </tr>) : <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400 font-medium text-xs">
                          Belum ada data pemantauan pagi untuk filter yang dipilih.
                        </td>
                      </tr>}
                  </tbody>
                </>}
              {reportType === 'nilai_sikap' && <>
                  <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4 w-12">No</th>
                      <th className="py-3 px-4">Nama Siswa</th>
                      <th className="py-3 px-4">Kelas</th>
                      <th className="py-3 px-4 text-center">Nilai Sikap</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs font-semibold text-slate-700 divide-y divide-slate-100">
                    {previewRows.length > 0 ? previewRows.map((row: any) => <tr key={row.no} className="hover:bg-slate-50/50">
                          <td className="py-3 px-4 text-slate-400">{row.no}</td>
                          <td className="py-3 px-4 font-bold text-slate-800">{row.nama}</td>
                          <td className="py-3 px-4 text-slate-500 font-mono">{row.kelas}</td>
                          <td className="py-3 px-4 text-center font-bold text-emerald-600 bg-emerald-50/30">{row.nilai}</td>
                        </tr>) : <tr>
                        <td colSpan={4} className="py-8 text-center text-slate-400 font-medium text-xs">
                          Belum ada data nilai sikap untuk filter yang dipilih.
                        </td>
                      </tr>}
                  </tbody>
                </>}

              {reportType === 'analisis' && <>
                  <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4 w-12">No</th>
                      <th className="py-3 px-4">Nama Siswa</th>
                      <th className="py-3 px-4">NIS</th>
                      <th className="py-3 px-4 text-center">Nilai Awal</th>
                      <th className="py-3 px-4 text-center">Nilai Akhir</th>
                      <th className="py-3 px-4 text-center">Peningkatan</th>
                      <th className="py-3 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs font-semibold text-slate-700 divide-y divide-slate-100">
                    {previewRows.length > 0 ? previewRows.map((row: any) => <tr key={row.no} className="hover:bg-slate-50/50">
                          <td className="py-3 px-4 text-slate-400">{row.no}</td>
                          <td className="py-3 px-4 font-bold text-slate-800">{row.nama}</td>
                          <td className="py-3 px-4 text-slate-500 font-mono">{row.nis}</td>
                          <td className="py-3 px-4 text-center font-mono">{row.awal}</td>
                          <td className="py-3 px-4 text-center font-mono font-bold text-emerald-700">{row.akhir}</td>
                          <td className="py-3 px-4 text-center font-mono text-emerald-600 font-bold">{row.peningkatan}</td>
                          <td className="py-3 px-4 text-right font-bold text-slate-600">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${row.status === 'Sangat Baik' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                              {row.status}
                            </span>
                          </td>
                        </tr>) : <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400 font-medium text-xs">
                          Belum ada data analisis untuk filter yang dipilih.
                        </td>
                      </tr>}
                  </tbody>
                </>}
            </table>
          </CardContent>
        </Card>
      </div>
    </div>;
}
export function AbsensiZuhur() {
  const _syncTick = useRealtime();
  const {
    user
  } = useAuth();
  const [status, setStatus] = useState<'hadir' | 'tidak' | null>(null);
  const [reason, setReason] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const today = new Date().toLocaleDateString('id-ID', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\//g, '-');
  const absensiKey = `absenZuhur_${user?.id}_${today}`;
  const [hasAbsen, setHasAbsen] = useState(typeof window !== 'undefined' ? remoteStorage.getItem(absensiKey) === 'true' : false);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    if (!user?.id) return;
    const checkStatus = async () => {
      try {
        const dateISO = (function(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');})();
        const data = await apiClient('/crud.php?table=ibadah_guru');
        if (Array.isArray(data)) {
          const alreadySubmitted = data.some((r: any) => String(r.user_id) === String(user.id) && String(r.date).startsWith(dateISO));
          if (alreadySubmitted) {
            setHasAbsen(true);
            remoteStorage.setItem(absensiKey, 'true');
          }
        }
      } catch (err) {
        console.error('Failed to check absensi zuhur', err);
      } finally {
        setIsLoading(false);
      }
    };
    checkStatus();
  }, [user?.id, absensiKey, _syncTick]);
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);
  const limitAbsenZuhur = remoteStorage.getItem('limit_absen_zuhur') || '13:00';
  const [limitHour, limitMinute] = limitAbsenZuhur.split(':').map(Number);
  const isPastLimit = currentTime.getHours() > limitHour || (currentTime.getHours() === limitHour && currentTime.getMinutes() >= limitMinute);
  const isBeforeLimit = currentTime.getHours() < 12;

  const handleSubmit = () => {
    if (!status) {
      window.alert('Silakan pilih status kehadiran terlebih dahulu.');
      return;
    }
    if (status === 'tidak' && !reason) {
      window.alert('Mohon isi keterangan (misal: haid, dinas luar, dll).');
      return;
    }
    const saveAbsen = async (msg: string) => {
      try {
        const payload = {
          user_id: user?.id,
          date: (function(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');})(),
          status: status === 'hadir' ? 'Jamaah' : 'Tidak Jamaah',
          keterangan: status === 'tidak' ? reason : ''
        };
        await apiClient('/crud.php?table=ibadah_guru', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        window.alert(msg);
        remoteStorage.setItem(absensiKey, 'true');
        setHasAbsen(true);
        setStatus(null);
        setReason('');
      } catch (e) {
        console.error(e);
        window.alert('Gagal menyimpan absensi ibadah');
      }
    };
    if (status === 'hadir') {
      if (isPastLimit) {
        window.alert(`Batas waktu sholat berjamaah di masjid (${limitAbsenZuhur}) telah lewat.`);
        return;
      }
      if (!navigator.geolocation) {
        setLocationError("Geolocation tidak didukung oleh browser Anda.");
        return;
      }
      setIsLocating(true);
      setLocationError(null);
      navigator.geolocation.getCurrentPosition(position => {
        setIsLocating(false);
        const {
          latitude,
          longitude
        } = position.coords;

        // Get saved school coordinates or use default
        const getValidFloat = (k: string, fallback: string) => {
          const v = parseFloat(remoteStorage.getItem(k) || fallback);
          return isNaN(v) ? parseFloat(fallback) : v;
        };
        const getValidInt = (k: string, fallback: string) => {
          const v = parseInt(remoteStorage.getItem(k) || fallback, 10);
          return isNaN(v) ? parseInt(fallback, 10) : v;
        };
        const schoolLatL = getValidFloat('school_lat_l', '-0.502');
        const schoolLngL = getValidFloat('school_lng_l', '101.447');
        const maxRadiusL = getValidInt('school_radius_l', '200');
        const schoolLatP = getValidFloat('school_lat_p', '-0.502');
        const schoolLngP = getValidFloat('school_lng_p', '101.447');
        const maxRadiusP = getValidInt('school_radius_p', '200');
        const R = 6371e3; // metres
        const φ1 = latitude * Math.PI / 180;

        // Calc distance to Masjid Laki-laki
        const φ2L = schoolLatL * Math.PI / 180;
        const ΔφL = (schoolLatL - latitude) * Math.PI / 180;
        const ΔλL = (schoolLngL - longitude) * Math.PI / 180;
        const aL = Math.sin(ΔφL / 2) * Math.sin(ΔφL / 2) + Math.cos(φ1) * Math.cos(φ2L) * Math.sin(ΔλL / 2) * Math.sin(ΔλL / 2);
        const cL = 2 * Math.atan2(Math.sqrt(aL), Math.sqrt(1 - aL));
        const distanceL = R * cL;

        // Calc distance to Masjid Perempuan
        const φ2P = schoolLatP * Math.PI / 180;
        const ΔφP = (schoolLatP - latitude) * Math.PI / 180;
        const ΔλP = (schoolLngP - longitude) * Math.PI / 180;
        const aP = Math.sin(ΔφP / 2) * Math.sin(ΔφP / 2) + Math.cos(φ1) * Math.cos(φ2P) * Math.sin(ΔλP / 2) * Math.sin(ΔλP / 2);
        const cP = 2 * Math.atan2(Math.sqrt(aP), Math.sqrt(1 - aP));
        const distanceP = R * cP;
        const isMale = user?.gender === 'L';
        const isFemale = user?.gender === 'P';
        if (isMale && distanceL <= maxRadiusL) {
          saveAbsen(`Absensi sholat zuhur berhasil disimpan. (Lokasi: Masjid Laki-laki, Jarak: ${Math.round(distanceL)}m)`);
        } else if (isFemale && distanceP <= maxRadiusP) {
          saveAbsen(`Absensi sholat zuhur berhasil disimpan. (Lokasi: Musholla Perempuan, Jarak: ${Math.round(distanceP)}m)`);
        } else if (!isMale && !isFemale && (distanceL <= maxRadiusL || distanceP <= maxRadiusP)) {
          // Fallback for users without gender set
          const isMasjidL = distanceL <= maxRadiusL;
          saveAbsen(`Absensi sholat zuhur berhasil disimpan. (Lokasi: ${isMasjidL ? 'Masjid Laki-laki' : 'Musholla Perempuan'})`);
        } else {
          let errorMsg = '';
          if (isMale) {
            errorMsg = `PERINGATAN: Anda berada di luar area Masjid. Jarak Anda: ${Math.round(distanceL)}m (Maks: ${maxRadiusL}m).\n\nPastikan GPS Anda aktif dan Anda berada di lokasi yang tepat.`;
          } else if (isFemale) {
            errorMsg = `PERINGATAN: Anda berada di luar area Musholla. Jarak Anda: ${Math.round(distanceP)}m (Maks: ${maxRadiusP}m).\n\nPastikan GPS Anda aktif dan Anda berada di lokasi yang tepat.`;
          } else {
            errorMsg = `PERINGATAN: Anda berada di luar area madrasah. Jarak Anda: ${Math.round(distanceL)}m ke Masjid (L) dan ${Math.round(distanceP)}m ke Musholla (P).\n\nPastikan GPS Anda aktif dan Anda berada di lokasi yang tepat.`;
          }
          window.alert(errorMsg);
          setLocationError(errorMsg.replace(/\n\n/g, ' '));
        }
      }, error => {
        setIsLocating(false);
        let msg = "Gagal mengambil lokasi.";
        if (error.code === 1) msg = "Izin lokasi ditolak. Harap izinkan akses lokasi di browser untuk absen hadir.";else if (error.code === 2) msg = "Lokasi tidak tersedia.";else if (error.code === 3) msg = "Waktu pencarian lokasi habis.";
        setLocationError(msg);
      }, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      });
    } else {
      // Jika tidak hadir, langsung simpan (mungkin lagi dinas luar)
      saveAbsen('Absensi sholat zuhur berhasil disimpan.');
    }
  };
  if (isLoading) {
    return <div className="p-8 text-center text-slate-500 text-sm font-medium animate-pulse">
        Memeriksa status absensi...
      </div>;
  }
  if (hasAbsen) {
    return <div className="space-y-6">
        <h1 className="text-xl font-bold tracking-tight text-slate-800">Absensi Sholat Zuhur Pegawai</h1>
        <Card>
          <CardContent className="p-8 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-2">
              <Check className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Absensi Berhasil</h3>
            <p className="text-slate-500 text-sm max-w-sm">
              Anda sudah melakukan absensi sholat zuhur untuk hari ini. Absensi tercatat di semua peran akun Anda.
            </p>
          </CardContent>
        </Card>
      </div>;
  }
  return <div className="space-y-6">
      <h1 className="text-xl font-bold tracking-tight text-slate-800">Absensi Sholat Zuhur Pegawai</h1>
      <Card>
        <CardHeader><CardTitle>Presensi Jamaah Zuhur</CardTitle></CardHeader>
        <CardContent>
          {isBeforeLimit ? (
             <div className="p-8 text-center flex flex-col items-center justify-center space-y-4">
               <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mb-2">
                 <Clock className="w-8 h-8" />
               </div>
               <h3 className="text-lg font-bold text-slate-800">Belum Waktu Absen</h3>
               <p className="text-slate-500 text-sm max-w-sm">
                 Absensi sholat zuhur baru bisa diisi mulai jam 12.00 WIB. Silakan kembali lagi nanti.
               </p>
             </div>
          ) : (
          <>
          <p className="text-sm text-slate-600 mb-6">Silakan pilih status kehadiran sholat berjamaah zuhur Anda hari ini. <br /><span className="text-xs text-slate-400 font-bold">Catatan: Absen 'Hadir' memerlukan verifikasi lokasi.</span></p>
          
          <div className="space-y-4">
            <div className="flex gap-3 mt-4">
              {!isPastLimit && <button onClick={() => {
              setStatus('hadir');
              setLocationError(null);
            }} className={`flex-1 py-4 font-bold rounded-xl transition-all shadow-sm uppercase tracking-wider text-xs sm:text-sm flex items-center justify-center gap-2 ${status === 'hadir' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200 ring-2 ring-emerald-600 ring-offset-1' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'}`}>
                    <MapPin className="w-4 h-4" /> Berjamaah
                  </button>}
              <button onClick={() => {
              setStatus('tidak');
              setLocationError(null);
            }} className={`flex-1 py-4 font-bold rounded-xl transition-all shadow-sm uppercase tracking-wider text-xs sm:text-sm ${status === 'tidak' ? 'bg-amber-500 text-white shadow-md shadow-amber-200 ring-2 ring-amber-500 ring-offset-1' : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'}`}>
                Tidak Berjamaah
              </button>
            </div>
            
            {isPastLimit && <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700 flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                Batas waktu absensi hadir sholat berjamaah di masjid ({limitAbsenZuhur}) telah berakhir.
              </div>}

            {status === 'tidak' && <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl space-y-3 mt-4 animate-in fade-in slide-in-from-top-2">
                <label className="block text-sm font-bold text-slate-700">Keterangan / Udzur</label>
                <textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Misal: Sedang haid, dinas di luar sekolah, sakit, dll." className="w-full p-3 rounded-lg border border-slate-300 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm" rows={3}></textarea>
              </div>}

            {locationError && <div className="p-3 rounded-lg bg-red-50 text-red-600 border border-red-200 text-sm flex items-start gap-2">
                 <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                 <span>{locationError}</span>
               </div>}

            {status && <button onClick={handleSubmit} disabled={isLocating} className="w-full py-3.5 bg-[#1e7b55] hover:bg-[#166544] disabled:bg-slate-300 text-white font-bold rounded-xl shadow-sm uppercase tracking-wider text-sm transition-colors flex items-center justify-center gap-2">
                {isLocating ? <>
                     <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                     </svg>
                     Menyimpan & Mencari Lokasi...
                   </> : <>Simpan Absensi Zuhur</>}
              </button>}
            </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>;
}