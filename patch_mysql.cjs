const fs = require('fs');
let code = fs.readFileSync('src/lib/mysqlWrapper.ts', 'utf-8');

code = code.replace(/connectionLimit: 10,/, "connectionLimit: 100,");
code = code.replace(/connectTimeout: 5000/, "connectTimeout: 5000,\n    enableKeepAlive: true,\n    keepAliveInitialDelay: 10000");

fs.writeFileSync('src/lib/mysqlWrapper.ts', code);
console.log("Patched mysqlWrapper.ts");
