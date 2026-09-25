const fs = require('fs');
let code = fs.readFileSync('src/pages/KamadPages.tsx', 'utf-8');

const targetDateStr = `          const userKinerja = Array.isArray(kinerja) ? kinerja.filter((k: any) => {
            if (String(k.user_id) !== String(u.id) || !k.created_at) return false;
            const taskDate = k.created_at ? String(k.created_at).split(' ')[0] : '';
            return taskDate === todayString;
          }) : [];`;

const replaceDateStr = `          const userKinerja = Array.isArray(kinerja) ? kinerja.filter((k: any) => {
            if (String(k.user_id) !== String(u.id) || !k.created_at) return false;
            const taskDate = k.created_at ? String(k.created_at).split(/[ T]/)[0] : '';
            return taskDate === todayString;
          }) : [];`;

code = code.replace(targetDateStr, replaceDateStr);
fs.writeFileSync('src/pages/KamadPages.tsx', code);
