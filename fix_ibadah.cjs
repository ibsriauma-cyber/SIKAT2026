const fs = require('fs');
let code = fs.readFileSync('src/pages/KamadPages.tsx', 'utf-8');

const targetLogic = `                const jamaahCount = weekRecords.filter(r => r.status === 'Jamaah').length;
                const tidakJamaahCount = weekRecords.filter(r => r.status === 'Tidak Jamaah').length;`;

const newLogic = `                let jamaahCount = 0;
                let tidakJamaahCount = 0;
                const now = new Date();
                const todayStr = \`\${now.getFullYear()}-\${String(now.getMonth()+1).padStart(2,'0')}-\${String(now.getDate()).padStart(2,'0')}\`;
                
                for (let d = 0; d < 6; d++) {
                  const currentDay = new Date(start);
                  currentDay.setDate(start.getDate() + d);
                  const filterDateStr = \`\${currentDay.getFullYear()}-\${String(currentDay.getMonth() + 1).padStart(2, '0')}-\${String(currentDay.getDate()).padStart(2, '0')}\`;
                  
                  const record = weekRecords.find(r => {
                    let recordDate = '';
                    if (r.date) {
                      const match = String(r.date).match(/^(\\d{4}-\\d{2}-\\d{2})/);
                      if (match) recordDate = match[1];
                    } else if (r.created_at) {
                      const match = String(r.created_at).match(/^(\\d{4}-\\d{2}-\\d{2})/);
                      if (match) recordDate = match[1];
                    }
                    return recordDate === filterDateStr;
                  });

                  if (record) {
                    if (record.status === 'Jamaah') jamaahCount++;
                    else tidakJamaahCount++;
                  } else {
                    let isFinalLate = false;
                    if (filterDateStr < todayStr) isFinalLate = true;
                    else if (filterDateStr === todayStr) {
                      const currentHourMin = \`\${now.getHours().toString().padStart(2, '0')}:\${now.getMinutes().toString().padStart(2, '0')}\`;
                      if (currentHourMin > '17:00') isFinalLate = true;
                    }
                    if (isFinalLate) tidakJamaahCount++;
                  }
                }`;

if (code.includes(targetLogic)) {
  code = code.replace(targetLogic, newLogic);
  fs.writeFileSync('src/pages/KamadPages.tsx', code);
  console.log('Replaced successfully');
} else {
  console.log('Target logic not found');
}
