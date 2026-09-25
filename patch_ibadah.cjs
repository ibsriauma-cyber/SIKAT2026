const fs = require('fs');
let code = fs.readFileSync('src/pages/KamadPages.tsx', 'utf-8');

const target1 = `            {viewMode === 'harian' ? <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white" /> : <input type="week" value={weekFilter} onChange={e => setWeekFilter(e.target.value)} className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white" />}
          </div>
        </CardHeader>`;

const replacement1 = `            <div className="flex items-center gap-2">
              {viewMode === 'harian' ? <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white" /> : <input type="week" value={weekFilter} onChange={e => setWeekFilter(e.target.value)} className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white" />}
              <button onClick={downloadPDF} className="px-3 py-1.5 bg-rose-50 text-rose-600 font-bold text-sm border border-rose-200 rounded-lg hover:bg-rose-100 flex items-center gap-2">
                <FileText className="w-4 h-4" /> PDF
              </button>
              <button onClick={downloadExcel} className="px-3 py-1.5 bg-emerald-50 text-emerald-600 font-bold text-sm border border-emerald-200 rounded-lg hover:bg-emerald-100 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4" /> Excel
              </button>
            </div>
          </div>
          
          <div className="px-4 pb-4 sm:px-6 bg-slate-50/50">
            <p className="text-sm font-semibold text-slate-600">
              {viewMode === 'harian' 
                ? \`Tanggal Laporan: \${new Date(dateFilter).toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'})}\`
                : (() => {
                    const { start, end } = getWeekRange(weekFilter);
                    return \`Periode Laporan: \${start.toLocaleDateString('id-ID', {day:'numeric', month:'short', year:'numeric'})} - \${end.toLocaleDateString('id-ID', {day:'numeric', month:'short', year:'numeric'})}\`;
                  })()
              }
            </p>
          </div>
        </CardHeader>`;

if(code.includes(target1)){
  code = code.replace(target1, replacement1);
} else {
  console.log('target1 not found');
}

