import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { mockStudents, mockUsers, mockClasses } from '../data/mock';
import { Edit2, Trash2, Plus, Search, X, Check, AlertCircle, Download, Upload, History, Users } from 'lucide-react';
import { Student, User, Role } from '../types';
import * as XLSX from 'xlsx';
import { CustomSelect } from '../components/ui/CustomSelect';
import { useAuth } from '../context/AuthContext';
import bcrypt from 'bcryptjs';
import { apiClient } from '../lib/apiClient';
import { AdminAcademic } from './AdminAcademic';
import { AdminKenaikanKelas } from './AdminKenaikanKelas';
import { AdminRombel } from './AdminRombel';

export function AdminStudents() {
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedClassFilter, setSelectedClassFilter] = useState('');
  const walasClass = user?.className || user?.class_name;

  const isWalas = user?.role === 'walas' || user?.roles?.includes('walas') || Boolean(user?.className || user?.class_name);
  const isAdminOrKesiswaan = ["admin", "superadmin", "admin_utama", "kamad", "wakakurikulum", "wakakesiswaan", "kesiswaan"].includes(user?.role || "") || (user?.roles && user.roles.some((r: string) => ["admin", "superadmin", "kesiswaan", "wakakurikulum"].includes(r)));
  const isPlainGuru = (user?.role === 'guru' || user?.roles?.includes('guru')) && !isWalas && !isAdminOrKesiswaan;

  useEffect(() => {
    if (isWalas && walasClass) {
      setSelectedClassFilter(walasClass);
    }
  }, [isWalas, walasClass]);
  const canManage = ["admin", "kamad", "wakakurikulum", "wakakesiswaan"].includes(user?.role || "");
  const [activeTab, setActiveTab] = useState<"siswa" | "kelas" | "rombel" | "kenaikan">("siswa");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedClassFilter]);

  const [students, setStudents] = useState<Student[]>([]);

  const [users, setUsers] = useState<User[]>([]);

  const [classes, setClasses] = useState<{name:string}[]>([]);

  const availableClassNames = Array.from(new Set([
    ...classes.map(c => c.name),
    ...students.map(s => s.className),
    ...mockClasses.map((c: any) => c.name),
    ...(walasClass ? [walasClass] : [])
  ])).filter(Boolean).sort();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [historyStudentId, setHistoryStudentId] = useState<string | null>(null);

  const [studentName, setStudentName] = useState('');
  const [studentNis, setStudentNis] = useState('');
  const [studentGrade, setStudentGrade] = useState('X');
  const [studentClassName, setStudentClassName] = useState('');
  const [studentGender, setStudentGender] = useState<'L' | 'P'>('L');
  const [studentPassword, setStudentPassword] = useState('');

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  useEffect(() => {
    let usersChanged = false;
    let currentUsers = [...users];
    
    students.forEach((student, index) => {
      const isXII = student.className.includes('XII') || student.className.includes('12');
      const existingUser = currentUsers.find(u => u.username === student.nis && u.role === 'siswa');
      if (!existingUser && isXII) {
        currentUsers.push({
          id: `sync-siswa-${Date.now()}-${index}`,
          name: student.name,
          username: student.nis,
          password: '$2a$10$C1VbQ.24G3bT.yNqO.j/s.V47aJ23rO3W.5wA1R8e0.18u3K2h',
          role: 'siswa',
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(student.name)}`,
        });
        usersChanged = true;
      }
      
      const baseParentUsername = student.name.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
      const existingParent = currentUsers.find(u => u.childId === student.id);
      if (!existingParent) {
          let expectedParentUsername = baseParentUsername;
          let counter = 1;
          while (currentUsers.some(u => u.username === expectedParentUsername)) {
            expectedParentUsername = `${baseParentUsername}${counter}`;
            counter++;
          }
          const parentName = 'Ayah/Bunda Ananda ' + student.name;
          currentUsers.push({
              id: `sync-ortu-${Date.now()}-${index}`,
              name: parentName,
              username: expectedParentUsername,
              password: '$2a$10$C1VbQ.24G3bT.yNqO.j/s.V47aJ23rO3W.5wA1R8e0.18u3K2h',
              role: 'ortu',
              childId: student.id,
              childName: student.name,
              avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(parentName)}`,
          });
          usersChanged = true;
      }
    });

    if (usersChanged) {
      setUsers(currentUsers);
      mockUsers.splice(0, mockUsers.length, ...currentUsers);
    }
  }, []);

    const fetchData = async () => {
    try {
      const [studentsData, classesData, usersData] = await Promise.all([
        apiClient('/crud.php?table=students'),
        apiClient('/crud.php?table=classes'),
        apiClient('/crud.php?table=users')
      ]);
      const mappedStudents = studentsData.map((s: any) => ({
        id: String(s.id),
        name: s.name,
        nis: s.nis,
        className: s.class_name,
        gender: s.gender,
        parentId: s.parent_id ? String(s.parent_id) : undefined,
        behaviorScore: s.behavior_score ? Number(s.behavior_score) : 100
      }));
      setStudents(mappedStudents);
      if (Array.isArray(classesData) && classesData.length > 0) {
        setClasses(classesData.map((c: any) => ({ name: c.name })));
      } else {
        setClasses(mockClasses.map((c: any) => ({ name: c.name })));
      }
      const mappedUsers = usersData.map((u: any) => ({
        id: String(u.id),
        name: u.name,
        username: u.username,
        role: u.role,
        gender: u.gender, className: u.class_name, childId: u.child_id, roles: typeof u.roles === "string" ? JSON.parse(u.roles) : u.roles || [u.role],
      }));
      setUsers(mappedUsers);
    } catch (e) {
      console.error(e);
      setFeedback({ type: 'error', message: 'Gagal memuat data dari database.' });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);


  useEffect(() => {
    
  }, [users]);

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const openAddModal = () => {
  
    setEditingId(null);
    setStudentName('');
    setStudentNis('');
    setStudentGrade('X');
    setStudentClassName('');
    setStudentGender('L');
    setStudentPassword('');
    setIsModalOpen(true);
  };

  const openEditModal = (s: any) => {
    setEditingId(s.id);
    setStudentName(s.name);
    setStudentNis(s.nis);
    setStudentGrade(s.grade || (s.className ? s.className.split(' ')[0] : 'X'));
    setStudentClassName(['X', 'XI', 'XII'].includes(s.className) ? '' : (s.className || ''));
    setStudentGender(s.gender || 'L');
    setStudentPassword('');
    setIsModalOpen(true);
  };

  const confirmDeleteStudent = async () => {
    if (deleteConfirmId) {
      try {
        await apiClient(`/crud.php?table=students&id=${deleteConfirmId}`, { method: 'DELETE' });
        setFeedback({ type: 'success', message: 'Data siswa berhasil dihapus.' });
        fetchData();
      } catch (e) {
        setFeedback({ type: 'error', message: 'Gagal menghapus siswa.' });
      }
      setDeleteConfirmId(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !studentNis.trim()) {
      setFeedback({ type: 'error', message: 'Nama dan NIS wajib diisi.' });
      return;
    }

    const payload: any = {
      name: studentName.trim(),
      nis: studentNis.trim(),
      class_name: studentClassName || studentGrade,
      gender: studentGender,
    };

    if (editingId) {
      try {
        await apiClient(`/crud.php?table=students&id=${editingId}`, { method: 'PUT', body: JSON.stringify(payload) });
        setFeedback({ type: 'success', message: 'Data siswa berhasil diperbarui.' });
      } catch (e) {
        setFeedback({ type: 'error', message: 'Gagal memperbarui siswa.' });
        return;
      }
    } else {
      try {
        const response = await apiClient('/crud.php?table=students', { method: 'POST', body: JSON.stringify(payload) });
        if (response.status === 'success' && response.insertId) {
           const newStudentId = response.insertId;
           
           // Create Ortu Account
           const baseParentUsername = studentName.trim().split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
           let expectedParentUsername = baseParentUsername;
           let counter = 1;
           while (users.some(u => u.username === expectedParentUsername)) {
             expectedParentUsername = `${baseParentUsername}${counter}`;
             counter++;
           }
           const parentName = 'Ayah/Bunda Ananda ' + studentName.trim();
           await apiClient('/crud.php?table=users', {
             method: 'POST',
             body: JSON.stringify({
                name: parentName,
                username: expectedParentUsername,
                password: '$2a$10$C1VbQ.24G3bT.yNqO.j/s.V47aJ23rO3W.5wA1R8e0.18u3K2h',
                role: 'ortu',
                roles: JSON.stringify(['ortu']),
                child_id: newStudentId,
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(parentName)}`
             })
           });

           // Create Siswa Account if Grade is XII
           if (studentGrade === 'XII') {
             await apiClient('/crud.php?table=users', {
                method: 'POST',
                body: JSON.stringify({
                   name: studentName.trim(),
                   username: studentNis.trim(),
                   password: (String(studentPassword || studentNis.trim()) === '12345' ? '$2a$10$C1VbQ.24G3bT.yNqO.j/s.V47aJ23rO3W.5wA1R8e0.18u3K2h' : String(studentPassword || studentNis.trim())),
                   role: 'siswa',
                   roles: JSON.stringify(['siswa']),
                   avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(studentName.trim())}`
                })
             });
           }
        }
        setFeedback({ type: 'success', message: 'Data siswa berhasil ditambahkan.' });
      } catch (e) {
        setFeedback({ type: 'error', message: 'Gagal menambahkan siswa.' });
        return;
      }
    }
    setIsModalOpen(false);
    fetchData();
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nis.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.className.toLowerCase().includes(searchQuery.toLowerCase());
    
    const activeClassFilter = (isWalas && !isAdminOrKesiswaan && walasClass) ? walasClass : selectedClassFilter;
    const matchesClass = !activeClassFilter || s.className === activeClassFilter;
    return matchesSearch && matchesClass;
  });

  // Pagination logic
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredStudents.length / rowsPerPage);

  const getWaliKelas = (className: string) => {
    if (['X','XI','XII'].includes(className)) return '-';
    const walas = users.find((u: any) => (u.role === 'walas' || (u.roles && u.roles.includes('walas'))) && u.className === className);
    return walas ? walas.name : 'Belum Ditugaskan';
  };

  const handleGenerateMissingAccounts = async () => {
    setFeedback({ type: 'info', message: 'Sedang mengecek dan membuat akun yang kurang...' });
    let createdCount = 0;
    
    try {
       for (const student of students) {
          // Check Ortu
          const hasOrtu = users.some(u => String(u.childId) === String(student.id) && u.role === 'ortu');
          if (!hasOrtu) {
             const baseParentUsername = student.name.trim().split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
             let expectedParentUsername = baseParentUsername;
             let counter = 1;
             while (users.some(u => u.username === expectedParentUsername)) {
               expectedParentUsername = `${baseParentUsername}${counter}`;
               counter++;
             }
             const parentName = 'Ayah/Bunda Ananda ' + student.name.trim();
             await apiClient('/crud.php?table=users', {
               method: 'POST',
               body: JSON.stringify({
                  name: parentName,
                  username: expectedParentUsername,
                  password: '$2a$10$C1VbQ.24G3bT.yNqO.j/s.V47aJ23rO3W.5wA1R8e0.18u3K2h',
                  role: 'ortu',
                  roles: JSON.stringify(['ortu']),
                  child_id: student.id,
                  avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(parentName)}`
               })
             });
             createdCount++;
          }

          // Check Siswa (Grade XII only)
          const grade = student.grade || (student.className ? student.className.split(' ')[0] : 'X');
          if (grade === 'XII' || grade === '12') {
             const hasSiswa = users.some(u => u.username === student.nis && u.role === 'siswa');
             if (!hasSiswa) {
                 await apiClient('/crud.php?table=users', {
                    method: 'POST',
                    body: JSON.stringify({
                       name: student.name.trim(),
                       username: student.nis.trim(),
                       password: (String(student.nis.trim()) === '12345' ? '$2a$10$C1VbQ.24G3bT.yNqO.j/s.V47aJ23rO3W.5wA1R8e0.18u3K2h' : String(student.nis.trim())),
                       role: 'siswa',
                       roles: JSON.stringify(['siswa']),
                       avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(student.name.trim())}`
                    })
                 });
                 createdCount++;
             }
          }
       }
       if (createdCount > 0) {
          setFeedback({ type: 'success', message: `Berhasil membuat ${createdCount} akun yang kurang.` });
          fetchData();
       } else {
          setFeedback({ type: 'success', message: 'Semua akun siswa dan orang tua sudah lengkap.' });
       }
    } catch (e) {
       console.error(e);
       setFeedback({ type: 'error', message: 'Terjadi kesalahan saat membuat akun.' });
    }
  };

  const downloadTemplate = () => {
  
    const ws = XLSX.utils.json_to_sheet([
      { Nama: 'Andi Saputra', NIS: '1001', 'Kelas': 'X-IPA 1', 'L/P': 'L', 'Password': 'opsional_password' },
      { Nama: 'Bunga Citra', NIS: '1002', 'Kelas': 'X-IPA 1', 'L/P': 'P' }
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template Siswa");
    XLSX.writeFile(wb, "Template_Upload_Siswa.xlsx");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        let newUsers: User[] = [];
        const newStudents: Student[] = data.map((row: any, index) => {
          const name = row.Nama || row.nama || '';
          const nis = String(row.NIS || row.nis || '');
          const className = String(row.Kelas || row.kelas || '');
          const gender = ((row['L/P'] || row.gender || 'L').toString().toUpperCase() === 'P' ? 'P' : 'L') as 'L' | 'P';
          
          if (name && nis) {
             const isXII = className.includes('XII') || className.includes('12');
             const providedPassword = row.Password || row.password || '';
             
             if (isXII) {
               newUsers.push({
                 id: String(Date.now() + index * 10 + 10000),
                 name: name,
                 username: nis,
                 password: (String(providedPassword || '12345') === '12345' ? '$2a$10$C1VbQ.24G3bT.yNqO.j/s.V47aJ23rO3W.5wA1R8e0.18u3K2h' : String(providedPassword)),
                 role: 'siswa',
                 avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
               });
               
               // Auto generate parent account
               const parentName = 'Ayah/Bunda Ananda ' + name;
               const baseParentUsername = name.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
               let parentUsername = baseParentUsername;
               let counter = 1;
               while (users.some(u => u.username === parentUsername) || newUsers.some(u => u.username === parentUsername)) {
                 parentUsername = `${baseParentUsername}${counter}`;
                 counter++;
               }
               newUsers.push({
                  id: String(Date.now() + index * 10 + 10001),
                  name: parentName,
                  username: parentUsername,
                  password: '$2a$10$C1VbQ.24G3bT.yNqO.j/s.V47aJ23rO3W.5wA1R8e0.18u3K2h',
                  role: 'ortu',
                  childId: String(Date.now() + index),
                  childName: name,
                  avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(parentName)}`,
               });
             }
          }
          
          return {
            id: String(Date.now() + index),
            name,
            nis,
            grade: className.split(' ')[0] || 'X',
            className,
            gender
          };
        }).filter(s => s.name && s.nis && s.grade);

        if (newStudents.length > 0) {
          (async () => {
             setFeedback({ type: 'info', message: `Mengunggah ${newStudents.length} siswa...` });
             try {
                let successCount = 0;
                let userCount = 0;
                for (const s of newStudents) {
                   try {
                       const res = await apiClient('/crud.php?table=students', {
                          method: 'POST',
                          body: JSON.stringify({
                             name: s.name,
                             nis: s.nis,
                             class_name: s.className,
                             gender: s.gender,
                             behavior_score: 100
                          }),
                       });
                       const insertId = res.insertId;
                       successCount++;
                       
                       // Find users for this student
                       const relatedUsers = newUsers.filter(u => u.username === s.nis || (u as any).childName === s.name);
                       for (const u of relatedUsers) {
                          try {
                              await apiClient('/crud.php?table=users', {
                                 method: 'POST',
                                 body: JSON.stringify({
                                    name: u.name,
                                    username: u.username,
                                    password: u.password,
                                    role: u.role,
                                    roles: JSON.stringify([u.role]),
                                    avatar: u.avatar,
                                    child_id: u.role === 'ortu' ? insertId : null
                                 }),
                              });
                              userCount++;
                          } catch (e) {
                              console.warn("Failed to create user", u.username, e);
                          }
                       }
                   } catch (e) {
                       console.warn("Failed to insert student", s.nis, e);
                   }
                }
                fetchData();
                setFeedback({ type: 'success', message: `${successCount} siswa diunggah, ${userCount} akun dibuat.` });
             } catch (err) {
                console.error(err);
                setFeedback({ type: 'error', message: 'Berhasil memproses excel namun gagal menyimpan ke database.' });
             }
          })();
        } else {
          setFeedback({ type: 'error', message: 'Format Excel tidak sesuai atau data kosong.' });
        }
      } catch (err) {
        setFeedback({ type: 'error', message: 'Gagal memproses file Excel.' });
      }
    };
    reader.readAsBinaryString(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {canManage && (
          <div className="flex bg-slate-100 p-1 rounded-lg">
          <button onClick={() => setActiveTab("siswa")} className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${activeTab === "siswa" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>Data Siswa</button>
          <button onClick={() => setActiveTab("kelas")} className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${activeTab === "kelas" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>Data Kelas</button>
          <button onClick={() => setActiveTab("rombel")} className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${activeTab === "rombel" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>Data Siswa Rombel</button>
          <button onClick={() => setActiveTab("kenaikan")} className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${activeTab === "kenaikan" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>Kenaikan Kelas</button>
          </div>
        )}
        {!canManage && (
          <h1 className="text-2xl font-bold text-slate-800">Data Siswa</h1>
        )}
      </div>

      {activeTab === 'siswa' && (
        <>
        {isPlainGuru ? (
          <Card className="border-amber-200 bg-amber-50 shadow-sm">
            <CardContent className="p-8 text-center space-y-3">
              <div className="flex justify-center">
                <AlertCircle className="w-12 h-12 text-amber-600" />
              </div>
              <h3 className="text-lg font-bold text-amber-800">Akses Data Siswa Terbatas</h3>
              <p className="text-sm text-amber-700 max-w-md mx-auto">
                Akses Data Siswa hanya diperuntukkan bagi Wali Kelas, Tim Kesiswaan, dan Administrator. Sebagai Guru Mata Pelajaran, Anda tidak dapat melihat data siswa secara menyeluruh, tetapi Anda dapat mengabsen siswa pada menu <strong>Absensi Siswa</strong>.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => navigate('/absensi')}
                  className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-sm"
                >
                  Buka Menu Absensi Siswa
                </button>
              </div>
            </CardContent>
          </Card>
        ) : (
        <Card>
          <CardHeader className="pb-4 border-b border-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari nama atau NIS..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div className="w-full sm:w-44">
                  <CustomSelect
                    value={selectedClassFilter}
                    onChange={setSelectedClassFilter}
                    options={[
                      { value: '', label: 'Semua Kelas' },
                      ...availableClassNames.map(c => ({ value: c, label: c }))
                    ]}
                  />
                </div>
                {walasClass && (
                  <button
                    onClick={() => setSelectedClassFilter(selectedClassFilter === walasClass ? '' : walasClass)}
                    className={"px-3 py-2 text-xs font-bold rounded-lg border transition-colors whitespace-nowrap " + (
                      selectedClassFilter === walasClass
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                    )}
                  >
                    Kelas Binaan ({walasClass})
                  </button>
                )}
                {user?.role !== 'admin' && (
                  <button
                    onClick={() => navigate('/absensi')}
                    className="px-3 py-2 text-xs font-bold bg-teal-700 hover:bg-teal-800 text-white rounded-lg transition-colors whitespace-nowrap flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5" /> Absensi Kelas
                  </button>
                )}
              </div>
              {canManage && (
              <div className="flex flex-wrap items-center gap-2">
                <input 
                  type="file" 
                  accept=".xlsx, .xls" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                />
                <button
                  onClick={downloadTemplate}
                  className="px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                  title="Download Template Excel"
                >
                  <Download className="w-4 h-4" /> Unduh
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                  title="Upload Data Excel"
                >
                  <Upload className="w-4 h-4" /> Import
                </button>
                <button
                  onClick={openAddModal}
                  className="px-4 py-2 bg-[#0d7345] hover:bg-[#0a5c37] text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Tambah Siswa
                </button>
                <button
                  onClick={handleGenerateMissingAccounts}
                  className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                  title="Buat Akun yang Kurang"
                >
                  <Users className="w-4 h-4" /> Buat Akun
                </button>
              </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {feedback && (
              <div className={`p-4 mb-4 rounded-lg flex items-start gap-3 border ${feedback.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                {feedback.type === 'success' ? <Check className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                <p className="text-sm font-medium">{feedback.message}</p>
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-xs text-slate-500 uppercase">
                    <th className="pb-3 px-4 font-bold">Nama Siswa</th>
                    <th className="pb-3 px-4 font-bold">Kelas</th>
                    <th className="pb-3 px-4 font-bold">L/P</th>
                    <th className="pb-3 px-4 font-bold">Wali Kelas</th>
                    {canManage && <th className="pb-3 px-4 font-bold text-right">Aksi</th>}
                  </tr>
                </thead>
                <tbody>
                  {currentStudents.length > 0 ? (
                    currentStudents.map(s => (
                      <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors group">
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-800 text-sm">{s.name}</p>
                          <p className="text-xs text-slate-500">{s.nis}</p>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-block px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase tracking-wider">
                            {s.className && !['X','XI','XII'].includes(s.className) ? `Grade ${s.grade || (s.className.split(' ')[0])} \u2022 ${s.className}` : `Grade ${s.className || s.grade || 'X'} \u2022 Belum Ada Rombel`}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-600 text-sm">
                            {s.gender || '-'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-sm font-medium text-slate-700">{getWaliKelas(s.className)}</p>
                        </td>
                        {canManage && (
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => setHistoryStudentId(s.id)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded" title="Riwayat Akademik">
                              <History className="w-4 h-4" />
                            </button>
                            <button onClick={() => openEditModal(s)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded" title="Edit">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => setDeleteConfirmId(s.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Hapus">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                        )}
                      </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={canManage ? 5 : 4} className="py-8 text-center text-slate-500 text-sm">
                      Tidak ada data siswa yang ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-slate-100 bg-slate-50 gap-4 rounded-b-xl">
              <p className="text-sm text-slate-500">
                Menampilkan <span className="font-bold text-slate-700">{indexOfFirstRow + 1}</span> - <span className="font-bold text-slate-700">{Math.min(indexOfLastRow, filteredStudents.length)}</span> dari <span className="font-bold text-slate-700">{filteredStudents.length}</span> siswa
              </p>
              <div className="flex gap-1">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sebelumnya
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(currentPage - p) <= 1)
                  .map((p, i, arr) => (
                    <React.Fragment key={p}>
                      {i > 0 && arr[i - 1] !== p - 1 && (
                        <span className="px-2 py-1 text-slate-400">...</span>
                      )}
                      <button
                        onClick={() => setCurrentPage(p)}
                        className={`w-8 h-8 flex items-center justify-center text-sm rounded-lg border ${
                          currentPage === p
                            ? 'bg-emerald-500 text-white border-emerald-500'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {p}
                      </button>
                    </React.Fragment>
                  ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
        )}

      {/* MODAL DELETE CONFIRMATION */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/40 backdrop-blur-sm pb-20 sm:pb-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden my-auto flex flex-col">
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4 text-red-600">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Konfirmasi Hapus</h3>
              <p className="text-sm text-slate-600 mb-6">Apakah Anda yakin ingin menghapus siswa ini? Tindakan ini tidak dapat dibatalkan.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-bold transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={confirmDeleteStudent}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold transition-colors"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto pb-20 sm:pb-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden my-auto flex flex-col max-h-[82vh] sm:max-h-[90vh]">
            <div className="flex justify-between items-center p-4 md:p-6 border-b border-slate-100">
              <h2 className="font-bold text-lg text-slate-800">
                {editingId ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-4 md:p-6 space-y-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Nama Lengkap</label>
                    <input
                      type="text"
                      required
                      placeholder="Masukkan nama siswa..."
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">NIS</label>
                    <input
                      type="text"
                      required
                      placeholder="Nomor Induk..."
                      value={studentNis}
                      onChange={(e) => setStudentNis(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">L/P</label>
                    <CustomSelect
                      value={studentGender}
                      onChange={(val) => setStudentGender(val as 'L' | 'P')}
                      options={[
                        { value: 'L', label: 'Laki-laki (L)' },
                        { value: 'P', label: 'Perempuan (P)' },
                      ]}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Rombel / Kelas</label>
                    <CustomSelect
                      value={studentClassName}
                      onChange={(val) => setStudentClassName(val)}
                      options={[
                        { value: '', label: '-- Belum ada kelas --' },
                        ...classes.map((c: any) => ({ value: c.name, label: c.name }))
                      ]}
                      searchable={true}
                    />
                  </div>
                </div>
                {!editingId && studentGrade === 'XII' && (
                  <div className="space-y-1.5 p-3 border border-indigo-100 bg-indigo-50 rounded-lg">
                    <label className="block text-xs font-bold text-indigo-800 uppercase tracking-wider">Password Akun (Otomatis NISN Jika Kosong)</label>
                    <input
                      type="text"
                      placeholder="Biarkan kosong untuk password default (123456)"
                      value={studentPassword}
                      onChange={(e) => setStudentPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-indigo-200 rounded-lg text-sm focus:border-indigo-500 outline-none mt-1"
                    />
                    <p className="text-[10px] text-indigo-600 mt-1">Siswa kelas 6 / 3 MA akan otomatis dibuatkan akun dengan NISN sebagai username.</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4 mt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-bold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <Check className="w-4 h-4" /> {editingId ? 'Simpan Perubahan' : 'Tambahkan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {historyStudentId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/40 backdrop-blur-sm pb-20 sm:pb-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[82vh] sm:max-h-[90vh] flex flex-col overflow-hidden my-auto">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2 text-indigo-600">
                <History className="w-5 h-5" />
                <h3 className="font-bold text-slate-800">Riwayat Akademik</h3>
              </div>
              <button 
                onClick={() => setHistoryStudentId(null)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              {(() => {
                const s = students.find(x => x.id === historyStudentId);
                if (!s) return null;
                
                return (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-indigo-50 border border-indigo-100 rounded-lg">
                      <div className="w-12 h-12 rounded-full bg-indigo-200 flex items-center justify-center font-bold text-indigo-700 text-lg">
                        {s.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-lg">{s.name}</h4>
                        <p className="text-sm text-slate-600">NIS: {s.nis} &bull; L/P: {s.gender || '-'}</p>
                      </div>
                      <div className="ml-auto text-right">
                        <span className="inline-block px-3 py-1 bg-white border border-indigo-200 text-indigo-700 rounded-lg text-sm font-bold shadow-sm">
                          Kelas Saat Ini: {s.className}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Catatan Riwayat Kelas</h4>
                      
                      {!s.academicHistory || s.academicHistory.length === 0 ? (
                        <div className="text-center p-8 border border-dashed border-slate-200 rounded-lg bg-slate-50">
                          <p className="text-slate-500 font-medium">Belum ada riwayat akademik.</p>
                          <p className="text-xs text-slate-400 mt-1">Riwayat akan tersimpan saat siswa dinaikkan kelas.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {s.academicHistory.map((hist, idx) => (
                            <div key={idx} className="border border-slate-200 rounded-lg p-4 bg-white shadow-sm">
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <span className="inline-block px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-bold uppercase tracking-wider mb-1">
                                    TAHUN AJARAN {hist.academicYear || 'Sebelumnya'}
                                  </span>
                                  <h5 className="font-bold text-slate-800 text-base">Kelas {hist.className}</h5>
                                </div>
                                {hist.behaviorScore !== undefined && (
                                  <div className="text-right">
                                    <div className="text-xs text-slate-500 font-bold uppercase mb-1">Nilai Sikap</div>
                                    <div className={`font-bold ${hist.behaviorScore >= 90 ? 'text-emerald-600' : hist.behaviorScore >= 75 ? 'text-blue-600' : 'text-amber-600'}`}>
                                      {hist.behaviorScore >= 90 ? 'Sangat Baik' : hist.behaviorScore >= 75 ? 'Baik' : 'Cukup'} ({hist.behaviorScore})
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              {hist.attendance && (
                                <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-slate-100 text-center">
                                  <div className="bg-emerald-50 rounded p-2">
                                    <div className="text-xs text-slate-500 font-medium">Hadir</div>
                                    <div className="font-bold text-emerald-700">{hist.attendance.present || 0}</div>
                                  </div>
                                  <div className="bg-amber-50 rounded p-2">
                                    <div className="text-xs text-slate-500 font-medium">Sakit</div>
                                    <div className="font-bold text-amber-700">{hist.attendance.sick || 0}</div>
                                  </div>
                                  <div className="bg-blue-50 rounded p-2">
                                    <div className="text-xs text-slate-500 font-medium">Izin</div>
                                    <div className="font-bold text-blue-700">{hist.attendance.permission || 0}</div>
                                  </div>
                                  <div className="bg-red-50 rounded p-2">
                                    <div className="text-xs text-slate-500 font-medium">Alpa</div>
                                    <div className="font-bold text-red-700">{hist.attendance.absent || 0}</div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button 
                onClick={() => setHistoryStudentId(null)}
                className="px-5 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-200 font-bold rounded-lg transition-colors text-sm"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
        </>
      )}
      {activeTab === 'kelas' && (
         <AdminAcademic />
      )}
      {activeTab === 'rombel' && (
         <AdminRombel />
      )}
      {activeTab === 'kenaikan' && (
         <AdminKenaikanKelas />
      )}
    </div>
  );
}

