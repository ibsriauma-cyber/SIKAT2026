import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { BookOpen, CheckCircle, Clock } from 'lucide-react';

export function SiswaHafalan() {
  
  const hafalanHistory = [
    { id: 1, surah: 'Al-Mulk', ayat: '1-10', date: '24 Nov 2026', status: 'Lancar', ustadz: 'Ust. Abdul Malik' },
    { id: 2, surah: 'Al-Mulk', ayat: '11-20', date: '26 Nov 2026', status: 'Kurang Lancar', ustadz: 'Ust. Abdul Malik' },
    { id: 3, surah: 'Al-Mulk', ayat: '11-20', date: '28 Nov 2026', status: 'Lancar', ustadz: 'Ust. Abdul Malik' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold tracking-tight text-slate-800">Hafalan & Tahfizku</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase">Total Juz Hafalan</p>
              <p className="text-2xl font-black text-slate-800">2 Juz</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase">Target Tahunan</p>
              <p className="text-2xl font-black text-slate-800">3 Juz</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase">Setoran Terakhir</p>
              <p className="text-lg font-bold text-slate-800">28 Nov 2026</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Setoran Hafalan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {hafalanHistory.map(h => (
              <div key={h.id} className="p-4 border border-slate-100 bg-slate-50 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">Surah {h.surah} : {h.ayat}</h3>
                  <p className="text-sm text-slate-500">Penyimak: {h.ustadz}</p>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                  <span className="text-sm font-semibold text-slate-600">{h.date}</span>
                  <span className={`px-3 py-1 rounded text-xs font-bold uppercase ${h.status === 'Lancar' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {h.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
