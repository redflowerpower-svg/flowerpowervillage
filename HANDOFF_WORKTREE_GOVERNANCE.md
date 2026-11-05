# 📋 HANDOFF: Governance dei Worktree & Task da Eseguire nella Nuova Chat

> **Documento di passaggio per la nuova sessione chat.**  
> Contiene le necessità espresse da Red, lo stato attuale del lavoro svolto e la checklist esatta delle azioni da eseguire.

---

## 🎯 1. Le Necessità di Red (Visione e Requisiti)

1. **Importanza dei Worktree**: I worktree Git sono uno strumento utile e importante per isolare feature complesse senza rischiare di rompere il sito principale, **MA non devono essere aperti a raffica o a sorpresa**.
2. **Controllo Sovrano all'Utente**:
   - Deve essere **Red a decidere** se e quando aprire un nuovo worktree.
   - Il sistema e gli agenti **NON devono aprire nuovi worktree da soli** con nomi casuali (es. `quantum_surge_arcs_10h51`, `flower_power_down`, ecc.).
3. **Stabilità e Riutilizzo dello Stesso Ambiente**:
   - Di base si lavora sempre nello **stesso workspace attivo** (`inherit`), senza clonare cartelle ad ogni sessione.
   - Se Red decide di aprire un worktree dedicato per una feature (es. `feat-booking`), si deve continuare a lavorare **all'interno di quello stesso worktree per tutta la durata della feature**, senza moltiplicare i cantieri.
4. **Ciclo di Vita e Chiusura Assistita**:
   - Quando il lavoro in un worktree è concluso, il codice utile deve essere fuso in `staging` e il worktree eliminato da disco per non lasciare giga di cloni orfani e branch bloccati.

---

## 📌 2. Cosa è Stato Fatto in Questa Sessione (Stato Attuale)

1. **Incidente GitGuardian Risolto**:
   - Individuato il leak segnalato dall'allarme (`Supabase Service Role JWT` in `scripts/gdrive-handoff-pull.mjs`).
   - Rimosso il token fallback dal codice sorgente, sostituito con lettura pulita e sicura da `.env`.
   - Aggiornato `scratch/security-audit.mjs` per includere la cartella `scripts/` e i file root nell'audit automatico.
   - Eseguito l'audit locale con esito: **🎉 0 SECRETS DETECTED! Codebase is 100% blindato**.
   - GitGuardian dashboard: incidente contrassegnato come risolto.
2. **Commit Locale Eseguito sul Feature Branch**:
   - Commit: `f6c4785` (*"fix(security): remove hardcoded fallback JWT from gdrive-handoff-pull and include scripts in audit"*).
   - Branch attuale: `quantum_surge_arcs_10h51`.
   - Worktree attuale: `C:\Users\Red\.gemini\antigravity\worktrees\flowerpowervillage\quantum_surge_arcs_10h51`.
3. **Nessun comando di merge o distruzione eseguito qui**: come richiesto, l'ambiente è intatto e pronto per essere gestito ordinatamente dalla nuova chat.

---

## 🚀 3. Checklist Azioni da Eseguire nella Nuova Chat

Apri la nuova chat posizionandoti nella cartella principale:  
👉 `D:\WEB SITE Antigravity\flowerpowervillage`

L'agente della nuova chat dovrà eseguire questi 5 passi ordinati:

### Passo 1: Fusione del Commit di Sicurezza in `staging`
Portare il commit `f6c4785` dal branch `quantum_surge_arcs_10h51` dentro `staging`:
```bash
git checkout staging
git merge quantum_surge_arcs_10h51 --no-edit
```

### Passo 2: Rimozione Pulita del Worktree Odierno
Eliminare la cartella temporanea e il branch usa-e-getta:
```bash
git worktree remove "C:/Users/Red/.gemini/antigravity/worktrees/flowerpowervillage/quantum_surge_arcs_10h51"
git branch -d quantum_surge_arcs_10h51
git worktree prune
```

### Passo 3: Inserimento Regola Immutabile in `.agents/AGENTS.md`
Aggiungere la regola di sistema che vieta l'auto-branching agli agenti:
* **Divieto Auto-Branching**: Qualsiasi subagente o task lanciato deve usare tassativamente `Workspace: 'inherit'`.
* **Creazione Worktree solo su richiesta esplicita**: Nessun worktree viene aperto a meno che Red non scriva esplicitamente "apri un nuovo worktree".
* **Riutilizzo stesso ambiente**: Si lavora sempre nello stesso workspace attivo senza proliferare cartelle.

### Passo 4: Creazione Strumento di Gestione Assistita (`scripts/worktree-manage.mjs`)
Creare uno script snello (es. `npm run worktree:list` e `npm run worktree:clean`) per:
- Visualizzare con chiarezza tutti i worktree aperti sul PC (`Telegram Assistent`, `chromium_video`, ecc.) con il loro stato di merge.
- Chiedere a Red quali desidera mantenere e quali eliminare in sicurezza.

### Passo 5: Verifica Finale
Eseguire `node scratch/security-audit.mjs` e confermare che il workspace principale `D:\WEB SITE Antigravity\flowerpowervillage` sia 100% pulito, allineato su `staging` e pronto per lo sviluppo.

---

## 💬 Messaggio Pronto da Incollare nella Nuova Chat:

```text
Ciao! Ho concluso la sessione precedente e voglio impostare la governance definitiva dei worktree e completare l'allineamento.
Leggi il file HANDOFF_WORKTREE_GOVERNANCE.md presente nella root del progetto ed esegui i 5 passi descritti nella checklist.
```
