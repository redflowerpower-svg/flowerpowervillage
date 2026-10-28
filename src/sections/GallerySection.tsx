import { useState, useEffect, useCallback } from 'react';
import {
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Eye,
  Flower2,
  Palmtree,
  Waves,
  UtensilsCrossed,
  Dumbbell,
  Layers
} from 'lucide-react';
import { Language } from '../booking/lib/translations';
import { VILLAGE_GALLERY_PHOTOS } from '../data/villageGalleryData';

interface Props {
  lang?: Language;
}

type CategoryFilter = 'all' | 'garden' | 'pool' | 'restaurant' | 'yoga' | 'gym';

const galleryTranslations = {
  IT: {
    tag: 'Galleria Fotografica Ufficiale',
    title: 'La Vita al Flower Power Village',
    subtitle: 'Momenti autentici, natura tropicale, benessere e serenità nell\'isola di Koh Phayam',
    categories: {
      all: 'Tutte le Foto',
      garden: 'Giardino Tropicale',
      pool: 'Piscina & Relax',
      restaurant: 'Ristorante & Bar',
      yoga: 'Yoga Temple Shala',
      gym: 'Palestra all\'Aperto'
    },
    photoCount: 'foto',
    clickToEnlarge: 'Clicca per ingrandire',
    instagram: 'Segui @flowerpowerphayam su Instagram'
  },
  EN: {
    tag: 'Official Photo Gallery',
    title: 'Life at Flower Power Village',
    subtitle: 'Authentic moments, tropical nature, wellness and serenity on Koh Phayam Island',
    categories: {
      all: 'All Photos',
      garden: 'Tropical Gardens',
      pool: 'Swimming Pool',
      restaurant: 'Restaurant & Bar',
      yoga: 'Yoga Temple Shala',
      gym: 'Outdoor Gym'
    },
    photoCount: 'photos',
    clickToEnlarge: 'Click to enlarge',
    instagram: 'Follow @flowerpowerphayam on Instagram'
  },
  TH: {
    tag: 'แกลเลอรีภาพถ่ายอย่างเป็นทางการ',
    title: 'ชีวิตและบรรยากาศที่ ฟลาวเวอร์ พาวเวอร์ วิลเลจ',
    subtitle: 'บรรยากาศธรรมชาติ ทะเลอันดามัน สปาและความสงบสุขบนเกาะพยาม',
    categories: {
      all: 'ทุกภาพถ่าย',
      garden: 'สวนเมืองร้อน',
      pool: 'สระว่ายน้ำ',
      restaurant: 'ร้านอาหาร & บาร์',
      yoga: 'ศาลาโยคะ',
      gym: 'ฟิตเนสกลางแจ้ง'
    },
    photoCount: 'ภาพ',
    clickToEnlarge: 'คลิกเพื่อขยายภาพ',
    instagram: 'ติดตาม @flowerpowerphayam บน Instagram'
  },
  DE: {
    tag: 'Offizielle Fotogalerie',
    title: 'Das Leben im Flower Power Village',
    subtitle: 'Authentische Momente, tropische Natur, Wellness und Erholung auf Koh Phayam',
    categories: {
      all: 'Alle Fotos',
      garden: 'Tropischer Garten',
      pool: 'Swimmingpool',
      restaurant: 'Restaurant & Bar',
      yoga: 'Yoga-Tempel Shala',
      gym: 'Outdoor-Fitnessstudio'
    },
    photoCount: 'Fotos',
    clickToEnlarge: 'Klicken zum Vergrößern',
    instagram: 'Folgen Sie @flowerpowerphayam auf Instagram'
  }
};

const filterTabs = [
  { id: 'all' as const, icon: Layers },
  { id: 'garden' as const, icon: Palmtree },
  { id: 'pool' as const, icon: Waves },
  { id: 'restaurant' as const, icon: UtensilsCrossed },
  { id: 'yoga' as const, icon: Flower2 },
  { id: 'gym' as const, icon: Dumbbell },
];

