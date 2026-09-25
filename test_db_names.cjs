async function test() {
  const users = await fetch("http://localhost:3000/api/crud.php?table=users").then(r=>r.json());
  const records = await fetch("http://localhost:3000/api/crud.php?table=ibadah_guru").then(r=>r.json());
  
  const todayRecords = records.filter(r => r.date.startsWith('2026-08-28') || r.created_at.startsWith('2026-08-28'));
  const namedRecords = todayRecords.map(r => {
    const u = users.find(u => u.id == r.user_id);
    return { name: u ? u.name : 'Unknown', status: r.status, id: r.user_id, time: r.created_at };
  });
  console.log(namedRecords);
}
test();
