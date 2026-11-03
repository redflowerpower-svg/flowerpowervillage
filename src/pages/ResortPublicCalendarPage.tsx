import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Share2, 
  ArrowLeft, 
  Users, 
  Sparkles, 
  CheckCircle2, 
  X,
  Camera,
  Rows3,
  LayoutGrid
} from 'lucide-react';
import { fetchAccommodations, EnrichedAccommodation } from '../booking/data/accommodationsService';
import { fetchOctorateMonthlyGrid, OctorateDayData } from '../booking/lib/octorate';
import { translations, Language } from '../booking/lib/translations';
import { findAccommodationIdentity } from '../booking/resort/config/accommodations';
import RoomFeaturesGrid from '../booking/resort/components/RoomFeaturesGrid';
import VillageFooter from '../components/VillageFooter';

const MONTH_NAMES: Record<Language, string[]> = {
  IT: ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'],
  EN: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  TH: ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'],
  DE: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember']
};

const DAY_NAMES_SHORT: Record<Language, string[]> = {
  IT: ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'],
  EN: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  TH: ['จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.', 'อา.'],
  DE: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
};

const CATEGORIES = ['TUTTI', 'VILLE', 'BUNGALOW', 'TENDE GLAMPING', 'THE HUB GUESTHOUSE'] as const;

function cleanSlug(s: string): string {
  if (!s) return '';
  return String(s).toLowerCase().replace(/^\d+[-_]/, '').trim();
}

function formatPrice(val: number): string {
  return '฿' + Math.round(val).toLocaleString();
}

/**
 * Splitta il nome di ogni alloggio esattamente su due righe per massimizzare la compattezza orizzontale
 * Es: Red / Bungalow, Peace & Love / Villa, Penthouse / Villa, Jungle / Villa, ecc.
 */
function getRoomNameTwoLines(name: string, lang: Language): { line1: string; line2: string } {
  const clean = (name || '').trim().toLowerCase();

  if (clean.includes('red') && clean.includes('bungalow')) {
    return lang === 'TH' ? { line1: 'เรด', line2: 'บังกะโล' } : { line1: 'Red', line2: 'Bungalow' };
  }
  if (clean.includes('yellow') && clean.includes('bungalow')) {
    return lang === 'TH' ? { line1: 'เยลโลว์', line2: 'บังกะโล' } : { line1: 'Yellow', line2: 'Bungalow' };
  }
  if (clean.includes('green') && clean.includes('bungalow')) {
    return lang === 'TH' ? { line1: 'กรีน', line2: 'บังกะโล' } : { line1: 'Green', line2: 'Bungalow' };
  }
  if (clean.includes('peace') && (clean.includes('love') || clean.includes('villa'))) {
    return lang === 'TH' ? { line1: 'พีซ แอนด์ เลิฟ', line2: 'วิลล่า' } : { line1: 'Peace & Love', line2: 'Villa' };
  }
  if (clean.includes('penthouse')) {
    return lang === 'TH' ? { line1: 'เพนท์เฮาส์', line2: 'วิลล่า' } : { line1: 'Penthouse', line2: 'Villa' };
  }
  if (clean.includes('jungle') && clean.includes('left')) {
    return lang === 'TH' ? { line1: 'จังเกิล ซ้าย', line2: 'วิลล่า' } : { line1: 'Jungle Left', line2: 'Villa' };
  }
  if (clean.includes('jungle') && clean.includes('right')) {
    return lang === 'TH' ? { line1: 'จังเกิล ขวา', line2: 'วิลล่า' } : { line1: 'Jungle Right', line2: 'Villa' };
  }
  if (clean.includes('jungle')) {
    return lang === 'TH' ? { line1: 'จังเกิล', line2: 'วิลล่า' } : { line1: 'Jungle', line2: 'Villa' };
  }
  if (clean.includes('camel')) {
    return lang === 'TH' ? { line1: 'คาเมล เต็นท์', line2: 'บังกะโล' } : { line1: 'Camel Tent', line2: 'Bungalow' };
  }
  if (clean.includes('lagoon')) {
    return lang === 'TH' ? { line1: 'ลากูน เต็นท์', line2: 'บังกะโล' } : { line1: 'Lagoon Tent', line2: 'Bungalow' };
  }
  if (clean.includes('internal')) {
    return lang === 'TH' ? { line1: 'อินเทอร์นอล', line2: 'รูม' } : { line1: 'Internal', line2: 'Room' };
  }
  const roomMatch = clean.match(/room\s*(\d+)/i);
  if (roomMatch) {
    return lang === 'TH' ? { line1: 'ห้องพัก', line2: `Room ${roomMatch[1]}` } : { line1: 'Room', line2: roomMatch[1] };
  }
  const lodgeMatch = clean.match(/lodge\s*(\d+)/i);
  if (lodgeMatch) {
    return lang === 'TH' ? { line1: 'ลอดจ์', line2: `Lodge ${lodgeMatch[1]}` } : { line1: 'Lodge', line2: lodgeMatch[1] };
  }
  if (clean.includes('fake') && clean.includes('bungalow')) {
    return { line1: 'Fake', line2: 'Bungalow' };
  }

  // Fallback
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return { line1: parts.slice(0, -1).join(' '), line2: parts[parts.length - 1] };
  }
  return { line1: name, line2: '' };
}

