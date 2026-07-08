# Flower Power · Farm Village & Spa · Pizza Ranong

A dual-brand web application for:

- **Flower Power Farm Village & Spa** — bungalows, villas, spa, restaurant, and activities on Koh Phayam, Thailand
- **Flower Power Pizza Ranong** — online ordering, staff kitchen dashboard, and menu for the Ranong pizzeria

Backend: [Supabase](https://supabase.com) (database, auth, storage). No other cloud services are required.

---

## Prerequisites

- **Node.js** 18 or later
- **npm** 9 or later
- A provisioned **Supabase** project (credentials in `.env`)

---

## Quick Start

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd <repo-folder>

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env and fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

# 4. Start the development server
npm run dev
```

The app is served at `http://localhost:5173`.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server with HMR |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | TypeScript type-check without emitting |

---

## Environment Variables

Create `.env` at the project root (see `.env.example`):

| Variable | Description | Where to find it |
|---|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL | Supabase dashboard → Project Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Public anon key | Supabase dashboard → Project Settings → API |

Both variables are embedded in the browser bundle at build time — this is expected behaviour for a Supabase frontend. The anon key is safe to expose as long as Row Level Security policies are correctly configured (they are).

---

## Database Migrations

All SQL migrations live in `supabase/migrations/` and are already applied to the production Supabase project. If you provision a **new** Supabase project, apply them in order using the Supabase MCP tools or the Supabase CLI:

```
supabase/migrations/
  20260528133108_add_payment_method_to_pizza_orders.sql
  20260531084504_initial_schema.sql
  20260531084552_create_storage_buckets.sql
```

These create the following tables and storage buckets:

- **`pizza_orders`** — delivery and pickup orders with items (JSONB), totals, status, and optional PromptPay receipt URL
- **`accommodations`** — villa/bungalow/room listings fetched by the Village site
- **Storage bucket `receipts`** — public read, anon upload (customer PromptPay receipts)
- **Storage bucket `accommodation-images`** — public read, authenticated upload (admin photos)

---

## Admin Dashboard

The kitchen dashboard is at `/admin`. It requires a Supabase Auth login.

**Credentials:** see password manager (admin account configured in Supabase Auth — do not commit credentials to this file).

To change the password at any time: Supabase dashboard → Authentication → Users → find the account → Send Password Reset, or edit the password directly from the Users table. No code change needed.

---

## Manual Steps After a Fresh Clone

1. Copy `.env.example` to `.env` and fill in the two Supabase variables.
2. If using a new Supabase project, apply the three migrations listed above.
3. Upload the PromptPay QR image to the `receipts` storage bucket with the exact path `qr_promptpay.jpg` (used by the checkout flow).
4. Create the admin Auth user via Supabase dashboard → Authentication → Users.

---

## External Dependencies

| Service | Purpose | Can be removed? |
|---|---|---|
| **Supabase** | Database, Auth, Storage | No — it is the sole backend |
| **Google Fonts** | Cormorant Garamond, Inter, Playfair Display | Yes — self-host the fonts if offline operation is required |
| **Pexels CDN** | Placeholder images throughout the site | Yes — replace with real photos uploaded to Supabase Storage |
| **Instagram / Facebook** | Social media links in footer and contact page | Yes — remove or update links as needed |

---

## Project Structure

```
src/
  App.tsx                      # Root router
  lib/supabase.ts              # Single Supabase client instance
  pages/
    SplitScreen.tsx            # Landing split-screen (Village / Pizza)
    VillageSite.tsx            # Village multi-page shell
    PizzaSite.tsx              # Pizza informational site
    AccommodationDetailPage.tsx
  sections/                    # Village page sections
  components/                  # Shared Village UI
  data/
    accommodationsData.ts      # Supabase fetchers for accommodations
  pizza/
    types.ts                   # Shared TS types (PizzaOrder, CartItemSaved)
    components/                # Cart, checkout, menu components
    data/menuData.ts           # Static delivery menu (categories + items)
    pages/
      DeliveryMenu.tsx         # Online ordering page
      AdminDashboard.tsx       # Kitchen dashboard (auth required)
    store/                     # Zustand stores (cart, location)
    utils/distance.ts          # Haversine distance calculation
supabase/
  migrations/                  # SQL migration files
public/
  FP_04_-_LOGO_OFFICIAL_HD.png
  Flower_Power_Pizza_-_HotSpring.png
  _redirects                   # SPA fallback for Netlify/Cloudflare Pages
```
