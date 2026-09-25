import fs from 'fs';
let code = fs.readFileSync('src/main.tsx', 'utf8');

const targetImport = "import App from './App.tsx';";
const replacementImport = `import App from './App.tsx';\nimport { Toaster, toast } from 'react-hot-toast';\n\n// Override window.alert globally\nconst originalAlert = window.alert;\nwindow.alert = (msg) => {\n  if (!msg) return;\n  const lowerMsg = msg.toLowerCase();\n  if (lowerMsg.includes('berhasil') || lowerMsg.includes('sukses')) {\n    toast.success(msg, { duration: 3000 });\n  } else if (lowerMsg.includes('gagal') || lowerMsg.includes('error') || lowerMsg.includes('peringatan') || lowerMsg.includes('mohon') || lowerMsg.includes('tidak')) {\n    toast.error(msg, { duration: 4000 });\n  } else {\n    toast(msg, { duration: 3000 });\n  }\n};\n`;

const targetRender = "<App />";
const replacementRender = "<App />\n    <Toaster position=\"top-center\" reverseOrder={false} toastOptions={{ className: 'font-medium text-sm rounded-xl shadow-lg border border-slate-100', style: { padding: '12px 16px', background: '#fff', color: '#334155' }, success: { iconTheme: { primary: '#10b981', secondary: '#fff' } }, error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } } }} />";

if (code.includes(targetImport)) {
  code = code.replace(targetImport, replacementImport);
}

if (code.includes(targetRender)) {
  code = code.replace(targetRender, replacementRender);
}

fs.writeFileSync('src/main.tsx', code);
console.log("Success");
