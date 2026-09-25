const fs = require('fs');
let content = fs.readFileSync('src/pages/WalasPages.tsx', 'utf8');

const searchState = `  const [existingRecords, setExistingRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);`;
const replaceState = `  const [existingRecords, setExistingRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLocked, setIsLocked] = useState(false);`;

const searchUseEffect = `          if (Array.isArray(data)) {
            const dateRecords = data.filter((r: any) => r.tanggal === selectedDate);
            setExistingRecords(dateRecords);
            
            const initial: Record<string, string> = {};`;
const replaceUseEffect = `          if (Array.isArray(data)) {
            const dateRecords = data.filter((r: any) => r.tanggal === selectedDate);
            setExistingRecords(dateRecords);
            setIsLocked(dateRecords.length > 0);
            
            const initial: Record<string, string> = {};`;

const searchHandleSave = `      if (Array.isArray(newData)) {
        setExistingRecords(newData.filter((r: any) => r.tanggal === selectedDate));
      }
    } catch (err) {`;
const replaceHandleSave = `      if (Array.isArray(newData)) {
        setExistingRecords(newData.filter((r: any) => r.tanggal === selectedDate));
        setIsLocked(true);
      }
    } catch (err) {`;

const searchCustomSelect = `                    <CustomSelect
                      value={grades[s.id] || 'B'}
                      onChange={(val) => handleUpdate(s.id, val)}
                      options={[`;
const replaceCustomSelect = `                    <CustomSelect
                      value={grades[s.id] || 'B'}
                      onChange={(val) => handleUpdate(s.id, val)}
                      disabled={isLocked}
                      options={[`;

const searchButtons = `            </div>
            <button onClick={handleSave} className="w-full mt-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors">SIMPAN NILAI SIKAP</button>
          </div>`;
const replaceButtons = `            </div>
            {isLocked ? (
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
                className="w-full mt-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading && <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>}
                SIMPAN NILAI SIKAP
              </button>
            )}
          </div>`;

if (content.includes("const [existingRecords, setExistingRecords] = useState<any[]>([])")) {
  content = content.replace(searchState, replaceState);
  content = content.replace(searchUseEffect, replaceUseEffect);
  content = content.replace(searchHandleSave, replaceHandleSave);
  content = content.replace(searchCustomSelect, replaceCustomSelect);
  content = content.replace(searchButtons, replaceButtons);
  fs.writeFileSync('src/pages/WalasPages.tsx', content);
  console.log("Success updating NilaiSikap locking logic.");
} else {
  console.log("Could not find NilaiSikap injection points.");
}