export default function ResortPublicCalendarPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // 1. Language Initialization
  const [lang, setLang] = useState<Language>(() => {
    const urlLang = (searchParams.get('lang') || '').toUpperCase();
    if (['IT', 'EN', 'TH', 'DE'].includes(urlLang)) return urlLang as Language;
    if (typeof window !== 'undefined') {
      const saved = document.documentElement.getAttribute('data-lang') as Language;
      if (saved && ['IT', 'EN', 'TH', 'DE'].includes(saved)) return saved;
      const browserLang = navigator.language.slice(0, 2).toUpperCase();
      if (['IT', 'EN', 'TH', 'DE'].includes(browserLang)) return browserLang as Language;
    }
    return 'IT';
  });

  const t = (key: keyof typeof translations['IT'], variables?: Record<string, string | number>) => {
    let text = (translations[lang] || translations['IT'])[key] || translations['IT'][key] || '';
    if (variables) {
      Object.entries(variables).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v));
      });
    }
    return text;
  };

  // 2. View Mode (Timeline/Matrix vs Blocks)
  const [viewMode, setViewMode] = useState<'timeline' | 'blocks'>('timeline');

  // 3. Month & Year state
  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => {
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [today]);

  const [viewDate, setViewDate] = useState<Date>(() => {
    const monthParam = searchParams.get('month'); // YYYY-MM
    const fromParam = searchParams.get('from') || searchParams.get('checkIn');
    if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
      const [y, m] = monthParam.split('-').map(Number);
      return new Date(y, m - 1, 1);
    }
    if (fromParam && /^\d{4}-\d{2}-\d{2}$/.test(fromParam)) {
      const [y, m] = fromParam.split('-').map(Number);
      return new Date(y, m - 1, 1);
    }
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();

  // 4. Rooms and Grid state
  const [rooms, setRooms] = useState<EnrichedAccommodation[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [gridData, setGridData] = useState<Record<string, Record<string, OctorateDayData>>>({});
  const [loadingGrid, setLoadingGrid] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('TUTTI');

  // Hero Room selection
  const [heroRoomSlug, setHeroRoomSlug] = useState<string | null>(() => {
    return searchParams.get('room') || searchParams.get('slug') || null;
  });

  // Date Selection Range
  const [checkIn, setCheckIn] = useState<string | null>(() => {
    return searchParams.get('from') || searchParams.get('checkIn') || null;
  });
  const [checkOut, setCheckOut] = useState<string | null>(() => {
    return searchParams.get('to') || searchParams.get('checkOut') || null;
  });
  const [bookingRoomSlug, setBookingRoomSlug] = useState<string | null>(null);

  // Timeline horizontal scroll ref
  const timelineScrollRef = useRef<HTMLDivElement | null>(null);

  // Full-screen Room Preview Modal on demand
  const [previewModalRoom, setPreviewModalRoom] = useState<EnrichedAccommodation | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  // Notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Keyboard navigation for Preview Modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!previewModalRoom) return;
      if (e.key === 'Escape') {
        setPreviewModalRoom(null);
      } else if (e.key === 'ArrowRight') {
        const imgs = previewModalRoom.images || [];
        if (imgs.length > 1) {
          setActiveImageIndex((prev) => (prev + 1) % imgs.length);
        }
      } else if (e.key === 'ArrowLeft') {
        const imgs = previewModalRoom.images || [];
        if (imgs.length > 1) {
          setActiveImageIndex((prev) => (prev - 1 + imgs.length) % imgs.length);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewModalRoom]);

  // Lock body scroll when preview modal is active
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = previewModalRoom ? 'hidden' : '';
    }
    return () => {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
      }
    };
  }, [previewModalRoom]);

  // 5. Fetch Accommodations
  useEffect(() => {
    setLoadingRooms(true);
    fetchAccommodations()
      .then((data) => {
        // Enforce Rule 9: Categorically filter out any bathroom photos
        const safeRooms = data.map((room) => ({
          ...room,
          images: (room.images || []).filter(
            (img) => !/toilet|bathroom|washroom/i.test(img)
          )
        }));
        setRooms(safeRooms);
        setLoadingRooms(false);
      })
      .catch((err) => {
        console.error('Failed to load accommodations for calendar:', err);
        setLoadingRooms(false);
      });
  }, []);

  // 6. Fetch Octorate Grid for visible month window
  useEffect(() => {
    const fetchMonthGrid = async () => {
      setLoadingGrid(true);
      try {
        const startDate = new Date(currentYear, currentMonth, 1);
        const endDate = new Date(currentYear, currentMonth + 1, 0);
        const dateFrom = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-01`;
        const dateTo = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;

        const grid = await fetchOctorateMonthlyGrid(dateFrom, dateTo);
        setGridData((prev) => ({ ...prev, ...grid }));
      } catch (err) {
        console.warn('[Calendar Page] Error fetching monthly grid:', err);
      } finally {
        setLoadingGrid(false);
      }
    };

    fetchMonthGrid();
  }, [currentYear, currentMonth]);

  // Synchronize URL search params
  const updateUrlParams = (newParams: Record<string, string | null>) => {
    const updated = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([k, v]) => {
      if (v === null || v === '') {
        updated.delete(k);
      } else {
        updated.set(k, v);
      }
    });
    setSearchParams(updated, { replace: true });
  };

  // Month navigation helpers
  const handlePrevMonth = () => {
    setViewDate(new Date(currentYear, currentMonth - 1, 1));
  };
  const handleNextMonth = () => {
    setViewDate(new Date(currentYear, currentMonth + 1, 1));
  };
  const handleCurrentMonth = () => {
    setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  // Calendar day calculation: parte direttamente dal primo giorno libero/valido (senza caselle vuote né giorni passati)
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const monthDayNumbers = useMemo(() => {
    const isCurrentMonthView = currentYear === today.getFullYear() && currentMonth === today.getMonth();
    // Se siamo nel mese corrente, inizia direttamente da OGGI (primo giorno libero/valido), senza caselle vuote o giorni passati!
    const startDay = isCurrentMonthView ? today.getDate() : 1;
    const days: number[] = [];
    for (let d = startDay; d <= daysInMonth; d++) {
      days.push(d);
    }
    return days;
  }, [currentYear, currentMonth, today, daysInMonth]);

  // Lookup day data for room
  const getDayData = (room: EnrichedAccommodation, dateStr: string): OctorateDayData | null => {
    if (!gridData) return null;
    const ident = findAccommodationIdentity(room.slug) || findAccommodationIdentity(room.name) || findAccommodationIdentity(room.id);
    const keysToCheck = [
      room.name,
      room.name?.toLowerCase(),
      room.slug,
      room.id,
      room.octorateId ? String(room.octorateId) : '',
      ident?.canonicalSlug,
      ident?.legacySlug,
      ...(ident?.aliases || [])
    ].filter(Boolean) as string[];

    for (const key of keysToCheck) {
      if (gridData[key] && gridData[key][dateStr]) {
        return gridData[key][dateStr];
      }
    }
    return null;
  };

  // Room identification helper
  const getRoomIdent = (room: EnrichedAccommodation) => {
    return findAccommodationIdentity(room.slug) || findAccommodationIdentity(room.name) || findAccommodationIdentity(room.id);
  };

  // Verifica se un alloggio ha almeno 1 giorno disponibile/prenotabile nel mese visualizzato
  const isRoomAvailableInMonth = (room: EnrichedAccommodation): boolean => {
    if (!gridData || Object.keys(gridData).length === 0) return true;

    for (const dayNum of monthDayNumbers) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      const dData = getDayData(room, dateStr);
      // È disponibile se esiste dData, available è true, stopSell non è attivo e il prezzo non è quello fittizio di chiusura (>= 10.000)
      if (dData && dData.available && !dData.stopSell && dData.price > 0 && dData.price < 10000) {
        return true;
      }
    }
    return false;
  };

  // Ordered Rooms: Hero Room FIRST, followed by other rooms (filtered by availability and category)
  // Gli alloggi non disponibili (come Room 1,2,3,4,5, Lodge 1,2 con 0 disponibilità) non compaiono
  const { heroRoom, sortedRoomsList } = useMemo(() => {
    if (!rooms || rooms.length === 0) return { heroRoom: null, sortedRoomsList: [] };

    // 1. Esclude alloggi fittizi o test
    const realRooms = rooms.filter((r) => {
      const slug = cleanSlug(r.slug || r.name);
      return !slug.includes('fake');
    });

    // 2. Filtra per disponibilità nel mese (se i dati Octorate sono caricati)
    // Se un alloggio non ha nemmeno 1 giorno libero (0 disponibilità), NON deve comparire
    const hasGrid = Boolean(gridData && Object.keys(gridData).length > 0);
    const availableRooms = hasGrid
      ? realRooms.filter((r) => isRoomAvailableInMonth(r))
      : realRooms;

    let targetRoom: EnrichedAccommodation | null = null;

    if (heroRoomSlug) {
      const cleanHero = cleanSlug(heroRoomSlug);
      targetRoom = availableRooms.find((r) => {
        const ident = getRoomIdent(r);
        if (ident && (ident.canonicalSlug === cleanHero || ident.legacySlug === heroRoomSlug || ident.aliases.includes(heroRoomSlug))) {
          return true;
        }
        return cleanSlug(r.slug) === cleanHero || cleanSlug(r.name) === cleanHero;
      }) || null;
    }

    if (!targetRoom && availableRooms.length > 0) {
      targetRoom = availableRooms[0];
    }

    const others = availableRooms.filter((r) => r.id !== targetRoom?.id);

    const filteredOthers = selectedCategory === 'TUTTI'
      ? others
      : others.filter((r) => r.category.toUpperCase() === selectedCategory);

    const list = targetRoom ? [targetRoom, ...filteredOthers] : filteredOthers;

    return { heroRoom: targetRoom, sortedRoomsList: list };
  }, [rooms, heroRoomSlug, selectedCategory, gridData, monthDayNumbers, currentYear, currentMonth]);

  // Open Preview Modal for Room
  const openPreviewModal = (room: EnrichedAccommodation) => {
    setPreviewModalRoom(room);
    setActiveImageIndex(0);
  };

  // Handle clicking a room to set as Hero
  const handleSelectHeroRoom = (room: EnrichedAccommodation) => {
    const ident = getRoomIdent(room);
    const slugToSet = ident ? ident.canonicalSlug : cleanSlug(room.slug || room.name);
    setHeroRoomSlug(slugToSet);
    updateUrlParams({ room: slugToSet });

    showToast(`⭐ ${room.title} in cima!`);
  };

  // Handle Date Cell Click for Booking Selection
  const handleDayClick = (room: EnrichedAccommodation, dateStr: string) => {
    if (bookingRoomSlug !== room.slug) {
      setBookingRoomSlug(room.slug);
      setCheckIn(dateStr);
      setCheckOut(null);
      return;
    }

    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(dateStr);
      setCheckOut(null);
      setBookingRoomSlug(room.slug);
    } else if (checkIn && !checkOut) {
      if (dateStr <= checkIn) {
        setCheckIn(dateStr);
        setCheckOut(null);
      } else {
        const startDate = new Date(checkIn);
        const endDate = new Date(dateStr);
        let hasConflict = false;

        const cur = new Date(startDate);
        cur.setDate(cur.getDate() + 1);
        while (cur < endDate) {
          const checkDateStr = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}-${String(cur.getDate()).padStart(2, '0')}`;
          const dData = getDayData(room, checkDateStr);
          if (dData && (!dData.available || dData.stopSell || dData.price >= 10000)) {
            hasConflict = true;
            break;
          }
          cur.setDate(cur.getDate() + 1);
        }

        if (hasConflict) {
          showToast(
            lang === 'IT' ? 'Alcune date nel periodo selezionato sono già occupate.'
              : lang === 'TH' ? 'บางวันในช่วงที่เลือกไม่ว่าง'
              : lang === 'DE' ? 'Einige Tage im gewählten Zeitraum sind belegt.'
              : 'Some days in the selected range are already booked.'
          );
          setCheckIn(dateStr);
          setCheckOut(null);
        } else {
          setCheckOut(dateStr);
          updateUrlParams({ from: checkIn, to: dateStr });
        }
      }
    }
  };

  // Calculate pricing for active booking selection
  const bookingSelectionSummary = useMemo(() => {
    if (!checkIn || !checkOut || !bookingRoomSlug) return null;
    const targetRoom = rooms.find((r) => r.slug === bookingRoomSlug);
    if (!targetRoom) return null;

    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const nights = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

    let grossTotal = 0;
    const cur = new Date(start);
    for (let i = 0; i < nights; i++) {
      const dStr = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}-${String(cur.getDate()).padStart(2, '0')}`;
      const dData = getDayData(targetRoom, dStr);
      grossTotal += dData?.price && dData.price > 0 && dData.price < 10000 ? dData.price : targetRoom.base_price_high;
      cur.setDate(cur.getDate() + 1);
    }

    const directDiscount = Math.round(grossTotal * 0.10);
    const netTotal = grossTotal - directDiscount;

    return {
      room: targetRoom,
      nights,
      grossTotal,
      directDiscount,
      netTotal
    };
  }, [checkIn, checkOut, bookingRoomSlug, rooms, gridData]);

  // Proceed to Booking Engine with pre-filled room and dates
  const handleProceedToBooking = () => {
    if (!bookingSelectionSummary) return;
    const { room } = bookingSelectionSummary;
    const ident = getRoomIdent(room);
    const targetRoomSlug = ident ? ident.legacySlug : cleanSlug(room.slug);

    navigate(`/village?room=${targetRoomSlug}&checkIn=${checkIn}&checkOut=${checkOut}`);
  };

  // WhatsApp share link generator
  const handleShareWhatsApp = () => {
    const ident = heroRoom ? getRoomIdent(heroRoom) : null;
    const roomParam = ident ? ident.canonicalSlug : (heroRoom?.slug || '');
    const monthParam = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
    const baseUrl = `${window.location.origin}/calendar?room=${roomParam}&month=${monthParam}`;
    const fullUrl = checkIn && checkOut ? `${baseUrl}&from=${checkIn}&to=${checkOut}` : baseUrl;

    const textToShare = lang === 'IT'
      ? `Ecco la disponibilità aggiornata di Flower Power Village per ${heroRoom?.title || 'le nostre camere'}:\n${fullUrl}`
      : lang === 'TH'
      ? `ตรวจสอบวันว่างและราคาที่พัก Flower Power Village:\n${fullUrl}`
      : lang === 'DE'
      ? `Hier ist die aktuelle Verfügbarkeit von Flower Power Village für ${heroRoom?.title || 'unsere Zimmer'}:\n${fullUrl}`
      : `Check out live availability for Flower Power Village (${heroRoom?.title || 'our rooms'}):\n${fullUrl}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(fullUrl).then(() => {
        showToast(t('linkCopied'));
      });
    }

    const waUrl = `https://wa.me/?text=${encodeURIComponent(textToShare)}`;
    window.open(waUrl, '_blank');
  };

  // Copy direct link to clipboard
  const handleCopyLink = () => {
    const ident = heroRoom ? getRoomIdent(heroRoom) : null;
    const roomParam = ident ? ident.canonicalSlug : (heroRoom?.slug || '');
    const monthParam = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
    const baseUrl = `${window.location.origin}/calendar?room=${roomParam}&month=${monthParam}`;
    const fullUrl = checkIn && checkOut ? `${baseUrl}&from=${checkIn}&to=${checkOut}` : baseUrl;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(fullUrl).then(() => {
        showToast(t('linkCopied'));
      });
    }
  };

  // =========================================================================
  // RENDER 1: ULTRA-ESSENTIAL TIMELINE / MATRICE COMPATTA (7-8 GIORNI SU SMARTPHONE)
  // =========================================================================
  const renderTimelineView = () => {
    if (loadingRooms || (loadingGrid && (!gridData || Object.keys(gridData).length === 0))) {
      return (
        <div className="w-full bg-white border border-stone-300 rounded-2xl shadow-sm p-12 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs sm:text-sm font-bold text-stone-700">
            {lang === 'IT' ? 'Caricamento disponibilità live...' : lang === 'TH' ? 'กำลังโหลดข้อมูลห้องว่าง...' : 'Loading live availability...'}
          </span>
        </div>
      );
    }

    if (sortedRoomsList.length === 0) {
      return (
        <div className="w-full bg-white border border-stone-300 rounded-2xl shadow-sm p-12 text-center space-y-2">
          <p className="text-sm sm:text-base font-black text-stone-900">
            {lang === 'IT' ? 'Nessun alloggio disponibile per questo mese.' : lang === 'TH' ? 'ไม่มีห้องว่างในเดือนนี้' : 'No accommodations available for this month.'}
          </p>
          <p className="text-xs text-stone-500 font-medium">
            {lang === 'IT' ? 'Prova a navigare nei mesi successivi per verificare le date libere.' : lang === 'TH' ? 'ลองเลือกเดือนถัดไปเพื่อดูวันว่าง' : 'Try browsing next months to check free dates.'}
          </p>
        </div>
      );
    }

    return (
      <div className="w-full bg-white border border-stone-300 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        
        {/* Scrollable Container with Ultra-Slim Sticky Left Column */}
        <div 
          ref={timelineScrollRef}
          className="w-full overflow-x-auto overflow-y-visible relative scrollbar-thin scrollbar-thumb-stone-400 scrollbar-track-stone-100"
        >
          <table className="w-full border-collapse text-left border-spacing-0">
            
            {/* Table Header: Sticky Left Cell + Days of Month (starts directly from first valid day!) */}
            <thead>
              <tr className="bg-[#3b3530] text-stone-200 text-xs">
                
                {/* STICKY TOP-LEFT CORNER: Alloggi label */}
                <th 
                  scope="col"
                  className="sticky left-0 z-30 bg-[#3b3530] border-b-2 border-r border-stone-700 p-1.5 sm:p-2 w-20 sm:w-26 min-w-[80px] sm:min-w-[98px] shadow-[4px_0_10px_rgba(0,0,0,0.15)] text-left"
                >
                  <span className="font-black text-white text-[10px] sm:text-xs uppercase tracking-wider block">
                    Alloggi
                  </span>
                </th>

                {/* SLIM DAY COLUMNS (starts directly from first free/valid day, zero blanks!) */}
                {monthDayNumbers.map((dayNum) => {
                  const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                  const dayObj = new Date(currentYear, currentMonth, dayNum);
                  const weekdayIndex = (dayObj.getDay() + 6) % 7; // 0 = Lun, 6 = Dom
                  const isWeekend = weekdayIndex >= 5;
                  const isToday = dateStr === todayStr;

                  return (
                    <th 
                      key={`th-${dayNum}`}
                      scope="col"
                      className={`border-b-2 border-r border-stone-700/60 text-center py-1.5 px-0.5 w-9.5 sm:w-11 min-w-[38px] sm:min-w-[44px] transition-colors ${
                        isToday 
                          ? 'bg-amber-500/25 text-amber-300 border-b-amber-400' 
                          : isWeekend 
                          ? 'bg-[#332e2a] text-amber-300' 
                          : 'bg-[#3b3530] text-stone-300'
                      }`}
                    >
                      <div className="flex flex-col items-center leading-none">
                        <span className={`text-[9px] font-bold uppercase ${isWeekend ? 'text-amber-300 font-extrabold' : 'text-stone-300'}`}>
                          {DAY_NAMES_SHORT[lang][weekdayIndex]}
                        </span>
                        <span className={`text-[11px] sm:text-xs font-black mt-0.5 ${isToday ? 'text-amber-300 underline font-extrabold' : 'text-white'}`}>
                          {dayNum}
                        </span>
                      </div>
                    </th>
                  );
                })}

              </tr>
            </thead>

            {/* Table Body: 1 Slim Row per Accommodation */}
            <tbody>
              {sortedRoomsList.map((room, roomIdx) => {
                const isHero = heroRoom?.id === room.id;
                const isBookingSelected = bookingRoomSlug === room.slug;
                const nameTwoLines = getRoomNameTwoLines(room.title, lang);

                return (
                  <tr 
                    key={room.id}
                    id={`timeline-row-${cleanSlug(room.slug)}`}
                    className={`transition-colors border-b border-stone-200 ${
                      isHero 
                        ? 'bg-amber-50/80 ring-2 ring-inset ring-amber-400/60' 
                        : isBookingSelected 
                        ? 'bg-emerald-50/60' 
                        : roomIdx % 2 === 0 
                        ? 'bg-white' 
                        : 'bg-stone-50/40'
                    } hover:bg-stone-100/70`}
                  >

                    {/* ULTRA-SLIM STICKY LEFT COLUMN: 2-Line Name + Camera Icon in bottom-right corner (zero horizontal widening, NO PRICE) */}
                    <td 
                      className={`sticky left-0 z-20 p-1.5 sm:p-2 border-r border-stone-200 w-20 sm:w-26 min-w-[80px] sm:min-w-[98px] shadow-[4px_0_10px_rgba(0,0,0,0.05)] ${
                        isHero ? 'bg-amber-50/95 border-l-4 border-l-amber-500' : 'bg-white'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => openPreviewModal(room)}
                        className="relative w-full h-full min-h-[38px] text-left cursor-pointer group/name flex flex-col justify-center select-none pr-4"
                        title="Tocca per vedere foto e dettagli"
                      >
                        {/* Riga 1 e Riga 2 del Nome Alloggio */}
                        <div className="leading-tight">
                          <span className="block text-[11px] sm:text-xs font-black text-stone-900 group-hover/name:text-emerald-700 transition-colors truncate">
                            {nameTwoLines.line1}
                          </span>
                          <span className="block text-[10px] sm:text-[11px] font-extrabold text-stone-500 group-hover/name:text-emerald-600 transition-colors truncate">
                            {nameTwoLines.line2}
                          </span>
                        </div>

                        {/* Icona Macchina Fotografica nell'angolo in basso a destra (zero ingombro orizzontale) */}
                        <span 
                          className="absolute bottom-0 right-0 p-0.5 text-stone-400 group-hover/name:text-emerald-600 transition-colors"
                          title="Foto e dettagli"
                        >
                          <Camera className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        </span>
                      </button>
                    </td>

                    {/* ULTRA-COMPACT DAY CELLS */}
                    {monthDayNumbers.map((dayNum) => {
                      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                      const isPast = dateStr < todayStr;
                      const isToday = dateStr === todayStr;

                      const dayData = getDayData(room, dateStr);
                      const isPhysicallyAvailable = dayData ? (dayData.available && !dayData.stopSell && dayData.price < 10000) : true;
                      const price = dayData?.price && dayData.price > 0 && dayData.price < 10000 ? dayData.price : room.base_price_high;
                      const minStay = dayData?.minStay || 1;

                      const isCurrentBookingRoom = bookingRoomSlug === room.slug;
                      const isSelectedCheckIn = isCurrentBookingRoom && checkIn === dateStr;
                      const isSelectedCheckOut = isCurrentBookingRoom && checkOut === dateStr;
                      const isInSelectedRange = isCurrentBookingRoom && checkIn && checkOut && dateStr > checkIn && dateStr < checkOut;

                      let cellBg = 'bg-emerald-50/90 text-emerald-950 border border-emerald-200/80 hover:bg-emerald-100 hover:border-emerald-400 cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.02)]';
                      if (isPast) {
                        cellBg = 'bg-stone-100/60 text-stone-400 opacity-40 cursor-not-allowed border border-stone-200/40';
                      } else if (!isPhysicallyAvailable) {
                        cellBg = 'bg-stone-100/90 text-stone-400 border border-stone-200/70 cursor-not-allowed opacity-80';
                      } else if (isSelectedCheckIn || isSelectedCheckOut) {
                        cellBg = 'bg-emerald-600 text-white font-black shadow-md scale-95 z-10 border border-emerald-700';
                      } else if (isInSelectedRange) {
                        cellBg = 'bg-emerald-100 text-emerald-950 font-bold border-y border-emerald-300';
                      }

                      return (
                        <td 
                          key={`td-${room.id}-${dayNum}`}
                          onClick={() => !isPast && isPhysicallyAvailable && handleDayClick(room, dateStr)}
                          className={`border-r border-stone-200 text-center p-0.5 w-9.5 sm:w-11 min-w-[38px] sm:min-w-[44px] h-11 sm:h-12 transition-all duration-150 select-none ${cellBg}`}
                          title={
                            isPast ? t('legendPast')
                            : !isPhysicallyAvailable ? t('legendOccupied')
                            : `${formatPrice(price)}/notte ${minStay > 1 ? `(Min. ${minStay}n)` : ''}`
                          }
                        >
                          <div className="w-full h-full flex flex-col items-center justify-center relative leading-none">
                            {isPast ? (
                              <span className="text-[9px] text-stone-300">✕</span>
                            ) : !isPhysicallyAvailable ? (
                              <span className="text-[9px] text-stone-400 font-bold tracking-tight">
                                —
                              </span>
                            ) : (
                              <>
                                <span className={`text-[10px] sm:text-[11px] font-black tracking-tight ${
                                  isSelectedCheckIn || isSelectedCheckOut ? 'text-white' : 'text-emerald-950'
                                }`}>
                                  {price >= 1000 ? `${(price / 1000).toFixed(1)}k` : price}
                                </span>
                                {minStay > 1 && (
                                  <span className="text-[8px] bg-amber-100 text-amber-900 font-extrabold leading-none mt-0.5 px-0.5 rounded">
                                    {minStay}n
                                  </span>
                                )}
                              </>
                            )}

                            {isSelectedCheckIn && (
                              <span className="absolute -top-1 -left-1 bg-emerald-900 text-white text-[8px] font-black px-1 rounded shadow">
                                In
                              </span>
                            )}
                            {isSelectedCheckOut && (
                              <span className="absolute -top-1 -right-1 bg-emerald-900 text-white text-[8px] font-black px-1 rounded shadow">
                                Out
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}

                  </tr>
                );
              })}
            </tbody>

          </table>
        </div>

      </div>
    );
  };

  // =========================================================================
  // RENDER 2: VISTA A BLOCCHI MENSILI (SENZA CASELLE VUOTE ALL'INIZIO)
  // =========================================================================
  const renderCalendarGridForBlocks = (room: EnrichedAccommodation) => {
    return (
      <div className="w-full">
        {/* Griglia a 7 colonne senza caselle vuote artificiali all'inizio */}
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
          {monthDayNumbers.map((dayNum) => {
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const dayObj = new Date(currentYear, currentMonth, dayNum);
            const weekdayIndex = (dayObj.getDay() + 6) % 7;
            const isWeekend = weekdayIndex >= 5;
            const isPast = dateStr < todayStr;
            const isToday = dateStr === todayStr;

            const dayData = getDayData(room, dateStr);
            const isPhysicallyAvailable = dayData ? (dayData.available && !dayData.stopSell && dayData.price < 10000) : true;
            const price = dayData?.price && dayData.price > 0 && dayData.price < 10000 ? dayData.price : room.base_price_high;
            const minStay = dayData?.minStay || 1;

            const isCurrentBookingRoom = bookingRoomSlug === room.slug;
            const isSelectedCheckIn = isCurrentBookingRoom && checkIn === dateStr;
            const isSelectedCheckOut = isCurrentBookingRoom && checkOut === dateStr;
            const isInSelectedRange = isCurrentBookingRoom && checkIn && checkOut && dateStr > checkIn && dateStr < checkOut;

            let cellBg = 'bg-white border-stone-200 text-stone-800 hover:border-emerald-500 hover:bg-emerald-50 cursor-pointer shadow-2xs';
            if (isPast) {
              cellBg = 'bg-stone-100/60 border-stone-200/50 text-stone-300 opacity-40 cursor-not-allowed';
            } else if (!isPhysicallyAvailable) {
              cellBg = 'bg-stone-100 border-stone-200 text-stone-400 cursor-not-allowed opacity-80';
            } else if (isSelectedCheckIn || isSelectedCheckOut) {
              cellBg = 'bg-emerald-600 border-emerald-700 text-white font-black shadow-md scale-95';
            } else if (isInSelectedRange) {
              cellBg = 'bg-emerald-100 border-emerald-300 text-emerald-950 font-bold';
            }

            return (
              <button
                key={dateStr}
                type="button"
                disabled={isPast || !isPhysicallyAvailable}
                onClick={() => handleDayClick(room, dateStr)}
                className={`relative min-h-[46px] sm:min-h-[60px] p-1 rounded-xl border flex flex-col justify-between items-center transition-all duration-200 select-none ${cellBg}`}
              >
                <div className="w-full flex items-center justify-between px-0.5">
                  <span className={`text-[10px] sm:text-xs font-bold leading-none ${isWeekend ? 'text-amber-600' : 'text-stone-500'}`}>
                    {DAY_NAMES_SHORT[lang][weekdayIndex]}
                  </span>
                  <span className={`text-[11px] sm:text-xs font-black leading-none ${isToday ? 'text-emerald-700 font-extrabold underline' : 'text-stone-900'}`}>
                    {dayNum}
                  </span>
                </div>

                <div className="w-full text-center mt-auto">
                  {isPast ? (
                    <span className="text-[9px] text-stone-300 font-bold opacity-60">✕</span>
                  ) : !isPhysicallyAvailable ? (
                    <span className="text-[9px] sm:text-[10px] text-stone-400 font-bold tracking-tight">
                      {lang === 'TH' ? 'เต็ม' : lang === 'DE' ? 'Belegt' : lang === 'EN' ? 'Sold' : 'Pieno'}
                    </span>
                  ) : (
                    <div className="flex flex-col items-center">
                      <span className={`text-[10px] sm:text-xs font-black leading-none ${isSelectedCheckIn || isSelectedCheckOut ? 'text-white' : 'text-emerald-900'}`}>
                        {formatPrice(price)}
                      </span>
                      {minStay > 1 && (
                        <span className="text-[8px] sm:text-[9px] bg-amber-100 text-amber-900 font-extrabold mt-0.5 leading-none px-1 rounded">
                          {minStay}n
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {isSelectedCheckIn && (
                  <span className="absolute -top-1.5 -left-1.5 bg-emerald-400 text-stone-950 text-[8px] font-black px-1.5 py-0.2 rounded-full uppercase shadow">
                    In
                  </span>
                )}
                {isSelectedCheckOut && (
                  <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-stone-950 text-[8px] font-black px-1.5 py-0.2 rounded-full uppercase shadow">
                    Out
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderBlocksView = () => {
    if (loadingRooms || (loadingGrid && (!gridData || Object.keys(gridData).length === 0))) {
      return (
        <div className="w-full bg-white border border-stone-300 rounded-2xl shadow-sm p-12 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs sm:text-sm font-bold text-stone-700">
            {lang === 'IT' ? 'Caricamento disponibilità live...' : lang === 'TH' ? 'กำลังโหลดข้อมูลห้องว่าง...' : 'Loading live availability...'}
          </span>
        </div>
      );
    }

    if (sortedRoomsList.length === 0) {
      return (
        <div className="w-full bg-white border border-stone-300 rounded-2xl shadow-sm p-12 text-center space-y-2">
          <p className="text-sm sm:text-base font-black text-stone-900">
            {lang === 'IT' ? 'Nessun alloggio disponibile per questo mese.' : lang === 'TH' ? 'ไม่มีห้องว่างในเดือนนี้' : 'No accommodations available for this month.'}
          </p>
          <p className="text-xs text-stone-500 font-medium">
            {lang === 'IT' ? 'Prova a navigare nei mesi successivi per verificare le date libere.' : lang === 'TH' ? 'ลองเลือกเดือนถัดไปเพื่อดูวันว่าง' : 'Try browsing next months to check free dates.'}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {sortedRoomsList.map((room) => {
          const isSelected = bookingRoomSlug === room.slug;
          const isHero = heroRoom?.id === room.id;
          const nameTwoLines = getRoomNameTwoLines(room.title, lang);

          return (
            <article
              key={room.id}
              id={`room-calendar-card-${cleanSlug(room.slug)}`}
              className={`bg-white rounded-2xl border transition-all duration-300 p-3 sm:p-5 flex flex-col lg:flex-row gap-4 items-start ${
                isHero
                  ? 'border-2 border-amber-400 ring-4 ring-amber-400/20 shadow-md'
                  : isSelected
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
                  : 'border-stone-300 hover:border-stone-400 shadow-sm'
              }`}
            >
              <div className="w-full lg:w-1/4 flex items-center justify-between lg:flex-col lg:items-start gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => openPreviewModal(room)}
                  className="text-left cursor-pointer group/name block"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-sm sm:text-base text-stone-900 group-hover/name:text-emerald-700 transition-colors">
                      {nameTwoLines.line1} {nameTwoLines.line2}
                    </span>
                    <Camera className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <span className="text-[10px] text-stone-500 block mt-0.5">{room.category} · Fino a {room.capacity} ospiti</span>
                </button>
              </div>

              <div className="w-full lg:w-3/4 bg-stone-50 rounded-xl border border-stone-200 p-2 sm:p-4">
                {renderCalendarGridForBlocks(room)}
              </div>
            </article>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen text-stone-900 flex flex-col font-sans antialiased selection:bg-[#a2b997] selection:text-stone-900" style={{ backgroundColor: '#e7e5e4' }}>
      
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[99999] bg-[#3b3530] border-2 border-emerald-400 text-white font-extrabold text-xs sm:text-sm px-6 py-3 rounded-full shadow-2xl animate-bounce flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP BRAND NAVBAR (Stile Ufficiale Flower Power Village) */}
      <nav className="sticky top-0 z-40 bg-[#3b3530] text-white border-b border-stone-700/60 px-3 sm:px-6 py-2.5 sm:py-3 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          
          {/* Brand & Back Link */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            <Link 
              to="/village"
              className="inline-flex items-center gap-1.5 text-stone-300 hover:text-white transition-colors text-xs font-bold uppercase tracking-wider"
              title="Torna alla Home"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Home</span>
            </Link>
            <div className="h-4 w-px bg-stone-600/70 hidden sm:block" />
            <Link to="/village" className="flex items-center gap-2 group">
              <img 
                src="/FP_04_-_LOGO_OFFICIAL_HD.png" 
                alt="Flower Power Village Logo" 
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-white/20 shadow-sm"
              />
              <span className="font-sans font-black tracking-tight text-white text-sm sm:text-base md:text-lg group-hover:text-emerald-400 transition-colors">
                FLOWER POWER <span className="font-light italic text-[#a2b997]">Village</span>
              </span>
            </Link>
          </div>

          {/* Right Controls: WhatsApp, Share, Language Selector */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="bg-[#25D366] hover:bg-[#20ba59] text-white text-[11px] sm:text-xs font-black px-2.5 sm:px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
              title={t('shareWhatsApp')}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            {/* Language Dropdown Selector */}
            <div className="flex items-center bg-black/35 rounded-xl p-0.5 border border-white/15">
              {(['IT', 'EN', 'TH', 'DE'] as Language[]).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => {
                    setLang(l);
                    updateUrlParams({ lang: l });
                  }}
                  className={`text-[10px] sm:text-xs font-black px-1.5 sm:px-2 py-1 rounded-lg transition-all ${
                    lang === l ? 'bg-emerald-600 text-white shadow-xs' : 'text-stone-300 hover:text-white'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

        </div>
      </nav>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-7xl mx-auto w-full px-2.5 sm:px-6 py-3 sm:py-5 space-y-3 flex-grow">

        {/* HERO HEADER CARD (Stile Flower Power Village) */}
        <header className="relative text-stone-100 py-3 sm:py-4 px-3 sm:px-5 overflow-hidden rounded-2xl shadow-md border border-stone-700/50" style={{ backgroundColor: '#3b3530' }}>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <span className="text-[#a2b997] font-extrabold tracking-widest text-[10px] sm:text-[11px] uppercase block">
                KOH PHAYAM • THAILANDIA
              </span>
              <h1 className="text-base sm:text-xl font-sans font-black tracking-tight text-white leading-tight">
                {lang === 'IT' ? 'Calendario Disponibilità Live & Tariffe' : lang === 'TH' ? 'ตารางห้องว่างและราคาเรียลไทม์' : lang === 'DE' ? 'Live-Verfügbarkeitskalender & Tarife' : 'Live Availability Calendar & Direct Rates'}
              </h1>
              <p className="text-stone-300 text-[11px] sm:text-xs font-medium mt-0.5">
                {lang === 'IT' ? 'Miglior tariffa garantita: risparmia il 10% prenotando direttamente.' : lang === 'TH' ? 'รับประกันราคาดีที่สุด ประหยัด 10% เมื่อจองตรง' : lang === 'DE' ? 'Bester Preis garantiert: 10% Rabatt bei Direktbuchung.' : 'Best rate guaranteed: save 10% with direct booking.'}
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#a2b997] bg-black/25 px-3 py-1.5 rounded-xl border border-white/10 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>-10% Direct Booking Discount</span>
            </div>
          </div>
        </header>

        {/* COMPACT TOOLBAR: MONTH CONTROLS & ESSENTIAL BUTTONS */}
        <div className="bg-white border border-stone-300 rounded-2xl p-2.5 sm:p-3 shadow-sm flex flex-wrap items-center justify-between gap-2">
          
          {/* Month Navigator */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 sm:p-2 rounded-xl bg-stone-100 hover:bg-stone-200 active:scale-95 text-stone-700 transition-all cursor-pointer border border-stone-200"
              title="Mese Precedente"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5 text-center px-1">
              <CalendarIcon className="w-4 h-4 text-emerald-700" />
              <span className="text-sm sm:text-base font-black text-stone-900 tracking-wide">
                {MONTH_NAMES[lang][currentMonth]} {currentYear}
              </span>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 sm:p-2 rounded-xl bg-stone-100 hover:bg-stone-200 active:scale-95 text-stone-700 transition-all cursor-pointer border border-stone-200"
              title="Mese Successivo"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleCurrentMonth}
              className="text-[10px] font-extrabold uppercase px-2.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 active:scale-95 transition-all cursor-pointer"
            >
              Oggi
            </button>
          </div>

          {/* VIEW MODE TOGGLE & QUICK ACTIONS */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-stone-100 p-0.5 rounded-xl border border-stone-200">
              <button
                type="button"
                onClick={() => setViewMode('timeline')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all flex items-center gap-1 cursor-pointer ${
                  viewMode === 'timeline'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
                title="Panoramica a righe"
              >
                <Rows3 className="w-3 h-3" />
                <span className="hidden sm:inline">Righe</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('blocks')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all flex items-center gap-1 cursor-pointer ${
                  viewMode === 'blocks'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
                title="Vista a blocchi mensili"
              >
                <LayoutGrid className="w-3 h-3" />
                <span className="hidden sm:inline">Blocchi</span>
              </button>
            </div>

            {/* Quick Link Copy */}
            <button
              type="button"
              onClick={handleCopyLink}
              className="text-[10px] font-bold px-2.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-700 active:scale-95 transition-all cursor-pointer flex items-center gap-1"
              title="Copia link"
            >
              🔗 <span className="hidden sm:inline">Link</span>
            </button>
          </div>

        </div>

        {/* CATEGORY FILTER PILLS & LEGEND */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 no-scrollbar">
          <div className="flex items-center gap-1 flex-shrink-0">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`text-[9px] sm:text-[10px] font-black uppercase px-2.5 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-[#3b3530] text-white shadow-xs border border-[#3b3530]'
                    : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-300 shadow-2xs'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2 text-[10px]">
            <span className="flex items-center gap-1 text-emerald-700 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              Libero
            </span>
            <span className="flex items-center gap-1 text-stone-500 font-bold">
              <span className="w-2 h-2 rounded-full bg-stone-400" />
              Occupato
            </span>
            <span className="text-stone-500">
              (Tocca 📷 sul nome per le foto)
            </span>
          </div>
        </div>

        {/* LOADING INDICATOR */}
        {loadingRooms && (
          <div className="py-20 text-center text-stone-600 animate-pulse space-y-2">
            <CalendarIcon className="w-8 h-8 mx-auto text-emerald-700 animate-bounce" />
            <p className="font-bold text-xs">Caricamento disponibilità...</p>
          </div>
        )}

        {/* RENDER CHOSEN VIEW */}
        {!loadingRooms && (
          viewMode === 'timeline' ? renderTimelineView() : renderBlocksView()
        )}

      </main>

      {/* ⚡ BOTTOM STICKY BOOKING ACTION BAR */}
      {checkIn && (
        <aside 
          aria-label="Riepilogo prenotazione"
          className="sticky bottom-0 z-50 bg-[#3b3530]/95 backdrop-blur-xl border-t border-stone-700 px-3 sm:px-6 py-2.5 shadow-[0_-10px_35px_rgba(0,0,0,0.25)] animate-slideUp text-white"
        >
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3">
            
            {/* Selection info */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <div className="p-2 bg-emerald-500/20 text-emerald-300 rounded-xl border border-emerald-500/40 hidden sm:flex">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="leading-tight">
                <p className="text-[10px] uppercase tracking-wider text-[#a2b997] font-extrabold truncate">
                  {bookingSelectionSummary?.room.title || heroRoom?.title}
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-xs sm:text-sm font-black text-white">
                    {checkIn} {checkOut ? `➔ ${checkOut} (${bookingSelectionSummary?.nights || 1}n)` : '(Scegli Check-Out)'}
                  </span>
                  {bookingSelectionSummary && (
                    <span className="text-sm sm:text-base font-black text-amber-300">
                      = {formatPrice(bookingSelectionSummary.netTotal)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => {
                  setCheckIn(null);
                  setCheckOut(null);
                  updateUrlParams({ from: null, to: null });
                }}
                className="px-2.5 py-1.5 rounded-xl text-stone-300 hover:text-white text-[11px] font-bold hover:bg-white/10 transition-all cursor-pointer"
              >
                Reset
              </button>

              <button
                type="button"
                disabled={!checkOut}
                onClick={handleProceedToBooking}
                className={`flex-1 sm:flex-initial text-xs sm:text-sm font-black px-5 py-2.5 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center gap-1.5 ${
                  checkOut
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer active:scale-95 shadow-emerald-700/40'
                    : 'bg-stone-700 text-stone-400 cursor-not-allowed border border-stone-600'
                }`}
              >
                <span>{t('applyAndBook')}</span>
                <span className="text-[10px] text-amber-200 font-extrabold">(-10%)</span>
              </button>
            </div>

          </div>
        </aside>
      )}

      {/* OFFICIAL FLOWER POWER VILLAGE FOOTER */}
      <VillageFooter 
        onNavigate={(page) => navigate(page ? `/village/${page}` : '/village')} 
        lang={lang} 
      />

      {/* 🖼️ STANDARD IMMERSIVE FULL-SCREEN PHOTO GALLERY MODAL (ON DEMAND) */}
      {Boolean(previewModalRoom) && (() => {
        const roomImages = (Array.isArray(previewModalRoom?.images) && previewModalRoom.images.length > 0)
          ? previewModalRoom.images
          : (previewModalRoom?.image_url ? [previewModalRoom.image_url] : ['https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80']);
        const bgImage = roomImages[0];

        const nextImg = () => {
          if (roomImages.length <= 1) return;
          setActiveImageIndex((prev) => (prev + 1) % roomImages.length);
        };
        const prevImg = () => {
          if (roomImages.length <= 1) return;
          setActiveImageIndex((prev) => (prev - 1 + roomImages.length) % roomImages.length);
        };

        return (
          <div className="fixed inset-0 z-[99999] w-screen h-screen flex flex-col lg:flex-row bg-stone-950/85 backdrop-blur-md overflow-hidden animate-fadeIn">
            
            {/* Background blur */}
            {bgImage && (
              <img 
                src={bgImage} 
                className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-20 pointer-events-none scale-110 -z-10" 
                alt="" 
              />
            )}

            {/* Close Button top-right */}
            <button
              onClick={() => setPreviewModalRoom(null)}
              className="fixed top-3 right-3 md:top-6 md:right-6 p-2.5 rounded-full bg-stone-900/90 hover:bg-stone-800 border border-stone-800 text-stone-300 hover:text-white cursor-pointer transition-all duration-200 z-[120] shadow-2xl hover:scale-105 active:scale-95"
              title="Chiudi e torna al calendario"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* LEFT / TOP PANEL: Photo Showcase */}
            <div className="w-full lg:w-3/5 h-[45vh] lg:h-full relative bg-black/50 flex flex-col justify-between p-3 sm:p-6 flex-shrink-0 border-b lg:border-b-0 lg:border-r border-stone-800/80 z-10">
              
              <div className="relative w-full flex-1 flex items-center justify-center min-h-0">
                {roomImages.length > 1 && (
                  <button
                    onClick={prevImg}
                    className="absolute left-2 p-2.5 rounded-full bg-stone-900/80 hover:bg-stone-800 text-white border border-stone-800/60 cursor-pointer transition-all z-10 shadow-lg"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}

                <div className="w-full h-full flex items-center justify-center overflow-hidden rounded-2xl bg-stone-950/30">
                  <img
                    src={roomImages[activeImageIndex] || roomImages[0]}
                    alt={`${previewModalRoom?.title} - ${activeImageIndex + 1}`}
                    className="max-h-full max-w-full object-contain rounded-2xl transition-all duration-300 shadow-2xl"
                  />
                </div>

                {roomImages.length > 1 && (
                  <button
                    onClick={nextImg}
                    className="absolute right-2 p-2.5 rounded-full bg-stone-900/80 hover:bg-stone-800 text-white border border-stone-800/60 cursor-pointer transition-all z-10 shadow-lg"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Thumbnails row */}
              {roomImages.length > 1 && (
                <div className="w-full flex items-center justify-center gap-1.5 overflow-x-auto py-2 px-1 no-scrollbar flex-shrink-0 mt-2">
                  {roomImages.map((src: string, i: number) => (
                    <button
                      key={i}
                      onClick={() => setActiveImageIndex(i)}
                      className={`relative w-14 h-10 sm:w-16 sm:h-12 flex-shrink-0 rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                        i === activeImageIndex
                          ? "border-amber-400 scale-105 opacity-100 shadow-md"
                          : "border-stone-800 opacity-40 hover:opacity-100"
                      }`}
                    >
                      <img src={src} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT / BOTTOM PANEL: Room Details & Amenities */}
            <div className="w-full lg:w-2/5 h-[55vh] lg:h-full overflow-y-auto p-4 sm:p-8 bg-stone-950/60 backdrop-blur-xl border-t lg:border-t-0 lg:border-l border-white/5 space-y-4 relative z-10">
              
              <div className="space-y-2 pr-8">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-stone-800 border border-stone-700 text-amber-400 font-extrabold text-[10px] rounded-md uppercase tracking-wider">
                    {previewModalRoom?.category}
                  </span>
                  <span className="text-[10px] text-stone-400">
                    Fino a {previewModalRoom?.capacity} ospiti · {previewModalRoom?.beds}
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                  {previewModalRoom?.title}
                </h3>

                <p className="text-stone-300 text-xs sm:text-sm font-normal leading-relaxed">
                  {previewModalRoom?.description}
                </p>

                <div className="pt-1 flex items-baseline gap-2">
                  <span className="text-xs uppercase text-stone-400 font-bold">Tariffa Base:</span>
                  <span className="text-lg font-black text-amber-400">
                    {formatPrice(previewModalRoom?.base_price_high || 0)}
                  </span>
                  <span className="text-xs text-stone-400">/notte</span>
                </div>
              </div>

              {/* AMENITIES & FEATURES */}
              <div className="pt-3 border-t border-white/10 space-y-2">
                <h4 className="text-[11px] font-black uppercase tracking-wider text-stone-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Caratteristiche & Servizi</span>
                </h4>
                <RoomFeaturesGrid
                  features={previewModalRoom?.features || previewModalRoom?.details?.features}
                  details={previewModalRoom?.details}
                  lang={lang}
                />
              </div>

              {/* ACTION: Return to calendar with this room as Hero */}
              <div className="pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    if (previewModalRoom) {
                      handleSelectHeroRoom(previewModalRoom);
                      setPreviewModalRoom(null);
                    }
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-xs sm:text-sm shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-stone-950" />
                  <span>Scegli questa camera e torna al calendario</span>
                </button>
              </div>

            </div>

          </div>
        );
      })()}

      {/* FOOTER */}
      <footer className="mt-auto border-t border-stone-800 bg-stone-950 py-4 px-4 text-center text-[10px] sm:text-xs text-stone-500">
        <p className="font-bold text-stone-400">
          Flower Power Village & Spa · Koh Phayam, Ranong, Thailand
        </p>
        <p className="mt-0.5">
          Miglior tariffa diretta garantita senza commissioni di agenzia.
        </p>
      </footer>

    </div>
  );
}
