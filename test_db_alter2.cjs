async function test() {
  const query = "ALTER TABLE student_attendance ADD COLUMN student_name varchar(150)";
  const res = await fetch('http://localhost:3000/api/query', {
    method: 'POST',
    body: JSON.stringify({query}),
    headers: {'Content-Type': 'application/json'}
  }).then(r => r.json());
  console.log(res);
}
test();
