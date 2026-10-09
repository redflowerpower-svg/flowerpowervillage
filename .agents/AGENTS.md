# Definitions
- **/pizze**: Indica che lavoreremo nel reparto stagno dedicato alla delivery food e alla pizzeria a Ranong (codice sorgente in `/src/pizza` e `/api` relativi alla pizzeria).
- **/villaggio**: Indica che lavoreremo nel reparto stagno dedicato al booking engine e al villaggio a Koh Phayam (codice sorgente in `/src/booking` e `/api` relativi alle prenotazioni e alloggi).
- **/docs** o **/reader**: Indica che lavoreremo nel reparto stagno dedicato al **Web Reader & Documenti** (codice sorgente in `/src/lib/documentExtractor.ts`, `/src/lib/documentStore.ts`, `/src/admin/components/DocumentReaderStudio.tsx`, `/src/pages/DocumentReaderPage.tsx` e `/api/_handlers/documents-api.ts`, `/api/_handlers/reader.ts`).

---

# 🛡️ REGOLA FONDAMENTALE E BASILARE IMPRESCINDIBILE: REPARTO STAGNO "WEB READER & DOCUMENTI"
Questo reparto **Web Reader & Documenti** è **TASSATIVAMENTE E TOTALMENTE INDIPENDENTE DA TUTTO IL RESTO DEL SITO**:
1. **Zero Contaminazione del Codice**: Qualunque modifica, cambiamento, nuova funzionalità, refactoring, gestione file (PDF, Excel, Word, OCR, estensioni future) deve essere programmata in modo 100% autonomo e confinato al proprio reparto, senza MAI intaccare o dipendere dal codice del Villaggio (`/villaggio`) o della Pizzeria (`/pizze`).
2. **Database & Storage Indipendenti**: Le tabelle (`stored_documents`, `document_pages`), le funzioni API e i bucket di Storage Supabase (`documents`) dedicati a questo reparto sono completamente separati. È vietato creare chiavi esterne, relazioni incrociate o dipendenze con tabelle di prenotazioni, clienti o ordini.
3. **Isolamento dell'Infrastruttura**: Il funzionamento della macchina del Web Reader (token a 256-bit, visualizzazione HTML, scadenza temporizzata, estrazione testo) vive come entità a sé stante e non deve mai risentire o influenzare lo stato degli altri due reparti.

# Autonomous Execution & Research Protocol (`/goal`, `AUTOPILOT`, `In autonomia`)
Quando l'utente attiva una richiesta usando il comando `/goal`, la parola chiave `AUTOPILOT` o il prefisso `In autonomia:`:
1. **DIVIETO ASSOLUTO DI PLANNING BLOCK**: L'agente NON deve MAI creare file di piano con `RequestFeedback: true`. È severamente vietato far comparire nella UI dell'IDE i pulsanti "Proceed" o "Submit".
2. **DIVIETO ASSOLUTO DI STRUMENTI INTERATTIVI**: L'agente NON deve MAI usare il tool `ask_question` né generare modali di conferma.
3. **ESECUZIONE DIRETTA CONTINUA**: L'agente deve procedere immediatamente con l'esecuzione reale (lettura/modifica codice, esecuzione script da terminale, diagnostica e correzioni), iterando autonomamente fino al raggiungimento dell'obiettivo.
4. **REPORT FINALE COMPATTO**: Solo a obiettivo raggiunto, produrre il resoconto finale chiaro e sintetico.

---

# ⚠️ NUOVA REGOLA D'ORO API OCTORATE

1. **PREZZI**: Le variazioni di prezzo devono colpire sempre e solo l'ID della Tariffa Madre (Livello 0). Octorate calcola lo sconto automaticamente a cascata su tutte le tariffe derivate.
2. **RESTRIZIONI (Stop Sell, CA, CD, MinStay)**: È consentito scrivere le restrizioni direttamente sulle tariffe derivate (Livello 1 e 2) in cui l'ereditarietà è disattivata (es. R1 7d), e questo verrà specificato di volta in volta.
3. **POLITICHE DI CANCELLAZIONE (`7d` e `14d`)**: Le sigle `7d` e `14d` indicano **TASSATIVAMENTE I GIORNI DELLA FINESTRA DI CANCELLAZIONE GRATUITA CON RIMBORSO TOTALE 100%**:
   - **`7d`**: Rimborso 100% se cancellato entro 7 giorni prima del check-in; trattenuta del 100% nei 7 giorni precedenti.
   - **`14d`**: Rimborso 100% se cancellato entro 14 giorni prima del check-in; trattenuta del 100% nei 14 giorni precedenti.
   - NON si riferiscono alla durata del soggiorno, ma alla finestra di rimborso caparra/importo.
