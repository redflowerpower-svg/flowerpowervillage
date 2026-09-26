# Modulo Pizza & Online Delivery — Flower Power Pizza

Documentazione tecnica del sistema di ordinazione online, del catalogo dei prodotti e del flusso di gestione degli ordini per il reparto pizzeria "Flower Power Pizza" (Ranong, Thailandia). Questo documento è progettato per fungere da archivio di conoscenza per Gemini Notebook.

---

## 1. Stack Tecnologico

Il sistema gestisce l'intero catalogo dei prodotti e l'inoltro degli ordini via web, appoggiandosi a un'architettura in tempo reale basata su notifiche push e mappe interattive.

*   **Frontend UI & Interazioni:** React 18.3 + TypeScript 5.5 (Vite).
*   **Gestione dello Stato Carrello e Geolocalizzazione:** Zustand 5.x. Lo store `cartStore.ts` calcola i subtotali e valida i vincoli sul carrello, mentre `locationStore.ts` gestisce il posizionamento dell'utente.
*   **Database Relazionale & Realtime:** Supabase. La tabella `pizza_orders` memorizza gli ordini in tempo reale, sfruttando le funzionalità di ascolto dei cambiamenti di stato (Supabase Realtime) per aggiornare il tracciamento sul client dell'utente.
*   **Cloud Storage:** Supabase Storage (bucket `receipts`) per l'archiviazione e la verifica pubblica degli screenshot delle ricevute di pagamento PromptPay.
*   **Geolocalizzazione & Maps:** Google Maps JavaScript API (integrata tramite `@vis.gl/react-google-maps`). Permette la visualizzazione interattiva della zona di consegna e il trascinamento del pin per precisare le coordinate.
*   **Instant Notification & Kitchen Dashboard:** Telegram Bot API. Invece di richiedere una dashboard costantemente attiva sul browser della cucina, il sistema invia le notifiche d'ordine direttamente a un gruppo Telegram dello staff tramite un bot dedicato.
*   **Serverless Webhooks:** Vercel Serverless Functions (`/api/telegram-notify` e `/api/telegram-webhook`) per gestire l'invio del messaggio e le risposte interattive tramite pulsanti di callback di Telegram.

---

## 2. Architettura UI & Componenti Recenti

### A. Sistema di Filtri a Tendina Personalizzati (`CustomFilterDropdown`)
*   **Design Satinato & Z-Index Elevato (`z-[99999]`):** Tutti i sottomenu a pulsante sono stati convertiti in eleganti menu a tendina custom con chiusura al click esterno (`useRef` + window listener), badge con conteggio piatti, checkmark animato sulla selezione attiva e reset rapido.
*   **Menu Pasta (`CONDIMENTO / TIPO DI PASTA`):** Elenca i condimenti scritti esattamente come nel menu in **UPPERCASE** (`AGLIO, OLIO E PEPERONCINO`, `SALSA DI POMODORO`, `PESTO GENOVESE`, `SALSA AMATRICIANA`, `SALSA RAGÙ BOLOGNESE`, `CARBONARA`, `QUATTRO FORMAGGI`, `FLOWER POWER`, `LASAGNE`).
*   **Menu Bibite & Birre (`TIPOLOGIA BEVANDA`):** Sostituito il layout a pillole con tendina satinata (`TUTTE LE BEVANDE`, `BIBITE & ACQUA`, `BIRRE`).
*   **Menu Vini (`TIPOLOGIA VINO` & `ORIGINE / NAZIONE`):** Doppia tendina con bandiere nazionali e ordine rigoroso: **Italia, Francia, Australia, Cile**.

### B. Standardizzazione Tipografica del Simbolo Valuta Baht (`฿`)
*   **Colore Coerente e Nero:** Il simbolo `฿` è stato uniformato al colore nero del prezzo (`text-stone-900` o `text-[#8B1E1E]` se in evidenza), eliminando il vecchio grigio spento.
*   **Font Stack Dedicato:** Utilizzo dello stack tipografico ad alta resa `fontFamily: 'Prompt, Kanit, IBM Plex Sans Thai, system-ui, sans-serif'` su tutte le componenti: schede menu (`MenuGrid.tsx`), schede vini (`wineData.tsx`), carrello laterale (`CartDrawer.tsx`), modal di personalizzazione (`ProductModal.tsx`), cassa e checkout (`CheckoutFlow.tsx`) e Wine Studio.

