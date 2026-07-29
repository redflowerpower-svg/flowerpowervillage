import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  'Room 1': 390,
  'Room 2': 390,
  'Room 3': 390,
  'Room 4': 390,
  'Room 5': 390,
  'Lodge 1': 690,
  'Lodge 2': 690
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
  'WEBSITE': { bg: 'bg-orange-500 hover:bg-orange-400', text: 'text-white font-black', border: 'border-orange-400' },
  'PRIVATE': { bg: 'bg-gray-700 hover:bg-gray-600', text: 'text-white font-extrabold', border: 'border-gray-600' },
  'BOOKING': { bg: 'bg-blue-800 hover:bg-blue-700', text: 'text-white font-extrabold', border: 'border-blue-700' },
  'Agoda': { bg: 'bg-purple-600 hover:bg-purple-500', text: 'text-white font-extrabold', border: 'border-purple-500' },
  'Airbnb': { bg: 'bg-rose-600 hover:bg-rose-500', text: 'text-white font-extrabold', border: 'border-rose-500' },
  'Expedia': { bg: 'bg-amber-600 hover:bg-amber-500', text: 'text-white font-extrabold', border: 'border-amber-500' },
  'Trip.com': { bg: 'bg-teal-600 hover:bg-teal-500', text: 'text-white font-extrabold', border: 'border-teal-500' },
};

const getAgencyStyle = (source?: string) => {
  if (!source) return { bg: 'bg-orange-500 hover:bg-orange-400', text: 'text-white font-black', border: 'border-orange-400' };
  const s = source.toLowerCase();
  if (s.includes('octoevo') || s.includes('autosubmit') || s.includes('private')) {
    return { bg: 'bg-gray-700 hover:bg-gray-600', text: 'text-white font-extrabold', border: 'border-gray-600' };
  }
  if (s.includes('stripe') || s.includes('direct') || s.includes('diretto') || s.includes('website') || s.includes('site') || s.includes('booking engine') || s.includes('web')) {
    return { bg: 'bg-orange-500 hover:bg-orange-400', text: 'text-white font-black', border: 'border-orange-400' };
  }
  if (s.includes('booking')) {
    return { bg: 'bg-blue-800 hover:bg-blue-700', text: 'text-white font-extrabold', border: 'border-blue-700' };
  }
  if (s.includes('expedia')) {
    return { bg: 'bg-amber-600 hover:bg-amber-500', text: 'text-white font-extrabold', border: 'border-amber-500' };
  }
  if (s.includes('agoda')) {
    return { bg: 'bg-purple-600 hover:bg-purple-500', text: 'text-white font-extrabold', border: 'border-purple-500' };
  }
  if (s.includes('airbnb')) {
    return { bg: 'bg-rose-600 hover:bg-rose-500', text: 'text-white font-extrabold', border: 'border-rose-500' };
  }
  if (s.includes('trip')) {
    return { bg: 'bg-teal-600 hover:bg-teal-500', text: 'text-white font-extrabold', border: 'border-teal-500' };
  }
  return { bg: 'bg-indigo-600 hover:bg-indigo-500', text: 'text-white font-extrabold', border: 'border-indigo-500' };
};

