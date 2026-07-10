# 🌸 Flower Power · Farm Village & Spa · Pizza Ranong — Mappa del Progetto

> **Dual-brand web application**  
> 🏝️ Flower Power Farm Village & Spa (Koh Phayam, Thailandia)  
> 🍕 Flower Power Pizza Ranong (ordinazioni online e dashboard cucina)

---

## Tecnologie Utilizzate

| Categoria | Tecnologia |
|-----------|-----------|
| **Framework UI** | React 18.3 + TypeScript 5.5 |
| **Bundler** | Vite 8.x |
| **Routing** | React Router DOM 7.x |
| **Stile** | Tailwind CSS 3.4 + PostCSS + Autoprefixer |
| **State Management** | Zustand 5.x |
| **Backend / DB** | Supabase (PostgreSQL, Auth, Storage) |
| **Icone** | Lucide React 0.344 |
| **Utility CSS** | clsx, tailwind-merge |
| **Prenotazioni** | Octorate API (proxy `/api-octorate`) |
| **Font** | Google Fonts: Cormorant Garamond, Inter, Playfair Display, Outfit |
| **Linting** | ESLint 9.x + typescript-eslint |
| **Design Tokens** | shadcn/ui (variabili CSS HSL) |

---

## Struttura delle Cartelle

```
flowerpowervillage/
├── public/                          # Asset statici (serviti così come sono)
│   ├── _redirects                   # Regole di redirect per Netlify/Cloudflare Pages (SPA fallback)
│   ├── FP_04_-_LOGO_OFFICIAL_HD.png # Logo ufficiale Flower Power
│   └── Flower_Power_Pizza_-_HotSpring.png # Immagine brand Pizza
│
├── src/                             # Codice sorgente principale
│   ├── App.tsx                      # Router principale (BrowserRouter con 5 route)
│   ├── main.tsx                     # Entry point React (createRoot + StrictMode)
│   ├── index.css                    # Stili globali, font, animazioni, design tokens shadcn/ui
│   └── vite-env.d.ts                # Tipi Vite per import di asset
│
│   ├── pages/                       # Pagine principali dell'applicazione
│   │   ├── SplitScreen.tsx          # Landing page split-screen (Village / Pizza)
│   │   ├── VillageSite.tsx          # Shell multi-sezione del sito Village
│   │   ├── PizzaSite.tsx            # Sito informativo Pizza
│   │   └── AccommodationDetailPage.tsx # Dettaglio singolo alloggio (villa/bungalow)
│   │
│   ├── sections/                    # Sezioni della homepage Village (importate da VillageSite)
│   │   ├── VillageHero.tsx          # Hero section con sfondo e titolo
│   │   ├── VillageHighlights.tsx    # Punti di forza / valori del resort
│   │   ├── AccommodationsSection.tsx # Griglia alloggi (villa, bungalow)
│   │   ├── SpaSection.tsx           # Sezione Spa e benessere
│   │   ├── RestaurantSection.tsx    # Sezione ristorante
│   │   ├── ActivitiesSection.tsx    # Attività ed escursioni
│   │   ├── GallerySection.tsx       # Galleria fotografica
│   │   ├── ContactSection.tsx       # Contatti e social
│   │   ├── DirectionsSection.tsx    # Mappa e indicazioni stradali
│   │   └── VillageBookingBanner.tsx # Banner CTA per prenotazioni
│   │
│   ├── components/                  # Componenti UI condivisi del Village
│   │   ├── VillageNav.tsx           # Barra di navigazione principale
│   │   ├── VillageFooter.tsx        # Footer completo
│   │   └── PageLayout.tsx           # Layout wrapper per pagine
│   │
│   ├── booking/                     # Motore di prenotazione (Octorate)
│   │   ├── booking.css              # Stili specifici del booking engine
│   │   ├── components/
│   │   │   └── booking-engine.tsx   # Componente principale prenotazione
│   │   ├── data/
│   │   │   └── accommodationsService.ts # Servizio dati alloggi
│   │   ├── hooks/
│   │   │   └── use-mobile.ts        # Hook per rilevamento mobile
│   │   ├── lib/
│   │   │   ├── octorate.ts          # Client API Octorate
│   │   │   ├── translations.ts      # Traduzioni UI
│   │   │   └── utils.ts             # Utility varie
│   │   └── resort/
│   │       ├── components/
│   │       │   └── RoomGrid.tsx      # Griglia camere/alloggi
│   │       └── config/
│   │           └── accommodations.ts # Configurazione statica alloggi
│   │
│   ├── pizza/                       # Sotto-sito Pizza (ordinazioni online)
│   │   ├── types.ts                 # Tipi TypeScript condivisi (PizzaOrder, CartItemSaved, ecc.)
│   │   ├── components/
│   │   │   ├── MenuGrid.tsx         # Griglia menu con categorie
│   │   │   ├── CategoryTabs.tsx     # Tab di navigazione categorie
│   │   │   ├── ProductModal.tsx     # Modale dettaglio prodotto
│   │   │   ├── CartDrawer.tsx       # Drawer carrello laterale
│   │   │   └── CheckoutFlow.tsx     # Flusso di checkout (modale a step)
│   │   ├── data/
│   │   │   └── menuData.ts          # Menu statico (categorie + prodotti)
│   │   ├── lib/
│   │   │   └── supabase.ts          # Client Supabase per pizza
│   │   ├── pages/
│   │   │   ├── DeliveryMenu.tsx     # Pagina ordinazione online
│   │   │   └── AdminDashboard.tsx   # Dashboard cucina (protetta da auth)
│   │   ├── store/
│   │   │   ├── cartStore.ts         # Store Zustand carrello
│   │   │   └── locationStore.ts     # Store Zustand posizione utente
│   │   └── utils/
│   │       └── distance.ts          # Calcolo distanza Haversine
│   │
│   ├── data/
│   │   └── accommodationsData.ts    # Fetcher Supabase per alloggi
│   │
│   └── lib/
│       └── supabase.ts              # Istanza singleton client Supabase
│
├── supabase/                        # Database e migrazioni
│   ├── migrations/                  # Migrazioni SQL applicate in ordine
│   │   ├── 20260528133108_add_payment_method_to_pizza_orders.sql
│   │   ├── 20260531084504_initial_schema.sql
│   │   ├── 20260531084552_create_storage_buckets.sql
│   │   ├── 20260708000000_add_admin_delete_policy_receipts.sql
│   │   ├── 20260708000100_create_site_images_bucket.sql
│   │   ├── 20260708065534_check_rls_policies_audit.sql
│   │   ├── 20260708065545_rls_audit_export_temp.sql
│   │   └── 20260708065849_cleanup_rls_audit_temp.sql
│   └── migrations_archive/          # Migrazioni temporanee/diagnostica archiviate
│       ├── 20260708065652_auth_user_diag.sql
│       ├── 20260708065715_fix_auth_user_v2.sql
│       └── 20260708065804_recreate_admin_user_full.sql
│
├── .env.example                     # Template variabili d'ambiente
├── .gitignore                       # File esclusi da Git
├── eslint.config.js                 # Configurazione ESLint
├── index.html                       # HTML entry point
├── package.json                     # Dipendenze e script npm
├── package-lock.json                # Lockfile dipendenze
├── postcss.config.js                # Configurazione PostCSS
├── tailwind.config.js               # Configurazione Tailwind (temi, font, animazioni)
├── tsconfig.json                    # Configurazione TypeScript root
├── tsconfig.app.json                # Configurazione TS per l'app
├── tsconfig.node.json               # Configurazione TS per Node.js
├── vite.config.ts                   # Configurazione Vite (plugin React, proxy API)
├── update-descriptions.mjs          # Script per aggiornare descrizioni
└── test-logout.mjs                  # Script di test logout
```

