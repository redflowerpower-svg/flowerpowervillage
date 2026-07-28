# Handoff — Integrazione API Octorate (Channel Manager)

**Data:** 24 Luglio 2026
**Referente:** Marco Damonte
**Fornitore:** Octorate — supporto tecnico API: openapi@octorate.com

---

## 1. Contesto

Il sito è già collegato al channel manager Octorate, ma **non è possibile scrivere via API** prezzi, minimo notti e altri dettagli di disponibilità/tariffe. Obiettivo dell'analisi: capire se l'API è realmente di sola lettura e, se no, individuare l'endpoint corretto e la causa del blocco.

**Conclusione principale:** l'API **non** è di sola lettura. Esiste un endpoint dedicato e completo per la scrittura di prezzi/disponibilità/restrizioni (`POST /rest/v1/calendar/bulk`, vedi sezione 5). Il blocco riscontrato è quasi certamente un problema di **permessi account/contratto**, non un limite tecnico della API.

---

## 2. Credenziali e accesso

Ricevute due tipologie di credenziali, da non confondere:

| Tipo | Uso | Dati |
|---|---|---|
| Accesso pannello Octorate | Login via browser al gestionale | Utente: `api_test_marco_damonte_-_366879` · ID: `624167` |
| Credenziali API (client_id / client_secret) | Sviluppo integrazione, inviate in email separate | Da recuperare dalle email dedicate del reparto commerciale |

⚠️ Le credenziali API (client_secret) non vanno mai inserite in frontend o pagine ispezionabili da terzi. In caso di sospetto compromissione, contattare subito Octorate per la revoca.

---

## 3. Flusso di autenticazione OAuth 2.0

Octorate usa OAuth 2.0 come metodo di autenticazione principale (in alternativa esiste un metodo server-to-server via API Key, vedi 3.5).

### 3.1 — Creazione link di autorizzazione

Il partner genera un link che il cliente (proprietario struttura) usa per autorizzare l'integrazione:

```
https://admin.octorate.com/octobook/identity/oauth.xhtml?client_id={client_id}&redirect_uri={redirect_uri}&state={valore_a_scelta}
```

Parametri:
- `client_id` — public key del partner
- `redirect_uri` — pagina dove Octorate reindirizza dopo il login
- `state` — opzionale, consigliato per sicurezza

### 3.2 — Whitelist della redirect_uri

La `redirect_uri` **deve** essere in whitelist (sia versione test che produzione), altrimenti l'OAuth fallisce.

- **In test:** autonomamente via API — `POST /rest/v1/api/configuration`
- **In produzione:** richiedere via email a `openapi@octorate.com`

### 3.3 — Ricezione authorization code

Dopo login e conferma da parte del cliente, Octorate reindirizza a `redirect_uri` aggiungendo un parametro `code` nell'URL.

⚠️ **Il code scade in pochi secondi** — va scambiato immediatamente con una chiamata server-to-server (max 1 minuto).

### 3.4 — Scambio code → access token + refresh token

```
POST https://api.octorate.com/connect/rest/v1/identity/token
Content-Type: application/x-www-form-urlencoded

client_id={client_id}
client_secret={client_secret}
redirect_uri={redirect_uri}
grant_type=code
code={code_ricevuto}
```

Risposta:
- `access_token` — usato in ogni chiamata API nell'header: `Authorization: Bearer {access_token}`
- `refresh_token` — non scade mai, usato per rinnovare l'access token
- `expireDate` — scadenza dell'access token (24 ore)

### 3.5 — Refresh del token

```
POST https://api.octorate.com/connect/rest/v1/identity/refresh
```

Da chiamare prima che l'access token scada (24h). Il refresh token non scade mai.

### 3.6 — Metodo alternativo: apilogin (server-to-server puro)

Per operazioni che non richiedono il coinvolgimento dell'utente finale (es. creare nuove proprietà):

```
POST https://api.octorate.com/connect/rest/v1/identity/apilogin
Content-Type: application/x-www-form-urlencoded

client_id={client_id}
client_secret={client_secret}
```

Nota dalla documentazione: questo token è dedicato a operazioni "Api Only" (es. creazione nuove properties), diverso dal flusso OAuth con grant utente.

### 3.7 — Risorse ufficiali

- Portale integrazione: https://api.octorate.com/connect/
- Guida step-by-step con esempi curl: https://api.octorate.com/connect/showcases/authentication.html
- Swagger interattivo (prova le chiamate): https://api.octorate.com/connect/docs/
- Spec OpenAPI completa (YAML, usabile anche per import in Postman): https://api.octorate.com/connect/rest/v1/integration/openapi.yaml
- Supporto tecnico: openapi@octorate.com

