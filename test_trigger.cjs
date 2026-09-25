const http = require('http');

setTimeout(() => {
  const req = http.request('http://localhost:3000/api/crud/test_table', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  req.write(JSON.stringify({ name: 'test' }));
  req.end();
}, 500);
