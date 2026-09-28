/**
 * Environment Favicon Helper
 * - Localhost (127.0.0.1 / localhost): Displays a high-contrast RED ring around the logo 🔴
 * - Virtual / Staging (*.vercel.app / test domains): Displays an EMERALD GREEN ring around the logo 🟢
 * - Official Production (flowerpowerpizza.com / flowerpowervillage.com): Displays clean official favicon without any ring.
 */

export function applyEnvironmentFavicon(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const hostname = window.location.hostname.toLowerCase();
  const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.local');
  const isOfficial = hostname.includes('flowerpowerpizza.com') || hostname.includes('flowerpowervillage.com');
  const isVirtual = !isLocal && !isOfficial;

  // Official production keeps original clean favicon
  if (isOfficial) {
    return;
  }

  const ringColor = isLocal ? '#EF4444' : '#10B981'; // Vivid Red (Local) vs Vivid Emerald (Virtual)

  const size = 64; // High-DPI canvas
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = '/flower-power-pizza-emblem.png';

  img.onload = () => {
    ctx.clearRect(0, 0, size, size);

    // Circular white background for crisp contrast in dark and light browser themes
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // Clip circle to draw logo cleanly inside
    ctx.save();
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 6, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(img, 6, 6, size - 12, size - 12);
    ctx.restore();

    // Draw the environment colored ring
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 3.5, 0, Math.PI * 2);
    ctx.lineWidth = 5;
    ctx.strokeStyle = ringColor;
    ctx.stroke();

    // Subtle dark boundary stroke for high visibility on any tab background
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 0.75, 0, Math.PI * 2);
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.stroke();

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

  img.onerror = () => {
    // High-res fallback if emblem image fails to load
    ctx.clearRect(0, 0, size, size);
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 3, 0, Math.PI * 2);
    ctx.fillStyle = '#1c1917';
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = ringColor;
    ctx.stroke();

    ctx.fillStyle = ringColor;
    ctx.font = 'bold 22px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(isLocal ? 'DEV' : 'VIRT', size / 2, size / 2);

    const dataUrl = canvas.toDataURL('image/png');
    let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
    if (link) link.href = dataUrl;
  };
}
