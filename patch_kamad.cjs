const fs = require('fs');

// Patch KamadPages.tsx
let kamadCode = fs.readFileSync('src/pages/KamadPages.tsx', 'utf-8');
const targetKamadFilter = `        return r.includes('guru') || r.includes('walas') || r.includes('guru_quran');`;
const replaceKamadFilter = `        return r.includes('guru') || r.includes('walas') || r.includes('guru_quran') || r.includes('kamad');`;
kamadCode = kamadCode.replace(targetKamadFilter, replaceKamadFilter);
fs.writeFileSync('src/pages/KamadPages.tsx', kamadCode);

// Patch GuruPages.tsx
let guruCode = fs.readFileSync('src/pages/GuruPages.tsx', 'utf-8');
const targetEffect = `  useEffect(() => {
    if (isPastLimit && status === 'hadir') {
      setStatus(null);
    }
  }, [isPastLimit, status]);`;
guruCode = guruCode.replace(targetEffect, ''); // Remove the silent reset

const targetSubmit = `  const handleSubmit = () => {
    if (status === 'tidak' && !reason) {
      window.alert('Mohon isi keterangan (misal: haid, dinas luar, dll).');
      return;
    }`;
const replaceSubmit = `  const handleSubmit = () => {
    if (!status) {
      window.alert('Silakan pilih status kehadiran terlebih dahulu.');
      return;
    }
    if (status === 'tidak' && !reason) {
      window.alert('Mohon isi keterangan (misal: haid, dinas luar, dll).');
      return;
    }`;
guruCode = guruCode.replace(targetSubmit, replaceSubmit);
fs.writeFileSync('src/pages/GuruPages.tsx', guruCode);

