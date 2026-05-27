import { useState, useCallback, useRef, useEffect } from 'react';

interface Props {
  onSelectVillage: () => void;
  onSelectPizza: () => void;
}

export default function SplitScreen({ onSelectVillage, onSelectPizza }: Props) {
  const [isMobile, setIsMobile] = useState(false);
  // 0.0 = all village, 1.0 = all pizza, 0.5 = center
  const [splitRatio, setSplitRatio] = useState(0.5);
  const [userMoved, setUserMoved] = useState(false);
  // hover state used only on desktop
  const [activePanel, setActivePanel] = useState<'none' | 'village' | 'pizza'>('none');

  const containerRef = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStartPos = useRef(0);
  const hasDragged = useRef(false);

  // ── Detect mobile on first touch ──
  const handleTouchDetect = useCallback(() => setIsMobile(true), []);

  // ── Compute new ratio from pointer position ──
  const computeRatio = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const isHoriz = window.innerWidth >= 768;
    const raw = isHoriz
      ? (clientX - rect.left) / rect.width
      : (clientY - rect.top) / rect.height;
    setSplitRatio(Math.max(0.1, Math.min(0.9, raw)));
    setUserMoved(true);
  }, []);

  // ── Attach non-passive touch listeners to the divider element ──
  useEffect(() => {
    const el = dividerRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      isDragging.current = true;
      hasDragged.current = false;
      dragStartPos.current = window.innerWidth >= 768
        ? e.touches[0].clientX
        : e.touches[0].clientY;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging.current) return;
      const pos = window.innerWidth >= 768
        ? e.touches[0].clientX
        : e.touches[0].clientY;
      if (Math.abs(pos - dragStartPos.current) > 6) {
        hasDragged.current = true;
      }
      e.preventDefault();
      computeRatio(e.touches[0].clientX, e.touches[0].clientY);
    };

    const onTouchEnd = () => {
      isDragging.current = false;
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [computeRatio]);

  // ── Mouse drag listeners (desktop) ──
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      hasDragged.current = true;
      computeRatio(e.clientX, e.clientY);
    };
    const onMouseUp = () => { isDragging.current = false; };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [computeRatio]);

  // ── Flex values ──
  let villageFlex: string;
  let pizzaFlex: string;

  if (userMoved) {
    villageFlex = String(splitRatio);
    pizzaFlex = String(1 - splitRatio);
  } else {
    const expandRatio = isMobile ? '2.4' : '1.6';
    const collapseRatio = isMobile ? '0.25' : '0.4';
    villageFlex = activePanel === 'village' ? expandRatio : activePanel === 'pizza' ? collapseRatio : '1';
    pizzaFlex = activePanel === 'pizza' ? expandRatio : activePanel === 'village' ? collapseRatio : '1';
  }

  const villageExpanded = !userMoved && activePanel === 'village';
  const pizzaExpanded = !userMoved && activePanel === 'pizza';

  // ── Panel click/tap handlers ──
  const handleVillageClick = () => {
    if (!isMobile && !hasDragged.current) onSelectVillage();
  };
  const handlePizzaClick = () => {
    if (!isMobile && !hasDragged.current) onSelectPizza();
  };

  const handleVillageTouch = (e: React.TouchEvent) => {
    if (hasDragged.current) return;
    e.preventDefault();
    if (activePanel === 'village') {
      onSelectVillage();
    } else {
      setActivePanel('village');
      setUserMoved(false);
    }
  };
  const handlePizzaTouch = (e: React.TouchEvent) => {
    if (hasDragged.current) return;
    e.preventDefault();
    if (activePanel === 'pizza') {
      onSelectPizza();
    } else {
      setActivePanel('pizza');
      setUserMoved(false);
    }
  };

  const transition = isDragging.current ? 'none' : 'flex 0.7s cubic-bezier(0.4, 0, 0.2, 1)';

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 flex flex-col md:flex-row overflow-hidden select-none"
      onTouchStart={handleTouchDetect}
    >

      {/* ── Pannello Village ── */}
      <div
        className="relative overflow-hidden"
        style={{
          flex: villageFlex,
          transition,
          backgroundColor: '#4a5a2e',
          cursor: isMobile ? 'default' : 'pointer',
        }}
        onMouseEnter={() => { if (!isMobile && !isDragging.current) setActivePanel('village'); }}
        onMouseLeave={() => { if (!isMobile && !isDragging.current) setActivePanel('none'); }}
        onClick={handleVillageClick}
        onTouchStart={handleVillageTouch}
      >
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, #6b7f3a 0%, #3a4820 60%, #2a3415 100%)' }} />
        <div className="absolute inset-0 flex items-center justify-center" style={{ transform: villageExpanded ? 'scale(1.05)' : 'scale(1)', transition: 'transform 0.9s cubic-bezier(0.4, 0, 0.2, 1)' }}>
          <img
            src="/FP_04_-_LOGO_OFFICIAL_HD.png"
            alt="Flower Power Farm Village"
            draggable={false}
            style={{ width: 'min(75%, 420px)', height: 'auto', objectFit: 'contain', opacity: pizzaExpanded ? 0.25 : 0.92, transition: 'opacity 0.5s ease', filter: 'drop-shadow(0 8px 32px rgba(0,0,0,0.45))', pointerEvents: 'none' }}
          />
        </div>
        <div
          className="absolute bottom-0 left-0 right-0 flex flex-col items-center pb-8 md:pb-10"
          style={{ opacity: pizzaExpanded ? 0 : 1, pointerEvents: pizzaExpanded ? 'none' : 'auto', transition: 'opacity 0.4s ease', background: 'linear-gradient(to top, rgba(42,52,21,0.85) 0%, transparent 100%)', paddingTop: '48px' }}
        >
          <p className="text-xs tracking-[0.3em] uppercase mb-3 font-light" style={{ fontFamily: 'Inter, sans-serif', color: 'rgba(255,255,255,0.75)' }}>Koh Phayam · Thailand</p>
          <button className="hidden md:block px-7 py-2.5 border border-white text-white text-xs tracking-[0.2em] uppercase hover:bg-white hover:text-stone-800 transition-all duration-300" style={{ fontFamily: 'Inter, sans-serif' }}>Explore Village</button>
          {villageExpanded && isMobile && (
            <button className="md:hidden px-10 py-3 bg-white text-stone-800 text-sm tracking-[0.2em] uppercase font-semibold shadow-lg" style={{ fontFamily: 'Inter, sans-serif', animation: 'pulse-cta 1.8s ease-in-out infinite' }}>Tap to Enter</button>
          )}
          {!villageExpanded && isMobile && (
            <button className="md:hidden px-7 py-2.5 border border-white text-white text-xs tracking-[0.2em] uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>Explore Village</button>
          )}
        </div>
        {pizzaExpanded && (
          <div className="absolute inset-0 items-center justify-center hidden md:flex">
            <span className="text-white text-sm tracking-[0.3em] uppercase" style={{ writingMode: 'vertical-rl', fontFamily: 'Inter, sans-serif', fontWeight: 300, opacity: 0.5 }}>Village & Spa</span>
          </div>
        )}
      </div>

      {/* ── Divisore trascinabile ── */}
      <div
        ref={dividerRef}
        className="relative z-20 flex-shrink-0 flex items-center justify-center"
        style={{
          // Desktop: thin vertical bar with real width; Mobile: thin horizontal bar with real height
          width: isMobile ? '100%' : 'clamp(32px, 4vw, 48px)',
          height: isMobile ? 'clamp(32px, 6vh, 48px)' : '100%',
          cursor: 'grab',
        }}
        onMouseDown={e => {
          e.preventDefault();
          isDragging.current = true;
          hasDragged.current = false;
          dragStartPos.current = e.clientX;
        }}
      >
        {/* Desktop: vertical line */}
        <div className="hidden md:block absolute inset-y-0 left-1/2 -translate-x-1/2 pointer-events-none" style={{ width: '1px', background: 'rgba(255,255,255,0.35)' }} />

        {/* Mobile: horizontal line — positioned relative to the divider element */}
        <div className="block md:hidden absolute left-0 right-0 top-1/2 -translate-y-1/2 pointer-events-none" style={{ height: '1px', background: 'rgba(255,255,255,0.35)' }} />

        {/* Handle circle */}
        <div
          className="relative z-10 flex items-center justify-center"
          style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.5)', background: 'rgba(15,15,15,0.6)', backdropFilter: 'blur(8px)', boxShadow: '0 2px 14px rgba(0,0,0,0.45)' }}
        >
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.75)' }} />
        </div>

        {/* Directional arrows hint */}
        <svg className="absolute pointer-events-none hidden md:block" width="44" height="14" viewBox="0 0 44 14" fill="none" style={{ opacity: 0.4 }}>
          <path d="M15 7 L5 7 M5 7 L9 4 M5 7 L9 10" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M29 7 L39 7 M39 7 L35 4 M39 7 L35 10" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {/* Mobile: vertical arrows */}
        <svg className="absolute pointer-events-none block md:hidden" width="14" height="44" viewBox="0 0 14 44" fill="none" style={{ opacity: 0.4 }}>
          <path d="M7 15 L7 5 M7 5 L4 9 M7 5 L10 9" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M7 29 L7 39 M7 39 L4 35 M7 39 L10 35" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* ── Pannello Pizza ── */}
      <div
        className="relative overflow-hidden"
        style={{
          flex: pizzaFlex,
          transition,
          backgroundColor: '#2c2a24',
          cursor: isMobile ? 'default' : 'pointer',
        }}
        onMouseEnter={() => { if (!isMobile && !isDragging.current) setActivePanel('pizza'); }}
        onMouseLeave={() => { if (!isMobile && !isDragging.current) setActivePanel('none'); }}
        onClick={handlePizzaClick}
        onTouchStart={handlePizzaTouch}
      >
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, #4a4538 0%, #2c2820 60%, #1a1810 100%)' }} />
        <div className="absolute inset-0 flex items-center justify-center" style={{ transform: pizzaExpanded ? 'scale(1.05)' : 'scale(1)', transition: 'transform 0.9s cubic-bezier(0.4, 0, 0.2, 1)' }}>
          <img
            src="/Flower_Power_Pizza_-_HotSpring.png"
            alt="Flower Power Pizza Ranong"
            draggable={false}
            style={{ width: 'min(75%, 420px)', height: 'auto', objectFit: 'contain', opacity: villageExpanded ? 0.25 : 0.92, transition: 'opacity 0.5s ease', filter: 'drop-shadow(0 8px 32px rgba(0,0,0,0.5))', pointerEvents: 'none' }}
          />
        </div>
        <div
          className="absolute bottom-0 left-0 right-0 flex flex-col items-center pb-8 md:pb-10"
          style={{ opacity: villageExpanded ? 0 : 1, pointerEvents: villageExpanded ? 'none' : 'auto', transition: 'opacity 0.4s ease', background: 'linear-gradient(to top, rgba(26,24,16,0.85) 0%, transparent 100%)', paddingTop: '48px' }}
        >
          <p className="text-xs tracking-[0.3em] uppercase mb-3 font-light" style={{ fontFamily: 'Inter, sans-serif', color: 'rgba(255,255,255,0.75)' }}>Ranong · Thailand</p>
          <button className="hidden md:block px-7 py-2.5 border border-white text-white text-xs tracking-[0.2em] uppercase hover:bg-white hover:text-stone-800 transition-all duration-300" style={{ fontFamily: 'Inter, sans-serif' }}>See Our Menu</button>
          {pizzaExpanded && isMobile && (
            <button className="md:hidden px-10 py-3 bg-white text-stone-800 text-sm tracking-[0.2em] uppercase font-semibold shadow-lg" style={{ fontFamily: 'Inter, sans-serif', animation: 'pulse-cta 1.8s ease-in-out infinite' }}>Tap to Enter</button>
          )}
          {!pizzaExpanded && isMobile && (
            <button className="md:hidden px-7 py-2.5 border border-white text-white text-xs tracking-[0.2em] uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>See Our Menu</button>
          )}
        </div>
        {villageExpanded && (
          <div className="absolute inset-0 items-center justify-center hidden md:flex">
            <span className="text-white text-sm tracking-[0.3em] uppercase" style={{ writingMode: 'vertical-rl', fontFamily: 'Inter, sans-serif', fontWeight: 300, opacity: 0.5 }}>Pizza Ranong</span>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse-cta {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.75; transform: scale(0.97); }
        }
        /* Mobile: divider becomes a horizontal bar */
        @media (max-width: 767px) {
          .divider-bar {
            width: auto !important;
            height: clamp(32px, 6vh, 48px) !important;
          }
        }
      `}</style>
    </div>
  );
}
