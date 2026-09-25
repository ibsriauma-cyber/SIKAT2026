const fs = require('fs');
let code = fs.readFileSync('src/pages/WalasPages.tsx', 'utf8');

const target = "{isLocked ? <button onClick={() => setIsLocked(false)} className=\"w-full md:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 whitespace-nowrap transition-colors shadow-sm\">";

code = code.replace(target, `{isBeforeLimit ? null : isLocked ? <button onClick={() => setIsLocked(false)} className=\"w-full md:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 whitespace-nowrap transition-colors shadow-sm\">`);

fs.writeFileSync('src/pages/WalasPages.tsx', code);
console.log('Fixed buttons');
