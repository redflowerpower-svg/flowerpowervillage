# Definitions
- **/pizze**: Indica che lavoreremo nel reparto stagno dedicato alla delivery food e alla pizzeria a Ranong (codice sorgente in `/src/pizza` e `/api` relativi alla pizzeria).
- **/villaggio**: Indica che lavoreremo nel reparto stagno dedicato al booking engine e al villaggio a Koh Phayam (codice sorgente in `/src/booking` e `/api` relativi alle prenotazioni e alloggi).
- **/docs** o **/reader**: Indica che lavoreremo nel reparto stagno dedicato al **Web Reader & Documenti** (codice sorgente in `/src/lib/documentExtractor.ts`, `/src/lib/documentStore.ts`, `/src/admin/components/DocumentReaderStudio.tsx`, `/src/pages/DocumentReaderPage.tsx` e `/api/_handlers/documents-api.ts`, `/api/_handlers/reader.ts`).
- **/social**: Indica che lavoreremo nel reparto dedicato al **Social Media Studio & Publisher** (Facebook, Instagram Stories/Feed/Reels, TikTok) per Pizzeria Ranong e Villaggio Koh Phayam, con interfaccia live raggiungibile all'URL dedicato `/social`.


---

# 🛡️ REGOLA FONDAMENTALE E BASILARE IMPRESCINDIBILE: REPARTO STAGNO "WEB READER & DOCUMENTI"
Questo reparto **Web Reader & Documenti** è **TASSATIVAMENTE E TOTALMENTE INDIPENDENTE DA TUTTO IL RESTO DEL SITO**:
1. **Zero Contaminazione del Codice**: Qualunque modifica, cambiamento, nuova funzionalità, refactoring, gestione file (PDF, Excel, Word, OCR, estensioni future) deve essere programmata in modo 100% autonomo e confinato al proprio reparto, senza MAI intaccare o dipendere dal codice del Villaggio (`/villaggio`) o della Pizzeria (`/pizze`).
2. **Database & Storage Indipendenti**: Le tabelle (`stored_documents`, `document_pages`), le funzioni API e i bucket di Storage Supabase (`documents`) dedicati a questo reparto sono completamente separati. È vietato creare chiavi esterne, relazioni incrociate o dipendenze con tabelle di prenotazioni, clienti o ordini.
3. **Isolamento dell'Infrastruttura**: Il funzionamento della macchina del Web Reader (token a 256-bit, visualizzazione HTML, scadenza temporizzata, estrazione testo) vive come entità a sé stante e non deve mai risentire o influenzare lo stato degli altri due reparti.

# 🛡️ REGOLA FONDAMENTALE E BASILARE IMPRESCINDIBILE: REPARTO STAGNO "SOCIAL MEDIA STUDIO & PUBLISHER" (/social)
Anche questo reparto **Social Media Studio & Publisher** è **TASSATIVAMENTE E TOTALMENTE STAGNO E INDIPENDENTE DA TUTTO IL RESTO DEL SISTEMA**:
1. **Zero Contaminazione del Codice**: L'intero codice sorgente risiede confinato nella propria directory dedicata `/src/social/` e nei relativi endpoint dedicati (es. `/api/_handlers/social-publisher.ts`, `/social`). Non deve MAI intaccare, importare o modificare le logiche core, i componenti e lo stato dei reparti già operativi (Pizzeria `/pizza`, Tavoli `/dining`, Cucina `/kitchen`, Villaggio `/village` o Documenti `/read`).
2. **Database & Storage Indipendenti**: Le tabelle dedicate (`social_scheduled_posts`, `social_logs`, ecc.) e i bucket dedicati di storage sono totalmente isolati. Non hanno vincoli di integrità o foreign key con ordini o prenotazioni, prevenendo qualsiasi blocco o effetto collaterale a catena.
3. **Isolamento dei Processi & Zero Downtime**: Chiamate verso le API esterne (Meta Graph API, Instagram Container, TikTok API), eventuali timeout o rate-limit non devono MAI impattare le prestazioni della cassa, la ricezione degli ordini della pizzeria o la disponibilità delle stanze del villaggio.
4. **Sicurezza & Zero Leak**: Token e credenziali dei social rimangono protetti nella cassaforte (`.secret_docs`) e nei file `.env`, garantendo sempre zero secret leak nel codice tracciato da Git.
5. **Checklist Blindatura Post-Approvazione TikTok**: Non appena l'applicazione riceve l'approvazione definitiva da TikTok for Developers e viene pianificato il rilascio in produzione (`MARKDOWN-WEBSITE`), l'agente DEVE categoricamente ricordare e procedere alla **blindatura totale di tutte le aree staff**:
   - Rimuovere il bypass temporaneo di revisione in `SocialAdminAuth.tsx` per rendere `/social` 100% protetto da password anche sul dominio di produzione.
   - Verificare che tutte le console interne (`/social`, `/kitchen`, `/dining`, `/admin`) siano protette dal Single Sign-On unificato Supabase, senza alcuna rotta staff esposta liberamente al pubblico.
