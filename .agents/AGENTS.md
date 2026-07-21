# Definitions
- **/pizze**: Indica che lavoreremo nel reparto stagno dedicato alla delivery food e alla pizzeria a Ranong (codice sorgente in `/src/pizza` e `/api` relativi alla pizzeria).
- **/villaggio**: Indica che lavoreremo nel reparto stagno dedicato al booking engine e al villaggio a Koh Phayam (codice sorgente in `/src/booking` e `/api` relativi alle prenotazioni e alloggi).

# Supabase Storage & Vercel API Limits
- Due to Vercel Hobby plan limits, we cannot add more than 12 serverless functions. To perform custom database or storage tasks (like bulk deletes), temporarily inject a query parameter action hook (e.g. \?action=cleanup\) into an existing API route like \	elegram-notify.ts\, trigger it once, and then revert the file.


# Agent-Ready Web Development (Chrome DevTools 150 Guidelines)
To ensure the application is optimized for web agents (including Antigravity, search bots, and accessibility tools) and fully compatible with DevTools 150 debugging features:
- **Semantic HTML & ARIA Roles**: Use native semantic HTML elements (e.g., `<button>`, `<nav>`, `<main>`) for all structural and interactive elements. Avoid wrapping everything in generic `<div>` tags. Provide descriptive `aria-label` or `aria-describedby` tags to clarify interactive behaviors.
- **Unique & Stable IDs**: Ensure all interactive elements have unique, stable, and human-readable `id` attributes. Do not rely on dynamically generated hash classes (like CSS Modules) for script selectors.
- **Accessible Assets**: Avoid embedding important text inside images. Always provide high-quality `alt` descriptions for images to assist vision models and screen readers.
- **Responsive Layouts**: Utilize modern CSS `@container` queries instead of absolute positions or complex grid hacks, facilitating live styling and responsive overrides.
- **Clean Interactions**: Keep layouts simple and minimize nested pointer-events to prevent agents or testers from getting stuck on overlapping invisible layers.

# New Services Integration & Onboarding
- **New Services Integration & API Specs**: Whenever a new external service, SDK, API, or library is introduced to the project, the agent **MUST** first perform a comprehensive web search of its official documentation, endpoints, request/response formats, and security guidelines.
- **Local Documentation**: Before writing any implementation code, the agent must create a dedicated local reference file (e.g., `.agents/docs_servicename.md`) containing the service's base specifications.
- **Monthly Scheduler Inclusion**: Once documented, this new service must be automatically appended to the checklist of the monthly scheduler for updates, deprecations, and changelog verification.

# Pizzeria / Delivery Food Design Rules
- **Product Name Line Breaking (Double Line Layout)**: Per tutti i prodotti del reparto delivery food (`/pizza`), i nomi dei prodotti che contengono connettori logici devono essere mandati a capo per visualizzarsi sempre su due righe. La logica di formattazione a capo (`formatProductName` nei componenti React) deve dividere il nome prima dei seguenti connettori:
  - ` CON ` (in tutte le lingue)
  - ` & ` (in tutte le lingue, specialmente per le patatine fritte)
  - ` WITH ` (in inglese)
  - ` พร้อม` (in tailandese)


# Vault-Sync & Multi-Workstation Protocol (Koh Phayam <-> Ranong)

## Vault-Sync & Security (.gitignore)
- `scratch/vault-sync.mjs` gestisce la cifratura e la decifratura delle chiavi di progetto.
- Il report in chiaro `.secret_docs/api_credentials_report.md` DEVE rimanere strettamente bloccato da Git (`.secret_docs/*`).
- Solo il file cifrato `.secret_docs/api_credentials_report.md.enc` viene tracciato da Git (`!.secret_docs/api_credentials_report.md.enc`).
- I file d'ambiente in chiaro (`.env`, `.env.local`, `.env.*`) DEVONO rimanere strettamente ignorati da Git.

## Mandatory Trigger Words & Workflows

### 1. `VAULT-SYNC` (Post-PULL Workflow)
Quando l'utente pronuncia la parola d'ordine **`VAULT-SYNC`** (dopo un `git pull` sulla postazione):
1. **Decifratura Vault**: Esegui `node scratch/vault-sync.mjs decrypt` (usando `MASTER_VAULT_KEY`).
2. **Allineamento Ambiente**: Rigenera e allinea i file `.env` e `.env.local` locali.
3. **Verifica Connessioni**: Esegui `node scratch/test-credentials-verification.mjs` per confermare che Supabase, Stripe, Telegram, Octorate, Maps e SMTP siano connessi e operativi.
4. **Check Sicurezza Git**: Esegui la verifica per confermare che `.secret_docs/api_credentials_report.md` e i file `.env` siano bloccati da `.gitignore`.
5. **Conferma Operatività**: Mostra un report chiaro dell'esito dei test e dell'allineamento.

### 2. `MARKDOWN-PROJECT` (Pre-PUSH Workflow)
Quando l'utente pronuncia la parola d'ordine **`MARKDOWN-PROJECT`** (prima di un `git push` a fine sessione):
1. **Analisi Modifiche**: Ispeziona i file modificati nella sessione corrente (`git status`).
2. **Aggiornamento Documentazione Tecnica**: Aggiorna miratamente i file interessati in `/documentation_reports/`:
   - `architettura_core.md`
   - `modulo_pizza_delivery.md`
   - `modulo_village.md`
   - `integrazione_telegram.md`
   - `schema_database.md`
   - `motore_prezzi_sconti.md`
3. **Cifratura Cassaforte**: Esegui `node scratch/vault-sync.mjs encrypt` per aggiornare e cifrare `.secret_docs/api_credentials_report.md` nel file `.secret_docs/api_credentials_report.md.enc`.
4. **Report HANDOFF a 5 Punti per Gemini Notebook**: Genera il report finale strutturato:
   - **Punto 1: Riepilogo Modifiche Codice** (Elenco dei componenti e file sorgente modificati).
   - **Punto 2: Impatto sui Report Tecnici (`/documentation_reports/`)** (Quali file `.md` sono stati aggiornati).
   - **Punto 3: Stato della Cassaforte Credenziali (`.secret_docs/`)** (Esito cifratura `.md.enc`).
   - **Punto 4: Stato dei Test di Connessione e Sicurezza Git** (Esito check `test-credentials-verification.mjs` e `.gitignore`).
   - **Punto 5: Istruzioni per la Nuova Postazione (Koh Phayam / Ranong)** (Promemoria per `git pull` seguito da `VAULT-SYNC`).
