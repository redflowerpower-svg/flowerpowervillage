import { useState, useEffect, useRef } from 'react';
import { getOptimizedMediaUrl } from '../lib/mediaConfig';

export interface FoodItem {
  name: string;
  filename: string; // Relativo al bucket "delivery_food"
  origin: string;    // Smart focal point per inquadrare il piatto
}

const FOOD_CATEGORIES: Record<string, FoodItem[]> = {
  pizzeClassiche: [
    { name: 'Pizza Margherita', filename: '01-Pizza/02-pizza-margherita.webp', origin: '50% 50%' },
    { name: 'Pizza Bismarck', filename: '01-Pizza/05-pizza-bismark.webp', origin: '50% 50%' },
    { name: 'Pizza Capricciosa', filename: '01-Pizza/28-pizza-capricciosa.webp', origin: '50% 50%' }
  ],
  pasta: [
    { name: 'Spaghetti al Pomodoro', filename: '02-Pasta/Tomato Sauce/06-spaghetti-al-pomodoro.webp', origin: '50% 40%' },
    { name: 'Tagliatelle al Pesto', filename: '02-Pasta/Pesto Genovese/13-tagliatelle-al-pesto.webp', origin: '50% 40%' },
    { name: 'Penne all\'Amatriciana', filename: '02-Pasta/Amatriciana/17-penne-amatriciana.webp', origin: '50% 40%' }
  ],
  insalate: [
    { name: 'Egg and Vegetable Salad', filename: '04-Italian-Salads/01-egg-and-vegetable-salad.webp', origin: '50% 50%' },
    { name: 'Potato Salad', filename: '04-Italian-Salads/02-potato-salad.webp', origin: '50% 50%' }
  ],
  pizzaSandwich: [
    { name: 'Pizza Sandwich Parma Ham', filename: '05-Pizza-Sandwiches/01-pizza-sandwich-parma-ham.webp', origin: '50% 50%' },
    { name: 'Pizza Sandwich Salame', filename: '05-Pizza-Sandwiches/02-pizza-sandwich-salame.webp', origin: '50% 50%' }
  ],
  pizzaBurger: [
    { name: 'Chicken Pizza Burger', filename: '06-Pizza-Burgers/01-chicken-pizza-burger-with-french-fries.webp', origin: '50% 50%' },
    { name: 'Beef Pizza Burger', filename: '06-Pizza-Burgers/03-beef-pizza-burger-with-french-fries.webp', origin: '50% 50%' }
  ],
  patatine: [
    { name: 'French Fries', filename: '07-French-Fries/01-french-fries.webp', origin: '50% 50%' },
    { name: 'Onion Rings & French Fries', filename: '07-French-Fries/03-onion-rings-and-french-fries.webp', origin: '50% 50%' }
  ],
  dolci: [
    // { name: 'Tiramisu', filename: '08-Desserts/03-tiramisu.webp', origin: '50% 50%' },
    // { name: 'Pancake', filename: '08-Desserts/05-pancake.webp', origin: '50% 50%' }
  ],
  colazioneSnack: [
    { name: 'American Breakfast', filename: '09-Breakfast-and-Snacks/02-american-breakfast.webp', origin: '50% 50%' },
    { name: 'Italian Toast', filename: '09-Breakfast-and-Snacks/06-italian-toast.webp', origin: '50% 50%' }
  ],
  caffetteria: [
    { name: 'Caffè Espresso', filename: '10-Coffee-Shop/01-caffe-espresso.webp', origin: '50% 50%' },
    { name: 'Cappuccino', filename: '10-Coffee-Shop/03-cappuccino.webp', origin: '50% 50%' }
  ],
  bevandeFrutta: [
    { name: 'Smoothies Choice of Fruit', filename: '11-Fruit-Drinks/02-smoothies-choice-of-fruit.webp', origin: '50% 50%' },
    { name: 'Lassis Choice of Fruit', filename: '11-Fruit-Drinks/03-lassis-choice-of-fruit.webp', origin: '50% 50%' }
  ],
  vini: [
    //{ name: 'Italian Wines', filename: '14-Wines/01-italian-wines.webp', origin: '50% 50%' },
    //{ name: 'Wines From Around the World', filename: '14-Wines/02-wines-from-around-the-world.webp', origin: '50% 50%' }
  ]
};

const ANIMATION_CLASSES = [
  'kb-diagonal-up-left',
  'kb-diagonal-down-right',
  'kb-pan-slow-up',
  'kb-pan-slow-down',
  'kb-pan-slow-right',
  'kb-zoom-focus-bottom-left',
  'kb-zoom-focus-top-right'
];

