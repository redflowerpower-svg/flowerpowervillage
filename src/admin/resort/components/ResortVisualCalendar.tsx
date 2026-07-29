import { useState, useEffect } from 'react';
import { useResortAdminStore, ResortBooking } from '../store/useResortAdminStore';
import { ACCOMMODATIONS } from '../../../booking/resort/config/accommodations';
import { fetchOctorateMonthlyGrid, OctorateDayData } from '../../../booking/lib/octorate';
import { getBaselineMinStay, getMotherRatePlanId } from '../lib/octorateAdmin';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Info, 
  Search, 
  CheckCircle, 
  Clock, 
  X, 
  Building, 
  User, 
  DollarSign, 
  Globe,
  RefreshCw,
  Lock
} from 'lucide-react';

const MONTH_NAMES_IT = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
];

const DAY_NAMES_IT = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];

const ROOM_BASE_RATES: Record<string, number> = {
  'Jungle Villa': 2290,
  'Jungle Villa Left': 1290,
  'Jungle Villa Right': 1290,
  'Peace & Love Villa': 1200,
  'Villa Penthouse': 1200,
  'Yellow Bungalow': 990,
  'Red Bungalow': 790,
  'Green Bungalow': 790,
  'Camel Tent Bungalow': 430,
  'Lagoon Tent Bungalow': 430,
  'Internal Room': 390,
  'Room 1': 10000,
  'Room 2': 10000,
  'Room 3': 10000,
  'Room 4': 10000,
  'Room 5': 10000,
  'Lodge 1': 10000,
  'Lodge 2': 10000
};

export const ACCOMMODATION_RATE_PLANS: Record<string, { motherId: number; beId: number }> = {
  'Jungle Villa': { motherId: 529773, beId: 529784 },
  'Jungle Villa Left': { motherId: 495795, beId: 495807 },
  'Jungle Villa Right': { motherId: 495796, beId: 495980 },
  'Peace & Love Villa': { motherId: 494840, beId: 495566 },
  'Villa Penthouse': { motherId: 421511, beId: 449348 },
  'Yellow Bungalow': { motherId: 293957, beId: 449385 },
  'Red Bungalow': { motherId: 293954, beId: 449422 },
  'Green Bungalow': { motherId: 293962, beId: 449668 },
  'Camel Tent Bungalow': { motherId: 293965, beId: 449675 },
  'Lagoon Tent Bungalow': { motherId: 293955, beId: 449674 },
  'Room 1': { motherId: 293963, beId: 449678 },
  'Room 2': { motherId: 293959, beId: 449684 },
  'Room 3': { motherId: 293948, beId: 449699 },
  'Room 4': { motherId: 293945, beId: 449724 },
  'Room 5': { motherId: 293943, beId: 449730 },
  'Lodge 1': { motherId: 293951, beId: 449736 },
  'Lodge 2': { motherId: 883795, beId: 923905 },
  'Internal Room': { motherId: 293942, beId: 449742 }
};

export function getIdsForRoom(roomName: string): { motherId: number; beId: number } {
  if (!roomName) return { motherId: 0, beId: 0 };
  const nameLower = roomName.trim().toLowerCase();

  const MAPPING: Record<string, { motherId: number; beId: number }> = {
    'jungle villa': { motherId: 529773, beId: 529784 },
    'jungle villa left': { motherId: 495795, beId: 495807 },
    'jungle villa right': { motherId: 495796, beId: 495980 },
    'peace & love villa': { motherId: 494840, beId: 495566 },
    'villa penthouse': { motherId: 421511, beId: 449348 },
    'penthouse villa': { motherId: 421511, beId: 449348 },
    'yellow bungalow': { motherId: 293957, beId: 449385 },
    'red bungalow': { motherId: 293954, beId: 449422 },
    'green bungalow': { motherId: 293962, beId: 449668 },
    'camel tent bungalow': { motherId: 293965, beId: 449675 },
    'camel tent': { motherId: 293965, beId: 449675 },
    'lagoon tent bungalow': { motherId: 293955, beId: 449674 },
    'lagoon tent': { motherId: 293955, beId: 449674 },
    'room 1': { motherId: 293963, beId: 449678 },
    'room 2': { motherId: 293959, beId: 449684 },
    'room 3': { motherId: 293948, beId: 449699 },
    'room 4': { motherId: 293945, beId: 449724 },
    'room 5': { motherId: 293943, beId: 449730 },
    'lodge 1': { motherId: 293951, beId: 449736 },
    'lodge 2': { motherId: 883795, beId: 923905 },
    'internal room': { motherId: 293942, beId: 449742 }
  };

  for (const key in MAPPING) {
    if (nameLower === key || nameLower.includes(key) || key.includes(nameLower)) {
      return MAPPING[key];
    }
  }

  return { motherId: 0, beId: 0 };
}

