fetch("http://localhost:3000/api/crud.php?table=student_attendance")
  .then(res => res.json())
  .then(data => {
    // just looking if date exists
    console.log("Total attendance:", data.length);
  });
