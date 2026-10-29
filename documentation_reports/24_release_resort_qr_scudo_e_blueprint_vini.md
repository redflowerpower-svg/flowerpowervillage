# Report Tecnico 24 · Rilascio Resort, Verifica QR Code, Scudo Pizzeria & Blueprint Carta dei Vini

> **Stato:** 🟢 RILASCIATO IN PRODUZIONE & CONGELATO  
> **Data:** 28 Ottobre 2026  
> **Branch:** `staging` ➔ `main` (Vercel Production)  
> **Domini:** `www.flowerpowervillage.com` | `www.flowerpowerpizza.com`

---

## 1. Mappatura Identità Univoche Alloggi & Convalida Ottica 16 QR Code

### A. Anatomia Architetturale (`ACCOMMODATION_IDENTITIES`)
Tutti i 18 alloggi del resort dispongono di una mappatura canonica immodificabile in `src/booking/resort/config/accommodations.ts`:
- **Legacy URL con prefisso numerico** (es. `/52-jungle-villa`, `/11-yellow-bungalow`, `/22-villa-penthouse`).
- **Canonical Slug moderno** (es. `jungle-villa`, `yellow-bungalow`, `villa-penthouse`).
- **Redirect Router Root in `App.tsx`**: qualsiasi richiesta verso una URL legacy reindirizza internamente a `/village?room=[legacySlug]`.
- **Sensore UX in `RoomGrid.tsx`**:
  1. All'ingresso con parametro `?room=...`, il componente individua l'alloggio tramite `findAccommodationIdentity()`.
  2. Apre automaticamente la **Modale Fotografica a Schermo Intero** con le foto reali della stanza.
  3. Alla chiusura della galleria, esegue uno **scroll morbido e fluido** centrando la scheda dell'alloggio sullo schermo, evidenziandola con un **bordo oro pulsante** e il badge bilingue `✨ ALLOGGIO SELEZIONATO`.

