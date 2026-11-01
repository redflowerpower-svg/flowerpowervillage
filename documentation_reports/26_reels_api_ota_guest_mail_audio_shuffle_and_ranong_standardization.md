# 📋 REPORT TECNICO 26 · META REELS API, OTA GUEST MAIL ADDRESS, AUDIO SHUFFLE BAG & RANONG STANDARDIZATION

> **Data:** 01 Novembre 2026  
> **Autore:** Antigravity AI & Flower Power Core Team  
> **Status:** 🟢 RILASCIATO IN PRODUZIONE (MARKDOWN-PROJECT)  

---

## 1. Executive Summary & Obiettivi della Release
Questa release completa una serie cruciale di ottimizzazioni cross-platform per i reparti Pizzeria (`/pizza`), Villaggio (`/booking`, `/admin`) e Social Media Studio (`/social`), focalizzandosi su:
1. **Meta Facebook Reels API (Full-Screen 9:16)** nativa per eliminare i video compressi con etichetta nel feed.
2. **Standardizzazione Numero Ranong (`0949.800.200`)** e consolidamento specifiche territoriali (Koh Phayam 1° piano + 6 capanne).
3. **Rotatore Audio con Memoria Storica (Shuffle Bag 11 Brani)** per azzerare le ripetizioni musicali consecutive nei montaggi.
4. **Supporto Nativo Email Temporanee OTA (`guestMailAddress`)** e sblocco selezione clienti nella mailing list del resort.

---

## 2. Dettaglio Implementativo dei Moduli

### 2.1 Migrazione Ufficiale Facebook a Meta Reels API (`video_reels`)
- **Protocollo Ufficiale a 3 Fasi**:
  1. *Fase 1 (Session Init)*: Chiamata `POST /{pageId}/video_reels?upload_phase=start` per ottenere `video_id` e l'endpoint di caricamento su `rupload.facebook.com`.
  2. *Fase 2 (Binary Upload)*: Caricamento in streaming binario del video MP4 1080x1920 direttamente su `rupload.facebook.com`.
  3. *Fase 3 (Publish)*: Chiamata `POST /{pageId}/video_reels` con `upload_phase=finish`, didascalia con emoji e hashtag e stato `PUBLISHED`.
- **Esperienza Utente**: Eliminata definitivamente la miniatura compressa nel feed; il video è pubblicato a pieno schermo (100% full-width 9:16) sia nel feed che nella scheda "Reels" ufficiale.
- **Parità Totale**: Implementato sia nell'API serverless ([`social-publisher.ts`](file:///d:/01%20ANTIGRAVITY/flower-power-village-com/flowerpowervillage/api/_handlers/social-publisher.ts)) sia nello scheduler cloud ([`social-scheduler-dispatch.mjs`](file:///d:/01%20ANTIGRAVITY/flower-power-village-com/flowerpowervillage/scripts/social-scheduler-dispatch.mjs)).

