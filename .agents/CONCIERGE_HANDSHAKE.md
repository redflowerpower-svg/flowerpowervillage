# AI CONCIERGE BOT — ARCHITETTURA E HANDSHAKE (PER GPT E PLAN MODE)

> **AVVISO PER GPT / PLAN MODE**: Questo documento rappresenta la **VERITÀ ARCHITETTURALE REALE** del progetto Flower Power Village. 
> Non proporre mai file fittizi come `src/bot/...`, demoni continui `telegraf`, host Railway o persistenza in `localStorage`. Il progetto è basato su architettura **Vercel Serverless (Next.js)** e API routes serverless TypeScript.

---

## 1. Stack Tecnologico & Runtime
- **Runtime**: Next.js Serverless Functions su Vercel (Edge/Node Serverless).
- **Linguaggio**: TypeScript (`.ts`) con export di handler compatibili Vercel.
- **Webhook Telegram**: Serverless POST endpoint registrato su Telegram Bot API (`https://api.telegram.org/bot<TOKEN>/setWebhook`).
- **Database & Storage**: Supabase PostgreSQL (`concierge_memory`, `telegram_config`, `stored_documents`).
- **Spreadsheet Sync**: Google Drive Master Sheet (`1nIcY5NiQmoDlM3LND_VCPWO2JC8UqHxhpe9LdmC6u9E`) tramite `google-sheets-sync.ts`.
- **PMS Live Data**: Octorate API (`api/_helpers/octorate-live-checker.ts`) per disponibilità e prezzi reali in tempo reale.
- **Modello AI**: DeepSeek V3 (`deepseek-chat`) tramite API REST HTTPS (`https://api.deepseek.com/chat/completions`).

---

## 2. Mappa dei File Reali del Bot
| File / Percorso | Ruolo Operativo |
| :--- | :--- |
| `api/_handlers/telegram.ts` | **Entrypoint Webhook Telegram**. Riceve aggiornamenti da Telegram (richieste ospiti, comandi `/input`, callback query, reply con feedback). |
| `api/_helpers/ai-booking-concierge.ts` | **Motore Core AI Concierge**. Classificazione intenti (`GUEST_INQUIRY` vs `KNOWLEDGE_UPDATE`), estrazione parametri, generazione risposte "Zero Noise", rielaborazione con feedback umano. |
| `api/_helpers/village-site-data.ts` | **Dataset Master del Villaggio**. Specifiche esatte di alloggi (letti, terrazzi, A/C), trasporti a 4 fasi, Mr. Gong, policy e ristorazione. |
| `api/_helpers/octorate-live-checker.ts` | **Verifica Live PMS**. Query a Octorate per verificare stanze libere, occupate e tariffe esatte. |
| `api/_helpers/concierge-memory.ts` | **Memoria Attiva Regole**. Lettura e memorizzazione direttive da Supabase `concierge_memory`. |
| `api/_helpers/google-sheets-sync.ts` | **Sincronizzazione Google Sheets**. Aggiorna il foglio Google Drive con le nuove nozioni e regole. |

---

## 3. Specifiche Alloggi & Regole di Verità (Ground Truth)
### Guesthouse
- **Guesthouse Room 1**: Letto King Size (+ eventuale letto singolo extra). Ampio terrazzo privato con tavolo e sedie.
- **Guesthouse Room 2**: Letto King Size. Terrazzino piccolo privato.
- **Guesthouse Room 3**: Letto King Size. Spazioso terrazzo privato con tavolo e sedie.
- **Guesthouse Room 4**: Letto King Size. Spazioso terrazzo privato con tavolo e sedie affacciato sul giardino.
- **Guesthouse Room 5**: Letto King Size. **Senza terrazzo/balcone**.
- **Lodge 1 & Lodge 2**: **Attualmente NON disponibili per prenotazioni** (ancora in fase di costruzione).

