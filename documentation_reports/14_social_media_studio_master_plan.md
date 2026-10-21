# 🏛️ MASTER BLUEPRINT: SOCIAL MEDIA STUDIO & PUBLISHER
**Flower Power Pizza (Ranong) & Flower Power Farm Village (Koh Phayam)**

> **Documento Permanente di Riferimento Architetturale & Strategico**  
> *Versione: 1.0 — Data Creazione: 18 Ottobre 2026*  
> *Ambito: Reparto Stagno Social Media Studio (`/social`, `/src/social/`, `/api/_handlers/social-*.ts`)*

---

## 🎯 1. Obiettivo Strategico del Progetto
Creare una **piattaforma editoriale e distributiva autonoma, chiusa e centralizzata** (accessibile all'indirizzo protetto `/social`) in grado di:
1. Generare contenuti visivi e multimediali di altissima qualità partendo dagli asset reali del resort e della pizzeria.
2. Trasformare foto statiche in **video motion reels dinamici verticali (9:16)** e **caroselli multi-slide** calibrati per l'algoritmo di **TikTok, Instagram (Reels/Stories/Feed), Facebook e Google Maps (Local Posts)**.
3. Comporre copy e didascalie biculturali persuasive tramite la sinergia tra **DeepSeek AI** (copywriting bilingue) e **Google Gemini Vision** (analisi inquadratura e posizionamento grafiche).
4. Gestire la programmazione temporale su calendario visuale e la pubblicazione automatica 24/7 verso tutte le piattaforme.

---

## 🛡️ 2. Regola d'Oro Inviolabile: Reparto Stagno & Zero Contaminazione
1. **Zero Impatto sui Reparti Operativi**:
   - Qualsiasi componente, stato, route o script del Social Studio risiede tassativamente in `/src/social/` e `/api/_handlers/social-*.ts`.
   - È **severamente vietato** importare o alterare la cassa della pizzeria (`/pizza`), il Kitchen Monitor della cucina (`/kitchen`), il Tablet dei tavoli (`/dining`), il Booking Engine del villaggio (`/villaggio`) o il Web Reader (`/read`).
2. **Database & Tabelle Dedicate**:
   - Tutte le tabelle (`social_scheduled_posts`, `social_media_assets`, `social_accounts`, `social_logs`) sono isolate e prive di vincoli di foreign key con ordini o prenotazioni, prevenendo qualsiasi blocco a catena.
3. **Sicurezza & Zero Secret Leak**:
   - Token e credenziali social (Meta Graph API, TikTok API, Google Business Profile) risiedono rigorosamente nei file `.env` locali e nella cassaforte cifrata `.secret_docs/api_credentials_report.md.enc`.

---

## 🗣️ 3. Biculturalismo & Strategia Linguistica (Thai 🔁 Italiano 🔁 Inglese)

### A. Reparto Pizzeria Ranong (Target: Thailandesi Locali + Turisti)
- **Linguaggio Primario**: **Thailandese 🇹🇭 vivo, solare e cortese** (utilizzo naturale di particelle di cortesia `นะคะ`, `จ้า`, `ครับ`, emoji culinarie fresche).
- **Linguaggio Secondario**: **Italiano 🇮🇹 di prestigio** (esaltazione delle radici autentiche, lievitazione lenta 48h, forno a legna, ingredienti DOP importati) affiancato dall'**Inglese 🇬🇧** per i viaggiatori internazionali a Ranong.
- **Struttura dei Post**:
  - Ganci visivi e testo principale bilingue (Thai + Italiano/Inglese).
  - Spiegazione degli ingredienti tipici italiani spiegati al palato thailandese (la burrata fresca pugliese, il pomodoro San Marzano, l'impasto leggero e digeribile).

### B. Reparto Villaggio Koh Phayam (Target: Viaggiatori Globali + Thailandesi in Vacanza)
- **Linguaggio Primario**: **Inglese 🇬🇧 evocativo ed esperienziale** (l'isola senza auto, il relax totale, la natura incontaminata, i tramonti mozzafiato, la cucina italiana sulla spiaggia).
- **Linguaggio Secondario**: **Thailandese 🇹🇭 accogliente** (il rifugio perfetto per staccare dalla città, bungalow eco-chic immersi nel verde) e **Italiano 🇮🇹**.

---

## 📅 4. Marketing Tematico: Festività, Meteo & Stagionalità

I contenuti non sono generici, ma calibrati su eventi e situazioni reali del calendario:

1. **Festività Thailandesi Tradizionali & Nazionali**:
   - **Loy Krathong** (Novembre): celebrazioni, luci sull'acqua, cene speciali nel giardino.
   - **Songkran** (Aprile - Capodanno Thai): freschezza, festa, pizze e birre fresche a Ranong, vacanze al mare a Phayam.
   - **Capodanno Cinese** (Gennaio/Febbraio): offerte speciali e ritrovi in famiglia.
   - **Wan Mae (Festa della Mamma)** e **Wan Por (Festa del Papà)**: promozioni e sconti per famiglie.
   - Ponti festivi e vacanze scolastiche thailandesi.

2. **Festività Occidentali & Internazionali**:
   - **Natale & Capodanno**: cenoni, menu delle feste, prenotazione anticipata bungalow a Phayam per l'alta stagione.
   - **San Valentino**: cene romantiche a lume di candela in pizzeria e soggiorni di coppia nelle ville.
   - **Halloween, Pasqua, Ferragosto**.

3. **Contenuti Dinamici Basati sul Meteo e sulle Situazioni Live**:
   - **A Ranong (Città termale piovosa / monsonica)**: quando piove, post su comfort food: *"Giornata fresca di pioggia a Ranong? Niente di meglio del tepore del nostro forno a legna o di una pizza fumante consegnata caldissima a casa tua in 30 minuti!"*.
   - **A Koh Phayam (Stagione da Novembre a Maggio)**: post su mare calmo, snorkeling, tramonti infuocati, risveglio con i buceri (*hornbill*) nel giardino tropicale.

---

## 🏷️ 5. Matrice Hashtag & SEO Locale (Geo-Targeting)

Cluster di hashtag studiati e ruotati automaticamente per massimizzare la portata organica senza finire in shadowban:

- **Cluster Ranong Food**: `#PizzaRanong #RanongFood #รีวิวระนอง #ของกินระนอง #ร้านอาหารระนอง #บ่อน้ำร้อนรักษะวาริน #RanongHotspring #RanongDelivery`
- **Cluster Koh Phayam Travel**: `#KohPhayam #PhayamIsland #KohPhayamHotel #เกาะพยาม #ที่พักเกาะพยาม #เที่ยวเกาะพยาม #RanongTravel #ThailandHiddenGem #EcoResortThailand`
- **Cluster Qualità Italiana**: `#AuthenticItalianPizza #WoodFiredPizza #PizzaLovers #NeapolitanPizzaThailand #ItalianChef`

---

## 🎬 6. Motore Multimediale: Dinamismo per TikTok, Reels & Caroselli

Trasformare le foto statiche in contenuti magnetici:

1. **Formato Verticale 9:16 Nativo**: ottimale per TikTok, Instagram Reels e Facebook Stories.
2. **Effetto Ken Burns a 60fps**: movimento cinematografico lento (slow zoom-in e pan) per dare l'illusione di un video girato dal vivo su cavalletto.
3. **Caroselli Multi-Slide (TikTok Photo Mode & Instagram Swipe)**:
   - *Slide 1 (Hook)*: Foto ad alto impatto con titolo magnetico in sovraimpressione.
   - *Slide 2 (Story / Quality)*: Dettaglio ingredienti, lievitazione o angolo speciale dell'alloggio.
   - *Slide 3 (Call To Action)*: Badge promozionale, sconto 10% primo ordine o link prenotazione.
4. **Regola d'Oro Tipografica per le Sovraimpressioni**:
   - Rispetto ferreo dei connettori logici a capo (`CON`, `&`, `WITH`).
   - Sfumature gradient scure per garantire contrasto e leggibilità perfetta su qualunque sfondo.

---

## 🤖 7. Sinergia delle Due Intelligenze Artificiali

- **DeepSeek AI (`DEEPSEEK_API_KEY`)**: Il Copywriter. Scrive testi persuasivi, call to action, battute per i Reel e traduzioni contestuali perfette Thai/Italiano/Inglese.
- **Google Gemini Vision (`GEMINI_API_KEY`)**: L'Occhio Regista. Analizza l'immagine, capisce cosa contiene, individua i colori caldi/freddi e trova il *negative space* (l'area libera) dove posizionare il testo senza coprire la pizza o la camera.

---

## 💾 8. Architettura Storage Scalabile & Flussi di Lavoro

1. **Fase 1 (Attuale - Asset Interni al Sito)**:
   - Utilizzo diretto delle decine di foto HD già caricate sul sito:
     * Piatti pizzeria: `src/pizza/data/menuData.ts` (Storage Supabase `/delivery_food/`).
     * Alloggi villaggio: `src/booking/resort/components/RoomGrid.tsx` e gallery ville.
2. **Fase 2 (Storage Illimitato & Inbox Mobile)**:
   - **Google Drive (5 Terabyte)**: funge da magazzino infinito per video MP4 pesanti e foto originali a costo zero.
   - **Supabase**: database ultra-leggero che conserva unicamente l'indice testuale e i metadati dei post (occupazione inferiore a pochi kilobyte, 100% gratuito per sempre).
   - **Bot Telegram**: riceve foto e video dallo smartphone e li trasferisce in automatico nella cartella di Google Drive, indicizzandoli subito nello studio `/social`.

---

## 🗓️ 9. Roadmap di Sviluppo

- [x] **Milestone 1**: Connessioni ufficiali Meta (Facebook & Instagram Business API) e TikTok Sandbox Application.
- [x] **Milestone 2**: Interfaccia Live `/social`, Calendario Editoriale mensile/settimanale e Anteprima fedele multi-piattaforma.
- [ ] **Milestone 3 (IN CORSO)**: Motore Visivo Dinamico (`VisualMotionStudio`): Ken Burns 9:16, Caroselli Multi-Slide, Sovraimpressioni grafiche tipografiche da catalogo sito.
- [ ] **Milestone 4**: Integrazione Google AI Studio (`Gemini Vision`) per analisi automatica inquadrature e suggerimento posizionamento testi.
- [ ] **Milestone 5**: Bot Telegram ➔ Google Drive (5 TB) per inbox mobile istantanea.
- [ ] **Milestone 6**: Worker di pubblicazione automatica 24/7 (Cron).
