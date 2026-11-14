# Guida di Rollback Dinamico — Clonazione Jungle Villas (`807324`) ➔ Flower Power Village (`366879`)

> **Documento Vivo & Dinamico**: questo file viene aggiornato ad ogni nuovo intervento/commit sul progetto di migrazione tra **Jungle Villas (`807324`)** e **Flower Power Village (`366879`)**.  
> Inoltre tutte le regole di pulizia su Octorate (`MIRROR-*` / `[MIRROR_SYNC]`) e Supabase (`mirror_res_%`) sono **dinamiche**: intercettano automaticamente anche tutte le prenotazioni specchio che verranno create in futuro dopo questa sessione.

---

## 1. Rollback Codice & Git
- **Commit di partenza prima di questa sessione**:
  - `staging`: `9875cab`
  - `main`: `3795734`
- **Commit creati in questa sessione sul branch `feature/clone-jungle-to-fpv`**:
  - `7cf0562` — Motore mirroring bilaterale, filtro anti-overbooking `[MIRROR_SYNC]`, endpoint switch, aggiornamento handler API.
  - `fb376a9` — Controlli grafici `⇄ Switcha` e `Sync Specchio` in `src/admin/resort/components/ResortDashboard.tsx`.
- **File creati/modificati**:
  - `api/_helpers/octorate-jungle-mirror.ts` *(nuovo)*
  - `api/_helpers/octorate-structures.ts`
  - `api/_helpers/octorate-auto-shield.ts`
  - `api/_helpers/octorate-move.ts`
  - `api/_helpers/octorate-cascade-sync.ts`
  - `api/_helpers/overbooking-detector.ts`
  - `api/_handlers/octorate-webhook.ts`
  - `api/_handlers/octorate.ts`
  - `api/_handlers/resort-sentinel.ts`
  - `api/_handlers/update-restriction.ts`
  - `api/_handlers/update-rateplan-restrictions-bulk.ts`
  - `api/_handlers/checkout.ts`
  - `api/[...route].ts`
  - `src/admin/resort/components/ResortDashboard.tsx`
- **Come annullare il codice**:
  ```bash
  git revert --no-commit <commit_merge_o_fb376a9> <commit_7cf0562>
  git commit -m "revert: rollback Jungle/FPV clone and mirror sync"
  git push
  ```

---

## 2. Rollback Nomi Camere su Jungle Villas (`807324`)
Durante la sessione sono stati rinominati i 4 alloggi madri su **Jungle Villas (`807324`)** aggiungendo il suffisso `2`. Per ripristinare i nomi originali eseguire `PATCH /connect/rest/v1/roomrates/807324/{id}`:

| ID Camera (`807324`) | Nome Attuale | Nome Originale da Ripristinare |
|---|---|---|
| `529773` | `Jungle Villa 2` | `Jungle Villa` |
| `495795` | `Jungle Villa Left 2` | `Jungle Villa Left` |
| `495796` | `Jungle Villa Right 2` | `Jungle Villa Right` |
| `494840` | `Peace & Love Villa 2` | `Peace & Love Villa` |

> Nessuna prenotazione reale, prezzo o derivata esistente su **Jungle Villas (`807324`)** è stata cancellata o alterata.

---

## 3. Rollback su Flower Power Village (`366879`)
### A) Cancellazione delle 43 prenotazioni specchio (`[MIRROR_SYNC]`)
Tutte le prenotazioni create dal mirroring su **Flower Power Village (`366879`)** sono riconoscibili in modo univoco perché hanno:
- `refer` che inizia con `MIRROR-`
- `privateNotes` contenente `[MIRROR_SYNC]`

Per eliminarle tutte senza toccare le altre prenotazioni reali di **Flower Power Village (`366879`)**:
- Scaricare `GET /connect/rest/v1/reservation/366879`
- Filtrare quelle con `refer.startsWith('MIRROR-')` o `privateNotes.includes('[MIRROR_SYNC]')`
- Eseguire `DELETE /connect/rest/v1/reservation/366879/{id}` (o `PATCH` con `status: 'CANCELLED'`).

### B) Camere clonate e 48 tariffe derivate
Sono state create su **Flower Power Village (`366879`)**:
- **Camera test temporanea**: `960378` (`TEST CLONE - DO NOT BOOK`)
- **4 camere madri**:
  - `960383` (`Peace & Love Villa`)
  - `960385` (`Jungle Villa Left`)
  - `960387` (`Jungle Villa Right`)
  - `960389` (`Jungle Villa` — Suite con `aggregateChildren: [960385, 960387]`)
- **48 tariffe derivate**: ID da `960391` a `960438`