### C. Allineamento Geometrico Schede Menu Food
*   **Ancoraggio Badge Extra a Fondo Scheda (`mt-auto`):** L'indicatore `• N INGREDIENTI EXTRA` e le opzioni di taglia sono posizionati stabilmente a contatto con la riga sottile divisoria (`border-t border-stone-200`) in tutte le schede della griglia, garantendo perfetto allineamento visivo a prescindere dalla lunghezza del testo descrittivo.

### D. Switcher "Sito Nuovo / Sito Vecchio"
*   **Toggle Header Navigation:** Nella barra marrone superiore di `PizzaSite.tsx` è integrato un interruttore persistito in `localStorage` (`flower_power_pizza_mode`) per passare rapidamente tra la **Nuova Delivery App** (`DeliveryMenu`) e la **Landing Provvisoria GloriaFood** (`GloriaFoodLanding`).

---

## 3. Flussi Logici dell'Ordine

Il ciclo di vita di un ordine si sviluppa in quattro fasi: composizione, geolocalizzazione e pagamento, notifica istantanea, e tracciamento in tempo reale.

### A. Composizione dell'Ordine nel Carrello
1.  L'utente naviga nel catalogo strutturato in categorie (pizze classiche, pasta, insalate, bevande, vini, ecc.).
2.  All'apertura della scheda prodotto (`ProductModal`), l'utente definisce la taglia/variante del piatto (es. pizza Normale o Gigante) ed eventuali ingredienti extra.
3.  Zustand (`cartStore.ts`) calcola il prezzo totale del singolo articolo applicando i modificatori di prezzo della variante selezionata e sommando gli extra.

### B. Geolocalizzazione e Checkout
```mermaid
sequenceDiagram
    participant Utente as Utente (Browser)
    participant Maps as Google Maps API
    participant DB as Supabase DB
    participant Tele as Telegram Group

    Utente->>Utente: Compila Dati (Nome, Telefono)
    Utente->>Maps: Rileva GPS / Trascina Pin rosso sulla Mappa
    Maps-->>Utente: Coordinate (Lat, Lng) e Indirizzo
    Utente->>Utente: Calcolo Distanza Haversine (Limite massimo 5 km)
    alt Fuori raggio
        Utente-->>Utente: Blocco checkout ("Siamo spiacenti...")
    else In raggio (Ok)
        Utente->>Utente: Sceglie metodo di pagamento
        alt PromptPay (QR Code)
            Utente->>Utente: Esegue pagamento tramite app bancaria + Upload screenshot
            Utente->>DB: Salva screenshot in storage (bucket: receipts)
        end
        Utente->>DB: Inserisce ordine in pizza_orders (Stato: 'new')
        Utente->>Tele: Trigger /api/telegram-notify (Invia dettagli con pulsanti inline)
    end
```

### C. Gestione dell'Ordine Lato Staff (Telegram Flow)
1.  Il serverless handler `/api/telegram-notify` riceve l'ID ordine, estrae i dati da Supabase e invia al gruppo Telegram dello staff un messaggio HTML completo:
    *   Dettaglio degli articoli e opzioni selezionate.
    *   Mappa stradale (link rapido a Google Maps con le coordinate GPS esatte).
    *   Link alla ricevuta PromptPay per il controllo contabile.
    *   **Pulsanti Inline:** `Conferma Ordine`, `Rifiuta Ordine`, `PARTENZA` (Delivery), `ARRIVO`.
2.  Lo staff preme **Conferma Ordine**:
    *   Telegram invia un callback webhook a `/api/telegram-webhook`.
    *   Il server aggiorna lo stato dell'ordine in Supabase su `preparing`.
    *   Il client dell'utente (che ascolta in tempo reale su Supabase) si aggiorna mostrando un countdown di preparazione di 25 minuti.
