import { useEffect, useState } from 'react';
import { useResortAdminStore } from '../store/useResortAdminStore';
import { getAuthorizationUrl, getStoredTokens, clearTokens, exchangeToken } from '../../../booking/lib/octorate';
import { ResortVisualCalendar } from './ResortVisualCalendar';
import { DerivedRatesTreeSection } from './DerivedRatesTreeSection';
import { NewsletterCampaignSection } from './NewsletterCampaignSection';
import { StandardRatesProtectionSection } from './StandardRatesProtectionSection';
import { 
  Hotel, 
  Calendar, 
  Users, 
  DollarSign, 
  Activity, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Coffee, 
  Wind, 
  Search, 
  SlidersHorizontal,
  Plus,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Terminal,
  Key,
  Link,
  Zap,
  Loader2,
  XCircle,
  GitFork,
  AlertTriangle,
  Eye,
  BarChart3,
  Coins
} from 'lucide-react';

export function ResortDashboard() {
  const { 
    bookings, 
    accommodations, 
    loading, 
    error, 
    octorateStatus, 
    octorateDetails, 
    fetchBookings, 
    toggleRoomAvailability, 
    checkOctorateConnection,
    filterCategory,
    executeLastMinuteStrategy,
    resetLastMinuteStrategy,
    lastMinuteStage1Days,
    lastMinuteDiscountStage1,
    lastMinuteStage2Days,
    lastMinuteDiscountStage2,
    lastMinuteStage3Days,
    lastMinuteDiscountStage3,
    executionMode,
    isTestEnvironment,
    isSimulationActive,
    simulatedOctorateGridItems,
    lastMinuteRunning,
    lastMinuteResult,
    setLastMinuteStage1Days,
    setLastMinuteDiscountStage1,
    setLastMinuteStage2Days,
    setLastMinuteDiscountStage2,
    setLastMinuteStage3Days,
    setLastMinuteDiscountStage3,
    setExecutionMode,
    setIsTestEnvironment,
    disableLastMinuteStrategy,
    dynamicMinStayGapFill,
    dynamicMinStayRunning,
    dynamicMinStayResult,
    dynamicMinStayExecutionMode,
    setDynamicMinStayGapFill,
    setDynamicMinStayExecutionMode,
    executeDynamicMinStayStrategy
  } = useResortAdminStore();

  const [activeTab, setActiveTab] = useState<'bookings' | 'calendar_30_days' | 'calendar' | 'rooms' | 'derived_rates' | 'messages' | 'octorate'>('bookings');
  const [searchQuery, setSearchQuery] = useState('');
  // Doppio click per Calendario Annuale (componente pesante ~9000 celle)
  const [calendarConfirm, setCalendarConfirm] = useState(false);
  // Production confirmation modals
  const [showCascadeProdModal, setShowCascadeProdModal] = useState(false);
  const [showMinStayProdModal, setShowMinStayProdModal] = useState(false);

  // Octorate Dev Diagnostics State
  const [showDevDiagnostics, setShowDevDiagnostics] = useState(false);
  const [octorateRooms, setOctorateRooms] = useState<any[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [oauthConnected, setOauthConnected] = useState(false);
  const [oauthUrl, setOauthUrl] = useState('');
  const [oauthLoading, setOauthLoading] = useState(false);

  useEffect(() => {
    fetchBookings();
    checkOctorateConnection();
    getStoredTokens().then((tokens) => {
      setOauthConnected(tokens !== null);
    });
  }, [fetchBookings, checkOctorateConnection]);

  const handleFetchDevRooms = async () => {
    setLoadingRooms(true);
    try {
      const tokens = await getStoredTokens();
      const structureId = octorateDetails?.structureId || '366879';
      if (!tokens) {
        setOctorateRooms([]);
        setLoadingRooms(false);
        return;
      }
      const res = await fetch(`/api-octorate/connect/rest/v1/roomrates/${structureId}`, {
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${tokens.access_token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setOctorateRooms(data);
        }
      }
    } catch (e) {
      console.error('[ResortDashboard] Dev rates fetch error:', e);
    } finally {
      setLoadingRooms(false);
    }
  };

  const handleToggleDiagnostics = () => {
    const nextState = !showDevDiagnostics;
    setShowDevDiagnostics(nextState);
    if (nextState && octorateRooms.length === 0) {
      handleFetchDevRooms();
    }
  };

  const handleSaveToken = async () => {
    if (!oauthUrl) return;
    setOauthLoading(true);
    try {
      const urlObj = new URL(oauthUrl);
      const code = urlObj.searchParams.get("code");
      if (!code) {
        alert("Nessun parametro 'code' trovato nell'URL.");
        setOauthLoading(false);
        return;
      }
      await exchangeToken(code);
      setOauthConnected(true);
      setOauthUrl("");
      alert("Token scambiato e salvato con successo!");
      handleFetchDevRooms();
    } catch (err: any) {
      alert("Errore nello scambio del token: " + err.message);
    } finally {
      setOauthLoading(false);
    }
  };

  const handleClearTokens = async () => {
    const confirmReset = window.confirm(
      "Sei sicuro di voler disconnettere le API Octorate e resettare i token OAuth?\n\nQuesta azione disattiverà la sincronizzazione in tempo reale finché non verrà effettuata una nuova riconnessione."
    );
    if (!confirmReset) return;

    await clearTokens();
    setOauthConnected(false);
    setOctorateRooms([]);
  };

  // ─── computeFinancials: Algoritmo KPI Unificato con Commissioni OTA v7 ──────
  const getChannelKey = (channelName?: string): 'booking.com' | 'agoda' | 'expedia' | 'airbnb' | 'direct' => {
    if (!channelName) return 'direct';
    const c = channelName.toLowerCase().trim();
    if (c.includes('booking')) return 'booking.com';
    if (c.includes('agoda')) return 'agoda';
    if (c.includes('expedia')) return 'expedia';
    if (c.includes('airbnb')) return 'airbnb';
    return 'direct';
  };

  const computeFinancials = () => {
    const bList = bookings || [];
    let grossRevenue = 0;
    let totalCommissions = 0;
    let totalGuests = 0;

    const otaStats: Record<string, { label: string; rate: number; count: number; gross: number; commission: number }> = {
      'booking.com': { label: 'Booking.com', rate: 0.172, count: 0, gross: 0, commission: 0 },
      'agoda': { label: 'Agoda', rate: 0.18, count: 0, gross: 0, commission: 0 },
      'expedia': { label: 'Expedia', rate: 0.15, count: 0, gross: 0, commission: 0 },
      'airbnb': { label: 'Airbnb', rate: 0.15, count: 0, gross: 0, commission: 0 },
      'direct': { label: 'Sito Diretto', rate: 0, count: 0, gross: 0, commission: 0 },
    };

    for (const b of bList) {
      if (!b) continue;
      const price = Number(b.total_price) || 0;
      const key = getChannelKey(b.source_channel);
      const rate = otaStats[key]?.rate || 0;
      const commission = price * rate;

      grossRevenue += price;
      totalCommissions += commission;
      totalGuests += Number(b.guests) || 1;

      if (otaStats[key]) {
        otaStats[key].count += 1;
        otaStats[key].gross += price;
        otaStats[key].commission += commission;
      }
    }

    return {
      grossRevenue,
      totalCommissions,
      netRevenue: grossRevenue - totalCommissions,
      totalGuests,
      totalBookings: bList.length,
      otaStats,
    };
  };

  const fin = computeFinancials();
  const totalBookingsCount = fin.totalBookings;
  const totalRevenue = fin.grossRevenue;
  const totalGuests = fin.totalGuests;
  const availableRoomsCount = (accommodations || []).filter(r => r?.isAvailable).length;


  // Filter bookings
  const filteredBookings = (bookings || []).filter(b => {
    if (!b) return false;
    const searchLower = searchQuery.toLowerCase();
    return !searchQuery || 
      (b.guest_name && b.guest_name.toLowerCase().includes(searchLower)) ||
      (b.guest_email && b.guest_email.toLowerCase().includes(searchLower)) ||
      (b.accommodation_name && b.accommodation_name.toLowerCase().includes(searchLower)) ||
      (b.id && String(b.id).toLowerCase().includes(searchLower));
  });

  // Filter rooms
  const filteredRooms = (accommodations || []).filter(r => {
    if (!r) return false;
    if (filterCategory === 'All') return true;
    return r.category && r.category.toLowerCase() === filterCategory.toLowerCase();
  });

  return (
    <div className="space-y-6 text-stone-100 p-4 sm:p-6" style={{ fontFamily: 'Inter, sans-serif' }}>
      
      {/* Top Banner Stats & Octorate Indicator */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-stone-900/90 border border-stone-800 rounded-3xl p-5 sm:p-6 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Hotel className="w-6 h-6 text-emerald-400" />
              Gestione Resort & Booking Engine
            </h2>
          </div>
          <p className="text-stone-400 text-xs font-medium">
            Koh Phayam Resort · Modulo prenotazioni, alloggi e sincronizzazione Octorate
          </p>
        </div>

        {/* Octorate Status Chip & Controls */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {oauthConnected ? (
            <div className="flex items-center gap-2 bg-stone-950/80 border border-emerald-800/60 px-3.5 py-1.5 rounded-2xl text-xs font-bold shadow-inner">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 font-extrabold text-xs">API Octorate Connesse</span>
              <button
                type="button"
                onClick={handleClearTokens}
                className="px-2.5 py-1 text-[10px] bg-red-900/80 hover:bg-red-800 text-red-100 border border-red-700/60 rounded-xl transition-all cursor-pointer font-black uppercase tracking-wider ml-1 shadow"
                title="Disconnetti le API Octorate e cancella i token"
              >
                Disconnetti / Reset
              </button>
            </div>
          ) : (
            <a
              href={getAuthorizationUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-amber-950/80 border border-amber-800/60 hover:bg-amber-900 px-3.5 py-2 rounded-2xl text-xs font-extrabold text-amber-400 transition-colors shadow"
            >
              <AlertCircle className="w-4 h-4" />
              <span>Connetti API Octorate</span>
            </a>
          )}

          <div className="flex items-center gap-2 bg-stone-950/80 border border-stone-800 px-3 py-2 rounded-2xl text-xs font-bold">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-stone-400 text-[11px] font-mono">
              ID {octorateDetails?.structureId ?? '366879'}
            </span>
          </div>

          <button
            onClick={() => fetchBookings()}
            disabled={loading}
            className="py-2 px-3.5 bg-stone-800 hover:bg-stone-750 text-stone-200 border border-stone-700 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
            <span>Sincronizza</span>
          </button>
        </div>
      </div>

      {/* Sticky Main Navigation Bar */}
      <div className="sticky top-0 z-40 bg-stone-950/90 backdrop-blur-md p-2 rounded-2xl border border-stone-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'bookings'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40 ring-1 ring-emerald-400/30'
                : 'text-stone-400 hover:text-white hover:bg-stone-800/50'
            }`}
          >
            PRENOTAZIONI ({(bookings || []).length})
          </button>

          <button
            onClick={() => setActiveTab('calendar_30_days')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'calendar_30_days'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40 ring-1 ring-emerald-400/30'
                : 'text-stone-400 hover:text-white hover:bg-stone-800/50'
            }`}
          >
            CALENDARIO 30GG
          </button>

          <button
            onClick={() => {
              if (calendarConfirm) {
                setActiveTab('calendar');
                setCalendarConfirm(false);
              } else {
                setCalendarConfirm(true);
                setTimeout(() => setCalendarConfirm(false), 4000);
              }
            }}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'calendar'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40 ring-1 ring-emerald-400/30'
                : calendarConfirm
                ? 'bg-amber-500 text-stone-950 font-bold shadow-md shadow-amber-950/40 animate-pulse'
                : 'text-stone-400 hover:text-white hover:bg-stone-800/50'
            }`}
            title="Componente pesante: clicca 2 volte per caricare il calendario stagionale completo"
          >
            {calendarConfirm && activeTab !== 'calendar'
              ? '⚠️ CLICCA ANCORA PER CARICARE'
              : 'CALENDARIO ANNUALE'}
          </button>

          <button
            onClick={() => setActiveTab('rooms')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'rooms'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40 ring-1 ring-emerald-400/30'
                : 'text-stone-400 hover:text-white hover:bg-stone-800/50'
            }`}
          >
            ALLOGGI & DISPONIBILITÀ ({(accommodations || []).length})
          </button>

          <button
            onClick={() => setActiveTab('derived_rates')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'derived_rates'
                ? 'bg-amber-500 text-stone-950 font-black shadow-md shadow-amber-950/40 ring-1 ring-amber-300/40'
                : 'text-stone-400 hover:text-white hover:bg-stone-800/50'
            }`}
          >
            TARIFFE DERIVATE
          </button>

          <button
            onClick={() => setActiveTab('messages')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'messages'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-950/40 ring-1 ring-rose-400/30'
                : 'text-stone-400 hover:text-white hover:bg-stone-800/50'
            }`}
          >
            MESSAGGI CLIENTI
          </button>

          <button
            onClick={() => setActiveTab('octorate')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'octorate'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40 ring-1 ring-emerald-400/30'
                : 'text-stone-400 hover:text-white hover:bg-stone-800/50'
            }`}
          >
            OCTORATE PMS
          </button>
        </div>

        {/* Search Input for Bookings */}
        {activeTab === 'bookings' && (
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cerca ospite, email, camera..."
              className="w-full bg-stone-900 border border-stone-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-stone-600 focus:outline-none focus:border-emerald-500/50"
            />
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════
           COMPARTIMENTO: OTTIMIZZAZIONI & CALENDARIO
           Nascosto completamente quando si è nella tab Messaggi Clienti
      ══════════════════════════════════════════════════════════════════ */}
      {activeTab !== 'messages' && (
      <>

      {/* KPI Cards Unificate v9 — visibili SOLO su PRENOTAZIONI */}
      {activeTab === 'bookings' && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

        {/* CARD 1: STATISTICHE GENERALI RESORT */}
        <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-5 sm:p-6 space-y-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-stone-800/80 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border-2 border-emerald-400/50 border-double flex items-center justify-center text-emerald-300 flex-shrink-0 shadow">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-sm sm:text-base font-black text-white tracking-tight uppercase">
                STATISTICHE GENERALI RESORT
              </h3>
            </div>
            <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full font-black uppercase tracking-wider">
              LIVE
            </span>
          </div>

          {/* 3 Riquadri Fisici Equidistanti con Icone W-6 H-6 e Testi Ingranditi */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-stone-950/60 border border-stone-800/80 rounded-xl p-3.5 space-y-2 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Prenotazioni</span>
                <Calendar className="w-6 h-6 text-emerald-400 flex-shrink-0" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-white leading-none">{totalBookingsCount}</div>
                <p className="text-[10px] text-stone-500 font-medium mt-1">Registrate nel sistema</p>
              </div>
            </div>

            <div className="bg-stone-950/60 border border-stone-800/80 rounded-xl p-3.5 space-y-2 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Ospiti</span>
                <Users className="w-6 h-6 text-teal-400 flex-shrink-0" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-white leading-none">{totalGuests}</div>
                <p className="text-[10px] text-stone-500 font-medium mt-1">Capacità occupata</p>
              </div>
            </div>

            <div className="bg-stone-950/60 border border-stone-800/80 rounded-xl p-3.5 space-y-2 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Alloggi</span>
                <Hotel className="w-6 h-6 text-amber-400 flex-shrink-0" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-white leading-none">
                  {availableRoomsCount}<span className="text-base text-stone-500 font-bold">/{(accommodations || []).length}</span>
                </div>
                <p className="text-[10px] text-stone-500 font-medium mt-1">Pronti al check-in</p>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: RENDICONTO FINANZIARIO & INTERMEDIAZIONI */}
        <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-5 sm:p-6 space-y-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-stone-800/80 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border-2 border-amber-400/50 border-double flex items-center justify-center text-amber-300 flex-shrink-0 shadow">
                <Coins className="w-5 h-5" />
              </div>
              <h3 className="text-sm sm:text-base font-black text-white tracking-tight uppercase">
                RENDICONTO FINANZIARIO & INTERMEDIAZIONI
              </h3>
            </div>
            <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full font-black uppercase tracking-wider">
              OTA
            </span>
          </div>

          {/* Top 3 Stats Row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Incasso Lordo</div>
              <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono leading-tight">
                ฿{fin.grossRevenue.toLocaleString('it-IT', { maximumFractionDigits: 0 })}
              </div>
              <p className="text-[10px] text-stone-500 font-medium">Caparre + Saldi</p>
            </div>
            <div className="space-y-1">
              <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Commissioni OTA</div>
              <div className="text-xl sm:text-2xl font-black text-red-400 font-mono leading-tight">
                -฿{fin.totalCommissions.toLocaleString('it-IT', { maximumFractionDigits: 0 })}
              </div>
              <p className="text-[10px] text-stone-500 font-medium">Stima intermediazioni</p>
            </div>
            <div className="space-y-1">
              <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Netto Resort</div>
              <div className="text-xl sm:text-2xl font-black text-white font-mono leading-tight">
                ฿{fin.netRevenue.toLocaleString('it-IT', { maximumFractionDigits: 0 })}
              </div>
              <p className="text-[10px] text-stone-500 font-medium">Dopo intermediazioni</p>
            </div>
          </div>

          {/* 2x2 Grid Layout for 4 OTA Channels Tiles with Generous Margins & p-3/p-4 */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-stone-800/80">
            {/* Left Column: Booking.com & Agoda */}
            <div className="space-y-2 border-r border-stone-800/60 pr-3">
              {[
                { key: 'booking.com', label: 'Booking.com', rateText: '17.2%' },
                { key: 'agoda', label: 'Agoda', rateText: '18.0%' }
              ].map(({ key, label, rateText }) => {
                const item = fin.otaStats[key];
                return (
                  <div key={key} className="flex items-center justify-between bg-stone-900/20 border border-stone-800/80 p-3 rounded-xl shadow-sm hover:border-stone-700/80 transition-all">
                    <div>
                      <span className="text-[11px] font-extrabold text-stone-200 block">{label}</span>
                      <span className="text-[9px] font-mono text-stone-500 font-semibold">{rateText} comm.</span>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] font-mono font-bold text-stone-300">
                        ฿{item.gross.toLocaleString('it-IT', { maximumFractionDigits: 0 })}
                      </div>
                      <div className="text-[10px] font-mono font-black text-red-400">
                        -฿{item.commission.toLocaleString('it-IT', { maximumFractionDigits: 0 })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Column: Airbnb & Expedia */}
            <div className="space-y-2">
              {[
                { key: 'airbnb', label: 'Airbnb', rateText: '15.0%' },
                { key: 'expedia', label: 'Expedia', rateText: '15.0%' }
              ].map(({ key, label, rateText }) => {
                const item = fin.otaStats[key];
                return (
                  <div key={key} className="flex items-center justify-between bg-stone-900/20 border border-stone-800/80 p-3 rounded-xl shadow-sm hover:border-stone-700/80 transition-all">
                    <div>
                      <span className="text-[11px] font-extrabold text-stone-200 block">{label}</span>
                      <span className="text-[9px] font-mono text-stone-500 font-semibold">{rateText} comm.</span>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] font-mono font-bold text-stone-300">
                        ฿{item.gross.toLocaleString('it-IT', { maximumFractionDigits: 0 })}
                      </div>
                      <div className="text-[10px] font-mono font-black text-red-400">
                        -฿{item.commission.toLocaleString('it-IT', { maximumFractionDigits: 0 })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
      )}



      {/* ═══════════════════════════════════════════════════════════════
           MODULI SCONTI: visibili SOLO su CALENDARIO 30GG e ANNUALE
      ══════════════════════════════════════════════════════════════════ */}
      {(activeTab === 'calendar_30_days' || activeTab === 'calendar') && (
      <>

      {/* LAST-MINUTE DYNAMIC 3-STAGE CASCADE DISCOUNT PANEL */}
      <div className="bg-amber-950/20 border-2 border-amber-500/40 rounded-2xl p-3.5 sm:p-4 shadow-xl shadow-amber-950/30 space-y-3 ring-1 ring-amber-500/10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-amber-500/30 pb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300 flex-shrink-0 shadow">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white tracking-tight flex items-center gap-2 uppercase">
                ⚡ LAST MINUTE / SCONTI A CASCATA
              </h3>
              <p className="text-stone-400 text-[11px] font-medium">
                Sconti percentuali sequenziali dinamici calcolati sulla data libera imminente
              </p>
            </div>
          </div>
          <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            OCTORATE API
          </span>
        </div>

        {/* 3 Cascade Discount Stages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {/* Stage 1: 3 Days @ 10% */}
          <div className="bg-red-950/30 p-2.5 rounded-xl border border-red-500/40 space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-black text-red-400 uppercase tracking-wider flex items-center gap-1">
                🔥 Stadio 1: Imminente
              </label>
              <span className="text-[9px] bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded border border-red-500/30 font-mono">
                Gg 0 - 2
              </span>
            </div>
            <div className="flex items-center justify-between gap-1.5 text-[11px]">
              <div className="flex items-center gap-1">
                <span className="text-stone-400 text-[10.5px]">Durata:</span>
                <input
                  type="number"
                  min="1"
                  max="14"
                  value={lastMinuteStage1Days ?? 3}
                  onChange={(e) => setLastMinuteStage1Days(parseInt(e.target.value))}
                  className="w-11 bg-stone-900 border border-stone-700 rounded-lg px-1 py-0.5 text-white font-mono font-black text-[11px] text-center focus:outline-none focus:border-amber-400"
                />
                <span className="text-stone-400 text-[10.5px]">gg</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-stone-400 text-[10.5px]">Sconto:</span>
                <input
                  type="number"
                  min="0"
                  max="80"
                  step="0.5"
                  value={lastMinuteDiscountStage1 ?? 10}
                  onChange={(e) => setLastMinuteDiscountStage1(parseFloat(e.target.value))}
                  className="w-11 bg-stone-900 border border-stone-700 rounded-lg px-1 py-0.5 text-amber-400 font-mono font-black text-[11px] text-center focus:outline-none focus:border-amber-400"
                />
                <span className="text-amber-400 font-black text-[11px]">%</span>
              </div>
            </div>
          </div>

          {/* Stage 2: 3 Next Days @ 5% */}
          <div className="bg-orange-950/30 p-2.5 rounded-xl border border-orange-500/40 space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-black text-orange-400 uppercase tracking-wider flex items-center gap-1">
                🏷️ Stadio 2: Intermedio
              </label>
              <span className="text-[9px] bg-orange-500/20 text-orange-300 px-1.5 py-0.5 rounded border border-orange-500/30 font-mono">
                Gg 3 - 5
              </span>
            </div>
            <div className="flex items-center justify-between gap-1.5 text-[11px]">
              <div className="flex items-center gap-1">
                <span className="text-stone-400 text-[10.5px]">Durata:</span>
                <input
                  type="number"
                  min="1"
                  max="14"
                  value={lastMinuteStage2Days ?? 3}
                  onChange={(e) => setLastMinuteStage2Days(parseInt(e.target.value))}
                  className="w-11 bg-stone-900 border border-stone-700 rounded-lg px-1 py-0.5 text-white font-mono font-black text-[11px] text-center focus:outline-none focus:border-amber-400"
                />
                <span className="text-stone-400 text-[10.5px]">gg</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-stone-400 text-[10.5px]">Sconto:</span>
                <input
                  type="number"
                  min="0"
                  max="80"
                  step="0.5"
                  value={lastMinuteDiscountStage2 ?? 5}
                  onChange={(e) => setLastMinuteDiscountStage2(parseFloat(e.target.value))}
                  className="w-11 bg-stone-900 border border-stone-700 rounded-lg px-1 py-0.5 text-amber-400 font-mono font-black text-[11px] text-center focus:outline-none focus:border-amber-400"
                />
                <span className="text-amber-400 font-black text-[11px]">%</span>
              </div>
            </div>
          </div>

          {/* Stage 3: 4 Next Days @ 2.5% */}
          <div className="bg-yellow-950/30 p-2.5 rounded-xl border border-yellow-600/40 space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-black text-yellow-400 uppercase tracking-wider flex items-center gap-1">
                ⚡ Stadio 3: Esteso
              </label>
              <span className="text-[9px] bg-yellow-500/20 text-yellow-300 px-1.5 py-0.5 rounded border border-yellow-600/30 font-mono">
                Gg 6 - 9
              </span>
            </div>
            <div className="flex items-center justify-between gap-1.5 text-[11px]">
              <div className="flex items-center gap-1">
                <span className="text-stone-400 text-[10.5px]">Durata:</span>
                <input
                  type="number"
                  min="1"
                  max="14"
                  value={lastMinuteStage3Days ?? 4}
                  onChange={(e) => setLastMinuteStage3Days(parseInt(e.target.value))}
                  className="w-11 bg-stone-900 border border-stone-700 rounded-lg px-1 py-0.5 text-white font-mono font-black text-[11px] text-center focus:outline-none focus:border-amber-400"
                />
                <span className="text-stone-400 text-[10.5px]">gg</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-stone-400 text-[10.5px]">Sconto:</span>
                <input
                  type="number"
                  min="0"
                  max="80"
                  step="0.5"
                  value={lastMinuteDiscountStage3 ?? 2.5}
                  onChange={(e) => setLastMinuteDiscountStage3(parseFloat(e.target.value))}
                  className="w-11 bg-stone-900 border border-stone-700 rounded-lg px-1 py-0.5 text-amber-400 font-mono font-black text-[11px] text-center focus:outline-none focus:border-amber-400"
                />
                <span className="text-amber-400 font-black text-[11px]">%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Production Confirmation Modal — LAST MINUTE */}
        {showCascadeProdModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-stone-900 border border-red-600/60 rounded-2xl p-5 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center gap-3 text-red-400">
                <AlertTriangle className="w-6 h-6 flex-shrink-0 animate-bounce" />
                <h3 className="font-black text-white text-sm uppercase tracking-wider">
                  CONFERMA MODALITÀ PRODUZIONE
                </h3>
              </div>
              <p className="text-stone-300 text-xs leading-relaxed">
                ⚠️ <strong>ATTENZIONE:</strong> Stai per attivare la modalità <strong>PRODUZIONE REAL TIME</strong> per gli Sconti a Cascata Last Minute.
                <br /><br />
                I prezzi scontati (-{lastMinuteDiscountStage1}%/-{lastMinuteDiscountStage2}%/-{lastMinuteDiscountStage3}%) verranno inviati <strong>realmente a tutte le Tariffe Madri del resort su Octorate PMS</strong>.
              </p>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowCascadeProdModal(false)}
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  type="button"
                  onClick={() => { setExecutionMode('production'); setShowCascadeProdModal(false); }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-red-950/50 cursor-pointer"
                >
                  Sì, Attiva Produzione Reale
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Simulation Active Visual Banner */}
        {isSimulationActive && (
          <div className="p-2.5 bg-amber-950/60 border border-amber-500/50 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-2 text-amber-300 text-[11px] shadow-lg animate-pulse">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>
                <strong>👁️ ANTEPRIMA SIMULAZIONE ATTIVA:</strong> Prezzi scontati in memoria (-10%, -5%, -2.5%). Nessun dato inviato ad Octorate.
              </span>
            </div>
            <button
              type="button"
              onClick={() => useResortAdminStore.getState().resetLastMinuteStrategy()}
              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-stone-950 text-[10px] font-extrabold uppercase rounded-lg transition-all cursor-pointer whitespace-nowrap"
            >
              Chiudi Anteprima
            </button>
          </div>
        )}

        {/* Action Controls + 3-Level Execution Mode Selector + Reset Button */}
        <div className="pt-2.5 border-t border-stone-850 flex flex-col space-y-2.5">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            {/* 3-Level Execution Mode Selector */}
            <div className="flex items-center gap-1.5 bg-stone-950 p-1.5 rounded-xl border border-stone-800 shadow-inner">
              <span className="text-[11px] font-black text-stone-300 px-1.5 uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                MODALITÀ:
              </span>

              <button
                type="button"
                onClick={() => setExecutionMode('simulation')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                  executionMode === 'simulation'
                    ? 'bg-red-500 text-white shadow-sm shadow-red-950/40'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
                title="Calcolo senza chiamate API"
              >
                🔴 SIMULAZIONE DRY-RUN
              </button>

              <button
                type="button"
                onClick={() => setExecutionMode('test_bungalows')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                  executionMode === 'test_bungalows'
                    ? 'bg-amber-500 text-stone-950 font-bold shadow-sm shadow-amber-950/40'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
                title="Invia modifiche SOLO a Fake Bungalows (ID Madri 649669 e 921799)"
              >
                🧪 AMBIENTE DI TEST
              </button>

              <button
                type="button"
                onClick={() => executionMode !== 'production' ? setShowCascadeProdModal(true) : setExecutionMode('simulation')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                  executionMode === 'production'
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-950/40 animate-pulse'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
                title="Invia modifiche a tutte le Tariffe Madri di produzione"
              >
                🌐 PRODUZIONE
              </button>
            </div>

            {/* Action Buttons: Execute & Reset */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => executeLastMinuteStrategy()}
                disabled={lastMinuteRunning}
                className={`flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50 ${
                  executionMode === 'production'
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/50'
                    : executionMode === 'test_bungalows'
                    ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-amber-950/50'
                    : 'bg-red-600 hover:bg-red-500 text-white shadow-red-950/50'
                }`}
              >
                {lastMinuteRunning ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Elaborazione...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5" />
                    <span>⚡ ESEGUI SCONTI A CASCATA</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => resetLastMinuteStrategy()}
                disabled={lastMinuteRunning}
                className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl bg-stone-950 border border-stone-800 text-stone-300 hover:bg-stone-850 transition-all cursor-pointer disabled:opacity-50"
                title="Ripristina i prezzi al 100% della tariffa base originale senza sconti"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${lastMinuteRunning ? 'animate-spin' : ''}`} />
                <span>🔄 RIPRISTINA PREZZI ORIGINALI</span>
              </button>
            </div>
          </div>
        </div>

          {lastMinuteResult && (
            <div className={`p-3 rounded-2xl border text-xs leading-relaxed w-full ${
              lastMinuteResult.success
                ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                : 'bg-red-950/40 border-red-800/60 text-red-300'
            }`}>
              <div className="font-bold flex items-center gap-1.5 mb-1">
                {lastMinuteResult.success ? <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />}
                <span>{lastMinuteResult.message}</span>
              </div>
              <span className="text-[10px] text-stone-400 font-mono block">
                Ultimo aggiornamento: {new Date(lastMinuteResult.dateUpdated).toLocaleString('it-IT')}
              </span>
            </div>
          )}
        </div>

      {/* DYNAMIC MINIMUM STAY (GAP-FILLING & DENSITY PRICING) PANEL */}
      <div className="bg-violet-950/20 border-2 border-violet-500/40 rounded-2xl p-3.5 sm:p-4 shadow-xl shadow-violet-950/30 space-y-3 ring-1 ring-violet-500/10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-violet-500/30 pb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-violet-500/20 border border-violet-400/50 flex items-center justify-center text-violet-300 flex-shrink-0 shadow">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white tracking-tight flex items-center gap-2 uppercase">
                📏 SOGGIORNO MINIMO DINAMICO
              </h3>
              <p className="text-stone-400 text-[11px] font-medium">
                Calcolo automatico per coprire le bucature inferiori a 7 notti e regolare i soggiorni minimi in base all'occupazione.
              </p>
            </div>
          </div>
          <span className="bg-violet-500/10 text-violet-300 border border-violet-500/30 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Staging Lock #649669 & #921799
          </span>
        </div>

        {/* Result Output */}
        {dynamicMinStayResult && (
          <div className={`p-3 rounded-xl border text-xs leading-relaxed ${
            dynamicMinStayResult.success
              ? 'bg-teal-950/40 border-teal-800/60 text-teal-300'
              : 'bg-red-950/40 border-red-800/60 text-red-300'
          }`}>
            <div className="font-bold flex items-center gap-2 mb-1">
              {dynamicMinStayResult.success ? <CheckCircle className="w-4 h-4 text-teal-400 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />}
              <span>{dynamicMinStayResult.message}</span>
            </div>
            {dynamicMinStayResult.dryRun && (
              <span className="text-[10px] text-amber-300/90 font-mono block">
                🔒 Modalità DRY_RUN Attiva: Nessuna modifica inviata ad Octorate. {dynamicMinStayResult.updatesCount} bucature identificate in memoria.
              </span>
            )}
          </div>
        )}

        {/* Bottom Controls Bar: Mode Selector (left) + Buttons (right) */}
        <div className="pt-2.5 border-t border-stone-850 flex flex-col space-y-2.5">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">

            {/* 3-Level Execution Mode Selector */}
            <div className="flex items-center gap-1.5 bg-stone-950 p-1.5 rounded-xl border border-stone-800 shadow-inner">
              <span className="text-[11px] font-black text-stone-300 px-1.5 uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-violet-400" />
                MODALITÀ:
              </span>

              <button
                type="button"
                onClick={() => setDynamicMinStayExecutionMode('simulation')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                  dynamicMinStayExecutionMode === 'simulation'
                    ? 'bg-red-500 text-white shadow-sm shadow-red-950/40'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                🔴 SIMULAZIONE DRY-RUN
              </button>

              <button
                type="button"
                onClick={() => setDynamicMinStayExecutionMode('test_bungalows')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                  dynamicMinStayExecutionMode === 'test_bungalows'
                    ? 'bg-amber-500 text-stone-950 font-bold shadow-sm shadow-amber-950/40'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                🧪 AMBIENTE DI TEST
              </button>

              <button
                type="button"
                onClick={() => dynamicMinStayExecutionMode !== 'production' ? setShowMinStayProdModal(true) : setDynamicMinStayExecutionMode('simulation')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                  dynamicMinStayExecutionMode === 'production'
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-950/40 animate-pulse'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                🌐 PRODUZIONE
              </button>
            </div>

            {/* Action Buttons: Execute & Reset */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => executeDynamicMinStayStrategy(false)}
                disabled={dynamicMinStayRunning}
                className={`flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50 ${
                  dynamicMinStayExecutionMode === 'production'
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/50'
                    : dynamicMinStayExecutionMode === 'test_bungalows'
                    ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-amber-950/50'
                    : 'bg-red-600 hover:bg-red-500 text-white shadow-red-950/50'
                }`}
              >
                {dynamicMinStayRunning ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Calcolo in corso...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5" />
                    <span>⚡ ESEGUI SOGGIORNO MINIMO DINAMICO</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => executeDynamicMinStayStrategy(true)}
                disabled={dynamicMinStayRunning}
                className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl bg-stone-950 border border-stone-800 text-stone-300 hover:bg-stone-850 transition-all cursor-pointer disabled:opacity-50"
                title="Ripristina i valori di soggiorno minimo stagionali standard su Octorate"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-violet-400 ${dynamicMinStayRunning ? 'animate-spin' : ''}`} />
                <span>🔄 RIPRISTINO VALORI STAGIONALI</span>
              </button>
            </div>
          </div>
        </div>
        {/* Production Confirmation Modal — SOGGIORNO MINIMO DINAMICO */}
        {showMinStayProdModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-stone-900 border border-red-600/60 rounded-2xl p-5 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center gap-3 text-red-400">
                <AlertTriangle className="w-6 h-6 flex-shrink-0 animate-bounce" />
                <h3 className="font-black text-white text-sm uppercase tracking-wider">
                  CONFERMA MODALITÀ PRODUZIONE
                </h3>
              </div>
              <p className="text-stone-300 text-xs leading-relaxed">
                ⚠️ <strong>ATTENZIONE:</strong> Stai per attivare la modalità <strong>PRODUZIONE REAL TIME</strong> per il Soggiorno Minimo Dinamico.
                <br /><br />
                I valori di <strong>min_stay</strong> verranno modificati <strong>realmente su tutte le Tariffe Madri del resort su Octorate PMS</strong>.
              </p>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowMinStayProdModal(false)}
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  type="button"
                  onClick={() => { setDynamicMinStayExecutionMode('production'); setShowMinStayProdModal(false); }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-red-950/50 cursor-pointer"
                >
                  Sì, Attiva Produzione Reale
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* TARIFFE STANDARD HIGH SEASON (LAST MINUTE) PANEL */}
      <StandardRatesProtectionSection />

      </>
      )}

      {/* Tab Visual Calendar 30gg Veloce */}
      {activeTab === 'calendar_30_days' && (
        <ResortVisualCalendar viewMode="30_days" />
      )}

      {/* Tab Visual Calendar Full Season */}
      {activeTab === 'calendar' && (
        <ResortVisualCalendar viewMode="full_season" />
      )}

      {/* Tab Tariffe Derivate & Albero Canali OTA */}
      {activeTab === 'derived_rates' && (
        <DerivedRatesTreeSection />
      )}

      {/* fine compartimento ottimizzazioni + tabs */}
      </>
      )}


      {/* ═══════════════════════════════════════════════════════════════
           COMPARTIMENTO STAGNO: MESSAGGI CLIENTI
           Visibile SOLO quando activeTab === 'messages'
           Nessun modulo di ottimizzazione viene montato nel DOM
      ══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'messages' && (
        <div className="max-w-5xl mx-auto space-y-6">
          <NewsletterCampaignSection />
        </div>
      )}

      {/* Tab 1: Bookings List */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          {filteredBookings.length === 0 ? (
            <div className="bg-stone-900/40 border border-stone-800 rounded-3xl p-12 text-center space-y-3">
              <Calendar className="w-12 h-12 text-stone-600 mx-auto" />
              <h3 className="text-stone-300 font-bold text-base">Nessuna prenotazione trovata</h3>
              <p className="text-stone-500 text-xs max-w-sm mx-auto">
                Le prenotazioni ricevute tramite il Booking Engine compariranno in questo elenco.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto bg-stone-900/80 border border-stone-800 rounded-3xl shadow-xl">
              <table className="w-full text-left text-xs text-stone-200">
                <thead className="bg-stone-950/80 border-b border-stone-800 text-stone-400 text-[10px] uppercase font-extrabold tracking-wider">
                  <tr>
                    <th className="p-4">ID / Data</th>
                    <th className="p-4">Ospite</th>
                    <th className="p-4">Alloggio</th>
                    <th className="p-4">Check-In ➔ Check-Out</th>
                    <th className="p-4">Servizi Extra</th>
                    <th className="p-4">Totale (Acconto 30%)</th>
                    <th className="p-4">Stato PMS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-850 font-medium">
                  {filteredBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-stone-850/50 transition-colors">
                      <td className="p-4 space-y-1">
                        <div className="font-mono text-emerald-400 font-bold">{b.id}</div>
                        <div className="text-[10px] text-stone-500">
                          {b?.created_at ? new Date(b.created_at).toLocaleDateString('it-IT') : '-'}
                        </div>
                      </td>
                      <td className="p-4 space-y-1">
                        <div className="font-bold text-white text-sm">{b.guest_name ?? 'Ospite'}</div>
                        <div className="text-stone-400 text-[11px]">{b.guest_email ?? '-'}</div>
                        <div className="text-stone-500 font-mono text-[10px]">{b.guest_phone ?? '-'}</div>
                      </td>
                      <td className="p-4">
                        <span className="bg-stone-800 text-stone-200 px-3 py-1 rounded-xl text-xs font-bold inline-block border border-stone-700">
                          {b.accommodation_name ?? '-'}
                        </span>
                      </td>
                      <td className="p-4 space-y-1">
                        <div className="font-bold text-stone-200">{b.check_in ?? '-'} ➔ {b.check_out ?? '-'}</div>
                        <div className="text-[10px] text-stone-400">{b.guests ?? 1} Ospiti</div>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1.5">
                          {b.extra_breakfast && (
                            <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-lg text-[10px] font-bold">
                              <Coffee className="w-3 h-3" /> Colazione
                            </span>
                          )}
                          {b.extra_ac && (
                            <span className="inline-flex items-center gap-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-lg text-[10px] font-bold">
                              <Wind className="w-3 h-3" /> Aria Cond.
                            </span>
                          )}
                          {!b.extra_breakfast && !b.extra_ac && (
                            <span className="text-stone-500 text-[10px]">Standard</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 space-y-1">
                        <div className="font-black text-amber-400 font-mono text-sm">
                          ฿{(b?.total_price ?? 0).toLocaleString('it-IT')}
                        </div>
                        <div className="text-[10px] text-emerald-400 font-semibold">
                          Acconto 30%: ฿{(b?.deposit_paid ?? 0).toLocaleString('it-IT')}
                        </div>
                      </td>
                      <td className="p-4 space-y-1">
                        <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
                          <CheckCircle className="w-3 h-3" /> Confermata
                        </span>
                        {b.octorate_reservation_id && (
                          <div className="text-[10px] text-stone-500 font-mono">
                            ID: {b.octorate_reservation_id}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Accommodations & Room Availability */}
      {activeTab === 'rooms' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-stone-900/60 p-3 rounded-2xl border border-stone-850">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Filtra Categoria:</span>
              {['All', 'Ville', 'Bungalow', 'Tende Glamping', 'The Hub Guesthouse'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    filterCategory === cat
                      ? 'bg-emerald-600 text-white'
                      : 'text-stone-400 hover:text-white bg-stone-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredRooms.map((room) => (
              <div
                key={room.id}
                className="bg-stone-900 border border-stone-800 rounded-3xl p-5 shadow-xl space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-black tracking-widest text-emerald-400 bg-stone-950 px-3 py-1 rounded-full uppercase border border-stone-800">
                      {room.category}
                    </span>
                    <span className="font-mono text-stone-400 text-xs font-bold bg-stone-950 px-2 py-0.5 rounded-lg border border-stone-800">
                      Octorate ID: {room.octorateId}
                    </span>
                  </div>

                  <h3 className="font-black text-white text-lg leading-snug">
                    {room.name}
                  </h3>

                  <div className="flex justify-between items-center text-xs text-stone-400 pt-2 border-t border-stone-850">
                    <span>Capienza Massima:</span>
                    <span className="font-bold text-white">{room.maxGuests} Ospiti</span>
                  </div>

                  <div className="flex justify-between items-center text-xs text-stone-400">
                    <span>Tariffa Base / Notte:</span>
                    <span className="font-black text-amber-400 font-mono text-sm">
                      ฿{(room?.basePrice ?? 0).toLocaleString('it-IT')}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-400">Stato Prenotabile:</span>
                  <button
                    onClick={() => toggleRoomAvailability(room.octorateId, !room.isAvailable)}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                      room.isAvailable
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30'
                    }`}
                  >
                    {room.isAvailable ? 'Disponibile' : 'Bloccata'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Octorate PMS Integration Details */}
      {activeTab === 'octorate' && (
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl max-w-3xl mx-auto">
          <div className="flex items-center gap-3 border-b border-stone-800 pb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Octorate Channel Manager</h3>
              <p className="text-stone-400 text-xs font-medium">
                Stato connessione e parametri di sincronizzazione automatica delle disponibilità
              </p>
            </div>
          </div>

          <div className="space-y-4 text-xs text-stone-300">
            <div className="flex justify-between items-center bg-stone-950 p-4 rounded-2xl border border-stone-850">
              <span className="font-bold text-stone-400">Stato Connessione API:</span>
              <span className="inline-flex items-center gap-1.5 text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                <CheckCircle className="w-4 h-4" /> Connesso & Operativo
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-stone-950 p-4 rounded-2xl border border-stone-850 space-y-1">
                <span className="text-stone-500 text-[10px] uppercase font-bold">Structure (Hotel) ID</span>
                <div className="font-mono text-white text-sm font-bold">{octorateDetails?.structureId ?? '366879'}</div>
              </div>

              <div className="bg-stone-950 p-4 rounded-2xl border border-stone-850 space-y-1">
                <span className="text-stone-500 text-[10px] uppercase font-bold">Direct Booking Channel ID</span>
                <div className="font-mono text-white text-sm font-bold">{octorateDetails?.channelId ?? '233'}</div>
              </div>
            </div>

            <div className="bg-stone-950/60 p-4 rounded-2xl border border-stone-850 space-y-2">
              <span className="text-amber-400 font-bold block text-xs">ℹ️ Nota di Integrazione:</span>
              <p className="text-stone-400 text-xs leading-relaxed">
                Le prenotazioni effettuate tramite Stripe Checkout vengono registrate automaticamente sia nel sistema interno che su Octorate PMS inviando la conferma all'ID Struttura <strong className="text-white">366879</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* --- COLLAPSIBLE OCTORATE DEV ROOM MAPPING & DIAGNOSTICS SECTION --- */}
      <div className="mt-8 border border-stone-800 rounded-3xl bg-stone-900/90 shadow-2xl overflow-hidden">
        {/* Accordion Bar */}
        <div 
          onClick={handleToggleDiagnostics}
          className="p-4 sm:p-5 flex items-center justify-between cursor-pointer bg-stone-900 hover:bg-stone-850 transition-colors select-none"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-stone-950 border border-stone-800 flex items-center justify-center text-emerald-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider">
                  Octorate Dev Room Mapping & Diagnostics (Produzione)
                </h3>
              </div>
              <p className="text-[11px] text-stone-400">
                Pannello tecnico riservato alla diagnostica API, mappatura ID alloggi e reset token OAuth
              </p>
            </div>
          </div>

          <button
            type="button"
            className="px-4 py-2 bg-stone-950 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <span>{showDevDiagnostics ? 'Nascondi Diagnostica' : 'Mostra Diagnostica'}</span>
            {showDevDiagnostics ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>

        {/* Expanded Panel */}
        {showDevDiagnostics && (
          <div className="p-6 border-t border-stone-800 space-y-6 text-xs text-stone-300 bg-stone-950/60 animate-fadeIn">
            
            {/* Controllo Connessione OAuth */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-stone-800 pb-3">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-white text-xs uppercase tracking-wider">Stato Autenticazione OAuth Octorate</span>
                </div>
                {oauthConnected ? (
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-bold">
                      <CheckCircle className="w-3.5 h-3.5" /> API Connesse & Attive
                    </span>
                    <button
                      type="button"
                      onClick={handleClearTokens}
                      className="px-3 py-1 bg-red-900/60 hover:bg-red-800 text-red-200 border border-red-700/50 rounded-xl text-xs font-extrabold transition-all cursor-pointer"
                    >
                      Disconnetti / Reset Token
                    </button>
                  </div>
                ) : (
                  <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full text-xs font-bold">
                    <AlertCircle className="w-3.5 h-3.5" /> API Non Connesse / In Attesa Token
                  </span>
                )}
              </div>

              {!oauthConnected && (
                <div className="space-y-2 pt-1">
                  <p className="text-stone-400 text-xs">
                    Per connettere le API Octorate, avvia il flusso OAuth e incolla l'URL di reindirizzamento generato:
                  </p>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <a
                      href={getAuthorizationUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Link className="w-3.5 h-3.5" /> Avvia Autorizzazione OAuth
                    </a>
                    <input
                      type="text"
                      value={oauthUrl}
                      onChange={(e) => setOauthUrl(e.target.value)}
                      placeholder="Incolla qui l'URL di reindirizzamento..."
                      className="flex-1 bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-stone-600 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={handleSaveToken}
                      disabled={oauthLoading}
                      className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-white font-bold rounded-xl text-xs transition-all disabled:opacity-50"
                    >
                      {oauthLoading ? "Salvataggio..." : "Salva Token"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 1. Mappatura Camere */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-extrabold text-emerald-400 uppercase tracking-wider text-xs flex items-center gap-1.5">
                  <span>1. Stato Mappatura Camere del Sito</span>
                </h4>
                <button
                  type="button"
                  onClick={handleFetchDevRooms}
                  disabled={loadingRooms}
                  className="px-3 py-1 bg-stone-850 hover:bg-stone-800 text-stone-300 border border-stone-750 rounded-lg text-[11px] font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${loadingRooms ? 'animate-spin text-emerald-400' : ''}`} />
                  <span>Ricarica Tariffe Octorate</span>
                </button>
              </div>

              <div className="overflow-x-auto bg-stone-900 border border-stone-800 rounded-2xl">
                <table className="w-full text-left text-xs text-stone-200">
                  <thead className="bg-stone-950 border-b border-stone-800 text-stone-400 text-[10px] uppercase font-extrabold">
                    <tr>
                      <th className="p-3">Camera Sito</th>
                      <th className="p-3">ID nel Codice</th>
                      <th className="p-3">Stato</th>
                      <th className="p-3">Octorate Room/Rate Name</th>
                      <th className="p-3">Suggerimento / Correzione</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-850">
                    {(accommodations || []).map((room) => {
                      const octorateMatch = octorateRooms.find((r) => {
                        const targetId = Number(room.octorateId);
                        const rId = Number(r.id);
                        const roomId = Number(r.room?.id);
                        const rName = (r.name || "").toLowerCase();
                        const roomName = room.name.toLowerCase();

                        return (
                          (targetId > 0 && (rId === targetId || roomId === targetId)) ||
                          (rName.length > 0 && (rName.includes(roomName) || roomName.includes(rName))) ||
                          (roomName.includes("jungle villa") && !roomName.includes("left") && !roomName.includes("right") && (rName.includes("jv be") || rId === 529784 || roomId === 529773)) ||
                          (roomName.includes("jungle villa left") && (rName.includes("jvl be") || rId === 495807 || roomId === 495795)) ||
                          (roomName.includes("jungle villa right") && (rName.includes("jvr be") || rId === 495980 || roomId === 495796)) ||
                          (roomName.includes("yellow bungalow") && (rName.includes("yellow be") || rId === 449385 || roomId === 293957)) ||
                          (roomName.includes("red bungalow") && (rName.includes("red be") || rId === 449422 || roomId === 293954)) ||
                          (roomName.includes("green bungalow") && (rName.includes("green be") || rId === 449668 || roomId === 293962)) ||
                          (roomName.includes("camel") && (rName.includes("camel be") || rId === 449675 || roomId === 293965)) ||
                          (roomName.includes("lagoon") && (rName.includes("lagoon be") || rId === 449674 || roomId === 293955)) ||
                          (roomName.includes("peace") && (rName.includes("p&l be") || rId === 495566 || roomId === 494840)) ||
                          (roomName.includes("penthouse") && (rName.includes("pent be") || rId === 449348 || roomId === 421511))
                        );
                      });

                      let suggestion = "";
                      if (!octorateMatch && octorateRooms.length > 0) {
                        const potentialMatches = octorateRooms.filter((r) => {
                          const octorateRoomName = (r.room?.name || "").toLowerCase();
                          const siteRoomName = room.name.toLowerCase();
                          return octorateRoomName.includes(siteRoomName) || siteRoomName.includes(octorateRoomName) ||
                                 (room.name === "Internal Room" && octorateRoomName.includes("inter"));
                        });
                        if (potentialMatches.length > 0) {
                          suggestion = potentialMatches.map(m => `Usa ID: ${m.id} (${m.room?.name || 'N/D'} - ${m.name || 'N/D'})`).join(" | ");
                        }
                      }

                      return (
                        <tr key={room.id} className="hover:bg-stone-850/50 transition-colors">
                          <td className="p-3 font-bold text-white">{room.name}</td>
                          <td className="p-3 font-mono text-stone-400">{room.octorateId || "Mancante"}</td>
                          <td className="p-3">
                            {octorateMatch ? (
                              <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-bold text-[10px]">Mappato OK</span>
                            ) : (
                              <span className="px-2.5 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full font-bold text-[10px]">Non Trovato</span>
                            )}
                          </td>
                          <td className="p-3 text-stone-300">
                            {octorateMatch ? `${octorateMatch.room?.name} (${octorateMatch.name})` : "-"}
                          </td>
                          <td className="p-3 text-amber-400 font-medium">{suggestion || "-"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 2. Tariffe Ricevute */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-emerald-400 uppercase tracking-wider text-xs">
                2. Tariffe Ricevute da Octorate (Elenco Completo)
              </h4>
              {octorateRooms.length === 0 ? (
                <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 text-stone-500 italic text-xs">
                  Nessuna tariffa caricata da Octorate. Assicurati che le API siano autenticate e clicca "Ricarica Tariffe Octorate".
                </div>
              ) : (
                <div className="overflow-x-auto bg-stone-900 border border-stone-800 rounded-2xl">
                  <table className="w-full text-left text-xs text-stone-200">
                    <thead className="bg-stone-950 border-b border-stone-800 text-stone-400 text-[10px] uppercase font-extrabold">
                      <tr>
                        <th className="p-3">Stanza Octorate (room.name)</th>
                        <th className="p-3">Room ID (room.id)</th>
                        <th className="p-3">Tariffa Name</th>
                        <th className="p-3">Rate ID (rate.id)</th>
                        <th className="p-3 text-right">Prezzo Min.</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-850">
                      {octorateRooms.map((rate) => (
                        <tr key={rate.id} className="hover:bg-stone-850/50 transition-colors">
                          <td className="p-3 font-bold text-white">{rate.room?.name || "N/D"}</td>
                          <td className="p-3 font-mono text-stone-400">{rate.room?.id || "N/D"}</td>
                          <td className="p-3 text-stone-300">{rate.name || "N/D"}</td>
                          <td className="p-3 text-emerald-400 font-mono font-bold select-all">{rate.id}</td>
                          <td className="p-3 text-right font-bold text-amber-400 font-mono">฿{rate.minimumSellingPrice || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* 3. JSON Grezzo */}
            <div className="space-y-2">
              <h4 className="font-extrabold text-emerald-400 uppercase tracking-wider text-xs">
                3. JSON Grezzo Ricevuto da Octorate (API Response)
              </h4>
              <textarea
                readOnly
                value={octorateRooms.length > 0 ? JSON.stringify(octorateRooms, null, 2) : "In attesa di caricamento o nessun dato ricevuto..."}
                className="w-full h-44 bg-stone-900 border border-stone-800 rounded-2xl p-4 font-mono text-[11px] text-emerald-400 focus:outline-none"
              />
            </div>

          </div>
        )}
      </div>

    </div>
  );
}
