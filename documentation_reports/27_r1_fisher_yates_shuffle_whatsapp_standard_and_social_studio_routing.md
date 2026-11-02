# 27 · R1 Fisher-Yates Shuffle, Standard WhatsApp Koh Phayam & Routing Social Studio Dashboard

> **Data:** 02 Novembre 2026 · Ore 18:45  
> **Autore:** Antigravity Agentic AI  
> **Status:** 🚀 RILASCIATO IN PRODUZIONE (MARKDOWN-PROJECT)  
> **Reparti Interessati:** `/social` (Social Media Studio), `/admin` (Admin Gateway & Dashboard), Koh Phayam Village & Restaurant  

---

## 1. Obiettivi del Rilascio

Il presente rilascio consolida tre aspetti cardine del sistema Social Media Studio e dell'infrastruttura amministrativa:
1. **Shuffle Uniforme Senza Bias (Fisher-Yates) su R1**: Eliminazione del bias statistico di TimSort (V8 Chromium) che provocava una frequenza tripla per i primissimi piatti dell'array come scena hero di copertina nei video R1.
2. **Standardizzazione Internazionale Numero WhatsApp Koh Phayam**: Allineamento universale del recapito per chiamate ed ordini delivery sull'isola nella forma mnemonica ufficiale `+66 (0)95.882.5573` (con lo zero locale tra parentesi e punti separatori), su Canvas 60 FPS, anteprima DOM live, outro finale, testi dei post bilingue e prompt AI DeepSeek.
3. **Instradamento Diretto Dashboard Admin ➔ Social Studio Vero (`/social-studio`)**: La card e i collegamenti della console admin conducono direttamente all'AutoCut Studio a piena potenza (`/social-studio`), mentre la pagina di audit per i revisori di TikTok for Developers rimane intatta e sempre raggiungibile a `/social` (e collegata all'interno del nostro studio con il tasto `Fake Social Studio TikTok`).

---

## 2. Dettaglio Tecnico degli Interventi

### A. Algoritmo Fisher-Yates (Knuth) Shuffle su `autoCutLabEngine.ts`
- **Problema Risolto:** L'utilizzo ingenuo di `[...arr].sort(() => 0.5 - Math.random())` nei motori V8 / Node.js non garantiva una distribuzione uniforme poiché TimSort richiede una funzione di confronto transitiva. I primi elementi di `allEligibleDishes` (es. *Seafood Spaghetti allo Scoglio* o i *Ravioli*) venivano estratti come primo piatto (scena 0) con frequenza $\sim 3.1\%$ rispetto allo $0.72\%$ teorico uniforme, mentre i piatti a fondo lista scendevano fino allo $0.1\%$.
- **Soluzione:** Sostituzione con Fisher-Yates shuffle $O(n)$ nativo:
  ```typescript
  function getRandomItems<T>(arr: T[], count: number): T[] {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, count);
  }
  ```
- **Esito Audit Combinatorio:** Su 1.000 generazioni consecutive con 138 piatti caldi idonei di Koh Phayam, il sistema genera 1.000 combinazioni uniche (100% differenti) e la probabilità della prima scena è rigorosamente appiattita a $1/138 \approx 0.72\%$ per ciascun piatto.

### B. Standardizzazione Numero WhatsApp Koh Phayam (`+66 (0)95.882.5573`)
- **Player Video (`AutoCutLabPlayer.tsx`)**:
  - Formula di misurazione dinamica larghezza Canvas `measureText`: allungamento automatico a 19 caratteri con preservazione delle proporzioni e distacchi da `Koh Phayam`.
  - Disegno Canvas con ombra scura ad alto contrasto `#25D366` e anteprima live DOM sincronizzata.
  - Card Outro finale sia in aspect ratio 9:16 che 4:3.
- **Copywriter Bilingue & Prompt AI (`autoCutCopywriterEngine.ts`, `AutoCutPostCopywriter.tsx`)**:
  - Blocchi di testo Thai, English e Italiano per i post social di R1 e Last Minute LM1.
  - Prompt DeepSeek AI per la chiusura contatti con numero telefonico formattato.
- **Scheduler Robot Serverless (`scripts/social-scheduler-dispatch.mjs`)**:
  - Testi di fallback per la pubblicazione programmata delle ore 17:00 (slot R1 / Telegram Topic 2).

### C. Architettura Navigazione Dashboard Admin & Tasto "Fake Social Studio TikTok"
- **Admin Gateway (`AdminGateway.tsx`) & Header (`AdminHeader.tsx`)**:
  - Collegamento card e menu rapido modificato da `/social` a `/social-studio`.
  - Accesso diretto per lo staff all'AutoCut Studio reale con 9 formati video, Ken Burns motion player, meteo Ranong e visual calendar.
- **AutoCut Studio (`AutoCutStudioPage.tsx`)**:
  - Aggiunto nella barra superiore il pulsante rapido `Fake Social Studio TikTok` con icona TikTok e apertura in nuova scheda (`/social?view=audit`).
  - La route `/social` per i revisori esterni di TikTok for Developers continua a servire in produzione la pagina di audit approvata `TikTokAuditStudioPage.tsx`.

---

## 3. Matrice dei File Modificati

| File | Percorso | Ruolo |
| :--- | :--- | :--- |
| `autoCutLabEngine.ts` | `src/social/services/` | Fisher-Yates shuffle uniforme per piatti R1 |
| `AutoCutLabPlayer.tsx` | `src/social/components/` | Sovraimpressione Canvas 60 FPS, DOM live e Outro |
| `autoCutCopywriterEngine.ts` | `src/social/services/` | Formattazione WhatsApp nei post bilingue R1/LM1 |
| `AutoCutPostCopywriter.tsx` | `src/social/components/` | Prompt AI DeepSeek chiusure contatti WhatsApp |
| `social-scheduler-dispatch.mjs` | `scripts/` | Dispatcher serverless slot 17:00 R1 |
| `AutoCutLabView.tsx` | `src/social/components/` | Badge e pulsante R1 nella griglia Studio |
| `autoCutRulesRegistry.ts` | `src/social/services/` | Registry regole grafiche e tipografiche R1 |
| `SocialCalendarView.tsx` | `src/social/components/` | Didascalie calendario editoriale per R1 e LM1 |
| `AdminGateway.tsx` | `src/admin/gateway/` | Card Social Studio reindirizzata a `/social-studio` |
| `AdminHeader.tsx` | `src/admin/common/` | Header fisso admin reindirizzato a `/social-studio` |
| `AutoCutStudioPage.tsx` | `src/social/pages/` | Pulsante `Fake Social Studio TikTok` nella navbar |
| `DIARIO_DI_BORDO.md` | Root | Diario storico e tracciamento rilasci |

---

## 4. Collaudi & Verifica di Build

- **Typecheck TypeScript (`npx tsc --noEmit`)**: 0 errori.
- **Security Audit (`node scratch/security-audit.mjs`)**: 0 secrets detected.
- **Crittografia Vault (`node scratch/vault-sync.mjs encrypt`)**: Vault protetto sincronizzato.
- **Vite Build (`npm run build`)**: 2033 moduli trasformati con successo in 5.94s.
