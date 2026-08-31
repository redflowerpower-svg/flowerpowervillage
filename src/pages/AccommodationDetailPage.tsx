import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Check, Users, BedDouble, Bath, ArrowLeft, Home, Loader2, Globe, ChevronDown } from 'lucide-react';
import { fetchAccommodationBySlug, type Accommodation, typeLabels } from '../data/accommodationsData';
import { Language } from '../booking/lib/translations';

const typeTagColor: Record<string, string> = {
  villa: 'bg-amber-600',
  bungalow: 'bg-emerald-700',
  room: 'bg-stone-600',
  lodge: 'bg-stone-700',
  tent: 'bg-teal-700',
};

const detailTranslations = {
  IT: {
    backToAccommodations: 'Tutti gli Alloggi',
    home: 'Home',
    roomNotFound: 'Alloggio non trovato',
    roomNotFoundDesc: "Questo alloggio non esiste o potrebbe essere stato rinominato. Esplora tutte le camere disponibili.",
    from: 'A partire da',
    perNight: 'per notte',
    photosComingSoon: 'Foto in arrivo',
    guestsLabel: 'Ospiti',
    guestsUpTo: 'Fino a',
    roomsLabel: 'Camere',
    bathroomsLabel: 'Bagni',
    bedConfig: 'Configurazione Letti',
    whatsIncluded: 'Cosa è Incluso',
    reserveRoom: 'Prenota questo alloggio',
    checkInLabel: 'Check-in',
    checkOutLabel: 'Check-out',
    checkInTime: '13:00 – 21:30',
    checkOutTime: 'Entro le 11:00',
    directBooking: 'Prenotazione diretta',
    directBookingDiscount: 'Sconto 10% garantito',
    bookNow: 'Prenota Ora',
    replyNote: 'Rispondiamo entro poche ore via WhatsApp o email.'
  },
  EN: {
    backToAccommodations: 'All Accommodations',
    home: 'Home',
    roomNotFound: 'Room not found',
    roomNotFoundDesc: "This accommodation does not exist or may have been renamed. Browse all available rooms below.",
    from: 'Starting from',
    perNight: 'per night',
    photosComingSoon: 'Photos coming soon',
    guestsLabel: 'Guests',
    guestsUpTo: 'Up to',
    roomsLabel: 'Rooms',
    bathroomsLabel: 'Bathrooms',
    bedConfig: 'Bed Configuration',
    whatsIncluded: 'What is Included',
    reserveRoom: 'Reserve this room',
    checkInLabel: 'Check-in',
    checkOutLabel: 'Check-out',
    checkInTime: '13:00 – 21:30',
    checkOutTime: 'By 11:00',
    directBooking: 'Direct booking',
    directBookingDiscount: '10% off guaranteed',
    bookNow: 'Book Now',
    replyNote: 'We reply within a few hours via WhatsApp or email.'
  },
  TH: {
    backToAccommodations: 'ที่พักทั้งหมด',
    home: 'หน้าหลัก',
    roomNotFound: 'ไม่พบห้องพักนี้',
    roomNotFoundDesc: 'ที่พักนี้อาจถูกเปลี่ยนชื่อหรือไม่มีให้บริการ โปรดเลือกดูห้องพักทั้งหมดของเรา',
    from: 'เริ่มต้นที่',
    perNight: 'ต่อคืน',
    photosComingSoon: 'รูปภาพเพิ่มเติมเร็วๆ นี้',
    guestsLabel: 'ผู้เข้าพัก',
    guestsUpTo: 'สูงสุด',
    roomsLabel: 'ห้องนอน',
    bathroomsLabel: 'ห้องน้ำ',
    bedConfig: 'รูปแบบเตียงนอน',
    whatsIncluded: 'สิ่งอำนวยความสะดวกที่รวมอยู่',
    reserveRoom: 'จองห้องพักนี้',
    checkInLabel: 'เช็คอิน',
    checkOutLabel: 'เช็คเอาท์',
    checkInTime: '13:00 – 21:30 น.',
    checkOutTime: 'ก่อน 11:00 น.',
    directBooking: 'จองตรงกับเรา',
    directBookingDiscount: 'รับส่วนลด 10% ทันที',
    bookNow: 'จองเลยตอนนี้',
    replyNote: 'เราจะตอบกลับภายในไม่กี่ชั่วโมงผ่าน WhatsApp หรืออีเมล'
  },
  DE: {
    backToAccommodations: 'Alle Unterkünfte',
    home: 'Startseite',
    roomNotFound: 'Zimmer nicht gefunden',
    roomNotFoundDesc: 'Diese Unterkunft existiert nicht oder wurde möglicherweise umbenannt. Durchsuchen Sie alle verfügbaren Zimmer.',
    from: 'Ab',
    perNight: 'pro Nacht',
    photosComingSoon: 'Fotos folgen in Kürze',
    guestsLabel: 'Gäste',
    guestsUpTo: 'Bis zu',
    roomsLabel: 'Zimmer',
    bathroomsLabel: 'Badezimmer',
    bedConfig: 'Bettkonfiguration',
    whatsIncluded: 'Was enthalten ist',
    reserveRoom: 'Dieses Zimmer reservieren',
    checkInLabel: 'Check-in',
    checkOutLabel: 'Check-out',
    checkInTime: '13:00 – 21:30 Uhr',
    checkOutTime: 'Bis 11:00 Uhr',
    directBooking: 'Direktbuchung',
    directBookingDiscount: '10% Rabatt garantiert',
    bookNow: 'Jetzt Buchen',
    replyNote: 'Wir antworten innerhalb weniger Stunden per WhatsApp oder E-Mail.'
  }
};