### 2.2 Standardizzazione Numero Ranong & Specifiche Territoriali
- **Numero Ufficiale Ranong (`0949.800.200`)**: Standardizzata la formula mnemonica con i punti per chiamate vocali, WhatsApp e LINE.
  - Aggiornati i componenti UI di ordinazione e prenotazione tavoli: [`CartDrawer.tsx`](file:///d:/01%20ANTIGRAVITY/flower-power-village-com/flowerpowervillage/src/pizza/components/CartDrawer.tsx), [`ServiceStatusBanner.tsx`](file:///d:/01%20ANTIGRAVITY/flower-power-village-com/flowerpowervillage/src/pizza/components/ServiceStatusBanner.tsx), [`TableReservationModal.tsx`](file:///d:/01%20ANTIGRAVITY/flower-power-village-com/flowerpowervillage/src/pizza/components/TableReservationModal.tsx).
- **Ristorante Koh Phayam al 1° Piano & 6 Capanne**:
  - Allineati i prompt DeepSeek e i copy: il ristorante è al primo piano con ampia sala ventilata e 6 capanne private.
  - Delivery a Koh Phayam gestita esclusivamente tramite recapito WhatsApp/telefono `+66 095 882 5573`.

### 2.3 Rotatore Audio Intelligente a Memoria Storica (Shuffle Bag)
- **Algoritmo Shuffle Bag Villaggio ([`autoCutLabEngine.ts`](file:///d:/01%20ANTIGRAVITY/flower-power-village-com/flowerpowervillage/src/social/services/autoCutLabEngine.ts))**:
  - Implementata la funzione `getNextVillageAudioTrack()` che memorizza in `localStorage` gli ultimi brani utilizzati (`autocut_recent_audio_village`).
  - Esclusione matematica degli ultimi 9 brani ascoltati su 11: garanzia di rotazione su tutta la playlist senza ripetizioni o doppioni ravvicinati nei formati V1, V2, V3, R1 e LM1.
- **Rotazione Jingle Pizzeria**:
  - Implementata `getNextPizzaAudioTrack()` per alternare dinamicamente `So Good`, `Ranong` e `Aroi Mak Mak` per i formati P1 e DS.
- **Cloud Renderer Parity**:
  - Aggiornato [`render-parity-test.mjs`](file:///d:/01%20ANTIGRAVITY/flower-power-village-com/flowerpowervillage/scripts/render-parity-test.mjs) con selezione circolare dinamica dei brani MP3 disponibili su disco.

### 2.4 Supporto Email Temporanee OTA (`guestMailAddress`) & Mailing List Resort
- **Integrazione Octorate API ([`octorate.ts`](file:///d:/01%20ANTIGRAVITY/flower-power-village-com/flowerpowervillage/api/_handlers/octorate.ts))**:
  - Le OTA (Booking.com, Expedia, Agoda) rilasciano un alias email temporaneo per la comunicazione attiva dell'ospite archiviato nel campo `guestMailAddress`.
  - Mappato `r.guestMailAddress` come prioritario nel mapping di prenotazione dell'API serverless.
- **Selezione Clienti nella Mailing List ([`NewsletterCampaignSection.tsx`](file:///d:/01%20ANTIGRAVITY/flower-power-village-com/flowerpowervillage/src/admin/resort/components/NewsletterCampaignSection.tsx))**:
  - Distinta chiaramente la condizione `hasNoEmail` per disabilitare con trasparenza e tooltip esplicito i soli contatti privi di email.
  - Tutte le prenotazioni OTA dotate di alias temporaneo risultano ora perfettamente selezionabili e flaggabili per le campagne email del resort.

---

## 3. Matrice File e Componenti Modificati
- `api/_handlers/octorate.ts`: Priorità al campo `guestMailAddress` da Octorate.
- `api/_handlers/social-publisher.ts`: Flusso a 3 fasi Meta Reels API per pubblicazioni Facebook.
- `scripts/social-scheduler-dispatch.mjs`: Flusso Meta Reels API nello scheduler cloud 24/7.
- `scripts/render-parity-test.mjs`: Rotatore dinamico audio nel test di parità cloud.
- `src/admin/resort/components/NewsletterCampaignSection.tsx`: Checkbox mailing list, tooltip OTA ed estrazione email multi-chiave.
- `src/pizza/components/CartDrawer.tsx`: Standardizzazione numero `0949.800.200`.
- `src/pizza/components/ServiceStatusBanner.tsx`: Standardizzazione numero `0949.800.200`.
- `src/pizza/components/TableReservationModal.tsx`: Standardizzazione numero `0949.800.200`.
- `src/social/services/autoCutCopywriterEngine.ts`: Template bilingue con recapito unificato Ranong e specifiche sala Phayam.
- `src/social/services/autoCutLabEngine.ts`: Shuffle Bag a memoria per rotazione audio resort e pizzeria.
- `DIARIO_DI_BORDO.md`: Tracciamento puntuale delle sessioni e delle migliorie operative.
