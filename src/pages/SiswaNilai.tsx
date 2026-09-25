import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { FileText, Award } from 'lucide-react';

export function SiswaNilai() {
  
  const [selectedSemester, setSelectedSemester] = React.useState('Ganjil 2026/2027');
  const semesters = [
    { value: 'Ganjil 2026/2027', label: 'Ganjil 2026/2027 (Aktif)' },
    { value: 'Genap 2025/2026', label: 'Genap 2025/2026' },
    { value: 'Ganjil 2025/2026', label: 'Ganjil 2025/2026' },
    { value: 'Genap 2024/2025', label: 'Genap 2024/2025' },
    { value: 'Ganjil 2024/2025', label: 'Ganjil 2024/2025' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">Nilai & Rapor</h1>
          <p className="text-slate-500 mt-1 text-sm">Lihat rekapitulasi nilai tugas, ujian, dan rapor semester.</p>
        </div>
        <select
          value={selectedSemester}
          onChange={(e) => setSelectedSemester(e.target.value)}
          className="w-full sm:w-auto p-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
        >
          {semesters.map((s, i) => (
            <option key={i} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-500" />
              Nilai Tugas Terakhir
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { subject: 'Matematika Peminatan', title: 'Tugas Logaritma 1', score: 85 },
                { subject: 'Bahasa Indonesia', title: 'Tugas Makalah', score: 90 },
                { subject: 'Bahasa Inggris', title: 'Reading Comprehension', score: 88 },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{item.subject}</h4>
                    <p className="text-xs text-slate-500 font-medium">{item.title}</p>
                  </div>
                  <div className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-lg text-lg">
                    {item.score}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-500" />
              Rapor Semester
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center p-8 text-center bg-slate-50 border border-dashed border-slate-300 rounded-xl">
            <Award className="w-12 h-12 text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium text-sm">Rapor semester saat ini belum dirilis oleh Wali Kelas.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
