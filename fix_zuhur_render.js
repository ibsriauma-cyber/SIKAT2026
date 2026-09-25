import fs from 'fs';
let code = fs.readFileSync('src/pages/GuruPages.tsx', 'utf8');

const target = `  if (hasAbsen) {
    return (
      <div className="space-y-6">`;

const replacement = `  if (isLoading) {
    return (
      <div className="p-8 text-center text-slate-500 text-sm font-medium animate-pulse">
        Memeriksa status absensi...
      </div>
    );
  }

  if (hasAbsen) {
    return (
      <div className="space-y-6">`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('src/pages/GuruPages.tsx', code);
    console.log("Success");
} else {
    console.log("Target not found");
}