function getBookingChannelName(booking: any): string {
  const src = String(
    booking.channelName || booking.source || booking.agency || booking.channel || booking.source_channel || booking.ota || ''
  ).toLowerCase();

  if (src.includes('octoevo') || src.includes('autosubmit')) {
    return 'PRIVATE';
  }
  if (src.includes('stripe') || src.includes('direct') || src.includes('diretto') || src.includes('website') || src.includes('site') || src.includes('booking engine')) {
    return 'WEBSITE';
  }
  if (src.includes('booking')) {
    return 'BOOKING';
  }
  if (src.includes('expedia')) {
    return 'EXPEDIA';
  }
  if (src.includes('agoda')) {
    return 'AGODA';
  }
  if (src.includes('airbnb')) {
    return 'AIRBNB';
  }
  if (src.includes('trip')) {
    return 'TRIP.COM';
  }
  return String(booking.channelName || booking.source || booking.agency || booking.channel || 'PRENOTATO').toUpperCase();
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

  const room = { name: roomName, id: roomId, octorateId: roomOctId, octorateRoomId: roomId };

  return bookings.find((b: any) => {
    const status = String(b.status || '').toLowerCase();
    if (status === 'cancelled' || status === 'canceled') return false;

    // 1. Normalizzazione Date (Anti-Fuso Orario Locale)
    const cellYear = cellDate.getFullYear();
    const cellMonth = String(cellDate.getMonth() + 1).padStart(2, '0');
    const cellDay = String(cellDate.getDate()).padStart(2, '0');
    const cellDateStr = `${cellYear}-${cellMonth}-${cellDay}`;

    const rawIn = String(b.checkin || b.check_in || b.checkIn || b.startDate || '');
    const rawOut = String(b.checkout || b.check_out || b.checkOut || b.endDate || '');
    if (!rawIn || !rawOut) return false;

    const inDateStr = rawIn.substring(0, 10);
    const outDateStr = rawOut.substring(0, 10);

    // Se la data della cella è fuori dal soggiorno, scarta subito
    if (cellDateStr < inDateStr || cellDateStr >= outDateStr) return false;

    // 2. Estrazione Sicura ID e Nomi
    const bProduct = String(b.product || '');
    const bPmsProduct = String(b.pmsProduct || '');
    const bRoomId = String(b.roomId || '');
    const bName = String(b.roomName || b.room_name || b.accommodation_name || '').toLowerCase().trim();

    const rOctorateId = String(room.octorateId || '');
    const rOctorateRoomId = String(room.octorateRoomId || '');
    const rId = String(room.id || '');
    const rName = String(room.name || '').toLowerCase().trim();

    const bIds = [bProduct, bPmsProduct, bRoomId].filter(x => x !== '' && x !== '0');
    const rIds = [rOctorateId, rOctorateRoomId, rId].filter(x => x !== '');

    // 3. METODO A: Match Diretto per ID
    const matchById = bIds.some(id => rIds.includes(id));

    // 4. METODO B: Match per Nome Universale (con Scudo Anti-Hijack)
    let matchByName = false;
    if (bName && rName && (bName.includes(rName) || rName.includes(bName))) {
      matchByName = true;
      if (rName === 'jungle villa' && (bName.includes('left') || bName.includes('right'))) {
        matchByName = false;
      }
    }

    // 5. METODO C: Mappa di Riferimento Infallibile
    const OCTORATE_MAP: Record<string, string[]> = {
      'Jungle Villa': ['529784', '529773'],
      'Jungle Villa Left': ['495807', '495795'],
      'Jungle Villa Right': ['495980', '495796'],
      'Peace & Love Villa': ['495566', '494840'],
      'Villa Penthouse': ['449348', '421511'],
      'Yellow Bungalow': ['449385', '293957'],
      'Red Bungalow': ['449422', '293954'],
      'Green Bungalow': ['449668', '293962'],
      'Camel Tent Bungalow': ['449675', '293965'],
      'Lagoon Tent Bungalow': ['449674', '293955'],
      'Room 1': ['449678', '293963'],
      'Room 2': ['449684', '293959'],
      'Room 3': ['449699', '293948'],
      'Room 4': ['449724', '293945'],
      'Room 5': ['449730', '293943'],
      'Lodge 1': ['449736', '293951'],
      'Lodge 2': ['923905', '883795'],
      'Internal Room': ['449742', '293942']
    };
    const validIds = OCTORATE_MAP[room.name.trim()] || [];
    const matchByMap = bIds.some(id => validIds.includes(id));

    // Se uno qualsiasi dei 3 metodi trova un match, la prenotazione si aggancia.
    return matchById || matchByName || matchByMap;
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
    const liveGrid = liveGridData || {};
    const liveData = (
      liveGrid[roomName] || 
      liveGrid[targetRoomName] || 
      liveGrid[targetOctId] || 
      liveGrid[targetRoomId]
    )?.[dateStr];

    // Il prezzo di fallback è solo per visualizzazione nella colonna nome camera.
    // NON viene usato per determinare apertura/chiusura.
    const websitePrice = liveData?.price ?? (ROOM_BASE_RATES[roomName] ?? 0);

    const isRoomClosedByStaff = isRoomAvailable === false;
    // Chiusura basata esclusivamente sui flag nativi Octorate: stopSell e availability
    // Il prezzo NON determina mai la disponibilità.
    const isClosedOrStopSell =
      isRoomClosedByStaff ||
      Boolean(liveData?.stopSell || liveData?.stopSells) ||
      (liveData !== undefined && Number(liveData?.availability) <= 0);
    // Se liveData è undefined (camera senza dati Octorate), è trattata come aperta nel gap-fill
    // (la chiusura reale viene da stopSells/availability=0 nel render della cella).

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

      const inDateStr = String(b.checkin || b.check_in || b.checkIn || '').slice(0, 10);
      const outDateStr = String(b.checkout || b.check_out || b.checkOut || '').slice(0, 10);

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
  const [loadingLive, setLoadingLive] = useState<boolean>(true);
  const [syncError, setSyncError] = useState<string | null>(null);
  // Traccia il range già scaricato nella cache (YYYY-MM-DD)
  const cachedRangeRef = useRef<{ from: string; to: string } | null>(null);

  console.log("=== DEBUG LIVE GRID ===");
  console.log("TIPO DI DATO:", Array.isArray(liveGridData) ? "Array" : typeof liveGridData);
  console.log("CHIAVI DISPONIBILI:", liveGridData ? Object.keys(liveGridData) : "Nessuna");

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

  // Over-fetch 90 giorni e caching locale: elimina spinner ad ogni scroll
  // force=true bypassa la cache (usato dal pulsante SYNC LIVE)
  const loadLiveGrid = async (force = false) => {
    if (datesArray.length === 0) return;

    // ─── Calcola il range visibile corrente (30 giorni o mese solare) ────────
    const viewFrom = datesArray[0];
    const viewTo = datesArray[datesArray.length - 1];
    const viewFromStr = `${viewFrom.getFullYear()}-${String(viewFrom.getMonth()+1).padStart(2,'0')}-${String(viewFrom.getDate()).padStart(2,'0')}`;
    const viewToStr   = `${viewTo.getFullYear()}-${String(viewTo.getMonth()+1).padStart(2,'0')}-${String(viewTo.getDate()).padStart(2,'0')}`;

    // ─── CACHE CHECK: se i dati sono già presenti e non forziamo il refresh ───
    // Controlla che liveGridData abbia chiavi E che il range visibile sia coperto dalla cache.
    if (!force && cachedRangeRef.current && Object.keys(liveGridData).length > 0) {
      const cache = cachedRangeRef.current;
      if (viewFromStr >= cache.from && viewToStr <= cache.to) {
        // Tutti i giorni visibili sono nella cache → rendering istantaneo, nessuno spinner
        console.log(`[Cache HIT] Range visibile ${viewFromStr}->${viewToStr} già in cache (${cache.from}->${cache.to}). Nessun fetch.`);
        return;
      }
    }

    // ─── FETCH CONGIUNTO: scarica 90 giorni per PREZZI E PRENOTAZIONI ────────
    // Over-fetching 90 giorni: coprire 3 mesi garantisce che scorrimenti successivi
    // trovino sia i prezzi sia le prenotazioni in cache senza ulteriori chiamate.
    const fetchStart = viewFrom;
    const fetchEnd   = new Date(fetchStart);
    fetchEnd.setDate(fetchEnd.getDate() + 89); // 90 giorni totali
    const dateFrom = `${fetchStart.getFullYear()}-${String(fetchStart.getMonth()+1).padStart(2,'0')}-${String(fetchStart.getDate()).padStart(2,'0')}`;
    const dateTo   = `${fetchEnd.getFullYear()}-${String(fetchEnd.getMonth()+1).padStart(2,'0')}-${String(fetchEnd.getDate()).padStart(2,'0')}`;

    setLoadingLive(true);
    setLiveGridData({});
    setSyncError(null);
    try {
      // Chiamata parallela congiunta per lo STESSO IDENTICO range a 90 giorni
      const [gridData] = await Promise.all([
        fetchOctorateMonthlyGrid(dateFrom, dateTo),
        fetchBookings(dateFrom, dateTo)
      ]);

      // 🛡️ FAILSAFE & CACHE PROTECTION: se i dati ricevuti sono vuoti o null, non sovrascrivere la cache
      if (!gridData || Object.keys(gridData).length === 0) {
        console.error("Il backend ha restituito un oggetto vuoto. Fetch fallito o dati Octorate non trovati.");
        setSyncError("Nessun dato ricevuto da Octorate.");
        setLoadingLive(false);
        return; // Ferma l'esecuzione, non sovrascrivere la cache con il vuoto
      }

      setLiveGridData(gridData);
      // Aggiorna il riferimento alla cache con il range effettivamente scaricato
      cachedRangeRef.current = { from: dateFrom, to: dateTo };
      console.log(`[Cache MISS] Scaricati 90 giorni per prezzi & prenotazioni: ${dateFrom} -> ${dateTo}. Cache aggiornata.`);
    } catch (err) {
      console.error('[ResortVisualCalendar] Live grid fetch FALLITO:', err);
      setSyncError('⚠️ Errore di sincronizzazione col Channel Manager. Riprova.');
    } finally {
      setLoadingLive(false);
    }
  };

  useEffect(() => {
    loadLiveGrid(); // Cache check interno: non fa fetch se i dati sono già presenti
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

  // Date Picker: salto diretto alla data scelta, senza sfasamenti TZ
  const handleDatePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value; // formato YYYY-MM-DD
    if (!val) return;
    const [y, m, d] = val.split('-').map(Number);
    const picked = new Date(y, m - 1, d); // costruzione locale, nessun TZ offset
    picked.setHours(0, 0, 0, 0);
    setStartDate(picked);
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

      {/* Banner errore sincronizzazione */}
      {syncError && (
        <div
          role="alert"
          className="flex items-center gap-3 bg-red-900/80 border border-red-600/60 text-red-100 text-sm font-semibold px-4 py-3 rounded-2xl shadow-lg animate-pulse"
        >
          <span className="text-base">⚠️</span>
          <span>{syncError}</span>
          <button
            type="button"
            onClick={() => { setSyncError(null); loadLiveGrid(); }}
            className="ml-auto px-3 py-1 bg-red-700 hover:bg-red-600 text-white text-xs font-black rounded-lg border border-red-500 cursor-pointer transition-colors"
          >
            Riprova
          </button>
        </div>
      )}

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
            <div className="flex flex-col sm:flex-row items-center gap-2 justify-between">
              {/* Riga 1: Prev / Range Label / Next */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrev30Days}
                  className="px-2.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-amber-400 font-bold text-xs rounded-xl border border-stone-800 cursor-pointer flex items-center gap-1"
                  title="30 Giorni Precedenti"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>30gg Prec</span>
                </button>

                <span className="font-extrabold text-xs text-white font-mono px-1">
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

              {/* Date Picker: salto a data custom */}
              <input
                id="calendar-start-date-picker"
                type="date"
                aria-label="Seleziona data di partenza griglia"
                value={`${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`}
                onChange={handleDatePickerChange}
                className="bg-gray-800 text-white border border-gray-600 rounded-lg px-2 py-1.5 text-xs outline-none cursor-pointer hover:bg-gray-700 focus:border-amber-500 transition-colors"
                title="Salta a una data specifica"
              />
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
            onClick={() => loadLiveGrid(true)}
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
        <div className="flex items-center gap-2.5 overflow-x-auto text-[10px] font-black text-stone-300 pt-1 sm:pt-0">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-sm" /> WEBSITE</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-gray-700 border border-stone-500 shadow-sm" /> PRIVATE</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-800 shadow-sm" /> BOOKING</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-purple-600 shadow-sm" /> Agoda</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-600 shadow-sm" /> Airbnb</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-600 shadow-sm" /> Expedia</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-700 shadow-sm" /> Stop Sell / Chiuso</span>
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
                const roomPriceBase = ROOM_BASE_RATES[room.name] || (room.basePrice && room.basePrice > 0 ? room.basePrice : 0);
                // isRoomBaseClosed ora si basa su room.isAvailable (dato gestionale), non sul prezzo
                const isRoomBaseClosed = room.isAvailable === false;

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
                      
                      // ⏳ SKELETON BARRIER: se il fetch è in corso o i dati non sono ancora arrivati,
                      // restituisce immediatamente una cella spinner senza valutare Priorità 1/2/3.
                      if (loadingLive || !liveGridData) {
                        return (
                          <td
                            key={idx}
                            className="min-w-[100px] w-[100px] border border-stone-700/40 bg-stone-800/30 p-1 text-center"
                          >
                            <div className="flex h-full w-full items-center justify-center py-1">
                              <div className="w-3.5 h-3.5 rounded-full border-2 border-stone-500 border-t-amber-400 animate-spin" />
                            </div>
                          </td>
                        );
                      }

                      // ESTRAZIONE DATI SICURA A DIZIONARIO (String Key Casting)
                      const { motherId, beId } = getIdsForRoom(room.name);

                      const motherData = liveGridData?.[String(motherId)]?.[dateStr];
                      const beData = liveGridData?.[String(beId)]?.[dateStr];

                      // Prezzi reali (mostra N/D se il dato non c'è)
                      const motherPriceVal = Number(motherData?.price || motherData?.value || motherData?.amount || 0);
                      const motherPriceStr = motherPriceVal >= 10000 
                        ? '10.000' 
                        : (motherPriceVal > 0 ? motherPriceVal.toLocaleString('it-IT') : 'N/D');

                      // Prezzo BE con Sconto 10% (arrotondato)
                      const beDiscountedPrice = beData?.price ? Math.round(beData.price * 0.9) : null;
                      const beDiscountedStr = beDiscountedPrice !== null 
                        ? (beDiscountedPrice >= 10000 ? '10.000' : beDiscountedPrice.toLocaleString('it-IT')) 
                        : 'N/D';

                      // Minimum stay letto dalla Tariffa Madre
                      const motherMinStayNum = Number(motherData?.minStay ?? motherData?.minstay ?? motherData?.minNights ?? motherData?.min_stay ?? gapFillMinStays[dateStr] ?? 0);

                      // 🥇 PRIORITÀ 1: Prenotazione (Controllo array "bookings")
                      const matchingBooking = findMatchingBooking(room.name, room.id, room.octorateId, cellDate, bookings);

                      // Calcolo Tariffa Reale Giornaliera Pagata dall'Ospite per le celle prenotate
                      let realDailyPriceStr = 'N/D';
                      if (matchingBooking) {
                        const checkInRaw = matchingBooking.check_in || (matchingBooking as any).checkIn || (matchingBooking as any).checkin;
                        const checkOutRaw = matchingBooking.check_out || (matchingBooking as any).checkOut || (matchingBooking as any).checkout;

                        let nights = 1;
                        if (checkInRaw && checkOutRaw) {
                          const cIn = new Date(String(checkInRaw).substring(0, 10));
                          const cOut = new Date(String(checkOutRaw).substring(0, 10));
                          const diffMs = cOut.getTime() - cIn.getTime();
                          if (diffMs > 0) {
                            nights = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));
                          }
                        }

                        const grossTotal = Number(
                          (matchingBooking as any).roomGross ||
                          (matchingBooking as any).totalGross ||
                          matchingBooking.total_price ||
                          (matchingBooking as any).totalPrice ||
                          (matchingBooking as any).totalAmount ||
                          (matchingBooking as any).totalPaid ||
                          matchingBooking.deposit_paid ||
                          0
                        );

                        if (grossTotal > 0) {
                          const dailyPrice = Math.round(grossTotal / nights);
                          realDailyPriceStr = dailyPrice >= 10000 ? '10.000' : dailyPrice.toLocaleString('it-IT');
                        }
                      }

                      // 🥈 PRIORITÀ 2: Chiusura — governata ESCLUSIVAMENTE dai flag Stop Sell e Availability di Octorate.
                      // Il prezzo NON è mai un indicatore di disponibilità.
                      const isClosedOrStopSell =
                        !motherData ||
                        motherData.stopSells === true ||
                        Number(motherData.availability) <= 0;

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
                          className={`py-1 px-0.5 border-l text-center transition-colors relative w-[100px] min-w-[64px] max-w-[100px] truncate overflow-hidden ${bgStyle}`}
                          title={matchingBooking 
                            ? `Prenotato: ${matchingBooking.guest_name || 'Ospite'} (${getBookingChannelName(matchingBooking)}) • Tariffa Reale: ${realDailyPriceStr !== 'N/D' ? `฿${realDailyPriceStr}/notte` : 'N/D'} • Madre: ${motherPriceStr !== 'N/D' ? `฿${motherPriceStr}` : 'N/D'} • BE: ${beDiscountedStr !== 'N/D' ? `฿${beDiscountedStr}` : 'N/D'}`
                            : `Madre: ${motherPriceStr !== 'N/D' ? `฿${motherPriceStr}` : 'N/D'} • BE: ${beDiscountedStr !== 'N/D' ? `฿${beDiscountedStr}` : 'N/D'} • MinStay: ${motherMinStayNum > 0 ? motherMinStayNum : '-'}`}
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
                            (() => {
                              // Override rigido OTA: label e colore sfondo
                              const _ch = String(
                                (matchingBooking as any).channelName ||
                                matchingBooking.source ||
                                (matchingBooking as any).agency ||
                                ''
                              ).toLowerCase();
                              let otaLabel = 'OTA';
                              let otaBg = 'bg-indigo-600';
                              if (_ch.includes('octoevo') || _ch.includes('autosubmit') || _ch.includes('private')) {
                                otaLabel = 'PRIVATE'; otaBg = 'bg-gray-700';
                              } else if (_ch.includes('stripe') || _ch.includes('direct') || _ch.includes('diretto') || _ch.includes('website') || _ch.includes('site') || _ch.includes('booking engine')) {
                                otaLabel = 'WEBSITE'; otaBg = 'bg-orange-500';
                              } else if (_ch.includes('booking')) {
                                otaLabel = 'BOOKING'; otaBg = 'bg-blue-800';
                              } else if (_ch.includes('agoda')) {
                                otaLabel = 'AGODA'; otaBg = 'bg-purple-600';
                              } else if (_ch.includes('airbnb')) {
                                otaLabel = 'AIRBNB'; otaBg = 'bg-rose-600';
                              } else if (_ch.includes('expedia')) {
                                otaLabel = 'EXPEDIA'; otaBg = 'bg-amber-600';
                              } else if (_ch.includes('trip')) {
                                otaLabel = 'TRIP'; otaBg = 'bg-teal-600';
                              }
                              return (
                                <div className={`flex flex-col items-center justify-center min-w-0 w-full h-full overflow-hidden rounded px-0.5 ${otaBg}`}>
                                  {/* Riga 1: Nome OTA blindato */}
                                  <div className="truncate text-xs font-black min-w-0 w-full text-center text-white uppercase tracking-wide">
                                    {otaLabel}
                                  </div>
                                  {/* Riga 2: Nome Ospite */}
                                  <div className="truncate text-[10px] min-w-0 w-full text-center text-white/95 font-medium">
                                    {matchingBooking.guest_name || (matchingBooking as any).guestName || 'Ospite'}
                                  </div>
                                  {/* Tariffa Reale Giornaliera Pagata dall'Ospite */}
                                  <div className="text-[10px] font-mono font-black text-white leading-tight mt-0.5 truncate min-w-0 w-full text-center">
                                    Pagato: {realDailyPriceStr !== 'N/D' ? `฿${realDailyPriceStr}` : 'N/D'}
                                  </div>
                                </div>
                              );
                            })()
                          ) : (
                            <div className="flex flex-col items-center justify-center min-w-0 w-full overflow-hidden">
                              {/* CENTRO: Prezzo Tariffa Madre */}
                              <div className="text-[9px] font-mono font-medium text-white/90 leading-tight truncate min-w-0 w-full text-center">
                                Madre: {motherPriceStr !== 'N/D' ? `฿${motherPriceStr}` : 'N/D'}
                              </div>

                              {/* BASSO (in grassetto): Prezzo Tariffa BE Scontata 10% */}
                              <div className="text-[11px] font-mono font-black text-white leading-tight mt-0.5 truncate min-w-0 w-full text-center">
                                BE: {beDiscountedStr !== 'N/D' ? `฿${beDiscountedStr}` : 'N/D'}
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
