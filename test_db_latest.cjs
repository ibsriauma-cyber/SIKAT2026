fetch("http://localhost:3000/api/crud.php?table=ibadah_guru")
  .then(res => res.json())
  .then(data => {
      console.log(data.slice(-5));
  });
