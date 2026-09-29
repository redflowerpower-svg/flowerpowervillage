# 🎬 Handoff Report: Storyboard Studio & TikTok Video Generator (9:16)

**Data Congelamento**: 2026-09-29  
**Stato Modulo**: ❄️ CONGELATO IN ATTESA DI REFACTORING INTERFACCIA  
**Workspace**: `d:\01 ANTIGRAVITY\flower-power-village-com\flowerpowervillage`

---

## 1. Obiettivo del Modulo
Creazione dello **Storyboard Studio** nel Back-Office di Flower Power Pizza (`/admin`) per costruire, configurare ed esportare registrazioni video promozionali in formato verticale **9:16 (540x960 HD Full Bleed per TikTok, Reels, Shorts)** tramite Playwright e conversione automatica in `.mp4` con `ffmpeg-static`.

---

## 2. File Creati & Modificati

| File | Descrizione |
| :--- | :--- |
| `src/admin/pizza/types/storyboardTypes.ts` | Definizioni TypeScript per blocchi d'azione, storyboards, preset e parametri |
| `src/admin/pizza/data/defaultStoryboards.ts` | 3 preset preconfigurati (`tiktok-pizza-order-15s`, `tiktok-table-reservation-12s`, `tiktok-pasta-and-wine-15s`) |
| `src/admin/pizza/components/StoryboardStudio.tsx` | Dashboard Admin completa con timeline blocchi, modale catalogo azioni, editor parametri e tasto esportazione |
| `src/admin/pizza/components/PizzaDashboard.tsx` | Nuova tab `🎬 Storyboard Studio (9:16)` inserita nella barra di navigazione Back-Office Pizza |
| `scratch/storyboard_runner.mjs` | Script Playwright di registrazione con curve di Bézier per il cursore touch, scroll a 60 FPS, gestione mock stato pizzeria e conversione automatica H.264 MP4 |
| `vite.config.ts` | Ignorata la directory `video_out/` e `scratch/` dal watcher Vite per prevenire lock file su Windows |
| `package.json` | Installati `playwright` e `ffmpeg-static` |

---

## 3. Stato Attuale del Funzionamento

1. **Simulazione Touch Umano**:
   - Cursore touch translucido con bordo bianco e bagliore dinamico (`#fp-touch-cursor`).
   - Movimento sinuoso tramite interpolazione quadratica/cubica di Bézier.
   - Pressione realistica con contrazione e onde concentriche (`.fp-touch-ripple`).

2. **Aggancio DOM Menu Reale (`MenuGrid.tsx`)**:
   - Clic su scheda `PIZZA MARGHERITA` con apertura cassetto espandibile inline.
   - Selezione variante formato `12"` / `8"`.
   - Clic su `Aggiungi all'Ordine` (`t.confirmText`).
   - Rilevamento della pillola fluttuante carrello in basso (`.fixed.bottom-6 button`).
   - Apertura del `CartDrawer` laterale con evidenza dello sconto primo ordine 10%.
   - Clic sul pulsante di checkout nel footer del drawer con apertura modale d'ordine.

3. **Bypass Orari Pizzeria (Mock 24H)**:
   - Nel runner è stato configurato il routing mock per `*pizzeria_service_status*` e `localStorage.setItem('fp_pizzeria_service_status')` per garantire che il carrello e il checkout siano sempre aperti (`canOrder: true`) durante la registrazione video.

4. **Directory di Output**:
   - Cartella locale `video_out/` per il salvataggio dei file `.mp4` finali.

---

## 4. Come Riprendere il Lavoro nella Prossima Chat

Quando vorrai riprendere questo modulo, nella nuova chat ti basterà incollare questo messaggio:

```text
Riprendiamo il lavoro sullo Storyboard Studio & Video Generator (9:16) partendo dall'Handoff salvato in documentation_reports/storyboard_studio_handoff.md. 
L'interfaccia è pronta, ora possiamo perfezionare la fluidità dei gesti, i timing delle scene e i preset dello storyboard.
```

---

## 5. Comando di Test Immediato
Per rieseguire la registrazione dello storyboard direttamente dal terminale:
```bash
node scratch/storyboard_runner.mjs --storyboard=tiktok-pizza-order-15s
```
