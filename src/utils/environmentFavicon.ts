/**
 * Dynamic Environment & Department Favicon Engine
 * - 1. Produzione Ufficiale (flowerpowerpizza.com / flowerpowervillage.com):
 *   • Favicon pulita con il LOGO UFFICIALE del brand su tutte le pagine:
 *     - Flower Power Pizza   -> /flower-power-pizza-logo-256.png
 *     - Flower Power Village -> /FP_04_-_LOGO_OFFICIAL_HD.png
 * - 2. Staging / Virtuale (staging.flowerpowerpizza.com / *.vercel.app):
 *   • Favicon del rispettivo reparto BORDATA DI ROSSO brillante (🔴 #EF4444)
 * - 3. Locale (localhost / 127.0.0.1):
 *   • Badge personalizzati ad altissima leggibilità con SIGLE GIGANTI (2-3 lettere) e bordo ROSSO (🔴 #EF4444):
 *     • SS   (/social, /autocut)     -> Social Studio (Viola/Fucsia Profondo con scritta SS bianca)
 *     • AD   (/admin)                -> Admin Console (Grafite/Ardesia con scritta AD in ambra/oro)
 *     • DT   (/dining, /tavoli)      -> Dining Table  (Blu Mare Profondo con scritta DT bianca)
 *     • KM   (/kitchen, /kds)        -> Kitchen Monitor (Arancio/Rosso Fiamma con scritta KM bianca)
 *     • PIZ  (/pizza, delivery)      -> Pizzeria (Rosso Tradizionale con scritta PIZ in giallo oro)
 *     • VLG  (/village, booking)     -> Village (Verde Tropicale Smeraldo con scritta VLG bianca)
 *     • WR   (/docs, /reader)        -> Web Reader (Blu Notte con scritta WR in celeste ghiaccio)
 */

export type SectionType =
  | 'social'
  | 'admin'
  | 'dining'
  | 'kitchen'
  | 'pizza'
  | 'village'
  | 'docs'
  | 'public';

export interface DeptFaviconTheme {
  label: string;
  bg: string;
  textColor: string;
  accentColor: string;
}

export const DEPT_THEMES: Record<SectionType, DeptFaviconTheme> = {
  social: {
    label: 'SS', // Social Studio
    bg: '#581c87', // Rich Royal Purple
    textColor: '#ffffff',
    accentColor: '#f472b6', // Vibrant Pink
  },
  admin: {
    label: 'AD', // Admin
    bg: '#0f172a', // Titanium Slate
    textColor: '#fbbf24', // Amber Gold
    accentColor: '#f59e0b',
  },
  dining: {
    label: 'DT', // Dining Table
    bg: '#0369a1', // Deep Ocean Blue
    textColor: '#ffffff',
    accentColor: '#38bdf8', // Cyan
  },
  kitchen: {
    label: 'KM', // Kitchen Monitor
    bg: '#c2410c', // Fiery Flame Orange
    textColor: '#ffffff',
    accentColor: '#fdba74',
  },
  pizza: {
    label: 'PIZ', // Pizzeria
    bg: '#991b1b', // Italian Crimson Red
    textColor: '#fde047', // Pizza Gold
    accentColor: '#f87171',
  },
  village: {
    label: 'VLG', // Village
    bg: '#065f46', // Tropical Deep Emerald
    textColor: '#ffffff',
    accentColor: '#34d399', // Mint Lime
  },
  docs: {
    label: 'WR', // Web Reader
    bg: '#1e293b', // Deep Slate
    textColor: '#38bdf8', // Ice Blue
    accentColor: '#7dd3fc',
  },
  public: {
    label: 'PIZ',
    bg: '#991b1b',
    textColor: '#fde047',
    accentColor: '#f87171',
  },
};

export function getActiveSection(): SectionType {
  if (typeof window === 'undefined') return 'public';
  const path = window.location.pathname.toLowerCase();

  // 1. Reparto SOCIAL (/social, /autocut) -> SS
  if (path.startsWith('/social') || path.startsWith('/autocut')) {
    return 'social';
  }

  // 2. Reparto KITCHEN (/kitchen, /kds) -> KM
  if (path.startsWith('/kitchen') || path.startsWith('/kds')) {
    return 'kitchen';
  }

  // 3. Reparto DINING (/dining, /tavoli, /dining-tablet) -> DT
  if (
    path.startsWith('/dining') ||
    path.startsWith('/tavoli') ||
    path.startsWith('/dining-tablet')
  ) {
    return 'dining';
  }

  // 4. Reparto ADMIN (/admin, tutte le aree amministrative) -> AD
  if (path.startsWith('/admin')) {
    return 'admin';
  }

  // 5. Reparto DOCS & Web Reader (/docs, /reader, /read) -> WR
  if (
    path.startsWith('/docs') ||
    path.startsWith('/reader') ||
    path.startsWith('/read')
  ) {
    return 'docs';
  }

  // 6. Reparto VILLAGE (/village, /booking) -> VLG
  if (path.startsWith('/village') || path.startsWith('/booking')) {
    return 'village';
  }

  // 7. Reparto PIZZA (/pizza, /delivery) -> PIZ
  if (path.startsWith('/pizza') || path.startsWith('/delivery')) {
    return 'pizza';
  }

  // 8. Riconoscimento dominio per root '/'
  const hostname = window.location.hostname.toLowerCase();
  if (hostname.includes('flowerpowervillage.com')) {
    return 'village';
  }
  if (hostname.includes('flowerpowerpizza.com')) {
    return 'pizza';
  }

  return 'public';
}

