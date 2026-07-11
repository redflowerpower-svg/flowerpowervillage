import { useState } from 'react';
import { Clock, UtensilsCrossed, ChevronLeft, ChevronRight, Maximize2, X, ZoomIn, ZoomOut } from 'lucide-react';

const menuPages = [
  { file: '01 - Cover.jpg', title: 'Flower Power Menu' },
  { file: '02 - Coffee.jpg', title: 'Caffetteria' },
  { file: '03 - Drinks.jpg', title: 'Bevande & Cocktails' },
  { file: '04 - Bruschetta.jpg', title: 'Antipasti & Bruschette' },
  { file: '05 - Pasta.jpg', title: 'Primi Piatti (Pasta)' },
  { file: '06 - Focaccia.jpg', title: 'Le Nostre Focacce' },
  { file: '07 - Sandwich.jpg', title: 'Panini & Sandwich' },
  { file: '08 - Italian.jpg', title: 'Cucina Italiana' },
  { file: '09 - Fish.jpg', title: 'Secondi di Pesce' },
  { file: '10 - Fusion.jpg', title: 'Cucina Fusion' },
  { file: '11 - Pizza.jpg', title: 'Le Nostre Pizze' },
  { file: '12 - Myanmar.jpg', title: 'Specialità Birmane' },
  { file: '13 - Thai.jpg', title: 'Cucina Thailandese' },
  { file: '14 - Vegan.jpg', title: 'Opzioni Vegane' },
  { file: '15 - BnB.jpg', title: 'Bed & Breakfast & Snack' },
];

const categories = [
  { name: 'Flower Power Menu', pageIndex: 0 },
  { name: 'Caffetteria & Drink', pageIndex: 1 },
  { name: 'Antipasti & Primi', pageIndex: 3 },
  { name: 'Pizze & Focacce', pageIndex: 5 },
  { name: 'Cucina Internazionale', pageIndex: 6 },
  { name: 'Cucina Orientale', pageIndex: 11 },
  { name: 'Vegan & Snack', pageIndex: 13 },
];