### Ville & Gerarchia Strutturale Jungle Villa (IMPORTANTE)
- **Jungle Villa (Intera)**: È la villa più grande del villaggio per 2 famiglie o gruppi (fino a 8 persone: 4 adulti + 4 bambini). È composta dall'unione delle due ali gemelle: **Jungle Villa Left + Jungle Villa Right**. Offre 2 ingressi, 2 piani, 2 bagni privati, 2 cucine e 2 salotti.
  - ⚠️ **REGOLA FERREA**: **Jungle Villa (intera)** NON può MAI essere proposta insieme a Jungle Left e Right come se fossero opzioni alternative! Chi prenota Jungle Villa occupa già entrambe le ali. Per gruppi di 6-8 persone si propone unicamente la **Jungle Villa Intera**.
  - **Jungle Villa Left** (2+2 pax) e **Jungle Villa Right** (2+2 pax) si propongono singolarmente solo a piccoli gruppi/famiglie di 2–4 persone.
- **Villa Penthouse**: Per 4 persone (2 camere da letto, 2 bagni completi, giardino privato).
- **Peace & Love Villa**: Per 2+2 persone affacciata sulla piscina con amaca e terrazza.

### Servizi & Policy (Regole Ferree)
1. **Aria Condizionata & Colazione**: Nel motore di prenotazione del sito web l'ospite può liberamente selezionare se desidera aggiungere l'aria condizionata (inclusa o a consumo) e la colazione.
   - ⚠️ **REGOLA ZERO NOISE**: **NON spiegare né elencare tariffe di A/C o colazione** a meno che l'ospite non abbia chiesto espressamente chiarimenti sull'aria condizionata o sulla colazione!
2. **Soggiorno Minimo Contestuale**:
   - Bassa/Media Stagione (1 Apr – 30 Nov): **2 notti consecutive**.
   - Alta Stagione (1 Dic – 31 Mar): **5 notti consecutive**.
   - Eccezione Buchi: le notti isolate tra due prenotazioni sono prenotabili singolarmente.
   - *Regola*: comunicare solo il minimo relativo al periodo richiesto, non recitare entrambi i periodi a meno di richieste generiche.
4. **Distanza Spiaggia**: Buffalo Bay a 150 metri (1-2 minuti a piedi).

---

## 4. Guida Trasporti Ufficiale in 4 Fasi (da `DirectionsSection.tsx`)
La guida completa ufficiale è consultabile al link: `https://www.flowerpowervillage.com/village/how-to-get-here`

### Fase 1: Arrivo a Ranong (da Bangkok, Phuket, Isole del Golfo, Treno, Auto)
- **Volo Bangkok ➔ Ranong**: Thai AirAsia da Don Mueang (DMK) a Ranong (UNX) in 1h 15m. Se si arriva a Suvarnabhumi (BKK), navetta gratuita o taxi per DMK (~50m). L'aeroporto dista 45 minuti d'auto dal molo.
- **Bus da Bangkok**: Choke Anan Tour dal Southern Bus Terminal (Sai Tai Mai) a Ranong (8-9h). *Consiglio risparmio*: prenotare direttamente sul sito ufficiale di Choke Anan per evitare commissioni. I bus notturni arrivano la mattina presto (05:30-06:30), perfetti per la prima barca delle 08:00.
- **Treno da Bangkok**: Cuccetta notturna Krung Thep Aphiwat ➔ Chumphon (7-8h) + minivan coincidenza per Ranong (2h, prenotabile all'arrivo o su 12Go.asia).
- **Da Phuket, Takua Pa & Khao Lak**: Bus Rungkit Tour o minivan da Phuket Bus Terminal 2 per Ranong (4h30-5h, circa 300-450 THB). Fermate a Takua Pa (~2h) e Khao Lak (~3h).
- **Dalle Isole del Golfo (Koh Samui, Koh Phangan, Koh Tao)**: Traghetto Lomprayah/Seatran fino a Surat Thani o Chumphon + minivan coincidenza per Ranong Bus Station (3h30-4h da Surat Thani, 2h da Chumphon).
- **Politica Trasferimenti da Fuori Ranong (Regola Ferrea)**: Il resort non prenota né organizza trasferimenti da località esterne a Ranong perché orari e prezzi di terzi cambiano continuamente. Fornire sempre il link alla pagina web `/village/how-to-get-here`.

### Fase 2: Come Raggiungere il Molo di Ranong (Saphan Pla Pier)
- **Dalla Bus Station di Ranong**: all'arrivo ci sono sempre **songthaew rossi locali**, taxi e moto-taxi sul piazzale per il molo (15-20 min senza attese, songthaew ~20-30 THB).
- **Dall'Aeroporto di Ranong (UNX) con Mr. Gong**:
  - Taxi convenzionato: 200 THB a persona (in 2 o più) · 300 THB per chi viaggia solo.
  - Biglietti speedboat: 350 THB a persona emessi in anticipo da Mr. Gong.
  - Vantaggio: linea telefonica diretta con i capitani per coordinare o posticipare la partenza dell'ultima barca in caso di lievi ritardi del volo.
  - **Finestra temporale**: si accettano richieste di transfer con Mr. Gong *esclusivamente da 7 a 3 giorni prima dell'arrivo*.
  - Servizio di cortesia (zero commissioni): pagamento diretto in contanti a Mr. Gong all'arrivo.
  - Dati richiesti: 1) Nome e Cognome, 2) Numero persone, 3) Numero volo e ora arrivo.
