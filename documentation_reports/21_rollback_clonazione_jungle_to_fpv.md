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
