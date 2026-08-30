# Ksher Payment Gateway (Cash) - Specifiche Tecniche & Documentazione API

## Overview
- **Servizio**: Ksher Payment Gateway (Thailand)
- **App ID (Merchant)**: `mch39593`
- **Valuta Primaria**: THB (Thailand Baht)
- **Metodi Supportati**:
  - PromptPay QR (Banche Thailandesi: SCB, KBank, Bangkok Bank, Krungthai, PromptPay EMVCo standard)
  - Carte di Credito e Debito Internazionali (Visa, Mastercard, JCB, UnionPay)
  - E-Wallets (WeChat Pay, Alipay, TrueMoney)

---

## Endpoint Ufficiali

### Base API Production
- `https://gateway.ksher.com/api/gateway_pay` (Creazione ordine Gateway Pay & Redirect)
- `https://api.ksher.net` (API Endpoint Primario Ksher)

### Parametri Richiesti per Gateway Pay (`/api/gateway_pay`)
| Parametro | Tipo | Descrizione |
| :--- | :--- | :--- |
| `appid` | string | Merchant App ID (`mch39593`) |
| `mch_order_no` | string | Identificativo univoco dell'ordine |
| `mch_code` | string | Codice merchant dell'ordine |
| `total_fee` | integer | Importo in Satang (centesimi di THB, es. 10000 = 100.00 THB) |
| `fee_type` | string | `"THB"` |
| `channel_list` | string | `"card"` oppure `"card,promptpay"` |
| `nonce_str` | string | Stringa casuale crittografica esadecimale |
| `time_stamp` | string | Formato `YYYYMMDDHHmmss` (14 caratteri) |
| `mch_redirect_url` | string | URL di ritorno del cliente a pagamento completato con successo |
| `mch_redirect_url_fail` | string | URL di ritorno a transazione annullata/fallita |
| `mch_notify_url` | string | Endpoint webhook backend per notifica asincrona server-to-server |
| `product_name` | string | Descrizione del servizio o soggiorno prenotato |
| `refer_url` | string | Dominio di provenienza della richiesta |
| `sign` | string | Firma crittografica RSA-SHA256 esadecimale |

---

## Algoritmo di Firma Crittografica RSA (Ufficiale Ksher)
1. Raccolta di tutti i parametri non vuoti (escluso `sign`).
2. Ordinamento alfabetico ASCII per chiave.
3. Concatenazione nel formato ufficiale: `key1=value1key2=value2...` (**TASSATIVAMENTE SENZA `&`** come da specifica Ksher API).
4. Firma crittografica **RSA-MD5** in formato esadecimale (hex lowercase).
5. Output restituito dai server di produzione Ksher: `{ "code": 0, "msg": "SUCCESS", "data": { "pay_content": "https://gateway.ksher.com/ua?order_uuid=...&lang=en" } }`.

---

## Integrazione Backend Flower Power
- Helper Crittografico: [ksher.ts](file:///d:/WEB%20SITE%20Antigravity/flowerpowervillage/api/_helpers/ksher.ts)
- Generatore Standard PromptPay EMVCo: [promptpay.ts](file:///d:/WEB%20SITE%20Antigravity/flowerpowervillage/api/_helpers/promptpay.ts)
- Handler API Transazioni: [payments-admin.ts](file:///d:/WEB%20SITE%20Antigravity/flowerpowervillage/api/_handlers/payments-admin.ts)
