const http = require('http');
const req = http.request('http://localhost:3000/api/health', (res) => {
  console.log('Status:', res.statusCode);
});
req.end();
