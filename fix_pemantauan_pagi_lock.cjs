const fs = require('fs');
let content = fs.readFileSync('src/pages/WalasPages.tsx', 'utf8');

// 1. Set isLocked on fetch
const fetchTarget = `            const todaysRecords = data.filter((r: any) => String(r.tanggal).startsWith(selectedDate));
            setExistingRecords(todaysRecords);`;
const fetchReplacement = `            const todaysRecords = data.filter((r: any) => String(r.tanggal).startsWith(selectedDate));
            setExistingRecords(todaysRecords);
            setIsLocked(todaysRecords.length > 0);`;

// 2. Set isLocked on save success
const saveTarget = `      const newData = await apiClient('/crud.php?table=pemantauan_pagi');
      if (Array.isArray(newData)) {
        setExistingRecords(newData.filter((r: any) => String(r.tanggal).startsWith(selectedDate)));
      }`;
const saveReplacement = `      const newData = await apiClient('/crud.php?table=pemantauan_pagi');
      if (Array.isArray(newData)) {
        setExistingRecords(newData.filter((r: any) => String(r.tanggal).startsWith(selectedDate)));
        setIsLocked(true);
      }`;

// 3. Render buttons correctly
const buttonTarget = `            <button onClick={handleSave} disabled={loading} className={\`w-full py-3 text-white font-bold rounded-lg transition-colors \${loading ? 'bg-emerald-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'}\`}>{loading ? 'MENYIMPAN...' : 'SIMPAN PEMANTAUAN'}</button>`;
const buttonReplacement = `            {isLocked ? (
              <button 
                type="button" 
                onClick={() => setIsLocked(false)} 
                className="w-full mt-4 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg transition-colors"
              >
                EDIT DATA
              </button>
            ) : (
              <button 
                onClick={handleSave} 
                disabled={loading} 
                className={\`w-full py-3 text-white font-bold rounded-lg transition-colors \${loading ? 'bg-emerald-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'}\`}
              >
                {loading ? 'MENYIMPAN...' : 'SIMPAN PEMANTAUAN'}
              </button>
            )}`;

content = content.replace(fetchTarget, fetchReplacement);
content = content.replace(saveTarget, saveReplacement);
content = content.replace(buttonTarget, buttonReplacement);

fs.writeFileSync('src/pages/WalasPages.tsx', content);
console.log("Fixed Pemantauan Pagi locking logic");
