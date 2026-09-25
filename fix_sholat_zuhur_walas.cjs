const fs = require('fs');
let code = fs.readFileSync('src/pages/WalasPages.tsx', 'utf8');

const targetFunction = "export function SholatZuhurWalas() {";
const hooksEnd = /const showStudents = selectedClass !== '';/;

if (code.includes(targetFunction) && hooksEnd.test(code)) {
    code = code.replace(hooksEnd, `const showStudents = selectedClass !== '';
  const nowHour = new Date().getHours();
  const isToday = selectedDate === new Date().toISOString().split('T')[0];
  const isBeforeLimit = isToday && nowHour < 12;`);
  
    // Now replace the table area to hide/disable it if before limit.
    const tableHeader = /<div className="overflow-x-auto">/;
    code = code.replace(tableHeader, `{isBeforeLimit ? (
          <div className="p-8 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <h3 className="text-lg font-bold text-slate-800">Belum Waktu Absen</h3>
            <p className="text-slate-500 text-sm max-w-sm">
              Absensi sholat zuhur untuk hari ini baru bisa diisi mulai jam 12.00 WIB. Silakan kembali lagi nanti.
            </p>
          </div>
        ) : (
        <div className="overflow-x-auto">`);
        
    // Close the fragment at the end of the card.
    // It ends with `</table>\n        </div>\n      </Card>\n    </div>;\n}`
    const tableEnd = /<\/table>\s*<\/div>\s*<\/Card>/;
    code = code.replace(tableEnd, `</table>
        </div>
        )}
      </Card>`);
}

fs.writeFileSync('src/pages/WalasPages.tsx', code);
console.log('Fixed SholatZuhurWalas in WalasPages');
