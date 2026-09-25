const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

if (!content.includes('new EventSource')) {
  // Let's create a custom hook or just add it to a top level layout.
  // AppLayout is a good place.
}
