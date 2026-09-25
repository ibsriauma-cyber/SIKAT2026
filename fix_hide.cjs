const fs = require('fs');
let content = fs.readFileSync('src/pages/GuruPages.tsx', 'utf8');

const targetDropdowns = `            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Pilih Kelas</label>
              {availableClasses.length > 0 ? (
                <CustomSelect
                  value={selectedClass}
                  onChange={(val) => setSelectedClass(val)}
                  options={availableClasses.map(c => ({ value: String(c), label: \`Kelas \${c}\` }))}
                />
              ) : (
                <CustomSelect
                  value={selectedClass}
                  onChange={(val) => setSelectedClass(val)}
                  options={[
                    { value: 'X-IPA 1', label: 'Kelas X-IPA 1' },
                    { value: 'XI-IPA 2', label: 'Kelas XI-IPA 2' },
                    { value: 'XII-IPA 1', label: 'Kelas XII-IPA 1' }
                  ]}
                />
              )}
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Mata Pelajaran</label>
              {availableMapel.length > 0 ? (
                <CustomSelect
                  value={selectedSubject}
                  onChange={(val) => setSelectedSubject(val)}
                  options={availableMapel.map(m => ({ value: m, label: m }))}
                />
              ) : (
                <input
                  type="text"
                  disabled
                  value={selectedSubject}
                  className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-400 outline-none"
                />
              )}
            </div>`;

const newDropdowns = `            {user?.role !== 'walas' && (
              <>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Pilih Kelas</label>
                  {availableClasses.length > 0 ? (
                    <CustomSelect
                      value={selectedClass}
                      onChange={(val) => setSelectedClass(val)}
                      options={availableClasses.map(c => ({ value: String(c), label: \`Kelas \${c}\` }))}
                    />
                  ) : (
                    <CustomSelect
                      value={selectedClass}
                      onChange={(val) => setSelectedClass(val)}
                      options={[
                        { value: 'X-IPA 1', label: 'Kelas X-IPA 1' },
                        { value: 'XI-IPA 2', label: 'Kelas XI-IPA 2' },
                        { value: 'XII-IPA 1', label: 'Kelas XII-IPA 1' }
                      ]}
                    />
                  )}
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Mata Pelajaran</label>
                  {availableMapel.length > 0 ? (
                    <CustomSelect
                      value={selectedSubject}
                      onChange={(val) => setSelectedSubject(val)}
                      options={availableMapel.map(m => ({ value: m, label: m }))}
                    />
                  ) : (
                    <input
                      type="text"
                      disabled
                      value={selectedSubject}
                      className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-400 outline-none"
                    />
                  )}
                </div>
              </>
            )}`;

content = content.replace(targetDropdowns, newDropdowns);
fs.writeFileSync('src/pages/GuruPages.tsx', content);
console.log('Dropdowns hidden for Walas');
