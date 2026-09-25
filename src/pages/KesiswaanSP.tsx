import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { ShieldAlert, Plus, Search, FileText } from 'lucide-react';

export function KesiswaanSP() {
  
  const [search, setSearch] = useState('');
  
  const spList = [
    { id: 1, name: 'Siti Nurhaliza', nis: '10112244', class: 'X-1', sp: 'SP 1', points: 25, reason: 'Terlambat 3 kali beruntun', date: '15 Okt 2026' },
    { id: 2, name: 'Budi Santoso', nis: '10112255', class: 'XI-IPS 2', sp: 'SP 2', points: 55, reason: 'Berkelahi di area sekolah', date: '20 Okt 2026' },
    { id: 3, name: 'Andi Wijaya', nis: '10112266', class: 'XII-IPA 1', sp: 'Pemanggilan Ortu', points: 75, reason: 'Alpa 5 hari tanpa keterangan', date: '25 Nov 2026' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">Kelola Surat Peringatan (SP) & Poin</h1>
          <p className="text-sm text-slate-500">Penerbitan dan rekap pelanggaran kedisiplinan siswa</p>
        </div>
        <button className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors">
          <Plus className="w-4 h-4" /> Tambah SP Baru
        </button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>Daftar Siswa dengan Pelanggaran</CardTitle>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari siswa atau NIS..."
                className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none w-full md:w-64"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Nama Siswa / NIS</th>
                  <th className="px-4 py-3">Kelas</th>
                  <th className="px-4 py-3">Tingkat SP</th>
                  <th className="px-4 py-3">Total Poin</th>
                  <th className="px-4 py-3">Pelanggaran Terakhir</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {spList.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-bold text-slate-800">{item.name}</p>
                      <p className="text-xs text-slate-500">{item.nis}</p>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-700">{item.class}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${item.sp === 'SP 1' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                        {item.sp}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-black text-rose-600">{item.points}</td>
                    <td className="px-4 py-3">
                      <p className="text-slate-800 line-clamp-1">{item.reason}</p>
                      <p className="text-[10px] text-slate-500">{item.date}</p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Cetak Surat Peringatan">
                        <FileText className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