---

## 4. Note operative generali sull'API

- Formato: REST, risposta sempre JSON, verbi standard `GET / POST / PATCH / DELETE`
- Spec in formato OpenAPI v3 (YAML), generata dinamicamente — sempre aggiornata all'URL sopra
- Rate limit: **100 chiamate per accommodation ogni 5 minuti** — ottimizzare le chiamate, es. con `calendar/bulk` per aggiornamenti massivi invece di tante chiamate singole
- Ambiente di test disponibile prima della certificazione per la produzione (contattare Octorate per passare in produzione)
- Codici di errore rilevanti: `404`/`400` = dati mancanti/malformati; `550` = errore lato partner OTA collegato; `500-503` = errore interno Octorate

---

## 5. Endpoint chiave per il problema riscontrato (prezzi / minimo notti / disponibilità)

Tag nella spec: **"ARI: Calendar"** (ARI = Availability, Rates, Inventory)

### 5.1 — Lettura (già funzionante)

```
GET /rest/v1/calendar/{accommodation}
```
Parametri: `product[]`, `dateFrom`, `dateTo`, `size`, `page`
Restituisce per ogni camera/giorno: `availability`, `price`, `minStay`, `maxStay`, `stopSells`, `closeToArrival`, `closeToDeparture`, `cutOffDays`, `bookable`

### 5.2 — Scrittura (endpoint da usare per risolvere il problema)

```
POST /rest/v1/calendar/bulk
```

Body (array di oggetti):

```json
[
  {
    "room": 253166,
    "dateFrom": "2026-08-01",
    "dateTo": "2026-08-07",
    "values": {
      "availability": 2,
      "price": 120.00,
      "minstay": 3,
      "maxstay": 14,
      "stopSells": false,
      "closeToArrival": false,
      "closeToDeparture": false,
      "cutOffDays": 0
    }
  }
]
```

Campi modificabili in `values`: `availability`, `price`, `minstay`, `maxstay`, `stopSells`, `closeToArrival`, `closeToDeparture`, `cutOffDays`

⚠️ Nota quota: ogni 15 room/day aggiornati consuma una quota aggiuntiva — ottimizzare le chiamate.

### 5.3 — Check disponibilità puntuale

```
GET /rest/v1/calendar/{accommodation}/{productId}/availabilityCheck?startDate=...&endDate=...
```
Risponde `200` (disponibile) o `406` (non disponibile).

---

## 6. Sicurezza / autenticazione a livello di spec

La spec OpenAPI definisce due schemi di sicurezza globali, applicati genericamente a tutte le operazioni (incluso `calendar/bulk`):

- `OAuthLogin` (flusso descritto in sezione 3)
- `Key` (autenticazione tramite API Key, come metodo secondario)

**Importante:** a livello di specifica tecnica, `POST /rest/v1/calendar/bulk` **non ha uno scope di scrittura bloccato o differenziato** — richiede la stessa autenticazione standard di tutte le altre chiamate. Questo significa che il "sola lettura" che state riscontrando **non è previsto/documentato nella spec pubblica**.

---

## 7. Diagnosi del problema "non riusciamo a scrivere prezzi/minimo notti"

Cause più probabili, in ordine di probabilità:

1. **Endpoint sbagliato in uso** — probabile uso di `GET /rest/v1/calendar/{accommodation}` (sola lettura) invece di `POST /rest/v1/calendar/bulk` (scrittura)
2. **Permesso di scrittura non abilitato lato contratto/account** — restrizione decisa da Octorate a livello commerciale, non visibile nella documentazione pubblica
3. **Account ancora in ambiente di test**, non certificato per la produzione

---

## 8. Prossimi passi consigliati

- [ ] Verificare nel codice esistente quale endpoint viene effettivamente chiamato per aggiornare prezzi/minstay
- [ ] Testare `POST /rest/v1/calendar/bulk` con un payload di prova (vedi esempio sezione 5.2) e controllare il codice di risposta HTTP:
  - `200` → funziona, il problema era l'endpoint sbagliato
  - `401` / `403` → problema di permessi account → scrivere a openapi@octorate.com citando esplicitamente `POST /rest/v1/calendar/bulk`
- [ ] Se in ambiente di test: verificare con Octorate lo stato di certificazione per la produzione
- [ ] Verificare whitelist della redirect_uri di produzione (se non già fatto) via openapi@octorate.com

---

## 9. Contatti utili

- Supporto tecnico API: **openapi@octorate.com**
- Reparto commerciale: per accordi su rilascio credenziali e permessi di scrittura
- Portale integrazione: https://api.octorate.com/connect/
