import { useState, useEffect } from 'react';
import { useResortAdminStore, ResortBooking } from '../store/useResortAdminStore';
import { ACCOMMODATIONS } from '../../../booking/resort/config/accommodations';
import { fetchOctorateMonthlyGrid, OctorateDayData } from '../../../booking/lib/octorate';
import { getBaselineMinStay, getMotherRatePlanId, getCanonicalAccommodation } from '../lib/octorateAdmin';
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

export function formatGuestLastNameFirst(bookingInput: any): string {
  if (!bookingInput) return 'Ospite';

  if (typeof bookingInput === 'object') {
    const familyName = bookingInput.guest_last_name || bookingInput.guestLastName || bookingInput.familyName || bookingInput.last_name || bookingInput.lastName;
    const givenName = bookingInput.guest_first_name || bookingInput.guestFirstName || bookingInput.givenName || bookingInput.first_name || bookingInput.firstName;

    if (familyName && givenName) {
      return `${familyName} ${givenName}`.trim();
    }
  }

  const rawName = typeof bookingInput === 'string' 
    ? bookingInput 
    : (bookingInput.guest_name || bookingInput.guestName || bookingInput.customerName || bookingInput.name || '');

  if (!rawName || typeof rawName !== 'string') return 'Ospite';
  const trimmed = rawName.trim();
  if (!trimmed) return 'Ospite';

  if (trimmed.includes(',') || trimmed.includes('/')) return trimmed;

  const parts = trimmed.split(/\s+/);
  if (parts.length < 2) return trimmed;

  const lastName = parts[parts.length - 1];
  const firstNames = parts.slice(0, parts.length - 1).join(' ');

  return `${lastName} ${firstNames}`;
}

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
  'Lodge 2': 10000,
  'Fake Bungalow 1': 1000,
  'Fake Bungalow 2': 1000
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
  'Internal Room': { motherId: 293942, beId: 449742 },
  'Room 1': { motherId: 293963, beId: 449678 },
  'Room 2': { motherId: 293959, beId: 449684 },
  'Room 3': { motherId: 293948, beId: 449699 },
  'Room 4': { motherId: 293945, beId: 449724 },
  'Room 5': { motherId: 293943, beId: 449730 },
  'Lodge 1': { motherId: 293951, beId: 449736 },
  'Lodge 2': { motherId: 883795, beId: 923905 },
  'Fake Bungalow 1': { motherId: 649669, beId: 649669 },
  'Fake Bungalow 2': { motherId: 921799, beId: 921799 }
};

export function getIdsForRoom(roomName: string): { motherId: number; beId: number } {
  if (!roomName) return { motherId: 0, beId: 0 };
  const nameLower = roomName.trim().toLowerCase();

  const MAPPING: Record<string, { motherId: number; beId: number }> = {
    'jungle villa left': { motherId: 495795, beId: 495807 },
    'jungle villa right': { motherId: 495796, beId: 495980 },
    'jungle villa': { motherId: 529773, beId: 529784 },
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
    'internal room': { motherId: 293942, beId: 449742 },
    'room 1': { motherId: 293963, beId: 449678 },
    'room 2': { motherId: 293959, beId: 449684 },
    'room 3': { motherId: 293948, beId: 449699 },
    'room 4': { motherId: 293945, beId: 449724 },
    'room 5': { motherId: 293943, beId: 449730 },
    'lodge 1': { motherId: 293951, beId: 449736 },
    'lodge 2': { motherId: 883795, beId: 923905 },
    'fake bungalow 1': { motherId: 649669, beId: 649669 },
    'fake bungalow 2': { motherId: 921799, beId: 921799 }
  };

  if (MAPPING[nameLower]) {
    return MAPPING[nameLower];
  }

  for (const key in MAPPING) {
    if (nameLower.includes(key) || key.includes(nameLower)) {
      if (key === 'jungle villa' && (nameLower.includes('left') || nameLower.includes('right'))) {
        continue;
      }
      return MAPPING[key];
    }
  }

  return { motherId: 0, beId: 0 };
}

