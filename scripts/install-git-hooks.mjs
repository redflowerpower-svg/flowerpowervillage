#!/usr/bin/env node
/**
 * Installs the local Git pre-commit hook that runs scratch/security-audit.mjs
 * before every commit to prevent accidental secret leaks.
 */
import fs from 'fs';
import path from 'path';

const hookPath = path.join(process.cwd(), '.git', 'hooks', 'pre-commit');
const hookContent = `#!/bin/sh
# Flower Power Local Secret Guard (installed via scripts/install-git-hooks.mjs)
echo "🛡️ [pre-commit] Running Flower Power security audit..."
node scratch/security-audit.mjs
if [ $? -ne 0 ]; then
  echo "❌ [pre-commit] Commit bloccato: rilevati potenziali segreti nel codice."
  exit 1
fi
`;

if (!fs.existsSync(path.dirname(hookPath))) {
  console.error('❌ Directory .git/hooks non trovata. Esegui dalla root del repository.');
  process.exit(1);
}

fs.writeFileSync(hookPath, hookContent, { encoding: 'utf8', mode: 0o755 });
console.log('✅ Git pre-commit hook installato correttamente in .git/hooks/pre-commit');
