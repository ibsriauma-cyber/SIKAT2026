const fs = require('fs');
let content = fs.readFileSync('src/pages/DashboardGuru.tsx', 'utf-8');

content = content.replace(/const isCurrentlyActive = \(\(\) => \{/g, "const isCurrentlyActive = (() => {");
content = content.replace(/\} catch \(e\) \{ return false; \}\n\s*\};/g, "} catch (e) { return false; }\n})();");

fs.writeFileSync('src/pages/DashboardGuru.tsx', content);
