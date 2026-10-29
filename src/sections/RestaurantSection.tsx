import { useState } from 'react';
import { Clock, UtensilsCrossed, ChevronLeft, ChevronRight, Maximize2, X, ZoomIn, ZoomOut, BookOpen, Coffee, Soup, Pizza, Globe, Flame, Salad } from 'lucide-react';
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

const categoriesData = [
  { catKey: 0, pageIndex: 0 },
  { catKey: 1, pageIndex: 1 },
  { catKey: 2, pageIndex: 3 },
  { catKey: 3, pageIndex: 5 },
  { catKey: 4, pageIndex: 6 },
  { catKey: 5, pageIndex: 11 },
  { catKey: 6, pageIndex: 13 },
];

const pageTitleTranslations = {
  IT: [
    'Flower Power Menu', 'Caffetteria', 'Bevande & Cocktails', 'Antipasti & Bruschette', 
    'Primi Piatti (Pasta)', 'Le Nostre Focacce', 'Panini & Sandwich', 'Cucina Italiana', 
    'Secondi di Pesce', 'Cucina Fusion', 'Le Nostre Pizze', 'Specialità Birmane', 
    'Cucina Thailandese', 'Opzioni Vegane', 'Bed & Breakfast & Snack'
  ],
  EN: [
    'Flower Power Menu', 'Coffee Shop', 'Drinks & Cocktails', 'Appetizers & Bruschette', 
    'First Courses (Pasta)', 'Our Focaccias', 'Panini & Sandwiches', 'Italian Cuisine', 
    'Fish Main Courses', 'Fusion Cuisine', 'Our Pizzas', 'Burmese Specialties', 
    'Thai Cuisine', 'Vegan Options', 'Bed & Breakfast & Snacks'
  ],
  TH: [
    'เมนูดอกไม้บาน', 'เมนูกาแฟ & เครื่องดื่มร้อน', 'เครื่องดื่ม & ค็อกเทล', 'อาหารเรียกน้ำย่อย & บรูสเก็ตตา', 
    'พาสต้าจานแรก', 'โฟคาชชาของเรา', 'พานินี่ & แซนด์วิช', 'อาหารอิตาเลียนดั้งเดิม', 
    'อาหารจานหลักจากปลา', 'อาหารฟิวชั่น', 'พิซซ่าเตาถ่านของเรา', 'อาหารพม่าสูตรพิเศษ', 
    'อาหารไทยยอดนิยม', 'เมนูมังสวิรัติ (วีแกน)', 'อาหารเช้า & ของว่าง'
  ],
  DE: [
    'Flower Power Menü', 'Kaffeespezialitäten', 'Getränke & Cocktails', 'Vorspeisen & Bruschetta', 
    'Nudelgerichte (Pasta)', 'Unsere Focaccias', 'Panini & Sandwiches', 'Italienische Küche', 
    'Fischgerichte', 'Fusion-Küche', 'Unsere Pizzas', 'Birmanische Spezialitäten', 
    'Thailändische Küche', 'Vegane Optionen', 'Bed & Breakfast & Snacks'
  ]
};

const categoryTranslations = {
  IT: [
    'Flower Power Menu', 'Caffetteria & Drink', 'Antipasti & Primi', 'Pizze & Focacce', 
    'Cucina Internazionale', 'Cucina Orientale', 'Vegan & Snack'
  ],
  EN: [
    'Flower Power Menu', 'Coffee & Drinks', 'Appetizers & Pasta', 'Pizzas & Focaccias', 
    'International Cuisine', 'Oriental Cuisine', 'Vegan & Snacks'
  ],
  TH: [
    'แนะนำเมนู', 'กาแฟ & เครื่องดื่ม', 'อาหารเรียกน้ำย่อย & พาสต้า', 'พิซซ่า & โฟคาชชา', 
    'อาหารตะวันตก', 'อาหารตะวันออก', 'วีแกน & ของว่าง'
  ],
  DE: [
    'Flower Power Menü', 'Kaffee & Getränke', 'Vorspeisen & Pasta', 'Pizzas & Focaccias', 
    'Internationale Küche', 'Orientalische Küche', 'Vegan & Snacks'
  ]
};


const restaurantCategoryTabs = [
  { id: 0, pageIndex: 0, icon: BookOpen },
  { id: 1, pageIndex: 1, icon: Coffee },
  { id: 2, pageIndex: 3, icon: Soup },
  { id: 3, pageIndex: 5, icon: Pizza },
  { id: 4, pageIndex: 6, icon: Globe },
  { id: 5, pageIndex: 11, icon: Flame },
  { id: 6, pageIndex: 13, icon: Salad },
];

