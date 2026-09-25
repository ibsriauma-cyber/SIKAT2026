import { useRealtime } from "../lib/useRealtime";
import React, { useState, useEffect } from 'react';
import { remoteStorage } from '../lib/remoteStorage';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { mockStudents } from '../data/mock';
import { useAuth } from '../context/AuthContext';
import { apiClient, logKinerja } from '../lib/apiClient';
import { CustomSelect } from '../components/ui/CustomSelect';
import { Plus, Edit2, X, Check, Clock, BookOpen, Calendar, Users } from 'lucide-react';
function useWalasStudents() {
  const {
    user
  } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  useEffect(() => {
    if (!user) return;
    apiClient('/crud.php?table=students').then(data => {
      // Find students belonging to this walas
      const myClass = user.className || user.class_name;
      const filtered = data.filter((s: any) => s.class_name === myClass);
      setStudents(filtered.map((s: any) => ({
        id: String(s.id),
        name: s.name,
        nis: s.nis,
        className: s.class_name
      })));
    }).catch(console.error);
  }, [user]);
  return students;
}
export function PemantauanPagi() {
  const _syncTick = useRealtime();
  const {
    user
  } = useAuth();
  const students = useWalasStudents();
  const [monitoring, setMonitoring] = useState<Record<string, {
    kebersihan: string;
    seragam: string;
    ketSeragam: string;
  }>>({});
  const [motivasiPagi, setMotivasiPagi] = useState('');
  const [existingRecords, setExistingRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => (function(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');})());
  const [semester, setSemester] = useState('Ganjil');
  useEffect(() => {
    apiClient('/crud.php?table=academic_terms').then(data => {
      if (Array.isArray(data)) {
        const activeTerm = data.find((t: any) => Boolean(t.is_active));
        if (activeTerm) setSemester(activeTerm.semester || 'Ganjil');
      }
    }).catch(console.error);
  }, [_syncTick]);
  useEffect(() => {
    if (students.length > 0) {
      setLoading(true);
      apiClient('/crud.php?table=pemantauan_pagi').then(data => {
        if (Array.isArray(data)) {
          const todaysRecords = data.filter((r: any) => String(r.tanggal).startsWith(selectedDate) && r.class_name === (user?.className || user?.class_name));
          setExistingRecords(todaysRecords);
          setIsLocked(todaysRecords.length > 0);
          const initial: Record<string, {
            kebersihan: string;
            seragam: string;
            ketSeragam: string;
          }> = {};
          let fetchedMotivasi = '';
          students.forEach(s => {
            const record = todaysRecords.find((r: any) => r.student_id == s.id);
            if (record) {
              initial[s.id] = {
                kebersihan: record.kebersihan || 'Piket',
                seragam: record.seragam || 'Lengkap',
                ketSeragam: record.ket_seragam || ''
              };
              if (record.motivasi_pagi) {
                fetchedMotivasi = record.motivasi_pagi;
              }
            } else {
              initial[s.id] = {
                kebersihan: 'Piket',
                seragam: 'Lengkap',
                ketSeragam: ''
              };
            }
          });
          setMonitoring(initial);
          if (fetchedMotivasi) {
            setMotivasiPagi(fetchedMotivasi);
          }
        }
      }).catch(console.error).finally(() => setLoading(false));
    }
  }, [students, selectedDate, _syncTick]);
  const handleUpdate = (id: string, key: string, value: any) => {
    setMonitoring(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [key]: value
      }
    }));
  };
  const handleSave = async () => {
    if (students.length === 0) return;
    setLoading(true);
    try {
      const savePromises = students.map(s => {
        const record = existingRecords.find(r => r.student_id == s.id);
        const data = {
          student_id: s.id,
          class_name: s.className,
          tanggal: selectedDate,
          semester: semester,
          kebersihan: monitoring[s.id]?.kebersihan || 'Piket',
          seragam: monitoring[s.id]?.seragam || 'Lengkap',
          ket_seragam: monitoring[s.id]?.ketSeragam || '',
          motivasi_pagi: motivasiPagi
        };
        if (record) {
          return apiClient(`/crud.php?table=pemantauan_pagi&id=${record.id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
          });
        } else {
          return apiClient('/crud.php?table=pemantauan_pagi', {
            method: 'POST',
            body: JSON.stringify(data)
          });
        }
      });
      await Promise.all(savePromises);
      if (user?.id) {
        await logKinerja(user.id, 'Pemantauan pagi, cek piket dan kelengkapan siswa');
      }
      window.alert("Pemantauan pagi berhasil disimpan!");

      // Refresh data
      const newData = await apiClient('/crud.php?table=pemantauan_pagi');
      if (Array.isArray(newData)) {
        setExistingRecords(newData.filter((r: any) => String(r.tanggal).startsWith(selectedDate) && r.class_name === (user?.className || user?.class_name)));
        setIsLocked(true);
      }
    } catch (err) {
      console.error(err);
      window.alert("Gagal menyimpan data pemantauan.");
    } finally {
      setLoading(false);
    }
  };
  return <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl font-bold tracking-tight text-slate-800">Pemantauan Pagi</h1>
        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold text-slate-600">Tanggal:</label>
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="p-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>
      </div>
      
      <Card>
        <CardHeader><CardTitle>Motivasi Pagi</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">Jelaskan motivasi pagi apa yang Anda berikan kepada kelas hari ini:</label>
            <textarea value={motivasiPagi} onChange={e => setMotivasiPagi(e.target.value)} placeholder="Misal: Memberikan motivasi tentang pentingnya disiplin waktu..." className={`w-full p-3 rounded-lg border ${isLocked ? 'bg-slate-50 text-slate-500 border-slate-200 cursor-not-allowed' : 'border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'} focus:outline-none text-sm`} rows={4} disabled={isLocked} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Piket & Seragam Siswa</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="divide-y divide-slate-200 border border-slate-200 rounded-lg overflow-visible">
              {students.map((s, index) => <div key={s.id} className={`flex flex-col lg:flex-row lg:items-center justify-between p-3 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                  <div className="flex items-center gap-3 lg:w-1/3 mb-3 lg:mb-0">
                    <span className="text-slate-400 font-medium text-sm w-5">{index + 1}.</span>
                    <span className="font-medium text-slate-800">{s.name}</span>
                  </div>
                  <div className="flex gap-3 lg:w-2/3">
                    <div className="flex-1">
                      <CustomSelect value={monitoring[s.id]?.kebersihan || 'Piket'} onChange={val => handleUpdate(s.id, 'kebersihan', val)} disabled={isLocked} options={[{
                    value: 'Piket',
                    label: 'Piket'
                  }, {
                    value: 'Tidak Piket',
                    label: 'Tidak Piket'
                  }]} />
                    </div>
                    <div className="flex-1">
                      <CustomSelect value={monitoring[s.id]?.seragam || 'Lengkap'} onChange={val => {
                    handleUpdate(s.id, 'seragam', val);
                    if (val === 'Lengkap') {
                      handleUpdate(s.id, 'ketSeragam', '');
                    }
                  }} disabled={isLocked} options={[{
                    value: 'Lengkap',
                    label: 'Lengkap'
                  }, {
                    value: 'Tidak Lengkap',
                    label: 'Tidak Lengkap'
                  }]} />
                    </div>
                    {monitoring[s.id]?.seragam === 'Tidak Lengkap' && <div className="flex-1">
                        <input type="text" value={monitoring[s.id]?.ketSeragam || ''} onChange={e => handleUpdate(s.id, 'ketSeragam', e.target.value)} placeholder="Alasan tidak lengkap..." className={`w-full p-2 text-sm border rounded focus:outline-none ${isLocked ? 'bg-slate-50 text-slate-500 border-slate-200 cursor-not-allowed' : 'border-slate-300 focus:border-amber-500'}`} disabled={isLocked} />
                      </div>}
                  </div>
                </div>)}
            </div>
            {isLocked ? <button type="button" onClick={() => setIsLocked(false)} className="w-full mt-4 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg transition-colors">
                EDIT DATA
              </button> : <button onClick={handleSave} disabled={loading} className={`w-full py-3 text-white font-bold rounded-lg transition-colors ${loading ? 'bg-emerald-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
                {loading ? 'MENYIMPAN...' : 'SIMPAN PEMANTAUAN'}
              </button>}
          </div>
        </CardContent>
      </Card>
    </div>;
}
export function NilaiSikap() {
  const _syncTick = useRealtime();
  const {
    user
  } = useAuth();
  const students = useWalasStudents();
  const [grades, setGrades] = useState<Record<string, string>>({});
  const [existingRecords, setExistingRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => (function(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');})());
  const [semester, setSemester] = useState('Ganjil');
  useEffect(() => {
    apiClient('/crud.php?table=academic_terms').then(data => {
      if (Array.isArray(data)) {
        const activeTerm = data.find((t: any) => Boolean(t.is_active));
        if (activeTerm) setSemester(activeTerm.semester || 'Ganjil');
      }
    }).catch(console.error);
  }, [_syncTick]);
  useEffect(() => {
    if (students.length > 0) {
      setLoading(true);
      apiClient('/crud.php?table=nilai_sikap').then(data => {
        if (Array.isArray(data)) {
          const dateRecords = data.filter((r: any) => String(r.tanggal).startsWith(selectedDate) && r.class_name === (user?.className || user?.class_name));
          setExistingRecords(dateRecords);
          setIsLocked(dateRecords.length > 0);
          const initial: Record<string, string> = {};
          students.forEach(s => {
            const record = dateRecords.find((r: any) => r.student_id == s.id);
            initial[s.id] = record ? record.nilai : 'B';
          });
          setGrades(initial);
        }
      }).catch(console.error).finally(() => setLoading(false));
    }
  }, [students, selectedDate, _syncTick]);
  const handleUpdate = (id: string, val: string) => {
    setGrades(prev => ({
      ...prev,
      [id]: val
    }));
  };
  const handleSave = async () => {
    if (students.length === 0) return;
    setLoading(true);
    try {
      const savePromises = students.map(s => {
        const record = existingRecords.find(r => r.student_id == s.id);
        const data = {
          student_id: s.id,
          class_name: s.className,
          tanggal: selectedDate,
          semester: semester,
          nilai: grades[s.id] || 'B'
        };
        if (record) {
          return apiClient(`/crud.php?table=nilai_sikap&id=${record.id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
          });
        } else {
          return apiClient('/crud.php?table=nilai_sikap', {
            method: 'POST',
            body: JSON.stringify(data)
          });
        }
      });
      await Promise.all(savePromises);
      if (user?.id) {
        await logKinerja(user.id, 'Mengisi Nilai Sikap & Karakter siswa');
      }
      window.alert("Nilai sikap berhasil disimpan!");
      const newData = await apiClient('/crud.php?table=nilai_sikap');
      if (Array.isArray(newData)) {
        setExistingRecords(newData.filter((r: any) => String(r.tanggal).startsWith(selectedDate) && r.class_name === (user?.className || user?.class_name)));
        setIsLocked(true);
      }
    } catch (err) {
      console.error(err);
      window.alert("Gagal menyimpan data nilai sikap.");
    } finally {
      setLoading(false);
    }
  };
  return <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl font-bold tracking-tight text-slate-800">Nilai Sikap & Karakter</h1>
        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold text-slate-600">Tanggal:</label>
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="p-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>
      </div>
      <Card>
        <CardHeader><CardTitle>Penilaian Sikap Spiritual & Sosial</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="divide-y divide-slate-200 border border-slate-200 rounded-lg overflow-visible">
              {students.map((s, index) => <div key={s.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 font-medium text-sm w-5">{index + 1}.</span>
                    <span className="font-medium text-slate-800">{s.name}</span>
                  </div>
                  <div className="w-full sm:w-48 mt-3 sm:mt-0 ml-8 sm:ml-0">
                    <CustomSelect value={grades[s.id] || 'B'} onChange={val => handleUpdate(s.id, val)} disabled={isLocked} options={[{
                  value: 'A',
                  label: 'Sangat Baik (A)'
                }, {
                  value: 'B',
                  label: 'Baik (B)'
                }, {
                  value: 'C',
                  label: 'Cukup (C)'
                }, {
                  value: 'D',
                  label: 'Kurang (D)'
                }]} />
                  </div>
                </div>)}
            </div>
            {isLocked ? <button type="button" onClick={() => setIsLocked(false)} className="w-full mt-4 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg transition-colors">
                EDIT DATA
              </button> : <button onClick={handleSave} className="w-full mt-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2">
                {loading && <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>}
                SIMPAN NILAI SIKAP
              </button>}
          </div>
        </CardContent>
      </Card>
    </div>;
}
export function SholatZuhurWalas() {
  const students = useWalasStudents();
  const [attendance, setAttendance] = useState<Record<string, {
    status: string;
    ket: string;
  }>>({});
  const [isLocked, setIsLocked] = useState(false);
  const {
    user
  } = useAuth();
  const [selectedDate, setSelectedDate] = useState(() => (function(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');})());
  const selectedClass = user?.className || user?.class_name || '';
  const availableClasses = [selectedClass];
  const today = new Date(selectedDate).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  useEffect(() => {
    if (selectedClass) {
      const storageKey = `zuhur_${selectedClass}`;
      const existingData = JSON.parse(remoteStorage.getItem(storageKey) || '{}');
      const todayKey = selectedDate;
      if (existingData[todayKey]) {
        setAttendance(existingData[todayKey]);
        setIsLocked(true);
      } else {
        const defaultAtt: Record<string, {
          status: string;
          ket: string;
        }> = {};
        students.forEach(s => {
          defaultAtt[s.id] = {
            status: 'Jamaah',
            ket: ''
          };
        });
        setAttendance(defaultAtt);
        setIsLocked(false);
      }
    }
  }, [selectedClass, students, selectedDate]);
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
  const handleSave = async () => {
    const storageKey = `zuhur_${selectedClass}`;
    const existingData = JSON.parse(remoteStorage.getItem(storageKey) || '{}');
    const todayKey = selectedDate;
    existingData[todayKey] = attendance;
    remoteStorage.setItem(storageKey, JSON.stringify(existingData));
    try {
      await apiClient('/query.php', {
        method: 'POST',
        body: JSON.stringify({
          query: `DELETE FROM ibadah_siswa WHERE class_name = '${selectedClass.replace(/'/g, "\\'")}' AND type = 'Zuhur' AND date = '${todayKey}'`
        })
      });
      await Promise.all(Object.entries(attendance).map(async ([studentId, data]: [string, any]) => {
        if (!data.status) return;
        await apiClient('/crud.php?table=ibadah_siswa', {
          method: 'POST',
          body: JSON.stringify({
            student_id: studentId,
            class_name: selectedClass,
            date: todayKey,
            type: 'Zuhur',
            status: data.status,
            notes: data.ket || ''
          })
        });
      }));
    } catch (e) {
      console.error('Failed to save to database', e);
    }
    setIsLocked(true);
    if (user?.id) {
      await logKinerja(user.id, 'Mengabsen sholat Zuhur siswa kelas binaannya');
    }
    window.alert("Absensi Sholat Zuhur berhasil disimpan!");
  };
  const showStudents = selectedClass !== '';
  const nowHour = new Date().getHours();
  const isToday = selectedDate === (function(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');})();
  const isBeforeLimit = isToday && nowHour < 12;
  return <div className="space-y-4">
      {/* Top Bar */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100/50">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /><path d="M8 14h.01" /><path d="M12 14h.01" /><path d="M16 14h.01" /><path d="M8 18h.01" /><path d="M12 18h.01" /><path d="M16 18h.01" /></svg>
            </div>
            <div className="pr-4">
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Tanggal Absensi</p>
              <div className="flex items-center gap-2">
                <input type="date" max={(function(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');})()} value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-full h-8 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-700 shadow-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm font-bold text-slate-700 flex items-center justify-center whitespace-nowrap">
              Kelas: {selectedClass}
            </div>
            {isBeforeLimit ? null : isLocked ? <button onClick={() => setIsLocked(false)} className="w-full md:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 whitespace-nowrap transition-colors shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                Edit
              </button> : <button onClick={handleSave} className="w-full md:w-auto px-5 py-2.5 bg-[#1e7b55] hover:bg-[#166544] text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 whitespace-nowrap transition-colors shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
                Simpan
              </button>}
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Card className="border-slate-200 shadow-sm overflow-visible">
        {isBeforeLimit ? (
          <div className="p-8 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <h3 className="text-lg font-bold text-slate-800">Belum Waktu Absen</h3>
            <p className="text-slate-500 text-sm max-w-sm">
              Absensi sholat zuhur untuk hari ini baru bisa diisi mulai jam 12.00 WIB. Silakan kembali lagi nanti.
            </p>
          </div>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-3 px-4 text-xs font-bold text-slate-600 uppercase w-16 text-center">No</th>
                <th className="py-3 px-4 text-xs font-bold text-slate-600 uppercase">Nama Siswa</th>
                <th className="py-3 px-4 text-xs font-bold text-slate-600 uppercase text-center min-w-[140px]">Status Kehadiran</th>
                <th className="py-3 px-4 text-xs font-bold text-slate-600 uppercase">Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {showStudents ? students.map((s, i) => {
              const stat = attendance[s.id]?.status || '';
              const ket = attendance[s.id]?.ket || '';
              return <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-4 text-sm font-medium text-slate-500 text-center">{i + 1}</td>
                      <td className="py-4 px-4 text-sm font-bold text-slate-800">{s.name}</td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {['Jamaah', 'Tidak'].map(st => {
                      let bgActive = '';
                      let textActive = 'text-white';
                      let bgInactive = '';
                      let textInactive = '';
                      let hoverBg = '';
                      if (st === 'Jamaah') {
                        bgActive = 'bg-emerald-500';
                        bgInactive = 'bg-emerald-50';
                        textInactive = 'text-emerald-600';
                        hoverBg = 'hover:bg-emerald-100';
                      }
                      if (st === 'Tidak') {
                        bgActive = 'bg-amber-500';
                        bgInactive = 'bg-amber-50';
                        textInactive = 'text-amber-600';
                        hoverBg = 'hover:bg-amber-100';
                      }
                      const stLabel = st === 'Jamaah' ? 'J' : 'T';
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
            }) : <tr>
                  <td colSpan={4} className="py-12 text-center text-sm font-medium text-slate-500">
                    Pilih kelas terlebih dahulu
                  </td>
                </tr>}
            </tbody>
          </table>
        </div>
        )}
      </Card>
    </div>;
}
export function PrestasiWalas() {
  const students = useWalasStudents();
  const [prestasi, setPrestasi] = useState<any[]>(() => {
    const saved = remoteStorage.getItem('walas_prestasi_data');
    return saved ? JSON.parse(saved) : [];
  });
  useEffect(() => {
    remoteStorage.setItem('walas_prestasi_data', JSON.stringify(prestasi));
  }, [prestasi]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewStudent, setPreviewStudent] = useState<any>(null);
  const [studentId, setStudentId] = useState('');
  useEffect(() => {
    if (students.length > 0 && !studentId) {
      setStudentId(students[0].id);
    }
  }, [students]);
  const [jenis, setJenis] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const handleSave = () => {
    if (!studentId || !jenis || !keterangan) {
      window.alert("Mohon lengkapi data siswa, tingkat prestasi, dan keterangan.");
      return;
    }
    const student = students.find(s => String(s.id) === String(studentId));
    const newPrestasi = {
      id: Date.now(),
      studentId: String(studentId),
      namaSiswa: student ? student.name : '',
      kelas: student ? student.className : '',
      jenis,
      keterangan,
      tanggal: new Date().toLocaleDateString('id-ID')
    };
    setPrestasi([newPrestasi, ...prestasi]);
    setJenis('');
    setKeterangan('');
    setIsModalOpen(false);
    window.alert("Data prestasi berhasil disimpan.");
  };
  const handlePreview = (student: any) => {
    setPreviewStudent(student);
    setIsPreviewOpen(true);
  };
  return <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">Data Prestasi Siswa</h1>
          <p className="text-sm text-slate-500 mt-1">Rekap prestasi siswa kelas binaan</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" /> Tambah Prestasi
        </button>
      </div>
      
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 w-16 text-center">No</th>
                <th className="py-3 px-4">Nama Siswa</th>
                <th className="py-3 px-4 text-center">Kelas</th>
                <th className="py-3 px-4 text-center">Prestasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {students.length === 0 ? <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400 italic">Belum ada data siswa</td>
                </tr> : students.map((s, i) => {
              const studentPrestasi = prestasi.filter(p => p.studentId === String(s.id));
              return <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 text-center text-slate-500 font-medium">{i + 1}</td>
                      <td className="py-3 px-4 font-bold text-slate-700">{s.name}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium">
                          {s.className}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {studentPrestasi.length > 0 ? <button onClick={() => handlePreview(s)} className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1.5">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                            {studentPrestasi.length} Prestasi
                          </button> : <span className="text-slate-400 text-xs italic">-</span>}
                      </td>
                    </tr>;
            })}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
              <h2 className="font-bold text-slate-800">Tambah Prestasi Baru</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 space-y-4 overflow-y-auto">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Pilih Siswa</label>
                <CustomSelect value={studentId} onChange={setStudentId} options={students.map(s => ({
              value: String(s.id),
              label: s.name
            }))} />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tingkat / Jenis Prestasi</label>
                <CustomSelect value={jenis} onChange={setJenis} options={[{
              value: '',
              label: '-- Pilih Tingkat --'
            }, {
              value: 'Sekolah',
              label: 'Tingkat Sekolah'
            }, {
              value: 'Kabupaten/Kota',
              label: 'Tingkat Kabupaten/Kota'
            }, {
              value: 'Provinsi',
              label: 'Tingkat Provinsi'
            }, {
              value: 'Nasional',
              label: 'Tingkat Nasional'
            }, {
              value: 'Internasional',
              label: 'Tingkat Internasional'
            }]} />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Keterangan / Nama Lomba</label>
                <input type="text" value={keterangan} onChange={e => setKeterangan(e.target.value)} placeholder="Contoh: Juara 1 OSN Matematika" className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:border-emerald-500 bg-slate-50 text-sm" />
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50 shrink-0">
              <button onClick={handleSave} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2">
                <Check className="w-4 h-4" /> Simpan Prestasi
              </button>
            </div>
          </div>
        </div>}

      {isPreviewOpen && previewStudent && <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
              <h2 className="font-bold text-slate-800">Detail Prestasi Siswa</h2>
              <button onClick={() => setIsPreviewOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-lg">
                  {previewStudent.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">{previewStudent.name}</h3>
                  <p className="text-xs text-slate-500">Kelas {previewStudent.className} • NIS: {previewStudent.nis}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                {prestasi.filter(p => p.studentId === String(previewStudent.id)).map((p, idx) => <div key={idx} className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">
                        {p.jenis}
                      </span>
                      <span className="text-[10px] font-medium text-slate-400">{p.tanggal}</span>
                    </div>
                    <p className="text-sm font-medium text-slate-700 mt-2">{p.keterangan}</p>
                  </div>)}
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50 shrink-0 flex justify-end">
              <button onClick={() => setIsPreviewOpen(false)} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg transition-colors text-sm">
                Tutup
              </button>
            </div>
          </div>
        </div>}
    </div>;
}
export function BkWalas() {
  const students = useWalasStudents();
  const [cases, setCases] = useState(() => {
    const saved = remoteStorage.getItem('walas_cases_data');
    return saved ? JSON.parse(saved) : [{
      id: 1,
      tanggal: '18-07-2026',
      namaSiswa: 'Budi (XI-IPS 2)',
      kasus: 'Sering terlambat dan tidur di kelas',
      tindakLanjut: 'Sudah ditegur dan dinasihati, perlu panggilan orang tua.',
      status: 'Dalam Proses'
    }];
  });
  useEffect(() => {
    remoteStorage.setItem('walas_cases_data', JSON.stringify(cases));
  }, [cases]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tanggal, setTanggal] = useState((function(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');})());
  const [studentId, setStudentId] = useState('');
  useEffect(() => {
    if (students.length > 0 && !studentId) {
      setStudentId(students[0].id);
    }
  }, [students]);
  const [kasus, setKasus] = useState('');
  const [penanganan, setPenanganan] = useState('');
  const [status, setStatus] = useState('Dalam Proses');
  const handleSave = () => {
    if (!tanggal || !studentId || !kasus) {
      window.alert('Mohon lengkapi data wajib (Tanggal, Siswa, Kasus)!');
      return;
    }
    const student = students.find(s => s.id === studentId);
    const newCase = {
      id: Date.now(),
      tanggal: new Date(tanggal).toLocaleDateString('id-ID'),
      namaSiswa: student ? student.name : '',
      kasus,
      tindakLanjut: penanganan,
      status,
      source: 'Walas'
    };

    // Jika dialihkan ke Kesiswaan, tambahkan ke storage Kesiswaan
    if (status === 'Alihkan ke Kesiswaan') {
      const kesiswaanSaved = remoteStorage.getItem('bk_rekomendasi_sp'); // We can reuse the same sync queue
      const kesiswaanCases = kesiswaanSaved ? JSON.parse(kesiswaanSaved) : [];
      kesiswaanCases.push({
        idKasusWalas: newCase.id,
        tanggal: newCase.tanggal,
        namaSiswa: newCase.namaSiswa,
        kasus: newCase.kasus,
        usulanSP: 'Belum Ditentukan'
      });
      remoteStorage.setItem('bk_rekomendasi_sp', JSON.stringify(kesiswaanCases));
    }

    // Jika dialihkan ke BK, tambahkan juga ke storage BK
    if (status === 'Alihkan ke BK') {
      const bkSaved = remoteStorage.getItem('bk_cases_data');
      const bkCases = bkSaved ? JSON.parse(bkSaved) : [];

      // Cek apakah sudah ada untuk menghindari duplikasi jika diedit (untuk saat ini create new)
      bkCases.push({
        ...newCase,
        tindakLanjutBK: 'Menunggu penanganan BK'
      });
      remoteStorage.setItem('bk_cases_data', JSON.stringify(bkCases));
    }
    setCases([newCase, ...cases]);
    setTanggal((function(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');})());
    setStudentId(students[0]?.id || '');
    setKasus('');
    setPenanganan('');
    setStatus('Dalam Proses');
    setIsModalOpen(false);
    window.alert("Laporan BK berhasil disimpan dan akan diteruskan ke guru BK.");
  };
  return <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">Catatan Siswa</h1>
          <p className="text-sm text-slate-500 mt-1">Rekap kasus dan tindak lanjut siswa (Wali Kelas)</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" /> Tambah
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 whitespace-nowrap">Tanggal</th>
                <th className="py-3 px-4">Nama Siswa</th>
                <th className="py-3 px-4 min-w-[200px]">Kasus</th>
                <th className="py-3 px-4 min-w-[200px]">Tindak Lanjut</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {cases.length === 0 ? <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 italic">Belum ada catatan siswa</td>
                </tr> : cases.filter(c => students.some(s => s.name === c.namaSiswa)).length === 0 ? <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 italic">Belum ada catatan siswa untuk kelas ini</td>
                  </tr> : cases.filter(c => students.some(s => s.name === c.namaSiswa)).map(c => <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap">{c.tanggal}</td>
                      <td className="py-3 px-4 font-medium text-slate-700">{c.namaSiswa}</td>
                      <td className="py-3 px-4">{c.kasus}</td>
                      <td className="py-3 px-4 text-slate-500">{c.tindakLanjut || '-'}</td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${c.status === 'Selesai' ? 'bg-emerald-100 text-emerald-700' : c.status === 'Alihkan ke BK' ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>)}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-2.5 sm:p-4 pb-20 sm:pb-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[82vh] sm:max-h-[90vh] my-auto">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
              <h2 className="font-bold text-slate-800">Tambah Catatan Siswa</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 space-y-4 overflow-y-auto scrollbar-hide">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tanggal</label>
                <input type="date" max={(function(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');})()} value={tanggal} onChange={e => setTanggal(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-rose-500 bg-slate-50 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Pilih Siswa</label>
                <CustomSelect value={studentId} onChange={setStudentId} options={students.map(s => ({
              value: String(s.id),
              label: s.name
            }))} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Deskripsi Kasus / Masalah</label>
                <textarea rows={3} value={kasus} onChange={e => setKasus(e.target.value)} placeholder="Contoh: Siswa sering terlambat dan tidur di kelas..." className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-rose-500 bg-slate-50 text-sm"></textarea>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tindak Lanjut Walas</label>
                <textarea rows={2} value={penanganan} onChange={e => setPenanganan(e.target.value)} placeholder="Contoh: Sudah ditegur dan dinasihati, perlu panggilan orang tua..." className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-rose-500 bg-slate-50 text-sm"></textarea>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status</label>
                <CustomSelect value={status} onChange={v => setStatus(v)} options={[{
              value: 'Dalam Proses',
              label: 'Dalam Proses'
            }, {
              value: 'Selesai',
              label: 'Selesai'
            }, {
              value: 'Alihkan ke BK',
              label: 'Alihkan ke BK'
            }, {
              value: 'Alihkan ke Kesiswaan',
              label: 'Alihkan ke Kesiswaan'
            }]} />
              </div>
            </div>
            
            <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-500 hover:text-slate-700 hover:bg-slate-200 font-bold rounded-lg transition-colors text-sm">
                Batal
              </button>
              <button type="button" onClick={handleSave} className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition-colors text-sm flex items-center gap-2">
                <Check className="w-4 h-4" /> Simpan
              </button>
            </div>
          </div>
        </div>}
    </div>;
}
export function JadwalPelajaranWalas() {
  const _syncTick = useRealtime();
  const {
    user
  } = useAuth();
  const [filterHari, setFilterHari] = useState('Semua Hari');
  const [loading, setLoading] = useState(true);
  const [jadwal, setJadwal] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoading(true);
        // Fetch from API
        const [data, usersData] = await Promise.all([apiClient('/crud.php?table=schedules'), apiClient('/crud.php?table=users')]);
        if (Array.isArray(usersData)) {
          setUsers(usersData);
        }
        if (Array.isArray(data)) {
          // Filter out schedules just for this walas's class
          const myClass = user?.className || user?.class_name;
          const classSchedules = data.filter((d: any) => String(d.class_name) === String(myClass));
          const mapped = classSchedules.map((d: any) => ({
            id: d.id,
            hari: d.day || 'Senin',
            time: (d.start_time?.substring(0, 5) || '') + ' - ' + (d.end_time?.substring(0, 5) || ''),
            kelas: d.class_name,
            mapel: d.subject_name,
            guruId: d.teacher_id
          }));
          const daysOrder = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
          mapped.sort((a, b) => {
            const d1 = daysOrder.indexOf(a.hari);
            const d2 = daysOrder.indexOf(b.hari);
            if (d1 !== d2) return d1 - d2;
            return a.time.localeCompare(b.time);
          });
          setJadwal(mapped);
        }
      } catch (err) {
        console.error('Failed to load schedules', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedules();
  }, [user, _syncTick]);
  const hariOptions = ['Semua Hari', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const filteredJadwal = filterHari === 'Semua Hari' ? jadwal : jadwal.filter(j => j.hari === filterHari);
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
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs text-slate-500 uppercase">
                  <th className="pb-3 px-4 font-bold">Hari</th>
                  <th className="pb-3 px-4 font-bold">Waktu</th>
                  <th className="pb-3 px-4 font-bold">Mata Pelajaran</th>
                  <th className="pb-3 px-4 font-bold">Guru Pengajar</th>
                </tr>
              </thead>
              <tbody>
                {filteredJadwal.length > 0 ? filteredJadwal.map(j => {
                const teacher = users.find(u => String(u.id) === String(j.guruId));
                const displayName = teacher ? teacher.name : 'Guru Tidak Ditemukan';
                return <tr key={j.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 text-sm font-bold text-slate-800">{j.hari}</td>
                      <td className="py-3 px-4 text-sm font-medium text-slate-600">{j.time}</td>
                      <td className="py-3 px-4 text-sm font-bold text-slate-800">
                        {j.mapel}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        {displayName}
                      </td>
                    </tr>;
              }) : <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-500 text-sm">
                      Tidak ada jadwal ditemukan.
                    </td>
                  </tr>}
              </tbody>
            </table>
          </div>

          {/* Mobile Card-List View */}
          <div className="md:hidden flex flex-col gap-3">
            {filteredJadwal.length > 0 ? filteredJadwal.map(j => {
            const teacher = users.find(u => String(u.id) === String(j.guruId));
            const displayName = teacher ? teacher.name : 'Guru Tidak Ditemukan';
            return <div key={j.id} className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col gap-2.5">
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
                      <span>{j.mapel}</span> <span className="text-xs text-slate-500 font-normal mt-0.5">({displayName})</span>
                    </h3>
                  </div>
                </div>;
          }) : <div className="p-8 text-center border border-dashed border-slate-300 rounded-xl bg-slate-50">
                <Calendar className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-bold text-slate-500">Tidak ada jadwal</p>
              </div>}
          </div>
        </CardContent>
      </Card>
    </div>;
}