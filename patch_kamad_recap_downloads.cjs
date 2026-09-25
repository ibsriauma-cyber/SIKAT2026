const fs = require('fs');
let code = fs.readFileSync('src/components/KamadWeeklyRecapModal.tsx', 'utf-8');

// Replace downloadPDF
const targetPDF = `  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text(\`FORMAT LAPORAN KINERJA STAF PEKANAN\`, 14, 15);
    doc.setFontSize(10);
    doc.text(\`Periode: \${periodStr}\`, 14, 22);
    
    let head = [];
    let body = [];
    let title = '';
    if (activeTab === 'walas') {
      title = '1. UNTUK WALAS';
      head = [
        [
          { content: 'No.', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } }, 
          { content: 'Nama Guru/Walas', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } }, 
          { content: 'Absensi Pagi', colSpan: 2, styles: { halign: 'center' } }, 
          { content: 'Nilai Sikap', colSpan: 2, styles: { halign: 'center' } }, 
          { content: 'Pemantauan Pagi', colSpan: 2, styles: { halign: 'center' } }, 
          { content: 'Sholat Zuhur Siswa', colSpan: 2, styles: { halign: 'center' } }
        ],
        ['Mengisi', 'Tidak Mengisi', 'Mengisi', 'Tidak Mengisi', 'Mengisi', 'Tidak Mengisi', 'Mengisi', 'Tidak Mengisi']
      ];
      body = filteredData.map((s, i) => [
        i + 1, s.name,
        s.stats.walas_absenPagi.mengisi || '', s.stats.walas_absenPagi.tidak || '',
        s.stats.walas_sikap.mengisi || '', s.stats.walas_sikap.tidak || '',
        s.stats.walas_pemantauan.mengisi || '', s.stats.walas_pemantauan.tidak || '',
        s.stats.walas_zuhur.mengisi || '', s.stats.walas_zuhur.tidak || ''
      ]);
    } else if (activeTab === 'guru_mapel') {
      title = '2. UNTUK GURU';
      head = [
        [
          { content: 'No.', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } }, 
          { content: 'Nama Guru', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } }, 
          { content: 'Absen KBM', colSpan: 2, styles: { halign: 'center' } }, 
          { content: 'Jurnal', colSpan: 2, styles: { halign: 'center' } }, 
          { content: 'Perangkat', colSpan: 2, styles: { halign: 'center' } },         
        ],
        ['Mengisi', 'Tidak Mengisi', 'Mengisi', 'Tidak Mengisi', 'Mengisi', 'Tidak Mengisi']
      ];
      body = filteredData.map((s, i) => [
        i + 1, s.name,
        s.stats.guru_absenKBM.mengisi || '', s.stats.guru_absenKBM.tidak || '',
        s.stats.guru_jurnal.mengisi || '', s.stats.guru_jurnal.tidak || '',
        s.stats.guru_perangkat.mengisi || '', s.stats.guru_perangkat.tidak || ''
      ]);
    } else if (activeTab === 'guru_quran') {
      title = "3. UNTUK GURU QUR'AN";
      head = [
        [
          { content: 'No.', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } }, 
          { content: "Nama Guru Qur'an", rowSpan: 2, styles: { halign: 'center', valign: 'middle' } }, 
          { content: 'Absen KBM', colSpan: 2, styles: { halign: 'center' } }, 
          { content: 'Jurnal', colSpan: 2, styles: { halign: 'center' } }, 
          { content: 'Perangkat', colSpan: 2, styles: { halign: 'center' } }, 
          { content: 'Absen Dhuha Siswa', colSpan: 2, styles: { halign: 'center' } }
        ],
        ['Mengisi', 'Tidak Mengisi', 'Mengisi', 'Tidak Mengisi', 'Mengisi', 'Tidak Mengisi', 'Mengisi', 'Tidak Mengisi']
      ];
      body = filteredData.map((s, i) => [
        i + 1, s.name,
        s.stats.guru_absenKBM.mengisi || '', s.stats.guru_absenKBM.tidak || '',
        s.stats.guru_jurnal.mengisi || '', s.stats.guru_jurnal.tidak || '',
        s.stats.guru_perangkat.mengisi || '', s.stats.guru_perangkat.tidak || '',
        s.stats.guru_ibadah.mengisi || '', s.stats.guru_ibadah.tidak || ''
      ]);
    }
    doc.setFontSize(12);
    doc.text(title, 14, 30);
    autoTable(doc, {
      head: head,
      body: body,
      startY: 34,
      theme: 'grid',
      headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], lineWidth: 0.1, lineColor: [0, 0, 0] },
      styles: { lineWidth: 0.1, lineColor: [0, 0, 0], halign: 'center', cellPadding: 2 },
      columnStyles: { 1: { halign: 'left' } }
    });
    doc.save(\`Laporan_Kinerja_\${activeTab}_\${periodStr}.pdf\`);
  };`;

