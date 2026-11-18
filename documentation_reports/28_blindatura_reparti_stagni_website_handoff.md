# 🛡️ Handoff Isolamento & Blindatura Totale Website (Pizzeria · Social · Admin)

> **Origine**: Conversazione `29691d8d-c456-4fac-8a6e-a621042465e8`  
> **Branch**: `staging` (allineato con `origin/main` commit `87ebbc9` e `origin/staging` commit `57e0b58`)  
> **Data Checkpoint**: `18/11/2026`  
> **Stato Attuale**: 🟢 **COMPLETATO (Blocco A + Blocco B + Blocco C + App ErrorBoundary Fix + Contratto /docs) — 58/58 test contrattuali verdi (`npm run verify:all`)**

---

## 1. Stato Già Blindato e in Produzione (Non da rifare)

I seguenti livelli architetturali sono **già attivi in produzione** e protetti ad ogni rilascio (`npm run verify:all`, `scripts/project-sync.mjs`, `scripts/branch-merge.mjs` e GitHub Actions `.github/workflows/booking-regression-guard.yml`):

1. **Layer Base Octorate Puro (Villaggio / PMS)**:
   - `api/_helpers/octorate-client.ts` (`postOctorateCalendarBulkWithRetry`, `parseOctorateTimestampMs`)
   - `api/_helpers/octorate-catalog.ts` (18 alloggi canonici, 52 coppie gemelle Jungle/FPV, Fake Bungalows, mappe tariffe Sacro Graal)
   - `api/_helpers/octorate-minstay.ts` (`calculateServerDynamicMinStay`, `DynamicMinStayUpdate`)
   - Cancellazioni gemelle a latenza zero (`octorate-webhook.ts`, `octorate-jungle-mirror.ts`) + sentinella `resort-sentinel.ts` (`1.490` tariffe controllate).
2. **Firewall AST Compartimenti Stagni Esterni (`tests/booking/compartment-boundaries.contract.test.ts`)**:
   - Impedisce import incrociati tra i macro-reparti `/villaggio`, `/pizze`, `/social` e `/docs` su backend (`api/`) e frontend (`src/`), vieta `api/_helpers/* -> api/_handlers/*` e protegge la purezza del Layer Base Octorate.
3. **Suite di 33 Test Contrattuali Offline (`tests/booking/*.contract.test.ts`, < 0,4s)**:
   - Booking/Octorate (`19` test su Cascata, MinStay, Hard Lock, 3 Strutture `366879`/`807324`/`619403`, Mirror & Keep-Alive Luglio).
   - Geofence Pizzeria Ranong (`tests/booking/pizza-compartment.contract.test.ts`).
   - Motore Pagamenti & VAT 7% + Regole Copywriter Bilingue Social (`tests/booking/payments-and-social.contract.test.ts`).
   - Fault Barrier anti-crash sul Gateway API centrale (`api/[...route].ts`).

---

## 2. Cosa Resta da Blindare nella Nuova Chat (Piano di Attacco in 3 Blocchi)

Mentre i **muri esterni tra macro-reparti** sono già al 100%, all'interno di **Pizzeria**, **Social Studio** e **Dashboard Admin** i sotto-reparti interni condividono ancora file senza confini AST né test contrattuali interni. Eseguire questi 3 blocchi in sequenza (uno step alla volta con `npm run verify:all`):

### Blocco A — Blindatura Interna Pizzeria (`/pizze`, `/dining`, `/kitchen`, `/admin/pizza`)
1. **Confini AST Interni in `tests/booking/compartment-boundaries.contract.test.ts`**:
   - Isolare **Delivery Online** (`src/pizza/pages/DeliveryMenu.tsx`, `src/pizza/components/CheckoutFlow.tsx`, `src/pizza/utils/validation.ts`, `src/pizza/utils/distance.ts`, `src/pizza/utils/geofence.ts`) rispetto a **Sala Tavoli QR `/dining`** (`src/pizza/pages/DiningTabletSite.tsx`, `src/pizza/utils/tableUtils.ts`, `src/pizza/services/diningSessionService.ts`, `src/pizza/services/diningLiveCartService.ts`, `src/pizza/services/diningTablePresenceService.ts`) e rispetto a **Cucina KDS `/kitchen`** (`src/admin/pizza/components/KitchenTabletKDS.tsx`, `src/admin/pizza/utils/kdsExtraDictionary.ts`).
   - Verificare esplicitamente quali utility condivise restano nel Layer Base Pizzeria (`src/pizza/utils/`, `src/pizza/data/menuData.ts`, `src/pizza/data/wineData.tsx`, `src/pizza/services/pizzaServiceStatus.ts`) e congelarle come puro layer base.
