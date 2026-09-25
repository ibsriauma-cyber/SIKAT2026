const fs = require('fs');
let content = fs.readFileSync('src/pages/DashboardGuru.tsx', 'utf-8');

content = content.replace(/const isCurrentlyActive = \(\) => \{\n\s*useRealtimeData\(\);\n/g, "const isCurrentlyActive = (() => {\n");
content = content.replace(/const isButtonsActive = \(\) => \{\n\s*useRealtimeData\(\);\n/g, "const isButtonsActive = (() => {\n");
content = content.replace(/const isMateriUploaded = \(\) => \{\n\s*useRealtimeData\(\);\n/g, "const isMateriUploaded = (() => {\n");
content = content.replace(/const hasAssignedLMS = \(\) => \{\n\s*useRealtimeData\(\);\n/g, "const hasAssignedLMS = (() => {\n");

fs.writeFileSync('src/pages/DashboardGuru.tsx', content);
