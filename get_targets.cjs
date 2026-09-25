const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminReports.tsx', 'utf-8');

const switchMatch = code.match(/switch\s*\(selectedReportType\)\s*\{\s*case 'absensi_siswa':[\s\S]*?break;\s*\}/);
if (switchMatch) {
  fs.writeFileSync('switch_target.txt', switchMatch[0]);
}

const dropMatch = code.match(/<CustomSelect value=\{selectedReportType\} onChange=\{setSelectedReportType\} options=\{[\s\S]*?\}\s*\/>/);
if (dropMatch) {
  fs.writeFileSync('drop_target.txt', dropMatch[0]);
}
