# 🍕 Modulo Delivery Food & Pizzeria Ranong (`/pizza`) - Specifiche Tecniche & Architettura

Il modulo **Delivery Food & Pizzeria** gestisce l'intero flusso di ordinazione online, catalogo piatti, personalizzazioni, promozioni e gestione comande per **Flower Power Pizza Ranong**.

---

## 🏗️ 1. Struttura Categorie & Schede Prodotto

Il catalogo è organizzato in **14 categorie strutturate**, sincronizzate tra Website ufficiale, Dining Tablet e Kitchen KDS:

1. **Piatti del Giorno (`daily-specials`)**: Vetrina dinamica con 4 sottosezioni:
   - **Primi Piatti**: Rinominate da specialità mare/pasta ripiena a titolo compatto ed elegante *Primi Piatti* (*Spaghetti allo Scoglio, Ravioli di Carne, Gnocchi di Patate al Salmone e Zucchine*).
   - **Pizze Gourmet**: Include *Pizza Capocollo e Anacardi* (350฿, fior di latte, pomodoro fresco a cubetti, anacardi tostati, parmigiano, capocollo, olio EVO, sale, pepe) e *Pizza Carpaccio di Manzo*.
   - **Secondi Piatti**: Torta Pasqualina ligure e secondi della tradizione.
   - **Focaccia Artigianale**: Vetrina focacce farcite espresse.
2. **Pizze Classiche (`traditional-italian-pizza`)**: 34 pizze tradizionali a lenta lievitazione (48h) con impasto 100% italiano e 27 ingredienti extra selezionabili.
3. **Primi Piatti & Pasta (`pasta`)**: 49 piatti raggruppati per condimento (Aglio Olio, Pomodoro, Pesto, Amatriciana, Bolognese, Carbonara, 4 Formaggi, Panna e Funghi/Flower Power, Specialità di mare/ripiene, Lasagne al forno).
   - *Regola Pancetta Extra*: l'opzione `Pancetta Extra` (+50฿) è limitata esclusivamente alle varianti di **Aglio, Olio e Peperoncino**.
