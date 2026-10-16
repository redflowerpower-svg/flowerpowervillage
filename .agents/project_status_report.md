# Project Status Report — Flower Power Village & Pizza

**Data Aggiornamento**: 16 Ottobre 2026  
**Ambiente**: Produzione Globale (`main` -> `flowerpowerpizza.com` & `flowerpowervillage.com`)  
**Security Audit**: 0 Secrets Detected • Vault Cifrato `.secret_docs/api_credentials_report.md.enc`

---

## 🍕 Reparto Pizzeria & Dining Food Delivery (`/pizza`, `/dining`, `/kitchen`)

### 1. Risoluzione Crash Dropdown Primi Piatti (Website Delivery)
- Risolto `ReferenceError: PASTA_FILTER_LABELS is not defined` in `DeliveryMenu.tsx`.
- Definito e inserito `PASTA_FILTER_LABELS` in tutte le 9 lingue certificate DeepSeek AI (`IT`, `EN`, `TH`, `MM`, `DE`, `ES`, `FR`, `RU`, `ZH`) in `src/pizza/data/subSectionsI18n.ts`.
- Il dropdown "Condimento / Tipo di Pasta" filtra regolarmente le 49 paste e specialità senza errori.

### 2. Rinomina Completa "Torta al Cioccolato" (9 Lingue Certificate DeepSeek)
- Sostituito in tutto il catalogo e nei componenti il vecchio nome "Torta della Nonna al Cioccolato" con il nome compatto e universale **"Torta al Cioccolato"** (e corrispondenti traduzioni certificate DeepSeek: *Chocolate Cake*, *เค้กช็อกโกแลต*, *ချောကလက်ကိတ်*, *Schokoladenkuchen*, *Tarta de Chocolate*, *Gâteau au Chocolat*, *Шоколадный торт*, *巧克力蛋糕*).
- Aggiornati `menuData.ts`, `DeliveryMenu.tsx`, `CartDrawer.tsx`, `CheckoutFlow.tsx`, `MenuGrid.tsx`, `KitchenDishAvailabilityModal.tsx` e report di documentazione.

### 3. Ottimizzazione Visiva Selettore Tavoli Tablet Dining (`/dining`)
- Rimosso il prefisso lungo "Conto Aperto:" sostituendolo con **"Aperto:"** (`activeCardPrefix`) in tutte le 9 lingue.
- L'importo totale consumato dal tavolo (es. `APERTO: ฿5271`, `APERTO: ฿440`) è ora al 100% visibile e mai troncato da ellissi o tagli grafici.

### 4. Annullamento Comande al Tavolo con Tasto X (Pulsante & Banner a 2 Step)
- Potenziata la logica di `handleCancelAndResetTable` in `DiningTabletSite.tsx`.
- Ora aggiorna lo stato degli ordini attivi su Supabase e tramite backend `/api/pizza-order-status` impostando `status: 'rejected'` (stato ufficiale consentito dal check constraint PostgreSQL `pizza_orders_status_check`).
- Notifica immediata tramite `BroadcastChannel` (`pizza_orders_channel`, `flower_power_orders_channel`, `pizza_table_channel`) per rimuovere all'istante le comande dallo schermo del Kitchen KDS (`KitchenTabletKDS.tsx`).
- Revoca automatica della sessione QR tavolo (`revokeDiningTableSession`) e ripristino istantaneo dello stato **`LIBERO`** (`NUOVO ORDINE`).
- Puliti e archiviati i vecchi ordini di test accumulati su Tavolo 2.

### 5. Blocco Univoco Postazione Tavolo in Checkout Dining Tablet
- In `DiningCheckoutModal.tsx`, la postazione del tavolo assegnata in sala è visualizzata come badge fisso dorato immutabile e non modificabile dal cliente.

---

## 🏖️ Reparto Villaggio Koh Phayam (`/villaggio`, `/booking`)
- Booking engine, canali Octorate e gestione alloggi attivi e sincronizzati.
- Rate plan madre / derivate conformi alla Regola d'Oro Octorate API.
- Gestione pagamenti Ksher Pay e Stripe allineata.

---

## 🔒 Sicurezza & Vault
- Audit di sicurezza: **0 segreti rilevati**.
- Vault locale cifrato con `AES-256-GCM` in `.secret_docs/api_credentials_report.md.enc`.
