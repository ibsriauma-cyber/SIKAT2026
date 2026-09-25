import { useRealtime } from "../lib/useRealtime";
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { mockUsers, mockStudents, mockClasses, mockSubjects } from '../data/mock';
import { Edit2, Trash2, Plus, Search, X, Users, Check, AlertCircle, Download, Upload } from 'lucide-react';
import { User, Role } from '../types';
import { CustomSelect } from '../components/ui/CustomSelect';
import { UserAvatar } from '../components/ui/UserAvatar';
import * as XLSX from 'xlsx';
import { apiClient } from '../lib/apiClient';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useAuth } from '../context/AuthContext';
export function AdminUsers() {
  const _syncTick = useRealtime();
  const {
    user: currentUser
  } = useAuth();
  const [activeTab, setActiveTab] = useState<'guru_tendik' | 'ortu' | 'siswa'>(currentUser?.role === 'walas' ? 'ortu' : 'guru_tendik');
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Loaded & persisted lists
  const [users, setUsers] = useState<User[]>([]);
  const [students] = useState(mockStudents);
  const [classes] = useState(mockClasses);

  // Modal / Form Management
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form Fields
  const [userName, setUserName] = useState('');
  const [userUsername, setUserUsername] = useState('');
  const [userNuptk, setUserNuptk] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userRoles, setUserRoles] = useState<Role[]>(['guru']);
  const [userGender, setUserGender] = useState<'L' | 'P' | ''>('');
  const [userClassName, setUserClassName] = useState('');
  const [userChildId, setUserChildId] = useState('');
  const [userSubjects, setUserSubjects] = useState<{
    id: string;
    subjectName: string;
    className: string;
  }[]>([]);
  const [tempSubjectName, setTempSubjectName] = useState('');
  const [tempClassName, setTempClassName] = useState('');
  const [subjectOptions, setSubjectOptions] = useState<{
    value: string;
    label: string;
  }[]>([]);
  const [classOptions, setClassOptions] = useState<{
    value: string;
    label: string;
  }[]>([]);
  useEffect(() => {
    apiClient('/crud.php?table=subjects').then(data => {
      if (Array.isArray(data)) {
        setSubjectOptions(data.map(s => ({
          value: s.name,
          label: s.name
        })));
      }
    }).catch(console.error);
    apiClient('/crud.php?table=classes').then(data => {
      if (Array.isArray(data)) {
        setClassOptions(data.map(c => ({
          value: c.name,
          label: c.name
        })));
      }
    }).catch(console.error);
  }, [_syncTick]);
  const handleAddTempSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempSubjectName || !tempClassName) return;
    setUserSubjects([...userSubjects, {
      id: Date.now().toString(),
      subjectName: tempSubjectName,
      className: tempClassName
    }]);
    setTempSubjectName('');
    setTempClassName('');
  };
  const handleRemoveTempSubject = (id: string) => {
    setUserSubjects(userSubjects.filter(s => s.id !== id));
  };

  // Validation / Feedback messages
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const fetchUsers = async () => {
    try {
      const data = await apiClient('/crud.php?table=users');
      if (!Array.isArray(data)) {
        console.error("Data returned from /crud.php?table=users is not an array:", data);
        throw new Error("Format respons tidak valid dari server: bukan array.");
      }
      const mapped = data.map((u: any) => ({
        id: String(u.id),
        name: u.name,
        username: u.username,
        nuptk: u.nuptk,
        password: u.password,
        role: u.role,
        roles: (typeof u.roles === 'string' ? JSON.parse(u.roles) : u.roles) || [u.role],
        avatar: u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u.name)}`,
        gender: u.gender,
        className: u.class_name,
        childId: u.child_id ? String(u.child_id) : undefined
      }));
      setUsers(mapped);
    } catch (e) {
      console.error('Fetch Users Error:', e);
      setFeedback({
        type: 'error',
        message: 'Gagal memuat data pengguna dari database: ' + (e instanceof Error ? e.message : String(e))
      });
    }
  };
  useEffect(() => {
    fetchUsers();
  }, []);

  // Clear feedback automatically
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // Download Excel Template for Guru & Tendik
  const downloadTemplate = () => {
    const templateData = [{
      "Nama Lengkap": "Ahmad Fauzi, S.Pd",
      "NIPTK/NUPTK (Username)": "1234567890",
      "Password": "12345",
      "Peran Utama": "guru",
      "Jenis Kelamin (L/P)": "L",
      "Wali Kelas": "",
      "Mata Pelajaran": "Matematika Wajib"
    }, {
      "Nama Lengkap": "Siti Nurhaliza, M.Pd",
      "NIPTK/NUPTK (Username)": "0987654321",
      "Password": "12345",
      "Peran Utama": "walas",
      "Jenis Kelamin (L/P)": "P",
      "Wali Kelas": "X-IPA 1",
      "Mata Pelajaran": "Bahasa Indonesia"
    }, {
      "Nama Lengkap": "Drs. Ahmad Dahlan",
      "NIPTK/NUPTK (Username)": "111122223333",
      "Password": "12345",
      "Peran Utama": "kamad",
      "Jenis Kelamin (L/P)": "L",
      "Wali Kelas": "",
      "Mata Pelajaran": ""
    }, {
      "Nama Lengkap": "Dina, S.Psi",
      "NIPTK/NUPTK (Username)": "444455556666",
      "Password": "12345",
      "Peran Utama": "bk",
      "Jenis Kelamin (L/P)": "P",
      "Wali Kelas": "",
      "Mata Pelajaran": "Bimbingan Konseling"
    }, {
      "Nama Lengkap": "Ust. Umar, S.Pd.I",
      "NIPTK/NUPTK (Username)": "777788889999",
      "Password": "12345",
      "Peran Utama": "guru_quran",
      "Jenis Kelamin (L/P)": "L",
      "Wali Kelas": "",
      "Mata Pelajaran": "Tahfidz Al-Quran"
    }];
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    worksheet['!cols'] = [{
      wch: 25
    },
    // Nama Lengkap
    {
      wch: 22
    },
    // NIPTK/NUPTK
    {
      wch: 15
    },
    // Password
    {
      wch: 20
    },
    // Peran Utama
    {
      wch: 18
    },
    // Jenis Kelamin
    {
      wch: 18
    },
    // Wali Kelas
    {
      wch: 25
    } // Mata Pelajaran
    ];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template Guru & Tendik");
    XLSX.writeFile(workbook, "Template_Import_Guru_Tendik.xlsx");
  };

  // Upload Excel Data for Guru & Tendik
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, {
          type: 'binary'
        });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data: any[] = XLSX.utils.sheet_to_json(ws);
        if (!data || data.length === 0) {
          setFeedback({
            type: 'error',
            message: 'File Excel kosong atau format tidak sesuai.'
          });
          return;
        }
        const newUsers: User[] = [];
        let successCount = 0;
        data.forEach((row, index) => {
          const rawName = String(row['Nama Lengkap'] || row['Nama'] || row['nama'] || '').trim();
          if (!rawName) return;
          let rawUsername = String(row['NIPTK/NUPTK (Username)'] || row['NUPTK'] || row['NIPTK'] || row['Username'] || row['username'] || '').trim();
          if (!rawUsername) {
            let currentUsername = rawName.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
            let finalUsername = currentUsername;
            let counter = 1;
            while (users.some(u => u.username === finalUsername) || newUsers.some(u => u.username === finalUsername)) {
              finalUsername = `${currentUsername}${counter}`;
              counter++;
            }
            rawUsername = finalUsername;
          }
          const rawPassword = String(row['Password'] || row['password'] || '12345').trim();
          const hashedPassword = rawPassword;
          let rawRole = String(row['Peran Utama'] || row['Peran'] || row['Role'] || row['role'] || 'guru').trim().toLowerCase();
          const validRoles: Role[] = ['guru', 'walas', 'kamad', 'admin', 'wakakurikulum', 'wakakesiswaan', 'bk', 'pustaka', 'guru_quran', 'ortu', 'siswa'];
          const parsedRoles: Role[] = [];
          if (rawRole.includes('walas') || rawRole.includes('wali')) {
            parsedRoles.push('walas');
            parsedRoles.push('guru');
          }
          if (rawRole.includes('kurikulum')) {
            parsedRoles.push('wakakurikulum');
            parsedRoles.push('guru');
          }
          if (rawRole.includes('kesiswaan')) {
            parsedRoles.push('wakakesiswaan');
            parsedRoles.push('guru');
          }
          if (rawRole.includes('kamad') || rawRole.includes('kepala')) {
            parsedRoles.push('kamad');
          }
          if (rawRole.includes('bk') || rawRole.includes('konseling')) {
            parsedRoles.push('bk');
          }
          if (rawRole.includes('pustaka') || rawRole.includes('perpustakaan')) {
            parsedRoles.push('pustaka');
          }
          if (rawRole.includes('quran') || rawRole.includes('tahfidz')) {
            parsedRoles.push('guru_quran');
          }
          if (rawRole.includes('admin')) {
            parsedRoles.push('admin');
          }
          if (rawRole.includes('guru') && !parsedRoles.includes('guru')) {
            parsedRoles.push('guru');
          }
          if (parsedRoles.length === 0) {
            const parts = rawRole.split(/[,;]/).map(p => p.trim());
            parts.forEach(p => {
              if (validRoles.includes(p as Role)) {
                parsedRoles.push(p as Role);
              }
            });
          }
          if (parsedRoles.length === 0) {
            parsedRoles.push('guru');
          }
          const uniqueRoles = Array.from(new Set(parsedRoles));
          let matchedRole: Role = uniqueRoles[0];
          if (uniqueRoles.includes('walas')) matchedRole = 'walas';else if (uniqueRoles.includes('wakakurikulum')) matchedRole = 'wakakurikulum';else if (uniqueRoles.includes('wakakesiswaan')) matchedRole = 'wakakesiswaan';
          const rawGender = String(row['Jenis Kelamin (L/P)'] || row['Jenis Kelamin'] || row['JK'] || row['gender'] || 'L').trim().toUpperCase();
          const gender: 'L' | 'P' = rawGender.startsWith('P') ? 'P' : 'L';
          const className = String(row['Wali Kelas'] || row['Kelas'] || row['kelas'] || '').trim();
          const rawSubject = String(row['Mata Pelajaran'] || row['Mapel'] || row['mapel'] || '').trim();
          let subjectsList: {
            id: string;
            subjectName: string;
            className: string;
          }[] | undefined = undefined;
          if (rawSubject) {
            subjectsList = rawSubject.split(';').map((sName, sIdx) => ({
              id: String(Date.now() + index * 10 + sIdx),
              subjectName: sName.trim(),
              className: className || 'Semua Kelas'
            }));
          }
          const isPendidik = uniqueRoles.some(r => ['guru', 'walas', 'guru_quran', 'bk', 'pustaka', 'kamad', 'wakakurikulum', 'wakakesiswaan'].includes(r));
          const newUser: User = {
            id: String(Date.now() + index * 10 + Math.floor(Math.random() * 1000)),
            name: rawName,
            username: rawUsername,
            nuptk: isPendidik ? rawUsername : undefined,
            password: hashedPassword,
            role: matchedRole,
            roles: uniqueRoles,
            gender,
            className: matchedRole === 'walas' ? className : undefined,
            subjects: subjectsList,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(rawName)}`
          };
          newUsers.push(newUser);
          successCount++;
        });
        if (successCount > 0) {
          (async () => {
            try {
              for (const u of newUsers) {
                const payload = {
                  name: u.name,
                  username: u.username,
                  password: u.password,
                  role: u.role,
                  roles: JSON.stringify(u.roles || [u.role]),
                  gender: u.gender || null,
                  class_name: u.className || null,
                  child_id: u.childId || null,
                  avatar: u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u.name)}`
                };
                await apiClient(`/crud.php?table=users`, {
                  method: 'POST',
                  body: JSON.stringify(payload)
                });
              }
              fetchUsers();
              setFeedback({
                type: 'success',
                message: `Berhasil mengimpor ${successCount} akun Guru & Tendik dari file Excel.`
              });
            } catch (err) {
              console.error(err);
              setFeedback({
                type: 'error',
                message: `Berhasil memproses excel namun gagal menyimpan ke database.`
              });
            }
          })();
        } else {
          setFeedback({
            type: 'error',
            message: 'Tidak ada data valid yang dapat diimpor dari file Excel.'
          });
        }
      } catch (err) {
        console.error("Upload Excel Error:", err);
        setFeedback({
          type: 'error',
          message: 'Gagal memproses file Excel. Pastikan format file sesuai.'
        });
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };
  const openAddModal = () => {
    setEditingId(null);
    setUserName('');
    setUserUsername('');
    setUserNuptk('');
    setUserPassword('');
    setUserRoles(['guru']);
    setUserGender('');
    setUserClassName('');
    setUserChildId('');
    setUserSubjects([]);
    setTempSubjectName('');
    setTempClassName('');
    setIsModalOpen(true);
  };
  const openEditModal = (u: any) => {
    setEditingId(u.id);
    setUserName(u.name);
    setUserUsername(u.username || '');
    setUserNuptk(u.nuptk || '');
    setUserPassword('');
    setUserRoles(u.roles && u.roles.length > 0 ? u.roles : [u.role]);
    setUserGender(u.gender || '');
    setUserClassName(u.className || '');
    setUserChildId(u.childId || '');
    setUserSubjects(u.subjects || []);
    setTempSubjectName('');
    setTempClassName('');
    setIsModalOpen(true);
  };
  const confirmDeleteUser = async () => {
    if (deleteConfirmId) {
      try {
        await apiClient(`/crud.php?table=users&id=${deleteConfirmId}`, {
          method: 'DELETE'
        });
        setFeedback({
          type: 'success',
          message: 'Data pengguna berhasil dihapus.'
        });
        fetchUsers();
      } catch (e) {
        setFeedback({
          type: 'error',
          message: 'Gagal menghapus pengguna.'
        });
      }
      setDeleteConfirmId(null);
    }
  };
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) {
      setFeedback({
        type: 'error',
        message: 'Nama lengkap wajib diisi.'
      });
      return;
    }
    if (userRoles.length === 0) {
      setFeedback({
        type: 'error',
        message: 'Minimal pilih satu peran pengguna.'
      });
      return;
    }
    const isPendidik = userRoles.some(r => ['guru', 'walas', 'guru_quran', 'bk', 'pustaka', 'kamad', 'wakakurikulum', 'wakakesiswaan'].includes(r));
    const isAdmin = userRoles.includes('admin');
    const isPendidikOrAdmin = isPendidik || isAdmin;
    if (isPendidikOrAdmin && !userNuptk.trim()) {
      setFeedback({
        type: 'error',
        message: isPendidik ? 'NIPTK / NUPTK wajib diisi untuk Pendidik/Guru.' : 'Username atau NUPTK wajib diisi untuk Admin.'
      });
      return;
    }
    let generatedUsername = userUsername.trim();
    if (!editingId) {
      const nameParts = userName.trim().split(' ').filter(Boolean);
      let currentUsername = (nameParts[0] || 'user').toLowerCase().replace(/[^a-z0-9]/g, '');
      let counter = 1;
      let finalUsername = currentUsername;
      while (users.some(u => u.username?.toLowerCase() === finalUsername.toLowerCase())) {
        finalUsername = `${currentUsername}${counter}`;
        counter++;
      }
      generatedUsername = finalUsername;
    }

    // Auto-generate password if empty on creation
    let finalPassword = userPassword.trim();
    if (!editingId && !finalPassword) {
      finalPassword = '12345';
    }
    const hashedPassword = finalPassword || '';
    const payload: any = {
      name: userName.trim(),
      username: generatedUsername,
      nuptk: isPendidikOrAdmin ? userNuptk.trim() : null,
      role: userRoles[0],
      // fallback
      roles: JSON.stringify(userRoles),
      // store array
      gender: userGender || null,
      class_name: userRoles.includes('walas') ? userClassName : null,
      child_id: userRoles.includes('ortu') ? userChildId : null,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userName)}`
    };
    if (editingId) {
      if (hashedPassword) {
        payload.password = hashedPassword;
      }
      try {
        await apiClient(`/crud.php?table=users&id=${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        setFeedback({
          type: 'success',
          message: 'Data pengguna berhasil diperbarui.'
        });
      } catch (e) {
        setFeedback({
          type: 'error',
          message: 'Gagal memperbarui pengguna.'
        });
        return;
      }
    } else {
      payload.password = hashedPassword || '12345';
      try {
        await apiClient(`/crud.php?table=users`, {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        setFeedback({
          type: 'success',
          message: 'Data pengguna berhasil ditambahkan.'
        });
      } catch (e) {
        setFeedback({
          type: 'error',
          message: 'Gagal menambahkan pengguna.'
        });
        return;
      }
    }
    setIsModalOpen(false);
    fetchUsers();
  };
  const isWalas = currentUser?.role === 'walas';
  const isWalasXII = isWalas && (currentUser?.className?.includes('XII') || currentUser?.className?.includes('12'));
  const filteredUsers = users.filter(u => {
    let matchTab = false;
    const userRolesList = u.roles && u.roles.length > 0 ? u.roles : [u.role];
    if (activeTab === 'guru_tendik') {
      matchTab = userRolesList.some(r => ['guru', 'walas', 'kamad', 'admin', 'wakakurikulum', 'wakakesiswaan', 'bk', 'pustaka', 'guru_quran'].includes(r));
    } else if (activeTab === 'ortu') {
      matchTab = userRolesList.includes('ortu');
      if (isWalas && matchTab) {
        const child = students.find(s => s.id === u.childId);
        if (!child || child.className !== currentUser?.className) {
          matchTab = false;
        }
      }
    } else if (activeTab === 'siswa') {
      matchTab = userRolesList.includes('siswa');
      if (isWalas && matchTab) {
        if (!isWalasXII || u.className !== currentUser?.className) {
          matchTab = false;
        }
      }
    }
    const matchSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || userRolesList.some(r => r.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchTab && matchSearch;
  });
  const downloadPDF = () => {
    const doc = new jsPDF();
    let head = [['No', 'Nama', 'Role', 'Username', 'Password']];
    let body: any[] = [];
    if (activeTab === 'guru_tendik') {
      head = [['No', 'Nama', 'Role', 'Username', 'NIPTK/NUPTK', 'Password']];
      body = filteredUsers.map((u, i) => [i + 1, u.name, u.roles?.join(', ') || u.role, u.username || '-', u.nuptk || '-', (u.password && u.password.startsWith('$2')) ? 'Terenkripsi (Reset)' : (u.password || '-')]);
    } else if (activeTab === 'ortu') {
      head = [['No', 'Nama Siswa', 'Kelas', 'Username', 'Password']];
      body = filteredUsers.map((u, i) => {
        const child = students.find(s => s.id === u.childId);
        return [i + 1, child ? child.name : u.childName || '-', child ? child.className : '-', u.username || '-', (u.password && u.password.startsWith('$2')) ? 'Terenkripsi (Reset)' : (u.password || '-')];
      });
    } else if (activeTab === 'siswa') {
      head = [['No', 'Nama', 'Kelas', 'Username', 'Password']];
      body = filteredUsers.map((u, i) => [i + 1, u.name, u.className || '-', u.username || '-', (u.password && u.password.startsWith('$2')) ? 'Terenkripsi (Reset)' : (u.password || '-')]);
    }
    doc.text(`Data Pengguna - ${activeTab.toUpperCase()}`, 14, 15);
    autoTable(doc, {
      head: head,
      body: body,
      startY: 20
    });
    doc.save(`Data_Pengguna_${activeTab}.pdf`);
  };
  return <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl font-bold tracking-tight text-slate-800">Manajemen Pengguna</h1>
        <div className="flex flex-wrap items-center gap-2">
          <input type="file" accept=".xlsx, .xls" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
          <button onClick={downloadPDF} className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors" title="Download User">
            <Download className="w-4 h-4" /> Download User
          </button>
          {!isWalas && <>
              <button onClick={downloadTemplate} className="px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors" title="Download Template Excel Guru & Tendik">
                <Download className="w-4 h-4" /> Unduh Template
              </button>
              <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors" title="Upload Data Excel Guru & Tendik">
                <Upload className="w-4 h-4" /> Import Excel
              </button>
              <button onClick={openAddModal} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors">
                <Plus className="w-4 h-4" /> Tambah Pengguna
              </button>
            </>}
        </div>
      </div>

      {feedback && <div className={`p-4 rounded-lg flex items-start gap-3 border ${feedback.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          {feedback.type === 'success' ? <Check className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <p className="text-sm font-medium">{feedback.message}</p>
        </div>}

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <CardTitle>Akun Pengguna</CardTitle>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input type="text" placeholder="Cari Nama / Peran..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none" />
              </div>
            </div>
            <div className="flex border-b border-slate-200 overflow-x-auto hide-scrollbar">
              {!isWalas && <button onClick={() => setActiveTab('guru_tendik')} className={`px-4 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${activeTab === 'guru_tendik' ? 'border-emerald-500 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                  Guru & Tendik
                </button>}
              <button onClick={() => setActiveTab('ortu')} className={`px-4 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${activeTab === 'ortu' ? 'border-emerald-500 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                Orang Tua
              </button>
              {(!isWalas || isWalasXII) && <button onClick={() => setActiveTab('siswa')} className={`px-4 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${activeTab === 'siswa' ? 'border-emerald-500 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                  {isWalas ? 'Siswa Kelas XII' : 'Siswa'}
                </button>}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Mobile View: Cards */}
          <div className="block md:hidden">
            {filteredUsers.length > 0 ? <div className="flex flex-col gap-3">
                {filteredUsers.map(u => <div key={u.id} className="p-4 bg-white border border-slate-200 rounded-xl flex flex-col gap-3 transition-shadow">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                         <UserAvatar src={u.avatar} name={u.name} className="w-full h-full" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-slate-800 text-sm leading-tight">{u.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">{u.username}</p>
                      </div>
                      {!isWalas && <div className="flex items-center gap-1.5 shrink-0">
                          <button onClick={() => openEditModal(u)} className="p-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors" title="Edit">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => setDeleteConfirmId(u.id)} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors" title="Hapus">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>}
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-wrap gap-1.5">
                        {(u.roles && u.roles.length > 0 ? u.roles : [u.role]).map(r => <span key={r} className="inline-block px-2 py-1 bg-blue-50 text-blue-700 rounded text-[10px] font-bold uppercase tracking-wider">
                            {r.replace('_', ' ')}
                          </span>)}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 mt-0.5">
<p>User: <span className="font-mono font-semibold text-slate-800">{u.username}</span></p>
<p>Pass: <span className="font-mono font-semibold text-slate-800">{(u.password && u.password.startsWith('$2')) ? 'Terenkripsi (Reset)' : (u.password || '-')}</span></p>
{u.nuptk && <p>NIPTK: <span className="font-mono font-semibold text-slate-800">{u.nuptk}</span></p>}
                        {(u.roles || [u.role]).includes('walas') && u.className && <p>Kelas: <span className="font-semibold text-slate-800">{u.className}</span></p>}
                        {(u.roles || [u.role]).includes('ortu') && u.childName && <p>Anak: <span className="font-semibold text-slate-800">{u.childName}</span></p>}
                      </div>
                    </div>
                  </div>)}
              </div> : <div className="py-8 text-center text-slate-500 text-sm border border-slate-200 rounded-xl bg-slate-50">
                Tidak ada pengguna yang ditemukan.
              </div>}
          </div>

          {/* Desktop View: Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs text-slate-500 uppercase">
                  <th className="pb-3 px-4 font-bold">Profil</th>
                  <th className="pb-3 px-4 font-bold">Akun Login</th>
                  <th className="pb-3 px-4 font-bold">Peran & Keterangan</th>
                  {!isWalas && <th className="pb-3 px-4 font-bold text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? filteredUsers.map(u => <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors group">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-white border border-slate-200 overflow-hidden shrink-0">
                             <UserAvatar src={u.avatar} name={u.name} className="w-full h-full" />
                          </div>
                          <p className="font-bold text-slate-800 text-sm">{u.name}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <p className="font-bold text-slate-800 text-sm">{u.username}</p>
                          {u.nuptk && <p className="text-[10px] text-slate-500">NIPTK: <span className="font-mono font-semibold">{u.nuptk}</span></p>}
                          <p className="text-[10px] text-slate-500 font-mono">Password: <span className="font-semibold text-slate-700">{(u.password && u.password.startsWith('$2')) ? 'Terenkripsi (Reset)' : (u.password || '-')}</span></p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col items-start gap-1">
                          <div className="flex flex-wrap gap-1">
                            {(u.roles && u.roles.length > 0 ? u.roles : [u.role]).map(r => <span key={r} className="inline-block px-2 py-1 bg-blue-50 text-blue-700 rounded text-[10px] font-bold uppercase tracking-wider">
                                {r.replace('_', ' ')}
                              </span>)}
                          </div>
                          {(u.roles || [u.role]).includes('walas') && u.className && <span className="text-[10px] text-slate-500">Kelas: {u.className}</span>}
                          {(u.roles || [u.role]).includes('ortu') && u.childName && <span className="text-[10px] text-slate-500">Anak: {u.childName}</span>}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {!isWalas && <div className="flex items-center justify-end gap-2">
                            <button onClick={() => openEditModal(u)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded" title="Edit">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => setDeleteConfirmId(u.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Hapus">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>}
                      </td>
                    </tr>) : <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-500 text-sm">
                      Tidak ada pengguna yang ditemukan.
                    </td>
                  </tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* MODAL DELETE CONFIRMATION */}
      {deleteConfirmId && <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm pb-16 sm:pb-0">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-visible my-auto">
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4 text-red-600">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Konfirmasi Hapus</h3>
              <p className="text-sm text-slate-600 mb-6">Apakah Anda yakin ingin menghapus pengguna ini? Tindakan ini tidak dapat dibatalkan.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirmId(null)} className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-bold transition-colors">
                  Batal
                </button>
                <button onClick={confirmDeleteUser} className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold transition-colors">
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </div>}

      {/* MODAL USER */}
      {isModalOpen && <div className="fixed inset-0 z-[100] flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto scrollbar-hide pb-20 sm:pb-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[80vh] sm:max-h-[90vh] overflow-hidden border border-slate-100 my-auto">
            <div className="flex justify-between items-center px-4 py-3.5 sm:px-6 sm:py-4 border-b border-slate-100 flex-shrink-0 bg-slate-50/80">
              <h2 className="font-bold text-base sm:text-lg text-slate-800">
                {editingId ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-3.5 sm:p-6 space-y-3.5 sm:space-y-4 overflow-y-auto scrollbar-hide">
                <div className="space-y-1">
                  <label className="block text-[11px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider">Nama Lengkap</label>
                  <input type="text" required placeholder="Masukkan nama lengkap..." value={userName} onChange={e => setUserName(e.target.value)} className="w-full px-3 py-2 sm:py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all" />
                </div>

                {userRoles.some(r => ['guru', 'walas', 'guru_quran', 'bk', 'pustaka', 'kamad', 'wakakurikulum', 'wakakesiswaan', 'admin'].includes(r)) && <div className="space-y-1">
                    <label className="block text-[11px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider">
                      {userRoles.includes('admin') && !userRoles.some(r => ['guru', 'walas', 'guru_quran', 'bk', 'pustaka', 'kamad', 'wakakurikulum', 'wakakesiswaan'].includes(r)) ? 'Username / NUPTK' : 'NIPTK / NUPTK'}
                    </label>
                    <input type="text" required placeholder={userRoles.includes('admin') && !userRoles.some(r => ['guru', 'walas', 'guru_quran', 'bk', 'pustaka', 'kamad', 'wakakurikulum', 'wakakesiswaan'].includes(r)) ? 'Masukkan Username atau NUPTK...' : 'Masukkan NIPTK atau NUPTK...'} value={userNuptk} onChange={e => setUserNuptk(e.target.value)} className="w-full px-3 py-2 sm:py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all" />
                    <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium leading-tight">Bisa digunakan untuk login, dan sistem juga akan otomatis membuatkan username dari nama depan.</p>
                  </div>}

                {!editingId ? <div className="text-[11px] sm:text-xs text-slate-600 bg-blue-50/80 p-3 rounded-xl border border-blue-100/80 leading-relaxed">
                    <span className="font-bold text-blue-700">Info:</span> Username login akan otomatis dibuat dari nama depan. Guru & tendik juga bisa login menggunakan NIPTK / NUPTK. Password default: <code className="font-bold text-blue-800 bg-blue-100 px-1 py-0.5 rounded">12345</code>.
                  </div> : <div className="space-y-1">
                    <label className="block text-[11px] sm:text-xs font-bold text-emerald-700 uppercase tracking-wider">Reset Password (Opsional)</label>
                    <input type="text" placeholder="Masukkan password baru (kosongkan jika tidak diubah)" value={userPassword} onChange={e => setUserPassword(e.target.value)} className="w-full px-3 py-2 sm:py-2.5 border border-emerald-200 rounded-xl text-xs sm:text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none bg-emerald-50/60 transition-all" />
                  </div>}

                <div className="space-y-1">
                  <label className="block text-[11px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider">Peran (Role)</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2 bg-slate-50/80 p-2.5 sm:p-3 rounded-xl border border-slate-200/80">
                    {[{
                  value: 'guru',
                  label: 'Guru'
                }, {
                  value: 'walas',
                  label: 'Wali Kelas'
                }, {
                  value: 'guru_quran',
                  label: 'Guru Qur\'an'
                }, {
                  value: 'bk',
                  label: 'Guru BK'
                }, {
                  value: 'pustaka',
                  label: 'Pustakawan'
                }, {
                  value: 'kamad',
                  label: 'Kamad'
                }, {
                  value: 'wakakurikulum',
                  label: 'Wakakur'
                }, {
                  value: 'wakakesiswaan',
                  label: 'Wakasis'
                }, {
                  value: 'admin',
                  label: 'Admin'
                }].map(roleOpt => <label key={roleOpt.value} className="flex items-center space-x-1.5 sm:space-x-2 cursor-pointer p-1.5 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200/60 transition-all select-none">
                        <input type="checkbox" className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 shrink-0" checked={userRoles.includes(roleOpt.value as Role)} onChange={e => {
                    if (e.target.checked) {
                      if (roleOpt.value === 'siswa' || roleOpt.value === 'ortu') {
                        setUserRoles([roleOpt.value as Role]);
                      } else {
                        setUserRoles([...userRoles.filter(r => r !== 'siswa' && r !== 'ortu'), roleOpt.value as Role]);
                      }
                    } else {
                      setUserRoles(userRoles.filter(r => r !== roleOpt.value));
                      if (!userRoles.some(r => ['guru', 'walas', 'guru_quran', 'bk', 'pustaka', 'kamad', 'wakakurikulum', 'wakakesiswaan'].includes(r)) && roleOpt.value !== 'siswa' && roleOpt.value !== 'ortu' && roleOpt.value !== 'admin') {
                        setUserGender('');
                      }
                    }
                  }} />
                        <span className="text-slate-700 font-semibold text-xs sm:text-sm truncate">{roleOpt.label}</span>
                      </label>)}
                  </div>
                </div>

                {userRoles.some(r => ['guru', 'walas', 'guru_quran', 'bk', 'pustaka', 'kamad', 'wakakurikulum', 'wakakesiswaan'].includes(r)) && <div className="space-y-1">
                    <label className="block text-[11px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider">Panggilan (Gender)</label>
                    <CustomSelect value={userGender} onChange={val => setUserGender(val as 'L' | 'P')} options={[{
                value: 'L',
                label: 'Ustadz (Laki-laki)'
              }, {
                value: 'P',
                label: 'Ustadzah (Perempuan)'
              }]} placeholder="Pilih Panggilan..." />
                  </div>}

                {userRoles.includes('ortu') && <div className="space-y-1 p-3 bg-slate-50/80 border border-slate-200/80 rounded-xl">
                    <label className="block text-[11px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider">Nama Anak (Data Siswa)</label>
                    <CustomSelect value={userChildId} onChange={val => setUserChildId(val)} options={students.map((s: any) => ({
                value: String(s.id),
                label: `${s.name} - ${s.className}`
              }))} placeholder="-- Pilih Anak --" required searchable={true} />
                  </div>}

                {userRoles.includes('walas') && <div className="space-y-1 p-3 bg-slate-50/80 border border-slate-200/80 rounded-xl">
                    <label className="block text-[11px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider">Kelas (Wali Kelas)</label>
                    <CustomSelect value={userClassName} onChange={val => setUserClassName(val)} options={classOptions} placeholder="Pilih Kelas..." />
                  </div>}
              </div>

              <div className="flex gap-2.5 sm:gap-3 p-3.5 sm:p-5 border-t border-slate-100 flex-shrink-0 bg-slate-50/80">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 rounded-xl text-xs sm:text-sm font-bold transition-colors text-center">
                  Batal
                </button>
                <button type="submit" className="flex-1 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm">
                  <Check className="w-4 h-4 shrink-0" /> 
                  <span>{editingId ? 'Simpan Perubahan' : 'Tambahkan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>}
    </div>;
}