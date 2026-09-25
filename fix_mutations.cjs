const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf-8');

// For app.post(['/api/crud/:table', '/api/data/:table']
content = content.replace(
  "res.json({ id: result.insertId });",
  "globalEmitter.emit('update', { table, action: 'insert', id: result.insertId }); res.json({ id: result.insertId });"
);

// For app.put(['/api/crud/:table/:id', '/api/data/:table/:id']
content = content.replace(
  "res.json({ affectedRows: result.affectedRows });",
  "globalEmitter.emit('update', { table, action: 'update', id }); res.json({ affectedRows: result.affectedRows });"
);

// For app.delete(['/api/crud/:table/:id', '/api/data/:table/:id']
content = content.replace(
  "res.json(result);",
  "globalEmitter.emit('update', { table, action: 'delete', id }); res.json(result);"
);

fs.writeFileSync('server.ts', content);
