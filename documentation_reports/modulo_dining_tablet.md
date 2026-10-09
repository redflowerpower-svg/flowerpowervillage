# 📱 Modulo Dining Tablet al Tavolo (`/dining`) - Specifiche & Allineamento Totale

Il modulo **Dining Tablet** è la web app dedicata agli ordini autonomi dei clienti direttamente ai tavoli del ristorante **Flower Power Pizza Ranong**.

---

## 🎯 1. Caratteristiche & Regole Operative

1. **Parità 100% di Catalogo con il Sito Ufficiale**:
   - Tutte le 14 categorie e tutti i piatti a catalogo (49 piatti di pasta, 35 pizze, 7 focacce, 3 sandwich, 3 burger, snack, dolci, bevande, birre e vini) sono visibili e sincronizzati.
   - Schede piatti arricchite con le nuove aggiunte (*Focaccia con Capocollo 190฿*, *Pizza Capocollo e Anacardi 350฿*).
   - Allineamento completo dei pattern di riconoscimento condimenti per tutte le salse di pasta (*Aglio Olio, Pomodoro, Pesto, Amatriciana, Bolognese, Carbonara, 4 Formaggi, Flower Power/Panna Funghi, Specialità di Mare, Lasagne*).
2. **Sconto Fisso al Tavolo (-5%)**:
   - Ogni articolo mostra il prezzo normale barrato e il prezzo scontato del 5% in evidenza con badge verde `-5% SCONTO TAVOLO`.
   - Nessun vincolo di primo ordine o minimo di spesa: applicato istantaneamente a tutto il carrello.
3. **Vini & Birre 100% Sbloccati & Gestione Disponibilità**:
   - Tutte le schede dei vini italiani ed esteri (sincronizzati da Supabase Cloud) e delle birre sono aperte e ordinabili al tavolo con filtri enoteca dedicati.
   - Sincronizzazione in tempo reale dello stato Esaurito / Disponibile per piatti e vini direttamente da Kitchen KDS e Dashboard Admin.
4. **Navigazione Categorie Ottimizzata (High Contrast & Zero Troncamenti)**:
   - Slider a schede mini-quadrate su mobile con sfondo caldo materico ad alto contrasto (`bg-[#ede5d8] border-[#cfbea6]`), testo in 2 righe pulite senza mai puntini di sospensione `...`.
   - Ridenominazione della categoria in **`Piatti del Giorno`** (`Piatti del` / `Giorno`) con traduzioni native DeepSeek.
   - Mantenuto l'intro auto-scroll teaser su mobile con timing calibrato (600ms start, 5200ms slow scroll, 450ms pause, 950ms return).
5. **Sicurezza Accesso & Network Gate (`DiningAdminAuth` & `networkAuthService`)**:
   - Protezione accesso al tablet tramite PIN/credenziali staff/admin con supporto nodo WiFi/IP autorizzato.
   - Gestione sessioni dining con supporto QR Code tavolo per ordinazione da smartphone cliente (`DiningQrModal.tsx`, `diningQrI18n.ts`).
6. **Esperienza Fluida Roving Tablet (Dispositivo Singolo Itinerante & Griglia Tavoli)**:
   - Accesso diretto al menu con selezione del tavolo. Quando un tavolo è occupato (`🟢 1 Ordine Attivo`), riaprendo il tavolo dal tablet il carrello reidrata automaticamente i piatti già ordinati e consente di inviare integrazioni comanda sullo stesso conto.
   - Chiusura automatica a 0ms del modale di checkout all'accettazione da parte della cucina (`ORDER_ACCEPTED` via BroadcastChannel) e ritorno alla Griglia Selezione Tavolo.
   - Linguetta flottante laterale destra (Edge-Hugger) identica al sito ufficiale, eliminando barre inferiori per non ostacolare la visuale dei piatti.
   - Modale prenotazione tavolo disattivata nel carrello (il cliente è già seduto al ristorante).
7. **Flusso Pagamento Unificato alla Cassa (Pay at Counter / Conto alla Cassa)**:
   - Eliminata la selezione forzata del metodo di pagamento al momento dell'invio dei piatti.
   - Singolo pulsante di azione: **`📨 INVIA ORDINE ALLA CASSA (-5%)`** con indicazione chiara che il conto verrà comodamente saldato alla cassa al termine della consumazione.
   - Payload ordine salvato con `payment_method: 'cassa'`.
8. **Sincronizzazione Atomica Kitchen Monitor (KDS)**:
   - All'accettazione della comanda da parte della cucina, l'allarme sonoro si arresta immediatamente a 0ms (`audioCtx.suspend()`).
   - Tutti gli ordini del tavolo vengono raggruppati a icona nel dock inferiore.
   - Alla chiusura del tavolo (`ORDER PAID`), tutti i record del tavolo vengono archiviati su Supabase e viene emesso l'evento `TABLE_SETTLED` per liberare il tavolo su tutti i tablet in sala.
9. **Lead Gen & Cross-Selling**:
   - Al checkout rilascia un **Coupon Sconto del 10%** inviato via messaggio per futuri ordini delivery da casa su `flowerpowerpizza.com`.
