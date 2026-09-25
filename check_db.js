fetch('http://localhost:3000/api/query.php', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: "DESCRIBE teaching_assignments" })
}).then(res => res.json()).then(console.log).catch(console.error);
