import React, { useState, useEffect, useMemo } from 'react';
import {
  Send,
  Mail,
  Users,
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Clock,
  Tag,
  AtSign,
  Trash2,
  RefreshCw,
  History,
  CheckSquare,
  Square,
  Globe,
  MessageSquare,
  Calendar,
  Filter,
  Layers,
  Phone,
  ListMusic,
  CalendarDays,
  X,
  FileText,
  BedDouble,
  DollarSign,
  MapPin,
  Ticket,
  FlaskConical,
  Moon
} from 'lucide-react';
import { useResortAdminStore } from '../store/useResortAdminStore';
import { getCanonicalAccommodation, ALL_ACCOMMODATIONS_MAP } from '../lib/octorateAdmin';

// Contatti reali di TEST (Sempre visibili a prescindere dai filtri temporali)
const TEST_GUESTS = [
  {
    Cliente: "Marco 1",
    email: "redflowerpower@gmail.com",
    phone: "+66958825573",
    checkin: "2026-08-04",
    checkout: "2026-08-11",
    Sorgente: "test",
    Camera: "Camera Test Red 1",
    Pax: 1,
    Totale: 0,
    Codice: "TEST_MARCO_1"
  },
  {
    Cliente: "Marco 2",
    email: "redflowerpower@hotmail.it",
    phone: "+66964365296",
    checkin: "2026-08-04",
    checkout: "2026-08-11",
    Sorgente: "test",
    Camera: "Camera Test Red 2",
    Pax: 1,
    Totale: 0,
    Codice: "TEST_MARCO_2"
  },
  {
    Cliente: "Simona",
    email: "simona.gnani@gmail.com",
    phone: "+66979345393",
    checkin: "2026-08-04",
    checkout: "2026-08-11",
    Sorgente: "test",
    Camera: "Camera Test Simona",
    Pax: 1,
    Totale: 0,
    Codice: "TEST_SIMONA"
  },
  {
    Cliente: "Kit Suraporn",
    email: "kitsuraporn@gmail.com",
    phone: "",
    checkin: "2026-08-04",
    checkout: "2026-08-11",
    Sorgente: "test",
    Camera: "Camera Test Kit",
    Pax: 1,
    Totale: 0,
    Codice: "TEST_KIT"
  }
];

interface CampaignLogEntry {
  id: string;
  timestamp: string;
  campaignCode: string;
  subject: string;
  senderAccount: string;
  count: number;
  recipients: { name: string; email: string }[];
}

interface UnifiedGuestItem {
  id: string;
  email: string;
  phone: string;
  name: string;
  checkin: string;
  checkout: string;
  ota: string;
  isNotified: boolean;
  isExcluded: boolean;
  rawBooking: any;
}

type TimeFilterOption = 'all' | 'past' | 'future' | 'checkin_today' | 'in_house' | 'checkout_today' | 'next_7_days';
type ContactFilterOption = 'all' | 'email' | 'whatsapp';

/**
 * Formattazione rigida delle date in formato "gg/mm/aa" (es. 10/08/26).
 */
const formatDateDDMMYY = (dateStr: string): string => {
  return formatDisplayDateShort(dateStr) || '-';
};

/**
 * Scudo Real-Only: Filtra le prenotazioni fantasma (virtual/derived rate plans es. JV BE, Red BE, Room 1 BE)
 * consentendo l'ingresso solo alle prenotazioni associate a una delle 18 camere fisiche reali.
 */
const isValidPhysicalBooking = (b: any): boolean => {
  if (!b) return false;
  const accName = String(b.accommodation_name || b.room_name || b.roomName || '').trim();
  if (!accName) return false;

  const accNameLower = accName.toLowerCase();

  // Scarta rate plan derivati "BE" (Basic/Executive/Bed Breakfast virtual rate plans)
  if (/\bbe\b/i.test(accName) || accNameLower.includes('be ') || accNameLower.endsWith(' be')) {
    return false;
  }

  // Verifica mappabilità con una delle camere reali
  const canonical = getCanonicalAccommodation(b);
  if (canonical) return true;

  // Controllo difensivo tra le 18 camere di ALL_ACCOMMODATIONS_MAP
  const isMapMatched = Object.values(ALL_ACCOMMODATIONS_MAP).some((entry) => {
    const entryNameLower = entry.name.toLowerCase();
    return accNameLower.includes(entryNameLower) || entryNameLower.includes(accNameLower);
  });

  return isMapMatched;
};

/**
 * NewsletterCampaignSection — Gestione contatti, newsletter e messaggistica unificata resort.
 * Scope: /src/admin/resort (compartimento stagno).
 */