export default function RestaurantSection() {
  const [currentPage, setCurrentPage] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);

  const getImageUrl = (fileName: string) => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://htmnjjzxpybpbumtbqic.supabase.co";
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
        {/* Header */}
        <div className="bg-[#F3EAE0]/70 border border-[#E6DACF] rounded-3xl p-5 md:p-6 shadow-sm mb-6 flex flex-col md:flex-row items-center md:items-stretch gap-6 md:gap-8">
          <img
            src="/Flower_Power_Pizza_-_HotSpring.png"
            alt="Flower Power Pizza Logo"
            className="w-24 h-24 md:w-28 md:h-28 object-contain flex-shrink-0 self-center hover:scale-105 transition-transform duration-300"
          />
          <div className="flex-1 text-center md:text-left flex flex-col justify-between">
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-emerald-700 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                Autentica Cucina Italiana & Sapori Locali
              </p>
              <h2
                className="text-stone-850 mb-2 text-xl md:text-2xl font-light"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                L'Italia incontra le <em>spiagge di Koh Phayam</em>
              </h2>
              <p className="text-stone-550 text-xs leading-relaxed mb-3">
                Il ristorante del Flower Power è un crocevia di culture culinarie. Proponiamo piatti della tradizione italiana al 100% — con pizza cotta nel forno a legna e pasta fatta in casa — affiancati da specialità tipiche tailandesi e birmane e un intero menu dedicato a ricette vegane e salutari.
              </p>
            </div>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <div className="flex items-center gap-1.5 text-xs text-stone-600">
                <Clock size={12} className="text-emerald-700" />
                <span>08:00 – 21:15 daily</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-stone-600">
                <UtensilsCrossed size={12} className="text-emerald-700" />
                <span>Breakfast · Lunch · Dinner</span>
              </div>
            </div>
          </div>
        </div>

        {/* Digital Menu Book Section */}
        <div className="mt-8 bg-[#F3EAE0]/40 border border-[#E6DACF] rounded-3xl p-5 md:p-6 shadow-sm">
          <div className="text-center mb-5">
            <h3
              className="text-stone-850 mb-2 text-2xl md:text-3xl font-semibold tracking-tight uppercase"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              Sfoglia il Nostro <span className="text-emerald-800 font-bold">Menù Digitale</span>
            </h3>
            <p className="text-stone-550 text-xs max-w-lg mx-auto">
              Clicca sulle categorie in alto per saltare direttamente alle sezioni, usa le frecce per sfogliare le pagine, o tocca l'immagine per aprirla a schermo intero.
            </p>
          </div>

          {/* Quick Categories Navigation */}
          <div className="flex flex-wrap justify-center gap-2 mb-5 pb-3 border-b border-stone-150">
            {categories.map((cat, idx) => {
              const isActive = currentPage === cat.pageIndex;
              return (
                <button
                  key={idx}
                  onClick={() => handleCategoryClick(cat.pageIndex)}
                  className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-300 ${isActive
                      ? 'bg-emerald-700 text-white shadow-sm'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-750'
                    }`}
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {cat.name}
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
                alt={menuPages[currentPage].title}
                className="w-full h-full object-contain select-none"
              />

              {/* Image Interaction Layer */}
              <div
                onClick={() => setIsLightboxOpen(true)}
                className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors duration-300 cursor-zoom-in flex items-center justify-center"
              >
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/60 text-white text-xs px-4 py-2 rounded-xl flex items-center gap-2 backdrop-blur-sm border border-white/20">
                  <Maximize2 size={12} />
                  <span>Schermo Intero</span>
                </div>
              </div>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between w-full mt-4 px-2">
              <button
                onClick={handlePrev}
                className="p-3 bg-stone-850 hover:bg-stone-900 text-white rounded-xl transition-colors duration-300 shadow-md"
              >
                <ChevronLeft size={18} />
              </button>

              <div className="text-center">
                <span className="text-xs uppercase tracking-[0.25em] text-emerald-800 font-bold block mb-0.5">
                  {menuPages[currentPage].title}
                </span>
                <span className="text-[11px] text-stone-500 font-medium">
                  Pagina {currentPage + 1} di {menuPages.length}
                </span>
              </div>

              <button
                onClick={handleNext}
                className="p-3 bg-stone-850 hover:bg-stone-900 text-white rounded-xl transition-colors duration-300 shadow-md"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Thumbnail preview strip */}
          <div className="mt-6">
            <h4 className="text-center text-xs text-stone-500 font-semibold mb-2.5 uppercase tracking-wider">Tutte le Pagine</h4>
            <div className="flex gap-3 overflow-x-auto pb-4 pt-1 px-2 scrollbar-thin scrollbar-thumb-stone-300 scrollbar-track-transparent">
              {menuPages.map((page, idx) => {
                const isActive = currentPage === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => { setCurrentPage(idx); setZoomScale(1); }}
                    className={`flex-shrink-0 w-16 aspect-[1/1.4] rounded-lg overflow-hidden border-2 transition-all duration-300 shadow-sm ${isActive ? 'border-emerald-700 scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                  >
                    <img
                      src={getImageUrl(page.file)}
                      alt={page.title}
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
        <p className="text-center text-stone-400 text-xs mt-6 italic">
          Le proposte ed i prezzi del menù sono soggetti a variazioni in base alla stagionalità ed alla reperibilità degli ingredienti locali freschi dell'isola.
        </p>
      </div>

      {/* Lightbox / Zoomable Fullscreen Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col justify-between p-4 md:p-6 backdrop-blur-md">
          {/* Lightbox Topbar */}
          <div className="flex items-center justify-between text-white w-full max-w-7xl mx-auto border-b border-white/10 pb-3">
            <div>
              <h4 className="text-sm font-semibold tracking-wide text-emerald-500">{menuPages[currentPage].title}</h4>
              <p className="text-[10px] text-stone-400">Pagina {currentPage + 1} di {menuPages.length}</p>
            </div>

            {/* Zoom & Action Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleZoomOut}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
                title="Zoom Out"
              >
                <ZoomOut size={16} />
              </button>
              <span className="text-xs text-stone-400 font-mono w-10 text-center">
                {Math.round(zoomScale * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
                title="Zoom In"
              >
                <ZoomIn size={16} />
              </button>
              <div className="w-px h-5 bg-white/10 mx-1" />
              <button
                onClick={() => { setIsLightboxOpen(false); setZoomScale(1); }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200 text-stone-300 hover:text-white"
                title="Chiudi"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Lightbox Main Container */}
          <div className="flex-1 w-full flex items-center justify-center overflow-hidden my-4 relative">
            {/* Nav Arrows inside modal */}
            <button
              onClick={handlePrev}
              className="absolute left-2 md:left-6 z-10 p-3.5 bg-black/60 hover:bg-black/95 text-white rounded-full border border-white/10 transition-colors shadow-lg"
            >
              <ChevronLeft size={20} />
            </button>

            <div className="w-full h-full max-w-3xl flex items-center justify-center p-2 md:p-6 overflow-auto">
              <div
                className="transition-transform duration-200 ease-out max-h-full aspect-[1/1.4] relative flex justify-center items-center"
                style={{ transform: `scale(${zoomScale})` }}
              >
                <img
                  src={getImageUrl(menuPages[currentPage].file)}
                  alt={menuPages[currentPage].title}
                  className="max-w-full max-h-[80vh] object-contain rounded shadow-2xl"
                />
              </div>
            </div>

            <button
              onClick={handleNext}
              className="absolute right-2 md:right-6 z-10 p-3.5 bg-black/60 hover:bg-black/95 text-white rounded-full border border-white/10 transition-colors shadow-lg"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Lightbox Footer Navigation */}
          <div className="w-full max-w-4xl mx-auto flex gap-2 overflow-x-auto py-2 border-t border-white/10 px-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
            {menuPages.map((page, idx) => {
              const isActive = currentPage === idx;
              return (
                <button
                  key={idx}
                  onClick={() => { setCurrentPage(idx); setZoomScale(1); }}
                  className={`flex-shrink-0 w-12 aspect-[1/1.4] rounded overflow-hidden border-2 transition-all duration-300 ${isActive ? 'border-emerald-600 scale-105 shadow-lg' : 'border-transparent opacity-40 hover:opacity-85'
                    }`}
                >
                  <img
                    src={getImageUrl(page.file)}
                    alt={page.title}
                    className="w-full h-full object-cover"
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
