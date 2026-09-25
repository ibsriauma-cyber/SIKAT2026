const fs = require('fs');
let content = fs.readFileSync('src/lib/apiClient.ts', 'utf-8');

if (!content.includes('/trigger-update')) {
  // We need to trigger this update for ANY mutation request that succeeds.
  // Mutations are usually POST, PUT, DELETE.
  const triggerLogic = `
    const contentType = response.headers.get("content-type");
    let result;
    if (contentType && contentType.includes("application/json")) {
      result = await response.json();
    } else {
      result = await response.text();
    }
    
    // Trigger global SSE update if it was a mutation
    if (options.method && ['POST', 'PUT', 'DELETE'].includes(options.method.toUpperCase()) && !url.includes('trigger-update') && !url.includes('kinerja_staf')) {
      fetch(\`\${API_URL}/trigger-update\`, { method: 'POST' }).catch(() => {});
    }
    
    return result;
  `;
  
  content = content.replace(
    /const contentType = response\.headers\.get\("content-type"\);[\s\S]*?return await response\.json\(\);\n\s*\} else \{[\s\S]*?throw new Error\("Invalid JSON response from API"\);\n\s*\}/,
    triggerLogic
  );
  fs.writeFileSync('src/lib/apiClient.ts', content);
}