> **Nota tecnica Octorate**: l'API pubblica `DELETE /roomrates` restituisce `405 Method Not Allowed`. Pertanto queste camere restano bloccate (`bookingEngine: false`, `stopSells: true`, `availability: 0`) e possono essere archiviate/eliminate manualmente dal pannello web di Octorate se desiderato, senza alcun impatto operativo sui bungalow esistenti di **Flower Power Village (`366879`)**.

---

## 4. Rollback Database Supabase (`telegram_config`)
Eliminare esclusivamente le righe di configurazione create per il mirroring:
```sql
DELETE FROM telegram_config
WHERE id = 'active_jungle_source_v1'
   OR id LIKE 'mirror_res_%';
```
Nessuna altra tabella Supabase (`octorate_tokens`, ordini, prenotazioni, documenti, ecc.) è stata modificata.



---

## Aggiornamento Fase 1 — Completamento Motore 52 Tariffe, Keep-Alive Asimmetrico, Chiusura Live Derivate e Dashboard (14 Nov 2026)

### 1. Chiusura Live su Octorate (48 Derivate Flower Power Village `366879`)
- Eseguita chiusura `POST /calendar/bulk` su tutte le **48 tariffe derivate Sacro Graal (`960391`–`960438`)** di **Flower Power Village (`366879`)** per 365 giorni (`2026-11-14` -> `2027-11-14`): `{ stopSells: true, closed: true, closedArrival: true, closedDeparture: true }`.
- Verifica live `GET /calendar/366879` eseguita su `2026-11-15` e `2027-01-08`: **`52/52` tariffe confermate bloccate (`matched52=52/52`, `missing=0`, `unlocked=0`)**, lasciando intatte le restanti camere/bungalow di `366879`.

