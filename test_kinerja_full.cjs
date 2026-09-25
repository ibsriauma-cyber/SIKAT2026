fetch("http://localhost:3000/api/crud.php?table=kinerja_staf")
  .then(res => res.json())
  .then(data => {
      console.log(data.filter(k => k.task.includes('Absen')).slice(-5));
  });
fetch("http://localhost:3000/api/crud.php?table=student_attendance")
  .then(res => res.json())
  .then(data => {
      console.log(data.slice(-5));
  });
