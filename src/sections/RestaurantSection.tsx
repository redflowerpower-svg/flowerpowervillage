import { useState } from 'react';
import { Clock, UtensilsCrossed, ChevronLeft, ChevronRight, Maximize2, X, ZoomIn, ZoomOut, BookOpen, Wine, ArrowRight } from 'lucide-react';
import { Language } from '../booking/lib/translations';

const menuPages = [
  { file: '01 - Cover.jpg', titleKey: 0 },
  { file: '02 - Coffee.jpg', titleKey: 1 },
  { file: '03 - Drinks.jpg', titleKey: 2 },
  { file: '04 - Bruschetta.jpg', titleKey: 3 },
  { file: '05 - Pasta.jpg', titleKey: 4 },
  { file: '06 - Focaccia.jpg', titleKey: 5 },
  { file: '07 - Sandwich.jpg', titleKey: 6 },
  { file: '08 - Italian.jpg', titleKey: 7 },
  { file: '09 - Fish.jpg', titleKey: 8 },
  { file: '10 - Fusion.jpg', titleKey: 9 },
  { file: '11 - Pizza.jpg', titleKey: 10 },
  { file: '12 - Myanmar.jpg', titleKey: 11 },
  { file: '13 - Thai.jpg', titleKey: 12 },
  { file: '14 - Vegan.jpg', titleKey: 13 },
  { file: '15 - BnB.jpg', titleKey: 14 },
];

const pageTitleTranslations = {
  IT: [
    'Flower Power Menu', 'Caffetteria & Colazioni', 'Bevande & Cocktails', 'Antipasti & Bruschette', 
    'Primi Piatti (Pasta Fresca)', 'Le Nostre Focacce', 'Panini & Sandwich', 'Cucina Italiana', 
    'Secondi di Pesce', 'Cucina Fusion', 'Le Nostre Pizze', 'Specialità Birmane', 
    'Cucina Thailandese', 'Opzioni Vegane', 'Bed & Breakfast & Snack'
  ],
  EN: [
    'Flower Power Menu', 'Coffee & Breakfast', 'Drinks & Cocktails', 'Appetizers & Bruschette', 
    'First Courses (Fresh Pasta)', 'Our Focaccias', 'Panini & Sandwiches', 'Italian Cuisine', 
    'Fish Main Courses', 'Fusion Cuisine', 'Our Pizzas', 'Burmese Specialties', 
    'Thai Cuisine', 'Vegan Options', 'Bed & Breakfast & Snacks'
  ],
  TH: [
    'เมนูดอกไม้บาน', 'เมนูกาแฟ & เครื่องดื่มร้อน', 'เครื่องดื่ม & ค็อกเทล', 'อาหารเรียกน้ำย่อย & บรูสเก็ตตา', 
    'พาสต้าเส้นสดจานแรก', 'โฟคาชชาสูตรพิเศษ', 'พานินี่ & แซนด์วิช', 'อาหารอิตาเลียนดั้งเดิม', 
    'อาหารจานหลักจากปลา', 'อาหารฟิวชั่น', 'พิซซ่าอิตาเลียนดั้งเดิม', 'อาหารพม่าสูตรพิเศษ', 
    'อาหารไทยยอดนิยม', 'เมนูมังสวิรัติ (วีแกน)', 'อาหารเช้า & ของว่าง'
  ],
  DE: [
    'Flower Power Menü', 'Kaffeespezialitäten & Frühstück', 'Getränke & Cocktails', 'Vorspeisen & Bruschetta', 
    'Nudelgerichte (Frische Pasta)', 'Unsere Focaccias', 'Panini & Sandwiches', 'Italienische Küche', 
    'Fischgerichte', 'Fusion-Küche', 'Unsere Pizzas', 'Birmanische Spezialitäten', 
    'Thailändische Küche', 'Vegane Optionen', 'Bed & Breakfast & Snacks'
  ]
};