const AGENCY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Booking.com': { bg: 'bg-blue-600 hover:bg-blue-500', text: 'text-white font-extrabold', border: 'border-blue-500' },
  'Expedia': { bg: 'bg-amber-600 hover:bg-amber-500', text: 'text-white font-extrabold', border: 'border-amber-500' },
  'Agoda': { bg: 'bg-purple-600 hover:bg-purple-500', text: 'text-white font-extrabold', border: 'border-purple-500' },
  'Trip.com': { bg: 'bg-rose-600 hover:bg-rose-500', text: 'text-white font-extrabold', border: 'border-rose-500' },
  'Direct / Website': { bg: 'bg-teal-600 hover:bg-teal-500', text: 'text-white font-extrabold', border: 'border-teal-500' },
  'Walk-in / Staff': { bg: 'bg-indigo-600 hover:bg-indigo-500', text: 'text-white font-extrabold', border: 'border-indigo-500' },
};

const getAgencyStyle = (source?: string) => {
  if (!source) return { bg: 'bg-teal-600 hover:bg-teal-500', text: 'text-white font-extrabold', border: 'border-teal-500' };
  const s = source.toLowerCase();
  if (s.includes('airbnb')) return { bg: 'bg-pink-600 hover:bg-pink-500', text: 'text-white font-extrabold', border: 'border-pink-500' };
  if (s.includes('booking')) return { bg: 'bg-blue-600 hover:bg-blue-500', text: 'text-white font-extrabold', border: 'border-blue-500' };
  if (s.includes('expedia')) return { bg: 'bg-amber-600 hover:bg-amber-500', text: 'text-white font-extrabold', border: 'border-amber-500' };
  if (s.includes('agoda')) return { bg: 'bg-purple-600 hover:bg-purple-500', text: 'text-white font-extrabold', border: 'border-purple-500' };
  if (s.includes('trip')) return { bg: 'bg-rose-600 hover:bg-rose-500', text: 'text-white font-extrabold', border: 'border-rose-500' };
  if (s.includes('direct') || s.includes('diretto') || s.includes('site') || s.includes('stripe')) return { bg: 'bg-teal-600 hover:bg-teal-500', text: 'text-white font-extrabold', border: 'border-teal-500' };
  return { bg: 'bg-indigo-600 hover:bg-indigo-500', text: 'text-white font-extrabold', border: 'border-indigo-500' };
};

function getBookingChannelName(booking: any): string {
  const src = String(booking.source || booking.channel || booking.channelName || booking.source_channel || booking.ota || '').toLowerCase();
  if (src.includes('airbnb')) return 'Airbnb';
  if (src.includes('booking')) return 'Booking.com';
  if (src.includes('expedia')) return 'Expedia';
  if (src.includes('agoda')) return 'Agoda';
  if (src.includes('trip')) return 'Trip.com';
  if (src.includes('direct') || src.includes('site') || src.includes('stripe') || src.includes('diretto')) return 'Diretto';
  return booking.source || booking.channel || booking.channelName || 'Prenotato';
}

// Universal All-18 Accommodations ID & Keyword Map for Bidirectional Fuzzy Matching
const ALL_ACCOMMODATIONS_MAP: Record<string, { ids: string[]; keywords: string[][] }> = {
  'jungle villa': {
    ids: ['529784', '529773'],
    keywords: [['jungle'], ['villa']]
  },
  'jungle villa left': {
    ids: ['495807', '495795'],
    keywords: [['jungle', 'jv'], ['left', 'l']]
  },
  'jungle villa right': {
    ids: ['495980', '495796'],
    keywords: [['jungle', 'jv'], ['right', 'r']]
  },
  'peace & love villa': {
    ids: ['495566', '494840'],
    keywords: [['peace', 'love', 'p&l']]
  },
  'villa penthouse': {
    ids: ['449348', '421511', '421532'],
    keywords: [['penthouse', 'pent']]
  },
  'yellow bungalow': {
    ids: ['449385', '293957', '422422'],
    keywords: [['yellow']]
  },
  'red bungalow': {
    ids: ['449422', '293954'],
    keywords: [['red']]
  },
  'green bungalow': {
    ids: ['449668', '293962'],
    keywords: [['green']]
  },
  'camel tent bungalow': {
    ids: ['449675', '293965', '297025'],
    keywords: [['camel']]
  },
  'lagoon tent bungalow': {
    ids: ['449674', '293955'],
    keywords: [['lagoon']]
  },
  'room 1': {
    ids: ['449678', '293963'],
    keywords: [['room', 'hub'], ['1', 'one']]
  },
  'room 2': {
    ids: ['449684', '293959'],
    keywords: [['room', 'hub'], ['2', 'two']]
  },
  'room 3': {
    ids: ['449699', '293948'],
    keywords: [['room', 'hub'], ['3', 'three']]
  },
  'room 4': {
    ids: ['449724', '293945'],
    keywords: [['room', 'hub'], ['4', 'four']]
  },
  'room 5': {
    ids: ['449730', '293943'],
    keywords: [['room', 'hub'], ['5', 'five']]
  },
  'lodge 1': {
    ids: ['449736', '293951'],
    keywords: [['lodge'], ['1', 'one']]
  },
  'lodge 2': {
    ids: ['923905', '883795'],
    keywords: [['lodge'], ['2', 'two']]
  },
  'internal room': {
    ids: ['449742', '293942'],
    keywords: [['internal']]
  }
};

