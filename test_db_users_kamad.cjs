fetch("http://localhost:3000/api/crud.php?table=users")
  .then(res => res.json())
  .then(data => {
      console.log(data.filter(u => String(u.roles).includes('kamad') || u.role === 'kamad'));
  });
