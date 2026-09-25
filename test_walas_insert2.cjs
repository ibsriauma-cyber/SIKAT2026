async function test() {
  const payload = {
    student_id: 4, 
    class_name: 'X .6 Al-Khawarizmi',
    subject_name: 'Presensi Wali Kelas',
    student_name: 'Test',
    date: '2026-08-30',
    semester: 'Ganjil',
    status: 'Hadir',
    notes: ''
  };
  const res = await fetch('http://localhost:3000/api/crud.php?table=student_attendance', {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {'Content-Type': 'application/json'}
  }).then(r => r.json());
  console.log(res);
}
test();
