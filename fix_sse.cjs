const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf-8');

if (!content.includes('EventEmitter')) {
  content = content.replace("import express from 'express';", "import express from 'express';\nimport { EventEmitter } from 'events';\n\nexport const globalEmitter = new EventEmitter();");
}

if (!content.includes('/api/events')) {
  const sseEndpoint = `
  app.get('/api/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();
    
    const onUpdate = (data) => {
      res.write(\`data: \${JSON.stringify(data)}\\n\\n\`);
    };
    
    globalEmitter.on('update', onUpdate);
    
    req.on('close', () => {
      globalEmitter.off('update', onUpdate);
    });
  });
`;
  content = content.replace('// API routes FIRST', '// API routes FIRST' + sseEndpoint);
}

// Add globalEmitter.emit('update', { table, action, id }) to mutations.
// This might be tricky to do with regex reliably. Let's see how crud endpoints return success.
// Usually they have `res.json(` or `res.status(200)`.

fs.writeFileSync('server.ts', content);