const languages: { code: Language; label: string; flag: string }[] = [
  { code: 'IT', label: 'Italiano', flag: '🇮🇹' },
  { code: 'EN', label: 'English', flag: '🇬🇧' },
  { code: 'TH', label: 'ภาษาไทย', flag: '🇹🇭' },
  { code: 'DE', label: 'Deutsch', flag: '🇩🇪' },
];

export default function AccommodationDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [accommodation, setAccommodation] = useState<Accommodation | null | undefined>(undefined);
  const [lang, setLang] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = document.documentElement.getAttribute('data-lang') as Language;
      if (saved && ['IT', 'EN', 'TH', 'DE'].includes(saved)) return saved;
      const browserLang = navigator.language.slice(0, 2).toUpperCase();
      return ['IT', 'EN', 'TH', 'DE'].includes(browserLang) ? (browserLang as Language) : 'EN';
    }
    return 'EN';
  });
  const [langOpen, setLangOpen] = useState(false);

  const t = detailTranslations[lang] || detailTranslations['IT'];

  useEffect(() => {
    document.documentElement.setAttribute('data-lang', lang);
  }, [lang]);

  useEffect(() => {
    if (!slug) { setAccommodation(null); return; }
    fetchAccommodationBySlug(slug)
      .then(setAccommodation)
      .catch(() => setAccommodation(null));
  }, [slug]);

  if (accommodation === undefined) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 size={28} className="text-amber-500 animate-spin" />
      </div>
    );
  }

  if (accommodation === null) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center animate-fadeIn">
        <p
          className="text-stone-300 mb-4 select-none"
          style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 'clamp(4rem, 12vw, 8rem)', fontWeight: 300 }}
        >
          404
        </p>
        <h1
          className="text-stone-800 mb-3"
          style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 300 }}
        >
          {t.roomNotFound}
        </h1>
        <p className="text-stone-500 text-sm mb-8 max-w-sm">
          {t.roomNotFoundDesc}
        </p>
        <Link
          to="/village"
          className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 text-white text-xs tracking-[0.15em] uppercase hover:bg-amber-700 transition-colors rounded-xl shadow"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          {t.backToAccommodations}
        </Link>
      </div>
    );
  }

  const tagColor = typeTagColor[accommodation.type] ?? 'bg-stone-600';

  return (
    <div className="min-h-screen bg-white animate-fadeIn">
      {/* Top nav bar */}
      <nav className="sticky top-0 z-50 bg-[#3b3530] text-white border-b border-stone-700/60 px-6 py-3.5 flex items-center justify-between shadow-md">
        <Link
          to="/village"
          className="inline-flex items-center gap-2 text-stone-300 hover:text-white transition-colors text-xs uppercase font-bold tracking-wider"
          style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
        >
          <ArrowLeft size={16} />
          {t.backToAccommodations}
        </Link>

        <div className="flex items-center gap-4">
          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 bg-black/35 hover:bg-black/55 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15 shadow-sm text-stone-200 hover:text-white transition-all cursor-pointer font-bold text-xs uppercase"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>{lang}</span>
              <ChevronDown
                className="w-3.5 h-3.5 transition-transform duration-200 text-stone-400"
                style={{ transform: langOpen ? 'rotate(180deg)' : 'none' }}
              />
            </button>

            {langOpen && (
              <>
                <div className="fixed inset-0 z-40 cursor-default" onClick={() => setLangOpen(false)} />
                <div className="absolute right-0 mt-2 w-36 bg-[#3b3530]/98 backdrop-blur-md rounded-2xl border border-white/15 shadow-2xl z-50 overflow-hidden py-1.5 animate-fadeIn">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => {
                        setLang(l.code);
                        setLangOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs font-bold transition-all flex items-center justify-between hover:bg-white/10 cursor-pointer ${
                        lang === l.code ? 'text-emerald-400 bg-emerald-500/10' : 'text-stone-300'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{l.flag}</span>
                        <span>{l.label}</span>
                      </span>
                      {lang === l.code && <span className="text-[10px] text-emerald-400">✓</span>}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-stone-400 hover:text-white transition-colors text-xs tracking-widest uppercase font-semibold"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            <Home size={14} />
            <span className="hidden sm:inline">{t.home}</span>
          </Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12 md:py-16">
        {/* Header */}
        <div className="mb-10">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <span
                className={`inline-block ${tagColor} text-white text-xs px-3 py-1 tracking-wide uppercase mb-3 rounded-md font-bold`}
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {typeLabels[accommodation.type]}
              </span>
              <h1
                className="text-stone-850"
                style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif', fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, lineHeight: 1.1 }}
              >
                {accommodation.name}
              </h1>
            </div>
            {accommodation.price_per_night > 0 && (
              <div className="text-right">
                <p className="text-xs text-stone-400 uppercase tracking-wide mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {t.from}
                </p>
                <p
                  className="text-emerald-850"
                  style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif', fontSize: '2.25rem', fontWeight: 900 }}
                >
                  ฿{accommodation.price_per_night.toLocaleString()}
                </p>
                <p className="text-xs text-stone-400 font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>{t.perNight}</p>
              </div>
            )}
          </div>
          <div className="w-12 h-1 bg-emerald-600 rounded-full" />
        </div>

        {/* Image gallery */}
        {accommodation.images.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-12">
            {accommodation.images.map((src, i) => (
              <div
                key={i}
                className={`overflow-hidden rounded-2xl ${i === 0 ? 'md:col-span-2 aspect-[16/7]' : 'aspect-[4/3]'}`}
              >
                <img
                  src={src}
                  alt={`${accommodation.name} — photo ${i + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 rounded-2xl"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="aspect-[16/7] bg-stone-50 border border-stone-100 flex items-center justify-center mb-12 rounded-2xl">
            <p className="text-stone-400 text-sm font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
              {t.photosComingSoon}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Left: description + features */}
          <div className="md:col-span-2 space-y-8">
            <p className="text-stone-600 leading-relaxed text-base" style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}>
              {accommodation.description}
            </p>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: <Users size={18} className="text-emerald-700" />, label: t.guestsLabel, value: `${t.guestsUpTo} ${accommodation.capacity}` },
                { icon: <BedDouble size={18} className="text-emerald-700" />, label: t.roomsLabel, value: accommodation.rooms },
                { icon: <Bath size={18} className="text-emerald-700" />, label: t.bathroomsLabel, value: accommodation.bathrooms },
              ].map(({ icon, label, value }) => (
                <div key={label} className="p-4 bg-stone-50 border border-stone-200 rounded-xl text-center shadow-xs">
                  <div className="flex justify-center mb-2">{icon}</div>
                  <p className="text-stone-850 font-bold text-sm mb-0.5" style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}>{value}</p>
                  <p className="text-stone-500 text-xs uppercase font-semibold tracking-wide" style={{ fontFamily: 'Inter, sans-serif' }}>{label}</p>
                </div>
              ))}
            </div>

            {/* Bed configuration */}
            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
              <p className="text-xs text-stone-500 uppercase tracking-[0.2em] font-bold mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                {t.bedConfig}
              </p>
              <p className="text-stone-800 text-sm font-semibold" style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}>
                {accommodation.beds}
              </p>
            </div>

            {/* Features */}
            {accommodation.features && accommodation.features.length > 0 && (
              <div>
                <p className="text-xs text-stone-500 uppercase tracking-[0.2em] font-bold mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {t.whatsIncluded}
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {accommodation.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-stone-600 font-medium" style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}>
                      <Check size={14} className="text-emerald-600 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right: booking panel */}
          <div className="md:col-span-1">
            <div className="sticky top-24 p-6 border border-stone-300 bg-stone-50 rounded-2xl shadow-sm space-y-5">
              <div>
                <p
                  className="text-stone-850 mb-1 font-bold text-lg"
                  style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
                >
                  {t.reserveRoom}
                </p>
                <div className="w-8 h-1 bg-emerald-600 rounded-full" />
              </div>

              <div className="space-y-2.5 text-xs text-stone-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                <div className="flex justify-between py-2 border-b border-stone-200">
                  <span>{t.checkInLabel}</span><span className="text-stone-800 font-bold">{t.checkInTime}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-stone-200">
                  <span>{t.checkOutLabel}</span><span className="text-stone-800 font-bold">{t.checkOutTime}</span>
                </div>
                <div className="flex justify-between py-2 bg-emerald-500/10 p-2 rounded-lg text-emerald-900 border border-emerald-500/20">
                  <span className="font-semibold">{t.directBooking}</span><span className="font-black text-emerald-800">{t.directBookingDiscount}</span>
                </div>
              </div>

              <Link
                to="/village"
                className="block w-full py-3.5 bg-emerald-800 text-white text-xs tracking-[0.15em] uppercase text-center font-black rounded-xl hover:bg-emerald-700 transition-colors shadow-md cursor-pointer"
                style={{ fontFamily: 'Outfit, IBM Plex Sans Thai, sans-serif' }}
              >
                {t.bookNow}
              </Link>

              <p className="text-xs text-stone-500 text-center leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                {t.replyNote}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
