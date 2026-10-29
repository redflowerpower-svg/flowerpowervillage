# 📋 REPORT TECNICO 25 · SUPABASE ZERO-EGRESS WATCHDOG, BRAND IDENTITY SOCIAL & TELEGRAM OPTIMIZATION

> **Data:** 29 Ottobre 2026  
> **Autore:** Antigravity AI & Flower Power Core Team  
> **Status:** 🟢 RILASCIATO IN PRODUZIONE  

---

## 1. Executive Summary & Obiettivi della Release
Questa release consolida l'infrastruttura backend e social media di Flower Power, risolvendo definitivamente il consumo di banda di rete su Supabase, blindando l'identità di marca in tutti i post e notifiche, e ottimizzando l'esperienza utente su Telegram.

---

## 2. Architettura Supabase Zero-Egress & Sentinel Watchdog

### 2.1 Diagnosi Egress Bandwidth
- **Causa individuata:** Nel piano Supabase Free (5.5 GB/mese di egress), il download continuo di video MP4 (7–12 MB ciascuno) per collaudi e invii social rischiava di esaurire la quota di trasferimento dati prima della fine del ciclo mensile.
- **Risoluzione a Monte:** Implementazione dello streaming binario multipart diretto verso l'API Telegram (`scripts/send-video-to-telegram.mjs` e `scripts/social-scheduler-dispatch.mjs`), eliminando completamente il rimbalzo del file tramite Supabase in download. Consumo Supabase: **0 byte di egress**.

### 2.2 Watchdog di Sicurezza (`scripts/supabase-sentinel.mjs`)
- **Scansione Periodica:** Monitora costantemente la dimensione dei singoli bucket (`assets`, `accommodations`, `delivery_food`, `site-images`, `Menu`, `documents`).
- **Soglia di Guardia:** Fissata a 250 MB su 1000 MB (< 25%).
- **Auto-Healing Automatico:** Bonifica istantanea dei file temporanei in `assets/social_stories` se superano i 4 file o un'anzianità di 2 ore.
- **Allarme Preventivo Telegram:** In caso di anomalie o avvicinamento alla soglia, invia un alert dettagliato su Topic 301 (Failed/Alerts).

---

## 3. Brand Identity Obbligatoria (Pizza vs Resort vs Restaurant)

### 3.1 Didascalie e Notifiche Telegram
Ogni video e notifica inviata al gruppo privato specifica in modo inequivocabile il brand di riferimento:
- `🏢 Brand: 🍕 Flower Power Pizza (Ranong)` (Formati P1, P2, P3, DS)
- `🏢 Brand: 🌺 Flower Power Village (Koh Phayam)` (Formati V1, V2, V3, LM1)
- `🏢 Brand: 🍽️ Flower Power Restaurant & Village (Koh Phayam)` (Formato R1)

### 3.2 Motore di Copywriting & Prompt DeepSeek AI
- In `src/social/services/autoCutCopywriterEngine.ts`, tutti i template deterministici (Thai e Inglese) integrano obbligatoriamente il nome del brand nel gancio iniziale (Hook).
- In `api/_handlers/social-publisher.ts`, inserita la **Regola 0 (Identità Brand)** nei prompt DeepSeek AI, garantendo che nessuna generazione automatica ometta il brand dalla prima riga.

---

## 4. Ottimizzazione UX Telegram & Topic 3 (Stories)
- **Rimozione Tasto Download Ridondante:** Rimosso il pulsante "Scarica Video MP4", superfluo poiché Telegram riceve il video nativo a risoluzione piena (1080x1920 Full HD).
- **Pulsante Unico per Topic 3:** Rimossi i link dispersivi; Topic 3 presenta ora unicamente il pulsante *"📱 Apri TikTok Stories"*, garantendo un'azione pulita e priva di confusione per lo staff.

---

## 5. Matrice File e Componenti Coinvolti
- `scripts/supabase-sentinel.mjs`: Nuovo modulo watchdog per le quote Supabase.
- `scripts/send-video-to-telegram.mjs`: Invio video in streaming multipart senza egress.
- `scripts/social-scheduler-dispatch.mjs`: Integrazione sentinel + brand display.
- `src/social/services/telegramStudioDispatcher.ts`: Pulizia tasti e branding chiaro.
- `src/social/services/autoCutCopywriterEngine.ts`: Template con brand identity obbligatoria.
- `api/_handlers/social-publisher.ts`: Regola 0 nei prompt DeepSeek AI e pulizia storage.
- `src/social/components/SocialCalendarView.tsx`: Allineamento slot e stati calendario.
- `scripts/generate-booking-ad.mjs`: Script generatore reel/ads promozionale resort.
