# 📖 DIARIO DI BORDO LIVE · FLOWER POWER SYSTEM
> **Status:** 🟢 ATTIVO & PERMANENTE  
> **Modalità:** Accumulo cronologico banner dopo banner (Zero auto-cancellazione, 100% gratuito, zero token extra).  
> *Questo documento rimane sempre aperto e consultabile all'interno dell'IDE per avere la traccia trasparente e sintetica di ogni singola operazione svolta.*

---

### 🟩 [25/10/2026 - ORE 15:15] · FUSIONE PERMANENTE 18 URL LEGACY SITO AGLI ALLOGGI & UX SCHEDA EVIDENZIATA CON SCROLL MORBIDO
- **Cosa abbiamo fatto:** Completata l'integrazione strutturale e definitiva dei 18 link legacy storici del vecchio sito (`52-jungle-villa`, `11-yellow-bungalow`, `22-villa-penthouse`, ecc.) fondendoli in modo permanente nel codice e nell'identità di ogni singolo alloggio:
  - 🔗 **Mappatura Canonica Immodificabile (`ACCOMMODATION_IDENTITIES`)**:
    - Creata in [accommodations.ts](file:///d:/01%20ANTIGRAVITY/flower-power-village-com/flowerpowervillage/src/booking/resort/config/accommodations.ts) la struttura di identità univoca per tutti i 18 alloggi del villaggio con: `name`, `canonicalSlug`, `legacySlug`, `legacyPath`, `directUrl` (`https://www.flowerpowervillage.com/52-jungle-villa`), alias storici e ID Octorate.
    - Funzione `findAccommodationIdentity(slugOrName)` capace di riconoscere all'istante qualunque variante (URL vecchio con trattino `52-jungle-villa`, cartella underscore `44_jungle_villa`, slug moderno o nome esteso).
  - 🌐 **Rotte Root e Redirect Intelligenti in [App.tsx](file:///d:/01%20ANTIGRAVITY/flower-power-village-com/flowerpowervillage/src/App.tsx)**:
    - Tutte le 18 URL storiche (es. `/52-jungle-villa`, `/11-yellow-bungalow`, `/22-villa-penthouse`, ecc.) mappate direttamente alla radice del router per reindirizzare a `/village?room=[legacySlug]`.
    - Garantita la compatibilità immediata con qualsiasi link pubblicitario, post passato o brochure che usa i vecchi link.
  - 🎯 **UX Alloggio Selezionato & Scroll Morbido al Posto Naturale in [RoomGrid.tsx](file:///d:/01%20ANTIGRAVITY/flower-power-village-com/flowerpowervillage/src/booking/resort/components/RoomGrid.tsx)**:
    - **Zero alterazione dell'ordine naturale del catalogo**: L'alloggio selezionato NON viene spostato in cima arbitrariamente, preservando l'ordine armonico e naturale delle categorie.
    - **Apertura automatica Zoom/Gallery**: L'accesso da link apre direttamente la modale gallery con foto reali.
    - **Scroll Morbido Centrato alla Chiusura**: Alla chiusura dello zoom (`closeGallery`), la pagina effettua uno scroll fluido e centra perfettamente sullo schermo la scheda dell'alloggio appena visualizzato.
    - **Bordo Dorato Luminoso & Badge "✨ ALLOGGIO SELEZIONATO"**: La scheda dell'alloggio scelto resta evidenziata con un elegante bordo ambra/oro pulsante (`border-2 border-amber-400 ring-4 ring-amber-400/25 shadow-[0_0_35px_rgba(245,158,11,0.35)]`) e un badge fluttuante bilingue (*✨ ALLOGGIO SELEZIONATO* / *✨ YOUR SELECTED ROOM* / *✨ ที่พักที่คุณเลือก*).
  - 📣 **Integrazione Social Studio & Didascalie Post**:
    - Aggiornati [autoCutLabEngine.ts](file:///d:/01%20ANTIGRAVITY/flower-power-village-com/flowerpowervillage/src/social/services/autoCutLabEngine.ts), [autoCutCopywriterEngine.ts](file:///d:/01%20ANTIGRAVITY/flower-power-village-com/flowerpowervillage/src/social/services/autoCutCopywriterEngine.ts) e [AutoCutPostCopywriter.tsx](file:///d:/01%20ANTIGRAVITY/flower-power-village-com/flowerpowervillage/src/social/components/AutoCutPostCopywriter.tsx).
    - Per tutti i video del Villaggio e Last Minute (`LM1`, `V1`, `V2`, `V3`), il link Instagram Stories Sticker, il link post Facebook e il copy multilingua contengono ora la URL specifica e diretta dell'alloggio in vetrina anziché il generico dominio home.
- **Effetto reale:** Chiunque clicchi su una delle vecchie URL o sui link diretti inviati nelle campagne Last Minute apre subito le foto dell'alloggio, e quando chiude la foto ritrova l'alloggio al suo posto nella lista evidenziato in oro e con il badge luccicante, pronto per essere prenotato al miglior prezzo.
- **Stato:** ✅ Compilato (0 errori TypeScript), testato sicuro (0 secrets) e consolidato su branch locale `staging`.

---

### 🟩 [25/10/2026 - ORE 14:50] · RISOLUZIONE DEFINITIVA CONFIGURAZIONE XIAOMI MI PAD 4 / PLUS (3 COLONNE IN VERTICALE & TABLET STATION BLINDATA)
- **Cosa abbiamo fatto:** Risolto alla radice il problema di configurazione dello standard tablet **Xiaomi Mi Pad 4 / Mi Pad 4 Plus** in orientamento verticale in [src/index.css](file:///d:/01%20ANTIGRAVITY/flower-power-village-com/flowerpowervillage/src/index.css) e [DiningTabletSite.tsx](file:///d:/01%20ANTIGRAVITY/flower-power-village-com/flowerpowervillage/src/pizza/pages/DiningTabletSite.tsx):
  - 📐 **Media Query Ibrida Intelligente su Aspect-Ratio**: Aggiunta la regola `@media (min-width: 460px), ((min-width: 380px) and (min-aspect-ratio: 58/100))`. I tablet (16:10 o 4:3, con aspect-ratio portrait $\ge 0.625$) vengono isolati con precisione matematica dai telefoni cellulari moderni (19.5:9 o 20:9, con aspect-ratio portrait $\le 0.46$). Anche se il display zoom di Android riduce i pixel CSS logici del Mi Pad 4 a 400px–436px, scattano sempre le 3 colonne.
  - 🛡️ **Override Hardware Diretto Modalità Sala (`data-dining-station="tablet"`)**: In `DiningTabletSite.tsx`, quando la pagina è usata come tablet di sala o postazione cameriere (`!isGuestMobile`), viene impostato l'attributo `data-dining-station="tablet"` con regole CSS dedicate che forzano imperativamente 3 colonne e il menu categorie fisso su 2 righe, esenti da qualsiasi variazione o zoom del browser.
  - 📱 **Zero Regressioni su Smartphone Clienti**: Tutti gli smartphone (iPhone, Samsung Galaxy, Xiaomi) che inquadrano il QR code dal tavolo (`isGuestMobile === true` e aspect-ratio $\le 0.46$) mantengono rigorosamente le **2 colonne di prodotti** e lo **slider orizzontale compatto a 1 riga**.
- **Effetto reale:** Lo Xiaomi Mi Pad 4 in verticale mostra ora sempre e stabilmente 3 prodotti per riga e le categorie fisse su 2 righe ordinate. I cellulari dei clienti mantengono l'impaginazione a 2 colonne.
- **Stato:** ✅ Compilato (0 errori TypeScript), testato sicuro (0 secrets) e consolidato su branch locale `staging`.

### 🟩 [25/10/2026 - ORE 14:35] · LAST MINUTE LM1: CATEGORIA SOLO INGLESE "AVAILABLE TONIGHT" (RIMOSSO THAI)
- **Cosa abbiamo fatto:** Su indicazione dell'utente, rimosso il testo Thai (`ว่างวันนี้`) dal badge di categoria del formato **LM1** (Stories Last Minute Villaggio) sia a livello di motore dati ([autoCutLabEngine.ts](file:///d:/01%20ANTIGRAVITY/flower-power-village-com/flowerpowervillage/src/social/services/autoCutLabEngine.ts)) sia in tutti i player DOM e Canvas ([AutoCutLabPlayer.tsx](file:///d:/01%20ANTIGRAVITY/flower-power-village-com/flowerpowervillage/src/social/components/AutoCutLabPlayer.tsx)):
  - 🇬🇧 **Badge Esclusivamente Inglese**: Mostra ora con chiarezza e brevità **`🔥 AVAILABLE TONIGHT`**, senza alcuna appendice in lingua Thai.
  - 🔄 **Filtro Istantaneo Retroattivo**: La pulizia agisce all'istante sia sul player verticale 9:16 sia sul nuovo player orizzontale 4:3 e sul rendering Canvas, anche per i video già caricati in memoria.
- **Effetto reale:** Il badge verde di disponibilità è più compatto, elegante e leggibile, comunicando subito al viaggiatore internazionale che l'alloggio è libero per la notte.
- **Stato:** ✅ Compilato (0 errori TypeScript), testato sicuro (0 secrets) e consolidato su branch locale `staging`.

### 🟩 [25/10/2026 - ORE 14:31] · LAST MINUTE LM1: PLAYER COMPANION 4:3 GOOGLE BUSINESS ATTIVATO CON PREZZO REALE
- **Cosa abbiamo fatto:** Integrato il lettore orizzontale companion **4:3 per Google Business & Facebook** anche per il formato **LM1** (Stories Last Minute Villaggio) in [AutoCutLabPlayer.tsx](file:///d:/01%20ANTIGRAVITY/flower-power-village-com/flowerpowervillage/src/social/components/AutoCutLabPlayer.tsx):
  - 🖥️ **Abilitato `mode === 'LM1'` in `isCompanionEligible`**: Ora sotto il player 9:16 compare automaticamente la versione orizzontale 4:3 ottimizzata per Google Maps.
  - 📐 **Impaginazione Perfetta 1:1 con P1 e V1**:
    - **In alto a sinistra**: Watermark ufficiale con logo a 60px, brand `FLOWER POWER Village` e claim `Direct Booking`.
    - **In basso a sinistra**: Badge categoria, nome alloggio (`text-[17.5px] sm:text-[20px]`), sottotitolo descrittivo e traduzione Thai.
    - **In basso a destra**: Cartellino del prezzo giallo con contorno nero solido e scritta bianca `Last Minute: [Prezzo] ฿` (es. `Last Minute: 711 ฿`), allineato a destra come in P1.
- **Effetto reale:** Nel formato Last Minute del Villaggio ora hai a disposizione sia la storia verticale 9:16 (per TikTok/Instagram/Reels) sia il video orizzontale 4:3 con zoom macro continuo per Google Maps e offerte speciali con scadenza a 5 giorni.
- **Stato:** ✅ Compilato (0 errori TypeScript), testato sicuro (0 secrets) e consolidato su branch locale `staging`.

### 🟩 [25/10/2026 - ORE 14:16] · REGOLA IMMODIFICABILE 24: DIVIETO ASSOLUTO "SUNSET" E VILLA PENTHOUSE "BREEZY SUITE"
- **Cosa abbiamo fatto:** Su indicazione geografica tassativa dell'utente (*il villaggio non vede il tramonto/sunset*), abbiamo bonificato l'intero sistema eliminando qualsiasi uso della parola "sunset", "tramonto" o "พระอาทิตย์ตก" per Flower Power Village:
  - 🌬️ **Villa Penthouse Rinominata "Breezy Suite"**:
    - Sottotitolo aggiornato a **"Breezy Suite"** (ventilata).
    - Descrizione inglese: *Panoramic Breezy Wooden Deck* (anziché Sunset Deck).
    - Descrizione Thai: *เพนต์เฮาส์วิลล่า ดาดฟ้าชมวิวรับลมธรรมชาติเกาะพยาม* (anziché พระอาทิตย์ตก).
    - Badge: **"BREEZY DECK"** (anziché Sunset Deck).
  - 🛡️ **Bonifica Totale del Codebase**: Aggiornati tutti i servizi e cataloghi del social studio ([autoCutLabEngine.ts](file:///d:/01%20ANTIGRAVITY/flower-power-village-com/flowerpowervillage/src/social/services/autoCutLabEngine.ts), [autoCutIntelligence.ts](file:///d:/01%20ANTIGRAVITY/flower-power-village-com/flowerpowervillage/src/social/services/autoCutIntelligence.ts), [visualMotionEngine.ts](file:///d:/01%20ANTIGRAVITY/flower-power-village-com/flowerpowervillage/src/social/services/visualMotionEngine.ts), [autoContentEngine.ts](file:///d:/01%20ANTIGRAVITY/flower-power-village-com/flowerpowervillage/src/social/services/autoContentEngine.ts) e [AutoCutLabPlayer.tsx](file:///d:/01%20ANTIGRAVITY/flower-power-village-com/flowerpowervillage/src/social/components/AutoCutLabPlayer.tsx)).
  - 🤖 **Blindatura Prompt & Sanitizzatore DeepSeek AI**: Inserita in [social-publisher.ts](file:///d:/01%20ANTIGRAVITY/flower-power-village-com/flowerpowervillage/api/_handlers/social-publisher.ts) la regola categorica di divieto per DeepSeek e il filtro regex `scrubSunset` che neutralizza all'istante qualsiasi menzione residua di tramonto trasformandola in brezza tropicale.
  - 📜 **Codificata la Regola Immodificabile 24** in [.agents/AGENTS.md](file:///d:/01%20ANTIGRAVITY/flower-power-village-com/flowerpowervillage/.agents/AGENTS.md).
- **Effetto reale:** Nessun post, video, didascalia o anteprima del Villaggio parlerà mai più di sunset o tramonto; per la Villa Penthouse viene valorizzata la sua vera caratteristica: una suite fresca, sopraelevata e ventilata con terrazza panoramica arieggiata.
- **Stato:** ✅ Compilato (0 errori TypeScript), testato sicuro (0 secrets) e consolidato su branch locale `staging`.


### 🟩 [25/10/2026 - ORE 14:10] · LAST MINUTE LM1: PREZZO PULITO "LAST MINUTE" (ZERO "TODAY") & HEADER ALTO DISTANZIATO (+6PX DA VILLAGE)
- **Cosa abbiamo fatto:** Perfezionati due dettagli chiave nel formato **LM1** (Stories Last Minute Villaggio) sia su Canvas sia nel DOM ([AutoCutLabPlayer.tsx](file:///d:/01%20ANTIGRAVITY/flower-power-village-com/flowerpowervillage/src/social/components/AutoCutLabPlayer.tsx) e [autoCutLabEngine.ts](file:///d:/01%20ANTIGRAVITY/flower-power-village-com/flowerpowervillage/src/social/services/autoCutLabEngine.ts)):
  - 🏷️ **Prezzo in Basso Pulito**: Rimossa la parola "Today" dall'etichetta del prezzo: ora mostra esclusivamente `Last Minute: 711 ฿` (solo last minute e prezzo, come richiesto). Il filtro applicato pulisce all'istante anche le sessioni già in memoria.
  - 📏 **Header Alto Distanziato (+6px da Village)**: Allontanato di 6 pixel netti l'intero blocco informativo (badge Last Minute, Thai `ห้องว่างวันนี้`, Direct Booking e sito web) dalla parola *Village* (`pt-[10px]` nel DOM e `ty += 6 * s` su Canvas).
- **Effetto reale:** Nel formato LM1 la scritta in basso è più sintetica, pulita e diretta, e in alto il blocco Last Minute e le prenotazioni non soffocano più il logo/brand Village, donando al video pieno respiro.
- **Stato:** ✅ Compilato (0 errori TypeScript), testato sicuro (0 secrets) e consolidato su branch locale `staging`.

### 🟩 [25/10/2026 - ORE 14:05] · VILLAGGIO (V1, V2, V3, LM1): CATEGORIA, TITOLO BUNGALOW E SOTTOTITOLO GIALLO INGRANDITI DEL +20%
- **Cosa abbiamo fatto:** Potenziata la gerarchia visiva per gli alloggi di Koh Phayam nei formati `V1`, `V2`, `V3` e `LM1` sia nel DOM sia su Canvas ([AutoCutLabPlayer.tsx](file:///d:/01%20ANTIGRAVITY/flower-power-village-com/flowerpowervillage/src/social/components/AutoCutLabPlayer.tsx)):
  - 🌿 **Badge Categoria (+20%)**: Da 11px a **13px** (`text-[13px]`) nel DOM con padding maggiorato `px-3 py-0.5`, e da 13.5 a **16.2*s** su Canvas.
  - 🛖 **Nome Bungalow in Inglese (+20%)**: Da 18px/20px a **21.5px/24px** (`text-[21.5px] sm:text-[24px]`) nel DOM, e da 23 a **27.6*s** su Canvas.
  - ☀️ **Sottotitolo Giallo Descrittivo (+20%)**: Da 14px/15.5px a **17px/18.5px** (`text-[17px] sm:text-[18.5px]`) nel DOM, e da 15.6 a **18.7*s** su Canvas.
  - 📐 **Safe Zone e Passo Verticale Ribilanciati**: Passo interlinea ricalibrato su Canvas per ospitare armoniosamente i testi più grandi, mantenendo la safe zone protetta dalla sfumatura nera `h-96`.
- **Effetto reale:** I nomi e i dettagli dei bungalow risaltano con grande maestosità e chiarezza sui video 9:16 di Koh Phayam, rendendo immediatamente leggibile la tipologia di alloggio (es. Villa, Bungalow, Tent) anche su smartphone in movimento.
- **Stato:** ✅ Compilato (0 errori TypeScript), testato sicuro (0 secrets) e consolidato su branch locale `staging`.


### 🟩 [25/10/2026 - ORE 14:03] · BANNER PROMO CALIBRATO: 25PX DI SPAZIO SPECULARE A DESTRA E SINISTRA
- **Cosa abbiamo fatto:** Risolto l'ingombro fisico che impediva al banner di arretrare in `AutoCutLabPlayer.tsx`:
  - 📏 **Calibrazione Tipografica & Padding**: Alleggerito il padding a `px-2 py-1` (era `px-3 py-1.5`) e la taglia del testo inglese a `text-[8.5px] sm:text-[9.5px]` con margine compatto `mt-0.5`.
  - 📐 **Larghezza Ottimale (200px vs 232px)**: L'ingombro del banner scende a 200px, permettendo al contenitore con `left-[25px] right-[25px]` di non andare in overflow e di respirare comodamente.
  - ⚖️ **Simmetria Millimetrica Garantita**: Ora ci sono esattamente **25px** tra il bordo sinistro e il prezzo, **25px** tra il prezzo e il banner, e **25px esatti** tra il banner e il bordo destro dello schermo.
- **Effetto reale:** Il banner promozionale rubino/oro non tocca più il bordo destro: è visivamente staccato e armonioso, identico alla distanza dal bordo sinistro.
- **Stato:** ✅ Compilato (0 errori TypeScript), testato sicuro (0 secrets) e consolidato su branch locale `staging`.

### 🟩 [25/10/2026 - ORE 14:02] · GOOGLE BUSINESS 4:3: SCRITTA "PIZZA" INGRANDITA DEL +20%
- **Cosa abbiamo fatto:** Ingrandita ulteriormente del +20% la scritta in corsivo *"Pizza"* (e *"Village"*) nel watermark in alto a sinistra del player 4:3 Google Business ([AutoCutLabPlayer.tsx](file:///d:/01%20ANTIGRAVITY/flower-power-village-com/flowerpowervillage/src/social/components/AutoCutLabPlayer.tsx)):
  - 🍕 **Dimensione Font Portata a 21px/22px**: Da 17.5px/18px a **`text-[21px] sm:text-[22px]`** (+20%), donando alla parola chiave gastronomica del brand un risalto corsivo ancora più evidente e armonioso a fianco di `FLOWER POWER` e sopra il claim delivery.
- **Effetto reale:** La parola "Pizza" spicca con grande fascino e immediata leggibilità, attirando subito l'occhio sul tipo di cucina offerta a Ranong.
- **Stato:** ✅ Compilato (0 errori TypeScript), testato sicuro (0 secrets) e consolidato su branch locale `staging`.


### 🟩 [25/10/2026 - ORE 14:00] · GOOGLE BUSINESS 4:3: WATERMARK ALTO-SX INGRANDITO DI UN ULTERIORE +20%
- **Cosa abbiamo fatto:** Su richiesta dell'utente, incrementato ulteriormente del +20% l'intero gruppo in alto a sinistra (Logo, Brand e Ranong Delivery) nel player 4:3 ([AutoCutLabPlayer.tsx](file:///d:/01%20ANTIGRAVITY/flower-power-village-com/flowerpowervillage/src/social/components/AutoCutLabPlayer.tsx)):
  - 🍕 **Logo a 60px**: Diametro logo portato a **60px** (`w-[60px] h-[60px]`, +20% rispetto ai precedenti 50px) con bordo oro a 2.5px e ombra rinforzata.
  - ✍️ **Brand & Sottotitoli Scalati (+20%)**: `FLOWER POWER` a 19px/21.5px, sottotitolo *Pizza/Village* a 17.5px/18px e claim `ส่งถึงบ้าน · Ranong Delivery` a 15px/17px.
  - 🌌 **Top Vignette Sfumata Estesa a `h-36`**: Accompagna il gruppo con una sfumatura nera soffusa alta 144px per la massima leggibilità.
- **Effetto reale:** L'identità visiva nel 4:3 Google Business è maestosa, chiarissima e immediatamente riconoscibile a prima vista anche da smartphone e anteprime ridotte.
- **Stato:** ✅ Compilato (0 errori TypeScript), testato sicuro (0 secrets) e consolidato su branch locale `staging`.


### 🟩 [25/10/2026 - ORE 13:57] · GOOGLE BUSINESS 4:3: LOGO +25%, TESTI/PREZZI +25% E SAFE ZONE +3PX IN ALTO
- **Cosa abbiamo fatto:** Perfezionata l'impaginazione del lettore companion orizzontale 4:3 per Google Business & Facebook (`AutoCutLabPlayer.tsx`):
  - 🍕 **Watermark Alto-SX Ingrandito (+25%)**: Mantenuta la posizione fissa `top-3 left-3`, il logo circolare cresce da 40px a **50px** (`w-[50px] h-[50px]`), con font brand `FLOWER POWER` scalato a 16px/18px, sottotitolo *Pizza/Village* a 14.5px/15px e claim Thai/Ranong Delivery a 12.5px/14px. Top vignette alzata a `h-32` per avvolgere morbidamente il testo.
  - 📐 **Safe Zone Inferiore Rialzata (+3px)**: Il contenitore inferiore con titoli e prezzi è stato sollevato verso l'alto da `bottom-3` (12px) a **`bottom-[15px]`**, allontanandolo dal margine basso dello schermo.
  - 🏷️ **Titoli Ingranditi (+25%)**: Categoria a 14px/15px (con bullet ✦ a 14px), titolo Thai sopra in grande a 17.5px/20px e titolo Inglese sotto a 14px/15px.
  - 💰 **Prezzo Ingrandito (+25%)**: La scala del blocco prezzi a destra è aumentata proporzionalmente del 25% (da `scale(0.605)` a `scale(0.756)` per le pizze incolonnate 8"/12", e da `scale(0.75)` a `scale(0.938)` per i piatti singoli), preservando nitidezza vettoriale, font Kanit e shadow 3D.
- **Effetto reale:** Nel formato Google Business 4:3 il brand e le scritte risultano immediatamente più leggibili e autorevoli sugli schermi desktop e tablet, mantenendo una safe zone impeccabile senza sovrapporsi alle pietanze.
- **Stato:** ✅ Compilato (0 errori TypeScript), testato sicuro (0 secrets) e consolidato su branch locale `staging`.


### 🟩 [25/10/2026 - ORE 13:51] · SIMMETRIA PERFETTA BORDO DESTRO BANNER PROMO (25PX SPECULARI AL PREZZO A SINISTRA)
- **Cosa abbiamo fatto:** Risolto l'effetto "a filo col bordo" nel player video (`AutoCutLabPlayer.tsx`):
  - 📐 **Margine Destro Speculare (`right-[25px]`)**: Sostituito il vecchio `right-3.5` (che lasciava solo 14px) con `right-[25px]`, equiparando al millesimo la distanza tra il bordo destro del banner e il margine destro del video allo spazio di 25px presente tra il margine sinistro del video e il riquadro giallo del prezzo.
  - ⚖️ **Equilibrio Visivo 1:1**: Sia nell'anteprima DOM sia nel canvas MP4 l'impaginazione della riga inferiore è ora perfettamente centrata e bilanciata, con margini laterali identici di 25px a destra e a sinistra.
- **Effetto reale:** Il banner promozionale rubino/oro non tocca più il bordo destro dello schermo: respira con lo stesso spazio armonioso del cartellino del prezzo a sinistra.
- **Stato:** ✅ Compilato (0 errori TypeScript), testato sicuro (0 secrets) e consolidato su branch locale `staging`.

### 🟩 [25/10/2026 - ORE 13:24] · PREZZI PIZZE 8" E 12" A COLONNA CON BANNER PROMO SPAZIOSO A DESTRA
- **Cosa abbiamo fatto:** Riprogettata l'impaginazione della riga prezzi nelle pizze in `AutoCutLabPlayer.tsx` (Canvas `renderOverlaysToContext` e DOM preview):
  - 🍕 **Prezzi Incolonnati a Sinistra (8" sopra, 12" sotto)**: Nelle pizze con due taglie, i due box gialli non sono più affiancati in orizzontale ma sovrapposti in colonna a sinistra (`flex-col items-start gap-1.5`). La larghezza occupata dai prezzi passa da 240px a soli **110px**.
  - 📏 **Card Alzata in Safe Zone (`bottom-[65px]`)**: Elevata l'intera card dei testi verso l'alto (+18px in DOM a `bottom-[65px]`, +44.5px su Canvas `priceH`) per accogliere i due box sovrapposti restando 100% protetta dalla sfumatura scura inferiore da 340px.
  - ✨ **Banner Promo a Destra a Tutto Spazio**: Il badge promozionale rubino/oro ora dispone di **ben 230px di larghezza comoda** a destra, allineandosi e centrandosi verticalmente con la colonna delle pizze senza la minima collisione.
- **Effetto reale:** Zero accavallamenti tra i prezzi e la promo nelle pizze: la 8" e la 12" si leggono chiare a sinistra e il banner delle offerte Ranong risalta grande, nitido e brillante a destra.
- **Stato:** ✅ Compilato (0 errori TypeScript), testato sicuro (0 secrets) e consolidato su branch locale `staging`.

### 🟩 [25/10/2026 - ORE 13:10] · BADGE PROMO BASSO-DESTRA LUMINOSO, CENTRATO E DINAMICAMENTE ADATTIVO
- **Cosa abbiamo fatto:** Perfezionato il layout promozionale nei formati Pizzeria Ranong (`P1`, `P2`, `P3`, `DS`) sia su Canvas (`renderOverlaysToContext`) sia nel DOM in `AutoCutLabPlayer.tsx` su indicazione dell'utente:
  - 🗑️ **Rimosso Nastro Ticker Superiore**: Eliminata definitivamente l'Opzione 2 in alto sotto l'header per mantenere la visuale della foto pulita e priva di ingombri.
  - ✨ **Look Luminoso & Brillante (Addio Sfondo Scuro)**: Sostituito il vecchio sfondo nero con un vivace gradiente gastronomico rubino/ambra (`from-red-600 via-rose-600 to-amber-500`) arricchito da un solido bordino giallo oro chiaro (`border-2 border-yellow-200`) e bagliore diffuso, per risaltare con energia a fianco del prezzo giallo `#FFE500`.
  - 🎯 **Testi Rigorosamente Centrati**: Sia la riga Thai (`🛵 ส่งฟรี 300฿+ · 🏷️ ลด 10%`) sia la riga Inglese (`Free Delivery 300฿+ · 1st Order -10%`) sono ora allineate al centro su due righe armoniose.
  - 📐 **Adattamento Dinamico (Pizze vs Piatti Singoli)**:
    - *Con Pizze (doppia taglia 8" e 12")*: Il badge adatta automaticamente la sua larghezza e il padding (`max-w-[195px]`), affiancandosi comodamente senza mai toccare né uscire dal canvas.
    - *Con Piatti Singoli (pasta, burger, insalate, DS)*: Il badge si espande in larghezza (`max-w-[240px]`) sfruttando appieno lo spazio disponibile a destra.
- **Effetto reale:** L'offerta commerciale (consegna gratis sopra i 300฿ e 10% di sconto sul primo ordine) è immediatamente visibile, attraente e perfettamente integrata nella composizione 9:16.
- **Stato:** ✅ Compilato (0 errori TypeScript), testato sicuro (0 secrets) e consolidato su branch locale `staging`.

### 🟩 [25/10/2026 - ORE 12:54] · PROVA COMPARATIVA OFFERTE (OPZIONE 1: BADGE PREZZO + OPZIONE 2: NASTRO TICKER)
- **Cosa abbiamo fatto:** Integrate contemporaneamente entrambe le soluzioni di design nei formati Pizzeria Ranong (`P1`, `P2`, `P3`, `DS`) sia nel motore Canvas (`renderOverlaysToContext`) sia nell'anteprima DOM in `AutoCutLabPlayer.tsx`:
  - 🏷️ **Opzione 1 (Badge a destra del Prezzo)**: Inserito a destra del box giallo del prezzo uno smart tag sagomato in vetro scuro con bordino oro/ambra contenente:
    - 🇹🇭 `🛵 ส่งฟรี 300฿+ · 🏷️ ลด 10%`
    - 🇬🇧 `Free Delivery 300฿+ · 1st Order -10%`
  - 🎗️ **Opzione 2 (Nastro Ticker Sottile sotto l'Header)**: Inserita una pillola orizzontale ultrasottile (26px) sotto il blocco del logo e dei titoli header:
    - `🛵 ส่งฟรี 300฿+ (Free Delivery) ✦ 🏷️ ลด 10% ครั้งแรก (10% OFF 1st)`
- **Effetto reale:** Ora sul player puoi vedere e confrontare dal vivo entrambe le soluzioni a schermo: valuta se preferisci il nastro orizzontale in alto (Opzione 2) o il cartellino promozionale a destra del prezzo in basso (Opzione 1), oppure se tenerli entrambi.
- **Stato:** ✅ Compilato (0 errori TypeScript), testato sicuro (0 secrets) e consolidato su branch locale `staging`.

### 🟩 [25/10/2026 - ORE 12:35] · ALLONTANAMENTO MILLIMETRICO DS (+10PX PIZZA-BADGE & +10PX BADGE-TESTI)
- **Cosa abbiamo fatto:** Aumentata nettamente la spaziatura nel formato **DS** sia sul Canvas sia nel DOM in `AutoCutLabPlayer.tsx` in risposta al feedback visivo:
  - 📏 **Live Showcase allontanato di ulteriori 10px da Pizza (totale 15px)**: Nel DOM applicato `mt-[15px]` e su Canvas `ty += 10 * s` (totale 15*s). Il badge rettangolare scende verso il basso creando una separazione netta e visibile da *Pizza*.
  - 📐 **Thai & Fast Delivery allontanati di ulteriori 10px dal Badge (totale 15px)**: Nel DOM applicato `mt-[15px]` al testo Thai e `mt-1` a Fast Delivery; su Canvas impostato `ty += dsBadgeH + (15 * s)` e `+ 4*s` prima di Fast Delivery.
- **Effetto reale:** Il banner superiore del formato DS guadagna respiro immediato: il badge non soffoca più la scritta *Pizza* e il blocco informativo sottostante gode di piena leggibilità e risalto.
- **Stato:** ✅ Compilato (0 errori TypeScript), testato sicuro (0 secrets) e consolidato su branch locale `staging`.

### 🟩 [25/10/2026 - ORE 12:22] · IMPAGINAZIONE MILLIMETRICA FORMATO DS (5PX DA PIZZA & 5PX DA LIVE SHOWCASE)
- **Cosa abbiamo fatto:** Ottimizzato il posizionamento e l'impaginazione dei testi nel formato **DS** (Daily Specials / Chef Showcase) sia nel motore Canvas (`renderOverlaysToContext`) sia nell'anteprima DOM in `AutoCutLabPlayer.tsx`:
  - 📏 **Distanziamento Badge LIVE SHOWCASE (5px netti da Pizza)**: Rimosso il doppio conteggio dell'offset su Canvas e calibrato il margine nel DOM (`mt-[5px]` senza gap flexbox parassiti). Il rettangolo pulsante `LIVE SHOWCASE` / `CHEF SPECIALS` poggia ora esattamente a **5 pixel di distanza** al di sotto della parola *Pizza*.
  - 📐 **Distanziamento Blocco Thai & Fast Delivery (ulteriori 5px netti dal Badge)**: Il blocco bilingue sottostante (`สดใหม่ในตู้โชว์` / `เมนูพิเศษประจำวัน` e `FAST DELIVERY`) è posizionato con precisione millimetrica a **ulteriori 5 pixel di distacco** al di sotto del bordo inferiore del rettangolo badge.
- **Effetto reale:** Nel formato DS il banner superiore possiede ora proporzioni armoniche e perfettamente ariose: le scritte non si accavallano e non risultano compresse, offrendo una gerarchia visiva limpida e leggibile nei video social.
- **Stato:** ✅ Compilato (0 errori TypeScript), testato sicuro (0 secrets) e consolidato su branch locale `staging`.

### 🟩 [25/10/2026 - ORE 12:18] · LOGO LINE UFFICIALE PERFETTO & BOLLINI WHATSAPP/LINE INGRANDITI (+20%)
- **Cosa abbiamo fatto:** Riprogettata la grafica dei loghi contatti nel formato R1 (Stories Ristorante Koh Phayam) in `AutoCutLabPlayer.tsx` e `render-social-video-cloud.mjs`:
  - 💚 **Logo LINE Rettificato**: Sostituito il vecchio tracciato che presentava la lettera "E" sollevata e tagliata fuori con la sagoma vettoriale ufficiale Simple Icons. Ora tutte e 4 le lettere (**L - I - N - E**) poggiano sulla stessa linea di base con allineamento e spessore perfetti.
  - 🟢 **Ingrandimento Bollini (+20%)**: I due badge circolari (verde scuro per WhatsApp e verde smeraldo per LINE) sono stati ingranditi da 22px a **26-27px** nell'anteprima DOM e da `12.65 * s` a **`15.2 * s`** sul video Canvas esportato, con proporzioni ampie e nitide.
  - 📞 **Allineamento Telefono**: Ricalibrata la spaziatura del numero verde `+66 095 882 5573` per una centratura ottica armoniosa e senza sovrapposizioni.
- **Effetto reale:** Nel video R1 il logo di LINE si legge ora con totale chiarezza, le lettere sono perfettamente orizzontali e i due bollini risaltano con forza visiva immediata anche sugli schermi degli smartphone.
- **Stato:** ✅ Compilato (0 errori TypeScript), testato sicuro (0 secrets) e consolidato su branch locale `staging`.

---

### 🟩 [25/10/2026 - ORE 12:05] · SFUMATURA SCURA 340PX, RESPIRO CATEGORIA +16PX & MOTO DELIVERY
- **Cosa abbiamo fatto:** Allineato il rendering tra l'anteprima del lettore e il video esportato in `AutoCutLabPlayer.tsx`:
  - 🏍️ **Moto Delivery**: Aggiunta l'icona ufficiale della moto da delivery `🛵` a fianco della parola lampeggiante `DELIVERY`, sia nel DOM che su Canvas con centratura ottica.
  - 📏 **Stacco Categoria (+16px)**: Portato il margine sotto la categoria bilingue a `mb-4` in DOM e `by += 32 * s` in Canvas (+14px all'altezza complessiva). La categoria funge ora da cappello visivo elegante senza più schiacciare il nome del piatto.
  - 🌑 **Sfumatura Nera Piena (340px)**: Estesa la Bottom Vignette Fade da 135px a **340px** sia su Canvas che su DOM (`h-96`). La sfumatura sale avvolgendo l'intera card dei testi (prezzo, titoli bilingui e categoria) fino a sfumare dolcemente in alto, eliminando il problema delle scritte che finivano sul legno chiaro privo di contrasto.
- **Effetto reale:** I video compilati per TikTok, Instagram e Facebook sono ora identici 1:1 all'anteprima del player: leggibilità impeccabile su qualsiasi sfondo luminoso e look da produzione televisiva broadcast.
- **Stato:** ✅ Compilato (0 errori TypeScript), testato sicuro (0 secrets) e consolidato su branch locale `staging`.

---

### 🟩 [25/10/2026 - ORE 11:53] · FAVICON CON SIGLE GIGANTI (SS, AD, DT, KM, PIZ, VLG, WR)
- **Cosa abbiamo fatto:** Sostituite le parole per esteso (che a 16px nei tab risultavano compresse e poco leggibili) con **sigle giganti ad altissimo contrasto (2-3 lettere) con font extra-bold a 35px**:
  - 🟣 **SS**: Social Studio (`/social`, `/autocut`) — Viola Profondo con scritta SS bianca.
  - 🟡 **AD**: Admin Console (`/admin`) — Titanio/Ardesia con scritta AD in oro caldo.
  - 🔵 **DT**: Dining Table (`/dining`, `/tavoli`) — Blu Mare con scritta DT bianca.
  - 🟠 **KM**: Kitchen Monitor (`/kitchen`, `/kds`) — Arancio Fiamma con scritta KM bianca.
  - 🔴 **PIZ**: Pizzeria (`/pizza`, delivery) — Rosso Tradizionale con scritta PIZ in giallo pizza.
  - 🟢 **VLG**: Village (`/village`, booking) — Smeraldo Tropicale con scritta VLG bianca.
  - 🔷 **WR**: Web Reader (`/docs`, `/reader`) — Blu Notte con scritta WR in celeste ghiaccio.
- **Effetto reale:** Ora anche nei micro-tab da 16x16 pixel di Chrome e cellulari le 2 lettere giganti risaltano con nitidezza assoluta senza alcun effetto sfocato o illeggibile.
- **Stato:** ✅ Compilato (0 errori TypeScript), testato sicuro (0 secrets) e consolidato su branch locale `staging`.

---

### 🟩 [25/10/2026 - ORE 11:50] · FAVICON REPARTI RIVISTE CON NOME CHIARO E VISIBILE
- **Cosa abbiamo fatto:** Riprogettato interamente il motore dinamico delle favicon in `src/utils/environmentFavicon.ts`: eliminati i vecchi cerchietti neri e le micro-scritte illegibili.
- **Cosa è cambiato:** Ogni singolo reparto ora possiede un badge sagomato ad altissimo contrasto con il proprio **nome scritto chiaro a caratteri cubitali extra-bold (900)** e con colore tematico univoco:
  - 🟣 **SOCIAL**: Sfondo Viola/Fucsia Profondo con scritta `SOCIAL` in bianco.
  - 🟡 **ADMIN**: Sfondo Grafite/Ardesia con scritta `ADMIN` in ambra/oro brillante.
  - 🔵 **DINING**: Sfondo Blu Mare Profondo con scritta `DINING` in bianco puro.
  - 🟠 **KITCHEN**: Sfondo Arancio/Rosso Fiamma con scritta `KITCHEN` in bianco puro.
  - 🔴 **PIZZA**: Sfondo Rosso Tradizionale con scritta `PIZZA` in giallo oro.
  - 🟢 **VILLAGE**: Sfondo Verde Tropicale con scritta `VILLAGE` in bianco puro.
  - 🔷 **DOCS**: Sfondo Blu Notte con scritta `DOCS` in celeste ghiaccio.
  - Rimane intatto il bordino perimetrale dell'ambiente (Rosso = Locale, Verde = Staging, Oro = Produzione).
- **Effetto reale:** Guardando le schede aperte del browser, si riconosce all'istante a colpo d'occhio quale scheda è di Social, quale di Admin, quale di Dining e quale di Kitchen, senza più alcuna confusione.
- **Stato:** ✅ Compilato (0 errori TypeScript), testato sicuro (0 secrets) e consolidato su branch locale `staging`.

---

### 🟩 [25/10/2026 - ORE 08:58] · PERFETTA DISTINZIONE SMARTPHONE (2 COLONNE) VS TABLET (3 COLONNE)
- **Cosa abbiamo fatto:** Rimosso lo stile forzato inline da `MenuGrid.tsx` e `GloriaFoodLanding.tsx`, raffinato `CategoryTabs.tsx` e impostata la soglia esatta e matematica di demarcazione a **460px** in `src/index.css`.
- **Cosa è cambiato:** Sotto i 460px (tutti i telefoni cellulari: iPhone, Samsung, Pixel) il layout applica automaticamente **2 colonne di prodotti** e il **selettore categorie a scorrimento orizzontale compatto**. Dai 460px in su (Xiaomi Mi Pad 4 a ~533px/600px, tutti i tablet e monitor) restano intatte al 100% le **3 colonne di prodotti** e il **menu a 2 righe fisse**.
- **Effetto reale:** I cellulari tornano alla loro visualizzazione ordinata a 2 colonne senza immagini compresse, mentre il tablet di riferimento Xiaomi Mi Pad 4 continua a lavorare in modo ideale su 3 colonne con tutte le categorie visibili subito.
- **Stato:** ✅ Compilato (0 errori TypeScript), certificato sicuro (0 secrets) e pronto per la pubblicazione.

---

### 🟩 [25/10/2026 - ORE 08:48] · BLINDATURA REGOLA 23 & DIARIO DI BORDO LIVE (SOLUZIONE 1)
- **Cosa abbiamo fatto:** Aggiunta e blindata la **Regola 23** nel regolamento universale `.agents/AGENTS.md` e sincronizzato il file permanente `DIARIO_DI_BORDO.md` sia nel progetto che nell'IDE.
- **Cosa è cambiato:** Ogni futuro agente o sessione di lavoro DEVE obbligatoriamente iniziare ogni messaggio con il banner a 3 punti e registrare le operazioni qui dentro senza mai cancellare il passato.
- **Effetto reale:** Hai ora la garanzia assoluta di seguire lo stato dei lavori in tempo reale all'interno dell'IDE, in italiano semplice e comprensibile, a zero costo e senza spreco di token.
- **Stato:** ✅ Testato, verificato (0 secrets, 0 errori TypeScript) e consolidato su branch locale `staging`.

---

### 🟩 [24/10/2026 - ORE 22:07] · GRIGLIA PRODOTTI TABLET 10" VERTICALE
- **Cosa abbiamo fatto:** Calibrata la griglia del menu in `MenuGrid.tsx` e registrata la regola universale per tablet Android / Xiaomi Mi Pad 4.
- **Cosa è cambiato:** Imposte **3 colonne fisse** (`repeat(3, minmax(0, 1fr))`) superando ogni trappola di breakpoint o zoom dei caratteri di sistema.
- **Effetto reale:** Sul tablet da 10 pollici tenuto in verticale in sala compaiono **3 piatti affiancati stabili**, mentre i telefoni smartphone rimangono protetti e ordinati.
- **Stato:** ✅ Compilato, verificato e rilasciato in Produzione su Vercel (`main-hRkrm-SJ.js`).

---

### 🟩 [24/10/2026 - ORE 20:15] · DEPLOY CHECKPOINT `MARKDOWN-WAIT`
- **Cosa abbiamo fatto:** Eseguito il rilascio sicuro su Staging (`staging.flowerpowerpizza.com`) e Produzione (`flowerpowerpizza.com`) con la blindatura totale per la revisione TikTok for Developers.
- **Cosa è cambiato:** Sincronizzati tutti gli asset audio del villaggio e gli SFX professionali; isolata la pagina `/social` in produzione sulla versione di audit originale approvata.
- **Effetto reale:** L'infrastruttura del ristorante e del villaggio è aggiornata al 100%, con zero rischi di blocco o rigetto da parte degli auditor di TikTok.
- **Stato:** ✅ Deploy completato con successo (Audit di sicurezza: 0 secrets detected, 0 errori TypeScript).

---

### 🟩 [24/10/2026 - ORE 18:30] · MOTORE VIDEO AUTOCUT LAB (FORMATI P1, P2, P3, R1)
- **Cosa abbiamo fatto:** Alzato di **+10 pixel netti** il blocco testi bilingue (categoria + titoli piatti in Thai e Inglese) rispetto al rettangolo del prezzo nel player 9:16 Canvas e nell'anteprima DOM.
- **Cosa è cambiato:** Il rettangolo giallo del prezzo rimane saldamente ancorato alla base, mentre il nome del piatto e la categoria respirano con la giusta spaziatura visiva cinematografica.
- **Effetto reale:** Leggibilità perfetta nei video generati per TikTok, Instagram Stories e Facebook Reels.
- **Stato:** ✅ Integrato e operativo sia in locale sia nel renderer cloud in background.

---

### 🟩 [24/10/2026 - ORE 17:15] · AUDIO SOUNDTRACK VILLAGGIO & SFX OUTRO
- **Cosa abbiamo fatto:** Sostituiti i 10 brani musicali del villaggio con le nuove versioni masterizzate in `public/audio/village/` e caricati nel bucket Supabase Cloud Storage.
- **Cosa è cambiato:** Creati e integrati due nuovi effetti sonori dedicati di chiusura (`sfx-outro-pizza.wav` e `sfx-outro-village.wav`).
- **Effetto reale:** Le musiche sono riproducibili a ciclo continuo e fruibili anche a computer spento per la generazione video automatica in cloud.
- **Stato:** ✅ Caricato su Cloud Supabase e archiviato in locale.
