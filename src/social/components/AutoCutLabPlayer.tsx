import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles, Layers, Clock, Music, Star } from 'lucide-react';
import { AutoCutTestRun, AutoCutScene } from '../services/autoCutLabEngine';
import { LINE_QR_CODE_BASE64 } from '../services/lineQrData';
import { autoCutSoundEngine } from '../services/autoCutSoundEffects';

// Immagine QR Code Base64 precaricata e decodificata in memoria all'avvio (zero CORS, zero latenza)
const globalLineQrImg = new Image();
globalLineQrImg.src = LINE_QR_CODE_BASE64;

// Loghi Ufficiali precaricati all'avvio per watermark istantaneo sul canvas
const globalPizzaLogoImg = new Image();
globalPizzaLogoImg.src = '/flower-power-pizza-logo-512.png';

const globalVillageLogoImg = new Image();
globalVillageLogoImg.src = '/FP_04_-_LOGO_OFFICIAL_HD.png';

export interface AutoCutLabPlayerProps {
  testRun: AutoCutTestRun;
  onReplay?: () => void;
  autoPlay?: boolean;
}

export function AutoCutLabPlayer({
  testRun,
  onReplay,
  autoPlay = true
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

  const lastTestRunRef = useRef(testRun);
  useEffect(() => {
    if (lastTestRunRef.current !== testRun) {
      lastTestRunRef.current = testRun;
      setIsEnded(false);
    }
  }, [testRun]);

  const { scenes, totalDuration, sceneDuration, audioTrack, brand, mode } = testRun;
  const isCompanionEligible = mode === 'P1' || mode === 'V1';
  const sceneCount = scenes.length;

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

    // Setup audio
    if (!audioRef.current) {
      audioRef.current = new Audio(audioTrack.src);
    } else {
      audioRef.current.src = audioTrack.src;
    }
    audioRef.current.currentTime = 0;
    audioRef.current.muted = isAudioMuted;

    if (isPlaying && !testRun.isEmptyShowcase) {
      startTimeRef.current = performance.now();
      setIsEnded(false);
      setActiveSceneIndex(0);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(e => console.log('Audio autoplay info:', e));
      }
    }

    // Riferimento al logo ufficiale precaricato per Watermark e Outro finale (Pizza / Villaggio)
    const logoImg = brand === 'pizza' ? globalPizzaLogoImg : globalVillageLogoImg;
    if (!logoImg.src) {
      logoImg.src = brand === 'pizza' ? '/flower-power-pizza-logo-512.png' : '/FP_04_-_LOGO_OFFICIAL_HD.png';
    }

    // QR Code ufficiale LINE della Pizzeria garantito da istanza Base64 in memoria
    const lineQrImg = globalLineQrImg;
    if (!lineQrImg.src) {
      lineQrImg.src = LINE_QR_CODE_BASE64;
    }

    const isSingleHero = mode === 'P1' || mode === 'DS';
    // Per P1 e DS l'Outro è integrato dentro la colonna sonora (durata totale = durata intero MP3)
    // Per le altre prove, l'Outro ha una sosta di 4.0s a fine musica
    const OUTRO_DURATION = isSingleHero ? 0 : 4.0;
    const musicDuration = totalDuration;
    const totalVideoDuration = musicDuration + OUTRO_DURATION;
    const outroStartTime = isSingleHero ? sceneDuration : musicDuration;

    // 📸 CALCOLO FOTOGRAMMA THUMBNAIL UFFICIALE:
    // Pizzeria & DS Daily Special: TASSATIVAMENTE il 1° piatto in vetrina al suo massimo zoom macro centrale (apice della Scena 1 prima del crossfade)
    // Alloggi Villaggio: Scorrimento a metà della 1ª scena con camera centrata sul resort
    const isFoodContent = brand === 'pizza' || mode === 'R1';
    const scene1Dur = scenes[0]?.duration || sceneDuration;
    const thumbnailTimestamp = isFoodContent
      ? Math.max(0.1, scene1Dur * 0.95)
      : Math.max(0.1, scene1Dur * 0.50);

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

          case 'pan_left_zoom_in':
            scale = 1.10 + (t * 0.12);
            panX = maxPanX - (t * 2 * maxPanX);
            panY = 0;
            break;
          case 'pan_right_zoom_in':
            scale = 1.10 + (t * 0.12);
            panX = -maxPanX + (t * 2 * maxPanX);
            panY = 0;
            break;
          case 'pan_left_zoom_out':
            scale = 1.20 - (t * 0.12);
            panX = maxPanX - (t * 2 * maxPanX);
            panY = 0;
            break;
          case 'pan_right_zoom_out':
            scale = 1.20 - (t * 0.12);
            panX = -maxPanX + (t * 2 * maxPanX);
            panY = 0;
            break;
          case 'push_in_focal':
          default:
            scale = 1.08 + (t * 0.12);
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

    const renderFrame = (elapsed: number) => {
      if (isCancelled) return;
      setProgress(elapsed / totalVideoDuration);

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

      // 🎬 CONTINUOUS SEAMLESS FLYING CROSSFADE CON DURATE ASIMMETRICHE
      // Calcolo timeline cumulativa per ciascuna scena
      const sceneTimeline: Array<{ start: number; end: number; duration: number }> = [];
      let cumTime = 0;
      for (let i = 0; i < scenes.length; i++) {
        const dur = scenes[i].duration || sceneDuration;
        sceneTimeline.push({
          start: cumTime,
          end: cumTime + dur,
          duration: dur
        });
        cumTime += dur;
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
      const INCOMING_OFFSET = 0.20;
      const subT = currentIdx === 0 ? rawSubT : (INCOMING_OFFSET + (rawSubT * (1.0 - INCOMING_OFFSET)));

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

      setActiveSceneIndex(dominantIdx);

      // 3. Overlay gradiente cinematografico per contrasto tipografico (solo durante la visione dei piatti)
      if (elapsed < outroStartTime) {
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, 'rgba(0,0,0,0.45)');
        grad.addColorStop(0.25, 'rgba(0,0,0,0.05)');
        grad.addColorStop(0.65, 'rgba(0,0,0,0.25)');
        grad.addColorStop(1, 'rgba(0,0,0,0.92)');
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

          if (logoImg.complete && logoImg.naturalWidth > 0) {
            const lSize = 130;
            ctx43.save();
            ctx43.shadowColor = 'rgba(0, 0, 0, 0.9)';
            ctx43.shadowBlur = 20;
            ctx43.drawImage(logoImg, cx43 - lSize / 2, 100, lSize, lSize);
            ctx43.restore();
          }

          ctx43.font = '900 32px "Outfit", "Inter", sans-serif';
          ctx43.fillStyle = brand === 'pizza' ? '#fbbf24' : '#34d399';
          ctx43.textAlign = 'center';
          ctx43.fillText(
            brand === 'pizza' ? 'FLOWER POWER PIZZA' : 'FLOWER POWER VILLAGE',
            cx43,
            275
          );

          ctx43.font = '800 20px "Inter", sans-serif';
          ctx43.fillStyle = '#ffffff';
          ctx43.fillText(
            brand === 'pizza' ? 'RANONG · THAILAND' : 'KOH PHAYAM · THAILAND',
            cx43,
            315
          );

          ctx43.font = '600 16px "Inter", sans-serif';
          ctx43.fillStyle = '#cbd5e1';
          ctx43.fillText(
            brand === 'pizza' ? 'Authentic Traditional Italian Pizza' : 'Tropical Island Resort & Eco Sanctuary',
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
          ctx43.strokeStyle = brand === 'pizza' ? 'rgba(245, 158, 11, 0.65)' : 'rgba(52, 211, 153, 0.75)';
          ctx43.lineWidth = 2.5;
          ctx43.stroke();
          ctx43.restore();

          ctx43.font = '900 24px "Inter", sans-serif';
          ctx43.fillStyle = '#ffffff';
          ctx43.textAlign = 'center';
          ctx43.fillText(
            brand === 'pizza' ? '🌐 flowerpowerpizza.com' : '🌐 flowerpowervillage.com',
            cx43,
            cardY + 46
          );

          ctx43.font = '800 18px "Inter", sans-serif';
          ctx43.fillStyle = brand === 'pizza' ? '#fbbf24' : '#34d399';
          ctx43.fillText(
            brand === 'pizza' ? '🛵 Fast Delivery Ranong · 10% Off 1st Order' : '🌴 Direct Booking · Best Rates Guaranteed',
            cx43,
            cardY + 86
          );

          ctx43.font = '600 15px "Inter", sans-serif';
          ctx43.fillStyle = '#94a3b8';
          ctx43.fillText(
            brand === 'pizza' ? 'Order Online or Visit us near Hot Springs' : 'Koh Phayam Island · Thailand',
            cx43,
            cardY + 118
          );
        }

        // Animazione Volo & Stampo con Overshoot Bounce
        const stampDuration = 0.65;
        const stampProgress = Math.min(1.0, outroElapsed / stampDuration);
        let stampScale = 1.0;
        let stampAlpha = 1.0;
        let stampRotate = 0;

        if (stampProgress < 0.72) {
          // Fase 1: Vola da fuori (scala 3.8x -> 0.92x, inclinazione -7° -> 0°)
          const p = stampProgress / 0.72;
          const easeIn = p * p;
          stampScale = 3.8 - (easeIn * (3.8 - 0.92));
          stampAlpha = Math.min(1.0, p * 1.5);
          stampRotate = (-7 * (1 - p)) * (Math.PI / 180);
        } else {
          // Fase 2: Impatto a stampo & rimbalzo elastico assestandosi a 1.0x
          const p = (stampProgress - 0.72) / 0.28;
          const bounce = Math.sin(p * Math.PI);
          stampScale = 0.92 + (p * 0.08) + (bounce * 0.10);
          stampAlpha = 1.0;
          stampRotate = 0;
        }

        const cx = w / 2;
        const cy = 370; // Posizionato elegantemente nella metà superiore
        const baseLogoSize = 210;

        // Alone luminoso dorato radiale all'impatto
        if (stampProgress >= 0.65) {
          const glowAlpha = Math.min(0.50, (outroElapsed - 0.40) * 0.7);
          const glow = ctx.createRadialGradient(cx, cy, 25, cx, cy, 240);
          glow.addColorStop(0, `rgba(245, 158, 11, ${glowAlpha})`);
          glow.addColorStop(0.55, `rgba(217, 119, 6, ${glowAlpha * 0.45})`);
          glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = glow;
          ctx.fillRect(0, 0, w, h);
        }

        // Disegno Logo Centrato con Ombra 3D d'Impatto
        if (logoImg.complete && logoImg.naturalWidth > 0) {
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(stampRotate);
          ctx.scale(stampScale, stampScale);
          ctx.globalAlpha = stampAlpha;

          ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
          ctx.shadowBlur = 40;
          ctx.shadowOffsetY = 16;

          ctx.drawImage(logoImg, -baseLogoSize / 2, -baseLogoSize / 2, baseLogoSize, baseLogoSize);
          ctx.restore();
        }

        // Titoli e firma del Brand (emergono in dissolvenza sotto al logo dopo la stampata)
        if (outroElapsed > 0.65) {
          const textAlpha = Math.min(1.0, (outroElapsed - 0.65) / 0.40);
          ctx.save();
          ctx.globalAlpha = textAlpha;
          ctx.textAlign = 'center';

          // Nome Brand Dorato (Grande & Incisivo)
          ctx.font = '900 36px "Outfit", "Inter", sans-serif';
          ctx.fillStyle = '#fbbf24';
          ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
          ctx.shadowBlur = 12;
          ctx.fillText(
            brand === 'pizza' ? 'FLOWER POWER PIZZA' : 'FLOWER POWER VILLAGE',
            cx,
            cy + (baseLogoSize / 2) + 48
          );

          // Località (Grande & Chiara)
          ctx.font = '800 22px "Inter", sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.shadowBlur = 8;
          ctx.fillText(
            brand === 'pizza' ? 'RANONG · THAILAND' : 'KOH PHAYAM · THAILAND',
            cx,
            cy + (baseLogoSize / 2) + 82
          );

          // Sottotitolo / Identità Ufficiale (Zero Napoletana - Solo Tradizionale Italiana)
          ctx.font = '600 17px "Inter", sans-serif';
          ctx.fillStyle = '#cbd5e1';
          ctx.shadowBlur = 4;
          ctx.fillText(
            brand === 'pizza' ? 'Authentic Traditional Italian Pizza' : 'Tropical Island Resort & Eco Sanctuary',
            cx,
            cy + (baseLogoSize / 2) + 112
          );

          // 🛵 CARD FINALE AD ALTO IMPATTO (VISIVA, INCISIVA & LEGGIBILE IN 4 SECONDI)
          const boxX = 36;
          const boxY = cy + (baseLogoSize / 2) + 135;
          const boxW = w - 72;
          const boxH = 430;
          const radius = 26;

          // Sfondo scuro satinato con bordo dorato/smeraldo luminescente
          ctx.save();
          ctx.beginPath();
          if (typeof ctx.roundRect === 'function') {
            ctx.roundRect(boxX, boxY, boxW, boxH, radius);
          } else {
            ctx.rect(boxX, boxY, boxW, boxH);
          }
          ctx.fillStyle = 'rgba(11, 17, 32, 0.94)';
          ctx.fill();
          ctx.lineWidth = 2.5;
          ctx.strokeStyle = brand === 'pizza' ? 'rgba(245, 158, 11, 0.65)' : 'rgba(52, 211, 153, 0.75)';
          ctx.shadowColor = brand === 'pizza' ? 'rgba(245, 158, 11, 0.35)' : 'rgba(52, 211, 153, 0.35)';
          ctx.shadowBlur = 20;
          ctx.stroke();
          ctx.restore();

          // Intestazione Card (Inglese & Thailandese - Font 24px Bold)
          ctx.font = '900 24px "Inter", sans-serif';
          ctx.fillStyle = brand === 'pizza' ? '#fbbf24' : '#34d399';
          ctx.textAlign = 'center';
          ctx.fillText(
            brand === 'pizza' 
              ? '🛵 RANONG DELIVERY · ส่งถึงบ้าน' 
              : '🌴 DIRECT BOOKING · จองตรงที่พัก',
            cx,
            boxY + 44
          );

          if (brand === 'pizza') {
            // Disegno QR Code Ufficiale LINE (Colonna Sinistra 200x200)
            const qrSize = 195;
            const qrX = boxX + 24;
            const qrY = boxY + 75;

            // Cornice bianca ad alto contrasto per scansione istantanea con fotocamera
            ctx.save();
            ctx.beginPath();
            if (typeof ctx.roundRect === 'function') {
              ctx.roundRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20, 18);
            } else {
              ctx.rect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20);
            }
            ctx.fillStyle = '#ffffff';
            ctx.fill();
            ctx.shadowColor = 'rgba(0,0,0,0.6)';
            ctx.shadowBlur = 18;

            // Disegna il QR Code Ufficiale LINE
            if (lineQrImg.complete && lineQrImg.naturalWidth > 0) {
              ctx.drawImage(lineQrImg, qrX, qrY, qrSize, qrSize);
            } else if (globalLineQrImg.complete && globalLineQrImg.naturalWidth > 0) {
              ctx.drawImage(globalLineQrImg, qrX, qrY, qrSize, qrSize);
            }
            ctx.restore();

            // Didascalia sotto al QR Code (Grande & Incisiva)
            ctx.font = '900 17px "Inter", sans-serif';
            ctx.fillStyle = '#fbbf24';
            ctx.textAlign = 'center';
            ctx.fillText('📲 Scan to Order', qrX + (qrSize / 2), qrY + qrSize + 30);
            ctx.font = '700 16px "Inter", sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.fillText('สแกนสั่งอาหาร', qrX + (qrSize / 2), qrY + qrSize + 56);

            // Dati di Contatto & Ordine (Colonna Destra - Grandi & Incisivi)
            const infoX = boxX + 252;
            ctx.textAlign = 'left';

            // Sito Web Pizzeria
            ctx.font = '900 26px "Outfit", "Inter", sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.fillText('🌐 flowerpowerpizza.com', infoX, boxY + 115);

            // LINE ID Ufficiale
            ctx.font = '800 22px "Inter", sans-serif';
            ctx.fillStyle = '#10b981';
            ctx.fillText('💚 LINE: @flowerpowerpizza', infoX, boxY + 168);

            // Sconto Benvenuto 10% (Inglese & Thai)
            ctx.font = '800 19px "Inter", sans-serif';
            ctx.fillStyle = '#fbbf24';
            ctx.fillText('🎁 10% Off 1st Order · ลด 10%', infoX, boxY + 220);

            // Indicazione Link in Bio
            ctx.font = '800 19px "Inter", sans-serif';
            ctx.fillStyle = '#38bdf8';
            ctx.fillText('👆 Link in Bio ➔ Order Now', infoX, boxY + 270);

            // Box Termico & Consegna
            ctx.font = '600 16px "Inter", sans-serif';
            ctx.fillStyle = '#94a3b8';
            ctx.fillText('🔥 Hot & Fresh in Thermal Box', infoX, boxY + 315);
          } else {
            // Modalità Villaggio (Koh Phayam): Layout Diretto, Visivo e Gigante
            const btnW = 540;
            const btnH = 68;
            const btnX = cx - (btnW / 2);
            const btnY = boxY + 76;

            // Bottone Sito Web con Bagliore Smeraldo
            ctx.save();
            ctx.beginPath();
            if (typeof ctx.roundRect === 'function') {
              ctx.roundRect(btnX, btnY, btnW, btnH, 20);
            } else {
              ctx.rect(btnX, btnY, btnW, btnH);
            }
            ctx.fillStyle = 'rgba(16, 185, 129, 0.22)';
            ctx.fill();
            ctx.lineWidth = 2.5;
            ctx.strokeStyle = '#34d399';
            ctx.shadowColor = 'rgba(52, 211, 153, 0.55)';
            ctx.shadowBlur = 18;
            ctx.stroke();
            ctx.restore();

            // Sito Web GIGANTE al centro del pulsante
            ctx.textAlign = 'center';
            ctx.font = '900 32px "Outfit", "Inter", sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
            ctx.shadowBlur = 8;
            ctx.fillText('🌐 flowerpowervillage.com', cx, btnY + 45);

            // Best Rate Guaranteed Online (senza Octorate, grande in oro)
            ctx.font = '800 23px "Inter", sans-serif';
            ctx.fillStyle = '#fbbf24';
            ctx.fillText('✨ Best Rate Guaranteed Online', cx, boxY + 205);

            // Link in Bio (in azzurro cielo, visibile subito)
            ctx.font = '800 23px "Inter", sans-serif';
            ctx.fillStyle = '#38bdf8';
            ctx.fillText('👉 Link in Bio ➔ Book Your Stay', cx, boxY + 265);

            // Sottotitolo Identità Villaggio
            ctx.font = '700 20px "Inter", sans-serif';
            ctx.fillStyle = '#e2e8f0';
            ctx.fillText('🌺 Eco Wooden Bungalows & Sunset Suites', cx, boxY + 340);
          }

          // Payoff Footer Card (Visibile e Nitido)
          ctx.textAlign = 'center';
          ctx.font = '700 18px "Inter", sans-serif';
          ctx.fillStyle = '#f1f5f9';
          ctx.fillText(
            brand === 'pizza'
              ? '🇮🇹 Authentic Traditional Italian Pizza in Ranong'
              : '🌴 Tropical Island Resort & Eco Sanctuary in Koh Phayam',
            cx,
            boxY + boxH - 24
          );

          ctx.restore();
        }
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
        if (audioRef.current) {
          audioRef.current.pause();
        }
        // 📸 FOTOGRAMMA THUMBNAIL RIPRISTINATO IMMEDIATAMENTE AL TERMINE DEL VIDEO (Zero schermo nero / velo)
        renderFrame(thumbnailTimestamp);
      } else {
        renderFrame(elapsed);
        if (isPlaying) {
          animFrameRef.current = requestAnimationFrame(render);
        }
      }
    };

    if (isPlaying) {
      animFrameRef.current = requestAnimationFrame(render);
    } else {
      // 📸 STATO INIZIALE STATICHE: Disegna subito la thumbnail perfetta prima di premere Play
      renderFrame(thumbnailTimestamp);
      // E quando le immagini completano il caricamento in memoria, ridisegna se ancora fermo
      loadedImages.forEach((img) => {
        if (!img.complete || img.naturalWidth === 0) {
          img.onload = () => {
            if (!isPlayingRef.current) {
              renderFrame(thumbnailTimestamp);
            }
          };
        }
      });
    }

    return () => {
      isCancelled = true;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [testRun, isPlaying]);

  const handleReplay = () => {
    if (testRun.isEmptyShowcase) return;
    startTimeRef.current = performance.now();
    hasPlayedOutroSfxRef.current = false;
    setIsEnded(false);
    setIsPlaying(true);
    setActiveSceneIndex(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.log('Replay err:', e));
    }
    if (onReplay) onReplay();
  };

  const handleTogglePlay = () => {
    if (testRun.isEmptyShowcase) return;
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

  const currentScene = scenes[activeSceneIndex] || scenes[0];
  const isSingleHero = mode === 'P1' || mode === 'DS';
  const OUTRO_DURATION = isSingleHero ? 0 : 4.0;
  const totalVideoDuration = totalDuration + OUTRO_DURATION;
  const outroStartTime = isSingleHero ? sceneDuration : totalDuration;
  const currentElapsed = progress * totalVideoDuration;
  const isInOutro = currentElapsed >= outroStartTime;

  return (
    <div className="flex flex-col items-center w-full">
      {/* 📱 1. MASTER SMARTPHONE PLAYER 9:16 (TikTok & Instagram Reels) */}
      <div className="relative w-full h-[580px] sm:h-[620px] bg-black select-none overflow-hidden group rounded-[32px] shadow-2xl border-[4px] border-slate-700">
        {/* Dynamic 9:16 AutoCut Canvas */}
        <canvas
          ref={canvasRef}
          width={720}
          height={1280}
          className="w-full h-full object-cover cursor-pointer"
          onClick={handleTogglePlay}
        />

      {/* ⚡ SCHERMATA ELEGANTE VETRINA DAILY SPECIAL VUOTA */}
      {mode === 'DS' && testRun.isEmptyShowcase && (
        <div className="absolute inset-0 z-40 bg-gradient-to-b from-stone-950 via-slate-950 to-stone-950 flex flex-col items-center justify-between p-6 text-center select-none">
          {/* Top Brand Pill */}
          <div className="pt-4 flex flex-col items-center">
            <img
              src="/flower-power-pizza-logo-512.png"
              alt="Flower Power Pizza"
              className="w-14 h-14 rounded-full object-cover border-2 border-amber-400/80 shadow-[0_0_20px_rgba(245,158,11,0.35)] mb-2.5"
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

      {/* Top Floating Badge & Audio Track Indicator */}
      {!testRun.isEmptyShowcase && (
        <div className="absolute top-8 left-3 right-3 z-30 flex items-center justify-between pointer-events-none">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-amber-500/50 text-amber-300 text-[10px] font-bold shadow-lg">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>{isInOutro ? 'Stamp Outro Reveal' : `${mode} · CapCut Pan & Zoom`}</span>
          </span>

          <button
            type="button"
            onClick={handleToggleMute}
            className="pointer-events-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-white text-[10px] font-mono hover:bg-black transition shadow-lg"
          >
            {isAudioMuted ? (
              <VolumeX className="w-3.5 h-3.5 text-rose-400" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            )}
            <span className="truncate max-w-[130px]">{audioTrack.title}</span>
          </button>
        </div>
      )}

      {/* Scena Info & Tempo */}
      {!testRun.isEmptyShowcase && (
        <div className="absolute top-16 left-3 z-30 flex items-center gap-1.5 pointer-events-none">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-black/70 backdrop-blur-xs text-[9px] font-mono text-amber-300 border border-amber-500/30">
            <Layers className="w-2.5 h-2.5" />
            <span>{isInOutro ? 'BRAND OUTRO' : `SCENE ${activeSceneIndex + 1}/${sceneCount}`}</span>
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[9px] font-mono text-stone-300">
            <Clock className="w-2.5 h-2.5" />
            <span>{currentElapsed.toFixed(1)}s / {totalVideoDuration.toFixed(1)}s</span>
          </span>
        </div>
      )}

      {/* ⚡ BANNER DS DAILY SPECIAL (Dinamico: Live Showcase vs Chef Specials) */}
      {!isInOutro && mode === 'DS' && (
        <div className="absolute top-[88px] left-1/2 -translate-x-1/2 z-30 pointer-events-none transition-all duration-300 max-w-[92%] flex justify-center">
          <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-black/90 backdrop-blur-md border border-amber-500/80 shadow-[0_8px_25px_rgba(0,0,0,0.85)] max-w-full">
            <img
              src="/flower-power-pizza-logo-512.png"
              alt="Flower Power Pizza"
              className="w-9 h-9 rounded-full object-cover border-[1.5px] border-amber-400/90 shadow-md shrink-0"
            />
            <div className="flex flex-col text-left">
              {/* Riga 1: THAI PRIMA, POI INGLESE (Dinamico per Vetrina vs Specials) */}
              <div className="inline-flex items-center gap-1.5 whitespace-nowrap">
                <span className="text-[11.5px] font-black text-amber-300 tracking-tight leading-tight flex items-center gap-1">
                  {currentScene?.isLiveShowcase ? (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                      <span>สดใหม่ในตู้โชว์</span>
                    </>
                  ) : (
                    <span>เมนูพิเศษประจำวัน</span>
                  )}
                </span>
                <span className={`inline-flex items-center gap-1 px-1.5 py-[1px] rounded-md border text-[9px] font-black text-white tracking-wider uppercase shadow-md ${
                  currentScene?.isLiveShowcase
                    ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-pink-500 border-amber-300 shadow-[0_0_14px_rgba(244,63,94,0.7)] animate-pulse'
                    : 'bg-indigo-600/90 border-indigo-400'
                }`}>
                  <Sparkles className="w-2 h-2 text-white shrink-0 animate-spin" style={{ animationDuration: '3s' }} />
                  {currentScene?.isLiveShowcase ? 'LIVE SHOWCASE' : 'CHEF SPECIALS'}
                </span>
              </div>
              {/* Riga 2: CONSEGNA RAPIDA (THAI PRIMA, POI INGLESE) */}
              <div className="flex items-center gap-1.5 text-[9px] font-semibold text-white/95 tracking-tight mt-0.5 whitespace-nowrap">
                <span className="text-emerald-400 font-bold">⚡ พร้อมส่ง</span>
                <span className="text-white/40 text-[7px]">•</span>
                <span className="text-white/90">Fast Delivery</span>
                <span className="text-white/40 text-[7px]">•</span>
                <span className="text-amber-200/90 font-mono text-[9px]">Ranong</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🍕 BANNER DELIVERY CENTRALE CON LOGO INGRANDITO +30% (In alto al centro per P1, P2, P3) */}
      {!isInOutro && brand === 'pizza' && mode !== 'DS' && (
        <div className="absolute top-[88px] left-1/2 -translate-x-1/2 z-30 pointer-events-none transition-all duration-300 w-max max-w-[94%]">
          <div className="inline-flex items-center gap-3 px-3.5 py-2 rounded-2xl bg-black/85 backdrop-blur-md border border-amber-500/70 shadow-[0_8px_25px_rgba(0,0,0,0.85)]">
            <img
              src="/flower-power-pizza-logo-512.png"
              alt="Flower Power Pizza"
              className="w-10 h-10 rounded-full object-cover border-[1.5px] border-amber-400/90 shadow-md shrink-0"
            />
            <div className="flex flex-col text-left">
              <span className="text-xs sm:text-[13px] font-black text-amber-300 uppercase tracking-tight leading-tight whitespace-nowrap">
                ส่งถึงบ้าน · Ranong Delivery
              </span>
              <span className="text-[9.5px] sm:text-[10.5px] font-bold text-white/95 leading-tight mt-0.5 tracking-tight whitespace-nowrap">
                flowerpowerpizza.com • Link in Bio
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 🍽️ BANNER R1 RESTAURANT & WHATSAPP DELIVERY (Koh Phayam) */}
      {!isInOutro && mode === 'R1' && (
        <div className="absolute top-[88px] left-1/2 -translate-x-1/2 z-30 pointer-events-none transition-all duration-300 w-max max-w-[94%]">
          <div className="inline-flex items-center gap-3.5 px-4 py-2.5 rounded-2xl bg-black/90 backdrop-blur-md border border-emerald-500/70 shadow-[0_8px_25px_rgba(0,0,0,0.85)]">
            <img
              src="/FP_04_-_LOGO_OFFICIAL_HD.png"
              alt="Flower Power Village"
              className="w-12 h-12 rounded-full object-cover border-2 border-emerald-400/90 shadow-md shrink-0 bg-stone-900"
            />
            <div className="flex flex-col text-left pl-0.5">
              <span className="text-xs sm:text-[13px] font-black text-white uppercase tracking-wider leading-tight">
                Flower Power Village
              </span>
              <div className="inline-flex items-center gap-1.5 mt-0.5">
                <span className="inline-flex items-center gap-1 px-1.5 py-[1px] rounded-md bg-amber-500/25 border border-amber-400/80 shadow-[0_0_12px_rgba(251,191,36,0.5)] animate-[pulse_1.1s_ease-in-out_infinite]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399] shrink-0" />
                  <span className="text-[10px] sm:text-[11px] font-black text-amber-200 tracking-wider drop-shadow-[0_0_8px_rgba(251,191,36,0.95)]">
                    DELIVERY
                  </span>
                </span>
                <span className="text-[10px] sm:text-[11px] font-bold text-amber-300 tracking-tight">
                  · เดลิเวอรี่
                </span>
              </div>
              <div className="inline-flex items-center gap-1.5 mt-0.5">
                <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-[#25D366] shrink-0 shadow-sm">
                  <svg className="w-2 h-2 fill-white" viewBox="0 0 24 24">
                    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 15 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M8.53 7.33C8.37 7.33 8.1 7.39 7.87 7.64C7.65 7.89 7 8.5 7 9.71C7 10.93 7.89 12.1 8.01 12.27C8.14 12.44 9.76 14.94 12.25 16C12.84 16.27 13.3 16.42 13.66 16.53C14.25 16.72 14.79 16.69 15.22 16.63C15.7 16.56 16.68 16.03 16.89 15.45C17.1 14.87 17.1 14.38 17.04 14.27C16.97 14.17 16.81 14.11 16.56 13.99C16.32 13.86 15.12 13.27 14.9 13.19C14.68 13.1 14.52 13.06 14.36 13.3C14.19 13.55 13.73 14.11 13.59 14.27C13.45 14.44 13.31 14.46 13.06 14.34C12.82 14.21 12.05 13.96 11.13 13.14C10.42 12.5 9.93 11.72 9.8 11.49C9.66 11.25 9.78 11.11 9.9 10.99C10.01 10.88 10.15 10.7 10.27 10.56C10.39 10.41 10.44 10.31 10.52 10.15C10.6 9.99 10.56 9.85 10.5 9.72C10.44 9.6 9.95 8.41 9.75 7.91C9.55 7.43 9.35 7.5 9.19 7.49C9.05 7.49 8.89 7.48 8.72 7.48L8.53 7.33Z"/>
                  </svg>
                </span>
                <span className="text-[10.5px] sm:text-[11.5px] font-black text-[#25D366] tracking-tight">
                  +66 095 882 5573
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🔥 BANNER LM1 STORIES LAST MINUTE */}
      {!isInOutro && mode === 'LM1' && (
        <div className="absolute top-[88px] left-1/2 -translate-x-1/2 z-30 pointer-events-none transition-all duration-300 w-max max-w-[94%]">
          <div className="inline-flex items-center gap-3 px-3.5 py-2.5 rounded-2xl bg-black/90 backdrop-blur-md border border-amber-500/80 shadow-[0_8px_25px_rgba(0,0,0,0.85)]">
            <img
              src="/FP_04_-_LOGO_OFFICIAL_HD.png"
              alt="Flower Power Village"
              className="w-11 h-11 rounded-full object-cover border-[1.5px] border-amber-400/90 shadow-md shrink-0 bg-stone-900"
            />
            <div className="flex flex-col text-left">
              <span className="text-xs sm:text-[13px] font-black text-white uppercase tracking-wider leading-tight">
                Flower Power Village
              </span>
              <div className="inline-flex items-center gap-1.5 mt-0.5">
                <span className="inline-flex items-center gap-1 px-1.5 py-[1px] rounded-md bg-amber-500/25 border border-amber-400/80 shadow-[0_0_12px_rgba(251,191,36,0.5)] animate-[pulse_1.1s_ease-in-out_infinite]">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_6px_#f43f5e] shrink-0" />
                  <span className="text-[10px] sm:text-[11px] font-black text-amber-200 tracking-wider drop-shadow-[0_0_8px_rgba(251,191,36,0.95)]">
                    LAST MINUTE
                  </span>
                </span>
                <span className="text-[10px] sm:text-[11px] font-bold text-amber-300 tracking-tight">
                  · ห้องว่างวันนี้
                </span>
              </div>
              <div className="flex items-center justify-between gap-2.5 text-[9.5px] sm:text-[10px] font-semibold text-white/95 tracking-tight mt-0.5">
                <span>Direct Booking</span>
                <span className="text-white/40 text-[8px]">•</span>
                <span>flowerpowervillage.com</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🌴 BANNER RESORT STANDARD (V1, V2, V3) */}
      {!isInOutro && brand === 'village' && mode !== 'R1' && mode !== 'LM1' && (
        <div className="absolute top-[88px] left-1/2 -translate-x-1/2 z-30 pointer-events-none transition-all duration-300 w-max max-w-[94%]">
          <div className="inline-flex items-center gap-3 px-3.5 py-2 rounded-2xl bg-black/85 backdrop-blur-md border border-emerald-500/70 shadow-[0_8px_25px_rgba(0,0,0,0.85)]">
            <img
              src="/FP_04_-_LOGO_OFFICIAL_HD.png"
              alt="Flower Power Village"
              className="w-10 h-10 rounded-full object-cover border-[1.5px] border-emerald-400/90 shadow-md shrink-0 bg-stone-900"
            />
            <div className="flex flex-col text-left">
              <span className="text-xs sm:text-[13px] font-black text-emerald-300 uppercase tracking-tight leading-tight">
                Direct Booking
              </span>
              <span className="text-[9.5px] sm:text-[10.5px] font-bold text-white/95 leading-tight mt-0.5 tracking-tight">
                flowerpowervillage.com • Link in Bio
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 🏷️ GERARCHIA TIPOGRAFICA RIGOROSA (SAFE ZONE IN BASSO - sfuma durante l'outro del brand) */}
      {!testRun.isEmptyShowcase && currentScene && (
        <div className={`absolute left-3.5 right-3.5 bottom-8 z-30 flex flex-col items-start text-left pointer-events-none transition-all duration-500 ${
          isInOutro ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
        }`}>
          
          {/* Caso CIBO / PIATTI (Pizzeria e R1 Restaurant): Sopra più grosso in THAILANDESE, sotto in INGLESE, prezzo THB */}
          {(brand === 'pizza' || mode === 'R1') && (
            <div className="space-y-1 w-full">
              {currentScene.badgeCategory && (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-black tracking-wide shadow-lg uppercase whitespace-nowrap ${
                  mode === 'DS'
                    ? (currentScene.isLiveShowcase
                        ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white border border-rose-300/90 shadow-[0_0_18px_rgba(225,29,72,0.7)]'
                        : 'bg-indigo-950/85 text-white border border-indigo-500 shadow-md')
                    : 'bg-rose-600 text-white border border-rose-400'
                }`}>
                  {mode === 'DS' && currentScene.isLiveShowcase ? (
                    <>
                      <Star className="w-3 h-3 text-white fill-white shrink-0 drop-shadow-sm" />
                      <span className="text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]">
                        {currentScene.badgeCategory.replace(/^⭐\s*/, '')}
                      </span>
                    </>
                  ) : (
                    <span className="text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]">
                      {currentScene.badgeCategory}
                    </span>
                  )}
                </span>
              )}
              
              {/* THAI IN GRANDE SOPRA (A capo semantico logico) */}
              <h3 className="text-base sm:text-lg font-black text-amber-300 leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
                {currentScene.titlePrimary.split('\n').map((line, idx) => (
                  <span key={idx} className="block leading-tight">
                    {line}
                  </span>
                ))}
              </h3>

              {/* INGLESE SOTTO (A capo semantico logico prima dei connettori WITH, &, ecc.) */}
              <div className="text-xs font-semibold text-white/95 leading-snug drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                {currentScene.titleSecondary.split('\n').map((line, idx) => (
                  <span key={idx} className="block leading-snug">
                    {line}
                  </span>
                ))}
              </div>

              {/* PREZZO PIATTO / PIZZE 8" E 12" */}
              <div className="pt-1">
                {currentScene.pizzaSizes ? (
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-950/90 border border-amber-500/70 shadow-lg text-white font-mono font-bold text-xs whitespace-nowrap">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
                    <span className="inline-flex items-center gap-1">
                      <span className="text-amber-300 font-black">8"</span>
                      <span>{currentScene.pizzaSizes.size8Price} THB</span>
                    </span>
                    <span className="text-white/40 text-[10px]">•</span>
                    <span className="inline-flex items-center gap-1">
                      <span className="text-amber-300 font-black">12"</span>
                      <span>{currentScene.pizzaSizes.size12Price} THB</span>
                    </span>
                  </div>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-950/90 border border-amber-500/60 shadow-lg text-white font-mono font-bold text-xs whitespace-nowrap">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
                    <span>{currentScene.priceLabel}</span>
                  </span>
                )}
              </div>

              {/* ⚡ BADGE PRONTA CONSEGNA VELOCE PER DS (TASSATIVAMENTE THAI PRIMA, POI INGLESE) */}
              {mode === 'DS' && (
                <div className="pt-1.5 flex flex-col items-start gap-0.5 text-left">
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-black text-emerald-300 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] whitespace-nowrap">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                    <span>
                      {currentScene.isLiveShowcase
                        ? '🔥 ทำสดใหม่ พร้อมส่งทันทีในระนอง'
                        : '👨‍🍳 ปรุงสดใหม่ตามสั่ง สไตล์อิตาเลียนแท้'}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] whitespace-nowrap pl-3.5">
                    {currentScene.isLiveShowcase
                      ? 'Freshly Made Today · Ready for Immediate Delivery'
                      : 'Fresh Made to Order · Authentic Italian Taste'}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Caso ALLOGGI (V1, V2, V3, LM1): Nome alloggio + Sottotitolo semantico a capo, sotto traduzione secca in Thai */}
          {brand === 'village' && mode !== 'R1' && (
            <div className="space-y-1 w-full">
              {currentScene.badgeCategory && (
                <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-600/90 text-white text-[9px] font-bold tracking-wide shadow-md uppercase">
                  {currentScene.badgeCategory}
                </span>
              )}

              {/* INGLESE STRUTTURATO SEMANTICO (Nome alloggio in grande + Sottotitolo a capo pulito) */}
              <div className="leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
                {currentScene.lodgingTitle ? (
                  <>
                    <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                      {currentScene.lodgingTitle}
                    </h3>
                    {currentScene.lodgingSubtitle && (
                      <p className="text-xs sm:text-[13px] font-bold text-amber-300 leading-tight mt-0.5">
                        {currentScene.lodgingSubtitle}
                      </p>
                    )}
                  </>
                ) : (
                  <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                    {currentScene.titlePrimary}
                  </h3>
                )}
              </div>

              {/* THAI SECCO SOTTO (Senza riscrivere l'inglese) */}
              <p className="text-xs font-semibold text-stone-200/95 leading-snug drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] pt-0.5">
                {currentScene.titleSecondary}
              </p>

              {/* PREZZO OCTORATE LAST MINUTE: SOLO IN LM1 (Categoricamente rimosso da V1, V2, V3) */}
              {mode === 'LM1' && (
                <div className="pt-1.5">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.2 rounded-full bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 text-stone-950 font-bold text-xs shadow-lg border border-yellow-200/50">
                    <Sparkles className="w-3 h-3 text-stone-950 fill-stone-950" />
                    <span>{currentScene.priceLabel}</span>
                  </span>
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

      {/* 🖥️ 2. COMPANION LANDSCAPE PLAYER 4:3 (Google Maps & Facebook Feed) - Esclusivo per P1 e V1 */}
      {isCompanionEligible && !testRun.isEmptyShowcase && (
        <div className="w-full mt-4 flex flex-col items-center">
          {/* Header Pulito Google Maps 4:3 */}
          <div className="w-full flex items-center gap-2 px-1 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs font-bold text-slate-200 tracking-wide">
              Google Maps 4:3
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

            {/* Watermark Ufficiale 4:3 (Logo 3x + Titolo con riverbero nero + Sottotitolo Delivery / Direct Booking) */}
            <div className={`absolute top-3 left-3 z-30 flex items-center gap-2.5 pointer-events-none transition-all duration-300 ${
              isInOutro ? 'opacity-0 -translate-y-2' : 'opacity-100 translate-y-0'
            }`}>
              <img
                src={brand === 'pizza' ? '/flower-power-pizza-logo-512.png' : '/FP_04_-_LOGO_OFFICIAL_HD.png'}
                alt="Logo"
                className="w-10 h-10 rounded-full object-cover border-[1.5px] border-amber-400/80 shadow-[0_4px_14px_rgba(0,0,0,0.85)] shrink-0 bg-black/40"
              />
              <div className="flex flex-col text-left drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
                <span className="text-xs sm:text-[13px] font-black text-white uppercase tracking-wider leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
                  {brand === 'pizza' ? 'Flower Power Pizza' : 'Flower Power Village'}
                </span>
                <span className="text-[10px] sm:text-[10.5px] font-bold leading-tight mt-0.5 tracking-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] text-amber-300">
                  {brand === 'pizza' ? '🛵 Delivery Service' : '🌴 Direct Booking'}
                </span>
              </div>
            </div>

            {/* 🏷️ GERARCHIA TIPOGRAFICA SCALARE A VISTA (Zero box opaco, identica al 9:16) */}
            {currentScene && (
              <div className={`absolute left-3 right-3 bottom-3 z-30 flex flex-col items-start text-left pointer-events-none transition-all duration-300 ${
                isInOutro ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
              }`}>
                {/* Caso CIBO / PIATTI (P1): Categoria, Thai sopra in grande, Inglese sotto a scalare, prezzo */}
                {(brand === 'pizza' || mode === 'R1') && (
                  <div className="space-y-1 w-full">
                    {currentScene.badgeCategory && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black tracking-wide shadow-md uppercase bg-rose-600 text-white border border-rose-400">
                        {currentScene.badgeCategory}
                      </span>
                    )}

                    {/* THAI IN GRANDE SOPRA (A capo semantico logico) */}
                    <h3 className="text-sm sm:text-base font-black text-amber-300 leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
                      {currentScene.titlePrimary.split('\n').map((line, idx) => (
                        <span key={idx} className="block leading-tight">
                          {line}
                        </span>
                      ))}
                    </h3>

                    {/* INGLESE SOTTO (A capo semantico logico prima dei connettori) */}
                    <div className="text-[11px] sm:text-xs font-semibold text-white/95 leading-snug drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                      {currentScene.titleSecondary.split('\n').map((line, idx) => (
                        <span key={idx} className="block leading-snug">
                          {line}
                        </span>
                      ))}
                    </div>

                    {/* PREZZO PIATTO */}
                    {currentScene.priceLabel && (
                      <div className="pt-0.5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-stone-950/90 border border-amber-500/60 shadow-lg text-white font-mono font-bold text-[10px] whitespace-nowrap">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
                          <span>{currentScene.priceLabel}</span>
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Caso ALLOGGI (V1): Categoria, Nome Alloggio, Sottotitolo, Thai */}
                {brand === 'village' && mode !== 'R1' && (
                  <div className="space-y-1 w-full">
                    {currentScene.badgeCategory && (
                      <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-600/90 text-white text-[9px] font-bold tracking-wide shadow-md uppercase">
                        {currentScene.badgeCategory}
                      </span>
                    )}

                    <div className="leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
                      <h3 className="text-sm sm:text-base font-black text-white leading-tight">
                        {currentScene.lodgingTitle || currentScene.titlePrimary}
                      </h3>
                      {currentScene.lodgingSubtitle && (
                        <p className="text-[11px] sm:text-xs font-bold text-amber-300 leading-tight mt-0.5">
                          {currentScene.lodgingSubtitle}
                        </p>
                      )}
                    </div>

                    <p className="text-[10px] sm:text-[11px] font-semibold text-stone-200/95 leading-snug drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] pt-0.5">
                      {currentScene.titleSecondary}
                    </p>
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