- **In Auto al Molo**: Parcheggio custodito e sicuro a pagamento (~100 THB/giorno). Link GPS: `https://maps.app.goo.gl/ef3wv84NXeNE3GvSA`.

### Fase 3: La Barca per Koh Phayam (Speedboat)
- Frequenti ogni ora / ora e mezza dalle 08:00 alle 17:00 / 17:30 (andata da Ranong) e 07:30–16:30 (ritorno da Koh Phayam).
- Traversata: 35-40 minuti. Costo standard: 350 THB a persona a tratta.
- Orari confermati giornalmente al molo in base a maree e meteo.

### Fase 4: Dal Molo al Resort (Flower Power Village - Buffalo Bay)
- **Disclaimer trasporti isola**: I resort privati non possono effettuare transfer con mezzi propri su strada pubblica per legge e assicurazione, né si possono prenotare i tuk-tuk in anticipo.
- Appena scesi dalla passerella del molo:
  - **Tuk-tuk locali**: 200–250 THB a veicolo (10 minuti per Buffalo Bay).
  - **Moto-taxi**: ~80 THB.
  - **Noleggio Scooter al molo**: 150–250 THB al giorno.
  - **A piedi**: passeggiata pianeggiante di circa 50–60 minuti nella natura (Link GPS Resort: `https://maps.app.goo.gl/mugY88Wpuzjeebf56`).

---

## 5. Filosofia di Risposta "Zero Noise" (Direttiva di Precisione Chirurgica)
Quando un cliente fa una richiesta:
- **RISPONDERE SOLO ED ESCLUSIVAMENTE A QUELLO CHE VIENE CHIESTO**: nessun elenco non richiesto di dotazioni (distanza spiaggia, Wi-Fi, zanzariere, aria condizionata, colazione, termini di deposito/saldo). Se il cliente vorrà altri dettagli, li chiederà dopo.
- **Struttura ideale risposta richiesta soggiorno**:
  1. Saluto caloroso.
  2. Alloggio idoneo consigliato (con link diretto).
  3. Soggiorno minimo relativo a quel mese specifico.
  4. Link al calendario live per verificare e prenotare.
  5. Domanda sul numero esatto di notti previste per procedere.
- **MAI** inserire lettini per neonati o culle a meno che l'ospite non abbia menzionato bambini o neonati.
- **MAI** spiegare prezzi A/C o colazione se non chiesti (lo vedrà sul sito).
- **MAI** inserire distanza dalla spiaggia o menù ristorante se non chiesti.
- **MAI** proporre Jungle Left e Right come alternative alla Jungle Villa intera.
- Formattare sempre il testo WhatsApp pulito pronto da copiare con 1 tocco nel blocco `<pre><code class="language-whatsapp">...</code></pre>`.
