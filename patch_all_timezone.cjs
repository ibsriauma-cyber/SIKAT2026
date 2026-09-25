const fs = require('fs');

function replaceTimezoneBug(filePath) {
    if (!fs.existsSync(filePath)) return;
    let code = fs.readFileSync(filePath, 'utf-8');
    
    // Quick and safe inline replacer
    const badPattern = /new Date\(\)\.toISOString\(\)\.split\('T'\)\[0\]/g;
    const goodPattern = `(function(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');})()`;
    
    if (badPattern.test(code)) {
        code = code.replace(badPattern, goodPattern);
        fs.writeFileSync(filePath, code);
        console.log("Patched", filePath);
    }
}

const files = fs.readdirSync('src/pages').map(f => 'src/pages/' + f);
files.forEach(replaceTimezoneBug);
