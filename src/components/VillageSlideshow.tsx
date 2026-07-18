import { useState, useEffect, useRef } from 'react';
import { getOptimizedMediaUrl } from '../lib/mediaConfig';

interface MotionSlide {
  name: string;
  folder: string;
  filename: string;
  origin: string;
}

const SLIDES: MotionSlide[] = [
  { name: 'Red Bungalow', folder: '01_red_bungalow', filename: '01-Main.jpg', origin: '50% 50%' },
  { name: 'Green Bungalow', folder: '02_green_bungalow', filename: '01-Main.jpg', origin: '20% 80%' },
  { name: 'Yellow Bungalow', folder: '03_yellow_bungalow', filename: '01-Main.jpg', origin: '50% 50%' },
  { name: 'Villa Penthouse', folder: '11_penthouse_villa', filename: '01-Main.jpg', origin: '85% 15%' },
  //{ name: 'Internal Room', folder: '21_internal_room', filename: '01-Main.jpg', origin: '50% 0%' },
  //{ name: 'Lagoon Tent Bungalow', folder: '22_lagoon_tent', filename: '01-Main.jpg', origin: '50% 100%' },
  { name: 'Camel Tent Bungalow', folder: '23_camel_tent', filename: '01-Main.jpg', origin: '20% 80%' },
  //{ name: 'Room 1', folder: '31_room_1', filename: '01-Main.jpg', origin: '0% 0%' },
  //{ name: 'Room 2', folder: '32_room_2', filename: '01-Main.jpg', origin: '0% 50%' },
  //{ name: 'Room 3', folder: '33_room_3', filename: '01-Main.jpg', origin: '100% 100%' },
  //{ name: 'Room 4', folder: '34_room_4', filename: '01-Main.jpg', origin: '50% 100%' },
  //{ name: 'Room 5', folder: '35_room_5', filename: '01-Main.jpg', origin: '50% 0%' },
  //{ name: 'Lodge 1', folder: '36_lodge_1', filename: '01-Main.jpg', origin: '50% 100%' },
  //{ name: 'Lodge 2', folder: '37_lodge_2', filename: '01-Main.jpg', origin: '0% 0%' },
  { name: 'Peace & Love Villa', folder: '41_peace_and_love_villa', filename: '01-Main.jpg', origin: '70% 60%' },
  //{ name: 'Jungle Villa Left', folder: '42_jungle_villa_left', filename: '01-Main.jpg', origin: '50% 100%' },
  //{ name: 'Jungle Villa Right', folder: '43_jungle_villa_right', filename: '01-Main.jpg', origin: '50% 100%' },
  { name: 'Jungle Villa', folder: '44_jungle_villa', filename: '01-Main.jpg', origin: '80% 20%' }
];

const ANIMATION_CLASSES = [
  'kb-diagonal-up-left',
  'kb-diagonal-down-right',
  'kb-pan-slow-up',
  'kb-pan-slow-down',
  'kb-pan-slow-right',
  'kb-zoom-focus-bottom-left',
  'kb-zoom-focus-top-right'
];

const BASE_STORAGE_URL = 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/accommodations';
const SLIDE_DURATION = 7000;
const FADE_DURATION = 2000;

interface BufferSlot {
  url: string;
  name: string;
  animClass: string;
  origin: string;
  visible: boolean;
  animVer: number; // Toggles between 1 and 2 to force CSS animation restart
}