const AGENCY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'WEBSITE': { bg: 'bg-orange-500 hover:bg-orange-400', text: 'text-white font-black', border: 'border-orange-400' },
  'PRIVATE': { bg: 'bg-gray-700 hover:bg-gray-600', text: 'text-white font-extrabold', border: 'border-gray-600' },
  'BOOKING': { bg: 'bg-[#003580] hover:bg-[#00255c]', text: 'text-white font-extrabold', border: 'border-[#003580]' },
  'Booking.com': { bg: 'bg-[#003580] hover:bg-[#00255c]', text: 'text-white font-extrabold', border: 'border-[#003580]' },
  'Agoda': { bg: 'bg-purple-600 hover:bg-purple-500', text: 'text-white font-extrabold', border: 'border-purple-500' },
  'Airbnb': { bg: 'bg-rose-600 hover:bg-rose-500', text: 'text-white font-extrabold', border: 'border-rose-500' },
  'Expedia': { bg: 'bg-sky-500 hover:bg-sky-400', text: 'text-white font-extrabold', border: 'border-sky-400' },
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
  if (s.includes('booking') || s.includes('boochin')) {
    return { bg: 'bg-[#003580] hover:bg-[#00255c]', text: 'text-white font-extrabold', border: 'border-[#003580]' };
  }
  if (s.includes('expedia')) {
    return { bg: 'bg-sky-500 hover:bg-sky-400', text: 'text-white font-extrabold', border: 'border-sky-400' };
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
  if (src.includes('booking') || src.includes('boochin')) {
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
    ids: ['529773', '529784', '529778', '529779', '529792', '529788', '529780', '916817', '529781', '529801', '921868', '921869', '529783', '529813'],
    keywords: [["jungle","jv"],["villa","ac"]]
  },
  'jungle villa left': {
    ids: ['495795', '495807', '495803', '495804', '496009', '496001', '495805', '496022', '495806', '496031', '921870', '921871', '495810', '496057'],
    keywords: [["jungle","jv"],["left","jvl"]]
  },
  'jungle villa right': {
    ids: ['495796', '495980', '495976', '495977', '496010', '496002', '495978', '496021', '495979', '496030', '921872', '921873', '495982', '496056'],
    keywords: [["jungle","jv"],["right","jvr"]]
  },
  'peace & love villa': {
    ids: ['494840', '495566', '495549', '495551', '495580', '495575', '495552', '495587', '495565', '495593', '921874', '921875', '495569', '495609'],
    keywords: [["peace","love","p&l"]]
  },
  'villa penthouse': {
    ids: ['421511', '449348', '422445', '421513', '421516', '421520', '421522', '421525', '421527', '421530', '921876', '921877', '421532', '421533'],
    keywords: [["penthouse","pent"]]
  },
  'yellow bungalow': {
    ids: ['293957', '449385', '422422', '293958', '332055', '332054', '331921', '332057', '331922', '332060', '921878', '921879', '297022', '340198'],
    keywords: [["yellow"]]
  },
  'red bungalow': {
    ids: ['293954', '449422', '422131', '293953', '332030', '332029', '330964', '332035', '330970', '332036', '921880', '921881', '297021', '340196'],
    keywords: [["red"]]
  },
  'green bungalow': {
    ids: ['293962', '449668', '422402', '293961', '332070', '332066', '331923', '332072', '331924', '332074', '921882', '921883', '297023', '340200'],
    keywords: [["green"]]
  },
  'camel tent bungalow': {
    ids: ['293965', '449675', '422325', '293966', '332089', '332084', '297025'],
    keywords: [["camel"]]
  },
  'lagoon tent bungalow': {
    ids: ['293955', '449674', '422351', '293956', '332081', '332077', '297024'],
    keywords: [["lagoon"]]
  },
  'room 1': {
    ids: ['293963', '449678', '422300', '293964', '332737', '332735', '331976', '916818', '331977', '916402', '921889', '921890', '297033', '421505'],
    keywords: [["room","hub"],["1","one"]]
  },
  'room 2': {
    ids: ['293959', '449684', '422296', '293960', '332741', '332739', '331966', '332119', '331967', '332134', '921891', '921900', '297032', '421506'],
    keywords: [["room","hub"],["2","two"]]
  },
  'room 3': {
    ids: ['293948', '449699', '422293', '293947', '332743', '332757', '331968', '332121', '331969', '332136', '921892', '921893', '297028', '421507'],
    keywords: [["room","hub"],["3","three"]]
  },
  'room 4': {
    ids: ['293945', '449724', '422265', '293946', '332759', '332746', '331970', '332123', '331971', '332138', '921894', '921895', '297029', '421508'],
    keywords: [["room","hub"],["4","four"]]
  },
  'room 5': {
    ids: ['293943', '449730', '422213', '293944', '332765', '332763', '331972', '332125', '331973', '332140', '921896', '921897', '297031', '421509'],
    keywords: [["room","hub"],["5","five"]]
  },
  'lodge 1': {
    ids: ['293951', '449736', '422149', '293952', '332769', '332767', '331974', '332129', '422157', '332142', '921884', '921885', '297030', '421510'],
    keywords: [["lodge"],["1","one"]]
  },
  'lodge 2': {
    ids: ['883795', '923905', '916110', '916108', '916107', '916109', '916114', '916829', '916105', '916830', '921886', '921887', '916103', '916104'],
    keywords: [["lodge"],["2","two"]]
  },
  'internal room': {
    ids: ['293942', '449742', '872182', '293941', '332109', '332105', '340367', '916840', '421998', '916838', '921898', '921899', '297027', '422147'],
    keywords: [["internal","inter"]]
  },
  'fake bungalow 1': {
    ids: ['649669', '932243', '932244', '932245', '932246', '932247', '932248', '932249', '932250', '932251', '932252', '932253', '932254', '932255'],
    keywords: [["fake"],["1","one"]]
  },
  'fake bungalow 2': {
    ids: ['921799', '932256', '932257', '932258', '932259', '932260', '932261', '932262', '932263', '932264', '932265', '932266', '932267', '932268'],
    keywords: [["fake"],["2","two"]]
  }
};

