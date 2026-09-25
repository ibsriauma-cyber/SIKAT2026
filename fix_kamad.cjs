const fs = require('fs');
let code = fs.readFileSync('src/pages/KamadPages.tsx', 'utf8');

const targetLogic = `        // Group absent by class
        const dhuhaAbsentByClass: Record<string, number> = {};
        const zuhurAbsentByClass: Record<string, number> = {};
        dhuhaIbadah.filter(i => i.status === 'Tidak').forEach(i => {
          dhuhaAbsentByClass[i.class_name] = (dhuhaAbsentByClass[i.class_name] || 0) + 1;
        });
        zuhurIbadah.filter(i => i.status === 'Tidak').forEach(i => {
          zuhurAbsentByClass[i.class_name] = (zuhurAbsentByClass[i.class_name] || 0) + 1;
        });`;

const replacementLogic = `        // Group absent by class
        const dhuhaAbsentByClass: Record<string, number> = {};
        const zuhurAbsentByClass: Record<string, number> = {};
        
        const getClassName = (i: any) => {
          let cName = i.class_name || i.className;
          if (!cName || cName === 'undefined') {
            const student = studentList.find(s => s.id == i.student_id);
            cName = student?.class_name || student?.className || 'Tidak Diketahui';
          }
          return cName;
        };

        dhuhaIbadah.filter(i => i.status === 'Tidak' || i.status === 'Tidak Jamaah').forEach(i => {
          const cName = getClassName(i);
          dhuhaAbsentByClass[cName] = (dhuhaAbsentByClass[cName] || 0) + 1;
        });
        zuhurIbadah.filter(i => i.status === 'Tidak' || i.status === 'Tidak Jamaah').forEach(i => {
          const cName = getClassName(i);
          zuhurAbsentByClass[cName] = (zuhurAbsentByClass[cName] || 0) + 1;
        });`;

if (code.includes(targetLogic)) {
    code = code.replace(targetLogic, replacementLogic);
    fs.writeFileSync('src/pages/KamadPages.tsx', code);
    console.log('Fixed KamadPages.tsx');
} else {
    console.log('Target logic not found');
}
