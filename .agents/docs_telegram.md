# Telegram Bot API Service Integration — Flower Power Village

## Overview
Il Bot Telegram di Flower Power Village svolge due compiti strategici fondamentali:
1. **AI Booking Concierge & Knowledge Assistant**: assistente intelligente per il gestore (Marco) che risponde a richieste di prenotazione multilingua (WhatsApp/Email), verifica in tempo reale disponibilità e prezzi su Octorate PMS, e acquisisce nuove nozioni/regole per sincronizzarle su Supabase e Google Drive Sheets.
2. **Notifiche Ordini Pizzeria & Ristorante**: invia notifiche in tempo reale degli ordini online e al tavolo, consentendo accettazione, rifiuto, stampa e aggiornamenti stato con tasti inline.

---

## Architettura & File di Riferimento
> **IMPORTANTE PER GLI AGENTI E PLAN MODE**: L'infrastruttura è **Next.js Serverless su Vercel** (nessun demone Telegraf permanente, nessun host Railway, nessuna memorizzazione in localStorage).

| Componente | Percorso File Reale | Ruolo |
| :--- | :--- | :--- |
| **Telegram Webhook** | `api/_handlers/telegram.ts` | Riceve gli update POST da Telegram (messaggi, callback_query, comandi). |
| **AI Concierge Engine** | `api/_helpers/ai-booking-concierge.ts` | Intent classification, estrazione parametri, generazione risposte Zero Noise, apprendimento continuo. |
| **Master Site Data** | `api/_helpers/village-site-data.ts` | Dati ufficiali alloggi (letti, terrazze, A/C, capienze), trasporti Mr. Gong, policy villaggio. |
| **Live PMS Checker** | `api/_helpers/octorate-live-checker.ts` | Query live API Octorate per verificare stanze libere, occupate e tariffe esatte. |
| **Concierge Memory** | `api/_helpers/concierge-memory.ts` | Persistenza regole e direttive gestionali nella tabella Supabase `concierge_memory`. |
| **Google Sheets Sync** | `api/_helpers/google-sheets-sync.ts` | Sincronizzazione automatica con il foglio Google Drive Master Sheet. |
| **Handshake Guide** | `.agents/CONCIERGE_HANDSHAKE.md` | Guida canonica anti-allucinazione per GPT in Plan Mode. |

---

## Variabili d'Ambiente & Credenziali
* `TELEGRAM_BOT_TOKEN`: Token del bot Telegram (fallback se non in DB). I token attivi sono salvati nella tabella Supabase `telegram_config`.
* `TELEGRAM_CHAT_ID`: Chat ID / Gruppo Telegram per le notifiche (salvato in `telegram_config`).
* `DEEPSEEK_API_KEY`: Chiave API DeepSeek V3 per estrazione intenti, compilazione Zero Noise e traduzioni multilingua.
* `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`: Connessione a Supabase per `concierge_memory`, `telegram_config`, `stored_documents`.
* `GOOGLE_SERVICE_ACCOUNT_EMAIL` / `GOOGLE_PRIVATE_KEY` / `GOOGLE_SHEET_MASTER_ID`: Accesso al Google Drive Master Sheet.
* `OCTORATE_TOKEN`: Credenziali API per il PMS Octorate.

---

## Flusso Operativo AI Concierge
```
[Messaggio Telegram]
       │
       ▼
api/_handlers/telegram.ts (Webhook POST)
       │
       ├─► Se comando /input o prefisso dati ──► KNOWLEDGE_UPDATE ──► Supabase + Google Sheet
       │
       ├─► Se risposta a messaggio precedente (Reply) ──► refineReplyWithFeedback (Human-in-the-Loop)
       │
       └─► Se richiesta cliente (Inquiry) ──► processBookingInquiry:
                 │
                 ├─► 1. DeepSeek estrae parametri (date, persone, camera, lingua)
                 ├─► 2. Octorate PMS Live Checker (disponibilità e prezzi reali)
                 ├─► 3. Generazione "Zero Noise" (filtro terrazzi, niente spam culle/pizze/sconti 30gg)
                 ├─► 4. Output Telegram con blocco <pre><code class="language-whatsapp">
```

---

## Formattazione & Copy con 1 Tocco
Le risposte per WhatsApp generate dal Concierge sono incapsulate nel tag Telegram:
```html
<pre><code class="language-whatsapp">...testo messaggio...</code></pre>
```
Questo consente all'operatore di copiare istantaneamente l'intero messaggio formattato con emoji e spaziatura con un singolo tocco su smartphone o click su desktop, senza limiti di 256 caratteri tipici dei pulsanti callback Telegram.
