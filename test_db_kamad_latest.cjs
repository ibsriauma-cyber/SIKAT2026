fetch("http://localhost:3000/api/crud.php?table=ibadah_guru")
  .then(res => res.json())
  .then(data => {
      console.log(data.filter(r => r.user_id == 12 || r.user_id == 13));
  });
