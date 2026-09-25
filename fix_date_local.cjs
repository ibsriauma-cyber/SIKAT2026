const fs = require('fs');
let code = fs.readFileSync('src/pages/KamadPages.tsx', 'utf-8');

const targetDateStr = `          const userKinerja = Array.isArray(kinerja) ? kinerja.filter((k: any) => {
            if (String(k.user_id) !== String(u.id) || !k.created_at) return false;
            const taskDate = k.created_at ? String(k.created_at).split(/[ T]/)[0] : '';
            return taskDate === todayString;
          }) : [];`;

const replaceDateStr = `          const userKinerja = Array.isArray(kinerja) ? kinerja.filter((k: any) => {
            if (String(k.user_id) !== String(u.id) || !k.created_at) return false;
            let taskDate = '';
            if (k.created_at) {
              // Properly convert to local timezone date string (YYYY-MM-DD)
              const d = new Date(k.created_at);
              if (!isNaN(d.getTime())) {
                taskDate = \`\${d.getFullYear()}-\${String(d.getMonth() + 1).padStart(2, '0')}-\${String(d.getDate()).padStart(2, '0')}\`;
              } else {
                taskDate = String(k.created_at).split(/[ T]/)[0];
              }
            }
            return taskDate === todayString;
          }) : [];`;

code = code.replace(targetDateStr, replaceDateStr);
fs.writeFileSync('src/pages/KamadPages.tsx', code);
