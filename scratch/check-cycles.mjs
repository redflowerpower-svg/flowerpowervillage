import fs from 'fs';
import path from 'path';

function findImports(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const fromRegex = /from\s+['"]([^'"]+)['"]/g;
  const directImportRegex = /import\s+['"]([^'"]+)['"]/g;
  const dynImportRegex = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  const imports = [];
  let match;
  while ((match = fromRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }
  while ((match = directImportRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }
  while ((match = dynImportRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }
  return imports.map(importPath => {
    if (importPath.startsWith('.')) {
      const dir = path.dirname(filePath);
      let resolved = path.resolve(dir, importPath);
      const extensions = ['.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx'];
      if (fs.existsSync(resolved) && fs.statSync(resolved).isFile()) {
        return resolved;
      }
      for (const ext of extensions) {
        if (fs.existsSync(resolved + ext) && fs.statSync(resolved + ext).isFile()) {
          return resolved + ext;
        }
      }
    }
    return null;
  }).filter(Boolean);
}

const allCycles = [];

function checkCycles(startFile) {
  const visited = new Set();
  const stack = [];

  function dfs(curr) {
    if (stack.includes(curr)) {
      const cycle = stack.slice(stack.indexOf(curr)).concat(curr).map(p => path.relative(process.cwd(), p));
      console.log('🔴 CIRCULAR DEPENDENCY DETECTED:\n  ', cycle.join(' \n  -> '));
      allCycles.push(cycle);
      return;
    }
    if (visited.has(curr)) return;
    visited.add(curr);
    stack.push(curr);
    try {
      const imps = findImports(curr);
      for (const imp of imps) {
        dfs(imp);
      }
    } catch {}
    stack.pop();
  }

  dfs(startFile);
}

checkCycles(path.resolve('src/App.tsx'));
checkCycles(path.resolve('src/pizza/pages/DiningTabletSite.tsx'));
checkCycles(path.resolve('src/pizza/pages/DeliveryMenu.tsx'));

if (allCycles.length === 0) {
  console.log('✅ No circular dependencies found!');
} else {
  console.log(`❌ Found ${allCycles.length} circular dependencies!`);
}
