const fs = require('fs');
let content = fs.readFileSync('src/pages/WalasPages.tsx', 'utf8');

// Find the export function NilaiSikap() block
const startIndex = content.indexOf('export function NilaiSikap()');
const endIndex = content.indexOf('export function SholatZuhurWalas()');

if (startIndex !== -1 && endIndex !== -1) {
  let subContent = content.substring(startIndex, endIndex);

  // We want to add setIsLocked(true) inside handleSave
  const searchStr = `      if (Array.isArray(newData)) {
        setExistingRecords(newData.filter((r: any) => r.tanggal === selectedDate));
      }`;
  const replaceStr = `      if (Array.isArray(newData)) {
        setExistingRecords(newData.filter((r: any) => r.tanggal === selectedDate));
        setIsLocked(true);
      }`;
  
  subContent = subContent.replace(searchStr, replaceStr);

  content = content.substring(0, startIndex) + subContent + content.substring(endIndex);
  fs.writeFileSync('src/pages/WalasPages.tsx', content);
  console.log("Success updating setIsLocked inside NilaiSikap handleSave");
} else {
  console.log("Could not find boundaries");
}
