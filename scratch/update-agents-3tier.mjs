import fs from 'fs';

const agentsPath = '.agents/AGENTS.md';
let content = fs.readFileSync(agentsPath, 'utf8');

// Update Mandatory Trigger Words section in AGENTS.md
const oldTriggerSectionStart = '## Mandatory Trigger Words & Workflows';
const oldTriggerSectionEnd = '# Protocollo di Compressione e Frazionamento dei Report';

const newTriggerSection = `## Mandatory Trigger Words & Workflows (Architettura a 3 Stadi)

### 🏗️ Regola dei 3 Stadi di Sviluppo
1. **Stadio 1: Locale (\`localhost:3000\`)**: Sviluppo a caldo sulla postazione.
2. **Stadio 2: Staging / Virtuale Privato (\`origin staging\`)**: Sito online completo di test isolato sui server cloud Vercel, dove testare da smartphone in totale sicurezza senza toccare la produzione.
3. **Stadio 3: Produzione Ufficiale (\`origin main\` -> \`www.flowerpowerpizza.com\` / \`www.flowerpowervillage.com\`)**: Dominio pubblico ufficiale, aggiornato solo quando lo staging è perfetto al 100%.

---

### 1. \`VAULT-SYNC\` (Workflow Sincronizzazione Nuova Postazione)
Quando l'utente pronuncia la parola d'ordine **\`VAULT-SYNC\`** sulla postazione:
1. **Aggiornamento Automatico Git**: Esegue preliminarmente \`git pull\` da origin per scaricare l'ultimo codice e il file cifrato aggiornato \`.md.enc\`.
2. **Decifratura Vault**: Esegui \`node scratch/vault-sync.mjs decrypt\` (usando \`MASTER_VAULT_KEY\`).
3. **Allineamento Ambiente**: Rigenera e allinea automaticamente i file \`.env\` e \`.env.local\` locali.
4. **Verifica Connessioni**: Esegui \`node scratch/test-credentials-verification.mjs\`.
5. **Check Sicurezza Git**: Esegui la verifica per confermare che \`.secret_docs/api_credentials_report.md\` e i file \`.env\` siano bloccati da \`.gitignore\`.
6. **Conferma Operatività**: Mostra un report chiaro dell'esito dei test e dell'allineamento.

---

### 2. \`FAST-PUSH\` / \`STAGING-PUSH\` (Deploy Rapido su Ambiente di Test Segreto - Stadio 2)
Quando l'utente pronuncia la parola d'ordine **\`FAST-PUSH\`** o **\`STAGING-PUSH\`**:
Esegue un deploy rapido e sicuro **ESCLUSIVAMENTE sul branch \`staging\` di Vercel (zero impatto sui clienti di produzione)**:
1. **Audit Sicurezza & Cifratura Silenziosa**:
   - Convalida zero secret leak (\`node scratch/security-audit.mjs\`).
   - Cifratura cassaforte (\`node scratch/vault-sync.mjs encrypt\`).
2. **Typecheck Istantaneo**:
   - Convalida zero errori TypeScript (\`npx tsc --noEmit\`).
3. **Push Diretto su Staging**:
   - Assicura di essere sul branch \`staging\` (\`git checkout staging\`).
   - \`git add .\`
   - \`git commit -m "<messaggio_sintetico>"\`
   - \`git push origin staging\`
4. **Notifica**: Conferma in 1 riga che il deploy è stato inviato all'ambiente di **Staging Privato** per il collaudo su cellulare.

---

### 3. \`MARKDOWN-PROJECT\` (Pre-PUSH Workflow Documentale)
Quando l'utente pronuncia la parola d'ordine **\`MARKDOWN-PROJECT\`**:
1. **Analisi Modifiche**: Ispeziona i file modificati nella sessione corrente (\`git status\`).
2. **Aggiornamento FISICO Documentazione Tecnica & Allineamento Istruzioni**:
   - Sovrascrittura fisica dei file interessati in \`/documentation_reports/\`.
   - Copie di sicurezza: \`cp .agents/AGENTS.md documentation_reports/AGENTS.md\` e \`cp .agentinstructions documentation_reports/agentinstructions.txt\`.
3. **Cifratura Cassaforte**: Esegui \`node scratch/vault-sync.mjs encrypt\`.
4. **Commit & Push su Staging**: \`git add .\`, commit e push su \`origin staging\`.
5. **Notifica Gemini Notebook**: Elenco dei file aggiornati per il taccuino.

---

### 4. \`MARKDOWN-WEBSITE\` / \`MARKDOWN-ALL\` (Release Ufficiale su Produzione - Stadio 3)
Quando l'utente pronuncia la parola d'ordine **\`MARKDOWN-WEBSITE\`** oppure **\`MARKDOWN-ALL\`**:
Esegue il rilascio definitivo dal branch \`staging\` al branch di produzione \`main\` per i domini ufficiali (\`www.flowerpowerpizza.com\` & \`www.flowerpowervillage.com\`):
1. **Esecuzione Documentale & Vault**:
   - Aggiornamento fisico dei file in \`/documentation_reports/\` e copie di sicurezza.
   - Cifratura cassaforte (\`node scratch/vault-sync.mjs encrypt\`).
   - Controllo zero secret leak (\`node scratch/security-audit.mjs\`).
   - Typecheck (\`npx tsc --noEmit\`).
2. **Merge & Push su Produzione (\`main\`)**:
   - Commit delle modifiche su \`staging\`.
   - \`git checkout main\`
   - \`git merge staging -m "Release: <descrizione_rilascio>"\`
   - \`git push origin main\` (Pubblica all'istante su \`www.flowerpowerpizza.com\`)
   - Ritorno automatico su \`staging\` (\`git checkout staging\`) per mantenere l'ambiente di lavoro pulito.
3. **Report Handoff a 5 Punti & Notifica Notebook**:
   - Emissione del report per Gemini Notebook e conferma dell'avvenuto rilascio pubblico.
`;

const startIdx = content.indexOf(oldTriggerSectionStart);
const endIdx = content.indexOf(oldTriggerSectionEnd);

if (startIdx !== -1 && endIdx !== -1) {
  content = content.substring(0, startIdx) + newTriggerSection + '\n\n' + content.substring(endIdx);
  fs.writeFileSync(agentsPath, content, 'utf8');
  fs.writeFileSync('documentation_reports/AGENTS.md', content, 'utf8');
  console.log('✅ Updated AGENTS.md and documentation_reports/AGENTS.md with 3-tier workflow rules');
} else {
  console.log('❌ Could not locate trigger section markers');
}
