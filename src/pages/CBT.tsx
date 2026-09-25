import { useRealtime } from "../lib/useRealtime";
import React, { useState, useEffect } from 'react';
import { remoteStorage } from '../lib/remoteStorage';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { FileText, Share2, Plus, Edit3, Trash2, List, PlayCircle, CheckCircle, Clock } from 'lucide-react';
import { CustomSelect } from '../components/ui/CustomSelect';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../lib/apiClient';
interface Question {
  id: string;
  type: 'pg' | 'essay' | 'isian' | 'menjodohkan';
  text: string;
  options?: string[]; // for PG
  answer?: string; // correct answer for PG (A, B, C, D, E), essay reference, or isian exact match
  points: number;
  matches?: {
    left: string;
    right: string;
  }[]; // for Menjodohkan
}
interface Exam {
  id: string;
  title: string;
  className: string;
  subject: string;
  date: string;
  status: 'Aktif' | 'Terjadwal' | 'Selesai';
  code: string;
  questions: Question[];
  totalQuestions?: number;
  createdBy?: string;
}
const mockBiologiQuestions: Question[] = [];
export function CBT() {
  const _syncTick = useRealtime();
  const {
    user
  } = useAuth();
  const isSiswa = user?.role === 'siswa';
  const isTeacherOrWalas = user?.role === 'guru' || user?.role === 'walas';
  const [classes, setClasses] = useState<any[]>([]);
  const [studentData, setStudentData] = useState<any>(null);
  useEffect(() => {
    Promise.all([apiClient('/crud.php?table=classes').then(res => setClasses(res || [])).catch(() => {}), isSiswa ? apiClient('/crud.php?table=students').then(res => {
      const student = (res || []).find((s: any) => s.nis === user?.username);
      if (student) setStudentData(student);
    }).catch(() => {}) : Promise.resolve()]);
  }, [isSiswa, user, _syncTick]);
  const studentClass = studentData?.className || '';

  // Get available classes and subjects for teacher
  const teacherSubjects = isTeacherOrWalas && user?.subjects ? user.subjects : [];

  // Available classes for dropdown

  const [exams, setExams] = useState<Exam[]>(() => {
    const saved = remoteStorage.getItem('cbt_exams_data');
    return saved ? JSON.parse(saved) : [];
  });
  const availableClassNames = Array.from(new Set([...classes.map((c: any) => c.name), ...exams.map((e: any) => e.className || e.class_name)])).filter(Boolean).sort();
  const availableClasses = isTeacherOrWalas ? Array.from(new Set(teacherSubjects.map(s => s.className))) : ['Semua Kelas', ...classes.map((c: any) => c.name)]; // Fallback for admin

  const visibleExams = exams.filter(e => {
    if (isSiswa) {
      if (e.className === 'Semua Kelas XII') {
        return studentClass.includes('XII') || studentClass.includes('12');
      }
      return e.className === studentClass;
    }
    return e.createdBy === user?.username || user?.role === 'admin';
  });
  const [bankSoal, setBankSoal] = useState<Question[]>(() => {
    const saved = remoteStorage.getItem('cbt_banksoal_data');
    return saved ? JSON.parse(saved) : [];
  });
  const [showExamModal, setShowExamModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [examForm, setExamForm] = useState<Partial<Exam>>({
    status: 'Terjadwal'
  });
  const [questionForm, setQuestionForm] = useState<Partial<Question>>({
    type: 'pg',
    options: ['', '', '', '', ''],
    points: 10,
    matches: [{
      left: '',
      right: ''
    }]
  });

  // Student Exam Taking State
  const [takingExamId, setTakingExamId] = useState<string | null>(null);
  const [studentAnswers, setStudentAnswers] = useState<Record<string, any>>({});
  const [timeLeft, setTimeLeft] = useState(5400); // 90 minutes in seconds

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (takingExamId && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && takingExamId) {
      handleFinishExam();
    }
    return () => clearInterval(timer);
  }, [takingExamId, timeLeft]);
  const activeExam = exams.find(e => e.id === takingExamId);
  const handleSaveExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examForm.title) return;
    setExams([{
      id: Date.now().toString(),
      title: examForm.title,
      className: examForm.className || 'Kelas 10',
      subject: examForm.subject || 'Matematika',
      date: examForm.date || 'Hari ini',
      status: examForm.status as 'Aktif' | 'Terjadwal',
      code: examForm.code || `EXAM-${Math.floor(Math.random() * 1000)}`,
      questions: [],
      totalQuestions: examForm.totalQuestions,
      createdBy: user?.username || ''
    }, ...exams]);
    setShowExamModal(false);
    setExamForm({
      status: 'Terjadwal'
    });
  };
  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionForm.text) return;
    setBankSoal([{
      id: Date.now().toString(),
      type: questionForm.type as 'pg' | 'essay' | 'isian' | 'menjodohkan',
      text: questionForm.text,
      options: questionForm.type === 'pg' ? questionForm.options : undefined,
      answer: questionForm.answer,
      points: Number(questionForm.points) || 10,
      matches: questionForm.type === 'menjodohkan' ? questionForm.matches : undefined
    }, ...bankSoal]);
    setShowQuestionModal(false);
    setQuestionForm({
      type: 'pg',
      options: ['', '', '', '', ''],
      points: 10,
      matches: [{
        left: '',
        right: ''
      }]
    });
  };
  const handleDeleteQuestion = (id: string) => {
    setBankSoal(bankSoal.filter(q => q.id !== id));
  };
  const handleStartExam = (id: string) => {
    setTakingExamId(id);
    setStudentAnswers({});
    setTimeLeft(5400); // Reset timer to 90 min
  };
  const handleFinishExam = () => {
    window.alert('Ujian selesai! Jawaban telah dikumpulkan.');
    setTakingExamId(null);
  };
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };
  if (takingExamId && activeExam) {
    return <div className="space-y-6 max-w-4xl mx-auto pb-20">
        <div className="sticky top-0 z-10 bg-slate-50/80 backdrop-blur-md pb-4 pt-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
            <div>
              <h1 className="text-xl font-bold text-slate-800">{activeExam.title}</h1>
              <p className="text-slate-500 text-sm mt-1">{activeExam.subject} • {activeExam.className}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-rose-50 text-rose-600 px-4 py-2 rounded-lg font-mono font-bold tracking-wider">
                <Clock className="w-5 h-5" />
                {formatTime(timeLeft)}
              </div>
              <Button onClick={handleFinishExam} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                <CheckCircle className="w-4 h-4" /> SELESAI
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {activeExam.questions.map((q, index) => <Card key={q.id}>
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 shrink-0 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700">
                      {index + 1}
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md mb-2 inline-block">
                        {q.type === 'pg' ? 'Pilihan Ganda' : q.type === 'isian' ? 'Isian Singkat' : q.type === 'essay' ? 'Esai' : 'Menjodohkan'}
                      </span>
                      <p className="font-medium text-slate-800 text-base leading-relaxed mt-1">{q.text}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-400 shrink-0">{q.points} Poin</span>
                </div>
              </CardHeader>
              <CardContent className="pt-0 pl-11 sm:pl-16">
                {q.type === 'pg' && q.options && <div className="space-y-2">
                    {q.options.map((opt, i) => {
                const letter = String.fromCharCode(65 + i);
                const isSelected = studentAnswers[q.id] === letter;
                return <label key={i} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${isSelected ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? 'border-indigo-600' : 'border-slate-300'}`}>
                            {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-indigo-600"></div>}
                          </div>
                          <span className={`font-bold w-5 shrink-0 ${isSelected ? 'text-indigo-700' : 'text-slate-500'}`}>{letter}.</span>
                          <span className={`text-sm ${isSelected ? 'text-indigo-900 font-medium' : 'text-slate-700'}`}>{opt}</span>
                          <input type="radio" className="hidden" name={`q-${q.id}`} value={letter} onChange={() => setStudentAnswers({
                    ...studentAnswers,
                    [q.id]: letter
                  })} checked={isSelected} />
                        </label>;
              })}
                  </div>}
                {q.type === 'isian' && <input type="text" value={studentAnswers[q.id] || ''} onChange={e => setStudentAnswers({
              ...studentAnswers,
              [q.id]: e.target.value
            })} placeholder="Ketik jawaban singkat Anda..." className="w-full p-3 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all" />}
                {q.type === 'essay' && <textarea rows={4} value={studentAnswers[q.id] || ''} onChange={e => setStudentAnswers({
              ...studentAnswers,
              [q.id]: e.target.value
            })} placeholder="Ketik jawaban lengkap Anda di sini..." className="w-full p-3 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all resize-y"></textarea>}
                {q.type === 'menjodohkan' && q.matches && <div className="space-y-3">
                    <p className="text-xs text-slate-500 mb-2">Pilih pasangan yang tepat untuk setiap item di sebelah kiri.</p>
                    {q.matches.map((match, i) => {
                const rightOptions = q.matches!.map(m => m.right).sort((a, b) => a.localeCompare(b)); // Simple sort to simulate shuffle
                const currentAnswer = (studentAnswers[q.id] || {})[i] || '';
                return <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-3">
                          <div className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 font-medium">
                            {match.left}
                          </div>
                          <div className="hidden sm:block text-slate-300">
                            <Share2 className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <CustomSelect value={currentAnswer || ''} onChange={val => {
                      const currentAnsObj = studentAnswers[q.id] || {};
                      setStudentAnswers({
                        ...studentAnswers,
                        [q.id]: {
                          ...currentAnsObj,
                          [i]: val
                        }
                      });
                    }} options={[{
                      value: '',
                      label: '-- Pilih Jawaban --'
                    }, ...rightOptions.map(opt => ({
                      value: opt,
                      label: opt
                    }))]} />
                          </div>
                        </div>;
              })}
                  </div>}
              </CardContent>
            </Card>)}
          
          {activeExam.questions.length === 0 && <div className="p-8 text-center bg-white border border-dashed border-slate-300 rounded-2xl">
              <p className="text-slate-500 font-medium">Soal belum tersedia untuk ujian ini.</p>
            </div>}
        </div>
        
        <div className="pt-8 flex justify-end">
          <Button onClick={handleFinishExam} className="gap-2 bg-emerald-600 hover:bg-emerald-700 px-8 py-6 text-lg rounded-xl shadow-lg shadow-emerald-600/20">
            <CheckCircle className="w-5 h-5" /> KUMPULKAN JAWABAN
          </Button>
        </div>
      </div>;
  }
  return <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">Ujian CBT</h1>
          <p className="text-slate-500 mt-1 text-sm">{isSiswa ? 'Daftar ujian yang tersedia.' : 'Kelola bank soal dan link ujian.'}</p>
        </div>
        {!isSiswa && <Button onClick={() => {
        let initialClass = availableClasses[0] || '';
        let initialSubject = '';
        if (isTeacherOrWalas && initialClass) {
          const classSubjects = Array.from(new Set(teacherSubjects.filter(s => s.className === initialClass).map(s => s.subjectName))) as string[];
          if (classSubjects.length === 1) {
            initialSubject = classSubjects[0];
          }
        }
        setExamForm({
          status: 'Terjadwal',
          className: initialClass,
          subject: initialSubject
        });
        setShowExamModal(true);
      }} className="shrink-0 gap-2">
            <Plus className="w-4 h-4" /> BUAT UJIAN BARU
          </Button>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className={isSiswa ? "md:col-span-3" : "md:col-span-2"}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="w-1 h-4 bg-emerald-500 rounded"></span>
              <CardTitle>Ujian Aktif & Terjadwal</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {visibleExams.map(ujian => <div key={ujian.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors gap-4">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 mt-1 ${ujian.status === 'Aktif' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{ujian.title}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">{ujian.className} • {ujian.subject} • {ujian.date}</p>
                    <div className="mt-3 flex items-center gap-2">
                       <span className="text-[10px] font-mono font-bold bg-slate-100 border border-slate-200 px-2 py-1 rounded text-slate-600">
                         {ujian.code}
                       </span>
                       {ujian.totalQuestions && <span className="text-[10px] font-bold bg-indigo-50 border border-indigo-100 text-indigo-600 px-2 py-1 rounded uppercase tracking-wider">
                           {ujian.totalQuestions} Soal
                         </span>}
                       {ujian.status === 'Aktif' && <span className="flex items-center gap-1.5 text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded uppercase tracking-widest">
                           <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Berjalan
                         </span>}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:self-center self-start mt-2 sm:mt-0">
                  {isSiswa ? <Button variant={ujian.status === 'Aktif' ? 'default' : 'outline'} size="sm" disabled={ujian.status !== 'Aktif'} className="gap-2" onClick={() => {
                if (ujian.status === 'Aktif') {
                  handleStartExam(ujian.id);
                }
              }}>
                      {ujian.status === 'Aktif' ? <><PlayCircle className="w-3.5 h-3.5" /> KERJAKAN</> : 'BELUM WAKTUNYA'}
                    </Button> : <>
                      <Button variant="outline" size="sm" className="gap-2"><Share2 className="w-3.5 h-3.5" /> BAGIKAN</Button>
                      <Button variant="outline" size="sm" className="gap-2" onClick={() => handleStartExam(ujian.id)}><List className="w-3.5 h-3.5" /> PREVIEW SOAL</Button>
                      <Button variant="ghost" size="sm">HASIL</Button>
                    </>}
                </div>
              </div>)}
            
            {visibleExams.length === 0 && <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-300 rounded-xl">
                <p className="text-slate-500 font-medium">Belum ada ujian yang dibuat.</p>
              </div>}
          </CardContent>
        </Card>

        {!isSiswa && <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <span className="w-1 h-4 bg-emerald-500 rounded"></span>
                <CardTitle>Bank Soal</CardTitle>
              </div>
              {isTeacherOrWalas && <p className="text-xs text-slate-500 mt-1">
                  Menampilkan soal untuk mata pelajaran yang Anda ampu: 
                  <span className="font-semibold text-slate-700 ml-1">
                    {Array.from(new Set(teacherSubjects.map(s => s.subjectName))).join(', ') || '-'}
                  </span>
                </p>}
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
               <div className="p-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center flex flex-col items-center justify-center min-h-[200px]">
                 <FileText className="w-8 h-8 mb-3 text-slate-300" />
                 <p className="text-sm font-bold text-slate-800">{bankSoal.length} Soal Tersimpan</p>
                 <Button onClick={() => setShowBankModal(true)} variant="outline" size="sm" className="mt-6 w-full">KELOLA SOAL</Button>
                 <Button onClick={() => setShowQuestionModal(true)} size="sm" className="mt-2 w-full gap-2"><Plus className="w-4 h-4" /> TAMBAH SOAL</Button>
               </div>
            </CardContent>
          </Card>}
      </div>

      {/* Modal Buat Ujian */}
      {showExamModal && <div className="fixed inset-0 z-[100] flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/50 backdrop-blur-sm pb-20 sm:pb-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[82vh] sm:max-h-[90vh] my-auto">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h2 className="text-lg font-bold text-slate-800">Buat Ujian Baru</h2>
              <button onClick={() => setShowExamModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              <form id="exam-form" onSubmit={handleSaveExam} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Judul Ujian</label>
                  <input type="text" required value={examForm.title || ''} onChange={e => setExamForm({
                ...examForm,
                title: e.target.value
              })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500" placeholder="Contoh: PTS Ganjil" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Kelas</label>
                    <CustomSelect value={examForm.className || availableClasses[0] || 'XII-IPA 1'} onChange={v => {
                  const newClass = v;
                  let autoSubject = examForm.subject;
                  if (isTeacherOrWalas) {
                    const classSubjects = Array.from(new Set(teacherSubjects.filter(s => s.className === newClass).map(s => s.subjectName)));
                    if (classSubjects.length === 1) {
                      autoSubject = classSubjects[0];
                    } else if (!classSubjects.includes(autoSubject || '')) {
                      autoSubject = '';
                    }
                  }
                  setExamForm({
                    ...examForm,
                    className: newClass,
                    subject: autoSubject
                  });
                }} options={availableClasses.map(c => ({
                  value: c,
                  label: c
                }))} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mata Pelajaran</label>
                    {isTeacherOrWalas ? <CustomSelect value={examForm.subject || ''} onChange={v => setExamForm({
                  ...examForm,
                  subject: v
                })} options={(Array.from(new Set(teacherSubjects.filter(s => s.className === (examForm.className || availableClasses[0] || 'XII-IPA 1')).map(s => s.subjectName))) as string[]).map(sub => ({
                  value: sub,
                  label: sub
                }))} placeholder="Pilih Mapel" /> : <input type="text" value={examForm.subject || ''} onChange={e => setExamForm({
                  ...examForm,
                  subject: e.target.value
                })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500" placeholder="Matematika" />}
                  </div>
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Waktu Pelaksanaan</label>
                   {examForm.className === 'Semua Kelas XII' ? <textarea value={examForm.date || ''} onChange={e => setExamForm({
                ...examForm,
                date: e.target.value
              })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500 resize-none h-24" placeholder="Misal:&#10;XII-IPA 1: Senin, 08:00&#10;XII-IPA 2: Senin, 10:00&#10;XII-IPS 1: Selasa, 08:00"></textarea> : <input type="text" value={examForm.date || ''} onChange={e => setExamForm({
                ...examForm,
                date: e.target.value
              })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500" placeholder="Misal: Besok, 08:00" />}
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status</label>
                   <CustomSelect value={examForm.status || 'Terjadwal'} onChange={v => setExamForm({
                ...examForm,
                status: v as 'Aktif' | 'Terjadwal'
              })} options={[{
                value: 'Aktif',
                label: 'Aktif'
              }, {
                value: 'Terjadwal',
                label: 'Terjadwal'
              }]} />
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Jumlah Soal Ditampilkan</label>
                   <input type="number" min="1" max="500" value={examForm.totalQuestions || ''} onChange={e => setExamForm({
                ...examForm,
                totalQuestions: Number(e.target.value)
              })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500" placeholder="Kosongkan untuk menampilkan semua soal" />
                </div>
              </form>
            </div>
            <div className="p-4 border-t border-slate-100 shrink-0">
              <Button type="submit" form="exam-form" className="w-full">SIMPAN UJIAN</Button>
            </div>
          </div>
        </div>}

      {/* Modal Buat Soal */}
      {showQuestionModal && <div className="fixed inset-0 z-[100] flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/50 backdrop-blur-sm pb-20 sm:pb-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[82vh] sm:max-h-[90vh] my-auto">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h2 className="text-lg font-bold text-slate-800">Buat Soal Baru</h2>
              <button onClick={() => setShowQuestionModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">              <form id="question-form" onSubmit={handleSaveQuestion} className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => setQuestionForm({
                ...questionForm,
                type: 'pg'
              })} className={`flex-1 min-w-[100px] py-2 text-xs font-bold rounded-lg border ${questionForm.type === 'pg' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>Pilihan Ganda</button>
                  <button type="button" onClick={() => setQuestionForm({
                ...questionForm,
                type: 'isian'
              })} className={`flex-1 min-w-[100px] py-2 text-xs font-bold rounded-lg border ${questionForm.type === 'isian' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>Isian</button>
                  <button type="button" onClick={() => setQuestionForm({
                ...questionForm,
                type: 'essay'
              })} className={`flex-1 min-w-[100px] py-2 text-xs font-bold rounded-lg border ${questionForm.type === 'essay' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>Esai</button>
                  <button type="button" onClick={() => setQuestionForm({
                ...questionForm,
                type: 'menjodohkan'
              })} className={`flex-1 min-w-[100px] py-2 text-xs font-bold rounded-lg border ${questionForm.type === 'menjodohkan' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>Menjodohkan</button>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Pertanyaan / Instruksi</label>
                  <textarea required rows={3} value={questionForm.text || ''} onChange={e => setQuestionForm({
                ...questionForm,
                text: e.target.value
              })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500 resize-none" placeholder="Tuliskan pertanyaan..."></textarea>
                </div>
                
                {questionForm.type === 'pg' && <div className="space-y-3">
                    <label className="block text-xs font-bold text-slate-500 uppercase">Pilihan Jawaban (A-E)</label>
                    {['A', 'B', 'C', 'D', 'E'].map((letter, i) => <div key={letter} className="flex gap-2 items-center">
                        <span className="font-bold text-sm text-slate-400">{letter}.</span>
                        <input type="text" value={questionForm.options?.[i] || ''} onChange={e => {
                  const newOpts = [...(questionForm.options || ['', '', '', '', ''])];
                  newOpts[i] = e.target.value;
                  setQuestionForm({
                    ...questionForm,
                    options: newOpts
                  });
                }} className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500" placeholder={`Pilihan ${letter}`} />
                      </div>)}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Kunci Jawaban</label>
                      <CustomSelect value={questionForm.answer || 'A'} onChange={v => setQuestionForm({
                  ...questionForm,
                  answer: v
                })} options={['A', 'B', 'C', 'D', 'E'].map(l => ({
                  value: l,
                  label: l
                }))} />
                    </div>
                  </div>}
                {questionForm.type === 'isian' && <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Kunci Jawaban Tepat</label>
                    <input type="text" required value={questionForm.answer || ''} onChange={e => setQuestionForm({
                ...questionForm,
                answer: e.target.value
              })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500" placeholder="Jawaban singkat yang benar..." />
                  </div>}
                {questionForm.type === 'essay' && <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Kunci / Referensi Jawaban</label>
                    <textarea rows={3} value={questionForm.answer || ''} onChange={e => setQuestionForm({
                ...questionForm,
                answer: e.target.value
              })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500 resize-none" placeholder="Tuliskan kata kunci jawaban untuk penilaian..."></textarea>
                  </div>}
                {questionForm.type === 'menjodohkan' && <div className="space-y-3">
                    <label className="block text-xs font-bold text-slate-500 uppercase">Pasangan Jawaban</label>
                    {(questionForm.matches || [{
                left: '',
                right: ''
              }]).map((match, i) => <div key={i} className="flex gap-2 items-center">
                        <input type="text" required value={match.left} onChange={e => {
                  const newMatches = [...(questionForm.matches || [])];
                  newMatches[i].left = e.target.value;
                  setQuestionForm({
                    ...questionForm,
                    matches: newMatches
                  });
                }} className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500" placeholder="Pertanyaan (Kiri)" />
                        <span className="text-slate-400 font-bold">-</span>
                        <input type="text" required value={match.right} onChange={e => {
                  const newMatches = [...(questionForm.matches || [])];
                  newMatches[i].right = e.target.value;
                  setQuestionForm({
                    ...questionForm,
                    matches: newMatches
                  });
                }} className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500" placeholder="Jawaban (Kanan)" />
                        {i > 0 && <button type="button" onClick={() => {
                  const newMatches = questionForm.matches!.filter((_, idx) => idx !== i);
                  setQuestionForm({
                    ...questionForm,
                    matches: newMatches
                  });
                }} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>}
                      </div>)}
                    <Button type="button" variant="outline" size="sm" onClick={() => {
                setQuestionForm({
                  ...questionForm,
                  matches: [...(questionForm.matches || []), {
                    left: '',
                    right: ''
                  }]
                });
              }} className="w-full gap-2">
                       <Plus className="w-4 h-4" /> Tambah Pasangan
                    </Button>
                  </div>}
                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Bobot Nilai (Poin)</label>
                   <input type="number" min="1" max="100" value={questionForm.points || 10} onChange={e => setQuestionForm({
                ...questionForm,
                points: Number(e.target.value)
              })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500" />
                </div>
              </form>
            </div>
            <div className="p-4 border-t border-slate-100 shrink-0">
              <Button type="submit" form="question-form" className="w-full">SIMPAN SOAL</Button>
            </div>
          </div>
        </div>}

      {/* Modal Kelola Bank Soal */}
      {showBankModal && <div className="fixed inset-0 z-[100] flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/50 backdrop-blur-sm pb-20 sm:pb-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[82vh] sm:max-h-[90vh] my-auto">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h2 className="text-lg font-bold text-slate-800">Bank Soal ({bankSoal.length})</h2>
              <button onClick={() => setShowBankModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 bg-slate-50 space-y-4">
              {bankSoal.map((soal, i) => <div key={soal.id} className="bg-white p-4 rounded-xl border border-slate-200">                  <div className="flex items-start justify-between gap-4 mb-2">
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded uppercase tracking-wider shrink-0">Soal {i + 1} • {soal.type === 'pg' ? 'Pilihan Ganda' : soal.type === 'isian' ? 'Isian' : soal.type === 'menjodohkan' ? 'Menjodohkan' : 'Esai'}</span>
                    <button onClick={() => handleDeleteQuestion(soal.id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  <p className="font-medium text-slate-800 text-sm whitespace-pre-wrap mb-4">{soal.text}</p>
                  
                  {soal.type === 'pg' && soal.options && <div className="space-y-2 mb-4 pl-4 border-l-2 border-slate-100">
                      {soal.options.map((opt, idx) => {
                const letter = String.fromCharCode(65 + idx);
                const isAnswer = letter === soal.answer;
                return <div key={idx} className={`text-sm ${isAnswer ? 'font-bold text-emerald-700' : 'text-slate-600'}`}>
                            {letter}. {opt} {isAnswer && <span className="ml-2 text-[10px] bg-emerald-100 text-emerald-700 px-1 rounded">KUNCI</span>}
                          </div>;
              })}
                    </div>}
                  {soal.type === 'isian' && soal.answer && <div className="mb-4 pl-4 border-l-2 border-emerald-200">
                      <p className="text-[10px] font-bold text-emerald-600 mb-1">KUNCI JAWABAN TEPAT:</p>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap font-bold">{soal.answer}</p>
                    </div>}
                  {soal.type === 'essay' && soal.answer && <div className="mb-4 pl-4 border-l-2 border-emerald-200">
                      <p className="text-[10px] font-bold text-emerald-600 mb-1">KUNCI / REFERENSI JAWABAN:</p>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">{soal.answer}</p>
                    </div>}
                  {soal.type === 'menjodohkan' && soal.matches && <div className="mb-4 pl-4 border-l-2 border-emerald-200 space-y-2">
                      <p className="text-[10px] font-bold text-emerald-600 mb-1">PASANGAN KUNCI (KIRI - KANAN):</p>
                      {soal.matches.map((match, idx) => <div key={idx} className="flex gap-2 text-sm text-slate-700 items-center">
                           <div className="flex-1 p-2 bg-slate-50 rounded border border-slate-200">{match.left}</div>
                           <span className="text-slate-400 font-bold">-</span>
                           <div className="flex-1 p-2 bg-slate-50 rounded border border-slate-200">{match.right}</div>
                        </div>)}
                    </div>}
                  
                  <div className="text-xs text-slate-400 font-bold">
                    Bobot: {soal.points} Poin
                  </div>
                </div>)}
              {bankSoal.length === 0 && <div className="text-center p-8 text-slate-500">Bank soal masih kosong.</div>}
            </div>
          </div>
        </div>}
    </div>;
}