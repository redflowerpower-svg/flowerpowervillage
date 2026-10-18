# Google Business Profile API (v4 & v1) - Base Specifications

Reference file for Reparto Stagno: Social Media Studio (`/social`) & Multichannel Publisher.

## 1. Overview & Service Purpose
The Google Business Profile API enables automated creation and publishing of:
- **Local Posts (Updates / Notità)** on Google Maps and Google Search
- **Special Offers (Sconti & Promozioni)** with promo codes and expiry dates
- **Events (Eventi)** with start/end timestamps
- **Media Uploads (Foto & Video)** to the business photo gallery
- **Review Monitoring & Replies**

Target Locations:
1. **Flower Power Pizza - Ranong Hotspring** (Pizzeria Ranong)
2. **Flower Power Farm Village & Spa** (Koh Phayam Resort)

---

## 2. OAuth 2.0 Credentials & Scopes
### Google Cloud Console Setup
- **Project Name:** `Flower Power Social Studio`
- **Application Type:** `Web Application`
- **Redirect URIs:**
  - `https://flowerpowerpizza.com/api/social-callback`
  - `https://www.flowerpowerpizza.com/api/social-callback`
  - `http://localhost:3000/api/social-callback`

### Required Scopes
- `https://www.googleapis.com/auth/business.manage` (Full Business Profile management, posting, and reviews)

### Environment Variables
- `GOOGLE_CLIENT_ID`: `xxxx.apps.googleusercontent.com`
- `GOOGLE_CLIENT_SECRET`: `GOCSPX-xxxx`
- `GOOGLE_REDIRECT_URI`: `https://flowerpowerpizza.com/api/social-callback`

---

## 3. Core API Endpoints
### A. Account & Location Discovery
- **List Accounts:**
  `GET https://mybusinessaccountmanagement.googleapis.com/v1/accounts`
- **List Locations for Account:**
  `GET https://mybusinessbusinessinformation.googleapis.com/v1/{parent=accounts/*}/locations?readMask=name,title,storefrontAddress,websiteUri`

### B. Local Posts Publishing (Google Maps Updates)
- **Create Local Post:**
  `POST https://mybusiness.googleapis.com/v4/{parent=accounts/*/locations/*}/localPosts`
  
  **Headers:**
  ```http
  Authorization: Bearer <access_token>
  Content-Type: application/json
  ```

  **Request Body Example (Standard Update Post):**
  ```json
  {
    "languageCode": "en",
    "summary": "Crispy wood-fired Pizza Margherita freshly baked with 48h dough fermentation. Enjoy authentic Italian food in our tropical waterfall garden!",
    "callToAction": {
      "actionType": "ORDER",
      "url": "https://flowerpowerpizza.com"
    },
    "media": [
      {
        "mediaFormat": "PHOTO",
        "sourceUrl": "https://flowerpowerpizza.com/demo-media.jpg"
      }
    ],
    "topicType": "STANDARD"
  }
  ```

  **Post Types (`topicType`):**
  - `STANDARD`: Regular update post with photo and CTA button (`ORDER`, `BOOK`, `LEARN_MORE`, `CALL`)
  - `OFFER`: Promotional coupon post with terms and redeem code
  - `EVENT`: Event announcement with `event.schedule`

---

## 4. Security & Compliance
- Google OAuth tokens expire in 1 hour; `refresh_token` is long-lived and must be requested with `access_type=offline` and `prompt=consent`.
- Secrets stored strictly in encrypted vault `.secret_docs/api_credentials_report.md.enc` and `.env` (never hardcoded in Git).
