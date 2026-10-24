# 🎬 Master Checkpoint: AutoCut Studio — Formato DS Single-Hero, Thumbnail Macro & Outro Sound Engine

**Data**: 20 Ottobre 2026  
**Branch**: `staging`  
**Stato**: Convalidato in browser, testato a zero errori e salvato su GitHub.

---

## 1. Obiettivo Raggiunto & Riorganizzazione Concettuale Formato DS (Daily Special)

Su indicazione della direzione, è stato **completamente superato il vecchio format multi-piatto asimmetrico** ed è stato implementato il nuovo modello **Single-Hero (su paradigma P1)**:

1. **1 Singolo Piatto Protagonista**:
   - Zero stacchi o cambi di scena tra cibi diversi.
   - **Priorità 1**: Il 1° piatto attivo nella vetrina fisica del Kitchen Monitor (`isLiveShowcase === true`, es. *Ravioli al Sugo di Noci*).
   - **Priorità 2**: Se la vetrina del Kitchen Monitor è vuota, il 1° piatto disponibile dalla categoria *Daily Specials* del catalogo.
   - Esclusione categorica di piatti esauriti (`is_available === false` o Sold Out / 86).
2. **Sincronia Musicale Identica a P1**:
   - **Durata Totale**: Corrisponde esattamente alla durata del brano MP3 (~11.7s – 13.0s, zero secondi aggiunti).
   - **Movimento del Piatto**: Dura circa ~8.85s (fino al cantato *"Flower Power!"*), con traiettoria `food_macro_focus_lr` che parte in carrellata morbida e rientra verso il centro con zoom macro continuo sul condimento.
   - **Outro nel Beat**: Entra a tempo sulla battuta finale con rimbalzo elastico 3D del Logo, Card Consegna, QR Code LINE e sconto 10% 1° ordine, terminando all'unisono con la colonna sonora.
3. **Regola Thumbnail Ufficiale (Regola 14 AGENTS.md)**:
   - La copertina per TikTok, Reels e anteprime è **tassativamente il fotogramma al massimo zoom macro centrale estratto un attimo prima dell'inizio del fade verso la 2a scena (`transitionThreshold - 0.05s`, zero ghosting/velo)** con il piatto perfettamente centrato sull'asse orizzontale (`panX = 0`), seconda scena a zero opacità e tutti i badge visibili.
4. **Regola Posizione Hashtag nei Post (Regola 16 AGENTS.md)**:
   - Gli hashtag (Thai + Inglesi) stanno **solo in un unico blocco finale**, dopo testo bilingue, link/Maps e tag; **mai tra la traduzione Thai e quella Inglese**.
   - Ordine caption: `Testo bilingue → Link/Maps → @tag → #hashtag`. DeepSeek non scrive hashtag; il sistema li aggiunge in coda (`autoCutCopywriterEngine.ts`, `AutoCutPostCopywriter.tsx`).
5. **Regola Bandiera Lingua & Emoji (Regola 17 AGENTS.md)**:
   - Ogni blocco lingua inizia con la sua bandiera prima della prima lettera (🇹🇭 Thai, 🇬🇧 Inglese) e il testo contiene emoji pertinenti e divertenti.

---

## 2. Raffinamento Grafico & UI Player (AutoCutLabPlayer)

1. **Banner Superiore (Logo + Live Showcase)**:
   - Centrato sull'asse verticale (`left-1/2 -translate-x-1/2`) con `max-w-[92%]` e `flex justify-center`.
   - Dimensioni snelle (`w-9 h-9` logo, `px-3 py-1.5`, `gap-2.5`) che garantiscono respiro visivo su entrambi i lati, senza mai toccare né sbordare sul bordo destro.
   - Dicitura Thai essenziale (`สดใหม่ในตู้โชว์`), eliminando la parola ridondante "oggi" che già compare nel badge adiacente.
   - Badge superiore `LIVE SHOWCASE` dotato di animazione lampeggiante/a impulsi continua (`animate-pulse`) con bagliore ambra-rosa e stellina rotante.
2. **Badge Inferiore "FRESH IN SHOWCASE TODAY"**:
   - **Sfondo**: Gradiente rosso fuoco acceso (`from-red-600 via-rose-600 to-red-700`) con bordo rifinito e alone luminoso, staccando in modo netto sui colori del cibo.
   - **Icona Stella**: Icona SVG (`Star`) **100% bianca piena** (`fill-white text-white drop-shadow-sm`), ben evidente e priva di aloni gialli.
   - **Tipografia**: Testo bianco puro e leggibile (`text-white font-black drop-shadow`) sia in Thai (`สดใหม่ในตู้โชว์วันนี้`) sia in Inglese (`FRESH IN SHOWCASE TODAY`).

---

## 3. Web Audio SFX Engine (autoCutSoundEffects.ts)

Sviluppato un motore sonoro integrato ad altissima definizione basato su **Web Audio API**:
- **Zero Dipendenze Esterne**: Non usa file audio di terze parti da scaricare (zero latenza, zero 404, zero CORS).
- **Sincronizzazione Frame-Accurate**: L'effetto sonoro scatta precisamente all'istante `elapsed >= outroStartTime`.
- **Master Dynamics Compressor**: Compressore di dinamica integrato con boost `1.45x` (+45%) per tagliare la musica ed essere nitidamente percepito senza distorsioni.
- **Doppia Identità Sonora**:
  1. **Pizzeria (`P1`, `P2`, `P3`, `DS`)**:
     - *Whoosh d'aria cinematografico* (filtro passa-banda in sweep da 320Hz a 2600Hz) a volume alto (`0.75`).
     - *Deep Sub-Bass Impact* (onda sinusoidale da 155Hz a 40Hz) a volume `1.20` combinato a uno snap transiente a `0.70` che sottolinea l'impatto e il rimbalzo elastico del logo.
  2. **Villaggio Koh Phayam (`V1`, `V2`, `V3`, `R1`, `LM1`)**:
     - *Brezza tropicale soffice* a volume `0.55`.
     - *Crystal Zen Chimes* (accordo aperto C-Major: 1046Hz, 1318Hz, 1568Hz, 2093Hz) a volume `0.70` con riverbero armonico cristallino prolungato a 1.45s.

---

## 4. Mappa dei File Chiave Modificati

- `src/social/services/autoCutLabEngine.ts`: Generatore `generateDSTest()` semplificato a Single-Hero con priorità Vetrina -> Catalogo.
- `src/social/components/AutoCutLabPlayer.tsx`: Player con Outro integrato nel beat per P1 e DS, banner centrato, badge rosso con stella bianca, pulse su Live Showcase e SFX d'impatto.
- `src/social/services/autoCutSoundEffects.ts`: Sound Engine Web Audio API per la sintesi e riproduzione degli effetti d'impatto dell'Outro.
- `src/social/services/autoCutRulesRegistry.ts`: Scheda tecnica DS allineata nel registro delle regole e drawer informativo.
- `.agents/AGENTS.md`: Regola 14 aggiornata con centratura macro e thumbnail per DS.
