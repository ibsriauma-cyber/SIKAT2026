const fs = require('fs');
let code = fs.readFileSync('src/pages/KamadPages.tsx', 'utf8');

const replacement = `
        <div className="flex bg-slate-100 p-1 rounded-lg shrink-0 items-center">
          <input
            type="date"
            value={kinerjaStartDate}
            onChange={(e) => setKinerjaStartDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="h-8 md:h-9 bg-white border border-slate-200 rounded-md px-3 text-xs md:text-sm font-bold text-slate-700 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
          />
        </div>
`;

code = code.replace(
  /<div className="flex bg-slate-100 p-1 rounded-lg shrink-0">[\s\S]*?<\/div>/,
  replacement
);

fs.writeFileSync('src/pages/KamadPages.tsx', code);
console.log('Fixed UI');
