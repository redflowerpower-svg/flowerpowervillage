# TikTok Content Posting API Reference (v2) — Social Publishing

*Data Creazione:* 17 Ottobre 2026  
*Versione API Target:* `v2` (`https://open.tiktokapis.com/v2/`)  
*Ambito:* Flower Power Social Media Scheduler (Pizzeria Ranong & Villaggio Koh Phayam)

---

## 1. Architettura & Autenticazione OAuth 2.0

* **Portale Sviluppatori:** [TikTok for Developers](https://developers.tiktok.com/)
* **Prodotto Richiesto nell'App:** *Content Posting API* (Direct Post feature)
* **Credenziali App:**
  - `Client Key` (corrisponde all'App ID di TikTok)
  - `Client Secret` (chiave segreta per lo scambio token)
* **Scope Richiesti:**
  - `video.publish`: Pubblicazione diretta sul profilo del creator / account aziendale.
  - `video.upload`: Caricamento bozze nell'inbox creator.
  - `user.info.basic`: Lettura profilo base e username TikTok.

### Flusso Token OAuth 2.0 (v2)
1. Autorizzazione utente:
   `https://www.tiktok.com/v2/auth/authorize/?client_key={CLIENT_KEY}&scope=video.publish,video.upload,user.info.basic&response_type=code&redirect_uri={REDIRECT_URI}&state={STATE}`
2. Scambio `code` per `access_token` (validità 24 ore) e `refresh_token` (validità 365 giorni):
   ```http
   POST https://open.tiktokapis.com/v2/oauth/token/
   Content-Type: application/x-www-form-urlencoded

   client_key={CLIENT_KEY}&client_secret={CLIENT_SECRET}&code={AUTH_CODE}&grant_type=authorization_code&redirect_uri={REDIRECT_URI}
   ```
3. Rinnovo automatico con `refresh_token` (ogni 24h prima della scadenza):
   ```http
   POST https://open.tiktokapis.com/v2/oauth/token/
   Content-Type: application/x-www-form-urlencoded

   client_key={CLIENT_KEY}&client_secret={CLIENT_SECRET}&grant_type=refresh_token&refresh_token={REFRESH_TOKEN}
   ```

---

## 2. Pubblicazione Video / Reels (`/v2/post/publish/video/init/`)

TikTok adotta una pipeline di pubblicazione asincrona a trasferimento via URL (`PULL_FROM_URL`):

### Fase 1: Inizializzazione Video Post
```http
POST https://open.tiktokapis.com/v2/post/publish/video/init/
Authorization: Bearer {USER_ACCESS_TOKEN}
Content-Type: application/json; charset=UTF-8

{
  "post_info": {
    "title": "La vera pizza italiana sfornata a Ranong! 🍕🔥 #pizza #ranong #thailand",
    "privacy_level": "PUBLIC_TO_EVERYONE",
    "disable_comment": false,
    "disable_duet": false,
    "disable_stitch": false
  },
  "source_info": {
    "source": "PULL_FROM_URL",
    "video_url": "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/.../video.mp4"
  }
}
```
*Risposta:*
```json
{
  "data": {
    "publish_id": "v_pub_url~v2.123456789"
  },
  "error": { "code": "ok", "message": "" }
}
```

---

## 3. Pubblicazione Foto & Caroselli (`/v2/post/publish/content/init/`)

TikTok supporta nativamente post di foto singole o caroselli (da 1 a 35 immagini):

```http
POST https://open.tiktokapis.com/v2/post/publish/content/init/
Authorization: Bearer {USER_ACCESS_TOKEN}
Content-Type: application/json; charset=UTF-8

{
  "media_type": "PHOTO",
  "post_mode": "DIRECT_POST",
  "post_info": {
    "title": "Pizza Gourmet a Ranong",
    "description": "Impasto a lunga lievitazione e mozzarella fior di latte importata dall'Italia. Ti aspettiamo!",
    "privacy_level": "PUBLIC_TO_EVERYONE",
    "disable_comment": false
  },
  "source_info": {
    "source": "PULL_FROM_URL",
    "photo_images": [
      "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/.../foto1.jpg",
      "https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/.../foto2.jpg"
    ]
  },
  "is_aigc": false
}
```

---

## 4. Verifica Stato Pubblicazione (Polling Asincrono)

```http
POST https://open.tiktokapis.com/v2/post/publish/status/fetch/
Authorization: Bearer {USER_ACCESS_TOKEN}
Content-Type: application/json; charset=UTF-8

{
  "publish_id": "v_pub_url~v2.123456789"
}
```
*Stato finale atteso:* `status === 'PUBLISH_COMPLETE'`.

---

## 5. Requisiti Formati Media
* **Video:** Formato MP4, MOV o WebM. Risoluzione consigliata verticale 9:16 (1080x1920). Durata da 3 secondi a 10 minuti.
* **Foto:** Formato JPEG o WebP (i file PNG non sono consigliati da TikTok).
* **Hosting:** URL accessibile pubblicamente via HTTPS (il nostro bucket Supabase Storage soddisfa perfettamente questo requisito).
