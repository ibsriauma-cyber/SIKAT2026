const fs = require('fs');
let code = fs.readFileSync('src/pages/KamadPages.tsx', 'utf-8');

const targetHM = `        const extractTimestampHM = (rawDate: any): string | null => {
          if (!rawDate) return null;
          const str = String(rawDate).trim();
          if (str.includes(' ') && !str.includes('T')) {
            const timePart = str.split(' ')[1];
            const match = timePart.match(/^(\\d{1,2}):(\\d{2})/);
            if (match) {
              return \`\${match[1].padStart(2, '0')}:\${match[2]}\`;
            }
          }
          const d = new Date(rawDate);
          if (!isNaN(d.getTime())) {
            const h = d.getHours().toString().padStart(2, '0');
            const m = d.getMinutes().toString().padStart(2, '0');
            return \`\${h}:\${m}\`;
          }
          return null;
        };`;

const replaceHM = `        const extractTimestampHM = (rawDate: any): string | null => {
          if (!rawDate) return null;
          const str = String(rawDate).trim();
          // Extract HH:MM directly from the string to ignore timezone offsets
          // since the backend might append 'Z' to local time strings.
          const match = str.match(/T?\\s?(\\d{2}):(\\d{2})/);
          if (match) {
            return \`\${match[1]}:\${match[2]}\`;
          }
          return null;
        };`;

code = code.replace(targetHM, replaceHM);
fs.writeFileSync('src/pages/KamadPages.tsx', code);
