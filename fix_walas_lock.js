import fs from 'fs';
let code = fs.readFileSync('src/pages/WalasPages.tsx', 'utf8');

code = code.replace(
  "const todaysRecords = data.filter((r: any) => String(r.tanggal).startsWith(selectedDate));",
  "const todaysRecords = data.filter((r: any) => String(r.tanggal).startsWith(selectedDate) && r.class_name === (user?.className || user?.class_name));"
);

code = code.replace(
  "setExistingRecords(newData.filter((r: any) => String(r.tanggal).startsWith(selectedDate)));",
  "setExistingRecords(newData.filter((r: any) => String(r.tanggal).startsWith(selectedDate) && r.class_name === (user?.className || user?.class_name)));"
);

code = code.replace(
  "const dateRecords = data.filter((r: any) => String(r.tanggal).startsWith(selectedDate));",
  "const dateRecords = data.filter((r: any) => String(r.tanggal).startsWith(selectedDate) && r.class_name === (user?.className || user?.class_name));"
);

code = code.replace(
  "setExistingRecords(newData.filter((r: any) => String(r.tanggal).startsWith(selectedDate)));",
  "setExistingRecords(newData.filter((r: any) => String(r.tanggal).startsWith(selectedDate) && r.class_name === (user?.className || user?.class_name)));"
);

fs.writeFileSync('src/pages/WalasPages.tsx', code);
console.log("Replaced successfully!");
