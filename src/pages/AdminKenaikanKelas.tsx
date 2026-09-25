import { apiClient } from '../lib/apiClient';
import { remoteStorage } from '../lib/remoteStorage';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { CustomSelect } from '../components/ui/CustomSelect';
import { Student } from '../types';
import { mockClasses, mockStudents } from '../data/mock';
import { Check, Users, ArrowRight } from 'lucide-react';

export function AdminKenaikanKelas() {
  
  const [classes] = useState(mockClasses);

  const [students, setStudents] = useState(mockStudents);

  const [sourceClass, setSourceClass] = useState<string>('');
  const [targetClass, setTargetClass] = useState<string>('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  useEffect(() => {
    if (sourceClass) {
      const classStudents = students.filter(s => s.className === sourceClass);
      setSelectedStudents(classStudents.map(s => s.id));
    } else {
      setSelectedStudents([]);
    }
  }, [sourceClass, students]);

  const sourceStudents = students.filter(s => s.className === sourceClass);

  const toggleStudent = (id: string) => {
    setSelectedStudents(prev => 
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const handleKenaikan = async () => {
    if (!sourceClass) {
      window.alert("Pilih kelas asal terlebih dahulu.");
      return;
    }
    if (!targetClass) {
      window.alert("Pilih jenjang tujuan terlebih dahulu.");
      return;
    }
    if (sourceClass === targetClass && targetClass !== 'LULUS') {
      window.alert("Tujuan tidak boleh sama dengan jenjang asal.");
      return;
    }
    if (selectedStudents.length === 0) {
      window.alert("Pilih minimal satu siswa untuk dinaikkan kelas.");
      return;
    }

    if (window.confirm(`Anda yakin ingin memindahkan ${selectedStudents.length} siswa ke ${targetClass === 'LULUS' ? 'Status Lulus' : 'Tingkat ' + targetClass}?`)) {
      
      let academicYear = '2026/2027';
      try {
        const termsData = await apiClient('/crud.php?table=academic_terms');
        const selectedTermId = remoteStorage.getItem('selectedAcademicTermId');
        let activeTerm = null;
        if (selectedTermId) activeTerm = termsData.find((t: any) => String(t.id) === selectedTermId);
        if (!activeTerm) activeTerm = termsData.find((t: any) => Boolean(t.is_active));
        if (activeTerm) academicYear = `${activeTerm.year} (${activeTerm.semester})`;
      } catch (e) {
        console.error("Failed to load academic terms", e);
      }


      const updatedStudents = students.map(s => {
        if (selectedStudents.includes(s.id)) {
          const currentHistory = s.academicHistory || [];
          return { 
            ...s, 
            grade: targetClass,
            className: targetClass === 'LULUS' ? 'LULUS' : '',
            academicHistory: [
              ...currentHistory,
              {
                className: s.className,
                academicYear,
                attendance: s.attendance,
                behaviorScore: s.behaviorScore
              }
            ],
            attendance: { present: 0, absent: 0, sick: 0, permission: 0 },
            behaviorScore: 0
          };
        }
        return s;
      });

      setStudents(updatedStudents);
      remoteStorage.setItem('mockStudents', JSON.stringify(updatedStudents));
      window.alert('Berhasil memproses kenaikan kelas!');
      
      setSourceClass('');
      setTargetClass('');
      setSelectedStudents([]);
    }
  };


  const availableClassNames = Array.from(new Set([
    ...classes.map((c: any) => c.name),
    ...students.map((s: any) => s.className || s.class_name)
  ])).filter(Boolean).sort();

  const classOptions = availableClassNames.map(c => ({ value: c, label: c }));

  const targetOptions = [...classes.map((c: any) => ({ value: c.name, label: c.name })), { value: 'LULUS', label: 'Lulus / Alumni' }];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <span className="w-1 h-4 bg-emerald-500 rounded"></span>
            <CardTitle>Proses Kenaikan Kelas Kolektif</CardTitle>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Pilih kelas asal dan jenjang tujuan untuk memindahkan siswa secara massal (rombel akan dikosongkan).
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-end">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Kelas Asal</label>
              <CustomSelect 
                value={sourceClass}
                onChange={setSourceClass}
                options={[{ value: '', label: 'Pilih Kelas Asal' }, ...classOptions]}
                searchable
              />
            </div>
            
            <div className="hidden md:flex justify-center pb-2 text-slate-300">
              <ArrowRight className="w-6 h-6" />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Jenjang Tujuan / Status</label>
              <CustomSelect 
                value={targetClass}
                onChange={setTargetClass}
                options={[{ value: '', label: 'Pilih Tujuan' }, ...targetOptions]}
                searchable
              />
            </div>
          </div>

          {sourceClass && (
            <div className="mt-8 border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Users className="w-4 h-4" /> Daftar Siswa: {sourceClass}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedStudents.length} dari {sourceStudents.length} siswa dipilih
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedStudents(selectedStudents.length === sourceStudents.length ? [] : sourceStudents.map(s => s.id))}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                >
                  {selectedStudents.length === sourceStudents.length ? 'Batal Pilih Semua' : 'Pilih Semua'}
                </button>
              </div>

              <div className="max-h-96 overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-white sticky top-0 shadow-sm">
                    <tr>
                      <th className="py-3 px-4 w-12 text-center">
                        <input 
                          type="checkbox" 
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          checked={sourceStudents.length > 0 && selectedStudents.length === sourceStudents.length}
                          onChange={() => setSelectedStudents(selectedStudents.length === sourceStudents.length ? [] : sourceStudents.map(s => s.id))}
                        />
                      </th>
                      <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">NIS</th>
                      <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Siswa</th>
                      <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">L/P</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {sourceStudents.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-slate-400">
                          Tidak ada siswa di kelas ini.
                        </td>
                      </tr>
                    ) : (
                      sourceStudents.map(student => (
                        <tr key={student.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => toggleStudent(student.id)}>
                          <td className="py-3 px-4 text-center">
                            <input 
                              type="checkbox" 
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                              checked={selectedStudents.includes(student.id)}
                              onChange={() => toggleStudent(student.id)}
                              onClick={e => e.stopPropagation()}
                            />
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-500">{student.nis}</td>
                          <td className="py-3 px-4 font-medium text-slate-800">{student.name}</td>
                          <td className="py-3 px-4 text-center text-slate-500">{student.gender || '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleKenaikan}
              disabled={!sourceClass || !targetClass || selectedStudents.length === 0}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl flex items-center gap-2 transition-colors"
            >
              <Check className="w-5 h-5" />
              Proses Kenaikan Kelas
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