function findMatchingBooking(
  roomName: string,
  roomId: string,
  roomOctId: string,
  cellDate: Date,
  bookings: ResortBooking[]
): ResortBooking | null {
  if (!bookings || !Array.isArray(bookings) || bookings.length === 0) return null;

  const y = cellDate.getFullYear();
  const m = String(cellDate.getMonth() + 1).padStart(2, '0');
  const d = String(cellDate.getDate()).padStart(2, '0');
  const targetDateStr = `${y}-${m}-${d}`;

  const targetNameLower = (roomName || '').toLowerCase().trim();
  const targetRoomIdStr = String(roomId || '').trim();
  const targetOctIdStr = String(roomOctId || '').trim();

  const mapEntry = ALL_ACCOMMODATIONS_MAP[targetNameLower];

  return bookings.find((b: any) => {
    const status = String(b.status || '').toLowerCase();
    if (status === 'cancelled' || status === 'canceled') return false;

    // Room ID & Name matching normalization
    const bRoomName = String(
      b.roomName || 
      b.accommodation_name || 
      b.room_name || 
      b.productName || 
      b.product?.name || 
      b.room?.name || 
      ''
    ).toLowerCase().trim();

    const bProduct = String(
      b.product || 
      b.pmsProduct || 
      b.accommodation_id || 
      b.room_id || 
      b.roomId || 
      b.roomTypeId || 
      b.product?.id || 
      b.room?.id || 
      ''
    ).trim();

    let isRoomMatch = false;

    // 1. Direct ID Match
    if (bProduct) {
      if (bProduct === targetRoomIdStr || bProduct === targetOctIdStr) {
        isRoomMatch = true;
      } else if (mapEntry && mapEntry.ids.includes(bProduct)) {
        isRoomMatch = true;
      }
    }

    // 2. Smart Bidirectional Keyword Match
    if (!isRoomMatch && bRoomName) {
      if (bRoomName === targetNameLower || bRoomName.includes(targetNameLower) || targetNameLower.includes(bRoomName)) {
        if (targetNameLower === 'jungle villa') {
          if (!bRoomName.includes('left') && !bRoomName.includes('right') && !bRoomName.includes('jvl') && !bRoomName.includes('jvr')) {
            isRoomMatch = true;
          }
        } else {
          isRoomMatch = true;
        }
      } else if (mapEntry) {
        const matchesAllGroups = mapEntry.keywords.every((group) =>
          group.some((kw) => bRoomName.includes(kw))
        );
        if (matchesAllGroups) {
          isRoomMatch = true;
        }
      }
    }

    if (!isRoomMatch) return false;

    // Date YYYY-MM-DD normalization
    const rawCheckIn = String(b.checkin || b.check_in || b.checkIn || b.start_date || b.startDate || '');
    const rawCheckOut = String(b.checkout || b.check_out || b.checkOut || b.end_date || b.endDate || '');

    const checkInStr = rawCheckIn.slice(0, 10);
    const checkOutStr = rawCheckOut.slice(0, 10);

    if (!checkInStr || !checkOutStr) return false;

    return targetDateStr >= checkInStr && targetDateStr < checkOutStr;
  }) || null;
}

/**
 * Calcola reattivamente il Soggiorno Minimo Dinamico (Gap-Fill a doppio senso)
 * per ciascun alloggio sulla griglia delle date correnti.
 */
