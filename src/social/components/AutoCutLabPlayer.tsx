import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Play, Pause, RotateCcw, RotateCw, SkipBack, SkipForward, Volume2, VolumeX, Sparkles, Layers, Clock, Music, Star } from 'lucide-react';
import { AutoCutTestRun, AutoCutScene, getCategoryThaiName } from '../services/autoCutLabEngine';
import { LINE_QR_CODE_BASE64 } from '../services/lineQrData';
import { autoCutSoundEngine } from '../services/autoCutSoundEffects';
import { Muxer, ArrayBufferTarget } from 'mp4-muxer';
import { VILLAGE_LOGO_512_BASE64, PIZZA_LOGO_512_BASE64 } from '../services/brandLogosBase64';

// Immagine QR Code Base64 precaricata e decodificata in memoria all'avvio (zero CORS, zero latenza)
const globalLineQrImg = new Image();
globalLineQrImg.src = LINE_QR_CODE_BASE64;

// Loghi Ufficiali precaricati e decodificati all'avvio garantiti al 100% da Data URI Base64 in memoria (zero CORS, zero fetch di rete, zero latenza, mai vuoti)
const globalPizzaLogoImg = typeof Image !== 'undefined' ? new Image() : ({} as HTMLImageElement);
if (globalPizzaLogoImg instanceof Image) {
  globalPizzaLogoImg.src = PIZZA_LOGO_512_BASE64;
}

const globalVillageLogoImg = typeof Image !== 'undefined' ? new Image() : ({} as HTMLImageElement);
if (globalVillageLogoImg instanceof Image) {
  globalVillageLogoImg.src = VILLAGE_LOGO_512_BASE64;
}

// 🛡️ Precaricamento sincrono Canvas Buffer per Loghi Ufficiali (Pizza & Village)
let cachedVillageLogoCanvas: HTMLCanvasElement | null = null;
let cachedPizzaLogoCanvas: HTMLCanvasElement | null = null;
let cachedVillageLogoReady = false;
let cachedPizzaLogoReady = false;

function renderBase64ToCanvas(base64Data: string, fallbackUrl?: string, onReady?: () => void): HTMLCanvasElement | null {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const img = new Image();
  img.onload = () => {
    ctx.clearRect(0, 0, 512, 512);
    ctx.drawImage(img, 0, 0, 512, 512);
    if (onReady) onReady();
  };
  img.onerror = () => {
    if (fallbackUrl) {
      const fb = new Image();
      fb.onload = () => {
        ctx.clearRect(0, 0, 512, 512);
        ctx.drawImage(fb, 0, 0, 512, 512);
        if (onReady) onReady();
      };
      fb.src = fallbackUrl;
    }
  };
  img.src = base64Data;
  if (img.complete && img.naturalWidth > 0) {
    ctx.clearRect(0, 0, 512, 512);
    ctx.drawImage(img, 0, 0, 512, 512);
    if (onReady) onReady();
  }
  return canvas;
}

if (typeof document !== 'undefined') {
  cachedPizzaLogoCanvas = renderBase64ToCanvas(PIZZA_LOGO_512_BASE64, '/flower-power-pizza-logo-512.png', () => { cachedPizzaLogoReady = true; });
  cachedVillageLogoCanvas = renderBase64ToCanvas(VILLAGE_LOGO_512_BASE64, '/flower-power-village-logo-512.png', () => { cachedVillageLogoReady = true; });
}

async function ensureBrandLogosReady(): Promise<void> {
  if (typeof document === 'undefined') return;

  const bakeCanvas = (src: string, existing: HTMLCanvasElement | null, fallbackUrl?: string): Promise<{ canvas: HTMLCanvasElement; ready: boolean }> => {
    return new Promise((resolve) => {
      const c = existing || document.createElement('canvas');
      c.width = 512;
      c.height = 512;
      const ctx = c.getContext('2d');
      const img = new Image();
      img.onload = () => {
        if (ctx) {
          ctx.clearRect(0, 0, 512, 512);
          ctx.drawImage(img, 0, 0, 512, 512);
        }
        resolve({ canvas: c, ready: true });
      };
      img.onerror = () => {
        if (fallbackUrl) {
          const fb = new Image();
          fb.onload = () => {
            if (ctx) {
              ctx.clearRect(0, 0, 512, 512);
              ctx.drawImage(fb, 0, 0, 512, 512);
            }
            resolve({ canvas: c, ready: true });
          };
          fb.onerror = () => resolve({ canvas: c, ready: false });
          fb.src = fallbackUrl;
        } else {
          resolve({ canvas: c, ready: false });
        }
      };
      img.src = src;
      if (img.complete && img.naturalWidth > 0) {
        if (ctx) {
          ctx.clearRect(0, 0, 512, 512);
          ctx.drawImage(img, 0, 0, 512, 512);
        }
        resolve({ canvas: c, ready: true });
      }
    });
  };

  const [pizzaRes, villageRes] = await Promise.all([
    bakeCanvas(PIZZA_LOGO_512_BASE64, cachedPizzaLogoCanvas, '/flower-power-pizza-logo-512.png'),
    bakeCanvas(VILLAGE_LOGO_512_BASE64, cachedVillageLogoCanvas, '/flower-power-village-logo-512.png')
  ]);
  cachedPizzaLogoCanvas = pizzaRes.canvas;
  cachedPizzaLogoReady = pizzaRes.ready;
  cachedVillageLogoCanvas = villageRes.canvas;
  cachedVillageLogoReady = villageRes.ready;
}

if (typeof window !== 'undefined') {
  ensureBrandLogosReady().catch(() => {});
}

// SVG Path ufficiale WhatsApp per rendering fedele su Canvas 2D
const WA_PHONE_PATH_DATA =
  'M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 15 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M8.53 7.33C8.37 7.33 8.1 7.39 7.87 7.64C7.65 7.89 7 8.5 7 9.71C7 10.93 7.89 12.1 8.01 12.27C8.14 12.44 9.76 14.94 12.25 16C12.84 16.27 13.3 16.42 13.66 16.53C14.25 16.72 14.79 16.69 15.22 16.63C15.7 16.56 16.68 16.03 16.89 15.45C17.1 14.87 17.1 14.38 17.04 14.27C16.97 14.17 16.81 14.11 16.56 13.99C16.32 13.86 15.12 13.27 14.9 13.19C14.68 13.1 14.52 13.06 14.36 13.3C14.19 13.55 13.73 14.11 13.59 14.27C13.45 14.44 13.31 14.46 13.06 14.34C12.82 14.21 12.05 13.96 11.13 13.14C10.42 12.5 9.93 11.72 9.8 11.49C9.66 11.25 9.78 11.11 9.9 10.99C10.01 10.88 10.15 10.7 10.27 10.56C10.39 10.41 10.44 10.31 10.52 10.15C10.6 9.99 10.56 9.85 10.5 9.72C10.44 9.6 9.95 8.41 9.75 7.91C9.55 7.43 9.35 7.5 9.19 7.49C9.05 7.49 8.89 7.48 8.72 7.48L8.53 7.33Z';
const waPhonePath2D = typeof Path2D !== 'undefined' ? new Path2D(WA_PHONE_PATH_DATA) : null;

// SVG Path ufficiale LINE per rendering fedele su Canvas 2D
const LINE_ICON_PATH_DATA =
  'M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314';
const lineIconPath2D = typeof Path2D !== 'undefined' ? new Path2D(LINE_ICON_PATH_DATA) : null;

/**
 * 🏷️ Formattatore Testi Specifico per Video 4:3 Companion (P1):
 * - Se lo spazio è sufficiente su una sola riga (<= 28 caratteri per EN, <= 26 per TH), non va MAI a capo.
 * - Se supera la capienza orizzontale, va a capo con CONTESTO:
 *   1) Prima della categoria finale del piatto (es. "EGG AND VEGETABLE" a capo "SALAD")
 *   2) Prima dei connettori culinari (WITH, CON, ALLA, ALLO, AL, IN...) MAI lasciando parole orfane a inizio riga
 *   3) Per il Thai prima di connettori semantici (ซอส, สไตล์, พร้อม, parentesi)
 */
function format43DishTitle(rawText: string, lang: 'th' | 'en'): string[] {
  if (!rawText) return [];
  const clean = rawText.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
  if (!clean) return [];

  const maxSingleLine = lang === 'en' ? 34 : 30;

  // Se lo spazio è sufficiente su una sola riga, non andare MAI a capo
  if (clean.length <= maxSingleLine) {
    return [clean];
  }

  if (lang === 'en') {
    const upper = clean.toUpperCase();

    // 1. Categoria finale (es: "EGG AND VEGETABLE" a capo "SALAD")
    const CATEGORIES = [' SALAD', ' PIZZA', ' PASTA', ' BURGER', ' SANDWICH', ' SOUP', ' DESSERT', ' STEAK'];
    for (const cat of CATEGORIES) {
      const idx = upper.lastIndexOf(cat);
      if (idx >= 8 && (clean.length - idx) <= 12) {
        const part1 = clean.substring(0, idx).trim();
        const part2 = clean.substring(idx).trim();
        return [part1, part2];
      }
    }

    // 2. Connettori culinari (solo se la prima parte ha almeno 7 caratteri, mai orfani come "EGG")
    const CONNECTORS = [' WITH ', ' CON ', ' ALLA ', ' ALLO ', ' AL ', ' IN ', ' & ', ' AND '];
    for (const conn of CONNECTORS) {
      const idx = upper.indexOf(conn);
      if (idx >= 7 && (clean.length - idx) >= 5) {
        const part1 = clean.substring(0, idx).trim();
        const part2 = clean.substring(idx).trim();
        return [part1, part2];
      }
    }

    // 3. Spezza allo spazio più centrale evitando orfani
    const words = clean.split(' ');
    if (words.length >= 2) {
      const mid = Math.ceil(words.length / 2);
      const part1 = words.slice(0, mid).join(' ');
      const part2 = words.slice(mid).join(' ');
      return [part1, part2];
    }

    return [clean];
  }

  // THAI
  const THAI_CONNECTORS = ['ซอส', 'สไตล์', 'พร้อม', ' ('];
  for (const conn of THAI_CONNECTORS) {
    const idx = clean.indexOf(conn);
    if (idx >= 6 && (clean.length - idx) >= 4) {
      const part1 = clean.substring(0, idx).trim();
      const part2 = clean.substring(idx).trim();
      return [part1, part2];
    }
  }

  if (clean.includes(' ')) {
    const spaceIdx = clean.indexOf(' ');
    if (spaceIdx >= 6 && (clean.length - spaceIdx) >= 5) {
      return [clean.substring(0, spaceIdx).trim(), clean.substring(spaceIdx).trim()];
    }
  }

  return [clean];
}

export interface AutoCutLabPlayerProps {
  testRun: AutoCutTestRun;
  onReplay?: () => void;
  autoPlay?: boolean;
}

