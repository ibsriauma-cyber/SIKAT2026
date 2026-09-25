fetch("http://localhost:3000/api/crud.php?table=student_attendance")
  .then(res => res.json())
  .then(data => {
      console.log(data.filter(k => k.date && k.date.startsWith("2026-08-28")).slice(-10));
  });