const replacementPDF = `  const downloadPDF = () => {
    const doc = new jsPDF('landscape');
    doc.setFontSize(14);
    doc.text(\`FORMAT LAPORAN KINERJA STAF PEKANAN\`, 14, 15);
    doc.setFontSize(10);
    doc.text(\`Periode: \${periodStr}\`, 14, 22);
    
    let head = [];
    let body = [];
    let title = '';
    if (activeTab === 'walas') {
      title = '1. UNTUK WALAS';
      head = [
        [
          { content: 'No.', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } }, 
          { content: 'Nama Guru/Walas', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } }, 
          { content: 'Absensi Pagi', colSpan: 3, styles: { halign: 'center' } }, 
          { content: 'Nilai Sikap', colSpan: 3, styles: { halign: 'center' } }, 
          { content: 'Pemantauan Pagi', colSpan: 3, styles: { halign: 'center' } }, 
          { content: 'Sholat Zuhur Siswa', colSpan: 3, styles: { halign: 'center' } }
        ],
        ['Mengisi', 'Telat Mengisi', 'Tidak Mengisi', 'Mengisi', 'Telat Mengisi', 'Tidak Mengisi', 'Mengisi', 'Telat Mengisi', 'Tidak Mengisi', 'Mengisi', 'Telat Mengisi', 'Tidak Mengisi']
      ];
      body = filteredData.map((s, i) => [
        i + 1, s.name,
        s.stats.walas_absenPagi.mengisi || '', s.stats.walas_absenPagi.telat || '', s.stats.walas_absenPagi.tidak || '',
        s.stats.walas_sikap.mengisi || '', s.stats.walas_sikap.telat || '', s.stats.walas_sikap.tidak || '',
        s.stats.walas_pemantauan.mengisi || '', s.stats.walas_pemantauan.telat || '', s.stats.walas_pemantauan.tidak || '',
        s.stats.walas_zuhur.mengisi || '', s.stats.walas_zuhur.telat || '', s.stats.walas_zuhur.tidak || ''
      ]);
    } else if (activeTab === 'guru_mapel') {
      title = '2. UNTUK GURU';
      head = [
        [
          { content: 'No.', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } }, 
          { content: 'Nama Guru', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } }, 
          { content: 'Absen KBM', colSpan: 3, styles: { halign: 'center' } }, 
          { content: 'Jurnal', colSpan: 3, styles: { halign: 'center' } }, 
          { content: 'Perangkat', colSpan: 3, styles: { halign: 'center' } },         
        ],
        ['Mengisi', 'Telat Mengisi', 'Tidak Mengisi', 'Mengisi', 'Telat Mengisi', 'Tidak Mengisi', 'Mengisi', 'Telat Mengisi', 'Tidak Mengisi']
      ];
      body = filteredData.map((s, i) => [
        i + 1, s.name,
        s.stats.guru_absenKBM.mengisi || '', s.stats.guru_absenKBM.telat || '', s.stats.guru_absenKBM.tidak || '',
        s.stats.guru_jurnal.mengisi || '', s.stats.guru_jurnal.telat || '', s.stats.guru_jurnal.tidak || '',
        s.stats.guru_perangkat.mengisi || '', s.stats.guru_perangkat.telat || '', s.stats.guru_perangkat.tidak || ''
      ]);
    } else if (activeTab === 'guru_quran') {
      title = "3. UNTUK GURU QUR'AN";
      head = [
        [
          { content: 'No.', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } }, 
          { content: "Nama Guru Qur'an", rowSpan: 2, styles: { halign: 'center', valign: 'middle' } }, 
          { content: 'Absen KBM', colSpan: 3, styles: { halign: 'center' } }, 
          { content: 'Jurnal', colSpan: 3, styles: { halign: 'center' } }, 
          { content: 'Perangkat', colSpan: 3, styles: { halign: 'center' } }, 
          { content: 'Absen Dhuha Siswa', colSpan: 3, styles: { halign: 'center' } }
        ],
        ['Mengisi', 'Telat Mengisi', 'Tidak Mengisi', 'Mengisi', 'Telat Mengisi', 'Tidak Mengisi', 'Mengisi', 'Telat Mengisi', 'Tidak Mengisi', 'Mengisi', 'Telat Mengisi', 'Tidak Mengisi']
      ];
      body = filteredData.map((s, i) => [
        i + 1, s.name,
        s.stats.guru_absenKBM.mengisi || '', s.stats.guru_absenKBM.telat || '', s.stats.guru_absenKBM.tidak || '',
        s.stats.guru_jurnal.mengisi || '', s.stats.guru_jurnal.telat || '', s.stats.guru_jurnal.tidak || '',
        s.stats.guru_perangkat.mengisi || '', s.stats.guru_perangkat.telat || '', s.stats.guru_perangkat.tidak || '',
        s.stats.guru_ibadah.mengisi || '', s.stats.guru_ibadah.telat || '', s.stats.guru_ibadah.tidak || ''
      ]);
    }
    doc.setFontSize(12);
    doc.text(title, 14, 30);
    autoTable(doc, {
      head: head,
      body: body,
      startY: 34,
      theme: 'grid',
      headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], lineWidth: 0.1, lineColor: [0, 0, 0] },
      styles: { lineWidth: 0.1, lineColor: [0, 0, 0], halign: 'center', cellPadding: 2, fontSize: 8 },
      columnStyles: { 1: { halign: 'left' } }
    });
    doc.save(\`Laporan_Kinerja_\${activeTab}_\${periodStr}.pdf\`);
  };`;
  
