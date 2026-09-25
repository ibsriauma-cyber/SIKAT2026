const fs = require('fs');
let pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));

// The deployment artifact must not be empty. We have `esbuild server.ts --outfile=dist/server.cjs` in the `build` script.
// Does the presence of `start` script help? Let's ensure the `start` script points to `node dist/server.cjs` (or `node server.ts` if no build).
if (pkg.scripts && pkg.scripts.start) {
  if (pkg.scripts.start !== 'node dist/server.cjs') {
    pkg.scripts.start = 'node dist/server.cjs';
    fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
  }
} else {
  pkg.scripts = pkg.scripts || {};
  pkg.scripts.start = 'node dist/server.cjs';
  fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
}