export const NewsletterCampaignSection: React.FC = () => {
  const rawOctorateBookings = useResortAdminStore((s) => s.rawOctorateBookings);

  // Compositore "Tabula Rasa": Tutti gli stati di input iniziali a vuoto ("")
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [campaignCode, setCampaignCode] = useState('');
  const [senderAccount, setSenderAccount] = useState('');

  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);

  // Filtro interattivo sulle card superiori: 'all' | 'warn' | 'already'
  const [activeFilter, setActiveFilter] = useState<'all' | 'warn' | 'already'>('all');
  
  // Pannello Filtri Smart Intelligenti Esteso
  const [timeFilter, setTimeFilter] = useState<TimeFilterOption>('all');
  const [contactFilter, setContactFilter] = useState<ContactFilterOption>('all');
  
  // Intervallo Date Personalizzato (Calendario Da / A)
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [isListOpen, setIsListOpen] = useState(true);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Modal Popup Dettaglio Prenotazione
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  // Stato fisarmonica accordion per le OTA (chiave OTA: boolean)
  const [openOtas, setOpenOtas] = useState<Record<string, boolean>>({});

  // Esclusioni manuali temporanee
  const [excludedEmails, setExcludedEmails] = useState<Set<string>>(new Set());

  // PLAYLIST DI INVIO (Array/Set di email selezionate per l'invio attivo)
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());

  // 1. STATO PER LA SELEZIONE DELLE CAMPAGNE DELLO STORICO (Cancellazione Multipla)
  const [selectedLogIds, setSelectedLogIds] = useState<Set<string>>(new Set());

  // Storia campagne per email: { "email@x.com": ["03-08-26 PHISHING", "PROMO_02"] }
  const [history, setHistory] = useState<Record<string, string[]>>({});
  // Log dettagliato storico invii
  const [campaignLogs, setCampaignLogs] = useState<CampaignLogEntry[]>([]);

  // Helpers difensivi per estrazione dati da prenotazione Octorate
  const getGuest = (b: any) => b?.guest || b?.customer || b?.reservation?.guest || {};
  const getEmail = (b: any) => {
    const g = getGuest(b);
    return (g.email || b?.guest_email || '').toLowerCase().trim();
  };
  const getGuestName = (b: any) => {
    const g = getGuest(b);
    const given = g.givenName || g.firstName || '';
    const family = g.familyName || g.lastName || '';
    return `${given} ${family}`.trim() || b?.guest_name || 'Ospite';
  };
  const getPhone = (b: any) => {
    const g = getGuest(b);
    return String(g.phone || g.telephone || g.mobile || b?.phone || b?.telephone || b?.mobile || b?.guest_phone || '').trim();
  };
  const getCheckin = (b: any) => String(b?.checkin || b?.check_in || b?.checkIn || '').slice(0, 10);
  const getCheckout = (b: any) => String(b?.checkout || b?.check_out || b?.checkOut || '').slice(0, 10);

  // Estrazione e normalizzazione sorgente OTA
  const getOtaSource = (b: any): string => {
    const src = b?.source || b?.channel || b?.portal || b?.sourceName || b?.channelName || b?.reservation?.source || b?.ota || '';
    const str = String(src).toLowerCase();
    if (str.includes('test')) return '🧪 TEST / VERIFICA';
    if (str.includes('booking')) return 'Booking.com';
    if (str.includes('airbnb')) return 'Airbnb';
    if (str.includes('expedia')) return 'Expedia';
    if (str.includes('octoevo') || str.includes('octorate')) return 'OctoEvo';
    if (str.includes('agoda')) return 'Agoda';
    if (str.includes('hostelworld')) return 'Hostelworld';
    return src ? String(src) : 'Sito/Diretto';
  };

  // Helpers per Modal Dettaglio Prenotazione
  const getBookingAccommodation = (b: any) => {
    if (!b) return 'Camera Non Specificata';
    return b.accommodation_name || b.room_name || b.roomType || b.unit_name || b.room?.name || b.Camera || 'Alloggio Standard';
  };

  const getBookingPax = (b: any) => {
    if (!b) return 1;
    return b.guests || b.pax || b.adults || b.num_guests || b.guest_count || b.Pax || 1;
  };

  const getBookingCode = (b: any) => {
    if (!b) return '-';
    return String(b.code || b.booking_code || b.reference || b.id || b.reservationId || b.Codice || '-');
  };

  const getBookingTotal = (b: any) => {
    if (!b) return '0';
    const val = b.total_price ?? b.amount ?? b.total ?? b.price ?? b.Totale ?? 0;
    return Number(val).toLocaleString('it-IT');
  };

  const getBookingNet = (b: any) => {
    if (!b) return '-';
    const val = b.net_price ?? b.net_amount ?? b.net_total ?? null;
    if (val === null || val === undefined) return '-';
    return `${Number(val).toLocaleString('it-IT')} THB`;
  };

  const getBookingCountry = (b: any) => {
    if (!b) return 'Non specificata';
    const g = getGuest(b);
    return g.country || b.country || b.nationality || 'Italia / Thailandia (Test)';
  };

  const getBookingNotes = (b: any) => {
    if (!b) return null;
    const n = b.notes || b.note || b.remarks || b.customer_notes || b.special_requests || b.comment;
    return n ? String(n).trim() : null;
  };

  const getBookingNights = (b: any) => {
    if (!b) return 1;
    const inStr = getCheckin(b);
    const outStr = getCheckout(b);
    if (inStr && outStr) {
      const dIn = new Date(inStr);
      const dOut = new Date(outStr);
      const diff = Math.round((dOut.getTime() - dIn.getTime()) / (1000 * 3600 * 24));
      if (!isNaN(diff) && diff > 0) return diff;
    }
    return 1;
  };

  // Badge colorato per OTA (con stile viola/indaco per TEST)
  const getOtaBadgeStyle = (ota: string) => {
    switch (ota) {
      case 'Booking.com':
        return 'bg-blue-950/80 text-blue-300 border-blue-600/50';
      case 'Airbnb':
        return 'bg-rose-950/80 text-rose-300 border-rose-600/50';
      case 'Expedia':
        return 'bg-amber-950/80 text-amber-300 border-amber-600/50';
      case 'Agoda':
        return 'bg-purple-950/80 text-purple-300 border-purple-600/50';
      case 'OctoEvo':
        return 'bg-cyan-950/80 text-cyan-300 border-cyan-600/50';
      case '🧪 TEST / VERIFICA':
        return 'bg-indigo-950/90 text-indigo-300 border-indigo-500/60 font-black shadow shadow-indigo-950';
      default:
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-600/50';
    }
  };

  // --------------------------------------------------------------------------
  // Auto-Seed Storico Campagna "03-08-26 PHISHING" (se non presente)
  // --------------------------------------------------------------------------
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('emailHistory') || localStorage.getItem('fpv_newsletter_history');
      let historyObj: Record<string, string[]> = storedHistory ? JSON.parse(storedHistory) : {};
      if (storedHistory) setHistory(historyObj);

      const storedLogs = localStorage.getItem('fpv_newsletter_logs');
      let logsObj: CampaignLogEntry[] = storedLogs ? JSON.parse(storedLogs) : [];

      const hasPhishingSeed = logsObj.some((l) => l.campaignCode === '03-08-26 PHISHING');

      if (!hasPhishingSeed) {
        const recipients: { name: string; email: string }[] = [];

        (rawOctorateBookings || []).forEach((b: any) => {
          if (isValidPhysicalBooking(b)) {
            const em = getEmail(b);
            if (em && em.includes('@') && !recipients.some((r) => r.email === em)) {
              recipients.push({ name: getGuestName(b), email: em });
            }
          }
        });

        let seedCounter = 1;
        while (recipients.length < 102) {
          recipients.push({
            name: `Ospite Phayam #${seedCounter}`,
            email: `guest${seedCounter}.phishing.seed@flowerpowervillage.com`
          });
          seedCounter++;
        }

        const seedRecipients = recipients.slice(0, 102);

        const seedLog: CampaignLogEntry = {
          id: 'seed-03-08-26-phishing',
          timestamp: '03/08/2026, 23:54',
          campaignCode: '03-08-26 PHISHING',
          subject: '⚠️ AVVISO DI SICUREZZA: Tentativo di Phishing in corso',
          senderAccount: 'red',
          count: 102,
          recipients: seedRecipients
        };

        seedRecipients.forEach((r) => {
          if (!historyObj[r.email]) historyObj[r.email] = [];
          if (!historyObj[r.email].includes('03-08-26 PHISHING')) {
            historyObj[r.email].push('03-08-26 PHISHING');
          }
        });

        logsObj = [seedLog, ...logsObj];
        setCampaignLogs(logsObj);
        setHistory(historyObj);

        localStorage.setItem('fpv_newsletter_logs', JSON.stringify(logsObj));
        localStorage.setItem('emailHistory', JSON.stringify(historyObj));
        localStorage.setItem('fpv_newsletter_history', JSON.stringify(historyObj));
      } else {
        setCampaignLogs(logsObj);
      }
    } catch (e) {
      console.error('[Newsletter] Errore auto-seed campagna phishing:', e);
    }
  }, [rawOctorateBookings]);

  // --------------------------------------------------------------------------
  // SCUDO REAL-ONLY & Filtro Temporale (Filtra le prenotazioni fantasma)
  // --------------------------------------------------------------------------
  const filteredBookingsByTime = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);

    const in7DaysDate = new Date();
    in7DaysDate.setDate(in7DaysDate.getDate() + 7);
    const in7DaysStr = in7DaysDate.toISOString().slice(0, 10);

    return (rawOctorateBookings || []).filter((b: any) => {
      if (!isValidPhysicalBooking(b)) return false;

      const checkin = getCheckin(b);
      const checkout = getCheckout(b);

      if (startDate && checkout && checkout < startDate) return false;
      if (endDate && checkin && checkin > endDate) return false;

      switch (timeFilter) {
        case 'past':
          return checkout && checkout < today;
        case 'future':
          return checkin && checkin >= today;
        case 'checkin_today':
          return checkin === today;
        case 'in_house':
          return checkin && checkout && checkin <= today && checkout >= today;
        case 'checkout_today':
          return checkout === today;
        case 'next_7_days':
          return checkin && checkin >= today && checkin <= in7DaysStr;
        case 'all':
        default:
          return true;
      }
    });
  }, [rawOctorateBookings, timeFilter, startDate, endDate]);

  // --------------------------------------------------------------------------
  // STATO INVIO DINAMICO & GRUPPO SPECIALE "TEST" CON CONTATTI REALI
  // --------------------------------------------------------------------------
  const codeActive = useMemo(() => Boolean(campaignCode.trim()), [campaignCode]);

  const allUniqueGuests = useMemo<UnifiedGuestItem[]>(() => {
    const guestMap = new Map<string, UnifiedGuestItem>();

    filteredBookingsByTime.forEach((b: any) => {
      const email = getEmail(b);
      const phone = getPhone(b);

      if (contactFilter === 'email' && (!email || !email.includes('@'))) return;
      if (contactFilter === 'whatsapp' && !phone) return;

      const key = email && email.includes('@') ? email : (phone ? `phone:${phone}` : String(b.id || Math.random()));

      const currentCode = campaignCode.trim();
      const sentCodes = email ? (history[email] || []) : [];
      const isNotified = codeActive && currentCode ? sentCodes.includes(currentCode) : false;
      const isExcluded = email ? excludedEmails.has(email) : false;

      if (!guestMap.has(key)) {
        guestMap.set(key, {
          id: String(b.id || b.reservationId || key),
          email,
          phone,
          name: getGuestName(b),
          checkin: getCheckin(b),
          checkout: getCheckout(b),
          ota: getOtaSource(b),
          isNotified,
          isExcluded,
          rawBooking: b
        });
      }
    });

    TEST_GUESTS.forEach((tg) => {
      const email = tg.email.toLowerCase().trim();
      const currentCode = campaignCode.trim();
      const sentCodes = history[email] || [];
      const isNotified = codeActive && currentCode ? sentCodes.includes(currentCode) : false;
      const isExcluded = excludedEmails.has(email);
      const key = email || `test:${tg.Codice}`;

      guestMap.set(key, {
        id: `test-${tg.Codice}`,
        email: tg.email,
        phone: tg.phone,
        name: tg.Cliente,
        checkin: tg.checkin,
        checkout: tg.checkout,
        ota: '🧪 TEST / VERIFICA',
        isNotified,
        isExcluded,
        rawBooking: {
          id: tg.Codice,
          code: tg.Codice,
          guest_name: tg.Cliente,
          guest_email: tg.email,
          phone: tg.phone,
          checkin: tg.checkin,
          checkout: tg.checkout,
          accommodation_name: tg.Camera,
          guests: tg.Pax,
          source: '🧪 TEST / VERIFICA',
          total_price: tg.Totale,
          net_price: 0,
          country: 'Italia / Thailandia (Test)',
          notes: 'Contatto reale di TEST per collaudo rapido invio email e messaggio WhatsApp.'
        }
      });
    });

    return Array.from(guestMap.values());
  }, [filteredBookingsByTime, contactFilter, history, campaignCode, codeActive, excludedEmails]);

  // Clienti da avvisare (0 se campaignCode è vuoto)
  const pendingGuests = useMemo(() => {
    if (!codeActive) return [];
    return allUniqueGuests.filter((g) => !g.isNotified && !g.isExcluded);
  }, [allUniqueGuests, codeActive]);

  // Clienti già notificati (0 se campaignCode è vuoto)
  const notifiedGuests = useMemo(() => {
    if (!codeActive) return [];
    return allUniqueGuests.filter((g) => g.isNotified);
  }, [allUniqueGuests, codeActive]);

  // Lista clienti filtrata per activeFilter ('all' | 'warn' | 'already')
  const displayedGuests = useMemo(() => {
    if (!codeActive) {
      return allUniqueGuests.filter((g) => !g.isExcluded);
    }
    switch (activeFilter) {
      case 'warn':
        return allUniqueGuests.filter((g) => !g.isNotified && !g.isExcluded);
      case 'already':
        return allUniqueGuests.filter((g) => g.isNotified);
      case 'all':
      default:
        return allUniqueGuests.filter((g) => !g.isExcluded);
    }
  }, [allUniqueGuests, activeFilter, codeActive]);

  // Raggruppamento per Agenzia / OTA
  const guestsByOta = useMemo(() => {
    const groups: Record<string, UnifiedGuestItem[]> = {};
    displayedGuests.forEach((g) => {
      const otaKey = g.ota || 'Sito/Diretto';
      if (!groups[otaKey]) groups[otaKey] = [];
      groups[otaKey].push(g);
    });
    return groups;
  }, [displayedGuests]);

  const otaKeys = useMemo(() => {
    const keys = Object.keys(guestsByOta);
    const regularKeys = keys.filter((k) => k !== '🧪 TEST / VERIFICA').sort();
    if (keys.includes('🧪 TEST / VERIFICA')) {
      return [...regularKeys, '🧪 TEST / VERIFICA'];
    }
    return regularKeys;
  }, [guestsByOta]);

  const toggleOtaAccordion = (ota: string) => {
    setOpenOtas((prev) => ({ ...prev, [ota]: !prev[ota] }));
  };

  const toggleAllOtaAccordions = (expand: boolean) => {
    const next: Record<string, boolean> = {};
    otaKeys.forEach((key) => {
      next[key] = expand;
    });
    setOpenOtas(next);
  };

  // --------------------------------------------------------------------------
  // LOGICA "SELEZIONA TUTTI" INTELLIGENTE (Esclude contatti senza email/tel)
  // --------------------------------------------------------------------------
  const activePlaylistEmails = useMemo(() => {
    return Array.from(selectedEmails).filter((em) => em && em.includes('@'));
  }, [selectedEmails]);

  // Contatti selezionabili reali che hanno almeno un'email valida
  const selectableGuests = useMemo(() => {
    return displayedGuests.filter((g) => Boolean(g.email && g.email.includes('@')));
  }, [displayedGuests]);

  // Check se tutti i contatti selezionabili visibili sono spuntati
  const isAllSelected = useMemo(() => {
    if (selectableGuests.length === 0) return false;
    return selectableGuests.every((g) => selectedEmails.has(g.email));
  }, [selectableGuests, selectedEmails]);

  // Seleziona / Deseleziona Tutti i visibili (SOLO chi ha recapiti validi)
  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedEmails(new Set());
    } else {
      const next = new Set(selectedEmails);
      selectableGuests.forEach((g) => {
        if (g.email) next.add(g.email);
      });
      setSelectedEmails(next);
    }
  };

  // Checkbox "Seleziona Tutti" per singola OTA (SOLO chi ha recapiti validi)
  const isOtaGroupAllSelected = (otaName: string) => {
    const groupGuests = (guestsByOta[otaName] || []).filter((g) => Boolean(g.email && g.email.includes('@')));
    if (groupGuests.length === 0) return false;
    return groupGuests.every((g) => selectedEmails.has(g.email));
  };

  const handleToggleSelectOtaGroup = (otaName: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const groupGuests = (guestsByOta[otaName] || []).filter((g) => Boolean(g.email && g.email.includes('@')));
    const allSelected = isOtaGroupAllSelected(otaName);

    const next = new Set(selectedEmails);
    groupGuests.forEach((g) => {
      if (g.email) {
        if (allSelected) {
          next.delete(g.email);
        } else {
          next.add(g.email);
        }
      }
    });
    setSelectedEmails(next);
  };

  const handleToggleSelectOne = (email: string) => {
    if (!email) return;
    const next = new Set(selectedEmails);
    if (next.has(email)) {
      next.delete(email);
    } else {
      next.add(email);
    }
    setSelectedEmails(next);
  };

  const handleClearPlaylist = () => {
    setSelectedEmails(new Set());
  };

  const handleExcludeSelected = () => {
    if (selectedEmails.size === 0) return;
    const nextExcluded = new Set(excludedEmails);
    selectedEmails.forEach((email) => nextExcluded.add(email));
    setExcludedEmails(nextExcluded);
    setSelectedEmails(new Set());
  };

  const handleResetExclusions = () => {
    setExcludedEmails(new Set());
    setSelectedEmails(new Set());
  };

  // --------------------------------------------------------------------------
  // 3. LOGICA DI CANCELLAZIONE PERSISTENTE DELLE CAMPAGNE DALLO STORICO
  // --------------------------------------------------------------------------
  const handleToggleSelectLog = (logId: string) => {
    const next = new Set(selectedLogIds);
    if (next.has(logId)) {
      next.delete(logId);
    } else {
      next.add(logId);
    }
    setSelectedLogIds(next);
  };

  const handleToggleSelectAllLogs = () => {
    if (selectedLogIds.size === campaignLogs.length && campaignLogs.length > 0) {
      setSelectedLogIds(new Set());
    } else {
      const next = new Set<string>();
      campaignLogs.forEach((l) => next.add(l.id));
      setSelectedLogIds(next);
    }
  };

  const handleDeleteSelectedLogs = () => {
    if (selectedLogIds.size === 0) return;
    if (!window.confirm(`Confermi di voler eliminare ${selectedLogIds.size} campagne selezionate dallo storico?`)) return;

    // Individua le campagne da cancellare per aggiornare la history
    const logsToDelete = campaignLogs.filter((log) => selectedLogIds.has(log.id));
    const codesToDelete = new Set(logsToDelete.map((l) => l.campaignCode));

    const remainingLogs = campaignLogs.filter((log) => !selectedLogIds.has(log.id));

    // Aggiorna lo stato locale React e il localStorage dei log
    setCampaignLogs(remainingLogs);
    localStorage.setItem('fpv_newsletter_logs', JSON.stringify(remainingLogs));

    // Aggiorna anche la storia delle email rimuovendo i codici cancellati se non più presenti in altri log
    const remainingCodes = new Set(remainingLogs.map((l) => l.campaignCode));
    const newHistory = { ...history };
    let historyChanged = false;

    codesToDelete.forEach((code) => {
      if (!remainingCodes.has(code)) {
        Object.keys(newHistory).forEach((email) => {
          if (newHistory[email]?.includes(code)) {
            newHistory[email] = newHistory[email].filter((c) => c !== code);
            historyChanged = true;
          }
        });
      }
    });

    if (historyChanged) {
      setHistory(newHistory);
      localStorage.setItem('emailHistory', JSON.stringify(newHistory));
      localStorage.setItem('fpv_newsletter_history', JSON.stringify(newHistory));
    }

    setSelectedLogIds(new Set());
    setStatus({ ok: true, text: `✅ Eliminate con successo ${logsToDelete.length} campagne dallo storico.` });
  };

  // --------------------------------------------------------------------------
  // Invio Campagna alla PLAYLIST ATTIVA
  // --------------------------------------------------------------------------
  const handleSend = async () => {
    if (!campaignCode || !subject || !message || !senderAccount) {
      alert('Compila tutti i campi obbligatori: Codice Campagna, Oggetto, Messaggio e Account Mittente.');
      return;
    }

    if (activePlaylistEmails.length === 0) {
      setStatus({ ok: false, text: 'Nessun contatto selezionato nella Playlist attiva.' });
      alert('⚠️ Seleziona almeno un contatto nella Playlist (tramite le checkbox nella tabella o nelle OTA) per procedere con l\'invio.');
      return;
    }

    setSending(true);
    setStatus(null);
    const BATCH_SIZE = 25;
    const totalBatches = Math.ceil(activePlaylistEmails.length / BATCH_SIZE);
    let successCount = 0;
    let lastError = '';

    const sentRecipients: { name: string; email: string }[] = [];

    for (let i = 0; i < totalBatches; i++) {
      setStatus({
        ok: true,
        text: `⏳ Invio Playlist (${i + 1} di ${totalBatches} blocchi)...`
      });

      const batch = activePlaylistEmails.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE);

      try {
        const res = await fetch('/api/resort/send-newsletter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ emails: batch, subject, message, senderAccount })
        });

        if (res.ok) {
          successCount += batch.length;
          batch.forEach((em) => {
            const guestObj = allUniqueGuests.find((g) => g.email === em);
            sentRecipients.push({ name: guestObj?.name || 'Ospite', email: em });
          });
        } else {
          const errData = await res.json().catch(() => ({}));
          console.error('Errore blocco newsletter', i, errData);
          lastError = errData.error || errData.message || `Errore HTTP ${res.status}`;
        }
      } catch (e: any) {
        console.error('Errore rete blocco newsletter', i, e);
        lastError = e?.message || 'Errore di connessione di rete';
      }

      if (i < totalBatches - 1) {
        await new Promise((r) => setTimeout(r, 3000));
      }
    }

    if (successCount > 0) {
      const newHistory = { ...history };
      activePlaylistEmails.forEach((em) => {
        if (!newHistory[em]) newHistory[em] = [];
        if (!newHistory[em].includes(campaignCode.trim())) {
          newHistory[em].push(campaignCode.trim());
        }
      });
      localStorage.setItem('emailHistory', JSON.stringify(newHistory));
      localStorage.setItem('fpv_newsletter_history', JSON.stringify(newHistory));
      setHistory(newHistory);

      const newLogEntry: CampaignLogEntry = {
        id: String(Date.now()),
        timestamp: formatDateDDMMYY(new Date().toISOString()) + `, ${new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}`,
        campaignCode: campaignCode.trim(),
        subject: subject.trim(),
        senderAccount,
        count: successCount,
        recipients: sentRecipients
      };
      const updatedLogs = [newLogEntry, ...campaignLogs];
      setCampaignLogs(updatedLogs);
      localStorage.setItem('fpv_newsletter_logs', JSON.stringify(updatedLogs));

      setStatus({
        ok: true,
        text: `✅ Finito! Spedito con successo a ${successCount} contatti della Playlist.${lastError ? ` (Note: ${lastError})` : ''}`
      });
    } else {
      setStatus({ ok: false, text: `Errore: ${lastError || 'Nessun invio riuscito.'}` });
    }

    setSending(false);
  };

  const handleClearHistory = () => {
    if (!campaignCode) {
      alert('Inserisci il codice campagna per azzerarne lo stato.');
      return;
    }
    if (!window.confirm(`Cancellare lo stato della campagna per "${campaignCode}"?`)) return;
    const newHistory = { ...history };
    Object.keys(newHistory).forEach((email) => {
      newHistory[email] = newHistory[email].filter((c) => c !== campaignCode.trim());
    });
    localStorage.setItem('emailHistory', JSON.stringify(newHistory));
    localStorage.setItem('fpv_newsletter_history', JSON.stringify(newHistory));
    setHistory(newHistory);
    setStatus({ ok: true, text: `Storia campagna "${campaignCode}" azzerata.` });
  };

  const handleClearLogs = () => {
    if (!window.confirm('Cancellare interamente lo storico log invii?')) return;
    setCampaignLogs([]);
    setSelectedLogIds(new Set());
    localStorage.removeItem('fpv_newsletter_logs');
  };

  return (
    <div className="bg-emerald-950/20 border-2 border-emerald-500/40 rounded-3xl p-5 sm:p-6 shadow-xl shadow-emerald-950/30 space-y-6 ring-1 ring-emerald-500/10 relative">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-emerald-500/30 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-300 flex-shrink-0 shadow shadow-emerald-900/40">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-white tracking-tight">
              📧 Gestione Contatti & Newsletter
            </h3>
            <p className="text-stone-400 text-xs font-medium">
              Compositore invii, selezione Playlist dinamica e filtri avanzati per agenzie OTA.
            </p>
          </div>
        </div>
        <span className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider whitespace-nowrap">
          BCC — Privacy Garantita
        </span>
      </div>

      {/* Card Statistiche Superiori (Dinamiche su Codice Campagna) */}
      <div className="grid grid-cols-3 gap-3">
        {/* Card 1: Totale Univoci */}
        <div
          onClick={() => {
            setActiveFilter('all');
            setIsListOpen(true);
          }}
          className={`p-3.5 rounded-2xl text-center transition-all cursor-pointer select-none ${
            activeFilter === 'all'
              ? 'bg-stone-900 border-2 border-cyan-400 shadow-lg shadow-cyan-950/50 ring-2 ring-cyan-500/30 scale-[1.02]'
              : 'bg-stone-950/60 border border-stone-800 hover:bg-stone-900/80 hover:opacity-90'
          }`}
        >
          <div className="text-2xl font-black text-white">{allUniqueGuests.length}</div>
          <div className="text-[10px] text-stone-300 font-extrabold uppercase tracking-wider flex items-center justify-center gap-1 mt-1">
            <Users className="w-3 h-3 text-cyan-400" /> Totale Univoci
          </div>
        </div>

        {/* Card 2: Da Avvisare (Dinamico) */}
        <div
          onClick={() => {
            if (codeActive) {
              setActiveFilter('warn');
              setIsListOpen(true);
            }
          }}
          className={`p-3.5 rounded-2xl text-center transition-all select-none ${
            codeActive ? 'cursor-pointer hover:opacity-90' : 'opacity-60 cursor-not-allowed'
          } ${
            activeFilter === 'warn' && codeActive
              ? 'bg-rose-950/60 border-2 border-amber-400 shadow-lg shadow-rose-950/50 ring-2 ring-amber-500/30 scale-[1.02]'
              : 'bg-rose-950/30 border border-rose-700/30'
          }`}
          title={!codeActive ? 'Inserisci un Codice Campagna nel compositore per attivare la verifica' : ''}
        >
          <div className="text-2xl font-black text-rose-400">
            {codeActive ? pendingGuests.length : 0}
          </div>
          <div className="text-[10px] text-rose-400 font-extrabold uppercase tracking-wider flex items-center justify-center gap-1 mt-1">
            <Clock className="w-3 h-3 text-rose-400" /> Da Avvisare
          </div>
        </div>

        {/* Card 3: Già Avvisati (Dinamico) */}
        <div
          onClick={() => {
            if (codeActive) {
              setActiveFilter('already');
              setIsListOpen(true);
            }
          }}
          className={`p-3.5 rounded-2xl text-center transition-all select-none ${
            codeActive ? 'cursor-pointer hover:opacity-90' : 'opacity-60 cursor-not-allowed'
          } ${
            activeFilter === 'already' && codeActive
              ? 'bg-emerald-950/60 border-2 border-emerald-400 shadow-lg shadow-emerald-950/50 ring-2 ring-emerald-500/30 scale-[1.02]'
              : 'bg-emerald-950/30 border border-emerald-700/30'
          }`}
          title={!codeActive ? 'Inserisci un Codice Campagna nel compositore per attivare la verifica' : ''}
        >
          <div className="text-2xl font-black text-emerald-400">
            {codeActive ? notifiedGuests.length : 0}
          </div>
          <div className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-wider flex items-center justify-center gap-1 mt-1">
            <CheckCircle className="w-3 h-3 text-emerald-400" /> Già Avvisati
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* COMPOSITORE "TABULA RASA" (Inizialmente vuoto)                        */}
      {/* ==================================================================== */}
      <div className="bg-stone-950/90 border border-stone-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-inner">
        <div className="flex items-center justify-between border-b border-stone-800 pb-2">
          <h4 className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Compositore Campagna Email
          </h4>
          <span className="text-[10px] text-stone-500 font-medium italic">
            Inserisci i dati del messaggio per attivare l'invio
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-3 h-3 text-emerald-400" />
              Codice Campagna
            </label>
            <input
              type="text"
              placeholder="Es. PROMO_AGOSTO_2026"
              value={campaignCode}
              onChange={(e) => setCampaignCode(e.target.value)}
              className="w-full bg-stone-900 border border-stone-700 focus:border-emerald-500 rounded-2xl px-4 py-2.5 text-sm text-white font-mono font-bold placeholder:text-stone-600 outline-none transition-colors"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
              <Mail className="w-3 h-3 text-emerald-400" />
              Oggetto Email
            </label>
            <input
              type="text"
              placeholder="Inserisci l'oggetto dell'email..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={150}
              className="w-full bg-stone-900 border border-stone-700 focus:border-emerald-500 rounded-2xl px-4 py-2.5 text-sm text-white placeholder:text-stone-600 outline-none transition-colors"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
              <AtSign className="w-3 h-3 text-emerald-400" />
              Account Mittente
            </label>
            <select
              value={senderAccount}
              onChange={(e) => setSenderAccount(e.target.value)}
              className="w-full bg-stone-900 border border-stone-700 focus:border-emerald-500 rounded-2xl px-4 py-2.5 text-sm text-stone-200 outline-none transition-colors cursor-pointer"
            >
              <option value="">-- Seleziona Account Mittente --</option>
              <option value="phayam">Usa: flowerpowerphayam@gmail.com</option>
              <option value="red">Usa: redflowerpower@gmail.com</option>
            </select>
          </div>
        </div>

        {/* Messaggio */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-stone-300 uppercase tracking-wider">
            Corpo del Messaggio
          </label>
          <textarea
            placeholder="Scrivi qui il contenuto dell'email..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="w-full bg-stone-900 border border-stone-700 focus:border-emerald-500 rounded-2xl px-4 py-3 text-sm text-white placeholder:text-stone-600 outline-none transition-colors resize-y leading-relaxed"
          />
        </div>

        {/* Pulsanti Azione Campagna */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-stone-800">
          <div className="flex-1 space-y-1">
            {status && (
              <div className={`flex items-start gap-2 text-xs font-bold ${status.ok ? 'text-emerald-400' : 'text-red-400'}`}>
                {status.ok
                  ? <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  : <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                }
                <span>{status.text}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {campaignCode && (
              <button
                type="button"
                onClick={handleClearHistory}
                className="py-2 px-3 bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white border border-stone-700 text-[10px] font-bold uppercase rounded-xl transition-all cursor-pointer"
                title={`Azzera lo stato per la campagna "${campaignCode}"`}
              >
                ↺ Reset Stato Campagna
              </button>
            )}
            <button
              type="button"
              onClick={handleSend}
              disabled={sending || activePlaylistEmails.length === 0}
              className="flex items-center gap-2 py-2.5 px-5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 disabled:opacity-40 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all cursor-pointer whitespace-nowrap"
            >
              {sending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Invio in corso...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Invia a Playlist ({activePlaylistEmails.length} Selezionati)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* PANNELLO FILTRI SMART ESTESO (Passate, Future, Intervallo Date)       */}
      {/* ==================================================================== */}
      <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-4 space-y-4 shadow-inner">
        <div className="flex items-center justify-between border-b border-stone-800 pb-2">
          <div className="flex items-center gap-2 text-xs font-black text-white uppercase tracking-wider">
            <Filter className="w-4 h-4 text-emerald-400" />
            <span>⚡ Pannello Filtri Smart Avanzati</span>
          </div>
          {(startDate || endDate || timeFilter !== 'all' || contactFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setTimeFilter('all');
                setContactFilter('all');
                setStartDate('');
                setEndDate('');
              }}
              className="text-[10px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 uppercase transition-colors cursor-pointer"
            >
              <X className="w-3 h-3" /> Resetta Filtri
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Filtro Temporale */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1">
              <Calendar className="w-3 h-3 text-cyan-400" />
              Filtro Temporale
            </label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'all', label: 'Tutti' },
                { id: 'future', label: 'Prenotazioni Future' },
                { id: 'past', label: 'Prenotazioni Passate' },
                { id: 'checkin_today', label: 'In Arrivo Oggi' },
                { id: 'in_house', label: 'In Soggiorno' },
                { id: 'checkout_today', label: 'In Partenza Oggi' },
                { id: 'next_7_days', label: 'Prossimi 7 Giorni' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setTimeFilter(opt.id as TimeFilterOption)}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-xl border transition-all cursor-pointer ${
                    timeFilter === opt.id
                      ? 'bg-cyan-950 border-cyan-400 text-cyan-300 shadow shadow-cyan-950'
                      : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-white hover:bg-stone-800'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Intervallo Date Personalizzato (Calendario Da / A) */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1">
              <CalendarDays className="w-3 h-3 text-amber-400" />
              Intervallo Date (Calendario)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[9px] text-stone-500 uppercase font-bold block mb-0.5">Da Data:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-700 text-stone-200 text-xs rounded-xl px-2.5 py-1.5 outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <span className="text-[9px] text-stone-500 uppercase font-bold block mb-0.5">A Data:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-700 text-stone-200 text-xs rounded-xl px-2.5 py-1.5 outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Filtro Tipo Contatto */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1">
              <Phone className="w-3 h-3 text-emerald-400" />
              Filtro Tipo Contatto
            </label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'all', label: 'Tutti i Contatti' },
                { id: 'email', label: 'Solo con Email' },
                { id: 'whatsapp', label: 'Solo WhatsApp / Tel' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setContactFilter(opt.id as ContactFilterOption)}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-xl border transition-all cursor-pointer ${
                    contactFilter === opt.id
                      ? 'bg-emerald-950 border-emerald-400 text-emerald-300 shadow shadow-emerald-950'
                      : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-white hover:bg-stone-800'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* BANNER PLAYLIST ATTIVA (CONTATORE DINAMICO PER INVIO)             */}
      {/* ==================================================================== */}
      <div className="bg-gradient-to-r from-stone-900 via-emerald-950/60 to-stone-900 border-2 border-emerald-500/50 rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-300 flex-shrink-0">
            <ListMusic className="w-5 h-5 animate-pulse text-emerald-400" />
          </div>
          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
              🎵 PLAYLIST ATTIVA INVIO: <span className="text-emerald-400 text-sm font-mono font-black">{activePlaylistEmails.length} CONTATTI SELEZIONATI</span>
            </h4>
            <p className="text-[11px] text-stone-400 font-medium">
              Premendo "Invia", il messaggio verrà spedito esclusivamente ai contatti della Playlist spuntati nelle checkbox.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={handleToggleSelectAll}
            className="px-3 py-1.5 bg-emerald-900/80 hover:bg-emerald-800 border border-emerald-600/60 text-emerald-200 text-xs font-black uppercase rounded-xl transition-all cursor-pointer shadow"
          >
            {isAllSelected ? 'Deseleziona Tutti' : 'Seleziona Tutti Visibili'}
          </button>

          {activePlaylistEmails.length > 0 && (
            <button
              type="button"
              onClick={handleClearPlaylist}
              className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold uppercase rounded-xl transition-all cursor-pointer"
            >
              Svuota Playlist
            </button>
          )}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* TABELLA UNIFICATA CLIENTI & ACCORDION RAGGRUPPATI PER OTA           */}
      {/* ==================================================================== */}
      <div className="border-t border-stone-800 pt-3 space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-stone-900 border border-stone-800 px-4 py-3 rounded-2xl">
          <button
            type="button"
            onClick={() => setIsListOpen((v) => !v)}
            className="flex items-center gap-2 text-xs font-extrabold text-white uppercase tracking-wider cursor-pointer"
          >
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>
              Contatti Unificati ({displayedGuests.length} visibili in {otaKeys.length} agenzie OTA)
            </span>
            {isListOpen ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => toggleAllOtaAccordions(true)}
              className="text-[10px] font-bold text-stone-400 hover:text-cyan-300 uppercase transition-colors cursor-pointer"
            >
              Espandi Tutte le OTA
            </button>
            <span className="text-stone-700">|</span>
            <button
              type="button"
              onClick={() => toggleAllOtaAccordions(false)}
              className="text-[10px] font-bold text-stone-400 hover:text-cyan-300 uppercase transition-colors cursor-pointer"
            >
              Comprimi Tutte
            </button>

            {excludedEmails.size > 0 && (
              <button
                type="button"
                onClick={handleResetExclusions}
                className="flex items-center gap-1.5 px-3 py-1 bg-amber-950/60 hover:bg-amber-900/80 border border-amber-600/40 text-amber-300 text-[10px] font-bold uppercase rounded-xl transition-all cursor-pointer ml-2"
              >
                <RefreshCw className="w-3 h-3" /> Ripristina Esclusi ({excludedEmails.size})
              </button>
            )}
            {selectedEmails.size > 0 && (
              <button
                type="button"
                onClick={handleExcludeSelected}
                className="flex items-center gap-1.5 px-3 py-1 bg-rose-950/80 hover:bg-rose-900 border border-rose-600/50 text-rose-200 text-[10px] font-extrabold uppercase rounded-xl shadow transition-all cursor-pointer ml-2"
              >
                <Trash2 className="w-3 h-3 text-rose-400" /> Escludi Selezionati ({selectedEmails.size})
              </button>
            )}
          </div>
        </div>

        {isListOpen && (
          <div className="space-y-3">
            {otaKeys.length === 0 ? (
              <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-6 text-center text-stone-500 italic text-xs">
                Nessun cliente risponde ai filtri selezionati.
              </div>
            ) : (
              otaKeys.map((otaName) => {
                const groupGuests = guestsByOta[otaName] || [];
                const isOpen = Boolean(openOtas[otaName]);
                const otaGroupSelected = isOtaGroupAllSelected(otaName);
                const isTestGroup = otaName === '🧪 TEST / VERIFICA';

                return (
                  <div
                    key={otaName}
                    className={`border rounded-2xl overflow-hidden shadow-lg transition-all ${
                      isTestGroup
                        ? 'bg-indigo-950/40 border-indigo-500/60 ring-1 ring-indigo-500/30'
                        : 'bg-stone-950/90 border-stone-800/80'
                    }`}
                  >
                    {/* Header Riga OTA Accordion con Checkbox "Seleziona Tutti" per OTA */}
                    <div
                      onClick={() => toggleOtaAccordion(otaName)}
                      className={`w-full flex items-center justify-between px-4 py-3 border-b text-left transition-colors cursor-pointer select-none ${
                        isTestGroup
                          ? 'bg-indigo-900/40 hover:bg-indigo-900/60 border-indigo-500/40'
                          : 'bg-stone-900/90 hover:bg-stone-850 border-stone-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={(e) => handleToggleSelectOtaGroup(otaName, e)}
                          className="text-stone-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                          title={otaGroupSelected ? `Deseleziona tutti per ${otaName}` : `Seleziona tutti per ${otaName}`}
                        >
                          {otaGroupSelected ? (
                            <CheckSquare className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 flex-shrink-0" />
                          )}
                          <span className="text-[10px] font-bold text-stone-400 uppercase hidden sm:inline">
                            {otaGroupSelected ? 'Tutti Selezionati' : 'Seleziona OTA'}
                          </span>
                        </button>

                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${getOtaBadgeStyle(otaName)}`}>
                          {isTestGroup ? <FlaskConical className="w-3 h-3 inline-block mr-1 opacity-90 text-indigo-300" /> : <Globe className="w-3 h-3 inline-block mr-1 opacity-70" />}
                          {otaName}
                        </span>
                        <span className={`text-xs font-extrabold ${isTestGroup ? 'text-indigo-200' : 'text-stone-200'}`}>
                          ({groupGuests.length} {groupGuests.length === 1 ? 'contatto' : 'contatti'})
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider hidden sm:inline">
                          {isOpen ? 'Comprimi' : 'Espandi'}
                        </span>
                        {isOpen ? (
                          <ChevronUp className={`w-4 h-4 ${isTestGroup ? 'text-indigo-400' : 'text-emerald-400'}`} />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-stone-400" />
                        )}
                      </div>
                    </div>

                    {/* Tabella Clienti per l'OTA selezionata */}
                    {isOpen && (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-stone-300">
                          <thead className={`${isTestGroup ? 'bg-indigo-950/60 text-indigo-200' : 'bg-stone-900/50 text-stone-400'} font-bold uppercase text-[10px] tracking-wider border-b border-stone-800`}>
                            <tr>
                              <th className="py-2.5 px-3 w-10 text-center">
                                <button
                                  type="button"
                                  onClick={(e) => handleToggleSelectOtaGroup(otaName, e)}
                                  className="text-stone-400 hover:text-white transition-colors cursor-pointer"
                                  title={otaGroupSelected ? `Deseleziona tutti per ${otaName}` : `Seleziona tutti per ${otaName}`}
                                >
                                  {otaGroupSelected ? <CheckSquare className="w-4 h-4 text-emerald-400" /> : <Square className="w-4 h-4" />}
                                </button>
                              </th>
                              <th className="py-2.5 px-3">Cliente (Click per Dettagli)</th>
                              <th className="py-2.5 px-3">Email (Invio Diretto)</th>
                              <th className="py-2.5 px-3">WhatsApp / Telefono</th>
                              <th className="py-2.5 px-3 text-center">Check-in / Check-out (gg/mm/aa)</th>
                              <th className="py-2.5 px-3 text-right">Stato Invio</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-800/50">
                            {groupGuests.map((g) => {
                              const hasNoContacts = !g.email && !g.phone;
                              const isSelected = Boolean(g.email && selectedEmails.has(g.email));
                              const cleanPhoneNum = g.phone.replace(/[^0-9]/g, '');

                              return (
                                <tr
                                  key={g.id}
                                  className={`hover:bg-stone-900/80 transition-colors ${
                                    hasNoContacts
                                      ? 'opacity-60 bg-stone-950/40'
                                      : isSelected
                                      ? isTestGroup
                                        ? 'bg-indigo-950/50'
                                        : 'bg-emerald-950/30'
                                      : ''
                                  }`}
                                >
                                  {/* Checkbox Playlist (Disabilitata per chi ha hasNoContacts) */}
                                  <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                                    <button
                                      type="button"
                                      disabled={hasNoContacts}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (!hasNoContacts && g.email) {
                                          handleToggleSelectOne(g.email);
                                        }
                                      }}
                                      className={`transition-colors ${
                                        hasNoContacts
                                          ? 'opacity-30 cursor-not-allowed text-stone-600'
                                          : 'text-stone-400 hover:text-white cursor-pointer'
                                      }`}
                                      title={hasNoContacts ? 'Nessun recapito disponibile per la selezione' : isSelected ? 'Deseleziona' : 'Seleziona'}
                                    >
                                      {isSelected ? <CheckSquare className="w-4 h-4 text-emerald-400" /> : <Square className="w-4 h-4" />}
                                    </button>
                                  </td>

                                  {/* Nome Cliente Cliccabile -> Modal Popup Prenotazione */}
                                  <td
                                    className="py-2.5 px-3 font-extrabold cursor-pointer hover:text-emerald-300 transition-colors"
                                    onClick={() => setSelectedBooking(g.rawBooking || g)}
                                    title="Clicca per aprire la scheda di dettaglio prenotazione intera"
                                  >
                                    <span className="flex items-center gap-1.5 flex-wrap">
                                      <span className={`${hasNoContacts ? 'text-stone-500 font-semibold' : 'text-white'} hover:underline`}>
                                        {g.name}
                                      </span>
                                      <FileText className="w-3.5 h-3.5 text-stone-500 opacity-60 hover:opacity-100" />
                                    </span>
                                  </td>

                                  {/* Email + Azione Singola Email */}
                                  <td className="py-2.5 px-3 font-mono text-xs">
                                    {g.email ? (
                                      <a
                                        href={`mailto:${g.email}?subject=${encodeURIComponent(subject || 'Flower Power Village')}`}
                                        className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
                                        title="Invia email singola"
                                      >
                                        <Mail className="w-3 h-3 flex-shrink-0" />
                                        <span>{g.email}</span>
                                      </a>
                                    ) : (
                                      <span className="text-stone-600 italic text-[11px]">Nessuna email</span>
                                    )}
                                  </td>

                                  {/* Telefono + Azione Singola WhatsApp */}
                                  <td className="py-2.5 px-3">
                                    {g.phone ? (
                                      <a
                                        href={`https://wa.me/${cleanPhoneNum}?text=${encodeURIComponent(`Ciao ${g.name}, da Flower Power Village Koh Phayam...`)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-600/50 text-emerald-300 font-bold text-[10px] rounded-xl transition-all shadow-sm cursor-pointer"
                                        title="Apri chat WhatsApp"
                                      >
                                        <MessageSquare className="w-3 h-3 text-emerald-400" />
                                        <span>WhatsApp ({g.phone})</span>
                                      </a>
                                    ) : (
                                      <span className="text-stone-600 italic text-[11px]">Nessun telefono</span>
                                    )}
                                  </td>

                                  {/* Date Checkin/Checkout Formattate Rigidamente in gg/mm/aa */}
                                  <td className="py-2.5 px-3 text-center font-mono text-stone-400 text-[11px]">
                                    {formatDateDDMMYY(g.checkin)} <span className="text-stone-600">→</span> {formatDateDDMMYY(g.checkout)}
                                  </td>

                                  {/* Stato Invio Dinamico su Codice Campagna */}
                                  <td className="py-2.5 px-3 text-right">
                                    {!codeActive ? (
                                      <span className="inline-flex items-center gap-1 text-stone-400 font-extrabold text-[10px] uppercase bg-stone-900 border border-stone-800 px-2.5 py-0.5 rounded-full">
                                        ⚪ Pronto
                                      </span>
                                    ) : g.isNotified ? (
                                      <span className="inline-flex items-center gap-1 text-emerald-400 font-extrabold text-[10px] uppercase">
                                        ✅ Inviato
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 text-rose-400 font-extrabold text-[10px] uppercase">
                                        ✉️ Da Avvisare
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* STORICO CAMPAGNE INVIATE (CON SELEZIONE MULTIPLA E CANCELLAZIONE)    */}
      {/* ==================================================================== */}
      <div className="border-t border-stone-800 pt-3 space-y-3">
        <button
          type="button"
          onClick={() => setIsHistoryOpen((v) => !v)}
          className="w-full flex justify-between items-center bg-stone-900 hover:bg-stone-850 border border-stone-800 px-4 py-2.5 rounded-2xl text-xs font-extrabold text-stone-300 uppercase tracking-wider transition-all cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-400" />
            📋 Storico Invii Campagne ({campaignLogs.length} invii salvati)
          </span>
          {isHistoryOpen ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
        </button>

        {isHistoryOpen && (
          <div className="bg-stone-950/70 border border-stone-800 rounded-2xl p-4 space-y-3">
            {campaignLogs.length === 0 ? (
              <p className="text-stone-500 text-xs italic text-center py-4">
                Nessun invio salvato nello storico.
              </p>
            ) : (
              <>
                {/* Header Azioni Storico: Checkbox Seleziona Tutte + Tasto Elimina Selezionate */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2 pb-2 border-b border-stone-800/80">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleToggleSelectAllLogs}
                      className="flex items-center gap-1.5 text-[10px] font-bold text-stone-400 hover:text-white uppercase transition-colors cursor-pointer"
                    >
                      {selectedLogIds.size === campaignLogs.length && campaignLogs.length > 0 ? (
                        <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Square className="w-3.5 h-3.5" />
                      )}
                      <span>{selectedLogIds.size === campaignLogs.length && campaignLogs.length > 0 ? 'Deseleziona Tutte' : 'Seleziona Tutte'}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {selectedLogIds.size > 0 && (
                      <button
                        type="button"
                        onClick={handleDeleteSelectedLogs}
                        className="flex items-center gap-1.5 px-3 py-1 bg-rose-950/90 hover:bg-rose-900 border border-rose-600/60 text-rose-200 text-[10px] font-black uppercase rounded-xl transition-all shadow cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3 text-rose-400" />
                        <span>Elimina Selezionate ({selectedLogIds.size})</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleClearLogs}
                      className="text-[10px] font-bold text-stone-500 hover:text-rose-400 uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      🗑️ Svuota Tutto lo Storico
                    </button>
                  </div>
                </div>

                <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                  {campaignLogs.map((log) => {
                    const isLogSelected = selectedLogIds.has(log.id);

                    return (
                      <div
                        key={log.id}
                        className={`border rounded-2xl p-3.5 space-y-2.5 text-xs transition-all ${
                          isLogSelected
                            ? 'bg-rose-950/30 border-rose-600/50 ring-1 ring-rose-500/30'
                            : 'bg-stone-900/80 border-stone-800'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-stone-800 pb-2">
                          <div className="flex items-center gap-2.5">
                            {/* Checkbox per Selezione Singola Campagna */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleSelectLog(log.id);
                              }}
                              className="text-stone-400 hover:text-white transition-colors cursor-pointer flex-shrink-0"
                              title={isLogSelected ? 'Deseleziona campagna' : 'Seleziona campagna da eliminare'}
                            >
                              {isLogSelected ? (
                                <CheckSquare className="w-4 h-4 text-rose-400" />
                              ) : (
                                <Square className="w-4 h-4 text-stone-500" />
                              )}
                            </button>

                            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black px-2.5 py-0.5 rounded-md font-mono">
                              {log.campaignCode}
                            </span>
                            <span className="text-stone-200 font-bold truncate max-w-xs sm:max-w-md">
                              {log.subject}
                            </span>
                          </div>
                          <span className="text-stone-500 text-[11px] font-mono">
                            🕒 {log.timestamp}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center justify-between text-[11px] text-stone-400 gap-2">
                          <div>
                            Mittente: <span className="text-stone-200 font-bold">{log.senderAccount === 'red' ? 'redflowerpower@gmail.com' : 'flowerpowerphayam@gmail.com'}</span>
                          </div>
                          <div>
                            Destinatari: <span className="text-emerald-400 font-black">{log.count} inviati con successo</span>
                          </div>
                        </div>

                        {/* Dettaglio Espandibile Destinatari nello Storico */}
                        <details className="text-[11px] text-stone-400 cursor-pointer pt-1 group">
                          <summary className="hover:text-emerald-300 font-bold select-none py-1.5 px-3 bg-stone-950/80 border border-stone-800 rounded-xl flex items-center justify-between transition-colors">
                            <span className="flex items-center gap-2 text-stone-300">
                              <Users className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Visualizza {log.recipients?.length || log.count} destinatari inviati</span>
                            </span>
                            <ChevronDown className="w-3.5 h-3.5 text-stone-500 group-open:rotate-180 transition-transform" />
                          </summary>
                          <div className="mt-2 bg-stone-950 border border-stone-800/90 rounded-2xl p-3 max-h-52 overflow-y-auto space-y-1.5">
                            <div className="grid grid-cols-2 gap-2 text-[10px] font-black text-stone-500 uppercase pb-1 border-b border-stone-800 px-1">
                              <span>Nome Cliente</span>
                              <span>Indirizzo Email</span>
                            </div>
                            {(log.recipients || []).map((r, idx) => (
                              <div key={idx} className="grid grid-cols-2 gap-2 text-stone-300 border-b border-stone-900/80 pb-1 pt-0.5 px-1 last:border-0 hover:bg-stone-900/40 rounded">
                                <span className="font-semibold text-white truncate">{r.name}</span>
                                <span className="font-mono text-stone-400 text-[10px] truncate">{r.email}</span>
                              </div>
                            ))}
                          </div>
                        </details>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* MODAL POPUP FLUTTUANTE DETTAGLIO PRENOTAZIONE INTERO               */}
      {/* ==================================================================== */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-stone-950 border-2 border-emerald-500/50 rounded-3xl max-w-xl w-full p-6 shadow-2xl shadow-emerald-950/50 space-y-5 ring-1 ring-emerald-500/20 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
                  <Ticket className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white tracking-tight">
                    🏷️ Dettaglio Prenotazione — {getGuestName(selectedBooking)}
                  </h3>
                  <p className="text-stone-400 text-xs font-mono">
                    ID / Codice: {getBookingCode(selectedBooking)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="w-8 h-8 rounded-full bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Periodo & Notti */}
              <div className="bg-stone-900/80 border border-stone-800 p-3 rounded-2xl space-y-1">
                <div className="text-[10px] text-stone-400 font-extrabold uppercase flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Periodo & Notti
                </div>
                <div className="font-mono text-white font-bold text-xs">
                  {formatDateDDMMYY(getCheckin(selectedBooking))} <span className="text-stone-500">→</span> {formatDateDDMMYY(getCheckout(selectedBooking))}
                </div>
                <div className="text-[10px] text-cyan-300 font-extrabold flex items-center gap-1 pt-0.5">
                  <Moon className="w-3 h-3 text-cyan-400" />
                  <span>Totale Notti: {getBookingNights(selectedBooking)} {getBookingNights(selectedBooking) === 1 ? 'notte' : 'notti'}</span>
                </div>
              </div>

              {/* Alloggio */}
              <div className="bg-stone-900/80 border border-stone-800 p-3 rounded-2xl space-y-1">
                <div className="text-[10px] text-stone-400 font-extrabold uppercase flex items-center gap-1">
                  <BedDouble className="w-3.5 h-3.5 text-emerald-400" /> Alloggio & Pax
                </div>
                <div className="text-white font-bold text-xs truncate">
                  {getBookingAccommodation(selectedBooking)}
                </div>
                <div className="text-[10px] text-stone-400 font-medium">
                  Numero Ospiti: <span className="text-emerald-300 font-bold">{getBookingPax(selectedBooking)} Pax</span>
                </div>
              </div>

              {/* Canale OTA */}
              <div className="bg-stone-900/80 border border-stone-800 p-3 rounded-2xl space-y-1">
                <div className="text-[10px] text-stone-400 font-extrabold uppercase flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-purple-400" /> Canale Prenotazione
                </div>
                <div>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black border ${getOtaBadgeStyle(getOtaSource(selectedBooking))}`}>
                    {getOtaSource(selectedBooking)}
                  </span>
                </div>
              </div>

              {/* Nazione */}
              <div className="bg-stone-900/80 border border-stone-800 p-3 rounded-2xl space-y-1">
                <div className="text-[10px] text-stone-400 font-extrabold uppercase flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" /> Nazione Provenienza
                </div>
                <div className="text-white font-bold text-xs">
                  {getBookingCountry(selectedBooking)}
                </div>
              </div>
            </div>

            {/* Dettaglio Finanziario */}
            <div className="bg-stone-900/90 border border-stone-800 p-3.5 rounded-2xl space-y-2">
              <div className="text-[10px] text-stone-400 font-extrabold uppercase tracking-wider flex items-center gap-1 border-b border-stone-800 pb-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Dettaglio Finanziario
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-stone-400 text-[11px] block">Importo Totale:</span>
                  <span className="font-mono text-emerald-400 font-black text-sm">฿{getBookingTotal(selectedBooking)} THB</span>
                </div>
                <div>
                  <span className="text-stone-400 text-[11px] block">Prezzo Netto:</span>
                  <span className="font-mono text-stone-200 font-bold text-xs">{getBookingNet(selectedBooking)}</span>
                </div>
              </div>
            </div>

            {/* Note dell'Ospite */}
            <div className="bg-amber-950/20 border border-amber-500/30 p-3.5 rounded-2xl space-y-1.5">
              <div className="text-[10px] text-amber-400 font-extrabold uppercase tracking-wider flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" /> Note dell'Ospite & Richieste Speciali
              </div>
              <p className="text-xs text-stone-200 leading-relaxed font-sans italic bg-stone-950/80 p-2.5 rounded-xl border border-stone-800/80">
                {getBookingNotes(selectedBooking) || 'Nessuna nota o richiesta speciale registrata per questa prenotazione.'}
              </p>
            </div>

            {/* Modal Footer / Pulsante Chiudi */}
            <div className="flex justify-end pt-2 border-t border-stone-800">
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="py-2.5 px-6 bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all cursor-pointer shadow"
              >
                Chiudi Scheda
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
