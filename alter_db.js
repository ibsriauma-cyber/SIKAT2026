fetch('http://localhost:3000/api/query.php', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: "ALTER TABLE teaching_assignments ADD COLUMN role VARCHAR(50) DEFAULT 'guru_mapel'" })
}).then(res => res.json()).then(console.log).catch(console.error);
