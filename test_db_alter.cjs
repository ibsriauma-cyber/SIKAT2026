async function test() {
  const query = "ALTER TABLE student_attendance ADD COLUMN subject_name varchar(100), ADD COLUMN user_id int(11)";
  const res = await fetch('http://localhost:3000/api/query', {
    method: 'POST',
    body: JSON.stringify({query}),
    headers: {'Content-Type': 'application/json'}
  }).then(r => r.json());
  console.log(res);
}
test();