### B. Esito Scansione Ottica ZXing del Volantino Cartaceo (16 QR Code)
Scansionati ad alta definizione tutti i 16 codici QR del materiale cartaceo in circolazione:
- **Bungalows (3/3)**: Yellow (`11-yellow-bungalow`), Red (`12-red-bungalow`), Green (`13-green-bungalow`) ➔ Match 100%.
- **Glamping (2/2)**: Lagoon (`21-lagoon-tent`), Camel (`23-camel-tent`) ➔ Match 100%.
- **Guesthouse (6/6)**:
  - Room 1 ➔ `31-room-1` (Match 100%)
  - Room 2 ➔ `32-room-2` (Match 100%)
  - Room 3 ➔ `33-room-3` (Match 100%)
  - Room 4 ➔ `34-room-4` (Match 100%)
  - Room 5 ➔ `35-room-5` (Match 100%)
  - Room 6 ➔ `36-room-6`: camera dismessa (futuro cantiere Lodge 1 & 2 per l'anno prossimo). Il percorso `/36-room-6` è stato blindato a 3 livelli con reindirizzamento armonico su `/village`, azzerando qualsiasi rischio di errore 404 per gli ospiti con vecchi volantini.
- **Villas (5/5)**: Penthouse (`22-villa-penthouse`), Peace & Love (`51-villa-peace-love`), Jungle Villa (`52-jungle-villa`), Jungle Villa Left (`53-jungle-villa-left`), Jungle Villa Right (`54-jungle-villa-right`) ➔ Match 100%.

---

## 2. Triplo Scudo di Rimbalzo Pizzeria Ranong

Garantito il rimbalzo permanente dello storico scudo della pizzeria da qualsiasi dominio del gruppo verso il portale dedicato:
1. **Livello 1 - Edge Serverless Vercel (`vercel.json`)**: HTTP 308 permanente per `/flowerpowerpizzaranong` e `/flowerpowerpizza` (e relativi `/:path*`).
2. **Livello 2 - Static CDN (`public/_redirects`)**: Regola `301!` forzata per tutti i nodi CDN globali e proxy statici.
3. **Livello 3 - Client SPA React Router (`App.tsx`)**: Cattura immediata delle rotte con `RedirectToExternal` (`window.location.replace`).

---

## 3. Gestione Booking Resort & Tariffe

### A. VIP Transfer Aeroporto di Ranong con Mr. Gong (`DirectionsSection.tsx`)
- Modulo di prenotazione transfer trasparente e ad alta conversione in cima alla sezione Directions.
- 3 pilastri del servizio di cortesia:
  1. Accoglienza con cartello personalizzato al Gate dell'aeroporto di Ranong.
  2. Biglietti motoscafo già pronti in mano senza code alla biglietteria del molo.
  3. Linea diretta telefonica coi capitani della speedboat per coordinare e attendere i passeggeri dei voli pomeridiani in ritardo.
- Tabella radar integrata con i 3 voli giornalieri Bangkok Don Mueang (DMK) ➔ Ranong (UN) di AirAsia.

### B. Aria Condizionata Agoda Selettiva (Red, Green, Yellow)
- Apertura stagionale limitata al periodo 16 Dicembre ➔ 31 Marzo per i soli Red, Green e Yellow Bungalow.
- Stop-Sell al 100% per tutto l'anno sui restanti 15 alloggi del resort e fuori dall'alta stagione.
- Sincronizzazione atomica bulk confermata su Octorate API (HTTP 200 OK) e auto-guarigione notturna in `resort-sentinel.ts`.

### C. Dismissione HUBit@ & Sconti Soggiorni Lunghi (Long Stay)
- Rimosso qualsiasi riferimento alla fibra 100M/coworking.
- Sconto progressivo automatico nel Booking Engine:
  - **-15% di sconto**: da 15 a 29 notti.
  - **-20% di sconto**: da 30 notti in su (1 mese o più).
- Interamente tradotto in Italiano, Inglese, Tailandese e Tedesco.

---

## 4. Blueprint Carta dei Vini Dinamica GPS / Wi-Fi (Punto di Partenza per Domani)

### A. Il Problema & il QR Code Esistente
Il menu cartaceo della Pizzeria/Ristorante contiene il codice QR stampato:
`https://www.flowerpowervillage.com/wine-list`

### B. Regola di Business Condizionale
In Thailandia la vendita di alcolici online per consegna a domicilio è severamente regolamentata, mentre la somministrazione e l'ordine al tavolo nel locale sono legali e prioritari:
1. **Cliente IN PIZZERIA (Riconosciuto via Wi-Fi del locale o GPS)**:
   - Visualizza tutte le schede dei vini con foto reale della bottiglia, note sommelier e vitigno.
   - Visualizza chiaramente il **prezzo in Baht (THB)**.
   - **Ha a disposizione il Carrello e il pulsante di acquisto/ordinazione al tavolo**.
2. **Cliente FUORI DALLA PIZZERIA (Connessione remota, no GPS o no Wi-Fi locale)**:
   - Visualizza l'intera Carta dei Vini a scopo culturale/informativo.
   - **Visualizza regolarmente i prezzi ufficiali** (trasparenza totale della cantina).
   - **NON può acquistare**: il carrello è disattivato e il pulsante d'acquisto è sostituito da una nota informativa (*"Disponibile per la degustazione in sala da Flower Power Pizza a Ranong"*).

### C. Infrastruttura Tecnica Già Pronta per l'Integrazione:
- **Catalogo Vini Cloud**: `src/pizza/data/wineData.tsx` e `wineCloudService.ts` (sincronizzato con Supabase Storage `wine_collection.json`).
- **Verifica Wi-Fi Locale**: `src/pizza/services/networkAuthService.ts` (`checkNetworkAccess()`).
- **Admin Studio**: `src/admin/pizza/components/WineCardStudio.tsx` (gestione annate, disponibilità e prezzi).
- **Prossima implementazione**: Componente dedicato `WineListPage.tsx` su `/wine-list` con rilevamento ibrido GPS + Wi-Fi.

