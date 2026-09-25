const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminUsers.tsx', 'utf8');

code = code.replace(
    '<div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 mt-0.5">\n<p>User: <span className="font-mono font-semibold text-slate-800">{u.username}</span></p>\n<p>Pass: <span className="font-mono font-semibold text-slate-800">{(u.password && u.password.startsWith(\'$2\')) ? \'Terenkripsi (Reset)\' : (u.password || \'-\')}</span></p>\n<p>User: <span className="font-mono font-semibold text-slate-800">{u.username}</span></p>\n<p>Pass: <span className="font-mono font-semibold text-slate-800">{(u.password && u.password.startsWith(\'$2\')) ? \'Terenkripsi (Reset)\' : (u.password || \'-\')}</span></p>\n{u.nuptk && <p>NIPTK: <span className="font-mono font-semibold text-slate-800">{u.nuptk}</span></p>}',
    '<div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 mt-0.5">\n<p>User: <span className="font-mono font-semibold text-slate-800">{u.username}</span></p>\n<p>Pass: <span className="font-mono font-semibold text-slate-800">{(u.password && u.password.startsWith(\'$2\')) ? \'Terenkripsi (Reset)\' : (u.password || \'-\')}</span></p>\n{u.nuptk && <p>NIPTK: <span className="font-mono font-semibold text-slate-800">{u.nuptk}</span></p>}'
);

fs.writeFileSync('src/pages/AdminUsers.tsx', code);
