# Definitions
- **RedSkill1**: La regola per rimanere costantemente aggiornato su tutti i servizi utilizzati (Octorate, Supabase, Stripe, Telegram Bot, Nodemailer, Google Maps) andando a scaricare automaticamente le specifiche del servizio ogni mese e mantenendole attive nel nostro workspace a ogni sessione di sviluppo per risparmiare token e lavorare con la massima fluidità.
- **/pizze**: Indica che lavoreremo nel reparto stagno dedicato alla delivery food e alla pizzeria a Ranong (codice sorgente in `/src/pizza` e `/api` relativi alla pizzeria).
- **/villaggio**: Indica che lavoreremo nel reparto stagno dedicato al booking engine e al villaggio a Koh Phayam (codice sorgente in `/src/booking` e `/api` relativi alle prenotazioni e alloggi).

# Supabase Storage & Vercel API Limits
- Due to Vercel Hobby plan limits, we cannot add more than 12 serverless functions. To perform custom database or storage tasks (like bulk deletes), temporarily inject a query parameter action hook (e.g. \?action=cleanup\) into an existing API route like \	elegram-notify.ts\, trigger it once, and then revert the file.


# Agent-Ready Web Development (Chrome DevTools 150 Guidelines)
To ensure the application is optimized for web agents (including Antigravity, search bots, and accessibility tools) and fully compatible with DevTools 150 debugging features:
- **Semantic HTML & ARIA Roles**: Use native semantic HTML elements (e.g., `<button>`, `<nav>`, `<main>`) for all structural and interactive elements. Avoid wrapping everything in generic `<div>` tags. Provide descriptive `aria-label` or `aria-describedby` tags to clarify interactive behaviors.
- **Unique & Stable IDs**: Ensure all interactive elements have unique, stable, and human-readable `id` attributes. Do not rely on dynamically generated hash classes (like CSS Modules) for script selectors.
- **Accessible Assets**: Avoid embedding important text inside images. Always provide high-quality `alt` descriptions for images to assist vision models and screen readers.
- **Responsive Layouts**: Utilize modern CSS `@container` queries instead of absolute positions or complex grid hacks, facilitating live styling and responsive overrides.
- **Clean Interactions**: Keep layouts simple and minimize nested pointer-events to prevent agents or testers from getting stuck on overlapping invisible layers.

# New Services Integration & Onboarding
- **New Services Integration & API Specs**: Whenever a new external service, SDK, API, or library is introduced to the project, the agent **MUST** first perform a comprehensive web search of its official documentation, endpoints, request/response formats, and security guidelines.
- **Local Documentation**: Before writing any implementation code, the agent must create a dedicated local reference file (e.g., `.agents/docs_servicename.md`) containing the service's base specifications.
- **Monthly Scheduler Inclusion**: Once documented, this new service must be automatically appended to the checklist of the monthly scheduler for updates, deprecations, and changelog verification.

# Pizzeria / Delivery Food Design Rules
- **Product Name Line Breaking (Double Line Layout)**: Per tutti i prodotti del reparto delivery food (`/pizza`), i nomi dei prodotti che contengono connettori logici devono essere mandati a capo per visualizzarsi sempre su due righe. La logica di formattazione a capo (`formatProductName` nei componenti React) deve dividere il nome prima dei seguenti connettori:
  - ` CON ` (in tutte le lingue)
  - ` & ` (in tutte le lingue, specialmente per le patatine fritte)
  - ` WITH ` (in inglese)
  - ` พร้อม` (in tailandese)

