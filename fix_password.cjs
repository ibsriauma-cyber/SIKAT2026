const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminUsers.tsx', 'utf8');

// 1. Remove bcrypt import
code = code.replace(/import bcrypt from 'bcryptjs';\n/, '');

// 2. Change hashedPassword to rawPassword during import
code = code.replace(
    "const hashedPassword = bcrypt.hashSync(rawPassword, 10);",
    "const hashedPassword = rawPassword;"
);

// 3. Change handling for single user edit/create
code = code.replace(
    "const hashedPassword = finalPassword ? bcrypt.hashSync(finalPassword, 10) : '';",
    "const hashedPassword = finalPassword || '';"
);

// 4. Change default password logic when adding new
code = code.replace(
    "payload.password = hashedPassword || bcrypt.hashSync('12345', 10);",
    "payload.password = hashedPassword || '12345';"
);

// 5. Change the UI tables to show the actual password instead of "12345" or "-"
// Original body mapping lines:
// body = filteredUsers.map((u, i) => [i + 1, u.name, u.roles?.join(', ') || u.role, u.username || '-', u.nuptk || '-', u.password ? '12345' : '-']);
code = code.replace(
    "u.nuptk || '-', u.password ? '12345' : '-'",
    "u.nuptk || '-', (u.password && u.password.startsWith('$2')) ? 'Terenkripsi (Reset)' : (u.password || '-')"
);

code = code.replace(
    "u.username || '-', u.password ? '12345' : '-'",
    "u.username || '-', (u.password && u.password.startsWith('$2')) ? 'Terenkripsi (Reset)' : (u.password || '-')"
);

code = code.replace(
    "u.username || '-', u.password ? '12345' : '-'",
    "u.username || '-', (u.password && u.password.startsWith('$2')) ? 'Terenkripsi (Reset)' : (u.password || '-')"
);

fs.writeFileSync('src/pages/AdminUsers.tsx', code);
console.log('Fixed passwords logic');