/**
 * Disegna un rettangolo smussato garantito su tutti i browser
 */
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  if (typeof (ctx as any).roundRect === 'function') {
    (ctx as any).roundRect(x, y, width, height, radius);
    return;
  }
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.arcTo(x + width, y, x + width, y + radius, radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
  ctx.lineTo(x + radius, y + height);
  ctx.arcTo(x, y + height, x, y + height - radius, radius);
  ctx.lineTo(x, y + radius);
  ctx.arcTo(x, y, x + radius, y, radius);
  ctx.closePath();
}

/**
 * Aggiorna in modo sicuro l'href della favicon nel tag <link rel="icon">
 */
function setFaviconHref(href: string): void {
  if (typeof document === 'undefined') return;
  let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'shortcut icon';
    document.head.appendChild(link);
  }
  if (link.getAttribute('href') !== href) {
    link.type = 'image/png';
    link.href = href;
  }
}

/**
 * Determina se il contesto corrente appartiene al reparto Flower Power Pizza oppure Village
 */
export function isPizzaDepartment(hostname: string, section?: SectionType): boolean {
  if (hostname.includes('flowerpowerpizza.com')) return true;
  if (hostname.includes('flowerpowervillage.com')) return false;

  if (typeof window !== 'undefined') {
    const path = window.location.pathname.toLowerCase();
    if (
      path.startsWith('/village') ||
      path.startsWith('/rooms') ||
      path.startsWith('/booking') ||
      path.startsWith('/bungalow') ||
      path.startsWith('/villa') ||
      path.startsWith('/chalet')
    ) {
      return false;
    }
    if (
      path.startsWith('/pizza') ||
      path.startsWith('/dining') ||
      path.startsWith('/kitchen') ||
      path.startsWith('/menu') ||
      path.startsWith('/tavoli')
    ) {
      return true;
    }
  }

  if (section === 'village') return false;
  return true; // Default Pizza
}

// Cache in memoria delle favicon Staging generate con bordo rosso
const stagingLogoCache: Record<'pizza' | 'village', string> = {
  pizza: '',
  village: '',
};

/**
 * Renderizza su Canvas il logo ufficiale del reparto bordato di rosso per lo Staging
 */
function applyStagingFavicon(isPizza: boolean): void {
  const key = isPizza ? 'pizza' : 'village';
  if (stagingLogoCache[key]) {
    setFaviconHref(stagingLogoCache[key]);
    return;
  }

  const logoSrc = isPizza
    ? '/flower-power-pizza-logo-256.png'
    : '/FP_04_-_LOGO_OFFICIAL_HD.png';

  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const img = new Image();
  img.src = logoSrc;
  img.onload = () => {
    ctx.clearRect(0, 0, size, size);

    // 1. Sfondo squircle elegante a contrasto
    ctx.beginPath();
    drawRoundedRect(ctx, 2, 2, size - 4, size - 4, 14);
    ctx.fillStyle = isPizza ? '#1c1917' : '#06281e';
    ctx.fill();

    // 2. Disegna il logo centrato e protetto
    ctx.save();
    ctx.beginPath();
    drawRoundedRect(ctx, 4, 4, size - 8, size - 8, 12);
    ctx.clip();
    ctx.drawImage(img, 4, 4, size - 8, size - 8);
    ctx.restore();

    // 3. Bordo ROSSO Staging brillante e visibile (🔴 #EF4444)
    ctx.beginPath();
    drawRoundedRect(ctx, 2, 2, size - 4, size - 4, 14);
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#EF4444';
    ctx.stroke();

    // 4. Ombra/stroke interna per nitidezza e stacco
    ctx.beginPath();
    drawRoundedRect(ctx, 4.5, 4.5, size - 9, size - 9, 11);
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.stroke();

    const dataUrl = canvas.toDataURL('image/png');
    stagingLogoCache[key] = dataUrl;
    setFaviconHref(dataUrl);
  };
}

/**
 * Applica la favicon dinamica in base al reparto e all'ambiente
 */