10. **Intestazione & Modale Selezione Tavolo Single-Screen (Mobile Portrait)**:
    - Intestazione del popup di benvenuto unificata su riga singola orizzontale (Icona Brand + Titolo + Sottotitolo a sinistra, Selettore Lingua a destra).
    - Griglia tavoli a 4 colonne (4 righe totali) con altezza ottimizzata per rientrare integralmente in 1 sola schermata senza generare barre di scorrimento su smartphone verticali.
11. **Separazione Architetturale Navbar Superiore & Banner Hero (Zero Duplicazioni)**:
    - **Navbar Superiore**: raccoglie tutti i controlli di sessione (pulsante tavolo con nome esteso e freccia cambio tavolo, senza etichette -5% ridondanti, pulsante QR Code Smartphone, tasto Salda Conto e cambio lingua).
    - **Banner Hero**: dedicato esclusivamente all'identità di brand (Logo Flower Power Pizza, Ranong Thailandia) e al messaggio promozionale (*Sconto Immediato del 5% su Tutto il Menu dal Tablet!* e Coupon 10% per i successivi ordini delivery da casa), con rimozione totale di badge o pillole duplicate.
12. **Traduzioni Certificate DeepSeek AI**:
    - Tutte le etichette, bottoni e dialoghi sono localizzati tramite API live DeepSeek in 5 lingue: 🇮🇹 IT, 🇬🇧 EN, 🇹🇭 TH, 🇩🇪 DE, 🇲🇲 MM.
13. **Pulsante Logout / Disconnessione Tablet nel Pop-up Tavoli**:
    - Nel popup iniziale di selezione tavolo (`MANDATORY TABLE SELECTION OVERLAY`), la barra superiore include ora un pulsante dedicato di Logout posizionato accanto al selettore della lingua.
    - Consente al personale di disconnettere istantaneamente il tablet rimuovendo le credenziali e il token locale (`fp_dining_tablet_unlocked`), riportando la web app alla schermata di accesso PIN/Admin.
14. **Carrello Condiviso Live in Tempo Reale (Live Shared Cart `diningLiveCartService`)**:
    - Quando un tavolo è attivo, tutti i dispositivi collegati (tablet della sala e smartphone dei clienti via QR code) si iscrivono al canale Realtime Broadcast (`dining_live_cart_<canonical>`) e al BroadcastChannel locale.
    - Ogni aggiunta, rimozione, modifica quantità o selezione extra nel carrello viene propagata istantaneamente a 0ms su tutti gli schermi dei commensali allo stesso tavolo.
    - I nuovi ospiti che scansionano il QR Code richiedono ed ottengono istantaneamente lo stato corrente del carrello dai peer connessi.
    - All'invio della comanda o al saldo del conto, il carrello condiviso viene svuotato atomicamente su tutti i dispositivi.
15. **Pulsante Annulla / Resetta Ordine (`X`) con Doppia Conferma di Sicurezza (2-Step Confirmation)**:
    - Inserito nella barra superiore a destra un tasto luxury compatto con icona `X` (`h-9 w-9`), armonizzato nello stile con i pill button della navbar.
    - **1° Click**: Il pulsante entra in stato di allerta pulsante (`bg-red-600 border-red-300 animate-pulse`), espandendosi per richiedere conferma nella lingua selezionata (*"Confermi?" / "Confirm?" / "ยืนยัน?" / "Bestätigen?" / "သေချာပြီလား?"*). Se non ricliccato entro 5 secondi, ritorna automaticamente allo stato neutro iniziale.
    - **2° Click**: Esegue `handleCancelAndResetTable()` che invia il broadcast di reset live (`broadcastClear`), azzera il carrello condiviso su tutti i dispositivi e riporta il tablet al pop-up iniziale di selezione tavolo.
16. **Top Navbar Elegante & Armonizzata (Luxury Pill Concept)**:
    - Eliminati testi prolissi nella navbar lasciando esclusivamente il logo ufficiale rotondo Flower Power Pizza.
    - Tutti i pulsanti della navbar (Tavolo, QR Code, Lingua, Salda Conto e Reset X) condividono la stessa altezza `h-9`, bordi arrotondati `rounded-xl`, texture scura `bg-stone-900/90` e accenti dorati `amber-400`.
17. **Rilevamento Automatico della Lingua su Smartphone QR (`normalizeLocaleToSupported`)**:
    - Quando i commensali inquadrano il QR Code del tavolo dal proprio smartphone, la web app legge `navigator.languages` e `navigator.language` del telefono.
    - **Mapping Birmano Certificato**: normalizza i codici ISO browser birmani `my`, `my-MM`, `my-ZG` (Zawgyi), `bur` ➔ **`MM`** aprendo istantaneamente il menu in Birmano.
    - **Rilevamento Standard**: riconosce `th`/`th-TH` ➔ `TH`, `de`/`de-DE` ➔ `DE`, `it`/`it-IT` ➔ `IT`, `en`/`en-US` ➔ `EN`.
    - **Fallback Turistico Internazionale**: qualsiasi dispositivo con lingua non supportata (es. francese, spagnolo, russo, svedese, cinese) ricade di default in modo garantito su **Inglese (`EN`)**.