function computeGapFillMinStays(
  roomName: string,
  roomId: string,
  roomOctorateId: string,
  isRoomAvailable: boolean,
  datesArray: Date[],
  liveGridData: Record<string, Record<string, OctorateDayData>>,
  bookings: ResortBooking[],
  dynamicGapFillEnabled: boolean
): Record<string, number> {
  const result: Record<string, number> = {};
  if (datesArray.length === 0) return result;

  const targetRoomName = roomName.toLowerCase();
  const targetRoomId = String(roomId);
  const targetOctId = String(roomOctorateId || '');

  const dailyStates = datesArray.map((cellDate) => {
    const dateStr = cellDate.toISOString().substring(0, 10);
    const liveData = (
      liveGridData[roomName] || 
      liveGridData[targetRoomName] || 
      liveGridData[targetOctId] || 
      liveGridData[targetRoomId]
    )?.[dateStr];

    const websitePrice = (liveData && liveData.price > 0)
      ? liveData.price
      : (ROOM_BASE_RATES[roomName] || 1000);

    const isRoomClosedByStaff = isRoomAvailable === false;
    const isClosedOrStopSell = 
      isRoomClosedByStaff || 
      websitePrice >= 10000 ||
      (liveData ? (liveData.stopSell || !liveData.available || liveData.price >= 10000) : false);

    const hasBooking = (bookings || []).some((b: any) => {
      if (b.status === 'cancelled') return false;
      const bAccName = String(b.accommodation_name || b.roomName || b.room_name || '').toLowerCase();
      const bAccId = String(b.accommodation_id || b.roomId || b.octorateRoomId || b.octorateId || '');

      const isRoomMatch = 
        (bAccName.length > 0 && (bAccName.includes(targetRoomName) || targetRoomName.includes(bAccName))) ||
        (bAccId.length > 0 && (
          bAccId === targetRoomId || 
          (targetOctId.length > 0 && bAccId === targetOctId) || 
          (targetRoomId.length > 0 && Number(bAccId) === Number(targetRoomId)) ||
          (targetOctId.length > 0 && Number(bAccId) === Number(targetOctId))
        ));

      if (!isRoomMatch) return false;

      const inDateStr = String(b.check_in || b.checkIn || '').slice(0, 10);
      const outDateStr = String(b.check_out || b.checkOut || '').slice(0, 10);

      return dateStr >= inDateStr && dateStr < outDateStr;
    });

    const isFree = !isClosedOrStopSell && !hasBooking;

    // Gerarchia Rigida Min Stay:
    // 1. Se i dati live di Octorate sono disponibili ed esiste minStay > 0, usa tassativamente quello.
    // 2. Solo se offline o undefined, ripiega sulla regola stagionale interna.
    const hasLiveMinStay = typeof liveData?.minStay === 'number' && liveData.minStay > 0;
    const standardMinStay = hasLiveMinStay ? (liveData!.minStay as number) : getBaselineMinStay(dateStr);

    return { dateStr, isFree, standardMinStay };
  });

  if (!dynamicGapFillEnabled) {
    dailyStates.forEach(s => {
      result[s.dateStr] = s.standardMinStay;
    });
    return result;
  }

  let i = 0;
  while (i < dailyStates.length) {
    if (!dailyStates[i].isFree) {
      result[dailyStates[i].dateStr] = dailyStates[i].standardMinStay;
      i++;
      continue;
    }

    const gapStart = i;
    while (i < dailyStates.length && dailyStates[i].isFree) {
      i++;
    }
    const gapEnd = i - 1;
    const gapNights = gapEnd - gapStart + 1;

    for (let k = gapStart; k <= gapEnd; k++) {
      const s = dailyStates[k];
      if (gapNights < s.standardMinStay && gapNights > 0) {
        result[s.dateStr] = gapNights;
      } else {
        result[s.dateStr] = s.standardMinStay;
      }
    }
  }

  return result;
}

