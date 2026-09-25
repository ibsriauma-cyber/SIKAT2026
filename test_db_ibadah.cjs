fetch("http://localhost:3000/api/crud.php?table=ibadah_guru")
  .then(res => res.json())
  .then(data => {
      console.log(data.filter(d => d.user_id == 12 || d.user_id == 13).slice(-10));
  });
