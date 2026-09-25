const fs = require('fs');
let code = fs.readFileSync('src/pages/KamadPages.tsx', 'utf8');

// 1. Initialize kinerjaStartDate with today
code = code.replace(
  "const [kinerjaStartDate, setKinerjaStartDate] = useState('');",
  "const [kinerjaStartDate, setKinerjaStartDate] = useState(() => new Date().toISOString().split('T')[0]);"
);

// 2. Add kinerjaStartDate to dependency array
code = code.replace(
  "}, [_syncTick]);",
  "}, [_syncTick, kinerjaStartDate]);"
);

// 3. Fix the logic for the date in fetchUsers
const dateLogicReplacement = `
        const filterDateStr = kinerjaStartDate || new Date().toISOString().split('T')[0];
        const filterDateObj = new Date(filterDateStr);
        const currentDayIndex = filterDateObj.getDay();
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const currentDayName = days[currentDayIndex];
`;

code = code.replace(
  /const currentDayIndex = new Date\(\)\.getDay\(\);\n\s*const days = \['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'\];\n\s*const currentDayName = days\[currentDayIndex\];/,
  dateLogicReplacement
);

code = code.replace(
  "const todayString = new Date().toLocaleDateString('en-CA');",
  "const todayString = filterDateStr;"
);

// Wait, taskDate format is `new Date(k.created_at).toLocaleDateString('en-CA')` which might be off by 1 day because of timezone! 
// Let's ensure the format matches `filterDateStr` which is YYYY-MM-DD
code = code.replace(
  "const taskDate = new Date(k.created_at).toLocaleDateString('en-CA');",
  "const taskDate = k.created_at ? k.created_at.split(' ')[0] : '';" // created_at in MySQL is usually YYYY-MM-DD HH:MM:SS
);

// 4. Add the date input UI in the render
const dateInputUi = `
        <div className="flex bg-slate-100 p-1 rounded-lg shrink-0">
          <input
            type="date"
            value={kinerjaStartDate}
            onChange={(e) => setKinerjaStartDate(e.target.value)}
            className="h-8 md:h-9 bg-white border border-slate-200 rounded-md px-3 text-xs md:text-sm font-bold text-slate-700 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none w-[130px] md:w-[150px]"
          />
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg shrink-0">
`;

code = code.replace(
  /<div className="flex bg-slate-100 p-1 rounded-lg shrink-0">\s*<Button\s*variant="ghost"\s*size="sm"/,
  dateInputUi + '\n          <Button\n            variant="ghost"\n            size="sm"'
);

fs.writeFileSync('src/pages/KamadPages.tsx', code);
console.log("Successfully added date filter");
