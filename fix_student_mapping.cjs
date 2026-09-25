const fs = require('fs');
let content = fs.readFileSync('src/pages/GuruPages.tsx', 'utf8');

const searchTarget = `    } else if (reportType === 'pemantauan_pagi') {
      let filtered = pemantauanPagi;
      if (filterSemester) filtered = filtered.filter(p => !p.semester || norm(p.semester) === norm(filterSemester));
      if (selectedClass) {
        filtered = filtered.filter(p => {
          const student = studentsList.find(s => String(s.id) === String(p.student_id));
          const sClass = student?.className || student?.class_name || p.class_name;
          return norm(sClass) === norm(selectedClass);
        });
      }
      if (selectedMonth !== 'Semua Bulan' && monthNum) {
        filtered = filtered.filter(p => {
          const m = getMonthFromDate(p.tanggal);
          return !m || m === monthNum;
        });
      }
      return filtered.map((p: any, idx: number) => {
        const student = studentsList.find(s => String(s.id) === String(p.student_id));
        return {
          no: idx + 1,
          tanggal: p.tanggal,
          nama: student?.name || '-',
          kelas: p.class_name || '-',
          kebersihan: p.kebersihan || '-',
          seragam: p.seragam || '-',
          ket: p.ket_seragam || '-'
        };
      });
    } else if (reportType === 'nilai_sikap') {
      let filtered = nilaiSikap;
      if (filterSemester) filtered = filtered.filter(p => !p.semester || norm(p.semester) === norm(filterSemester));
      if (selectedClass) {
        filtered = filtered.filter(p => {
          const student = studentsList.find(s => String(s.id) === String(p.student_id));
          const sClass = student?.className || student?.class_name || p.class_name;
          return norm(sClass) === norm(selectedClass);
        });
      }
      if (selectedMonth !== 'Semua Bulan' && monthNum) {
        filtered = filtered.filter(p => {
          const m = getMonthFromDate(p.tanggal);
          return !m || m === monthNum;
        });
      }
      return filtered.map((p: any, idx: number) => {
        const student = studentsList.find(s => String(s.id) === String(p.student_id));
        return {
          no: idx + 1,
          tanggal: p.tanggal,
          nama: student?.name || '-',
          kelas: p.class_name || '-',
          nilai: p.nilai || '-'
        };
      });
    }`;

const replacement = `    } else if (reportType === 'pemantauan_pagi') {
      return targetStudents.map((s, idx) => {
        let studentRecords = pemantauanPagi.filter(p => {
          if (filterSemester && p.semester && norm(p.semester) !== norm(filterSemester)) return false;
          const studentMatch = String(p.student_id).trim() === String(s.id).trim() || (s.nis && String(p.student_id).trim() === String(s.nis).trim());
          const classMatch = !selectedClass || norm(p.class_name) === norm(selectedClass);
          if (!studentMatch || !classMatch) return false;
          if (selectedMonth !== 'Semua Bulan' && monthNum) {
            const m = getMonthFromDate(p.tanggal);
            if (m && m !== monthNum) return false;
          }
          return true;
        });
        
        studentRecords.sort((a, b) => new Date(b.tanggal || 0).getTime() - new Date(a.tanggal || 0).getTime());
        const latest = studentRecords[0] || {};
        
        return {
          no: idx + 1,
          tanggal: latest.tanggal || '-',
          nama: s.name || s.nama || '-',
          kelas: s.className || s.class_name || selectedClass || '-',
          kebersihan: latest.kebersihan || '-',
          seragam: latest.seragam || '-',
          ket: latest.ket_seragam || '-'
        };
      });
    } else if (reportType === 'nilai_sikap') {
      return targetStudents.map((s, idx) => {
        let studentRecords = nilaiSikap.filter(p => {
          if (filterSemester && p.semester && norm(p.semester) !== norm(filterSemester)) return false;
          const studentMatch = String(p.student_id).trim() === String(s.id).trim() || (s.nis && String(p.student_id).trim() === String(s.nis).trim());
          const classMatch = !selectedClass || norm(p.class_name) === norm(selectedClass);
          if (!studentMatch || !classMatch) return false;
          if (selectedMonth !== 'Semua Bulan' && monthNum) {
            const m = getMonthFromDate(p.tanggal);
            if (m && m !== monthNum) return false;
          }
          return true;
        });
        
        studentRecords.sort((a, b) => new Date(b.tanggal || 0).getTime() - new Date(a.tanggal || 0).getTime());
        const latest = studentRecords[0] || {};
        
        return {
          no: idx + 1,
          tanggal: latest.tanggal || '-',
          nama: s.name || s.nama || '-',
          kelas: s.className || s.class_name || selectedClass || '-',
          nilai: latest.nilai || '-'
        };
      });
    }`;

if (content.includes("let filtered = pemantauanPagi;")) {
  content = content.replace(searchTarget, replacement);
  fs.writeFileSync('src/pages/GuruPages.tsx', content);
  console.log("Success replacing");
} else {
  console.log("Not found");
}
