const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf-8');

// The original key "isPublished" is here:
// server.ts:312:12:      312 │             isPublished: true
// The duplicate key is on line 315 or so.

content = content.replace("isPublished: true,\n            isPublished: true", "isPublished: true");
fs.writeFileSync('server.ts', content);
