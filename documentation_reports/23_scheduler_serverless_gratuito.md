# 23 — Scheduler Social Serverless a Costo Zero (PC spento)

Reparto: `/social` (stagno). Decisione del 2026-10-27.

## Obiettivo
Il calendario editoriale deve produrre e pubblicare post ogni giorno **online, gratis, a PC spento**. Il browser serve solo a vedere/approvare/bloccare.

## Architettura (tutta gratuita)
| Compito | Dove gira | Note |
|---|---|---|
| Pubblicazione ogni 5 min | Supabase `pg_cron` + `pg_net` -> endpoint publisher | Vercel Hobby cron = max 1/giorno, non basta |
| Piano + copy giornaliero (piatti disponibili, alloggi liberi LM1, testi DeepSeek salvati in DB) | Vercel Cron, 1 volta/notte | Chiamate AI consentite perché pianificate (regola 21) |
| Rendering video | GitHub Actions (cron) + Chromium headless (Playwright) che apre il player esistente `AutoCutLabPlayer` | 2000 min/mese privato, illimitati se pubblico |
| Archivio video | Supabase Storage (1 GB) o Google Drive 5 TB | Cancellare dopo pubblicazione |
| Refresh token OAuth | cron dedicato | Evita scadenze a PC spento |

Flusso: cron notturno crea slot e copy -> GitHub Actions renderizza l'MP4 -> upload Storage -> riga `social_scheduled_posts` con `status='scheduled'` -> `pg_cron` pubblica -> `published`/`failed` + `social_logs` (max 3 retry).

## Garanzia qualità: rendering deterministico (NON registrazione in tempo reale)
- Il player espone un clock virtuale: `renderFrame(t)`.
- Playwright avanza t a passi di 1/30 s, cattura ogni frame del canvas, ffmpeg li codifica in MP4.
- La qualità è identica indipendentemente dalla velocità del server (zero frame persi).
- Controlli automatici prima di `scheduled`: durata attesa, risoluzione 720x1280, frame non neri, thumbnail pre-fade (regola 14), file > soglia minima.
- Se un controllo fallisce: `status='failed'` + log, nessuna pubblicazione.
- Fase di prova: primo post in `draft` con anteprima, approvazione manuale finché la qualità non è validata.

## Regole di contenuto invariate
Regole 8, 9, 11, 12 (selezione materiale), 13-20 (testi, header, thumbnail) restano valide anche per il rendering server.

## Piano di lavoro
1. Prova di fattibilità su formato P1 (workflow Actions -> MP4 -> Storage -> riga DB).
2. `pg_cron` publisher in modalità test.
3. Estensione agli altri formati e alla tabella `social_editorial_slots` (orari configurabili, fuso Asia/Bangkok).
4. Blindatura post-approvazione TikTok (regola 5 del reparto).

## Stato avanzamento (2026-10-27)
- Decisione: **Strada 1** = il cloud usa il VERO player (Playwright + window.__autoCutGetVideo), non il renderer sharp di scripts/render-social-video-cloud.mjs (secondo codice grafico, non garantito identico).
- Auth: su localhost /social-studio e' gia' sbloccata (SocialAdminAuth.isLocal): il robot serve l'app sul runner, nessun bypass pubblico.
- scripts/render-parity-test.mjs: PROVA P1 SUPERATA in locale (WebCodecs H.264 OK, MP4 1080x1920, 13.3s, 8 MB, frame start/mid/end corretti, thumbnail pre-fade caricata). Il player carica da solo il video su Supabase (ssets/social_stories) e restituisce l'URL pubblico (audio muxato lato server).
- Da fare: (1) prova identica nel runner GitHub (Linux, font Thai, Chromium); (2) SSIM locale vs cloud con stesso 	estRunFile; (3) altri formati uno alla volta; (4) pg_cron publisher.

- **Ripetibilita' provata**: due render locali dello stesso montaggio (fixture scripts/parity-fixtures/P1.testrun.json) => SSIM = 1.0 (identici). Baseline P1: https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/assets/social_stories/story_video_P1_pizza_1793107064314_master.mp4
- Workflow manuale pronto: .github/workflows/social-render-parity.yml (Linux, font Thai, vite sul runner, API remota via --api). Da lanciare dopo il push su GitHub con input baseline_url = link sopra.
