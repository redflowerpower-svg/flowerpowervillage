import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Share2, 
  Check, 
  ArrowLeft, 
  Users, 
  Bed, 
  Sparkles, 
  Info, 
  Clock, 
  Globe, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  Home,
  LayoutGrid,
  Rows3
} from 'lucide-react';
import { fetchAccommodations, EnrichedAccommodation } from '../booking/data/accommodationsService';
import { fetchOctorateMonthlyGrid, OctorateDayData } from '../booking/lib/octorate';
import { translations, Language } from '../booking/lib/translations';
import { findAccommodationIdentity, ACCOMMODATION_IDENTITIES } from '../booking/resort/config/accommodations';

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

  // Notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

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

  // Calendar day calculation for the current month view
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayWeekday = new Date(currentYear, currentMonth, 1).getDay();
  // Monday start offset: Sunday (0) -> 6, Monday (1) -> 0, etc.
  const leadBlanksCount = (firstDayWeekday + 6) % 7;

  const monthDayNumbers = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  }, [daysInMonth]);

  // Auto-scroll timeline to today or requested checkIn date
  useEffect(() => {
    if (viewMode === 'timeline' && timelineScrollRef.current) {
      const isCurrentMonthView = currentYear === today.getFullYear() && currentMonth === today.getMonth();
      let targetDay = 1;

      if (checkIn && checkIn.startsWith(`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`)) {
        targetDay = parseInt(checkIn.split('-')[2], 10);
      } else if (isCurrentMonthView) {
        targetDay = today.getDate();
      }

      if (targetDay > 3) {
        const cellApproxWidth = window.innerWidth < 640 ? 54 : 64;
        const scrollOffset = (targetDay - 2) * cellApproxWidth;
        setTimeout(() => {
          timelineScrollRef.current?.scrollTo({ left: scrollOffset, behavior: 'smooth' });
        }, 150);
      }
    }
  }, [viewMode, currentYear, currentMonth, checkIn, today]);

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

  // Ordered Rooms: Hero Room FIRST, followed by other rooms (filtered by category if selected)
  const { heroRoom, sortedRoomsList } = useMemo(() => {
    if (!rooms || rooms.length === 0) return { heroRoom: null, sortedRoomsList: [] };

    let targetRoom: EnrichedAccommodation | null = null;

    if (heroRoomSlug) {
      const cleanHero = cleanSlug(heroRoomSlug);
      targetRoom = rooms.find((r) => {
        const ident = getRoomIdent(r);
        if (ident && (ident.canonicalSlug === cleanHero || ident.legacySlug === heroRoomSlug || ident.aliases.includes(heroRoomSlug))) {
          return true;
        }
        return cleanSlug(r.slug) === cleanHero || cleanSlug(r.name) === cleanHero;
      }) || null;
    }

    // Default hero to first room if none specified
    if (!targetRoom && rooms.length > 0) {
      targetRoom = rooms[0];
    }

    const others = rooms.filter((r) => r.id !== targetRoom?.id);

    const filteredOthers = selectedCategory === 'TUTTI'
      ? others
      : others.filter((r) => r.category.toUpperCase() === selectedCategory);

    // Place targetRoom at the very top of sortedRoomsList
    const list = targetRoom ? [targetRoom, ...filteredOthers] : filteredOthers;

    return { heroRoom: targetRoom, sortedRoomsList: list };
  }, [rooms, heroRoomSlug, selectedCategory]);

  // Handle clicking a room to set as Hero
  const handleSelectHeroRoom = (room: EnrichedAccommodation) => {
    const ident = getRoomIdent(room);
    const slugToSet = ident ? ident.canonicalSlug : cleanSlug(room.slug || room.name);
    setHeroRoomSlug(slugToSet);
    updateUrlParams({ room: slugToSet });

    showToast(`⭐ ${room.title} messa in evidenza!`);
  };

  // Handle Date Cell Click for Booking Selection
  const handleDayClick = (room: EnrichedAccommodation, dateStr: string) => {
    // If clicking a date on a room different from the active booking room, switch active booking room
    if (bookingRoomSlug !== room.slug) {
      setBookingRoomSlug(room.slug);
      setCheckIn(dateStr);
      setCheckOut(null);
      return;
    }

    if (!checkIn || (checkIn && checkOut)) {
      // Start new selection
      setCheckIn(dateStr);
      setCheckOut(null);
      setBookingRoomSlug(room.slug);
    } else if (checkIn && !checkOut) {
      if (dateStr <= checkIn) {
        // Reset check-in to the new earlier date
        setCheckIn(dateStr);
        setCheckOut(null);
      } else {
        // Verify that all days in between are physically available
        const startDate = new Date(checkIn);
        const endDate = new Date(dateStr);
        let hasConflict = false;

        const cur = new Date(startDate);
        cur.setDate(cur.getDate() + 1); // check nights
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

    // Direct booking discount 10%
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

    // Open WhatsApp Web/App
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
  // RENDER 1: TIMELINE / PANORAMICA A RIGHE (MATRICE MULTI-ALLOGGIO)
  // =========================================================================
  const renderTimelineView = () => {
    return (
      <div className="w-full bg-stone-900 border border-stone-800 rounded-2xl shadow-xl overflow-hidden flex flex-col">
        
        {/* Horizontal scroll instructions bar on mobile */}
        <div className="sm:hidden bg-stone-950 px-3 py-1.5 border-b border-stone-800 text-[10px] text-amber-300 flex items-center justify-between">
          <span>👈 Scorri in orizzontale per vedere tutti i giorni 👉</span>
          <span className="font-extrabold">{daysInMonth} giorni</span>
        </div>

        {/* Scrollable Container with Sticky Left Column */}
        <div 
          ref={timelineScrollRef}
          className="w-full overflow-x-auto overflow-y-visible relative scrollbar-thin scrollbar-thumb-stone-700 scrollbar-track-stone-900"
        >
          <table className="w-full border-collapse text-left border-spacing-0">
            
            {/* Table Header: Sticky Left Cell + Days of Month */}
            <thead>
              <tr className="bg-stone-925 text-stone-300 text-xs">
                
                {/* STICKY TOP-LEFT CORNER: Alloggi header */}
                <th 
                  scope="col"
                  className="sticky left-0 z-30 bg-stone-925 border-b-2 border-r border-stone-800 p-3 w-48 sm:w-64 min-w-[190px] sm:min-w-[256px] shadow-[4px_0_10px_rgba(0,0,0,0.5)]"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-white text-xs uppercase tracking-wider">
                      Alloggi ({sortedRoomsList.length})
                    </span>
                    <span className="text-[10px] font-bold text-stone-400">
                      Prezzo Base
                    </span>
                  </div>
                </th>

                {/* DAY COLUMNS HEADERS */}
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
                      className={`border-b-2 border-r border-stone-800 text-center py-2 px-1 w-13 sm:w-16 min-w-[52px] sm:min-w-[64px] transition-colors ${
                        isToday 
                          ? 'bg-amber-400/20 text-amber-300 border-b-amber-400' 
                          : isWeekend 
                          ? 'bg-stone-850/80 text-amber-400/90' 
                          : 'bg-stone-925 text-stone-300'
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <span className={`text-[9px] sm:text-[10px] font-bold uppercase ${isWeekend ? 'text-amber-400' : 'text-stone-400'}`}>
                          {DAY_NAMES_SHORT[lang][weekdayIndex]}
                        </span>
                        <span className={`text-xs sm:text-sm font-black leading-none mt-0.5 ${isToday ? 'text-amber-300 underline font-extrabold' : 'text-white'}`}>
                          {dayNum}
                        </span>
                      </div>
                    </th>
                  );
                })}

              </tr>
            </thead>

            {/* Table Body: 1 Row per Accommodation */}
            <tbody>
              {sortedRoomsList.map((room, roomIdx) => {
                const isHero = heroRoom?.id === room.id;
                const isBookingSelected = bookingRoomSlug === room.slug;
                const ident = getRoomIdent(room);

                return (
                  <tr 
                    key={room.id}
                    id={`timeline-row-${cleanSlug(room.slug)}`}
                    className={`transition-colors border-b border-stone-800/80 ${
                      isHero 
                        ? 'bg-amber-950/25 ring-2 ring-inset ring-amber-400/50' 
                        : isBookingSelected 
                        ? 'bg-emerald-950/20' 
                        : roomIdx % 2 === 0 
                        ? 'bg-stone-900/60' 
                        : 'bg-stone-900/30'
                    } hover:bg-stone-850/50`}
                  >

                    {/* STICKY LEFT COLUMN: Room thumbnail & Info */}
                    <td 
                      className={`sticky left-0 z-20 p-2 sm:p-2.5 border-r border-stone-800 w-48 sm:w-64 min-w-[190px] sm:min-w-[256px] shadow-[4px_0_10px_rgba(0,0,0,0.4)] ${
                        isHero ? 'bg-stone-900 border-l-4 border-l-amber-400' : 'bg-stone-900'
                      }`}
                    >
                      <div className="flex items-center gap-2 sm:gap-2.5">
                        {/* Thumbnail */}
                        <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-lg overflow-hidden bg-stone-800 flex-shrink-0">
                          {room.images && room.images.length > 0 ? (
                            <img 
                              src={room.images[0]} 
                              alt={room.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[8px] text-stone-500">
                              Foto
                            </div>
                          )}
                          {isHero && (
                            <span className="absolute -top-1 -left-1 bg-amber-400 text-stone-950 text-[8px] font-black rounded-full w-4 h-4 flex items-center justify-center shadow">
                              ★
                            </span>
                          )}
                        </div>

                        {/* Title & Specs */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <h4 className="text-xs sm:text-sm font-black text-white truncate leading-tight">
                              {room.title}
                            </h4>
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-stone-400 mt-0.5">
                            <span className="truncate">{room.category}</span>
                            <span className="font-extrabold text-amber-400 ml-1">
                              {formatPrice(room.base_price_high)}
                            </span>
                          </div>

                          {/* Quick hero highlight button if not hero */}
                          {!isHero && (
                            <button
                              type="button"
                              onClick={() => handleSelectHeroRoom(room)}
                              className="text-[9px] font-bold text-stone-400 hover:text-amber-300 flex items-center gap-1 mt-0.5 transition-colors cursor-pointer"
                              title="Porta in cima come selezione principale"
                            >
                              <span>★ Metti in cima</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* DAY CELLS IN THE ROW */}
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

                      let cellBg = 'bg-transparent text-emerald-300 hover:bg-emerald-900/30';
                      if (isPast) {
                        cellBg = 'bg-stone-950/50 text-stone-600 opacity-40 cursor-not-allowed';
                      } else if (!isPhysicallyAvailable) {
                        cellBg = 'bg-rose-950/25 text-rose-400/80 cursor-not-allowed';
                      } else if (isSelectedCheckIn || isSelectedCheckOut) {
                        cellBg = 'bg-emerald-500 text-stone-950 font-black shadow-lg scale-95 z-10';
                      } else if (isInSelectedRange) {
                        cellBg = 'bg-emerald-900/70 text-emerald-200';
                      } else {
                        cellBg = 'hover:bg-emerald-800/40 cursor-pointer text-emerald-300';
                      }

                      return (
                        <td 
                          key={`td-${room.id}-${dayNum}`}
                          onClick={() => !isPast && isPhysicallyAvailable && handleDayClick(room, dateStr)}
                          className={`border-r border-stone-800 text-center p-0.5 sm:p-1 w-13 sm:w-16 min-w-[52px] sm:min-w-[64px] h-13 sm:h-14 transition-all duration-150 select-none ${cellBg}`}
                          title={
                            isPast ? t('legendPast')
                            : !isPhysicallyAvailable ? t('legendOccupied')
                            : `${formatPrice(price)}/notte ${minStay > 1 ? `(Min. ${minStay}n)` : ''}`
                          }
                        >
                          <div className="w-full h-full flex flex-col items-center justify-center relative">
                            {isPast ? (
                              <span className="text-[10px] text-stone-700">✕</span>
                            ) : !isPhysicallyAvailable ? (
                              <span className="text-[9px] sm:text-[10px] text-rose-400 font-bold tracking-tight">
                                {lang === 'TH' ? 'เต็ม' : lang === 'DE' ? 'Belegt' : lang === 'EN' ? 'Sold' : 'Pieno'}
                              </span>
                            ) : (
                              <>
                                <span className={`text-[10px] sm:text-xs font-black leading-tight ${
                                  isSelectedCheckIn || isSelectedCheckOut ? 'text-stone-950' : 'text-emerald-400'
                                }`}>
                                  {formatPrice(price)}
                                </span>
                                {minStay > 1 && (
                                  <span className="text-[8px] text-amber-300/90 font-bold leading-none mt-0.5">
                                    {minStay}n
                                  </span>
                                )}
                              </>
                            )}

                            {/* Range Tags */}
                            {isSelectedCheckIn && (
                              <span className="absolute -top-1 -left-1 bg-black text-emerald-400 text-[8px] font-black px-1 rounded shadow">
                                In
                              </span>
                            )}
                            {isSelectedCheckOut && (
                              <span className="absolute -top-1 -right-1 bg-black text-amber-400 text-[8px] font-black px-1 rounded shadow">
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
  // RENDER 2: VISTA A BLOCCHI MENSILI (INDIVIDUAL ROOM CARDS)
  // =========================================================================
  const renderCalendarGridForBlocks = (room: EnrichedAccommodation) => {
    return (
      <div className="w-full">
        {/* Day Name Headers (Mon - Sun) */}
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5 mb-1.5 text-center">
          {DAY_NAMES_SHORT[lang].map((dName, idx) => (
            <div 
              key={idx} 
              className={`text-[10px] sm:text-xs font-black uppercase py-1 tracking-wider ${
                idx >= 5 ? 'text-amber-400' : 'text-stone-400'
              }`}
            >
              {dName}
            </div>
          ))}
        </div>

        {/* Calendar Day Cells */}
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
          {Array.from({ length: leadBlanksCount }).map((_, i) => (
            <div key={`blank-${i}`} className="min-h-[44px] sm:min-h-[58px] rounded-xl bg-stone-900/20 opacity-20 border border-dashed border-stone-800" />
          ))}

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

            let cellBg = 'bg-stone-900/60 hover:bg-stone-850 border-stone-800 text-stone-200';
            if (isPast) {
              cellBg = 'bg-stone-950/40 text-stone-600 border-stone-900 opacity-50 cursor-not-allowed';
            } else if (!isPhysicallyAvailable) {
              cellBg = 'bg-rose-950/30 text-rose-400/70 border-rose-900/40 cursor-not-allowed';
            } else if (isSelectedCheckIn || isSelectedCheckOut) {
              cellBg = 'bg-emerald-600 text-white font-black border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)] scale-[1.03] z-10';
            } else if (isInSelectedRange) {
              cellBg = 'bg-emerald-900/60 text-emerald-200 border-emerald-600/60';
            } else {
              cellBg = 'bg-emerald-950/20 hover:bg-emerald-900/30 border-emerald-800/40 text-emerald-300 hover:border-emerald-500 cursor-pointer';
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
                  <span className={`text-[11px] sm:text-xs font-black leading-none ${isToday ? 'text-amber-400 font-extrabold underline decoration-amber-400' : ''}`}>
                    {dayNum}
                  </span>
                  {isToday && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                  )}
                </div>

                <div className="w-full text-center mt-auto">
                  {isPast ? (
                    <span className="text-[9px] text-stone-600 font-bold opacity-60">✕</span>
                  ) : !isPhysicallyAvailable ? (
                    <span className="text-[9px] sm:text-[10px] text-rose-400 font-bold tracking-tight">
                      {lang === 'TH' ? 'เต็ม' : lang === 'DE' ? 'Belegt' : lang === 'EN' ? 'Sold' : 'Pieno'}
                    </span>
                  ) : (
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] sm:text-xs font-black text-emerald-400 leading-none">
                        {formatPrice(price)}
                      </span>
                      {minStay > 1 && (
                        <span className="text-[8px] sm:text-[9px] text-amber-300/90 font-bold mt-0.5 leading-none">
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
    return (
      <div className="space-y-6">
        {/* 🌟 1. HERO ROOM IN EVIDENZA */}
        {heroRoom && (
          <section 
            id="hero-room-showcase"
            className="relative bg-gradient-to-b from-stone-900 to-stone-925 rounded-3xl border-2 border-amber-400 ring-4 ring-amber-400/20 shadow-[0_15px_45px_rgba(245,158,11,0.2)] p-4 sm:p-6 transition-all duration-500 overflow-hidden"
          >
            <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-400 to-yellow-500 text-stone-950 text-[10px] sm:text-xs font-black px-4 py-1.5 rounded-bl-2xl uppercase tracking-wider shadow-md flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('selectedRoom')}</span>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 items-start">
              
              <div className="w-full lg:w-1/3 flex flex-col sm:flex-row lg:flex-col gap-4 flex-shrink-0">
                <div className="relative w-full sm:w-1/2 lg:w-full h-48 sm:h-52 rounded-2xl overflow-hidden bg-stone-800 border border-stone-700 group">
                  {heroRoom.images && heroRoom.images.length > 0 ? (
                    <img 
                      src={heroRoom.images[0]} 
                      alt={heroRoom.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-500 text-xs italic">
                      Foto in arrivo
                    </div>
                  )}
                  <span className="absolute top-3 left-3 bg-emerald-800/90 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg backdrop-blur-md">
                    {heroRoom.category}
                  </span>
                  <span className="absolute bottom-3 right-3 bg-stone-900/90 text-white text-[10px] font-black px-2.5 py-1 rounded-lg backdrop-blur-md flex items-center gap-1">
                    <Users className="w-3 h-3 text-amber-400" />
                    <span>Fino a {heroRoom.capacity} ospiti</span>
                  </span>
                </div>

                <div className="flex-1 space-y-2">
                  <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                    {heroRoom.title}
                  </h2>
                  <p className="text-stone-300 text-xs sm:text-sm line-clamp-3 leading-relaxed">
                    {heroRoom.description}
                  </p>
                  
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-stone-800">
                    <div>
                      <span className="block text-[10px] uppercase text-stone-400 font-extrabold">A partire da</span>
                      <span className="text-lg font-black text-amber-400">
                        {formatPrice(heroRoom.base_price_high)} <span className="text-xs font-semibold text-stone-300">/notte</span>
                      </span>
                    </div>

                    <div className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-1 rounded-lg">
                      ⚡ Sconto Diretto -10%
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full lg:w-2/3 bg-stone-950/60 rounded-2xl border border-stone-800/90 p-3 sm:p-5">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-stone-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-stone-200">
                      Disponibilità {MONTH_NAMES[lang][currentMonth]}
                    </span>
                  </div>
                  <span className="text-[11px] text-stone-400 italic">
                    {checkIn ? (checkOut ? 'Date selezionate' : t('selectCheckOut')) : t('selectCheckIn')}
                  </span>
                </div>

                {renderCalendarGridForBlocks(heroRoom)}
              </div>

            </div>
          </section>
        )}

        {/* 🏨 2. ALTRE CAMERE */}
        <div className="space-y-4">
          {sortedRoomsList.filter((r) => r.id !== heroRoom?.id).map((room) => {
            const isSelected = bookingRoomSlug === room.slug;
            return (
              <article
                key={room.id}
                id={`room-calendar-card-${cleanSlug(room.slug)}`}
                className={`bg-stone-900/90 rounded-2xl border transition-all duration-300 p-4 sm:p-5 flex flex-col lg:flex-row gap-5 items-start ${
                  isSelected
                    ? 'border-emerald-500 ring-2 ring-emerald-500/30 bg-stone-900 shadow-xl'
                    : 'border-stone-800 hover:border-stone-700'
                }`}
              >
                <div className="w-full lg:w-1/4 flex flex-col sm:flex-row lg:flex-col gap-3 flex-shrink-0">
                  <div className="relative w-full sm:w-40 lg:w-full h-32 sm:h-36 rounded-xl overflow-hidden bg-stone-800 flex-shrink-0">
                    {room.images && room.images.length > 0 ? (
                      <img 
                        src={room.images[0]} 
                        alt={room.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-500 text-xs italic">
                        Foto
                      </div>
                    )}
                    <span className="absolute top-2 left-2 bg-black/70 text-emerald-300 text-[9px] font-black uppercase px-2 py-0.5 rounded-md backdrop-blur-xs">
                      {room.category}
                    </span>
                  </div>

                  <div className="flex-1 space-y-1">
                    <h4 className="text-base sm:text-lg font-black text-white leading-tight">
                      {room.title}
                    </h4>
                    <p className="text-stone-400 text-xs line-clamp-2">
                      {room.description}
                    </p>
                    <div className="flex items-center gap-2 pt-1 text-xs">
                      <span className="font-black text-amber-400">
                        {formatPrice(room.base_price_high)} <span className="text-[10px] text-stone-400 font-normal">/notte</span>
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSelectHeroRoom(room)}
                      className="mt-2 w-full py-1.5 px-3 rounded-lg bg-stone-800 hover:bg-stone-750 active:scale-95 text-amber-300 border border-stone-700 text-xs font-bold tracking-wide flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>{lang === 'TH' ? 'ดูที่พักนี้เป็นหลัก' : lang === 'DE' ? 'Hervorheben' : lang === 'EN' ? 'Highlight Room' : 'Metti in Evidenza'}</span>
                    </button>
                  </div>
                </div>

                <div className="w-full lg:w-3/4 bg-stone-950/40 rounded-xl border border-stone-800/80 p-2.5 sm:p-4">
                  {renderCalendarGridForBlocks(room)}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-amber-400 selection:text-stone-950">
      
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[99999] bg-stone-900 border-2 border-emerald-500 text-white font-extrabold text-xs sm:text-sm px-6 py-3 rounded-full shadow-[0_10px_35px_rgba(0,0,0,0.8)] animate-bounce flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP BRAND HEADER */}
      <header className="sticky top-0 z-40 bg-stone-900/95 backdrop-blur-md border-b border-stone-800 px-4 sm:px-6 py-3 shadow-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          
          {/* Logo & Navigation to Village */}
          <div className="flex items-center gap-3">
            <Link 
              to="/village"
              className="p-2 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-stone-300 hover:text-white transition-all flex items-center gap-1.5 text-xs font-bold"
              title="Torna al Villaggio"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Villaggio</span>
            </Link>

            <div className="flex items-center gap-2.5">
              <img 
                src="/FP_04_-_LOGO_OFFICIAL_HD.png" 
                alt="Flower Power Village" 
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-amber-400/40 object-cover shadow-md"
              />
              <div>
                <h1 className="text-sm sm:text-base font-black tracking-tight text-white flex items-center gap-1.5">
                  <span>Flower Power Village</span>
                  <span className="hidden md:inline-block text-[10px] font-black uppercase bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-md">
                    Koh Phayam
                  </span>
                </h1>
                <p className="text-[10px] sm:text-xs text-stone-400 font-semibold">
                  {t('availabilityAndRates')}
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons: WhatsApp Share & Language Selector */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-black px-3 sm:px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
              title={t('shareWhatsApp')}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('shareWhatsApp')}</span>
              <span className="sm:hidden">Condividi</span>
            </button>

            {/* Language Selector */}
            <div className="flex items-center bg-stone-800 rounded-xl p-0.5 border border-stone-700">
              {(['IT', 'EN', 'TH', 'DE'] as Language[]).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => {
                    setLang(l);
                    updateUrlParams({ lang: l });
                  }}
                  className={`text-[10px] sm:text-xs font-black px-2 py-1.5 rounded-lg transition-all ${
                    lang === l ? 'bg-amber-400 text-stone-950 shadow-sm' : 'text-stone-300 hover:text-white'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-7xl mx-auto w-full px-3 sm:px-6 py-6 space-y-6 flex-grow">

        {/* TOOLBAR: MONTH CONTROLS & VIEW TOGGLE (TIMELINE vs BLOCKS) */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-3 sm:p-4 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Month Navigator */}
          <div className="flex items-center justify-between w-full md:w-auto gap-2">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-2 sm:p-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 active:scale-95 text-stone-200 transition-all cursor-pointer border border-stone-700"
              title="Mese Precedente"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-center min-w-[180px] sm:min-w-[220px] justify-center">
              <CalendarIcon className="w-5 h-5 text-amber-400" />
              <span className="text-base sm:text-xl font-black text-white tracking-wide">
                {MONTH_NAMES[lang][currentMonth]} {currentYear}
              </span>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-2 sm:p-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 active:scale-95 text-stone-200 transition-all cursor-pointer border border-stone-700"
              title="Mese Successivo"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={handleCurrentMonth}
              className="hidden sm:inline-flex text-[11px] font-extrabold uppercase px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-750 text-amber-300 border border-stone-700 ml-1 active:scale-95 transition-all cursor-pointer"
            >
              {lang === 'TH' ? 'เดือนนี้' : lang === 'DE' ? 'Heute' : lang === 'EN' ? 'Today' : 'Mese Corrente'}
            </button>
          </div>

          {/* VIEW MODE TOGGLE (TIMELINE / RIGHE vs BLOCCHI) */}
          <div className="flex items-center bg-stone-950 p-1 rounded-xl border border-stone-800">
            <button
              type="button"
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'timeline'
                  ? 'bg-amber-400 text-stone-950 shadow-md scale-[1.02]'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Rows3 className="w-3.5 h-3.5" />
              <span>{lang === 'TH' ? 'ตารางภาพรวม' : lang === 'DE' ? 'Timeline' : lang === 'EN' ? 'Timeline Grid' : 'Panoramica a Righe'}</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('blocks')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'blocks'
                  ? 'bg-amber-400 text-stone-950 shadow-md scale-[1.02]'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>{lang === 'TH' ? 'บล็อกรายเดือน' : lang === 'DE' ? 'Monatsblöcke' : lang === 'EN' ? 'Monthly Blocks' : 'Vista a Blocchi'}</span>
            </button>
          </div>

          {/* Legend Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] sm:text-xs">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              {t('legendFree')}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-950/80 border border-rose-800/60 text-rose-300 font-bold">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              {t('legendOccupied')}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-950/80 border border-amber-800/60 text-amber-300 font-bold">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              {t('legendMinStay', { count: 2 })}
            </span>
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-stone-800 hover:bg-stone-750 border border-stone-700 text-stone-300 font-bold active:scale-95 transition-all cursor-pointer"
              title="Copia link calendario"
            >
              🔗 {lang === 'IT' ? 'Copia Link' : 'Copy Link'}
            </button>
          </div>

        </div>

        {/* CATEGORY FILTER PILLS */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-400">
              Filtra per categoria:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 bg-stone-900 p-1 rounded-xl border border-stone-800">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`text-[10px] sm:text-xs font-extrabold uppercase px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-stone-400 hover:text-white hover:bg-stone-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* LOADING INDICATOR */}
        {loadingRooms && (
          <div className="py-20 text-center text-stone-400 animate-pulse space-y-3">
            <CalendarIcon className="w-10 h-10 mx-auto text-amber-400 animate-bounce" />
            <p className="font-bold text-sm">Caricamento disponibilità alloggi...</p>
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
          className="sticky bottom-0 z-50 bg-stone-900/95 backdrop-blur-xl border-t-2 border-emerald-500 px-4 sm:px-6 py-3.5 shadow-[0_-10px_35px_rgba(0,0,0,0.8)] animate-slideUp"
        >
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            
            {/* Selection info */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/40 hidden sm:flex">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-stone-400 font-extrabold">
                  {t('bookingSummaryBar')} {bookingSelectionSummary?.room.title || heroRoom?.title}
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-sm sm:text-base font-black text-white">
                    {checkIn} {checkOut ? `➔ ${checkOut} (${bookingSelectionSummary?.nights || 1} notti)` : '(Seleziona Check-Out)'}
                  </span>
                  {bookingSelectionSummary && (
                    <span className="text-base sm:text-lg font-black text-emerald-400">
                      = {formatPrice(bookingSelectionSummary.netTotal)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => {
                  setCheckIn(null);
                  setCheckOut(null);
                  updateUrlParams({ from: null, to: null });
                }}
                className="px-3 py-2 rounded-xl text-stone-400 hover:text-white text-xs font-bold hover:bg-stone-800 transition-all cursor-pointer"
              >
                Reset
              </button>

              <button
                type="button"
                disabled={!checkOut}
                onClick={handleProceedToBooking}
                className={`flex-1 sm:flex-initial text-xs sm:text-sm font-black px-6 py-3 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                  checkOut
                    ? 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white cursor-pointer active:scale-95 shadow-emerald-600/30'
                    : 'bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-700'
                }`}
              >
                <span>{t('applyAndBook')}</span>
                <span className="text-xs opacity-90">(-10%)</span>
              </button>
            </div>

          </div>
        </aside>
      )}

      {/* FOOTER */}
      <footer className="mt-auto border-t border-stone-800 bg-stone-950 py-6 px-4 text-center text-xs text-stone-500 space-y-1">
        <p className="font-bold text-stone-400">
          Flower Power Village & Spa · Koh Phayam, Ranong, Thailand
        </p>
        <p>
          Prenotazione diretta garantita con il miglior prezzo online senza commissioni di agenzia.
        </p>
      </footer>

    </div>
  );
}