---

## Routing dell'App (`src/App.tsx`)

| Path | Componente | Descrizione |
|------|-----------|-------------|
| `/` | `SplitScreen` | Landing page con scelta tra Village e Pizza |
| `/village/*` | `VillageSite` | Sito completo del resort (multi-sezione) |
| `/pizza/*` | `PizzaSite` | Sito informativo Pizza |
| `/admin` | `AdminDashboard` | Dashboard cucina (protetta da autenticazione Supabase) |
| `/rooms/:slug` | `AccommodationDetailPage` | Dettaglio singolo alloggio |
| `*` | `Navigate to /` | Fallback alla home |

---

## Database Supabase — Tabelle e Storage

### Tabelle
- **`pizza_orders`** — Ordini pizza (consegna/ritiro) con items (JSONB), totali, stato e URL ricevuta PromptPay
- **`accommodations`** — Elenco ville/bungalow/camere per il sito Village

### Storage Buckets
- **`receipts`** — Lettura pubblica, upload anonimo (ricevute PromptPay clienti)
- **`accommodation-images`** — Lettura pubblica, upload autenticato (foto admin)
- **`site-images`** — Bucket aggiuntivo per immagini del sito

---

## Dipendenze Esterne

| Servizio | Scopo |
|----------|-------|
| **Supabase** | Database, Autenticazione, Storage (unico backend) |
| **Google Fonts** | Cormorant Garamond, Inter, Playfair Display, Outfit |
| **Pexels CDN** | Immagini placeholder |
| **Octorate API** | Motore di prenotazione camere (proxy `/api-octorate`) |
| **Instagram / Facebook** | Link social in footer e contatti |
