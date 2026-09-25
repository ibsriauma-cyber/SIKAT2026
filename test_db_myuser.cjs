fetch("http://localhost:3000/api/crud.php?table=users")
  .then(res => res.json())
  .then(data => {
      const me = data.filter(u => u.email === 'ronlam29boker@gmail.com');
      console.log(me);
  });
