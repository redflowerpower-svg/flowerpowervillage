# Telegram Bot API Service Integration

## Overview
The Telegram Bot API is used to notify staff of new pizza orders, allow interactive staff callback buttons (Accept, Reject, Deliver), and receive live location updates from delivery drivers to update the database.

## Environment Variables / Configuration
* `TELEGRAM_BOT_TOKEN`: Token for the Bot (fallback). Active token is loaded from `telegram_config` table in Supabase.
* `TELEGRAM_CHAT_ID`: Recipient Chat ID/Group ID (fallback). Active ID is loaded from `telegram_config` table in Supabase.

## Key API Endpoints & Request Formats

### 1. `/sendMessage`
Sends HTML-formatted order messages with inline action buttons to the restaurant channel.
* **Usage:** `api/telegram-notify.ts`, `api/telegram-webhook.ts`
* **Payload:**
  * `chat_id`: Recipient ID.
  * `text`: HTML string summarizing items, total, customer info, and links (WhatsApp, LINE, Google Maps).
  * `parse_mode`: `"HTML"`
  * `reply_markup`: Inline keyboard containing buttons:
    * `Accetta ✅` (callback_data: `accept_<orderId>`)
    * `Rifiuta ❌` (callback_data: `reject_<orderId>`)

### 2. `/editMessageText`
Updates an existing channel message to reflect changes in order status (e.g. Accepted, Rejected, out for delivery) and updates the inline keyboard options dynamically.
* **Usage:** `api/telegram-update-status.ts`, `api/telegram-webhook.ts`
* **Payload:**
  * `chat_id`: Recipient ID.
  * `message_id`: ID of the message to update.
  * `text`: Updated HTML order text.
  * `parse_mode`: `"HTML"`
  * `reply_markup`: Refreshed inline keyboard matching the new status (e.g. showing "Consegnato 🛵" button).

### 3. `/answerCallbackQuery`
Answers inline keyboard callback queries to dismiss loading states on client Telegram apps.
* **Usage:** `api/telegram-webhook.ts`
* **Payload:**
  * `callback_query_id`: Query ID.
  * `text`: Popup text message.

### 4. `/setWebhook`
Registers the Vercel serverless function (`/api/telegram-webhook`) to receive live POST updates from Telegram.
* **Usage:** `api/admin/sync-telegram-webhook.ts`

## Formatting & Deep Links
* Phone numbers are normalized using Thai country code (`66` prefix) to create deep links for WhatsApp (`https://wa.me/<normalized>`) and LINE (`https://line.me/ti/p/~<normalized>`).
* Interactive callbacks require correct validation and error wrapping to ensure a fluid user experience for delivery staff.
