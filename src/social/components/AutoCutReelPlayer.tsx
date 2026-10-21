import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, RotateCcw, Sparkles, Layers } from 'lucide-react';
import { CameraTrajectory } from './VisualMotionStudio';
import { AutoCutSlide } from '../services/autoCutIntelligence';

export interface AutoCutReelPlayerProps {
  imageUrl?: string;
  slides?: AutoCutSlide[];
  trajectory?: CameraTrajectory | string;
  audioSrc?: string;
  audioTitle?: string;
  titleTh?: string;
  titleEn?: string;
  badge?: string;
  price?: number | string;
  platform?: 'tiktok' | 'instagram' | 'facebook' | 'google';
  caption: string;
  brand: 'pizza' | 'village';
  autoPlay?: boolean;
}

export function AutoCutReelPlayer({
  imageUrl,
  slides,
  trajectory = 'pan_left_to_right',
  audioSrc,
  audioTitle,
  titleTh,
  titleEn,
  badge,
  price,
  platform = 'tiktok',
  caption,
  brand,
  autoPlay = true
}: AutoCutReelPlayerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  const TOTAL_DURATION = 7.8; // 7.8 secondi certificati AutoCut (5 scene da 1.56s ciascuna)

  // Costruisce la lista di slide effettive
  const effectiveSlides: AutoCutSlide[] = (slides && slides.length > 0)
    ? slides
    : [
        {
          imageUrl: imageUrl || '',
          labelTh: titleTh || '',
          labelEn: titleEn || '',
          badge: badge || (brand === 'pizza' ? 'ITALIAN GOURMET' : 'KOH PHAYAM RETREAT'),
          price: typeof price === 'number' ? price : undefined,
          trajectory: (trajectory as any) || 'pan_left_to_right'
        }
      ];

  const slideCount = effectiveSlides.length;
  const slideDuration = TOTAL_DURATION / slideCount;

  // Riproduzione / Loop Canvas Multi-Scena a Tempo di Musica
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Precarica tutte le immagini delle slide in parallelo
    const loadedImages: HTMLImageElement[] = effectiveSlides.map((slide) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = slide.imageUrl;
      return img;
    });

    let isCancelled = false;

    // Reset timer
    startTimeRef.current = performance.now();
    setIsEnded(false);
    setActiveSlideIndex(0);

    // Audio setup
    if (audioSrc && !audioRef.current) {
      audioRef.current = new Audio(audioSrc);
      audioRef.current.loop = false;
      audioRef.current.muted = isAudioMuted;
    } else if (audioRef.current && audioSrc && !audioRef.current.src.endsWith(audioSrc)) {
      audioRef.current.src = audioSrc;
      audioRef.current.currentTime = 0;
    }

    if (audioRef.current && isPlaying) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.log('Audio autoplay info:', e));
    }

    const render = (now: number) => {
      if (isCancelled) return;

      if (!startTimeRef.current) startTimeRef.current = now;
      const rawElapsed = (now - startTimeRef.current) / 1000;
      const elapsed = Math.min(TOTAL_DURATION, rawElapsed);
      const ended = rawElapsed >= TOTAL_DURATION;

      setProgress(elapsed / TOTAL_DURATION);

      // Dissolvenza audio negli ultimi 1.2s prima del loop
      if (audioRef.current && !isAudioMuted && isPlaying) {
        if (elapsed >= 6.6) {
          const fade = Math.max(0, (TOTAL_DURATION - elapsed) / 1.2);
          audioRef.current.volume = fade;
        } else {
          audioRef.current.volume = 1.0;
        }
      }

      // Calcola l'indice della slide corrente a tempo di musica
      const currentIdx = Math.min(slideCount - 1, Math.floor(elapsed / slideDuration));
      setActiveSlideIndex(currentIdx);

      const currentSlide = effectiveSlides[currentIdx];
      const currentImg = loadedImages[currentIdx];

      // Tempo locale dentro la scena corrente (da 0 a slideDuration)
      const localElapsed = elapsed - (currentIdx * slideDuration);
      const subT = Math.min(1, Math.max(0, localElapsed / slideDuration));

      // Easing Smooth
      const t = subT < 0.5 ? 2 * subT * subT : 1 - Math.pow(-2 * subT + 2, 2) / 2;

      // 💥 Beat-Punch a stacco di scena (primi 0.16s di ogni slide)
      const beatPunch = localElapsed < 0.16 ? Math.max(0, (0.16 - localElapsed) / 0.16) * 0.08 : 0;

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      if (currentImg && currentImg.complete && currentImg.naturalWidth > 0) {
        const imgAspect = currentImg.naturalWidth / currentImg.naturalHeight;
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

        let scale = 1.15 + beatPunch;
        let panX = 0;
        let panY = 0;

        const maxPanX = Math.max(0, (baseW * 1.15 - w) / 2);
        const maxPanY = Math.max(0, (baseH * 1.18 - h) / 2);

        const currentTrajectory = currentSlide.trajectory || trajectory || 'pan_left_to_right';

        switch (currentTrajectory) {
          case 'pan_left_to_right':
            scale = 1.15 + beatPunch;
            panX = maxPanX - (t * 2 * maxPanX);
            panY = 0;
            break;
          case 'pan_right_to_left':
            scale = 1.15 + beatPunch;
            panX = -maxPanX + (t * 2 * maxPanX);
            panY = 0;
            break;
          case 'diagonal_up_right':
            scale = 1.18 + beatPunch;
            panX = maxPanX - (t * 2 * maxPanX);
            panY = maxPanY - (t * 2 * maxPanY);
            break;
          case 'diagonal_up_left':
            scale = 1.18 + beatPunch;
            panX = -maxPanX + (t * 2 * maxPanX);
            panY = maxPanY - (t * 2 * maxPanY);
            break;
          case 'push_in_focal':
          default:
            scale = 1.08 + (t * 0.14) + beatPunch;
            panX = 0;
            panY = 0;
            break;
        }

        ctx.save();
        ctx.translate(w / 2 + panX, h / 2 + panY);
        ctx.scale(scale, scale);
        ctx.drawImage(currentImg, -baseW / 2, -baseH / 2, baseW, baseH);
        ctx.restore();

        // Overlay gradiente soft per contrasto testi TikTok/Instagram
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, 'rgba(0,0,0,0.4)');
        grad.addColorStop(0.3, 'rgba(0,0,0,0.05)');
        grad.addColorStop(0.68, 'rgba(0,0,0,0.25)');
        grad.addColorStop(1, 'rgba(0,0,0,0.88)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Flash sottile a inizio beat (< 0.08s) per accentuare lo stacco a ritmo di musica
        if (localElapsed < 0.08) {
          const flashAlpha = (1 - (localElapsed / 0.08)) * 0.22;
          ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha})`;
          ctx.fillRect(0, 0, w, h);
        }
      }

      if (ended) {
        setIsEnded(true);
        setIsPlaying(false);
        if (audioRef.current) {
          audioRef.current.pause();
        }
      } else if (isPlaying) {
        animFrameRef.current = requestAnimationFrame(render);
      }
    };

    if (isPlaying) {
      animFrameRef.current = requestAnimationFrame(render);
    } else {
      // Disegna il primo fotogramma statico
      if (loadedImages[0]) {
        loadedImages[0].onload = () => {
          if (!isPlaying) render(performance.now());
        };
      }
    }

    return () => {
      isCancelled = true;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [effectiveSlides, audioSrc, isPlaying]);

  const handleReplay = () => {
    startTimeRef.current = performance.now();
    setIsEnded(false);
    setIsPlaying(true);
    setActiveSlideIndex(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.log('Replay audio err:', e));
    }
  };

  const handleTogglePlay = () => {
    if (isEnded) {
      handleReplay();
      return;
    }
    const next = !isPlaying;
    setIsPlaying(next);
    if (audioRef.current) {
      if (next) {
        audioRef.current.play().catch(e => console.log('Play err:', e));
      } else {
        audioRef.current.pause();
      }
    }
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextMuted = !isAudioMuted;
    setIsAudioMuted(nextMuted);
    if (audioRef.current) {
      audioRef.current.muted = nextMuted;
    }
  };

  const currentSlide = effectiveSlides[activeSlideIndex] || effectiveSlides[0];
  const activeBadge = currentSlide.badge || badge;
  const activeTitleTh = currentSlide.labelTh || titleTh;
  const activeTitleEn = currentSlide.labelEn || titleEn;
  const activePrice = currentSlide.price || price;

  return (
    <div className="relative w-full h-full bg-black select-none overflow-hidden group">
      {/* Dynamic 9:16 AutoCut Canvas */}
      <canvas
        ref={canvasRef}
        width={720}
        height={1280}
        className="w-full h-full object-cover cursor-pointer"
        onClick={handleTogglePlay}
      />

      {/* 🎬 TACCHE DI PROGRESSIONE A TEMPO DI MUSICA (Story Segments AutoCut) */}
      <div className="absolute top-2.5 left-2 right-2 z-30 flex items-center gap-1 pointer-events-none">
        {effectiveSlides.map((_, idx) => {
          let segmentWidth = '0%';
          if (idx < activeSlideIndex) {
            segmentWidth = '100%';
          } else if (idx === activeSlideIndex) {
            const localElapsed = Math.max(0, (progress * TOTAL_DURATION) - (idx * slideDuration));
            const subRatio = Math.min(1, localElapsed / slideDuration);
            segmentWidth = `${subRatio * 100}%`;
          }

          return (
            <div key={idx} className="flex-1 h-1 bg-white/25 rounded-full overflow-hidden backdrop-blur-xs">
              <div
                className="h-full bg-white transition-all duration-75 ease-linear"
                style={{ width: segmentWidth }}
              />
            </div>
          );
        })}
      </div>

      {/* Top Floating Badge AutoCut Engine & Audio Toggle */}
      <div className="absolute top-8 left-3 right-3 z-30 flex items-center justify-between pointer-events-none">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/65 backdrop-blur-md border border-amber-500/50 text-amber-300 text-[10px] font-bold shadow-lg">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>AutoCut {slideCount} Clip · 7.8s</span>
        </span>

        {audioTitle && (
          <button
            type="button"
            onClick={handleToggleMute}
            className="pointer-events-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-white text-[10px] font-mono hover:bg-black/90 transition shadow-lg"
          >
            {isAudioMuted ? (
              <VolumeX className="w-3.5 h-3.5 text-rose-400" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            )}
            <span className="truncate max-w-[120px]">{audioTitle}</span>
          </button>
        )}
      </div>

      {/* Indicator Clip Attiva & Traiettoria */}
      <div className="absolute top-16 left-3 z-30 flex items-center gap-1.5 pointer-events-none">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[9px] font-mono text-amber-300 border border-amber-500/30">
          <Layers className="w-2.5 h-2.5" />
          <span>SCENA {activeSlideIndex + 1}/{slideCount}</span>
        </span>
        <span className="px-2 py-0.5 rounded bg-black/50 text-[9px] font-mono text-stone-300 uppercase">
          {(currentSlide.trajectory || trajectory).replace(/_/g, ' ')}
        </span>
      </div>

      {/* 🏷️ GANCIO VISIVO DINAMICO SINCRONIZZATO CON LA SCENA (Cambia a ritmo di musica) */}
      {(activeTitleTh || activeTitleEn) && platform !== 'facebook' && platform !== 'google' && (
        <div className="absolute left-3 right-12 bottom-20 z-20 flex flex-col items-start text-left pointer-events-none transition-all duration-150">
          {activeBadge && (
            <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-600 to-rose-600 text-white text-[9px] font-bold shadow-md mb-1 border border-amber-400/30 animate-pulse">
              ✨ {activeBadge}
            </span>
          )}
          <h4 className="text-xs font-black text-white leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
            {activeTitleTh || activeTitleEn}
          </h4>
          {activeTitleEn && activeTitleTh && (
            <p className="text-[10px] font-semibold text-stone-300 drop-shadow mt-0.5">
              {activeTitleEn}
            </p>
          )}
          {activePrice && (
            <div className="mt-1.5 inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-400 border-2 border-black text-black shadow-[0_2px_8px_rgba(0,0,0,0.5)] font-mono font-black">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse shrink-0 ring-1 ring-black/20" />
              <span className="text-[11px] font-black text-black">{activePrice} ฿</span>
            </div>
          )}
        </div>
      )}

      {/* Replay Overlay al termine dei 7.8s */}
      {isEnded && (
        <div
          onClick={handleReplay}
          className="absolute inset-0 z-40 bg-black/65 backdrop-blur-xs flex flex-col items-center justify-center gap-2 cursor-pointer transition-opacity"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-rose-600 to-amber-600 text-white flex items-center justify-center shadow-xl hover:scale-110 transition-transform">
            <RotateCcw className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold text-white drop-shadow">Rivedi AutoCut {slideCount} Scene</span>
        </div>
      )}
    </div>
  );
}
