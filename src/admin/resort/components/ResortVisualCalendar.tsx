import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useResortAdminStore, ResortBooking } from '../store/useResortAdminStore';
import { ACCOMMODATIONS } from '../../../booking/resort/config/accommodations';
import { fetchOctorateMonthlyGrid, OctorateDayData } from '../../../booking/lib/octorate';
import { getBaselineMinStay, getMotherRatePlanId, getCanonicalAccommodation, getSeasonalEndDateStr } from '../lib/octorateAdmin';
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
  'Fake Bungalow 1': { motherId: 649669, beId: 932244 },
  'Fake Bungalow 2': { motherId: 921799, beId: 932257 }
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
    'fake bungalow 1': { motherId: 649669, beId: 932244 },
    'fake bungalow 2': { motherId: 921799, beId: 932257 }
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
    ids: ['529773', '529784', '529778', '529792', '529788', '529780', '916817', '529781', '529801', '921868', '921869', '529783', '529813'],
    keywords: [["jungle","jv"],["villa","ac"]]
  },
  'jungle villa left': {
    ids: ['495795', '495807', '495804', '496009', '496001', '495805', '496022', '495806', '496031', '921870', '921871', '495810', '496057'],
    keywords: [["jungle","jv"],["left","jvl"]]
  },
  'jungle villa right': {
    ids: ['495796', '495980', '495977', '496010', '496002', '495978', '496021', '495979', '496030', '921872', '921873', '495982', '496056'],
    keywords: [["jungle","jv"],["right","jvr"]]
  },
  'peace & love villa': {
    ids: ['494840', '495566', '495551', '495580', '495575', '495552', '495587', '495565', '495593', '921874', '921875', '495569', '495609'],
    keywords: [["peace","love","p&l"]]
  },
  'villa penthouse': {
    ids: ['421511', '449348', '421513', '421516', '421520', '421522', '421525', '421527', '421530', '921876', '921877', '421532', '421533'],
    keywords: [["penthouse","pent"]]
  },
  'yellow bungalow': {
    ids: ['293957', '449385', '293958', '332055', '332054', '331921', '332057', '331922', '332060', '921878', '921879', '297022', '340198'],
    keywords: [["yellow"]]
  },
  'red bungalow': {
    ids: ['293954', '449422', '293953', '332030', '332029', '330964', '332035', '330970', '332036', '921880', '921881', '297021', '340196'],
    keywords: [["red"]]
  },
  'green bungalow': {
    ids: ['293962', '449668', '293961', '332070', '332066', '331923', '332072', '331924', '332074', '921882', '921883', '297023', '340200'],
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
    ids: ['293963', '449678', '422300', '332737', '332735', '331976', '916818', '331977', '916402', '921889', '921890', '297033', '421505'],
    keywords: [["room","hub"],["1","one"]]
  },
  'room 2': {
    ids: ['293959', '449684', '422296', '332741', '332739', '331966', '332119', '331967', '332134', '921891', '921900', '297032', '421506'],
    keywords: [["room","hub"],["2","two"]]
  },
  'room 3': {
    ids: ['293948', '449699', '422293', '332743', '332757', '331968', '332121', '331969', '332136', '921892', '921893', '297028', '421507'],
    keywords: [["room","hub"],["3","three"]]
  },
  'room 4': {
    ids: ['293945', '449724', '422265', '332759', '332746', '331970', '332123', '331971', '332138', '921894', '921895', '297029', '421508'],
    keywords: [["room","hub"],["4","four"]]
  },
  'room 5': {
    ids: ['293943', '449730', '422213', '332765', '332763', '331972', '332125', '331973', '332140', '921896', '921897', '297031', '421509'],
    keywords: [["room","hub"],["5","five"]]
  },
  'lodge 1': {
    ids: ['293951', '449736', '422149', '332769', '332767', '331974', '332129', '422157', '332142', '921884', '921885', '297030', '421510'],
    keywords: [["lodge"],["1","one"]]
  },
  'lodge 2': {
    ids: ['883795', '923905', '916108', '916107', '916109', '916114', '916829', '916105', '916830', '921886', '921887', '916103', '916104'],
    keywords: [["lodge"],["2","two"]]
  },
  'internal room': {
    ids: ['293942', '449742', '293941', '332109', '332105', '340367', '916840', '421998', '916838', '921898', '921899', '297027', '422147'],
    keywords: [["internal","inter"]]
  },
  'fake bungalow 1': {
    ids: ['649669', '932243', '932244', '932246', '932247', '932248', '932249', '932250', '932251', '932252', '932253', '932254', '932255'],
    keywords: [["fake"],["1","one"]]
  },
  'fake bungalow 2': {
    ids: ['921799', '932256', '932257', '932259', '932260', '932261', '932262', '932263', '932264', '932265', '932266', '932267', '932268'],
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

    // Calcola il soggiorno minimo stagionale più alto (maxBaselineInGap) tra tutti i giorni del buco
    let maxBaselineInGap = 0;
    for (let k = gapStart; k <= gapEnd; k++) {
      if (dailyStates[k].standardMinStay > maxBaselineInGap) {
        maxBaselineInGap = dailyStates[k].standardMinStay;
      }
    }

    for (let k = gapStart; k <= gapEnd; k++) {
      const s = dailyStates[k];
      if (gapNights < maxBaselineInGap && gapNights > 0) {
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

function checkIsClosed(item: any): boolean {
  if (!item) return true;
  
  if (Array.isArray(item.days) && item.days.length > 0) {
    const day = item.days[0];
    if (day) {
      const dayStopSell = day.stopSells !== undefined ? day.stopSells : (day.stopSell !== undefined ? day.stopSell : day.closed);
      if (dayStopSell === true || dayStopSell === 'true' || dayStopSell === 1 || dayStopSell === '1') {
        return true;
      }
      if (day.available === false || day.bookable === false) {
        return true;
      }
    }
  }

  const rawStopSell = item.stopSells !== undefined ? item.stopSells : (item.stopSell !== undefined ? item.stopSell : item.closed);
  if (rawStopSell === true || rawStopSell === 'true' || rawStopSell === 1 || rawStopSell === '1') {
    return true;
  }
  
  if (item.available === false || item.available === 'false' || item.isClosed === true || item.isClosed === 'true') {
    return true;
  }

  return false;
}
function computeDerivedRateIndicators(
  roomName: string,
  dateStr: string,
  liveGridData: Record<string, Record<string, OctorateDayData>>,
  activeGridItems: any[]
): { isBnbActive: boolean; isAgodaAcActive: boolean; isStandard7dActive: boolean } {
  const roomNameLower = (roomName || '').toLowerCase().trim();
  const roomEntry = ALL_ACCOMMODATIONS_MAP[roomNameLower];
  const mappedIds = new Set<string>();

  if (roomEntry && Array.isArray(roomEntry.ids)) {
    roomEntry.ids.forEach(id => mappedIds.add(id.toString()));
  }

  const { motherId, beId } = getIdsForRoom(roomName);
  if (motherId) mappedIds.add(motherId.toString());
  if (beId) mappedIds.add(beId.toString());

  let bnbDay: any = null;
  let agodaDay: any = null;
  let standard7dDay: any = null;

  if (liveGridData) {
    for (const rId of mappedIds) {
      const dayData = liveGridData[rId]?.[dateStr];
      if (dayData) {
        const rateName = String(dayData.name || dayData.title || dayData.ratePlanName || '').toLowerCase();

        if (rateName.includes('main bnb-7d') || rateName.includes('main bnb-14d') || rateName.includes('main bnb') || rateName.includes('bnb')) {
          if (!bnbDay) bnbDay = dayData;
        } else if (rateName.includes('agd ac-7d') || rateName.includes('agd ac-14d')) {
          if (!agodaDay) agodaDay = dayData;
        } else if (rateName.includes('7d') && !rateName.includes('ac') && !rateName.includes('agd') && !rateName.includes('agoda') && !rateName.includes('bnb')) {
          if (!standard7dDay) standard7dDay = dayData;
        }
      }
    }
  }

  if (Array.isArray(activeGridItems) && activeGridItems.length > 0) {
    activeGridItems.forEach((item: any) => {
      const itemDate = toThailandDateStr(item.date || item.dateStr || item.day);
      if (itemDate !== dateStr) return;

      const itemIdStr = item.id !== undefined ? item.id.toString() : (item.ratePlanId !== undefined ? item.ratePlanId.toString() : '');
      const itemRoomName = String(item.accommodationName || item.roomName || item.room || '').toLowerCase().trim();

      const isMatch = (itemIdStr && mappedIds.has(itemIdStr)) || (itemRoomName && (itemRoomName.includes(roomNameLower) || roomNameLower.includes(itemRoomName)));
      if (!isMatch) return;

      const rateName = String(item.name || item.ratePlanName || item.title || '').toLowerCase();

      if (rateName.includes('main bnb-7d') || rateName.includes('main bnb-14d') || rateName.includes('main bnb') || rateName.includes('bnb')) {
        if (!bnbDay) bnbDay = item;
      } else if (rateName.includes('agd ac-7d') || rateName.includes('agd ac-14d')) {
        if (!agodaDay) agodaDay = item;
      } else if (rateName.includes('7d') && !rateName.includes('ac') && !rateName.includes('agd') && !rateName.includes('agoda') && !rateName.includes('bnb')) {
        if (!standard7dDay) standard7dDay = item;
      }
    });
  }

  const isBnbActive = bnbDay ? !checkIsClosed(bnbDay) : false;
  const isAgodaAcActive = agodaDay ? !checkIsClosed(agodaDay) : false;

  let isStandard7dActive = false;
  if (standard7dDay) {
    isStandard7dActive = !checkIsClosed(standard7dDay);
  } else {
    const beData = liveGridData?.[beId.toString()]?.[dateStr];
    if (beData) {
      isStandard7dActive = !checkIsClosed(beData);
    }
  }

  return { isBnbActive, isAgodaAcActive, isStandard7dActive };
}

// STEP 2: SCUDO ANTI-LAG - COMPONENTE CELLA MEMOIZZATO CON REACT.MEMO
interface CalendarCellProps {
  cellDate: Date;
  dateStr: string;
  roomName: string;
  roomId: string;
  roomOctorateId: string;
  roomIsAvailable: boolean;
  motherData?: OctorateDayData;
  beData?: OctorateDayData;
  expectedBaseline: number;
  gapFillCellInfo?: MinStayCellInfo | null;
  storeUpdateMatch?: any;
  simulatedMatch?: any;
  matchingBooking: ResortBooking | null;
  isDynamicCalculationEnabled: boolean;
  dynamicGapFillEnabled: boolean;
  isSimulationActive: boolean;
  isBnbActive?: boolean;
  isAgodaAcActive?: boolean;
  isStandard7dActive?: boolean;
  onSelectBooking: (booking: ResortBooking) => void;
}

const CalendarCell = React.memo(function CalendarCell({
  cellDate,
  dateStr,
  roomName,
  roomId,
  roomOctorateId,
  roomIsAvailable,
  motherData,
  beData,
  expectedBaseline,
  gapFillCellInfo,
  storeUpdateMatch,
  simulatedMatch,
  matchingBooking,
  isDynamicCalculationEnabled,
  dynamicGapFillEnabled,
  isSimulationActive,
  isBnbActive = false,
  isAgodaAcActive = false,
  isStandard7dActive = false,
  onSelectBooking
}: CalendarCellProps) {
  let originalPrice = Number(motherData?.price || motherData?.value || motherData?.amount || 0);
  if (originalPrice === 0 && simulatedMatch?.originalPrice) {
    originalPrice = Number(simulatedMatch.originalPrice);
  }
  if (originalPrice === 0 && simulatedMatch?.basePrice) {
    originalPrice = Number(simulatedMatch.basePrice);
  }

  const origPriceStr = originalPrice >= 10000 
    ? '10.000' 
    : (originalPrice > 0 ? originalPrice.toLocaleString('it-IT') : 'N/D');

  let currentPrice = originalPrice;
  let motherPriceStr = originalPrice >= 10000 
    ? '10.000' 
    : (originalPrice > 0 ? originalPrice.toLocaleString('it-IT') : 'N/D');

  let beDiscountedPrice = beData?.price 
    ? Math.round(beData.price * 0.9) 
    : (originalPrice > 0 ? Math.round(originalPrice * 0.9) : null);
  let beDiscountedStr = beDiscountedPrice !== null 
    ? (beDiscountedPrice >= 10000 ? '10.000' : beDiscountedPrice.toLocaleString('it-IT')) 
    : 'N/D';

  if (simulatedMatch) {
    const simVal = Number(simulatedMatch.finalPrice || simulatedMatch.price || 0);
    if (simVal > 0) {
      currentPrice = simVal;
      motherPriceStr = simVal >= 10000 ? '10.000' : simVal.toLocaleString('it-IT');
      beDiscountedPrice = Math.round(simVal * 0.9);
      beDiscountedStr = beDiscountedPrice >= 10000 ? '10.000' : beDiscountedPrice.toLocaleString('it-IT');
    }
  }

  const hasSimulatedDiscount = Boolean(
    isSimulationActive && 
    (
      (simulatedMatch && (simulatedMatch.isSimulatedDiscount || currentPrice < originalPrice || (simulatedMatch.discountPercentage && simulatedMatch.discountPercentage > 0)))
    )
  );
  const hasDiscount = Boolean(simulatedMatch?.isSimulatedDiscount || hasSimulatedDiscount);

  let motherMinStayNum = expectedBaseline;
  let isGapFillModified = false;
  let isSimulatedMode = false;

  if (storeUpdateMatch) {
    motherMinStayNum = Number(storeUpdateMatch.minStay ?? storeUpdateMatch.min_stay ?? expectedBaseline);
    isGapFillModified = true;
    isSimulatedMode = storeUpdateMatch.isSimulated !== false;
  } else if (gapFillCellInfo && gapFillCellInfo.isGapFill) {
    motherMinStayNum = Number(gapFillCellInfo.minStay);
    isGapFillModified = true;
    isSimulatedMode = !dynamicGapFillEnabled;
  }

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
      (matchingBooking as any).totalAmount ||
      0
    );

    if (grossTotal > 0 && nights > 0) {
      const dailyPrice = Math.round(grossTotal / nights);
      realDailyPriceStr = dailyPrice >= 10000 ? '10.000' : dailyPrice.toLocaleString('it-IT');
    }
  }

  const isRoomClosedByStaff = roomIsAvailable === false;
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
      onClick={() => matchingBooking && onSelectBooking(matchingBooking)}
      className={`py-0.5 px-0.5 border-l text-center transition-colors relative min-w-[58px] max-w-[85px] truncate overflow-hidden ${bgStyle}`}
      title={matchingBooking 
        ? `Prenotato: ${formatGuestLastNameFirst(matchingBooking.guest_name || (matchingBooking as any).guestName)} (${getBookingChannelName(matchingBooking)}) • Tariffa Reale: ${realDailyPriceStr !== 'N/D' ? `฿${realDailyPriceStr}/notte` : 'N/D'} • Madre: ${motherPriceStr !== 'N/D' ? `฿${motherPriceStr}` : 'N/D'} • BE: ${beDiscountedStr !== 'N/D' ? `฿${beDiscountedStr}` : 'N/D'}`
        : (hasDiscount
            ? `SCONTO LAST-MINUTE SIMULATO (-${simulatedMatch?.discountPercentage}%): Originale ฿${origPriceStr} ➔ Scontato ฿${motherPriceStr}`
            : `Madre: ${motherPriceStr !== 'N/D' ? `฿${motherPriceStr}` : 'N/D'} • BE: ${beDiscountedStr !== 'N/D' ? `฿${beDiscountedStr}` : 'N/D'} • MinStay: ${motherMinStayNum > 0 ? motherMinStayNum : '-'}`
          )}
    >
      {/* BADGE MINSTAY */}
      {motherMinStayNum > 0 && (
        <div 
          className={`absolute top-0.5 right-0.5 z-10 font-bold text-[8.5px] rounded-full shadow-md flex items-center justify-center ${
            isGapFillModified
              ? (isSimulatedMode
                  ? 'bg-red-500 text-white w-4 h-4 border border-red-300 shadow-red-900/50 animate-pulse'
                  : 'bg-green-800 text-white w-4 h-4 border border-green-400 shadow-green-950/50')
              : 'bg-yellow-400 text-black w-3.5 h-3.5'
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

      {/* CONTENITORE ASSOLUTO SUL LATO SINISTRO (COLONNA EQUIDISTANTE PER I 3 INDICATORI TARIFFE DERIVATE CON LETTERE B, A, S) */}
      <div className="absolute left-0.5 top-0 bottom-0 flex flex-col justify-between items-center pointer-events-none z-10 py-0.5">
        {/* IN ALTO: Main bnb-7d / Main bnb-14d (Blu Cobalto con lettera "B") */}
        {isBnbActive ? (
          <span 
            className="w-2.5 h-2.5 rounded-full bg-blue-500 text-white font-bold text-[7px] leading-none flex items-center justify-center shadow-sm" 
            title="Bed & Breakfast (Main bnb) Attiva"
          >
            B
          </span>
        ) : (
          <span className="w-2.5 h-2.5 opacity-0" />
        )}

        {/* AL CENTRO: AGD AC-7d / AGD AC-14d (Rosa Agoda #FF007F con lettera "A") */}
        {isAgodaAcActive ? (
          <span 
            className="w-2.5 h-2.5 rounded-full bg-[#FF007F] text-white font-bold text-[7px] leading-none flex items-center justify-center shadow-sm" 
            title="Agoda AC (AGD AC) Attiva"
          >
            A
          </span>
        ) : (
          <span className="w-2.5 h-2.5 opacity-0" />
        )}

        {/* IN BASSO: Standard 7d (Bianco con lettera "S") */}
        {isStandard7dActive ? (
          <span 
            className="w-2.5 h-2.5 rounded-full bg-white text-stone-950 font-bold text-[7px] leading-none flex items-center justify-center shadow-sm" 
            title="Standard 7d Attiva"
          >
            S
          </span>
        ) : (
          <span className="w-2.5 h-2.5 opacity-0" />
        )}
      </div>

      {/* Indicator CTA Solo Check-out */}
      {isCTA && (
        <span 
          className="absolute top-0.5 left-3 w-1.5 h-1.5 rounded-full bg-amber-400 border border-amber-500/60 shadow-sm z-20" 
          title="Solo Check-Out / Closed to Arrival"
        />
      )}

      {/* CONTENUTO CELLA */}
      {matchingBooking ? (
        <div className="flex flex-col items-center justify-center min-w-0 w-full overflow-hidden leading-tight">
          <div className="truncate text-[9.5px] font-black min-w-0 w-full text-center text-white uppercase">
            {getBookingChannelName(matchingBooking)}
          </div>
          <div className="truncate text-[8.5px] min-w-0 w-full text-center text-white/95 font-medium">
            {formatGuestLastNameFirst(matchingBooking.guest_name || (matchingBooking as any).guestName)}
          </div>
          <div className="text-[8.5px] font-mono font-black text-white leading-none mt-0.5 truncate min-w-0 w-full text-center">
            ฿{realDailyPriceStr}
          </div>
        </div>
      ) : hasDiscount ? (
        <div className="flex flex-col items-center justify-center min-w-0 w-full overflow-hidden leading-none">
          <div className="text-[7.5px] font-mono font-bold text-white/90 line-through truncate min-w-0 w-full text-center opacity-80">
            ฿{origPriceStr}
          </div>
          <div className="text-[8.5px] font-mono font-black text-cyan-300 leading-tight mt-0.5 truncate min-w-0 w-full text-center drop-shadow">
            ฿{motherPriceStr}
          </div>
          <div className="text-[7.5px] font-mono font-black bg-cyan-950/90 text-cyan-200 border border-cyan-400/80 px-1 py-0.5 rounded mt-0.5 truncate min-w-0 text-center shadow">
            -{simulatedMatch?.discountPercentage}%
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-w-0 w-full overflow-hidden leading-none">
          <div className="text-[8px] font-mono font-medium text-stone-300 truncate min-w-0 w-full text-center">
            Madre: {motherPriceStr !== 'N/D' ? `฿${motherPriceStr}` : '-'}
          </div>
          <div className="text-[9.5px] font-mono font-black text-white leading-tight mt-0.5 truncate min-w-0 w-full text-center">
            BE: {beDiscountedStr !== 'N/D' ? `฿${beDiscountedStr}` : '-'}
          </div>
        </div>
      )}
    </td>
  );
});

export interface ResortVisualCalendarProps {
  viewMode?: 'full_season' | '30_days';
}

export function ResortVisualCalendar({ viewMode = 'full_season' }: ResortVisualCalendarProps = {}) {
  const [startIndex, setStartIndex] = useState(0);
  const { 
    bookings, 
    rawOctorateBookings,
    accommodations, 
    isDynamicCalculationEnabled,
    setIsDynamicCalculationEnabled,
    seasonDownloadStatus,
    seasonDownloadProgress,
    seasonDownloadMessage,
    downloadSeasonSequential,
    dynamicMinStayGapFill,
    setDynamicMinStayGapFill,
    executeDynamicMinStayStrategy,
    dynamicMinStayRunning,
    dynamicMinStayUpdates,
    isSimulationActive,
    simulatedOctorateGridItems,
    rawOctorateGridItems
  } = useResortAdminStore();

  const bookingsPool = (rawOctorateBookings && rawOctorateBookings.length > 0) ? rawOctorateBookings : bookings;

  const activeGridItems = (isSimulationActive && simulatedOctorateGridItems && simulatedOctorateGridItems.length > 0) 
    ? simulatedOctorateGridItems 
    : (rawOctorateGridItems || []);

  const simulatedMap = useMemo(() => {
    if (!isSimulationActive || !activeGridItems || activeGridItems.length === 0) return {};
    const map: Record<string, any> = {};
    activeGridItems.forEach((item: any) => {
      const key1 = `${item.motherRateId || item.ratePlanId || item.id}_${item.dateStr}`;
      const key2 = `${item.accommodationName}_${item.dateStr}`;
      map[key1] = item;
      if (item.accommodationName) {
        map[key2.toLowerCase()] = item;
      }
    });
    return map;
  }, [isSimulationActive, activeGridItems]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [selectedBooking, setSelectedBooking] = useState<ResortBooking | null>(null);
  const [liveGridData, setLiveGridData] = useState<Record<string, Record<string, OctorateDayData>>>({});
  const [loadingLive, setLoadingLive] = useState<boolean>(false);

  // STEP 3: TIMING BLINDATO (PROTEZIONE DAL FREEZE TRAMITE RENDERING A 2 FASI)
  const [showOverlay, setShowOverlay] = useState<boolean>(false);
  const [mountHeavyGrid, setMountHeavyGrid] = useState<boolean>(false);

  const gridScrollRef = useRef<HTMLDivElement>(null);
  
  // STEP 1: DATEPICKER TOTALE PASSIVO - UNCONTROLLED INPUT VIA useRef (ZERO REACT STATE)
  const dateInputRef = useRef<HTMLInputElement>(null);

  const handleSelectBooking = useCallback((booking: ResortBooking) => {
    setSelectedBooking(booking);
  }, []);

  // V17: Calendario puramente passivo e reattivo allo store — nessun auto-download al mount

  // STEP 3: TIMING BLINDATO (FASE 1, 2, 3) - ATTIVA L'OVERLAY PRIMA DEL MOUNT E RITARDA 500MS
  useEffect(() => {
    if (seasonDownloadStatus === 'completed') {
      setShowOverlay(true);
      setMountHeavyGrid(false);

      const timer500 = setTimeout(() => {
        setMountHeavyGrid(true);
      }, 500);

      return () => clearTimeout(timer500);
    } else {
      setShowOverlay(false);
      setMountHeavyGrid(false);
    }
  }, [seasonDownloadStatus]);

  // SINCRONIZZAZIONE DINAMICA CON L'EVENT LOOP DEL BROWSER (REFLOW & PAINT REALE)
  useEffect(() => {
    if (mountHeavyGrid) {
      let rafId1: number;
      let rafId2: number;
      let timerId: NodeJS.Timeout;

      rafId1 = requestAnimationFrame(() => {
        rafId2 = requestAnimationFrame(() => {
          timerId = setTimeout(() => {
            setShowOverlay(false);
          }, 300);
        });
      });

      return () => {
        if (rafId1) cancelAnimationFrame(rafId1);
        if (rafId2) cancelAnimationFrame(rafId2);
        if (timerId) clearTimeout(timerId);
      };
    }
  }, [mountHeavyGrid]);

  // Genera l'array CONTINUO delle colonne (da OGGI al 31 OTTOBRE)
  const datesArray: Date[] = (() => {
    const dates: Date[] = [];
    const todayBangkok = new Date();
    todayBangkok.setHours(0, 0, 0, 0);

    const todayStr = toThailandDateStr(todayBangkok);
    const seasonEndStr = getSeasonalEndDateStr(todayStr);

    const [endYear, endMonth, endDay] = seasonEndStr.split('-').map(Number);
    const endDate = new Date(endYear, endMonth - 1, endDay, 0, 0, 0, 0);

    let current = new Date(todayBangkok);
    while (current <= endDate) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  })();

  const visibleDays: Date[] = viewMode === '30_days' ? datesArray.slice(startIndex, startIndex + 30) : datesArray;

  // STEP 1 & 2: LETTURA DIRETTA DAL DOM SENZA STATO REACT ALL'ONCLICK DI "VAI"
  const handleExecuteDateJump = () => {
    const searchDate = dateInputRef.current?.value;
    if (!searchDate) return;
    const colElement = document.getElementById(`col-${searchDate}`);
    if (colElement) {
      colElement.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'start'
      });
    }
  };

  // Tasto Sync Live per Svuotare la Memoria e Ricaricare
  const handleForceSyncLive = async () => {
    setShowOverlay(false);
    setMountHeavyGrid(false);
    useResortAdminStore.setState({
      rawOctorateBookings: [],
      bookings: [],
      seasonDownloadStatus: 'idle',
      seasonDownloadProgress: 0,
      seasonDownloadMessage: 'Resettaggio memoria e avvio download sequenziale...'
    });
    await downloadSeasonSequential();
  };

  // Fetch Octorate Monthly Grid data per le date visibili continuative
  const loadLiveGrid = async () => {
    if (datesArray.length === 0) return;
    setLoadingLive(true);
    try {
      const firstDate = datesArray[0];
      const lastDate = datesArray[datesArray.length - 1];

      const dateFrom = toThailandDateStr(firstDate);
      const dateTo = toThailandDateStr(lastDate);

      const gridData = await fetchOctorateMonthlyGrid(dateFrom, dateTo);
      setLiveGridData(gridData || {});
    } catch (err) {
      console.warn('[ResortVisualCalendar] Live grid fetch error:', err);
    } finally {
      setLoadingLive(false);
    }
  };

  useEffect(() => {
    if (seasonDownloadStatus === 'completed') {
      loadLiveGrid();
    }
  }, [seasonDownloadStatus]);

  // Filter accommodations by category
  const filteredRooms = (accommodations || []).filter((r) => {
    if (filterCategory === 'All') return true;
    return r.category && r.category.toLowerCase() === filterCategory.toLowerCase();
  });

  // SCHERMATA DI CARICAMENTO BLOCCANTE (Se il download sequenziale è in corso)
  if (seasonDownloadStatus === 'downloading' || seasonDownloadStatus === 'idle') {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center bg-stone-900 border border-stone-800 rounded-3xl p-8 shadow-2xl space-y-6 text-center">
        <div className="relative flex items-center justify-center">
          <div className="w-24 h-24 rounded-full border-4 border-stone-800 border-t-amber-500 animate-spin" />
          <div className="absolute flex flex-col items-center">
            <span className="text-xl font-black font-mono text-amber-400">
              {seasonDownloadProgress}%
            </span>
          </div>
        </div>

        <div className="space-y-2 max-w-md">
          <h3 className="text-xl font-black text-white tracking-tight">
            Sincronizzazione Sequenziale Timeline Mese per Mese
          </h3>
          <p className="text-amber-400 font-mono text-xs font-bold animate-pulse">
            {seasonDownloadMessage || 'Avvio download sequenziale stagione...'}
          </p>
          <p className="text-stone-400 text-xs font-medium">
            Stiamo scaricando con la massima cura e precisione tutte le prenotazioni della stagione da Octorate per evitare blocchi API ed errori Stop Sell.
          </p>
        </div>

        {/* Barra di Progresso */}
        <div className="w-full max-w-lg bg-stone-950 h-3.5 rounded-full overflow-hidden border border-stone-800 shadow-inner">
          <div 
            className="bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 h-full transition-all duration-300 rounded-full"
            style={{ width: `${seasonDownloadProgress}%` }}
          />
        </div>

        <div className="flex items-center gap-2 bg-stone-950 px-4 py-2 rounded-xl border border-stone-800 text-stone-400 text-xs font-mono">
          <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
          <span>{rawOctorateBookings.length} prenotazioni registrate in memoria</span>
        </div>
      </div>
    );
  }

  // STEP 2: OVERLAY BLOCCANTE ASSOLUTO FIXED INSET-0 (PRIMA CHE LA GRIGLIA SIA MONTATA)
  if (seasonDownloadStatus === 'completed' && showOverlay && !mountHeavyGrid) {
    return (
      <div className="fixed inset-0 w-screen h-screen z-50 bg-stone-950/95 flex items-center justify-center pointer-events-auto">
        <div className="flex flex-col items-center justify-center bg-stone-900 border border-stone-800 rounded-3xl p-8 shadow-2xl space-y-4 text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <RefreshCw className="w-8 h-8 animate-spin" />
          </div>
          <h3 className="text-xl font-black text-white tracking-tight">
            Generazione interfaccia visiva in corso, attendere...
          </h3>
          <p className="text-amber-400 font-mono text-xs font-bold animate-pulse">
            Costruzione griglia continua da Oggi fino al 31 Ottobre ({datesArray.length} giorni)
          </p>
        </div>
      </div>
    );
  }

  // SCHERMATA IN CASO DI ERRORE CRITICO
  if (seasonDownloadStatus === 'error') {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center bg-stone-900 border border-red-900/50 rounded-3xl p-8 shadow-2xl space-y-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
          <X className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-black text-white">Errore durante la sincronizzazione</h3>
        <p className="text-stone-400 text-xs max-w-md">{seasonDownloadMessage}</p>
        <button
          onClick={() => handleForceSyncLive()}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer"
        >
          🔄 Riprova Download Sequenziale
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 text-stone-100 font-sans relative">
      
      {/* STEP 2: OVERLAY BLOCCANTE ASSOLUTO FIXED INSET-0 (DURANTE IL FREEZE DEL DOM PESANTE) */}
      {showOverlay && (
        <div className="fixed inset-0 w-screen h-screen z-50 bg-stone-950/95 flex items-center justify-center pointer-events-auto">
          <div className="flex flex-col items-center justify-center bg-stone-900 border border-stone-800 rounded-3xl p-8 shadow-2xl space-y-4 text-center max-w-md">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <RefreshCw className="w-8 h-8 animate-spin" />
            </div>
            <h3 className="text-xl font-black text-white tracking-tight">
              Generazione interfaccia visiva in corso, attendere...
            </h3>
            <p className="text-amber-400 font-mono text-xs font-bold animate-pulse">
              Costruzione griglia continua da Oggi fino al 31 Ottobre ({datesArray.length} giorni)
            </p>
          </div>
        </div>
      )}

      {/* CALENDARIO OCTORATE PLUS: UNIFIED ULTRA-COMPACT HEADER & CONTROL BAR */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-3 shadow-xl space-y-2.5">
        
        {/* ROW 1: Title + 30-day Nav + Date Jump + Sync Live */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-2.5 pb-2 border-b border-stone-800/80">
          
          {/* Title Branding */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0 shadow">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                CALENDARIO OCTORATE PLUS
              </h3>
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                THB ฿
              </span>
              {isSimulationActive && (
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/50 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 animate-pulse">
                  ⚡ SIMULATO
                </span>
              )}
            </div>
          </div>

          {/* Controls Right Group (30-day Nav, Date Jump, Sync Live) */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
            
            {/* 30-Day Paged Nav */}
            {viewMode === '30_days' && (
              <div className="flex items-center gap-1.5 bg-stone-950 p-1 rounded-xl border border-amber-500/30 shadow-inner">
                <button
                  type="button"
                  onClick={() => setStartIndex((prev) => Math.max(0, prev - 30))}
                  disabled={startIndex === 0}
                  className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 disabled:opacity-40 font-black text-[11px] rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                  title="30 giorni precedenti"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>30gg Prec</span>
                </button>

                <span className="text-[11px] font-mono font-black text-amber-400 px-1.5 whitespace-nowrap">
                  Gg {startIndex + 1} - {Math.min(datesArray.length, startIndex + 30)} / {datesArray.length}
                </span>

                <button
                  type="button"
                  onClick={() => setStartIndex((prev) => Math.min(Math.max(0, datesArray.length - 30), prev + 30))}
                  disabled={startIndex + 30 >= datesArray.length}
                  className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 disabled:opacity-40 font-black text-[11px] rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                  title="30 giorni successivi"
                >
                  <span>30gg Succ</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Date Jump Input */}
            <div className="flex items-center gap-1.5 bg-stone-950 p-1 rounded-xl border border-stone-800 shadow-inner">
              <span className="text-stone-400 text-[11px] font-extrabold pl-1 flex items-center gap-1">
                <CalendarIcon className="w-3 h-3 text-amber-400" />
                Data:
              </span>
              <input
                ref={dateInputRef}
                type="date"
                defaultValue={toThailandDateStr(new Date())}
                onClick={(e) => e.currentTarget.showPicker()}
                className="bg-stone-900 text-amber-400 text-[11px] font-mono font-bold px-2 py-1 rounded-lg border border-stone-800 focus:border-amber-500 outline-none cursor-pointer [color-scheme:dark]"
              />
              <button
                type="button"
                onClick={handleExecuteDateJump}
                className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-[11px] uppercase tracking-wider rounded-lg shadow cursor-pointer flex items-center gap-1 transition-all"
                title="Vai alla data"
              >
                <Search className="w-3 h-3" />
                <span>VAI</span>
              </button>
            </div>

            {/* Sync Live Button */}
            <button
              type="button"
              onClick={handleForceSyncLive}
              disabled={seasonDownloadStatus === 'downloading'}
              className="px-3 py-1.5 bg-stone-950 hover:bg-stone-850 text-amber-400 border border-amber-500/30 rounded-xl text-[11px] font-black uppercase tracking-wider shadow transition-all cursor-pointer flex items-center gap-1.5"
              title="Sincronizza Live Octorate"
            >
              <RefreshCw className={`w-3 h-3 ${seasonDownloadStatus === 'downloading' || loadingLive ? 'animate-spin' : ''}`} />
              <span>SYNC LIVE</span>
            </button>
          </div>
        </div>

        {/* ROW 2: Category Filter Pills + Legend Badges */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {[
              { id: 'All', label: `TUTTI GLI ALLOGGI (${(accommodations || []).length || 20})` },
              { id: 'VILLE', label: '🏡 VILLE (4)' },
              { id: 'BUNGALOW', label: `🛖 BUNGALOW (${(accommodations || []).filter(r => (r.category === 'BUNGALOW' || r.category === 'Bungalow' || r.name.toLowerCase().includes('bungalow')) && !r.name.toLowerCase().includes('test')).length || 3})` },
              { id: 'TENDE GLAMPING', label: '⛺ GLAMPING (2)' },
              { id: 'THE HUB GUESTHOUSE', label: '🏨 HUB GUESTHOUSE (9)' },
              { id: 'TEST', label: '🧪 AMBIENTE DI TEST (2)' }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilterCategory(cat.id)}
                className={`px-3 py-1 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                  filterCategory === cat.id
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/50 ring-1 ring-emerald-400/40'
                    : 'bg-stone-950 text-stone-400 hover:text-white hover:bg-stone-850 border border-stone-800/80'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Compact Legend Badges */}
          <div className="flex items-center gap-2 bg-stone-950 p-1.5 rounded-xl border border-stone-800 text-[10px] font-bold text-stone-300 flex-shrink-0">
            <span className="flex items-center">
              <span className="bg-yellow-400 w-2.5 h-2.5 rounded-full inline-block mr-1 shadow-sm" /> Standard
            </span>
            <span className="flex items-center">
              <span className="bg-red-500 animate-pulse w-2.5 h-2.5 rounded-full inline-block mr-1 shadow-sm" /> Simulazione
            </span>
            <span className="flex items-center">
              <span className="bg-green-800 w-2.5 h-2.5 rounded-full inline-block mr-1 shadow-sm" /> Sincronizzato
            </span>
          </div>

        </div>
      </div>

      {/* CONTENITORE A SCORRIMENTO ORIZZONTALE CONTINUO (Griglia Infinita) */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-2xl">
        <div ref={gridScrollRef} className="overflow-x-auto max-w-full custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[2400px]">
            {/* Table Header: Continuous Days columns from Today to Oct 31 */}
            <thead className="bg-stone-950 sticky top-0 z-20 border-b border-stone-800">
              <tr>
                <th className="py-2 px-3 text-[10px] font-black text-stone-300 uppercase tracking-wider sticky left-0 bg-stone-950 z-50 min-w-[170px] max-w-[170px] border-r border-stone-800 shadow-2xl">
                  Alloggio / Camera
                </th>
                {visibleDays.map((cellDate, idx) => {
                  const dateStr = toThailandDateStr(cellDate);
                  const dayOfWeekIdx = cellDate.getDay();
                  const isWeekend = dayOfWeekIdx === 0 || dayOfWeekIdx === 6;
                  return (
                    <th 
                      key={idx} 
                      id={`col-${dateStr}`}
                      className={`py-1 text-center border-l border-stone-850 min-w-[64px] ${isWeekend ? 'bg-stone-900 text-stone-300' : 'text-stone-400'}`}
                    >
                      <div className="text-[8px] uppercase font-mono leading-none">{DAY_NAMES_IT[dayOfWeekIdx]}</div>
                      <div className="text-[10px] font-mono font-bold leading-tight">{cellDate.getDate()} {MONTH_NAMES_IT[cellDate.getMonth()].substring(0, 3)}</div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* Table Body: Rooms Rows */}
            <tbody className="divide-y divide-stone-850/60 text-[10px]">
              {filteredRooms.map((room) => {
                const gapFillMinStays = computeGapFillMinStays(room.name, room.id, room.octorateId, room.isAvailable, visibleDays, liveGridData, bookingsPool, dynamicMinStayGapFill);

                return (
                  <tr key={room.id} className="hover:bg-stone-850/40 transition-colors h-7.5">
                    {/* STEP 3: Z-INDEX ELEVATO Z-40 CON BACKGROUND SOLIDO PER COPRIRE I CERCHIETTI SCORREVOLI */}
                    <td className="py-0.5 px-2 sticky left-0 bg-stone-900 z-40 border-r border-stone-800 shadow-2xl font-black text-white text-[10.5px] truncate max-w-[155px] min-w-[155px] leading-tight">
                      {room.name}
                    </td>
                    {visibleDays.map((cellDate, idx) => {
                      const dateStr = toThailandDateStr(cellDate);
                      const { motherId, beId } = getIdsForRoom(room.name);
                      const motherData = liveGridData?.[String(motherId)]?.[dateStr];
                      const beData = liveGridData?.[String(beId)]?.[dateStr];
                      const expectedBaseline = getBaselineMinStay(dateStr);

                      const simulatedMatch = isSimulationActive ? (
                        simulatedMap[`${motherId}_${dateStr}`] || 
                        simulatedMap[`${beId}_${dateStr}`] || 
                        simulatedMap[`${room.id}_${dateStr}`] || 
                        simulatedMap[`${room.name.toLowerCase()}_${dateStr}`]
                      ) : undefined;

                      const storeUpdateMatch = isDynamicCalculationEnabled ? (dynamicMinStayUpdates || []).find((u: any) => (String(u.roomTypeId) === String(motherId) || String(u.roomTypeId) === String(beId) || String(u.roomTypeId) === String(room.id) || String(u.roomTypeId) === String(room.octorateId) || (u.accommodationName && u.accommodationName.toLowerCase() === room.name.toLowerCase()) || (u.roomId && String(u.roomId) === String(room.id))) && (dateStr >= (u.dateFrom || u.date || u.from_date || u.startDate) && dateStr < (u.dateTo || u.to_date || u.endDate))) : undefined;
                      const gapFillCellInfo = isDynamicCalculationEnabled ? gapFillMinStays[dateStr] : null;

                      const matchingBooking = findMatchingBooking(room.name, room.id, room.octorateId, cellDate, bookingsPool);

                      const { isBnbActive, isAgodaAcActive, isStandard7dActive } = computeDerivedRateIndicators(
                        room.name,
                        dateStr,
                        liveGridData,
                        activeGridItems
                      );

                      return (
                        <CalendarCell
                          key={`${idx}_${isSimulationActive ? 'sim' : 'raw'}_${simulatedMatch?.finalPrice || '0'}_${isBnbActive ? '1' : '0'}${isAgodaAcActive ? '1' : '0'}${isStandard7dActive ? '1' : '0'}`}
                          cellDate={cellDate}
                          dateStr={dateStr}
                          roomName={room.name}
                          roomId={room.id}
                          roomOctorateId={room.octorateId}
                          roomIsAvailable={room.isAvailable}
                          motherData={motherData}
                          beData={beData}
                          expectedBaseline={expectedBaseline}
                          gapFillCellInfo={gapFillCellInfo}
                          storeUpdateMatch={storeUpdateMatch}
                          simulatedMatch={simulatedMatch}
                          matchingBooking={matchingBooking}
                          isDynamicCalculationEnabled={isDynamicCalculationEnabled}
                          dynamicGapFillEnabled={dynamicMinStayGapFill}
                          isSimulationActive={isSimulationActive}
                          isBnbActive={isBnbActive}
                          isAgodaAcActive={isAgodaAcActive}
                          isStandard7dActive={isStandard7dActive}
                          onSelectBooking={handleSelectBooking}
                        />
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
