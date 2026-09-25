fetch("http://localhost:3000/api/crud.php?table=users")
  .then(res => res.json())
  .then(data => {
      const kamad = data.filter(u => String(u.roles).includes('kamad'));
      console.log("Kamad users:", kamad.map(u => ({id: u.id, name: u.name, roles: u.roles})));
  });
