const fs = require('fs');
let content = fs.readFileSync('src/pages/WalasPages.tsx', 'utf8');

const textareaSearch = `              className="w-full p-3 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
              rows={4}
            />`;
const textareaReplace = `              className={\`w-full p-3 rounded-lg border \${isLocked ? 'bg-slate-50 text-slate-500 border-slate-200 cursor-not-allowed' : 'border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'} focus:outline-none text-sm\`}
              rows={4}
              disabled={isLocked}
            />`;

const select1Search = `                      <CustomSelect
                        value={monitoring[s.id]?.kebersihan || 'Piket'}
                        onChange={(val) => handleUpdate(s.id, 'kebersihan', val)}
                        options={[`;
const select1Replace = `                      <CustomSelect
                        value={monitoring[s.id]?.kebersihan || 'Piket'}
                        onChange={(val) => handleUpdate(s.id, 'kebersihan', val)}
                        disabled={isLocked}
                        options={[`;

const select2Search = `                      <CustomSelect
                        value={monitoring[s.id]?.seragam || 'Lengkap'}
                        onChange={(val) => {
                          handleUpdate(s.id, 'seragam', val);
                          if (val === 'Lengkap') {
                            handleUpdate(s.id, 'ketSeragam', '');
                          }
                        }}
                        options={[`;
const select2Replace = `                      <CustomSelect
                        value={monitoring[s.id]?.seragam || 'Lengkap'}
                        onChange={(val) => {
                          handleUpdate(s.id, 'seragam', val);
                          if (val === 'Lengkap') {
                            handleUpdate(s.id, 'ketSeragam', '');
                          }
                        }}
                        disabled={isLocked}
                        options={[`;

const inputSearch = `                        <input
                          type="text"
                          value={monitoring[s.id]?.ketSeragam || ''}
                          onChange={(e) => handleUpdate(s.id, 'ketSeragam', e.target.value)}
                          placeholder="Alasan tidak lengkap..."
                          className="w-full p-2 text-sm border border-slate-300 rounded focus:outline-none focus:border-amber-500"
                        />`;
const inputReplace = `                        <input
                          type="text"
                          value={monitoring[s.id]?.ketSeragam || ''}
                          onChange={(e) => handleUpdate(s.id, 'ketSeragam', e.target.value)}
                          placeholder="Alasan tidak lengkap..."
                          className={\`w-full p-2 text-sm border rounded focus:outline-none \${isLocked ? 'bg-slate-50 text-slate-500 border-slate-200 cursor-not-allowed' : 'border-slate-300 focus:border-amber-500'}\`}
                          disabled={isLocked}
                        />`;


content = content.replace(textareaSearch, textareaReplace);
content = content.replace(select1Search, select1Replace);
content = content.replace(select2Search, select2Replace);
content = content.replace(inputSearch, inputReplace);

fs.writeFileSync('src/pages/WalasPages.tsx', content);
console.log("Fixed Pemantauan Pagi inputs disabled state");