export default function VillageSlideshow() {
  const [slotA, setSlotA] = useState<BufferSlot>({
    url: '', name: '', animClass: '', origin: '50% 50%', visible: false, animVer: 1
  });
  const [slotB, setSlotB] = useState<BufferSlot>({
    url: '', name: '', animClass: '', origin: '50% 50%', visible: false, animVer: 1
  });
  const [activeSlot, setActiveSlot] = useState<'A' | 'B'>('A');

  // References for random play queue
  const playQueue = useRef<number[]>([]);
  const currentIdxRef = useRef<number>(-1);
  const preloadedUrls = useRef<Set<string>>(new Set());

  // Fisher-Yates Shuffle to refill the play queue randomly
  const refillQueue = (excludeIndex: number) => {
    const indices = Array.from({ length: SLIDES.length }, (_, i) => i);

    // Rimescolamento
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = indices[i];
      indices[i] = indices[j];
      indices[j] = temp;
    }

    // Prevent displaying the same image back-to-back at the cycle boundary
    if (indices[0] === excludeIndex && indices.length > 1) {
      const targetIdx = 1 + Math.floor(Math.random() * (indices.length - 1));
      const temp = indices[0];
      indices[0] = indices[targetIdx];
      indices[targetIdx] = temp;
    }

    playQueue.current = indices;
  };

  const getNextSlideIndex = (): number => {
    if (playQueue.current.length === 0) {
      refillQueue(currentIdxRef.current);
    }
    const nextVal = playQueue.current.shift() ?? 0;
    currentIdxRef.current = nextVal;
    return nextVal;
  };

  const getSlideUrl = (slide: MotionSlide) => {
    const rawUrl = `${BASE_STORAGE_URL}/${slide.folder}/${slide.filename}`;
    // Always use 2K 'ken-burns' high-res preset for maximum sharpness in dynamic crops
    return getOptimizedMediaUrl(rawUrl, 'ken-burns');
  };

  const preloadImage = (url: string) => {
    if (!url || preloadedUrls.current.has(url)) return;
    preloadedUrls.current.add(url);
    const img = new Image();
    img.src = url;
  };

  // Preloading proattivo basato sulla coda casuale
  useEffect(() => {
    if (playQueue.current.length === 0) {
      refillQueue(currentIdxRef.current);
    }
    // Preload next two slides in the queue
    playQueue.current.slice(0, 2).forEach(idx => {
      preloadImage(getSlideUrl(SLIDES[idx]));
    });
  }, [activeSlot]);

  // Initial first slide setup
  useEffect(() => {
    const targetIdx = SLIDES.findIndex(s => s.name === 'Yellow Bungalow');
    const firstIdx = targetIdx !== -1 ? targetIdx : 0;

    const slide = SLIDES[firstIdx];
    const randomAnim = ANIMATION_CLASSES[Math.floor(Math.random() * ANIMATION_CLASSES.length)];

    currentIdxRef.current = firstIdx;
    refillQueue(firstIdx);

    setSlotA({
      url: getSlideUrl(slide),
      name: slide.name,
      animClass: randomAnim,
      origin: slide.origin,
      visible: true,
      animVer: 1
    });
    setActiveSlot('A');
  }, []);


  // Timer loop for alternating between the two buffers
  useEffect(() => {
    const interval = setInterval(() => {
      const nextIdx = getNextSlideIndex();
      const slide = SLIDES[nextIdx];
      const randomAnim = ANIMATION_CLASSES[Math.floor(Math.random() * ANIMATION_CLASSES.length)];
      const nextUrl = getSlideUrl(slide);

      if (activeSlot === 'A') {
        setSlotB(prev => ({
          url: nextUrl,
          name: slide.name,
          animClass: randomAnim,
          origin: slide.origin,
          visible: true,
          animVer: prev.animVer === 1 ? 2 : 1 // Alternate animVer suffix to reset animation
        }));
        setSlotA(prev => ({ ...prev, visible: false }));
        setActiveSlot('B');
      } else {
        setSlotA(prev => ({
          url: nextUrl,
          name: slide.name,
          animClass: randomAnim,
          origin: slide.origin,
          visible: true,
          animVer: prev.animVer === 1 ? 2 : 1 // Alternate animVer suffix to reset animation
        }));
        setSlotB(prev => ({ ...prev, visible: false }));
        setActiveSlot('A');
      }
    }, SLIDE_DURATION);

    return () => clearInterval(interval);
  }, [activeSlot]);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-stone-950 z-0 select-none pointer-events-none">
      <style>{`
        /* Cinematic motion design vector keyframes */
        @keyframes kb-diagonal-up-left {
          0% { transform: scale3d(1.05, 1.05, 1) translate3d(0, 0, 0); }
          100% { transform: scale3d(1.22, 1.22, 1) translate3d(-3%, -3%, 0); }
        }
        @keyframes kb-diagonal-down-right {
          0% { transform: scale3d(1.25, 1.25, 1) translate3d(-4%, -4%, 0); }
          100% { transform: scale3d(1.08, 1.08, 1) translate3d(0, 0, 0); }
        }
        @keyframes kb-pan-slow-up {
          0% { transform: scale3d(1.10, 1.10, 1) translate3d(0, 2%, 0); }
          100% { transform: scale3d(1.20, 1.20, 1) translate3d(0, -2%, 0); }
        }
        @keyframes kb-pan-slow-down {
          0% { transform: scale3d(1.10, 1.10, 1) translate3d(0, -2%, 0); }
          100% { transform: scale3d(1.20, 1.20, 1) translate3d(0, 2%, 0); }
        }
        @keyframes kb-pan-slow-right {
          0% { transform: scale3d(1.06, 1.06, 1) translate3d(-2%, 0, 0); }
          100% { transform: scale3d(1.18, 1.18, 1) translate3d(2%, 0, 0); }
        }
        @keyframes kb-zoom-focus-bottom-left {
          0% { transform: scale3d(1.08, 1.08, 1); }
          100% { transform: scale3d(1.28, 1.28, 1); }
        }
        @keyframes kb-zoom-focus-top-right {
          0% { transform: scale3d(1.08, 1.08, 1); }
          100% { transform: scale3d(1.28, 1.28, 1); }
        }

        .cinematic-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          will-change: transform;
          backface-visibility: hidden;
          perspective: 1000px;
          animation-duration: ${SLIDE_DURATION + 1000}ms;
          animation-fill-mode: forwards;
          animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        /* Class bindings with version suffixes to force animation refresh on same motion types */
        ${ANIMATION_CLASSES.map(cls => `
          .${cls}-v1 { animation-name: ${cls}; }
          .${cls}-v2 { animation-name: ${cls}; }
        `).join('\n')}
      `}</style>

      {/* BUFFER SLOT A */}
      <div
        className="absolute inset-0 w-full h-full transition-opacity ease-in-out"
        style={{
          opacity: slotA.visible ? 1 : 0,
          zIndex: slotA.visible ? 20 : 10,
          transitionDuration: `${FADE_DURATION}ms`
        }}
      >
        {slotA.url && (
          <img
            src={slotA.url}
            alt={slotA.name}
            className={`cinematic-img ${slotA.animClass}-v${slotA.animVer}`}
            style={{ transformOrigin: slotA.origin }}
          />
        )}
      </div>

      {/* BUFFER SLOT B */}
      <div
        className="absolute inset-0 w-full h-full transition-opacity ease-in-out"
        style={{
          opacity: slotB.visible ? 1 : 0,
          zIndex: slotB.visible ? 20 : 10,
          transitionDuration: `${FADE_DURATION}ms`
        }}
      >
        {slotB.url && (
          <img
            src={slotB.url}
            alt={slotB.name}
            className={`cinematic-img ${slotB.animClass}-v${slotB.animVer}`}
            style={{ transformOrigin: slotB.origin }}
          />
        )}
      </div>
    </div>
  );
}