export function AutoCutLabPlayer({
  testRun,
  onReplay,
  autoPlay = false
}: AutoCutLabPlayerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvas43Ref = useRef<HTMLCanvasElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;
  const hasPlayedOutroSfxRef = useRef(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);

  const currentElapsedRef = useRef<number>(0);
  const renderFrameRef = useRef<((elapsed: number) => void) | null>(null);

  const lastTestRunRef = useRef(testRun);
  useEffect(() => {
    if (lastTestRunRef.current !== testRun) {
      lastTestRunRef.current = testRun;
      currentElapsedRef.current = 0;
      setProgress(0);
      setIsEnded(false);
      setIsPlaying(false);
    }
  }, [testRun]);

  const { scenes, totalDuration, sceneDuration, audioTrack, brand, mode } = testRun;
  const isCompanionEligible = mode === 'P1' || mode === 'V1' || mode === 'LM1';
  const sceneCount = scenes.length;

  const isSingleHero = mode === 'P1' || mode === 'DS';
  // Durata Outro finale e sincronizzazione perfetta audio per tutti i formati
  const OUTRO_DURATION = isSingleHero ? Math.max(3.5, totalDuration - (scenes[0]?.duration || sceneDuration)) : 3.8;
  const totalVideoDuration = isSingleHero ? totalDuration : (totalDuration >= 14 ? totalDuration : totalDuration + 3.8);
  const musicDuration = totalVideoDuration;
  const outroStartTime = Math.max(4.0, totalVideoDuration - OUTRO_DURATION);

  // 🎬 CONTINUOUS SEAMLESS FLYING CROSSFADE: Calcolo timeline cumulativa per ciascuna scena distribuita in [0, outroStartTime]
  const sceneTimeline = useMemo(() => {
    const list: Array<{ start: number; end: number; duration: number }> = [];
    const availableScenesTime = outroStartTime;
    const rawTotalScenesDur = scenes.reduce((acc, sc) => acc + (sc.duration || sceneDuration), 0) || 1;
    let cumTime = 0;
    for (let i = 0; i < scenes.length; i++) {
      const origDur = scenes[i].duration || sceneDuration;
      const dur = (origDur / rawTotalScenesDur) * availableScenesTime;
      list.push({
        start: cumTime,
        end: cumTime + dur,
        duration: dur
      });
      cumTime += dur;
    }
    return list;
  }, [scenes, sceneDuration, outroStartTime]);

  // 📸 REGOLA 14 AGENTS.MD: CALCOLO FOTOGRAMMA THUMBNAIL UFFICIALE (MASSIMO ZOOM PRE-DISSOLVENZA)
  const scene1Dur = sceneTimeline[0]?.duration || sceneDuration;
  const effectiveDissolve1 = Math.min(0.65, scene1Dur * 0.28);
  const transitionThreshold1 = scene1Dur - effectiveDissolve1;
  const thumbnailTimestamp = Math.max(0.1, transitionThreshold1 - 0.05);

  // Setup e caricamento traccia audio (SOLO quando cambia la sorgente audioTrack.src)
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(audioTrack.src);
    } else {
      const fullUrl = new URL(audioTrack.src, window.location.href).href;
      if (audioRef.current.src !== fullUrl) {
        audioRef.current.pause();
        audioRef.current.src = audioTrack.src;
        audioRef.current.load();
      }
    }
    audioRef.current.volume = 1.0;
    audioRef.current.currentTime = 0;
    audioRef.current.muted = isAudioMuted;
  }, [audioTrack.src]);

  // Sincronizza mute
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isAudioMuted;
    }
  }, [isAudioMuted]);

  // Riproduzione / Canvas Render Loop con Pan & Zoom Simultanei e Crossfade (9:16 + 4:3 Companion)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const canvas43 = canvas43Ref.current;
    const ctx43 = canvas43 ? canvas43.getContext('2d') : null;

    // Precarica tutte le immagini delle scene
    const loadedImages: HTMLImageElement[] = scenes.map((scene) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = scene.imageUrl;
      return img;
    });

    let isCancelled = false;

    if (isPlaying && !testRun.isEmptyShowcase) {
      startTimeRef.current = performance.now() - (currentElapsedRef.current * 1000);
      setIsEnded(false);
      if (audioRef.current) {
        audioRef.current.volume = 1.0;
        audioRef.current.currentTime = Math.min(musicDuration, currentElapsedRef.current);
        audioRef.current.play().catch(e => console.log('Audio play info:', e));
      }
    }

    // Riferimento al logo ufficiale (Pizza / Villaggio)
    const logoImg = brand === 'pizza' ? globalPizzaLogoImg : globalVillageLogoImg;
    if (logoImg instanceof Image && !logoImg.src) {
      logoImg.src = brand === 'pizza' ? PIZZA_LOGO_512_BASE64 : VILLAGE_LOGO_512_BASE64;
    }

    // QR Code ufficiale LINE della Pizzeria garantito da istanza Base64 in memoria
    const lineQrImg = globalLineQrImg;
    if (!lineQrImg.src) {
      lineQrImg.src = LINE_QR_CODE_BASE64;
    }

    const drawSceneToCanvas = (
      c: HTMLCanvasElement,
      cCtx: CanvasRenderingContext2D,
      img: HTMLImageElement,
      scene: AutoCutScene,
      localT: number,
      opacity: number,
      is43: boolean = false
    ) => {
      if (!img.complete || img.naturalWidth === 0) return;

      cCtx.imageSmoothingEnabled = true;
      cCtx.imageSmoothingQuality = 'high';

      const w = c.width;
      const h = c.height;

      // Adattamento proporzioni cover (9:16 o 4:3)
      const imgAspect = img.naturalWidth / img.naturalHeight;
      const canvasAspect = w / h;
      let baseW = w;
      let baseH = h;
      if (imgAspect > canvasAspect) {
        baseH = h;
        baseW = h * imgAspect;
      } else {
        baseW = w;
        baseH = w / imgAspect;
      }

      // Curva di accelerazione morbida (Ease-in-out)
      const t = localT < 0.5 ? 2 * localT * localT : 1 - Math.pow(-2 * localT + 2, 2) / 2;

      let scale = 1.15;
      let panX = 0;
      let panY = 0;

      if (is43) {
        // 🖥️ FORMATO 4:3 GOOGLE MAPS / FB:
        // Zero movimento laterale (panX = 0, panY = 0)
        // Zoom continuo progressivo in avanti che ingrandisce sempre di più il piatto / alloggio!
        const easeZoom = 0.5 - 0.5 * Math.cos(localT * Math.PI); // Curva cosinusoidale pura vellutata
        scale = 1.02 + (easeZoom * 0.18); // Da 1.02x naturale fino a 1.20x macro continuo
        panX = 0;
        panY = 0;
      } else {
        const maxPanX = Math.max(0, (baseW * 1.15 - w) / 2);
        const maxPanY = Math.max(0, (baseH * 1.18 - h) / 2);

        // 🛡️ Margine di sicurezza villaggio (V1, V2, V3, LM1):
        // Come per la pizzeria, parte un po' dopo nello scorrimento e finisce un po' prima (68% del massimo)
        // con scala minima protetta a 1.16x, azzerando categoricamente qualsiasi riga nera su tutti i canvas.
        const safePanX = maxPanX * 0.68;
        const safePanY = maxPanY * 0.68;

        // Metodo CapCut Elegante: Pan e Zoom Simultanei per 9:16 Smartphone
        switch (scene.trajectory) {
          // 🍕 FOOD COMMERCIAL MACRO-FOCUS (2 SOLE FASI CONTINUE CON RANGE INTERMEDIO SOFFICE)
          case 'food_macro_focus_lr': {
            const softPanX = maxPanX * 0.42;

            if (localT < 0.50) {
              const p1 = localT / 0.50;
              const easeP1 = 0.5 - 0.5 * Math.cos(p1 * Math.PI);
              panX = -softPanX + (easeP1 * 2 * softPanX);
              scale = 1.12 + (easeP1 * 0.02);
            } else {
              const p2 = (localT - 0.50) / 0.50;
              const easeP2 = 0.5 - 0.5 * Math.cos(p2 * Math.PI);
              panX = softPanX - (easeP2 * softPanX);
              scale = 1.14 + (easeP2 * 0.22);
            }
            panY = 0;
            break;
          }

          // 🍕 FOOD COMMERCIAL MACRO-FOCUS SPECULARE (Destra -> Sinistra -> Centro Zoom)
          case 'food_macro_focus_rl': {
            const softPanX = maxPanX * 0.42;

            if (localT < 0.50) {
              const p1 = localT / 0.50;
              const easeP1 = 0.5 - 0.5 * Math.cos(p1 * Math.PI);
              panX = softPanX - (easeP1 * 2 * softPanX);
              scale = 1.12 + (easeP1 * 0.02);
            } else {
              const p2 = (localT - 0.50) / 0.50;
              const easeP2 = 0.5 - 0.5 * Math.cos(p2 * Math.PI);
              panX = -softPanX + (easeP2 * softPanX);
              scale = 1.14 + (easeP2 * 0.22);
            }
            panY = 0;
            break;
          }

          // ↔️ Sinistra verso Destra
          case 'pan_left_to_right':
          case 'pan_left_zoom_in':
            scale = 1.16 + (t * 0.08);
            panX = safePanX - (t * 2 * safePanX);
            panY = 0;
            break;

          // ↔️ Destra verso Sinistra
          case 'pan_right_to_left':
          case 'pan_right_zoom_in':
            scale = 1.16 + (t * 0.08);
            panX = -safePanX + (t * 2 * safePanX);
            panY = 0;
            break;

          case 'pan_left_zoom_out':
            scale = 1.24 - (t * 0.08);
            panX = safePanX - (t * 2 * safePanX);
            panY = 0;
            break;

          case 'pan_right_zoom_out':
            scale = 1.24 - (t * 0.08);
            panX = -safePanX + (t * 2 * safePanX);
            panY = 0;
            break;

          // ↗️ Diagonale Basso-SX verso Alto-DX
          case 'diagonal_up_right':
            scale = 1.18 + (t * 0.06);
            panX = safePanX - (t * 2 * safePanX);
            panY = -safePanY + (t * 2 * safePanY);
            break;

          // ↖️ Diagonale Basso-DX verso Alto-SX
          case 'diagonal_up_left':
            scale = 1.18 + (t * 0.06);
            panX = -safePanX + (t * 2 * safePanX);
            panY = -safePanY + (t * 2 * safePanY);
            break;

          case 'push_in_focal':
          default:
            scale = 1.14 + (t * 0.10);
            panX = 0;
            panY = 0;
            break;
        }
      }

      cCtx.save();
      cCtx.globalAlpha = opacity;
      cCtx.translate(w / 2 + panX, h / 2 + panY);
      cCtx.scale(scale, scale);
      cCtx.drawImage(img, -baseW / 2, -baseH / 2, baseW, baseH);
      cCtx.restore();
    };

    // Helper per disegnare in parallelo sia su 9:16 che su 4:3 companion
    const drawBothCanvases = (img: HTMLImageElement, scene: AutoCutScene, localT: number, opacity: number) => {
      drawSceneToCanvas(canvas, ctx, img, scene, localT, opacity, false);
      if (canvas43 && ctx43) {
        drawSceneToCanvas(canvas43, ctx43, img, scene, localT, opacity, true);
      }
    };

    // 🎬 Helper universale per disegnare l'Outro del Brand (Logo 3D con rimbalzo elastico, card e contatti)
    const drawFullOutroToContext = (
      targetCtx: CanvasRenderingContext2D,
      w: number,
      h: number,
      outroElapsed: number
    ) => {
      targetCtx.save();
      // 📐 Scala proporzionale automatica: rende l'outro perfetto sia su 720p che su 1080p Full HD
      targetCtx.scale(w / 720, h / 1280);
      const wVirtual = 720;
      const hVirtual = 1280;

      // Velo scuro cinematografico che fa risaltare lo stampo del logo e la card contatti
      const darkAlpha = Math.min(0.88, (outroElapsed / 0.35) * 0.88);
      targetCtx.fillStyle = `rgba(0, 0, 0, ${darkAlpha})`;
      targetCtx.fillRect(0, 0, wVirtual, hVirtual);

      // Animazione Regale d'Ingresso Logo (morbida discesa da 1.85x a 0.96x con assestamento vellutato a 1.0x)
      const stampDuration = 0.55;
      const stampProgress = Math.min(1.0, outroElapsed / stampDuration);
      let stampScale = 1.0;
      let stampAlpha = 1.0;
      let stampRotate = 0;

      if (stampProgress < 0.75) {
        // Fase 1: Vola dolcemente da 1.85x a 0.96x con discesa quadratica vellutata
        const p = stampProgress / 0.75;
        const easeIn = p * p;
        stampScale = 1.85 - (easeIn * (1.85 - 0.96));
        stampAlpha = Math.min(1.0, p * 1.5);
        stampRotate = (-3 * (1 - p)) * (Math.PI / 180);
      } else {
        // Fase 2: Impatto a stampo & rimbalzo elastico assestandosi a 1.0x
        const p = (stampProgress - 0.75) / 0.25;
        const bounce = Math.sin(p * Math.PI);
        stampScale = 0.96 + (p * 0.04) + (bounce * 0.04);
        stampAlpha = 1.0;
        stampRotate = 0;
      }

      const cx = wVirtual / 2;
      const cy = 285; // Posizionato con maestoso respiro nella metà superiore
      const baseLogoSize = 220; // Logo maggiorato e regale

      // Alone luminoso dorato radiale all'impatto
      if (stampProgress >= 0.65) {
        const glowAlpha = Math.min(0.50, (outroElapsed - 0.40) * 0.7);
        const glow = targetCtx.createRadialGradient(cx, cy, 30, cx, cy, 260);
        glow.addColorStop(0, `rgba(245, 158, 11, ${glowAlpha})`);
        glow.addColorStop(0.55, `rgba(217, 119, 6, ${glowAlpha * 0.45})`);
        glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        targetCtx.fillStyle = glow;
        targetCtx.fillRect(0, 0, wVirtual, hVirtual);
      }

      // Disegno Logo Centrato con Ombra 3D d'Impatto
      const domOutroLogo = typeof document !== 'undefined' ? (document.getElementById('autoCutHeaderLogoImg') as HTMLImageElement | null) : null;
      const targetOutroLogo = brand === 'pizza' ? globalPizzaLogoImg : globalVillageLogoImg;
      const outroLogoCanvas = brand === 'pizza' ? cachedPizzaLogoCanvas : cachedVillageLogoCanvas;
      const effectiveOutroLogo: CanvasImageSource | null =
        (domOutroLogo && domOutroLogo.complete && domOutroLogo.naturalWidth > 0)
          ? domOutroLogo
          : (targetOutroLogo && targetOutroLogo.complete && targetOutroLogo.naturalWidth > 0)
            ? targetOutroLogo
            : (outroLogoCanvas && outroLogoCanvas.width > 0)
              ? outroLogoCanvas
              : logoImg;

      if (effectiveOutroLogo) {
        targetCtx.save();
        targetCtx.translate(cx, cy);
        targetCtx.rotate(stampRotate);
        targetCtx.scale(stampScale, stampScale);
        targetCtx.globalAlpha = stampAlpha;

        targetCtx.shadowColor = 'rgba(0, 0, 0, 0.95)';
        targetCtx.shadowBlur = 40;
        targetCtx.shadowOffsetY = 16;

        targetCtx.drawImage(effectiveOutroLogo, -baseLogoSize / 2, -baseLogoSize / 2, baseLogoSize, baseLogoSize);
        targetCtx.restore();
      }

      // Titoli e firma del Brand (emergono in dissolvenza sotto al logo dopo la stampata)
      if (outroElapsed > 0.40) {
        const textAlpha = Math.min(1.0, (outroElapsed - 0.40) / 0.35);
        targetCtx.save();
        targetCtx.globalAlpha = textAlpha;
        targetCtx.textAlign = 'center';

        // Nome Brand Dorato (Grande & Incisivo 42px)
        targetCtx.font = '900 42px "Outfit", "Inter", sans-serif';
        targetCtx.fillStyle = '#fbbf24';
        targetCtx.shadowColor = 'rgba(0, 0, 0, 0.95)';
        targetCtx.shadowBlur = 14;
        targetCtx.shadowOffsetY = 4;
        targetCtx.fillText(
          mode === 'R1'
            ? 'FLOWER POWER RESTAURANT'
            : (brand === 'pizza' ? 'FLOWER POWER PIZZA' : 'FLOWER POWER VILLAGE'),
          cx,
          cy + (baseLogoSize / 2) + 48
        );

        // Località (Grande & Chiara 24px)
        targetCtx.font = '800 24px "Outfit", "Inter", sans-serif';
        targetCtx.fillStyle = '#ffffff';
        targetCtx.shadowBlur = 10;
        targetCtx.shadowOffsetY = 3;
        targetCtx.fillText(
          (mode === 'R1' || brand === 'village') ? 'KOH PHAYAM · THAILAND' : 'RANONG · THAILAND',
          cx,
          cy + (baseLogoSize / 2) + 82
        );

        // Sottotitolo / Identità Ufficiale (Zero Napoletana - Solo Tradizionale Italiana)
        targetCtx.font = '700 20px "Outfit", "Inter", sans-serif';
        targetCtx.fillStyle = '#cbd5e1';
        targetCtx.shadowBlur = 6;
        targetCtx.shadowOffsetY = 2;
        targetCtx.fillText(
          mode === 'R1'
            ? 'Italian Restaurant & Island Delivery'
            : (brand === 'pizza'
              ? 'Authentic Traditional Italian Pizza'
              : 'Tropical Island Resort & Eco Sanctuary'),
          cx,
          cy + (baseLogoSize / 2) + 112
        );

        // 🛵 CARD FINALE AD ALTO IMPATTO (VISIVA, INCISIVA, ZERO SBUZZO & LEGGIBILE SUBITO)
        const boxX = 24;
        const boxY = cy + (baseLogoSize / 2) + 130;
        const boxW = wVirtual - 48; // 672px (più larga, ariosa e maestosa)
        const boxH = 715;           // 715px (sfrutta lo schermo annullando i 200px di buco nero sul fondo)
        const radius = 32;

        // Sfondo scuro satinato con sfumatura verticale e bordo dorato/smeraldo luminescente
        targetCtx.save();
        targetCtx.beginPath();
        if (typeof targetCtx.roundRect === 'function') {
          targetCtx.roundRect(boxX, boxY, boxW, boxH, radius);
        } else {
          targetCtx.rect(boxX, boxY, boxW, boxH);
        }
        const cardGrad = targetCtx.createLinearGradient(boxX, boxY, boxX, boxY + boxH);
        cardGrad.addColorStop(0, 'rgba(15, 23, 42, 0.96)');
        cardGrad.addColorStop(1, 'rgba(8, 12, 22, 0.98)');
        targetCtx.fillStyle = cardGrad;
        targetCtx.fill();
        targetCtx.lineWidth = 2.5;
        targetCtx.strokeStyle = (brand === 'pizza' && mode !== 'R1') ? 'rgba(245, 158, 11, 0.75)' : 'rgba(52, 211, 153, 0.85)';
        targetCtx.shadowColor = (brand === 'pizza' && mode !== 'R1') ? 'rgba(245, 158, 11, 0.45)' : 'rgba(52, 211, 153, 0.50)';
        targetCtx.shadowBlur = 24;
        targetCtx.stroke();
        targetCtx.restore();

        // Intestazione Card su 2 righe (Zero Sbuzzo, Perfetta Gerarchia Biculturale)
        targetCtx.textAlign = 'center';
        if (mode === 'R1') {
          // Riga 1 Titolo Delivery & Restaurant
          targetCtx.font = '900 27px "Outfit", "Inter", sans-serif';
          targetCtx.fillStyle = '#34d399';
          targetCtx.shadowColor = 'rgba(0, 0, 0, 0.95)';
          targetCtx.shadowBlur = 10;
          targetCtx.shadowOffsetY = 3;
          targetCtx.fillText('🛵 BUFFALO BAY DELIVERY & RESTAURANT', cx, boxY + 46);

          // Riga 2 Sottotitolo Isola Koh Phayam in Thai/Inglese
          targetCtx.font = '800 20px "Prompt", "Outfit", sans-serif';
          targetCtx.fillStyle = '#fbbf24';
          targetCtx.shadowBlur = 8;
          targetCtx.shadowOffsetY = 2;
          targetCtx.fillText('เกาะพยาม · KOH PHAYAM ISLAND', cx, boxY + 78);
        } else if (brand === 'pizza') {
          targetCtx.font = '900 28px "Outfit", "Inter", sans-serif';
          targetCtx.fillStyle = '#fbbf24';
          targetCtx.shadowColor = 'rgba(0, 0, 0, 0.95)';
          targetCtx.shadowBlur = 10;
          targetCtx.shadowOffsetY = 3;
          targetCtx.fillText('🛵 RANONG DELIVERY · ส่งถึงบ้าน', cx, boxY + 46);

          targetCtx.font = '800 20px "Prompt", "Outfit", sans-serif';
          targetCtx.fillStyle = '#34d399';
          targetCtx.shadowBlur = 8;
          targetCtx.shadowOffsetY = 2;
          targetCtx.fillText('ส่งตรงถึงบ้านคุณ · รวดเร็ว สดใหม่ ร้อนๆ', cx, boxY + 78);
        } else {
          targetCtx.font = '900 28px "Outfit", "Inter", sans-serif';
          targetCtx.fillStyle = '#34d399';
          targetCtx.shadowColor = 'rgba(0, 0, 0, 0.95)';
          targetCtx.shadowBlur = 10;
          targetCtx.shadowOffsetY = 3;
          targetCtx.fillText('🌴 DIRECT BOOKING · จองตรงที่พัก', cx, boxY + 46);

          targetCtx.font = '800 20px "Prompt", "Outfit", sans-serif';
          targetCtx.fillStyle = '#fbbf24';
          targetCtx.shadowBlur = 8;
          targetCtx.shadowOffsetY = 2;
          targetCtx.fillText('เกาะพยาม · KOH PHAYAM ISLAND RESORT', cx, boxY + 78);
        }

        if (mode === 'R1') {
          // Modalità R1 Ristorante & Delivery Buffalo Bay (Koh Phayam)
          const btnW = 616;
          const btnH = 88;
          const btnX = cx - (btnW / 2);
          const btnY = boxY + 104;

          targetCtx.save();
          targetCtx.beginPath();
          if (typeof targetCtx.roundRect === 'function') {
            targetCtx.roundRect(btnX, btnY, btnW, btnH, 22);
          } else {
            targetCtx.rect(btnX, btnY, btnW, btnH);
          }
          const btnGrad = targetCtx.createLinearGradient(btnX, btnY, btnX, btnY + btnH);
          btnGrad.addColorStop(0, 'rgba(16, 185, 129, 0.35)');
          btnGrad.addColorStop(1, 'rgba(5, 150, 105, 0.22)');
          targetCtx.fillStyle = btnGrad;
          targetCtx.fill();
          targetCtx.lineWidth = 2.5;
          targetCtx.strokeStyle = '#34d399';
          targetCtx.shadowColor = 'rgba(52, 211, 153, 0.60)';
          targetCtx.shadowBlur = 20;
          targetCtx.stroke();
          targetCtx.restore();

          targetCtx.textAlign = 'center';
          targetCtx.font = '900 36px "Outfit", "Inter", sans-serif';
          targetCtx.fillStyle = '#ffffff';
          targetCtx.shadowColor = 'rgba(0, 0, 0, 0.95)';
          targetCtx.shadowBlur = 10;
          targetCtx.shadowOffsetY = 3;
          targetCtx.fillText('✆ WhatsApp +66 095 882 5573', cx, btnY + 56);

          // Highlights Piatto e Servizio d'Impatto (Font 26px - 29px Bold)
          targetCtx.font = '900 29px "Outfit", "Inter", sans-serif';
          targetCtx.fillStyle = '#ffffff';
          targetCtx.shadowColor = 'rgba(0, 0, 0, 0.90)';
          targetCtx.shadowBlur = 8;
          targetCtx.shadowOffsetY = 2;
          targetCtx.fillText('🍕 Authentic Italian Pizza & Homemade Pasta', cx, boxY + 270);

          targetCtx.font = '800 28px "Outfit", "Inter", sans-serif';
          targetCtx.fillStyle = '#fbbf24';
          targetCtx.fillText('🛵 Fast Island Delivery to Your Resort', cx, boxY + 350);

          targetCtx.font = '800 26px "Outfit", "Inter", sans-serif';
          targetCtx.fillStyle = '#38bdf8';
          targetCtx.fillText('🌴 Buffalo Bay (Ao Khao Kwai) · Koh Phayam', cx, boxY + 430);

          targetCtx.font = '800 26px "Outfit", "Inter", sans-serif';
          targetCtx.fillStyle = '#e2e8f0';
          targetCtx.fillText('🌐 www.flowerpowervillage.com', cx, boxY + 510);
        } else if (brand === 'pizza') {
          // Disegno QR Code Ufficiale LINE (Colonna Sinistra 215x215)
          const qrSize = 215;
          const qrX = boxX + 26;
          const qrY = boxY + 115;

          targetCtx.save();
          targetCtx.beginPath();
          if (typeof targetCtx.roundRect === 'function') {
            targetCtx.roundRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20, 20);
          } else {
            targetCtx.rect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20);
          }
          targetCtx.fillStyle = '#ffffff';
          targetCtx.fill();
          targetCtx.shadowColor = 'rgba(0, 0, 0, 0.65)';
          targetCtx.shadowBlur = 20;

          // Disegna il QR Code Ufficiale LINE
          if (lineQrImg.complete && lineQrImg.naturalWidth > 0) {
            targetCtx.drawImage(lineQrImg, qrX, qrY, qrSize, qrSize);
          } else if (globalLineQrImg.complete && globalLineQrImg.naturalWidth > 0) {
            targetCtx.drawImage(globalLineQrImg, qrX, qrY, qrSize, qrSize);
          }
          targetCtx.restore();

          // Didascalia sotto al QR Code (Grande & Incisiva)
          targetCtx.font = '900 21px "Outfit", "Inter", sans-serif';
          targetCtx.fillStyle = '#fbbf24';
          targetCtx.textAlign = 'center';
          targetCtx.fillText('📲 Scan to Order', qrX + (qrSize / 2), qrY + qrSize + 34);
          targetCtx.font = '800 19px "Prompt", sans-serif';
          targetCtx.fillStyle = '#ffffff';
          targetCtx.fillText('สแกนสั่งอาหารทันที', qrX + (qrSize / 2), qrY + qrSize + 60);

          // Dati di Contatto & Ordine (Colonna Destra - Grandi & Incisivi con ampio respiro)
          const infoX = boxX + 272;
          targetCtx.textAlign = 'left';

          targetCtx.font = '900 30px "Outfit", "Inter", sans-serif';
          targetCtx.fillStyle = '#ffffff';
          targetCtx.shadowColor = 'rgba(0, 0, 0, 0.90)';
          targetCtx.shadowBlur = 8;
          targetCtx.shadowOffsetY = 2;
          targetCtx.fillText('🌐 flowerpowerpizza.com', infoX, boxY + 155);

          targetCtx.font = '900 26px "Outfit", "Inter", sans-serif';
          targetCtx.fillStyle = '#10b981';
          targetCtx.fillText('💚 LINE: @flowerpowerpizza', infoX, boxY + 220);

          targetCtx.font = '800 24px "Outfit", "Prompt", sans-serif';
          targetCtx.fillStyle = '#fbbf24';
          targetCtx.fillText('🎁 10% Off 1st Order · ลด 10%', infoX, boxY + 282);

          targetCtx.font = '800 24px "Outfit", "Inter", sans-serif';
          targetCtx.fillStyle = '#38bdf8';
          targetCtx.fillText('👆 Link in Bio ➔ Order Now', infoX, boxY + 344);

          targetCtx.font = '700 22px "Outfit", "Inter", sans-serif';
          targetCtx.fillStyle = '#cbd5e1';
          targetCtx.fillText('🔥 Hot & Fresh in Thermal Box', infoX, boxY + 406);

          // Orari di Consegna (Centrato a piena larghezza)
          targetCtx.textAlign = 'center';
          targetCtx.font = '800 24px "Outfit", "Inter", sans-serif';
          targetCtx.fillStyle = '#fbbf24';
          targetCtx.shadowColor = 'rgba(0, 0, 0, 0.90)';
          targetCtx.shadowBlur = 8;
          targetCtx.shadowOffsetY = 2;
          targetCtx.fillText('🛵 Delivery Hours: 11:30 - 21:30 · Open Every Day', cx, boxY + 510);
        } else {
          // Modalità Villaggio (Koh Phayam): Layout Diretto, Visivo e Gigante
          const btnW = 616;
          const btnH = 88;
          const btnX = cx - (btnW / 2);
          const btnY = boxY + 104;

          targetCtx.save();
          targetCtx.beginPath();
          if (typeof targetCtx.roundRect === 'function') {
            targetCtx.roundRect(btnX, btnY, btnW, btnH, 22);
          } else {
            targetCtx.rect(btnX, btnY, btnW, btnH);
          }
          const btnGrad = targetCtx.createLinearGradient(btnX, btnY, btnX, btnY + btnH);
          btnGrad.addColorStop(0, 'rgba(16, 185, 129, 0.35)');
          btnGrad.addColorStop(1, 'rgba(5, 150, 105, 0.22)');
          targetCtx.fillStyle = btnGrad;
          targetCtx.fill();
          targetCtx.lineWidth = 2.5;
          targetCtx.strokeStyle = '#34d399';
          targetCtx.shadowColor = 'rgba(52, 211, 153, 0.60)';
          targetCtx.shadowBlur = 20;
          targetCtx.stroke();
          targetCtx.restore();

          targetCtx.textAlign = 'center';
          targetCtx.font = '900 36px "Outfit", "Inter", sans-serif';
          targetCtx.fillStyle = '#ffffff';
          targetCtx.shadowColor = 'rgba(0, 0, 0, 0.95)';
          targetCtx.shadowBlur = 10;
          targetCtx.shadowOffsetY = 3;
          targetCtx.fillText('🌐 flowerpowervillage.com', cx, btnY + 56);

          // Highlights Resort (Font 26px - 29px Bold)
          targetCtx.font = '900 29px "Outfit", "Inter", sans-serif';
          targetCtx.fillStyle = '#fbbf24';
          targetCtx.shadowColor = 'rgba(0, 0, 0, 0.90)';
          targetCtx.shadowBlur = 8;
          targetCtx.shadowOffsetY = 2;
          targetCtx.fillText('✨ Best Rate Guaranteed Online (-10% Direct)', cx, boxY + 270);

          targetCtx.font = '800 28px "Outfit", "Inter", sans-serif';
          targetCtx.fillStyle = '#38bdf8';
          targetCtx.fillText('👉 Link in Bio ➔ Instant Room Confirmation', cx, boxY + 350);

          targetCtx.font = '800 26px "Outfit", "Inter", sans-serif';
          targetCtx.fillStyle = '#34d399';
          targetCtx.fillText('🌺 Eco Wooden Bungalows & Breezy Suites', cx, boxY + 430);

          targetCtx.font = '800 26px "Outfit", "Inter", sans-serif';
          targetCtx.fillStyle = '#e2e8f0';
          targetCtx.fillText('🏝️ Buffalo Bay (Ao Khao Kwai) · Koh Phayam', cx, boxY + 510);
        }

        // Linea divisoria sottile ed elegante
        targetCtx.save();
        const sepGrad = targetCtx.createLinearGradient(boxX + 60, boxY + 575, boxX + boxW - 60, boxY + 575);
        sepGrad.addColorStop(0, (brand === 'pizza' && mode !== 'R1') ? 'rgba(245, 158, 11, 0)' : 'rgba(52, 211, 153, 0)');
        sepGrad.addColorStop(0.5, (brand === 'pizza' && mode !== 'R1') ? 'rgba(245, 158, 11, 0.45)' : 'rgba(52, 211, 153, 0.45)');
        sepGrad.addColorStop(1, (brand === 'pizza' && mode !== 'R1') ? 'rgba(245, 158, 11, 0)' : 'rgba(52, 211, 153, 0)');
        targetCtx.strokeStyle = sepGrad;
        targetCtx.lineWidth = 1.5;
        targetCtx.beginPath();
        targetCtx.moveTo(boxX + 60, boxY + 575);
        targetCtx.lineTo(boxX + boxW - 60, boxY + 575);
        targetCtx.stroke();
        targetCtx.restore();

        // Payoff Footer Card (Sicuro all'interno del box, ad alto contrasto 22px)
        targetCtx.textAlign = 'center';
        targetCtx.font = '800 22px "Outfit", "Inter", sans-serif';
        targetCtx.fillStyle = '#f8fafc';
        targetCtx.shadowColor = 'rgba(0, 0, 0, 0.90)';
        targetCtx.shadowBlur = 6;
        targetCtx.shadowOffsetY = 2;
        targetCtx.fillText(
          mode === 'R1'
            ? '🇮🇹 Authentic Italian Traditional Pizza & Homemade Kitchen'
            : (brand === 'pizza'
              ? '🇮🇹 Authentic Traditional Italian Pizza in Ranong'
              : '🌴 Tropical Island Resort & Eco Sanctuary in Koh Phayam'),
          cx,
          boxY + 645
        );

        targetCtx.restore();
      }
      targetCtx.restore();
    };

    const renderFrame = (elapsed: number) => {
      if (isCancelled) return;
      currentElapsedRef.current = elapsed;
      const nextProgress = totalVideoDuration > 0 ? elapsed / totalVideoDuration : 0;
      setProgress(prev => Math.abs(prev - nextProgress) >= 0.003 ? nextProgress : prev);

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      if (canvas43 && ctx43) {
        ctx43.clearRect(0, 0, canvas43.width, canvas43.height);
      }

      if (testRun.isEmptyShowcase || sceneCount === 0) {
        ctx.fillStyle = '#090d16';
        ctx.fillRect(0, 0, w, h);
        if (canvas43 && ctx43) {
          ctx43.fillStyle = '#090d16';
          ctx43.fillRect(0, 0, canvas43.width, canvas43.height);
        }
        return;
      }

      // Determina la scena corrente in base al tempo trascorso
      let currentIdx = 0;
      for (let i = 0; i < sceneTimeline.length; i++) {
        if (elapsed >= sceneTimeline[i].start && (elapsed < sceneTimeline[i].end || i === sceneTimeline.length - 1)) {
          currentIdx = i;
          break;
        }
      }

      const currentTiming = sceneTimeline[currentIdx] || { start: 0, end: sceneDuration, duration: sceneDuration };
      const effectiveDissolve = Math.min(0.65, currentTiming.duration * 0.28);
      const currentBirth = currentIdx === 0 ? 0 : (currentTiming.start - effectiveDissolve);
      const currentLife = currentIdx === 0 ? currentTiming.duration : (currentTiming.duration + effectiveDissolve);
      const currentAge = Math.max(0, elapsed - currentBirth);
      const rawSubT = Math.min(1.0, currentAge / currentLife);

      // 🏎️ PUNTO DI INGRESSO AVANZATO (per le immagini successive, il moto è già avviato al 20% in regime di crociera)
      // Durante l'Outro finale, il moto della scena di fondo si CONGELA dolcemente al 100% (zero scatti o salti visivi)
      const INCOMING_OFFSET = 0.20;
      const subT = elapsed >= outroStartTime 
        ? 1.0 
        : (currentIdx === 0 ? rawSubT : (INCOMING_OFFSET + (rawSubT * (1.0 - INCOMING_OFFSET))));

      // 1. Disegna la scena corrente a piena opacità su entrambi i canvas
      const currentImg = loadedImages[currentIdx];
      const currentScene = scenes[currentIdx];
      if (currentImg && currentScene) {
        drawBothCanvases(currentImg, currentScene, subT, 1.0);
      }

      // 2. Se ci stiamo avvicinando alla fine della scena e c'è una scena successiva (prima dell'outro):
      let dominantIdx = currentIdx;
      const transitionThreshold = currentTiming.end - effectiveDissolve;

      if (elapsed < musicDuration && elapsed >= transitionThreshold && currentIdx < sceneCount - 1) {
        const nextIdx = currentIdx + 1;
        const nextTiming = sceneTimeline[nextIdx];
        const nextImg = loadedImages[nextIdx];
        const nextScene = scenes[nextIdx];
        if (nextImg && nextScene && nextTiming) {
          const nextBirth = nextTiming.start - effectiveDissolve;
          const nextLife = nextTiming.duration + effectiveDissolve;
          const nextAge = Math.max(0, elapsed - nextBirth);
          const rawNextSubT = Math.min(1.0, nextAge / nextLife);

          // Anche per la scena entrante in dissolvenza: moto già iniziato al 20%
          const nextSubT = INCOMING_OFFSET + (rawNextSubT * (1.0 - INCOMING_OFFSET));

          // Curva morbida cosinusoidale vellutata (0 -> 1)
          const crossfadeRatio = Math.min(1.0, Math.max(0.0, (elapsed - transitionThreshold) / effectiveDissolve));
          const nextOpacity = 0.5 - 0.5 * Math.cos(crossfadeRatio * Math.PI);

          // Disegna la scena entrante GIA' IN CORSA SOPRA la precedente su entrambi i canvas
          drawBothCanvases(nextImg, nextScene, nextSubT, nextOpacity);

          if (crossfadeRatio >= 0.5) {
            dominantIdx = nextIdx;
          }
        }
      }

      setActiveSceneIndex(prev => prev !== dominantIdx ? dominantIdx : prev);

      // 3. Overlay gradiente cinematografico per contrasto tipografico (solo durante la visione dei piatti)
      if (elapsed < outroStartTime) {
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, 'rgba(0,0,0,0.35)');
        grad.addColorStop(0.22, 'rgba(0,0,0,0.0)');
        grad.addColorStop(0.58, 'rgba(0,0,0,0.0)');
        grad.addColorStop(0.75, 'rgba(0,0,0,0.35)');
        grad.addColorStop(1, 'rgba(0,0,0,0.60)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        if (canvas43 && ctx43) {
          const w43 = canvas43.width;
          const h43 = canvas43.height;
          const grad43 = ctx43.createLinearGradient(0, 0, 0, h43);
          grad43.addColorStop(0, 'rgba(0,0,0,0.35)');
          grad43.addColorStop(0.35, 'rgba(0,0,0,0.0)');
          grad43.addColorStop(0.65, 'rgba(0,0,0,0.20)');
          grad43.addColorStop(1, 'rgba(0,0,0,0.85)');
          ctx43.fillStyle = grad43;
          ctx43.fillRect(0, 0, w43, h43);
        }
      }

      // 🍕 4. OUTRO DEL BRAND & QR CODE (in P1 dentro la coda musicale, negli altri a fine brano)
      if (elapsed >= outroStartTime) {
        // 🔊 Effetto sonoro d'impatto (Whoosh + Bass Drop per Pizzeria, Brezza + Chime per Villaggio)
        if (!hasPlayedOutroSfxRef.current && isPlayingRef.current) {
          hasPlayedOutroSfxRef.current = true;
          autoCutSoundEngine.playOutroImpact(brand, isAudioMuted);
        }

        const outroElapsed = elapsed - outroStartTime;

        // Velo scuro cinematografico che fa risaltare lo stampo del logo e la card contatti
        const darkAlpha = Math.min(0.88, (outroElapsed / 0.35) * 0.88);
        ctx.fillStyle = `rgba(0, 0, 0, ${darkAlpha})`;
        ctx.fillRect(0, 0, w, h);

        // Rendering Outro specifico anche per Canvas 4:3 Companion
        if (canvas43 && ctx43) {
          const w43 = canvas43.width;
          const h43 = canvas43.height;
          const cx43 = w43 / 2;
          ctx43.fillStyle = `rgba(0, 0, 0, ${darkAlpha})`;
          ctx43.fillRect(0, 0, w43, h43);

          const comp43Logo = (brand === 'pizza' ? cachedPizzaLogoCanvas : cachedVillageLogoCanvas) || (logoImg.complete && logoImg.naturalWidth > 0 ? logoImg : null);
          if (comp43Logo) {
            const lSize = 130;
            ctx43.save();
            ctx43.shadowColor = 'rgba(0, 0, 0, 0.9)';
            ctx43.shadowBlur = 20;
            ctx43.drawImage(comp43Logo, cx43 - lSize / 2, 100, lSize, lSize);
            ctx43.restore();
          }

          ctx43.font = '900 32px "Outfit", "Inter", sans-serif';
          ctx43.fillStyle = (brand === 'pizza' && mode !== 'R1') ? '#fbbf24' : '#34d399';
          ctx43.textAlign = 'center';
          ctx43.fillText(
            mode === 'R1' ? 'FLOWER POWER RESTAURANT' : (brand === 'pizza' ? 'FLOWER POWER PIZZA' : 'FLOWER POWER VILLAGE'),
            cx43,
            275
          );

          ctx43.font = '800 20px "Inter", sans-serif';
          ctx43.fillStyle = '#ffffff';
          ctx43.fillText(
            (mode === 'R1' || brand === 'village') ? 'KOH PHAYAM · THAILAND' : 'RANONG · THAILAND',
            cx43,
            315
          );

          ctx43.font = '600 16px "Inter", sans-serif';
          ctx43.fillStyle = '#cbd5e1';
          ctx43.fillText(
            mode === 'R1' ? 'Italian Restaurant & Island Delivery' : (brand === 'pizza' ? 'Authentic Traditional Italian Pizza' : 'Tropical Island Resort & Eco Sanctuary'),
            cx43,
            348
          );

          const cardW = 600;
          const cardH = 150;
          const cardX = cx43 - (cardW / 2);
          const cardY = 390;
          ctx43.save();
          ctx43.fillStyle = 'rgba(11, 17, 32, 0.94)';
          if (typeof ctx43.roundRect === 'function') {
            ctx43.roundRect(cardX, cardY, cardW, cardH, 20);
          } else {
            ctx43.rect(cardX, cardY, cardW, cardH);
          }
          ctx43.fill();
          ctx43.strokeStyle = (brand === 'pizza' && mode !== 'R1') ? 'rgba(245, 158, 11, 0.65)' : 'rgba(52, 211, 153, 0.75)';
          ctx43.lineWidth = 2.5;
          ctx43.stroke();
          ctx43.restore();

          ctx43.font = '900 24px "Inter", sans-serif';
          ctx43.fillStyle = '#ffffff';
          ctx43.textAlign = 'center';
          ctx43.fillText(
            mode === 'R1' ? '✆ WhatsApp +66 095 882 5573' : (brand === 'pizza' ? '🌐 flowerpowerpizza.com' : '🌐 flowerpowervillage.com'),
            cx43,
            cardY + 46
          );

          ctx43.font = '800 18px "Inter", sans-serif';
          ctx43.fillStyle = (brand === 'pizza' && mode !== 'R1') ? '#fbbf24' : '#34d399';
          ctx43.fillText(
            mode === 'R1' ? '🛵 Fast Island Delivery in Koh Phayam' : (brand === 'pizza' ? '🛵 Fast Delivery Ranong · 10% Off 1st Order' : '🌴 Direct Booking · Best Rates Guaranteed'),
            cx43,
            cardY + 86
          );

          ctx43.font = '600 15px "Inter", sans-serif';
          ctx43.fillStyle = '#94a3b8';
          ctx43.fillText(
            mode === 'R1' ? 'Buffalo Bay (Ao Khao Kwai) · Koh Phayam' : (brand === 'pizza' ? 'Order Online or Visit us near Hot Springs' : 'Koh Phayam Island · Thailand'),
            cx43,
            cardY + 118
          );
        }


        // Rendering Outro 9:16 ufficiale universale
        drawFullOutroToContext(ctx, w, h, outroElapsed);
      }
    };

    const render = (now: number) => {
      if (isCancelled) return;

      if (!startTimeRef.current) startTimeRef.current = now;
      const rawElapsed = (now - startTimeRef.current) / 1000;
      const elapsed = Math.min(totalVideoDuration, rawElapsed);
      const ended = rawElapsed >= totalVideoDuration;

      // Reset SFX se il video è prima dell'outro
      if (elapsed < outroStartTime) {
        hasPlayedOutroSfxRef.current = false;
      }

      // Gestione Audio: in P1 la musica suona per l'intera durata (anche durante l'Outro e il QR code)
      // e sfuma dolcemente solo negli ultimissimi 0.40s prima della conclusione del file
      if (audioRef.current && !isAudioMuted && isPlaying) {
        if (elapsed >= musicDuration) {
          if (!audioRef.current.paused) {
            audioRef.current.pause();
          }
        } else {
          const fadeDuration = 0.40;
          const fadeThreshold = Math.max(0.5, musicDuration - fadeDuration);
          if (elapsed >= fadeThreshold) {
            const fade = Math.max(0, (musicDuration - elapsed) / fadeDuration);
            audioRef.current.volume = fade;
          } else {
            audioRef.current.volume = 1.0;
          }
        }
      }

      if (ended) {
        setIsEnded(true);
        setIsPlaying(false);
        currentElapsedRef.current = totalVideoDuration;
        setProgress(1.0);
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          audioRef.current.volume = 1.0;
        }
        // 🎬 Al termine del video, mantieni visualizzato l'Outro finale (Zero reset anticipato / zero salto indietro)
        renderFrame(totalVideoDuration);
      } else {
        renderFrame(elapsed);
        if (isPlaying) {
          animFrameRef.current = requestAnimationFrame(render);
        }
      }
    };

    // 🎨 Helper universale per disegnare gli overlay 9:16 esattamente con le stesse proporzioni della preview (s = w / 395)
    const renderOverlaysToContext = (
      oCtx: CanvasRenderingContext2D,
      w: number,
      h: number,
      scene: AutoCutScene,
      isOutro: boolean,
      tElapsed: number = 0
    ) => {
      if (isOutro || !scene) return;
      const s = w / 395; // Proporzione fedele 1:1 rispetto alla preview del container reale a 395px

      // 1. Top Vignette Fade cinematografico ad alto contrasto (protegge watermark logo e scritte contro sfondi chiari, paglia o sole)
      const topFadeH = 340 * s;
      const topGrad = oCtx.createLinearGradient(0, 0, 0, topFadeH);
      topGrad.addColorStop(0, 'rgba(0, 0, 0, 0.92)');
      topGrad.addColorStop(0.35, 'rgba(0, 0, 0, 0.70)');
      topGrad.addColorStop(0.70, 'rgba(0, 0, 0, 0.35)');
      topGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      oCtx.fillStyle = topGrad;
      oCtx.fillRect(0, 0, w, topFadeH);

      // 2. Bottom Vignette Fade cinematografica profonda: protegge interamente la card testi (categoria cibi, titoli bilingui e prezzo con ombra nera continua)
      const btmFadeH = 520 * s;
      const btmGrad = oCtx.createLinearGradient(0, h - btmFadeH, 0, h);
      btmGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      btmGrad.addColorStop(0.18, 'rgba(0, 0, 0, 0.35)');
      btmGrad.addColorStop(0.40, 'rgba(0, 0, 0, 0.68)');
      btmGrad.addColorStop(0.68, 'rgba(0, 0, 0, 0.88)');
      btmGrad.addColorStop(1, 'rgba(0, 0, 0, 0.96)');
      oCtx.fillStyle = btmGrad;
      oCtx.fillRect(0, h - btmFadeH, w, btmFadeH);

      // 3. Header Top: Logo a sinistra (+20%) + Testi a destra (SEMPRE CENTRATI SULL'ASSE VERTICALE IN TUTTI I FORMATI)
      const logoSize = 91 * s; // Ingrandito del +20% (era 76 * s)
      const logoY = 24 * s;    // Ancoraggio superiore
      const gap = 12 * s;
      const fpFontSize = Math.round(27.5 * s);

      // Calcolo larghezza colonna testi per centratura perfetta sull'asse verticale in qualsiasi formato
      oCtx.save();
      oCtx.font = `900 ${fpFontSize}px "Outfit", sans-serif`;
      const fpW = oCtx.measureText('FLOWER POWER').width;
      let maxSubW = fpW;

      if (mode === 'R1') {
        oCtx.font = `900 ${Math.round(24.2 * s)}px "Outfit", sans-serif`;
        const delivW = oCtx.measureText('DELIVERY ').width + (24 * s);
        oCtx.font = `900 ${Math.round(17.6 * s)}px "Outfit", sans-serif`;
        const phoneW = (15.2 * 4 + 13) * s + oCtx.measureText('+66 095 882 5573').width;
        maxSubW = Math.max(fpW, phoneW, delivW);
      } else if (mode === 'DS') {
        oCtx.font = `900 ${Math.round(23 * s)}px "Prompt", "Kanit", sans-serif`;
        const dsThai = scene.isLiveShowcase ? 'สดใหม่ในตู้โชว์' : 'เมนูพิเศษประจำวัน';
        const dsW = oCtx.measureText(dsThai).width;
        maxSubW = Math.max(fpW, dsW);
      } else if (brand === 'pizza') {
        oCtx.font = `900 ${Math.round(25.3 * s)}px "Prompt", "Kanit", sans-serif`;
        const thaiW = oCtx.measureText('ส่งถึงบ้าน').width;
        oCtx.font = `600 ${Math.round(17.6 * s)}px "Outfit", sans-serif`;
        const siteW = oCtx.measureText('flowerpowerpizza.com').width;
        oCtx.font = `900 ${Math.round(22 * s)}px "Outfit", sans-serif`;
        const delivW = oCtx.measureText('RANONG DELIVERY').width;
        maxSubW = Math.max(fpW, thaiW, siteW, delivW);
      } else {
        // Villaggio V1-V3, LM1
        oCtx.font = `900 ${Math.round(19.5 * s)}px "Outfit", sans-serif`;
        const dbW = oCtx.measureText('DIRECT BOOKING').width;
        oCtx.font = `900 ${Math.round(17.5 * s)}px "Outfit", sans-serif`;
        const offW = oCtx.measureText('10% OFF').width;
        oCtx.font = `600 ${Math.round(15 * s)}px "Outfit", sans-serif`;
        const siteW = oCtx.measureText('flowerpowervillage.com').width;
        let lmExtraW = 0;
        if (mode === 'LM1') {
          oCtx.font = `900 ${Math.round(21.5 * s)}px "Prompt", sans-serif`;
          lmExtraW = oCtx.measureText('ห้องว่างวันนี้').width;
        }
        maxSubW = Math.max(fpW, dbW, offW, siteW, lmExtraW);
      }
      oCtx.restore();

      const textColW = Math.max(fpW, maxSubW);
      const totalBlockW = logoSize + gap + textColW;
      const logoX = Math.round((w - totalBlockW) / 2);
      const tx = logoX + logoSize + gap;

      // 🛡️ Disegno puro del Logo Ufficiale (Puro logo senza sfondo cerchio e senza contorno)
      const isPizzaBrand = mode === 'P1' || mode === 'P2' || mode === 'P3' || mode === 'DS' || brand === 'pizza';
      const brandLogoCanvas = isPizzaBrand ? cachedPizzaLogoCanvas : cachedVillageLogoCanvas;
      const targetLogo = isPizzaBrand ? globalPizzaLogoImg : globalVillageLogoImg;
      const domLogo = typeof document !== 'undefined' ? (document.getElementById('autoCutHeaderLogoImg') as HTMLImageElement | null) : null;

      const effectiveLogo: CanvasImageSource | null =
        (brandLogoCanvas && brandLogoCanvas.width > 0)
          ? brandLogoCanvas
          : (domLogo && domLogo.complete && domLogo.naturalWidth > 0)
            ? domLogo
            : (targetLogo && targetLogo.complete && targetLogo.naturalWidth > 0)
              ? targetLogo
              : (logoImg && logoImg.complete && logoImg.naturalWidth > 0)
                ? logoImg
                : null;

      if (effectiveLogo) {
        oCtx.save();
        oCtx.shadowColor = 'rgba(0, 0, 0, 0.95)';
        oCtx.shadowBlur = 12 * s;
        oCtx.shadowOffsetY = 3 * s;
        try {
          oCtx.drawImage(effectiveLogo, logoX, logoY, logoSize, logoSize);
        } catch (drawErr) {
          console.warn('[AutoCutLabPlayer] Header logo draw exception:', drawErr);
        }
        oCtx.restore();
      }

      // Blocco Testi Header (a destra del logo, sempre centrato)
      let ty = logoY + (2 * s);

      // Helper universale per testo ad altissimo contrasto con contorno nero solido a 360° e ombra profonda (leggibile al 100% su qualsiasi sfondo)
      const drawTextWithShadow = (
        text: string,
        x: number,
        y: number,
        fillStyle: string,
        strokeWidth: number = 3.6 * s
      ) => {
        // Passaggio 1: contorno nero solido e ombra profonda
        oCtx.save();
        oCtx.strokeStyle = '#000000';
        oCtx.lineWidth = strokeWidth;
        oCtx.lineJoin = 'round';
        oCtx.miterLimit = 2;
        oCtx.shadowColor = 'rgba(0, 0, 0, 1)';
        oCtx.shadowBlur = 10 * s;
        oCtx.shadowOffsetY = 2.5 * s;
        oCtx.strokeText(text, x, y);
        oCtx.restore();

        // Passaggio 2: testo pieno netto, vivo e brillante
        oCtx.save();
        oCtx.shadowColor = 'rgba(0, 0, 0, 0.95)';
        oCtx.shadowBlur = 4 * s;
        oCtx.shadowOffsetY = 1.5 * s;
        oCtx.fillStyle = fillStyle;
        oCtx.fillText(text, x, y);
        oCtx.restore();
      };

      oCtx.save();
      oCtx.textAlign = 'left';
      oCtx.textBaseline = 'top';

      oCtx.font = `900 ${fpFontSize}px "Outfit", sans-serif`;
      drawTextWithShadow('FLOWER POWER', tx, ty, '#ffffff', 4.0 * s);
      ty += fpFontSize + (4 * s);

      // Riga 2: Village / Pizza (+10% ulteriore: 26.0 * s con font Outfit italic 500)
      const subFontSize = Math.round(26.0 * s);
      oCtx.font = `italic 500 ${subFontSize}px "Outfit", sans-serif`;
      const subColor = (brand === 'pizza' && mode !== 'R1') ? '#f87171' : '#34d399';
      drawTextWithShadow((brand === 'pizza' && mode !== 'R1') ? 'Pizza' : 'Village', tx, ty, subColor, 3.4 * s);
      ty += subFontSize + (5 * s);

      // Riga 3-6: R1 specifico (Delivery Koh Phayam) o Pizzeria / Villaggio
      if (mode === 'R1') {
        ty += 15 * s; // distacco da Village (+5px totali)

        // DELIVERY in rosso con contorno bianco netto, emoji moto delivery 🛵 E PULSAZIONE SINUSOIDALE DINAMICA! (+10%)
        const pulse = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(tElapsed * Math.PI * 2.4));
        oCtx.save();
        oCtx.globalAlpha = pulse;
        const delivFontSize = Math.round(24.2 * s);
        oCtx.font = `900 ${delivFontSize}px "Outfit", sans-serif`;
        oCtx.lineWidth = 4.4 * s;
        oCtx.strokeStyle = '#ffffff';
        oCtx.lineJoin = 'round';
        oCtx.strokeText('DELIVERY', tx, ty);
        oCtx.fillStyle = '#ef4444';
        oCtx.fillText('DELIVERY', tx, ty);

        // Emoji Moto Delivery 🛵 affiancata con resa nativa brillante
        const delivTextW = oCtx.measureText('DELIVERY').width;
        oCtx.font = `${Math.round(21 * s)}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
        oCtx.fillText('🛵', tx + delivTextW + (6 * s), ty + (1 * s));
        oCtx.restore();
        ty += delivFontSize + (7 * s); // allontanato di 2 pixel netti

        // เดลิเวอรี่ in bianco Prompt bold (+10%) con ombra nera protettiva
        oCtx.font = `800 ${Math.round(18.7 * s)}px "Prompt", "Kanit", sans-serif`;
        drawTextWithShadow('เดลิเวอรี่', tx, ty, '#ffffff', 3.8 * s);
        ty += 20 * s + (6 * s);

        // WhatsApp Icon circle (+20%) + LINE Icon circle (+20%) + Phone
        const iconR = 15.2 * s; // Ingrandito del +20% per leggibilità perfetta
        let curIconX = tx + iconR;
        const iconCy = ty + iconR;

        // 1. WhatsApp circle
        oCtx.save();
        oCtx.fillStyle = '#25D366';
        oCtx.beginPath();
        oCtx.arc(curIconX, iconCy, iconR, 0, Math.PI * 2);
        oCtx.fill();

        if (waPhonePath2D) {
          oCtx.save();
          const waScale = (iconR * 1.30) / 24;
          oCtx.translate(curIconX - (12 * waScale), iconCy - (12 * waScale));
          oCtx.scale(waScale, waScale);
          oCtx.fillStyle = '#ffffff';
          oCtx.fill(waPhonePath2D);
          oCtx.restore();
        }
        oCtx.restore();

        // 2. LINE circle
        curIconX += (iconR * 2) + (5.5 * s);
        oCtx.save();
        oCtx.fillStyle = '#06C755';
        oCtx.beginPath();
        oCtx.arc(curIconX, iconCy, iconR, 0, Math.PI * 2);
        oCtx.fill();

        if (lineIconPath2D) {
          oCtx.save();
          const lineScale = (iconR * 1.35) / 24;
          oCtx.translate(curIconX - (12 * lineScale), iconCy - (12 * lineScale));
          oCtx.scale(lineScale, lineScale);
          oCtx.fillStyle = '#ffffff';
          oCtx.fill(lineIconPath2D);
          oCtx.restore();
        }
        oCtx.restore();

        // Numero con font Outfit 900 con ombra nera protettiva
        oCtx.font = `900 ${Math.round(18.2 * s)}px "Outfit", sans-serif`;
        drawTextWithShadow('+66 095 882 5573', curIconX + iconR + (6.5 * s), ty + (2 * s), '#25D366', 3.8 * s);
        ty += (iconR * 2) + (10 * s); // Distacco perfetto: Koh Phayam sotto alle icone e al numero (zero accavallamento)

        // Koh Phayam con font Outfit 700 (+10%) con ombra nera protettiva
        oCtx.font = `700 ${Math.round(16 * s)}px "Outfit", sans-serif`;
        drawTextWithShadow('Koh Phayam', tx, ty, '#ffffff', 3.6 * s);
      } else if (mode === 'DS') {
        // Formato DS Daily Special: live showcase allontanato di ulteriori 10px da Pizza (totale 15px: 5*s base + 10*s)
        ty += 10 * s;
        const isLive = !!scene.isLiveShowcase;
        const dsBadgeText = isLive ? 'LIVE SHOWCASE' : 'CHEF SPECIALS';
        const dsBadgeFontSize = Math.round(14.5 * s);
        oCtx.font = `900 ${dsBadgeFontSize}px "Outfit", sans-serif`;
        const dsBadgeW = oCtx.measureText(dsBadgeText).width + (18 * s);
        const dsBadgeH = 22 * s;
        oCtx.save();
        oCtx.fillStyle = isLive ? '#e11d48' : '#4f46e5';
        if (typeof oCtx.roundRect === 'function') {
          oCtx.roundRect(tx, ty, dsBadgeW, dsBadgeH, 6 * s);
        } else {
          oCtx.rect(tx, ty, dsBadgeW, dsBadgeH);
        }
        oCtx.fill();
        oCtx.lineWidth = 1.5 * s;
        oCtx.strokeStyle = '#ffffff';
        oCtx.stroke();
        oCtx.fillStyle = '#ffffff';
        oCtx.textAlign = 'center';
        oCtx.fillText(dsBadgeText, tx + (dsBadgeW / 2), ty + (4 * s));
        oCtx.restore();
        ty += dsBadgeH + (15 * s); // Le due scritte successive (Thai e Fast Delivery) allontanate di ulteriori 10px dal live showcase (totale 15px)

        // Scritta Thai (+20%) con ombra nera protettiva
        const dsThaiText = isLive ? 'สดใหม่ในตู้โชว์' : 'เมนูพิเศษประจำวัน';
        oCtx.font = `900 ${Math.round(23 * s)}px "Prompt", "Kanit", sans-serif`;
        drawTextWithShadow(dsThaiText, tx, ty, '#fcd34d', 4.0 * s);
        ty += 23 * s + (4 * s);

        // FAST DELIVERY (+20%) con ombra nera protettiva
        oCtx.font = `900 ${Math.round(16.5 * s)}px "Outfit", sans-serif`;
        drawTextWithShadow('FAST DELIVERY', tx, ty, '#34d399', 3.6 * s);
      } else if (brand === 'pizza') {
        // P1, P2, P3: blocco proporzionato sincronizzato 1:1 con il DOM React dell'Editor
        ty += 4 * s;
        const rdFontSize = Math.round(19.5 * s);
        oCtx.font = `900 ${rdFontSize}px "Outfit", sans-serif`;
        drawTextWithShadow('RANONG DELIVERY', tx, ty, '#fcd34d', 3.4 * s);
        ty += rdFontSize + (3 * s);

        const thaiFontSize = Math.round(22 * s);
        oCtx.font = `900 ${thaiFontSize}px "Prompt", "Kanit", sans-serif`;
        drawTextWithShadow('ส่งถึงบ้าน', tx, ty, '#fef08a', 3.6 * s);
        ty += thaiFontSize + (5 * s);

        const siteFontSize = Math.round(16 * s);
        oCtx.font = `600 ${siteFontSize}px "Outfit", sans-serif`;
        drawTextWithShadow('flowerpowerpizza.com', tx, ty, 'rgba(255,255,255,0.95)', 2.8 * s);
        ty += siteFontSize + (4 * s);

        const bioFontSize = Math.round(15.5 * s);
        oCtx.font = `700 ${bioFontSize}px "Outfit", sans-serif`;
        drawTextWithShadow('Link in Bio', tx, ty, '#fcd34d', 2.8 * s);
      } else if (mode === 'LM1') {
        // Formato LM1 Stories Last Minute (Koh Phayam)
        // Header sincronizzato 1:1 con il DOM React dell'Editor
        ty += 12 * s; // Salito di 2 pixel (era 14 * s)

        // 🌟 Ciclo pulsazione & luccichio ad alta frequenza per LAST MINUTE
        const pulseFreq = tElapsed * 5.5;
        const pulseCycle = Math.sin(pulseFreq);
        const textPulseScale = 1.0 + 0.08 * Math.sin(pulseFreq);

        const lmPillText = 'LAST MINUTE';
        const lmPillFontSize = Math.round(13.8 * s); // Ingrandito del 10% (era 12.5 * s)
        oCtx.font = `900 ${lmPillFontSize}px "Outfit", sans-serif`;
        const lmTextW = oCtx.measureText(lmPillText).width;
        const dotR = 5.5 * s; // Ingrandito del 10% (era 5 * s)
        const pillPadX = 11 * s; // Ingrandito del 10% (era 10 * s)
        const pillW = lmTextW + (pillPadX * 2) + (dotR * 2) + (9 * s);
        const pillH = 26.5 * s; // Ingrandito del 10% (era 24 * s)

        oCtx.save();
        // 🌟 BADGE LAST MINUTE: Vettoriale ad altissima definizione con ombra netta e zero sfocatura rasterizzata
        oCtx.shadowColor = 'rgba(0, 0, 0, 0.45)';
        oCtx.shadowBlur = 3 * s;
        oCtx.shadowOffsetY = 2 * s;

        const pillGrad = oCtx.createLinearGradient(tx, ty, tx + pillW, ty + pillH);
        pillGrad.addColorStop(0, '#f59e0b');
        pillGrad.addColorStop(0.5, '#fbbf24');
        pillGrad.addColorStop(1, '#facc15');
        oCtx.fillStyle = pillGrad;
        oCtx.beginPath();
        if (typeof oCtx.roundRect === 'function') {
          oCtx.roundRect(tx, ty, pillW, pillH, 7.5 * s);
        } else {
          oCtx.rect(tx, ty, pillW, pillH);
        }
        oCtx.fill();

        // Contorno dorato nitidissimo vettoriale senza dispersione sfocata
        oCtx.shadowColor = 'transparent';
        oCtx.shadowBlur = 0;
        oCtx.lineWidth = 1.6 * s;
        oCtx.strokeStyle = '#fef08a';
        oCtx.stroke();
        oCtx.restore();

        // 💎 🔴 PALLINO ROSSO LUCCICANTE (Gemma rubino con bagliore neon, ping ad onda, centro brillante e stella di diamante a 4 punte che luccica e ruota)
        const dotCx = tx + pillPadX + dotR;
        const dotCy = ty + (pillH / 2);

        // 1. Onda ping ad anello espandente
        const pingT = (tElapsed * 1.6) % 1.0;
        const pingR = dotR + (pingT * 7 * s);
        const pingAlpha = Math.max(0, (1.0 - pingT) * 0.75);
        oCtx.save();
        oCtx.strokeStyle = `rgba(244, 63, 94, ${pingAlpha})`;
        oCtx.lineWidth = 1.5 * s;
        oCtx.beginPath();
        oCtx.arc(dotCx, dotCy, pingR, 0, Math.PI * 2);
        oCtx.stroke();
        oCtx.restore();

        // 2. Alone profondo e gemma rubino con gradiente sferico
        oCtx.save();
        oCtx.shadowColor = '#ff0033';
        oCtx.shadowBlur = (14 + 10 * pulseCycle) * s;
        const gemGrad = oCtx.createRadialGradient(dotCx - 1.2 * s, dotCy - 1.2 * s, 0.5 * s, dotCx, dotCy, dotR);
        gemGrad.addColorStop(0, '#ff4d6d');
        gemGrad.addColorStop(0.5, '#ef4444');
        gemGrad.addColorStop(0.9, '#dc2626');
        gemGrad.addColorStop(1, '#991b1b');
        oCtx.fillStyle = gemGrad;
        oCtx.beginPath();
        oCtx.arc(dotCx, dotCy, dotR * (0.95 + 0.12 * pulseCycle), 0, Math.PI * 2);
        oCtx.fill();

        // Bordo gemma rubino
        oCtx.lineWidth = 1 * s;
        oCtx.strokeStyle = '#fecdd3';
        oCtx.stroke();

        // 3. Punto luce brillante al centro (highlight speculare)
        oCtx.fillStyle = '#ffffff';
        oCtx.shadowColor = '#ffffff';
        oCtx.shadowBlur = 6 * s;
        oCtx.beginPath();
        oCtx.arc(dotCx - 1.2 * s, dotCy - 1.2 * s, 1.6 * s, 0, Math.PI * 2);
        oCtx.fill();

        // 4. ✨ STELLA DI DIAMANTE A 4 PUNTE (Luccichio rotante brillante)
        const sparkleAngle = tElapsed * 2.8;
        const sparkleRay = (dotR * 1.5) * (0.70 + 0.35 * Math.sin(tElapsed * 8));
        oCtx.save();
        oCtx.translate(dotCx, dotCy);
        oCtx.rotate(sparkleAngle);
        oCtx.fillStyle = '#ffffff';
        oCtx.shadowColor = '#ffffff';
        oCtx.shadowBlur = 8 * s;

        // Raggio verticale
        oCtx.beginPath();
        oCtx.moveTo(0, -sparkleRay);
        oCtx.quadraticCurveTo(0, 0, sparkleRay * 0.22, 0);
        oCtx.quadraticCurveTo(0, 0, 0, sparkleRay);
        oCtx.quadraticCurveTo(0, 0, -sparkleRay * 0.22, 0);
        oCtx.closePath();
        oCtx.fill();

        // Raggio orizzontale
        oCtx.beginPath();
        oCtx.moveTo(-sparkleRay, 0);
        oCtx.quadraticCurveTo(0, 0, 0, sparkleRay * 0.22);
        oCtx.quadraticCurveTo(0, 0, sparkleRay, 0);
        oCtx.quadraticCurveTo(0, 0, 0, -sparkleRay * 0.22);
        oCtx.closePath();
        oCtx.fill();
        oCtx.restore();

        oCtx.restore(); // restore gemma

        // 🔥 SCRITTA LAST MINUTE PULSANTE AD ALTISSIMA VISIBILITÀ E NITIDEZZA
        const textCenterRelX = tx + pillPadX + (dotR * 2) + (6 * s) + (lmTextW / 2);
        const textCenterRelY = dotCy;

        oCtx.save();
        oCtx.translate(textCenterRelX, textCenterRelY);
        oCtx.scale(textPulseScale, textPulseScale);

        oCtx.font = `900 ${lmPillFontSize}px "Outfit", sans-serif`;
        oCtx.textAlign = 'center';
        oCtx.textBaseline = 'middle';

        // Contorno chiaro protettivo per staccare dal gradiente (nitido senza blur)
        oCtx.lineWidth = 1.8 * s;
        oCtx.strokeStyle = '#fef9c3';
        oCtx.lineJoin = 'round';
        oCtx.strokeText(lmPillText, 0, Math.round(0.5 * s));

        // Testo pieno nero vivido Outfit 900
        oCtx.fillStyle = '#09090b';
        oCtx.fillText(lmPillText, 0, Math.round(0.5 * s));
        oCtx.restore();

        ty += pillH + (11 * s); // Allontanato di 3 pixel in basso rispetto a pillH (era 8 * s)

        // Thai: ห้องว่างวันนี้ (Prompt 900 dorato con ombra protettiva ad alto contrasto) - Ingrandito del 10%
        const thaiFontSize = Math.round(21.5 * s); // Ingrandito del 10% (era 19.5 * s)
        oCtx.font = `900 ${thaiFontSize}px "Prompt", "Kanit", sans-serif`;
        drawTextWithShadow('ห้องว่างวันนี้', tx, ty, '#fcd34d', 3.6 * s);
        ty += thaiFontSize + (10 * s); // Distanziato di 5 pixel ulteriori (totale 10 * s) dalla scritta sopra in Thai

        // DIRECT BOOKING (verde smeraldo brillante Outfit 900 con ombra protettiva) - Ingrandito del 10%
        const dbFontSize = Math.round(20.5 * s); // Ingrandito del 10% (era 18.5 * s)
        oCtx.font = `900 ${dbFontSize}px "Outfit", sans-serif`;
        drawTextWithShadow('DIRECT BOOKING', tx, ty, '#6ee7b7', 3.4 * s);
        ty += dbFontSize + (2 * s); // Avvicinato di 2px a DIRECT BOOKING

        // 10% OFF con BAGLIORE DORATO DELICATO e PULSAZIONE COMPATTA (Aura ridotta e raffinata)
        const offFontSize = Math.round(17.5 * s);
        oCtx.font = `900 ${offFontSize}px "Outfit", sans-serif`;
        const offCycle = 0.5 + 0.5 * Math.sin(tElapsed * Math.PI * 2.2);
        const offScale = 0.98 + 0.03 * offCycle;
        const offGlowBlur = (1.5 + 3.0 * offCycle) * s;
        const offColor = offCycle > 0.4 ? '#fef9c3' : '#fcd34d';

        oCtx.save();
        oCtx.translate(tx, ty);
        oCtx.scale(offScale, offScale);
        // 1. Bagliore dorato diffuso compatto e discreto (Glow calibrato)
        oCtx.shadowColor = 'rgba(250, 204, 21, 0.6)';
        oCtx.shadowBlur = offGlowBlur;
        oCtx.strokeStyle = 'rgba(234, 179, 8, 0.35)';
        oCtx.lineWidth = 1.2 * s;
        oCtx.lineJoin = 'round';
        oCtx.strokeText('10% OFF', 0, 0);

        // 2. Contorno nero solido protettivo profondo
        oCtx.shadowColor = '#000000';
        oCtx.shadowBlur = 8 * s;
        oCtx.shadowOffsetY = 2 * s;
        oCtx.strokeStyle = '#000000';
        oCtx.lineWidth = 2.8 * s;
        oCtx.strokeText('10% OFF', 0, 0);

        // 3. Testo pieno luminoso
        oCtx.fillStyle = offColor;
        oCtx.fillText('10% OFF', 0, 0);
        oCtx.restore();

        ty += offFontSize + (7 * s); // Distanziata dalla scritta sotto

        // flowerpowervillage.com (Outfit 600) - Ingrandito del 10%
        const siteFontSize = Math.round(16 * s); // Ingrandito del 10% (era 14.5 * s)
        oCtx.font = `600 ${siteFontSize}px "Outfit", sans-serif`;
        drawTextWithShadow('flowerpowervillage.com', tx, ty, 'rgba(255,255,255,0.95)', 2.8 * s);
      } else {
        // Formato Villaggio Regular (V1, V2, V3) - Identico al DOM React dell'Editor
        // Distacco abbassato di 3 pixel rispetto a Village (da 3*s a 6*s)
        ty += 6 * s;
        const dbFontSize = Math.round(21.5 * s); // Ingrandito del 10% (era 19.5 * s)
        oCtx.font = `900 ${dbFontSize}px "Outfit", sans-serif`;
        drawTextWithShadow('DIRECT BOOKING', tx, ty, '#6ee7b7', 3.4 * s);
        ty += dbFontSize + (1 * s); // Avvicinato di 2px a DIRECT BOOKING

        // 10% OFF con BAGLIORE DORATO DELICATO e PULSAZIONE COMPATTA (Aura ridotta e raffinata)
        const offFontSize = Math.round(17.5 * s); // Ingrandito del 10% (era 16 * s)
        oCtx.font = `900 ${offFontSize}px "Outfit", sans-serif`;
        const offCycle = 0.5 + 0.5 * Math.sin(tElapsed * Math.PI * 2.2);
        const offScale = 0.98 + 0.03 * offCycle;
        const offGlowBlur = (1.5 + 3.0 * offCycle) * s;
        const offColor = offCycle > 0.4 ? '#fef9c3' : '#fcd34d';

        oCtx.save();
        oCtx.translate(tx, ty);
        oCtx.scale(offScale, offScale);
        // 1. Bagliore dorato diffuso compatto e discreto (Glow calibrato)
        oCtx.shadowColor = 'rgba(250, 204, 21, 0.6)';
        oCtx.shadowBlur = offGlowBlur;
        oCtx.strokeStyle = 'rgba(234, 179, 8, 0.35)';
        oCtx.lineWidth = 1.2 * s;
        oCtx.lineJoin = 'round';
        oCtx.strokeText('10% OFF', 0, 0);

        // 2. Contorno nero solido protettivo profondo
        oCtx.shadowColor = '#000000';
        oCtx.shadowBlur = 8 * s;
        oCtx.shadowOffsetY = 2 * s;
        oCtx.strokeStyle = '#000000';
        oCtx.lineWidth = 2.6 * s;
        oCtx.strokeText('10% OFF', 0, 0);

        // 3. Testo pieno luminoso
        oCtx.fillStyle = offColor;
        oCtx.fillText('10% OFF', 0, 0);
        oCtx.restore();

        ty += offFontSize + (7 * s); // Distanziato verso il blocco sito/link sotto

        // Blocco unico compatto: flowerpowervillage.com + Link in Bio - Ingrandito del 10%
        const siteFontSize = Math.round(16 * s); // Ingrandito del 10% (era 14.5 * s)
        oCtx.font = `600 ${siteFontSize}px "Outfit", sans-serif`;
        drawTextWithShadow('flowerpowervillage.com', tx, ty, 'rgba(255,255,255,0.95)', 2.8 * s);
        ty += siteFontSize + (6 * s); // Distanziato di esattamente 4px extra (da 2*s a 6*s) sotto flowerpowervillage.com

        const bioFontSize = Math.round(16 * s); // Ingrandito del 10% (era 14.5 * s)
        oCtx.font = `700 ${bioFontSize}px "Outfit", sans-serif`;
        drawTextWithShadow('Link in Bio', tx, ty, '#fcd34d', 2.8 * s);
      }
      oCtx.restore();

      // 4. Card Bassa Proporzionata (Categoria, Titoli Bilingui, Prezzo) - ingrandita del 10%
      // 4. Card Bassa Proporzionata (Categoria Bilingue Thai/Eng, Titoli Ingranditi +20%, Prezzo, Alzata di +20px)
      if (brand === 'pizza' || mode === 'R1') {
        const bx = 25 * s; // Distanziato 25 pixel dal bordo sinistro
        const hasBadge = !!scene.badgeCategory;
        const thaiLines = (scene.titlePrimary || '').split('\n').filter(Boolean);
        const engLines = (scene.titleSecondary || '').split('\n').filter(Boolean);
        const hasPrice = !!scene.priceLabel;

        // Auto-scaling del font Thai per garantire la regola assoluta: MAI andare a capo a 3 righe
        const maxThaiLen = Math.max(...thaiLines.map(l => l.length), 0);
        const thaiFontSize = maxThaiLen > 24
          ? Math.round(21.5 * s)
          : maxThaiLen > 20
          ? Math.round(23.5 * s)
          : Math.round(27.6 * s);
        const thaiLineStep = maxThaiLen > 24
          ? (27 * s)
          : maxThaiLen > 20
          ? (30 * s)
          : (35 * s);

        // Categoria bilingue (Thai sopra a 17.5*s, Inglese sotto a 14*s + stacco 14*s): altezza 53*s (era 39*s)
        const badgeH = hasBadge ? (53 * s) : 0;
        const thaiH = thaiLines.length * thaiLineStep;
        const engH = engLines.length * (24 * s);   // Interlinea +20% (era 20*s)
        const priceH = (scene.pizzaSizes && mode !== 'R1')
          ? ((38.5 * 2 + 6) * s + 20 * s) // Pizze a colonna (8" e 12" sovrapposte): altezza 83*s + 20*s distacco
          : (hasPrice || scene.pizzaSizes)
          ? (43 * s + 20 * s)
          : 0;
        const totalCardH = badgeH + thaiH + engH + priceH;

        // Alzata di +20px dal bordo inferiore dello schermo: da 31*s a 51*s
        let by = h - (51 * s) - totalCardH;

        oCtx.save();
        oCtx.textAlign = 'left';
        oCtx.textBaseline = 'top';

        // 🏷️ Categoria del Cibo Bilingue (THAI SOPRA, INGLESE SOTTO A CAPO - 100% SEPARATE)
        if (hasBadge) {
          let catClean = (scene.badgeCategory || '').replace(/^[✦⭐✨\s*]+/, '').trim();
          if (mode === 'DS') {
            catClean = scene.isLiveShowcase ? 'FRESH IN SHOWCASE TODAY' : 'CHEF DAILY SPECIAL';
          } else {
            if (catClean.includes(' · ')) {
              const parts = catClean.split(' · ');
              const enPart = parts.find(p => !/[\u0E00-\u0E7F]/.test(p));
              if (enPart) catClean = enPart.trim();
            }
            catClean = catClean.replace(/[\u0E00-\u0E7F]/g, '').trim().toUpperCase();
          }

          let catThai = scene.badgeCategoryTh || getCategoryThaiName(scene.badgeCategory);
          if (mode === 'DS') {
            catThai = scene.isLiveShowcase ? 'สดใหม่ในตู้โชว์วันนี้' : 'เมนูพิเศษวันนี้';
          } else {
            if (catThai.includes(' · ')) {
              const parts = catThai.split(' · ');
              const thPart = parts.find(p => /[\u0E00-\u0E7F]/.test(p));
              if (thPart) catThai = thPart.trim();
            }
          }

          const diamondFont = `900 ${Math.round(17.5 * s)}px "Prompt", "Kanit", sans-serif`;
          const diamondColor = '#dc2626'; // Rosso intenso e vivo

          // Riga 1: Thai sopra con simbolo ✦ rosso intenso e ombra nera protettiva
          oCtx.font = diamondFont;
          drawTextWithShadow('✦', bx, by, diamondColor, 3.4 * s);
          oCtx.font = `900 ${Math.round(17.5 * s)}px "Prompt", "Kanit", sans-serif`;
          drawTextWithShadow(catThai, bx + (18 * s), by, '#fcd34d', 3.8 * s);
          by += 21 * s;

          // Riga 2: Inglese sotto a capo con simbolo ✦ rosso intenso e ombra nera protettiva
          oCtx.font = diamondFont;
          drawTextWithShadow('✦', bx, by, diamondColor, 3.4 * s);
          oCtx.font = `900 ${Math.round(14 * s)}px "Outfit", sans-serif`;
          drawTextWithShadow(catClean, bx + (18 * s), by, 'rgba(255, 255, 255, 0.95)', 3.4 * s);
          by += 32 * s; // Distacco netto e armonioso (+14px di respiro: da 18*s a 32*s) prima del titolo del piatto
        }

        // Titolo Thai sopra in grande e marcato con contorno nero solido e ombra profonda (Auto-scale a 2 righe max)
        if (thaiLines.length > 0) {
          oCtx.font = `900 ${thaiFontSize}px "Prompt", "Kanit", sans-serif`;
          thaiLines.forEach(l => {
            oCtx.save();
            oCtx.strokeStyle = 'rgba(0, 0, 0, 0.98)';
            oCtx.lineWidth = 4.8 * s;
            oCtx.lineJoin = 'round';
            oCtx.shadowColor = '#000000';
            oCtx.shadowBlur = 14 * s;
            oCtx.shadowOffsetY = 2.5 * s;
            oCtx.strokeText(l, bx, by);
            oCtx.restore();

            oCtx.fillStyle = '#fcd34d';
            oCtx.fillText(l, bx, by);
            by += thaiLineStep;
          });
        }

        // Titolo Inglese sotto (+20%: 19.2*s) con contorno nero solido e ombra profonda
        if (engLines.length > 0) {
          oCtx.font = `800 ${Math.round(19.2 * s)}px "Outfit", sans-serif`;
          engLines.forEach(l => {
            oCtx.save();
            oCtx.strokeStyle = 'rgba(0, 0, 0, 0.98)';
            oCtx.lineWidth = 4.2 * s;
            oCtx.lineJoin = 'round';
            oCtx.shadowColor = '#000000';
            oCtx.shadowBlur = 12 * s;
            oCtx.shadowOffsetY = 2.5 * s;
            oCtx.strokeText(l, bx, by);
            oCtx.restore();

            oCtx.fillStyle = 'rgba(255, 255, 255, 0.98)';
            oCtx.fillText(l, bx, by);
            by += 24 * s;
          });
        }

        // Box Prezzo (+20%, a tutta area con bordo bianco 2px)
        if (scene.pizzaSizes && mode !== 'R1') {
          by += 20 * s; // Distacco alzato di +10px (era 10*s)
          const p8 = `${scene.pizzaSizes.size8Price}฿`;
          const p12 = `${scene.pizzaSizes.size12Price}฿`;

          const drawPizzaBadge = (label: string, priceStr: string, startX: number, startY: number) => {
            oCtx.font = `900 ${Math.round(25.2 * s)}px "Kanit", sans-serif`;
            const pW = oCtx.measureText(priceStr).width;
            const bW = (38 * s) + pW + (16 * s);
            const bH = 38.5 * s;
            const bRad = 7 * s;

            // Ombra solida nera 2px 2px
            oCtx.fillStyle = '#000000';
            oCtx.beginPath();
            if (typeof oCtx.roundRect === 'function') {
              oCtx.roundRect(startX + 2 * s, startY + 2 * s, bW, bH, bRad);
            } else {
              oCtx.rect(startX + 2 * s, startY + 2 * s, bW, bH);
            }
            oCtx.fill();

            // Sfondo giallo #FFE500
            oCtx.fillStyle = '#FFE500';
            oCtx.beginPath();
            if (typeof oCtx.roundRect === 'function') {
              oCtx.roundRect(startX, startY, bW, bH, bRad);
            } else {
              oCtx.rect(startX, startY, bW, bH);
            }
            oCtx.fill();

            // Bordo nero 2px
            oCtx.strokeStyle = '#000000';
            oCtx.lineWidth = 2 * s;
            oCtx.stroke();

            // Badge nero per la taglia (8" o 12")
            oCtx.fillStyle = '#000000';
            const tagW = 24 * s;
            const tagH = 21 * s;
            if (typeof oCtx.roundRect === 'function') {
              oCtx.roundRect(startX + 6 * s, startY + (8.5 * s), tagW, tagH, 3.5 * s);
            } else {
              oCtx.rect(startX + 6 * s, startY + (8.5 * s), tagW, tagH);
            }
            oCtx.fill();

            // Testo taglia bianco
            oCtx.font = `900 ${Math.round(15.5 * s)}px "Kanit", sans-serif`;
            oCtx.fillStyle = '#ffffff';
            oCtx.textAlign = 'center';
            oCtx.textBaseline = 'middle';
            oCtx.fillText(label, startX + 6 * s + (tagW / 2), startY + (8.5 * s) + (tagH / 2) + Math.round(1 * s));

            // Testo prezzo centrato con contorno bianco allineato
            oCtx.font = `900 ${Math.round(25.2 * s)}px "Kanit", sans-serif`;
            const priceCx = startX + 6 * s + tagW + 5 * s + (pW / 2);
            const priceCy = startY + (bH / 2) + Math.round(1.5 * s);
            oCtx.strokeStyle = '#ffffff';
            oCtx.lineWidth = 4 * s;
            oCtx.lineJoin = 'round';
            oCtx.strokeText(priceStr, priceCx, priceCy);

            oCtx.fillStyle = '#000000';
            oCtx.shadowColor = 'transparent';
            oCtx.shadowBlur = 0;
            oCtx.fillText(priceStr, priceCx, priceCy);
            return bW;
          };

          oCtx.save();
          const p8H = 38.5 * s;
          const pGap = 6 * s;
          const w8 = drawPizzaBadge('8"', p8, bx, by);
          const w12 = drawPizzaBadge('12"', p12, bx, by + p8H + pGap);
          oCtx.restore();

          // 🏷️ BADGE PROMO BILINGUE A DESTRA (Incolonnamento Pizze, Centrato, Gradiente Brillante)
          if ((mode === 'P1' || mode === 'P2' || mode === 'P3' || mode === 'DS') && !isInOutro) {
            oCtx.save();
            const totalPizzaH = (p8H * 2) + pGap; // 83 * s
            const badgeW = 205 * s;
            const badgeH = 52 * s;
            const badgeX = w - bx - badgeW;
            const badgeY = by + ((totalPizzaH - badgeH) / 2);
            const badgeRad = 8 * s;

            // Ombra
            oCtx.shadowColor = 'rgba(225, 29, 72, 0.65)';
            oCtx.shadowBlur = 10 * s;
            oCtx.shadowOffsetY = 2 * s;

            // Gradiente Rosso Rubino -> Rosa -> Ambra
            const grad = oCtx.createLinearGradient(badgeX, badgeY, badgeX + badgeW, badgeY + badgeH);
            grad.addColorStop(0, '#dc2626');
            grad.addColorStop(0.5, '#e11d48');
            grad.addColorStop(1, '#f59e0b');
            oCtx.fillStyle = grad;

            oCtx.beginPath();
            if (typeof oCtx.roundRect === 'function') {
              oCtx.roundRect(badgeX, badgeY, badgeW, badgeH, badgeRad);
            } else {
              oCtx.rect(badgeX, badgeY, badgeW, badgeH);
            }
            oCtx.fill();

            // Bordino oro chiaro 1.8px
            oCtx.strokeStyle = '#fef08a';
            oCtx.lineWidth = 1.8 * s;
            oCtx.stroke();

            // Testo rigorosamente CENTRATO
            oCtx.textAlign = 'center';
            oCtx.textBaseline = 'middle';
            const badgeCx = badgeX + (badgeW / 2);

            oCtx.shadowColor = 'rgba(0, 0, 0, 0.9)';
            oCtx.shadowBlur = 4 * s;
            oCtx.font = `900 ${Math.round(11.5 * s)}px "Prompt", "Kanit", sans-serif`;
            oCtx.fillStyle = '#fef08a';
            oCtx.fillText('🛵 ส่งฟรี 300฿+  ·  🏷️ ลด 10%', badgeCx, badgeY + (18 * s));

            oCtx.font = `800 ${Math.round(9.5 * s)}px "Outfit", sans-serif`;
            oCtx.fillStyle = '#ffffff';
            oCtx.fillText('Free Delivery 300฿+ · 1st Order -10%', badgeCx, badgeY + (34 * s));
            oCtx.restore();
          }
        } else if (hasPrice) {
          by += 20 * s; // Distacco alzato di +10px (era 10*s)
          const priceClean = scene.priceLabel!.replace(/\bTHB\b/g, '฿').replace(/\s*฿/g, '฿');
          oCtx.font = `900 ${Math.round(31.8 * s)}px "Kanit", sans-serif`;
          const pTextW = oCtx.measureText(priceClean).width;
          const boxPadX = 14 * s;
          const boxW = pTextW + (boxPadX * 2);
          const boxH = 43 * s;
          const boxRadius = 8 * s;

          oCtx.save();
          // Ombra solida nera 2px 2px (come shadow-[2px_2px_0px_#000000] in DOM)
          oCtx.fillStyle = '#000000';
          oCtx.beginPath();
          if (typeof oCtx.roundRect === 'function') {
            oCtx.roundRect(bx + 2 * s, by + 2 * s, boxW, boxH, boxRadius);
          } else {
            oCtx.rect(bx + 2 * s, by + 2 * s, boxW, boxH);
          }
          oCtx.fill();

          // Sfondo giallo #FFE500
          oCtx.fillStyle = '#FFE500';
          oCtx.beginPath();
          if (typeof oCtx.roundRect === 'function') {
            oCtx.roundRect(bx, by, boxW, boxH, boxRadius);
          } else {
            oCtx.rect(bx, by, boxW, boxH);
          }
          oCtx.fill();

          // Bordo nero 2px
          oCtx.strokeStyle = '#000000';
          oCtx.lineWidth = 2 * s;
          oCtx.stroke();

          // Allineamento testo: CENTRATO verticalmente e orizzontalmente
          oCtx.textAlign = 'center';
          oCtx.textBaseline = 'middle';
          const textCx = bx + (boxW / 2);
          const textCy = by + (boxH / 2) + Math.round(2.5 * s);

          // Bordo esterno bianco di 4.2px centrato perfettamente
          oCtx.lineWidth = 4.2 * s;
          oCtx.strokeStyle = '#ffffff';
          oCtx.lineJoin = 'round';
          oCtx.strokeText(priceClean, textCx, textCy);

          // Testo cifra in nero a tutta ampiezza centrato identico
          oCtx.fillStyle = '#000000';
          oCtx.shadowColor = 'transparent';
          oCtx.shadowBlur = 0;
          oCtx.fillText(priceClean, textCx, textCy);
          oCtx.restore();

          // 🏷️ BADGE PROMO BILINGUE A DESTRA DEL PREZZO SINGOLO (Centrato, Gradiente Brillante)
          if ((mode === 'P1' || mode === 'P2' || mode === 'P3' || mode === 'DS') && !isInOutro) {
            oCtx.save();
            const badgeW = 205 * s;
            const badgeH = 41 * s;
            const badgeX = w - bx - badgeW;
            const badgeY = by + ((boxH - badgeH) / 2);
            const badgeRad = 8 * s;

            // Ombra
            oCtx.shadowColor = 'rgba(225, 29, 72, 0.65)';
            oCtx.shadowBlur = 10 * s;
            oCtx.shadowOffsetY = 2 * s;

            // Gradiente Rosso Rubino -> Rosa -> Ambra
            const grad = oCtx.createLinearGradient(badgeX, badgeY, badgeX + badgeW, badgeY + badgeH);
            grad.addColorStop(0, '#dc2626');
            grad.addColorStop(0.5, '#e11d48');
            grad.addColorStop(1, '#f59e0b');
            oCtx.fillStyle = grad;

            oCtx.beginPath();
            if (typeof oCtx.roundRect === 'function') {
              oCtx.roundRect(badgeX, badgeY, badgeW, badgeH, badgeRad);
            } else {
              oCtx.rect(badgeX, badgeY, badgeW, badgeH);
            }
            oCtx.fill();

            // Bordino oro chiaro 1.8px
            oCtx.strokeStyle = '#fef08a';
            oCtx.lineWidth = 1.8 * s;
            oCtx.stroke();

            // Testo rigorosamente CENTRATO
            oCtx.textAlign = 'center';
            oCtx.textBaseline = 'middle';
            const badgeCx = badgeX + (badgeW / 2);

            oCtx.shadowColor = 'rgba(0, 0, 0, 0.9)';
            oCtx.shadowBlur = 4 * s;
            oCtx.font = `900 ${Math.round(11.5 * s)}px "Prompt", "Kanit", sans-serif`;
            oCtx.fillStyle = '#fef08a';
            oCtx.fillText('🛵 ส่งฟรี 300฿+  ·  🏷️ ลด 10%', badgeCx, badgeY + (13 * s));

            oCtx.font = `800 ${Math.round(9.5 * s)}px "Outfit", sans-serif`;
            oCtx.fillStyle = '#ffffff';
            oCtx.fillText('Free Delivery 300฿+ · 1st Order -10%', badgeCx, badgeY + (27 * s));
            oCtx.restore();
          }
        }

        oCtx.restore();
      } else if (brand === 'village') {
        // Modalità Alloggi Villaggio (V1, V2, V3, LM1) - Sincronizzata 1:1 con il DOM React dell'Editor
        const bx = 25 * s;
        const maxTextW = w - bx - (25 * s);
        const titleH = 28 * s + (3 * s);
        const subtitleH = scene.lodgingSubtitle ? (24 * s + 3 * s) : 0;

        // Misura e suddivisione su 2 righe per Thai se supera la larghezza massima
        let thaiLines: string[] = [];
        if (scene.titleSecondary) {
          const thaiFontSize = Math.round(14 * s);
          oCtx.font = `600 ${thaiFontSize}px "Prompt", "Kanit", sans-serif`;
          if (oCtx.measureText(scene.titleSecondary).width <= maxTextW) {
            thaiLines = [scene.titleSecondary];
          } else {
            const words = scene.titleSecondary.split(' ');
            if (words.length > 1) {
              let curLine = '';
              for (const word of words) {
                const testLine = curLine ? `${curLine} ${word}` : word;
                if (oCtx.measureText(testLine).width <= maxTextW) {
                  curLine = testLine;
                } else {
                  if (curLine) thaiLines.push(curLine);
                  curLine = word;
                }
              }
              if (curLine) thaiLines.push(curLine);
            } else {
              const mid = Math.floor(scene.titleSecondary.length / 2);
              thaiLines = [scene.titleSecondary.slice(0, mid), scene.titleSecondary.slice(mid)];
            }
          }
        }
        const thaiH = thaiLines.length > 0 ? (thaiLines.length * (20 * s) + (3 * s)) : 0;
        const hasPrice = !!scene.priceLabel && mode === 'LM1';
        const priceH = hasPrice ? (46 * s) : 0;
        const totalCardH = titleH + subtitleH + thaiH + priceH;

        // Ancoraggio inferiore sicuro identico a bottom-[47px]
        let by = h - (47 * s) - totalCardH;

        oCtx.save();
        oCtx.textAlign = 'left';
        oCtx.textBaseline = 'top';
        oCtx.shadowColor = 'rgba(0, 0, 0, 0.95)';
        oCtx.shadowBlur = 10 * s;

        // 2. Titolo Alloggio (Inglese Strutturato Bianco Outfit 900 con ombra protettiva ad alto contrasto)
        const lTitle = scene.lodgingTitle || scene.titlePrimary || '';
        if (lTitle) {
          oCtx.font = `900 ${Math.round(23.5 * s)}px "Outfit", sans-serif`;
          drawTextWithShadow(lTitle, bx, by, '#ffffff', 4.0 * s);
          by += 28 * s + (3 * s); // +3 pixel di distacco verso il sottotitolo
        }

        // 3. Sottotitolo Alloggio (Giallo/Ambra Outfit 700 con ombra protettiva)
        if (scene.lodgingSubtitle) {
          oCtx.font = `700 ${Math.round(18 * s)}px "Outfit", sans-serif`;
          drawTextWithShadow(scene.lodgingSubtitle, bx, by, '#fcd34d', 3.2 * s);
          by += 24 * s + (3 * s); // +3 pixel di distacco verso la scritta Thai
        }

        // 4. Descrizione Thai Alloggio (Prompt 600 con wrapping naturale e ombra protettiva)
        if (thaiLines.length > 0) {
          oCtx.font = `600 ${Math.round(14 * s)}px "Prompt", "Kanit", sans-serif`;
          thaiLines.forEach(tl => {
            drawTextWithShadow(tl, bx, by, 'rgba(241, 245, 249, 0.98)', 2.6 * s);
            by += 20 * s;
          });
          by += 3 * s; // +3 pixel di distacco verso il prezzo
        }

        // 5. Prezzo Last Minute Octorate (SOLO IN LM1): Box Giallo #FFE500 con bordo nero 2px, ombra solida e outline bianco centrato
        if (hasPrice) {
          by += 6 * s;
          const priceClean = scene.priceLabel!.replace(/^Today\s+/i, '').replace(/\bTHB\b/g, '฿').replace(/\s*฿/g, '฿');
          oCtx.font = `900 ${Math.round(27 * s)}px "Kanit", sans-serif`;
          const pTextW = oCtx.measureText(priceClean).width;
          const boxPadX = 12 * s;
          const boxW = pTextW + (boxPadX * 2);
          const boxH = 38 * s;
          const boxRadius = 6 * s;

          oCtx.save();
          // Ombra solida nera 2px 2px (come shadow-[2px_2px_0px_#000000] nel DOM)
          oCtx.fillStyle = '#000000';
          oCtx.beginPath();
          if (typeof oCtx.roundRect === 'function') {
            oCtx.roundRect(bx + 2 * s, by + 2 * s, boxW, boxH, boxRadius);
          } else {
            oCtx.rect(bx + 2 * s, by + 2 * s, boxW, boxH);
          }
          oCtx.fill();

          // Sfondo giallo #FFE500
          oCtx.fillStyle = '#FFE500';
          oCtx.beginPath();
          if (typeof oCtx.roundRect === 'function') {
            oCtx.roundRect(bx, by, boxW, boxH, boxRadius);
          } else {
            oCtx.rect(bx, by, boxW, boxH);
          }
          oCtx.fill();

          // Bordo nero 2px
          oCtx.strokeStyle = '#000000';
          oCtx.lineWidth = 2 * s;
          oCtx.stroke();

          // Allineamento testo: CENTRATO orizzontalmente e verticalmente (zero ghosting / zero sfasamento!)
          oCtx.textAlign = 'center';
          oCtx.textBaseline = 'middle';
          const pCx = bx + (boxW / 2);
          const pCy = by + (boxH / 2) + Math.round(1.5 * s);

          // Bordo esterno bianco 3.5px
          oCtx.lineWidth = 3.5 * s;
          oCtx.strokeStyle = '#ffffff';
          oCtx.lineJoin = 'round';
          oCtx.strokeText(priceClean, pCx, pCy);

          // Testo nero pieno centrato identico
          oCtx.fillStyle = '#000000';
          oCtx.shadowColor = 'transparent';
          oCtx.shadowBlur = 0;
          oCtx.fillText(priceClean, pCx, pCy);
          oCtx.restore();
        }

        oCtx.restore();
      }
    };

    // Espone l'esportatore del fotogramma composito 9:16 e del VIDEO MP4 Full HD (1080x1920)
    if (typeof window !== 'undefined') {
      (window as any).__autoCutGetCanvas = () => {
        const c = canvasRef.current;
        const off = document.createElement('canvas');
        off.width = 1080;
        off.height = 1920;
        const offCtx = off.getContext('2d');
        if (!offCtx) return c;

        const currIdx = activeSceneIndex >= 0 && activeSceneIndex < scenes.length ? activeSceneIndex : 0;
        const currScene = scenes[currIdx] || scenes[0];
        const currImg = loadedImages[currIdx] || loadedImages[0];

        // 1. Copia il frame video corrente (o disegna direttamente se disponibile)
        if (c && c.width > 0 && c.height > 0) {
          offCtx.drawImage(c, 0, 0, 1080, 1920);
        } else if (currImg && currImg.complete && currImg.naturalWidth > 0) {
          drawSceneToCanvas(off, offCtx, currImg, currScene, 0.5, 1.0, false);
        }

        // 2. Disegna gli overlay con proporzioni perfette 1:1 e font ufficiali
        if (currScene) {
          renderOverlaysToContext(offCtx, 1080, 1920, currScene, false);
        }

        return off;
      };

      // 🎬 Generatore Video MP4 Full HD con MediaRecorder a 30fps con Audio Muxato, Font Originali e Outro Ufficiale Completo
      (window as any).__autoCutGetVideo = async (onProgress?: (pct: number, stepIndex?: number, stepLabel?: string) => void): Promise<string | null> => {
        const c = canvasRef.current;
        if (!c) return null;

        if (onProgress) onProgress(3, 0, 'Inizializzazione motore video Full HD 1080x1920...');

        // Assicura che tutti i web font ufficiali (Outfit, Prompt, Kanit, Inter) siano scaricati e pronti
        if (typeof document !== 'undefined' && document.fonts) {
          if (onProgress) onProgress(12, 1, 'Caricamento web font ufficiali (Outfit, Prompt, Kanit)...');
          try {
            await Promise.all([
              document.fonts.load('900 24px "Outfit"'),
              document.fonts.load('800 24px "Outfit"'),
              document.fonts.load('700 24px "Outfit"'),
              document.fonts.load('600 24px "Outfit"'),
              document.fonts.load('italic 500 24px "Outfit"'),
              document.fonts.load('900 24px "Prompt"'),
              document.fonts.load('800 24px "Prompt"'),
              document.fonts.load('700 24px "Prompt"'),
              document.fonts.load('600 24px "Prompt"'),
              document.fonts.load('900 24px "Kanit"')
            ]);
            await document.fonts.ready;
          } catch (e) {
            console.warn('Font loading await error:', e);
          }
        }

        // 🖼️ Precarica e decodifica tutti gli asset visivi critici (Logo Ufficiale Brand + Immagini Full HD)
        if (onProgress) onProgress(18, 1, 'Decodifica e preriscaldamento logo ufficiale e fotogrammi Full HD...');
        try {
          await ensureBrandLogosReady();
          const domLogoEl = typeof document !== 'undefined' ? (document.getElementById('autoCutHeaderLogoImg') as HTMLImageElement | null) : null;
          const targetLogo = brand === 'pizza' ? globalPizzaLogoImg : globalVillageLogoImg;
          if (targetLogo instanceof Image && !targetLogo.src) {
            targetLogo.src = brand === 'pizza' ? PIZZA_LOGO_512_BASE64 : VILLAGE_LOGO_512_BASE64;
          }

          const imgsToDecode: HTMLImageElement[] = [
            targetLogo,
            domLogoEl,
            logoImg,
            globalVillageLogoImg,
            globalPizzaLogoImg,
            ...loadedImages
          ].filter(Boolean) as HTMLImageElement[];

          await Promise.all(imgsToDecode.map(img => {
            if (!img) return Promise.resolve();
            if (img.complete && img.naturalWidth > 0) return Promise.resolve();
            return new Promise<void>(res => {
              const onDone = () => {
                img.removeEventListener('load', onDone);
                img.removeEventListener('error', onDone);
                res();
              };
              img.addEventListener('load', onDone);
              img.addEventListener('error', onDone);
              setTimeout(onDone, 3000);
            });
          }));
        } catch (e) {
          console.warn('Image pre-decode warning:', e);
        }

        const off = document.createElement('canvas');
        off.width = 1080;
        off.height = 1920;
        off.style.position = 'fixed';
        off.style.left = '0px';
        off.style.top = '0px';
        off.style.width = '1080px';
        off.style.height = '1920px';
        off.style.zIndex = '-99999';
        off.style.opacity = '0.01';
        off.style.pointerEvents = 'none';
        if (typeof document !== 'undefined' && document.body) {
          document.body.appendChild(off);
        }

        const cleanupOff = () => {
          if (off && off.parentNode) {
            try { off.parentNode.removeChild(off); } catch {}
          }
        };

        const offCtx = off.getContext('2d');
        if (!offCtx) {
          cleanupOff();
          return null;
        }
        offCtx.imageSmoothingEnabled = true;
        offCtx.imageSmoothingQuality = 'high';

        // 🎨 Funzione di disegno fotogramma universale (100% identica alla preview del player)
        const renderFrameToOffscreen = (tElapsed: number) => {
          let curIdx = 0;
          for (let i = 0; i < sceneTimeline.length; i++) {
            if (tElapsed >= sceneTimeline[i].start && (tElapsed < sceneTimeline[i].end || i === sceneTimeline.length - 1)) {
              curIdx = i;
              break;
            }
          }

          const curTiming = sceneTimeline[curIdx] || { start: 0, end: sceneDuration, duration: sceneDuration };
          const effDissolve = Math.min(0.65, curTiming.duration * 0.28);
          const curBirth = curIdx === 0 ? 0 : (curTiming.start - effDissolve);
          const curLife = curIdx === 0 ? curTiming.duration : (curTiming.duration + effDissolve);
          const curAge = Math.max(0, tElapsed - curBirth);
          const rawSubT = Math.min(1.0, curAge / curLife);
          const INCOMING_OFFSET = 0.20;

          // Durante l'Outro finale, il moto della scena di fondo si CONGELA a 1.0 (zero scatti, zero modulo!)
          const subT = tElapsed >= outroStartTime
            ? 1.0
            : (curIdx === 0 ? rawSubT : (INCOMING_OFFSET + (rawSubT * (1.0 - INCOMING_OFFSET))));

          const activeSc = scenes[curIdx] || scenes[0];
          const activeImg = loadedImages[curIdx] || loadedImages[0];

          offCtx.clearRect(0, 0, 1080, 1920);
          if (activeImg && activeSc) {
            drawSceneToCanvas(off, offCtx, activeImg, activeSc, subT, 1.0, false);
          }

          // Crossfade con la scena successiva: SOLTANTO L'IMMAGINE DI FONDO DISSOLVE, L'HEADER RIMANE FISSO!
          let dominantIdx = curIdx;
          const transThreshold = curTiming.end - effDissolve;
          if (tElapsed < outroStartTime && tElapsed >= transThreshold && curIdx < sceneCount - 1) {
            const nextIdx = curIdx + 1;
            const nextTiming = sceneTimeline[nextIdx];
            const nextImg = loadedImages[nextIdx];
            const nextSc = scenes[nextIdx];
            if (nextImg && nextSc && nextTiming) {
              const nBirth = nextTiming.start - effDissolve;
              const nLife = nextTiming.duration + effDissolve;
              const nAge = Math.max(0, tElapsed - nBirth);
              const nRawSubT = Math.min(1.0, nAge / nLife);
              const nSubT = INCOMING_OFFSET + (nRawSubT * (1.0 - INCOMING_OFFSET));
              const crossRatio = Math.min(1.0, Math.max(0.0, (tElapsed - transThreshold) / effDissolve));
              const nOpacity = 0.5 - 0.5 * Math.cos(crossRatio * Math.PI);
              drawSceneToCanvas(off, offCtx, nextImg, nextSc, nSubT, nOpacity, false);
              if (crossRatio >= 0.5) {
                dominantIdx = nextIdx;
              }
            }
          }

          // Overlay gradiente cinematografico per contrasto tipografico
          if (tElapsed < outroStartTime) {
            const grad = offCtx.createLinearGradient(0, 0, 0, 1920);
            grad.addColorStop(0, 'rgba(0,0,0,0.25)');
            grad.addColorStop(0.20, 'rgba(0,0,0,0.0)');
            grad.addColorStop(0.80, 'rgba(0,0,0,0.0)');
            grad.addColorStop(1, 'rgba(0,0,0,0.35)');
            offCtx.fillStyle = grad;
            offCtx.fillRect(0, 0, 1080, 1920);
          }

          // 2. Disegna gli overlay identici alla preview (con dissolvenza dolce prima dell'outro) o l'Outro finale animato
          if (tElapsed < outroStartTime) {
            const fadeThreshold = outroStartTime - 0.35;
            let overlayAlpha = 1.0;
            if (tElapsed > fadeThreshold) {
              overlayAlpha = Math.max(0, (outroStartTime - tElapsed) / 0.35);
            }
            offCtx.save();
            offCtx.globalAlpha = overlayAlpha;
            renderOverlaysToContext(offCtx, 1080, 1920, scenes[dominantIdx] || activeSc, false, tElapsed);
            offCtx.restore();
          } else {
            drawFullOutroToContext(offCtx, 1080, 1920, tElapsed - outroStartTime);
          }
        };

        // 🚀 METODO PRIMARIO: RENDERING DETERMINISTICO 60 FPS VIA WEBCODECS
        // Zero scatti, zero frame drop, 100% identico alla preview canvas del Social Studio!
        if (typeof window !== 'undefined' && typeof (window as any).VideoEncoder === 'function') {
          try {
            if (onProgress) onProgress(6, 1, 'Inizializzazione encoder hardware WebCodecs 60 FPS...');

            const muxer = new Muxer({
              target: new ArrayBufferTarget(),
              video: {
                codec: 'avc',
                width: 1080,
                height: 1920
              },
              fastStart: 'in-memory'
            });

            let encoderError: any = null;
            const encoder = new (window as any).VideoEncoder({
              output: (chunk: any, meta: any) => muxer.addVideoChunk(chunk, meta),
              error: (e: any) => { encoderError = e; console.error('[WebCodecs] Encoder error:', e); }
            });

            const targetDuration = (totalVideoDuration > 0 ? totalVideoDuration : 15) + 0.4;
            // Target ~12.0 MB max (così anche con audio muxato e cover art rimane ~13-14 MB, ben sotto il limite URL di 20 MB di Telegram)
            const safeMaxBits = 12.0 * 1024 * 1024 * 8;
            const targetBitrate = Math.min(5_500_000, Math.max(1_800_000, Math.floor(safeMaxBits / targetDuration)));

            encoder.configure({
              codec: 'avc1.64002a', // H.264 High Profile Level 4.2 Full HD 1080x1920
              width: 1080,
              height: 1920,
              bitrate: targetBitrate,
              framerate: 60,
              latencyMode: 'quality'
            });

            const fps = 60;
            const totalFrames = Math.round(targetDuration * fps);

            for (let currentFrame = 0; currentFrame < totalFrames; currentFrame++) {
              if (encoderError) {
                try { encoder.close(); } catch {}
                throw encoderError;
              }

              const tElapsed = currentFrame / fps;
              renderFrameToOffscreen(tElapsed);

              const videoFrame = new (window as any).VideoFrame(off, {
                timestamp: Math.round((currentFrame * 1_000_000) / fps)
              });
              encoder.encode(videoFrame, { keyFrame: currentFrame % 60 === 0 });
              videoFrame.close();

              if (currentFrame % 30 === 0) {
                const pct = Math.min(85, Math.round((currentFrame / totalFrames) * 85));
                if (onProgress) onProgress(pct, 2, `Rendering fluido 60 FPS (${Math.round((currentFrame / totalFrames) * 100)}%)...`);
                await new Promise(r => setTimeout(r, 0));
              }
            }

            await encoder.flush();
            try { encoder.close(); } catch {}
            muxer.finalize();

            // 📸 REGOLA 14: ESTRAZIONE THUMBNAIL UFFICIALE PRE-DISSOLVENZA (ZERO GHOSTING / MASSIMO ZOOM)
            let thumbBlob: Blob | null = null;
            let thumbUrl: string | null = null;
            try {
              renderFrameToOffscreen(thumbnailTimestamp);
              thumbBlob = await new Promise<Blob | null>(res => off.toBlob(res, 'image/jpeg', 0.95));
            } catch (thErr) {
              console.warn('[AutoCutLabPlayer] Errore estrazione thumbnail:', thErr);
            }

            cleanupOff();

            if (onProgress) onProgress(88, 3, 'Finalizzazione file MP4 broadcast con Cover Art...');
            const videoBlob = new Blob([muxer.target.buffer], { type: 'video/mp4' });

            const cleanFilename = `story_video_${testRun.mode}_${brand}_${Date.now()}.mp4`;
            if (onProgress) onProgress(92, 4, 'Upload su Cloud Storage (Supabase S3)...');

            // Upload della Thumbnail Ufficiale su Supabase S3
            if (thumbBlob) {
              try {
                const thumbFilename = `story_thumb_${testRun.mode}_${brand}_${Date.now()}.jpg`;
                const signResTh = await fetch(`/api/social-publisher?action=get_story_upload_url&filename=${encodeURIComponent(thumbFilename)}`);
                const signDataTh = await signResTh.json();
                if (signDataTh.ok && signDataTh.signedUrl) {
                  const putThRes = await fetch(signDataTh.signedUrl, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'image/jpeg' },
                    body: thumbBlob
                  });
                  if (putThRes.ok && signDataTh.publicUrl) {
                    thumbUrl = signDataTh.publicUrl;
                    (window as any).__lastGeneratedThumbnailUrl = thumbUrl;
                    console.log('[AutoCutLabPlayer] 📸 Thumbnail Ufficiale salvata su Supabase:', thumbUrl);
                  }
                }
              } catch (thUpErr) {
                console.warn('[AutoCutLabPlayer] Upload thumbnail warning:', thUpErr);
              }
            }

            // Signed URL upload diretto a piena banda per il video
            const signRes = await fetch(`/api/social-publisher?action=get_story_upload_url&filename=${encodeURIComponent(cleanFilename)}`);
            const signData = await signRes.json();

            if (signData.ok && signData.signedUrl) {
              const putRes = await fetch(signData.signedUrl, {
                method: 'PUT',
                headers: { 'Content-Type': 'video/mp4' },
                body: videoBlob
              });

              if (putRes.ok && signData.publicUrl) {
                // Muxing audio istantaneo lato server (0.2s) con inserimento Cover Art nell'MP4
                if (audioTrack?.src) {
                  if (onProgress) onProgress(96, 5, 'Sincronizzazione audio jingle e Cover Art ufficiale...');
                  try {
                    const muxRes = await fetch('/api/social-publisher?action=attach_audio_to_story', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        video_url: signData.publicUrl,
                        audio_track: audioTrack.src,
                        outro_start_time: outroStartTime,
                        brand: brand,
                        thumbnail_url: thumbUrl,
                        thumbnail_time: thumbnailTimestamp
                      })
                    });
                    const muxData = await muxRes.json();
                    if (muxData.ok && muxData.url) {
                      if (muxData.thumbnail_url) {
                        (window as any).__lastGeneratedThumbnailUrl = muxData.thumbnail_url;
                      }
                      if (onProgress) onProgress(100, 6, 'Master Video 60 FPS completato con successo!');
                      return muxData.url;
                    }
                  } catch (muxErr) {
                    console.warn('[AutoCutLabPlayer] Audio attach warning, fallback to direct url:', muxErr);
                  }
                }
                if (onProgress) onProgress(100, 6, 'Master Video 60 FPS completato con successo!');
                return signData.publicUrl;
              }
            }
          } catch (webcodecsErr) {
            console.warn('[AutoCutLabPlayer] WebCodecs fallback to MediaRecorder:', webcodecsErr);
          }
        }

        // --- FALLBACK MEDIARECORDER (per browser non supportati) ---
        const canvasStream = off.captureStream(30);
        let recordingStream = canvasStream;
        let exportAudioCtx: AudioContext | null = null;
        let audioSourceNode: AudioBufferSourceNode | null = null;
        let audioDestNode: MediaStreamAudioDestinationNode | null = null;

        // Muxing Audio Jingle Ufficiale via WebAudio Buffer (Zero blocchi CORS, zero ritardi di buffer)
        if (audioTrack?.src) {
          try {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContextClass) {
              exportAudioCtx = new AudioContextClass();
              await exportAudioCtx.resume().catch(() => {});

              try {
                const audioRes = await fetch(audioTrack.src);
                if (audioRes.ok) {
                  const arrayBuf = await audioRes.arrayBuffer();
                  const decodedAudio = await exportAudioCtx.decodeAudioData(arrayBuf);
                  const dest = exportAudioCtx.createMediaStreamDestination();
                  audioDestNode = dest;
                  audioSourceNode = exportAudioCtx.createBufferSource();
                  audioSourceNode.buffer = decodedAudio;
                  audioSourceNode.connect(dest);

                  const aTracks = dest.stream.getAudioTracks();
                  if (aTracks.length > 0) {
                    recordingStream = new MediaStream([
                      ...canvasStream.getVideoTracks(),
                      ...aTracks
                    ]);
                  }
                }
              } catch (fetchAudioErr) {
                console.warn('[AutoCutLabPlayer] Audio fetch/decode error, fallback video-only:', fetchAudioErr);
              }
            }
          } catch (aErr) {
            console.warn('Audio mux fallback to video stream:', aErr);
          }
        }

        const mimeTypes = [
          'video/mp4;codecs=avc1,mp4a.40.2',
          'video/mp4',
          'video/webm;codecs=vp9,opus',
          'video/webm;codecs=vp8,opus',
          'video/webm'
        ];
        const selectedMime = mimeTypes.find(t => {
          try { return MediaRecorder.isTypeSupported(t); } catch { return false; }
        }) || 'video/webm';

        // Durata completa comprensiva delle scene e dell'Outro animato ufficiale (con buffer finale anti-troncamento)
        const targetDuration = (totalVideoDuration > 0 ? totalVideoDuration : 15) + 0.4;
        const fps = 30;
        const totalFrames = Math.round(targetDuration * fps);

        // 🛡️ Bitrate Dinamico Broadcast Full HD (1080x1920): target ~12 MB di sicurezza assoluta (ben sotto i 20 MB di Telegram)
        const maxTelegramSafeBits = 12 * 1024 * 1024 * 8;
        const dynamicBitrate = Math.min(5500000, Math.max(1800000, Math.floor(maxTelegramSafeBits / targetDuration)));

        const recorder = new MediaRecorder(recordingStream, {
          mimeType: selectedMime,
          videoBitsPerSecond: dynamicBitrate
        });

        const chunks: Blob[] = [];
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) chunks.push(e.data);
        };

        return new Promise<string | null>((resolve) => {
          let isResolved = false;
          let renderLoopInterval: any = null;
          let timerWorker: Worker | null = null;

          const stopAllTimers = () => {
            if (renderLoopInterval) {
              clearInterval(renderLoopInterval);
              renderLoopInterval = null;
            }
            if (timerWorker) {
              try {
                timerWorker.postMessage('stop');
                timerWorker.terminate();
              } catch {}
              timerWorker = null;
            }
          };

          const safeResolve = (val: string | null) => {
            if (!isResolved) {
              isResolved = true;
              clearTimeout(safetyTimeout);
              stopAllTimers();
              cleanupOff();
              resolve(val);
            }
          };

          // Timer di sicurezza dinamico anti-freeze (durata reale + 20s di tolleranza, zero interruzione precoce!)
          const safetyTimeoutMs = Math.max(45000, Math.round((targetDuration + 20) * 1000));
          const safetyTimeout = setTimeout(() => {
            console.warn(`[AutoCutLabPlayer] Timeout di sicurezza registrazione video raggiunto (${Math.round(safetyTimeoutMs / 1000)}s).`);
            stopAllTimers();
            cleanupOff();
            if (recorder.state === 'recording') {
              try { recorder.stop(); } catch {}
            } else {
              safeResolve(null);
            }
          }, safetyTimeoutMs);

          recorder.onstop = async () => {
            stopAllTimers();
            if (audioSourceNode) {
              try { audioSourceNode.stop(); } catch {}
              audioSourceNode = null;
            }
            if (exportAudioCtx && exportAudioCtx.state !== 'closed') {
              exportAudioCtx.close().catch(() => {});
              exportAudioCtx = null;
            }

            if (onProgress) onProgress(80, 3, 'Finalizzazione file MP4 HD...');

            const videoBlob = new Blob(chunks, { type: selectedMime.split(';')[0] });
            if (videoBlob.size < 5000) {
              console.error('[AutoCutLabPlayer] Registrazione video vuota o troppo piccola:', videoBlob.size, 'bytes');
              safeResolve(null);
              return;
            }

            const ext = selectedMime.includes('mp4') ? 'mp4' : 'webm';
            const cleanFilename = `story_video_${testRun.mode}_${brand}_${Date.now()}.${ext}`;
            const contentType = selectedMime.split(';')[0] || 'video/mp4';

            if (onProgress) onProgress(88, 4, 'Upload su Cloud Storage (Supabase S3)...');

            try {
              // 1. Richiesta signed URL per bypass totale del limite Vercel 4.5MB (upload diretto binario ad altissima velocità su Supabase S3)
              const signRes = await fetch(`/api/social-publisher?action=get_story_upload_url&filename=${encodeURIComponent(cleanFilename)}`);
              const signData = await signRes.json();

              if (signData.ok && signData.signedUrl) {
                const putRes = await fetch(signData.signedUrl, {
                  method: 'PUT',
                  headers: { 'Content-Type': contentType },
                  body: videoBlob
                });
                if (putRes.ok && signData.publicUrl) {
                  safeResolve(signData.publicUrl);
                  return;
                } else {
                  console.warn('[AutoCutLabPlayer] Direct PUT to signed URL non riuscito, fallback base64...', putRes.statusText);
                }
              }
            } catch (signErr) {
              console.warn('[AutoCutLabPlayer] Signed upload url fallback:', signErr);
            }

            // Fallback Base64 classico se il signed upload diretto non è disponibile
            const reader = new FileReader();
            reader.onloadend = async () => {
              const base64Data = reader.result as string;
              try {
                const uploadRes = await fetch('/api/social-publisher?action=upload_story_media', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    data_url: base64Data,
                    filename: cleanFilename,
                    content_type: contentType
                  })
                });
                const uploadData = await uploadRes.json();
                if (uploadData.ok && uploadData.url) {
                  safeResolve(uploadData.url);
                } else {
                  safeResolve(null);
                }
              } catch (upErr) {
                console.error('Video upload failed fallback:', upErr);
                safeResolve(null);
              }
            };
            reader.readAsDataURL(videoBlob);
          };

          recorder.onerror = (ev: any) => {
            console.error('[AutoCutLabPlayer] MediaRecorder error:', ev?.error || ev);
          };
          recorder.start(250);
          if (audioSourceNode) {
            try { audioSourceNode.start(0); } catch (e) {}
          }
          if (exportAudioCtx && audioDestNode) {
            try {
              autoCutSoundEngine.playOutroImpact(brand, false, exportAudioCtx, audioDestNode, outroStartTime);
            } catch (sfxErr) {
              console.warn('[AutoCutLabPlayer] Outro SFX mux warning:', sfxErr);
            }
          }

          let currentFrame = 0;
          const frameInterval = 1000 / fps;

          const renderTick = () => {
            try {
              currentFrame++;
              const tElapsed = currentFrame / fps;
              renderFrameToOffscreen(tElapsed);

              const pct = Math.min(100, Math.round((currentFrame / totalFrames) * 100));
              if (onProgress) onProgress(pct);

              if (currentFrame >= totalFrames) {
                // Buffer finale di 15 frame: continua a mantenere dipinto l'outro per sigillare il video senza troncamenti
                if (currentFrame >= totalFrames + 15) {
                  stopAllTimers();
                  if (recorder.state === 'recording') {
                    try {
                      recorder.stop();
                    } catch (stopErr) {
                      console.warn('[AutoCutLabPlayer] Recorder stop error:', stopErr);
                    }
                  }
                }
                return;
              }
            } catch (frameErr) {
              console.warn('[AutoCutLabPlayer] Frame rendering error tick:', frameErr);
            }
          };

          // Timer anti-throttling Web Worker (continua fluido a 30fps anche con tab in background o minimizzato)
          try {
            const workerCode = `
              var t = null;
              onmessage = function(e) {
                if (e.data === 'start') {
                  t = setInterval(function() { postMessage('tick'); }, ${Math.round(frameInterval)});
                } else if (e.data === 'stop') {
                  if (t) clearInterval(t);
                }
              };
            `;
            const blob = new Blob([workerCode], { type: 'application/javascript' });
            timerWorker = new Worker(URL.createObjectURL(blob));
            timerWorker.onmessage = renderTick;
            timerWorker.postMessage('start');
          } catch (workerErr) {
            renderLoopInterval = setInterval(renderTick, frameInterval);
          }
        });
      };
    }

    renderFrameRef.current = renderFrame;

    if (isPlaying) {
      animFrameRef.current = requestAnimationFrame(render);
    } else {
      // 📸 STATO INIZIALE STATICHE: Disegna subito il fotogramma corrente (se in pausa) o la thumbnail perfetta
      if (currentElapsedRef.current > 0) {
        renderFrame(currentElapsedRef.current);
      } else {
        renderFrame(thumbnailTimestamp);
      }
      // E quando le immagini completano il caricamento in memoria, ridisegna se ancora fermo
      loadedImages.forEach((img) => {
        if (!img.complete || img.naturalWidth === 0) {
          img.onload = () => {
            if (!isPlayingRef.current) {
              if (currentElapsedRef.current > 0) {
                renderFrame(currentElapsedRef.current);
              } else {
                renderFrame(thumbnailTimestamp);
              }
            }
          };
        }
      });
    }

    return () => {
      isCancelled = true;
      renderFrameRef.current = null;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [testRun, isPlaying]);

  const handleReplay = () => {
    if (testRun.isEmptyShowcase) return;
    currentElapsedRef.current = 0;
    startTimeRef.current = performance.now();
    hasPlayedOutroSfxRef.current = false;
    setIsEnded(false);
    setActiveSceneIndex(0);
    setProgress(0);
    if (audioRef.current) {
      audioRef.current.volume = 1.0;
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.log('Replay err:', e));
    }
    setIsPlaying(true);
    if (onReplay) onReplay();
  };

  const handleTogglePlay = () => {
    if (testRun.isEmptyShowcase) return;
    if (isEnded) {
      handleReplay();
      return;
    }
    const next = !isPlaying;
    if (next) {
      if (currentElapsedRef.current >= totalVideoDuration - 0.1) {
        currentElapsedRef.current = 0;
        setProgress(0);
      }
      startTimeRef.current = performance.now() - (currentElapsedRef.current * 1000);
      if (audioRef.current) {
        audioRef.current.volume = 1.0;
        audioRef.current.currentTime = Math.min(musicDuration, currentElapsedRef.current);
        audioRef.current.play().catch(e => console.log('Play err:', e));
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
    setIsPlaying(next);
  };

  const handleSeek = (targetSeconds: number) => {
    if (testRun.isEmptyShowcase) return;
    const clamped = Math.max(0, Math.min(totalVideoDuration, targetSeconds));
    currentElapsedRef.current = clamped;
    const newProgress = totalVideoDuration > 0 ? clamped / totalVideoDuration : 0;
    setProgress(newProgress);

    startTimeRef.current = performance.now() - (clamped * 1000);

    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(musicDuration, clamped);
    }

    if (clamped < outroStartTime) {
      hasPlayedOutroSfxRef.current = false;
    }

    if (clamped < totalVideoDuration && isEnded) {
      setIsEnded(false);
    }

    let sIdx = 0;
    for (let i = 0; i < sceneTimeline.length; i++) {
      if (clamped >= sceneTimeline[i].start && (clamped < sceneTimeline[i].end || i === sceneTimeline.length - 1)) {
        sIdx = i;
        break;
      }
    }
    setActiveSceneIndex(sIdx);

    renderFrameRef.current?.(clamped);
  };

  const handleStepBack = (step: number = 1.0) => {
    handleSeek(currentElapsedRef.current - step);
  };

  const handleStepForward = (step: number = 1.0) => {
    handleSeek(currentElapsedRef.current + step);
  };

  const handleJumpScene = (index: number) => {
    if (index < 0 || index >= sceneTimeline.length) return;
    handleSeek(sceneTimeline[index].start);
  };

  const handleJumpOutro = () => {
    handleSeek(outroStartTime);
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextMuted = !isAudioMuted;
    setIsAudioMuted(nextMuted);
    if (audioRef.current) {
      audioRef.current.muted = nextMuted;
    }
  };

  const currentScene = scenes[activeSceneIndex] || scenes[0];
  const currentElapsed = progress * totalVideoDuration;
  const isInOutro = currentElapsed >= outroStartTime;

  return (
    <div className="flex flex-col items-center w-full isolate">
      {/* 🎛️ STUDIO CONTROL BAR: 3 Controlli in Colonna Centrati a Piena Larghezza Telefono */}
      {!testRun.isEmptyShowcase && (
        <div className="w-full max-w-[340px] flex flex-col items-center gap-1.5 mb-2.5">
          {/* Riga 2 (dopo Genera Nuovo Video): Mode & Cinematica */}
          <div className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-amber-500/50 shadow-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-xs font-black text-amber-300 tracking-wide">
              {isInOutro ? 'Stamp Outro Reveal' : `${mode} · Pan & Zoom`}
            </span>
          </div>

          {/* Riga 3: Scene & Minuti/Secondi Live */}
          <div className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 shadow-md text-xs font-mono text-slate-200">
            <Layers className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="font-bold text-amber-300">
              {isInOutro ? 'OUTRO BRAND' : `SCENA ${activeSceneIndex + 1} / ${sceneCount}`}
            </span>
            <span className="text-slate-600">|</span>
            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-semibold text-slate-300">
              {currentElapsed.toFixed(1)}s / {totalVideoDuration.toFixed(0)}s
            </span>
          </div>

          {/* Riga 4: Titolo della Canzone (Audio Track & Mute) */}
          <button
            type="button"
            onClick={handleToggleMute}
            className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 hover:border-slate-500 text-xs font-mono text-white shadow-md transition cursor-pointer"
          >
            {isAudioMuted ? (
              <VolumeX className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse shrink-0" />
            )}
            <span className="font-semibold text-slate-200 tracking-wide truncate max-w-[280px]">
              {audioTrack.title}
            </span>
          </button>
        </div>
      )}

      {/* 📱 1. MASTER CANVAS 9:16 (TikTok & Instagram Reels - Viewport Rettangolare Puro 9:16) */}
      <div className="relative w-full max-w-[395px] aspect-[9/16] bg-black select-none overflow-hidden group shadow-2xl border-2 border-slate-800 rounded-none isolate">
        {/* Dynamic 9:16 AutoCut Canvas */}
        <canvas
          ref={canvasRef}
          width={720}
          height={1280}
          className="w-full h-full object-cover cursor-pointer"
          onClick={handleTogglePlay}
        />

        <style>{`
          @keyframes lastMinutePulse {
            0% { transform: scale(0.95); filter: brightness(0.95); }
            100% { transform: scale(1.08); filter: drop-shadow(0 0 6px rgba(254, 240, 138, 0.95)) brightness(1.15); }
          }
          @keyframes discountGlowPulse {
            0% {
              transform: scale(0.98);
              color: #fcd34d;
              filter: drop-shadow(0 0 1.5px rgba(250, 204, 21, 0.45));
            }
            50% {
              transform: scale(1.02);
              color: #fef9c3;
              filter: drop-shadow(0 0 4px rgba(250, 204, 21, 0.75)) drop-shadow(0 0 7px rgba(234, 179, 8, 0.4));
            }
            100% {
              transform: scale(0.98);
              color: #fcd34d;
              filter: drop-shadow(0 0 1.5px rgba(250, 204, 21, 0.45));
            }
          }
        `}</style>

      {/* ⚡ SCHERMATA ELEGANTE VETRINA DAILY SPECIAL VUOTA */}
      {mode === 'DS' && testRun.isEmptyShowcase && (
        <div className="absolute inset-0 z-40 bg-gradient-to-b from-stone-950 via-slate-950 to-stone-950 flex flex-col items-center justify-between p-6 text-center select-none">
          {/* Top Brand Pill */}
          <div className="pt-4 flex flex-col items-center">
            <img
              src={PIZZA_LOGO_512_BASE64}
              alt="Flower Power Pizza"
              className="w-14 h-14 object-contain drop-shadow-[0_0_20px_rgba(245,158,11,0.35)] mb-2.5"
            />
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/60 text-amber-300 text-[10px] font-black tracking-wider uppercase shadow-md whitespace-nowrap">
              <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
              <span>สดใหม่วันนี้ · DAILY SPECIAL</span>
            </span>
          </div>

          {/* Central Message Card */}
          <div className="w-full max-w-xs px-5 py-5 rounded-2xl bg-stone-900/80 border border-amber-500/30 backdrop-blur-md shadow-2xl flex flex-col items-center">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300 mb-3 shadow-inner">
              <Sparkles className="w-6 h-6 text-amber-300 animate-pulse" />
            </div>

            <h3 className="text-base font-black text-amber-300 leading-tight mb-0.5 tracking-tight">
              ไม่มีเมนูพิเศษในตู้โชว์วันนี้
            </h3>
            <p className="text-[11px] font-bold text-white/90 mb-3">
              No Daily Specials in Showcase Today
            </p>

            <p className="text-[11.5px] text-slate-300 leading-relaxed mb-4 text-center">
              Il format video <strong>DS (Daily Special)</strong> si genera in automatico solo quando sono presenti piatti attivi e disponibili nella vetrina del giorno.
            </p>

            {/* Checklist Regole Fondamentali */}
            <div className="w-full space-y-1.5 text-left bg-black/40 p-3 rounded-xl border border-white/5 text-[10.5px]">
              <div className="flex items-center gap-2 text-stone-300">
                <span className="text-emerald-400 font-bold shrink-0">✓</span>
                <span>Piatto fresco cucinato al momento</span>
              </div>
              <div className="flex items-center gap-2 text-stone-300">
                <span className="text-emerald-400 font-bold shrink-0">✓</span>
                <span>Pronta consegna rapida a Ranong</span>
              </div>
              <div className="flex items-center gap-2 text-stone-300">
                <span className="text-amber-400 font-bold shrink-0">⚡</span>
                <span>Zero piatti Sold Out (Kitchen Monitor)</span>
              </div>
            </div>
          </div>

          {/* Footer Hint */}
          <div className="pb-4 text-center">
            <span className="text-[10px] text-slate-500 font-mono">
              💡 Attiva o modifica i Daily Specials dalla console Admin o Kitchen Monitor
            </span>
          </div>
        </div>
      )}

      {/* 🎬 TACCHE DI PROGRESSIONE (Story Segments AutoCut con durate asimmetriche) */}
      {!testRun.isEmptyShowcase && scenes.length > 0 && (
        <div className="absolute top-3 left-3 right-3 z-30 flex items-center gap-1.5 pointer-events-none">
          {scenes.map((sc, idx) => {
            const scDur = sc.duration || sceneDuration;
            let segmentWidth = '0%';
            if (isInOutro || idx < activeSceneIndex) {
              segmentWidth = '100%';
            } else if (idx === activeSceneIndex) {
              let startTime = 0;
              for (let i = 0; i < idx; i++) {
                startTime += (scenes[i].duration || sceneDuration);
              }
              const localElapsed = Math.max(0, currentElapsed - startTime);
              const subRatio = Math.min(1, localElapsed / scDur);
              segmentWidth = `${subRatio * 100}%`;
            }

            return (
              <div
                key={idx}
                className="h-1.5 bg-white/20 rounded-full overflow-hidden backdrop-blur-xs"
                style={{ flex: `${scDur} 1 0px` }}
              >
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-rose-400 transition-all duration-75 ease-linear"
                  style={{ width: segmentWidth }}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Sfondo sfumato nero in alto (Top Vignette Fade ad alto contrasto per proteggere logo e testi contro qualsiasi sfondo) */}
      <div className={`absolute top-0 left-0 right-0 h-80 bg-gradient-to-b from-black/92 via-black/65 via-50% via-black/25 via-80% to-transparent pointer-events-none z-25 transition-opacity duration-300 ${
        isInOutro ? 'opacity-0' : 'opacity-100'
      }`} />

      {/* 👑 WATERMARK & HEADER UFFICIALE 9:16 (Logo +20% + testi) SEMPRE CENTRATO SULL'ASSE VERTICALE IN TUTTI I FORMATI */}
      {!isInOutro && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 w-max z-30 pointer-events-none transition-all duration-300">
          {/* ⚡ FORMATO DS DAILY SPECIAL */}
          {mode === 'DS' && (
            <div className="flex items-start gap-3">
              <img
                id="autoCutHeaderLogoImg"
                src={PIZZA_LOGO_512_BASE64}
                alt="Flower Power Pizza"
                className="w-[90px] h-[90px] object-contain drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)] shrink-0 mt-0.5"
              />
              <div className="flex-1 min-w-0 flex flex-col text-left drop-shadow-[0_3px_12px_rgba(0,0,0,0.85)]">
                <span className="text-[26px] sm:text-[27.5px] font-black text-white uppercase tracking-normal leading-none whitespace-nowrap font-['Outfit',sans-serif] [text-shadow:_0_0_12px_rgba(0,0,0,1),_0_2px_8px_rgba(0,0,0,1),_0_1px_3px_rgba(0,0,0,1)]">
                  FLOWER POWER
                </span>
                <span className="font-medium italic text-[#f87171] text-[25px] sm:text-[26.5px] capitalize tracking-normal leading-none whitespace-nowrap mt-1 font-['Outfit',sans-serif] [text-shadow:_0_0_10px_rgba(0,0,0,1)]">
                  Pizza
                </span>

                {/* Riga 2: LIVE SHOWCASE su una riga sola (allontanato di ulteriori 10px da pizza: mt-[15px]) */}
                <div className="mt-[15px]">
                  <span className={`inline-flex items-center px-3.5 py-1 rounded-lg border text-[14px] sm:text-[15px] font-black text-white tracking-wider uppercase shadow-[0_4px_16px_rgba(0,0,0,0.8)] whitespace-nowrap animate-pulse ${
                    currentScene?.isLiveShowcase
                      ? 'bg-gradient-to-r from-amber-500 via-rose-600 to-pink-600 border-yellow-200'
                      : 'bg-indigo-600 border-indigo-300'
                  }`}>
                    {currentScene?.isLiveShowcase ? 'LIVE SHOWCASE' : 'CHEF SPECIALS'}
                  </span>
                </div>

                {/* Riga 3: Fast Delivery Thai + English allontanato dal live showcase di ulteriori 10 pixel (totale 15px): mt-[15px] */}
                <span className="mt-[15px] text-[19px] sm:text-[21.5px] font-black text-amber-300 leading-tight whitespace-nowrap [text-shadow:_0_0_14px_rgba(0,0,0,1),_0_2px_10px_rgba(0,0,0,1),_0_1px_4px_rgba(0,0,0,1)]">
                  {currentScene?.isLiveShowcase ? 'สดใหม่ในตู้โชว์' : 'เมนูพิเศษประจำวัน'}
                </span>

                {/* Riga 4: Solo Fast Delivery più grosso con bagliore scuro (+20%) */}
                <span className="mt-1 text-[14px] sm:text-[16px] font-black text-emerald-400 tracking-wider uppercase whitespace-nowrap [text-shadow:_0_0_12px_rgba(0,0,0,1),_0_2px_8px_rgba(0,0,0,1),_0_1px_3px_rgba(0,0,0,1)]">
                  FAST DELIVERY
                </span>
              </div>
            </div>
          )}

          {/* 🍕 FORMATO PIZZA REGULAR (P1, P2, P3) */}
          {(mode === 'P1' || mode === 'P2' || mode === 'P3') && (
            <div className="flex items-start gap-3">
              <img
                id="autoCutHeaderLogoImg"
                src={PIZZA_LOGO_512_BASE64}
                alt="Flower Power Pizza"
                className="w-[90px] h-[90px] object-contain drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)] shrink-0 mt-0.5"
              />
              <div className="flex-1 min-w-0 flex flex-col text-left gap-0.5 drop-shadow-[0_3px_12px_rgba(0,0,0,0.85)]">
                <span className="text-[26px] sm:text-[27.5px] font-black text-white uppercase tracking-normal leading-none whitespace-nowrap font-['Outfit',sans-serif] [text-shadow:_0_0_12px_rgba(0,0,0,1),_0_2px_8px_rgba(0,0,0,1),_0_1px_3px_rgba(0,0,0,1)]">
                  FLOWER POWER
                </span>
                <span className="font-medium italic text-[#f87171] text-[25px] sm:text-[26.5px] capitalize tracking-normal leading-none whitespace-nowrap mt-1 font-['Outfit',sans-serif] [text-shadow:_0_0_10px_rgba(0,0,0,1)]">
                  Pizza
                </span>
                {/* Ranong Delivery sopra (+10%, distanziato di +4px dalla parola Pizza: pt-2) */}
                <span className="text-[18.5px] sm:text-[21px] font-black text-amber-300 uppercase tracking-wide leading-tight whitespace-nowrap pt-2 [text-shadow:_0_0_12px_rgba(0,0,0,1),_0_2px_10px_rgba(0,0,0,1),_0_1px_3px_rgba(0,0,0,1)]">
                  Ranong Delivery
                </span>
                {/* Scritta Thai sotto (+10%) ben visibile con bagliore scuro */}
                <span className="text-[21px] sm:text-[23.5px] font-black text-amber-200 leading-tight whitespace-nowrap [text-shadow:_0_0_14px_rgba(0,0,0,1),_0_2px_12px_rgba(0,0,0,1),_0_1px_4px_rgba(0,0,0,1)]">
                  ส่งถึงบ้าน
                </span>
                {/* flowerpowerpizza.com (+10%, distanziato in blocco di +4px da ส่งถึงบ้าน: pt-1) */}
                <span className="text-[15.5px] sm:text-[17px] font-semibold text-white/95 leading-tight whitespace-nowrap pt-1 [text-shadow:_0_0_10px_rgba(0,0,0,1),_0_2px_6px_rgba(0,0,0,1),_0_1px_2px_rgba(0,0,0,1)]">
                  flowerpowerpizza.com
                </span>
                {/* Link in bio sotto (+10%) */}
                <span className="mt-0.5 text-[15.5px] sm:text-[16.5px] font-bold text-amber-300/90 leading-tight whitespace-nowrap [text-shadow:_0_0_10px_rgba(0,0,0,1),_0_2px_6px_rgba(0,0,0,1),_0_1px_2px_rgba(0,0,0,1)]">
                  Link in Bio
                </span>
              </div>
            </div>
          )}

          {/* 🍽️ FORMATO R1 RESTAURANT & DELIVERY (Koh Phayam) */}
          {mode === 'R1' && (
            <div className="flex items-start gap-3">
              <img
                id="autoCutHeaderLogoImg"
                src={VILLAGE_LOGO_512_BASE64}
                alt="Flower Power Village"
                className="w-[90px] h-[90px] object-contain drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)] shrink-0 mt-0.5"
              />
              <div className="shrink-0 flex flex-col text-left gap-0.5 drop-shadow-[0_3px_12px_rgba(0,0,0,0.85)]">
                <span className="text-[26px] sm:text-[27.5px] font-black text-white uppercase tracking-normal leading-none whitespace-nowrap font-['Outfit',sans-serif] [text-shadow:_0_0_12px_rgba(0,0,0,1),_0_2px_8px_rgba(0,0,0,1),_0_1px_3px_rgba(0,0,0,1)]">
                  FLOWER POWER
                </span>
                <span className="font-medium italic text-[#34d399] text-[25px] sm:text-[26.5px] capitalize tracking-normal leading-none whitespace-nowrap mt-1 font-['Outfit',sans-serif] [text-shadow:_0_0_10px_rgba(0,0,0,1)]">
                  Village
                </span>
                {/* DELIVERY lampeggiante con emoji moto 🛵 - distacco +5px totali da Village */}
                <div className="flex flex-col items-start pt-[13px] leading-none">
                  <span
                    className="font-['Outfit',sans-serif] text-[22px] sm:text-[23.5px] font-black uppercase tracking-wider text-[#ef4444] whitespace-nowrap leading-none animate-pulse inline-flex items-center gap-1.5"
                    style={{
                      filter: 'drop-shadow(1px 0 0 #ffffff) drop-shadow(-1px 0 0 #ffffff) drop-shadow(0 1px 0 #ffffff) drop-shadow(0 -1px 0 #ffffff) drop-shadow(0 2px 4px rgba(0,0,0,0.95))'
                    }}
                  >
                    DELIVERY <span className="text-[20px] sm:text-[22px] not-italic drop-shadow-none">🛵</span>
                  </span>
                  <span className="font-['Prompt',sans-serif] text-[17.5px] sm:text-[19px] font-extrabold tracking-normal text-white drop-shadow-[0_2px_4px_rgba(0,0,0,1)] whitespace-nowrap leading-none mt-1.5 pt-0.5">
                    เดลิเวอรี่
                  </span>
                </div>
                {/* Sotto numero telefono verde con icona WhatsApp e LINE Ufficiale (+20% ingranditi e nitidi) */}
                <div className="flex items-center gap-1.5 text-[17.5px] sm:text-[18.5px] font-black text-[#25D366] font-['Outfit',sans-serif] whitespace-nowrap [text-shadow:_0_0_12px_rgba(0,0,0,1),_0_2px_8px_rgba(0,0,0,1),_0_1px_3px_rgba(0,0,0,1)] mt-1.5">
                  <span className="inline-flex items-center justify-center w-[25px] h-[25px] sm:w-[27px] sm:h-[27px] rounded-full bg-[#25D366] shrink-0 shadow-md">
                    <svg className="w-[15.5px] h-[15.5px] sm:w-[17px] sm:h-[17px] fill-white" viewBox="0 0 24 24">
                      <path d={WA_PHONE_PATH_DATA} />
                    </svg>
                  </span>
                  <span className="inline-flex items-center justify-center w-[25px] h-[25px] sm:w-[27px] sm:h-[27px] rounded-full bg-[#06C755] shrink-0 shadow-md">
                    <svg className="w-[17px] h-[17px] sm:w-[18.5px] sm:h-[18.5px] fill-white" viewBox="0 0 24 24">
                      <path d={LINE_ICON_PATH_DATA} />
                    </svg>
                  </span>
                  <span>+66 095 882 5573</span>
                </div>
                {/* Koh Phayam bianca subito sotto a WhatsApp con font Outfit (+10%) */}
                <span className="text-[15.5px] sm:text-[16.5px] font-bold text-white tracking-wide whitespace-nowrap font-['Outfit',sans-serif] [text-shadow:_0_0_12px_rgba(0,0,0,1),_0_2px_8px_rgba(0,0,0,1),_0_1px_3px_rgba(0,0,0,1)]">
                  Koh Phayam
                </span>
              </div>
            </div>
          )}

          {/* 🔥 FORMATO LM1 STORIES LAST MINUTE (Koh Phayam) */}
          {mode === 'LM1' && (
            <div className="flex items-start gap-3">
              <img
                id="autoCutHeaderLogoImg"
                src={VILLAGE_LOGO_512_BASE64}
                alt="Flower Power Village"
                className="w-[90px] h-[90px] object-contain drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)] shrink-0 mt-0.5"
              />
              <div className="flex-1 min-w-0 flex flex-col text-left gap-0.5 drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
                <span className="text-[26px] sm:text-[27.5px] font-black text-white uppercase tracking-normal leading-none whitespace-nowrap font-['Outfit',sans-serif] [text-shadow:_0_2px_4px_rgba(0,0,0,1),_0_0_10px_rgba(0,0,0,1),_0_0_20px_rgba(0,0,0,0.95),_1px_1px_2px_rgba(0,0,0,1)]">
                  FLOWER POWER
                </span>
                <span className="font-medium italic text-[#34d399] text-[25px] sm:text-[26.5px] capitalize tracking-normal leading-none whitespace-nowrap mt-1 font-['Outfit',sans-serif] [text-shadow:_0_2px_4px_rgba(0,0,0,1),_0_0_10px_rgba(0,0,0,1),_0_0_20px_rgba(0,0,0,0.95),_1px_1px_2px_rgba(0,0,0,1)]">
                  Village
                </span>
                {/* Last minute su una sola riga con pallino rosso scintillante e testo pulsante - salito di 2px (pt-[8px]) e ingrandito del 10% */}
                <div className="pt-[8px]">
                  <span className="inline-flex items-center gap-2.5 px-4 py-[7px] rounded-lg bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-stone-950 font-black shadow-[0_3px_8px_rgba(0,0,0,0.45)] tracking-wider border border-yellow-200/90 whitespace-nowrap">
                    {/* 💎 🔴 Pallino rosso luccicante con bagliore e stella di diamante rotante (+10%) */}
                    <span className="relative flex items-center justify-center h-4 w-4 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-80" />
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-gradient-to-br from-rose-500 via-red-600 to-rose-700 shadow-[0_0_12px_#ef4444,_0_0_24px_#dc2626] border border-rose-300/80" />
                      <span className="absolute top-[2px] left-[2px] w-1 h-1 rounded-full bg-white shadow-[0_0_4px_#ffffff]" />
                      {/* Stella di diamante che ruota e luccica */}
                      <svg
                        className="absolute w-4 h-4 text-white drop-shadow-[0_0_5px_#ffffff] animate-[spin_3.5s_linear_infinite]"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 0L13.8 8.5L24 12L13.8 15.5L12 24L10.2 15.5L0 12L10.2 8.5L12 0Z" />
                      </svg>
                    </span>
                    {/* 🔥 Scritta LAST MINUTE che pulsa in modo molto visibile (+10%: 14.5px / 15.5px) */}
                    <span
                      className="font-black text-[14.5px] sm:text-[15.5px] tracking-widest uppercase text-stone-950 inline-block font-['Outfit',sans-serif]"
                      style={{
                        animation: 'lastMinutePulse 1.1s ease-in-out infinite alternate',
                        textShadow: '0 0 1px #000000, 0 1px 3px rgba(254, 240, 138, 0.9)'
                      }}
                    >
                      LAST MINUTE
                    </span>
                  </span>
                </div>
                {/* Sotto la scritta in Thai allontanata di +3px (mt-[7px]) con ombra scura profonda (+10%: text-[17.5px] sm:text-[20px]) */}
                <span className="mt-[7px] text-[17.5px] sm:text-[20px] font-black text-amber-300 leading-tight whitespace-nowrap [text-shadow:_0_2px_4px_rgba(0,0,0,1),_0_0_10px_rgba(0,0,0,1),_0_0_20px_rgba(0,0,0,0.95),_1px_1px_2px_rgba(0,0,0,1)]">
                  ห้องว่างวันนี้
                </span>
                {/* Sotto DIRECT BOOKING distanziata 5px ulteriori (totale 10px) dalla scritta Thai sopra (+10%: text-[20.5px] sm:text-[23px]) */}
                <span className="text-[20.5px] sm:text-[23px] font-black text-emerald-300 uppercase tracking-wide leading-tight whitespace-nowrap mt-[10px] [text-shadow:_0_2px_4px_rgba(0,0,0,1),_0_0_10px_rgba(0,0,0,1),_0_0_20px_rgba(0,0,0,0.95),_1px_1px_2px_rgba(0,0,0,1)]">
                  DIRECT BOOKING
                </span>
                {/* Sotto DIRECT BOOKING: 10% OFF con bagliore dorato lampeggiante continuo */}
                <span
                  className="text-[17px] sm:text-[19px] font-black uppercase tracking-wider leading-tight whitespace-nowrap mt-[1px] inline-block origin-left font-['Outfit',sans-serif]"
                  style={{
                    animation: 'discountGlowPulse 1.1s ease-in-out infinite alternate',
                    textShadow: '0 2px 4px rgba(0,0,0,1), 0 0 10px rgba(0,0,0,1), 0 0 20px rgba(0,0,0,0.95), 1px 1px 2px rgba(0,0,0,1)'
                  }}
                >
                  10% OFF
                </span>
                {/* Sotto flowerpowervillage.com distanziata esattamente 7px dalla scritta sopra (+10%: text-[15.5px] sm:text-[17px]) */}
                <span className="text-[15.5px] sm:text-[17px] font-semibold text-white/95 leading-tight whitespace-nowrap mt-[7px] [text-shadow:_0_2px_4px_rgba(0,0,0,1),_0_0_10px_rgba(0,0,0,1),_0_0_20px_rgba(0,0,0,0.95),_1px_1px_2px_rgba(0,0,0,1)]">
                  flowerpowervillage.com
                </span>
              </div>
            </div>
          )}

          {/* 🌴 FORMATO VILLAGE REGULAR (V1, V2, V3) */}
          {(mode === 'V1' || mode === 'V2' || mode === 'V3') && (
            <div className="flex items-start gap-3">
              <img
                id="autoCutHeaderLogoImg"
                src={VILLAGE_LOGO_512_BASE64}
                alt="Flower Power Village"
                className="w-[90px] h-[90px] object-contain drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)] shrink-0 mt-0.5"
              />
              <div className="flex-1 min-w-0 flex flex-col text-left gap-0.5 drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
                <span className="text-[26px] sm:text-[27.5px] font-black text-white uppercase tracking-normal leading-none whitespace-nowrap font-['Outfit',sans-serif] [text-shadow:_0_2px_4px_rgba(0,0,0,1),_0_0_10px_rgba(0,0,0,1),_0_0_20px_rgba(0,0,0,0.95),_1px_1px_2px_rgba(0,0,0,1)]">
                  FLOWER POWER
                </span>
                <span className="font-medium italic text-[#34d399] text-[25px] sm:text-[26.5px] capitalize tracking-normal leading-none whitespace-nowrap mt-1 font-['Outfit',sans-serif] [text-shadow:_0_2px_4px_rgba(0,0,0,1),_0_0_10px_rgba(0,0,0,1),_0_0_20px_rgba(0,0,0,0.95),_1px_1px_2px_rgba(0,0,0,1)]">
                  Village
                </span>
                {/* DIRECT BOOKING (spostato in basso di 3px rispetto a Village: pt-1.5 mt-[5px], ingrandito del 10%) */}
                <span className="text-[20.5px] sm:text-[23px] font-black text-emerald-300 uppercase tracking-wide leading-tight whitespace-nowrap pt-1.5 mt-[5px] [text-shadow:_0_2px_4px_rgba(0,0,0,1),_0_0_10px_rgba(0,0,0,1),_0_0_20px_rgba(0,0,0,0.95),_1px_1px_2px_rgba(0,0,0,1)]">
                  DIRECT BOOKING
                </span>
                {/* Sotto DIRECT BOOKING: 10% OFF con bagliore dorato lampeggiante continuo (+10%) */}
                <span
                  className="text-[17px] sm:text-[19.5px] font-black uppercase tracking-wider leading-tight whitespace-nowrap mt-0 inline-block origin-left font-['Outfit',sans-serif]"
                  style={{
                    animation: 'discountGlowPulse 1.1s ease-in-out infinite alternate',
                    textShadow: '0 2px 4px rgba(0,0,0,1), 0 0 10px rgba(0,0,0,1), 0 0 20px rgba(0,0,0,0.95), 1px 1px 2px rgba(0,0,0,1)'
                  }}
                >
                  10% OFF
                </span>
                {/* Blocco unico flowerpowervillage.com + Link in Bio distanziato da 10% OFF: mt-1.5, con Link in Bio distanziato 4px in più (gap-[6px]) (+10%) */}
                <div className="flex flex-col gap-[6px] mt-1.5">
                  <span className="text-[15.5px] sm:text-[17px] font-semibold text-white/95 leading-tight whitespace-nowrap [text-shadow:_0_2px_4px_rgba(0,0,0,1),_0_0_10px_rgba(0,0,0,1),_0_0_20px_rgba(0,0,0,0.95),_1px_1px_2px_rgba(0,0,0,1)]">
                    flowerpowervillage.com
                  </span>
                  <span className="text-[15.5px] sm:text-[16.5px] font-bold text-amber-300/90 leading-tight whitespace-nowrap [text-shadow:_0_2px_4px_rgba(0,0,0,1),_0_0_10px_rgba(0,0,0,1),_0_0_20px_rgba(0,0,0,0.95),_1px_1px_2px_rgba(0,0,0,1)]">
                    Link in Bio
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sfondo sfumato nero in basso (Bottom Vignette Fade cinematografica profonda: protegge categoria, titoli bilingui e prezzo con ombra nera continua) */}
      <div className={`absolute bottom-0 left-0 right-0 h-[520px] bg-gradient-to-t from-black/95 via-black/85 via-45% via-black/55 via-72% via-black/25 via-88% to-transparent pointer-events-none z-25 transition-opacity duration-300 ${
        isInOutro ? 'opacity-0' : 'opacity-100'
      }`} />

      {/* 🏷️ GERARCHIA TIPOGRAFICA RIGOROSA (SAFE ZONE IN BASSO PROPORZIONATA - ALZATA A 65px PER LE PIZZE) */}
      {!testRun.isEmptyShowcase && currentScene && (
        <div className={`absolute left-[25px] right-[25px] z-30 flex flex-col items-start text-left pointer-events-none transition-all duration-500 ${
          (currentScene.pizzaSizes && mode !== 'R1') ? 'bottom-[65px]' : 'bottom-[47px]'
        } ${
          isInOutro ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
        }`}>
          
          {/* Caso CIBO / PIATTI (Pizzeria e R1 Restaurant): Categoria Bilingue (Thai sopra, Eng sotto), Titoli +20%, Prezzo */}
          {(mode === 'P1' || mode === 'P2' || mode === 'P3' || mode === 'DS' || mode === 'R1') && (
            <div className="w-full">
              {currentScene.badgeCategory && (
                <div className="flex flex-col items-start gap-0.5 mb-4">
                  <div className="inline-flex items-center gap-1.5 text-[15.5px] sm:text-[17.5px] font-black tracking-wide text-amber-300 drop-shadow-[0_2px_8px_rgba(0,0,0,1)] whitespace-nowrap">
                    <span className="text-[#dc2626] font-black text-[16px] drop-shadow-[0_0_8px_rgba(220,38,38,0.95)] [text-shadow:_0_2px_4px_rgba(0,0,0,1)]">✦</span>
                    <span className="font-['Prompt',sans-serif] [text-shadow:_0_2px_4px_rgba(0,0,0,1),_0_0_10px_rgba(0,0,0,1),_0_0_20px_rgba(0,0,0,0.95),_1px_1px_2px_rgba(0,0,0,1)]">
                      {(() => {
                        if (mode === 'DS') {
                          return currentScene.isLiveShowcase ? 'สดใหม่ในตู้โชว์วันนี้' : 'เมนูพิเศษวันนี้';
                        }
                        let catThai = currentScene.badgeCategoryTh || getCategoryThaiName(currentScene.badgeCategory);
                        if (catThai.includes(' · ')) {
                          const parts = catThai.split(' · ');
                          const thPart = parts.find(p => /[\u0E00-\u0E7F]/.test(p));
                          if (thPart) catThai = thPart.trim();
                        }
                        return catThai;
                      })()}
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-[12.5px] sm:text-[14px] font-black tracking-widest uppercase text-white/95 drop-shadow-[0_2px_6px_rgba(0,0,0,1)] whitespace-nowrap font-['Outfit',sans-serif] [text-shadow:_0_2px_4px_rgba(0,0,0,1),_0_0_10px_rgba(0,0,0,1),_0_0_20px_rgba(0,0,0,0.95),_1px_1px_2px_rgba(0,0,0,1)]">
                    <span className="text-[#dc2626] font-black text-[16px] drop-shadow-[0_0_8px_rgba(220,38,38,0.95)] [text-shadow:_0_2px_4px_rgba(0,0,0,1)]">✦</span>
                    <span>
                      {(() => {
                        if (mode === 'DS') {
                          return currentScene.isLiveShowcase ? 'FRESH IN SHOWCASE TODAY' : 'CHEF DAILY SPECIAL';
                        }
                        let catClean = currentScene.badgeCategory.replace(/^[✦⭐✨\s*]+/, '').trim();
                        if (catClean.includes(' · ')) {
                          const parts = catClean.split(' · ');
                          const enPart = parts.find(p => !/[\u0E00-\u0E7F]/.test(p));
                          if (enPart) catClean = enPart.trim();
                        }
                        catClean = catClean.replace(/[\u0E00-\u0E7F]/g, '').trim().toUpperCase();
                        return catClean;
                      })()}
                    </span>
                  </div>
                </div>
              )}
              
              {/* THAI IN GRANDE SOPRA (REGOLA ASSOLUTA: MASSIMO 2 RIGHE, MAI ANDARE A CAPO A 3 RIGHE) */}
              {(() => {
                const thaiLines = currentScene.titlePrimary.split('\n').filter(Boolean);
                const maxLineLen = Math.max(...thaiLines.map(l => l.length), 0);
                const thaiSizeClass = maxLineLen > 24
                  ? 'text-[18.5px] sm:text-[21.5px]'
                  : maxLineLen > 20
                  ? 'text-[20.5px] sm:text-[24px]'
                  : 'text-[24px] sm:text-[29px]';
                return (
                  <h3 className={`font-['Prompt',sans-serif] ${thaiSizeClass} font-black text-amber-300 leading-tight mt-1 [text-shadow:_0_2px_4px_rgba(0,0,0,1),_0_0_12px_rgba(0,0,0,1),_0_0_24px_rgba(0,0,0,0.95),_1px_1px_3px_rgba(0,0,0,1)] drop-shadow-[0_4px_12px_rgba(0,0,0,1)]`}>
                    {thaiLines.map((line, idx) => (
                      <span key={idx} className="block leading-tight whitespace-nowrap">
                        {line}
                      </span>
                    ))}
                  </h3>
                );
              })()}

              {/* INGLESE SOTTO (+20%: text-[17.5px] sm:text-[20px]) */}
              <div className="font-['Outfit',sans-serif] text-[17.5px] sm:text-[20px] font-bold text-white/95 leading-snug mt-1 [text-shadow:_0_2px_4px_rgba(0,0,0,1),_0_0_12px_rgba(0,0,0,1),_0_0_20px_rgba(0,0,0,0.95),_1px_1px_3px_rgba(0,0,0,1)] drop-shadow-[0_3px_8px_rgba(0,0,0,1)]">
                {currentScene.titleSecondary.split('\n').map((line, idx) => (
                  <span key={idx} className="block leading-snug whitespace-nowrap">
                    {line}
                  </span>
                ))}
              </div>

              {/* PREZZO PIATTO / PIZZE 8" E 12" (SCALA PIENA +20%, BORDI RETTANGOLO ADERENTI - distacco alzato di +10px a pt-5) */}
              {/* Box Prezzo (+20%) + BADGE PROMO A DESTRA */}
              <div className="pt-4 w-full flex items-center justify-between gap-3">
                <div className="shrink-0">
                  {currentScene.pizzaSizes && mode !== 'R1' ? (
                    <div className="flex flex-col items-start gap-1.5">
                      <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#FFE500] border-2 border-black shadow-[2px_2px_0px_#000000] text-black w-fit">
                        <span className="font-['Kanit',sans-serif] text-[15px] sm:text-[16.5px] font-black bg-black text-white px-2 py-0.5 rounded-[3px] leading-none tracking-tight">8"</span>
                        <span
                          className="font-['Kanit',sans-serif] text-[24px] sm:text-[26.5px] font-black leading-none tracking-tight"
                          style={{ paintOrder: 'stroke fill', WebkitTextStroke: '3.5px #ffffff' }}
                        >
                          {currentScene.pizzaSizes.size8Price}฿
                        </span>
                      </div>
                      <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#FFE500] border-2 border-black shadow-[2px_2px_0px_#000000] text-black w-fit">
                        <span className="font-['Kanit',sans-serif] text-[15px] sm:text-[16.5px] font-black bg-black text-white px-2 py-0.5 rounded-[3px] leading-none tracking-tight">12"</span>
                        <span
                          className="font-['Kanit',sans-serif] text-[24px] sm:text-[26.5px] font-black leading-none tracking-tight"
                          style={{ paintOrder: 'stroke fill', WebkitTextStroke: '3.5px #ffffff' }}
                        >
                          {currentScene.pizzaSizes.size12Price}฿
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="inline-flex items-center px-3.5 py-1.5 rounded-md bg-[#FFE500] border-2 border-black shadow-[2px_2px_0px_#000000] text-black">
                      <span
                        className="font-['Kanit',sans-serif] text-[31.5px] sm:text-[34px] font-black leading-none tracking-tight"
                        style={{ paintOrder: 'stroke fill', WebkitTextStroke: '4.2px #ffffff' }}
                      >
                        {currentScene.priceLabel ? currentScene.priceLabel.replace(/\bTHB\b/g, '฿').replace(/\s*฿/g, '฿') : ''}
                      </span>
                    </div>
                  )}
                </div>

                {/* 🏷️ BADGE PROMO BILINGUE A DESTRA DEL PREZZO (Adattivo, Centrato, Gradiente Brillante) */}
                {(mode === 'P1' || mode === 'P2' || mode === 'P3' || mode === 'DS') && (
                  <div className={`shrink-0 rounded-lg border-2 border-yellow-200 bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 shadow-[0_4px_16px_rgba(225,29,72,0.65)] flex flex-col items-center justify-center text-center ${
                    currentScene.pizzaSizes
                      ? 'px-2.5 py-1.5'
                      : 'px-2 py-1'
                  }`}>
                    <div className="flex items-center justify-center gap-1 font-['Prompt',sans-serif] font-black text-amber-200 leading-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)] whitespace-nowrap text-[11px] sm:text-[11.5px]">
                      <span>🛵 ส่งฟรี 300฿+</span>
                      <span className="text-white/80 font-normal">·</span>
                      <span className="text-yellow-100">🏷️ ลด 10%</span>
                    </div>
                    <div className="font-['Outfit',sans-serif] font-extrabold text-white tracking-wide uppercase leading-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)] mt-0.5 whitespace-nowrap text-[8.5px] sm:text-[9.5px]">
                      Free Delivery 300฿+ · 1st Order -10%
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Caso ALLOGGI (V1, V2, V3, LM1): Titolo Bungalow e Sottotitolo Giallo Ingranditi +20% con distacco extra 3px */}
          {(mode === 'V1' || mode === 'V2' || mode === 'V3' || mode === 'LM1') && (
            <div className="space-y-2.5 w-full">
              {/* INGLESE STRUTTURATO SEMANTICO (+20% con distacco +3px) */}
              <div className="leading-tight [text-shadow:_0_2px_4px_rgba(0,0,0,1),_0_0_12px_rgba(0,0,0,1),_0_0_24px_rgba(0,0,0,0.95),_1px_1px_3px_rgba(0,0,0,1)] drop-shadow-[0_4px_12px_rgba(0,0,0,1)]">
                {currentScene.lodgingTitle ? (
                  <>
                    <h3 className="text-[21.5px] sm:text-[24px] font-black text-white leading-tight mb-[3px]">
                      {currentScene.lodgingTitle}
                    </h3>
                    {currentScene.lodgingSubtitle && (
                      <p className="text-[17px] sm:text-[18.5px] font-bold text-amber-300 leading-tight mt-[3px]">
                        {currentScene.lodgingSubtitle}
                      </p>
                    )}
                  </>
                ) : (
                  <h3 className="text-[21.5px] sm:text-[24px] font-black text-white leading-tight mb-[3px]">
                    {currentScene.titlePrimary}
                  </h3>
                )}
              </div>

              {/* THAI SECCO SOTTO (+20% con distacco +3px) */}
              <p className="text-sm sm:text-[14.5px] font-semibold text-stone-200/95 leading-snug [text-shadow:_0_2px_4px_rgba(0,0,0,1),_0_0_10px_rgba(0,0,0,1),_0_0_20px_rgba(0,0,0,0.95),_1px_1px_2px_rgba(0,0,0,1)] drop-shadow-[0_2px_8px_rgba(0,0,0,1)] pt-[3px]">
                {currentScene.titleSecondary}
              </p>

              {/* PREZZO OCTORATE LAST MINUTE: SOLO IN LM1 (+20% con distacco +3px) */}
              {mode === 'LM1' && (
                <div className="pt-2 origin-left w-fit">
                  <div className="inline-flex items-center px-3.5 py-1.5 rounded-md bg-[#FFE500] border-2 border-black shadow-[2px_2px_0px_#000000] text-black">
                    <span
                      className="font-['Kanit',sans-serif] text-[25px] sm:text-[27.5px] font-black leading-none tracking-tight"
                      style={{ paintOrder: 'stroke fill', WebkitTextStroke: '3.5px #ffffff' }}
                    >
                      {currentScene.priceLabel ? currentScene.priceLabel.replace(/^Today\s+/i, '').replace(/\bTHB\b/g, '฿').replace(/\s*฿/g, '฿') : ''}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* Overlay Play al centro quando il video è in pausa prima di avviare (zero sfocatura sulla thumbnail) */}
      {!isPlaying && !isEnded && !testRun.isEmptyShowcase && (
        <div
          onClick={handleTogglePlay}
          className="absolute inset-0 z-35 bg-black/20 flex flex-col items-center justify-center gap-3 cursor-pointer transition-opacity group"
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-amber-500 to-rose-600 text-white flex items-center justify-center shadow-[0_10px_35px_rgba(0,0,0,0.8)] pl-1 group-hover:scale-110 transition-transform border border-white/30">
            <Play className="w-8 h-8 fill-white" />
          </div>
          <span className="text-xs font-bold text-white drop-shadow tracking-wide bg-black/60 px-3.5 py-1 rounded-full border border-white/10">
            Tap to Play · แตะเพื่อเล่น
          </span>
        </div>
      )}

      {/* Overlay Replay al termine del video posizionato sopra la thumbnail ufficiale nitidissima (zero sfocatura) */}
      {isEnded && !testRun.isEmptyShowcase && (
        <div
          onClick={handleReplay}
          className="absolute inset-0 z-40 bg-black/20 flex flex-col items-center justify-center gap-3 cursor-pointer transition-opacity group"
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-amber-500 via-rose-600 to-pink-600 text-white flex items-center justify-center shadow-[0_10px_35px_rgba(0,0,0,0.8)] pl-1 group-hover:scale-110 transition-transform border border-white/30">
            <Play className="w-8 h-8 fill-white" />
          </div>
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/75 border border-white/20 text-white text-xs font-bold shadow-xl">
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>Replay Video · เล่นซ้ำ</span>
          </div>
        </div>
      )}
      </div>

      {/* ⏱️ TIMELINE & CONTROLLI SCRUBBER AUTO-CUT LAB (Dashboard Player Console) */}
      {!testRun.isEmptyShowcase && (
        <div className="w-full max-w-[395px] mt-3.5 p-3 rounded-2xl bg-slate-950/95 border border-slate-800 shadow-[0_12px_36px_rgba(0,0,0,0.65)] backdrop-blur-md flex flex-col gap-2.5 isolate select-none">
          {/* Header Timeline: Scena Attiva & Tempo Live */}
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className={`w-2 h-2 rounded-full shrink-0 ${
                isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`} />
              <span className="font-bold text-slate-200 truncate">
                {isInOutro ? (
                  <span className="text-amber-400">OUTRO BRAND &amp; QR</span>
                ) : (
                  <span>
                    <span className="text-amber-400 font-bold">SCENA {activeSceneIndex + 1}/{sceneCount}</span>
                    {currentScene?.titlePrimary && (
                      <span className="text-slate-400 font-normal ml-1 truncate">
                        · {currentScene.titlePrimary}
                      </span>
                    )}
                  </span>
                )}
              </span>
            </div>

            {/* Tempo trascorso / Totale */}
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/60 border border-slate-700/70 text-slate-300 font-semibold shrink-0">
              <Clock className="w-3 h-3 text-amber-400" />
              <span className="text-amber-300">{currentElapsed.toFixed(1)}s</span>
              <span className="text-slate-500">/</span>
              <span>{totalVideoDuration.toFixed(1)}s</span>
            </div>
          </div>

          {/* Scrubber Range Bar con Scene Markers */}
          <div className="relative w-full flex flex-col justify-center pt-1 pb-0.5 group">
            {/* Background Track con markers delle scene */}
            <div className="relative w-full h-2 rounded-full bg-slate-800 overflow-hidden cursor-pointer">
              {/* Barra di riempimento colorata */}
              <div
                className={`h-full transition-all duration-75 ${
                  brand === 'pizza'
                    ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-pink-500'
                    : 'bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, progress * 100))}%` }}
              />
            </div>

            {/* Marcatori verticali di inizio scena e outro posizionati sopra il track */}
            <div className="absolute inset-x-0 h-2 top-1 pointer-events-none flex items-center">
              {sceneTimeline.map((item, idx) => {
                if (idx === 0) return null;
                const leftPercent = (item.start / totalVideoDuration) * 100;
                return (
                  <div
                    key={`marker-${idx}`}
                    className="absolute top-0 bottom-0 w-[2px] bg-slate-950/90 shadow-[0_0_2px_rgba(255,255,255,0.4)]"
                    style={{ left: `${leftPercent}%` }}
                    title={`Scena ${idx + 1}`}
                  />
                );
              })}
              {/* Outro Marker */}
              <div
                className="absolute top-0 bottom-0 w-[2px] bg-amber-400/90 shadow-[0_0_4px_rgba(251,191,36,0.8)]"
                style={{ left: `${(outroStartTime / totalVideoDuration) * 100}%` }}
                title="Outro Brand"
              />
            </div>

            {/* Slider reale input range trasparente sovrapposto */}
            <input
              type="range"
              min={0}
              max={totalVideoDuration}
              step={0.05}
              value={Math.min(totalVideoDuration, currentElapsed)}
              onChange={(e) => handleSeek(parseFloat(e.target.value))}
              aria-label="Timeline scrubber"
              className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-10"
            />
          </div>

          {/* Bottoni di Navigazione: Replay, -1s, Play/Pause grande, +1s, Outro */}
          <div className="flex items-center justify-between pt-1">
            {/* Gruppo Sinistra: Replay & Indietro -1s */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleReplay}
                title="Riavvolgi all'inizio (0s)"
                className="p-2 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-slate-500 text-slate-300 hover:text-white transition active:scale-95 shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-300" />
              </button>

              <button
                type="button"
                onClick={() => handleStepBack(1.0)}
                title="Indietro 1 secondo (-1s)"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-amber-500/60 text-slate-200 hover:text-amber-300 transition active:scale-95 shadow-sm text-xs font-mono font-bold"
              >
                <SkipBack className="w-3.5 h-3.5" />
                <span>-1s</span>
              </button>
            </div>

            {/* Centro: Play / Pause Primario */}
            <button
              type="button"
              onClick={handleTogglePlay}
              title={isPlaying ? 'Metti in Pausa' : 'Riproduci'}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-lg active:scale-95 border ${
                isPlaying
                  ? 'bg-gradient-to-r from-amber-500 to-rose-600 border-amber-300 text-white shadow-amber-950/60'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-600 border-emerald-300 text-white shadow-emerald-950/60 pl-0.5'
              }`}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-white" />
              ) : (
                <Play className="w-5 h-5 fill-white" />
              )}
            </button>

            {/* Gruppo Destra: Avanti +1s & Salta ad Outro */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleStepForward(1.0)}
                title="Avanti 1 secondo (+1s)"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-amber-500/60 text-slate-200 hover:text-amber-300 transition active:scale-95 shadow-sm text-xs font-mono font-bold"
              >
                <span>+1s</span>
                <SkipForward className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={handleJumpOutro}
                title="Salta all'Outro Brand finale"
                className={`px-2 py-1.5 rounded-xl border text-[11px] font-bold font-mono transition active:scale-95 shadow-sm ${
                  isInOutro
                    ? 'bg-amber-500/20 text-amber-300 border-amber-400'
                    : 'bg-slate-900 border-slate-700/80 hover:border-amber-500/50 text-slate-400 hover:text-amber-300'
                }`}
              >
                End
              </button>
            </div>
          </div>

          {/* Quick Scene Jump Chips (se ci sono 2 o più scene) */}
          {scenes.length > 1 && (
            <div className="flex items-center gap-1 pt-1 overflow-x-auto no-scrollbar">
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider mr-0.5 shrink-0">
                Scene:
              </span>
              {scenes.map((sc, i) => {
                const isActive = !isInOutro && activeSceneIndex === i;
                return (
                  <button
                    key={sc.id || i}
                    type="button"
                    onClick={() => handleJumpScene(i)}
                    title={`Vai a Scena ${i + 1}: ${sc.titlePrimary || ''}`}
                    className={`flex-1 min-w-[28px] py-1 px-1.5 rounded-lg text-[10px] font-mono font-bold transition border ${
                      isActive
                        ? (brand === 'pizza'
                            ? 'bg-amber-500/25 border-amber-400 text-amber-300 shadow-sm'
                            : 'bg-emerald-500/25 border-emerald-400 text-emerald-300 shadow-sm')
                        : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    #{i + 1}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={handleJumpOutro}
                title="Vai all'Outro finale con Logo e contatti"
                className={`py-1 px-2 rounded-lg text-[10px] font-mono font-bold transition border shrink-0 ${
                  isInOutro
                    ? 'bg-rose-500/25 border-rose-400 text-rose-300 shadow-sm'
                    : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-rose-300 hover:border-slate-700'
                }`}
              >
                Outro
              </button>
            </div>
          )}
        </div>
      )}

      {/* 🖥️ 2. COMPANION LANDSCAPE PLAYER 4:3 (Google Maps & Facebook Feed) - Esclusivo per P1 e V1 */}
      {isCompanionEligible && !testRun.isEmptyShowcase && (
        <div className="w-full mt-4 flex flex-col items-center">
          {/* Header Pulito Google Business 4:3 */}
          <div className="w-full flex items-center gap-2 px-1 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs font-bold text-slate-200 tracking-wide">
              Google Business 4:3
            </span>
          </div>

          {/* 4:3 Player Canvas Container */}
          <div 
            onClick={handleTogglePlay}
            className="relative w-full aspect-[4/3] bg-black select-none overflow-hidden group rounded-2xl shadow-xl border-[3px] border-slate-700/90 hover:border-blue-500/60 transition-all cursor-pointer"
          >
            <canvas
              ref={canvas43Ref}
              width={960}
              height={720}
              className="w-full h-full object-cover"
            />

            {/* Sfondo sfumato nero in alto (Top Vignette Fade per massima leggibilità watermark) */}
            <div className={`absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-black/92 via-black/55 to-transparent pointer-events-none z-25 transition-opacity duration-300 ${
              isInOutro ? 'opacity-0' : 'opacity-100'
            }`} />

            {/* Sfondo sfumato nero in basso 4:3 (Bottom Vignette Fade: protegge categoria, titoli e prezzo con ombra nera continua) */}
            <div className={`absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black/95 via-black/75 via-45% to-transparent pointer-events-none z-25 transition-opacity duration-300 ${
              isInOutro ? 'opacity-0' : 'opacity-100'
            }`} />

            {/* Watermark Ufficiale 4:3 (Logo +20% ulteriore = 60px + Titolo con riverbero nero + Sottotitolo - Ingrandito del 20%, posizione top-3 left-3 invariata) */}
            <div className={`absolute top-3 left-3 z-30 flex items-center gap-3.5 pointer-events-none transition-all duration-300 ${
              isInOutro ? 'opacity-0 -translate-y-2' : 'opacity-100 translate-y-0'
            }`}>
              <img
                crossOrigin="anonymous"
                src={brand === 'pizza' ? PIZZA_LOGO_512_BASE64 : VILLAGE_LOGO_512_BASE64}
                alt="Logo"
                className="w-[60px] h-[60px] object-contain drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)] shrink-0"
              />
              <div className="flex flex-col text-left drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
                <div className="flex flex-col text-left leading-none">
                  <span className="text-[19px] sm:text-[21.5px] font-black text-white uppercase tracking-wide leading-none whitespace-nowrap [text-shadow:_0_2px_8px_rgba(0,0,0,1),_0_1px_3px_rgba(0,0,0,0.95)] drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
                    FLOWER POWER
                  </span>
                  <span className={`font-light italic text-[21px] sm:text-[22px] capitalize tracking-normal leading-none whitespace-nowrap mt-0.5 ${brand === 'pizza' ? 'text-[#f87171]' : 'text-[#34d399]'}`}>
                    {brand === 'pizza' ? 'Pizza' : 'Village'}
                  </span>
                </div>
                <span className="text-[15px] sm:text-[17px] font-bold leading-tight mt-1 tracking-tight [text-shadow:_0_1px_4px_rgba(0,0,0,1)] drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] text-amber-300">
                  {brand === 'pizza' ? 'ส่งถึงบ้าน · Ranong Delivery' : 'Direct Booking'}
                </span>
              </div>
            </div>

            {/* 🏷️ GERARCHIA TIPOGRAFICA SCALARE A VISTA (Sollevata di 3px a bottom-[15px], testi e prezzo ingranditi del 25%) */}
            {currentScene && (
              <div className={`absolute left-3 right-3 bottom-[15px] z-30 flex flex-col items-start text-left pointer-events-none transition-all duration-300 ${
                isInOutro ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
              }`}>
                {/* Caso CIBO / PIATTI (P1): Categoria, Thai sopra in grande, Inglese sotto a scalare, prezzo */}
                {(mode === 'P1' || mode === 'R1') && (
                  <div className="w-full flex items-end justify-between gap-2">
                    {/* Blocco Titoli (Sinistra) - Ingrandito del 25% */}
                    <div className="flex-1 min-w-0 pr-1">
                      {currentScene.badgeCategory && (() => {
                        let catText = currentScene.badgeCategory;
                        if (catText.toUpperCase().includes('TRADITIONAL ITALIAN PIZZA') || catText.toUpperCase() === 'TRADITIONAL PIZZA') {
                          catText = 'ITALIAN PIZZA';
                        }
                        return (
                          <div className="inline-flex items-center gap-1 text-[14px] sm:text-[15px] font-black tracking-wider uppercase text-white drop-shadow-[0_2px_4px_rgba(0,0,0,1)] whitespace-nowrap shrink-0 translate-y-0.5">
                            <span className="text-rose-500 font-black text-[14px] drop-shadow-[0_0_6px_rgba(244,63,94,0.95)] [text-shadow:_0_2px_4px_rgba(0,0,0,1)]">✦</span>
                            <span className="[text-shadow:_0_2px_4px_rgba(0,0,0,1),_0_0_10px_rgba(0,0,0,1),_1px_1px_2px_rgba(0,0,0,1)]">{catText.replace(/^[✦⭐\s*]+/, '')}</span>
                          </div>
                        );
                      })()}

                      {/* THAI IN GRANDE SOPRA (+25%) */}
                      <h3 className="text-[17.5px] sm:text-[20px] font-black text-amber-300 leading-tight mt-0.5 [text-shadow:_0_2px_4px_rgba(0,0,0,1),_0_0_12px_rgba(0,0,0,1),_0_0_24px_rgba(0,0,0,0.95),_1px_1px_3px_rgba(0,0,0,1)] drop-shadow-[0_3px_10px_rgba(0,0,0,1)]">
                        {(mode === 'P1' ? format43DishTitle(currentScene.titlePrimary, 'th') : currentScene.titlePrimary.split('\n')).map((line, idx) => (
                          <span key={idx} className="block leading-tight whitespace-nowrap">
                            {line}
                          </span>
                        ))}
                      </h3>

                      {/* INGLESE SOTTO (+25%) */}
                      <div className="text-[14px] sm:text-[15px] font-semibold text-white/95 leading-snug [text-shadow:_0_2px_4px_rgba(0,0,0,1),_0_0_12px_rgba(0,0,0,1),_0_0_20px_rgba(0,0,0,0.95),_1px_1px_3px_rgba(0,0,0,1)] drop-shadow-[0_2px_8px_rgba(0,0,0,1)]">
                        {(mode === 'P1' ? format43DishTitle(currentScene.titleSecondary, 'en') : currentScene.titleSecondary.split('\n')).map((line, idx) => (
                          <span key={idx} className="block leading-snug whitespace-nowrap">
                            {line}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* PREZZO PIATTO / PIZZE 8" E 12" (TASSATIVAMENTE UNO SOPRA L'ALTRO, INGRANDITO DEL 25%) */}
                    <div 
                      className="w-fit shrink-0 pb-0.5"
                      style={{
                        transform: currentScene.pizzaSizes && mode !== 'R1' ? 'scale(0.756)' : 'scale(0.938)',
                        transformOrigin: 'bottom right'
                      }}
                    >
                      {currentScene.pizzaSizes && mode !== 'R1' ? (
                        <div className="flex flex-col items-end gap-1">
                          <div className="inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded-md bg-[#FFE500] border-2 border-black shadow-[2px_2px_0px_#000000] text-black">
                            <span className="font-['Kanit',sans-serif] text-xs sm:text-[13px] font-black bg-black text-white px-1.5 py-0.5 rounded-[3px] leading-none tracking-tight">8"</span>
                            <span
                              className="font-['Kanit',sans-serif] text-[19px] sm:text-[21px] font-black leading-none tracking-tight"
                              style={{ paintOrder: 'stroke fill', WebkitTextStroke: '3px #ffffff' }}
                            >
                              {currentScene.pizzaSizes.size8Price}฿
                            </span>
                          </div>
                          <div className="inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded-md bg-[#FFE500] border-2 border-black shadow-[2px_2px_0px_#000000] text-black">
                            <span className="font-['Kanit',sans-serif] text-xs sm:text-[13px] font-black bg-black text-white px-1.5 py-0.5 rounded-[3px] leading-none tracking-tight">12"</span>
                            <span
                              className="font-['Kanit',sans-serif] text-[19px] sm:text-[21px] font-black leading-none tracking-tight"
                              style={{ paintOrder: 'stroke fill', WebkitTextStroke: '3px #ffffff' }}
                            >
                              {currentScene.pizzaSizes.size12Price}฿
                            </span>
                          </div>
                        </div>
                      ) : currentScene.priceLabel ? (
                        <div className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-[#FFE500] border-2 border-black shadow-[2px_2px_0px_#000000] text-black">
                          <span
                            className="font-['Kanit',sans-serif] text-[24px] sm:text-[26px] font-black leading-none tracking-tight"
                            style={{ paintOrder: 'stroke fill', WebkitTextStroke: '3.5px #ffffff' }}
                          >
                            {currentScene.priceLabel.replace(/\bTHB\b/g, '฿').replace(/\s*฿/g, '฿')}
                          </span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                )}

                {/* Caso ALLOGGI (V1, LM1): Nome Alloggio, Sottotitolo, Thai + Prezzo Last Minute a destra (se LM1) */}
                {(mode === 'V1' || mode === 'LM1') && (
                  <div className="w-full flex items-end justify-between gap-2">
                    {/* Blocco Titoli (Sinistra) */}
                    <div className="flex-1 min-w-0 pr-1 space-y-0.5">
                      <div className="leading-tight [text-shadow:_0_2px_8px_rgba(0,0,0,1),_0_1px_3px_rgba(0,0,0,0.95)] drop-shadow-[0_2px_6px_rgba(0,0,0,1)]">
                        <h3 className="text-[17.5px] sm:text-[20px] font-black text-white leading-tight">
                          {currentScene.lodgingTitle || currentScene.titlePrimary}
                        </h3>
                        {currentScene.lodgingSubtitle && (
                          <p className="text-[14px] sm:text-[15px] font-bold text-amber-300 leading-tight mt-0.5">
                            {currentScene.lodgingSubtitle}
                          </p>
                        )}
                      </div>

                      <p className="text-[12.5px] sm:text-[14px] font-semibold text-stone-200/95 leading-snug [text-shadow:_0_2px_8px_rgba(0,0,0,1),_0_1px_3px_rgba(0,0,0,0.95)] drop-shadow-[0_2px_6px_rgba(0,0,0,1)] pt-0.5">
                        {currentScene.titleSecondary}
                      </p>
                    </div>

                    {/* Prezzo Octorate Last Minute a Destra (se LM1) con la stessa impaginazione e stile di P1 */}
                    {mode === 'LM1' && currentScene.priceLabel && (
                      <div className="w-fit shrink-0 pb-0.5">
                        <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-[#FFE500] border-2 border-black shadow-[2px_2px_0px_#000000] text-black">
                          <span
                            className="font-['Kanit',sans-serif] text-[17px] sm:text-[19px] font-black leading-none tracking-tight"
                            style={{ paintOrder: 'stroke fill', WebkitTextStroke: '2.8px #ffffff' }}
                          >
                            {currentScene.priceLabel.replace(/^Today\s+/i, '').replace(/\bTHB\b/g, '฿').replace(/\s*฿/g, '฿')}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Progress Bar 4:3 Bottom Edge */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-30 pointer-events-none">
              <div
                className="h-full bg-gradient-to-r from-amber-400 via-rose-500 to-emerald-400 transition-all duration-75 ease-linear"
                style={{ width: `${progress * 100}%` }}
              />
            </div>

            {/* Overlay Play al centro quando il video è in pausa */}
            {!isPlaying && !isEnded && (
              <div className="absolute inset-0 z-35 bg-black/25 flex items-center justify-center pointer-events-none">
                <div className="w-11 h-11 rounded-full bg-gradient-to-r from-amber-500 to-rose-600 text-white flex items-center justify-center shadow-lg border border-white/30 pl-0.5 group-hover:scale-110 transition-transform">
                  <Play className="w-5 h-5 fill-white" />
                </div>
              </div>
            )}

            {/* Overlay Replay al termine del video */}
            {isEnded && (
              <div className="absolute inset-0 z-40 bg-black/25 flex items-center justify-center pointer-events-none">
                <div className="w-11 h-11 rounded-full bg-gradient-to-r from-amber-500 via-rose-600 to-pink-600 text-white flex items-center justify-center shadow-lg border border-white/30 pl-0.5 group-hover:scale-110 transition-transform">
                  <RotateCcw className="w-5 h-5 text-white" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