4. **TARIFFA OFF NELLA DASHBOARD = STOP SELL CATEGORICO SU TUTTE LE OTA (IMPLICITO & INTRINSECO)**:
   - Ogni volta che un piano tariffario o tariffa (es. `AC7d`, `AC14d`, `AC bnb-7d`, `AC bnb-14d`, `AirBnB AC`) risulta impostato su `OFF` (disattivato/spento) nella dashboard, il sistema DEVE garantire tassativamente che sui server Octorate e su tutte le OTA collegate (Booking.com, Agoda, Expedia, Airbnb) lo stato sia **`stopSells: true, closed: true`** per l'intera stagione su tutti i 18 alloggi (tutti i 212 ID di prodotto). L'azione di disattivazione effettua sempre e categoricamente un push reale immediato su Octorate API.

---

# Supabase Storage & Vercel API Limits
- Due to Vercel Hobby plan limits, we cannot add more than 12 serverless functions. To perform custom database or storage tasks (like bulk deletes), temporarily inject a query parameter action hook (e.g. \?action=cleanup\) into an existing API route like \	elegram-notify.ts\, trigger it once, and then revert the file.

# Supabase Data API Permissions (Nuove Tabelle & Migrazioni SQL)
A partire dal 30 Ottobre, Supabase non assegna più automaticamente i permessi di accesso Data API (supabase-js / PostgREST) alle nuove tabelle create nello schema `public`.
Ogni volta che si crea una nuova tabella o si genera uno script/migrazione SQL nello schema `public`, aggiungere **SEMPRE TASSATIVAMENTE** in coda allo script le clausole di `GRANT` esplicite:
```sql
-- Permessi per utenti anonimi (se applicabile)
GRANT SELECT ON public.NOME_TABELLA TO anon;

-- Permessi per utenti autenticati (Admin / Staff)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.NOME_TABELLA TO authenticated;

-- Permessi per chiamate serverless backend
GRANT SELECT, INSERT, UPDATE, DELETE ON public.NOME_TABELLA TO service_role;
```
*(Nota: Oltre ai GRANT della Data API, le policy RLS rimangono obbligatorie per regolare l'accesso a livello di riga).*


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
- **Monthly Scheduler Inclusion**: Once documented, this new service must be automatically appended to the checklist of the monthly scheduler for updates, deprecations, and changelog verification:
  - *Active External Services Checklist*: Supabase, Stripe, Telegram, Octorate, DeepSeek AI, Google Maps, Ksher Pay (Village Booking), Omise / Opn Payments (Pizza Delivery).

# Pizzeria / Delivery Food Design Rules
- **Product Name Line Breaking (Double Line Layout)**: Per tutti i prodotti del reparto delivery food (`/pizza`), i nomi dei prodotti che contengono connettori logici devono essere mandati a capo per visualizzarsi sempre su due righe. La logica di formattazione a capo (`formatProductName` nei componenti React) deve dividere il nome prima dei seguenti connettori:
  - ` CON ` (in tutte le lingue)
  - ` & ` (in tutte le lingue, specialmente per le patatine fritte)
  - ` WITH ` (in inglese)
  - ` พร้อม` (in tailandese)
- **Ereditarietà Automatica Personalizzazioni di Categoria (Extras)**: Quando una nuova scheda prodotto viene creata o assegnata a una categoria (es. Pizza Tradizionale, Pasta, Focaccia Sandwich, Dolci, Snack), essa DEVE ereditare automaticamente tutte le personalizzazioni e opzioni extra identiche a quelle standard della categoria di appartenenza (es. Pizza Extras, Pasta Extras, salse e ingredienti aggiuntivi). Questo garantisce coerenza e uniformità totale tra tutti i piatti del catalogo.

# 🖋️ REGOLA D'ORO TIPOGRAFIA, ESTETICA DELLA SCRITTURA & TONO EDITORIALE (SCHELETRO DEL SISTEMA)
Tutti i testi dell'applicazione, descrizioni, titoli, etichette, banner, modali e pulsanti devono rispettare un'estetica visiva e una cura tipografica/giornalistica di altissimo livello:
1. **Due Punti (`:`) & A Capo Strutturato**: Quando un'etichetta o introduzione contiene i due punti (`:`), il valore o la descrizione successiva deve essere gestita con a capo pulito o separazione strutturata, evitando che il testo si spezzi in posizioni sgraziate.
2. **Parentesi & Specifiche Protette (`(...)`)**: Le parentesi (es. percentuali `(10%)`, città `(Ranong)`, prezzi `(+30฿)`, note) non devono MAI trovarsi orfane o spezzate da sole all'inizio della riga successiva. Devono essere protette con `whitespace-nowrap`, `&nbsp;` o mandate a capo insieme alla loro locuzione logica.
3. **Zero Orfani / Vedove Tipografiche**: I titoli e i testi in evidenza devono utilizzare bilanciamento del testo (`text-balance` / `text-pretty` o interruzioni mirate) per non lasciare mai una singola parola isolata a fine riga.
4. **Tono Giornalistico ed Esperienziale di Prestigio**: Il registro comunicativo deve essere fluido, coinvolgente, autorevole e curato nei minimi dettagli stilistici in tutte le 4 lingue (`IT`, `EN`, `TH`, `DE`).



# 🌐 REGOLA IMPRESCINDIBILE TRADUZIONI (DEEPSEEK AI NATIVO)
All'interno di TUTTO il sito web (sia nel reparto Pizzeria / Delivery `/pizze` che nel reparto Booking Engine / Village `/villaggio`), ogni qualvolta sia richiesta o implementata una funzionalità di traduzione testi, titoli, descrizioni, servizi, menu o alloggi:
- **OBBLIGO ASSOLUTO DI UTILIZZO API DEEPSEEK**: È tassativo e imprescindibile utilizzare sempre e solo l'API di DeepSeek (`deepseek-chat` / `DEEPSEEK_API_KEY`) tramite endpoint backend dedicato o tool CLI.
- **MICRO-COPY & TRADUZIONI ON-DEMAND (`scratch/deepseek-translate.mjs`)**: Anche per singole frasi, banner, modali, pulsanti, pop-up o etichette UI in qualsiasi lingua (`IT`, `EN`, `TH`, `DE`, `MM`, `FR`, `RU`, ecc.), l'agente ha il **DIVIETO ASSOLUTO DI GENERARE TESTI A MEMORIA**: DEVE interrogare live le API di DeepSeek eseguendo `node scratch/deepseek-translate.mjs --text="..." --to=[LINGUA]` e applicare il testo certificato restituito dall'API.
- È severamente vietato l'uso di traduttori statici o dizionari empirici hardcoded: le traduzioni devono essere vive, contestuali, fluide e professionali in tutte le lingue supportate (`IT`, `EN`, `TH`, `DE`, `MM`), garantendo il massimo livello qualitativo.

# 🌍 PROTOCOLLO UNIVERSALE: `[LINGUA] FULL TRANSLATION` / `[LINGUA] TRADUZIONE TOTALE`
Quando l'utente inserisce il comando `[LINGUA] FULL TRANSLATION` oppure `[LINGUA] TRADUZIONE TOTALE` (ad es. `FRANCESE FULL TRANSLATION`, `RUSSO FULL TRANSLATION`, `CINESE FULL TRANSLATION`, `TEDESCO FULL TRANSLATION`, `SPAGNOLO FULL TRANSLATION`), l'agente DEVE eseguire in autonomia e senza dimenticanze la **Pipeline Multilingua Radicale Certificata con DeepSeek AI** coprendo la totalità delle seguenti aree:

1. **Configurazione Lingua (`src/pizza/config/languages.ts`)**: Registrazione codice ISO/Alpha-2, etichette, bandiera, nome nativo e font dedicato (es. font Cinese, Birmano, Thai).
2. **Backend & Studi AI DeepSeek (`api/_handlers/dish-translate.ts`, `dishTranslatorEngine.ts`, `wineTranslatorEngine.ts`, `DishCardStudio.tsx`, `WineCardStudio.tsx`)**: Inserimento della nuova lingua nei prompt e schemi JSON di DeepSeek AI, con tab di anteprima/modifica live negli studi admin.
3. **Catalogo Piatti Completo (`src/pizza/data/menuData.ts`)**: Traduzione DeepSeek di tutti i ~150 piatti (titoli `nameX`, descrizioni `descriptionX`, varianti taglia, ingredienti ed extra) e aggiornamento helper `MenuGrid.tsx` (`getTranslatedName`, `getTranslatedDesc`, `formatProductName`).
4. **Hero Banner & Banner Privilegio Vini (`src/pizza/pages/DeliveryMenu.tsx`)**:
   - Tutte le 3 Card Top Hero (Prenota un Tavolo / Sconto 10% Dine-in, Sconto 10% Benvenuto 1° Ordine, Consegna Rapida & Asporto).
   - Banner Privilegio Vini & Conformità Legale Alcolici (Badge, Titolo, Avviso legale PDPA/Thailandia e pulsante Prenota Tavolo).
5. **Categorie & Slider Orizzontale (`src/pizza/components/CategoryTabs.tsx`)**: Traduzione di tutte le 14 categorie con nomi formattati su 2 righe e relative descrizioni emozionali.
6. **Badge & Watermark Dietetici (`src/pizza/components/DietaryWatermark.tsx`, `src/pizza/utils/dietary.ts`, `DeliveryMenu.tsx`, `DiningTabletSite.tsx`)**: Traduzione barra filtri (`Tutti`, `Veggie`, `Vegan`) e watermark sovraimpressi sulle immagini dei piatti (`VEGAN`, `VEGGIE`, `100% Pollo Halal-friendly`, `No Maiale`).
7. **Personalizzazioni Piatti, Extra & Opzioni (`src/pizza/components/ProductModal.tsx`, `MenuGrid.tsx`)**:
   - Grado di piccantezza (`spicy-no` -> `spicy-very`: Non piccante, Poco piccante, Medio piccante, Molto piccante).
   - Livello di dolcezza/zucchero (`sugar-no` -> `sugar-high`: Senza zucchero, Poco dolce, Normale, Molto dolce).
   - Selezione frutti per frullati e bevande (Cocco fresco, Mango, Banana, Ananas, ecc.).
   - Scelta salse e condimenti (Maionese, Ketchup, BBQ, Salsa piccante artigianale, ecc.).
   - Tutti gli ingredienti Extra del catalogo (Mozzarella fior di latte, Burrata, Gorgonzola, Salumi, Verdure, Impasti speciali, ecc.).
   - Intestazioni di gruppo varianti (`getVariantHeaderLabel`, `getGroupedExtras`).
8. **Enoteca, Birre & Vini (`src/pizza/data/wineData.tsx`, `wineTranslatorEngine.ts`)**: Traduzione di tutti i vini, vitigni, paesi d'origine in `WINE_COUNTRY_OPTIONS`, tipologie in `WINE_TYPE_OPTIONS`, note di degustazione e abbinamenti.
9. **Carrello & Esperienza Abbinamenti Consigliati (`src/pizza/components/CartDrawer.tsx`)**:
   - Tutti i 19 piatti consigliati nel rituale di pairing (Patatine Crispy, Focacce, Dolci, Bibite, Acqua).
   - Breakdown dello sconto (Primo ordine 10% o Tavolo 5%), countdown consegna gratuita, selettori gusto/formato, tasto checkout e continua a ordinare.
10. **Checkout Flow, Mappa & Pagamenti (`src/pizza/components/CheckoutFlow.tsx`)**:
    - Banner *"10% First Order Welcome Discount"* con spiegazione condizioni.
    - Avviso e spiegazione box termico asporto Takeaway.
    - Tasti flottanti e istruzioni mappa ("Portalo qui (Conferma Posizione)", "Tocca la mappa", "Espandi/Riduci", "Trova la mia posizione").
    - Istruzioni K-Shop Kasikorn Bank (4 passaggi) e messaggi polling live QR Omise.
11. **Dizionario Globale (`src/pizza/data/i18n.ts`)**: Traduzione di tutte le 165 sezioni (header, navbar, orari, footer, contatti, informative e disclaimer legali/PDPA).
12. **Esperienza Dining Tablet al Tavolo (`src/pizza/pages/DiningTabletSite.tsx`, `DiningCheckoutModal.tsx`, `TableSettlementModal.tsx`)**: Pop-up introductory al tavolo (-5% sconto), PIN staff, lead generation coupon 10%, checkout tavolo e chiusura conto.
13. **Collaudo Tecnico & Zero Errori**: Esecuzione `npx tsc --noEmit` per garantire zero errori di compilazione TypeScript.

# 🛡️ REGOLA D'ORO SVILUPPO LOCALE & REGOLE AMBIENTI (LOCALE / VIRTUALE / PRODUZIONE)
1. **LAVORO ORDINARIO 100% LOCALE (ZERO GIT PUSH SPONTANEO)**:
   - Durante le normali sessioni di sviluppo e correzione bug, l'agente lavora **ESCLUSIVAMENTE SUL CODICE LOCALE** (`http://localhost:3000`).
   - È **SEVERAMENTE VIETATO** eseguire `git push` o pubblicazioni su GitHub/Vercel di propria iniziativa senza che l'utente abbia espressamente digitato la parola d'ordine `MARKDOWN-PROJECT` o `MARKDOWN-WEBSITE`.
2. **SCONTO 10% PRIMO ORDINE (BYPASS IN LOCALE & VIRTUALE)**:
   - In ambiente **Locale (`localhost`)** e **Virtuale / Staging**, il controllo hardware/telefono/email è **TOTALMENTE BYPASSATO (`eligible: true`)**: lo sconto del 10% è sempre concesso e visibile a schermo per permettere lo sviluppo, la preview e il test continuo.
   - Il controllo anti-abuso reale (3 fattori: Telefono, Email, Device ID + GPS Haversine 50m con eccezione Hotel/Resort) viene applicato **SOLO ED ESCLUSIVAMENTE** quando si naviga sul dominio ufficiale di produzione (`www.flowerpowerpizza.com`) attivato via `MARKDOWN-WEBSITE`.
3. **BANNER ANTEPRIMA / ISPEZIONE GATEWAY (`previewNotice`)**:
   - Gli avvisi di cantiere, conformità payment gateway e sandbox compaiono **SOLO sul dominio ufficiale di produzione**, MAI in locale o nel virtuale.

# 📱 REGOLA D'ORO DINING TABLET AL TAVOLO (`/dining`, `/dining-tablet`, `/tavoli`)
La modalità **Dining Tablet** è il modulo dedicato all'ordinazione autonoma direttamente al tavolo del ristorante:
1. **Sconto Fisso al Tavolo (-5%)**: Tutti i prodotti mostrano il prezzo normale barrato (`<del>price ฿</del>`) e il prezzo scontato del 5% in evidenza con badge verde `-5% SCONTO TAVOLO`. Nessun limite o soglia minima d'ordine. Lo sconto del 10% del primo ordine delivery NON compare mai nel tablet.
2. **Vini & Birre 100% Sbloccati**: Tutte le schede dei vini italiani ed esteri (sincronizzati da Supabase Cloud) e delle birre sono visibili e ordinabili al tavolo con filtri enoteca e calici/bottiglie.
3. **Carrello Drawer & Linguetta Flottante Laterale Destra (Zero Barre in Basso)**: Nel tablet l'accesso al carrello avviene **esclusivamente tramite la linguetta flottante destra (Edge-Hugger)** identica al sito ufficiale, eliminando completamente la barra flottante in basso per non ostacolare la visuale e lo scorrimento dei prodotti. Stesso `CartDrawer` completo con pairing consigliati e breakdown del 5% di sconto.
4. **Scelta Pagamento al Tavolo (3 Metodi)**:
   - 📱 **PromptPay K-Shop Kasikorn Bank (0% Commissioni)** con QR Code zoomabile tap-to-zoom.
   - 💳 **Carta di Credito / Bancomat (POS Portatile al Tavolo)** portato dal personale.
   - 💵 **Contanti al Tavolo (Cash)** pagati al cameriere.
5. **Sicurezza Accesso & Lead Gen**: Protetto all'avvio da login PIN/credenziali staff/admin (`DiningAdminAuth`). Raccoglie Nome/Tel/Email del cliente rilasciando un **Coupon Sconto del 10%** utilizzabile per futuri ordini da casa su `flowerpowerpizza.com`.
6. **Zero Modali di Prenotazione Tavolo nel Carrello**: Nel `CartDrawer` del tablet la sezione *"Esperienza al Ristorante / Desideri scoprire i nostri vini italiani?"* e la relativa modale di prenotazione tavolo sono **tassativamente nascoste**, poiché il cliente è già seduto al ristorante e sta già usufruendo del servizio.

# Vault-Sync & Multi-Workstation Protocol (Koh Phayam <-> Ranong)

## 🔒 REGOLA FERREA ANTI-SECRET LEAK & ZERO HARDCODED CREDENTIALS
- È **TASSATIVAMENTE E SEVERAMENTE VIETATO** inserire password, secret keys, token API, credenziali SMTP o chiavi private in chiaro all'interno di file sorgente (`.ts`, `.tsx`, `.js`, `.mjs`, `.html`, `.md`), né come costanti né come valori di fallback (`process.env.KEY || "valore_segreto"`).
- Tutte le credenziali DEVONO risiedere **esclusivamente** nei file `.env` locali (bloccati da Git) e nella cassaforte cifrata `.secret_docs/api_credentials_report.md.enc`.
- Prima di qualsiasi `git commit` o workflow `MARKDOWN-PROJECT` / `MARKDOWN-WEBSITE`, l'agente DEVE eseguire tassativamente `node scratch/security-audit.mjs` verificando che restituisca `0 SECRETS DETECTED`.

## Vault-Sync & Security (.gitignore)
- `scratch/vault-sync.mjs` gestisce la cifratura e la decifratura delle chiavi di progetto.
- Il report in chiaro `.secret_docs/api_credentials_report.md` DEVE rimanere strettamente bloccato da Git (`.secret_docs/*`).
- Solo il file cifrato `.secret_docs/api_credentials_report.md.enc` viene tracciato da Git (`!.secret_docs/api_credentials_report.md.enc`).
- I file d'ambiente in chiaro (`.env`, `.env.local`, `.env.*`) DEVONO rimanere strettamente ignorati da Git.

## Mandatory Trigger Words & Workflows (Architettura a 3 Stadi)

### 🏗️ Regola dei 3 Stadi di Sviluppo
1. **Stadio 1: Locale (`localhost:3000`)**: Sviluppo a caldo sulla postazione.
2. **Stadio 2: Staging / Virtuale Privato (`origin staging`)**: Sito online completo di test isolato sui server cloud Vercel, dove testare da smartphone in totale sicurezza senza toccare la produzione.
3. **Stadio 3: Produzione Ufficiale (`origin main` -> `www.flowerpowerpizza.com` / `www.flowerpowervillage.com`)**: Dominio pubblico ufficiale, aggiornato solo quando lo staging è perfetto al 100%.

---

### 1. `VAULT-SYNC` (Workflow Sincronizzazione Nuova Postazione)
Quando l'utente pronuncia la parola d'ordine **`VAULT-SYNC`** sulla postazione:
1. **Aggiornamento Automatico Git**: Esegue preliminarmente `git pull` da origin per scaricare l'ultimo codice e il file cifrato aggiornato `.md.enc`.
2. **Decifratura Vault**: Esegui `node scratch/vault-sync.mjs decrypt` (usando `MASTER_VAULT_KEY`).
3. **Allineamento Ambiente**: Rigenera e allinea automaticamente i file `.env` e `.env.local` locali.
4. **Verifica Connessioni**: Esegui `node scratch/test-credentials-verification.mjs`.
5. **Check Sicurezza Git**: Esegui la verifica per confermare che `.secret_docs/api_credentials_report.md` e i file `.env` siano bloccati da `.gitignore`.
6. **Conferma Operatività**: Mostra un report chiaro dell'esito dei test e dell'allineamento.

---

### 2. `FAST-PUSH` / `STAGING-PUSH` (Deploy Rapido su Ambiente di Test Segreto - Stadio 2)
Quando l'utente pronuncia la parola d'ordine **`FAST-PUSH`** o **`STAGING-PUSH`**:
Esegue un deploy rapido e sicuro **ESCLUSIVAMENTE sul branch `staging` di Vercel (zero impatto sui clienti di produzione)**:
1. **Audit Sicurezza & Cifratura Silenziosa**:
   - Convalida zero secret leak (`node scratch/security-audit.mjs`).
   - Cifratura cassaforte (`node scratch/vault-sync.mjs encrypt`).
2. **Typecheck Istantaneo**:
   - Convalida zero errori TypeScript (`npx tsc --noEmit`).
3. **Push Diretto su Staging**:
   - Assicura di essere sul branch `staging` (`git checkout staging`).
   - `git add .`
   - `git commit -m "<messaggio_sintetico>"`
   - `git push origin staging`
4. **Notifica**: Conferma in 1 riga che il deploy è stato inviato all'ambiente di **Staging Privato** per il collaudo su cellulare.

---

### 3. `MARKDOWN-PROJECT` (Pre-PUSH Workflow Documentale)
Quando l'utente pronuncia la parola d'ordine **`MARKDOWN-PROJECT`**:
1. **Analisi Modifiche**: Ispeziona i file modificati nella sessione corrente (`git status`).
2. **Aggiornamento FISICO Documentazione Tecnica & Allineamento Istruzioni**:
   - Sovrascrittura fisica dei file interessati in `/documentation_reports/`.
   - Copie di sicurezza: `cp .agents/AGENTS.md documentation_reports/AGENTS.md` e `cp .agentinstructions documentation_reports/agentinstructions.txt`.
3. **Cifratura Cassaforte**: Esegui `node scratch/vault-sync.mjs encrypt`.
4. **Commit & Push su Staging**: `git add .`, commit e push su `origin staging`.
5. **Notifica Gemini Notebook**: Elenco dei file aggiornati per il taccuino.

---

### 4. `MARKDOWN-WEBSITE` / `MARKDOWN-ALL` (Release Ufficiale su Produzione - Stadio 3)
Quando l'utente pronuncia la parola d'ordine **`MARKDOWN-WEBSITE`** oppure **`MARKDOWN-ALL`**:
Esegue il rilascio definitivo dal branch `staging` al branch di produzione `main` per i domini ufficiali (`www.flowerpowerpizza.com` & `www.flowerpowervillage.com`):
1. **Esecuzione Documentale & Vault**:
   - Aggiornamento fisico dei file in `/documentation_reports/` e copie di sicurezza.
   - Cifratura cassaforte (`node scratch/vault-sync.mjs encrypt`).
   - Controllo zero secret leak (`node scratch/security-audit.mjs`).
   - Typecheck (`npx tsc --noEmit`).
2. **Merge & Push su Produzione (`main`)**:
   - Commit delle modifiche su `staging`.
   - `git checkout main`
   - `git merge staging -m "Release: <descrizione_rilascio>"`
   - `git push origin main` (Pubblica all'istante su `www.flowerpowerpizza.com`)
   - Ritorno automatico su `staging` (`git checkout staging`) per mantenere l'ambiente di lavoro pulito.
3. **Report Handoff a 5 Punti & Notifica Notebook**:
   - Emissione del report per Gemini Notebook e conferma dell'avvenuto rilascio pubblico.


# Protocollo di Compressione e Frazionamento dei Report (Gemini-Friendly)
Per evitare che i report generati per l'utente superino i limiti di input di Gemini Notebook (impedendo l'invio del messaggio), l'agente DEVE seguire rigorosamente queste regole di formattazione:

1. **Massima Densità, Zero Log Inutili**: 
   - Non incollare MAI interi dump di log o file di testo kilometrici nella chat.
   - Sostituisci i log lunghi con tabelle di sintesi (come la tabella dei test API).
   - Mostra solo i "diff" (le linee di codice modificate) e non l'intero file corretto, a meno che non sia strettamente richiesto.

2. **Limite di Caratteri Rigido (Max 4000 caratteri per messaggio)**:
   - Ogni report finale o handoff non deve superare i 4000 caratteri (~600 parole).

3. **Frazionamento Automatico (Splitting)**:
   - Se un handoff (es. MARKDOWN-PROJECT) o una spiegazione tecnica supera inevitabilmente questo limite, l'agente DEVE dividerlo in blocchi numerati (es. "[Parte 1 di 3]", "[Parte 2 di 3]").
   - Alla fine di ogni parte, l'agente deve fermarsi e scrivere: 
     *«⚠️ Il report è troppo lungo per la tua casella di testo. Copia e invia questa prima parte, poi ti scriverò la Parte 2 nel prossimo turno appena rispondi 'continua'.»*
