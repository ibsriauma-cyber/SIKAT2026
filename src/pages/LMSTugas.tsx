import { useRealtime } from "../lib/useRealtime";
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { FileText, Share2, Upload, Plus, Trash2, Link as LinkIcon, Download, X, CheckCircle2, Check } from 'lucide-react';
import { CustomSelect } from '../components/ui/CustomSelect';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../lib/apiClient';
import { useEffect } from 'react';
interface Assignment {
  id: string;
  title: string;
  description?: string;
  type: 'materi' | 'tugas';
  className: string;
  subject: string;
  deadline?: string;
  link?: string;
  fileName?: string;
  createdAt: string;
}
interface Submission {
  id: string;
  studentName: string;
  status: 'dinilai' | 'belum';
  score?: number;
  fileUrl?: string;
  submittedAt: string;
}
export function LMSTugas() {
  const _syncTick = useRealtime();
  const {
    user
  } = useAuth();
  const isSiswa = user?.role === 'siswa';
  const [assignments, setAssignments] = useState<Assignment[]>([{
    id: '1',
    title: 'Materi Bab 1 - Logaritma Dasar',
    description: 'Pelajari slide materi berikut sebelum pertemuan besok. Pastikan sudah memahami sifat-sifat dasar logaritma.',
    type: 'materi',
    className: '',
    subject: 'Matematika Peminatan',
    link: 'https://docs.google.com/presentation/d/1234',
    fileName: 'Materi_Logaritma.pdf',
    createdAt: '2026-07-01'
  }, {
    id: '2',
    title: 'Tugas Latihan 1.1',
    description: 'Kerjakan soal latihan di halaman 15 nomor 1-5. Kumpulkan dalam bentuk PDF hasil pindaian / foto yang jelas.',
    type: 'tugas',
    className: '',
    subject: 'Matematika Peminatan',
    deadline: '2026-07-15 23:59',
    createdAt: '2026-07-10'
  }]);
  const [submissions, setSubmissions] = useState<Record<string, Submission[]>>({
    '2': [{
      id: 's1',
      studentName: 'Ahmad Fazil',
      status: 'belum',
      fileUrl: 'Tugas_Ahmad_Fazil.pdf',
      submittedAt: '2026-07-14 10:00'
    }, {
      id: 's2',
      studentName: 'Siti Aminah',
      status: 'dinilai',
      score: 95,
      fileUrl: 'Jawaban_Siti_Aminah.pdf',
      submittedAt: '2026-07-14 11:30'
    }]
  });
  const [showModal, setShowModal] = useState(false);
  const [submitModalAssignment, setSubmitModalAssignment] = useState<Assignment | null>(null);
  const [viewResultsAssignment, setViewResultsAssignment] = useState<Assignment | null>(null);
  const [form, setForm] = useState<Partial<Assignment>>({
    type: 'tugas',
    className: '',
    subject: 'Matematika Peminatan'
  });
  const [submitForm, setSubmitForm] = useState({
    file: null as File | null,
    link: ''
  });
  const [toastMessage, setToastMessage] = useState('');
  const [availableClasses, setAvailableClasses] = useState<{
    value: string;
    label: string;
  }[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<{
    value: string;
    label: string;
  }[]>([]);
  useEffect(() => {
    // Basic fallback classes
    let classOpts = [{
      value: '',
      label: 'Pilih Kelas'
    }, {
      value: 'X-IPS 1',
      label: 'X-IPS 1'
    }];
    let subjOpts = [{
      value: 'Matematika Peminatan',
      label: 'Matematika'
    }, {
      value: 'Bahasa Indonesia',
      label: 'B. Indo'
    }];
    if (user?.className) {
      classOpts = [{
        value: user.className,
        label: user.className
      }];
      setForm(f => ({
        ...f,
        className: user.className
      }));
    }
    setAvailableClasses(classOpts);
    setAvailableSubjects(subjOpts);
    if (user?.id) {
      Promise.all([
        apiClient('/crud.php?table=teaching_assignments').catch(() => []),
        apiClient('/crud.php?table=classes').catch(() => [])
      ]).then(([data, classesData]) => {
        const myAssignments = data.filter((a: any) => a.teacher_id === String(user.id) || a.guru_id === String(user.id) || a.teacher_id === user.id || a.guru_id === user.id);
        
        let uniqueClasses = Array.from(new Set(myAssignments.map((a: any) => a.class_name || a.rombel))).filter(Boolean) as string[];
        const uniqueSubjects = Array.from(new Set(myAssignments.map((a: any) => a.subject_name || a.mapel))).filter(Boolean) as string[];
        
        // Fallback to all classes if no assignments
        if (uniqueClasses.length === 0 && classesData && classesData.length > 0) {
          uniqueClasses = classesData.map((c: any) => c.name).filter(Boolean) as string[];
        }

        if (uniqueClasses.length > 0) {
          setAvailableClasses(uniqueClasses.map(c => ({
            value: c,
            label: c
          })));
          setForm(f => ({
            ...f,
            className: uniqueClasses[0]
          }));
        }
        
        if (uniqueSubjects.length > 0) {
          setAvailableSubjects(uniqueSubjects.map(s => ({
            value: s,
            label: s
          })));
          setForm(f => ({
            ...f,
            subject: uniqueSubjects[0]
          }));
        }
      }).catch(console.error);
    }
  }, [user, _syncTick]);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };
  const handleSubmitTugas = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submitForm.file && !submitForm.link) {
      showToast('Mohon lampirkan file atau tautan tugas Anda!');
      return;
    }
    if (submitModalAssignment) {
      const newSub: Submission = {
        id: Date.now().toString(),
        studentName: user?.name || 'Siswa',
        status: 'belum',
        fileUrl: submitForm.file ? submitForm.file.name : submitForm.link,
        submittedAt: new Date().toLocaleString('id-ID')
      };
      setSubmissions({
        ...submissions,
        [submitModalAssignment.id]: [...(submissions[submitModalAssignment.id] || []), newSub]
      });
      showToast('Tugas berhasil dikumpulkan!');
      setSubmitModalAssignment(null);
      setSubmitForm({
        file: null,
        link: ''
      });
    }
  };
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) return;
    setAssignments([{
      id: Date.now().toString(),
      title: form.title,
      description: form.description,
      type: form.type as 'materi' | 'tugas',
      className: form.className || '',
      subject: form.subject || 'Matematika Peminatan',
      deadline: form.deadline,
      link: form.link,
      fileName: form.fileName,
      createdAt: (function(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');})()
    }, ...assignments]);
    setShowModal(false);
    setForm({
      type: 'tugas',
      className: '',
      subject: 'Matematika Peminatan'
    });
  };
  const handleDelete = (id: string) => {
    setAssignments(assignments.filter(a => a.id !== id));
  };
  const handleCopyLink = (link?: string) => {
    if (!link) return;
    navigator.clipboard.writeText(link);
    alert('Link berhasil disalin!');
  };
  return <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">LMS - Materi & Tugas</h1>
          <p className="text-slate-500 mt-1 text-sm">{isSiswa ? 'Akses materi dan tugas yang diberikan.' : 'Bagikan link tugas, upload materi, dan kelola pembelajaran online.'}</p>
        </div>
        {!isSiswa && <Button onClick={() => setShowModal(true)} className="shrink-0 gap-2">
            <Plus className="w-4 h-4" /> BUAT BARU
          </Button>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          {assignments.map(item => <Card key={item.id}>
              <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${item.type === 'tugas' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                    {item.type === 'tugas' ? <Upload className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${item.type === 'tugas' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}>
                        {item.type}
                      </span>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">{item.className} • {item.subject}</span>
                    </div>
                    <h3 className="font-bold text-slate-800 text-base mb-1">{item.title}</h3>
                    
                    {item.description && <p className="text-sm text-slate-600 mb-2 leading-relaxed">{item.description}</p>}

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                      <span>Dibuat: {item.createdAt}</span>
                      {item.deadline && <span className="text-red-500 font-bold">Tenggat: {item.deadline}</span>}
                    </div>
                    
                    {/* Link & File info */}
                    {(item.link || item.fileName) && <div className="mt-3 flex flex-wrap items-center gap-2">
                        {item.link && <button onClick={() => handleCopyLink(item.link)} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors">
                            <LinkIcon className="w-3.5 h-3.5" /> Salin Tautan
                          </button>}
                        {item.fileName && <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg text-xs font-bold">
                            <FileText className="w-3.5 h-3.5" /> {item.fileName}
                            <Download className="w-3.5 h-3.5 ml-1 cursor-pointer hover:text-emerald-900" />
                          </div>}
                      </div>}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 sm:self-center self-start mt-2 sm:mt-0 shrink-0">
                  {item.type === 'tugas' && <Button variant="outline" size="sm" onClick={() => isSiswa ? setSubmitModalAssignment(item) : setViewResultsAssignment(item)} className="gap-2 text-emerald-700 border-emerald-200 hover:bg-emerald-50 font-bold">
                      {isSiswa ? 'KUMPUL TUGAS' : 'LIHAT HASIL'}
                    </Button>}
                  {!isSiswa && <button onClick={() => handleDelete(item.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Hapus Tugas/Materi">
                      <Trash2 className="w-4 h-4" />
                    </button>}
                </div>
              </CardContent>
            </Card>)}
          
          {assignments.length === 0 && <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-300 rounded-xl">
              <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">Belum ada materi atau tugas yang dibagikan.</p>
            </div>}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ringkasan LMS</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 text-blue-800 rounded-lg border border-blue-100">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-bold">Total Materi</span>
                </div>
                <span className="text-lg font-black">{assignments.filter(a => a.type === 'materi').length}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-amber-50 text-amber-800 rounded-lg border border-amber-100">
                <div className="flex items-center gap-3">
                  <Upload className="w-5 h-5 text-amber-500" />
                  <span className="text-sm font-bold">Total Tugas</span>
                </div>
                <span className="text-lg font-black">{assignments.filter(a => a.type === 'tugas').length}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {showModal && <div className="fixed inset-0 z-[100] flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/50 backdrop-blur-sm pb-20 sm:pb-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden max-h-[82vh] sm:max-h-[90vh] my-auto flex flex-col">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Buat Materi / Tugas Baru</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>
            <form onSubmit={handleSave} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setForm({
              ...form,
              type: 'materi'
            })} className={`py-2 px-3 rounded-xl border text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 ${form.type === 'materi' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                  <FileText className="w-4 h-4" /> Materi
                </button>
                <button type="button" onClick={() => setForm({
              ...form,
              type: 'tugas'
            })} className={`py-2 px-3 rounded-xl border text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 ${form.type === 'tugas' ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                  <Upload className="w-4 h-4" /> Tugas
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Judul</label>
                <input type="text" required value={form.title || ''} onChange={e => setForm({
              ...form,
              title: e.target.value
            })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" placeholder="Misal: Tugas Akhir Semester" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Kelas</label>
                  <CustomSelect value={form.className || ''} onChange={val => setForm({
                ...form,
                className: val
              })} options={availableClasses} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mata Pelajaran</label>
                  <CustomSelect value={form.subject || 'Matematika Peminatan'} onChange={val => setForm({
                ...form,
                subject: val
              })} options={availableSubjects} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Lampirkan Tautan (Link)</label>
                <input type="url" value={form.link || ''} onChange={e => setForm({
              ...form,
              link: e.target.value
            })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" placeholder="https://docs.google.com/..." />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Upload File (PDF/Doc/Excel)</label>
                <div className="flex items-center gap-2">
                  <input type="file" onChange={e => {
                if (e.target.files && e.target.files.length > 0) {
                  setForm({
                    ...form,
                    fileName: e.target.files[0].name
                  });
                }
              }} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Deskripsi / Instruksi Tambahan</label>
                <textarea value={form.description || ''} onChange={e => setForm({
              ...form,
              description: e.target.value
            })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" placeholder="Instruksi tambahan untuk siswa..." rows={3} />
              </div>

              {form.type === 'tugas' && <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Batas Waktu (Deadline)</label>
                  <input type="datetime-local" value={form.deadline || ''} onChange={e => setForm({
              ...form,
              deadline: e.target.value
            })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
                </div>}

              <div className="pt-2">
                <Button type="submit" className="w-full py-3">SIMPAN & BAGIKAN</Button>
              </div>
            </form>
          </div>
        </div>}

      {/* Submit Assignment Modal (Student) */}
      {submitModalAssignment && <div className="fixed inset-0 z-[100] flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/50 backdrop-blur-sm pb-20 sm:pb-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[82vh] sm:max-h-[90vh] my-auto flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Kumpulkan Tugas</h2>
                <p className="text-xs text-slate-500 mt-1">{submitModalAssignment.title}</p>
              </div>
              <button onClick={() => setSubmitModalAssignment(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmitTugas} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Upload File (PDF/Doc/Zip)</label>
                <div className="flex items-center gap-2">
                  <input type="file" onChange={e => {
                if (e.target.files && e.target.files.length > 0) {
                  setSubmitForm({
                    ...submitForm,
                    file: e.target.files[0]
                  });
                }
              }} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer" />
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-2 text-slate-500 font-bold uppercase">ATAU</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Lampirkan Tautan (Link Drive/Lainnya)</label>
                <input type="url" value={submitForm.link} onChange={e => setSubmitForm({
              ...submitForm,
              link: e.target.value
            })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" placeholder="https://..." />
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setSubmitModalAssignment(null)} className="font-bold">Batal</Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 font-bold">Kumpul Sekarang</Button>
              </div>
            </form>
          </div>
        </div>}

      {/* View Results Modal (Teacher) */}
      {viewResultsAssignment && <div className="fixed inset-0 z-[100] flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/50 backdrop-blur-sm pb-20 sm:pb-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[82vh] sm:max-h-[90vh] my-auto flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Hasil Pengumpulan Tugas</h2>
                <p className="text-xs text-slate-500 mt-1">{viewResultsAssignment.title}</p>
              </div>
              <button onClick={() => setViewResultsAssignment(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-0 overflow-y-auto flex-1">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase text-xs font-bold">
                  <tr>
                    <th className="px-5 py-3">Nama Siswa</th>
                    <th className="px-5 py-3">Waktu Kumpul</th>
                    <th className="px-5 py-3">Lampiran</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Nilai</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {submissions[viewResultsAssignment.id]?.length > 0 ? submissions[viewResultsAssignment.id].map(sub => <tr key={sub.id} className="hover:bg-slate-50">
                        <td className="px-5 py-3 font-bold text-slate-800">{sub.studentName}</td>
                        <td className="px-5 py-3 text-slate-500">{sub.submittedAt}</td>
                        <td className="px-5 py-3">
                          {sub.fileUrl && <a href="#" className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-bold hover:underline" onClick={e => e.preventDefault()}>
                              <FileText className="w-3.5 h-3.5" /> Buka
                            </a>}
                        </td>
                        <td className="px-5 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${sub.status === 'dinilai' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                            {sub.status === 'dinilai' ? 'Dinilai' : 'Belum Dinilai'}
                          </span>
                        </td>
                        <td className="px-5 py-3 font-bold text-slate-800">
                          {sub.score || '-'}
                        </td>
                      </tr>) : <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-slate-500 font-medium">
                        Belum ada siswa yang mengumpulkan tugas ini.
                      </td>
                    </tr>}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <Button variant="outline" onClick={() => setViewResultsAssignment(null)} className="font-bold">Tutup</Button>
            </div>
          </div>
        </div>}
    </div>;
}