# Guida di Rollback Completo — Clonazione Jungle Villas (`807324`) ➔ Flower Power Village (`366879`)

> **Scopo di questo documento**: se in qualsiasi momento decidessi di annullare tutto il lavoro fatto in questa sessione e riportare il sistema esattamente allo stato precedente, segui (o chiedi all'agente di eseguire) questi 4 passaggi nell'ordine indicato.

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
