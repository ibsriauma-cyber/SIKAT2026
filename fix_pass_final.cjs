const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminUsers.tsx', 'utf8');

code = code.replace(
  /<div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 mt-0.5"><p>User:(.|\n)*?\{u\.nuptk &&/m,
  `<div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 mt-0.5">
<p>User: <span className="font-mono font-semibold text-slate-800">{u.username}</span></p>
<p>Pass: <span className="font-mono font-semibold text-slate-800">{(u.password && u.password.startsWith('$2')) ? 'Terenkripsi (Reset)' : (u.password || '-')}</span></p>
{u.nuptk &&`
);

code = code.replace(
  /<p className="text-\[10px\] text-slate-500 font-mono">Password: <span className="font-semibold text-slate-700">\{\(u\.password && u\.password\.startsWith\('(.|\n)*?<\/span><\/p>/m,
  `<p className="text-[10px] text-slate-500 font-mono">Password: <span className="font-semibold text-slate-700">{(u.password && u.password.startsWith('$2')) ? 'Terenkripsi (Reset)' : (u.password || '-')}</span></p>`
);

fs.writeFileSync('src/pages/AdminUsers.tsx', code);
console.log('Fixed syntax error');
