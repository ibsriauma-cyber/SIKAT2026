const fs = require('fs');
let code = fs.readFileSync('src/pages/GuruPages.tsx', 'utf8');

// Inject the `isBeforeLimit` logic
// Locate `const isPastLimit = ...`
const pastLimitRegex = /const isPastLimit = currentTime\.getHours\(\) > limitHour \|\| currentTime\.getHours\(\) === limitHour && currentTime\.getMinutes\(\) >= limitMinute;/;
if (pastLimitRegex.test(code)) {
    code = code.replace(pastLimitRegex, `const isPastLimit = currentTime.getHours() > limitHour || (currentTime.getHours() === limitHour && currentTime.getMinutes() >= limitMinute);
  const isBeforeLimit = currentTime.getHours() < 12;`);
}

// Find the UI block
const uiBlockRegex = /<CardContent>\s*<p className="text-sm text-slate-600 mb-6">Silakan pilih status kehadiran sholat berjamaah zuhur Anda hari ini\./;

if (uiBlockRegex.test(code)) {
    code = code.replace(uiBlockRegex, `<CardContent>
          {isBeforeLimit ? (
             <div className="p-8 text-center flex flex-col items-center justify-center space-y-4">
               <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mb-2">
                 <Clock className="w-8 h-8" />
               </div>
               <h3 className="text-lg font-bold text-slate-800">Belum Waktu Absen</h3>
               <p className="text-slate-500 text-sm max-w-sm">
                 Absensi sholat zuhur baru bisa diisi mulai jam 12.00 WIB. Silakan kembali lagi nanti.
               </p>
             </div>
          ) : (
          <>
          <p className="text-sm text-slate-600 mb-6">Silakan pilih status kehadiran sholat berjamaah zuhur Anda hari ini.`);

    // Close the fragment at the end of the form. 
    // Need to find the end of the form. It ends with: `</button>}\n            </div>\n        </CardContent>`
    const formEndRegex = /<\/button>\}\s*<\/div>\s*<\/CardContent>/;
    code = code.replace(formEndRegex, `</button>}
            </div>
            </>
          )}
        </CardContent>`);
}

fs.writeFileSync('src/pages/GuruPages.tsx', code);
console.log('Fixed AbsensiZuhur in GuruPages');
