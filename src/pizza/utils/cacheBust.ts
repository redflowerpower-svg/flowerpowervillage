// Generates a session timestamp on module load.
// This ensures images are cached normally during navigation and re-renders,
// but reloads/refreshes always fetch the freshest image from Supabase Storage without being stuck on stale CDN/browser disk cache.
const SESSION_CACHE_KEY = Date.now();

export function withCacheBust(url: string | undefined | null): string {
  if (!url) return '';
  if (!url.includes('supabase.co')) return url;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}v=${SESSION_CACHE_KEY}`;
}
