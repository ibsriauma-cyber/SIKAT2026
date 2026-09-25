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

// Desktop password UI
code = code.replace(
    '<p className="text-[10px] text-slate-400 font-mono">****</p>',
    `<p className="text-[10px] text-slate-500 font-mono">Password: <span className="font-semibold text-slate-700">{(u.password && u.password.startsWith('$2')) ? 'Terenkripsi (Reset)' : (u.password || '-')}</span></p>`
);

// Mobile password UI
code = code.replace(
    '<div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 mt-0.5">',
    `<div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 mt-0.5">
<p>User: <span className="font-mono font-semibold text-slate-800">{u.username}</span></p>
<p>Pass: <span className="font-mono font-semibold text-slate-800">{(u.password && u.password.startsWith('$2')) ? 'Terenkripsi (Reset)' : (u.password || '-')}</span></p>`
);

fs.writeFileSync('src/pages/AdminUsers.tsx', code);
console.log('Fixed passwords logic completely');
