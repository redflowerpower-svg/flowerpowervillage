import fs from 'fs';

const agentsPath = '.agents/AGENTS.md';
let content = fs.readFileSync(agentsPath, 'utf8');

const fastPushSection = `
### 5. \`FAST-PUSH\` / \`QUICK-DEPLOY\` (Lean Live Deploy)
Quando l'utente pronuncia la parola d'ordine **\`FAST-PUSH\`** o **\`QUICK-DEPLOY\`**:
Esegue un deploy rapido ed essenziale su Vercel/GitHub durante lo sviluppo iterativo senza riscrittura dei report documentali:
1. **Audit di Sicurezza & Cifratura Vault Silenziosa**:
   - Convalida zero secret leak (\`node scratch/security-audit.mjs\`).
   - Cifratura cassaforte (\`node scratch/vault-sync.mjs encrypt\`).
2. **Typecheck Istantaneo**:
   - Verifica compilazione (\`npx tsc --noEmit\`).
3. **Commit & Push Diretto**:
   - \`git add .\`
   - \`git commit -m "<messaggio_sintetico>"\`
   - \`git push origin main\`
4. **Conferma Rapida**: Notifica di deploy inviata a Vercel in 1 riga senza blocchi o notifiche Notebook.
`;

if (!content.includes('FAST-PUSH')) {
  const target = '### 4. `MARKDOWN-ALL` (All-in-One Global Release & Sync)';
  const idx = content.indexOf(target);
  const nextSection = '# Protocollo di Compressione';
  const nextIdx = content.indexOf(nextSection);
  
  if (idx !== -1 && nextIdx !== -1) {
    const before = content.substring(0, nextIdx);
    const after = content.substring(nextIdx);
    content = before + fastPushSection + '\n' + after;
    fs.writeFileSync(agentsPath, content, 'utf8');
    console.log('✅ Added FAST-PUSH to .agents/AGENTS.md');
  }
}