4. **Insalate Italiane (`italian-salads`)**: Insalate fresche mediterranee e contorni.
5. **Focaccia & Pizza Sandwiches (`pizza-sandwich`)**: 
   - **7 Focacce Artigianali Standardizzate**: Stesso canone di farcitura (*Focaccia tradizionale genovese, [salume], pomodoro fresco a fette, lattuga gentile, olio extravergine d'oliva*):
     - *Focaccia con Capocollo* (190฿)
     - *Focaccia con Finocchiona* (190฿)
     - *Focaccia con Salame Milanese* (210฿)
     - *Focaccia con Pancetta Arrotolata* (190฿)
     - *Focaccia con Porchetta Romana* (210฿)
     - *Focaccia con Prosciutto Cotto* (190฿)
     - *Focaccia con Salame Nostrano* (190฿)
   - **3 Pizza Sandwiches tradizionali** (*Parma Ham 190฿, Salame 190฿, Spicy Salame 190฿*).
6. **Pizza Burgers (`pizza-burgers`)**: 4 burger cotti in crosta pizza con patatine.
7. **Fritti & Sfizi (`french-fries`)**: 6 snack e contorni fritti.
8. **Dolci & Dessert (`desserts`)**: 5 dolci tradizionali italiani (Tiramisù artigianale, Cheesecake, torte del giorno).
9. **Colazione & Toast (`breakfast-and-snacks`)**: 10 opzioni colazione e toast.
10. **Caffetteria & Tè (`coffee-shop`)**: 10 bevande calde e caffè espresso italiano.
11. **Frullati & Smoothie (`fruit-drinks`)**: 4 smoothie tropicali freschi.
12. **Bibite & Acqua (`soft-drinks`)**: 3 bibite analcoliche e acqua minerale.
13. **Birre Fresche (`beers`)**: 3 birre fredde in bottiglia.
14. **Carta dei Vini Pregiati (`wines`)**: Catalogo vini completi sincronizzati da Supabase Cloud, gestibili con toggle disponibilità anche da Dashboard Admin *Menu e Prezzi*.

---

## 🎨 2. Regole di Design, Tipografia & Schede Categorie

1. **Navigazione Categorie Ottimizzata**:
   - Schede mini-quadrate su mobile con sfondo caldo ad alto contrasto (`bg-[#ede5d8] border-2 border-[#cfbea6] text-[#2c1a11]`), zero troncamenti e nessuna presenza di puntini `...`.
   - Intro teaser auto-scroll calibrato su mobile per presentare l'intero assortimento all'apertura.
2. **Product Name Line Breaking (Doppia Riga)**:
   - I titoli di tutti i piatti contenenti connettori logici vengono spezzati automaticamente su due righe prima di: `\nCON `, `\nWITH `, `\nพร้อม`, `\nMIT `, `\n& `.
3. **Ereditarietà Automatica Personalizzazioni (Extras)**:
   - Le schede mostrate nelle Specialità del Giorno ereditano in modo identico tutte le personalizzazioni e gli extra della loro categoria madre.
4. **Menu a Tendina Selezioni**:
   - I selettori di varianti e opzioni utilizzano menu a tendina con formato pulito `Scelta - Prezzo` (senza parentesi, senza simboli `+`, `-`, `>`, `<`).
5. **Dashboard Controllo Menu & Prezzi**:
   - Gestione centralizzata dei prezzi e switch disponibilità per tutti i piatti, pizze, paste e carta dei vini, con sincronizzazione istantanea via `BroadcastChannel` e `LocalStorage`.
6. **Interazione Schede Piatti & Immagini Cristalline (Zero Velo Scuro & Zero Lenti)**:
   - Floating ed elevazione card con ombra morbida al passaggio del mouse (`hover:shadow-2xl hover:-translate-y-1`).
   - Micro-zoom fluido e progressivo della foto (`scale-105 transition-transform duration-500 ease-out`) senza alcun velo scuro, opacità o sfocatura (`backdrop-blur`), e senza icone lente invasive, garantendo nitidezza fotografica al 100% e ripristino istantaneo al tocco/rilascio.
7. **Hero Banner & Clipping Raggi di Curvatura**:
   - Isolamento dello slideshow di sfondo e dell'overlay nero opaco dentro contenitori dedicati con `overflow-hidden rounded-2xl`, garantendo il rispetto rigoroso degli angoli arrotondati della base senza spigoli o sbordature.

---

## 🛒 3. Flusso Carrello & Checkout

- **Sconto 10% Primo Ordine**: Validato tramite verifica hardware/email/telefono + GPS (bypassato in locale/staging).
- **Edge-Hugger Floating Cart**: Linguetta laterale destra per l'accesso rapido al carrello drawer con pairing consigliati.
- **PromptPay QR Code Conversion & Native PNG Download (Omise Gateway)**:
  - Le API Omise restituiscono originariamente il QR PromptPay in formato SVG (`image/svg+xml`) su URL cross-origin (`api.omise.co`), che su browser moderni (Chrome/Edge/Safari) causava il download forzato in SVG ignorando l'attributo HTML5 `download` del client.
  - L'architettura è stata potenziata con un endpoint backend dedicato sullo stesso dominio (`/api/omise-charge?action=download-png`) che rasterizza e restituisce direttamente un buffer binario PNG nativo (`image/png`) con intestazioni HTTP `Content-Disposition: attachment; filename="PromptPay_FlowerPower_<amount>THB.png"`.
  - Il client (`CheckoutFlow.tsx`) genera inoltre in modo sincrono e immediato un DataURL PNG ad alta definizione (600×600 px) con sfondo bianco opaco puro (`#FFFFFF`) e margini di sicurezza (quiet zone), garantendo scansione immediata da app bancarie (K-Plus, SCB Easy, Bangkok Bank) e salvataggio garantito al 100% come immagine PNG.
- **Notifiche Ordini & Kitchen Monitor (KDS)**: Sincronizzazione in tempo reale con Supabase `pizza_orders`, KDS cucina e Telegram Bot.
  - Gestione avanzata comande e prenotazioni tavoli con pulsanti dedicati di presa in carico, rifiuto/cancellazione immediata (`[CANCELLED:true]`) ed eliminazione definitiva (`deleteOrder` con bypass RLS tramite `service_role`).

---

## 🌐 4. Pipeline Multilingua Radicale a 9 Fasi (DeepSeek AI Batch CLI)

Tutti i piatti, descrizioni, varianti, dizionario globale, badge dietetici e flussi di checkout supportano 5 lingue native: **Italiano (`IT`)**, **Inglese (`EN`)**, **Tailandese (`TH`)**, **Tedesco (`DE`)** e **Birmano (`MM`)**.

1. **Motore CLI Automatizzato (`scripts/deepseek-universal-translator.mjs` & `scratch/deepseek-translate.mjs`)**:
   - Esegue la traduzione batch e on-demand di tutti i piatti (`menuData.ts`), carta dei vini (`wineData.tsx`), dizionario globale (`i18n.ts`), badge dietetici (`dietary.ts`, `DietaryWatermark.tsx`) e componenti checkout.
   - Utilizza l'API ufficiale DeepSeek (`deepseek-chat`) con temperatura controllata e schema JSON strict.
2. **Supporto Birmano (`MM`) & Font Noto Sans Myanmar**:
   - Integrazione completa del font `Noto Sans Myanmar` (Google Fonts) in `index.html` e `languages.ts`.
   - Localizzazione completa del flusso di Checkout (`CheckoutFlow.tsx`), messaggi di conferma, supporto Telegram/WhatsApp e dettagli consegna dinamici.
3. **Studio Admin Live DeepSeek (`DishCardStudio.tsx`, `WineCardStudio.tsx`)**:
   - Pannello di traduzione in tempo reale con anteprima affiancata di tutte le lingue supportate.

---

## 🎧 5. Kitchen Tablet KDS & Toolbar Dark-Slate Redesign

- **Intestazione Frontale Pulita & Raccolta**: Titolo essenziale **`KITCHEN MONITOR`** a fianco del logo ufficiale (rimossa la dicitura superflua su 3 righe per ottimizzare lo spazio utile della lavagna ordini).
- **Nuova Toolbar Standardizzata (`h-9 rounded-xl` Dark Slate Glassmorphism)**:
  1. 🟢 **ONLINE: OPEN**: Stato servizio con orari di apertura, chiusura e timer pause personalizzate.
  2. 🍴 **Menu (Disponibilità & 86 Sold-Out)**: Stile neutro coerente `#181d29`, senza numeri o sfondi rossi invasivi.
  3. 🗂️ **Archive (Storico Ordini Evasi)**: Stile scuro neutro `#181d29` pulito, senza contatore numerico.
  4. 🌐 **Selettore Lingua**: Dropdown coordinato con bandiera e codice ISO in stile kitchen-dark.
  5. ☀️ **Screen Wake Lock**: Pulsante iconico dedicato con icone `Sun` / `SunMedium` e led verde pulsante quando attivo.
  6. 🔔 **Suoneria & Allarme Acustico**: Tasto mute/unmute buzzer (`Volume2` / `VolumeX`).
  7. ⛶ **Fullscreen Kiosk**: Attivazione modalità schermo intero su tablet e monitor cucina.
  8. 🚪 **Blocco Tablet / Logout**: Chiusura sessione protetta da PIN.
- **Audio WakeLock (`src/admin/pizza/utils/kitchenAudioWakeLock.ts`)**: 
  - Mantiene attivo lo schermo del tablet da cucina (Screen Wake Lock API).
  - Suoneria ad alto volume persistente per nuovi ordini in arrivo.
  - Taglio audio istantaneo a **0 millisecondi** (`audioCtx.suspend()`, cancellazione schedule su master gain e arresto immediato di tutti gli oscillatori attivi) alla pressione di *"Accetta Ordine"* o silenziamento.
- **Sincronizzazione Comande & Ciclo di Vita Tavoli Sala**: 
  - Deduplicazione automatica dei ticket per tavolo tramite chiave canonica (`getCanonicalTableKey`).
  - Minimizzazione a icona nel dock inferiore per ordini al tavolo accettati.
  - Chiusura atomica con `ORDER PAID`: archivia tutti i record pregressi del tavolo ed emette broadcast `TABLE_SETTLED` per liberare il tavolo su tutti i tablet in sala.
  - Timer promemoria consegna 15 minuti limitato esclusivamente agli ordini a domicilio/takeaway.

---

## 🍳 6. Motore di Traduzione Universale KDS (`kdsCatalogService`, `kdsExtraDictionary`, `kdsI18n`)

1. **Dizionario Universale Ingredienti ed Extra (`kdsExtraDictionary.ts`)**:
   - Mappatura completa e certificata di oltre **180 ingredienti, formati, impasti, varianti vino e badge dietetici** in tutte le 5 lingue (`TH`, `EN`, `MM`, `IT`, `DE`).
   - Normalizzazione runtime tramite `resolveExtraDisplayName` e `resolveVariantDisplayName`.
2. **Master Catalog & Sottotitoli Dinamici (`kdsCatalogService.ts`)**:
   - Indicizzazione biunivoca dei ~150 piatti del catalogo e della carta vini.
   - Fornitura di sottotitoli intelligenti di riferimento incrociato (`resolveDishSubtitle`), visualizzando ad esempio l'inglese sotto il tailandese, o il tailandese sotto il birmano.
3. **Dizionario UI Tipizzato KDS (`kdsI18n.ts`)**:
   - Copertura 100% dell'infrastruttura grafica del monitor (colonne, pulsanti allarme/snooze, badge `PromptPay`, `Card 3DS`, `Conto alla Cassa`, `Contanti`, modali di archivio, gestione orari e prenotazioni tavolo) con zero stringhe hardcoded.

---

## 🍕 7. Ottimizzazione Modale Dettaglio Piatto & Nomenclatura Parmigiano Multilingua DeepSeek

1. **Scheda Dettaglio Piatto Mobile-First (`MenuGrid.tsx`)**:
   - **Adattamento Viewport Mobile (`h-[92dvh] sm:h-auto sm:max-h-[88vh]`)**: La scheda di personalizzazione si apre su smartphone come un raffinato foglio a tutto schermo (`rounded-t-[2rem] sm:rounded-[2rem]`), eliminando margini vuoti e sfruttando l'altezza utile del dispositivo.
   - **Footer Sticky Antisfondamento**: Barra inferiore con selettore quantità compatto, totale finito con sconto -5% visibile e pulsante *"AGGIUNGI ALL'ORDINE"* ad ampiezza dinamica (`flex-1 min-w-0`), protetto da overflow e troncature di testo su qualsiasi risoluzione smartphone.
   - **Padding di Sicurezza Safe-Area**: Gestione nativa `pb-[max(0.85rem,env(safe-area-inset-bottom))]` per la barra di navigazione e le gesture dei dispositivi mobili iOS e Android.

2. **Standardizzazione Extra "Parmigiano" (`menuData.ts`)**:
   - Aggiornamento di tutti gli ingredienti extra nel catalogo sostituendo la formula estesa con la dicitura pulita ed elegante **"Parmigiano"**.
   - Traduzioni certificate tramite API DeepSeek su tutte le 5 lingue supportate:
     - 🇮🇹 IT: `Parmigiano`
     - 🇬🇧 EN: `Parmesan`
     - 🇹🇭 TH: `พาร์มิจาโน`
     - 🇩🇪 DE: `Parmesan`
     - 🇲🇲 MM: `ပါမာဂျာနို`


