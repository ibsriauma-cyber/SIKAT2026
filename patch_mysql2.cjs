const fs = require('fs');
let code = fs.readFileSync('src/lib/mysqlWrapper.ts', 'utf-8');

if (!code.includes('idleTimeout')) {
    code = code.replace(/enableKeepAlive: true,/, "enableKeepAlive: true,\n    idleTimeout: 30000,\n    maxIdle: 10,");
    fs.writeFileSync('src/lib/mysqlWrapper.ts', code);
    console.log("Patched mysqlWrapper.ts with idleTimeout");
} else {
    console.log("Already has idleTimeout");
}