const restaurantLabels = {
  IT: {
    tag: 'Autentica Cucina Italiana & Sapori Locali',
    title: 'L’Italia incontra le spiagge di Koh Phayam',
    desc: 'Il ristorante del Flower Power è un crocevia di culture culinarie. Proponiamo piatti della tradizione italiana al 100% — con autentica pizza tradizionale italiana e pasta fresca fatta in casa — affiancati da specialità tipiche tailandesi e birmane e un intero menu dedicato a ricette vegane e salutari.',
    hours: '08:00 – 21:15 daily',
    meals: 'Breakfast · Lunch · Dinner',
    browseMenu: 'Sfoglia il Menù come un Vero Libro',
    browseDesc: 'Scorri con il dito verso destra o sinistra, oppure usa le frecce per voltare pagina, proprio come un vero menù cartaceo. Tocca l’immagine per aprirla a schermo intero.',
    swipeHint: 'Scorri con il dito o usa le frecce per voltare pagina',
    fullscreen: 'Schermo Intero',
    pageText: 'Pagina {current} di {total}',
    prevPage: 'Precedente',
    nextPage: 'Successiva',
    allPages: 'Indice Visivo di Tutte le 15 Pagine',
    disclaimer: 'Le proposte ed i prezzi del menù sono soggetti a variazioni in base alla stagionalità ed alla reperibilità degli ingredienti locali freschi dell’isola.',
    close: 'Chiudi'
  },
  EN: {
    tag: 'Authentic Italian Cuisine & Local Flavours',
    title: 'Italy Meets the Beaches of Koh Phayam',
    desc: 'Flower Power’s restaurant is a culinary crossroads. We serve 100% traditional Italian dishes — with authentic traditional Italian pizza and homemade fresh pasta — alongside typical Thai and Burmese specialties, and a complete menu dedicated to vegan and healthy recipes.',
    hours: '08:00 – 21:15 daily',
    meals: 'Breakfast · Lunch · Dinner',
    browseMenu: 'Flip Through the Menu Like a Real Book',
    browseDesc: 'Swipe left or right with your finger, or use the arrows to turn pages, just like a real paper menu. Tap the image to view in full screen.',
    swipeHint: 'Swipe or use arrows to turn pages',
    fullscreen: 'Full Screen',
    pageText: 'Page {current} of {total}',
    prevPage: 'Previous',
    nextPage: 'Next',
    allPages: 'Visual Index of All 15 Pages',
    disclaimer: 'Menu items and prices are subject to change depending on seasonality and availability of fresh local ingredients.',
    close: 'Close'
  },
  TH: {
    tag: 'อาหารอิตาเลียนแท้ๆ & รสชาติท้องถิ่นรสเลิศ',
    title: 'อิตาลีบรรจบกับท้องทะเลแห่งเกาะพยาม',
    desc: 'ร้านอาหารของฟลาวเวอร์พาวเวอร์คือศูนย์รวมแห่งความอร่อยที่ผสมผสานความหลากหลายทางวัฒนธรรมได้อย่างลงตัว เราพร้อมเสิร์ฟเมนูอิตาเลียนดั้งเดิมแท้ๆ 100% โดดเด่นด้วยพิซซ่าอิตาเลียนแท้ๆ และพาสต้าเส้นสดทำมือ ควบคู่กับอาหารไทยและอาหารพม่ารสชาติจัดจ้าน พร้อมด้วยเมนูเพื่อสุขภาพและวีแกนที่มีให้เลือกสรรอย่างครบครัน',
    hours: 'เปิดบริการทุกวัน 08:00 – 21:15 น.',
    meals: 'อาหารเช้า · อาหารกลางวัน · อาหารค่ำ',
    browseMenu: 'เปิดอ่านเมนูเหมือนเปิดเล่มหนังสือจริง',
    browseDesc: 'ปัดหน้าจอไปทางซ้ายหรือขวา หรือใช้ปุ่มลูกศรเพื่อพลิกหน้าเมนูเหมือนเปิดอ่านหนังสือ แตะที่ภาพเพื่อดูขนาดใหญ่เต็มจอ',
    swipeHint: 'ปัดหน้าจอหรือกดลูกศรเพื่อพลิกหน้า',
    fullscreen: 'ขยายเต็มหน้าจอ',
    pageText: 'หน้า {current} จาก {total}',
    prevPage: 'หน้าก่อนหน้า',
    nextPage: 'หน้าถัดไป',
    allPages: 'ดัชนีหน้าเมนูทั้งหมด 15 หน้า',
    disclaimer: 'รายการอาหารและราคาอาจมีการเปลี่ยนแปลงตามฤดูกาลและความพร้อมของวัตถุดิบสดใหม่บนเกาะ',
    close: 'ปิดหน้าต่าง'
  },
  DE: {
    tag: 'Authentische Italienische Küche & Lokale Aromen',
    title: 'Italien trifft auf die Strände von Koh Phayam',
    desc: 'Das Restaurant von Flower Power ist ein kulinarischer Treffpunkt. Wir servieren zu 100 % traditionelle italienische Gerichte — mit authentischer traditioneller italienischer Pizza und hausgemachter Pasta — neben typisch thailändischen und birmanischen Spezialitäten sowie einer breiten Palette an veganen und gesunden Rezepten.',
    hours: 'Täglich 08:00 – 21:15 Uhr',
    meals: 'Frühstück · Mittagessen · Abendessen',
    browseMenu: 'Speisekarte wie ein echtes Buch durchblättern',
    browseDesc: 'Wischen Sie mit dem Finger nach links oder rechts oder nutzen Sie die Pfeile zum Umblättern wie in einem echten Menübuch. Tippen Sie auf das Bild für den Vollbildmodus.',
    swipeHint: 'Wischen oder Pfeile nutzen zum Umblättern',
    fullscreen: 'Vollbildmodus',
    pageText: 'Seite {current} von {total}',
    prevPage: 'Vorherige',
    nextPage: 'Nächste',
    allPages: 'Visuelle Übersicht aller 15 Seiten',
    disclaimer: 'Gerichte und Preise können sich je nach Saison und Verfügbarkeit frischer lokaler Zutaten ändern.',
    close: 'Schließen'
  }
};