const BASE_STORAGE_URL = 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food';
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

export default function PizzaSlideshow() {
  const [slotA, setSlotA] = useState<BufferSlot>({
    url: '', name: '', animClass: '', origin: '50% 50%', visible: false, animVer: 1
  });
  const [slotB, setSlotB] = useState<BufferSlot>({
    url: '', name: '', animClass: '', origin: '50% 50%', visible: false, animVer: 1
  });
  const [activeSlot, setActiveSlot] = useState<'A' | 'B'>('A');

  // References for category play queue
  const categoryQueue = useRef<string[]>([]);
  const lastCategory = useRef<string>('');
  const preloadedUrls = useRef<Set<string>>(new Set());

  // Fisher-Yates Shuffle to refill the category queue randomly
  const refillCategoryQueue = (excludeCategory: string) => {
    const categories = Object.keys(FOOD_CATEGORIES);

    // Rimescolamento
    for (let i = categories.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = categories[i];
      categories[i] = categories[j];
      categories[j] = temp;
    }

    // Prevent showing the same category back-to-back at the cycle boundary
    if (categories[0] === excludeCategory && categories.length > 1) {
      const targetIdx = 1 + Math.floor(Math.random() * (categories.length - 1));
      const temp = categories[0];
      categories[0] = categories[targetIdx];
      categories[targetIdx] = temp;
    }

    categoryQueue.current = categories;
  };

  const getNextFoodItem = (): { item: FoodItem; categoryName: string } => {
    if (categoryQueue.current.length === 0) {
      refillCategoryQueue(lastCategory.current);
    }
    const nextCategory = categoryQueue.current.shift() ?? 'pizzeClassiche';
    lastCategory.current = nextCategory;

    const items = FOOD_CATEGORIES[nextCategory];
    const randomItem = items[Math.floor(Math.random() * items.length)];
    return { item: randomItem, categoryName: nextCategory };
  };

  const getSlideUrl = (item: FoodItem) => {
    const rawUrl = `${BASE_STORAGE_URL}/${item.filename}`;
    // Always use 2K 'ken-burns' high-res preset for maximum sharpness in dynamic crops
    return getOptimizedMediaUrl(rawUrl, 'ken-burns');
  };

  const preloadImage = (url: string) => {
    if (!url || preloadedUrls.current.has(url)) return;
    preloadedUrls.current.add(url);
    const img = new Image();
    img.src = url;
  };

  // Proactive preloading of the next category items
  useEffect(() => {
    if (categoryQueue.current.length === 0) {
      refillCategoryQueue(lastCategory.current);
    }
    // Preload items from the next two categories
    categoryQueue.current.slice(0, 2).forEach(cat => {
      const items = FOOD_CATEGORIES[cat];
      items.forEach(item => preloadImage(getSlideUrl(item)));
    });
  }, [activeSlot]);

  // Initial setup: force first slide to be a Pizza (pizzeClassiche)
  useEffect(() => {
    const initialCategory = 'pizzeClassiche';
    const items = FOOD_CATEGORIES[initialCategory];
    const initialItem = items[Math.floor(Math.random() * items.length)];
    const randomAnim = ANIMATION_CLASSES[Math.floor(Math.random() * ANIMATION_CLASSES.length)];

    lastCategory.current = initialCategory;
    refillCategoryQueue(initialCategory);

    setSlotA({
      url: getSlideUrl(initialItem),
      name: initialItem.name,
      animClass: randomAnim,
      origin: initialItem.origin,
      visible: true,
      animVer: 1
    });
    setActiveSlot('A');
  }, []);

  // Timer loop for alternating buffers
  useEffect(() => {
    const interval = setInterval(() => {
      const { item } = getNextFoodItem();
      const randomAnim = ANIMATION_CLASSES[Math.floor(Math.random() * ANIMATION_CLASSES.length)];
      const nextUrl = getSlideUrl(item);

      if (activeSlot === 'A') {
        setSlotB(prev => ({
          url: nextUrl,
          name: item.name,
          animClass: randomAnim,
          origin: item.origin,
          visible: true,
          animVer: prev.animVer === 1 ? 2 : 1 // Alternate animVer suffix to reset animation
        }));
        setSlotA(prev => ({ ...prev, visible: false }));
        setActiveSlot('B');
      } else {
        setSlotA(prev => ({
          url: nextUrl,
          name: item.name,
          animClass: randomAnim,
          origin: item.origin,
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
