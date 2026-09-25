const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminUsers.tsx', 'utf8');

// Find the position of the last valid `}` which is followed by `+`
let idx = code.indexOf(`    </div>;\n}`);
if (idx !== -1) {
    code = code.substring(0, idx + 13);
    fs.writeFileSync('src/pages/AdminUsers.tsx', code);
    console.log('Truncated garbage at end');
} else {
    console.log('Could not find marker');
}