code = code.replace(targetPDF, replacementPDF);

// Replace downloadExcel
const targetExcel = `  const downloadExcel = () => {
    let rows = [];
    if (activeTab === 'walas') {
      rows = filteredData.map((s, i) => ({
        'No.': i + 1,
        'Nama Guru/Walas': s.name,
        'Absensi Pagi (Mengisi)': s.stats.walas_absenPagi.mengisi || '',
        'Absensi Pagi (Tidak)': s.stats.walas_absenPagi.tidak || '',
        'Nilai Sikap (Mengisi)': s.stats.walas_sikap.mengisi || '',
        'Nilai Sikap (Tidak)': s.stats.walas_sikap.tidak || '',
        'Pemantauan Pagi (Mengisi)': s.stats.walas_pemantauan.mengisi || '',
        'Pemantauan Pagi (Tidak)': s.stats.walas_pemantauan.tidak || '',
        'Sholat Zuhur Siswa (Mengisi)': s.stats.walas_zuhur.mengisi || '',
        'Sholat Zuhur Siswa (Tidak)': s.stats.walas_zuhur.tidak || ''
      }));
    } else if (activeTab === 'guru_mapel') {
      rows = filteredData.map((s, i) => ({
        'No.': i + 1,
        'Nama Guru': s.name,
        'Absen KBM (Mengisi)': s.stats.guru_absenKBM.mengisi || '',
        'Absen KBM (Tidak)': s.stats.guru_absenKBM.tidak || '',
        'Jurnal (Mengisi)': s.stats.guru_jurnal.mengisi || '',
        'Jurnal (Tidak)': s.stats.guru_jurnal.tidak || '',
        'Perangkat (Mengisi)': s.stats.guru_perangkat.mengisi || '',
        'Perangkat (Tidak)': s.stats.guru_perangkat.tidak || ''
      }));
    } else if (activeTab === 'guru_quran') {
      rows = filteredData.map((s, i) => ({
        'No.': i + 1,
        "Nama Guru Qur'an": s.name,
        'Absen KBM (Mengisi)': s.stats.guru_absenKBM.mengisi || '',
        'Absen KBM (Tidak)': s.stats.guru_absenKBM.tidak || '',
        'Jurnal (Mengisi)': s.stats.guru_jurnal.mengisi || '',
        'Jurnal (Tidak)': s.stats.guru_jurnal.tidak || '',
        'Perangkat (Mengisi)': s.stats.guru_perangkat.mengisi || '',
        'Perangkat (Tidak)': s.stats.guru_perangkat.tidak || '',
        'Absen Dhuha Siswa (Mengisi)': s.stats.guru_ibadah.mengisi || '',
        'Absen Dhuha Siswa (Tidak)': s.stats.guru_ibadah.tidak || ''
      }));
    }
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Rekap Mingguan");
    XLSX.writeFile(workbook, \`Laporan_Kinerja_\${activeTab}_\${periodStr}.xlsx\`);
  };`;