const restaurantCategoryBlockLabels: Record<number, Record<Language, [string, string]>> = {
  0: { IT: ['MENU', 'COMPLETO'], EN: ['FULL', 'MENU'], TH: ['เมนู', 'ทั้งหมด'], DE: ['GESAMTES', 'MENÜ'] },
  1: { IT: ['CAFFÈ &', 'DRINK'], EN: ['COFFEE &', 'DRINKS'], TH: ['กาแฟ &', 'เครื่องดื่ม'], DE: ['KAFFEE &', 'DRINKS'] },
  2: { IT: ['ANTIPASTI &', 'PRIMI'], EN: ['APPETIZERS', '& PASTA'], TH: ['อาหารเรียกน้ำย่อย', '& พาสต้า'], DE: ['VORSPEISEN', '& PASTA'] },
  3: { IT: ['PIZZE &', 'FOCACCE'], EN: ['PIZZAS &', 'FOCACCIAS'], TH: ['พิซซ่า &', 'โฟคาชชา'], DE: ['PIZZAS &', 'FOCACCIAS'] },
  4: { IT: ['SECONDI &', 'PESCE'], EN: ['MAIN COURSES', '& FISH'], TH: ['จานหลัก &', 'อาหารปลา'], DE: ['HAUPTGERICHTE', '& FISCH'] },
  5: { IT: ['THAI &', 'BIRMANO'], EN: ['THAI &', 'BURMESE'], TH: ['อาหารไทย &', 'พม่า'], DE: ['THAI &', 'BIRMANISCH'] },
  6: { IT: ['VEGAN &', 'SNACKS'], EN: ['VEGAN &', 'SNACKS'], TH: ['วีแกน &', 'ของว่าง'], DE: ['VEGAN &', 'SNACKS'] },
};