interface Props {
  lang?: Language;
}

export default function RestaurantSection({ lang = 'IT' }: Props) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);

  // Touch Swipe Gesture State
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  const t = restaurantLabels[lang] || restaurantLabels['IT'];
  const titles = pageTitleTranslations[lang] || pageTitleTranslations['IT'];

  const getImageUrl = (fileName: string) => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://gjqevgkbjkharczhikcl.supabase.co";
    return `${supabaseUrl}/storage/v1/object/public/Menu/${encodeURIComponent(fileName)}`;
  };

  const handlePrev = () => {
    setCurrentPage((prev) => (prev === 0 ? menuPages.length - 1 : prev - 1));
    setZoomScale(1);
  };

  const handleNext = () => {
    setCurrentPage((prev) => (prev === menuPages.length - 1 ? 0 : prev + 1));
    setZoomScale(1);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEndX(null);
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return;
    const distance = touchStartX - touchEndX;
    if (distance > 45) {
      // Swiped Left -> go Next
      handleNext();
    } else if (distance < -45) {
      // Swiped Right -> go Prev
      handlePrev();
    }
  };

  const handleZoomIn = () => {
    setZoomScale((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoomScale((prev) => Math.max(prev - 0.25, 1));
  };

  return (
    <section className="py-8 md:py-12 bg-[#FAF6F0]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Bannerino Ristorante Compatto e Non Invasivo */}
        <div className="bg-[#F3EAE0]/85 border border-[#E6DACF] rounded-2xl p-3.5 sm:p-4 md:p-5 shadow-xs mb-5 flex flex-col sm:flex-row items-center sm:items-stretch gap-3.5 sm:gap-5">
          <img
            src="/Flower_Power_Pizza_-_HotSpring.png"
            alt="Flower Power Pizza Logo"
            className="w-16 h-16 sm:w-20 sm:h-20 object-contain flex-shrink-0 self-center hover:scale-105 transition-transform duration-300"
          />
          <div className="flex-1 text-center sm:text-left flex flex-col justify-between">
            <div>
              <p 
                className="text-[11px] sm:text-xs font-black tracking-[0.2em] uppercase text-emerald-800 mb-1" 
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {t.tag}
              </p>
              <h2
                className="text-stone-850 mb-1.5 text-lg sm:text-xl md:text-2xl font-black leading-tight"
                style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
              >
                {t.title}
              </h2>
              <p 
                className="text-stone-700 text-xs sm:text-sm leading-relaxed mb-2.5 font-normal"
                style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
              >
                {t.desc}
              </p>
            </div>
            <div className="flex flex-wrap justify-center sm:justify-start gap-3 sm:gap-4 pt-1 border-t border-stone-200/50">
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-stone-700">
                <Clock size={14} className="text-emerald-700" />
                <span style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}>{t.hours}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-stone-700">
                <UtensilsCrossed size={14} className="text-emerald-700" />
                <span style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}>{t.meals}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Banner Vini Pregiati / Wine List */}
        <div className="mt-6 bg-gradient-to-r from-[#3b3530] to-[#2b2622] text-stone-100 rounded-3xl p-5 sm:p-6 shadow-md border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mx-auto sm:mx-0">
              <Wine className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-wider mb-1">
                <span>Dine-in Cellar</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white leading-tight" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
                {lang === 'TH' ? 'เมนูไวน์นำเข้าคุณภาพพรีเมียม & ไวน์ประจำร้าน' : lang === 'IT' ? 'Carta dei Vini Pregiati & Vino della Casa' : lang === 'DE' ? 'Exklusive Weinkarte & Hauswein' : 'Fine Wine Selection & House Wine'}
              </h3>
              <p className="text-stone-300 text-xs mt-0.5">
                {lang === 'TH' ? 'ไวน์แดง ไวน์ขาว โรเซ่ และสปาร์กลิงไวน์ เสิร์ฟที่ร้านอาหารเกาะพยาม' : lang === 'IT' ? 'Selezione di etichette italiane e internazionali per la degustazione al tavolo' : lang === 'DE' ? 'Ausgewählte italienische und internationale Weine am Tisch' : 'Selected Italian and international wines for dining at our restaurant'}
              </p>
            </div>
          </div>
          <a
            href="/wine-list"
            className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all text-center shrink-0 active:scale-95 flex items-center justify-center gap-2"
          >
            <span>{lang === 'TH' ? 'เปิดเมนูไวน์' : lang === 'IT' ? 'Scopri i Vini' : lang === 'DE' ? 'Zur Weinkarte' : 'View Wine List'}</span>
            <ArrowRight size={14} />
          </a>
        </div>

        {/* Digital Menu Book Section */}
        <div className="mt-8 bg-[#F3EAE0]/40 border border-[#E6DACF] rounded-3xl p-4 sm:p-6 shadow-sm">
          {/* Header Introduttivo Chiaro sul Libro da Sfogliare */}
          <div className="text-center mb-6 max-w-xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-800/10 text-emerald-850 rounded-full text-xs font-black uppercase tracking-wider mb-2">
              <BookOpen size={14} />
              <span>{t.swipeHint}</span>
            </div>
            <h3
              className="text-stone-850 mb-2 text-2xl md:text-3xl font-semibold tracking-tight uppercase"
              style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
            >
              {t.browseMenu}
            </h3>
            <p 
              className="text-stone-700 text-sm sm:text-base leading-relaxed font-normal"
              style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
            >
              {t.browseDesc}
            </p>
          </div>

          {/* Main Book Viewer */}
          <div className="relative max-w-2xl mx-auto border-2 border-[#d9cdbe] bg-[#FAF6F0] rounded-3xl p-3 sm:p-4 shadow-xl flex flex-col items-center">
            {/* Book Header Inside Card */}
            <div className="w-full flex items-center justify-between mb-3 px-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse shrink-0" />
                <span 
                  className="text-xs sm:text-sm font-black uppercase tracking-wider text-stone-850 truncate max-w-[200px] sm:max-w-xs"
                  style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
                >
                  {titles[menuPages[currentPage].titleKey]}
                </span>
              </div>
              <span className="text-xs sm:text-sm font-black px-3 py-1 bg-emerald-800 text-white rounded-xl shadow-xs shrink-0">
                {currentPage + 1} / {menuPages.length}
              </span>
            </div>

            {/* Viewport page container with Touch Swipe */}
            <div 
              className="relative w-full aspect-[1/1.4] overflow-hidden rounded-2xl bg-white shadow-2xl border border-stone-200/80 group select-none cursor-pointer"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <img
                src={getImageUrl(menuPages[currentPage].file)}
                alt={titles[menuPages[currentPage].titleKey]}
                className="w-full h-full object-contain pointer-events-none"
              />

              {/* Floating Book-Turning Left Arrow Flap */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                aria-label={t.prevPage}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-black/60 hover:bg-emerald-800 text-white backdrop-blur-md flex items-center justify-center shadow-2xl border border-white/25 transition-all duration-200 active:scale-90 cursor-pointer"
                title={t.prevPage}
              >
                <ChevronLeft size={26} className="stroke-[2.5]" />
              </button>

              {/* Floating Book-Turning Right Arrow Flap */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                aria-label={t.nextPage}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-black/60 hover:bg-emerald-800 text-white backdrop-blur-md flex items-center justify-center shadow-2xl border border-white/25 transition-all duration-200 active:scale-90 cursor-pointer"
                title={t.nextPage}
              >
                <ChevronRight size={26} className="stroke-[2.5]" />
              </button>

              {/* Image Interaction Layer: Fullscreen on Tap */}
              <div
                onClick={() => setIsLightboxOpen(true)}
                className="absolute inset-0 bg-black/0 hover:bg-black/15 transition-colors duration-300 flex items-center justify-center"
              >
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/75 text-white text-xs px-4 py-2 rounded-xl flex items-center gap-2 backdrop-blur-md border border-white/25 shadow-xl">
                  <Maximize2 size={13} />
                  <span style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}>{t.fullscreen}</span>
                </div>
              </div>
            </div>

            {/* Bottom Controls Bar */}
            <div className="w-full mt-3.5 flex flex-col items-center gap-2">
              <div className="grid grid-cols-2 gap-2 sm:gap-3 w-full">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="w-full py-3 px-3 bg-[#24201d] hover:bg-emerald-800 active:scale-98 text-white rounded-xl transition-all duration-200 shadow-md cursor-pointer flex items-center justify-center gap-1.5 font-black text-xs sm:text-sm"
                >
                  <ChevronLeft size={18} className="shrink-0" />
                  <span className="truncate">{t.prevPage}</span>
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full py-3 px-3 bg-[#24201d] hover:bg-emerald-800 active:scale-98 text-white rounded-xl transition-all duration-200 shadow-md cursor-pointer flex items-center justify-center gap-1.5 font-black text-xs sm:text-sm"
                >
                  <span className="truncate">{t.nextPage}</span>
                  <ChevronRight size={18} className="shrink-0" />
                </button>
              </div>

              {/* Center Page Counter */}
              <span 
                className="text-[11px] sm:text-xs font-black text-stone-700 tracking-wide uppercase mt-0.5"
                style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
              >
                {t.pageText.replace('{current}', String(currentPage + 1)).replace('{total}', String(menuPages.length))}
              </span>
            </div>
          </div>

          {/* Visual Thumbnail Strip (Indice Visivo di Tutte le 15 Pagine) */}
          <div className="mt-8 pt-6 border-t border-[#E6DACF]/80">
            <h4 
              className="text-center text-xs sm:text-sm text-stone-700 font-black mb-3 uppercase tracking-wider flex items-center justify-center gap-2"
              style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
            >
              <BookOpen size={16} className="text-emerald-800" />
              <span>{t.allPages}</span>
            </h4>
            <div className="flex gap-2.5 sm:gap-3 overflow-x-auto pb-4 pt-1 px-2 scrollbar-thin scrollbar-thumb-stone-300 scrollbar-track-transparent">
              {menuPages.map((page, idx) => {
                const isActive = currentPage === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => { setCurrentPage(idx); setZoomScale(1); }}
                    className={`flex-shrink-0 w-16 sm:w-20 aspect-[1/1.4] rounded-xl overflow-hidden border-2 transition-all duration-300 shadow-sm cursor-pointer relative group ${
                      isActive ? 'border-emerald-700 scale-105 shadow-lg ring-2 ring-emerald-600/30' : 'border-[#cfbea6]/60 opacity-60 hover:opacity-100 hover:border-emerald-700/50'
                    }`}
                    title={titles[page.titleKey]}
                  >
                    <img
                      src={getImageUrl(page.file)}
                      alt={titles[page.titleKey]}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className={`absolute bottom-0 inset-x-0 text-[9px] sm:text-[10px] font-black text-center py-0.5 transition-colors ${
                      isActive ? 'bg-emerald-800 text-white' : 'bg-black/60 text-white/90 group-hover:bg-black/80'
                    }`}>
                      {idx + 1}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Informative Note Footer */}
        <p 
          className="text-center text-stone-600 text-sm mt-6 italic font-medium"
          style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
        >
          {t.disclaimer}
        </p>
      </div>

      {/* Lightbox / Zoomable Fullscreen Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col justify-between p-4 md:p-6 backdrop-blur-md">
          {/* Lightbox Topbar */}
          <div className="flex items-center justify-between text-white w-full max-w-7xl mx-auto border-b border-white/10 pb-3">
            <div>
              <h4 
                className="text-sm font-semibold tracking-wide text-emerald-500"
                style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
              >
                {titles[menuPages[currentPage].titleKey]}
              </h4>
              <p 
                className="text-[10px] text-stone-400"
                style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
              >
                {t.pageText.replace('{current}', String(currentPage + 1)).replace('{total}', String(menuPages.length))}
              </p>
            </div>

            {/* Zoom & Action Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleZoomOut}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200 cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut size={16} />
              </button>
              <span className="text-xs text-stone-400 font-mono w-10 text-center">
                {Math.round(zoomScale * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200 cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn size={16} />
              </button>
              <div className="w-px h-5 bg-white/10 mx-1" />
              <button
                onClick={() => { setIsLightboxOpen(false); setZoomScale(1); }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200 text-stone-300 hover:text-white cursor-pointer"
                title={t.close}
              >
                <X size={22} />
              </button>
            </div>
          </div>

          {/* Zoomable Image Container with Swipe */}
          <div 
            className="flex-1 flex items-center justify-center overflow-auto py-4"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className="transition-transform duration-200 ease-out max-h-full max-w-full"
              style={{ transform: `scale(${zoomScale})` }}
            >
              <img
                src={getImageUrl(menuPages[currentPage].file)}
                alt={titles[menuPages[currentPage].titleKey]}
                className="max-h-[75vh] md:max-h-[85vh] object-contain select-none pointer-events-none"
              />
            </div>
          </div>

          {/* Lightbox Footer Navigation */}
          <div className="flex items-center justify-between text-white w-full max-w-7xl mx-auto border-t border-white/10 pt-3">
            <button
              onClick={handlePrev}
              className="px-4 py-2 hover:bg-white/10 rounded-lg transition-colors text-sm font-semibold flex items-center gap-2 cursor-pointer"
              style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
            >
              <ChevronLeft size={16} />
              <span className="hidden sm:inline">{t.prevPage}</span>
            </button>

            <span 
              className="text-xs text-stone-400"
              style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
            >
              {t.pageText.replace('{current}', String(currentPage + 1)).replace('{total}', String(menuPages.length))}
            </span>

            <button
              onClick={handleNext}
              className="px-4 py-2 hover:bg-white/10 rounded-lg transition-colors text-sm font-semibold flex items-center gap-2 cursor-pointer"
              style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
            >
              <span className="hidden sm:inline">{t.nextPage}</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