2. **Nuova Suite Test Contrattuali Offline (`tests/pizza/pizza-internal.contract.test.ts`)**:
   - `src/pizza/utils/tableUtils.ts`: mappatura postazioni tavoli `T1..T10`, asporto/consegna, parsing identificativi sessione.
   - `src/pizza/utils/validation.ts` & `src/pizza/utils/distance.ts`: validazioni form ordine e calcoli distanza Ranong.
   - `src/pizza/utils/dietary.ts` & `src/pizza/utils/orderMetadata.ts`: tag allergeni/diete e serializzazione metadati ordini.
   - `src/admin/pizza/utils/kdsExtraDictionary.ts`: dizionario extra KDS bilingue EN/TH.
   - *(Nota: aggiornare `scripts/run-booking-tests.mjs` per includere anche `tests/pizza/*.test.ts` e `tests/social/*.test.ts`, oppure inserire le nuove suite direttamente dentro `tests/booking/` se si preferisce mantenere il runner unico attuale senza modifiche rischiose).*

---

### Blocco B — Blindatura Interna Social Media Studio (`/social`)
1. **Isolamento Audit TikTok (`TikTokAuditStudioPage.tsx`, Regola 5 `.agents/AGENTS.md`)**:
   - Aggiungere in `compartment-boundaries.contract.test.ts` un controllo AST che vieti tassativamente a `src/social/pages/TikTokAuditStudioPage.tsx` di importare qualsiasi componente o servizio sperimentale da `AutoCutStudioPage.tsx`, `VisualMotionStudio.tsx` o `autoCutLabEngine.ts`.
2. **Nuova Suite Test Contrattuali Social (`autoCutLabEngine`, `autoCutRulesRegistry`, `visualMotionEngine`)**:
   - **Regola 7**: Verificare che per le foto Website degli alloggi del Villaggio vengano selezionate esclusivamente le 4 traiettorie Pan & Scan ammesse (`pan_left_to_right`, `pan_right_to_left`, `diagonal_up_right`, `diagonal_up_left`) con partenza differenziata per alloggio e zero zoom/tilt verticale.
   - **Regole 8 & 12**: Esclusione categorica bevande (`Soft Drinks & Water`, `Beers`, `Wines`, `Coffee Shop`, `Fruit Drinks`) e piatti contrassegnati Sold Out nei montaggi `P1`, `P2`, `P3`.
   - **Regola 9**: Esclusione categorica foto bagni/toilet (`Toilet`, `Bathroom`, `washroom`) nei montaggi Villaggio `V1`, `V2`, `V3` e integrità stesso alloggio in `V2`.
   - **Regole 13 & 14**: A capo semantico naturale nei titoli bilingue Thai sopra / Inglese sotto (zero tagli di sillaba Thai) e calcolo `thumbnailTimestamp` rigorosamente pre-dissolvenza (`< scene1Dur - dissolveDur`).

---

### Blocco C — Pulizia Mirata Errori TypeScript in `src/social/`, `src/admin/` e `api/`
Durante `npm run typecheck` (`tsc --noEmit -p tsconfig.app.json`) e check `tsc` backend sono stati individuati disallineamenti di tipo preesistenti che conviene chiudere chirurgicamente (uno per volta con `npm run verify:all`):
1. `src/social/services/autoCutRulesRegistry.ts` (riga 413): proprietà `DS` duplicata in object literal.
2. `src/social/services/autoCutIntelligence.ts` (riga 713): riferimento `fullCaption` non definito.
3. `src/social/services/autoCutLabEngine.ts` (riga 1565): `isSoldOutTonight` mancante sull'interfaccia `AutoCutTestRun`.
4. `src/social/services/telegramStudioDispatcher.ts` (riga 124): union narrowing mancante su `topicConfig.targetFacebookGroupUrl`.
5. `src/admin/payments/store/usePaymentsAdminStore.ts` (riga 176): `active_promptpay_provider` tipizzato `string` invece di `PromptPayProvider`.
6. `src/admin/pizza/components/AddTableItemsModal.tsx` (riga 22): importa `PizzaOrder` da `usePizzaAdminStore` dove non risulta esportato.

---

## 3. Regola di Esecuzione Sicura
- Procedere rigorosamente **step-by-step** su branch `staging` (o feature branch dedicato con merge via `MERGE-BRANCH`).
- Eseguire `npm run verify:all` **prima** e **dopo** ogni singolo intervento.
- Non modificare le formule live di business salvo i 6 fix di tipizzazione del Blocco C (da verificare con particolare attenzione al punto 1 `autoCutRulesRegistry.ts:413`).