6. **Master Blueprint & Roadmap Permanente**: Tutte le specifiche architetturali, la strategia multimediale per TikTok/Reels/Caroselli, il biculturalismo (Thai/Italiano/Inglese), il marketing per festività, la sinergia AI (DeepSeek + Google Gemini Vision), lo storage scalabile (Google Drive 5TB + Supabase Indice) e la roadmap del Social Media Studio sono tassativamente codificate nel documento permanente `documentation_reports/14_social_media_studio_master_plan.md` e `documentation_reports/15_semantic_text_and_motion_engine.md`.
7. **Regola Pan & Scan Alloggi Villaggio (Website Assets)**:
   - Per tutte le foto del villaggio provenienti dal website (alloggi, camere, bungalow), i movimenti di camera ammessi sono **TASSATIVAMENTE ED ESCLUSIVAMENTE 4**:
     1. ↔️ Sinistra verso Destra (`pan_left_to_right`)
     2. ↔️ Destra verso Sinistra (`pan_right_to_left`)
     3. ↗️ Angolo Inferiore Sinistro verso Angolo Superiore Destro (`diagonal_up_right`)
     4. ↖️ Angolo Inferiore Destro verso Angolo Superiore Sinistro (`diagonal_up_left`)
   - **Partenza Differenziata per Alloggio (Zero Ripetitività All'Avvio)**: Ogni singolo alloggio possiede la propria traiettoria iniziale assegnata in modo univoco (Villa Penthouse: Pan SX➔DX | Red Bungalow: Pan DX➔SX | Yellow Bungalow: Diagonale Basso-SX➔Alto-DX, ecc.) per non iniziare mai tutti con lo stesso movimento.
   - **DIVIETO ASSOLUTO**: Mai nessun tilt verticale o punch-in/zoom centrale per non tagliare fuori parti della stanza o dell'alloggio su canvas 9:16.
   - **Eccezione Telegram/Cloud**: Se in futuro foto e clip verranno caricate direttamente tramite Telegram nel cloud (`source: 'telegram_cloud'`), la regola non si applicherà e saranno disponibili tutte le traiettorie.
8. **Regola Esclusione Categorica Beverage (Bibite, Acqua, Vini e Birre)**: Per tutti i reel, video e montaggi social della Pizzeria (`P1`, `P2`, `P3`, AutoCut e Calendario editoriale), è **SEVERAMENTE E TASSATIVAMENTE VIETATO** selezionare immagini da categorie di bevande (Soft Drinks & Water, Beers, Wines, Coffee Shop, Fruit Drinks). Devono essere estratti **SEMPRE E SOLO PIATTI CULINARI REALI** (Pizze Tradizionali Italiane, Paste Artigianali, Primi e Secondi Piatti, Insalate Italiane, Focacce Farcite, Burger e Dessert).
9. **Regola Esclusione Categorica Bagni / Toilet & Integrità Stesso Alloggio V2 (Villaggio Koh Phayam)**:
   - **Zero Bagni / Toilet**: A livello globale per tutti i reel, video, anteprime e montaggi social del Villaggio (`V1`, `V2`, `V3`, AutoCut e Calendario editoriale), è **SEVERAMENTE E CATEGORICAMENTE VIETATO** mostrare foto di bagni, sanitari o toilet (`Toilet.jpg`, `Toilet2.jpg`, `Bathroom`, `washroom`, ecc.). Devono essere estratte ed esposte **SEMPRE E SOLO** facciate esterne nel verde, giardini tropicali, verande con amaca, terrazze panoramiche, zone living e maestose camere da letto con letto King Size.
   - **Integrità Stesso Alloggio V2**: Nel formato $V_2$, le 5 foto selezionate devono appartenere **TASSATIVAMENTE ED ESCLUSIVAMENTE ALLO STESSO IDENTICO ALLOGGIO** (ad es. tutte e 5 della Villa Penthouse, oppure tutte e 5 del Red Bungalow, oppure tutte e 5 della Jungle Villa), senza mai mescolare foto di alloggi diversi nella stessa sequenza $V_2$.
10. **Regola Identità Ufficiale Pizza: Autentica Pizza Tradizionale Italiana (Divieto Assoluto Dicitura "Napoletana")**:
    - La pizza di Flower Power Pizza a Ranong **NON È la pizza napoletana**: è **TASSATIVAMENTE ED ESCLUSIVAMENTE AUTENTICA PIZZA TRADIZIONALE ITALIANA** (in inglese: *Authentic Traditional Italian Pizza*).
    - È **SEVERAMENTE E CATEGORICAMENTE VIETATO** apporre la dicitura "napoletana", "verace napoletana" o simili nei claim del logo, nelle outro video, nei post social, nei banner o nelle descrizioni dell'applicazione.
11. **Regola Immodificabile LM1 (Stories Last Minute — Solo Alloggi Liberi con Prezzi a Cascata Reali dal Calendario)**:
    - Nel formato `LM1` (Stories Last Minute di Koh Phayam), il sistema DEVE SEMPRE, IMPRESCINDIBILMENTE E CATEGORICAMENTE:
      1. **Verificare la Disponibilità Reale**: Interrogare il calendario di Flower Power Village (`/api/octorate-grid` per la data odierna) e mostrare **SOLO ED ESCLUSIVAMENTE GLI ALLOGGI CHE RISULTANO APERTI E LIBERI OGGI** (`availability > 0`, `bookable: true`, `stopSells: false`). È severamente vietato mostrare alloggi occupati o fare selezioni casuali da liste statiche.
      2. **Prezzi Veri con Sconti a Cascata**: Il prezzo esposto nel video e nel badge deve essere **TASSATIVAMENTE IL PREZZO FINALE SCONTATO A CASCATA ATTIVO SUL CALENDARIO** (es. `711 THB` per Green Bungalow, `387 THB` per Camel Tent e Lagoon Tent), MAI prezzi base generici o inventati.
      3. **Integrità Immagini Alloggi**: Includere nella mappatura tutti i 18 alloggi del resort con le loro cartelle Supabase reali, rispettando rigorosamente il divieto categorico di mostrare foto di bagni/toilette (Regola 9).
12. **Regola Esclusione Categorica Piatti Esauriti Kitchen Monitor (Zero Sold Out / 86)**:
    - Per tutti i reel, video e montaggi social della Pizzeria e Ristorante (`P1`, `P2`, `P3`, `R1`, AutoCut e Calendario editoriale), è **SEVERAMENTE E TASSATIVAMENTE VIETATO** selezionare piatti contrassegnati come esauriti (`is_available === false` o `sold out` / `86`) nel Kitchen Monitor.
    - Il sistema DEVE verificare in tempo reale gli overrides di disponibilità della cucina (`pizza_menu_overrides.json`) e selezionare **SEMPRE E SOLO PIATTI CULINARI ATTIVAMENTE DISPONIBILI E ORDINABILI OGGI**. Se un piatto è impostato su Sold Out nel Kitchen Monitor (es. `tiramisu`, `cake-of-the-day`, ecc.), viene escluso all'istante dalla rotazione video.
13. **Regola Immodificabile Titoli Piatti Pizzeria (P1, P2, P3, DS, R1) — Gerarchia Bilingue (Thai Sopra, Inglese Sotto) & A Capo Semantico Naturale**:
    - **Gerarchia Bilingue Rigorosa (Zero Italiano)**: Tutti i titoli e i testi della pizzeria nei video social (`P1`, `P2`, `P3`, `DS`) devono essere **TASSATIVAMENTE PRIMA IN THAILANDESE (grande in alto, ambra `text-amber-300`) E POI IN INGLESE (sotto in bianco `text-white/95`)**. È categoricamente vietato l'uso dell'italiano nei banner o nei titoli di questi format.
    - **A Capo Semantico Naturale (Divieto Assoluto Tagli Arbitrari o Parole Orfane)**: Se un titolo deve andare a capo (lunghezza o connettori), DEVE essere spezzato esclusivamente in un punto a senso logico:
      1. *Inglese*: Tagliare tassativamente prima dei connettori culinari (`WITH `, `& `, `AND `, `ALLA `, `ALLO `, `AL `, `CON `, o prima della parentesi `(`) evitando parole orfane isolate a fine riga (es. `HOMEMADE RAVIOLI` a capo `WITH LIGURIAN WALNUT SAUCE`).
      2. *Tailandese*: Tagliare tassativamente al confine tra la base del piatto e il condimento prima dei connettori semantici Thai (`ซอส` es. salsa/crema, `สไตล์` es. stile, `พร้อม` es. servito con, `และ`, `กับ` o prima della parentesi `(`) evitando categoricamente di troncare sillabe o parole a metà (es. `ราวิโอลีโฮมเมด` a capo `ซอสครีมวอลนัทสไตล์ลิกูเรีย`).
14. **Regola Immodificabile Thumbnail Ufficiale Pre-Dissolvenza (Massimo Zoom Senza Fade / Zero Ghosting Seconda Immagine in Tutti i Montaggi Video)**:
    - Per TUTTI i montaggi e formati video del Social Media Studio (Pizzeria `P1/P2/P3/DS`, Ristorante `R1`, Villaggio `V1/V2/V3/LM1`, AutoCut e reel social), il fotogramma di copertina (thumbnail ufficiale da visualizzare prima dell'avvio nel player e da esportare per TikTok, Instagram, Facebook e Google) DEVE corrispondere **TASSATIVAMENTE AL PRIMO ELEMENTO IN VETRINA (HERO)**.
    - **Timing Immodificabile Pre-Fade**: Il fotogramma deve essere estratto **TASSATIVAMENTE UN ATTIMO PRIMA DELL'INIZIO DEL FADE VERSO LA SECONDA SCENA** (`thumbnailTimestamp = transitionThreshold - 0.05s`, ovvero prima di `scene1Dur - effectiveDissolve`).
    - **DIVIETO CATEGORICO E ASSOLUTO**: È severamente e categoricamente vietato estrarre la thumbnail quando la dissolvenza è già iniziata (`elapsed >= transitionThreshold`), azzerando al 100% qualsiasi effetto fantasma, doppia esposizione, dissolvenza parziale o velo opaco della seconda immagine sovrapposta alla copertina.
    - La thumbnail deve catturare la prima scena al massimo culmine del suo movimento cinematografico: centratura orizzontale perfetta (`panX = 0`) e massimo zoom macro sul soggetto con nitidezza cristallina assoluta e seconda scena rigorosamente a 0 opacità.
15. **Regola Immodificabile Nomi Piatti/Alloggi nei Post Social (Zero A Capo / Locuzione Unica Continua)**:
    - Nel testo dei post social (didascalie, caption, schede descrittive di TikTok, Instagram, Facebook e Google), il nome del piatto o dell'alloggio **NON DEVE MAI ANDARE A CAPO**: è **TASSATIVAMENTE UNA LOCUZIONE UNICA CONTINUA SU SINGOLA RIGA**.
    - Anche se nel player video 9:16 il titolo viene formattato su due righe per ragioni cinematiche (Regola 13), quando viene passato e renderizzato nei post (`autoCutCopywriterEngine.ts`, `AutoCutPostCopywriter.tsx`, prompt DeepSeek AI) deve essere ripulito da qualsiasi interruzione di riga (`\n`, `\r`) ed espresso come un'unica stringa fluida (es. `HOMEMADE RAVIOLI WITH LIGURIAN WALNUT SAUCE` e `ราวิโอลีโฮมเมด ซอสครีมวอลนัทสไตล์ลิกูเรีย`).
16. **Regola Immodificabile Posizione Hashtag nei Post Social (Solo Alla Fine, Mai Tra Una Traduzione e l'Altra)**:
    - Nel testo dei post social (caption TikTok, Instagram, Facebook e Gruppo Koh Phayam su Telegram, anche nel blocco `<pre>` copiabile) gli hashtag NON DEVONO MAI comparire tra il blocco Thai e il blocco Inglese.
    - Devono essere raccolti in **UN UNICO BLOCCO FINALE** (hashtag Thai + hashtag Inglesi), posto **DOPO** testo bilingue, link/Google Maps e tag (`@flowerpowerpizzaranong` ecc.).
    - Ordine caption: `Testo bilingue → Link/Maps → @tag → #hashtag`.
    - I testi generati da DeepSeek NON devono contenere hashtag; il sistema (`autoCutCopywriterEngine.ts`, `AutoCutPostCopywriter.tsx`) li aggiunge in coda e rimuove eventuali hashtag inline residui.
17. **Regola Immodificabile Bandiera Lingua & Emoji nel Testo dei Post Social**:
    - Ogni blocco di lingua nei post social (TikTok, Instagram, Facebook, Gruppo Koh Phayam su Telegram) DEVE iniziare con la propria bandiera **prima della prima lettera**: 🇹🇭 per il blocco Thai, 🇬🇧 per il blocco Inglese.
    - Il sistema (`ensureLangFlag` in `autoCutCopywriterEngine.ts`, `AutoCutPostCopywriter.tsx`) garantisce la bandiera corretta anche sui testi generati da DeepSeek, e i prompt di DeepSeek richiedono bandiera ed emoji contestuali.
18. **Regola Immodificabile Divieto Assoluto Forno a Legna (Wood-Fired Oven / เตาฟืน / Holzofen / Aroma di Legna)**:
    - **NON ABBIAMO IL FORNO A LEGNA**: Flower Power Pizza a Ranong e Flower Power Restaurant a Koh Phayam **NON DISPONGONO DI FORNO A LEGNA**.
    - È **SEVERAMENTE, CATEGORICAMENTE E TASSATIVAMENTE VIETATO** usare o menzionare le parole "forno a legna", "wood-fired", "wood-fired oven", "wood oven", "wood crust", "เตาฟืน", "Holzofen", "aroma di legna" o qualsiasi allusione alla legna nei prompt di DeepSeek AI, nei post social (TikTok, Instagram, Facebook, Telegram), nelle didascalie, nei titoli, nei banner, nei video, nelle email o nei template.
    - La pizza è **TASSATIVAMENTE ED ESCLUSIVAMENTE AUTENTICA PIZZA TRADIZIONALE ITALIANA** cotta su pietra refrattaria ad alta temperatura / forno professionale per pizza tradizionale con impasto a lievitazione naturale 48 ore e farina italiana.
    - Il sistema applica sanitizzatori regex sia in `social-publisher.ts` sia in `autoCutCopywriterEngine.ts` che eliminano automaticamente qualsiasi residuo di "wood-fired" o "เตาฟืน" a monte e a valle.
19. **Regola Immodificabile Distribuzione Dinamica delle Emoji nel Testo (Divieto Assoluto Emoji Raggruppate a Fine Frase)**:
    - **DIVIETO CATEGORICO E ASSOLUTO**: È severamente vietato piazzare 3 o 4 emoji tutte raggruppate insieme alla fine della frase o del paragrafo (es. `...delizioso! 🍕🔥🤤`).
    - Le emoji devono essere **TASSATIVAMENTE DISTRIBUITE IN MODO DINAMICO, CONTESTUALE E NATURALE NEL FLUSSO DEL DISCORSO**, accompagnando le singole parole per ammorbidire e rendere viva e accogliente la lettura (es. "impasto a lievitazione lenta 🍕 fragrante e dorato", "fior di latte 🧀 filante", "consegna rapida a casa tua 🛵💨", "serata fresca 🌿", "relax vista mare 🌊", "natura tropicale 🌴").
    - I prompt di DeepSeek richiedono esplicitamente la collocazione delle emoji contestualmente alle singole parole.
20. **Regola Immodificabile Header Brand Universale (Logo +20%, FLOWER POWER a Campata Piena con Auto-Fit Dimensione Font e Spaziatura Naturale)**:
    - **Logo Ufficiale (+20%)**: In tutti i formati video (`P1`, `P2`, `P3`, `DS`, `R1`, `LM1`, `V1`, `V2`, `V3`), il logo circolare di Flower Power a sinistra ha diametro ingrandito del +20%: $90\text{px}$ in anteprima DOM (`w-[90px] h-[90px]`) e $91 \times s$ su Canvas (`logoSize = 91 * s`, $\approx 164\text{px}$ su 720p).
    - **FLOWER POWER a Campata Piena con Spaziatura Naturale**:
      - Dal punto di inizio del testo a destra del logo ($tx$) fino all'estremo margine destro dello schermo, la scritta `FLOWER POWER` deve occupare **TASSATIVAMENTE TUTTA LA LARGHEZZA UTILE A DISPOSIZIONE**, con la fine della stanghetta della lettera "R" che tocca perfettamente il margine destro.
      - **DIVIETO ASSOLUTO DI TRACKING / LETTER-SPACING ARTIFICIALE**: È categoricamente vietato allargare o dilatare lo spazio tra le singole lettere. La spaziatura tra i caratteri deve rimanere rigorosamente **standard, uniforme e naturale** (`tracking-normal`, font *Outfit 900 Black*).
      - **Auto-Fit Matematico della Dimensione Font**: La campata totale si ottiene scalando proporzionalmente la sola dimensione del font ($fontSize = fontSizeBase \times (availableWidth / measuredNaturalWidth)$), sia nell'anteprima DOM ($26.5\text{px}$–$27.5\text{px}$) sia su Canvas a qualsiasi risoluzione ($\sim 52\text{px}$ su 720p).
    - **Sottotitolo Village / Pizza & Elementi Header Ribilanciati a Cascata**:
      - La scritta `Village` e `Pizza` è ingrandita proporzionalmente da $16\text{px}$ a $18.5\text{px}$–$20\text{px}$ in corsivo elegante (*Outfit italic*).
      - In `P1`, `P2`, `P3`: le scritte `Ranong Delivery` ($17\text{px}$/$20 \times s$), Thai `ส่งถึงบ้าน` ($19\text{px}$/$23 \times s$), `flowerpowerpizza.com` ($14.5\text{px}$/$16 \times s$) e `Link in Bio` ($14.5\text{px}$/$15 \times s$) sono **ingrandite del +20% mantenendo la stessa distanza da Pizza** (`pt-1` / `ty += 10 * s`).
      - In `DS`: `LIVE SHOWCASE` ($14.5\text{px}$/$14.5 \times s$), Thai ($19\text{px}$/$23 \times s$) e `FAST DELIVERY` ($14.5\text{px}$/$16.5 \times s$) sono **ingranditi del +20% mantenendo la stessa distanza da Pizza** (`pt-1.5` / `ty += 10 * s`).
      - In `V1`, `V2`, `V3` (e `LM1`): `DIRECT BOOKING` ($18.5\text{px}$–$21\text{px}$/$20 \times s$), `flowerpowervillage.com` ($14.5\text{px}$/$16 \times s$) e `Link in Bio` ($14.5\text{px}$/$15 \times s$) sono **ingranditi del +20% allontanandosi di 2 pixel netti dalla parola Village** (`pt-1.5 mt-0.5` / `ty += 12 * s`).
      - In `R1`: `DELIVERY` rosso lampeggiante passa a $21.5\text{px}$ ($22 \times s$), `เดลิเวอรี่` a $17\text{px}$ ($17 \times s$), numero WhatsApp a $16.5\text{px}$ ($16 \times s$) e `Koh Phayam` a $15\text{px}$ ($14.5 \times s$).
      - La sfumatura superiore scura (Top Vignette Fade) si estende a $240\text{px}$ (`h-60`) in DOM e $260 \times s$ su Canvas per garantire contrasto e leggibilità impeccabile.
21. **Regola Immodificabile Anti-Spreco Token & Persistenza al Refresh e al Cambio Scheda (Zero Rigenerazione Automatica)**:
    - **DIVIETO CATEGORICO DI CHIAMATE AI AUTOMATICHE**: È severamente e categoricamente vietato invocare automaticamente API di Intelligenza Artificiale (DeepSeek, Gemini, OpenAI) al caricamento iniziale della pagina, al refresh (F5) o quando l'utente si sposta tra i formati (`P1`, `P2`, `P3`, `DS`, `V1`, `V2`, `V3`, `R1`, `LM1`).
    - **Persistenza Totale dello Stato Utente in `localStorage`**:
      1. L'ultima modalità video attiva (`activeMode`), l'ultimo montaggio generato a schermo (`currentTest`) e i video in memoria per ciascun formato (`testsByMode`) sono persistiti in `localStorage`.
      2. Al riavvio della pagina o al cambio tra i formati, il sistema ripristina fedelmente l'esatta elaborazione precedente a 0ms: non rimescola i piatti, non estrae nuove scene e non altera il testo.
      3. I testi generati con DeepSeek AI per ciascun piatto o alloggio sono salvati in `localStorage` associati alla firma identificativa univoca del video (`autocut_ai_copy_${testRunSignature}`). Se un formato non ha ancora un testo AI generato, mostra il copy bilingue locale deterministico senza mai invocare le API esterne.
    - **Rigenerazione Solo su Richiesta Esplicita**: La generazione di un nuovo montaggio video o di un nuovo testo DeepSeek AI avviene **SOLO ED ESCLUSIVAMENTE**:
      1. Su click manuale dell'utente sul rispettivo pulsante dedicato ("Genera Nuovo Video" o "Rigenera Copy AI").
      2. Dalla programmazione editoriale automatica (cron / publisher pianificato) quando ne ha esplicitamente bisogno.
22. **Regola Immodificabile Standard Device di Riferimento: Xiaomi Mi Pad 4 (Tablet Ufficiale in Verticale)**:
    - **Device di Riferimento Ufficiale**: Xiaomi Mi Pad 4 / Mi Pad 4 Plus (schermo 16:10, risoluzione fisica 1920x1200, MIUI Android DPR 2.0x/2.25x/2.75x).
    - **Larghezza Viewport Logica CSS (Verticale / Portrait)**: Compresa tra $533\text{px}$ e $600\text{px}$ (simulata a $584\text{px}$) in base al DPR (2.0x o 2.25x). Tutti gli smartphone sul mercato (iPhone, Samsung Galaxy, Pixel) hanno invece una larghezza logica compresa tra $360\text{px}$ e $430\text{px}$ MAX.
    - **Soglia di Demarcazione Matematica Inviolabile (460px)**:
      1. La linea di demarcazione tra smartphone e tablet è fissata a **460px** (nello spazio vuoto di 100px tra i 430px del cellulare più largo e i 533px dello Xiaomi Mi Pad 4).
      2. **Sotto i 460px (Smartphone)**: Tassativamente **2 colonne di prodotti** e **selettore categorie a scorrimento orizzontale compatto (1 riga)**.
      3. **Dai 460px in su (Xiaomi Mi Pad 4 e tutti i Tablet)**: Tassativamente **3 colonne di prodotti** e **menu statico su 2 righe fisse** (`category-tabs-desktop` con altezza $88\text{px}$, icona $28\text{px}$ `w-7 h-7` e font $9\text{px}$–$10\text{px}$).
    - **Integrità Totale Interfaccia Tablet**: Qualsiasi futuro sviluppo di modali, carrello, banner, schede o flussi d'ordine DEVE essere progettato e collaudato rispettando le proporzioni di questo standard device tablet in verticale.
23. **Regola Immodificabile Protocollo di Comunicazione Umana & Diario di Bordo Live (Soluzione 1)**:
    - **Banner di Testata Obbligatorio in Ogni Messaggio**: Ogni singolo messaggio e risposta dell'agente verso l'utente DEVE aprirsi TASSATIVAMENTE con un callout banner visivo sintetico e strutturato in 3 punti chiari:
      1. 🔨 *Cosa è stato fatto*: sintesi immediata dell'azione eseguita.
      2. 📱 *Cosa cambia nella realtà*: impatto visibile su tablet sala, cellulari clienti o cassa, spiegato in italiano semplice e comprensibile.
      3. 🚀 *Prossimo passo*: cosa sta per essere fatto subito dopo.
    - **Diario di Bordo Live Permanente (`DIARIO_DI_BORDO.md`)**:
      1. Tutte le operazioni completate, le migliorie e le modifiche strutturali DEVONO essere registrate e accumulate cronologicamente sia nel file di workspace `DIARIO_DI_BORDO.md` sia nell'Artifact IDE dedicato.
      2. **DIVIETO ASSOLUTO DI CANCELLAZIONE**: È severamente vietato sovrascrivere o eliminare lo storico pregresso; ogni sessione accumula i propri traguardi formando una cronistoria indelebile a disposizione dell'utente e di tutti gli agenti.
      3. I file di notifica o log risiedono all'interno dell'IDE; è CATEGORICAMENTE VIETATO inserire widget, tabelle o pop-up di notifica nell'interfaccia pubblica del sito o sul tablet dei clienti (`/dining`).
      4. **Scheda Sempre Aperta & In Primo Piano**: L'agente garantisce che `DIARIO_DI_BORDO.md` sia sempre attivo, aperto e richiamato in primo piano all'interno dell'IDE come bacheca visiva principale per l'utente ad ogni aggiornamento.
    - **Linguaggio 100% Umano & Zero Gergo Macchina**:
      1. Spiegare ogni passaggio con parole chiare e concrete (es. "Abbiamo impostato 3 colonne per riga sulle pizze così sul tablet Xiaomi non serve più scorrere a destra e a sinistra", NON "Modificato CSS grid-template-columns inline style refactor").
      2. Zero dump di codice o stack trace nei report discorsivi per non appesantire la lettura.
    - **Divieto Assoluto Browser Subagent Automatico (Regola Salva-Token)**:
      1. È severamente e categoricamente vietato invocare `browser_subagent` per effettuare screenshot o controlli visivi automatici senza l'ordine esplicito dell'utente.
      2. Le verifiche di correttezza si effettuano tramite analisi statica, TypeScript (`npx tsc --noEmit`), test mirati Node.js in `scratch/` e log locali a 0 token extra.
    - **Esecuzione Continua & Zero Blocchi**:
      1. Nessun blocco di pianificazione (`RequestFeedback: false`), nessun tool di conferma interattiva (`ask_question`). Il flusso procede spedito senza interruzioni.
24. **Regola Immodificabile Divieto Assoluto Parola Sunset / Tramonto (Koh Phayam / Flower Power Village)**:
    - **IL NOSTRO VILLAGGIO NON VEDE IL TRAMONTO (ZERO SUNSET)**: Flower Power Village a Koh Phayam NON ha la vista sul tramonto.
    - È **SEVERAMENTE, CATEGORICAMENTE E TASSATIVAMENTE VIETATO** usare o menzionare le parole "sunset", "tramonto", "พระอาทิตย์ตก", "Golden Hour Sunset" o alludere al tramonto nei prompt di DeepSeek AI, nei post social (TikTok, Instagram, Facebook, Google Maps, Telegram), nelle didascalie, nei titoli video, nei banner o nei template per il villaggio e per tutti i suoi alloggi.
    - Per la **Villa Penthouse** in particolare, parlare TASSATIVAMENTE ed ESCLUSIVAMENTE di **"Breezy Suite"** / **suite ventilata** con grande terrazza panoramica fresca e arieggiata (`Panoramic Breezy Deck`).
    - Il sistema applica sanitizzatori regex a monte e a valle che convertono qualsiasi residuo di "sunset" in "breezy deck" / "tropical breezes".

# 🛡️ PROTOCOLLO DI AUTO-APPROVAZIONE SICURA (AUTONOMOUS EXECUTION & ZERO-DISRUPTION GUARDRAILS)
Il sistema opera in modalità di **esecuzione completamente autonoma, rapida e continua** (predefinita su tutte le richieste, e tassativa con `/goal`, `AUTOPILOT`, `procedi` o `In autonomia:`):

1. **DIVIETO ASSOLUTO DI PLANNING BLOCK**: L'agente NON deve MAI creare file di piano con `RequestFeedback: true`. È severamente vietato far comparire nella UI dell'IDE i pulsanti "Proceed" o "Submit".
2. **DIVIETO ASSOLUTO DI STRUMENTI INTERATTIVI**: L'agente NON deve MAI usare il tool `ask_question` né generare modali di conferma.
3. **ESECUZIONE DIRETTA CONTINUA**: L'agente deve procedere immediatamente con l'esecuzione reale (lettura/modifica codice, esecuzione script da terminale, diagnostica e correzioni), iterando autonomamente fino al raggiungimento dell'obiettivo.
4. **GESTIONE AUTONOMA DEI FILE (NESSUNA ATTESA DI "ACCEPT ALL")**:
   - **Zero Modifiche in Sospeso**: Non lasciare modifiche in sospeso o finestre di diff/revisione aperta in attesa che l'utente prema manualmente "Accept All".
   - **Consolidamento Diretto**: Applica e consolida le modifiche direttamente nei file sorgente, procedendo con il task fino al completamento.
   - **Verifica Autonoma**: Esegui tu stesso eventuali controlli di sintassi, lint o test di verifica (es. script mirati in `scratch/`, test Node.js o comandi di compilazione) in autonomia.
   - **Stop Solo su Blocco Critico**: Fermati e chiedi l'intervento dell'utente **SOLO ED ESCLUSIVAMENTE** se si verifica un errore bloccante per due volte consecutive (Error Loop Breaker) o se si rischia di violare i guardrail protetti.
5. **DIVIETO / MINIMIZZAZIONE DELL'USO DEL BROWSER TOOL (TOKEN SAVING RULE)**:
   - **Zero Spreco di Token**: Evita categoricamente di aprire o navigare tramite il browser integrato dell'agente (`browser_subagent`, Playwright, Puppeteer o visual DOM inspect), poiché scarica e ricarica interi DOM complessi consumando una quantità spropositata di token e rallentando il flusso.
   - **Vie Alternative Più Rapide & Leggere (Sempre Obbligatorie)**:
     * Esegui script diagnostici mirati in `scratch/` via Node.js o PowerShell nativo (usando `curl`, `fetch`, chiamate API dirette o analisi statica del file).
     * Leggi direttamente file locali, endpoint mockati o log del server.
     * Utilizza comandi da riga di comando o test da terminale anziché renderizzare pagine web nel browser subagent.
   - **Eccezione Categorica**: L'uso del browser subagent è consentito **SOLO ED ESCLUSIVAMENTE se espressamente richiesto dall'utente** o se è tecnicamente impossibile testare la funzionalità in qualsiasi altro modo.
6. **REPORT FINALE COMPATTO**: Solo a obiettivo raggiunto, produrre il resoconto finale chiaro, sintetico e puntuale.

### 🛡️ Guardrail Operativi Inviolabili (Safe at First)
1. **Terminal Restrictions (Divieto Comandi Distruttivi)**:
   - **DIVIETO ASSOLUTO** per comandi che distruggono lo storico o il codice:
     `git reset --hard`, `git clean -f`, `git push --force`, `rm -rf /`, `Remove-Item -Recurse -Force` su directory di progetto.
   - Qualsiasi cancellazione deve riguardare solo ed esclusivamente file isolati creati dall'agente stesso nella cartella `scratch/`.
2. **Environment & Credential Blindness (Zero Leak & Zero Sovrascrittura)**:
   - **DIVIETO ASSOLUTO** di cancellare, modificare o sovrascrivere file `.env`, `.env.local`, `.env.production` o la cassaforte `.secret_docs`.
   - **DIVIETO ASSOLUTO** di committare token, password o secret keys (Supabase, Stripe, Octorate, DeepSeek, Google, Ksher, Telegram) nel codice tracciato da Git.
3. **Vercel Hobby Cap & Serverless Structure (Max 12 Functions)**:
   - **DIVIETO CATEGORICO** di creare nuovi file `.ts`/`.js` direttamente dentro la root `/api/`.
   - Qualsiasi nuovo endpoint backend deve essere sviluppato come modulo all'interno di `/api/_handlers/` o agganciato tramite routing interno agli handler aggregati esistenti, per non violare mai il limite Vercel Hobby (max 12 serverless functions) e non far fallire il deploy.
4. **Scope & File Discipline (Chirurgia Mirata)**:
   - Modificare **esclusivamente i file strettamente necessari** per l'obiettivo corrente.
   - È severamente vietato riorganizzare directory, rinominare cartelle stabili o refattorizzare file non coinvolti nel task.
   - **Inviolabilità di `menuData.ts`**: divieto di rigenerare il catalogo da zero; ogni modifica a piatti o prezzi deve essere chirurgica.
   - **Sandbox Obbligatoria `scratch/`**: qualsiasi script node di utilità o diagnostica deve risiedere esclusivamente in `scratch/`.
5. **Error Loop Breaker (Massimo 2 Tentativi)**:
   - Se un comando da terminale, un test di build (`tsc`) o un'esecuzione fallisce per **DUE volte consecutive con lo stesso errore**, l'agente DEVE:
     1. Fermare immediatamente qualsiasi ulteriore tentativo automatico.
     2. Non tentare modifiche a raffica "alla cieca" che bruciano token e rischiano di degradare il codice.
     3. Formulare un'analisi diagnostica sintetica e chiedere istruzioni all'utente spiegando esattamente dove si è bloccato.
6. **Protezione Processi & Connessioni Esterne**:
   - **No Duplicate Dev Servers**: non lanciare ulteriori istanze di `vercel dev` o `npm run dev` se il server è già attivo in background.
   - **Octorate & Payment Safety**: nessun push live verso le OTA (Booking/Agoda) o chiamate a gateway di pagamento reali durante test di script, a meno che il comando dell'utente non richieda esplicitamente la sincronizzazione di produzione.
   - **PowerShell Native Syntax**: utilizzare sempre sintassi nativa compatibile con Windows PowerShell (`pwsh`).
   - **Token Economy**: massima parsimonia nell'invocazione di subagent e divieto di loop di polling o query ridondanti.

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
  - *Active External Services Checklist*: Supabase, Stripe, Telegram, Octorate, DeepSeek AI, Google Maps, Ksher Pay (Village Booking), Omise / Opn Payments (Pizza Delivery), Google Business Profile (Social Studio).

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
5. **Categorie, Sottosezioni & Intestazioni Gruppi Piatti (`src/pizza/components/CategoryTabs.tsx`, `src/pizza/data/subSectionsI18n.ts`)**:
   - Traduzione di tutte le 14 categorie con nomi formattati su 2 righe e relative descrizioni emozionali.
   - Traduzione DeepSeek tassativa in tutte le 9 lingue per **TUTTE le sottosezioni e gruppi interni di categoria**:
     * `DAILY_SPECIALS_SECTIONS` (Primi Piatti / Pasta Dishes, Pizze Gourmet, ecc. con titoli e descrizioni riassuntive dei piatti).
     * `PASTA_SAUCES` (Salsa al Pomodoro, Ragù alla Bolognese, Sugo allo Scoglio, ecc. con descrizioni di abbinamento).
     * `ITALIAN_SALADS_SECTIONS` e `SALAD_SUBFILTER_LABELS` (Insalate Italiane, Secondi Piatti Tradizionali, filtri Tutti/Insalate/Secondi).
     * `FOCACCIA_SANDWICH_SECTIONS` e `SANDWICH_SUBFILTER_LABELS` (Focacce Artigianali, Pizza Sandwiches, filtri).
     * `CATEGORY_DETAILS` (Titoli e descrizioni estese di tutte le 14 categorie in testata).
     * `WINE_FILTER_LABELS` e `WINE_TYPE_SECTIONS` (Filtri enoteca, badge, conteggi, tipologie vini).
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
1. **Prezzi Pieni Normali al Tavolo & Lead Gen Coupon 10% Delivery via Email**: Tutti i prodotti vengono ordinati e conteggiati a prezzo di listino pieno normale (nessuno sconto del 5% al tavolo). Nella parte alta è presente il banner promozionale (in tutte le 9 lingue certificate DeepSeek) che invita i clienti a inserire la propria email durante l'ordinazione per ricevere un coupon esclusivo del 10% di sconto sul primo ordine delivery da casa su `flowerpowerpizza.com`.
2. **Vini & Birre 100% Sbloccati**: Tutte le schede dei vini italiani ed esteri (sincronizzati da Supabase Cloud) e delle birre sono visibili e ordinabili al tavolo con filtri enoteca e calici/bottiglie.
3. **Carrello Drawer & Linguetta Flottante Laterale Destra (Zero Barre in Basso)**: Nel tablet l'accesso al carrello avviene **esclusivamente tramite la linguetta flottante destra (Edge-Hugger)** identica al sito ufficiale, eliminando completamente la barra flottante in basso per non ostacolare la visuale e lo scorrimento dei prodotti. Stesso `CartDrawer` completo con pairing consigliati.
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
1. **Aggiornamento Automatico Git**: Esegue preliminare `git pull` da origin per scaricare l'ultimo codice e il file cifrato aggiornato `.md.enc`.
2. **Decifratura Vault**: Esegui `node scratch/vault-sync.mjs decrypt` (usando `MASTER_VAULT_KEY`).
3. **Allineamento Ambiente**: Rigenera e allinea automaticamente i file `.env` e `.env.local` locali.
4. **Allineamento Dipendenze NPM**: Esegue la verifica automatica di tutte le librerie in `package.json` (`syncDependencies()`); se mancano pacchetti in `node_modules` (es. aggiunti dall'altra postazione), lancia automaticamente `npm install` per azzerare ogni rischio di import mancanti in Vite.
5. **Verifica Connessioni**: Esegui `node scratch/test-credentials-verification.mjs`.
6. **Check Sicurezza Git**: Esegui la verifica per confermare che `.secret_docs/api_credentials_report.md` e i file `.env` siano bloccati da `.gitignore`.
7. **Conferma Operatività**: Mostra un report chiaro dell'esito dei test e dell'allineamento.

---

### 2. `MARKDOWN-STAGING` / `MARKDOWN-STAGING-PIZZA` / `MARKDOWN-STAGING-VILLAGE` (Deploy Staging)
Quando l'utente pronuncia **`MARKDOWN-STAGING`** (o le varianti di reparto **`MARKDOWN-STAGING-PIZZA`** / **`MARKDOWN-STAGING-VILLAGE`**):
Esegue il deploy rapido e sicuro **ESCLUSIVAMENTE sul branch `staging` di Vercel (zero impatto sui clienti di produzione)**:
1. **Audit Sicurezza & Cifratura Silenziosa**:
   - Convalida zero secret leak (`node scratch/security-audit.mjs`).
   - Cifratura cassaforte (`node scratch/vault-sync.mjs encrypt`).
2. **Typecheck Istantaneo**:
   - Convalida zero errori TypeScript (`npx tsc --noEmit`).
3. **Push Diretto su Staging**:
   - Assicura di essere sul branch `staging` (`git checkout staging`).
   - `git add .`
   - `git commit -m "<messaggio_sintetico_con_tag_reparto>"`
   - `git push origin staging`
4. **Notifica**: Conferma in 1 riga che il deploy è stato inviato all'ambiente di **Staging Privato** (`staging.flowerpowerpizza.com`).

---

### 3. `MARKDOWN-WEBSITE` / `MARKDOWN-WEBSITE-PIZZA` / `MARKDOWN-WEBSITE-VILLAGE` (Deploy Produzione)
Quando l'utente pronuncia **`MARKDOWN-WEBSITE`** (o le varianti di reparto **`MARKDOWN-WEBSITE-PIZZA`** / **`MARKDOWN-WEBSITE-VILLAGE`**):
Esegue il rilascio definitivo direttamente sul branch di produzione `main` (`www.flowerpowerpizza.com` & `www.flowerpowervillage.com`):
1. **Audit Sicurezza & Typecheck**:
   - Convalida zero secret leak (`node scratch/security-audit.mjs`).
   - Convalida zero errori TypeScript (`npx tsc --noEmit`).
2. **Merge & Push su Produzione (`main`)**:
   - Commit delle modifiche su `staging`.
   - `git checkout main`
   - `git merge staging -m "Release: <descrizione_rilascio_con_tag_reparto>"`
   - `git push origin main` (Pubblica all'istante sui domini ufficiali).
   - Ritorno automatico su `staging` (`git checkout staging`) per mantenere l'ambiente di lavoro pulito.
3. **Notifica**: Conferma dell'avvenuto rilascio pubblico in produzione.

---

### 4. `MARKDOWN-PROJECT` (Master Workflow Completo: Documentazione + Gemini Report + Staging + Produzione)
Quando l'utente pronuncia la parola d'ordine **`MARKDOWN-PROJECT`**:
Esegue l'intero ciclo a 360 gradi a fine sessione o grande rilascio per entrambi i reparti:
1. **Fase 1 - Versioning & Documentazione Tecnica (Regola Progressiva `01_`, `02_`, ...)**:
   - **TASSATIVO PREFISSO PROGRESSIVO**: Tutti i documenti core in `/documentation_reports/` destinati a Gemini Notebook, GitHub o backup DEVONO iniziare rigorosamente con il prefisso numerico progressivo a due cifre (`01_`, `02_`, `03_`, ...). Questo garantisce un ordinamento naturale, immediato e coerente in qualsiasi interfaccia o importatore esterno.
   - Aggiornamento fisico dei file in `/documentation_reports/` e copie di sicurezza.
   - Cifratura cassaforte (`node scratch/vault-sync.mjs encrypt`).
   - Controllo zero secret leak (`node scratch/security-audit.mjs`).
   - Typecheck (`npx tsc --noEmit`).
2. **Fase 2 - Deploy Simultaneo (Staging + Produzione)**:
   - Commit delle modifiche sul branch `staging`.
   - `git push origin staging` (Aggiorna all'istante `staging.flowerpowerpizza.com`).
   - `git checkout main`
   - `git merge staging -m "Release: <descrizione_rilascio>"`
   - `git push origin main` (Pubblica all'istante su `www.flowerpowerpizza.com` e `www.flowerpowervillage.com`).
   - Ritorno automatico su `staging` (`git checkout staging`).
3. **Fase 3 - Report Handoff a 5 Punti per Gemini Notebook**:
   - Emissione del report compatto per il taccuino Gemini e conferma dell'allineamento globale.

---

### 5. `MARKDOWN-WAIT` (Freeze Social Studio TikTok Review + Deploy Completo di Tutto il Resto)
Quando l'utente pronuncia la parola d'ordine **`MARKDOWN-WAIT`**:
Esegue l'intero workflow di **`MARKDOWN-PROJECT`** (documentazione tecnica, cifratura vault, audit di sicurezza, typecheck, sincronizzazione staging e deploy simultaneo su produzione `main`) per tutti i reparti (Pizzeria, Delivery, Ristorante, Villaggio Koh Phayam, Octorate, Booking Engine, Documenti e Kitchen Monitor), garantendo il **CONGELAMENTO CATEGORICO DEL SOCIAL ONLINE**:
1. **Blindatura Social in Produzione**: Il routing in `src/social/pages/SocialStudioPage.tsx` garantisce tassativamente che sul dominio ufficiale `https://www.flowerpowerpizza.com/social` rimanga attiva ed esposta **SOLO ED ESCLUSIVAMENTE la versione primordiale `TikTokAuditStudioPage.tsx`** sottoposta a revisione per le API TikTok for Developers (con TikTok Sandbox, demo assets e bottoni di simulazione identici al video inviato).
2. **Libertà Totale di Sviluppo in Locale**: In locale (`localhost:5173/social`), lo sviluppatore continua a progettare e affinare la versione ultramoderna `AutoCutStudioPage.tsx` (tutti i formati video, Ken Burns, meteo Ranong e copywriter DeepSeek con il *Proverbio del Giorno*) senza che questa sovrascriva mai la versione online per gli auditor.
3. **Controllo di Sicurezza Pre-Merge**: Prima di qualsiasi merge/push su `main`, il comando verifica che `SocialStudioPage.tsx` contenga il discriminatore d'ambiente attivo, impedendo ogni rilascio accidentale del nuovo codice social su `flowerpowerpizza.com/social` fino alla notifica ufficiale di approvazione da TikTok.



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
