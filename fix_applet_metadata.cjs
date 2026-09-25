const fs = require('fs');

const manifestPath = 'metadata.json';
if (fs.existsSync(manifestPath)) {
  const content = fs.readFileSync(manifestPath, 'utf-8');
  let data = JSON.parse(content);
  if (!data.majorCapabilities) {
    data.majorCapabilities = [];
  }
  if (!data.majorCapabilities.includes("MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API")) {
     data.majorCapabilities.push("MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API");
     fs.writeFileSync(manifestPath, JSON.stringify(data, null, 2));
  }
}