3.  Lo staff preme **PARTENZA**:
    *   L'ordine viene aggiornato a `delivering`.
    *   Il client dell'utente mostra lo stato di consegna e avvia il tracking live.

---

## 4. Configurazioni Chiave e Schemi Dati

### Schema della Tabella `pizza_orders` (Supabase)

```sql
CREATE TABLE pizza_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,          -- Indirizzo testuale + [COORD: lat,lng] in append
  items JSONB NOT NULL,           -- Array di CartItemSaved (Varianti ed Extra inclusi)
  total NUMERIC NOT NULL,
  status TEXT DEFAULT 'new'::text NOT NULL, -- 'new', 'preparing', 'delivering', 'completed', 'rejected'
  payment_method TEXT NOT NULL,   -- 'promptpay', 'cash'
  receipt_url TEXT,               -- Link pubblico lo screenshot nel bucket storage
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  has_whatsapp BOOLEAN DEFAULT false,
  has_line BOOLEAN DEFAULT false,
  telegram_notified BOOLEAN DEFAULT false,
  telegram_message_id BIGINT
);
```

### Regole Tariffarie di Spedizione
*   **Raggio massimo di consegna:** 5 km calcolati con la formula di Haversine a partire dalle coordinate del ristorante (`10.0125` N, `98.6345` E circa, definite in `locationStore.ts`).
*   **Costo di spedizione:**
    *   `0 THB` (gratis) per ordini superiori o uguali a **200 THB**.
    *   `30 THB` per ordini inferiori a **200 THB**.

---

## 5. Problem Solving & Patch Storiche

### A. Prevenzione dell'Autofill Invasivo del Browser
*   **Problema:** Gli utenti riscontravano problemi durante l'inserimento dell'indirizzo perché le funzionalità di autofill dei browser sovrascrivevano arbitrariamente i campi del modulo.
*   **Soluzione:** ID casuale univoco a ogni montaggio (`addr-[random]`) e gestione `readOnly` dinamica fino al focus.

### B. Gestione dei Tablet Staff Offline (Failsafe Timeout)
*   **Problema:** Se il tablet della cucina era offline, il cliente rimaneva bloccato in attesa della conferma.
*   **Soluzione:** Countdown visivo di 5 minuti (300s). Se lo stato non passa a `preparing`, scatta la schermata di emergenza con chiamata telefonica diretta o chat WhatsApp/Line.

### C. Simulazione in Dev Mode
*   **Problema:** In locale senza DB/Telegram il checkout era bloccato.
*   **Soluzione:** Simulazione d'ordine in memoria locale e notifica broadcast su `flower_power_orders_channel`.

### D. Master Catalogo Vini Resiliente & Sincronizzazione Cross-Workstation
*   **Problema:** La collezione vini completata nel WineCardStudio risiedeva inizialmente solo nel `localStorage` del browser, con conseguente perdita visiva o caricamento del segnaposto generico su postazioni differenti (Koh Phayam <-> Ranong) o su smartphone.
*   **Soluzione:** Scrittura definitiva e permanente dell'intera collezione di 20 vini (con URL WebP delle bottiglie su Supabase Storage `14-Wines`, prezzi, gradi e traduzioni complete nelle 4 lingue IT, EN, TH, DE) all'interno del codice sorgente master (`INITIAL_WINE_COLLECTION` in `wineData.tsx`).
*   **Auto-Healing Dinamico:** In `DeliveryMenu.tsx` è stata inserita una routine che analizza il `localStorage` e aggiorna automaticamente qualsiasi vecchia scheda che conteneva l'immagine generica di fallback con la foto reale master da Supabase, garantendo uniformità al 100% su qualsiasi dispositivo e browser.

