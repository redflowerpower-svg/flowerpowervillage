/**
 * 🌸 Zero-Egress Media Shield:
 * Converte qualsiasi immagine di Supabase Storage tramite proxy CDN globale gratuito (wsrv.nl su Cloudflare Edge).
 * Benefici vitali:
 * 1. Elimina il distruttivo Date.now() che forzava il download ripetuto da Supabase Storage a ogni refresh
 * 2. Cacha le immagini su oltre 300 data center Cloudflare mondiali a costo zero
 * 3. Azzera il traffico Egress e Cached Egress di Supabase
 */
export function withCacheBust(url: string | undefined | null): string {
  if (!url) return '';
  const cleanUrl = url.split('?')[0];
  if (!cleanUrl.includes('supabase.co')) return cleanUrl;

  // Proxy Cloudflare globale gratuito con compressione WebP e cache permanente
  return `https://wsrv.nl/?url=${encodeURIComponent(cleanUrl)}&output=webp&q=80&maxage=31d`;
}
