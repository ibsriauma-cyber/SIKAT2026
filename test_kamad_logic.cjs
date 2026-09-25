const fs = require('fs');

async function test() {
  const uRes = await fetch("http://localhost:3000/api/crud.php?table=users").then(r=>r.json());
  const iRes = await fetch("http://localhost:3000/api/crud.php?table=ibadah_guru").then(r=>r.json());
  
  const teachers = uRes.filter(u => {
    const r = u.roles ? (typeof u.roles === 'string' ? JSON.parse(u.roles) : u.roles) : [u.role];
    return r.includes('guru') || r.includes('walas') || r.includes('guru_quran');
  });

  const dateFilter = '2026-08-27'; // yesterday

  const results = teachers.map(u => {
    const record = iRes.find(r => {
      if (String(r.user_id) !== String(u.id)) return false;
      let recordDate = '';
      if (r.date) {
        const match = String(r.date).match(/^(\d{4}-\d{2}-\d{2})/);
        if (match) recordDate = match[1];
      } else if (r.created_at) {
        const match = String(r.created_at).match(/^(\d{4}-\d{2}-\d{2})/);
        if (match) recordDate = match[1];
      }
      return recordDate === dateFilter;
    });
    return { name: u.name, status: record ? record.status : 'Belum Mengisi', date: record ? record.date : null };
  });

  console.log("Kamad users for 2026-08-27:");
  console.log(results.filter(r => r.name.toLowerCase().includes('misran') || r.name.toLowerCase().includes('dodi')));
  
  const dateFilterToday = '2026-08-28'; // today
  const resultsToday = teachers.map(u => {
    const record = iRes.find(r => {
      if (String(r.user_id) !== String(u.id)) return false;
      let recordDate = '';
      if (r.date) {
        const match = String(r.date).match(/^(\d{4}-\d{2}-\d{2})/);
        if (match) recordDate = match[1];
      } else if (r.created_at) {
        const match = String(r.created_at).match(/^(\d{4}-\d{2}-\d{2})/);
        if (match) recordDate = match[1];
      }
      return recordDate === dateFilterToday;
    });
    return { name: u.name, status: record ? record.status : 'Belum Mengisi', date: record ? record.date : null };
  });
  
  console.log("Kamad users for 2026-08-28:");
  console.log(resultsToday.filter(r => r.name.toLowerCase().includes('misran') || r.name.toLowerCase().includes('dodi')));
}
test();
