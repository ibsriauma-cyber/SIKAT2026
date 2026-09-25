const http = require('http');

const req = http.request('http://localhost:3000/api/events', {
  headers: {
    'Accept': 'text/event-stream'
  }
}, (res) => {
  console.log('Status Code:', res.statusCode);
  console.log('Headers:', res.headers);

  res.on('data', (chunk) => {
    console.log('Received:', chunk.toString());
  });
  
  setTimeout(() => {
    req.destroy();
  }, 2000);
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.end();