### 2. Regole di Sicurezza e Regola Standby Asimmetrica Implementate
1. **Copertura integrale 52 tariffe (`4 Madri + 48 Derivate`)** in [`api/_helpers/octorate-jungle-mirror.ts`](file:///d:/01%20ANTIGRAVITY/flower-power-village-com/WorkTrees/Clone-Jungle-To-FPV/api/_helpers/octorate-jungle-mirror.ts) (`JUNGLE_RATE_PAIRS`, `getCompanionRateId`, `getJungleTwinRateIds`), poiché le derivate su Octorate hanno `rules.Restrictions = false`.
2. **Switch Sicuro in 2 Tempi (`switchActiveJungleStructure`)**:
   - **Tempo 1**: Prima chiude/mette in standby la struttura uscente su tutte le **52 tariffe** (compressione blocchi `compressDailyBulkItems` su `POST /calendar/bulk`) e attende conferma `200 OK`; in caso di errore si blocca subito (**zero overbooking**).
   - **Tempo 2**: Solo dopo esito positivo del Tempo 1, applica prezzi normali, disponibilità reale e restrizioni Sacro Graal su tutte le **52 tariffe** della struttura entrante e aggiorna `active_jungle_source_v1` su Supabase.
3. **Regola Standby Asimmetrica**:
   - **Flower Power Village (`366879`) in standby**: `Stop Sell 100%` per 365 giorni su tutte le 52 tariffe delle 4 ville (`960383`–`960438`).
   - **Jungle Villas (`807324`) in standby**: Alta/Media Stagione (`01 Nov - 31 Mag`) `Stop Sell 100%` su tutte le 52 tariffe; **Bassa Stagione Livello 2 (`01 Giu - 31 Ott`)** Keep-Alive **APERTO** sui soli giorni liberi (`availability > 0`) a prezzo **raddoppiato `2x`** con tetto `< 10.000 THB` (`computeStandbyKeepAlivePrice`), mantenendo chiuse tutte le tariffe AC e specchiando bidirezionalmente via webhook (`mirrorReservationToStandby` + doppia protezione anti-loop `MIRROR_TAG` + registro inverso `mirror_target_*`).

### 3. File Aggiornati in Questo Intervento (Branch `feature/clone-jungle-to-fpv`)
- Backend Engine & Handlers:
  - `api/_helpers/octorate-jungle-mirror.ts`
  - `api/_helpers/octorate-auto-shield.ts` (fix IDs `916816`, `495803`, `495976`)
  - `api/_helpers/octorate-cascade-sync.ts` (rispetto Keep-Alive `2x` su `807324` standby in Bassa Stagione + probe attivo)
  - `api/_handlers/octorate-webhook.ts` (esclusione `[MIRROR_SYNC]` da gap/overbooking, supporto `activeJungleSource`, mirror `minstay` su companion Mother ID)
  - `api/_handlers/update-restriction.ts` & `api/_handlers/update-rateplan-restrictions-bulk.ts` (instradamento Sacro Graal `planKey` solo verso la struttura attiva)
  - `api/_handlers/resort-sentinel.ts` (audit Sacro Graal / MinStay consapevole dello stato attivo vs standby su entrambe le strutture)
  - `api/_handlers/api-update-prices-stagionale.ts` (dual-write prezzi stagionali Madri verso companion rispettando Keep-Alive `2x` Bassa Stagione su `807324` standby)
  - `api/_handlers/octorate.ts` (aggiunti FPV BE IDs `960403, 960415, 960427, 960391` in `OFFICIAL_BE_RATE_IDS`, restituito `standbyTwins` in `handleOctorateGrid`, mirror `minstay` in `handleOctorateMinStay`)
- Frontend Filters, Booking Engine & Dashboard Calendario:
  - `src/admin/resort/lib/bookingFilters.ts` (`isMirrorSyncBooking` escluso da `isValidActiveBooking` e calcolo ricavi/prenotazioni)
  - `src/booking/lib/octorate.ts` & `src/booking/resort/config/accommodations.ts` (supporto FPV BE & Mother IDs + salvataggio `standbyTwins` e `activeJungleSource`)
  - `src/admin/resort/lib/octorateAdmin.ts` (catalogo FPV IDs, `STANDARD_7D_RATE_IDS`, esclusione `[MIRROR_SYNC]` da `calculateDynamicMinStay`)
  - `src/admin/resort/components/ResortVisualCalendar.tsx` (badge struttura attiva `JV 807324` / `FPV 366879`, filtro `[MIRROR_SYNC]` dalle righe principali, pulsante toolbar `👁️ Mostra Gemelle Standby (4)` con stato `STOP` / `2x Keep-Alive` / `MIRROR`)
  - `src/admin/resort/components/ResortDashboard.tsx` (dialog conferma Switch 2 Tempi + Keep-Alive `2x` e propagazione `activeJungleSource`)

### 4. Procedura di Rollback Aggiornata
1. **Codice**: `git revert 38d6ca9` su branch `feature/clone-jungle-to-fpv` (oppure tornare al branch stabile precedente senza intaccare il repo principale).
2. **Octorate Live**:
   - In attesa del mapping Channel Manager / Octorate, **Jungle Villas (`807324`)** resta la struttura attiva (`active_jungle_source_v1 = '807324'`) e **Flower Power Village (`366879`)** ha tutte le **52 tariffe (`960383`–`960438`) bloccate `stopSells: true` per 365 giorni**.
   - Se servisse riaprire manualmente `366879` o riallineare lo specchio, chiamare `POST /api/octorate-jungle-mirror` (`action: 'switch'` o `action: 'sync'`) dalla dashboard.

---

## 5. Doppia Verifica Profonda Read-Back (`GET /calendar`) — Switch in 2 Tempi Blindato (Commit `b11b14c`)

- **File aggiornati**:
  - `api/_helpers/octorate-jungle-mirror.ts`: aggiunti `pickVerificationSampleDates` e `verifyStructureCalendarState` dentro `switchActiveJungleStructure`:
    1. **Tempo 1**: `POST /calendar/bulk` porta l'uscente in standby asimmetrico su tutte le `52` tariffe (`4 Madri + 48 Derivate`).
    2. **Verifica Profonda 1**: read-back polling su `GET /calendar/{outgoing}` su fino a 4 date campione reali (domani, +15g, alta stagione, bassa stagione `01 Giu - 31 Ott`), con attesa iniziale `800ms` + retry ogni `1500ms` (max 5 tentativi). Verifica presenza `52/52` tariffe, `stopSells`, prezzi Madre (`2x` keep-alive se `807324` in Bassa Stagione) e disponibilità Madre. **Se fallisce, interrompe prima del Tempo 2 -> zero rischio overbooking.**
    3. **Tempo 2**: `POST /calendar/bulk` apre e allinea l'entrante su tutte le `52` tariffe (prezzi normali, disponibilità reali, Sacro Graal, 24 AC chiuse).
    4. **Verifica Profonda 2**: verifica in parallelo (`Promise.all`) su `GET /calendar/{incoming}` (apertura, prezzi normali e 24 AC chiuse) e ri-verifica su `GET /calendar/{outgoing}` (conferma che lo standby non sia stato alterato).
    5. Solo dopo conferma di entrambe le fasi aggiorna `active_jungle_source_v1` su Supabase e restituisce `verifiedPhase1`, `verifiedPhase2`, `verificationAttempts`, `verifiedSampleDates`.
  - `src/admin/resort/components/ResortDashboard.tsx`: dialoghi di conferma e alert post-switch aggiornati con dettaglio della Doppia Verifica Profonda.
- **Rollback rapido di questo step**: `git revert b11b14c` sul branch `feature/clone-jungle-to-fpv` (lascia intatti il motore 52 tariffe e il blocco live a 365 giorni su **Flower Power Village (`366879`)**).
- **Build check post-modifica**: `npx tsc --noEmit` (`0`), `npm run api:check` (`0`), `npm run build` (`vite built in 5.08s`, `2036` moduli).

---

## 6. Fix Cancellazione Specchio su Spostamento Camera Non-Gemella (Commit `2af1bdd`)

- **File aggiornato**: `api/_helpers/octorate-jungle-mirror.ts`
  - Estratto helper `cancelExistingMirrorReservation` (`DELETE` + fallback `PATCH CANCELLED` + pulizia chiavi `mirror_res_*` / `mirror_target_*` su `telegram_config`).
  - In `mirrorReservationToStandby`, la verifica di `existingMirrorId` avviene **prima** dell'uscita `!twin`: se una prenotazione viene spostata da una delle 4 ville gemelle verso una camera non gemella (es. `Fake Bungalow 1`), l'eventuale specchio `[MIRROR_SYNC]` viene cancellato automaticamente.
- **Rollback rapido**: `git revert 2af1bdd` su `feature/clone-jungle-to-fpv`.
- **Verifiche**: `npx tsc --noEmit` (`0`), `npm run api:check` (`0`).

---

## 7. Passo 0 Pre-Flight: Audit & Auto-Riparazione Prenotazioni prima dello Switch (Commit `929ed38`)

- **File aggiornato**: `api/_helpers/octorate-jungle-mirror.ts`
  - Aggiunti `fetchTwinActiveReservations` e `verifyAndRepairTwinReservationsBeforeSwitch` eseguiti **prima del Tempo 1** in `switchActiveJungleStructure`.
  - Scarica le prenotazioni attive delle 4 ville da entrambe le strutture (`outgoing` e `targetStructureId`), crea eventuali specchi `[MIRROR_SYNC]` mancanti su `targetStructureId`, rimuove eventuali specchi orfani non più presenti su `outgoing` e riesegue una lettura di conferma prima di procedere allo Stop Sell del Tempo 1.
- **Rollback rapido**: `git revert 929ed38` su `feature/clone-jungle-to-fpv`.
- **Verifiche**: `npx tsc --noEmit` (`0`), `npm run api:check` (`0`).

---

## 8. Fix Aggregate Suite (`JV` + `JVL`/`JVR`), Verifica Obbligatoria su Ogni Sync & Riallineamento Live 365 Giorni (Commit `31e78b7`)

- **Causa radice risolta**:
  - Su Octorate **Jungle Villa (`960389` / `529773`)** è una Suite aggregata con figlie `Jungle Villa Left` (`960385` / `495795`) e `Jungle Villa Right` (`960387` / `495796`). Inviare esplicitamente `availability: 0` sulla Suite nei giorni in cui una sola metà è occupata portava Octorate ad azzerare entrambe le figlie e, se inviati nello stesso batch delle derivate frammentate per `minstay`, lasciava giorni con `price: 0` su `960387` e disallineamenti su `960385`.
- **Modifiche codice (`31e78b7`)**:
  - `api/_helpers/octorate-jungle-mirror.ts`:
    - In `build52RateDailyEntries`: omette `availability` sulla Suite `jv` nei giorni con una sola figlia occupata (lasciando all'aggregazione Octorate il calcolo automatico) e rimuove `minstay` dalle 48 derivate riducendo il push da `791` a `202` blocchi.
    - In `postCalendarBulkBlocks`: invio in 2 ondate sequenziali (`Wave 1`: Suite, P&L, 48 Derivate -> pausa `1200ms` -> `Wave 2`: Madri figlie `JVL`/`JVR` così non vengono sovrascritte), chunk da `150` con pausa `500ms`.
    - In `syncCalendarBetweenStructures` e `syncActiveToStandbyCalendar`: aggiunta verifica read-back obbligatoria `verifyStructureCalendarState` (`6` tentativi, attesa iniziale `1500ms`, retry `2000ms`), estesa al controllo `availability === 0` sui giorni parziali della Suite `jv`.
  - `src/admin/resort/components/ResortDashboard.tsx`: `handleSyncJungleMirror` mostra nell'alert anche il resoconto della verifica read-back live.
- **Risultato Live 365 Giorni (`2026-11-14` -> `2027-11-14`)**:
  - Prenotazione `#130389443` mirrorata su `366879` (`PREFLIGHT_MIRRORED_CREATED: 1`).
  - Push `19.032` voci (`202` blocchi) da **Jungle Villas (`807324`)** -> **Flower Power Village (`366879`)**, verificato in `2` tentativi.
  - **Audit completo `1464/1464` giorni (`366` giorni x `4` ville Madri)**: **`zeroPriceDiffs: 0`**, **`priceDiffs: 0`**, **`availDiffs: 0`**, **`unlockedRates: 0`** (`52/52` tariffe confermate in `Stop Sell 100%`).
- **Rollback rapido**: `git revert 31e78b7` su `feature/clone-jungle-to-fpv`.
- **Verifiche**: `npx tsc --noEmit` (`0`), `npm run api:check` (`0`).
