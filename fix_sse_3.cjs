const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf-8');

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

// It didn't mount correctly earlier, let's inject it into `startServer()` before `// API Routes`
content = content.replace("// API Routes", sseEndpoint + "\n\n  // API Routes");

fs.writeFileSync('server.ts', content);
