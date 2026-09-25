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

// Insert it right after `app.use(express.json());`
content = content.replace("app.use(express.json());", "app.use(express.json());\n" + sseEndpoint);

fs.writeFileSync('server.ts', content);
