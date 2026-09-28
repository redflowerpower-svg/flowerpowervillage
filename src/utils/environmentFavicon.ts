/**
 * Dynamic Environment & Department Favicon Engine
 * - Context Detection:
 *   • Public Website: Base Flower Power Emblem
 *   • Admin Pizza (/admin?dept=pizza): Dark Slate Badge with 🍕 Pizza Icon
 *   • Admin Village (/admin?dept=village): Dark Emerald Badge with 🌴 Palm Icon
 *   • Kitchen Tablet (/kitchen): Dark Indigo Badge with 👨‍🍳 Chef Icon
 *   • Admin Gateway (/admin): Dark Slate Badge with 🛡️ Shield Icon
 * - Environment Ring:
 *   • Localhost (127.0.0.1 / localhost): High-contrast RED ring (🔴 #EF4444)
 *   • Virtual / Staging (*.vercel.app): High-contrast EMERALD GREEN ring (🟢 #10B981)
 *   • Official Production (flowerpowerpizza.com / flowerpowervillage.com): Official clean badge
 */

type SectionType = 'public' | 'admin_pizza' | 'admin_village' | 'admin_gateway' | 'kitchen';

export function getActiveSection(): SectionType {
  if (typeof window === 'undefined') return 'public';
  const path = window.location.pathname.toLowerCase();
  const search = window.location.search.toLowerCase();

  if (path.startsWith('/kitchen')) {
    return 'kitchen';
  }

  if (path.startsWith('/admin')) {
    const params = new URLSearchParams(window.location.search);
    const dept = params.get('dept');
    if (dept === 'pizza') return 'admin_pizza';
    if (dept === 'village') return 'admin_village';

    // Check localStorage fallback if dept param is omitted
    try {
      const stored = localStorage.getItem('fp_admin_active_dept');
      if (stored === 'pizza') return 'admin_pizza';
      if (stored === 'village') return 'admin_village';
    } catch {}

    return 'admin_gateway';
  }

  return 'public';
}

export function applyEnvironmentFavicon(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const hostname = window.location.hostname.toLowerCase();
  const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.local');
  const isOfficial = hostname.includes('flowerpowerpizza.com') || hostname.includes('flowerpowervillage.com');
  const isVirtual = !isLocal && !isOfficial;

  const section = getActiveSection();

  // If official production public site, leave standard clean favicon
  if (isOfficial && section === 'public') {
    let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
    if (link && link.href !== '/FP_04_-_LOGO_OFFICIAL_HD.png') {
      link.href = '/FP_04_-_LOGO_OFFICIAL_HD.png';
    }
    return;
  }

  const ringColor = isLocal ? '#EF4444' : isVirtual ? '#10B981' : '#CA8A04'; // Red (Local) | Green (Virtual) | Gold (Official Admin)

  const size = 64; // High-DPI Canvas
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const drawRingAndSet = (drawCenter: () => void) => {
    ctx.clearRect(0, 0, size, size);
    drawCenter();

    // Draw environment ring (only if not official public, or if admin on official)
    if (!isOfficial || section !== 'public') {
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2 - 3.5, 0, Math.PI * 2);
      ctx.lineWidth = 5;
      ctx.strokeStyle = ringColor;
      ctx.stroke();

      // Subtle dark outer stroke for crisp contrast against any browser tab theme
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2 - 0.75, 0, Math.PI * 2);
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.stroke();
    }

    const dataUrl = canvas.toDataURL('image/png');
    let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'shortcut icon';
      document.head.appendChild(link);
    }
    link.type = 'image/png';
    link.href = dataUrl;
  };

  // Section 1: ADMIN PIZZA (🍕)
  if (section === 'admin_pizza') {
    drawRingAndSet(() => {
      // Dark background
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2);
      ctx.fillStyle = '#1c1917';
      ctx.fill();

      // Pizza Icon / Emoji
      ctx.font = '34px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🍕', size / 2, size / 2 + 1);
    });
    return;
  }

  // Section 2: ADMIN VILLAGE (🌴)
  if (section === 'admin_village') {
    drawRingAndSet(() => {
      // Dark emerald background
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2);
      ctx.fillStyle = '#064e3b';
      ctx.fill();

      // Palm Tree Icon / Emoji
      ctx.font = '34px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🌴', size / 2, size / 2 + 1);
    });
    return;
  }

  // Section 3: KITCHEN TABLET KDS (👨‍🍳)
  if (section === 'kitchen') {
    drawRingAndSet(() => {
      // Dark indigo background
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2);
      ctx.fillStyle = '#1e1b4b';
      ctx.fill();

      // Chef / Cook Icon
      ctx.font = '34px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('👨‍🍳', size / 2, size / 2 + 1);
    });
    return;
  }

  // Section 4: ADMIN GATEWAY / SHELL (🛡️)
  if (section === 'admin_gateway') {
    drawRingAndSet(() => {
      // Dark Slate background
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2);
      ctx.fillStyle = '#18181b';
      ctx.fill();

      // Shield / Lock Icon
      ctx.font = '32px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🛡️', size / 2, size / 2 + 1);
    });
    return;
  }

  // Section 5: PUBLIC SITE (Flower Power Emblem)
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = '/flower-power-pizza-emblem.png';

  img.onload = () => {
    drawRingAndSet(() => {
      // Circular white background for crisp logo contrast
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      // Clip circle to draw logo inside
      ctx.save();
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2 - 6, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(img, 6, 6, size - 12, size - 12);
      ctx.restore();
    });
  };

  img.onerror = () => {
    drawRingAndSet(() => {
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2);
      ctx.fillStyle = '#1c1917';
      ctx.fill();

      ctx.fillStyle = ringColor;
      ctx.font = 'bold 22px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(isLocal ? 'DEV' : 'FP', size / 2, size / 2);
    });
  };
}

/**
 * Initializes listeners for dynamic route and URL changes
 */
export function initEnvironmentFaviconObserver(): void {
  if (typeof window === 'undefined') return;

  applyEnvironmentFavicon();

  // Listen to popstate (back/forward button)
  window.addEventListener('popstate', () => applyEnvironmentFavicon());

  // Intercept history.pushState and history.replaceState for SPA transitions
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

  // Periodic lightweight check (every 3 seconds) in case of silent query param updates
  setInterval(() => {
    applyEnvironmentFavicon();
  }, 3000);
}