const categoryBlockLabels: Record<CategoryFilter, Record<Language, [string, string]>> = {
  all: {
    IT: ['TUTTE LE', 'FOTO'],
    EN: ['ALL', 'PHOTOS'],
    TH: ['ภาพถ่าย', 'ทั้งหมด'],
    DE: ['ALLE', 'FOTOS'],
  },
  garden: {
    IT: ['GIARDINO', 'TROPICALE'],
    EN: ['TROPICAL', 'GARDENS'],
    TH: ['สวนเมืองร้อน', '& ธรรมชาติ'],
    DE: ['TROPISCHER', 'GARTEN'],
  },
  pool: {
    IT: ['PISCINA', '& RELAX'],
    EN: ['SWIMMING', 'POOL'],
    TH: ['สระว่ายน้ำ', '& รีแลกซ์'],
    DE: ['SWIMMING', 'POOL'],
  },
  restaurant: {
    IT: ['RISTORANTE', '& BAR'],
    EN: ['RESTAURANT', '& BAR'],
    TH: ['ร้านอาหาร', '& บาร์'],
    DE: ['RESTAURANT', '& BAR'],
  },
  yoga: {
    IT: ['YOGA', 'TEMPLE'],
    EN: ['YOGA', 'SHALA'],
    TH: ['ศาลา', 'โยคะ'],
    DE: ['YOGA', 'TEMPEL'],
  },
  gym: {
    IT: ['AREA GYM', '& FITNESS'],
    EN: ['OUTDOOR', 'GYM'],
    TH: ['ฟิตเนส', 'กลางแจ้ง'],
    DE: ['FITNESS', '& GYM'],
  },
};

