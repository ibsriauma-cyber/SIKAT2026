const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf-8');

content = content.replace(
  "res.json({ id: result.insertId });",
  "globalEmitter.emit('update', { table, action: 'insert', id: result.insertId }); res.json({ id: result.insertId });"
);

fs.writeFileSync('server.ts', content);