### E. Architettura Cloud Indistruttibile per Nuovi Vini Futuri
*   **Pipeline Automatica Backend:** Implementato l'endpoint `/api/wine-collection` (`api/_handlers/wine-collection.ts`) che gestisce l'upload autenticato delle immagini con `service_role` (bypassando le RLS di Supabase Storage) e il salvataggio automatico dell'intero catalogo sul Cloud Supabase (`site-images/wine_collection.json`).
*   **Client Cloud Service:** Il modulo `src/pizza/data/wineCloudService.ts` sincronizza bidirezionalmente `WineCardStudio` e `DeliveryMenu` con il Cloud di Supabase: qualsiasi modifica, cancellazione o aggiunta di un nuovo vino futuro viene immediatamente salvata nel Cloud e distribuita in tempo reale a tutti i clienti e workstation.

### F. Kitchen Display System (KDS) & PWA per Tablet Cucina (Samsung Tab A 8.0 & Smartphone Landscape)
*   **Architettura PWA Standalone:** Configurato `public/manifest.json` e tag dedicati in `index.html` per l'installazione nativa come Web App su Android (`display: standalone`, tema scuro `#111620`, icone native).
*   **Rotte Dedicate:** Montate le rotte `/kitchen` e l'alias `/kds` all'interno di `App.tsx`, con pulsanti di accesso rapido da `PizzaDashboard` e dalla barra di navigazione Admin.
*   **Zero-Lag su Hardware Datato:** Interfaccia KDS costruita specificamente per le risorse limitate del Samsung Galaxy Tab A 8.0 (2-3 GB RAM). Niente blur CSS pesanti (`backdrop-blur`), rendering pulito a 3 colonne tattili ("DA ACCETTARE", "IN FORNO / PREPARAZIONE", "PRONTE / IN CONSEGNA"), pulsanti touch giganti e contrasto visivo assoluto.
*   **Gestione Sonora Intelligente & Stop Immediato:** Allarme sintetizzato via **Web Audio API** ad alta penetrazione. Il suono squilla ininterrottamente solo per le nuove comande non gestite. Non appena lo staff tocca "ACCETTA ORDINE" o il pulsante rapido "SILENZIA SUONO", la suoneria viene stoppata istantaneamente e l'ID dell'ordine viene inserito in `acknowledgedOrderIds`, impedendo categoricamente qualsiasi riattivazione ciclica o ossessiva.
*   **Backend Status API (`/api/pizza-order-status`):** L'aggiornamento dello stato da parte del tablet viene instradato tramite endpoint serverless con privilegi `SUPABASE_SERVICE_ROLE_KEY` (bypassando i blocchi RLS di Supabase anon) e aggiorna contestualmente il messaggio Telegram del gruppo staff.
*   **Notifica Cliente in Tempo Reale (Fase 2):** Quando il pizzaiolo conferma "PIZZE SFORNATE ➔ PRONTE PER RIDER":
    1. Lo stato su Supabase diventa `delivering`, propagandosi istantaneamente allo schermo del cliente (`CheckoutFlow.tsx`), che passa al banner animato "🛵 IL RIDER È IN VIAGGIO!" con countdown del tragitto.
    2. Nella colonna 3 del tablet compare il pulsante dedicato `📲 AVVISA CLIENTE`: con un solo tocco apre la chat WhatsApp del cliente con messaggio trilingue (IT/EN/TH) precompilato che segnala l'avvenuta sfornatura e partenza del fattorino.
*   **Screen Wake Lock API:** Mantiene costantemente acceso lo schermo del tablet evitando lo spegnimento o lo stand-by durante il servizio serale, riacquisendo automaticamente il lock se il browser viene ridotto a icona e riaperto.
*   **Supabase Realtime & Auto-Polling di Riserva:** Ascolto immediato dei nuovi record su `pizza_orders` tramite WebSocket di Supabase con cadenza di polling di sicurezza ogni 15 secondi per garantire la ricezione anche in caso di instabilità di rete Wi-Fi.
*   **Failsafe Smartphone Orizzontale:** In caso di emergenza o guasto del tablet, la visualizzazione supporta l'orientamento orizzontale su qualsiasi smartphone Android/iOS, offrendo la stessa interfaccia completa.