const replacementExcel = `  const downloadExcel = () => {
    let rows = [];
    if (activeTab === 'walas') {
      rows = filteredData.map((s, i) => ({
        'No.': i + 1,
        'Nama Guru/Walas': s.name,
        'Absensi Pagi (Mengisi)': s.stats.walas_absenPagi.mengisi || '',
        'Absensi Pagi (Telat)': s.stats.walas_absenPagi.telat || '',
        'Absensi Pagi (Tidak)': s.stats.walas_absenPagi.tidak || '',
        'Nilai Sikap (Mengisi)': s.stats.walas_sikap.mengisi || '',
        'Nilai Sikap (Telat)': s.stats.walas_sikap.telat || '',
        'Nilai Sikap (Tidak)': s.stats.walas_sikap.tidak || '',
        'Pemantauan Pagi (Mengisi)': s.stats.walas_pemantauan.mengisi || '',
        'Pemantauan Pagi (Telat)': s.stats.walas_pemantauan.telat || '',
        'Pemantauan Pagi (Tidak)': s.stats.walas_pemantauan.tidak || '',
        'Sholat Zuhur (Mengisi)': s.stats.walas_zuhur.mengisi || '',
        'Sholat Zuhur (Telat)': s.stats.walas_zuhur.telat || '',
        'Sholat Zuhur (Tidak)': s.stats.walas_zuhur.tidak || ''
      }));
    } else if (activeTab === 'guru_mapel') {
      rows = filteredData.map((s, i) => ({
        'No.': i + 1,
        'Nama Guru': s.name,
        'Absen KBM (Mengisi)': s.stats.guru_absenKBM.mengisi || '',
        'Absen KBM (Telat)': s.stats.guru_absenKBM.telat || '',
        'Absen KBM (Tidak)': s.stats.guru_absenKBM.tidak || '',
        'Jurnal (Mengisi)': s.stats.guru_jurnal.mengisi || '',
        'Jurnal (Telat)': s.stats.guru_jurnal.telat || '',
        'Jurnal (Tidak)': s.stats.guru_jurnal.tidak || '',
        'Perangkat (Mengisi)': s.stats.guru_perangkat.mengisi || '',
        'Perangkat (Telat)': s.stats.guru_perangkat.telat || '',
        'Perangkat (Tidak)': s.stats.guru_perangkat.tidak || ''
      }));
    } else if (activeTab === 'guru_quran') {
      rows = filteredData.map((s, i) => ({
        'No.': i + 1,
        "Nama Guru Qur'an": s.name,
        'Absen KBM (Mengisi)': s.stats.guru_absenKBM.mengisi || '',
        'Absen KBM (Telat)': s.stats.guru_absenKBM.telat || '',
        'Absen KBM (Tidak)': s.stats.guru_absenKBM.tidak || '',
        'Jurnal (Mengisi)': s.stats.guru_jurnal.mengisi || '',
        'Jurnal (Telat)': s.stats.guru_jurnal.telat || '',
        'Jurnal (Tidak)': s.stats.guru_jurnal.tidak || '',
        'Perangkat (Mengisi)': s.stats.guru_perangkat.mengisi || '',
        'Perangkat (Telat)': s.stats.guru_perangkat.telat || '',
        'Perangkat (Tidak)': s.stats.guru_perangkat.tidak || '',
        'Absen Dhuha (Mengisi)': s.stats.guru_ibadah.mengisi || '',
        'Absen Dhuha (Telat)': s.stats.guru_ibadah.telat || '',
        'Absen Dhuha (Tidak)': s.stats.guru_ibadah.tidak || ''
      }));
    }
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Rekap Mingguan");
    XLSX.writeFile(workbook, \`Laporan_Kinerja_\${activeTab}_\${periodStr}.xlsx\`);
  };`;

code = code.replace(targetExcel, replacementExcel);

fs.writeFileSync('src/components/KamadWeeklyRecapModal.tsx', code);