export function ResortVisualCalendar() {
  const { 
    bookings, 
    accommodations, 
    fetchBookings,
    dynamicMinStayGapFill,
    setDynamicMinStayGapFill
  } = useResortAdminStore();

  console.log("[DEBUG PRENOTAZIONI] Totale ricevute:", bookings?.length);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // View mode: 'today_30_days' (starts from today on far left) OR 'full_month'
  const [viewMode, setViewMode] = useState<'today_30_days' | 'full_month'>('today_30_days');
  const [startDate, setStartDate] = useState<Date>(new Date());
  
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-11
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [selectedBooking, setSelectedBooking] = useState<ResortBooking | null>(null);
  const [liveGridData, setLiveGridData] = useState<Record<string, Record<string, OctorateDayData>>>({});
  const [loadingLive, setLoadingLive] = useState<boolean>(false);

  console.log("=== DEBUG LIVE GRID ===");
  console.log("TIPO DI DATO:", Array.isArray(liveGridData) ? "Array" : typeof liveGridData);
  console.log("CHIAVI DISPONIBILI:", liveGridData ? Object.keys(liveGridData) : "Nessuna");

  // Load bookings on mount
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Compute array of date objects to render in columns
  const datesArray: Date[] = (() => {
    if (viewMode === 'today_30_days') {
      const dates: Date[] = [];
      const base = new Date(startDate);
      for (let i = 0; i < 30; i++) {
        const d = new Date(base);
        d.setDate(d.getDate() + i);
        dates.push(d);
      }
      return dates;
    } else {
      const daysInM = new Date(currentYear, currentMonth + 1, 0).getDate();
      const dates: Date[] = [];
      for (let i = 1; i <= daysInM; i++) {
        dates.push(new Date(currentYear, currentMonth, i));
      }
      return dates;
    }
  })();

  console.log("[DEBUG PRENOTAZIONI CALENDARIO] Totale prenotazioni disponibili per il matching:", (bookings || []).length, bookings);

  // Load Octorate Live Calendar & active reservations whenever dates range changes
  const loadLiveGrid = async () => {
    if (datesArray.length === 0) return;
    setLoadingLive(true);
    try {
      const firstDate = datesArray[0];
      const lastDate = datesArray[datesArray.length - 1];

      const dateFrom = firstDate.toISOString().substring(0, 10);
      const dateTo = lastDate.toISOString().substring(0, 10);

      // Separation of concerns: parallel fetch for grid prices & reservations
      const [gridData, bookingsRes] = await Promise.all([
        fetchOctorateMonthlyGrid(dateFrom, dateTo),
        fetch(`/api/resort/octorate-bookings?dateFrom=${dateFrom}&dateTo=${dateTo}`)
      ]);

      setLiveGridData(gridData || {});

      if (bookingsRes.ok) {
        const bookingsJson = await bookingsRes.json();
        if (bookingsJson.data && Array.isArray(bookingsJson.data)) {
          useResortAdminStore.getState().setBookings(bookingsJson.data);
          console.log(`[ResortVisualCalendar] Popolate ${bookingsJson.data.length} prenotazioni dallo store per il periodo ${dateFrom} -> ${dateTo}`);
        }
      }
    } catch (err) {
      console.warn('[ResortVisualCalendar] Live grid fetch error:', err);
    } finally {
      setLoadingLive(false);
    }
  };

  useEffect(() => {
    loadLiveGrid();
  }, [viewMode, startDate, currentYear, currentMonth]);

  // Navigation helpers
  const handlePrev30Days = () => {
    const newStart = new Date(startDate);
    newStart.setDate(newStart.getDate() - 30);
    setStartDate(newStart);
  };

  const handleNext30Days = () => {
    const newStart = new Date(startDate);
    newStart.setDate(newStart.getDate() + 30);
    setStartDate(newStart);
  };

  const handleResetToToday = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    setStartDate(now);
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    setViewMode('today_30_days');
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Filter accommodations by category
  const filteredRooms = (accommodations || []).filter((r) => {
    if (filterCategory === 'All') return true;
    return r.category && r.category.toLowerCase() === filterCategory.toLowerCase();
  });

  // Return raw base rate directly without applying any frontend discounts or multipliers
  const calculateWebsitePriceForRoom = (roomName: string) => {
    return ROOM_BASE_RATES[roomName] || 1000;
  };

  return (
    <div className="space-y-4 text-stone-100 font-sans">
      
      {/* Calendar Header Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-stone-900 border border-stone-800 rounded-3xl p-5 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Calendario Visivo Alloggi & Prezzi
              </h3>
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                THB ฿
              </span>
            </div>
            <p className="text-stone-400 text-xs font-medium mt-0.5">
              Visualizzazione tariffe giornaliere, occupazione e canali OTA (Booking.com, Expedia, Agoda, Diretto)
            </p>
          </div>
        </div>

        {/* View Mode & Date Selector Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-stone-950 p-2 rounded-2xl border border-amber-500/30 shadow-lg w-full md:w-auto">
          {/* View Mode Switcher */}
          <div className="flex items-center bg-stone-900 p-1 rounded-xl border border-stone-800">
            <button
              type="button"
              onClick={() => {
                setViewMode('today_30_days');
                setStartDate(new Date());
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                viewMode === 'today_30_days'
                  ? 'bg-amber-500 text-stone-950 shadow font-black'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              📌 Oggi in 1ª Colonna
            </button>
            <button
              type="button"
              onClick={() => setViewMode('full_month')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                viewMode === 'full_month'
                  ? 'bg-amber-500 text-stone-950 shadow font-black'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              📅 Mese Solare (1-31)
            </button>
          </div>

          {/* Navigation Controls */}
          {viewMode === 'today_30_days' ? (
            <div className="flex items-center gap-2 justify-between">
              <button
                type="button"
                onClick={handlePrev30Days}
                className="px-2.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-amber-400 font-bold text-xs rounded-xl border border-stone-800 cursor-pointer flex items-center gap-1"
                title="30 Giorni Precedenti"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>30gg Prec</span>
              </button>

              <span className="font-extrabold text-xs text-white font-mono px-2">
                {datesArray[0]?.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })} ➔ {datesArray[datesArray.length - 1]?.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}
              </span>

              <button
                type="button"
                onClick={handleNext30Days}
                className="px-2.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-amber-400 font-bold text-xs rounded-xl border border-stone-800 cursor-pointer flex items-center gap-1"
                title="30 Giorni Successivi"
              >
                <span>30gg Succ</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 justify-between">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-2 bg-stone-900 hover:bg-stone-800 text-amber-400 rounded-xl border border-stone-800 cursor-pointer"
                title="Mese Precedente"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <select
                value={currentMonth}
                onChange={(e) => setCurrentMonth(parseInt(e.target.value))}
                className="bg-stone-900 text-white font-extrabold text-xs px-2 py-1.5 rounded-xl border border-stone-800 focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                {MONTH_NAMES_IT.map((m, idx) => (
                  <option key={idx} value={idx}>
                    {m}
                  </option>
                ))}
              </select>

              <select
                value={currentYear}
                onChange={(e) => setCurrentYear(parseInt(e.target.value))}
                className="bg-stone-900 text-amber-400 font-mono font-black text-xs px-2 py-1.5 rounded-xl border border-stone-800 focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                {[2025, 2026, 2027, 2028].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleNextMonth}
                className="p-2 bg-stone-900 hover:bg-stone-800 text-amber-400 rounded-xl border border-stone-800 cursor-pointer"
                title="Mese Successivo"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={loadLiveGrid}
            disabled={loadingLive}
            className="px-3 py-1.5 bg-stone-900 hover:bg-stone-850 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-black uppercase tracking-wider shadow transition-all cursor-pointer flex items-center justify-center gap-1.5"
            title="Sincronizza Tariffe Live da Octorate REST v1"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingLive ? 'animate-spin' : ''}`} />
            <span>{loadingLive ? 'Sync...' : 'Sync Live'}</span>
          </button>

          <button
            type="button"
            onClick={handleResetToToday}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow transition-all cursor-pointer whitespace-nowrap"
          >
            Reset a Oggi
          </button>
        </div>
      </div>

      {/* Category Filters & Legend */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-stone-900/60 p-3 rounded-2xl border border-stone-850">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'All', label: 'Tutti gli Alloggi (18)' },
            { id: 'VILLE', label: '🏡 Ville (4)' },
            { id: 'BUNGALOW', label: '🛖 Bungalow (3)' },
            { id: 'TENDE GLAMPING', label: '⛺ Glamping (2)' },
            { id: 'THE HUB GUESTHOUSE', label: '🏨 Hub Guesthouse (9)' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                filterCategory === cat.id
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-stone-400 hover:text-white hover:bg-stone-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Agency Color Legend */}
        <div className="flex items-center gap-2 overflow-x-auto text-[10px] font-bold text-stone-400 pt-1 sm:pt-0">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Booking.com</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Expedia</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Agoda</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Diretto / Stripe</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-600" /> Stop Sell / Chiuso</span>
        </div>
      </div>

      {/* Grid Matrix Table Container - Fits on one screen without vertical scrollbar */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1250px]">
            {/* Table Header: Days columns starting from Today or Month 1 */}
            <thead className="bg-stone-950 sticky top-0 z-20 border-b border-stone-800">
              <tr>
                <th className="py-1 px-2 text-[10px] font-black text-stone-300 uppercase tracking-wider sticky left-0 bg-stone-950 z-30 min-w-[170px] shadow-r">
                  Alloggio / Camera
                </th>
                {datesArray.map((cellDate, idx) => {
                  const dayNum = cellDate.getDate();
                  const monthShort = MONTH_NAMES_IT[cellDate.getMonth()].substring(0, 3);
                  const dayOfWeekIdx = cellDate.getDay();
                  const isWeekend = dayOfWeekIdx === 0 || dayOfWeekIdx === 6;
                  const isToday = cellDate.getTime() === today.getTime();

                  return (
                    <th
                      key={idx}
                      className={`py-1 px-0.5 text-center border-l border-stone-850 min-w-[54px] ${
                        isToday 
                          ? 'bg-amber-500/25 text-amber-300 font-black ring-1 ring-amber-400' 
                          : isWeekend 
                            ? 'bg-stone-900 text-stone-300 font-bold' 
                            : 'text-stone-400 font-medium'
                      }`}
                    >
                      <div className="text-[8px] uppercase font-mono text-stone-400 leading-none">{DAY_NAMES_IT[dayOfWeekIdx]}</div>
                      <div className={`text-[10px] font-mono font-bold leading-tight ${isToday ? 'text-amber-400 font-black' : ''}`}>
                        {dayNum} {monthShort}
                      </div>
                      {isToday && (
                        <div className="text-[7px] font-black uppercase text-amber-400 tracking-tighter leading-none">OGGI</div>
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* Table Body: Rooms Rows */}
            <tbody className="divide-y divide-stone-850/60 text-[10px]">
              {filteredRooms.map((room) => {
                const roomPriceBase = ROOM_BASE_RATES[room.name] || (room.basePrice && room.basePrice > 0 ? room.basePrice : 1000);
                const isRoomBaseClosed = roomPriceBase >= 10000;

                // Calcolo reattivo del Soggiorno Minimo Dinamico (Gap-Fill a doppio senso) per questa riga alloggio
                const gapFillMinStays = computeGapFillMinStays(
                  room.name,
                  room.id,
                  room.octorateId,
                  room.isAvailable,
                  datesArray,
                  liveGridData,
                  bookings,
                  dynamicMinStayGapFill
                );

                return (
                  <tr key={room.id} className="hover:bg-stone-850/40 transition-colors h-10">
                    {/* Room Name & Category Cell (Sticky Column) */}
                    <td className="py-1 px-2 sticky left-0 bg-stone-900 z-10 border-r border-stone-800 shadow-r">
                      <div className="flex items-center justify-between gap-1">
                        <div className="font-extrabold text-white text-[10px] leading-none truncate max-w-[110px]" title={room.name}>
                          {room.name}
                        </div>
                        <span className={`text-[9px] font-mono font-bold whitespace-nowrap ${isRoomBaseClosed ? 'text-red-400' : 'text-amber-400'}`}>
                          {isRoomBaseClosed ? 'Chiuso' : `฿${roomPriceBase.toLocaleString('it-IT')}`}
                        </span>
                      </div>
                    </td>

                    {/* Days Cells */}
                    {datesArray.map((cellDate, idx) => {
                      const dateStr = cellDate.toISOString().substring(0, 10);
                      
                      // ESTRAZIONE DATI SICURA A DIZIONARIO (String Key Casting)
                      const { motherId, beId } = getIdsForRoom(room.name);

                      const motherData = liveGridData?.[String(motherId)]?.[dateStr];
                      const beData = liveGridData?.[String(beId)]?.[dateStr];

                      // Prezzi reali (mostra N/D se il dato non c'è)
                      const motherPriceVal = Number(motherData?.price || motherData?.value || motherData?.amount || 0);
                      const motherPriceStr = motherPriceVal >= 10000 
                        ? '10.000' 
                        : (motherPriceVal > 0 ? motherPriceVal.toLocaleString('it-IT') : 'N/D');

                      const bePriceVal = Number(beData?.price || beData?.value || beData?.amount || 0);
                      const bePriceStr = bePriceVal >= 10000 
                        ? '10.000' 
                        : (bePriceVal > 0 ? bePriceVal.toLocaleString('it-IT') : 'N/D');

                      // Minimum stay letto dalla Tariffa Madre
                      const motherMinStayNum = Number(motherData?.minStay ?? motherData?.minstay ?? motherData?.minNights ?? motherData?.min_stay ?? gapFillMinStays[dateStr] ?? 0);

                      // 🥇 PRIORITÀ 1: Prenotazione (Controllo array "bookings")
                      const matchingBooking = findMatchingBooking(room.name, room.id, room.octorateId, cellDate, bookings);

                      // 🥈 PRIORITÀ 2: Chiusura / Stop Sell (valutata RIGOROSAMENTE sulla Tariffa Madre)
                      const isRoomClosedByStaff = room.isAvailable === false;
                      const isMotherStopSell = motherData
                        ? (Boolean(motherData.stopSell || motherData.stopSells) || motherData.available === false || (motherData.availability !== undefined && motherData.availability <= 0) || motherData.price >= 10000)
                        : false;

                      const isClosedOrStopSell = isRoomClosedByStaff || isMotherStopSell;

                      // LAYOUT IBRIDO COMPLETO: Sfondo & Stile
                      let bgStyle = 'bg-emerald-600 hover:bg-emerald-500 border-emerald-600/60 cursor-default shadow-inner';

                      if (matchingBooking) {
                        const channelName = getBookingChannelName(matchingBooking);
                        const style = getAgencyStyle(channelName);
                        bgStyle = `${style.bg} ${style.border} cursor-pointer shadow-lg`;
                      } else if (isClosedOrStopSell) {
                        bgStyle = 'bg-red-700 hover:bg-red-600 border-red-800/80 cursor-default shadow-inner';
                      }

                      const isCTA = Boolean(motherData?.closedToArrival || beData?.closedToArrival);

                      return (
                        <td
                          key={idx}
                          onClick={() => matchingBooking && setSelectedBooking(matchingBooking)}
                          className={`py-1 px-0.5 border-l text-center transition-colors relative min-w-[64px] max-w-[120px] w-full overflow-hidden ${bgStyle}`}
                          title={matchingBooking 
                            ? `Prenotato: ${matchingBooking.guest_name || 'Ospite'} (${getBookingChannelName(matchingBooking)}) • Madre: ${motherPriceStr !== 'N/D' ? `฿${motherPriceStr}` : 'N/D'} • BE: ${bePriceStr !== 'N/D' ? `฿${bePriceStr}` : 'N/D'}`
                            : `Madre: ${motherPriceStr !== 'N/D' ? `฿${motherPriceStr}` : 'N/D'} • BE: ${bePriceStr !== 'N/D' ? `฿${bePriceStr}` : 'N/D'} • MinStay: ${motherMinStayNum > 0 ? motherMinStayNum : '-'}`}
                        >
                          {/* BADGE MINSTAY (Cerchio Giallo con testo nero) */}
                          {motherMinStayNum > 0 && (
                            <div className="absolute top-0.5 right-0.5 w-4 h-4 bg-yellow-400 text-black text-[9.5px] font-black rounded-full flex items-center justify-center z-10 shadow-md">
                              {motherMinStayNum}
                            </div>
                          )}

                          {/* Indicator CTA Solo Check-out */}
                          {isCTA && (
                            <span 
                              className="absolute top-0.5 left-0.5 w-1.5 h-1.5 rounded-full bg-amber-400 border border-amber-500/60 shadow-sm" 
                              title="Solo Check-Out / Closed to Arrival"
                            />
                          )}

                          {/* CONTENUTO CELLA STRUTTURATO E TRONCATO */}
                          {matchingBooking ? (
                            <div className="flex flex-col items-center justify-center min-w-0 w-full overflow-hidden">
                              {/* Riga 1: Nome OTA */}
                              <div className="truncate text-xs font-bold min-w-0 w-full text-center text-white uppercase">
                                {getBookingChannelName(matchingBooking)}
                              </div>
                              {/* Riga 2: Nome Ospite */}
                              <div className="truncate text-[10px] min-w-0 w-full text-center text-white/95 font-medium">
                                {matchingBooking.guest_name || matchingBooking.guestName || 'Ospite'}
                              </div>
                              {/* Prezzo BE sotto */}
                              <div className="text-[10px] font-mono font-black text-white leading-tight mt-0.5 truncate min-w-0 w-full text-center">
                                BE: {bePriceStr !== 'N/D' ? `฿${bePriceStr}` : 'N/D'}
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center min-w-0 w-full overflow-hidden">
                              {/* CENTRO: Prezzo Tariffa Madre */}
                              <div className="text-[9px] font-mono font-medium text-white/90 leading-tight truncate min-w-0 w-full text-center">
                                Madre: {motherPriceStr !== 'N/D' ? `฿${motherPriceStr}` : 'N/D'}
                              </div>

                              {/* BASSO (in grassetto): Prezzo Tariffa BE */}
                              <div className="text-[11px] font-mono font-black text-white leading-tight mt-0.5 truncate min-w-0 w-full text-center">
                                BE: {bePriceStr !== 'N/D' ? `฿${bePriceStr}` : 'N/D'}
                              </div>
                            </div>
                          )}
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

      {/* Booking Details Modal Popup */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-white text-base">Dettaglio Prenotazione</h3>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-1 text-stone-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-stone-950 p-3.5 rounded-2xl border border-stone-850 space-y-1.5">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Ospite:</span>
                <div className="font-extrabold text-white text-sm flex items-center gap-2">
                  <User className="w-4 h-4 text-amber-400" />
                  <span>{selectedBooking.guest_name}</span>
                </div>
                <div className="text-stone-400">{selectedBooking.guest_email} · {selectedBooking.guest_phone}</div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-stone-950 p-3 rounded-2xl border border-stone-850 space-y-1">
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Alloggio:</span>
                  <div className="font-bold text-stone-200">{selectedBooking.accommodation_name}</div>
                </div>

                <div className="bg-stone-950 p-3 rounded-2xl border border-stone-850 space-y-1">
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Canale / Agenzia:</span>
                  <div className="font-bold text-emerald-400">{selectedBooking.source_channel || 'Prenotazione Diretta'}</div>
                </div>
              </div>

              <div className="bg-stone-950 p-3.5 rounded-2xl border border-stone-850 space-y-2">
                <div className="flex justify-between items-center text-stone-300">
                  <span>Periodo Check-in / Out:</span>
                  <span className="font-mono font-bold text-white">
                    {selectedBooking.check_in} ➔ {selectedBooking.check_out}
                  </span>
                </div>
                <div className="flex justify-between items-center text-stone-300 border-t border-stone-850 pt-2">
                  <span>Totale Prenotazione:</span>
                  <span className="font-mono font-black text-amber-400 text-sm">
                    ฿{(selectedBooking.total_price ?? 0).toLocaleString('it-IT')}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedBooking(null)}
              className="w-full py-2.5 bg-stone-800 hover:bg-stone-750 text-white font-bold text-xs rounded-2xl transition-all cursor-pointer"
            >
              Chiudi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