export function applyEnvironmentFavicon(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const hostname = window.location.hostname.toLowerCase();
  const isLocal =
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.endsWith('.local');

  const isStaging =
    !isLocal &&
    (hostname.startsWith('staging.') ||
      hostname.includes('-staging') ||
      hostname.includes('.vercel.app') ||
      hostname.includes('staging.'));

  const isOfficial =
    !isLocal &&
    !isStaging &&
    (hostname.includes('flowerpowerpizza.com') ||
      hostname.includes('flowerpowervillage.com'));

  const section = getActiveSection();
  const isPizza = isPizzaDepartment(hostname, section);

  // 1. PRODUZIONE UFFICIALE ONLINE: Solo e sempre il LOGO UFFICIALE del rispettivo brand
  if (isOfficial) {
    const targetIcon = isPizza
      ? '/flower-power-pizza-logo-256.png'
      : '/FP_04_-_LOGO_OFFICIAL_HD.png';
    setFaviconHref(targetIcon);
    return;
  }

  // 2. STAGING ONLINE: Logo ufficiale del reparto BORDATO DI ROSSO brillante (🔴 #EF4444)
  if (isStaging) {
    if (section === 'public' || section === 'pizza' || section === 'village') {
      applyStagingFavicon(isPizza);
      return;
    }
    // Per sezioni interne staff aperte su staging (/admin, /social, /kitchen, /dining), prosegue con badge a bordo rosso
  }

  // 3. LOCALE (e console staff su staging): Manteniamo i badge personalizzati attuali ad altissima leggibilità
  const theme = DEPT_THEMES[section] || DEPT_THEMES.public;
  const ringColor = '#EF4444'; // Bordo ROSSO brillante di sviluppo

  const size = 64; // High-DPI Canvas 64x64 per nitidezza assoluta
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.clearRect(0, 0, size, size);

  // 1. Sfondo badge sagomato (Squircle con raggio 14)
  ctx.beginPath();
  drawRoundedRect(ctx, 2, 2, size - 4, size - 4, 14);
  ctx.fillStyle = theme.bg;
  ctx.fill();

  // 2. Bordo ambiente ad alto contrasto (Rosso #EF4444)
  ctx.lineWidth = 3.5;
  ctx.strokeStyle = ringColor;
  ctx.stroke();

  // 3. Ombra/stroke interna per staccare il badge da qualsiasi tema chiaro/scuro del browser
  ctx.beginPath();
  drawRoundedRect(ctx, 4.5, 4.5, size - 9, size - 9, 11);
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.stroke();

  // 4. Linea accento superiore neon
  ctx.beginPath();
  drawRoundedRect(ctx, 12, 6, size - 24, 3, 1.5);
  ctx.fillStyle = theme.accentColor;
  ctx.globalAlpha = 0.85;
  ctx.fill();
  ctx.globalAlpha = 1.0;

  // 5. SIGLA DEL REPARTO GIGANTE, ULTRA-BOLD E CRISTALLINA
  let fontSize = theme.label.length <= 2 ? 35 : 27;

  ctx.font = `900 ${fontSize}px "Outfit", "Arial Black", -apple-system, BlinkMacSystemFont, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Verifica con misurazione reale del testo per evitare qualsiasi overflow
  const maxWidth = size - 12; // 52px utili
  const measured = ctx.measureText(theme.label).width;
  if (measured > maxWidth) {
    const fitted = Math.floor(fontSize * (maxWidth / measured));
    ctx.font = `900 ${fitted}px "Outfit", "Arial Black", -apple-system, BlinkMacSystemFont, sans-serif`;
  }

  // Ombra di contrasto 3D per leggibilità perfetta anche nei tab rimpiccioliti a 16px
  ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
  ctx.shadowBlur = 3.5;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 1.5;

  ctx.fillStyle = theme.textColor;
  ctx.fillText(theme.label, size / 2, size / 2 + 2);

  // Reset ombra
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;

  // 6. Linea accento inferiore discreta
  ctx.beginPath();
  drawRoundedRect(ctx, 18, size - 8, size - 36, 2, 1);
  ctx.fillStyle = theme.accentColor;
  ctx.globalAlpha = 0.45;
  ctx.fill();
  ctx.globalAlpha = 1.0;

  // 7. Aggiornamento istantaneo del tag favicon nel DOM
  const dataUrl = canvas.toDataURL('image/png');
  setFaviconHref(dataUrl);
}

/**
 * Inizializza gli osservatori dinamici per aggiornare la favicon ad ogni cambio pagina / rotta SPA
 */
export function initEnvironmentFaviconObserver(): void {
  if (typeof window === 'undefined') return;

  // Applicazione iniziale immediata
  applyEnvironmentFavicon();

  // Ascolto popstate (tasto avanti / indietro del browser)
  window.addEventListener('popstate', () => applyEnvironmentFavicon());

  // Intercettazione history.pushState e history.replaceState per transizioni SPA Vite/React
  const origPushState = window.history.pushState;
  window.history.pushState = function (...args) {
    const res = origPushState.apply(this, args);
    applyEnvironmentFavicon();
    return res;
  };

  const origReplaceState = window.history.replaceState;
  window.history.replaceState = function (...args) {
    const res = origReplaceState.apply(this, args);
    applyEnvironmentFavicon();
    return res;
  };

  // Controllo leggero periodico (ogni 2.5s) per garantire che la favicon non ritorni mai a quella statica
  setInterval(() => {
    applyEnvironmentFavicon();
  }, 2500);
}
