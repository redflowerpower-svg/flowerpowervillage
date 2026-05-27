import { useState, useCallback, useRef, useEffect } from 'react';

interface Props {
  onSelectVillage: () => void;
  onSelectPizza: () => void;
}

export default function SplitScreen({ onSelectVillage, onSelectPizza }: Props) {
  const [activePanel, setActivePanel] = useState<'none' | 'village' | 'pizza'>('none');
  const [isMobile, setIsMobile] = useState(false);

  // Split position: 0.0 = all village, 1.0 = all pizza, 0.5 = center
  const [splitRatio, setSplitRatio] = useState(0.5);
  const isDragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragMoved = useRef(false);

  const handleTouchDetect = useCallback(() => {
    setIsMobile(true);
  }, []);

  // ── Drag logic ──

  const applyDrag = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const isHoriz = window.innerWidth >= 768; // md breakpoint
    const ratio = isHoriz
      ? (clientX - rect.left) / rect.width
      : (clientY - rect.top) / rect.height;
    setSplitRatio(Math.max(0.1, Math.min(0.9, ratio)));
    dragMoved.current = true;
  }, []);

  const startDrag = useCallback((clientX: number, clientY: number) => {
    isDragging.current = true;
    dragMoved.current = false;
    applyDrag(clientX, clientY);
  }, [applyDrag]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      applyDrag(e.clientX, e.clientY);
    };
    const onMouseUp = () => {
      isDragging.current = false;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging.current) return;
      e.preventDefault();
      applyDrag(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onTouchEnd = () => {
      isDragging.current = false;
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [applyDrag]);

  // Flex values driven by splitRatio when dragged, otherwise by hover/tap state
  const useDragRatio = splitRatio !== 0.5 || isDragging.current;

  let villageFlex: string;
  let pizzaFlex: string;

  if (useDragRatio) {
    villageFlex = String(splitRatio);
    pizzaFlex = String(1 - splitRatio);
  } else {
    const expandRatio = isMobile ? '2.4' : '1.6';
    const collapseRatio = isMobile ? '0.25' : '0.4';
    const villageExpanded = activePanel === 'village';
    const pizzaExpanded = activePanel === 'pizza';
    villageFlex = villageExpanded ? expandRatio : pizzaExpanded ? collapseRatio : '1';
    pizzaFlex = pizzaExpanded ? expandRatio : villageExpanded ? collapseRatio : '1';
  }

  const villageExpanded = activePanel === 'village';
  const pizzaExpanded = activePanel === 'pizza';

  const handleVillageClick = () => {
    if (!isMobile && !dragMoved.current) onSelectVillage();
  };
  const handlePizzaClick = () => {
    if (!isMobile && !dragMoved.current) onSelectPizza();
  };

  const handleVillageTouch = (e: React.TouchEvent) => {
    // Only intercept single-tap on panel, not drag start
    if (isDragging.current) return;
    e.preventDefault();
    if (activePanel === 'village') {
      onSelectVillage();
    } else {
      setActivePanel('village');
    }
  };
  const handlePizzaTouch = (e: React.TouchEvent) => {
    if (isDragging.current) return;
    e.preventDefault();
    if (activePanel === 'pizza') {
      onSelectPizza();
    } else {
      setActivePanel('pizza');
    }
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 flex flex-col md:flex-row overflow-hidden"
      onTouchStart={handleTouchDetect}
    >

      {/* ── Pannello Village ── */}
      <div
        className="relative overflow-hidden"
        style={{
          flex: villageFlex,
          transition: isDragging.current ? 'none' : 'flex 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
          backgroundColor: '#4a5a2e',
          cursor: isMobile ? 'default' : 'pointer',
        }}
        onMouseEnter={() => { if (!isMobile && !isDragging.current) setActivePanel('village'); }}
        onMouseLeave={() => { if (!isMobile) setActivePanel('none'); }}
        onClick={handleVillageClick}
        onTouchStart={handleVillageTouch}
      >
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at center, #6b7f3a 0%, #3a4820 60%, #2a3415 100%)' }}
        />
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            transform: villageExpanded ? 'scale(1.05)' : 'scale(1)',
            transition: 'transform 0.9s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <img
            src="/FP_04_-_LOGO_OFFICIAL_HD.png"
            alt="Flower Power Farm Village"
            style={{
              width: 'min(75%, 420px)',
              height: 'auto',
              objectFit: 'contain',
              opacity: pizzaExpanded ? 0.25 : 0.92,
              transition: 'opacity 0.5s ease',
              filter: 'drop-shadow(0 8px 32px rgba(0,0,0,0.45))',
              userSelect: 'none',
              pointerEvents: 'none',
            }}
          />
        </div>
        <div
          className="absolute bottom-0 left-0 right-0 flex flex-col items-center pb-8 md:pb-10"
          style={{
            opacity: pizzaExpanded ? 0 : 1,
            pointerEvents: pizzaExpanded ? 'none' : 'auto',
            transition: 'opacity 0.4s ease',
            background: 'linear-gradient(to top, rgba(42,52,21,0.85) 0%, transparent 100%)',
            paddingTop: '48px',
          }}
        >
          <p className="text-xs tracking-[0.3em] uppercase mb-3 font-light" style={{ fontFamily: 'Inter, sans-serif', color: 'rgba(255,255,255,0.75)' }}>
            Koh Phayam · Thailand
          </p>
          <button className="hidden md:block px-7 py-2.5 border border-white text-white text-xs tracking-[0.2em] uppercase hover:bg-white hover:text-stone-800 transition-all duration-300" style={{ fontFamily: 'Inter, sans-serif' }}>
            Explore Village
          </button>
          {villageExpanded && isMobile && (
            <button className="md:hidden px-10 py-3 bg-white text-stone-800 text-sm tracking-[0.2em] uppercase font-semibold shadow-lg" style={{ fontFamily: 'Inter, sans-serif', animation: 'pulse-cta 1.8s ease-in-out infinite' }}>
              Tap to Enter
            </button>
          )}
          {!villageExpanded && isMobile && (
            <button className="md:hidden px-7 py-2.5 border border-white text-white text-xs tracking-[0.2em] uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>
              Explore Village
            </button>
          )}
        </div>
        {pizzaExpanded && (
          <div className="absolute inset-0 items-center justify-center hidden md:flex">
            <span className="text-white text-sm tracking-[0.3em] uppercase" style={{ writingMode: 'vertical-rl', fontFamily: 'Inter, sans-serif', fontWeight: 300, opacity: 0.5 }}>
              Village & Spa
            </span>
          </div>
        )}
      </div>

      {/* ── Divisore trascinabile ── */}
      <div
        className="relative z-20 flex-shrink-0 flex items-center justify-center"
        style={{
          // Zero thickness — the visible line is painted inside
          width: 0,
          height: 0,
          overflow: 'visible',
          cursor: 'col-resize',
        }}
        onMouseDown={e => {
          e.preventDefault();
          startDrag(e.clientX, e.clientY);
        }}
        onTouchStart={e => {
          // Don't call handleTouchDetect here — just start dragging
          startDrag(e.touches[0].clientX, e.touches[0].clientY);
        }}
      >
        {/* Vertical line (desktop) */}
        <div
          className="hidden md:block absolute pointer-events-none"
          style={{
            width: '1px',
            top: 0,
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(255,255,255,0.4)',
          }}
        />
        {/* Horizontal line (mobile) */}
        <div
          className="block md:hidden absolute pointer-events-none"
          style={{
            height: '1px',
            left: 0,
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(255,255,255,0.4)',
          }}
        />

        {/* Drag handle — pill con pallino */}
        <div
          className="relative z-10 flex items-center justify-center"
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.55)',
            background: 'rgba(20,20,20,0.55)',
            backdropFilter: 'blur(6px)',
            boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
            cursor: 'col-resize',
          }}
        >
          {/* Pallino centrale */}
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.7)' }} />
        </div>

        {/* Frecce direzionali sottili */}
        <svg
          className="absolute pointer-events-none"
          width="40" height="14" viewBox="0 0 40 14" fill="none"
          style={{ opacity: 0.45 }}
        >
          {/* freccia sinistra */}
          <path d="M14 7 L6 7 M6 7 L10 4 M6 7 L10 10" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
          {/* freccia destra */}
          <path d="M26 7 L34 7 M34 7 L30 4 M34 7 L30 10" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* ── Pannello Pizza ── */}
      <div
        className="relative overflow-hidden"
        style={{
          flex: pizzaFlex,
          transition: isDragging.current ? 'none' : 'flex 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
          backgroundColor: '#2c2a24',
          cursor: isMobile ? 'default' : 'pointer',
        }}
        onMouseEnter={() => { if (!isMobile && !isDragging.current) setActivePanel('pizza'); }}
        onMouseLeave={() => { if (!isMobile) setActivePanel('none'); }}
        onClick={handlePizzaClick}
        onTouchStart={handlePizzaTouch}
      >
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at center, #4a4538 0%, #2c2820 60%, #1a1810 100%)' }}
        />
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            transform: pizzaExpanded ? 'scale(1.05)' : 'scale(1)',
            transition: 'transform 0.9s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <img
            src="/Flower_Power_Pizza_-_HotSpring.png"
            alt="Flower Power Pizza Ranong"
            style={{
              width: 'min(75%, 420px)',
              height: 'auto',
              objectFit: 'contain',
              opacity: villageExpanded ? 0.25 : 0.92,
              transition: 'opacity 0.5s ease',
              filter: 'drop-shadow(0 8px 32px rgba(0,0,0,0.5))',
              userSelect: 'none',
              pointerEvents: 'none',
            }}
          />
        </div>
        <div
          className="absolute bottom-0 left-0 right-0 flex flex-col items-center pb-8 md:pb-10"
          style={{
            opacity: villageExpanded ? 0 : 1,
            pointerEvents: villageExpanded ? 'none' : 'auto',
            transition: 'opacity 0.4s ease',
            background: 'linear-gradient(to top, rgba(26,24,16,0.85) 0%, transparent 100%)',
            paddingTop: '48px',
          }}
        >
          <p className="text-xs tracking-[0.3em] uppercase mb-3 font-light" style={{ fontFamily: 'Inter, sans-serif', color: 'rgba(255,255,255,0.75)' }}>
            Ranong · Thailand
          </p>
          <button className="hidden md:block px-7 py-2.5 border border-white text-white text-xs tracking-[0.2em] uppercase hover:bg-white hover:text-stone-800 transition-all duration-300" style={{ fontFamily: 'Inter, sans-serif' }}>
            See Our Menu
          </button>
          {pizzaExpanded && isMobile && (
            <button className="md:hidden px-10 py-3 bg-white text-stone-800 text-sm tracking-[0.2em] uppercase font-semibold shadow-lg" style={{ fontFamily: 'Inter, sans-serif', animation: 'pulse-cta 1.8s ease-in-out infinite' }}>
              Tap to Enter
            </button>
          )}
          {!pizzaExpanded && isMobile && (
            <button className="md:hidden px-7 py-2.5 border border-white text-white text-xs tracking-[0.2em] uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>
              See Our Menu
            </button>
          )}
        </div>
        {villageExpanded && (
          <div className="absolute inset-0 items-center justify-center hidden md:flex">
            <span className="text-white text-sm tracking-[0.3em] uppercase" style={{ writingMode: 'vertical-rl', fontFamily: 'Inter, sans-serif', fontWeight: 300, opacity: 0.5 }}>
              Pizza Ranong
            </span>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse-cta {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.75; transform: scale(0.97); }
        }
      `}</style>
    </div>
  );
}