18. **Studio & Generatore 16 QR Code Fisici Permanenti (`DiningTableQrStudio.tsx`)**:
    - Generazione dei 16 QR Code unici e permanenti (uno per ciascun tavolo da T1 a T16) con URL dedicata `/dining?table=T<N>&token=permanent_table_qr`.
    - Modalità di visualizzazione singola per tavolo con selettore rapido e modalità di stampa cumulativa in blocco (*Stampa 16 QR Code Sala*) formattata per etichette/segnatavolo con logo Flower Power, badge `-5% Sconto al Tavolo`, QR Code SVG/PNG ad alta risoluzione e istruzioni multilingua (*Inquadra per ordinare dal tuo smartphone*).
19. **Rilevamento Presenza Ospiti Istantaneo a 0ms & Tavolo Giallo Occupato (`diningTablePresenceService.ts`)**:
    - Nel preciso istante in cui un commensale inquadra il QR Code del tavolo dal proprio smartphone, il servizio di presenza invia un broadcast istantaneo prioritario (`GUEST_PRESENCE_PING`) a 0ms con heartbeat ciclico ogni 8 secondi.
    - Sulla griglia del tablet, il tavolo commuta istantaneamente in **Giallo/Ambra Occupato** (`bg-gradient-to-br from-amber-950/80 to-stone-900 border-amber-400 text-white ring-1 ring-amber-400/70`) con luce pulsante ambra e indicatore **`📱 N Ospiti Live / In Ordinazione`**, disabilitando lo stato verde libero.
    - Lo staff con il Dining Tablet roving può in qualunque momento toccare il tavolo occupato per entrare in visualizzazione/collaborazione in tempo reale con il carrello dei clienti.
20. **Ottimizzazione Scheda Piatto Mobile-First & Pulsante "Ordina" Compatto (`MenuGrid.tsx`)**:
    - La modale di personalizzazione del piatto si apre come un bottom sheet mobile a tutto schermo (`h-[92dvh] sm:h-auto sm:max-h-[88vh] rounded-t-[2rem] sm:rounded-[2rem]`), eliminando spazi sprecati e garantendo massimo comfort visivo.
    - Pulsante di conferma compatto e universale certificato via DeepSeek API (IT: `Ordina`, EN: `Order`, TH: `สั่งเลย`, DE: `Bestellen`, MM: `မှာယူပါ`), garantendo zero troncature di testo su qualsiasi smartphone.
    - Il footer sticky con selettore quantità compatto, totale finito scontato -5% e pulsante ad ampiezza elastica è protetto da overflow con supporto `safe-area-inset-bottom`.
21. **Pre-compilazione Dati Cliente su Comande Aperte & Pulizia Form (`DiningCheckoutModal.tsx`)**:
    - Se il tavolo ha già un ordine attivo in corso non saldato, alla riapertura del carrello i campi **Nome** ed **Email** vengono pre-compilati automaticamente con i dati inseriti nel primo invio.
    - Per i nuovi ordini o tavoli liberi, i campi partono al 100% puliti e vuoti (`""`).
    - Eliminati tutti i messaggi ridondanti sotto l'email (`emailHelper`), lasciando un form naturale, fluido e discreto.
22. **Automazione Voucher 10% Delivery al Tavolo & Email Multi-Lingua (`DiningCheckoutModal.tsx`, `dining-voucher-email.ts`, `pizza-order-submit.ts`)**:
    - Il campo Email al checkout del Dining Tablet è facoltativo e supporta l'autocompletamento nativo del browser (`name="email"`, `type="email"`, `autoComplete="email"`).
    - Banner promozionale localizzato in 9 lingue certificate DeepSeek AI che spiega l'opportunità di ricevere il coupon sconto 10% per i successivi ordini da asporto o consegna a domicilio sul sito web.
    - Generazione automatica del codice promo monouso `DINE10-XXXXX` con validità di 10 giorni, memorizzato nei metadati dell'ordine (`[DINING_VOUCHER: ...]`).
    - Spedizione in background tramite Nodemailer / Gmail SMTP (`flowerpowerpizzaranong.th@gmail.com`) del template email dark luxury con pulsante ad applicazione istantanea con 1 click (`https://flowerpowerpizza.com/?promo=DINE10-XXXXX`).

---

## 📱 8. Esperienza Mobile & Tablet Ottimizzata per Extra e Descrizioni

1. **Allineamento Full-Width Schede Personalizzazioni**:
   - Stessa interfaccia responsive 1-colonna su mobile / 2-colonne su tablet per la scelta degli ingredienti extra, livelli di piccantezza e varianti.
   - Rimozione totale di troncature su nomi lunghi e rimozione del micro-box a scorrimento limitato per un'esperienza touch impeccabile.
2. **Descrizioni Complete dei Piatti Senza Line-Clamp**:
   - Tutte le descrizioni e gli ingredienti dei cibi, paste, pizze e vini sono visibili al 100% senza puntini di sospensione.