const target2 = `  const getWeekRange = (weekStr: string) => {`;
const replacement2 = `  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text(\`Laporan Sholat Zuhur Guru - \${viewMode === 'harian' ? 'Harian' : 'Mingguan'}\`, 14, 15);
    doc.setFontSize(10);
    
    let titleStr = '';
    if (viewMode === 'harian') {
       const dStr = new Date(dateFilter).toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'});
       titleStr = \`Tanggal Laporan: \${dStr}\`;
    } else {
       const { start, end } = getWeekRange(weekFilter);
       const sStr = start.toLocaleDateString('id-ID', {day:'numeric', month:'short', year:'numeric'});
       const eStr = end.toLocaleDateString('id-ID', {day:'numeric', month:'short', year:'numeric'});
       titleStr = \`Periode Laporan: \${sStr} - \${eStr}\`;
    }
    doc.text(titleStr, 14, 22);

    let head = [];
    let body = [];
    
    if (viewMode === 'harian') {
       head = [['No.', 'Nama Guru', 'Jamaah/Tidak', 'Keterangan']];
       body = users.map((u, i) => {
         const record = ibadahRecords.find(r => {
           if (String(r.user_id) !== String(u.id)) return false;
           let recordDate = '';
           if (r.date) {
             const match = String(r.date).match(/^(\\d{4}-\\d{2}-\\d{2})/);
             if (match) recordDate = match[1];
           } else if (r.created_at) {
             const match = String(r.created_at).match(/^(\\d{4}-\\d{2}-\\d{2})/);
             if (match) recordDate = match[1];
           }
           return recordDate === dateFilter;
         });
         let status = 'Belum Mengisi';
         let ket = '-';
         if (record) {
           status = record.status;
           if (record.status === 'Tidak Jamaah' && record.keterangan) ket = record.keterangan;
         }
         return [i + 1, u.name, status, ket];
       });
    } else {
       head = [['No.', 'Nama Guru', 'Jml Jamaah', 'Jml Tidak Jamaah']];
       body = users.map((u, i) => {
          const { start, end } = getWeekRange(weekFilter);
          const startStr = \`\${start.getFullYear()}-\${String(start.getMonth()+1).padStart(2,'0')}-\${String(start.getDate()).padStart(2,'0')}\`;
          const endStr = \`\${end.getFullYear()}-\${String(end.getMonth()+1).padStart(2,'0')}-\${String(end.getDate()).padStart(2,'0')}\`;
          
          const weekRecords = ibadahRecords.filter(r => {
            if (String(r.user_id) !== String(u.id)) return false;
            let recordDate = '';
            if (r.date) {
              const match = String(r.date).match(/^(\\d{4}-\\d{2}-\\d{2})/);
              if (match) recordDate = match[1];
            } else if (r.created_at) {
              const match = String(r.created_at).match(/^(\\d{4}-\\d{2}-\\d{2})/);
              if (match) recordDate = match[1];
            }
            return recordDate >= startStr && recordDate <= endStr;
          });

          let jamaahCount = 0;
          let tidakJamaahCount = 0;
          const now = new Date();
          const todayStr = \`\${now.getFullYear()}-\${String(now.getMonth()+1).padStart(2,'0')}-\${String(now.getDate()).padStart(2,'0')}\`;
          
          for (let d = 0; d < 6; d++) {
            const currentDay = new Date(start);
            currentDay.setDate(start.getDate() + d);
            const filterDateStr = \`\${currentDay.getFullYear()}-\${String(currentDay.getMonth() + 1).padStart(2, '0')}-\${String(currentDay.getDate()).padStart(2, '0')}\`;
            
            const record = weekRecords.find(r => {
              let recordDate = '';
              if (r.date) {
                const match = String(r.date).match(/^(\\d{4}-\\d{2}-\\d{2})/);
                if (match) recordDate = match[1];
              } else if (r.created_at) {
                const match = String(r.created_at).match(/^(\\d{4}-\\d{2}-\\d{2})/);
                if (match) recordDate = match[1];
              }
              return recordDate === filterDateStr;
            });

            if (record) {
              if (record.status === 'Jamaah') jamaahCount++;
              else tidakJamaahCount++;
            } else {
              let isFinalLate = false;
              if (filterDateStr < todayStr) isFinalLate = true;
              else if (filterDateStr === todayStr) {
                const currentHourMin = \`\${now.getHours().toString().padStart(2, '0')}:\${now.getMinutes().toString().padStart(2, '0')}\`;
                if (currentHourMin > '17:00') isFinalLate = true;
              }
              if (isFinalLate) tidakJamaahCount++;
            }
          }
          return [i + 1, u.name, jamaahCount, tidakJamaahCount];
       });
    }

    autoTable(doc, {
      head: head,
      body: body,
      startY: 28,
      theme: 'grid'
    });
    doc.save(\`Laporan_Ibadah_Guru_\${viewMode}.pdf\`);
  };

  const downloadExcel = () => {
    let rows = [];
    if (viewMode === 'harian') {
       rows = users.map((u, i) => {
         const record = ibadahRecords.find(r => {
           if (String(r.user_id) !== String(u.id)) return false;
           let recordDate = '';
           if (r.date) {
             const match = String(r.date).match(/^(\\d{4}-\\d{2}-\\d{2})/);
             if (match) recordDate = match[1];
           } else if (r.created_at) {
             const match = String(r.created_at).match(/^(\\d{4}-\\d{2}-\\d{2})/);
             if (match) recordDate = match[1];
           }
           return recordDate === dateFilter;
         });
         let status = 'Belum Mengisi';
         let ket = '-';
         if (record) {
           status = record.status;
           if (record.status === 'Tidak Jamaah' && record.keterangan) ket = record.keterangan;
         }
         return {
           'No.': i + 1,
           'Nama Guru': u.name,
           'Jamaah/Tidak': status,
           'Keterangan': ket
         };
       });
    } else {
       rows = users.map((u, i) => {
          const { start, end } = getWeekRange(weekFilter);
          const startStr = \`\${start.getFullYear()}-\${String(start.getMonth()+1).padStart(2,'0')}-\${String(start.getDate()).padStart(2,'0')}\`;
          const endStr = \`\${end.getFullYear()}-\${String(end.getMonth()+1).padStart(2,'0')}-\${String(end.getDate()).padStart(2,'0')}\`;
          
          const weekRecords = ibadahRecords.filter(r => {
            if (String(r.user_id) !== String(u.id)) return false;
            let recordDate = '';
            if (r.date) {
              const match = String(r.date).match(/^(\\d{4}-\\d{2}-\\d{2})/);
              if (match) recordDate = match[1];
            } else if (r.created_at) {
              const match = String(r.created_at).match(/^(\\d{4}-\\d{2}-\\d{2})/);
              if (match) recordDate = match[1];
            }
            return recordDate >= startStr && recordDate <= endStr;
          });

          let jamaahCount = 0;
          let tidakJamaahCount = 0;
          const now = new Date();
          const todayStr = \`\${now.getFullYear()}-\${String(now.getMonth()+1).padStart(2,'0')}-\${String(now.getDate()).padStart(2,'0')}\`;
          
          for (let d = 0; d < 6; d++) {
            const currentDay = new Date(start);
            currentDay.setDate(start.getDate() + d);
            const filterDateStr = \`\${currentDay.getFullYear()}-\${String(currentDay.getMonth() + 1).padStart(2, '0')}-\${String(currentDay.getDate()).padStart(2, '0')}\`;
            
            const record = weekRecords.find(r => {
              let recordDate = '';
              if (r.date) {
                const match = String(r.date).match(/^(\\d{4}-\\d{2}-\\d{2})/);
                if (match) recordDate = match[1];
              } else if (r.created_at) {
                const match = String(r.created_at).match(/^(\\d{4}-\\d{2}-\\d{2})/);
                if (match) recordDate = match[1];
              }
              return recordDate === filterDateStr;
            });

            if (record) {
              if (record.status === 'Jamaah') jamaahCount++;
              else tidakJamaahCount++;
            } else {
              let isFinalLate = false;
              if (filterDateStr < todayStr) isFinalLate = true;
              else if (filterDateStr === todayStr) {
                const currentHourMin = \`\${now.getHours().toString().padStart(2, '0')}:\${now.getMinutes().toString().padStart(2, '0')}\`;
                if (currentHourMin > '17:00') isFinalLate = true;
              }
              if (isFinalLate) tidakJamaahCount++;
            }
          }
          return {
           'No.': i + 1,
           'Nama Guru': u.name,
           'Jml Jamaah': jamaahCount,
           'Jml Tidak Jamaah': tidakJamaahCount
          };
       });
    }

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Ibadah");
    XLSX.writeFile(workbook, \`Laporan_Ibadah_Guru_\${viewMode}.xlsx\`);
  };

  const getWeekRange = (weekStr: string) => {`;

if(code.includes(target2)){
  code = code.replace(target2, replacement2);
  fs.writeFileSync('src/pages/KamadPages.tsx', code);
  console.log('patched both');
} else {
  console.log('target2 not found');
}
