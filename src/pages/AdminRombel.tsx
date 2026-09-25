import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { mockStudents, mockClasses } from '../data/mock';
import { CustomSelect } from '../components/ui/CustomSelect';
import { Users, UserPlus, UserMinus, Search } from 'lucide-react';
import { apiClient } from '../lib/apiClient';
import { Student } from '../types';

export function AdminRombel() {
  
  const [students, setStudents] = useState<Student[]>([]);

  const [classes, setClasses] = useState<{name:string}[]>([]);

  const [selectedClass, setSelectedClass] = useState<string>('');
  const [searchAvailable, setSearchAvailable] = useState('');
  const [searchInClass, setSearchInClass] = useState('');
  const normalizeGrade = (g: string) => {
    if (!g) return '';
    let str = g.toUpperCase().trim();
    if (str.startsWith('XII') || str.startsWith('12')) return 'XII';
    if (str.startsWith('XI') || str.startsWith('11')) return 'XI';
    if (str.startsWith('X') || str.startsWith('10')) return 'X';
    return str.split(' ')[0];
  };



    const fetchData = async () => {
    try {
       const [studentsData, classesData] = await Promise.all([
          apiClient('/crud.php?table=students'),
          apiClient('/crud.php?table=classes')
       ]);
       setStudents(studentsData.map((s:any) => ({
          id: String(s.id),
          name: s.name,
          nis: s.nis,
          className: s.class_name,
          gender: s.gender,
          grade: normalizeGrade(s.class_name || 'X')
       })));
       setClasses(classesData.map((c:any) => ({ name: c.name })));
    } catch (e) {
       console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);


  const studentsInClass = students.filter(s => s.className === selectedClass && selectedClass !== '');
  
  // Filter for available students: They must not be in the selected class. 
  // It might be useful to only show students who are in the same grade as the class.
  const classGrade = normalizeGrade(selectedClass);
  
  const isAssignedToAnyClass = (className: string) => {
    return classes.some(c => c.name === className);
  };

  const availableStudents = students.filter(s => 
    !isAssignedToAnyClass(s.className) && 
    (!classGrade || s.grade === classGrade)
  );

  const filteredInClass = studentsInClass.filter(s => 
    s.name.toLowerCase().includes(searchInClass.toLowerCase()) || 
    s.nis.toLowerCase().includes(searchInClass.toLowerCase())
  );

  const filteredAvailable = availableStudents.filter(s => 
    s.name.toLowerCase().includes(searchAvailable.toLowerCase()) || 
    s.nis.toLowerCase().includes(searchAvailable.toLowerCase())
  );

  const handleAddStudent = async (studentId: string) => {
    try {
      await apiClient(`/crud.php?table=students&id=${studentId}`, {
        method: 'PUT',
        body: JSON.stringify({ class_name: selectedClass })
      });
      const updated = students.map(s => s.id === studentId ? { ...s, className: selectedClass } : s);
      setStudents(updated);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    try {
      const student = students.find(s => s.id === studentId);
      const grade = student ? student.grade : 'X';
      await apiClient(`/crud.php?table=students&id=${studentId}`, {
        method: 'PUT',
        body: JSON.stringify({ class_name: grade })
      });
      const updated = students.map(s => s.id === studentId ? { ...s, className: grade } : s);
      setStudents(updated);
    } catch (e) {
      console.error(e);
    }
  };


  const availableClassNames = Array.from(new Set([
    ...classes.map((c: any) => c.name),
    ...students.map((s: any) => s.className || s.class_name)
  ])).filter(Boolean).sort();

  return (

    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4 border-b border-slate-100">
          <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            Pengelolaan Data Siswa per Rombel
          </CardTitle>
          <p className="text-sm text-slate-500 mt-1">
            Pilih rombel untuk melihat dan mengatur siswa di dalamnya.
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="max-w-md mb-6">
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Pilih Rombel</label>
            <CustomSelect
              value={selectedClass}
              onChange={(val) => setSelectedClass(val)}
              options={[
                { value: '', label: '-- Pilih Rombel --' },
                ...availableClassNames.map((c: any) => ({ value: c, label: c }))
              ]}
              searchable={true}
              placeholder="-- Pilih Rombel --"
            />
          </div>

          {selectedClass ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Siswa di Rombel */}
              <div className="border border-slate-200 rounded-xl overflow-hidden flex flex-col h-[500px]">
                <div className="bg-slate-50 p-4 border-b border-slate-200 flex flex-col gap-3">
                  <div>
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      Siswa di {selectedClass}
                    </h3>
                    <p className="text-xs text-slate-500">{studentsInClass.length} Siswa</p>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Cari siswa..."
                      value={searchInClass}
                      onChange={e => setSearchInClass(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-white rounded-lg border border-slate-200 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2 bg-white">
                  {filteredInClass.length > 0 ? (
                    <div className="space-y-2">
                      {filteredInClass.map(student => (
                        <div key={student.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50">
                          <div>
                            <p className="font-bold text-slate-800 text-sm">{student.name}</p>
                            <p className="text-xs text-slate-500">NIS: {student.nis} • {student.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</p>
                          </div>
                          <button
                            onClick={() => handleRemoveStudent(student.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold"
                            title="Keluarkan dari Rombel"
                          >
                            <UserMinus className="w-4 h-4" />
                            Keluarkan
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-sm text-slate-500 italic p-4 text-center">
                      Belum ada siswa di rombel ini.
                    </div>
                  )}
                </div>
              </div>

              {/* Siswa Tersedia */}
              <div className="border border-slate-200 rounded-xl overflow-hidden flex flex-col h-[500px]">
                <div className="bg-slate-50 p-4 border-b border-slate-200 flex flex-col gap-3">
                  <div>
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      Siswa Tersedia (Jenjang {classGrade})
                    </h3>
                    <p className="text-xs text-slate-500">{availableStudents.length} Siswa</p>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Cari siswa..."
                      value={searchAvailable}
                      onChange={e => setSearchAvailable(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-white rounded-lg border border-slate-200 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2 bg-white">
                  {filteredAvailable.length > 0 ? (
                    <div className="space-y-2">
                      {filteredAvailable.map(student => (
                        <div key={student.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50">
                          <div>
                            <p className="font-bold text-slate-800 text-sm">{student.name}</p>
                            <p className="text-xs text-slate-500">NIS: {student.nis} • {student.className || 'Belum Ada Rombel'}</p>
                          </div>
                          <button
                            onClick={() => handleAddStudent(student.id)}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold"
                            title="Tambahkan ke Rombel"
                          >
                            <UserPlus className="w-4 h-4" />
                            Tambah
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-sm text-slate-500 italic p-4 text-center">
                      Tidak ada siswa tersedia untuk jenjang {classGrade}.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
              Pilih rombel di atas untuk mengelola data siswa.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
