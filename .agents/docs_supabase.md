# Supabase Service Integration

## Overview
Supabase is the primary backend database solution for this repository. It stores and manages tables for the food delivery orders, Telegram bot configurations, and Octorate API OAuth tokens.

## Environment Variables
* `VITE_SUPABASE_URL`: The public base URL of the Supabase project.
* `VITE_SUPABASE_ANON_KEY`: The anonymous public client API key.
* `SUPABASE_SERVICE_ROLE_KEY`: Admin API key used in Vercel Serverless Functions (`/api/`) for secure data manipulation.

## Schema Specification

### 1. `pizza_orders`
Tracks customer orders from the delivery menu.
* **Columns:**
  * `id` (uuid, primary key)
  * `items` (jsonb): Array of items, quantity, customizations, and `lasagnaDate` when relevant.
  * `status` (text): Current order state (e.g. `'pending'`, `'accepted'`, `'delivered'`).
  * `total` (numeric)
  * `delivery_address` (text)
  * `customer_phone` (text)
  * `customer_name` (text)
  * `telegram_chat_id` (text): Associated chat ID for notifications.
  * `live_location` (jsonb): `{ latitude, longitude }` object updated via Telegram.

### 2. `telegram_config`
Configures Telegram Bot credentials dynamically.
* **Columns:**
  * `key` (text, primary key): Config selector key.
  * `bot_token` (text)
  * `chat_id` (text)

### 3. `octorate_tokens`
Manages 3-Legged OAuth credentials for the Octorate PMS connection.
* **Columns:**
  * `id` (text, primary key)
  * `access_token` (text)
  * `refresh_token` (text)
  * `expires_at` (timestamp with time zone)

## Query Patterns and Best Practices
1. **Instantiation:**
   Always use the safe client initialization pattern in API functions to prevent dev-startup crashes when keys are missing locally:
   ```typescript
   const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null as any;
   ```
2. **Bulk DB Ops / Vercel Limit Bypass:**
   Due to Vercel Hobby plan limits (max 12 serverless functions), do not add single-purpose database utility endpoints. Inject dynamic query parameter hooks (e.g., `?action=cleanup`) inside an existing api route (like `telegram-notify.ts`) to run maintenance queries, trigger it, and revert.
