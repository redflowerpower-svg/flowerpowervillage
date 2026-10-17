# Meta Graph API Reference — Social Publishing (Facebook & Instagram)

*Data Creazione:* 17 Ottobre 2026  
*Versione Graph API Target:* `v22.0`  
*Ambito:* Flower Power Social Media Scheduler (Uso Interno Proprietario)

---

## 1. Architettura & Autenticazione

Per la pubblicazione automatica sui canali di proprietà:
* **Account Instagram:** Deve essere un account **Business** o **Creator** collegato alla rispettiva Pagina Facebook.
* **Token d'Accesso:** Viene utilizzato un **Page Access Token** a lunga durata (o perpetuo generato tramite Utente di Sistema nel Meta Business Manager).
* **Permessi Richiesti (Standard Access):**
  - `pages_manage_posts` (Pubblicazione su Pagina Facebook)
  - `pages_read_engagement` (Lettura dati engagement Pagina)
  - `instagram_basic` / `instagram_business_basic` (Lettura ID Instagram Business)
  - `instagram_content_publish` / `instagram_business_content_publish` (Creazione e pubblicazione contenuti Instagram)

---

## 2. Instagram Content Publishing API (Flusso a 2 Fasi)

Instagram adotta obbligatoriamente un'architettura containerizzata a due passaggi:

### Fase 1: Creazione Media Container
```http
POST https://graph.facebook.com/v22.0/{ig-user-id}/media
Content-Type: application/json

{
  "image_url": "https://wsrv.nl/?url=...&output=jpg",
  "caption": "La vera pizza napoletana a Ranong 🍕🔥\n\n#flowerpower #pizza #ranong",
  "access_token": "{PAGE_ACCESS_TOKEN}"
}
```
*Risposta:*
```json
{
  "id": "{CREATION_CONTAINER_ID}"
}
```

*Per i Video / Reels:*
```json
{
  "media_type": "REELS",
  "video_url": "https://.../video.mp4",
  "caption": "Tramonto mozzafiato a Koh Phayam 🌅",
  "share_to_feed": true,
  "access_token": "{PAGE_ACCESS_TOKEN}"
}
```

### Fase 2: Verifica Status (Solo per Video/Reels)
```http
GET https://graph.facebook.com/v22.0/{CREATION_CONTAINER_ID}?fields=status_code&access_token={PAGE_ACCESS_TOKEN}
```
*Attendi fino a quando `status_code === 'FINISHED'` prima di pubblicare.*

### Fase 3: Pubblicazione del Container
```http
POST https://graph.facebook.com/v22.0/{ig-user-id}/media_publish
Content-Type: application/json

{
  "creation_id": "{CREATION_CONTAINER_ID}",
  "access_token": "{PAGE_ACCESS_TOKEN}"
}
```
*Risposta con Post ID definitivo:*
```json
{
  "id": "{IG_MEDIA_ID}"
}
```

---

## 3. Facebook Pages API (Pubblicazione Immagine & Testo)

Per pubblicare un post con foto sulla Pagina Facebook:

```http
POST https://graph.facebook.com/v22.0/{page-id}/photos
Content-Type: application/json

{
  "url": "https://wsrv.nl/?url=...",
  "caption": "Nuovo piatto del giorno: Tagliolini allo Scoglio! 🍝",
  "access_token": "{PAGE_ACCESS_TOKEN}"
}
```
*Risposta:*
```json
{
  "id": "{PHOTO_ID}",
  "post_id": "{PAGE_ID}_{POST_ID}"
}
```

Per post di solo testo o con link:
```http
POST https://graph.facebook.com/v22.0/{page-id}/feed
Content-Type: application/json

{
  "message": "Prenota il tuo alloggio a Koh Phayam per Natale e Capodanno!",
  "link": "https://flowerpowervillage.com",
  "access_token": "{PAGE_ACCESS_TOKEN}"
}
```

---

## 4. Requisiti Immagini & Hosting
* Instagram richiede formati JPEG (`.jpg`) o PNG accessibili pubblicamente via HTTPS (la nostra CDN Supabase / `wsrv.nl` è perfetta).
* Aspect ratio supportati su Instagram:
  - 1:1 (Quadrato)
  - 4:5 (Verticale feed, ottimale per smartphone)
  - 16:9 (Orizzontale)
  - 9:16 (Reels & Stories)
