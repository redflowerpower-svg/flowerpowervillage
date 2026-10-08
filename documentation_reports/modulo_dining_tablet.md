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