function toThailandDateStr(raw: any): string {
  if (!raw) return '';
  const s = String(raw).trim();
  if (!s) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const d = new Date(s);
  if (isNaN(d.getTime())) return s.slice(0, 10);
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(d);
  } catch (e) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}

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

    if (bProduct) {
      if (bProduct === targetRoomIdStr || bProduct === targetOctIdStr) {
        isRoomMatch = true;
      } else if (mapEntry && mapEntry.ids.includes(bProduct)) {
        isRoomMatch = true;
      }
    }

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

    const rawCheckIn = String(b.checkin || b.check_in || b.checkIn || b.start_date || b.startDate || '');
    const rawCheckOut = String(b.checkout || b.check_out || b.checkOut || b.end_date || b.endDate || '');

    const checkInStr = toThailandDateStr(rawCheckIn);
    const checkOutStr = toThailandDateStr(rawCheckOut);

    if (!checkInStr || !checkOutStr) return false;

    return targetDateStr >= checkInStr && targetDateStr < checkOutStr;
  }) || null;
}

export interface MinStayCellInfo {
  minStay: number;
  isGapFill: boolean;
  isSimulated: boolean;
}

function computeGapFillMinStays(
  roomName: string,
  roomId: string,
  roomOctorateId: string,
  isRoomAvailable: boolean,
  datesArray: Date[],
  liveGridData: Record<string, Record<string, OctorateDayData>>,
  bookings: ResortBooking[],
  dynamicGapFillEnabled: boolean
): Record<string, MinStayCellInfo> {
  const result: Record<string, MinStayCellInfo> = {};
  if (!datesArray || datesArray.length === 0) return result;

  const targetRoomName = roomName.toLowerCase();
  const targetRoomId = String(roomId);
  const targetOctId = String(roomOctorateId || '');

  const dailyStates = datesArray.map((cellDate) => {
    const dateStr = toThailandDateStr(cellDate);
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
      const status = String(b.status || '').toLowerCase();
      if (status === 'cancelled' || status === 'canceled') return false;

      const canonical = getCanonicalAccommodation(b);
      const bAccName = String(b.accommodation_name || b.roomName || b.room_name || '').toLowerCase();
      const bAccId = String(b.accommodation_id || b.roomId || b.octorateRoomId || b.octorateId || '');

      const isRoomMatch = canonical
        ? (canonical.key === targetRoomName || canonical.name.toLowerCase() === targetRoomName)
        : (
            (bAccName.length > 0 && (bAccName.includes(targetRoomName) || targetRoomName.includes(bAccName))) ||
            (bAccId.length > 0 && (
              bAccId === targetRoomId || 
              (targetOctId.length > 0 && bAccId === targetOctId) || 
              (targetRoomId.length > 0 && Number(bAccId) === Number(targetRoomId)) ||
              (targetOctId.length > 0 && Number(bAccId) === Number(targetOctId))
            ))
          );

      if (!isRoomMatch) return false;

      const inDateStr = toThailandDateStr(b.check_in || b.checkIn || b.checkin || b.start_date);
      const outDateStr = toThailandDateStr(b.check_out || b.checkOut || b.checkout || b.end_date);

      return dateStr >= inDateStr && dateStr < outDateStr;
    });

    const isFree = !isClosedOrStopSell && !hasBooking;
    const standardMinStay = getBaselineMinStay(dateStr);

    return { dateStr, isFree, standardMinStay };
  });

  let i = 0;
  while (i < dailyStates.length) {
    if (!dailyStates[i].isFree) {
      result[dailyStates[i].dateStr] = { 
        minStay: dailyStates[i].standardMinStay, 
        isGapFill: false, 
        isSimulated: false
      };
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
        result[s.dateStr] = {
          minStay: gapNights,
          isGapFill: true,
          isSimulated: !dynamicGapFillEnabled
        };
      } else {
        result[s.dateStr] = { 
          minStay: s.standardMinStay, 
          isGapFill: false, 
          isSimulated: false
        };
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
    setDynamicMinStayGapFill,
    dynamicMinStayUpdates
  } = useResortAdminStore();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewMode, setViewMode] = useState<'today_30_days' | 'full_month'>('today_30_days');
  const [startDate, setStartDate] = useState<Date>(new Date());
  
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [selectedBooking, setSelectedBooking] = useState<ResortBooking | null>(null);
  const [liveGridData, setLiveGridData] = useState<Record<string, Record<string, OctorateDayData>>>({});
  const [loadingLive, setLoadingLive] = useState<boolean>(false);

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

  const loadLiveGrid = async () => {
    if (datesArray.length === 0) return;
    setLoadingLive(true);
    try {
      const firstDate = datesArray[0];
      const lastDate = datesArray[datesArray.length - 1];

      const dateFrom = toThailandDateStr(firstDate);
      const dateTo = toThailandDateStr(lastDate);

      const [gridData, bookingsRes] = await Promise.all([
        fetchOctorateMonthlyGrid(dateFrom, dateTo),
        fetch(`/api/resort/octorate-bookings?dateFrom=${dateFrom}&dateTo=${dateTo}`)
      ]);

      setLiveGridData(gridData || {});

      if (bookingsRes.ok) {
        const bookingsJson = await bookingsRes.json();
        if (bookingsJson.data && Array.isArray(bookingsJson.data)) {
          useResortAdminStore.getState().setBookings(bookingsJson.data);
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

  const startDateISO = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`;

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val) {
      const [y, m, d] = val.split('-').map(Number);
      if (y && m && d) {
        const newDate = new Date(y, m - 1, d, 0, 0, 0, 0);
        setStartDate(newDate);
      }
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
            <div className="flex items-center gap-2 justify-between flex-wrap">
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

              {/* Menu a tendina seleziona data di partenza */}
              <div className="flex items-center gap-1.5 bg-stone-900 px-2.5 py-1 rounded-xl border border-amber-500/40 text-xs font-bold text-amber-400 hover:border-amber-400 transition-colors shadow-sm">
                <span className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider hidden sm:inline">Vai a:</span>
                <input
                  type="date"
                  value={startDateISO}
                  onChange={handleStartDateChange}
                  className="bg-transparent text-amber-400 font-mono font-bold text-xs focus:outline-none cursor-pointer [color-scheme:dark]"
                  title="Scegli la data di partenza del calendario"
                />
              </div>
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
            { id: 'All', label: `Tutti gli Alloggi (${(accommodations || []).length || 20})` },
            { id: 'VILLE', label: '🏡 Ville (4)' },
            { id: 'BUNGALOW', label: `🛖 Bungalow (${(accommodations || []).filter(r => r.category === 'BUNGALOW').length || 5})` },
            { id: 'TENDE GLAMPING', label: '⛺ Glamping (2)' },
            { id: 'THE HUB GUESTHOUSE', label: '🏨 Hub Guesthouse (9)' },
            { id: 'TEST', label: '🧪 Ambiente di Test (2)' }
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
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#003580] shadow-sm" /> BOOKING</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-purple-600 shadow-sm" /> Agoda</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-600 shadow-sm" /> Airbnb</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-sky-500 shadow-sm" /> Expedia</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-700 shadow-sm" /> Stop Sell / Chiuso</span>
        </div>

        {/* MinStay Color Legend */}
        <div className="flex items-center gap-3 flex-wrap text-[10px] font-black text-stone-300 pt-1 sm:pt-0 border-t sm:border-t-0 sm:border-l border-stone-800 pl-0 sm:pl-3">
          <span className="text-stone-400 font-bold uppercase tracking-wider">Legenda Soggiorno Minimo:</span>
          <span className="flex items-center">
            <span className="bg-yellow-400 w-4 h-4 rounded-full inline-block align-middle mr-1 shadow-sm" />
            Standard
          </span>
          <span className="flex items-center">
            <span className="bg-red-500 animate-pulse w-4 h-4 rounded-full inline-block align-middle mr-1 shadow-sm" />
            Simulazione
          </span>
          <span className="flex items-center">
            <span className="bg-green-800 w-4 h-4 rounded-full inline-block align-middle mr-1 shadow-sm border border-green-500/50" />
            Sincronizzato
          </span>
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
                      const dateStr = toThailandDateStr(cellDate);
                      
                      // ESTRAZIONE DATI SICURA A DIZIONARIO (String Key Casting)
                      const { motherId, beId } = getIdsForRoom(room.name);

                      const motherData = liveGridData?.[String(motherId)]?.[dateStr];
                      const beData = liveGridData?.[String(beId)]?.[dateStr];

                      // Prezzi reali (mostra N/D se il dato non c'è)
                      const motherPriceVal = Number(motherData?.price || motherData?.value || motherData?.amount || 0);
                      const motherPriceStr = motherPriceVal >= 10000 
                        ? '10.000' 
                        : (motherPriceVal > 0 ? motherPriceVal.toLocaleString('it-IT') : 'N/D');
                      const beDiscountedPrice = beData?.price ? Math.round(beData.price * 0.9) : null;
                      const beDiscountedStr = beDiscountedPrice !== null 
                        ? (beDiscountedPrice >= 10000 ? '10.000' : beDiscountedPrice.toLocaleString('it-IT')) 
                        : 'N/D';

                      // TABULA RASA: Baseline stagionale pura calcolata esclusivamente in base alle date
                      const expectedBaseline = getBaselineMinStay(dateStr);

                      // 🔍 1. RICERCA CORRISPONDENZA NELL'ARRAY dynamicMinStayUpdates DELLO STORE ZUSTAND
                      const storeUpdateMatch = (dynamicMinStayUpdates || []).find((u: any) => {
                        const matchRoom = 
                          String(u.roomTypeId) === String(motherId) ||
                          String(u.roomTypeId) === String(beId) ||
                          String(u.roomTypeId) === String(room.id) ||
                          String(u.roomTypeId) === String(room.octorateId) ||
                          (u.accommodationName && u.accommodationName.toLowerCase() === room.name.toLowerCase()) ||
                          (u.roomId && String(u.roomId) === String(room.id));

                        if (!matchRoom) return false;

                        const fromDate = u.dateFrom || u.date || u.from_date || u.startDate;
                        const toDate = u.dateTo || u.to_date || u.endDate;

                        if (fromDate && toDate) {
                          return dateStr >= fromDate && dateStr < toDate;
                        } else if (fromDate) {
                          return dateStr === fromDate;
                        }
                        return false;
                      });

                      // 🔍 2. RICERCA COMPLEMENTARE IN MEMORIA (computeGapFillMinStays)
                      const gapFillCellInfo = gapFillMinStays[dateStr];

                      let motherMinStayNum = expectedBaseline;
                      let isGapFillModified = false;
                      let isSimulatedMode = false;

                      if (storeUpdateMatch) {
                        // 🔴/🟢 PRIORITÀ 1: Match in dynamicMinStayUpdates (Generato dal pulsante "Esegui Calcolo Gap-Fill")
                        motherMinStayNum = Number(storeUpdateMatch.minStay ?? storeUpdateMatch.min_stay ?? expectedBaseline);
                        isGapFillModified = true;
                        isSimulatedMode = storeUpdateMatch.isSimulated !== false;
                      } else if (gapFillCellInfo && (typeof gapFillCellInfo === 'object' ? gapFillCellInfo?.isGapFill : false)) {
                        // 🔴/🟢 PRIORITÀ 2: Match in memoria per bucatura sulle date visibili
                        motherMinStayNum = Number(typeof gapFillCellInfo === 'object' ? gapFillCellInfo?.minStay : expectedBaseline);
                        isGapFillModified = true;
                        isSimulatedMode = !dynamicMinStayGapFill;
                      } else {
                        // 🟡 PRIORITÀ 3: Baseline stagionale pura standard (TABULA RASA su Octorate) -> Cerchio Giallo
                        motherMinStayNum = expectedBaseline;
                        isGapFillModified = false;
                        isSimulatedMode = false;
                      }

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

                      const isRoomClosedByStaff = room.isAvailable === false;
                      const rawMotherStopSell = motherData
                        ? (Boolean(motherData.stopSell || motherData.stopSells) || motherData.available === false || (motherData.availability !== undefined && motherData.availability <= 0) || motherData.price >= 10000)
                        : false;
                      const isClosedOrStopSell = isRoomClosedByStaff || rawMotherStopSell;

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
                            ? `Prenotato: ${formatGuestLastNameFirst(matchingBooking.guest_name || (matchingBooking as any).guestName)} (${getBookingChannelName(matchingBooking)}) • Tariffa Reale: ${realDailyPriceStr !== 'N/D' ? `฿${realDailyPriceStr}/notte` : 'N/D'} • Madre: ${motherPriceStr !== 'N/D' ? `฿${motherPriceStr}` : 'N/D'} • BE: ${beDiscountedStr !== 'N/D' ? `฿${beDiscountedStr}` : 'N/D'}`
                            : `Madre: ${motherPriceStr !== 'N/D' ? `฿${motherPriceStr}` : 'N/D'} • BE: ${beDiscountedStr !== 'N/D' ? `฿${beDiscountedStr}` : 'N/D'} • MinStay: ${motherMinStayNum > 0 ? motherMinStayNum : '-'}`}
                        >
                          {/* BADGE MINSTAY (Rosso = Simulazione DRY_RUN, Verde Scuro = Sincronizzato PRODUZIONE, Giallo = Standard Baseline) */}
                          {motherMinStayNum > 0 && (
                            <div 
                              className={`absolute top-0.5 right-0.5 z-10 font-bold text-[9.5px] rounded-full shadow-md flex items-center justify-center ${
                                isGapFillModified
                                  ? (isSimulatedMode
                                      ? 'bg-red-500 text-white w-5 h-5 border border-red-300 shadow-red-900/50 animate-pulse'
                                      : 'bg-green-800 text-white w-5 h-5 border border-green-400 shadow-green-950/50')
                                  : 'bg-yellow-400 text-black w-4 h-4'
                              }`}
                              title={
                                isGapFillModified
                                  ? (isSimulatedMode
                                      ? `⚡ Soggiorno Minimo Dinamico (Simulazione Dry-Run: ${motherMinStayNum} notti)`
                                      : `✅ Soggiorno Minimo Dinamico (Sincronizzato su Octorate PMS: ${motherMinStayNum} notti)`)
                                  : `Soggiorno Minimo Stagionale Standard: ${motherMinStayNum} notti`
                              }
                            >
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
                              {/* Riga 2: Cognome poi Nome Ospite */}
                              <div className="truncate text-[10px] min-w-0 w-full text-center text-white/95 font-medium">
                                {formatGuestLastNameFirst(matchingBooking.guest_name || (matchingBooking as any).guestName)}
                              </div>
                              {/* Tariffa Reale Giornaliera Pagata dall'Ospite */}
                              <div className="text-[10px] font-mono font-black text-white leading-tight mt-0.5 truncate min-w-0 w-full text-center">
                                Pagato: {realDailyPriceStr !== 'N/D' ? `฿${realDailyPriceStr}` : 'N/D'}
                              </div>
                            </div>
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-amber-400" />
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
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Ospite (Cognome Nome):</span>
                <div className="font-extrabold text-white text-sm flex items-center gap-2">
                  <User className="w-4 h-4 text-amber-400" />
                  <span>{formatGuestLastNameFirst(selectedBooking.guest_name || (selectedBooking as any).guestName)}</span>
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
