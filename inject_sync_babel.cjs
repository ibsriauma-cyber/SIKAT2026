const fs = require('fs');
const glob = require('glob');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const t = require('@babel/types');

const files = glob.sync('src/pages/**/*.tsx');

files.forEach(file => {
  let code = fs.readFileSync(file, 'utf-8');
  if (!code.includes('apiClient')) return;

  const ast = parser.parse(code, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx']
  });

  let needsRealtime = false;
  let hasUseRealtimeImport = false;

  traverse(ast, {
    ImportDeclaration(path) {
      if (path.node.source.value === '../lib/useRealtime' || path.node.source.value === '../../lib/useRealtime') {
        hasUseRealtimeImport = true;
      }
    },
    FunctionDeclaration(path) {
      // Check if it's a React component (Starts with uppercase)
      const name = path.node.id ? path.node.id.name : '';
      if (!name || name[0] !== name[0].toUpperCase()) return;

      let hasApiClientInEffect = false;

      path.traverse({
        CallExpression(callPath) {
          if (callPath.node.callee.name === 'useEffect') {
            let callsApi = false;
            callPath.traverse({
              CallExpression(innerCall) {
                if (innerCall.node.callee.name === 'apiClient') {
                  callsApi = true;
                }
              }
            });

            if (callsApi) {
              needsRealtime = true;
              hasApiClientInEffect = true;
              
              const args = callPath.node.arguments;
              if (args.length === 2 && t.isArrayExpression(args[1])) {
                const elements = args[1].elements;
                const hasSyncTick = elements.some(el => t.isIdentifier(el) && el.name === '_syncTick');
                if (!hasSyncTick) {
                  elements.push(t.identifier('_syncTick'));
                }
              }
            }
          }
        }
      });

      if (hasApiClientInEffect) {
        const block = path.node.body;
        if (t.isBlockStatement(block)) {
          const hasInjected = block.body.some(stmt => 
            t.isVariableDeclaration(stmt) && 
            stmt.declarations[0].id &&
            stmt.declarations[0].id.name === '_syncTick'
          );
          if (!hasInjected) {
            block.body.unshift(
              t.variableDeclaration('const', [
                t.variableDeclarator(
                  t.identifier('_syncTick'),
                  t.callExpression(t.identifier('useRealtime'), [])
                )
              ])
            );
          }
        }
      }
    }
  });

  if (needsRealtime) {
    if (!hasUseRealtimeImport) {
      // Find proper relative path to lib
      const depth = file.split('/').length - 2; // src/pages/File.tsx -> 1, src/pages/sub/File.tsx -> 2
      const prefix = depth === 1 ? '../' : '../../';
      const importDecl = t.importDeclaration(
        [t.importSpecifier(t.identifier('useRealtime'), t.identifier('useRealtime'))],
        t.stringLiteral(prefix + 'lib/useRealtime')
      );
      ast.program.body.unshift(importDecl);
    }
    const output = generate(ast, {}, code);
    fs.writeFileSync(file, output.code);
    console.log("Injected into: " + file);
  }
});
