const fs = require('fs');
let content = fs.readFileSync('src/pages/DashboardGuru.tsx', 'utf-8');

// There's a trailing `})();` in DashboardGuru.tsx around line 231 that is causing a syntax error.
// It seems the `isButtonsActive` or `isCurrentlyActive` functions have trailing `})();` which means they were IIFEs but now are arrow functions.

// Let's replace `})();` with `};` for those functions.
content = content.replace(/\s*\}\s*catch\s*\(e\)\s*\{\s*return\s*false;\s*\}\s*\}\)\(\);/g, 
  " } catch (e) { return false; }\n                    };");

fs.writeFileSync('src/pages/DashboardGuru.tsx', content);
