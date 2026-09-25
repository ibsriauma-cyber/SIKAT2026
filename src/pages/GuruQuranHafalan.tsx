import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Book, Plus, Search, Check, FileCheck, Save } from 'lucide-react';
import { CustomSelect } from '../components/ui/CustomSelect';

const JUZ_OPTIONS = Array.from({ length: 30 }, (_, i) => ({
  value: String(i + 1),
  label: `Juz ${i + 1}`
}));

const JUZ_30_SURAHS = [
  "An-Naba'", "An-Nazi'at", "'Abasa", "At-Takwir", "Al-Infitar",
  "Al-Mutaffifin", "Al-Inshiqaq", "Al-Buruj", "At-Tariq", "Al-A'la",
  "Al-Ghashiyah", "Al-Fajr", "Al-Balad", "Ash-Shams", "Al-Lail",
  "Ad-Duha", "Ash-Sharh", "At-Tin", "Al-'Alaq", "Al-Qadr",
  "Al-Bayyinah", "Az-Zalzalah", "Al-'Adiyat", "Al-Qari'ah", "At-Takathur",
  "Al-'Asr", "Al-Humazah", "Al-Fil", "Quraish", "Al-Ma'un",
  "Al-Kauthar", "Al-Kafirun", "An-Nasr", "Al-Masad", "Al-Ikhlas",
  "Al-Falaq", "An-Nas"
];

// Mock data generator for other Juz
const getSurahsForJuz = (juz: string) => {
  if (juz === '30') return JUZ_30_SURAHS;
  if (juz === '29') return ["Al-Mulk", "Al-Qalam", "Al-Haqqah", "Al-Ma'arij", "Nuh", "Al-Jinn", "Al-Muzzammil", "Al-Muddaththir", "Al-Qiyamah", "Al-Insan", "Al-Mursalat"];
  if (juz === '1') return ["Al-Fatihah", "Al-Baqarah (1-141)"];
  return [`Surah 1 (Juz ${juz})`, `Surah 2 (Juz ${juz})`, `Surah 3 (Juz ${juz})`];
};

export function GuruQuranHafalan() {
  
  const studentList = [
    { id: '1', name: 'Ahmad Fauzi', nis: '10112233', class: 'XII-IPA 1' },
    { id: '2', name: 'Siti Nurhaliza', nis: '10112244', class: 'X-1' },
    { id: '3', name: 'Rizky Ramadhan', nis: '10112277', class: 'XI-IPS 2' },
  ];

  const studentOptions = studentList.map(s => ({
    value: s.id,
    label: `${s.name} (${s.class})`
  }));

  const [selectedJuz, setSelectedJuz] = useState('');
  const [selectedSiswa, setSelectedSiswa] = useState('');

  // grades state keyed by `${siswaId}-${juz}-${surah}`
  const [grades, setGrades] = useState<Record<string, string>>({});

  const handleGrade = (surah: string, grade: string) => {
    if (!selectedSiswa || !selectedJuz) return;
    const key = `${selectedSiswa}-${selectedJuz}-${surah}`;
    setGrades(prev => ({ ...prev, [key]: prev[key] === grade ? '' : grade }));
  };

  const handleSave = () => {
  
    if (!selectedSiswa || !selectedJuz) {
      window.alert('Pilih Siswa dan Juz terlebih dahulu!');
      return;
    }
    window.alert('Nilai hafalan berhasil disimpan!');
  };

  const surahsToDisplay = selectedJuz && selectedSiswa ? getSurahsForJuz(selectedJuz) : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">Input Setoran Hafalan & Tahfiz</h1>
          <p className="text-sm text-slate-500">Catat capaian tahfiz siswa secara berkala</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Siswa Dibimbing', value: '45', bg: 'bg-blue-50', text: 'text-blue-600', icon: Book },
          { label: 'Setoran Hari Ini', value: '12', bg: 'bg-emerald-50', text: 'text-emerald-600', icon: Check },
          { label: 'Rata-rata Hafalan', value: '1.2 Juz', bg: 'bg-amber-50', text: 'text-amber-600', icon: FileCheck },
          { label: 'Pencapaian Target', value: '68%', bg: 'bg-purple-50', text: 'text-purple-600', icon: Plus },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase text-slate-500">{stat.label}</p>
                <p className="text-2xl font-black text-slate-800">{stat.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.text} flex items-center justify-center`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="border-b border-slate-100 pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>Penilaian Setoran Hafalan</CardTitle>
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <div className="w-full sm:w-48">
                <CustomSelect
                  value={selectedSiswa}
                  onChange={setSelectedSiswa}
                  options={[{ value: '', label: 'Pilih Siswa' }, ...studentOptions]}
                />
              </div>
              <div className="w-full sm:w-32">
                <CustomSelect
                  value={selectedJuz}
                  onChange={setSelectedJuz}
                  options={[{ value: '', label: 'Pilih Juz' }, ...JUZ_OPTIONS]}
                />
              </div>
              <button
                onClick={handleSave}
                className="w-full md:w-auto px-4 py-2 bg-[#1e7b55] hover:bg-[#166544] text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-sm whitespace-nowrap"
              >
                <Save className="w-4 h-4" /> Simpan
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {(!selectedJuz || !selectedSiswa) ? (
            <div className="py-16 text-center text-slate-500 flex flex-col items-center justify-center">
              <Book className="w-12 h-12 text-slate-300 mb-3" />
              <p className="font-medium text-slate-600">Pilih Siswa dan Juz</p>
              <p className="text-sm">Silakan pilih siswa dan juz untuk mulai menilai setoran.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3">No</th>
                    <th className="px-4 py-3">Nama Surat</th>
                    <th className="px-4 py-3 text-center min-w-[300px]">Penilaian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {surahsToDisplay.map((surah, idx) => {
                    const key = `${selectedSiswa}-${selectedJuz}-${surah}`;
                    const currentGrade = grades[key] || '';
                    return (
                      <tr key={surah} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 text-slate-500 font-medium">{idx + 1}</td>
                        <td className="px-4 py-3 font-bold text-slate-800">{surah}</td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleGrade(surah, 'Mumtaz')}
                              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all border ${
                                currentGrade === 'Mumtaz'
                                  ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              }`}
                            >
                              Mumtaz
                            </button>
                            <button
                              onClick={() => handleGrade(surah, 'JJ')}
                              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all border ${
                                currentGrade === 'JJ'
                                  ? 'bg-blue-500 text-white border-blue-600 shadow-sm'
                                  : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                              }`}
                            >
                              JJ
                            </button>
                            <button
                              onClick={() => handleGrade(surah, 'Jayyid')}
                              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all border ${
                                currentGrade === 'Jayyid'
                                  ? 'bg-red-500 text-white border-red-600 shadow-sm'
                                  : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                              }`}
                            >
                              Jayyid
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
