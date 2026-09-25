const fs = require('fs');
let code = fs.readFileSync('src/pages/KamadPages.tsx', 'utf-8');

const oldFetchArray = `        const [
          users,
          kinerja,
          schedules,
          assignments,
          studentAttendance,
          pemantauanPagi,
          nilaiSikap,
          ibadahSiswa,
          laporanHarian,
          materiAjar
        ] = await Promise.all([
          apiClient('/crud.php?table=users').catch(() => []),
          apiClient('/crud.php?table=kinerja_staf').catch(() => []),
          apiClient('/crud.php?table=schedules').catch(() => []),
          apiClient('/crud.php?table=teaching_assignments').catch(() => []),
          apiClient('/crud.php?table=student_attendance').catch(() => []),
          apiClient('/crud.php?table=pemantauan_pagi').catch(() => []),
          apiClient('/crud.php?table=nilai_sikap').catch(() => []),
          apiClient('/crud.php?table=ibadah_siswa').catch(() => []),
          apiClient('/crud.php?table=laporan_harian').catch(() => []),
          apiClient('/crud.php?table=materi_ajar').catch(() => [])
        ]);`;

const newFetchArray = `        const [
          users,
          kinerja,
          schedules,
          assignments,
          studentAttendance,
          pemantauanPagi,
          nilaiSikap,
          ibadahSiswa,
          laporanHarian,
          materiAjar,
          classes
        ] = await Promise.all([
          apiClient('/crud.php?table=users').catch(() => []),
          apiClient('/crud.php?table=kinerja_staf').catch(() => []),
          apiClient('/crud.php?table=schedules').catch(() => []),
          apiClient('/crud.php?table=teaching_assignments').catch(() => []),
          apiClient('/crud.php?table=student_attendance').catch(() => []),
          apiClient('/crud.php?table=pemantauan_pagi').catch(() => []),
          apiClient('/crud.php?table=nilai_sikap').catch(() => []),
          apiClient('/crud.php?table=ibadah_siswa').catch(() => []),
          apiClient('/crud.php?table=laporan_harian').catch(() => []),
          apiClient('/crud.php?table=materi_ajar').catch(() => []),
          apiClient('/crud.php?table=classes').catch(() => [])
        ]);`;

code = code.replace(oldFetchArray, newFetchArray);

const oldUserClass = `const userClass = u.class_name || u.className || '';`;
const newUserClass = `          const walasClassObj = Array.isArray(classes) ? classes.find((c: any) => String(c.wali_kelas_id) === String(u.id)) : null;
          const userClass = u.class_name || u.className || (walasClassObj ? walasClassObj.class_name || walasClassObj.name : '');`;

code = code.replace(oldUserClass, newUserClass);

fs.writeFileSync('src/pages/KamadPages.tsx', code);
