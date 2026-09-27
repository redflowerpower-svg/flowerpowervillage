# Omise (Opn Payments) API & Integration Reference

## Overview
- **Service Name**: Omise / Opn Payments
- **Official Documentation**: https://www.omise.co/docs
- **API Base URL**: `https://api.omise.co`
- **Vault Base URL**: `https://vault.omise.co`
- **CDN**: `https://cdn.omise.co/omise.js`
- **Supported Payment Methods for Thailand (THB)**:
  - **PromptPay QR** (`type: "promptpay"`) - Scannable Thai QR code
  - **Credit / Debit Cards** (Visa, Mastercard, JCB) with 3-D Secure (`return_uri`)
  - **TrueMoney Wallet** (`type: "truemoney"`)
  - **Mobile Banking** (`type: "mobile_banking_..."`)

## Authentication & Headers
- **Client-Side**: `OMISE_PUBLIC_KEY` (e.g. `pkey_test_...` or `pkey_...`)
- **Server-Side**: `OMISE_SECRET_KEY` (e.g. `skey_test_...` or `skey_...`)
- **HTTP Authorization Header**:
  ```http
  Authorization: Basic base64(OMISE_SECRET_KEY + ":")
  ```
- **API Version**: `2019-05-29` (or newer)
- **Currency & Amount**: Amounts in smallest currency unit (THB satang: `amount * 100`, e.g., 250 THB = `25000`).

## Core Endpoints
1. **Create Token (Client-side via Omise.js)**:
   - `POST https://vault.omise.co/tokens`
   - Returns token `tokn_...` for card payments.
2. **Create Source**:
   - `POST https://api.omise.co/sources`
   - Body: `{ amount, currency: "THB", type: "promptpay" }`
   - Returns source `src_...` with scannable QR details.
3. **Create Charge**:
   - `POST https://api.omise.co/charges`
   - For Cards: `{ amount, currency: "THB", card: "tokn_...", return_uri: "..." }`
   - For PromptPay: `{ amount, currency: "THB", source: "src_...", return_uri: "..." }`
   - Response contains: `id` (`chrg_...`), `status` (`pending`, `successful`, `failed`), `authorize_uri` (for 3DS), `source.scannable_code.image.download_uri` (for PromptPay QR).
4. **Retrieve Charge**:
   - `GET https://api.omise.co/charges/:charge_id`
   - Returns full Charge object with updated status.

## Webhooks
- **Configured Endpoint**: `https://flower-power-village.com/api/webhooks/omise` (or `/api/omise-webhook`)
- **Key Event**: `charge.complete`
- **Payload Format**:
  ```json
  {
    "object": "event",
    "key": "charge.complete",
    "data": {
      "object": "charge",
      "id": "chrg_test_...",
      "status": "successful",
      "amount": 25000,
      "metadata": {
        "order_id": "...",
        "order_type": "pizza"
      }
    }
  }
  ```
- **Webhook Security**:
  - Always verify charge status by making a direct `GET /charges/:id` call using `OMISE_SECRET_KEY` before fulfilling orders.
  - Idempotent processing to prevent duplicate confirmations.
