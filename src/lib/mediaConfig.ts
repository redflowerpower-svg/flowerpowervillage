/**
 * 🌸 FLOWER POWER MEDIA OPTIMIZER & CONFIGURATION SYSTEM
 * Gestione centralizzata delle risorse grafiche tramite proxy wsrv.nl
 */

const WSRV_BASE_URL = 'https://wsrv.nl/';

// Parametri di default globali
export const MEDIA_DEFAULTS = {
  QUALITY: 80,
  FORMAT: 'webp',
  FIT: 'cover',
};

// Preset di risoluzione per i diversi contesti d'uso del sito
export type ImagePreset = 'mobile' | 'desktop' | 'detail' | 'thumbnail' | 'ken-burns';

export const IMAGE_PRESETS: Record<ImagePreset, { width: number; quality: number }> = {
  mobile: { width: 800, quality: 80 },       // Per caroselli, griglie e slideshow su smartphone
  desktop: { width: 1400, quality: 80 },     // Per grandi slideshow hero e sfondi larghi
  detail: { width: 1200, quality: 85 },      // Per le immagini della pagina dettaglio alloggio
  thumbnail: { width: 400, quality: 75 },    // Per anteprime e schede di piccole dimensioni
  'ken-burns': { width: 2000, quality: 90 }, // Risoluzione 2K e qualità 90% per evitare sgranature durante lo zoom
};

interface OptimizationOptions {
  quality?: number;
  format?: string;
  fit?: string;
}

/**
 * Riformatta un URL immagine sorgente applicando i parametri di compressione e ridimensionamento di wsrv.nl
 * @param rawUrl L'URL assoluto dell'immagine originale su Supabase Storage o sorgenti esterne
 * @param preset Il preset di visualizzazione per determinare risoluzione e qualità
 * @param overrides Eventuali sovrascritture manuali dei parametri di compressione
 */
export function getOptimizedMediaUrl(
  rawUrl: string,
  preset: ImagePreset = 'desktop',
  overrides?: OptimizationOptions
): string {
  if (!rawUrl) return '';

  // Non processa asset locali pre-compilati (es. SVG, icone o path relativi)
  if (rawUrl.startsWith('/') || rawUrl.startsWith('data:') || rawUrl.endsWith('.svg')) {
    return rawUrl;
  }

  const config = IMAGE_PRESETS[preset];
  const width = config.width;
  const quality = overrides?.quality ?? config.quality;
  const format = overrides?.format ?? MEDIA_DEFAULTS.FORMAT;
  const fit = overrides?.fit ?? MEDIA_DEFAULTS.FIT;

  // Costruisce i parametri di query per wsrv.nl
  const params = new URLSearchParams({
    url: rawUrl,
    w: width.toString(),
    output: format,
    q: quality.toString(),
    fit: fit,
  });

  return `${WSRV_BASE_URL}?${params.toString()}`;
}
