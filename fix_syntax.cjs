const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminUsers.tsx', 'utf8');

// The syntax error is at line 881:
// +\'2\')) ? \'Terenkripsi (Reset)\' : (u.password || \'-\')}</span></p>

// Let's just find that string and remove it, then fix the desktop + mobile UI properly.

// Let's use string manipulation to remove the botched code
code = code.replace(/<div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 mt-0\.5"><p>User: <span className="font-mono font-semibold text-slate-800">\{u\.username\}<\/span><\/p><p>Pass: <span className="font-mono font-semibold text-slate-800">\{\(u\.password && u\.password\.startsWith\('(.|\n)*?\+\'2\'\)\) \? \'Terenkripsi \(Reset\)\' : \(u\.password \|\| \'-\'\)\}<\/span><\/p>/, '');

fs.writeFileSync('src/pages/AdminUsers.tsx', code);
