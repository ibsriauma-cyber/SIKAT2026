const fs = require('fs');
let code = fs.readFileSync('src/pages/GuruPages.tsx', 'utf8');

// Lift norm up
const absensiStart = "export function Absensi() {";
if (code.includes(absensiStart)) {
    code = code.replace(absensiStart, absensiStart + "\n  const norm = (str: any) => String(str || '').trim().toLowerCase().replace(/[\\s\\-_]/g, '');");
    code = code.replace(/const norm = \(str: any\) => String\(str \|\| ''\)\.trim\(\)\.toLowerCase\(\)\.replace\(\/\[\\s\\-_\]\/g, ''\);/g, (match, offset, str) => {
        // Keep the first one, delete others inside Absensi
        return match;
    });
}

// Just add it globally at the top of the file to fix ALL these errors!
code = "const norm = (str: any) => String(str || '').trim().toLowerCase().replace(/[\\s\\-_]/g, '');\n" + code;
// and for formatDateStr
code = "const formatDateStr = (dateStr: any) => { if (!dateStr || dateStr === '-') return '-'; const d = new Date(dateStr); return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }); };\n" + code;

// Now we need to remove the local definitions so they don't shadow or cause issues, actually it's fine if they shadow.
// Wait, TS will complain about unused locals if they shadow? No, let's just let them shadow.

fs.writeFileSync('src/pages/GuruPages.tsx', code);
