const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf-8');

const triggerEndpoint = `
  app.post('/api/trigger-update', (req, res) => {
    globalEmitter.emit('update', { timestamp: Date.now() });
    res.json({ success: true });
  });
`;

if (!content.includes('/api/trigger-update')) {
  content = content.replace("app.get('/api/health'", triggerEndpoint + "\n  app.get('/api/health'");
  fs.writeFileSync('server.ts', content);
}
