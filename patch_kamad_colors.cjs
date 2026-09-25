const fs = require('fs');
let code = fs.readFileSync('src/pages/KamadPages.tsx', 'utf-8');

const targetLogic = `              if (isOverdue) {
                status = 'terlewat';
                statusText = 'BELUM (TERLEWAT)';
                timeStr = \`Batas Akhir \${cutoffTime} WIB Terlewat\`;
              } else {
                status = 'proses';
                statusText = 'DALAM PROSES';
                timeStr = idealDeadline ? \`Batas Ideal \${idealDeadline} (Akhir \${cutoffTime})\` : \`Batas Akhir \${cutoffTime}\`;
              }`;

const replacementLogic = `              if (isOverdue) {
                status = 'terlewat';
                statusText = 'BELUM (TERLEWAT)';
                timeStr = \`Batas Akhir \${cutoffTime} WIB Terlewat\`;
              } else if (idealDeadline && (isPastDate || isTimePastDeadline(currentHourMin, idealDeadline))) {
                status = 'proses_telat' as any;
                statusText = 'TERLEWAT BATAS IDEAL';
                timeStr = \`Batas Ideal \${idealDeadline} Terlewat (Akhir \${cutoffTime})\`;
              } else {
                status = 'proses';
                statusText = 'DALAM PROSES';
                timeStr = idealDeadline ? \`Batas Ideal \${idealDeadline} (Akhir \${cutoffTime})\` : \`Batas Akhir \${cutoffTime}\`;
              }`;

code = code.replace(targetLogic, replacementLogic);

// Now update the badge color
const targetBadge = `                          badgeStyle =
                            task.status === 'selesai' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
                            task.status === 'selesai_telat' ? 'bg-amber-800 border-amber-900 text-white' :
                            task.status === 'terlewat' ? 'bg-rose-600 text-white border-rose-600' :
                            'bg-blue-50 text-blue-800 border-blue-200';`;

const replacementBadge = `                          badgeStyle =
                            task.status === 'selesai' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
                            task.status === 'selesai_telat' ? 'bg-amber-800 border-amber-900 text-white' :
                            task.status === 'terlewat' ? 'bg-rose-600 text-white border-rose-600' :
                            task.status === 'proses_telat' ? 'bg-orange-500 text-white border-orange-500' :
                            'bg-blue-50 text-blue-800 border-blue-200';`;

code = code.replace(targetBadge, replacementBadge);

// Update small icons
const targetIcons = `                                  <span
                                    className={\`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold border \${
                                      t.status === 'selesai' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                      t.status === 'selesai_telat' ? 'bg-amber-800 text-white border-amber-900' :
                                      t.status === 'terlewat' ? 'bg-rose-600 text-white border-rose-600' :
                                      'bg-slate-100 text-slate-500 border-slate-200'
                                    }\`}
                                    title={t.name}
                                  >
                                    {t.status === 'selesai' && \`✓ \${shortName}: \${t.doneHM || 'Tepat'}\`}
                                    {t.status === 'selesai_telat' && \`⚠ \${shortName}: \${t.doneHM || 'Telat'}\`}
                                    {t.status === 'terlewat' && \`✕ \${shortName}: Terlewat\`}
                                    {t.status === 'proses' && \`⏳ \${shortName}: s/d \${t.deadlineHM || 'Kerja'}\`}
                                  </span>`;

const replacementIcons = `                                  <span
                                    className={\`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold border \${
                                      t.status === 'selesai' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                      t.status === 'selesai_telat' ? 'bg-amber-800 text-white border-amber-900' :
                                      t.status === 'terlewat' ? 'bg-rose-600 text-white border-rose-600' :
                                      t.status === 'proses_telat' ? 'bg-orange-500 text-white border-orange-500' :
                                      'bg-slate-100 text-slate-500 border-slate-200'
                                    }\`}
                                    title={t.name}
                                  >
                                    {t.status === 'selesai' && \`✓ \${shortName}: \${t.doneHM || 'Tepat'}\`}
                                    {t.status === 'selesai_telat' && \`⚠ \${shortName}: \${t.doneHM || 'Telat'}\`}
                                    {t.status === 'terlewat' && \`✕ \${shortName}: Terlewat\`}
                                    {t.status === 'proses_telat' && \`⚠ \${shortName}: Lewat Ideal\`}
                                    {t.status === 'proses' && \`⏳ \${shortName}: s/d \${t.deadlineHM || 'Kerja'}\`}
                                  </span>`;

code = code.replace(targetIcons, replacementIcons);

fs.writeFileSync('src/pages/KamadPages.tsx', code);
