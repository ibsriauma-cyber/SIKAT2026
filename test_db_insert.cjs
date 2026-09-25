async function test() {
  const payload = {
    user_id: 29,
    class_name: 'X .6 Al-Khawarizmi',
    subject_name: 'TADRIS',
    student_id: 4,
    student_name: 'Test Student',
    date: '2026-08-27',
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
