const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminSettings.tsx', 'utf8');

code = code.replace(
    /payload\.password = password;\s*payload\.rawPassword = password;/,
    "payload.password = password;"
);

fs.writeFileSync('src/pages/AdminSettings.tsx', code);
console.log('Fixed rawPassword error');