const restaurantLabels = {
  IT: {
    tag: 'Autentica Cucina Italiana & Sapori Locali',
    title: 'L’Italia incontra le spiagge di Koh Phayam',
    desc: 'Il ristorante del Flower Power è un crocevia di culture culinarie. Proponiamo piatti della tradizione italiana al 100% — con autentica pizza tradizionale italiana e pasta fresca fatta in casa — affiancati da specialità tipiche tailandesi e birmane e un intero menu dedicato a ricette vegane e salutari.',
    hours: '08:00 – 21:15 daily',
    meals: 'Breakfast · Lunch · Dinner',
    browseMenu: 'Sfoglia il Nostro Menù Digitale',
    browseDesc: 'Clicca sulle categorie in alto per saltare direttamente alle sezioni, usa le frecce per sfogliare le pagine, o tocca l’immagine per aprirla a schermo intero.',
    fullscreen: 'Schermo Intero',
    pageText: 'Pagina {current} di {total}',
    allPages: 'Tutte le Pagine',
    disclaimer: 'Le proposte ed i prezzi del menù sono soggetti a variazioni in base alla stagionalità ed alla reperibilità degli ingredienti locali freschi dell’isola.',
    close: 'Chiudi'
  },
  EN: {
    tag: 'Authentic Italian Cuisine & Local Flavours',
    title: 'Italy Meets the Beaches of Koh Phayam',
    desc: 'Flower Power’s restaurant is a culinary crossroads. We serve 100% traditional Italian dishes — with authentic traditional Italian pizza and homemade fresh pasta — alongside typical Thai and Burmese specialties, and a complete menu dedicated to vegan and healthy recipes.',
    hours: '08:00 – 21:15 daily',
    meals: 'Breakfast · Lunch · Dinner',
    browseMenu: 'Browse Our Digital Menu',
    browseDesc: 'Click the categories above to jump directly to sections, use the arrows to flip pages, or tap the image to open it in full screen.',
    fullscreen: 'Full Screen',
    pageText: 'Page {current} of {total}',
    allPages: 'All Pages',
    disclaimer: 'Menu items and prices are subject to change depending on seasonality and availability of fresh local ingredients.',
    close: 'Close'
  },
  TH: {
    tag: 'อาหารอิตาเลียนแท้ๆ & รสชาติท้องถิ่นรสเลิศ',
    title: 'อิตาลีบรรจบกับท้องทะเลแห่งเกาะพยาม',
    desc: 'ร้านอาหารของฟลาวเวอร์พาวเวอร์คือศูนย์รวมแห่งความอร่อยที่ผสมผสานความหลากหลายทางวัฒนธรรมได้อย่างลงตัว เราพร้อมเสิร์ฟเมนูอิตาเลียนดั้งเดิมแท้ๆ 100% โดดเด่นด้วยพิซซ่าอิตาเลียนแท้ๆ และพาสต้าเส้นสดทำมือ ควบคู่กับอาหารไทยและอาหารพม่ารสชาติจัดจ้าน พร้อมด้วยเมนูเพื่อสุขภาพและวีแกนที่มีให้เลือกสรรอย่างครบครัน',
    hours: 'เปิดบริการทุกวัน 08:00 – 21:15 น.',
    meals: 'อาหารเช้า · อาหารกลางวัน · อาหารค่ำ',
    browseMenu: 'เปิดอ่านเมนูดิจิทัลของเรา',
    browseDesc: 'คลิกหมวดหมู่ด้านบนเพื่อสลับไปยังหน้าหมวดหมู่นั้นๆ ใช้ปุ่มลูกศรเพื่อพลิกหน้าเมนู หรือแตะที่ภาพเพื่อเปิดดูขนาดใหญ่เต็มจอ',
    fullscreen: 'ขยายเต็มหน้าจอ',
    pageText: 'หน้า {current} จาก {total}',
    allPages: 'หน้าเมนูทั้งหมด',
    disclaimer: 'รายการอาหารและราคาอาจมีการเปลี่ยนแปลงตามฤดูกาลและความพร้อมของวัตถุดิบสดใหม่บนเกาะ',
    close: 'ปิดหน้าต่าง'
  },
  DE: {
    tag: 'Authentische Italienische Küche & Lokale Aromen',
    title: 'Italien trifft auf die Strände von Koh Phayam',
    desc: 'Das Restaurant von Flower Power ist ein kulinarischer Treffpunkt. Wir servieren zu 100 % traditionelle italienische Gerichte — mit authentischer traditioneller italienischer Pizza und hausgemachter Pasta — neben typisch thailändischen und birmanischen Spezialitäten sowie einer breiten Palette an veganen und gesunden Rezepten.',
    hours: 'Täglich 08:00 – 21:15 Uhr',
    meals: 'Frühstück · Mittagessen · Abendessen',
    browseMenu: 'Durchstöbern Sie unsere digitale Speisekarte',
    browseDesc: 'Klicken Sie auf die Kategorien oben, um direkt zu den Abschnitten zu springen, nutzen Sie die Pfeile zum Umblättern, oder tippen Sie auf das Bild, um es im Vollbildmodus zu öffnen.',
    fullscreen: 'Vollbildmodus',
    pageText: 'Seite {current} von {total}',
    allPages: 'Alle Seiten',
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

  const t = restaurantLabels[lang] || restaurantLabels['IT'];
  const titles = pageTitleTranslations[lang] || pageTitleTranslations['IT'];
  const catNames = categoryTranslations[lang] || categoryTranslations['IT'];

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

  const handleCategoryClick = (pageIndex: number) => {
    setCurrentPage(pageIndex);
    setZoomScale(1);
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

        {/* Digital Menu Book Section */}
        <div className="mt-8 bg-[#F3EAE0]/40 border border-[#E6DACF] rounded-3xl p-5 md:p-6 shadow-sm">
          <div className="text-center mb-5">
            <h3
              className="text-stone-850 mb-2 text-2xl md:text-3xl font-semibold tracking-tight uppercase"
              style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
            >
              {t.browseMenu}
            </h3>
            <p 
              className="text-stone-700 text-sm sm:text-base leading-relaxed max-w-lg mx-auto font-normal"
              style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
            >
              {t.browseDesc}
            </p>
          </div>

          {/* CATEGORY SELECTOR (Identico al 100% allo stile a rettangolini di Spa e Galleria) */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap mb-8 max-w-5xl mx-auto">
            {restaurantCategoryTabs.map((tab) => {
              const Icon = tab.icon;
              const isSelected = currentPage >= tab.pageIndex && (
                tab.id === 6 || (restaurantCategoryTabs[tab.id + 1] && currentPage < restaurantCategoryTabs[tab.id + 1].pageIndex)
              );
              const [line1, line2] = restaurantCategoryBlockLabels[tab.id][lang] || restaurantCategoryBlockLabels[tab.id]['IT'];

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleCategoryClick(tab.pageIndex)}
                  className={`w-[96px] sm:w-[110px] h-[98px] sm:h-[108px] flex flex-col items-center justify-between p-2 rounded-2xl transition-all duration-200 border-2 text-center group cursor-pointer select-none active:scale-95 ${
                    isSelected
                      ? 'bg-gradient-to-b from-[#184534] to-[#0c241b] border-emerald-700 text-white shadow-lg ring-2 ring-emerald-700/30 scale-[1.03]'
                      : 'bg-[#ede5d8] border-[#cfbea6] text-[#2c1a11] shadow-[0_2px_6px_rgba(44,26,17,0.08)] hover:bg-[#e6dcce] hover:border-emerald-700/50 hover:text-black hover:shadow-md'
                  }`}
                  style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, system-ui, sans-serif' }}
                >
                  {/* Top icon in rounded container */}
                  <div
                    className={`w-7.5 h-7.5 sm:w-8.5 sm:h-8.5 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 ${
                      isSelected
                        ? 'bg-white/20 text-emerald-300 shadow-sm'
                        : 'bg-[#ded0bf] text-emerald-900 group-hover:bg-emerald-800/15 shadow-inner'
                    }`}
                  >
                    <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.3]" />
                  </div>

                  {/* Two-line text */}
                  <div className="flex-1 flex flex-col items-center justify-center w-full px-0.5 mt-0.5">
                    <span className="text-[9.5px] sm:text-[10.5px] font-black tracking-tight uppercase leading-[1.12] text-balance">
                      <span className="block">{line1}</span>
                      <span className="block">{line2}</span>
                    </span>
                  </div>

                  {/* Page indicator pill */}
                  <div
                    className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider transition-colors ${
                      isSelected
                        ? 'bg-emerald-400 text-stone-950 shadow-xs'
                        : 'bg-black/10 text-stone-700 group-hover:bg-black/15'
                    }`}
                  >
                    Pag. {tab.pageIndex + 1}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Main Book Viewer */}
          <div className="relative max-w-2xl mx-auto border border-stone-250 bg-stone-100/50 rounded-2xl p-2 shadow-inner flex flex-col items-center">
            {/* Viewport page container */}
            <div className="relative w-full aspect-[1/1.4] overflow-hidden rounded-xl bg-white shadow-md group">
              <img
                src={getImageUrl(menuPages[currentPage].file)}
                alt={titles[menuPages[currentPage].titleKey]}
                className="w-full h-full object-contain select-none"
              />

              {/* Image Interaction Layer */}
              <div
                onClick={() => setIsLightboxOpen(true)}
                className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors duration-300 cursor-zoom-in flex items-center justify-center"
              >
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/60 text-white text-xs px-4 py-2 rounded-xl flex items-center gap-2 backdrop-blur-sm border border-white/20">
                  <Maximize2 size={12} />
                  <span style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}>{t.fullscreen}</span>
                </div>
              </div>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between w-full mt-4 px-2">
              <button
                onClick={handlePrev}
                className="p-3 bg-stone-850 hover:bg-stone-900 text-white rounded-xl transition-colors duration-300 shadow-md cursor-pointer"
              >
                <ChevronLeft size={18} />
              </button>

              <div className="text-center">
                <span 
                  className="text-xs uppercase tracking-[0.25em] text-emerald-800 font-bold block mb-0.5"
                  style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
                >
                  {titles[menuPages[currentPage].titleKey]}
                </span>
                <span 
                  className="text-xs sm:text-sm text-stone-700 font-semibold"
                  style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
                >
                  {t.pageText.replace('{current}', String(currentPage + 1)).replace('{total}', String(menuPages.length))}
                </span>
              </div>

              <button
                onClick={handleNext}
                className="p-3 bg-stone-850 hover:bg-stone-900 text-white rounded-xl transition-colors duration-300 shadow-md cursor-pointer"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Thumbnail preview strip */}
          <div className="mt-6">
            <h4 
              className="text-center text-xs sm:text-sm text-stone-700 font-black mb-2.5 uppercase tracking-wider"
              style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
            >
              {t.allPages}
            </h4>
            <div className="flex gap-3 overflow-x-auto pb-4 pt-1 px-2 scrollbar-thin scrollbar-thumb-stone-300 scrollbar-track-transparent">
              {menuPages.map((page, idx) => {
                const isActive = currentPage === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => { setCurrentPage(idx); setZoomScale(1); }}
                    className={`flex-shrink-0 w-16 aspect-[1/1.4] rounded-lg overflow-hidden border-2 transition-all duration-300 shadow-sm cursor-pointer ${
                      isActive ? 'border-emerald-700 scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={getImageUrl(page.file)}
                      alt={titles[page.titleKey]}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
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

          {/* Zoomable Image Container */}
          <div className="flex-1 flex items-center justify-center overflow-auto py-4">
            <div
              className="transition-transform duration-200 ease-out max-h-full max-w-full"
              style={{ transform: `scale(${zoomScale})` }}
            >
              <img
                src={getImageUrl(menuPages[currentPage].file)}
                alt={titles[menuPages[currentPage].titleKey]}
                className="max-h-[75vh] md:max-h-[85vh] object-contain select-none"
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
              <span className="hidden sm:inline">Prev</span>
            </button>

            <span 
              className="text-xs text-stone-500"
              style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
            >
              {t.pageText.replace('{current}', String(currentPage + 1)).replace('{total}', String(menuPages.length))}
            </span>

            <button
              onClick={handleNext}
              className="px-4 py-2 hover:bg-white/10 rounded-lg transition-colors text-sm font-semibold flex items-center gap-2 cursor-pointer"
              style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
