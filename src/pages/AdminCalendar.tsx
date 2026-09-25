import React, { useState, useEffect } from 'react';
import { remoteStorage } from '../lib/remoteStorage';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Edit2, Trash2, Plus, X, Check, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { CustomSelect } from '../components/ui/CustomSelect';
import { useAuth } from '../context/AuthContext';

export function AdminCalendar() {
  
  const { user } = useAuth();
  const canEdit = user?.role === 'admin' || user?.role === 'wakakurikulum';

  const [agenda, setAgenda] = useState<{id: number, date: string, event: string, type: string, color?: string}[]>(() => {
    let initialAgenda = [];
    if (typeof window !== 'undefined') {
      const stored = remoteStorage.getItem('mockAgenda');
      if (stored) {
        try { initialAgenda = JSON.parse(stored); } catch (e) {}
      }
    }
    
    // Default holidays
    const holidays = [
      { date: '2026-01-01', event: 'Tahun Baru 2026 Masehi', type: 'Libur Nasional', color: 'bg-red-100 text-red-800' },
      { date: '2026-02-18', event: 'Isra Mikraj Nabi Muhammad SAW', type: 'Libur Nasional', color: 'bg-red-100 text-red-800' },
      { date: '2026-03-03', event: 'Hari Suci Nyepi Tahun Baru Saka 1948', type: 'Libur Nasional', color: 'bg-red-100 text-red-800' },
      { date: '2026-03-20', event: 'Hari Raya Idul Fitri 1447 Hijriah', type: 'Libur Nasional', color: 'bg-red-100 text-red-800' },
      { date: '2026-03-21', event: 'Hari Raya Idul Fitri 1447 Hijriah', type: 'Libur Nasional', color: 'bg-red-100 text-red-800' },
      { date: '2026-04-03', event: 'Wafat Yesus Kristus', type: 'Libur Nasional', color: 'bg-red-100 text-red-800' },
      { date: '2026-05-01', event: 'Hari Buruh Internasional', type: 'Libur Nasional', color: 'bg-red-100 text-red-800' },
      { date: '2026-05-14', event: 'Kenaikan Yesus Kristus', type: 'Libur Nasional', color: 'bg-red-100 text-red-800' },
      { date: '2026-05-27', event: 'Hari Raya Idul Adha 1447 Hijriah', type: 'Libur Nasional', color: 'bg-red-100 text-red-800' },
      { date: '2026-05-31', event: 'Hari Raya Waisak 2570 BE', type: 'Libur Nasional', color: 'bg-red-100 text-red-800' },
      { date: '2026-06-01', event: 'Hari Lahir Pancasila', type: 'Libur Nasional', color: 'bg-red-100 text-red-800' },
      { date: '2026-06-16', event: 'Tahun Baru Islam 1448 Hijriah', type: 'Libur Nasional', color: 'bg-red-100 text-red-800' },
      { date: '2026-08-17', event: 'Hari Kemerdekaan Republik Indonesia', type: 'Libur Nasional', color: 'bg-red-100 text-red-800' },
      { date: '2026-08-26', event: 'Maulid Nabi Muhammad SAW', type: 'Libur Nasional', color: 'bg-red-100 text-red-800' },
      { date: '2026-12-25', event: 'Hari Raya Natal', type: 'Libur Nasional', color: 'bg-red-100 text-red-800' },
      { date: '2027-01-01', event: 'Tahun Baru 2027 Masehi', type: 'Libur Nasional', color: 'bg-red-100 text-red-800' },
      { date: '2027-02-07', event: 'Isra Mikraj Nabi Muhammad SAW', type: 'Libur Nasional', color: 'bg-red-100 text-red-800' },
      { date: '2027-03-09', event: 'Hari Raya Idul Fitri 1448 Hijriah', type: 'Libur Nasional', color: 'bg-red-100 text-red-800' },
      { date: '2027-03-10', event: 'Hari Raya Idul Fitri 1448 Hijriah', type: 'Libur Nasional', color: 'bg-red-100 text-red-800' },
      { date: '2027-03-26', event: 'Wafat Yesus Kristus', type: 'Libur Nasional', color: 'bg-red-100 text-red-800' },
      { date: '2027-05-01', event: 'Hari Buruh Internasional', type: 'Libur Nasional', color: 'bg-red-100 text-red-800' },
      { date: '2027-05-16', event: 'Hari Raya Idul Adha 1448 Hijriah', type: 'Libur Nasional', color: 'bg-red-100 text-red-800' },
      { date: '2027-06-01', event: 'Hari Lahir Pancasila', type: 'Libur Nasional', color: 'bg-red-100 text-red-800' },
      { date: '2027-06-06', event: 'Tahun Baru Islam 1449 Hijriah', type: 'Libur Nasional', color: 'bg-red-100 text-red-800' },
      { date: '2027-08-15', event: 'Maulid Nabi Muhammad SAW', type: 'Libur Nasional', color: 'bg-red-100 text-red-800' },
      { date: '2027-08-17', event: 'Hari Kemerdekaan Republik Indonesia', type: 'Libur Nasional', color: 'bg-red-100 text-red-800' },
      { date: '2027-12-25', event: 'Hari Raya Natal', type: 'Libur Nasional', color: 'bg-red-100 text-red-800' },
    ];
    
    let added = false;
    holidays.forEach(h => {
      if (!initialAgenda.find((a: any) => a.date === h.date && a.event === h.event)) {
        initialAgenda.push({ id: Date.now() + Math.random(), ...h });
        added = true;
      }
    });

    if (added && typeof window !== 'undefined') {
      remoteStorage.setItem('mockAgenda', JSON.stringify(initialAgenda));
    }
    
    return initialAgenda;
  });

  useEffect(() => {
    remoteStorage.setItem('mockAgenda', JSON.stringify(agenda));
  }, [agenda]);

  const [currentDate, setCurrentDate] = useState(new Date(2026, 6, 1)); // Default to July 2026
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  
  const [dateStr, setDateStr] = useState('');
  const [endDateStr, setEndDateStr] = useState('');
  const [isMultiDay, setIsMultiDay] = useState(false);
  const [eventStr, setEventStr] = useState('');
  const [type, setType] = useState('Umum');
  const [color, setColor] = useState('bg-emerald-100 text-emerald-800');

  const availableColors = [
    { class: 'bg-emerald-100 text-emerald-800', border: 'border-emerald-300' },
    { class: 'bg-blue-100 text-blue-800', border: 'border-blue-300' },
    { class: 'bg-indigo-100 text-indigo-800', border: 'border-indigo-300' },
    { class: 'bg-amber-100 text-amber-800', border: 'border-amber-300' },
    { class: 'bg-red-100 text-red-800', border: 'border-red-300' },
    { class: 'bg-purple-100 text-purple-800', border: 'border-purple-300' },
    { class: 'bg-pink-100 text-pink-800', border: 'border-pink-300' },
  ];

  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const prevMonth = () => {
  
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
  
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const openAddForDate = (day: number) => {
    const dString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setEditingId(null);
    setDateStr(dString);
    setEndDateStr('');
    setIsMultiDay(false);
    setEventStr('');
    setType('Umum');
    setColor('bg-emerald-100 text-emerald-800');
    setIsModalOpen(true);
  };

  const openEdit = (a: any) => {
    setEditingId(a.id);
    setDateStr(a.date);
    setEndDateStr('');
    setIsMultiDay(false);
    setEventStr(a.event);
    setType(a.type);
    setColor(a.color || 'bg-emerald-100 text-emerald-800');
    setIsModalOpen(true);
  };

  const confirmDelete = () => {
  
    if (deleteConfirmId) {
      setAgenda(agenda.filter(a => a.id !== deleteConfirmId));
      setDeleteConfirmId(null);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      setAgenda(agenda.map(a => a.id === editingId ? { ...a, date: dateStr, event: eventStr, type, color } : a));
    } else {
      let newAgendas = [];
      if (isMultiDay && endDateStr && new Date(endDateStr) >= new Date(dateStr)) {
        let current = new Date(dateStr);
        let end = new Date(endDateStr);
        while (current <= end) {
          const dString = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;
          newAgendas.push({ id: Date.now() + Math.random(), date: dString, event: eventStr, type, color });
          current.setDate(current.getDate() + 1);
        }
      } else {
        newAgendas.push({ id: Date.now(), date: dateStr, event: eventStr, type, color });
      }
      setAgenda([...agenda, ...newAgendas]);
    }
    setIsModalOpen(false);
  };

  const generateHolidays = () => {
  
    const holidays = [
      { date: '2026-01-01', event: 'Tahun Baru 2026 Masehi', type: 'Libur Nasional', color: 'bg-red-100 text-red-800' },
      { date: '2026-02-18', event: 'Isra Mikraj Nabi Muhammad SAW', type: 'Libur Nasional', color: 'bg-red-100 text-red-800' },
      { date: '2026-03-03', event: 'Hari Suci Nyepi Tahun Baru Saka 1948', type: 'Libur Nasional', color: 'bg-red-100 text-red-800' },
      { date: '2026-03-20', event: 'Hari Raya Idul Fitri 1447 Hijriah', type: 'Libur Nasional', color: 'bg-red-100 text-red-800' },
      { date: '2026-03-21', event: 'Hari Raya Idul Fitri 1447 Hijriah', type: 'Libur Nasional', color: 'bg-red-100 text-red-800' },
      { date: '2026-04-03', event: 'Wafat Yesus Kristus', type: 'Libur Nasional', color: 'bg-red-100 text-red-800' },
      { date: '2026-05-01', event: 'Hari Buruh Internasional', type: 'Libur Nasional', color: 'bg-red-100 text-red-800' },
      { date: '2026-05-14', event: 'Kenaikan Yesus Kristus', type: 'Libur Nasional', color: 'bg-red-100 text-red-800' },
      { date: '2026-05-27', event: 'Hari Raya Idul Adha 1447 Hijriah', type: 'Libur Nasional', color: 'bg-red-100 text-red-800' },
      { date: '2026-05-31', event: 'Hari Raya Waisak 2570 BE', type: 'Libur Nasional', color: 'bg-red-100 text-red-800' },
      { date: '2026-06-01', event: 'Hari Lahir Pancasila', type: 'Libur Nasional', color: 'bg-red-100 text-red-800' },
      { date: '2026-06-16', event: 'Tahun Baru Islam 1448 Hijriah', type: 'Libur Nasional', color: 'bg-red-100 text-red-800' },
      { date: '2026-08-17', event: 'Hari Kemerdekaan Republik Indonesia', type: 'Libur Nasional', color: 'bg-red-100 text-red-800' },
      { date: '2026-08-26', event: 'Maulid Nabi Muhammad SAW', type: 'Libur Nasional', color: 'bg-red-100 text-red-800' },
      { date: '2026-12-25', event: 'Hari Raya Natal', type: 'Libur Nasional', color: 'bg-red-100 text-red-800' },
      { date: '2027-01-01', event: 'Tahun Baru 2027 Masehi', type: 'Libur Nasional', color: 'bg-red-100 text-red-800' },
      { date: '2027-02-07', event: 'Isra Mikraj Nabi Muhammad SAW', type: 'Libur Nasional', color: 'bg-red-100 text-red-800' },
      { date: '2027-03-09', event: 'Hari Raya Idul Fitri 1448 Hijriah', type: 'Libur Nasional', color: 'bg-red-100 text-red-800' },
      { date: '2027-03-10', event: 'Hari Raya Idul Fitri 1448 Hijriah', type: 'Libur Nasional', color: 'bg-red-100 text-red-800' },
      { date: '2027-03-26', event: 'Wafat Yesus Kristus', type: 'Libur Nasional', color: 'bg-red-100 text-red-800' },
      { date: '2027-05-01', event: 'Hari Buruh Internasional', type: 'Libur Nasional', color: 'bg-red-100 text-red-800' },
      { date: '2027-05-16', event: 'Hari Raya Idul Adha 1448 Hijriah', type: 'Libur Nasional', color: 'bg-red-100 text-red-800' },
      { date: '2027-06-01', event: 'Hari Lahir Pancasila', type: 'Libur Nasional', color: 'bg-red-100 text-red-800' },
      { date: '2027-06-06', event: 'Tahun Baru Islam 1449 Hijriah', type: 'Libur Nasional', color: 'bg-red-100 text-red-800' },
      { date: '2027-08-15', event: 'Maulid Nabi Muhammad SAW', type: 'Libur Nasional', color: 'bg-red-100 text-red-800' },
      { date: '2027-08-17', event: 'Hari Kemerdekaan Republik Indonesia', type: 'Libur Nasional', color: 'bg-red-100 text-red-800' },
      { date: '2027-12-25', event: 'Hari Raya Natal', type: 'Libur Nasional', color: 'bg-red-100 text-red-800' },
    ];

    let newAgenda = [...agenda];
    let count = 0;
    
    holidays.forEach(h => {
      if (!newAgenda.find(a => a.date === h.date && a.event === h.event)) {
        newAgenda.push({ id: Date.now() + Math.random(), ...h });
        count++;
      }
    });

    if (count > 0) {
      setAgenda(newAgenda);
      window.alert(`${count} hari libur nasional & PHBI berhasil ditambahkan.`);
    } else {
      window.alert(`Hari libur nasional & PHBI sudah ada di kalender.`);
    }
  };

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="p-1 sm:p-2 border-b border-r border-slate-100 bg-slate-50/50 min-h-[50px] sm:min-h-[100px] md:min-h-[120px]"></div>);
  }
  
  const todayString = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;

  for (let i = 1; i <= daysInMonth; i++) {
    const dString = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    const dayAgenda = agenda.filter(a => a.date === dString);
    
    const isHoliday = dayAgenda.some(a => a.type === 'Libur Nasional' || a.type === 'Libur' || a.event.toLowerCase().includes('libur'));
    const isFriday = new Date(year, month, i).getDay() === 5;
    const isSunday = new Date(year, month, i).getDay() === 0;
    
    let cellBg = 'hover:bg-slate-50';
    let dateColor = 'text-slate-700 ' + (canEdit ? 'group-hover:text-emerald-600' : '');

    if (todayString === dString) {
      dateColor = 'bg-emerald-600 text-white';
    } else if (isHoliday || isSunday) {
      cellBg = 'bg-red-50 hover:bg-red-100';
      dateColor = 'text-red-700 ' + (canEdit ? 'group-hover:text-red-800' : '');
    } else if (isFriday) {
      cellBg = 'bg-emerald-50 hover:bg-emerald-100';
      dateColor = 'text-emerald-700 ' + (canEdit ? 'group-hover:text-emerald-800' : '');
    }

    days.push(
      <div 
        key={`day-${i}`} 
        className={`p-1 sm:p-2 border-b border-r border-slate-100 min-h-[50px] sm:min-h-[100px] md:min-h-[120px] transition-colors flex flex-col justify-between sm:justify-start ${canEdit ? 'cursor-pointer group' : ''} ${cellBg}`}
        onClick={() => canEdit && openAddForDate(i)}
      >
        <div className="flex justify-between items-center sm:items-start sm:mb-2 w-full">
          <span className={`text-xs sm:text-sm font-bold w-5 h-5 sm:w-7 sm:h-7 flex items-center justify-center rounded-full ${dateColor}`}>
            {i}
          </span>
          {canEdit && (
            <button className="hidden sm:block opacity-0 lg:group-hover:opacity-100 p-1 text-emerald-600 hover:bg-emerald-100 rounded transition-opacity">
              <Plus className="w-3 h-3" />
            </button>
          )}
        </div>
        {/* On desktop/tablet, show full event label. On mobile, show tiny colored dots */}
        <div className="hidden sm:flex flex-1 flex-col gap-1 overflow-y-auto w-full">
          {dayAgenda.map(a => (
            <div 
              key={a.id} 
              className={`text-[10px] p-1.5 rounded font-medium truncate relative group/event ${
                a.color || 'bg-emerald-100 text-emerald-800'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                openEdit(a);
              }}
              title={a.event}
            >
              {a.event}
              <button 
                className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 lg:group-hover/event:opacity-100 p-0.5 text-slate-500 hover:text-red-600 transition-opacity bg-white/90 rounded shadow-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteConfirmId(a.id);
                }}
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex sm:hidden justify-center gap-0.5 mt-1 flex-wrap w-full">
          {dayAgenda.slice(0, 3).map(a => {
            const bgClass = a.color ? a.color.split(' ')[0] : 'bg-emerald-500';
            const dotColor = bgClass.replace('-100', '-500').replace('-50', '-500');
            return (
              <span 
                key={a.id} 
                className={`w-1.5 h-1.5 rounded-full ${dotColor}`}
                title={a.event}
              />
            );
          })}
          {dayAgenda.length > 3 && (
            <span className="text-[7px] leading-none text-slate-400 font-bold font-mono">+</span>
          )}
        </div>
      </div>
    );
  }

  // Add empty slots for the rest of the week if needed
  const totalSlots = days.length;
  const remainingSlots = (7 - (totalSlots % 7)) % 7;
  for (let i = 0; i < remainingSlots; i++) {
    days.push(<div key={`empty-end-${i}`} className="p-1 sm:p-2 border-b border-r border-slate-100 bg-slate-50/50 min-h-[50px] sm:min-h-[100px] md:min-h-[120px]"></div>);
  }

  const getDotColor = (colorClass: string) => {
    if (!colorClass) return 'bg-emerald-500';
    const firstClass = colorClass.split(' ')[0];
    if (firstClass.includes('-100')) {
      return firstClass.replace('-100', '-500');
    }
    return firstClass;
  };

  const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
  const currentMonthAgenda = agenda
    .filter(a => a.date.startsWith(monthPrefix))
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl font-bold tracking-tight text-slate-800">Kalender Akademik</h1>
        {canEdit && (
          <button
            onClick={generateHolidays}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-sm transition-colors"
          >
            <Check className="w-4 h-4" /> Generate Libur Nasional
          </button>
        )}
      </div>
      
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="pb-4 border-b border-slate-100 bg-slate-50/30">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <CardTitle className="text-base sm:text-lg">Agenda & Jadwal</CardTitle>
            <div className="flex items-center gap-2 sm:gap-4">
              <button onClick={prevMonth} className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600">
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <span className="font-bold text-sm sm:text-base text-slate-800 w-32 sm:w-40 text-center">
                {monthNames[month]} {year}
              </span>
              <button onClick={nextMonth} className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600">
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <div className="grid grid-cols-7 border-t border-l border-slate-100 rounded-xl overflow-hidden bg-white">
            {dayNames.map(day => (
              <div key={day} className="p-1.5 sm:p-3 text-center text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-r border-slate-100 bg-slate-50">
                {day}
              </div>
            ))}
            {days}
          </div>
        </CardContent>
      </Card>

      {/* Agenda List Section */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-3.5 px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-emerald-500 rounded"></span>
                Daftar Agenda: {monthNames[month]} {year}
              </CardTitle>
              <p className="text-slate-500 text-[10px] sm:text-xs mt-0.5">Semua agenda dan kegiatan akademik pada bulan aktif.</p>
            </div>
            {/* Show total count */}
            <span className="px-2.5 py-0.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full whitespace-nowrap shrink-0">
              {currentMonthAgenda.length} Event
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {currentMonthAgenda.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              Tidak ada agenda untuk bulan ini.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-[300px] sm:max-h-[400px] overflow-y-auto">
              {currentMonthAgenda.map(a => {
                const dateObj = new Date(a.date);
                const dayNum = dateObj.getDate();
                const dayName = dayNames[dateObj.getDay()];
                const colorDot = getDotColor(a.color);
                
                return (
                  <div 
                    key={a.id} 
                    className="p-3 sm:p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors group/item"
                  >
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      {/* Left Date Badge */}
                      <div className="flex flex-col items-center justify-center w-11 h-11 rounded-xl bg-slate-50 border border-slate-200/60 shrink-0 font-sans shadow-sm group-hover/item:border-slate-300 transition-colors">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">{dayName}</span>
                        <span className="text-base font-extrabold text-slate-800 leading-none mt-0.5">{dayNum}</span>
                      </div>
                      
                      {/* Event details */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${colorDot}`} />
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{a.type}</span>
                        </div>
                        <p className="text-sm font-semibold text-slate-800 truncate mt-0.5" title={a.event}>{a.event}</p>
                      </div>
                    </div>
                    
                    {/* Action buttons (only for Admin/Edit) */}
                    {canEdit && (
                      <div className="flex items-center gap-1 shrink-0 pl-2 opacity-100 sm:opacity-0 group-hover/item:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openEdit(a)}
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Edit Agenda"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setDeleteConfirmId(a.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus Agenda"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {deleteConfirmId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/40 backdrop-blur-sm pb-20 sm:pb-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden my-auto flex flex-col">
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4 text-red-600">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Konfirmasi Hapus</h3>
              <p className="text-sm text-slate-600 mb-6">Apakah Anda yakin ingin menghapus agenda ini?</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-bold transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold transition-colors"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-2.5 sm:p-4 pb-20 sm:pb-4 overflow-y-auto">
          <div className="bg-white w-full max-w-sm rounded-xl overflow-hidden shadow-xl my-auto flex flex-col max-h-[82vh] sm:max-h-[90vh]">
            <div className="flex justify-between items-center p-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-800">{editingId ? 'Edit Agenda' : 'Tambah Agenda'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Nama Agenda / Event</label>
                <input required type="text" value={eventStr} onChange={e => setEventStr(e.target.value)} className="w-full mt-1.5 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-emerald-500 outline-none" placeholder="Masukkan nama kegiatan..." />
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">{editingId ? 'Tanggal' : 'Tanggal Mulai'}</label>
                  <input required type="date" value={dateStr} onChange={e => setDateStr(e.target.value)} className="w-full mt-1.5 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-emerald-500 outline-none" />
                  {!editingId && (
                    <div className="mt-2 flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        id="isMultiDay" 
                        checked={isMultiDay} 
                        onChange={(e) => setIsMultiDay(e.target.checked)} 
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <label htmlFor="isMultiDay" className="text-xs text-slate-600 cursor-pointer select-none">Lebih dari satu hari</label>
                    </div>
                  )}
                </div>
                {!editingId && isMultiDay && (
                  <div>
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Tanggal Selesai</label>
                    <input required type="date" value={endDateStr} onChange={e => setEndDateStr(e.target.value)} min={dateStr} className="w-full mt-1.5 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-emerald-500 outline-none" />
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Jenis</label>
                <CustomSelect
                  value={type}
                  onChange={(val) => setType(val)}
                  options={[
                    { value: 'Umum', label: 'Umum' },
                    { value: 'Ujian', label: 'Ujian' },
                    { value: 'Libur Nasional', label: 'Libur Nasional' },
                  ]}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Warna Label</label>
                <div className="flex gap-2 flex-wrap">
                  {availableColors.map((c) => (
                    <button
                      key={c.class}
                      type="button"
                      onClick={() => setColor(c.class)}
                      className={`w-6 h-6 rounded-full border-2 transition-all ${
                        color === c.class ? c.border + ' scale-110 shadow-sm' : 'border-transparent hover:scale-110'
                      } ${c.class.split(' ')[0]}`}
                      title="Pilih Warna"
                    />
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-bold transition-colors">Batal</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors">
                  <Check className="w-4 h-4" /> Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