export default function GallerySection({ lang = 'IT' }: Props) {
  const t = galleryTranslations[lang] || galleryTranslations['IT'];
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>('all');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filteredPhotos = activeFilter === 'all'
    ? VILLAGE_GALLERY_PHOTOS
    : VILLAGE_GALLERY_PHOTOS.filter(p => p.category === activeFilter);

  // Dynamic grid tailored so every category forms a 100% complete, flush rectangle
  const getGridColsClass = () => {
    switch (activeFilter) {
      case 'all':
        // 21 photos = 3 columns x 7 full rows (solid rectangle)
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
      case 'garden':
        // 8 photos = 4 columns x 2 full rows (solid rectangle)
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
      case 'restaurant':
        // 4 photos = 4 columns x 1 full row (solid rectangle)
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
      case 'pool':
      case 'yoga':
      case 'gym':
        // 3 photos = 3 columns x 1 full row (solid rectangle)
        return 'grid-cols-1 sm:grid-cols-3';
      default:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
    }
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
    document.body.style.overflow = '';
  };

  const prevPhoto = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev! === 0 ? filteredPhotos.length - 1 : prev! - 1));
  }, [lightboxIndex, filteredPhotos.length]);

  const nextPhoto = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev! === filteredPhotos.length - 1 ? 0 : prev! + 1));
  }, [lightboxIndex, filteredPhotos.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') prevPhoto();
      if (e.key === 'ArrowRight') nextPhoto();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, prevPhoto, nextPhoto]);

  return (
    <section className="py-12 md:py-20 bg-[#fbfbfa] animate-fadeIn">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-center mb-8 md:mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/60 mb-3 shadow-xs">
            <Sparkles size={13} className="text-emerald-700" />
            <span
              className="text-xs tracking-[0.25em] uppercase text-emerald-800 font-semibold"
              style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
            >
              {t.tag}
            </span>
          </div>

          <h1
            className="text-stone-900 mb-3"
            style={{
              fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif',
              fontSize: 'clamp(2rem, 4vw, 3.2rem)',
              fontWeight: 400,
              letterSpacing: '-0.02em'
            }}
          >
            {t.title}
          </h1>

          <p
            className="text-stone-600 max-w-2xl mx-auto text-xs md:text-sm font-light leading-relaxed mb-6"
            style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
          >
            {t.subtitle}
          </p>

          <div className="w-16 h-0.5 bg-emerald-600/80 mx-auto rounded-full" />
        </div>

        {/* PIZZERIA STYLE CATEGORY SELECTOR (Structured square blocks with icon above & two-line text) */}
        <div className="flex items-center justify-center gap-2.5 sm:gap-3.5 flex-wrap mb-10 max-w-5xl mx-auto">
          {filterTabs.map((tab) => {
            const Icon = tab.icon;
            const count = tab.id === 'all'
              ? VILLAGE_GALLERY_PHOTOS.length
              : VILLAGE_GALLERY_PHOTOS.filter(p => p.category === tab.id).length;
            const isSelected = activeFilter === tab.id;
            const [line1, line2] = categoryBlockLabels[tab.id][lang] || categoryBlockLabels[tab.id]['IT'];

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveFilter(tab.id);
                  setLightboxIndex(null);
                }}
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

                {/* Subtle count indicator */}
                <div
                  className={`text-[9px] px-2 py-0.5 rounded-full font-mono font-bold leading-none ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-[#ded0bf]/70 text-[#2c1a11]/80'
                  }`}
                >
                  {count}
                </div>
              </button>
            );
          })}
        </div>

        {/* Flush Rectangular Grid (Perfect balanced rectangle on all 4 sides) */}
        <div className={`grid ${getGridColsClass()} gap-4`}>
          {filteredPhotos.map((photo, i) => (
            <div
              key={photo.id}
              onClick={() => openLightbox(i)}
              className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-stone-100 shadow-xs hover:shadow-xl transition-all duration-300 border border-stone-200/80 cursor-pointer"
            >
              <img
                src={photo.url}
                onError={(e) => { e.currentTarget.src = photo.localUrl; }}
                alt={photo.categoryName}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />

              {/* Gradient overlay & badges on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4">
                <div className="flex justify-end">
                  <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-sm">
                    <Maximize2 size={14} />
                  </div>
                </div>
                <div>
                  <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-emerald-300 mb-1">
                    {lang === 'IT' ? photo.categoryNameIt : photo.categoryName}
                  </span>
                  <p className="text-white text-xs font-light flex items-center gap-1.5 opacity-90">
                    <Eye size={12} className="text-emerald-400" />
                    <span>{t.clickToEnlarge}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Instagram Footer Link */}
        <div className="text-center mt-12 md:mt-16 pt-8 border-t border-stone-200">
          <a
            href="https://www.instagram.com/flowerpowerphayam"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-stone-600 hover:text-emerald-700 transition-colors font-semibold"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            <Flower2 size={15} className="text-emerald-600" />
            <span>{t.instagram}</span>
          </a>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && filteredPhotos[lightboxIndex] && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 animate-fadeIn"
          onClick={closeLightbox}
        >
          {/* Top Bar */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-white z-20 pointer-events-auto">
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase tracking-widest px-3 py-1 bg-emerald-800/80 rounded-full border border-emerald-400/30">
                {lang === 'IT' ? filteredPhotos[lightboxIndex].categoryNameIt : filteredPhotos[lightboxIndex].categoryName}
              </span>
              <span className="text-xs text-white/70 font-mono">
                {lightboxIndex + 1} / {filteredPhotos.length}
              </span>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                closeLightbox();
              }}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition-colors cursor-pointer text-white"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          {/* Left Arrow */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prevPhoto();
            }}
            className="absolute left-2 sm:left-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition-colors cursor-pointer text-white z-20"
            aria-label="Previous photo"
          >
            <ChevronLeft size={24} />
          </button>

          {/* Main Photo */}
          <div
            className="relative max-w-6xl max-h-[85vh] flex items-center justify-center p-2 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={filteredPhotos[lightboxIndex].url}
              onError={(e) => { e.currentTarget.src = filteredPhotos[lightboxIndex].localUrl; }}
              alt={filteredPhotos[lightboxIndex].categoryName}
              className="max-h-[82vh] max-w-full w-auto object-contain rounded-xl shadow-2xl transition-all duration-300"
            />
          </div>

          {/* Right Arrow */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              nextPhoto();
            }}
            className="absolute right-2 sm:right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition-colors cursor-pointer text-white z-20"
            aria-label="Next photo"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      )}
    </section>
  );
}
