fetch("http://localhost:3000/api/crud.php?table=kinerja_staf")
  .then(res => res.json())
  .then(data => {
      console.log(data.filter(k => k.created_at.startsWith("2026-08")).slice(-10));
  });
